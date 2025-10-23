export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { makeKeyFindingsPrompts, makeTableConclusionsPrompts } from "@/lib/prompts";


const LLAMA_UPLOAD = "https://api.cloud.llamaindex.ai/api/v1/parsing/upload";
const LLAMA_JOB = (id: string) => `https://api.cloud.llamaindex.ai/api/v1/parsing/job/${id}`;
const LLAMA_JOB_RAW_MD = (id: string) => `https://api.cloud.llamaindex.ai/api/v1/parsing/job/${id}/result/raw/markdown`;

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "google/gemini-2.5-flash";

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function normalize(s: string) {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

function dedupParagraphs(text: string) {
  const parts = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const n = normalize(p);
    if (n && !seen.has(n)) {
      seen.add(n);
      out.push(p);
    }
  }
  return out.join("\n\n");
}

// 验证表格结构是否合法
function isValidTable(lines: string[]): boolean {
  if (lines.length < 3) return false;  // 至少：表头 + 分隔符 + 1数据行

  // 验证第二行是分隔符（Markdown表格标准）
  if (!/^\|\s*:?-{2,}/.test(lines[1])) return false;

  // 提取列数
  const headerCols = (lines[0].match(/\|/g) || []).length - 1;
  if (headerCols < 2) return false;  // 至少2列

  // 验证每行列数一致（允许±1误差）
  for (let i = 2; i < lines.length; i++) {
    const cols = (lines[i].match(/\|/g) || []).length - 1;
    if (Math.abs(cols - headerCols) > 1) return false;
  }

  // 验证数据行数量（至少1行，最多100行）
  const dataRows = lines.length - 2;
  if (dataRows < 1 || dataRows > 100) return false;

  return true;
}

function extractPipeTables(md: string): string[] {
  const lines = md.split(/\r?\n/);
  const tables: string[] = [];
  let buf: string[] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // 更严格的表格行判断：必须以 | 开头和结尾
    const isPipe = /^\|.*\|$/.test(trimmed) && trimmed.length > 2;

    // 排除特殊情况
    const isCodeBlock = /^```/.test(trimmed);
    const isMathFormula = /P\(.*\|.*\)/.test(trimmed);  // 概率公式 P(A|B)
    const isSinglePipe = (trimmed.match(/\|/g) || []).length <= 2;  // 只有1-2个竖线

    if (isPipe && !isCodeBlock && !isMathFormula && !isSinglePipe) {
      if (!inTable) {
        buf = [trimmed];
        inTable = true;
      } else {
        buf.push(trimmed);
      }
    } else {
      if (inTable) {
        // 验证表格结构
        if (isValidTable(buf)) {
          tables.push(buf.join("\n"));
          console.log(`[extractPipeTables] 识别到有效表格，行数: ${buf.length}`);
        } else {
          console.log(`[extractPipeTables] 跳过无效表格，行数: ${buf.length}`);
        }
        buf = [];
        inTable = false;
      }
    }
  }

  // 处理末尾的表格
  if (inTable && isValidTable(buf)) {
    tables.push(buf.join("\n"));
    console.log(`[extractPipeTables] 识别到末尾有效表格，行数: ${buf.length}`);
  }

  return tables;
}

function parsePipeTable(md: string): { headers: string[]; rows: string[][] } {
  const rows = md
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|") && l.endsWith("|"));
  if (rows.length < 2) return { headers: [], rows: [] };
  const head = rows[0]
    .slice(1, -1)
    .split("|")
    .map((c) => c.trim());
  const body = rows.slice(2).map((r) => r.slice(1, -1).split("|").map((c) => c.trim()));
  const used: Record<string, number> = {};
  const headers = head.map((h, i) => {
    const base = (h || `col${i + 1}`).trim();
    if (!used[base]) used[base] = 0;
    used[base] += 1;
    return used[base] > 1 ? `${base}_${used[base]}` : base;
  });
  return { headers, rows: body };
}

async function openrouterChat(system: string, user: string): Promise<string> {
  const dashKey = process.env.DASHSCOPE_API_KEY;
  const useDash = !!dashKey;
  const compatBase = process.env.OPENAI_COMPAT_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const compatEndpoint = `${compatBase.replace(/\/+$/, '')}/chat/completions`;
  const compatModel = useDash
    ? (process.env.OPENAI_COMPAT_MODEL || 'qwen3-max')
    : OPENROUTER_MODEL;

  if (useDash) {
    const r = await fetch(compatEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dashKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: compatModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
      }),
    });
    if (!r.ok) throw new Error(`DashScope 调用失败: ${r.status}`);
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    return String(content || '').trim();
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY 未配置');
  const r = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.2,
    }),
  });
  if (!r.ok) throw new Error(`OpenRouter 调用失败: ${r.status}`);
  const data = await r.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  return String(content || '').trim();
}

async function llamaparseUploadAndGetMarkdown(file: File): Promise<string> {
  const apiKey = process.env.LLAMAPARSE_API_KEY;
  if (!apiKey) throw new Error("LLAMAPARSE_API_KEY 未配置");
  const fd = new FormData();
  fd.append("file", file as any);
  const up = await fetch(LLAMA_UPLOAD, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: fd as any,
  });
  if (!up.ok) throw new Error(`LlamaParse 上传失败: ${up.status}`);
  const upData = await up.json();
  const jobId = upData?.id || upData?.job?.id || upData?.job_id;
  if (!jobId) throw new Error("LlamaParse 未返回作业ID");

  let status = "";
  for (let i = 0; i < 30; i++) {
    await sleep(2000);
    const jr = await fetch(LLAMA_JOB(jobId), { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!jr.ok) throw new Error(`LlamaParse 轮询失败: ${jr.status}`);
    const jdata = await jr.json();
    status = jdata?.status || jdata?.job?.status || "";
    if (["SUCCESS", "COMPLETED", "DONE", "FINISHED"].includes(status)) break;
    if (["FAILED", "ERROR"].includes(status)) throw new Error("LlamaParse 解析失败");
  }
  if (!status || !["SUCCESS", "COMPLETED", "DONE", "FINISHED"].includes(status)) {
    throw new Error("LlamaParse 等待超时");
  }
  const mr = await fetch(LLAMA_JOB_RAW_MD(jobId), { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!mr.ok) throw new Error(`LlamaParse 获取Markdown失败: ${mr.status}`);
  const md = await mr.text();
  return md;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const language = String(form.get("language") || "zh");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "缺少文件" }, { status: 400 });
    }

    console.log('[ingest] 开始处理文件:', file.name, `(${(file.size / 1024).toFixed(1)}KB)`);

    const markdown = await llamaparseUploadAndGetMarkdown(file);
    console.log('[ingest] Markdown解析完成，长度:', markdown.length);

    const tablesMd = extractPipeTables(markdown);
    console.log('[ingest] 提取到', tablesMd.length, '个有效表格');

    // 打印每个表格的预览（前3行）
    tablesMd.forEach((t, i) => {
      const preview = t.split('\n').slice(0, 3).join('\n');
      console.log(`[ingest] 表格${i+1}预览:\n${preview}\n`);
    });

    const tableSchemas = tablesMd.map((t) => parsePipeTable(t).headers);
    console.log('[ingest] 表格列数:', tableSchemas.map(s => s.length).join(', '));

    const docForSummary = markdown.slice(0, 16000);
    const kf = makeKeyFindingsPrompts(docForSummary);
    const summaryRaw = await openrouterChat(kf.system, kf.user);
    const summary = dedupParagraphs(summaryRaw);

    const maxRowsPerTable = 12;
    const trimmedTables = tablesMd.map((t) => t.split(/\r?\n/).slice(0, maxRowsPerTable).join("\n"));
    const tablesPrompt = trimmedTables
      .map((t, i) => `### 表${i + 1}\n${t}`)
      .join("\n\n");
    const tc = makeTableConclusionsPrompts(tablesPrompt, docForSummary);
    const conclRaw = await openrouterChat(tc.system, tc.user);

    let tableConclusions: string[][] = [];
    const decodeEscapes = (s: string) => s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
    const tryParse = (txt: string) => {
      try {
        const parsed = JSON.parse(txt);
        return Array.isArray(parsed) ? parsed : null;
      } catch { return null; }
    };

    console.log('[ingest] 结论原始响应长度:', conclRaw.length);
    let parsedAny = tryParse(conclRaw);
    if (!parsedAny){
      const m = (conclRaw||'').match(/\[[\s\S]*\]/);
      if (m) parsedAny = tryParse(m[0]);
    }

    if (parsedAny){
      console.log('[ingest] 解析到', parsedAny.length, '个结论组');
      tableConclusions = parsedAny.map((item: any, idx: number) => {
        // 情况1：已经是字符串数组
        if (Array.isArray(item)) {
          const result = item.map((v: any) => {
            if (typeof v === 'string') return decodeEscapes(v);
            if (typeof v === 'object' && v !== null) {
              // 从对象中提取文本
              return decodeEscapes(v.text || v.conclusion || v.summary || JSON.stringify(v));
            }
            return decodeEscapes(String(v));
          });
          console.log(`[ingest] 表格${idx+1}结论(数组):`, result.length, '条');
          return result;
        }

        // 情况2：单个字符串
        if (typeof item === 'string') {
          console.log(`[ingest] 表格${idx+1}结论(字符串):`, item.slice(0, 50));
          return [decodeEscapes(item)];
        }

        // 情况3：对象
        if (typeof item === 'object' && item !== null) {
          const text = item.text || item.conclusion || item.summary;
          if (text) {
            console.log(`[ingest] 表格${idx+1}结论(对象.text):`, String(text).slice(0, 50));
            return [decodeEscapes(String(text))];
          }

          // 尝试提取所有字符串值
          const values = Object.values(item).filter(v => typeof v === 'string');
          if (values.length > 0) {
            console.log(`[ingest] 表格${idx+1}结论(对象.values):`, values.length, '条');
            return values.map(v => decodeEscapes(String(v)));
          }
        }

        // 默认：转为字符串
        console.log(`[ingest] 表格${idx+1}结论(默认转换):`, String(item).slice(0, 50));
        return [decodeEscapes(String(item))];
      });
    }

    // 确保长度匹配，填充默认值
    if (tableConclusions.length !== tablesMd.length) {
      console.log(`[ingest] 结论数量(${tableConclusions.length})与表格数量(${tablesMd.length})不匹配，填充默认值`);
      tableConclusions = tablesMd.map((_, i) => tableConclusions[i] || ["暂无结论"]);
    }

    return NextResponse.json({
      summary,
      markdown,
      tables: tablesMd,
      table_schemas: tableSchemas,
      table_conclusions: tableConclusions,
      language,
    });
  } catch (e: any) {
    console.error("/api/ingest error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}


export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

function extractPipeTables(md: string): string[] {
  const lines = md.split(/\r?\n/);
  const tables: string[] = [];
  let buf: string[] = [];
  let inTable = false;
  for (const line of lines) {
    const isPipe = /\|/.test(line);
    if (isPipe) {
      inTable = true;
      buf.push(line);
    } else {
      if (inTable) {
        if (buf.length >= 2 && /\|\s*-{2,}\s*\|/.test(buf[1])) {
          tables.push(buf.join("\n"));
        }
        buf = [];
        inTable = false;
      }
    }
  }
  if (inTable && buf.length >= 2 && /\|\s*-{2,}\s*\|/.test(buf[1])) tables.push(buf.join("\n"));
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
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY 未配置");
  const r = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
    }),
  });
  if (!r.ok) throw new Error(`OpenRouter 调用失败: ${r.status}`);
  const data = await r.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  return String(content || "").trim();
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

    const markdown = await llamaparseUploadAndGetMarkdown(file);
    const tablesMd = extractPipeTables(markdown);
    const tableSchemas = tablesMd.map((t) => parsePipeTable(t).headers);

    const docForSummary = markdown.slice(0, 16000);
    const summaryRaw = await openrouterChat(
      "你是科研助手。用中文生成精炼的研究摘要，分段表达，避免重复与冗余。",
      `以下是论文的Markdown内容片段，请用中文总结要点，3-6段：\n\n${docForSummary}`
    );
    const summary = dedupParagraphs(summaryRaw);

    const maxRowsPerTable = 12;
    const trimmedTables = tablesMd.map((t) => t.split(/\r?\n/).slice(0, maxRowsPerTable).join("\n"));
    const tablesPrompt = trimmedTables
      .map((t, i) => `### 表${i + 1}\n${t}`)
      .join("\n\n");
    const conclRaw = await openrouterChat(
      "你是科研助手。对每个Markdown表格生成3-6条中文要点。输出严格JSON数组，每个元素为该表的结论数组。",
      `请阅读下列表格，按顺序输出JSON：[[结论1...],[结论2...],...]。\n不要输出多余文本。\n\n${tablesPrompt}`
    );

    let tableConclusions: string[][] = [];
    try {
      const parsed = JSON.parse(conclRaw);
      if (Array.isArray(parsed)) {
        tableConclusions = parsed.map((arr: any) => (Array.isArray(arr) ? arr.map(String) : []));
      }
    } catch {}
    if (tableConclusions.length !== tablesMd.length) {
      tableConclusions = tablesMd.map(() => []);
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
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}


export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { makeThemeStylePrompts, makePerTablePlanPrompts, makeRendererPrompts, makeDirectVegaPrompts } from "@/lib/prompts";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "google/gemini-2.5-flash";
const OPENROUTER_MODEL_DIRECT = "openai/gpt-5"; // 直接策略使用 GPT-5

async function openrouterChat(prompt: string, model?: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY 未配置");
  const r = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || OPENROUTER_MODEL,
      messages: [
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
  });
  if (!r.ok) throw new Error(`OpenRouter 调用失败: ${r.status}`);
  const data = await r.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  return String(content || "").trim();
}

function tryParseJsonArrayOrObject(txt: string): any {
  if (txt == null) return null;
  let s = String(txt).trim();
  // strip markdown code fences ```...```
  if (s.startsWith("```")) {
    const end = s.indexOf("```", 3);
    if (end > 3) {
      s = s.slice(3, end).trim();
    }
  }
  // remove leading language labels like 'json' inside code fence
  if (/^json\s*/i.test(s)) {
    s = s.replace(/^json\s*/i, '').trim();
  }
  // direct parse
  try { return JSON.parse(s); } catch {}
  // fallback: try to locate first JSON-looking block
  const m = (s || "").match(/[\[{][\s\S]*[\]}]/);
  if (m) {
    try { return JSON.parse(m[0]); } catch {}
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const summary: string = body?.summary_text || "";
    const tableConclusions: string[][] = body?.table_conclusions || [];
    const tableSchemas: string[][] = body?.table_schemas || [];
    const tableDatas: { headers: string[]; rows: string[][] }[] = body?.table_datas || [];
    const language: string = body?.language || "zh";
    const preferences: string = body?.preferences_text || "";
    const useDirectStrategy: boolean = body?.use_direct_strategy || false;

    const clip = (s: string, n = 4000) => (s || "").slice(0, n);

    // 检查是否使用备用策略（直接生成完整 Vega-Lite）
    if (useDirectStrategy && tableDatas && tableDatas.length > 0) {
      console.log(`\n[flow] 使用直接策略：逐个表格调用 ${OPENROUTER_MODEL_DIRECT} 生成完整 Vega-Lite 规格`);

      // 1) 主题与风格
      const themePrompt = makeThemeStylePrompts(summary, language, preferences);
      console.log("[flow][theme] prompt:\n", clip(themePrompt));
      const themeRaw = await openrouterChat(themePrompt);
      console.log("[flow][theme] raw:\n", clip(themeRaw));
      const themeStyle = tryParseJsonArrayOrObject(themeRaw);
      console.log("[flow][theme] parsed:", themeStyle);

      // 2) 逐个表格调用 GPT-5 生成图表
      const perTableSpecs = await Promise.all(tableDatas.map(async (td, idx) => {
        try {
          const tableData = {
            headers: td.headers || [],
            rows: td.rows || [],
            conclusions: Array.isArray(tableConclusions?.[idx]) ? tableConclusions[idx] : []
          };

          console.log(`\n[flow][direct][table_${idx+1}] 开始生成，数据行数: ${tableData.rows.length}`);

          // 传递 table_index 到 prompt 生成函数
          const directPrompt = makeDirectVegaPrompts([tableData], language, themeStyle, idx + 1);
          console.log(`[flow][direct][table_${idx+1}] prompt:\n`, clip(directPrompt, 4000));

          const directRaw = await openrouterChat(directPrompt, OPENROUTER_MODEL_DIRECT);
          console.log(`[flow][direct][table_${idx+1}] raw:\n`, clip(directRaw, 4000));

          const result = tryParseJsonArrayOrObject(directRaw);
          console.log(`[flow][direct][table_${idx+1}] parsed:`, JSON.stringify(result, null, 2).slice(0, 1000));

          if (!result || typeof result !== 'object') {
            console.error(`[flow][direct][table_${idx+1}] ❌ 模型返回无效JSON`);
            return null;
          }

          // 提取第一个 spec（因为每次只处理一个表）
          const specs = result.per_table_specs || [];
          console.log(`[flow][direct][table_${idx+1}] specs 数组长度: ${specs.length}`);

          if (!Array.isArray(specs)) {
            console.error(`[flow][direct][table_${idx+1}] ❌ per_table_specs 不是数组:`, typeof specs);
            return null;
          }

          if (specs.length === 0) {
            console.error(`[flow][direct][table_${idx+1}] ❌ per_table_specs 为空数组`);
            return null;
          }

          const entry = specs[0];
          console.log(`[flow][direct][table_${idx+1}] entry:`, {
            has_entry: !!entry,
            has_spec: !!entry?.spec,
            spec_type: typeof entry?.spec,
            spec_keys: entry?.spec ? Object.keys(entry.spec).slice(0, 10) : []
          });

          if (!entry) {
            console.error(`[flow][direct][table_${idx+1}] ❌ entry 为空`);
            return null;
          }

          if (!entry.spec) {
            console.error(`[flow][direct][table_${idx+1}] ❌ entry.spec 为空`);
            return null;
          }

          if (typeof entry.spec !== 'object') {
            console.error(`[flow][direct][table_${idx+1}] ❌ entry.spec 不是对象:`, typeof entry.spec);
            return null;
          }

          // 强制设置正确的 table_index
          entry.table_index = idx + 1;

          console.log(`[flow][direct][table_${idx+1}] ✅ 成功生成图表，table_index: ${entry.table_index}`);
          return entry;
        } catch (error) {
          console.error(`[flow][direct][table_${idx+1}] ❌ 生成失败:`, error);
          return null;
        }
      }));

      // 过滤掉失败的
      const validSpecs = perTableSpecs.filter(Boolean);

      if (validSpecs.length === 0) {
        throw new Error('直接策略：所有表格的图表生成都失败了');
      }

      const render = {
        engine: 'vega-lite',
        per_table_specs: validSpecs
      };

      console.log(`\n[flow] 直接策略成功，生成了 ${validSpecs.length}/${tableDatas.length} 个图表`);

      const response = {
        theme_style: themeStyle || {},
        per_table_plans: validSpecs.map((s: any) => ({
          table_index: s.table_index,
          pitch: s.title || '自动生成图表',
          chart_type: s.spec?.mark?.type || s.spec?.mark || 'bar',
          data_mapping: { direct: true } // 标记为直接策略
        })),
        render,
        strategy: 'direct'
      };

      console.log(`[flow] 响应大小: ${JSON.stringify(response).length} 字节`);
      return NextResponse.json(response);
    }

    // 原有的三阶段策略
    console.log("\n[flow] 使用三阶段策略");

    // 1) 主题与风格（样式代理）——强制调用模型并校验
    const themePrompt = makeThemeStylePrompts(summary, language, preferences);
    console.log("[flow][theme] prompt:\n", clip(themePrompt));
    const themeRaw = await openrouterChat(themePrompt);
    console.log("[flow][theme] raw:\n", clip(themeRaw));
    const themeStyle = tryParseJsonArrayOrObject(themeRaw);
    console.log("[flow][theme] parsed:", themeStyle);
    if (!themeStyle || typeof themeStyle !== 'object') {
      throw new Error('主题与风格agent返回的JSON无效');
    }

    // 2) 图表规划（设计代理）——逐表强制生成并校验
    const plans = await Promise.all((tableSchemas || []).map(async (schema: string[], idx: number) => {
      const perConcl = Array.isArray(tableConclusions?.[idx]) ? tableConclusions[idx] : [];
      const p = makePerTablePlanPrompts(schema || [], perConcl || [], language, preferences);
      console.log(`\n[flow][plan][table_${idx+1}] system:\n`, clip(p.system));
      console.log(`[flow][plan][table_${idx+1}] user:\n`, clip(p.user));
      const raw = await openrouterChat(p.system, p.user);
      console.log(`[flow][plan][table_${idx+1}] raw:\n`, clip(raw));
      const one = tryParseJsonArrayOrObject(raw);
      console.log(`[flow][plan][table_${idx+1}] parsed:`, one);
      if (one && typeof one === 'object' && !Array.isArray(one)) return { table_index: idx + 1, ...one };
      throw new Error(`表 ${idx + 1} 的方案agent返回的JSON无效`);
    }));

    // 3) 绘图代理——生成 vega-lite 规格并校验
    const renderPrompt = makeRendererPrompts(plans, language, themeStyle);
    console.log("\n[flow][render] system:\n", clip(renderPrompt.system));
    console.log("[flow][render] user:\n", clip(renderPrompt.user));
    const renderRaw = await openrouterChat(renderPrompt.system, renderPrompt.user);
    console.log("[flow][render] raw:\n", clip(renderRaw));
    const render = tryParseJsonArrayOrObject(renderRaw);
    console.log("[flow][render] parsed:", render);

    // 校验并修复 render 格式
    if (!render || typeof render !== 'object') {
      throw new Error('绘图agent返回无效JSON');
    }

    // 确保 engine 字段存在
    if (!render.engine) {
      render.engine = 'vega-lite';
    }

    // 确保 per_table_specs 是数组
    if (!Array.isArray(render.per_table_specs)) {
      console.warn('[flow][render] per_table_specs 不是数组，尝试修复');
      render.per_table_specs = [];
    }

    // 验证每个 spec 的格式
    render.per_table_specs = render.per_table_specs.map((entry: any, idx: number) => {
      if (!entry || typeof entry !== 'object') {
        console.warn(`[flow][render] spec ${idx} 格式无效，跳过`);
        return null;
      }

      // 确保 table_index 存在
      if (!entry.table_index) {
        entry.table_index = idx + 1;
      }

      // 确保 spec 存在且是对象
      if (!entry.spec || typeof entry.spec !== 'object') {
        console.warn(`[flow][render] spec ${idx} 缺少 spec 字段`);
        return null;
      }

      return entry;
    }).filter(Boolean);

    if (render.per_table_specs.length === 0) {
      throw new Error('绘图agent未返回有效的图表规格');
    }

    console.log("\n[flow] final payload:", { theme_style: themeStyle, per_table_plans: plans, render });
    return NextResponse.json({
      theme_style: themeStyle,
      per_table_plans: plans,
      render,
      strategy: 'three-stage'
    });
  } catch (e: any) {
    console.error("/api/flow error:", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}


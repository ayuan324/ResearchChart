export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { makeThemeStylePrompts, makePerTablePlanPrompts, makeRendererPrompts, makeDirectVegaPrompts } from "@/lib/prompts";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "google/gemini-2.5-flash";

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
      console.log("\n[flow] 使用备用策略：直接生成完整 Vega-Lite 规格");

      // 1) 主题与风格
      const themePrompt = makeThemeStylePrompts(summary, language, preferences);
      console.log("[flow][theme] system:\n", clip(themePrompt.system));
      console.log("[flow][theme] user:\n", clip(themePrompt.user));
      const themeRaw = await openrouterChat(themePrompt.system, themePrompt.user);
      console.log("[flow][theme] raw:\n", clip(themeRaw));
      const themeStyle = tryParseJsonArrayOrObject(themeRaw);
      console.log("[flow][theme] parsed:", themeStyle);

      // 2) 直接生成包含数据的完整 Vega-Lite 规格
      const tableDataWithConclusions = tableDatas.map((td, i) => ({
        headers: td.headers || [],
        rows: td.rows || [],
        conclusions: Array.isArray(tableConclusions?.[i]) ? tableConclusions[i] : []
      }));

      const directPrompt = makeDirectVegaPrompts(tableDataWithConclusions, language, themeStyle);
      console.log("\n[flow][direct] system:\n", clip(directPrompt.system));
      console.log("[flow][direct] user:\n", clip(directPrompt.user, 6000));
      const directRaw = await openrouterChat(directPrompt.system, directPrompt.user);
      console.log("[flow][direct] raw:\n", clip(directRaw, 6000));
      const render = tryParseJsonArrayOrObject(directRaw);
      console.log("[flow][direct] parsed:", render);

      if (!render || typeof render !== 'object') {
        throw new Error('备用策略：模型返回无效JSON');
      }

      // 确保格式正确
      if (!render.engine) render.engine = 'vega-lite';
      if (!Array.isArray(render.per_table_specs)) render.per_table_specs = [];

      // 验证每个 spec
      render.per_table_specs = render.per_table_specs.map((entry: any, idx: number) => {
        if (!entry || typeof entry !== 'object') return null;
        if (!entry.table_index) entry.table_index = idx + 1;
        if (!entry.spec || typeof entry.spec !== 'object') return null;
        return entry;
      }).filter(Boolean);

      if (render.per_table_specs.length === 0) {
        throw new Error('备用策略：未生成有效的图表规格');
      }

      console.log("\n[flow] 备用策略成功，返回结果");
      return NextResponse.json({
        theme_style: themeStyle || {},
        per_table_plans: render.per_table_specs.map((s: any) => ({
          table_index: s.table_index,
          pitch: s.title || '自动生成图表',
          chart_type: s.spec?.mark?.type || s.spec?.mark || 'bar',
          data_mapping: { direct: true } // 标记为直接策略
        })),
        render,
        strategy: 'direct'
      });
    }

    // 原有的三阶段策略
    console.log("\n[flow] 使用三阶段策略");

    // 1) 主题与风格（样式代理）——强制调用模型并校验
    const themePrompt = makeThemeStylePrompts(summary, language, preferences);
    console.log("[flow][theme] system:\n", clip(themePrompt.system));
    console.log("[flow][theme] user:\n", clip(themePrompt.user));
    const themeRaw = await openrouterChat(themePrompt.system, themePrompt.user);
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


export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { makeThemeStylePrompts, makePerTablePlanPrompts, makeRendererPrompts } from "@/lib/prompts";

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
    const language: string = body?.language || "zh";
    const preferences: string = body?.preferences_text || "";

    // 1) 主题与风格（样式代理）——强制调用模型并校验
    const themePrompt = makeThemeStylePrompts(summary, language, preferences);
    const themeRaw = await openrouterChat(themePrompt.system, themePrompt.user);
    const themeStyle = tryParseJsonArrayOrObject(themeRaw);
    if (!themeStyle || typeof themeStyle !== 'object') {
      throw new Error('主题与风格agent返回的JSON无效');
    }

    // 2) 图表规划（设计代理）——逐表强制生成并校验
    const plans = await Promise.all((tableSchemas || []).map(async (schema: string[], idx: number) => {
      const perConcl = Array.isArray(tableConclusions?.[idx]) ? tableConclusions[idx] : [];
      const p = makePerTablePlanPrompts(schema || [], perConcl || [], language, preferences);
      const raw = await openrouterChat(p.system, p.user);
      const one = tryParseJsonArrayOrObject(raw);
      if (one && typeof one === 'object' && !Array.isArray(one)) return { table_index: idx + 1, ...one };
      throw new Error(`表 ${idx + 1} 的方案agent返回的JSON无效`);
    }));

    // 3) 绘图代理——生成 vega-lite 规格并校验
    const renderPrompt = makeRendererPrompts(plans, language, themeStyle);
    const renderRaw = await openrouterChat(renderPrompt.system, renderPrompt.user);
    const render = tryParseJsonArrayOrObject(renderRaw);
    if (!render || String(render.engine).toLowerCase() !== 'vega-lite' || !Array.isArray(render.per_table_specs)) {
      throw new Error('绘图agent返回无效，应为{"engine":"vega-lite","per_table_specs":[...]}');
    }

    return NextResponse.json({ theme_style: themeStyle, per_table_plans: plans, render });
  } catch (e: any) {
    console.error("/api/flow error:", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}


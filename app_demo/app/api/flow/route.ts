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
  try { return JSON.parse(txt); } catch {}
  const m = (txt || "").match(/[\[{][\s\S]*[\]}]/);
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

    const themePrompt = makeThemeStylePrompts(summary, language, preferences);
    const themeRaw = await openrouterChat(themePrompt.system, themePrompt.user);
    let themeStyle: any = tryParseJsonArrayOrObject(themeRaw) || { palette: "professional", font_family: "Inter", font_size: 12, background: "white", grid: true };

    const plans = await Promise.all((tableSchemas || []).map(async (schema: string[], idx: number) => {
      const perConcl = Array.isArray(tableConclusions?.[idx]) ? tableConclusions[idx] : [];
      const p = makePerTablePlanPrompts(schema || [], perConcl || [], language, preferences);
      const raw = await openrouterChat(p.system, p.user);
      const one = tryParseJsonArrayOrObject(raw);
      if (one && typeof one === "object" && !Array.isArray(one)) return { table_index: idx + 1, ...one };
      return { table_index: idx + 1, pitch: "自动生成图表方案", chart_type: "bar", data_mapping: { x: schema?.[0] || "", y: schema?.[1] || "" } };
    }));

    const renderPrompt = makeRendererPrompts(plans, language);
    const renderRaw = await openrouterChat(renderPrompt.system, renderPrompt.user);
    let render: any = tryParseJsonArrayOrObject(renderRaw) || { engine: "apexcharts", steps: ["prepare mapping", "build options", "render chart"] };

    return NextResponse.json({ theme_style: themeStyle, per_table_plans: plans, render });
  } catch (e: any) {
    console.error("/api/flow error:", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}


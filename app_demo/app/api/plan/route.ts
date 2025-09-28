export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { makePlanPrompts } from "@/lib/prompts";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const summary: string = body?.summary_text || "";
    const tableConclusions: string[][] = body?.table_conclusions || [];
    const tableSchemas: string[][] = body?.table_schemas || [];
    const language: string = body?.language || "zh";
    const preferences: string = body?.preferences_text || "";

    const plan = makePlanPrompts(summary, tableSchemas, tableConclusions, language, preferences);
    const raw = await openrouterChat(plan.system, plan.user);

    let plans: any[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) plans = parsed;
    } catch {}
    if (!plans.length) {
      plans = [
        { pitch: "基于主要指标的柱状对比图", chart_type: "bar", data_mapping: { x: tableSchemas[0]?.[0], y: tableSchemas[0]?.[1] } },
        { pitch: "随时间变化的趋势图", chart_type: "line", data_mapping: { x: tableSchemas[0]?.[0], y: tableSchemas[0]?.[1] } },
        { pitch: "两变量关系的散点图", chart_type: "scatter", data_mapping: { x: tableSchemas[0]?.[0], y: tableSchemas[0]?.[1] } },
      ];
    }

    return NextResponse.json({ plans });
  } catch (e: any) {
    console.error("/api/plan error:", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}


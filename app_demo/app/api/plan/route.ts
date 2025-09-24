export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

    const pitchGuide =
      language === "zh"
        ? "以科研口吻给出简洁pitch，指出核心比较维度与预期洞见"
        : "Give a concise academic pitch highlighting comparison axes and expected insights";

    const planPrompt = `给定论文摘要、表头schema与逐表结论，请生成3套图表方案（JSON数组）。\n要求：\n- 每套包含：pitch（${pitchGuide}）、chart_type（bar/line/scatter/box/violin等之一）、data_mapping（对象，包含x、y、可选hue，字段名必须来自表头schema）\n- 输出严格JSON，无多余文本。\n- 优先选择能清晰表达结论的数据列。\n\n[摘要]\n${summary}\n\n[表头Schema]\n${tableSchemas.map((s, i) => `表${i + 1}: ${s.join(", ")}`).join("\n")}\n\n[逐表结论]\n${tableConclusions
      .map((arr, i) => `表${i + 1}: ${arr.join("; ")}`)
      .join("\n")}\n\n仅输出JSON数组，如：[{"pitch":"...","chart_type":"bar","data_mapping":{"x":"模型","y":"准确率"}}, ...]`;

    const raw = await openrouterChat(
      "你是科研图表规划专家。仅返回严格JSON。",
      planPrompt
    );

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
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}


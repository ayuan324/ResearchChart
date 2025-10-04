import { NextRequest } from "next/server";
import { makeThemeStylePrompts, makeDirectVegaPrompts } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "google/gemini-2.0-flash-exp:free";
const OPENROUTER_MODEL_DIRECT = "openai/gpt-5";

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

function tryParseJsonArrayOrObject(raw: string): any {
  let s = String(raw || "").trim();
  s = s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  s = s.trim();
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function clip(s: string, max = 2000): string {
  return String(s || "").length > max ? String(s).slice(0, max) + "..." : String(s || "");
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await req.json();
        const {
          summary_text = "",
          table_datas = [],
          table_conclusions = [],
          language = "zh",
          preferences_text = "",
          use_direct_strategy = true,
        } = body;

        console.log(`\n[flow-stream] 开始流式生成，表格数量: ${table_datas.length}`);

        // 发送开始事件
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', total: table_datas.length })}\n\n`));

        if (!use_direct_strategy) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: '流式模式仅支持直接策略' })}\n\n`));
          controller.close();
          return;
        }

        // 1) 生成主题
        console.log("[flow-stream][theme] 开始生成主题");
        const themePrompt = makeThemeStylePrompts(summary_text, language, preferences_text);
        const themeRaw = await openrouterChat(themePrompt);
        const themeStyle = tryParseJsonArrayOrObject(themeRaw);
        console.log("[flow-stream][theme] 主题生成完成");

        // 发送主题事件
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'theme', theme_style: themeStyle })}\n\n`));

        // 2) 逐个生成图表并立即发送
        for (let idx = 0; idx < table_datas.length; idx++) {
          try {
            const td = table_datas[idx];
            const tableData = {
              headers: td.headers || [],
              rows: td.rows || [],
              conclusions: Array.isArray(table_conclusions?.[idx]) ? table_conclusions[idx] : []
            };

            console.log(`[flow-stream][table_${idx+1}] 开始生成，数据行数: ${tableData.rows.length}`);

            // 发送进度事件
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'progress', 
              current: idx + 1, 
              total: table_datas.length,
              message: `正在生成第 ${idx + 1}/${table_datas.length} 个图表...`
            })}\n\n`));

            const directPrompt = makeDirectVegaPrompts([tableData], language, themeStyle, idx + 1);
            const directRaw = await openrouterChat(directPrompt, OPENROUTER_MODEL_DIRECT);
            const result = tryParseJsonArrayOrObject(directRaw);

            if (!result || !result.per_table_specs || result.per_table_specs.length === 0) {
              console.error(`[flow-stream][table_${idx+1}] 生成失败`);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'chart_error', 
                table_index: idx + 1,
                message: '图表生成失败'
              })}\n\n`));
              continue;
            }

            const entry = result.per_table_specs[0];
            entry.table_index = idx + 1;

            console.log(`[flow-stream][table_${idx+1}] ✅ 成功生成，立即发送`);

            // 立即发送图表数据
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'chart', 
              table_index: idx + 1,
              title: entry.title,
              spec: entry.spec,
              chart_type: entry.spec?.mark?.type || entry.spec?.mark || 'bar'
            })}\n\n`));

          } catch (error) {
            console.error(`[flow-stream][table_${idx+1}] ❌ 错误:`, error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'chart_error', 
              table_index: idx + 1,
              message: String(error)
            })}\n\n`));
          }
        }

        // 发送完成事件
        console.log(`[flow-stream] 全部完成`);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`));
        controller.close();

      } catch (error) {
        console.error("[flow-stream] 错误:", error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'error', 
          message: String(error) 
        })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}


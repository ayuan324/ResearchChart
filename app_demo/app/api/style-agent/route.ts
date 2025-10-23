import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

/**
 * 多模态模型调用 (支持图片)
 */
async function multimodalChat(prompt: string, imageBase64?: string, retries = 3): Promise<string> {
  const dashKey = process.env.DASHSCOPE_API_KEY;
  if (!dashKey) throw new Error('DASHSCOPE_API_KEY 未配置');

  const compatBase = process.env.OPENAI_COMPAT_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const compatEndpoint = `${compatBase.replace(/\/+$/, '')}/chat/completions`;
  const vlModel = 'qwen-vl-plus';

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const content: any[] = [{ type: 'text', text: prompt }];

      if (imageBase64) {
        content.push({
          type: 'image_url',
          image_url: {
            url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
          }
        });
      }

      const r = await fetch(compatEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${dashKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: vlModel,
          messages: [{ role: 'user', content }],
          temperature: 0.3,
        }),
      });

      if (r.status === 429) {
        await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
        continue;
      }

      if (!r.ok) {
        const t = await r.text();
        throw new Error(`多模态模型调用失败: ${r.status} - ${t}`);
      }

      const data = await r.json();
      const result = data?.choices?.[0]?.message?.content ?? '';
      return String(result || '').trim();
    } catch (e) {
      if (attempt === retries - 1) throw e;
      await new Promise(res => setTimeout(res, 1000));
    }
  }
  throw new Error('多模态LLM 调用失败：超过最大重试次数');
}

async function textOnlyChat(prompt: string, retries = 3): Promise<string> {
  const dashKey = process.env.DASHSCOPE_API_KEY;
  if (!dashKey) throw new Error('DASHSCOPE_API_KEY 未配置');

  const compatBase = process.env.OPENAI_COMPAT_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const compatEndpoint = `${compatBase.replace(/\/+$/, '')}/chat/completions`;
  const textModel = 'qwen-max';

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const r = await fetch(compatEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${dashKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: textModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      });

      if (r.status === 429) {
        await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
        continue;
      }

      if (!r.ok) {
        const t = await r.text();
        throw new Error(`文本模型调用失败: ${r.status} - ${t}`);
      }

      const data = await r.json();
      const result = data?.choices?.[0]?.message?.content ?? '';
      return String(result || '').trim();
    } catch (e) {
      if (attempt === retries - 1) throw e;
      await new Promise(res => setTimeout(res, 1000));
    }
  }
  throw new Error('文本LLM 调用失败：超过最大重试次数');
}

function tryParseJson(txt: string): any {
  let s = String(txt || "").trim();
  s = s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  try { return JSON.parse(s); } catch {}
  const m = s.match(/[\[{][\s\S]*[\]}]/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const { preferences_text, reference_image } = body;

    console.log('[style-agent] 收到请求:', {
      has_text: !!preferences_text,
      has_image: !!reference_image
    });

    // 构建Prompt
    const prompt = `你是图表风格分析专家。请分析用户的偏好描述${reference_image ? '和参考图片' : ''}，提取出结构化的风格约束。

【用户偏好】
${preferences_text || '无特殊偏好'}

【输出格式】
严格返回JSON对象，格式如下：
{
  "style": "academic|simple|colorful|professional",
  "chart_types": ["bar", "line", "scatter"],  // 可选，用户指定的图表类型约束
  "color_scheme": {
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "palette": "cool|warm|neutral"
  },
  "font_preferences": {
    "family": "Arial|Helvetica|serif",
    "size": 12
  },
  "layout_preferences": {
    "grid": true,
    "legend_position": "top|right|bottom|left"
  }${reference_image ? `,
  "reference_style_analysis": "对参考图片风格的描述"` : ''}
}

【要求】
1. 禁止使用 Markdown 代码块（\`\`\`json 或 \`\`\`）
2. 输出必须是纯 JSON，以 { 开头，以 } 结尾
3. 如果用户没有明确指定某项，使用合理的默认值
4. style 字段必须是: academic, simple, colorful, professional 之一`;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`[PROMPT] 风格控制 Agent`);
    console.log(`${'='.repeat(80)}`);
    console.log(prompt);
    if (reference_image) {
      console.log(`\n[附带图片] ${reference_image.slice(0, 50)}...`);
    }
    console.log(`${'='.repeat(80)}\n`);

    // 发送prompt到debug页面
    try {
      await fetch(`http://localhost:${process.env.PORT || 3001}/api/debug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'prompt',
          data: {
            stage: 'style_agent',
            prompt: prompt,
            has_image: !!reference_image
          }
        })
      }).catch(() => {});
    } catch {}

    let rawResponse: string;

    if (reference_image) {
      console.log('[style-agent] 使用多模态模型分析');
      rawResponse = await multimodalChat(prompt, reference_image);
    } else {
      console.log('[style-agent] 使用文本模型分析');
      rawResponse = await textOnlyChat(prompt);
    }

    // 发送response到debug页面
    try {
      await fetch(`http://localhost:${process.env.PORT || 3001}/api/debug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'response',
          data: { stage: 'style_agent', response: rawResponse }
        })
      }).catch(() => {});
    } catch {}

    console.log('[style-agent] LLM 原始响应:', rawResponse.slice(0, 500));

    const parsed = tryParseJson(rawResponse);
    if (!parsed) {
      throw new Error('无法解析LLM返回的JSON');
    }

    console.log('[style-agent] 解析成功');

    return NextResponse.json({
      success: true,
      style_constraints: parsed,
      raw_response: rawResponse
    }, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'X-Duration': String(Date.now() - start)
      }
    });

  } catch (e: any) {
    console.error('[style-agent] 错误:', e.message);
    return NextResponse.json({
      success: false,
      error: String(e?.message || e)
    }, {
      status: 500,
      headers: corsHeaders
    });
  }
}

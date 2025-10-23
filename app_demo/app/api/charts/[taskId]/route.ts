import { NextRequest, NextResponse } from "next/server";
import { jobs } from "../_store";
import { makeThemeStylePrompts, makeDirectEchartsPrompts, makeChartTypePrompts } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60; // 单次只做一个步骤（主题或单表），60s 足够
export const dynamic = "force-dynamic";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "openai/chatgpt-4o-latest";

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
 * @param prompt 文本提示词
 * @param imageBase64 可选的base64编码图片
 * @param retries 重试次数
 */
async function multimodalChat(prompt: string, imageBase64?: string, retries = 3): Promise<string> {
  const dashKey = process.env.DASHSCOPE_API_KEY;
  if (!dashKey) throw new Error('DASHSCOPE_API_KEY 未配置');

  const compatBase = process.env.OPENAI_COMPAT_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const compatEndpoint = `${compatBase.replace(/\/+$/, '')}/chat/completions`;
  const vlModel = 'qwen-vl-plus';  // 多模态模型

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const content: any[] = [{ type: 'text', text: prompt }];

      // 如果有图片，添加到content数组
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

async function openrouterChat(prompt: string, model?: string, retries = 3): Promise<string> {
  const dashKey = process.env.DASHSCOPE_API_KEY;
  const useDash = !!dashKey;
  const compatBase = process.env.OPENAI_COMPAT_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const compatEndpoint = `${compatBase.replace(/\/+$/, '')}/chat/completions`;
  const compatModel = useDash
    ? (process.env.OPENAI_COMPAT_MODEL || 'qwen3-max')
    : (model || OPENROUTER_MODEL);

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      if (useDash) {
        const r = await fetch(compatEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${dashKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: compatModel,
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
          throw new Error(`DashScope 调用失败: ${r.status} - ${t}`);
        }
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
          model: compatModel,
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
        throw new Error(`OpenRouter 调用失败: ${r.status} - ${t}`);
      }
      const data = await r.json();
      const content = data?.choices?.[0]?.message?.content ?? '';
      return String(content || '').trim();
    } catch (e) {
      if (attempt === retries - 1) throw e;
      await new Promise(res => setTimeout(res, 1000));
    }
  }
  throw new Error('LLM 调用失败：超过最大重试次数');
}

function tryParseJsonArrayOrObject(txt: string): any {
  let s = String(txt || "").trim();
  s = s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  try { return JSON.parse(s); } catch {}
  const m = s.match(/[\[{][\s\S]*[\]}]/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

export async function GET(_: NextRequest, { params }: { params: { taskId: string } }) {
  const start = Date.now();
  try {
    const id = params.taskId;
    const job = jobs.get(id);
    if (!job) {
      return NextResponse.json({ error: "taskId 不存在" }, { status: 404, headers: corsHeaders });
    }

    // 已完成/报错，直接返回
    if (job.status === 'success' || job.status === 'error') {
      return NextResponse.json({
        taskId: job.id,
        status: job.status,
        error: job.error,
        total: job.total,
        completed: job.completed,
        theme_style: job.theme_style || null,
        results: job.results,
        updatedAt: job.updatedAt,
      }, { headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Duration': String(Date.now() - start),
      }});
    }

    job.status = 'running';

    // 步骤 1：主题与风格（一次性做完）
    if (!job.theme_style) {
      const themePrompt = makeThemeStylePrompts(job.summary_text, job.language, job.preferences_text);
      console.log(`\n${'='.repeat(80)}`);
      console.log(`[PROMPT] 主题与风格 Agent - 任务 ${id}`);
      console.log(`${'='.repeat(80)}`);
      console.log(themePrompt);
      console.log(`${'='.repeat(80)}\n`);

      // 发送prompt到debug页面（使用内部API调用，无需HTTP）
      // 暂时注释掉，避免跨端口问题
      // try {
      //   await fetch(`http://localhost:3002/api/debug`, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       type: 'prompt',
      //       data: { stage: 'theme_agent', task: id, prompt: themePrompt }
      //     })
      //   }).catch(() => {});
      // } catch {}

      const themeRaw = await openrouterChat(themePrompt, OPENROUTER_MODEL);

      // 发送response到debug页面（使用内部API调用，无需HTTP）
      // 暂时注释掉，避免跨端口问题
      // try {
      //   await fetch(`http://localhost:3002/api/debug`, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       type: 'response',
      //       data: { stage: 'theme_agent', task: id, response: themeRaw }
      //     })
      //   }).catch(() => {});
      // } catch {}
      console.groupCollapsed(`[charts][theme][${id}] raw`);
      console.log(String(themeRaw).slice(0,4000));
      console.groupEnd();
      const theme = tryParseJsonArrayOrObject(themeRaw) || {};
      job.theme_style = theme;
      job.updatedAt = Date.now();
      return NextResponse.json({
        taskId: job.id,
        status: job.status,
        step: 'theme_done',
        total: job.total,
        completed: job.completed,
        theme_style: job.theme_style,
        results: job.results,
        updatedAt: job.updatedAt,
      }, { headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Duration': String(Date.now() - start),
      }});
    }

    // 步骤 2：每次处理一张表，保证单次请求用时可控
    if (job.nextIndex < job.total) {
      const idx = job.nextIndex; // 0-based
      const td = job.table_datas[idx];
      const tableData = {
        headers: td.headers || [],
        rows: td.rows || [],
        conclusions: td.conclusions || [],
      };
      const directPrompt = makeDirectEchartsPrompts([tableData], job.language, job.theme_style, idx + 1);
      console.log(`\n${'='.repeat(80)}`);
      console.log(`[PROMPT] 绘图 Agent - 任务 ${id} - 表格 ${idx+1}`);
      console.log(`${'='.repeat(80)}`);
      console.log(directPrompt);
      console.log(`${'='.repeat(80)}\n`);

      // 发送prompt到debug页面
      try {
        await fetch(`http://localhost:${process.env.PORT || 3001}/api/debug`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'prompt',
            data: { stage: 'drawing_agent', task: id, table: idx + 1, prompt: directPrompt }
          })
        }).catch(() => {});
      } catch {}

      const directRaw = await openrouterChat(directPrompt, OPENROUTER_MODEL);

      // 发送response到debug页面
      try {
        await fetch(`http://localhost:${process.env.PORT || 3001}/api/debug`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'response',
            data: { stage: 'drawing_agent', task: id, table: idx + 1, response: directRaw }
          })
        }).catch(() => {});
      } catch {}
      console.groupCollapsed(`[charts][direct][${id}] table_${idx+1} raw`);
      console.log(String(directRaw).slice(0,4000));
      console.groupEnd();

      const parsed = tryParseJsonArrayOrObject(directRaw);

      console.log(`[charts][direct][${id}] table_${idx+1} parsed result:`, {
        isParsed: !!parsed,
        hasPerTableSpecs: !!(parsed?.per_table_specs),
        isArray: Array.isArray(parsed?.per_table_specs),
        length: Array.isArray(parsed?.per_table_specs) ? parsed.per_table_specs.length : -1,
        parsedKeys: parsed ? Object.keys(parsed) : [],
      });

      const specs = parsed?.per_table_specs || [];

      // 如果LLM跳过了该表格（返回空specs），记录并继续下一个
      if (!Array.isArray(specs) || specs.length === 0) {
        console.warn(`[charts][direct][${id}] table_${idx+1} LLM跳过该表格（可能是非数值表格或JSON解析失败）`);
        console.warn(`[charts][direct][${id}] table_${idx+1} raw response (first 500 chars):`, String(directRaw).slice(0, 500));
        console.warn(`[charts][direct][${id}] table_${idx+1} parsed object:`, parsed);

        // 标记为已完成，但不添加到results
        job.completed += 1;
        job.nextIndex += 1;

        if (job.completed >= job.total) {
          job.status = 'success';
          console.log(`[charts][done][${id}] results=`, job.results.length);
        }

        return NextResponse.json({
          taskId: job.id,
          status: job.status,
          total: job.total,
          completed: job.completed,
          theme_style: job.theme_style,
          results: job.results,
          updatedAt: job.updatedAt,
        }, { headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Duration': String(Date.now() - start),
        }});
      }

      const entry = specs[0];
      entry.table_index = idx + 1;
      console.log(`[charts][direct][${id}] table_${idx+1} spec summary`, {
        series_type: (entry?.spec?.series && Array.isArray(entry.spec.series) && entry.spec.series[0]?.type) || null,
        has_xAxis: !!entry?.spec?.xAxis,
        has_yAxis: !!entry?.spec?.yAxis
      });
      job.results.push({
        table_index: entry.table_index,
        title: entry.title || '自动生成图表',
        chart_type: (entry.spec?.series && Array.isArray(entry.spec.series) && entry.spec.series[0]?.type) ? entry.spec.series[0].type : 'bar',
        spec: entry.spec,
      });
      job.completed += 1;
      job.nextIndex += 1;
      job.updatedAt = Date.now();

      if (job.completed >= job.total) {
        job.status = 'success';
        console.log(`[charts][done][${id}] results=`, job.results.length);
      }

      return NextResponse.json({
        taskId: job.id,
        status: job.status,
        total: job.total,
        completed: job.completed,
        theme_style: job.theme_style,
        results: job.results,
        updatedAt: job.updatedAt,
      }, { headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Duration': String(Date.now() - start),
      }});
    }

    // 理论不达：安全兜底
    job.status = 'success';
    job.updatedAt = Date.now();
    return NextResponse.json({
      taskId: job.id,
      status: job.status,
      total: job.total,
      completed: job.completed,
      theme_style: job.theme_style,
      results: job.results,
      updatedAt: job.updatedAt,
    }, { headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Duration': String(Date.now() - start),
    }});
  } catch (e: any) {
    try { console.error(`[charts][error][${(params as any)?.taskId}]`, String(e?.message || e)); } catch {}
    try {
      const id = (params as any)?.taskId;
      const job = jobs.get(id);
      if (job) {
        job.status = 'error';
        job.error = String(e?.message || e);
        job.updatedAt = Date.now();
      }
    } catch {}
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: NextRequest, { params }: { params: { taskId: string } }) {
  const start = Date.now();
  try {
    const body = await req.json();
    const state = body?.state || {};
    const job = {
      id: params.taskId,
      status: String(state.status || 'queued'),
      total: Number(state.total || (Array.isArray(state.table_datas) ? state.table_datas.length : 0)),
      completed: Number(state.completed || 0),
      nextIndex: Number(state.nextIndex || 0),
      summary_text: String(state.summary_text || ''),
      language: String(state.language || 'zh'),
      preferences_text: String(state.preferences_text || ''),
      table_datas: Array.isArray(state.table_datas) ? state.table_datas : [],
      theme_style: state.theme_style || undefined,
      results: Array.isArray(state.results) ? state.results : [],
    } as any;

    // 步骤 1：主题
    if (!job.theme_style) {
      const themePrompt = makeThemeStylePrompts(job.summary_text, job.language, job.preferences_text);
      console.groupCollapsed(`[charts][theme][${job.id}] prompt`);
      console.log(themePrompt);
      console.groupEnd();
      const themeRaw = await openrouterChat(themePrompt, OPENROUTER_MODEL);
      console.groupCollapsed(`[charts][theme][${job.id}] raw`);
      console.log(String(themeRaw).slice(0,4000));
      console.groupEnd();
      job.theme_style = tryParseJsonArrayOrObject(themeRaw) || {};
      return NextResponse.json({
        taskId: job.id,
        status: 'running',
        total: job.total,
        completed: job.completed,
        theme_style: job.theme_style,
        results: job.results,
        nextIndex: job.nextIndex,
      }, { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Duration': String(Date.now()-start) }});
    }

    // 步骤 2：单表推进（集成三阶段Agent）
    if (job.nextIndex < job.total) {
      const idx = job.nextIndex;
      const td = job.table_datas[idx] || { headers: [], rows: [], conclusions: [] };

      // 步骤 2.1：表格类型Agent - 推荐图表类型
      let chartTypeRecommendation = null;
      try {
        const typePrompt = makeChartTypePrompts({ headers: td.headers||[], rows: td.rows||[], conclusions: td.conclusions||[] }, job.language);
        console.log(`\n${'='.repeat(80)}`);
        console.log(`[PROMPT] 表格类型 Agent - 任务 ${job.id} - 表格 ${idx+1}`);
        console.log(`${'='.repeat(80)}`);
        console.log(typePrompt);
        console.log(`${'='.repeat(80)}\n`);

        const typeRaw = await openrouterChat(typePrompt, OPENROUTER_MODEL);
        chartTypeRecommendation = tryParseJsonArrayOrObject(typeRaw);
        console.log(`[charts][type-agent][${job.id}] table_${idx+1} recommendation:`, chartTypeRecommendation?.recommended_type);
      } catch (e) {
        console.warn(`[charts][type-agent][${job.id}] table_${idx+1} failed, using default`);
      }

      // 步骤 2.2：绘图Agent - 生成ECharts配置（使用风格约束和类型推荐）
      const styleConstraints = (state as any)?.style_constraints || null;
      const directPrompt = makeDirectEchartsPrompts(
        [{ headers: td.headers||[], rows: td.rows||[], conclusions: td.conclusions||[] }],
        job.language,
        job.theme_style,
        idx+1,
        styleConstraints,
        chartTypeRecommendation
      );
      console.groupCollapsed(`[charts][direct][${job.id}] table_${idx+1} prompt`);
      console.log(directPrompt);
      console.groupEnd();
      const directRaw = await openrouterChat(directPrompt, OPENROUTER_MODEL);
      console.groupCollapsed(`[charts][direct][${job.id}] table_${idx+1} raw`);
      console.log(String(directRaw).slice(0,4000));
      console.groupEnd();
      const parsed = tryParseJsonArrayOrObject(directRaw);

      console.log(`[charts][direct][${job.id}] table_${idx+1} parsed result:`, {
        isParsed: !!parsed,
        hasPerTableSpecs: !!(parsed?.per_table_specs),
        isArray: Array.isArray(parsed?.per_table_specs),
        length: Array.isArray(parsed?.per_table_specs) ? parsed.per_table_specs.length : -1,
        parsedKeys: parsed ? Object.keys(parsed) : [],
      });

      const specs = parsed?.per_table_specs || [];

      // 如果LLM跳过了该表格（返回空specs），记录并继续下一个
      if (!Array.isArray(specs) || specs.length === 0) {
        console.warn(`[charts][direct][${job.id}] table_${idx+1} LLM跳过该表格（可能是非数值表格或JSON解析失败）`);
        console.warn(`[charts][direct][${job.id}] table_${idx+1} raw response (first 500 chars):`, String(directRaw).slice(0, 500));
        console.warn(`[charts][direct][${job.id}] table_${idx+1} parsed object:`, parsed);

        job.completed += 1;
        job.nextIndex += 1;
        const status = job.completed >= job.total ? 'success' : 'running';
        return NextResponse.json({
          taskId: job.id, status, total: job.total, completed: job.completed,
          theme_style: job.theme_style, results: job.results, nextIndex: job.nextIndex,
        }, { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Duration': String(Date.now()-start) }});
      }

      const entry = specs[0];
      entry.table_index = idx + 1;
      job.results.push({ table_index: entry.table_index, title: entry.title || '自动生成图表', chart_type: (entry.spec?.series && Array.isArray(entry.spec.series) && entry.spec.series[0]?.type) ? entry.spec.series[0].type : 'bar', spec: entry.spec });
      job.completed += 1;
      job.nextIndex += 1;
      const status = job.completed >= job.total ? 'success' : 'running';
      return NextResponse.json({
        taskId: job.id, status, total: job.total, completed: job.completed,
        theme_style: job.theme_style, results: job.results, nextIndex: job.nextIndex,
      }, { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Duration': String(Date.now()-start) }});
    }

    // 已完成
    return NextResponse.json({
      taskId: job.id,
      status: 'success',
      total: job.total,
      completed: job.completed,
      theme_style: job.theme_style,
      results: job.results,
      nextIndex: job.nextIndex,
    }, { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Duration': String(Date.now()-start) }});
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500, headers: corsHeaders });
  }
}


export function makeKeyFindingsPrompts(docMd: string) {
  const system =
    "你是一个知识丰富的科研助手。现在我需要您为我提取论文的 Key Findings（关键发现）。要求：用中文，简洁具体；每条一行，共5-8条；不要编号，不要加标题或额外解释，只输出Key Findings本身。";
  const user = `以下是论文的Markdown片段，请只输出Key Findings，每行一条：\n\n${docMd}`;
  return { system, user };
}

export function makeTableConclusionsPrompts(tablesPrompt: string, docMd: string) {
  const system =
    "你是一个经验丰富的科研助手。请结合论文原文与下列Md表格，对每个表生成2-5条结论。仅返回严格JSON数组，每个元素为该表的结论数组。";
  const user = `请阅读论文原文与表格，按顺序输出JSON：[[结论1...],[结论2...],...]。\n不要输出多余文本。\n\n[论文原文]\n${docMd}\n\n[表格]\n${tablesPrompt}`;
  return { system, user };
}

export function makePlanPrompts(
  summary: string,
  tableSchemas: string[][],
  tableConclusions: string[][],
  language: string,
  preferences?: string
) {
  const pitchGuide =
    language === "zh"
      ? "以科研口吻给出简洁pitch，指出核心比较维度与预期洞见"
      : "Give a concise academic pitch highlighting comparison axes and expected insights";
  const system =
    language === "zh"
      ? "你是科研图表规划专家。仅返回严格JSON。"
      : "You are an expert in scientific visualization planning. Return strict JSON only.";
  const schemasText = tableSchemas
    .map((s, i) => `表${i + 1}: ${s.join(", ")}`)
    .join("\n");
  const conclText = tableConclusions
    .map((arr, i) => `表${i + 1}: ${arr.join("; ")}`)
    .join("\n");
  const prefBlock = preferences && String(preferences).trim() ? `\n\n[用户偏好]\n${String(preferences).trim()}` : "";
  const user =
    `给定论文摘要、表头schema与逐表结论，请生成3套图表方案（JSON数组）。\n要求：\n- 每套包含：pitch（${pitchGuide}）、chart_type（bar/line/scatter/box/violin等之一）、data_mapping（对象，包含x、y、可选hue，字段名必须来自表头schema）\n- 输出严格JSON，无多余文本。\n- 优先选择能清晰表达结论的数据列。\n- 在可行范围内结合[用户偏好]调整图表类型与配色/风格。\n\n[摘要]\n${summary}\n\n[表头Schema]\n${schemasText}\n\n[逐表结论]\n${conclText}${prefBlock}\n\n仅输出JSON数组，如：[{"pitch":"...","chart_type":"bar","data_mapping":{"x":"模型","y":"准确率"}}, ...]`;
  return { system, user };
}


export function makeThemeStylePrompts(
  summary: string,
  language: string,
  preferences?: string
){
  const prefBlock = preferences && String(preferences).trim()?`\n\n[用户偏好]\n${String(preferences).trim()}`:'';
  const prompt = `${language==='zh'?`你是主题与风格管理代理。请基于论文摘要与用户偏好，给出全局主题与风格设置。`:`You are a theme & style manager agent. Given the summary and user preferences, return global theme & style settings.`}

[摘要]
${summary}${prefBlock}

${language==='zh'?`仅输出形如：{"palette":"professional|nature|mono|warm|cool","font_family":"","font_size":12,"background":"white","grid":true}`:
`Return JSON: {"palette":"professional|nature|mono|warm|cool","font_family":"","font_size":12,"background":"white","grid":true}`}
${language==='zh'?`必须是严格 JSON 对象；不要使用 Markdown 代码块（例如三反引号）或反引号；不要添加任何解释性文字；输出必须以 { 开头、以 } 结尾。`:`Return strict JSON object only; do not use markdown code fences (e.g., triple backticks), no backticks, no extra text; the output must start with { and end with }.`} `;
  return prompt;
}

export function makePerTablePlanPrompts(
  schema: string[],
  conclusions: string[],
  language: string,
  preferences?: string
){
  const system = language==='zh'? '你是图表规划代理。仅返回严格JSON。'
                                : 'You are a chart planning agent. Return strict JSON only.';
  const prefBlock = preferences && String(preferences).trim()?`\n\n[用户偏好]\n${String(preferences).trim()}`:'';
  const zhChecklist = `给定表头schema与该表的结论，为该表生成1套图表方案。请遵循下列“提示词/Checklist”作为内在约束：
- 目标：一句话定义“这张图要证明什么？”作为 pitch
- 数据：指明来源、样本数、维度、标签（以列名体现）
- 视觉编码：依据列类型选择合适图型与编码（颜色/marker/大小），颜色遵循全局主题
- 可读性：字号、格网、留白、图例位置与标题（以结果的 chart_type 与后续样式体现）
- 一致性：全篇统一配色与字号（由主题代理提供）
- 输出：仅返回 JSON，不含图片或代码
- 可复现：确保 data_mapping 的列名来自表头schema
- 格式：必须是严格 JSON 对象，禁止输出数组；禁止使用 Markdown 代码块（例如三反引号）或反引号；不要添加任何解释性文字；输出必须以 { 开头、以 } 结尾。`;
  const enChecklist = `Given table schema and conclusions, generate exactly 1 chart plan using the checklist: goal/pitch, data source & fields, visual encoding, readability, consistency with global theme, reproducibility (mapping fields must exist). Return JSON only. Format: strict JSON object (not an array), no markdown code fences (e.g., triple backticks), no backticks, no extra text; output must start with { and end with }.`;
  const header = language==='zh' ? zhChecklist : enChecklist;
  const suffix = language==='zh'
    ? '仅输出：{"pitch":"...","chart_type":"bar|line|scatter|box|violin|heatmap|area|radar","data_mapping":{"x":"列名","y":"列名","hue":"可选列名"}}'
    : 'Return JSON: {"pitch":"","chart_type":"bar|line|scatter|box|violin|heatmap|area|radar","data_mapping":{"x":"","y":"","hue":"optional"}}';
  const user = `${header}

[表头Schema]
${schema.join(', ')}

[该表结论]
${(conclusions||[]).join('; ')}${prefBlock}

${suffix}`;
  return { system, user };
}

export function makeRendererPrompts(
  plans: any[],
  language: string,
  themeStyle?: any
){
  const system = language==='zh'? '你是绘图代理。仅返回严格JSON，不要使用Markdown代码块。'
                                : 'You are the drawing agent. Return strict JSON only, no markdown code blocks.';
  const theme = themeStyle ? JSON.stringify(themeStyle).slice(0,1000) : '{}';
  const zhRender = `根据以下逐表规划与主题样式，使用 Plotly 作为渲染引擎，为每个表生成一个 Plotly 图形对象（figure）。

【关键要求】
1. 返回格式必须是：{"engine":"plotly","per_table_specs":[{"table_index":1,"spec":{...}},{"table_index":2,"spec":{...}}]}
2. 每个 spec 的结构：
   {
     "data": [ { "type": "bar" | "scatter" | "heatmap" | "box" | "violin" | "area", "x": [...], "y": [...], "marker": {}, "name": "可选" } ],
     "layout": { "height": 300, "paper_bgcolor": "white", "plot_bgcolor": "white" }
   }
3. 字段名使用 x / y / hue（前端会自动映射实际列名）；对于 hue 维度，请生成分组/颜色区分（如多 trace 或 marker.color）
4. 不要在 spec 外层包含多余字段
5. 禁止使用 Markdown 代码块（\`\`\`json 或 \`\`\`）
6. 输出必须是纯 JSON，以 { 开头、以 } 结尾

【主题样式】
${theme}

【逐表规划】
${JSON.stringify(plans).slice(0,3500)}

请严格按照上述格式返回 JSON。`;

  const enRender = `Generate Plotly figures for each table plan.

【Required Format】
{"engine":"plotly","per_table_specs":[{"table_index":1,"spec":{...}},{"table_index":2,"spec":{...}}]}

【Spec Structure】
{
  "data": [ { "type": "bar" | "scatter" | "heatmap" | "box" | "violin" | "area", "x": [...], "y": [...], "marker": {}, "name": "optional" } ],
  "layout": { "height": 300, "paper_bgcolor": "white", "plot_bgcolor": "white" }
}

【Field Names】
Use x / y / hue; for hue, create grouped/color-separated traces (e.g., multiple traces or marker.color)

【Important】
- Do NOT include extra fields outside spec
- Do NOT use markdown code blocks (\`\`\`json or \`\`\`)
- Output must be pure JSON starting with { and ending with }

【Theme】
${theme}

【Plans】
${JSON.stringify(plans).slice(0,3500)}

Return strict JSON only.`;

  const user = language==='zh' ? zhRender : enRender;
  return { system, user };
}

/**
 * 备用策略：直接生成包含数据的完整 Vega-Lite 规格
 * 适用于数据映射复杂或需要更精确控制的场景
 * 注意：每次调用只处理一个表格
 */
export function makeDirectVegaPrompts(
  tableData: { headers: string[]; rows: string[][]; conclusions: string[] }[],
  language: string,
  themeStyle?: any,
  tableIndex?: number
){
  const theme = themeStyle ? JSON.stringify(themeStyle).slice(0,800) : '{}';

  const actualTableIndex = tableIndex || 1;

  const zhPrompt = `你是专业的数据可视化专家，擅长使用 Plotly 创建科研图表。请为以下表格生成一个完整的 Plotly 图形对象（包含数据）。

【严格输出格式】
{
  "engine": "plotly",
  "per_table_specs": [
    {
      "table_index": ${actualTableIndex},
      "title": "图表标题（基于结论生成）",
      "spec": {
        "data": [
          { "type": "bar", "x": ["列名1的值1", "列名1的值2"], "y": [123, 456], "name": "分类A" }
        ],
        "layout": { "height": 300, "paper_bgcolor": "white", "plot_bgcolor": "white", "legend": {"orientation": "h"} }
      }
    }
  ]
}

【关键要求】
1. data 数组必须包含完整数据，来自表格全部数据行；使用表格的实际列名填充 x/y（不要改变列名）
2. 若存在分组/类别（类似 hue 维度），请使用多 trace 或 marker.color 进行区分
3. 标题应基于结论生成，可放在 layout.title 或外层 title 字段
4. 高度固定为 300，宽度自适应；无需额外启用交互（Plotly 默认交互）
5. table_index 必须设置为 ${actualTableIndex}
6. 应用主题样式：${theme}
7. 禁止使用 Markdown 代码块（\`\`\`json 或 \`\`\`）
8. 输出必须是纯 JSON，以 { 开头，以 } 结尾

【表格数据】
${tableData.map((t, i) => `
表格索引: ${actualTableIndex}
列名: ${t.headers.join(', ')}
数据行数: ${t.rows.length}
完整数据:
${t.rows.map((r, ri) => `  行${ri+1}: ${r.join(' | ')}`).join('\n')}

结论: ${t.conclusions.length > 0 ? t.conclusions.join('；') : '无结论'}
`).join('\n---\n')}

请严格按照上述格式生成图形对象。`;

  const enPrompt = `You are a professional data visualization expert specializing in Plotly for scientific charts. Generate a complete Plotly figure (with data) for the table below.

【Strict Output Format】
{
  "engine": "plotly",
  "per_table_specs": [
    {
      "table_index": ${actualTableIndex},
      "title": "Chart Title (based on conclusions)",
      "spec": {
        "data": [
          { "type": "bar", "x": ["value1", "value2"], "y": [123, 456], "name": "categoryA" }
        ],
        "layout": { "height": 300, "paper_bgcolor": "white", "plot_bgcolor": "white", "legend": {"orientation": "h"} }
      }
    }
  ]
}

【Critical Requirements】
1. data must include complete data from all table rows; use actual column names to populate x/y (do not rename)
2. If there are groups/categories (like hue), use multiple traces or marker.color
3. Add a meaningful title based on conclusions, either in layout.title or outer title
4. Height must be 300, width responsive; interactivity is default in Plotly
5. table_index must be ${actualTableIndex}
6. Apply theme: ${theme}
7. No markdown code blocks (\`\`\`json or \`\`\`)
8. Output must be pure JSON

【Table Data】
${tableData.map((t) => `
Table Index: ${actualTableIndex}
Columns: ${t.headers.join(', ')}
Row Count: ${t.rows.length}
Complete Data:
${t.rows.map((r, ri) => `  Row${ri+1}: ${r.join(' | ')}`).join('\n')}

Conclusions: ${t.conclusions.length > 0 ? t.conclusions.join('; ') : 'No conclusions'}
`).join('\n---\n')}

Generate the figure strictly following the format above.`;

  return language==='zh' ? zhPrompt : enPrompt;
}


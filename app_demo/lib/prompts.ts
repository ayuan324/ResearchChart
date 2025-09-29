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
  const system = language==='zh' ? '你是主题与风格管理代理。仅返回严格JSON。'
                                 : 'You are a theme & style manager agent. Return strict JSON only.';
  const prefBlock = preferences && String(preferences).trim()?`\n\n[用户偏好]\n${String(preferences).trim()}`:'';
  const user = `${language==='zh'?`请基于论文摘要与用户偏好，给出全局主题与风格设置。`:`Given the summary and user preferences, return global theme & style settings.`}

[摘要]
${summary}${prefBlock}

${language==='zh'?`仅输出形如：{"palette":"professional|nature|mono|warm|cool","font_family":"","font_size":12,"background":"white","grid":true}`:
`Return JSON: {"palette":"professional|nature|mono|warm|cool","font_family":"","font_size":12,"background":"white","grid":true}`} `;
  return { system, user };
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
- 可复现：确保 data_mapping 的列名来自表头schema`;
  const enChecklist = `Given table schema and conclusions, generate exactly 1 chart plan using the checklist: goal/pitch, data source & fields, visual encoding, readability, consistency with global theme, reproducibility (mapping fields must exist). Return JSON only.`;
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
  const system = language==='zh'? '你是绘图代理。仅返回严格JSON。'
                                : 'You are the drawing agent. Return strict JSON only.';
  const theme = themeStyle ? JSON.stringify(themeStyle).slice(0,1000) : '{}';
  const zhRender = `根据以下逐表规划与主题样式，使用 vega-lite 作为渲染引擎，为每个表生成一个规范化的 Vega-Lite 规格（spec）。
要求：
- 固定返回格式：{"engine":"vega-lite","per_table_specs":[{"table_index":1,"spec":{...}}]}
- 每个 spec 仅定义 mark 与 encoding（x/y 以及可选 color），不要内联 data 数据；字段名统一使用 x / y / hue（如无 hue 则不要配置 color）。
- 根据 chart_type 推荐：bar→mark:"bar"，line→mark:"line"，scatter→mark:"point"，box→mark:"boxplot"，violin→mark:"area"（密度估计由前端决定），heatmap→mark:"rect" + x/y 坐标。
- 统一样式：在 spec.config 中加入 { background, axis:{labelFont,labelFontSize,grid}, legend:{orient:"top"} }，其中 labelFont/labelFontSize/background/grid 从主题读取：${theme}。
- 不要输出任何解释文本，只输出严格 JSON。`;
  const enRender = `Using vega-lite, return {"engine":"vega-lite","per_table_specs":[{"table_index":1,"spec":{...}}]}. Each spec must define mark and encoding only (x/y and optional color from 'hue'), no inline data. Apply theme in spec.config using font/background/grid from: ${theme}. No extra text.`;
  const user = `${language==='zh' ? zhRender : enRender}

[逐表规划]
${JSON.stringify(plans).slice(0,4000)} `;
  return { system, user };
}

export function makeFlowPlanPrompts(
  summary: string,
  tableSchemas: string[][],
  tableConclusions: string[][],
  language: string,
  preferences?: string
){
  const sysZh = "你是科研可视化编排专家。仅返回严格JSON。";
  const sysEn = "You are a scientific visualization orchestration expert. Return strict JSON only.";
  const system = language === 'zh' ? sysZh : sysEn;
  const schemasText = tableSchemas.map((s,i)=>`表${i+1}: ${s.join(', ')}`).join('\n');
  const conclText = tableConclusions.map((arr,i)=>`表${i+1}: ${arr.join('; ')}`).join('\n');
  const prefBlock = preferences && String(preferences).trim()?`\n\n[用户偏好]\n${String(preferences).trim()}`:"";
  const user =
`${language==='zh'?`请基于输入生成包含三个模块的可视化工作流：\n1. 主题与风格管理（全局配色/字体/字号/背景/网格）\n2. 图表规划器（按表给出chart_type与data_mapping）\n3. 渲染器（给出渲染引擎与步骤）`:
`Generate a visualization workflow with three modules: 1) Theme & style manager, 2) Per-table chart planner, 3) Renderer.`}

[摘要]
${summary}

[表头Schema]
${schemasText}

[逐表结论]
${conclText}${prefBlock}

${language==='zh'?`输出严格JSON对象：\n{\n  "theme_style": {"palette": "", "font_family": "", "font_size": 12, "background": "white", "grid": true},\n  "per_table_plans": [\n    {"table_index": 1, "pitch": "", "chart_type": "bar|line|scatter|box|violin|heatmap|area|radar", "data_mapping": {"x": "", "y": "", "hue": "可选"}, "annotations": [], "rationale": ""}\n  ],\n  "render": {"engine": "apexcharts|echarts|vega-lite", "steps": ["..."]}\n}\n仅输出JSON，无多余文本。`:
`Return a strict JSON object with keys: theme_style, per_table_plans, render. No extra text.`}`;
  return { system, user };
}

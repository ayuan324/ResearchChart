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
  const user = `${language==='zh'?`给定表头schema与该表的结论，为该表生成1套图表方案。`:
`Given the table schema and conclusions, return exactly 1 chart plan for this table.`}

[表头Schema]
${schema.join(', ')}

[该表结论]
${(conclusions||[]).join('; ')}${prefBlock}

${language==='zh'?`仅输出：{"pitch":"...","chart_type":"bar|line|scatter|box|violin|heatmap|area|radar","data_mapping":{"x":"列名","y":"列名","hue":"可选列名"}}`:
`Return JSON: {"pitch":"","chart_type":"bar|line|scatter|box|violin|heatmap|area|radar","data_mapping":{"x":"","y":"","hue":"optional"}}`} `;
  return { system, user };
}

export function makeRendererPrompts(
  plans: any[],
  language: string
){
  const system = language==='zh'? '你是渲染器代理。仅返回严格JSON。'
                                : 'You are a rendering agent. Return strict JSON only.';
  const user = `${language==='zh'?`为以下规划选择渲染引擎并给出通用步骤，默认使用 apexcharts。`:
`For the following plans choose rendering engine and steps, default to apexcharts.`}

[规划]
${JSON.stringify(plans).slice(0,4000)}

${language==='zh'?`仅输出：{"engine":"apexcharts","steps":["准备数据映射","构造options","渲染图表"]}`:
`Return JSON: {"engine":"apexcharts","steps":["prepare mapping","build options","render chart"]}`} `;
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

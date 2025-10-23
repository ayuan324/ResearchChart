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
  const zhRender = `根据以下逐表规划与主题样式，使用 ECharts 作为渲染引擎，为每个表生成一个标准 ECharts 配置（option）。

【关键要求】
1. 返回格式必须是：{"engine":"echarts","per_table_specs":[{"table_index":1,"spec":{...}},{"table_index":2,"spec":{...}}]}
2. 每个 spec 的结构：
   {
     "title": {"text": "可选"},
     "tooltip": {"trigger": "axis"},
     "legend": {"show": true},
     "xAxis": {"type": "category", "data": [...]},
     "yAxis": {"type": "value"},
     "series": [ { "type": "bar" | "line" | "scatter" | "heatmap" | "boxplot" | "pie", "data": [...] } ]
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

  const enRender = `Generate ECharts options for each table plan.

【Required Format】
{"engine":"echarts","per_table_specs":[{"table_index":1,"spec":{...}},{"table_index":2,"spec":{...}}]}

【Spec Structure】
{
  "title": {"text": "optional"},
  "tooltip": {"trigger": "axis"},
  "legend": {"show": true},
  "xAxis": {"type": "category", "data": [...]},
  "yAxis": {"type": "value"},
  "series": [ { "type": "bar" | "line" | "scatter" | "heatmap" | "boxplot" | "pie", "data": [...] } ]
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
 * 备用策略：直接生成包含数据的完整 ECharts 选项
 * 适用于数据映射复杂或需要更精确控制的场景
 * 注意：每次调用只处理一个表格
 */
/**
 * 表格类型Agent Prompt
 * 分析表格数据，推荐最适合的图表类型
 */
export function makeChartTypePrompts(
  tableData: { headers: string[]; rows: string[][]; conclusions: string[] },
  language: string = 'zh'
): string {
  const zhPrompt = `你是专业的数据可视化顾问。请深入分析以下表格数据，**自由发挥**推荐最合适的图表类型和可视化策略。

【表格数据】
列名: ${tableData.headers.join(', ')}
数据行数: ${tableData.rows.length}
前5行数据:
${tableData.rows.slice(0, 5).map((r, i) => `  行${i + 1}: ${r.join(' | ')}`).join('\n')}

【结论】
${tableData.conclusions.length > 0 ? tableData.conclusions.join('；') : '无结论'}

【输出格式】
严格返回JSON对象，格式如下：
{
  "recommended_type": "图表类型（可以是任何ECharts支持的类型，如bar, line, scatter, pie, radar, heatmap, boxplot, candlestick, gauge, funnel, sankey, graph, tree, treemap, sunburst等）",
  "is_composite": false,
  "composite_config": {
    "primary_type": "主图表类型",
    "secondary_type": "辅助图表类型",
    "combination_reason": "为什么需要组合图表"
  },
  "alternative_types": ["备选类型1", "备选类型2"],
  "reasoning": "详细的推荐理由：分析数据特征、目标受众、信息传达效果等",
  "visualization_strategy": {
    "focus": "可视化的重点（对比/趋势/分布/关系/占比等）",
    "complexity": "simple|medium|complex",
    "recommended_features": ["建议启用的特性，如：多坐标轴、缩放、图例滚动、数据标签等"]
  },
  "data_insights": {
    "has_categories": true,
    "has_numerical_values": true,
    "has_time_series": false,
    "has_multi_dimensions": false,
    "has_hierarchical_structure": false,
    "has_relationships": false,
    "data_density": "low|medium|high"
  }
}

【重要提示】
1. **自由发挥**：不要局限于常见图表类型，根据数据特征选择最合适的可视化方式
2. **复合图表**：如果数据包含多个维度或需要同时展示不同类型的信息，大胆推荐复合图表（如柱状图+折线图组合）
3. **创新思维**：对于复杂数据，考虑使用高级图表类型（如桑基图、树图、热力图、箱线图等）
4. **实用主义**：优先考虑信息传达效果，而非图表的复杂度
5. **数据驱动**：仔细分析数据的维度、类型、密度、关系，让数据本身指导图表选择
6. 禁止使用 Markdown 代码块（\`\`\`json 或 \`\`\`）
7. 输出必须是纯 JSON，以 { 开头，以 } 结尾

【示例场景】
- 时间序列 + 多指标对比 → 复合图表（line + bar）
- 多维度分类数据 → radar（雷达图）或 heatmap（热力图）
- 流程/转化数据 → sankey（桑基图）或 funnel（漏斗图）
- 层级结构数据 → treemap（矩形树图）或 sunburst（旭日图）
- 分布分析 → boxplot（箱线图）或 violin（小提琴图）`;

  const enPrompt = `You are a professional data visualization consultant. Deeply analyze the table data below and **freely recommend** the most suitable chart type and visualization strategy.

【Table Data】
Columns: ${tableData.headers.join(', ')}
Row Count: ${tableData.rows.length}
First 5 rows:
${tableData.rows.slice(0, 5).map((r, i) => `  Row${i + 1}: ${r.join(' | ')}`).join('\n')}

【Conclusions】
${tableData.conclusions.length > 0 ? tableData.conclusions.join('; ') : 'No conclusions'}

【Output Format】
Strictly return JSON object:
{
  "recommended_type": "Any ECharts chart type (bar, line, scatter, pie, radar, heatmap, boxplot, candlestick, gauge, funnel, sankey, graph, tree, treemap, sunburst, etc.)",
  "is_composite": false,
  "composite_config": {
    "primary_type": "Primary chart type",
    "secondary_type": "Secondary chart type",
    "combination_reason": "Why combination is needed"
  },
  "alternative_types": ["Alternative 1", "Alternative 2"],
  "reasoning": "Detailed reasoning: analyze data characteristics, target audience, information delivery effectiveness",
  "visualization_strategy": {
    "focus": "Visualization focus (comparison/trend/distribution/relationship/proportion)",
    "complexity": "simple|medium|complex",
    "recommended_features": ["Features to enable: multi-axis, zoom, legend scroll, data labels, etc."]
  },
  "data_insights": {
    "has_categories": true,
    "has_numerical_values": true,
    "has_time_series": false,
    "has_multi_dimensions": false,
    "has_hierarchical_structure": false,
    "has_relationships": false,
    "data_density": "low|medium|high"
  }
}

【Key Points】
1. **Be Creative**: Don't limit to common chart types, choose based on data characteristics
2. **Composite Charts**: For multi-dimensional data, boldly recommend composite charts (e.g., bar+line)
3. **Innovation**: For complex data, consider advanced chart types (sankey, treemap, heatmap, boxplot, etc.)
4. **Practicality**: Prioritize information delivery over chart complexity
5. **Data-Driven**: Analyze dimensions, types, density, relationships - let data guide the choice
6. No markdown code blocks (\`\`\`json or \`\`\`)
7. Output must be pure JSON starting with { and ending with }

【Example Scenarios】
- Time series + multi-metric comparison → Composite (line + bar)
- Multi-dimensional categorical data → Radar or heatmap
- Process/conversion data → Sankey or funnel
- Hierarchical data → Treemap or sunburst
- Distribution analysis → Boxplot or violin`;

  return language === 'zh' ? zhPrompt : enPrompt;
}

export function makeDirectEchartsPrompts(
  tableData: { headers: string[]; rows: string[][]; conclusions: string[] }[],
  language: string,
  themeStyle?: any,
  tableIndex?: number,
  styleConstraints?: any,
  chartTypeRecommendation?: any
){
  const theme = themeStyle ? JSON.stringify(themeStyle).slice(0,800) : '{}';

  const actualTableIndex = tableIndex || 1;

  // 构建风格约束说明
  const styleInfo = styleConstraints ? `

【风格约束】
用户偏好风格: ${styleConstraints.style || 'professional'}
${styleConstraints.chart_types && styleConstraints.chart_types.length > 0 ? `允许的图表类型: ${styleConstraints.chart_types.join(', ')}` : ''}
${styleConstraints.color_scheme ? `配色方案: ${JSON.stringify(styleConstraints.color_scheme)}` : ''}
${styleConstraints.font_preferences ? `字体偏好: ${JSON.stringify(styleConstraints.font_preferences)}` : ''}
${styleConstraints.layout_preferences ? `布局偏好: ${JSON.stringify(styleConstraints.layout_preferences)}` : ''}
` : '';

  // 构建类型建议说明
  const typeInfo = chartTypeRecommendation ? `

【图表类型建议】
推荐类型: ${chartTypeRecommendation.recommended_type}
推荐理由: ${chartTypeRecommendation.reasoning}
备选类型: ${chartTypeRecommendation.alternative_types?.join(', ') || '无'}
${styleConstraints?.chart_types && styleConstraints.chart_types.length > 0 ? '**注意**: 用户指定了图表类型约束，请优先使用用户指定的类型，如果冲突则选择两者都满足的类型。' : ''}
` : '';

  const zhPrompt = `你是专业的数据可视化专家，擅长使用 ECharts 创建科研图表。请为以下表格生成一个完整的 ECharts 选项（包含数据）。
${styleInfo}${typeInfo}
【严格输出格式】
{
  "engine": "echarts",
  "per_table_specs": [
    {
      "table_index": ${actualTableIndex},
      "title": "图表标题（基于结论生成）",
      "spec": {
        "tooltip": {"trigger": "axis"},
        "legend": {"show": true},
        "xAxis": {"type": "category", "data": ["列名1的值1","列名1的值2"]},
        "yAxis": {"type": "value"},
        "series": [
          { "type": "${chartTypeRecommendation?.recommended_type || 'bar'}", "name": "分类A", "data": [123, 456] }
        ]
      }
    }
  ]
}

【关键要求】
1. series[].data 必须包含完整数值数据，来自表格全部数据行；x 维度请使用 xAxis.data 或在 series.data 中给出类目-数值结构
2. **重要**: series[].data 必须是数值数组，不能是字符串数组。如果某列是文本描述而非数值，请不要将其作为数据使用
3. 若存在分组/类别，请使用多个系列并通过 legend 区分
4. 标题应基于结论生成，放在外层 title 字段
5. 高度固定为 300，宽度自适应
6. table_index 必须设置为 ${actualTableIndex}
7. 应用主题样式：${theme}
${styleInfo ? '8. **严格遵守用户的风格约束和配色方案**' : '8. 使用默认风格'}
9. ${typeInfo ? '**使用推荐的图表类型**' + (chartTypeRecommendation?.recommended_type || 'bar') : '使用合适的图表类型'}
10. 禁止使用 Markdown 代码块（\`\`\`json 或 \`\`\`）
11. 输出必须是纯 JSON，以 { 开头，以 } 结尾
12. 确保JSON格式完全正确，能够被JSON.parse()解析

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

  const enPrompt = `You are a professional data visualization expert specializing in ECharts for scientific charts. Generate a complete ECharts option (with data) for the table below.

【Strict Output Format】
{
  "engine": "echarts",
  "per_table_specs": [
    {
      "table_index": ${actualTableIndex},
      "title": "Chart Title (based on conclusions)",
      "spec": {
        "tooltip": {"trigger": "axis"},
        "legend": {"show": true},
        "xAxis": {"type": "category", "data": ["value1","value2"]},
        "yAxis": {"type": "value"},
        "series": [
          { "type": "bar", "name": "categoryA", "data": [123, 456] }
        ]
      }
    }
  ]
}

【Critical Requirements】
1. series[].data must include complete data from all rows; use xAxis.data for categories or provide category-value pairs in series.data
2. If there are groups/categories, use multiple series and distinguish via legend
3. Title based on conclusions, put in outer title field
4. Height must be 300, width responsive
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


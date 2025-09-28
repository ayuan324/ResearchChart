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


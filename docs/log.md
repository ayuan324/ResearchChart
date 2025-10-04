2025-10-04T16:32:36.430Z [info] [flow] 使用直接策略：逐个表格调用 openai/gpt-5 生成完整 Vega-Lite 规格
2025-10-04T16:32:36.430Z [info] [flow][theme] prompt:
 你是主题与风格管理代理。请基于论文摘要与用户偏好，给出全局主题与风格设置。

[摘要]
D2AToD框架通过解耦上下文建模和动态提示调制，显著提升了任务型对话系统的性能。
D2AToD在MultiWOZ 2.2和SGD数据集上均实现了最先进的性能，且仅更新了11.1%的参数。
动态提示适应比静态提示学习更具优势，能有效提高对话效果。
解耦对话信号对于鲁棒的决策制定至关重要，能提升模型性能。
D2AToD在错误恢复率方面显著优于基线模型，平均提升22.6%，展现了强大的鲁棒性。
反馈嵌入对错误恢复和自适应策略生成至关重要，其缺失会导致最大的性能下降。
行动嵌入通过整合先前的系统行动，为模型带来了显著的性能提升。
将所有解耦输入合并为单一表示会降低性能，验证了解耦上下文编码的重要性。

仅输出形如：{"palette":"professional|nature|mono|warm|cool","font_family":"","font_size":12,"background":"white","grid":true}
必须是严格 JSON 对象；不要使用 Markdown 代码块（例如三反引号）或反引号；不要添加任何解释性文字；输出必须以 { 开头、以 } 结尾。
2025-10-04T16:32:45.421Z [info] [flow][theme] raw:
 {"palette":"professional","font_family":"Noto Sans SC","font_size":12,"background":"white","grid":true}
2025-10-04T16:32:45.421Z [info] [flow][theme] parsed: {
  palette: 'professional',
  font_family: 'Noto Sans SC',
  font_size: 12,
  background: 'white',
  grid: true
}
2025-10-04T16:32:45.421Z [info] [flow][direct][table_1] 开始生成，数据行数: 6
2025-10-04T16:32:45.421Z [info] [flow][direct][table_1] prompt:
 你是专业的数据可视化专家，擅长使用 Vega-Lite 创建科研图表。请为以下表格生成一个完整的 Vega-Lite 图表规格（包含数据）。

【严格输出格式】
{
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 1,
      "title": "图表标题（基于结论生成）",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "data": {
          "values": [
            {"列名1": "值1", "列名2": 123, "列名3": "分类A"},
            {"列名1": "值2", "列名2": 456, "列名3": "分类B"}
          ]
        },
        "mark": {"type": "bar", "tooltip": true},
        "encoding": {
          "x": {"field": "列名1", "type": "nominal", "axis": {"labelAngle": -45, "title": "X轴标题"}},
          "y": {"field": "列名2", "type": "quantitative", "axis": {"title": "Y轴标题"}},
          "color": {"field": "列名3", "type": "nominal", "legend": {"title": "图例标题"}}
        }
      }
    }
  ]
}

【关键要求】
1. 必须包含完整的 data.values 数组，包含表格的所有数据行
2. 使用表格的实际列名（不要改变列名）
3. 为图表添加有意义的标题（基于结论）
4. 启用 tooltip: true 以便交互
5. width 必须设置为 "container"，height 设置为 300
6. table_index 必须设置为 1
7. 应用主题样式：{"palette":"professional","font_family":"Noto Sans SC","font_size":12,"background":"white","grid":true}
8. 禁止使用 Markdown 代码块（```json 或 ```）
9. 输出必须是纯 JSON，以 { 开头，以 } 结尾

【表格数据】

表格索引: 1
列名: Disentangled Context Encoder, Dialogue Meta-Network, Model Architecture
数据行数: 6
完整数据:
  行1: Prompt-Modulation | Two-Layer MLP | Dynamic Frozen LLM Executor
  行2: User Utterance | Dialogue History | Context Two-Layer MLP
  行3: Previous Action | Prompt | Frozen LLM
  行4: Action Feedback | Learnable Embedding | Training Strategy
  行5: Turn-Level Data Preprocessing | Optimizer | Early Stopping
  行6: AdamW, batch 32 |  | 11.1% trainable params, …

结论: D2AToD框架由三个主要模块组成：解耦上下文编码器、对话元网络和冻结LLM执行器。；解耦上下文编码器处理多种输入信号，包括用户话语、对话历史、先前系统动作和动作反馈，其中用户话语和对话历史通过预训练的Sentence-BERT编码，而其他输入通过可学习向量嵌入。；对话元网络使用一个轻量级的两层MLP将编码的上下文映射为调制向量，并通过FiLM机制动态调整基础提示。；训练策略采用参数高效的微调范式，仅更新元网络、基础提示向量、反馈嵌入和FiLM参数，使可训练参数比例仅为总参数的11.1%。；模型训练使用AdamW优化器，批处理大小为32（有效批处理大小为64），并采用基于验证损失的早期停止策略。


请严格按照上述格式生成图表规格。
2025-10-04T16:32:45.423Z [info] [flow][direct][table_2] 开始生成，数据行数: 4
2025-10-04T16:32:45.423Z [info] [flow][direct][table_2] prompt:
 你是专业的数据可视化专家，擅长使用 Vega-Lite 创建科研图表。请为以下表格生成一个完整的 Vega-Lite 图表规格（包含数据）。

【严格输出格式】
{
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 2,
      "title": "图表标题（基于结论生成）",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "data": {
          "values": [
            {"列名1": "值1", "列名2": 123, "列名3": "分类A"},
            {"列名1": "值2", "列名2": 456, "列名3": "分类B"}
          ]
        },
        "mark": {"type": "bar", "tooltip": true},
        "encoding": {
          "x": {"field": "列名1", "type": "nominal", "axis": {"labelAngle": -45, "title": "X轴标题"}},
          "y": {"field": "列名2", "type": "quantitative", "axis": {"title": "Y轴标题"}},
          "color": {"field": "列名3", "type": "nominal", "legend": {"title": "图例标题"}}
        }
      }
    }
  ]
}

【关键要求】
1. 必须包含完整的 data.values 数组，包含表格的所有数据行
2. 使用表格的实际列名（不要改变列名）
3. 为图表添加有意义的标题（基于结论）
4. 启用 tooltip: true 以便交互
5. width 必须设置为 "container"，height 设置为 300
6. table_index 必须设置为 2
7. 应用主题样式：{"palette":"professional","font_family":"Noto Sans SC","font_size":12,"background":"white","grid":true}
8. 禁止使用 Markdown 代码块（```json 或 ```）
9. 输出必须是纯 JSON，以 { 开头，以 } 结尾

【表格数据】

表格索引: 2
列名: Model, Inform (%), Success (%), Combined, BLEU, Acc. (%)
数据行数: 4
完整数据:
  行1: AutoTOD-Original | 82.3 | 71.5 | 76.5 | 18.2 | 85.4
  行2: CoOp-AutoTOD | 84.1 | 73.8 | 78.7 | 19.1 | 87.2
  行3: D-AutoTOD | 86.2 | 76.4 | 81.0 | 20.3 | 89.1
  行4: D2-AutoTOD | 89.7 | 81.2 | 85.3 | 22.1 | 92.3

结论: D2AToD在所有评估指标上均表现最佳，Combined Score达到85.3%，BLEU为22.1，Acc.为92.3%，显著优于所有基线模型。；与AutoTOD-Original相比，D2AToD的Combined Score提高了8.8%，表明其在任务成功率方面有显著提升。；D2AToD相对于CoOp-AutoTOD的性能提升（Combined Score从78.7%提高到85.3%）证明了动态提示适应优于静态提示学习。；D2AToD在D-AutoTOD基础上的改进（Combined Score从81.0%提高到85.3%）证实了对话信号解耦对于鲁棒决策的重要性。；D2AToD在保持高效率的同时，通过解耦上下文编码和动态提示调制，显著提高了任务型对话系统的有效性和模型效率。


请严格按照上述格式生成图表规格。
2025-10-04T16:32:45.424Z [info] [flow][direct][table_3] 开始生成，数据行数: 4
2025-10-04T16:32:45.424Z [info] [flow][direct][table_3] prompt:
 你是专业的数据可视化专家，擅长使用 Vega-Lite 创建科研图表。请为以下表格生成一个完整的 Vega-Lite 图表规格（包含数据）。

【严格输出格式】
{
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 3,
      "title": "图表标题（基于结论生成）",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "data": {
          "values": [
            {"列名1": "值1", "列名2": 123, "列名3": "分类A"},
            {"列名1": "值2", "列名2": 456, "列名3": "分类B"}
          ]
        },
        "mark": {"type": "bar", "tooltip": true},
        "encoding": {
          "x": {"field": "列名1", "type": "nominal", "axis": {"labelAngle": -45, "title": "X轴标题"}},
          "y": {"field": "列名2", "type": "quantitative", "axis": {"title": "Y轴标题"}},
          "color": {"field": "列名3", "type": "nominal", "legend": {"title": "图例标题"}}
        }
      }
    }
  ]
}

【关键要求】
1. 必须包含完整的 data.values 数组，包含表格的所有数据行
2. 使用表格的实际列名（不要改变列名）
3. 为图表添加有意义的标题（基于结论）
4. 启用 tooltip: true 以便交互
5. width 必须设置为 "container"，height 设置为 300
6. table_index 必须设置为 3
7. 应用主题样式：{"palette":"professional","font_family":"Noto Sans SC","font_size":12,"background":"white","grid":true}
8. 禁止使用 Markdown 代码块（```json 或 ```）
9. 输出必须是纯 JSON，以 { 开头，以 } 结尾

【表格数据】

表格索引: 3
列名: Error Type, AutoTOD, D2-AutoTOD, Gain
数据行数: 4
完整数据:
  行1: Empty Result | 45.2 | 67.8 | +22.6
  行2: Timeout | 38.7 | 61.3 | +22.6
  行3: Booking Failed | 52.1 | 74.5 | +22.4
  行4: Average | 45.3 | 67.9 | +22.6

结论: D2AToD在错误恢复率方面显著优于AutoTOD基线，平均提升了22.6%。；D2AToD在处理“空结果”、“超时”和“预订失败”这三种错误类型时，恢复率均有大幅提升，分别提高了22.6%、22.6%和22.4%。；尽管D2AToD在所有错误类型上都表现出色，但“超时”错误类型的恢复率相对较低（61.3%），表明该领域仍有改进空间，可能需要更复杂的时序推理或多轮纠正对话机制。；这些结果表明，D2AToD通过整合反馈嵌入和动态提示调制，有效增强了错误处理能力和动态适应对话策略的能力。


请严格按照上述格式生成图表规格。
2025-10-04T16:32:45.427Z [info] [flow][direct][table_4] 开始生成，数据行数: 4
2025-10-04T16:32:45.427Z [info] [flow][direct][table_4] prompt:
 你是专业的数据可视化专家，擅长使用 Vega-Lite 创建科研图表。请为以下表格生成一个完整的 Vega-Lite 图表规格（包含数据）。

【严格输出格式】
{
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 4,
      "title": "图表标题（基于结论生成）",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "data": {
          "values": [
            {"列名1": "值1", "列名2": 123, "列名3": "分类A"},
            {"列名1": "值2", "列名2": 456, "列名3": "分类B"}
          ]
        },
        "mark": {"type": "bar", "tooltip": true},
        "encoding": {
          "x": {"field": "列名1", "type": "nominal", "axis": {"labelAngle": -45, "title": "X轴标题"}},
          "y": {"field": "列名2", "type": "quantitative", "axis": {"title": "Y轴标题"}},
          "color": {"field": "列名3", "type": "nominal", "legend": {"title": "图例标题"}}
        }
      }
    }
  ]
}

【关键要求】
1. 必须包含完整的 data.values 数组，包含表格的所有数据行
2. 使用表格的实际列名（不要改变列名）
3. 为图表添加有意义的标题（基于结论）
4. 启用 tooltip: true 以便交互
5. width 必须设置为 "container"，height 设置为 300
6. table_index 必须设置为 4
7. 应用主题样式：{"palette":"professional","font_family":"Noto Sans SC","font_size":12,"background":"white","grid":true}
8. 禁止使用 Markdown 代码块（```json 或 ```）
9. 输出必须是纯 JSON，以 { 开头，以 } 结尾

【表格数据】

表格索引: 4
列名: Configuration, Combined Score, ∆
数据行数: 4
完整数据:
  行1: Full D2-AutoTOD | 85.3 | -
  行2: w/o Feedback Embedding | 79.2 | -6.1
  行3: w/o Action Embedding | 81.7 | -3.6
  行4: w/o Disentangled Inputs | 81.0 | -4.3

结论: 反馈嵌入对D2AToD模型的性能贡献最大，移除它会导致Combined Score下降6.1%，这表明反馈嵌入在错误恢复和自适应策略生成中起着关键作用。；动作嵌入也对模型性能有显著贡献，移除它会导致Combined Score下降3.6%，这强调了整合先前系统动作的重要性。；将所有解耦输入合并为单一表示（即w/o Disentangled Inputs）会导致Combined Score下降4.3%，这验证了解耦上下文编码对于精确状态跟踪的重要性。；消融研究结果证实，D2AToD的每个模块都发挥着互补作用，其中反馈嵌入增强了鲁棒性，解耦表示提高了适应性。


请严格按照上述格式生成图表规格。
2025-10-04T16:33:22.792Z [info] [flow][direct][table_4] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 4,
      "title": "D2-AutoTOD 消融研究：移除反馈嵌入导致最大性能下降（-6.1）",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "data": {
          "values": [
            {"Configuration": "Full D2-AutoTOD", "Combined Score": 85.3, "∆": "-"},
            {"Configuration": "w/o Feedback Embedding", "Combined Score": 79.2, "∆": "-6.1"},
            {"Configuration": "w/o Action Embedding", "Combined Score": 81.7, "∆": "-3.6"},
            {"Configuration": "w/o Disentangled Inputs", "Combined Score": 81.0, "∆": "-4.3"}
          ]
        },
        "mark": {"type": "bar", "tooltip": true},
        "encoding": {
          "x": {"field": "Configuration", "type": "nominal", "sort": "-y", "axis": {"labelAngle": -45, "title": "配置"}},
          "y": {"field": "Combined Score", "type": "quantitative", "axis": {"title": "Combined Score"}},
          "color": {"field": "Configuration", "type": "nominal", "legend": {"title": "配置"}}
        },
        "config": {
          "background": "white",
          "font": "Noto Sans SC",
          "axis": {
            "labelFont": "Noto Sans SC",
            "titleFont": "Noto Sans SC",
            "labelFontSize": 12,
            "titleFontSize": 12,
            "grid": true
          },
          "legend": {
            "labelFont": "Noto Sans SC",
            "titleFont": "Noto Sans SC",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "title": {
            "font": "Noto Sans SC",
            "fontSize": 12,
            "color": "#333333"
          },
          "range": {
            "category": ["#4e79a7", "#f28e2b", "#59a14f", "#e15759", "#76b7b2", "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ab"]
          },
          "view": {"stroke": null}
        }
      }
    }
  ]
}
2025-10-04T16:33:22.794Z [info] [flow][direct][table_4] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 4,
      "title": "D2-AutoTOD 消融研究：移除反馈嵌入导致最大性能下降（-6.1）",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "data": {
          "values": [
            {
              "Configuration": "Full D2-AutoTOD",
              "Combined Score": 85.3,
              "∆": "-"
            },
            {
              "Configuration": "w/o Feedback Embedding",
              "Combined Score": 79.2,
              "∆": "-6.1"
            },
            {
              "Configuration": "w/o Action Embedding",
              "Combined Score": 81.7,
              "∆": "-3.6"
            },
            {
              "Configuration": "w/o Disentangled Inputs",
              "Combined Score": 81,
              "∆": "-4.3"
            }
          ]
        },
        "mark": {
          "type": "bar",
          "tooltip": true
2025-10-04T16:33:22.794Z [info] [flow][direct][table_4] specs 数组长度: 1
2025-10-04T16:33:22.794Z [info] [flow][direct][table_4] entry: {
  has_entry: true,
  has_spec: true,
  spec_type: 'object',
  spec_keys: [
    '$schema', 'width',
    'height',  'data',
    'mark',    'encoding',
    'config'
  ]
}
2025-10-04T16:33:22.794Z [info] [flow][direct][table_4] ✅ 成功生成图表，table_index: 4
2025-10-04T16:33:28.332Z [info] [flow][direct][table_2] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 2,
      "title": "D2-AutoTOD 全面领先：Combined 85.3%，BLEU 22.1，Acc. 92.3%（较 AutoTOD-Original 的 Combined 提升 8.8%）",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "data": {
          "values": [
            {"Model": "AutoTOD-Original", "Inform (%)": 82.3, "Success (%)": 71.5, "Combined": 76.5, "BLEU": 18.2, "Acc. (%)": 85.4},
            {"Model": "CoOp-AutoTOD", "Inform (%)": 84.1, "Success (%)": 73.8, "Combined": 78.7, "BLEU": 19.1, "Acc. (%)": 87.2},
            {"Model": "D-AutoTOD", "Inform (%)": 86.2, "Success (%)": 76.4, "Combined": 81.0, "BLEU": 20.3, "Acc. (%)": 89.1},
            {"Model": "D2-AutoTOD", "Inform (%)": 89.7, "Success (%)": 81.2, "Combined": 85.3, "BLEU": 22.1, "Acc. (%)": 92.3}
          ]
        },
        "transform": [
          {
            "fold": ["Inform (%)", "Success (%)", "Combined", "BLEU", "Acc. (%)"],
            "as": ["Metric", "Value"]
          }
        ],
        "mark": {"type": "bar", "tooltip": true},
        "encoding": {
          "x": {"field": "Metric", "type": "nominal", "axis": {"labelAngle": -30, "title": "指标"}},
          "y": {"field": "Value", "type": "quantitative", "axis": {"title": "得分"}},
          "color": {"field": "Model", "type": "nominal", "legend": {"title": "Model"}},
          "xOffset": {"field": "Model"}
        },
        "config": {
          "background": "white",
          "font": "Noto Sans SC",
          "axis": {
            "grid": true,
            "labelFont": "Noto Sans SC",
            "titleFont": "Noto Sans SC",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "legend": {
            "labelFont": "Noto Sans SC",
            "titleFont": "Noto Sans SC",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "header": {
            "labelFont": "Noto Sans SC",
            "titleFont": "Noto Sans SC",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "view": {"stroke": "transparent"},
          "range": {
            "category": ["#1f77b4", "#ff7f0e", "#2ca02c", "#9467bd", "#8c564b", "#17becf"]
          }
        }
      }
    }
  ]
}
2025-10-04T16:33:28.332Z [info] [flow][direct][table_2] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 2,
      "title": "D2-AutoTOD 全面领先：Combined 85.3%，BLEU 22.1，Acc. 92.3%（较 AutoTOD-Original 的 Combined 提升 8.8%）",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "data": {
          "values": [
            {
              "Model": "AutoTOD-Original",
              "Inform (%)": 82.3,
              "Success (%)": 71.5,
              "Combined": 76.5,
              "BLEU": 18.2,
              "Acc. (%)": 85.4
            },
            {
              "Model": "CoOp-AutoTOD",
              "Inform (%)": 84.1,
              "Success (%)": 73.8,
              "Combined": 78.7,
              "BLEU": 19.1,
              "Acc. (%)": 87.2
            },
            {
              "Model": "D-AutoTOD",
              "Inform (%)": 86.2,
              "Success (%)": 76.4,
              "Combined": 81,
              "BLEU": 2
2025-10-04T16:33:28.332Z [info] [flow][direct][table_2] specs 数组长度: 1
2025-10-04T16:33:28.332Z [info] [flow][direct][table_2] entry: {
  has_entry: true,
  has_spec: true,
  spec_type: 'object',
  spec_keys: [
    '$schema',   'width',
    'height',    'data',
    'transform', 'mark',
    'encoding',  'config'
  ]
}
2025-10-04T16:33:28.332Z [info] [flow][direct][table_2] ✅ 成功生成图表，table_index: 2
2025-10-04T16:33:56.372Z [info] [flow][direct][table_1] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 1,
      "title": "D2AToD框架模块与训练策略概览：解耦编码、元网络FiLM调制与冻结LLM（11.1%可训练参数）",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "data": {
          "values": [
            {
              "Disentangled Context Encoder": "Prompt-Modulation",
              "Dialogue Meta-Network": "Two-Layer MLP",
              "Model Architecture": "Dynamic Frozen LLM Executor"
            },
            {
              "Disentangled Context Encoder": "User Utterance",
              "Dialogue Meta-Network": "Dialogue History",
              "Model Architecture": "Context Two-Layer MLP"
            },
            {
              "Disentangled Context Encoder": "Previous Action",
              "Dialogue Meta-Network": "Prompt",
              "Model Architecture": "Frozen LLM"
            },
            {
              "Disentangled Context Encoder": "Action Feedback",
              "Dialogue Meta-Network": "Learnable Embedding",
              "Model Architecture": "Training Strategy"
            },
            {
              "Disentangled Context Encoder": "Turn-Level Data Preprocessing",
              "Dialogue Meta-Network": "Optimizer",
              "Model Architecture": "Early Stopping"
            },
            {
              "Disentangled Context Encoder": "AdamW, batch 32",
              "Dialogue Meta-Network": "",
              "Model Architecture": "11.1% trainable params, …"
            }
          ]
        },
        "transform": [
          {
            "window": [{"op": "row_number", "as": "Row"}]
          },
          {
            "fold": ["Disentangled Context Encoder", "Dialogue Meta-Network", "Model Architecture"],
            "as": ["Module", "Item"]
          },
          {
            "filter": "datum.Item != null && datum.Item != ''"
          }
        ],
        "layer": [
          {
            "mark": {"type": "rect", "tooltip": true, "opacity": 0.12},
            "encoding": {
              "x": {
                "field": "Module",
                "type": "nominal",
                "axis": {"labelAngle": 0, "title": "模块", "grid": true}
              },
              "y": {
                "field": "Row",
                "type": "ordinal",
                "sort": "ascending",
                "axis": {"title": "数据行", "grid": true}
              },
              "color": {
                "field": "Module",
                "type": "nominal",
                "legend": {"title": "模块"},
                "scale": {"scheme": "tableau10"}
              }
            }
          },
          {
            "mark": {"type": "text", "tooltip": true, "align": "center", "baseline": "middle", "fontSize": 12},
            "encoding": {
              "x": {"field": "Module", "type": "nominal"},
              "y": {"field": "Row", "type": "ordinal", "sort": "ascending"},
              "text": {"field": "Item"},
              "tooltip": [
                {"field": "Row", "type": "ordinal", "title": "行"},
                {"field": "Module", "type": "nominal", "title": "模块"},
                {"field": "Item", "type": "nominal", "title": "内容"}
              ],
              "color": {"value": "#333333"}
            }
          }
        ],
        "config": {
          "background": "white",
          "axis": {
            "labelFont": "Noto Sans SC",
            "titleFont": "Noto Sans SC",
            "labelFontSize": 12,
            "titleFontSize": 12,
            "grid": true
          },
          "legend": {
            "labelFont": "Noto Sans SC",
            "titleFont": "Noto Sans SC",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "header": {
            "labelFont": "Noto Sans SC",
            "titleFont": "Noto Sans SC",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "title":
2025-10-04T16:33:56.372Z [info] [flow][direct][table_1] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 1,
      "title": "D2AToD框架模块与训练策略概览：解耦编码、元网络FiLM调制与冻结LLM（11.1%可训练参数）",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "data": {
          "values": [
            {
              "Disentangled Context Encoder": "Prompt-Modulation",
              "Dialogue Meta-Network": "Two-Layer MLP",
              "Model Architecture": "Dynamic Frozen LLM Executor"
            },
            {
              "Disentangled Context Encoder": "User Utterance",
              "Dialogue Meta-Network": "Dialogue History",
              "Model Architecture": "Context Two-Layer MLP"
            },
            {
              "Disentangled Context Encoder": "Previous Action",
              "Dialogue Meta-Network": "Prompt",
              "Model Architecture": "Frozen LLM"
            },
            {
              "Disentangled Context
2025-10-04T16:33:56.372Z [info] [flow][direct][table_1] specs 数组长度: 1
2025-10-04T16:33:56.373Z [info] [flow][direct][table_1] entry: {
  has_entry: true,
  has_spec: true,
  spec_type: 'object',
  spec_keys: [
    '$schema',
    'width',
    'height',
    'data',
    'transform',
    'layer',
    'config'
  ]
}
2025-10-04T16:33:56.373Z [info] [flow][direct][table_1] ✅ 成功生成图表，table_index: 1
2025-10-04T16:34:16.447Z [info] [flow][direct][table_3] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 3,
      "title": "D2-AutoTOD 在错误恢复率上显著优于 AutoTOD（平均+22.6%，超时仍偏低）",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "data": {
          "values": [
            {"Error Type": "Empty Result", "AutoTOD": 45.2, "D2-AutoTOD": 67.8, "Gain": "+22.6"},
            {"Error Type": "Timeout", "AutoTOD": 38.7, "D2-AutoTOD": 61.3, "Gain": "+22.6"},
            {"Error Type": "Booking Failed", "AutoTOD": 52.1, "D2-AutoTOD": 74.5, "Gain": "+22.4"},
            {"Error Type": "Average", "AutoTOD": 45.3, "D2-AutoTOD": 67.9, "Gain": "+22.6"}
          ]
        },
        "encoding": {
          "x": {
            "field": "Error Type",
            "type": "nominal",
            "sort": ["Empty Result", "Timeout", "Booking Failed", "Average"],
            "axis": {"labelAngle": -45, "title": "错误类型", "grid": true}
          }
        },
        "layer": [
          {
            "transform": [
              {"fold": ["AutoTOD", "D2-AutoTOD"], "as": ["模型", "恢复率"]}
            ],
            "mark": {"type": "bar", "tooltip": true},
            "encoding": {
              "y": {
                "field": "恢复率",
                "type": "quantitative",
                "scale": {"domain": [0, 100]},
                "axis": {"title": "恢复率（%）", "grid": true}
              },
              "color": {"field": "模型", "type": "nominal", "legend": {"title": "模型"}},
              "xOffset": {"field": "模型"}
            }
          },
          {
            "transform": [
              {"calculate": "toNumber(replace(datum['Gain'], '+', ''))", "as": "增益数值"}
            ],
            "mark": {"type": "line", "point": true, "tooltip": true, "color": "#9A3412"},
            "encoding": {
              "y": {
                "field": "增益数值",
                "type": "quantitative",
                "scale": {"domain": [0, 30]},
                "axis": {"title": "增益（百分点）", "orient": "right", "grid": false}
              }
            }
          }
        ],
        "resolve": {"scale": {"y": "independent"}},
        "config": {
          "background": "white",
          "font": "Noto Sans SC",
          "axis": {
            "labelFont": "Noto Sans SC",
            "titleFont": "Noto Sans SC",
            "labelFontSize": 12,
            "titleFontSize": 12,
            "grid": true
          },
          "legend": {
            "labelFont": "Noto Sans SC",
            "titleFont": "Noto Sans SC",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "view": {"stroke": null},
          "range": {"category": ["#1f77b4", "#ff7f0e"]}
        }
      }
    }
  ]
}
2025-10-04T16:34:16.447Z [info] [flow][direct][table_3] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 3,
      "title": "D2-AutoTOD 在错误恢复率上显著优于 AutoTOD（平均+22.6%，超时仍偏低）",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "data": {
          "values": [
            {
              "Error Type": "Empty Result",
              "AutoTOD": 45.2,
              "D2-AutoTOD": 67.8,
              "Gain": "+22.6"
            },
            {
              "Error Type": "Timeout",
              "AutoTOD": 38.7,
              "D2-AutoTOD": 61.3,
              "Gain": "+22.6"
            },
            {
              "Error Type": "Booking Failed",
              "AutoTOD": 52.1,
              "D2-AutoTOD": 74.5,
              "Gain": "+22.4"
            },
            {
              "Error Type": "Average",
              "AutoTOD": 45.3,
              "D2-AutoTOD": 67.9,
              "Gain": "+22.6"
            }
          ]
2025-10-04T16:34:16.447Z [info] [flow][direct][table_3] specs 数组长度: 1
2025-10-04T16:34:16.447Z [info] [flow][direct][table_3] entry: {
  has_entry: true,
  has_spec: true,
  spec_type: 'object',
  spec_keys: [
    '$schema',  'width',
    'height',   'data',
    'encoding', 'layer',
    'resolve',  'config'
  ]
}
2025-10-04T16:34:16.447Z [info] [flow][direct][table_3] ✅ 成功生成图表，table_index: 3
2025-10-04T16:34:16.447Z [info] [flow] 直接策略成功，生成了 4/4 个图表
2025-10-04T16:34:16.448Z [info] [flow] 响应大小: 7656 字节 (7.48 KB)
2025-10-04T16:34:16.448Z [info] [flow] 总耗时: 100019ms (100.02s)
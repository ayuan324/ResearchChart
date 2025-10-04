2025-10-04T15:19:56.840Z [info] [flow] 使用直接策略：逐个表格调用 openai/gpt-5 生成完整 Vega-Lite 规格
2025-10-04T15:19:56.840Z [info] [flow][theme] prompt:
 你是主题与风格管理代理。请基于论文摘要与用户偏好，给出全局主题与风格设置。

[摘要]
D2AToD框架通过解耦上下文建模和动态提示调制，显著提升了任务导向对话系统的性能。
D2AToD在MultiWOZ 2.2和SGD数据集上取得了最先进的性能，同时仅更新了11.1%的参数。
动态提示适应比静态提示学习更具优势，能有效提高对话效果。
解耦对话信号对于鲁棒的决策至关重要，能提升模型性能。
D2AToD在错误恢复率方面显著优于基线模型，平均提升22.6%，展现了强大的鲁棒性。
反馈嵌入对错误恢复和自适应策略生成至关重要，其缺失会导致最大的性能下降。
行动嵌入通过整合先前的系统行动，为模型带来了显著的性能提升。
将所有解耦输入合并为单一表示会降低性能，证明了解耦上下文编码的重要性。

仅输出形如：{"palette":"professional|nature|mono|warm|cool","font_family":"","font_size":12,"background":"white","grid":true}
必须是严格 JSON 对象；不要使用 Markdown 代码块（例如三反引号）或反引号；不要添加任何解释性文字；输出必须以 { 开头、以 } 结尾。
2025-10-04T15:20:07.526Z [info] [flow][theme] raw:
 {"palette":"professional","font_family":"Roboto","font_size":12,"background":"white","grid":true}
2025-10-04T15:20:07.527Z [info] [flow][theme] parsed: {
  palette: 'professional',
  font_family: 'Roboto',
  font_size: 12,
  background: 'white',
  grid: true
}
2025-10-04T15:20:07.527Z [info] [flow][direct][table_1] 开始生成，数据行数: 6
2025-10-04T15:20:07.527Z [info] [flow][direct][table_1] prompt:
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
7. 应用主题样式：{"palette":"professional","font_family":"Roboto","font_size":12,"background":"white","grid":true}
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

结论: D2AToD框架由三个主要模块组成：解耦上下文编码器、对话元网络和动态冻结LLM执行器。；解耦上下文编码器处理多种输入信号，包括用户话语、对话历史、前一个动作和动作反馈，以提供全面的对话上下文。；对话元网络使用两层MLP将编码的上下文映射到调制向量，并通过提示调制（Prompt-Modulation）机制动态调整冻结LLM的行为。；D2AToD采用参数高效的训练策略，仅更新约11.1%的参数，以降低计算成本并保持泛化能力。；训练过程中使用AdamW优化器，批量大小为32，并采用早停法防止过拟合。


请严格按照上述格式生成图表规格。
2025-10-04T15:20:07.528Z [info] [flow][direct][table_2] 开始生成，数据行数: 4
2025-10-04T15:20:07.529Z [info] [flow][direct][table_2] prompt:
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
7. 应用主题样式：{"palette":"professional","font_family":"Roboto","font_size":12,"background":"white","grid":true}
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

结论: D2-AutoTOD在所有评估指标上均表现最佳，Combined Score达到85.3%，BLEU为22.1，Acc.为92.3%，显著优于所有基线模型。；与AutoTOD-Original相比，D2-AutoTOD的Combined Score提高了8.8%，表明其在任务成功率方面有显著提升。；D2-AutoTOD在Inform、Success、Combined Score、BLEU和Acc.等所有指标上均超越了CoOp-AutoTOD和D-AutoTOD，验证了动态提示适应和解耦对话信号的重要性。；CoOp-AutoTOD通过学习静态提示向量，在性能上优于AutoTOD-Original，但仍不及D2-AutoTOD的动态适应能力。；D-AutoTOD在解耦对话信号方面有所改进，但其性能仍低于D2-AutoTOD，这表明D2AToD的完整框架（包括动态提示调制）是实现最佳性能的关键。


请严格按照上述格式生成图表规格。
2025-10-04T15:20:07.530Z [info] [flow][direct][table_3] 开始生成，数据行数: 4
2025-10-04T15:20:07.530Z [info] [flow][direct][table_3] prompt:
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
7. 应用主题样式：{"palette":"professional","font_family":"Roboto","font_size":12,"background":"white","grid":true}
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

结论: D2-AutoTOD在错误恢复率方面显著优于AutoTOD基线模型，平均恢复率提高了22.6%。；D2-AutoTOD在处理“Empty Result”错误类型时，恢复率从45.2%提升至67.8%，增幅为22.6%。；对于“Timeout”错误类型，D2-AutoTOD的恢复率从38.7%提高到61.3%，同样提升了22.6%。；在“Booking Failed”错误类型上，D2-AutoTOD的恢复率从52.1%提升至74.5%，增幅为22.4%。；尽管D2-AutoTOD在所有错误类型上都表现出显著改进，但“Timeout”的恢复率相对较低，表明该领域仍有进一步改进的空间。


请严格按照上述格式生成图表规格。
2025-10-04T15:20:07.532Z [info] [flow][direct][table_4] 开始生成，数据行数: 4
2025-10-04T15:20:07.532Z [info] [flow][direct][table_4] prompt:
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
7. 应用主题样式：{"palette":"professional","font_family":"Roboto","font_size":12,"background":"white","grid":true}
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

结论: 反馈嵌入（Feedback Embedding）对D2-AutoTOD模型的性能贡献最大，移除后Combined Score下降了6.1%，表明其在错误恢复和自适应策略生成中至关重要。；动作嵌入（Action Embedding）也提供了显著的性能增益，移除后Combined Score下降了3.6%，这强调了整合先前系统动作的重要性。；将所有解耦输入合并为单一表示（w/o Disentangled Inputs）导致Combined Score下降4.3%，验证了解耦上下文编码对于精确状态跟踪的必要性。；该消融研究证实了D2-AutoTOD中每个模块的互补作用，其中反馈嵌入驱动鲁棒性，解耦表示增强适应性。；Full D2-AutoTOD模型在所有配置中表现最佳，Combined Score为85.3，证明了其完整设计的有效性。


请严格按照上述格式生成图表规格。
2025-10-04T15:20:40.765Z [info] [flow][direct][table_4] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 4,
      "title": "反馈嵌入移除导致最大性能下降：D2-AutoTOD 各配置的 Combined Score 对比",
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
          "x": {
            "field": "Configuration",
            "type": "nominal",
            "axis": {"labelAngle": -45, "title": "Configuration"},
            "sort": ["Full D2-AutoTOD", "w/o Action Embedding", "w/o Disentangled Inputs", "w/o Feedback Embedding"]
          },
          "y": {
            "field": "Combined Score",
            "type": "quantitative",
            "axis": {"title": "Combined Score"}
          },
          "color": {
            "field": "Configuration",
            "type": "nominal",
            "legend": {"title": "Configuration"}
          }
        },
        "config": {
          "background": "white",
          "axis": {
            "grid": true,
            "labelFont": "Roboto",
            "titleFont": "Roboto",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "legend": {
            "labelFont": "Roboto",
            "titleFont": "Roboto",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "title": {
            "font": "Roboto",
            "fontSize": 12
          },
          "range": {
            "category": ["#4C78A8", "#F58518", "#54A24B", "#E45756", "#72B7B2", "#EECA3B", "#B279A2", "#9D755D", "#BAB0AC"]
          }
        }
      }
    }
  ]
}
2025-10-04T15:20:40.765Z [info] [flow][direct][table_4] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 4,
      "title": "反馈嵌入移除导致最大性能下降：D2-AutoTOD 各配置的 Combined Score 对比",
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
          "tooltip": t
2025-10-04T15:20:40.765Z [info] [flow][direct][table_4] specs 数组长度: 1
2025-10-04T15:20:40.766Z [info] [flow][direct][table_4] entry: {
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
2025-10-04T15:20:40.766Z [info] [flow][direct][table_4] ✅ 成功生成图表，table_index: 4
2025-10-04T15:20:41.769Z [info] [flow][direct][table_3] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 3,
      "title": "D2-AutoTOD在错误恢复率上全面优于基线，平均提升22.6%",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "background": "white",
        "data": {
          "values": [
            {"Error Type": "Empty Result", "AutoTOD": 45.2, "D2-AutoTOD": 67.8, "Gain": "+22.6"},
            {"Error Type": "Timeout", "AutoTOD": 38.7, "D2-AutoTOD": 61.3, "Gain": "+22.6"},
            {"Error Type": "Booking Failed", "AutoTOD": 52.1, "D2-AutoTOD": 74.5, "Gain": "+22.4"},
            {"Error Type": "Average", "AutoTOD": 45.3, "D2-AutoTOD": 67.9, "Gain": "+22.6"}
          ]
        },
        "transform": [
          {"fold": ["AutoTOD", "D2-AutoTOD"], "as": ["Model", "Recovery Rate"]}
        ],
        "mark": {"type": "bar", "tooltip": true},
        "encoding": {
          "x": {"field": "Error Type", "type": "nominal", "axis": {"labelAngle": -45, "title": "错误类型"}},
          "xOffset": {"field": "Model"},
          "y": {"field": "Recovery Rate", "type": "quantitative", "axis": {"title": "恢复率（%）"}, "stack": null},
          "color": {"field": "Model", "type": "nominal", "legend": {"title": "模型"}},
          "tooltip": [
            {"field": "Error Type", "type": "nominal", "title": "错误类型"},
            {"field": "Model", "type": "nominal", "title": "模型"},
            {"field": "Recovery Rate", "type": "quantitative", "title": "恢复率（%）", "format": ".1f"},
            {"field": "Gain", "type": "nominal", "title": "增幅（D2-AutoTOD vs AutoTOD）"}
          ]
        },
        "config": {
          "view": {"stroke": null},
          "axis": {"grid": true, "labelFont": "Roboto", "titleFont": "Roboto", "labelFontSize": 12, "titleFontSize": 12},
          "legend": {"labelFont": "Roboto", "titleFont": "Roboto", "labelFontSize": 12, "titleFontSize": 12, "orient": "right"},
          "header": {"labelFont": "Roboto", "titleFont": "Roboto"},
          "font": "Roboto",
          "style": {"guide-label": {"font": "Roboto"}, "guide-title": {"font": "Roboto"}},
          "range": {
            "category": {"scheme": "tableau10"}
          }
        }
      }
    }
  ]
}
2025-10-04T15:20:41.769Z [info] [flow][direct][table_3] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 3,
      "title": "D2-AutoTOD在错误恢复率上全面优于基线，平均提升22.6%",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "background": "white",
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
2025-10-04T15:20:41.769Z [info] [flow][direct][table_3] specs 数组长度: 1
2025-10-04T15:20:41.770Z [info] [flow][direct][table_3] entry: {
  has_entry: true,
  has_spec: true,
  spec_type: 'object',
  spec_keys: [
    '$schema', 'width',
    'height',  'background',
    'data',    'transform',
    'mark',    'encoding',
    'config'
  ]
}
2025-10-04T15:20:41.770Z [info] [flow][direct][table_3] ✅ 成功生成图表，table_index: 3
2025-10-04T15:20:44.205Z [info] [flow][direct][table_2] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 2,
      "title": "D2-AutoTOD在所有评估指标上领先：Combined 85.3%、BLEU 22.1、Acc. 92.3",
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
            "as": ["Metric", "Score"]
          }
        ],
        "mark": {"type": "bar", "tooltip": true},
        "encoding": {
          "x": {
            "field": "Model",
            "type": "nominal",
            "sort": ["AutoTOD-Original", "CoOp-AutoTOD", "D-AutoTOD", "D2-AutoTOD"],
            "axis": {"labelAngle": -30, "title": "模型"}
          },
          "y": {
            "field": "Score",
            "type": "quantitative",
            "axis": {"title": "指标数值"},
            "scale": {"zero": true}
          },
          "color": {
            "field": "Metric",
            "type": "nominal",
            "legend": {"title": "评估指标"},
            "scale": {"scheme": "tableau10"}
          },
          "xOffset": {"field": "Metric"}
        },
        "config": {
          "background": "white",
          "axis": {
            "grid": true,
            "labelFont": "Roboto",
            "titleFont": "Roboto",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "legend": {
            "labelFont": "Roboto",
            "titleFont": "Roboto",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "header": {
            "labelFont": "Roboto",
            "titleFont": "Roboto",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "title": {
            "font": "Roboto",
            "fontSize": 14,
            "color": "#333333"
          },
          "view": {"stroke": "transparent"},
          "range": {
            "category": ["#1f77b4", "#2ca02c", "#ff7f0e", "#9467bd", "#17becf"]
          }
        }
      }
    }
  ]
}
2025-10-04T15:20:44.205Z [info] [flow][direct][table_2] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 2,
      "title": "D2-AutoTOD在所有评估指标上领先：Combined 85.3%、BLEU 22.1、Acc. 92.3",
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
              "BLEU": 20.3,
              "Acc. (%)": 89.1
2025-10-04T15:20:44.205Z [info] [flow][direct][table_2] specs 数组长度: 1
2025-10-04T15:20:44.206Z [info] [flow][direct][table_2] entry: {
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
2025-10-04T15:20:44.206Z [info] [flow][direct][table_2] ✅ 成功生成图表，table_index: 2
2025-10-04T15:21:31.630Z [info] [flow][direct][table_1] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 1,
      "title": "D2AToD三大模块与训练策略概览（参数高效：约11.1%可训练）",
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": 300,
        "data": {
          "values": [
            {"Disentangled Context Encoder": "Prompt-Modulation", "Dialogue Meta-Network": "Two-Layer MLP", "Model Architecture": "Dynamic Frozen LLM Executor"},
            {"Disentangled Context Encoder": "User Utterance", "Dialogue Meta-Network": "Dialogue History", "Model Architecture": "Context Two-Layer MLP"},
            {"Disentangled Context Encoder": "Previous Action", "Dialogue Meta-Network": "Prompt", "Model Architecture": "Frozen LLM"},
            {"Disentangled Context Encoder": "Action Feedback", "Dialogue Meta-Network": "Learnable Embedding", "Model Architecture": "Training Strategy"},
            {"Disentangled Context Encoder": "Turn-Level Data Preprocessing", "Dialogue Meta-Network": "Optimizer", "Model Architecture": "Early Stopping"},
            {"Disentangled Context Encoder": "AdamW, batch 32", "Dialogue Meta-Network": "", "Model Architecture": "11.1% trainable params, …"}
          ]
        },
        "transform": [
          {"window": [{"op": "row_number", "as": "Row"}]},
          {
            "fold": [
              "Disentangled Context Encoder",
              "Dialogue Meta-Network",
              "Model Architecture"
            ],
            "as": ["Module", "Component"]
          }
        ],
        "mark": {"type": "point", "tooltip": true, "filled": true, "size": 110},
        "encoding": {
          "x": {
            "field": "Module",
            "type": "nominal",
            "axis": {"labelAngle": -35, "title": "模块"},
            "sort": [
              "Disentangled Context Encoder",
              "Dialogue Meta-Network",
              "Model Architecture"
            ]
          },
          "y": {
            "field": "Row",
            "type": "ordinal",
            "axis": {"title": "对话流程步骤"}
          },
          "color": {
            "field": "Module",
            "type": "nominal",
            "legend": {"title": "模块"},
            "scale": {"scheme": "tableau10"}
          },
          "tooltip": [
            {"field": "Module", "type": "nominal", "title": "模块"},
            {"field": "Component", "type": "nominal", "title": "组件/策略"},
            {"field": "Row", "type": "ordinal", "title": "步骤"}
          ]
        },
        "config": {
          "background": "white",
          "axis": {
            "labelFont": "Roboto",
            "titleFont": "Roboto",
            "labelFontSize": 12,
            "titleFontSize": 12,
            "grid": true,
            "tickColor": "#D9D9D9",
            "domainColor": "#D9D9D9"
          },
          "legend": {
            "labelFont": "Roboto",
            "titleFont": "Roboto",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "header": {
            "labelFont": "Roboto",
            "titleFont": "Roboto",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "mark": {
            "font": "Roboto"
          },
          "view": {
            "stroke": null
          }
        }
      }
    }
  ]
}
2025-10-04T15:21:31.630Z [info] [flow][direct][table_1] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 1,
      "title": "D2AToD三大模块与训练策略概览（参数高效：约11.1%可训练）",
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
              "Disentangled Context Encoder": "Action
2025-10-04T15:21:31.630Z [info] [flow][direct][table_1] specs 数组长度: 1
2025-10-04T15:21:31.631Z [info] [flow][direct][table_1] entry: {
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
2025-10-04T15:21:31.631Z [info] [flow][direct][table_1] ✅ 成功生成图表，table_index: 1
2025-10-04T15:21:31.631Z [info] [flow] 直接策略成功，生成了 4/4 个图表
2025-10-04T15:21:31.631Z [info] [flow] 响应大小: 7345 字节 (7.17 KB)
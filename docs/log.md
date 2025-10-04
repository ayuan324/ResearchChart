2025-10-04T11:12:07.431Z [info] [flow] 使用直接策略：逐个表格调用 openai/gpt-5 生成完整 Vega-Lite 规格
2025-10-04T11:12:07.434Z [info] [flow][theme] prompt:
 你是主题与风格管理代理。请基于论文摘要与用户偏好，给出全局主题与风格设置。

[摘要]
D2AToD框架通过解耦上下文建模和动态提示调制，显著提升了任务导向对话系统的性能。
D2AToD在MultiWOZ 2.2和SGD数据集上均实现了最先进的性能，且仅更新了11.1%的参数。
动态提示适应（dynamic prompt adaptation）优于静态提示学习（static prompt learning），对提升对话效果至关重要。
解耦对话信号（disentangling dialogue signals）对于鲁棒的决策制定至关重要。
D2AToD在错误恢复率方面显著优于基线模型，平均提升22.6%，展现了其强大的鲁棒性。
反馈嵌入（feedback embedding）对错误恢复和自适应策略生成具有关键作用，其缺失会导致最大的性能下降。
解耦上下文编码（disentangled context encoding）和动态提示适应（dynamic prompt adaptation）是互补的，共同提升了模型的适应性和鲁棒性。
尽管D2AToD在错误恢复方面表现出色，但对超时错误的恢复仍有提升空间。

仅输出形如：{"palette":"professional|nature|mono|warm|cool","font_family":"","font_size":12,"background":"white","grid":true}
必须是严格 JSON 对象；不要使用 Markdown 代码块（例如三反引号）或反引号；不要添加任何解释性文字；输出必须以 { 开头、以 } 结尾。
2025-10-04T11:12:07.987Z [info] [flow][theme] raw:
 {"palette":"cool","font_family":"Arial","font_size":12,"background":"white","grid":true}
2025-10-04T11:12:07.993Z [info] [flow][theme] parsed: {
  palette: 'cool',
  font_family: 'Arial',
  font_size: 12,
  background: 'white',
  grid: true
}
2025-10-04T11:12:07.993Z [info] [flow][direct][table_1] 开始生成，数据行数: 6
2025-10-04T11:12:07.993Z [info] [flow][direct][table_1] prompt:
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
7. 应用主题样式：{"palette":"cool","font_family":"Arial","font_size":12,"background":"white","grid":true}
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

结论: D2AToD框架由三个主要模块组成：解耦上下文编码器、对话元网络和冻结LLM执行器。；解耦上下文编码器处理多种输入信号，包括用户话语、对话历史、先前系统动作和动作反馈。；对话元网络使用两层MLP将编码的上下文映射到调制向量，并通过FiLM技术动态调整提示。；D2AToD采用参数高效的训练策略，仅更新约11.1%的参数，以降低计算成本并保持泛化能力。；训练过程中使用AdamW优化器，批量大小为32，并采用早停机制防止过拟合。


请严格按照上述格式生成图表规格。
2025-10-04T11:12:07.993Z [info] [flow][direct][table_2] 开始生成，数据行数: 4
2025-10-04T11:12:07.993Z [info] [flow][direct][table_2] prompt:
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
7. 应用主题样式：{"palette":"cool","font_family":"Arial","font_size":12,"background":"white","grid":true}
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

结论: D2-AutoTOD在所有评估指标上均表现最佳，Combined Score达到85.3%，BLEU为22.1，Acc.为92.3%。；与AutoTOD-Original相比，D2-AutoTOD的Combined Score提高了8.8%，表明其在任务成功率上的显著优势。；D2-AutoTOD在对话质量（BLEU）和任务执行准确性（Acc.）方面也优于所有基线模型。；动态提示适应（D2-AutoTOD）优于静态提示学习（CoOp-AutoTOD），Combined Score提高了6.6%。；解耦对话信号（D2-AutoTOD相对于D-AutoTOD）对鲁棒决策至关重要，Combined Score提高了4.3%。


请严格按照上述格式生成图表规格。
2025-10-04T11:12:07.993Z [info] [flow][direct][table_3] 开始生成，数据行数: 4
2025-10-04T11:12:07.993Z [info] [flow][direct][table_3] prompt:
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
7. 应用主题样式：{"palette":"cool","font_family":"Arial","font_size":12,"background":"white","grid":true}
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

结论: D2-AutoTOD在错误恢复率方面显著优于AutoTOD基线模型，平均提升了22.6%。；D2-AutoTOD在处理“Empty Result”错误时，恢复率从45.2%提高到67.8%，提升了22.6%。；在“Timeout”错误类型中，D2-AutoTOD的恢复率从38.7%提高到61.3%，提升了22.6%。；对于“Booking Failed”错误，D2-AutoTOD的恢复率从52.1%提高到74.5%，提升了22.4%。；尽管D2-AutoTOD在所有错误类型上都有显著提升，但“Timeout”的恢复率相对较低，表明该领域仍有改进空间。


请严格按照上述格式生成图表规格。
2025-10-04T11:12:07.998Z [info] [flow][direct][table_4] 开始生成，数据行数: 4
2025-10-04T11:12:07.998Z [info] [flow][direct][table_4] prompt:
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
7. 应用主题样式：{"palette":"cool","font_family":"Arial","font_size":12,"background":"white","grid":true}
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

结论: 移除反馈嵌入对模型性能影响最大，导致Combined Score下降6.1%，表明其在错误恢复和自适应策略生成中的关键作用。；移除动作嵌入导致Combined Score下降3.6%，说明先前系统动作的整合对模型性能有显著贡献。；将所有解耦输入合并为单一表示（w/o Disentangled Inputs）导致Combined Score下降4.3%，验证了解耦上下文编码对于精确状态跟踪的重要性。；消融研究证实了D2-AutoTOD中每个模块的互补作用，其中反馈嵌入增强了鲁棒性，解耦表示提高了适应性。；全D2-AutoTOD模型在MultiWOZ 2.2数据集上取得了85.3的Combined Score，是所有配置中表现最好的。


请严格按照上述格式生成图表规格。
2025-10-04T11:12:40.853Z [info] [flow][direct][table_4] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 4,
      "title": "D2-AutoTOD消融：移除反馈嵌入影响最大（-6.1），全模型最佳（85.3）",
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
            "sort": {"field": "Combined Score", "order": "descending"}
          },
          "y": {
            "field": "Combined Score",
            "type": "quantitative",
            "axis": {"title": "Combined Score"}
          },
          "color": {
            "field": "Configuration",
            "type": "nominal",
            "legend": {"title": "Configuration"},
            "scale": {"scheme": "tealblues"}
          },
          "tooltip": [
            {"field": "Configuration", "type": "nominal", "title": "Configuration"},
            {"field": "Combined Score", "type": "quantitative", "title": "Combined Score"},
            {"field": "∆", "type": "nominal", "title": "∆"}
          ]
        },
        "config": {
          "background": "white",
          "axis": {
            "grid": true,
            "labelFont": "Arial",
            "titleFont": "Arial",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "legend": {
            "labelFont": "Arial",
            "titleFont": "Arial",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "title": {
            "font": "Arial",
            "fontSize": 12
          },
          "view": {"stroke": null}
        }
      }
    }
  ]
}
2025-10-04T11:12:40.853Z [info] [flow][direct][table_4] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 4,
      "title": "D2-AutoTOD消融：移除反馈嵌入影响最大（-6.1），全模型最佳（85.3）",
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
2025-10-04T11:12:40.853Z [info] [flow][direct][table_4] specs 数组长度: 1
2025-10-04T11:12:40.853Z [info] [flow][direct][table_4] entry: {
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
2025-10-04T11:12:40.853Z [info] [flow][direct][table_4] ✅ 成功生成图表，table_index: 4
2025-10-04T11:12:48.559Z [info] [flow][direct][table_2] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 2,
      "title": "D2-AutoTOD全方位领先：Combined提升8.8%，BLEU与Acc.最高",
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
        "hconcat": [
          {
            "mark": {"type": "bar", "tooltip": true},
            "encoding": {
              "x": {"field": "Model", "type": "nominal", "axis": {"labelAngle": -45, "title": "Model"}},
              "y": {"field": "Combined", "type": "quantitative", "axis": {"title": "Combined (%)"}},
              "color": {"field": "Model", "type": "nominal", "legend": {"title": "Model"}, "scale": {"scheme": "cool"}}
            }
          },
          {
            "mark": {"type": "bar", "tooltip": true},
            "encoding": {
              "x": {"field": "Model", "type": "nominal", "axis": {"labelAngle": -45, "title": "Model"}},
              "y": {"field": "BLEU", "type": "quantitative", "axis": {"title": "BLEU"}},
              "color": {"field": "Model", "type": "nominal", "legend": {"title": "Model"}, "scale": {"scheme": "cool"}}
            }
          },
          {
            "mark": {"type": "bar", "tooltip": true},
            "encoding": {
              "x": {"field": "Model", "type": "nominal", "axis": {"labelAngle": -45, "title": "Model"}},
              "y": {"field": "Acc. (%)", "type": "quantitative", "axis": {"title": "Acc. (%)"}},
              "color": {"field": "Model", "type": "nominal", "legend": {"title": "Model"}, "scale": {"scheme": "cool"}}
            }
          }
        ],
        "config": {
          "background": "white",
          "title": {"font": "Arial", "fontSize": 12},
          "axis": {
            "grid": true,
            "labelFont": "Arial",
            "labelFontSize": 12,
            "titleFont": "Arial",
            "titleFontSize": 12
          },
          "legend": {
            "labelFont": "Arial",
            "labelFontSize": 12,
            "titleFont": "Arial",
            "titleFontSize": 12
          },
          "view": {"stroke": "transparent"}
        }
      }
    }
  ]
}
2025-10-04T11:12:48.559Z [info] [flow][direct][table_2] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 2,
      "title": "D2-AutoTOD全方位领先：Combined提升8.8%，BLEU与Acc.最高",
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
2025-10-04T11:12:48.559Z [info] [flow][direct][table_2] specs 数组长度: 1
2025-10-04T11:12:48.559Z [info] [flow][direct][table_2] entry: {
  has_entry: true,
  has_spec: true,
  spec_type: 'object',
  spec_keys: [ '$schema', 'width', 'height', 'data', 'hconcat', 'config' ]
}
2025-10-04T11:12:48.559Z [info] [flow][direct][table_2] ✅ 成功生成图表，table_index: 2
2025-10-04T11:13:07.265Z [info] [flow][direct][table_3] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 3,
      "title": "D2-AutoTOD在错误恢复率方面显著优于AutoTOD，平均提升22.6%",
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
        "transform": [
          {"fold": ["AutoTOD", "D2-AutoTOD"], "as": ["模型", "恢复率"]}
        ],
        "mark": {"type": "bar", "tooltip": true},
        "encoding": {
          "x": {
            "field": "Error Type",
            "type": "nominal",
            "sort": ["Empty Result", "Timeout", "Booking Failed", "Average"],
            "axis": {"labelAngle": -45, "title": "错误类型"}
          },
          "xOffset": {"field": "模型"},
          "y": {
            "field": "恢复率",
            "type": "quantitative",
            "scale": {"domain": [0, 100]},
            "axis": {"title": "恢复率 (%)"}
          },
          "color": {
            "field": "模型",
            "type": "nominal",
            "legend": {"title": "模型"},
            "scale": {"scheme": "cool"}
          }
        },
        "config": {
          "background": "white",
          "axis": {
            "grid": true,
            "labelFont": "Arial",
            "titleFont": "Arial",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "legend": {
            "labelFont": "Arial",
            "titleFont": "Arial",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "header": {
            "labelFont": "Arial",
            "titleFont": "Arial",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "title": {
            "font": "Arial",
            "fontSize": 12
          }
        }
      }
    }
  ]
}
2025-10-04T11:13:07.265Z [info] [flow][direct][table_3] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 3,
      "title": "D2-AutoTOD在错误恢复率方面显著优于AutoTOD，平均提升22.6%",
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
2025-10-04T11:13:07.265Z [info] [flow][direct][table_3] specs 数组长度: 1
2025-10-04T11:13:07.265Z [info] [flow][direct][table_3] entry: {
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
2025-10-04T11:13:07.265Z [info] [flow][direct][table_3] ✅ 成功生成图表，table_index: 3
2025-10-04T11:13:23.779Z [info] [flow][direct][table_1] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 1,
      "title": "D2AToD三大模块与训练策略概览（解耦上下文编码、FiLM调制、冻结LLM；参数更新≈11.1%、AdamW批32、早停）",
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
            "fold": [
              "Disentangled Context Encoder",
              "Dialogue Meta-Network",
              "Model Architecture"
            ]
          },
          {
            "filter": "isValid(datum.value) && datum.value !== ''"
          }
        ],
        "mark": {
          "type": "point",
          "tooltip": true,
          "filled": true,
          "size": 90
        },
        "encoding": {
          "x": {
            "field": "key",
            "type": "nominal",
            "axis": {
              "labelAngle": -45,
              "title": "模块"
            },
            "scale": {
              "domain": [
                "Disentangled Context Encoder",
                "Dialogue Meta-Network",
                "Model Architecture"
              ]
            }
          },
          "y": {
            "field": "value",
            "type": "nominal",
            "axis": {
              "title": "组件"
            }
          },
          "color": {
            "field": "key",
            "type": "nominal",
            "legend": {
              "title": "模块"
            },
            "scale": {
              "scheme": "cool"
            }
          },
          "tooltip": [
            {
              "field": "key",
              "type": "nominal",
              "title": "模块"
            },
            {
              "field": "value",
              "type": "nominal",
              "title": "组件"
            }
          ]
        },
        "title": "D2AToD三大模块与训练策略概览（解耦上下文编码、FiLM调制、冻结LLM；参数更新≈11.1%、AdamW批32、早停）",
        "config": {
          "background": "white",
          "axis": {
            "grid": true,
            "labelFont": "Arial",
            "titleFont": "Arial",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "legend": {
            "labelFont": "Arial",
            "titleFont": "Arial",
            "labelFontSize": 12,
            "titleFontSize": 12
          },
          "title": {
            "font": "Arial",
            "fontSize": 12
          }
        }
      }
    }
  ]
}
2025-10-04T11:13:23.779Z [info] [flow][direct][table_1] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 1,
      "title": "D2AToD三大模块与训练策略概览（解耦上下文编码、FiLM调制、冻结LLM；参数更新≈11.1%、AdamW批32、早停）",
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
              "Disentang
2025-10-04T11:13:23.779Z [info] [flow][direct][table_1] specs 数组长度: 1
2025-10-04T11:13:23.780Z [info] [flow][direct][table_1] entry: {
  has_entry: true,
  has_spec: true,
  spec_type: 'object',
  spec_keys: [
    '$schema',   'width',
    'height',    'data',
    'transform', 'mark',
    'encoding',  'title',
    'config'
  ]
}
2025-10-04T11:13:23.780Z [info] [flow][direct][table_1] ✅ 成功生成图表，table_index: 1
2025-10-04T11:13:23.780Z [info] [flow] 直接策略成功，生成了 4/4 个图表
2025-10-04T11:13:23.780Z [info] [flow] 响应大小: 7218 字节
2025-10-04T14:39:44.521Z [info] [flow] 使用直接策略：逐个表格调用 openai/gpt-5 生成完整 Vega-Lite 规格
2025-10-04T14:39:44.521Z [info] [flow][theme] prompt:
 你是主题与风格管理代理。请基于论文摘要与用户偏好，给出全局主题与风格设置。

[摘要]
D2AToD框架通过解耦上下文建模和动态提示调制，显著提升了任务型对话系统的性能。
D2AToD在MultiWOZ 2.2和SGD数据集上均实现了最先进的性能，且仅更新了11.1%的参数。
动态提示适应（D2AToD）优于静态提示学习（CoOp-AutoTOD），在综合得分上表现更佳。
解耦对话信号对于鲁棒的决策至关重要，D2AToD在这方面优于D-AutoTOD。
D2AToD在错误恢复率方面显著优于基线模型，平均提升了22.6%，显示出其强大的鲁棒性。
反馈嵌入对错误恢复和自适应策略生成至关重要，其缺失会导致最大的性能下降。
解耦上下文编码（特别是行动嵌入和反馈嵌入）对提升模型适应性和精确状态跟踪具有互补作用。
D2AToD通过结合解耦上下文编码器、对话元网络和基于FiLM的动态提示生成器，实现了自适应对话生成。

仅输出形如：{"palette":"professional|nature|mono|warm|cool","font_family":"","font_size":12,"background":"white","grid":true}
必须是严格 JSON 对象；不要使用 Markdown 代码块（例如三反引号）或反引号；不要添加任何解释性文字；输出必须以 { 开头、以 } 结尾。
2025-10-04T14:39:44.943Z [info] [flow][theme] raw:
 {"palette":"cool","font_family":"Arial","font_size":12,"background":"white","grid":true}
2025-10-04T14:39:44.943Z [info] [flow][theme] parsed: {
  palette: 'cool',
  font_family: 'Arial',
  font_size: 12,
  background: 'white',
  grid: true
}
2025-10-04T14:39:44.943Z [info] [flow][direct] 处理批次 1：表格 1-2
2025-10-04T14:39:44.943Z [info] [flow][direct][table_1] 开始生成，数据行数: 6
2025-10-04T14:39:44.943Z [info] [flow][direct][table_1] prompt:
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

结论: D2AToD框架由三个主要模块组成：解耦上下文编码器、对话元网络和冻结LLM执行器。；解耦上下文编码器处理多种输入信号，包括用户话语、对话历史、先前系统动作和动作反馈，其中用户话语和对话历史通过预训练的Sentence-BERT编码，而其他输入通过可学习向量嵌入。；对话元网络使用一个轻量级的两层MLP将编码的上下文映射为调制向量，并通过FiLM机制动态调整基础提示。；训练策略采用参数高效的微调范式，仅更新元网络、基础提示向量、反馈嵌入和FiLM参数，使可训练参数比例仅为总参数的11.1%。；模型训练使用AdamW优化器，批处理大小为32，并采用早停机制防止过拟合。


请严格按照上述格式生成图表规格。
2025-10-04T14:39:44.944Z [info] [flow][direct][table_2] 开始生成，数据行数: 4
2025-10-04T14:39:44.945Z [info] [flow][direct][table_2] prompt:
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

结论: D2-AutoTOD在所有评估指标上均表现最佳，Combined Score达到85.3%，BLEU为22.1，Acc.为92.3%，显著优于所有基线模型。；与AutoTOD-Original相比，D2-AutoTOD的Combined Score提高了8.8%，表明其在任务成功率方面有显著提升。；D2-AutoTOD相对于CoOp-AutoTOD的性能提升（Combined Score从78.7%到85.3%）突出了动态提示适应优于静态提示学习的优势。；D2-AutoTOD在D-AutoTOD基础上的改进（Combined Score从81.0%到85.3%）证实了解耦对话信号对于鲁棒决策的重要性。；所有模型中，D2-AutoTOD在Inform、Success、Combined、BLEU和Acc.等所有指标上均达到最高分，表明其在对话效果和模型效率方面的综合优势。


请严格按照上述格式生成图表规格。
2025-10-04T14:40:27.425Z [info] [flow][direct][table_2] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 2,
      "title": "D2-AutoTOD在所有指标上领先：Combined 85.3%、BLEU 22.1、Acc. 92.3（相较基线显著提升）",
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
          "x": {
            "field": "Metric",
            "type": "nominal",
            "sort": ["Inform (%)", "Success (%)", "Combined", "BLEU", "Acc. (%)"],
            "axis": {"labelAngle": -30, "title": "评估指标"}
          },
          "y": {
            "field": "Value",
            "type": "quantitative",
            "axis": {"title": "分数"}
          },
          "color": {
            "field": "Model",
            "type": "nominal",
            "legend": {"title": "Model"},
            "scale": {
              "range": ["#2c7fb8", "#41b6c4", "#7fcdbb", "#c7e9b4"]
            }
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
          "title": {
            "font": "Arial",
            "fontSize": 12
          }
        }
      }
    }
  ]
}
2025-10-04T14:40:27.425Z [info] [flow][direct][table_2] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 2,
      "title": "D2-AutoTOD在所有指标上领先：Combined 85.3%、BLEU 22.1、Acc. 92.3（相较基线显著提升）",
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
              "Acc. (%
2025-10-04T14:40:27.425Z [info] [flow][direct][table_2] specs 数组长度: 1
2025-10-04T14:40:27.425Z [info] [flow][direct][table_2] entry: {
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
2025-10-04T14:40:27.425Z [info] [flow][direct][table_2] ✅ 成功生成图表，table_index: 2
2025-10-04T14:40:38.489Z [info] [flow][direct][table_1] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 1,
      "title": "D2AToD框架三大模块与训练策略概览（参数可训练占比11.1%，AdamW+早停）",
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
          {"window": [{"op": "row_number", "as": "row"}]},
          {"fold": ["Disentangled Context Encoder", "Dialogue Meta-Network", "Model Architecture"], "as": ["模块", "内容"]},
          {"calculate": "datum['内容'] && datum['内容'].trim()!=='' ? datum['内容'] : '(空)'", "as": "内容显示"}
        ],
        "mark": {"type": "text", "tooltip": true, "baseline": "middle"},
        "encoding": {
          "x": {
            "field": "模块",
            "type": "nominal",
            "sort": ["Disentangled Context Encoder", "Dialogue Meta-Network", "Model Architecture"],
            "axis": {"labelAngle": 0, "title": "模块"}
          },
          "y": {
            "field": "row",
            "type": "ordinal",
            "sort": "ascending",
            "axis": {"title": "行"}
          },
          "text": {"field": "内容显示", "type": "nominal"},
          "color": {
            "field": "模块",
            "type": "nominal",
            "legend": {"title": "模块"},
            "scale": {"scheme": "cool"}
          },
          "tooltip": [
            {"field": "row", "type": "ordinal", "title": "行"},
            {"field": "模块", "type": "nominal"},
            {"field": "内容", "type": "nominal", "title": "内容"}
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
          "title": {"font": "Arial", "fontSize": 12},
          "view": {"stroke": null}
        }
      }
    }
  ]
}
2025-10-04T14:40:38.489Z [info] [flow][direct][table_1] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 1,
      "title": "D2AToD框架三大模块与训练策略概览（参数可训练占比11.1%，AdamW+早停）",
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
              "Disentangled Context Encoder"
2025-10-04T14:40:38.489Z [info] [flow][direct][table_1] specs 数组长度: 1
2025-10-04T14:40:38.489Z [info] [flow][direct][table_1] entry: {
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
2025-10-04T14:40:38.489Z [info] [flow][direct][table_1] ✅ 成功生成图表，table_index: 1
2025-10-04T14:40:38.489Z [info] [flow][direct] 处理批次 2：表格 3-4
2025-10-04T14:40:38.489Z [info] [flow][direct][table_3] 开始生成，数据行数: 4
2025-10-04T14:40:38.489Z [info] [flow][direct][table_3] prompt:
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

结论: D2-AutoTOD在错误恢复率方面显著优于AutoTOD基线模型，平均恢复率提高了22.6%。；D2-AutoTOD在处理“Empty Result”错误类型时，恢复率从45.2%提升至67.8%，增幅为22.6%。；在“Timeout”错误类型上，D2-AutoTOD的恢复率从38.7%提高到61.3%，同样提升了22.6%。；对于“Booking Failed”错误，D2-AutoTOD的恢复率从52.1%提升至74.5%，增幅为22.4%。；尽管D2-AutoTOD在所有错误类型上都表现出显著改进，但“Timeout”的恢复率相对较低，表明该领域仍有改进空间，可能需要更复杂的时序推理或多轮纠错对话机制。


请严格按照上述格式生成图表规格。
2025-10-04T14:40:38.492Z [info] [flow][direct][table_4] 开始生成，数据行数: 4
2025-10-04T14:40:38.492Z [info] [flow][direct][table_4] prompt:
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

结论: 反馈嵌入对D2-AutoTOD模型的性能贡献最大，移除后Combined Score下降了6.1%，表明其在错误恢复和自适应策略生成中的关键作用。；动作嵌入也提供了显著的性能增益，移除后Combined Score下降了3.6%，这表明整合先前的系统动作对于模型性能至关重要。；将所有解耦输入合并为单一表示（即移除解耦输入）导致Combined Score下降4.3%，这验证了解耦上下文编码对于精确状态跟踪的重要性。；消融研究结果证实了D2-AutoTOD中每个模块的互补作用，其中反馈嵌入增强了鲁棒性，解耦表示提高了适应性。；未来的研究可以探索自适应加权机制，以动态平衡这些组件，从而进一步提升模型性能。


请严格按照上述格式生成图表规格。
2025-10-04T14:41:16.943Z [info] [flow][direct][table_4] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 4,
      "title": "反馈嵌入移除导致最大性能下降：D2-AutoTOD 消融对 Combined Score 的影响",
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
        "transform": [
          {
            "calculate": "datum['∆'] === '-' ? 0 : toNumber(datum['∆'])",
            "as": "Delta"
          }
        ],
        "mark": {"type": "bar", "tooltip": true},
        "encoding": {
          "x": {"field": "Configuration", "type": "nominal", "axis": {"labelAngle": -45, "title": "Configuration"}},
          "y": {"field": "Combined Score", "type": "quantitative", "axis": {"title": "Combined Score"}},
          "color": {
            "field": "Delta",
            "type": "quantitative",
            "scale": {"scheme": "cool"},
            "legend": {"title": "∆ (变化, %)"}
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
          "title": {"font": "Arial", "fontSize": 12},
          "view": {"stroke": null}
        }
      }
    }
  ]
}
2025-10-04T14:41:16.943Z [info] [flow][direct][table_4] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 4,
      "title": "反馈嵌入移除导致最大性能下降：D2-AutoTOD 消融对 Combined Score 的影响",
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
        "transform": [
          {
            "calculate": "datu
2025-10-04T14:41:16.943Z [info] [flow][direct][table_4] specs 数组长度: 1
2025-10-04T14:41:16.944Z [info] [flow][direct][table_4] entry: {
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
2025-10-04T14:41:16.944Z [info] [flow][direct][table_4] ✅ 成功生成图表，table_index: 4
2025-10-04T14:41:33.970Z [info] [flow][direct][table_3] raw:
 {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 3,
      "title": "D2-AutoTOD在错误恢复率上全面优于基线（平均+22.6%），Timeout仍相对较低",
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
          {
            "fold": ["AutoTOD", "D2-AutoTOD"],
            "as": ["Model", "Recovery Rate"]
          }
        ],
        "layer": [
          {
            "mark": {"type": "bar", "tooltip": true},
            "encoding": {
              "x": {"field": "Error Type", "type": "nominal", "axis": {"labelAngle": -45, "title": "错误类型"}},
              "xOffset": {"field": "Model"},
              "y": {"field": "Recovery Rate", "type": "quantitative", "axis": {"title": "恢复率 (%)"}, "scale": {"domain": [0, 100]}},
              "color": {
                "field": "Model",
                "type": "nominal",
                "legend": {"title": "模型"},
                "scale": {"scheme": "tealblues"}
              },
              "order": {"field": "Model", "type": "nominal", "sort": ["AutoTOD", "D2-AutoTOD"]}
            }
          },
          {
            "transform": [{"filter": "datum.Model === 'D2-AutoTOD'"}],
            "mark": {"type": "text", "dy": -6, "font": "Arial", "fontSize": 12},
            "encoding": {
              "x": {"field": "Error Type", "type": "nominal"},
              "xOffset": {"field": "Model"},
              "y": {"field": "Recovery Rate", "type": "quantitative"},
              "text": {"field": "Gain"},
              "color": {"value": "#1f4e79"}
            }
          }
        ],
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
          "view": {"stroke": "transparent"}
        }
      }
    }
  ]
}
2025-10-04T14:41:33.970Z [info] [flow][direct][table_3] parsed: {
  "engine": "vega-lite",
  "per_table_specs": [
    {
      "table_index": 3,
      "title": "D2-AutoTOD在错误恢复率上全面优于基线（平均+22.6%），Timeout仍相对较低",
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
2025-10-04T14:41:33.970Z [info] [flow][direct][table_3] specs 数组长度: 1
2025-10-04T14:41:33.970Z [info] [flow][direct][table_3] entry: {
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
2025-10-04T14:41:33.970Z [info] [flow][direct][table_3] ✅ 成功生成图表，table_index: 3
2025-10-04T14:41:33.970Z [info] [flow] 直接策略成功，生成了 4/4 个图表
2025-10-04T14:41:33.971Z [info] [flow] 响应大小: 6997 字节 (6.83 KB)

2025-10-19T06:44:52.530Z [info] [charts][direct][deh8ndoxpu7mgxccwtb] table_4 prompt
2025-10-19T06:44:52.530Z [info] 你是专业的数据可视化专家，擅长使用 Plotly 创建科研图表。请为以下表格生成一个完整的 Plotly 图形对象（包含数据）。

【严格输出格式】
{
  "engine": "plotly",
  "per_table_specs": [
    {
      "table_index": 4,
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
5. table_index 必须设置为 4
6. 应用主题样式：{"palette":"professional","font_family":"Helvetica","font_size":12,"background":"white","grid":true}
7. 禁止使用 Markdown 代码块（``json 或 ``）
8. 输出必须是纯 JSON，以 { 开头，以 } 结尾

【表格数据】

表格索引: 4
列名: Setting, Method, Inform, Success
数据行数: 8
完整数据:
  行1: MultiWOZ | D²-AutoTOD | 74.8 | 49.1
  行2:  | AutoTOD (GPT-4) | 73.9 | 46.8
  行3:  | Static Only | 70.5 | 43.1
  行4: SGD | D²-AutoTOD | 45.2 | 20.7
  行5:  | AutoTOD (GPT-4) | 45.9 | 21.0
  行6:  | Static Only | 41.2 | 16.9
  行7:  | Linearized | 77.2 | 44.6
  行8:  | FiLM | 79.8 | 48.2

结论: 无结论

请严格按照上述格式生成图形对象。
2025-10-19T06:44:54.401Z [info] [charts][direct][deh8ndoxpu7mgxccwtb] table_4 raw
2025-10-19T06:44:54.401Z [info] {
  "engine": "plotly",
  "per_table_specs": [
    {
      "table_index": 4,
      "title": "不同方法在MultiWOZ与SGD设置下的Inform与Success表现",
      "spec": {
        "data": [
          {
            "type": "bar",
            "x": ["D²-AutoTOD", "AutoTOD (GPT-4)", "Static Only", "Linearized", "FiLM"],
            "y": [74.8, 73.9, 70.5, 77.2, 79.8],
            "name": "Inform (MultiWOZ)"
          },
          {
            "type": "bar",
            "x": ["D²-AutoTOD", "AutoTOD (GPT-4)", "Static Only", "Linearized", "FiLM"],
            "y": [49.1, 46.8, 43.1, 44.6, 48.2],
            "name": "Success (MultiWOZ)"
          },
          {
            "type": "bar",
            "x": ["D²-AutoTOD", "AutoTOD (GPT-4)", "Static Only"],
            "y": [45.2, 45.9, 41.2],
            "name": "Inform (SGD)"
          },
          {
            "type": "bar",
            "x": ["D²-AutoTOD", "AutoTOD (GPT-4)", "Static Only"],
            "y": [20.7, 21.0, 16.9],
            "name": "Success (SGD)"
          }
        ],
        "layout": {
          "height": 300,
          "paper_bgcolor": "white",
          "plot_bgcolor": "white",
          "legend": {
            "orientation": "h"
          },
          "font": {
            "family": "Helvetica",
            "size": 12
          },
          "title": "不同方法在MultiWOZ与SGD设置下的Inform与Success表现",
          "barmode": "group"
        }
      }
    }
  ]
}

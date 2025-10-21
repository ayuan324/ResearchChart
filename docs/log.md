
2025-10-21T12:57:42.026Z [info] [charts][direct][36nw1m8japsmh0kk23f] table_4 prompt
2025-10-21T12:57:42.026Z [info] 你是专业的数据可视化专家，擅长使用 ECharts 创建科研图表。请为以下表格生成一个完整的 ECharts 选项（包含数据）。

【严格输出格式】
{
  "engine": "echarts",
  "per_table_specs": [
    {
      "table_index": 4,
      "title": "图表标题（基于结论生成）",
      "spec": {
        "tooltip": {"trigger": "axis"},
        "legend": {"show": true},
        "xAxis": {"type": "category", "data": ["列名1的值1","列名1的值2"]},
        "yAxis": {"type": "value"},
        "series": [
          { "type": "bar", "name": "分类A", "data": [123, 456] }
        ]
      }
    }
  ]
}

【关键要求】

1. series[].data 必须包含完整数据，来自表格全部数据行；x 维度请使用 xAxis.data 或在 series.data 中给出类目-数值结构
2. 若存在分组/类别，请使用多个系列并通过 legend 区分
3. 标题应基于结论生成，放在外层 title 字段
4. 高度固定为 300，宽度自适应
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
2025-10-21T12:57:44.959Z [info] [charts][direct][36nw1m8japsmh0kk23f] table_4 raw
2025-10-21T12:57:44.959Z [info] {
  "engine": "echarts",
  "per_table_specs": [
    {
      "table_index": 4,
      "title": "不同方法在MultiWOZ与SGD设置下的Inform与Success表现",
      "spec": {
        "tooltip": {"trigger": "axis"},
        "legend": {"show": true},
        "xAxis": {
          "type": "category",
          "data": [
            "D²-AutoTOD (MultiWOZ)",
            "AutoTOD (GPT-4) (MultiWOZ)",
            "Static Only (MultiWOZ)",
            "D²-AutoTOD (SGD)",
            "AutoTOD (GPT-4) (SGD)",
            "Static Only (SGD)",
            "Linearized (SGD)",
            "FiLM (SGD)"
          ]
        },
        "yAxis": {"type": "value"},
        "series": [
          {
            "type": "bar",
            "name": "Inform",
            "data": [74.8, 73.9, 70.5, 45.2, 45.9, 41.2, 77.2, 79.8]
          },
          {
            "type": "bar",
            "name": "Success",
            "data": [49.1, 46.8, 43.1, 20.7, 21.0, 16.9, 44.6, 48.2]
          }
        ]
      }
    }
  ],
  "theme": {
    "palette": "professional",
    "font_family": "Helvetica",
    "font_size": 12,
    "background": "white",
    "grid": true
  },
  "height": 300,
  "width": "auto"
}

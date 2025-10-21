[迁移提示] 自 2025-10-21 起，已全面迁移到 ECharts。以下旧日志片段可能仍含 Plotly 示例，仅供历史参考。当前实际使用：engine="echarts"，LLM 输出为标准 ECharts option。

【ECharts 示例输出】
{
  "engine": "echarts",
  "per_table_specs": [
    {
      "table_index": 1,
      "title": "示例",
      "spec": {
        "tooltip": {"trigger": "axis"},
        "legend": {"show": true},
        "xAxis": {"type": "category", "data": ["A","B"]},
        "yAxis": {"type": "value"},
        "series": [{"type": "bar", "data": [1,2]}]
      }
    }
  ]
}



2025-10-21T12:43:28.152Z [info] [charts][direct][wx8v71s3eamh0k0v2c] table_9 prompt
2025-10-21T12:43:28.152Z [info] 你是专业的数据可视化专家，擅长使用 Plotly 创建科研图表。请为以下表格生成一个完整的 Plotly 图形对象（包含数据）。

【严格输出格式】
{
  "engine": "plotly",
  "per_table_specs": [
    {
      "table_index": 9,
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
5. table_index 必须设置为 9
6. 应用主题样式：{"palette":"professional","font_family":"Helvetica","font_size":12,"background":"white","grid":true}
7. 禁止使用 Markdown 代码块（``json 或 ``）
8. 输出必须是纯 JSON，以 { 开头，以 } 结尾

【表格数据】

表格索引: 9
列名: Persona Similarity Matrix, 1.0, -0.9, , , ,
数据行数: 6
完整数据:
  行1: 2 |  | -0.8 |  |  |  |
  行2: 20 |  | -0.7 |  |  |  |
  行3:  |  | -0.6 |  |  |  |
  行4: -0.5 | 1 | -0.4 |  |  |  |
  行5:  |  | -0.3 |  |  |  |
  行6: O0 | 100 | 0 | 25 | 50 | 75 | -0.2

结论: 无结论

请严格按照上述格式生成图形对象。
2025-10-21T12:43:30.248Z [info] [charts][direct][wx8v71s3eamh0k0v2c] table_9 raw
2025-10-21T12:43:30.248Z [info] {
  "engine": "plotly",
  "per_table_specs": [
    {
      "table_index": 9,
      "title": "Persona Similarity Matrix 数据分布",
      "spec": {
        "data": [
          {
            "type": "bar",
            "x": ["Persona Similarity Matrix", "1.0", "-0.9", "", "", "", ""],
            "y": [2, null, -0.8, null, null, null, null],
            "name": "行1"
          },
          {
            "type": "bar",
            "x": ["Persona Similarity Matrix", "1.0", "-0.9", "", "", "", ""],
            "y": [20, null, -0.7, null, null, null, null],
            "name": "行2"
          },
          {
            "type": "bar",
            "x": ["Persona Similarity Matrix", "1.0", "-0.9", "", "", "", ""],
            "y": [null, null, -0.6, null, null, null, null],
            "name": "行3"
          },
          {
            "type": "bar",
            "x": ["Persona Similarity Matrix", "1.0", "-0.9", "", "", "", ""],
            "y": [-0.5, 1, -0.4, null, null, null, null],
            "name": "行4"
          },
          {
            "type": "bar",
            "x": ["Persona Similarity Matrix", "1.0", "-0.9", "", "", "", ""],
            "y": [null, null, -0.3, null, null, null, null],
            "name": "行5"
          },
          {
            "type": "bar",
            "x": ["Persona Similarity Matrix", "1.0", "-0.9", "", "", "", ""],
            "y": ["O0", 100, 0, 25, 50, 75, -0.2],
            "name": "行6"
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
          }
        }
      }
    }
  ]
}

# Prompt 流程文档

ResearchChart 系统从用户输入到图表生成的完整 Prompt 流程说明。

---

## 📋 目录

1. [系统架构概览](#系统架构概览)
2. [三阶段 Agent 流程](#三阶段-agent-流程)
3. [所有 Prompt 模板](#所有-prompt-模板)
4. [数据流转过程](#数据流转过程)
5. [API 调用时序](#api-调用时序)

---

## 系统架构概览

```
用户输入（文本 + 图片）
    ↓
[阶段 1] 风格控制 Agent
    ↓
风格约束 JSON
    ↓
[阶段 2] 表格类型 Agent（逐表）
    ↓
图表类型推荐
    ↓
[阶段 3] 绘图 Agent（逐表）
    ↓
ECharts 配置 JSON
    ↓
前端渲染
```

---

## 三阶段 Agent 流程

### 阶段 1: 风格控制 Agent

**位置**: `/api/style-agent/route.ts`

**触发条件**: 用户在 analysis.html 输入文本偏好或上传参考图片

**输入**:
```json
{
  "preferences_text": "使用学术风格，蓝色系配色",
  "reference_image": "data:image/jpeg;base64,..." // 可选
}
```

**使用的模型**:
- 仅文本: `qwen-max` (文本模型)
- 文本+图片: `qwen-vl-plus` (多模态模型)

**Prompt 模板**:
```
你是图表风格分析专家。请分析用户的偏好描述[和参考图片]，提取出结构化的风格约束。

【用户偏好】
${preferences_text || '无特殊偏好'}

【输出格式】
严格返回JSON对象，格式如下：
{
  "style": "academic|simple|colorful|professional",
  "chart_types": ["bar", "line", "scatter"],  // 可选，用户指定的图表类型约束
  "color_scheme": {
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "palette": "cool|warm|neutral"
  },
  "font_preferences": {
    "family": "Arial|Helvetica|serif",
    "size": 12
  },
  "layout_preferences": {
    "grid": true,
    "legend_position": "top|right|bottom|left"
  }[如果有参考图片，添加：,
  "reference_style_analysis": "对参考图片风格的描述"]
}

【要求】
1. 禁止使用 Markdown 代码块（```json 或 ```）
2. 输出必须是纯 JSON，以 { 开头，以 } 结尾
3. 如果用户没有明确指定某项，使用合理的默认值
4. style 字段必须是: academic, simple, colorful, professional 之一
```

**输出示例**:
```json
{
  "style": "academic",
  "chart_types": ["bar", "line"],
  "color_scheme": {
    "primary": "#1e40af",
    "secondary": "#3b82f6",
    "palette": "cool"
  },
  "font_preferences": {
    "family": "Arial",
    "size": 12
  },
  "layout_preferences": {
    "grid": true,
    "legend_position": "top"
  }
}
```

---

### 阶段 2: 表格类型 Agent

**位置**: `/api/charts/[taskId]/route.ts` 中集成

**触发**: 为每个表格独立调用

**输入**: 单个表格的数据
```json
{
  "headers": ["Region", "Wheat", "Corn", "Soybeans"],
  "rows": [
    ["North", "125", "180", "95"],
    ["South", "98", "145", "112"]
  ],
  "conclusions": ["北方小麦产量最高"]
}
```

**Prompt 函数**: `makeChartTypePrompts()` (在 `lib/prompts.ts`)

**Prompt 模板** (中文版):
```
你是图表类型推荐专家。请分析以下表格数据和结论，推荐最适合的图表类型。

【表格数据】
表头: ${headers.join(', ')}
数据行数: ${rows.length}
结论: ${conclusions.join('; ')}

【候选图表类型】
- bar: 柱状图（适合分类比较）
- line: 折线图（适合趋势和时间序列）
- scatter: 散点图（适合相关性分析）
- pie: 饼图（适合占比展示）
- heatmap: 热力图（适合矩阵数据）
- radar: 雷达图（适合多维度对比）

【输出格式】
严格返回以下JSON格式（禁止使用Markdown代码块）：
{
  "recommended_type": "bar",
  "alternative_types": ["line", "scatter"],
  "reasoning": "数据包含多个地区的多种作物产量对比，适合使用柱状图展示分类比较",
  "data_characteristics": {
    "has_categories": true,
    "has_numerical_values": true,
    "has_time_series": false,
    "row_count": 2,
    "column_count": 4
  }
}

【分析要点】
1. 表格结构：行列关系、数据类型
2. 数据特征：是否有时间序列、分类、数值
3. 结论内容：突出对比还是趋势
4. 推荐优先级：主推荐 + 2个备选
```

**输出示例**:
```json
{
  "recommended_type": "bar",
  "alternative_types": ["line", "heatmap"],
  "reasoning": "表格包含多个地区的多种作物产量数据，适合使用柱状图进行分类对比，每种作物可以作为一个系列",
  "data_characteristics": {
    "has_categories": true,
    "has_numerical_values": true,
    "has_time_series": false,
    "row_count": 2,
    "column_count": 4
  }
}
```

---

### 阶段 3: 绘图 Agent

**位置**: `/api/charts/[taskId]/route.ts` 中集成

**触发**: 为每个表格独立调用（在类型Agent之后）

**输入**:
- 表格数据
- 风格约束（来自阶段1）
- 图表类型推荐（来自阶段2）

**Prompt 函数**: `makeDirectEchartsPrompts()` (在 `lib/prompts.ts`)

**Prompt 模板** (中文版，关键部分):
```
你是专业的数据可视化专家，擅长为科研论文生成高质量的 ECharts 图表配置。

【风格约束】
${styleConstraints ? `
用户偏好风格: ${styleConstraints.style}
允许的图表类型: ${styleConstraints.chart_types?.join(', ')}
配色方案:
  - 主色: ${styleConstraints.color_scheme?.primary}
  - 副色: ${styleConstraints.color_scheme?.secondary}
  - 色调: ${styleConstraints.color_scheme?.palette}
字体偏好:
  - 字体: ${styleConstraints.font_preferences?.family}
  - 大小: ${styleConstraints.font_preferences?.size}
布局偏好:
  - 显示网格: ${styleConstraints.layout_preferences?.grid}
  - 图例位置: ${styleConstraints.layout_preferences?.legend_position}
` : '使用默认学术风格'}

【图表类型建议】
${chartTypeRecommendation ? `
推荐类型: ${chartTypeRecommendation.recommended_type}
推荐理由: ${chartTypeRecommendation.reasoning}
备选类型: ${chartTypeRecommendation.alternative_types?.join(', ')}
数据特征:
  - 包含分类: ${chartTypeRecommendation.data_characteristics?.has_categories}
  - 包含数值: ${chartTypeRecommendation.data_characteristics?.has_numerical_values}
  - 包含时间序列: ${chartTypeRecommendation.data_characteristics?.has_time_series}
` : '请根据数据自行判断'}

【表格 ${tableIndex} 数据】
表头: ${headers.join(' | ')}
${rows.map((r, i) => `第${i+1}行: ${r.join(' | ')}`).join('\n')}

结论:
${conclusions.map((c, i) => `${i+1}. ${c}`).join('\n')}

【输出要求】
1. 严格遵循风格约束中的配色和字体设置
2. 优先使用推荐的图表类型，除非数据不适合
3. 返回完整的 ECharts option 对象，包含所有必需字段
4. 禁止使用 Markdown 代码块（```json 或 ```）
5. 输出必须是纯 JSON，以 { 开头，以 } 结尾

【输出格式】
{
  "engine": "echarts",
  "per_table_specs": [{
    "table_index": ${tableIndex},
    "title": "图表标题（从结论提取）",
    "chart_type": "bar|line|scatter|pie|heatmap|radar",
    "spec": {
      "title": {
        "text": "标题",
        "left": "center",
        "textStyle": {
          "fontSize": ${styleConstraints?.font_preferences?.size || 16},
          "fontFamily": "${styleConstraints?.font_preferences?.family || 'Arial'}"
        }
      },
      "tooltip": { "trigger": "axis" },
      "legend": {
        "top": "${styleConstraints?.layout_preferences?.legend_position || 'top'}",
        "data": ["系列1", "系列2"]
      },
      "grid": {
        "show": ${styleConstraints?.layout_preferences?.grid !== false},
        "left": "10%",
        "right": "10%",
        "bottom": "10%",
        "containLabel": true
      },
      "xAxis": {
        "type": "category",
        "data": [...],
        "axisLine": { "lineStyle": { "color": "#333" } }
      },
      "yAxis": {
        "type": "value",
        "axisLine": { "lineStyle": { "color": "#333" } }
      },
      "series": [{
        "name": "系列名",
        "type": "bar|line|scatter",
        "data": [...],
        "itemStyle": {
          "color": "${styleConstraints?.color_scheme?.primary || '#3b82f6'}"
        }
      }],
      "color": ["${styleConstraints?.color_scheme?.primary}", "${styleConstraints?.color_scheme?.secondary}"]
    }
  }]
}

【特别注意】
1. 必须从表格数据中提取真实的 xAxis.data 和 series[].data
2. 颜色必须使用风格约束中指定的颜色
3. 字体和布局必须遵循风格偏好
4. 图表类型优先使用推荐类型
5. 如果推荐类型不适合数据，可以选择备选类型并在title中说明
```

**输出示例**:
```json
{
  "engine": "echarts",
  "per_table_specs": [{
    "table_index": 1,
    "title": "各地区农作物产量对比",
    "chart_type": "bar",
    "spec": {
      "title": {
        "text": "各地区农作物产量对比",
        "left": "center",
        "textStyle": {
          "fontSize": 16,
          "fontFamily": "Arial"
        }
      },
      "tooltip": {
        "trigger": "axis",
        "axisPointer": { "type": "shadow" }
      },
      "legend": {
        "top": "top",
        "data": ["小麦", "玉米", "大豆"]
      },
      "grid": {
        "show": true,
        "left": "10%",
        "right": "10%",
        "bottom": "10%",
        "containLabel": true
      },
      "xAxis": {
        "type": "category",
        "data": ["North", "South"],
        "axisLine": { "lineStyle": { "color": "#333" } }
      },
      "yAxis": {
        "type": "value",
        "name": "产量",
        "axisLine": { "lineStyle": { "color": "#333" } }
      },
      "series": [
        {
          "name": "小麦",
          "type": "bar",
          "data": [125, 98],
          "itemStyle": { "color": "#1e40af" }
        },
        {
          "name": "玉米",
          "type": "bar",
          "data": [180, 145],
          "itemStyle": { "color": "#3b82f6" }
        },
        {
          "name": "大豆",
          "type": "bar",
          "data": [95, 112],
          "itemStyle": { "color": "#60a5fa" }
        }
      ],
      "color": ["#1e40af", "#3b82f6", "#60a5fa"]
    }
  }]
}
```

---

## 数据流转过程

### 1. 用户上传 PDF

```
用户 → upload.html → /api/ingest
                         ↓
                    LlamaParse 解析
                         ↓
                    localStorage.paperData
                         ↓
                    {
                      summary: "摘要",
                      tables: ["| 表格1 |", "| 表格2 |"],
                      table_conclusions: [["结论1"], ["结论2"]],
                      markdown: "完整文档"
                    }
```

### 2. 分析页面交互

```
analysis.html 加载 localStorage.paperData
    ↓
显示表格和结论
    ↓
用户输入偏好 + 可选上传图片
    ↓
点击 "Generate Charts"
```

### 3. 图表生成流程

```
[前端] analysis.html
    ↓
调用 /api/style-agent (阶段1)
    ↓ 返回 style_constraints
    ↓
调用 POST /api/charts (创建任务)
    ↓ 返回 { taskId }
    ↓
轮询 POST /api/charts/${taskId} (携带 state)
    每次调用处理一个表格：
    ↓
    1. 调用图表类型Agent (阶段2)
       → 返回 chartTypeRecommendation
    ↓
    2. 调用绘图Agent (阶段3)
       → 使用 style_constraints + chartTypeRecommendation
       → 返回 ECharts spec
    ↓
    3. 更新 state.results，返回给前端
    ↓
前端继续轮询直到所有表格完成
    ↓
保存到 localStorage.flowResult
    ↓
跳转到 result.html
```

### 4. 结果渲染

```
result.html 读取 localStorage.flowResult
    ↓
遍历 per_table_specs
    ↓
对每个表格:
    - 创建 div 容器
    - echarts.init(容器)
    - chart.setOption(spec)
```

---

## API 调用时序

### 完整时序图

```
时间轴  |  前端操作                |  API调用                    |  LLM调用
--------|--------------------------|-----------------------------|-----------------------
T0      | 点击Generate Charts      |                             |
        |                          |                             |
T1      | 调用风格Agent            | POST /api/style-agent       |
        |                          |   ↓                         |
T2      |                          |   处理中...                 | qwen-vl-plus (多模态)
        |                          |   ↓                         |   ↓
T3      | 收到风格约束             | ← { style_constraints }     | ← 返回JSON
        |                          |                             |
T4      | 创建图表任务             | POST /api/charts            |
        |                          |   ↓                         |
T5      | 收到任务ID               | ← { taskId }                |
        |                          |                             |
T6      | 开始轮询 (表格1)         | POST /api/charts/${taskId}  |
        |                          |   state = { nextIndex: 0 }  |
        |                          |   ↓                         |
T7      |                          |   调用类型Agent              | qwen-max (表格1类型)
        |                          |   ↓                         |   ↓
T8      |                          |   收到类型推荐               | ← JSON
        |                          |   ↓                         |
T9      |                          |   调用绘图Agent              | qwen-max (表格1绘图)
        |                          |   ↓                         |   ↓
T10     |                          |   收到ECharts配置            | ← JSON
        |                          |   ↓                         |
T11     | 收到进度更新             | ← { completed: 1, ... }     |
        |                          |                             |
T12     | 继续轮询 (表格2)         | POST /api/charts/${taskId}  |
        |                          |   state = { nextIndex: 1 }  |
        |                          |   ↓                         |
T13     |                          |   重复T7-T10                | qwen-max × 2
        |                          |   ↓                         |
T14     | 收到完成状态             | ← { status: 'success' }     |
        |                          |                             |
T15     | 保存结果并跳转           |                             |
        | → result.html            |                             |
```

### 状态管理

前端通过 `state` 对象管理整个流程：

```javascript
let state = {
  status: 'queued',           // queued → processing → success/error
  total: 3,                   // 总表格数
  completed: 0,               // 已完成数
  nextIndex: 0,               // 下一个要处理的表格索引

  // 输入数据（不变）
  summary_text: "...",
  language: "zh",
  preferences_text: "...",
  table_datas: [...],

  // 风格约束（阶段1输出）
  style_constraints: {...},

  // 累积结果
  theme_style: null,
  results: [
    {
      table_index: 1,
      title: "图表标题",
      chart_type: "bar",
      spec: { /* ECharts配置 */ }
    },
    // ... 更多表格结果
  ]
};
```

每次轮询：
1. 前端发送当前 `state`
2. 后端处理 `state.nextIndex` 对应的表格
3. 后端更新 `results`、`completed`、`nextIndex`
4. 返回新的 `state` 给前端
5. 前端更新本地 `state` 并继续轮询

---

## 关键技术点

### 1. JSON 解析容错

所有 LLM 返回都经过 `tryParseJson()` 处理：

```javascript
function tryParseJson(txt) {
  let s = String(txt || "").trim();
  // 移除 Markdown 代码块
  s = s.replace(/^```json\s*/i, "")
       .replace(/^```\s*/i, "")
       .replace(/```\s*$/i, "");

  try {
    return JSON.parse(s);
  } catch {}

  // 尝试提取第一个JSON对象/数组
  const m = s.match(/[\[{][\s\S]*[\]}]/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {}
  }

  return null;
}
```

### 2. 重试机制

所有 LLM 调用都有重试逻辑（默认3次）：

```javascript
async function textOnlyChat(prompt, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const r = await fetch(compatEndpoint, {...});

      if (r.status === 429) {
        // 指数退避
        await new Promise(res =>
          setTimeout(res, Math.pow(2, attempt) * 1000)
        );
        continue;
      }

      if (!r.ok) throw new Error(...);

      return result;
    } catch (e) {
      if (attempt === retries - 1) throw e;
      await new Promise(res => setTimeout(res, 1000));
    }
  }
}
```

### 3. 前端轮询策略

```javascript
const pollIntervalMs = 3000;  // 3秒轮询一次

while (!finished) {
  const pollRes = await fetch(`/api/charts/${taskId}`, {
    method: 'POST',
    body: JSON.stringify({ state })
  });

  const newState = await pollRes.json();
  state = { ...state, ...newState };  // 合并状态

  if (state.status === 'success') {
    // 保存结果并跳转
    localStorage.setItem('flowResult', JSON.stringify(flow));
    window.location.href = '/result.html';
    finished = true;
    break;
  }

  if (state.status === 'error') {
    throw new Error(state.error);
  }

  await new Promise(r => setTimeout(r, pollIntervalMs));
}
```

---

## 环境变量配置

```env
# 百炼平台 API Key（用于 LLM 调用）
DASHSCOPE_API_KEY=sk-xxx

# LlamaParse API Key（用于 PDF 解析）
LLAMAPARSE_API_KEY=llx-xxx

# OpenAI 兼容接口配置
OPENAI_COMPAT_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_COMPAT_MODEL=qwen-max  # 文本模型
```

---

## 常见问题排查

### 1. 风格约束未生效

**检查点**:
- `/api/style-agent` 是否返回了正确的 JSON
- `state.style_constraints` 是否正确传递到绘图 Agent
- Prompt 中是否正确使用了 `${styleConstraints.color_scheme.primary}`

### 2. 图表类型不符合预期

**检查点**:
- 表格类型 Agent 的推荐是否合理（查看日志）
- 绘图 Agent 是否遵循了推荐类型
- 数据特征是否被正确识别

### 3. ECharts 渲染失败

**检查点**:
- LLM 返回的 JSON 是否符合 ECharts 规范
- `spec.xAxis.data` 和 `spec.series[].data` 是否有实际数据
- 浏览器控制台是否有错误信息

### 4. 轮询超时

**检查点**:
- 表格数量是否过多（建议 < 10）
- LLM 响应速度（可能需要调整 `pollIntervalMs`）
- 网络连接是否稳定

---

## 性能优化建议

1. **并行处理**: 目前是逐表串行处理，可改为批量并行（需修改后端逻辑）
2. **缓存风格约束**: 相同用户偏好可以缓存避免重复调用
3. **预热模型**: 提前调用一次 LLM 减少首次延迟
4. **流式输出**: 使用 SSE 代替轮询，实时推送进度

---

## 总结

ResearchChart 的 Prompt 流程设计遵循 **关注点分离** 原则：

- **阶段 1** 专注风格提取
- **阶段 2** 专注类型推荐
- **阶段 3** 专注图表生成

每个阶段都有明确的输入输出契约，通过 JSON 进行数据传递，确保了系统的模块化和可维护性。

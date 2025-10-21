# Vercel 日志查询指南

## 📍 在哪里查看日志

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目 `ResearchChart`
3. 点击顶部导航栏的 **"Logs"** 或 **"Functions"** 标签

## 🔍 关键日志搜索词

### 1. API 路由日志

#### `/api/flow` 路由（主要图表生成逻辑）

**搜索关键词**：
```
[flow]
```

**具体阶段**：
- `[flow][theme]` - 主题与风格生成
- `[flow][direct]` - 直接策略（GPT-5）
- `[flow][direct][table_1]` - 第 1 个表格生成
- `[flow][direct][table_2]` - 第 2 个表格生成
- `[flow][plan]` - 三阶段策略的规划阶段
- `[flow][render]` - 三阶段策略的绘图阶段

**成功标识**：
```
✅ 成功生成图表
备用策略成功，生成了 X/Y 个图表
```

**失败标识**：
```
❌ 生成失败
模型返回无效JSON
未找到 per_table_specs
```

#### `/api/ingest` 路由（PDF 解析）

**搜索关键词**：
```
[ingest]
```

### 2. 前端日志（浏览器控制台）

虽然 Vercel 不会记录前端日志，但你可以在浏览器控制台查看：

**搜索关键词**：
- `[analysis]` - analysis.html 页面日志（包含 API 调用）
- `[result]` - result.html 页面日志（仅渲染）
- `[upload]` - upload.html 页面日志

**重要**：现在 `/api/flow` 是在 analysis.html 页面调用的，不是在 result.html！

### 3. 错误日志

**搜索关键词**：
```
error
Error
failed
失败
❌
```

### 4. OpenRouter API 调用

**搜索关键词**：
```
OpenRouter
openai/gpt-5
google/gemini
```

## 📊 常见问题排查

### 问题 1：点击生成后没有反应

**查询步骤**：
1. 打开浏览器控制台（F12）
2. 搜索 `[analysis] 调用 /api/flow` 查看是否发起请求
3. 在 Vercel 日志中搜索 `POST /api/flow` 查看是否收到请求

**可能原因**：
- JavaScript 错误阻止了请求
- 网络问题
- API 路由配置错误

### 问题 2：图表没有生成

**查询步骤**：
1. 在 Vercel 日志中搜索 `[flow][direct]` 查看是否开始生成
2. 搜索 `table_1` 查看第一个表格的生成日志
3. 查看是否有 `❌ 生成失败` 或 `模型返回无效JSON`

**可能原因**：
- GPT-5 返回格式错误
- 表格数据为空
- API 密钥无效

### 问题 3：加载界面一直转圈

**查询步骤**：
1. 在浏览器控制台查看是否有错误
2. 在 Vercel 日志中搜索 `[flow]` 查看 API 是否在执行
3. 查看函数执行时间

**可能原因**：
- API 超时（超过 120 秒）
- 表格太多或数据太大
- GPT-5 响应慢

### 问题 4：API 超时

**查询步骤**：
1. 搜索 `timeout` 或 `FUNCTION_INVOCATION_TIMEOUT`
2. 查看函数执行时间

**解决方案**：
- 检查 `route.ts` 中的 `maxDuration` 设置（当前为 120 秒）
- 考虑减少表格数量或数据行数

### 问题 5：JSON 解析失败

**查询步骤**：
1. 搜索 `tryParseJsonArrayOrObject`
2. 搜索 `parsed:` 查看解析结果
3. 搜索 `raw:` 查看原始返回

**可能原因**：
- GPT-5 返回了 Markdown 代码块（```json）
- 返回的不是有效 JSON
- 返回内容被截断

### 问题 6：数据映射错误

**查询步骤**：
1. 在浏览器控制台搜索 `data_mapping`
2. 搜索 `缺少 x 或 y 字段`
3. 搜索 `找不到列`

**可能原因**：
- 使用了三阶段策略但数据映射失败
- 列名不匹配

**解决方案**：
- 切换到直接生成策略（默认已启用）

## 🛠️ Vercel 日志面板功能

### 1. 实时日志（Real-time Logs）
- 显示最近的函数调用
- 自动刷新
- 适合调试正在运行的请求

### 2. 函数日志（Function Logs）
- 按函数分组（/api/flow, /api/ingest）
- 显示执行时间
- 显示状态码（200, 500 等）

### 3. 过滤器（Filters）
- **Status**: 200, 500, 404 等
- **Function**: 选择特定 API 路由
- **Time Range**: 选择时间范围

### 4. 搜索框（Search）
- 支持关键词搜索
- 支持正则表达式
- 区分大小写选项

## 📝 日志示例

### 完整的成功流程日志

#### 1. 浏览器控制台（analysis.html）
```
[analysis] 保存策略选择: 直接生成
[analysis] 调用 /api/flow
  body: { summary_text: "...", table_schemas: [...], use_direct_strategy: true }
  strategy: direct (GPT-5)
[analysis] /api/flow 成功
  flow: { theme_style: {...}, per_table_plans: [...], render: {...}, strategy: 'direct' }
```

#### 2. Vercel 函数日志（/api/flow）
```
POST /api/flow 200
[flow] 使用备用策略：逐个表格调用 GPT-5 生成完整 ECharts 选项
[flow][theme] system: ...
[flow][theme] parsed: { palette: 'professional', ... }
[flow][direct][table_1] 开始生成，数据行数: 15
[flow][direct][table_1] system: ...
[flow][direct][table_1] user: ...
[flow][direct][table_1] raw: {"engine":"echarts",...}
[flow][direct][table_1] parsed: { engine: 'echarts', ... }
[flow][direct][table_1] ✅ 成功生成图表
[flow][direct][table_2] 开始生成，数据行数: 12
[flow][direct][table_2] ✅ 成功生成图表
[flow] 备用策略成功，生成了 2/2 个图表
```

#### 3. 浏览器控制台（result.html）
```
[result] 从 localStorage 加载数据
  paper: { summary: "...", tables: [...] }
  flow: { theme_style: {...}, per_table_plans: [...] }
  strategy: direct
[result] 准备渲染 2 个图表
[result] table_1 使用直接策略，数据已包含 (15 条)
[result] table_1 echarts 渲染成功
[result] table_2 使用直接策略，数据已包含 (12 条)
[result] table_2 echarts 渲染成功
```

### 失败的日志

```
[flow][direct][table_1] 开始生成，数据行数: 15
[flow][direct][table_1] raw: ```json\n{"engine":"echarts",...}\n```
[flow][direct][table_1] parsed: null
[flow][direct][table_1] 模型返回无效JSON
[flow][direct][table_1] ❌ 生成失败: ...
[flow] 备用策略成功，生成了 1/2 个图表
```

## 🔧 调试技巧

### 1. 使用 console.log 分组
代码中使用了 `console.groupCollapsed` 和 `console.groupEnd`，在 Vercel 日志中会显示为缩进的日志块。

### 2. 查看完整的 API 响应
搜索 `raw:` 可以看到 GPT-5 的原始返回，帮助诊断格式问题。

### 3. 检查数据截断
如果日志中看到 `clip(...)` 或 `slice(0, 4000)`，说明数据被截断了。完整数据可能更长。

### 4. 对比成功和失败的请求
找到一个成功的请求和一个失败的请求，对比它们的日志差异。

## 📞 获取帮助

如果遇到问题：
1. 复制完整的错误日志
2. 记录请求的时间戳
3. 记录使用的策略（直接/三阶段）
4. 记录表格数量和数据行数

## 🔗 相关链接

- [Vercel Functions 文档](https://vercel.com/docs/functions)
- [Vercel Logs 文档](https://vercel.com/docs/observability/logs)
- [OpenRouter API 文档](https://openrouter.ai/docs)


# ResearchChart - AI 科研图表生成平台

基于 Next.js 和三阶段 Agent 框架的智能科研图表生成系统，自动从 PDF 论文中提取数据并生成专业的可视化图表。

## ✨ 特性

- 📄 **PDF 智能解析**：使用 LlamaParse 自动提取论文中的表格和关键信息
- 🤖 **三阶段 Agent 框架**：
  - 主题与风格代理：确定全局视觉风格
  - 图表规划代理：为每个表格设计最佳图表方案
  - 绘图代理：生成 Plotly 规格
- 📊 **专业图表渲染**：基于 Plotly.js 的高质量科研图表
- 🎨 **智能样式管理**：自动应用一致的主题和配色
- 💬 **自然语言交互**：通过对话描述图表需求和风格偏好

## 🏗️ 技术栈

- **前端框架**：Next.js 14 (App Router)
- **UI 组件**：Tailwind CSS + Radix UI
- **图表渲染**：Plotly.js
- **PDF 解析**：LlamaParse
- **AI 模型**：OpenRouter (Google Gemini 2.5 Flash)
- **部署平台**：Vercel

## 📦 安装

```bash
# 克隆仓库
git clone https://github.com/ayuan324/ResearchChart.git
cd ResearchChart/app_demo

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加以下密钥：
# OPENROUTER_API_KEY=your_openrouter_key
# LLAMAPARSE_API_KEY=your_llamaparse_key

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000/home.html

## 🚀 使用流程

1. **上传论文**：在 `/upload.html` 上传 PDF 文件
2. **查看分析**：系统自动提取表格和关键发现，跳转到 `/analysis.html`
3. **描述需求**：在对话框中描述图表需求和风格偏好（可选）
4. **生成图表**：点击"Generate Charts"，系统调用三阶段 Agent 生成图表
5. **查看结果**：在 `/result.html` 查看生成的专业图表

## 🎯 双策略 Agent 架构

本系统提供两种图表生成策略，可在 analysis 页面切换：

### 策略 1：三阶段 Agent（默认）

适合复杂场景，提供更精细的控制：

#### 1. 主题与风格代理（Theme & Style Agent）
```typescript
输入：论文摘要 + 用户偏好
输出：{
  palette: "professional|nature|mono|warm|cool",
  font_family: "Inter",
  font_size: 12,
  background: "white",
  grid: true
}
```

#### 2. 图表规划代理（Design Agent）
```typescript
输入：表头 schema + 表格结论 + 用户偏好
输出：[{
  table_index: 1,
  pitch: "区域气候数据对比",
  chart_type: "bar",
  data_mapping: { x: "Region", y: "Avg Temp", hue: "Year" }
}]
```

#### 3. 绘图代理（Renderer Agent）
```typescript
输入：图表方案 + 主题样式
输出：{
  engine: "plotly",
  per_table_specs: [{
    table_index: 1,
    spec: {
      data: [{ type: "bar", x: ["x"], y: [1] }],
      layout: { height: 300 }
    }
  }]
}
```

### 策略 2：直接生成（备用）

适合简单数据或解决缩放问题，一次性生成完整图表：

```typescript
输入：完整表格数据 + 结论 + 主题样式
输出：{
  engine: "plotly",
  per_table_specs: [{
    table_index: 1,
    title: "区域气候数据对比",
    spec: {
      data: [{ type: "bar", x: ["North"], y: [15.2], name: "2023" }],
      layout: { height: 300 }
    }
  }]
}
```

**优势**：
- ✅ 避免数据映射错误
- ✅ 模型可以看到完整数据，做出更好的可视化决策
- ✅ 自动选择最合适的字段类型（nominal/quantitative/temporal）
- ✅ 解决图表缩放和尺寸问题

## 📁 项目结构

```
app_demo/
├── app/
│   ├── api/
│   │   ├── ingest/route.ts    # PDF 解析与表格提取
│   │   └── flow/route.ts      # 三阶段 Agent 流程
│   ├── layout.tsx
│   └── page.tsx               # 重定向到 /home.html
├── lib/
│   ├── prompts.ts             # Agent Prompt 模板
│   └── utils.ts
├── public/
│   ├── home.html              # 主页
│   ├── upload.html            # 上传页
│   ├── analysis.html          # 分析页
│   └── result.html            # 结果页（图表渲染）
├── components/                # UI 组件
├── next.config.mjs
└── package.json
```

## 🔧 API 路由

### POST /api/ingest
上传 PDF 并解析

**请求**：
```typescript
FormData {
  file: File,
  language: "zh" | "en"
}
```

**响应**：
```typescript
{
  summary: string,           // Key Findings
  markdown: string,          // 原文 Markdown
  tables: string[],          // Markdown 表格
  table_schemas: string[][], // 表头
  table_conclusions: string[][] // 逐表结论
}
```

### POST /api/flow
三阶段 Agent 生成图表

**请求**：
```typescript
{
  summary_text: string,
  table_schemas: string[][],
  table_conclusions: string[][],
  language: "zh" | "en",
  preferences_text?: string
}
```

**响应**：
```typescript
{
  theme_style: ThemeStyle,
  per_table_plans: ChartPlan[],
  render: {
    engine: "vega-lite",
    per_table_specs: VegaLiteSpec[]
  }
}
```

## 🌟 核心特性

### 智能数据映射
系统自动分析表格结构，选择最合适的列进行可视化：
- 自动识别分类变量和数值变量
- 智能推荐图表类型（柱状图、折线图、散点图等）
- 支持多维度数据映射（x, y, hue）

### 主题一致性
所有图表自动应用统一的视觉风格：
- 配色方案（professional/nature/mono/warm/cool）
- 字体和字号
- 网格和背景
- 图例位置

### 错误处理
完善的错误处理和用户反馈：
- 数据映射验证
- 列名匹配检查
- Plotly 图形校验
- 友好的错误提示

## 📝 开发规范

- **代码风格**：Google 代码风格
- **模型调用**：统一通过 OpenRouter
- **文档位置**：`docs/`
- **页面命名**：使用 ASCII 路径

## 🚧 后续规划

- [ ] 添加图表导出功能（PNG/SVG/PDF）
- [ ] 支持用户上传参考图片进行风格迁移
- [ ] 添加图表交互编辑功能
- [ ] 优化 Prompt 以提高图表质量
- [ ] 支持更多图表类型（violin, radar, sankey 等）
- [ ] 添加批量处理功能
- [ ] 支持自定义配色方案

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

- GitHub: [@ayuan324](https://github.com/ayuan324)
- 项目地址: https://github.com/ayuan324/ResearchChart

---

**注意**：使用前请确保已配置 `OPENROUTER_API_KEY` 和 `LLAMAPARSE_API_KEY` 环境变量。


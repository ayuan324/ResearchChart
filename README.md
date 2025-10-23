# ResearchChart - AI 科研图表生成平台

基于 Next.js 和三阶段 Agent 框架的智能科研图表生成系统，自动从 PDF 论文中提取数据并生成专业的可视化图表。

## ✨ 核心特性

- 📄 **PDF 智能解析**：自动提取论文中的表格和关键信息
- 🤖 **三阶段 Agent 框架**：
  - **风格控制 Agent**：分析用户偏好和参考图片，提取风格约束
  - **表格类型 Agent**：为每个表格推荐最合适的图表类型
  - **绘图 Agent**：生成符合风格约束的 ECharts 配置
- 📊 **ECharts 渲染**：专业的科研级图表可视化
- 🎨 **多模态输入**：支持文本描述 + 参考图片
- 💬 **自然语言交互**：通过对话描述图表需求

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/ayuan324/ResearchChart.git
cd ResearchChart/app_demo

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
```

编辑 `.env.local` 文件，添加以下配置：

```env
# 百炼平台 API Key（用于 LLM 调用）
DASHSCOPE_API_KEY=your_dashscope_key

# LlamaParse API Key（用于 PDF 解析）
LLAMAPARSE_API_KEY=your_llamaparse_key

# 可选：自定义模型配置
OPENAI_COMPAT_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_COMPAT_MODEL=qwen-max
```

### 启动服务

```bash
npm run dev
```

访问 http://localhost:3000/home.html

## 📖 使用指南

### 基本流程

1. **上传论文** (`/upload.html`)
   - 上传 PDF 文件
   - 系统自动解析并提取表格

2. **查看分析** (`/analysis.html`)
   - 查看提取的表格和结论
   - 在对话框中描述图表需求（可选）
   - 上传参考图片指定风格（可选）

3. **生成图表**
   - 点击 "Generate Charts"
   - 系统自动调用三阶段 Agent

4. **查看结果** (`/result.html`)
   - 浏览生成的专业图表
   - 支持导出和分享

### 高级功能

#### 风格控制
在对话框中描述你的偏好：
- "使用学术风格，蓝色系配色"
- "生成简洁的柱状图"
- "参考论文中的图表风格"

#### 参考图片
点击图片上传按钮，上传参考图片，系统将使用多模态模型分析图片风格。

## 🏗️ 技术栈

- **前端**：Next.js 14, Tailwind CSS, ECharts
- **后端**：Next.js API Routes
- **AI 模型**：
  - 文本模型：qwen-max（百炼平台）
  - 多模态模型：qwen-vl-plus（百炼平台）
- **PDF 解析**：LlamaParse

## 🎯 三阶段 Agent 架构

### 1. 风格控制 Agent (`/api/style-agent`)

**输入**：
- 用户文本偏好（可选）
- 参考图片 Base64（可选）

**输出**：
```json
{
  "style": "academic|simple|colorful|professional",
  "chart_types": ["bar", "line"],
  "color_scheme": {
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "palette": "cool"
  },
  "font_preferences": {
    "family": "Arial",
    "size": 12
  }
}
```

### 2. 表格类型 Agent（集成在 `/api/charts`）

**输入**：
- 表格数据（headers, rows, conclusions）

**输出**：
```json
{
  "recommended_type": "bar",
  "alternative_types": ["line", "scatter"],
  "reasoning": "数据包含分类比较，适合柱状图",
  "data_characteristics": {
    "has_categories": true,
    "has_numerical_values": true,
    "has_time_series": false
  }
}
```

### 3. 绘图 Agent（集成在 `/api/charts`）

**输入**：
- 表格数据
- 风格约束
- 图表类型推荐

**输出**：
```json
{
  "engine": "echarts",
  "per_table_specs": [{
    "table_index": 1,
    "title": "性能对比",
    "spec": {
      "xAxis": {...},
      "yAxis": {...},
      "series": [...]
    }
  }]
}
```

## 📁 项目结构

```
app_demo/
├── app/api/
│   ├── charts/[taskId]/route.ts  # 图表生成主流程（集成表格类型和绘图Agent）
│   ├── ingest/route.ts           # PDF 解析
│   └── style-agent/route.ts      # 风格控制Agent
├── lib/
│   └── prompts.ts                # Agent Prompt 模板
├── public/
│   ├── home.html                 # 主页
│   ├── upload.html               # 上传页
│   ├── analysis.html             # 分析页（集成风格输入）
│   └── result.html               # 结果页
└── docs/                         # 详细文档
    └── 项目架构.md
```

## 🔧 API 文档

详细的 API 文档请参考 [docs/项目架构.md](./docs/项目架构.md)

## 🐛 故障排除

### ECharts 未加载
- 检查浏览器控制台是否有 CDN 加载错误
- 系统会自动尝试备用 CDN

### 图表未显示
- 打开浏览器控制台查看详细错误日志
- 检查表格数据是否包含有效的数值

### API 调用失败
- 确认 `.env.local` 中的 API Key 配置正确
- 检查网络连接

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

贡献前请阅读：
1. 遵循现有代码风格
2. 添加适当的注释和文档
3. 测试你的修改

## 📄 许可证

MIT License

## 📧 联系方式

- GitHub: [@ayuan324](https://github.com/ayuan324)
- 项目地址: https://github.com/ayuan324/ResearchChart

---

**提示**：首次使用请确保配置环境变量，详见 [快速开始](#快速开始) 章节。

# ResearchChart 项目文档

## 1. 项目概述
ResearchChart 致力于构建一个面向科研场景的图表生成智能体，帮助用户在上传科研论文（PDF 或补充文档）后，快速得到规范化的量化结果总结、图表设计方案，并自动生成符合学术风格的复合图表。首版产品基于 Streamlit，实现“上传 → 确认 → 生成图片”的用户流程，同时在后台通过 LLM 完成文本理解与图表规划，再调用 Python 绘图库导出 PNG/SVG/PDF 等格式的结果图。

## 2. 目标与非目标
- **目标**
  - 自动解析单篇论文或量化结果文件，提取关键实验指标。
  - 以统一的学术风格生成复合图表建议，并最终产出高质量图像。
  - 支持中英文双语交互与 prompt 模板，方便后续本地化。
  - 初版提供 2-3 套图表设计方案，供用户确认后再执行绘图。
- **非目标**
  - 初期不支持批量文档处理、OCR 或复杂权限管理。
  - 暂不实现检索增强、工具链扩展（作为后续迭代方向）。

## 3. 用户流程设计
1. **上传阶段**：用户上传 PDF/方法描述/量化结果文件（一次仅处理一个文档）。
2. **自动解析**：系统调用 LLM 完成文献理解与量化结果整理，返回结构化摘要。
3. **方案生成**：根据摘要，LLM 生成 2-3 份图表设计方案（包括图表类型、可视化要点、说明文字建议）。
4. **用户确认**：前端展示方案列表与核心摘要，用户选择一个方案。
5. **图表生成**：后端根据选定方案调用 Python 绘图库（Matplotlib/Seaborn/Plotly），输出 PNG/SVG/PDF，并给出自动化的图例与标题。
6. **下载/预览**：展示生成结果，允许用户下载全部文件。

## 4. 系统架构概览
```
┌────────────────────────┐
│        Streamlit 前端        │
│  上传控件 / 方案展示 / 确认按钮 │
└──────────┬─────────┘
           │API 调用
┌──────────┴─────────┐
│    Backend Orchestrator    │
│- 文档预处理 (PyPDF2/pdfminer)
│- LLM Prompt 构造 & 调用 (OpenRouter, 模型占位符: openai/gpt-4o)
│- 结果解析与缓存
│- 绘图指令生成 & 执行
└──────────┬─────────┘
           │
┌──────────┴─────────┐
│     Chart Renderer        │
│- Matplotlib/Seaborn/Plotly
│- 统一样式配置 (字体/字号/颜色)
│- 导出 PNG / SVG / PDF
└────────────────────────┘
```

## 5. 文档解析与数据结构
- **输入**：PDF/Markdown/CSV/Excel（保证机器可读）。
- **解析方式**：
  - PDF → 文本：优先使用 pdfminer.six 或 PyPDF2 提取文本与表格。
  - 量化表格：转为统一的 pandas DataFrame，字段包括 `metric`, `value`, `std`, `dataset`, `setting` 等。
- **缓存策略**：在 Streamlit session state 中存储原始文本、LLM 返回的摘要和图表方案，避免重复调用。

## 6. LLM Prompt 设计
### 6.1 中英文双语模板
**文献理解 Prompt（中文）**
```
你是科研助理。请阅读以下文本片段，完成：
1. 用 5-8 句话总结研究背景、方法、实验设置。
2. 列出所有关键量化指标，使用 JSON 数组表示，每个对象包含字段：
   - metric: 指标名称
   - dataset: 数据集或实验条件
   - value: 指标数值（保留原始格式）
   - std: 若有标准差/方差信息则填写，否则为 null
   - note: 其他说明（如模型/方法名称、训练设置）
文本：```{{document_chunk}}```
若信息不足，请在 note 中说明“信息不足”。
```

**Literature Understanding Prompt (English)**
```
You are a research assistant. Read the following text snippet and deliver:
1. A 5-8 sentence summary covering research background, methodology, and experimental setup.
2. A JSON array listing all key quantitative metrics, where each object has:
   - metric
   - dataset
   - value (preserve original formatting)
   - std (null if missing)
   - note (e.g., model/method name, training setup)
Text: ```{{document_chunk}}```
If data is insufficient, note "insufficient information" in the note field.
```

**图表方案生成 Prompt（中文）**
```
你是顶级论文的可视化设计师。根据以下研究摘要与量化数据，提出 3 套图表方案。每套方案需包含：
- title: 图表标题建议
- goal: 传达的核心信息
- chart_type: 建议的复合图表类型（可组合，如"堆叠条形 + 折线"）
- layout: 图表布局描述（子图数量、排列方式）
- data_mapping: 数据字段与视觉编码的对应关系
- style_notes: 字体、字号、颜色、注释等细节建议
- annotation: 需要突出显示的关键点
请优先强调比较关系与趋势。
摘要：```{{summary_text}}```
指标 JSON：```{{metric_json}}```
输出 JSON 数组，包含 3 个方案。
```

**Chart Planning Prompt (English)**
```
You are an elite visualization designer for top-tier research papers. Based on the summary and quantitative data, propose 3 visualization plans. Each plan must include:
- title
- goal
- chart_type (composite charts encouraged, e.g., "grouped bar + line")
- layout (number of subplots, arrangement)
- data_mapping (how fields map to axes, color, size, etc.)
- style_notes (font, font size, palette, annotations)
- annotation (key findings to highlight)
Summary: ```{{summary_text}}```
Metrics JSON: ```{{metric_json}}```
Return a JSON array with exactly 3 plans.
```

### 6.2 Prompt 调用策略
- 对长文档采用分段处理，分别调用文献理解 Prompt，然后合并 JSON 与摘要。
- 方案生成阶段使用聚合后的摘要与指标，确保 LLM 对全局信息有统一认知。
- 预留模型名称参数（默认 `MODEL_NAME = "openai/gpt-4o"`），通过 OpenRouter 调用。

## 7. 图表生成实现要点
- **绘图库选择**：
  - Matplotlib：保证严谨、可控的纸质出版质量。
  - Seaborn：快速生成统计图；用于初始布局。
  - Plotly：在需要交互或 3D 场景时备用。
- **样式统一**：
  - 字体：`Times New Roman`（英文）、`Source Han Serif`（中文）。
  - 字号：标题 16pt，副标题 14pt，轴标签 12pt，刻度 10pt，图例 10pt。
  - 颜色：默认配色方案可选 Matplotlib `Set2`，支持通过配置覆盖。
  - 网格：可选浅灰虚线，增强对比。
  - 导出：使用 `plt.savefig` 同时输出 `.png`、`.svg`、`.pdf`，设置 300 DPI。
- **复合图实现**：
  - 提供工具函数生成多子图布局（`matplotlib.gridspec`）。
  - 支持叠加折线与柱状、误差线、显著性标记。
  - 自动添加注释（`ax.annotate`）突出关键点。

## 8. Streamlit 前端设计
- **页面结构**：
  1. 标题区：项目简介、使用说明。
  2. 上传区：`st.file_uploader` 支持 PDF/CSV/Excel。
  3. 摘要区：展示 LLM 生成的摘要与结构化指标（表格形式）。
  4. 方案区：卡片式展示 2-3 套可视化方案，包含图示说明与选择按钮。
  5. 结果区：显示生成的图像预览，提供下载按钮。
- **交互逻辑**：
  - 使用 `st.session_state` 保存上传文件、摘要、方案、用户选择。
  - LLM 调用过程添加进度条与状态提示。
  - 允许用户重新生成方案或替换文件。

## 9. 部署与运维
- **开发环境**：Python 3.10+，依赖主要包括 `streamlit`, `pandas`, `numpy`, `matplotlib`, `seaborn`, `plotly`, `pypdf`, `openrouter` SDK。
- **部署方案**：
  - 初期使用 Streamlit Cloud 或本地运行进行演示。
  - 后续将前端打包部署至 Vercel，后端可通过 Serverless 函数调用 OpenRouter API。
  - 关注 OpenRouter 调用速率与费用，设置环境变量管理 API Key。
- **日志与监控**：
  - 在后端记录每次 LLM 调用的 prompt、响应摘要（脱敏后）与耗时。
  - 记录图表生成的输入配置，便于复现。

## 10. 数据与隐私
- 所有上传文件仅在会话内暂存，默认不做长期持久化。
- 若需持久化或审计，可扩展数据库（如 PostgreSQL）并添加访问控制。
- 用户上传内容默认视为公开科研资料，无特殊加密需求，但建议在文档中提醒用户自行确认。

## 11. 后续迭代方向
- 引入检索增强（RAG）与公式解析，提高对复杂论文的理解能力。
- 支持自动化的显著性检验与统计说明生成。
- 提供更多风格模板（如 NeurIPS、Nature）与自定义主题。
- 增强多语言支持（例如日语、韩语）。
- 打通团队协作功能（共享项目、评论、版本对比）。

## 12. 开发里程碑（建议）
1. **MVP（第 1 周）**：实现上传、文献理解、方案生成、单图绘制、结果下载。
2. **迭代 1（第 2-3 周）**：加入复合图模板库、样式配置、方案多样性优化。
3. **迭代 2（第 4-5 周）**：完善前端体验（方案卡片、预览图）、部署到 Vercel。
4. **迭代 3（第 6 周）**：引入缓存、日志、成本监控，探索检索增强。

---
如需进一步拆分任务或进入编码阶段，可在此文档基础上继续细化。

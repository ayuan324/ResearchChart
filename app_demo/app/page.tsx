"use client"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const FileTextIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const BarChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

const ImageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

const TableIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z"
    />
  </svg>
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChartIcon />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Research Chart</h1>
                <p className="text-sm text-muted-foreground">科研图表生成工具</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
              Beta v1.0
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">智能科研图表生成平台</h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            上传PDF文档或量化表格，自动生成符合学术标准的高质量科研配色图表
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/upload">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <UploadIcon />
                <span className="ml-2">开始使用</span>
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              查看示例
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <FileTextIcon />
              </div>
              <CardTitle className="text-lg">文档解析</CardTitle>
              <CardDescription>智能解析PDF文档，提取关键信息和数据表格</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                <TableIcon />
              </div>
              <CardTitle className="text-lg">数据总结</CardTitle>
              <CardDescription>自动总结论文内容，提取量化表格和关键结论</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mb-3">
                <BarChartIcon />
              </div>
              <CardTitle className="text-lg">图表方案</CardTitle>
              <CardDescription>基于数据特征生成多种可视化方案供选择</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mb-3">
                <ImageIcon />
              </div>
              <CardTitle className="text-lg">图表生成</CardTitle>
              <CardDescription>生成高质量的科研配色图表，支持多种格式导出</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Workflow Section */}
        <div className="bg-card/30 rounded-2xl p-8 border border-border">
          <h3 className="text-2xl font-semibold text-foreground mb-8 text-center">工作流程</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">上传文档</h4>
              <p className="text-sm text-muted-foreground">支持PDF、Markdown和Excel表格文件</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">2</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">智能解析</h4>
              <p className="text-sm text-muted-foreground">自动提取数据和关键信息</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-chart-2/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-chart-2">3</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">方案选择</h4>
              <p className="text-sm text-muted-foreground">从多个可视化方案中选择最佳</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-chart-3/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-chart-3">4</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">生成图表</h4>
              <p className="text-sm text-muted-foreground">导出高质量的科研图表</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

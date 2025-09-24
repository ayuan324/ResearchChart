"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// <CHANGE> 替换lucide-react图标为自定义SVG图标
const BarChart3Icon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

const LineChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l4-4 4 4" />
  </svg>
)

const PieChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export default function ChartsPage() {
  const [selectedChart, setSelectedChart] = useState<number | null>(null)
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("plansData")
      if (raw) setPlans(JSON.parse(raw))
    } catch {}
  }, [])

  const chartOptions = (plans.length ? plans : [
    { pitch: "性能对比柱状图", chart_type: "bar" },
    { pitch: "训练过程曲线图", chart_type: "line" },
    { pitch: "模型架构示意图", chart_type: "other" },
  ]).map((p: any, idx: number) => ({
    id: idx + 1,
    title: p.pitch || `方案 ${idx + 1}`,
    description: p.chart_type ? `建议图表类型：${p.chart_type}` : "基于数据自动选择",
    icon: p.chart_type === "line" ? LineChartIcon : p.chart_type === "bar" ? BarChart3Icon : PieChartIcon,
    preview:
      p.chart_type === "line"
        ? "/training-loss-and-accuracy-curves-for-deep-learnin.jpg"
        : p.chart_type === "bar"
        ? "/performance-comparison-bar-chart-with-three-models.jpg"
        : "/neural-network-architecture-diagram-with-layers-an.jpg",
    features: ["科研配色", "高分辨率", "期刊友好", "可导出"],
  }))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/summary" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-chart-2 rounded-lg flex items-center justify-center">
                <BarChart3Icon />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">图表方案</h1>
                <p className="text-sm text-muted-foreground">选择最适合的可视化方案</p>
              </div>
            </Link>
            <Badge variant="outline" className="border-chart-2/30 text-chart-2">
              步骤 3/4
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">选择图表方案</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              基于您的数据特征，我们为您推荐以下三种可视化方案
            </p>
          </div>

          {/* Chart Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {chartOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedChart === option.id

              return (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border hover:border-primary/50 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedChart(option.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-primary" : "bg-primary/10"
                        }`}
                      >
                        <Icon />
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <CheckIcon />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription className="text-pretty">{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Preview */}
                    <div className="aspect-[3/2] bg-muted/20 rounded-lg overflow-hidden">
                      <img
                        src={option.preview || "/placeholder.svg"}
                        alt={option.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">特色功能：</p>
                      <div className="flex flex-wrap gap-2">
                        {option.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-muted/50 text-muted-foreground">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => setSelectedChart(null)}>
              重新选择
            </Button>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90"
              disabled={!selectedChart}
              onClick={() => {
                if (!selectedChart) return
                localStorage.setItem("selectedPlanIndex", String(selectedChart - 1))
                window.location.href = "/result"
              }}
            >
              生成选中图表
              <ArrowRightIcon />
            </Button>
          </div>

          {/* Selected Chart Info */}
          {selectedChart && (
            <Card className="mt-8 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <CheckIcon />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">已选择方案</p>
                    <p className="text-sm text-muted-foreground">
                      {chartOptions.find((opt) => opt.id === selectedChart)?.title}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  点击"生成选中图表"开始创建您的科研图表，预计需要30-60秒完成。
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

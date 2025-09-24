"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Share2, Edit3, RotateCcw, FileImage, Settings } from "lucide-react"
import Link from "next/link"
import { BarChart as RBarChart, Bar, LineChart as RLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import * as htmlToImage from "html-to-image"

export default function ResultPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [paper, setPaper] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [planIdx, setPlanIdx] = useState<number>(0)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const rawPaper = localStorage.getItem("paperData")
      if (rawPaper) setPaper(JSON.parse(rawPaper))
      const rawPlans = localStorage.getItem("plansData")
      if (rawPlans) setPlans(JSON.parse(rawPlans))
      const sel = localStorage.getItem("selectedPlanIndex")
      if (sel) setPlanIdx(parseInt(sel))
    } catch {}
  }, [])

  const currentPlan = useMemo(() => plans?.[planIdx] || null, [plans, planIdx])

  const parseMarkdownTable = (md: string) => {
    const rows = md
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.startsWith("|") && l.endsWith("|"))
    if (rows.length < 2) return { headers: [], rows: [] as string[][] }
    const headers = rows[0].slice(1, -1).split("|").map((c) => c.trim())
    const body = rows.slice(2).map((r) => r.slice(1, -1).split("|").map((c) => c.trim()))
    return { headers, rows: body }
  }

  const table0 = useMemo(() => (paper?.tables?.[0] ? parseMarkdownTable(paper.tables[0]) : { headers: [], rows: [] }), [paper])

  const mapping = useMemo(() => {
    const m = (currentPlan?.data_mapping || {}) as any
    const pick = (v: any) => (Array.isArray(v) ? String(v[0] ?? "") : v ? String(v) : "")
    return { x: pick(m.x), y: pick(m.y), hue: pick(m.hue) }
  }, [currentPlan])

  const data = useMemo(() => {
    const idxX = table0.headers.indexOf(mapping.x)
    const idxY = table0.headers.indexOf(mapping.y)
    let xIdx = idxX >= 0 ? idxX : 0
    let yIdx = idxY >= 0 ? idxY : 1
    if (table0.headers.length <= 1) yIdx = 0
    const parsed = table0.rows.map((r) => ({
      x: r[xIdx] ?? "",
      y: Number((r[yIdx] ?? "").toString().replace(/[^0-9.+-eE]/g, "")) || 0,
    }))
    return parsed
  }, [table0, mapping])

  const downloadPNG = async () => {
    if (!chartRef.current) return
    const dataUrl = await htmlToImage.toPng(chartRef.current, { pixelRatio: 2 })
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = "chart.png"
    a.click()
  }

  const downloadFormats = [
    { format: "PNG", size: "高分辨率 (300 DPI)", recommended: true },
    { format: "SVG", size: "矢量格式", recommended: false },
    { format: "PDF", size: "打印优化", recommended: false },
    { format: "EPS", size: "专业出版", recommended: false },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/charts" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-chart-3 rounded-lg flex items-center justify-center">
                <FileImage className="w-5 h-5 text-chart-3-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">最终图表</h1>
                <p className="text-sm text-muted-foreground">您的科研图表已生成完成</p>
              </div>
            </Link>
            <Badge variant="outline" className="border-chart-3/30 text-chart-3">
              步骤 4/4
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="result" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
              <TabsTrigger
                value="result"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                生成结果
              </TabsTrigger>
              <TabsTrigger
                value="customize"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                自定义设置
              </TabsTrigger>
              <TabsTrigger
                value="export"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                导出选项
              </TabsTrigger>
            </TabsList>

            <TabsContent value="result" className="space-y-6">
              {/* Generated Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">深度学习模型性能对比</CardTitle>
                      <CardDescription>基于CIFAR-10数据集的实验结果可视化</CardDescription>
                    </div>
                    <Badge className="bg-accent/20 text-accent border-accent/30">科研配色</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div ref={chartRef} className="aspect-[4/3] bg-card border border-border rounded-lg overflow-hidden flex items-center justify-center p-4">
                    {currentPlan?.chart_type === "line" ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RLineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="x" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="y" stroke="#2563eb" strokeWidth={2} dot={false} />
                        </RLineChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RBarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="x" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="y" fill="#2563eb" />
                        </RBarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Chart Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">图表信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">图表类型</span>
                      <span className="font-medium">性能对比柱状图</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">分辨率</span>
                      <span className="font-medium">1200 × 900 px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">配色方案</span>
                      <span className="font-medium">科研标准配色</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">生成时间</span>
                      <span className="font-medium">42 秒</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">数据来源</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">数据集</span>
                      <span className="font-medium">CIFAR-10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">模型数量</span>
                      <span className="font-medium">3 个</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">评估指标</span>
                      <span className="font-medium">准确率、精确率、召回率</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">统计显著性</span>
                      <span className="font-medium">&lt;p&gt;p &lt; 0.05&lt;/p&gt;</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="customize" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    图表自定义
                  </CardTitle>
                  <CardDescription>调整图表样式和显示选项</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">颜色配置</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          科研标准配色 (当前)
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          Nature 期刊配色
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          Science 期刊配色
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">显示选项</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          显示误差线
                        </Button>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          添加统计标注
                        </Button>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          调整字体大小
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsGenerating(true)}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      重新生成图表
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-chart-3" />
                    导出选项
                  </CardTitle>
                  <CardDescription>选择适合的格式下载您的图表</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {downloadFormats.map((format, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer transition-colors ${
                          format.recommended ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-foreground">{format.format}</span>
                                {format.recommended && (
                                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">推荐</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{format.size}</p>
                            </div>
                            <Button size="sm" variant={format.recommended ? "default" : "outline"}>
                              下载
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <Button className="bg-primary hover:bg-primary/90" size="lg" onClick={downloadPNG}>
                      <Download className="w-4 h-4 mr-2" />
                      下载高分辨率PNG
                    </Button>
                    <Button variant="outline" size="lg">
                      <Share2 className="w-4 h-4 mr-2" />
                      分享链接
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="flex items-center justify-center gap-4">
                <Link href="/">
                  <Button variant="outline">创建新图表</Button>
                </Link>
                <Link href="/charts">
                  <Button variant="outline">
                    <Edit3 className="w-4 h-4 mr-2" />
                    修改方案
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

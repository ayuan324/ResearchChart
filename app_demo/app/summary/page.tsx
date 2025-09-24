"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const FileTextIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const TableIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z"
    />
  </svg>
)

const MessageSquareIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const LightbulbIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
)

export default function SummaryPage() {
  const [insights, setInsights] = useState("")
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [paper, setPaper] = useState<any>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("paperData")
      if (raw) setPaper(JSON.parse(raw))
    } catch {}
  }, [])

  const tables = useMemo(() => paper?.tables || [], [paper])
  const schemas = useMemo(() => paper?.table_schemas || [], [paper])
  const conclusions = useMemo(() => paper?.table_conclusions || [], [paper])
  const summaryText = useMemo(() => paper?.summary || "", [paper])

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

  const generatePlans = async () => {
    try {
      setLoadingPlan(true)
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary_text: summaryText,
          table_conclusions: conclusions,
          table_schemas: schemas,
          language: paper?.language || "zh",
        }),
      })
      if (!res.ok) throw new Error(`生成方案失败: ${res.status}`)
      const data = await res.json()
      localStorage.setItem("plansData", JSON.stringify(data?.plans || []))
      window.location.href = "/charts"
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPlan(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/upload" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <TableIcon />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">数据总结</h1>
                <p className="text-sm text-muted-foreground">论文内容分析与数据提取</p>
              </div>
            </Link>
            <Badge variant="outline" className="border-accent/30 text-accent">
              步骤 2/4
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="summary" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
              <TabsTrigger
                value="summary"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                论文总结
              </TabsTrigger>
              <TabsTrigger
                value="tables"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                数据表格
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                生成方案
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileTextIcon />
                    论文摘要
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {summaryText ? (
                    summaryText.split(/\n{2,}/).map((p: string, idx: number) => (
                      <div key={idx} className="bg-muted/30 rounded-lg p-6">
                        <p className="text-muted-foreground leading-relaxed">{p}</p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-6">
                      <p className="text-muted-foreground leading-relaxed">暂无摘要</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tables" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TableIcon />
                    实验结果对比
                  </CardTitle>
                  <CardDescription>三种深度学习模型的性能指标对比</CardDescription>
                </CardHeader>
                <CardContent>
                  {tables?.length ? (
                    tables.map((t: string, tIdx: number) => {
                      const parsed = parseMarkdownTable(t)
                      return (
                        <div key={tIdx} className="overflow-x-auto mb-6">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-border">
                                {parsed.headers.map((h, i) => (
                                  <th key={i} className="text-left py-3 px-4 font-semibold text-foreground">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {parsed.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="border-b border-border/50 hover:bg-muted/20">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="py-3 px-4 text-muted-foreground">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-muted-foreground">暂无表格</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LightbulbIcon />
                    关键结论
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {conclusions?.length ? (
                      conclusions.map((arr: string[], tIdx: number) => (
                        <div key={tIdx} className="space-y-2 mb-4">
                          <div className="text-sm font-medium text-foreground">\u8868 {tIdx + 1}</div>
                          {arr.length ? (
                            arr.map((conclusion: string, index: number) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                                <div className="w-6 h-6 bg-chart-2/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-semibold text-chart-2">{index + 1}</span>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">{conclusion}</p>
                              </div>
                            ))
                          ) : (
                            <div className="text-muted-foreground">\u6682\u65e0\u7ed3\u8bba</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground">\u6682\u65e0\u7ed3\u8bba</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquareIcon />
                    图表生成方案
                  </CardTitle>
                  <CardDescription>基于数据特征，为您推荐最适合的可视化方案</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="请描述您希望生成的图表类型和重点展示的数据关系..."
                    value={insights}
                    onChange={(e) => setInsights(e.target.value)}
                    className="min-h-32 bg-muted/20 border-border"
                  />
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">性能对比图</Button>
                    <Button variant="outline" size="sm">趋势分析图</Button>
                    <Button variant="outline" size="sm">架构示意图</Button>
                  </div>
                  <div className="pt-4">
                    <Button className="bg-primary hover:bg-primary/90" onClick={generatePlans} disabled={loadingPlan}>
                      {loadingPlan ? "正在生成..." : "生成图表方案"}
                      <ArrowRightIcon />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const UploadIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

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

const FileImageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export default function UploadPage() {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [fileObj, setFileObj] = useState<File | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0]
      setFileObj(f as any)
      void handleUploadReal(f as any)
    }
  }, [])

  const handleUploadReal = async (f: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(5)
      const fd = new FormData()
      fd.append("file", f)
      fd.append("language", "zh")
      const controller = new AbortController()
      const tick = setInterval(() => setUploadProgress((p) => Math.min(95, p + 2)), 300)
      const res = await fetch("/api/ingest", { method: "POST", body: fd, signal: controller.signal })
      clearInterval(tick)
      if (!res.ok) throw new Error(`解析失败: ${res.status}`)
      const data = await res.json()
      localStorage.setItem("paperData", JSON.stringify(data))
      setUploadProgress(100)
      setIsUploading(false)
      setUploadComplete(true)
    } catch (err) {
      console.error(err)
      setIsUploading(false)
    }
  }

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFileObj(f as any)
      void handleUploadReal(f as any)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileTextIcon />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">文档解析</h1>
                <p className="text-sm text-muted-foreground">上传并解析您的研究文档</p>
              </div>
            </Link>
            <Badge variant="outline" className="border-primary/30 text-primary">
              步骤 1/4
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Upload Area */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">上传研究文档</CardTitle>
              <CardDescription>支持PDF论文、Markdown文档和Excel数据表格</CardDescription>
            </CardHeader>
            <CardContent>
              {!uploadComplete ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {isUploading ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <UploadIcon />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-foreground mb-2">正在上传文档...</p>
                        <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                        <p className="text-sm text-muted-foreground mt-2">{uploadProgress}% 完成</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <UploadIcon />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-foreground mb-2">拖拽文件到此处或点击上传</p>
                        <p className="text-sm text-muted-foreground mb-4">支持 PDF、MD、XLSX 格式，最大 50MB</p>
                        <input id="file-input" type="file" accept=".pdf,.md,.markdown,.xlsx,.xls" className="hidden" onChange={handleSelectFile} />
                        <Button onClick={() => document.getElementById("file-input")?.click()} className="bg-primary hover:bg-primary/90">
                          选择文件
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground mb-2">文档上传成功！</p>
                    <p className="text-sm text-muted-foreground mb-4">research_paper.pdf (2.3 MB) 已成功解析</p>
                    <Link href="/summary">
                      <Button className="bg-primary hover:bg-primary/90">
                        查看解析结果
                        <ArrowRightIcon />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <FileTextIcon />
                </div>
                <CardTitle className="text-lg">PDF 论文</CardTitle>
                <CardDescription>自动提取论文结构、图表和数据表格</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                  <TableIcon />
                </div>
                <CardTitle className="text-lg">Excel 表格</CardTitle>
                <CardDescription>直接读取数据表格，支持多工作表</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mb-3">
                  <FileImageIcon />
                </div>
                <CardTitle className="text-lg">Markdown</CardTitle>
                <CardDescription>解析结构化文档和嵌入的数据表格</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const filePath = path.join(process.cwd(), '新页面', '分析页.html')
  const html = fs.readFileSync(filePath, 'utf-8')
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}


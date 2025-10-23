import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 内存存储调试日志（开发环境）
const debugLogs: any[] = [];
const MAX_LOGS = 100;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type, // 'prompt' | 'response' | 'parsed' | 'error'
      data,
    };

    debugLogs.unshift(logEntry);
    if (debugLogs.length > MAX_LOGS) {
      debugLogs.pop();
    }

    return NextResponse.json({ success: true, id: logEntry.id });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const type = searchParams.get('type');

  let filtered = debugLogs;
  if (type) {
    filtered = debugLogs.filter(log => log.type === type);
  }

  return NextResponse.json({
    logs: filtered.slice(0, limit),
    total: debugLogs.length,
  });
}

export async function DELETE() {
  debugLogs.length = 0;
  return NextResponse.json({ success: true, message: '已清空调试日志' });
}

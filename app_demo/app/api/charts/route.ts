import { NextRequest, NextResponse } from "next/server";
import { jobs, genId, ChartJob } from "./_store";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const summary_text: string = body?.summary_text || "";
    const language: string = body?.language || "zh";
    const preferences_text: string = body?.preferences_text || "";
    const table_datas: { headers: string[]; rows: string[][]; conclusions?: string[] }[] = body?.table_datas || [];

    if (!Array.isArray(table_datas) || table_datas.length === 0) {
      return NextResponse.json({ error: "table_datas 为空" }, { status: 400, headers: corsHeaders });
    }

    const id = genId();

    const job: ChartJob = {
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "queued",
      total: table_datas.length,
      completed: 0,
      nextIndex: 0,
      summary_text,
      language,
      preferences_text,
      table_datas,
      results: [],
    };

    jobs.set(id, job);

    return new NextResponse(JSON.stringify({ taskId: id }), {
      status: 202,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Duration': String(Date.now() - start)
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500, headers: corsHeaders });
  }
}


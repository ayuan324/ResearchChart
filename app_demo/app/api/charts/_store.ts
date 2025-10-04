export type ChartJobStatus = "queued" | "running" | "success" | "error";

export interface ChartJob {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: ChartJobStatus;
  error?: string;
  total: number;
  completed: number;
  nextIndex: number;
  // inputs
  summary_text: string;
  language: string;
  preferences_text: string;
  table_datas: { headers: string[]; rows: string[][]; conclusions?: string[] }[];
  // outputs
  theme_style?: any;
  results: Array<{ table_index: number; title: string; chart_type: string; spec: any }>;
}

function getGlobalStore(): Map<string, ChartJob> {
  const g = globalThis as any;
  if (!g.__CHART_JOBS__) {
    g.__CHART_JOBS__ = new Map<string, ChartJob>();
  }
  return g.__CHART_JOBS__ as Map<string, ChartJob>;
}

export const jobs = getGlobalStore();

export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}


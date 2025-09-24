from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Iterable, Literal, Sequence
import re

import requests


OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-4o"


class LLMError(RuntimeError):
    pass


@dataclass
class LiteratureUnderstandingRequest:
    document_chunks: Iterable[str]
    language: Literal["zh", "en"] = "zh"
    model: str = DEFAULT_MODEL
    temperature: float = 0.1


@dataclass
class ChartPlanningRequest:
    summary_text: str
    table_conclusions: Sequence[Sequence[str]]
    table_schemas: Sequence[Sequence[str]] | None = None
    language: Literal["zh", "en"] = "zh"
    model: str = DEFAULT_MODEL
    temperature: float = 0.2


@dataclass
class TableConclusionsRequest:
    tables_markdown: Iterable[str]
    language: Literal["zh", "en"] = "zh"
    model: str = DEFAULT_MODEL
    temperature: float = 0.2


def _build_headers() -> dict[str, str]:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise LLMError("OPENROUTER_API_KEY is not set. Please export your OpenRouter key before running the app.")
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def _post_chat_completion(payload: dict) -> str:
    try:
        response = requests.post(OPENROUTER_API_URL, headers=_build_headers(), json=payload, timeout=60)
    except requests.RequestException as exc:
        raise LLMError(f"Failed to reach OpenRouter: {exc}") from exc
    if response.status_code >= 400:
        raise LLMError(f"OpenRouter request failed: {response.status_code} {response.text}")
    data = response.json()
    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError) as exc:
        raise LLMError(f"Unexpected OpenRouter response: {data}") from exc


def _literature_prompt(language: Literal["zh", "en"], chunk: str) -> str:
    if language == "zh":
        return (
            "你是科研助理。请阅读以下文本片段：\n"
            "- 用 5-8 句话总结研究背景、方法、实验设置及核心发现。\n"
            "- 仅输出自然语言摘要，不要输出任何 JSON、表格或代码块。\n"
            "文本：```" + chunk + "```"
        )
    return (
        "You are a research assistant. Read the snippet and produce a 5-8 sentence summary covering background, method, setup, and key findings."
        " Output plain natural language only. Do NOT output any JSON, tables, or code blocks.\nText: ```" + chunk + "```"
    )


def _chart_prompt(language: Literal["zh", "en"], summary: str, tables_json: str, schemas_json: str) -> str:
    if language == "zh":
        return (
            "你是顶级论文的可视化设计师。根据‘研究摘要’与‘各表格结论’，提出 3 套图表方案。\n"
            "要求：\n"
            "- 每套方案必须是 JSON 对象，且仅输出 JSON 数组（严格 3 个对象）。\n"
            "- 字段：title, goal, pitch, charts（数组，长度1-3），data_mapping（对象，含 x, y, hue 可选）, layout（rows, cols, subplots 可选）, style_notes, annotation。\n"
            "- 其中 pitch 为一口语化一句话描述，格式类似：‘ACC+F1 指标，通过折线图与柱状图与散点图结合，展示泛化优势’。\n"
            "- data_mapping 中的字段名应来自表头（见 schemas）。\n"
            "研究摘要：```" + summary + "```\n"
            "各表格结论（JSON）：```" + tables_json + "```\n"
            "各表格表头（JSON）：```" + schemas_json + "```\n"
            "仅返回 JSON 数组（3 个对象），不要任何解释文字。"
        )
    return (
        "You are an elite visualization designer. Using the summary and per-table conclusions, propose 3 visualization plans.\n"
        "Output: a JSON array of exactly 3 objects. Fields: title, goal, pitch (one-sentence like 'ACC+F1 metrics, combining line+bar+scatter to show ...'),"
        " charts (1-3), data_mapping (x, y, hue optional; names must come from schemas), layout (rows, cols, subplots optional), style_notes, annotation.\n"
        "Summary: ```" + summary + "```\nTable conclusions JSON: ```" + tables_json + "```\nSchemas JSON: ```" + schemas_json + "```\n"
        "Return JSON array only, no extra text."
    )


def _table_conclusion_prompt(language: Literal["zh", "en"], table_markdown: str) -> str:
    if language == "zh":
        return (
            "你是科研助理。请阅读下列表格（Markdown），给出不超过 6 条精炼结论，聚焦于关键比较、趋势与显著差异。\n"
            "仅输出 JSON 数组（字符串列表），不要包含任何说明文字或 Markdown。\n"
            "表格：```\n" + table_markdown + "\n```"
        )
    return (
        "You are a research assistant. Read the following Markdown table and produce up to 6 concise conclusions,"
        " focusing on key comparisons, trends, and significant differences. Output JSON array of strings only,"
        " with no extra text or markdown.\nTable:```\n" + table_markdown + "\n```"
    )


def _normalize_text(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip().lower()


def _deduplicate_responses(responses: list[str]) -> str:
    seen: set[str] = set()
    ordered: list[str] = []
    for resp in responses:
        parts = re.split(r"\n{2,}", resp.strip())
        for p in parts:
            p = p.strip()
            if not p:
                continue
            norm = _normalize_text(p)
            if norm in seen:
                continue
            seen.add(norm)
            ordered.append(p)
    return "\n\n".join(ordered)


def generate_summary_and_metrics(request: LiteratureUnderstandingRequest) -> tuple[str, list[dict]]:
    combined_summary_parts: list[str] = []
    for chunk in request.document_chunks:
        payload = {
            "model": request.model,
            "temperature": request.temperature,
            "messages": [
                {"role": "system", "content": "You assist with research paper analysis."},
                {"role": "user", "content": _literature_prompt(request.language, chunk)},
            ],
        }
        response = _post_chat_completion(payload)
        combined_summary_parts.append(response.strip())
    deduped = _deduplicate_responses(combined_summary_parts)
    return deduped, []


def generate_chart_plans(request: ChartPlanningRequest) -> list[dict]:
    tables_json = json.dumps(list(list(x) for x in request.table_conclusions), ensure_ascii=False)
    schemas_json = json.dumps(list(list(x) for x in (request.table_schemas or [])), ensure_ascii=False)
    payload = {
        "model": request.model,
        "temperature": request.temperature,
        "messages": [
            {"role": "system", "content": "You design publication-quality scientific visualisations."},
            {"role": "user", "content": _chart_prompt(request.language, request.summary_text, tables_json, schemas_json)},
        ],
    }
    response = _post_chat_completion(payload)
    return _parse_json_array(response)


def _split_summary_and_metrics(response: str) -> tuple[str, list[dict]]:
    json_start = response.find("[")
    json_data: list[dict] = []
    if json_start != -1:
        text_part = response[:json_start].strip()
        json_part = response[json_start:]
        json_data = _parse_json_array(json_part)
    else:
        text_part = response.strip()
    return text_part, json_data


def _parse_json_array(candidate: str) -> list:
    candidate = candidate.strip()
    if not candidate:
        return []
    start = candidate.find("[")
    end = candidate.rfind("]")
    if start == -1 or end == -1:
        raise LLMError("Could not locate JSON array in LLM response.")
    json_str = candidate[start : end + 1]
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as exc:
        raise LLMError("Failed to decode JSON array from LLM response.") from exc


def generate_table_conclusions(request: TableConclusionsRequest) -> list[list[str]]:
    results: list[list[str]] = []
    for table_md in request.tables_markdown:
        payload = {
            "model": request.model,
            "temperature": request.temperature,
            "messages": [
                {"role": "system", "content": "You assist with research paper analysis."},
                {"role": "user", "content": _table_conclusion_prompt(request.language, table_md)},
            ],
        }
        response = _post_chat_completion(payload)
        arr = _parse_json_array(response)
        conclusions: list[str]
        if isinstance(arr, list) and (not arr or isinstance(arr[0], str)):
            conclusions = [str(x) for x in arr]
        else:
            if isinstance(arr, list) and arr and isinstance(arr[0], dict) and "conclusion" in arr[0]:
                conclusions = [str(x.get("conclusion", "")) for x in arr if str(x.get("conclusion", "")).strip()]
            else:
                conclusions = [line.strip("- ") for line in response.splitlines() if line.strip()][:6]
        results.append(conclusions)
    return results


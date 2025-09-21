"""OpenRouter-powered LLM helpers used by the Streamlit demo."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Iterable, Literal

import requests

from .document_parser import metrics_to_json

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-4o"


class LLMError(RuntimeError):
    """Raised when the OpenRouter API fails."""


@dataclass
class LiteratureUnderstandingRequest:
    """Input payload for summarising research documents."""

    document_chunks: Iterable[str]
    language: Literal["zh", "en"] = "zh"
    model: str = DEFAULT_MODEL
    temperature: float = 0.1


@dataclass
class ChartPlanningRequest:
    """Input payload for generating chart proposals."""

    summary_text: str
    metrics: Iterable[dict]
    language: Literal["zh", "en"] = "zh"
    model: str = DEFAULT_MODEL
    temperature: float = 0.2


def _build_headers() -> dict[str, str]:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise LLMError(
            "OPENROUTER_API_KEY is not set. Please export your OpenRouter key before running the app."
        )
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def _post_chat_completion(payload: dict) -> str:
    try:
        response = requests.post(OPENROUTER_API_URL, headers=_build_headers(), json=payload, timeout=60)
    except requests.RequestException as exc:  # pragma: no cover - network failure handling
        raise LLMError(f"Failed to reach OpenRouter: {exc}") from exc
    if response.status_code >= 400:
        raise LLMError(f"OpenRouter request failed: {response.status_code} {response.text}")
    data = response.json()
    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError) as exc:  # pragma: no cover - defensive branch
        raise LLMError(f"Unexpected OpenRouter response: {data}") from exc


def _literature_prompt(language: Literal["zh", "en"], chunk: str) -> str:
    if language == "zh":
        return (
            "你是科研助理。请阅读以下文本片段，完成:\n"
            "1. 用 5-8 句话总结研究背景、方法、实验设置。\n"
            "2. 列出所有关键量化指标，使用 JSON 数组表示，每个对象包含字段 metric, dataset, value, std, note。\n"
            "文本：```" + chunk + "```\n"
            "若信息不足，请在 note 中说明\"信息不足\"。"
        )
    return (
        "You are a research assistant. Read the following text snippet and deliver:\n"
        "1. A 5-8 sentence summary covering research background, methodology, and experimental setup.\n"
        "2. A JSON array listing key quantitative metrics with fields metric, dataset, value, std, note.\n"
        "Text: ```"
        + chunk
        + "```\nIf data is insufficient, note \"insufficient information\" in the note field."
    )


def _chart_prompt(language: Literal["zh", "en"], summary: str, metrics_json: str) -> str:
    if language == "zh":
        return (
            "你是顶级论文的可视化设计师。根据以下研究摘要与量化数据，提出 3 套图表方案。\n"
            "每套方案包含: title, goal, chart_type, layout, data_mapping, style_notes, annotation。\n"
            "摘要：```"
            + summary
            + "```\n指标 JSON：```"
            + metrics_json
            + "```\n输出 JSON 数组，包含 3 个方案。"
        )
    return (
        "You are an elite visualization designer for top-tier research papers. Based on the summary and quantitative data,"
        " propose three visualization plans. Each plan must include title, goal, chart_type, layout, data_mapping,"
        " style_notes, and annotation.\nSummary: ```"
        + summary
        + "```\nMetrics JSON: ```"
        + metrics_json
        + "```\nReturn a JSON array with exactly three plans."
    )


def generate_summary_and_metrics(request: LiteratureUnderstandingRequest) -> tuple[str, list[dict]]:
    """Aggregate chunk-level responses into a single summary and metrics list."""

    combined_summary_parts: list[str] = []
    metrics: list[dict] = []
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
        summary, chunk_metrics = _split_summary_and_metrics(response)
        if summary:
            combined_summary_parts.append(summary)
        metrics.extend(chunk_metrics)
    return "\n\n".join(combined_summary_parts), metrics


def generate_chart_plans(request: ChartPlanningRequest) -> list[dict]:
    """Generate visualization plans based on aggregated summary and metrics."""

    metrics_json = metrics_to_json(request.metrics)
    payload = {
        "model": request.model,
        "temperature": request.temperature,
        "messages": [
            {"role": "system", "content": "You design publication-quality scientific visualisations."},
            {
                "role": "user",
                "content": _chart_prompt(request.language, request.summary_text, metrics_json),
            },
        ],
    }
    response = _post_chat_completion(payload)
    return _parse_json_array(response)


def _split_summary_and_metrics(response: str) -> tuple[str, list[dict]]:
    """Split a combined text response into prose summary and metrics JSON."""

    json_start = response.find("[")
    json_data: list[dict] = []
    if json_start != -1:
        text_part = response[:json_start].strip()
        json_part = response[json_start:]
        json_data = _parse_json_array(json_part)
    else:
        text_part = response.strip()
    return text_part, json_data


def _parse_json_array(candidate: str) -> list[dict]:
    """Attempt to parse a JSON array from the provided string."""

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

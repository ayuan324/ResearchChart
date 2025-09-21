"""Utilities for parsing uploaded research documents into text blocks."""

from __future__ import annotations

import io
import json
from dataclasses import dataclass
from typing import Iterable, List

from pypdf import PdfReader


@dataclass
class ParsedDocument:
    """Container for extracted textual content and any structured tables."""

    text_blocks: List[str]
    tables: List[str]


def extract_text_from_pdf(file_obj: io.BytesIO) -> ParsedDocument:
    """Extract textual content from a PDF file-like object."""

    reader = PdfReader(file_obj)
    blocks: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        if text:
            blocks.append(text.strip())
    return ParsedDocument(text_blocks=blocks, tables=[])


def extract_text_from_plain_text(content: str) -> ParsedDocument:
    """Wrap plain text into a ParsedDocument."""

    blocks = [chunk.strip() for chunk in content.split("\n\n") if chunk.strip()]
    return ParsedDocument(text_blocks=blocks, tables=[])


def normalise_metrics(metrics: Iterable[dict]) -> list[dict]:
    """Ensure metric records conform to the expected schema."""

    normalised: list[dict] = []
    for entry in metrics:
        metric = {
            "metric": entry.get("metric") or entry.get("name") or "unknown",
            "dataset": entry.get("dataset") or entry.get("task") or "overall",
            "value": entry.get("value"),
            "std": entry.get("std"),
            "note": entry.get("note") or entry.get("method") or entry.get("model") or "",
        }
        normalised.append(metric)
    return normalised


def chunk_text(blocks: Iterable[str], max_chars: int = 4000) -> list[str]:
    """Chunk textual blocks into LLM-friendly segments respecting max length."""

    chunks: list[str] = []
    buffer: list[str] = []
    current_len = 0
    for block in blocks:
        if current_len + len(block) > max_chars and buffer:
            chunks.append("\n\n".join(buffer))
            buffer = [block]
            current_len = len(block)
        else:
            buffer.append(block)
            current_len += len(block)
    if buffer:
        chunks.append("\n\n".join(buffer))
    return chunks


def metrics_to_json(metrics: Iterable[dict]) -> str:
    """Serialize metrics to JSON for prompt usage."""

    return json.dumps(list(metrics), ensure_ascii=False, indent=2)

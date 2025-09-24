from __future__ import annotations

import io
import json
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List

import pandas as pd


@dataclass
class ParsedDocument:
    text_blocks: List[str]
    tables: List[str]


LLAMAPARSE_API_KEY = "llx-bdd31TNjUvSPYHnXDnsc74DVJ9W7eOonxPl9TaPBz2wzr7qK"


ALLOWED_LLAMA_LANGS = {
    "af","az","bs","cs","cy","da","de","en","es","et","fr","ga","hr","hu","id","is","it","ku","la","lt","lv","mi","ms","mt","nl","no","oc","pi","pl","pt","ro","rs_latin","sk","sl","sq","sv","sw","tl","tr","uz","vi","ar","fa","ug","ur","bn","as","mni","ru","rs_cyrillic","be","bg","uk","mn","abq","ady","kbd","ava","dar","inh","che","lbe","lez","tab","tjk","hi","mr","ne","bh","mai","ang","bho","mah","sck","new","gom","sa","bgc","th","ch_sim","ch_tra","ja","ko","ta","te","kn",
}


def _resolve_llama_language(language: str | None) -> str:
    low = (language or "").lower()
    if low in {"zh", "ch", "cn", "zh_cn", "zh-hans"}:
        return "ch_sim"
    if low in {"zh_tw", "zh-hant"}:
        return "ch_tra"
    return low if low in ALLOWED_LLAMA_LANGS else "en"


def _is_table_line(line: str) -> bool:
    s = line.strip()
    if not s.startswith("|") or "|" not in s[1:]:
        return False
    return True


def _extract_tables_from_markdown_text(md: str) -> list[str]:
    tables: list[str] = []
    lines = md.splitlines()
    i = 0
    while i < len(lines):
        if _is_table_line(lines[i]):
            j = i
            block: list[str] = []
            while j < len(lines) and _is_table_line(lines[j]):
                block.append(lines[j])
                j += 1
            if any("---" in x for x in block[0:3]):
                table_md = "\n".join(block).strip()
                if table_md:
                    tables.append(table_md)
            i = j
        else:
            i += 1
    return tables


def extract_markdown_tables_from_blocks(blocks: Iterable[str]) -> list[str]:
    all_tables: list[str] = []
    for b in blocks:
        all_tables.extend(_extract_tables_from_markdown_text(b))
    return all_tables


def markdown_table_to_dataframe(md: str) -> pd.DataFrame:
    rows = []
    for raw in md.strip().splitlines():
        s = raw.strip()
        if not _is_table_line(s):
            continue
        if set(s.replace("|", "").strip()) <= {"-", ":", " "}:
            continue
        if s.startswith("|"):
            s = s[1:]
        if s.endswith("|"):
            s = s[:-1]
        cells = [c.strip() for c in s.split("|")]
        rows.append(cells)
    if not rows:
        return pd.DataFrame()
    header = rows[0]
    data = [r for r in rows[1:] if len(r) == len(header)]
    df = pd.DataFrame(data, columns=header)
    new_cols: list[str] = []
    used: dict[str, int] = {}
    for i, col in enumerate(df.columns):
        name = (col or "").strip() or f"col{i+1}"
        base = name
        if base in used:
            used[base] += 1
            name = f"{base}_{used[base]}"
        else:
            used[base] = 1
        new_cols.append(name)
    df.columns = new_cols
    return df


def parse_pdf_with_llamaparse(
    file_bytes: bytes,
    language: str = "en",
    api_key: str | None = None,
    output_md_path: str | os.PathLike[str] | None = None,
) -> ParsedDocument:
    if api_key is None:
        api_key = os.environ.get("LLAMA_CLOUD_API_KEY") or os.environ.get("LLAMAPARSE_API_KEY") or LLAMAPARSE_API_KEY
    if not api_key:
        raise RuntimeError("未找到 LlamaParse API Key，请设置 LLAMA_CLOUD_API_KEY/LLAMAPARSE_API_KEY 或在代码中提供。")
    try:
        from llama_cloud_services import LlamaParse
    except ImportError as exc:
        raise RuntimeError("缺少依赖：请先 `pip install llama-index`。") from exc
    tmp_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
        llama_language = _resolve_llama_language(language)
        parser = LlamaParse(api_key=api_key, num_workers=4, verbose=True, language=llama_language)
        result = parser.parse(tmp_path)
        markdown_documents = result.get_markdown_documents(split_by_page=True)
        blocks = [doc.text.strip() for doc in markdown_documents if getattr(doc, "text", "").strip()]
        if output_md_path is None:
            output_md_path = Path("docs/parsed/output.md")
        output_path = Path(output_md_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            for doc in markdown_documents:
                f.write(getattr(doc, "text", "") + "\n")
        tables = extract_markdown_tables_from_blocks(blocks)
        return ParsedDocument(text_blocks=blocks, tables=tables)
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass


essential_text_types = (".csv", ".tsv")


def extract_text_from_plain_text(content: str) -> ParsedDocument:
    blocks = [chunk.strip() for chunk in content.split("\n\n") if chunk.strip()]
    return ParsedDocument(text_blocks=blocks, tables=[])


def extract_from_upload(uploaded_file, language: str = "en", llama_api_key: str | None = None) -> ParsedDocument:
    file_suffix = (uploaded_file.name or "").lower()
    if file_suffix.endswith(".pdf"):
        stem = Path(uploaded_file.name).stem or "output"
        output_md = Path("docs/parsed") / f"{stem}.md"
        return parse_pdf_with_llamaparse(
            uploaded_file.getvalue(), language=language, api_key=llama_api_key, output_md_path=output_md
        )
    text = uploaded_file.getvalue().decode("utf-8", errors="ignore")
    if file_suffix.endswith(".csv") or file_suffix.endswith(".tsv"):
        sep = "," if file_suffix.endswith(".csv") else "\t"
        df = pd.read_csv(io.StringIO(text), sep=sep)
        text_payload = df.to_markdown(index=False)
    else:
        text_payload = text
    parsed = extract_text_from_plain_text(text_payload)
    out_dir = Path("docs/parsed")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{Path(uploaded_file.name).stem or 'output'}.md"
    with open(out_path, "w", encoding="utf-8") as f:
        for block in parsed.text_blocks:
            f.write(block + "\n\n")
    return parsed


def chunk_text(blocks: Iterable[str], max_chars: int = 4000) -> list[str]:
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


def normalise_metrics(metrics: Iterable[dict]) -> list[dict]:
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


def metrics_to_json(metrics: Iterable[dict]) -> str:
    return json.dumps(list(metrics), ensure_ascii=False, indent=2)


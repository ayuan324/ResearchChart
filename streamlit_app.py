"""Streamlit-based MVP demo for the ResearchChart agent."""

from __future__ import annotations

import io
import os
from typing import Iterable

import pandas as pd
import streamlit as st

from researchchart import (
    ChartPlanningRequest,
    LiteratureUnderstandingRequest,
    generate_chart_plans,
    generate_summary_and_metrics,
    render_chart_plan,
)
from researchchart.config import DEFAULT_STYLE_CONFIG
from researchchart.document_parser import ParsedDocument, chunk_text, extract_text_from_pdf, extract_text_from_plain_text
from researchchart.llm import LLMError

st.set_page_config(page_title="ResearchChart Demo", layout="wide")


def _init_session_state() -> None:
    st.session_state.setdefault("summary", "")
    st.session_state.setdefault("metrics", [])
    st.session_state.setdefault("plans", [])
    st.session_state.setdefault("selected_plan_index", 0)
    st.session_state.setdefault("render_result", None)
    st.session_state.setdefault("document_text", [])
    st.session_state.setdefault("api_key", os.environ.get("OPENROUTER_API_KEY", ""))


def _store_api_key(api_key: str) -> None:
    if api_key:
        os.environ["OPENROUTER_API_KEY"] = api_key
    st.session_state["api_key"] = api_key


def _load_document(uploaded_file) -> ParsedDocument:
    file_suffix = (uploaded_file.name or "").lower()
    if file_suffix.endswith(".pdf"):
        bytes_io = io.BytesIO(uploaded_file.getvalue())
        return extract_text_from_pdf(bytes_io)
    text = uploaded_file.getvalue().decode("utf-8", errors="ignore")
    if file_suffix.endswith((".csv", ".tsv")):
        sep = "," if file_suffix.endswith(".csv") else "\t"
        df = pd.read_csv(io.StringIO(text), sep=sep)
        text_payload = df.to_markdown(index=False)
    else:
        text_payload = text
    return extract_text_from_plain_text(text_payload)


def _display_metrics_table(metrics: Iterable[dict]) -> None:
    if not metrics:
        st.info("LLM 暂未返回量化指标。")
        return
    df = pd.DataFrame(metrics)
    st.dataframe(df)


def main() -> None:  # pragma: no cover - Streamlit entrypoint
    _init_session_state()

    st.title("ResearchChart 智能图表生成 Demo")
    st.markdown(
        "上传科研文档，自动完成摘要理解、图表方案规划，并生成符合学术风格的复合图表。"
    )

    with st.sidebar:
        st.header("配置")
        api_key_input = st.text_input("OpenRouter API Key", value=st.session_state["api_key"], type="password")
        if st.button("保存密钥"):
            _store_api_key(api_key_input)
            st.success("API 密钥已保存到当前会话。")
        language = st.selectbox("LLM 输出语言", options=["zh", "en"], format_func=lambda x: "中文" if x == "zh" else "English")
        model_name = st.text_input("模型名称", value="openai/gpt-4o")
        temperature = st.slider("生成温度", 0.0, 1.0, 0.2, 0.05)

    uploaded_file = st.file_uploader("上传论文或量化结果 (PDF/CSV/TXT)", type=["pdf", "csv", "tsv", "txt", "md"])

    if uploaded_file and st.button("解析文档", use_container_width=True):
        try:
            with st.spinner("解析文档并调用 LLM..."):
                parsed = _load_document(uploaded_file)
                st.session_state["document_text"] = parsed.text_blocks
                chunks = chunk_text(parsed.text_blocks)
                if not chunks:
                    st.warning("未从文档中解析到有效文本，请确认文件内容。")
                else:
                    request = LiteratureUnderstandingRequest(
                        document_chunks=chunks,
                        language=language,
                        model=model_name,
                    )
                    summary, metrics = generate_summary_and_metrics(request)
                    st.session_state["summary"] = summary
                    st.session_state["metrics"] = metrics
                    st.session_state["plans"] = []
                    st.session_state["render_result"] = None
                    st.success("文档解析完成。")
        except LLMError as error:
            st.error(f"LLM 调用失败: {error}")
        except Exception as error:  # pragma: no cover - UI feedback only
            st.error(f"解析文档时出现错误: {error}")

    if st.session_state["summary"]:
        st.subheader("研究摘要")
        st.write(st.session_state["summary"])

    if st.session_state["metrics"]:
        st.subheader("量化指标")
        _display_metrics_table(st.session_state["metrics"])

    if st.session_state["summary"] and st.session_state["metrics"]:
        if st.button("生成图表方案", use_container_width=True):
            try:
                with st.spinner("生成图表方案..."):
                    request = ChartPlanningRequest(
                        summary_text=st.session_state["summary"],
                        metrics=st.session_state["metrics"],
                        language=language,
                        model=model_name,
                        temperature=temperature,
                    )
                    plans = generate_chart_plans(request)
                    st.session_state["plans"] = plans
                    st.session_state["selected_plan_index"] = 0
                    st.session_state["render_result"] = None
                    st.success("已生成图表方案。")
            except LLMError as error:
                st.error(f"生成方案失败: {error}")
            except Exception as error:  # pragma: no cover - UI feedback only
                st.error(f"生成方案时出现异常: {error}")

    if st.session_state["plans"]:
        st.subheader("图表方案候选")
        plan_titles = [plan.get("title", f"方案 {idx + 1}") for idx, plan in enumerate(st.session_state["plans"])]
        selected_title = st.radio("选择一套方案", options=plan_titles)
        st.session_state["selected_plan_index"] = plan_titles.index(selected_title)

        selected_plan = st.session_state["plans"][st.session_state["selected_plan_index"]]
        with st.expander("方案详情", expanded=True):
            st.json(selected_plan)

        if st.button("生成图表", type="primary", use_container_width=True):
            try:
                with st.spinner("绘制图表..."):
                    result = render_chart_plan(
                        st.session_state["metrics"],
                        selected_plan,
                        style=DEFAULT_STYLE_CONFIG,
                    )
                    st.session_state["render_result"] = result
                    st.success("图表生成完成。")
            except Exception as error:  # pragma: no cover - UI feedback only
                st.error(f"绘制图表时出现异常: {error}")

    result = st.session_state.get("render_result")
    if result:
        st.subheader("图表预览与下载")
        st.image(str(result.image_path))
        col1, col2, col3 = st.columns(3)
        with col1:
            st.download_button(
                "下载 PNG",
                data=result.image_path.read_bytes(),
                file_name=result.image_path.name,
                mime="image/png",
            )
        with col2:
            st.download_button(
                "下载 SVG",
                data=result.svg_path.read_bytes(),
                file_name=result.svg_path.name,
                mime="image/svg+xml",
            )
        with col3:
            st.download_button(
                "下载 PDF",
                data=result.pdf_path.read_bytes(),
                file_name=result.pdf_path.name,
                mime="application/pdf",
            )


if __name__ == "__main__":  # pragma: no cover
    main()

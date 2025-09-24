"""Streamlit-based MVP demo for the ResearchChart agent."""

from __future__ import annotations

import io
import os
from typing import Iterable

import pandas as pd
import streamlit as st

from architecture.planning import (
    ChartPlanningRequest,
    LiteratureUnderstandingRequest,
    generate_chart_plans,
    generate_summary_and_metrics,
    LLMError,
)
from architecture.rendering import render_chart_plan
from architecture.ingestion import ParsedDocument, chunk_text, extract_from_upload, markdown_table_to_dataframe
from config import DEFAULT_STYLE_CONFIG

st.set_page_config(page_title="ResearchChart Demo", layout="wide")


def _init_session_state() -> None:
    st.session_state.setdefault("summary", "")
    st.session_state.setdefault("metrics", [])
    st.session_state.setdefault("plans", [])
    st.session_state.setdefault("selected_plan_index", 0)
    st.session_state.setdefault("render_result", None)
    st.session_state.setdefault("document_text", [])
    st.session_state.setdefault("tables", [])
    st.session_state.setdefault("table_conclusions", [])
    st.session_state.setdefault("table_schemas", [])
    st.session_state.setdefault("api_key", os.environ.get("OPENROUTER_API_KEY", ""))


def _store_api_key(api_key: str) -> None:
    if api_key:
        os.environ["OPENROUTER_API_KEY"] = api_key
    st.session_state["api_key"] = api_key




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
        language = st.selectbox("LLM 输出语言", options=["zh", "en"], index=1, format_func=lambda x: "中文" if x == "zh" else "English")
        model_name = st.text_input("模型名称", value="openai/gpt-4o")
        temperature = st.slider("生成温度", 0.0, 1.0, 0.2, 0.05)

    uploaded_file = st.file_uploader("上传论文 (仅支持 PDF)", type=["pdf"])

    if uploaded_file and st.button("解析文档", use_container_width=True):
        try:
            with st.spinner("解析文档并调用 LLM..."):
                parsed = extract_from_upload(uploaded_file, language=language)
                st.session_state["document_text"] = parsed.text_blocks
                st.session_state["tables"] = parsed.tables
                st.session_state["table_schemas"] = [list(markdown_table_to_dataframe(t).columns) for t in parsed.tables]
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
    if st.session_state["document_text"] or st.session_state["summary"] or st.session_state["plans"] or st.session_state.get("render_result"):
        tab_doc, tab_summary, tab_plans, tab_final = st.tabs(["解析全文", "摘要与表格", "图表方案", "最终图表"])

        with tab_doc:
            st.subheader("解析全文（Markdown）")
            if st.session_state["document_text"]:
                doc_text = "\n\n".join(st.session_state["document_text"]) or ""
                st.markdown(doc_text)
            else:
                st.info("解析完成后可在此查看全文。")

        with tab_summary:
            st.subheader("研究摘要 与 表格结论")
            if st.session_state["summary"]:
                st.write(st.session_state["summary"])
            if st.session_state["tables"]:
                from architecture.planning import TableConclusionsRequest, generate_table_conclusions
                try:
                    if not st.session_state.get("table_conclusions"):
                        with st.spinner("正在分析每张表格的结论..."):
                            tc_req = TableConclusionsRequest(
                                tables_markdown=st.session_state["tables"],
                                language=language,
                                model=model_name,
                                temperature=temperature,
                            )
                            st.session_state["table_conclusions"] = generate_table_conclusions(tc_req)
                except LLMError as e:
                    st.warning(f"生成表格结论失败：{e}")
                    st.session_state["table_conclusions"] = [[] for _ in st.session_state["tables"]]
                for idx, tbl_md in enumerate(st.session_state["tables"]):
                    st.markdown(f"**表 {idx + 1}**")
                    df = markdown_table_to_dataframe(tbl_md)
                    if not df.empty:
                        st.dataframe(df, use_container_width=True)
                    else:
                        st.code(tbl_md, language="markdown")
                    conclusions = st.session_state["table_conclusions"][idx] if idx < len(st.session_state["table_conclusions"]) else []
                    if conclusions:
                        st.markdown("- " + "\n- ".join(conclusions))
                    st.divider()
            if st.button("生成图表方案", use_container_width=True):
                try:
                    with st.spinner("生成图表方案..."):
                        request = ChartPlanningRequest(
                            summary_text=st.session_state.get("summary", ""),
                            table_conclusions=st.session_state.get("table_conclusions", []),
                            table_schemas=st.session_state.get("table_schemas", []),
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
                except Exception as error:
                    st.error(f"生成方案时出现异常: {error}")

        with tab_plans:
            st.subheader("图表方案候选")
            if not st.session_state["plans"]:
                st.info("请先在“摘要与表格”页生成图表方案。")
            else:
                plan_pitches = [plan.get("pitch") or plan.get("title", f"方案 {idx + 1}") for idx, plan in enumerate(st.session_state["plans"])]
                selected_pitch = st.radio("选择一套方案（推荐语）", options=plan_pitches)
                st.session_state["selected_plan_index"] = plan_pitches.index(selected_pitch)
                selected_plan = st.session_state["plans"][st.session_state["selected_plan_index"]]
                with st.expander("方案详情", expanded=True):
                    st.markdown(f"**标题**：{selected_plan.get('title','(未命名)')}")
                    if selected_plan.get("pitch"):
                        st.markdown(f"**推荐语**：{selected_plan['pitch']}")
                    st.json(selected_plan)
                if st.button("生成图表", type="primary", use_container_width=True):
                    try:
                        with st.spinner("绘制图表..."):
                            if st.session_state.get("metrics"):
                                result = render_chart_plan(
                                    st.session_state["metrics"],
                                    selected_plan,
                                    style=DEFAULT_STYLE_CONFIG,
                                )
                            else:
                                from architecture.rendering import render_chart_plan_from_tables
                                result = render_chart_plan_from_tables(
                                    st.session_state.get("tables", []),
                                    selected_plan,
                                    style=DEFAULT_STYLE_CONFIG,
                                )
                            st.session_state["render_result"] = result
                            st.success("图表生成完成。")
                    except Exception as error:
                        st.error(f"绘制图表时出现异常: {error}")

        with tab_final:
            st.subheader("最终图表")
            result = st.session_state.get("render_result")
            if result:
                st.image(str(result.image_path))
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.download_button("下载 PNG", data=result.image_path.read_bytes(), file_name=result.image_path.name, mime="image/png")
                with col2:
                    st.download_button("下载 SVG", data=result.svg_path.read_bytes(), file_name=result.svg_path.name, mime="image/svg+xml")
                with col3:
                    st.download_button("下载 PDF", data=result.pdf_path.read_bytes(), file_name=result.pdf_path.name, mime="application/pdf")
            else:
                st.info("请先在“图表方案”页生成图表。")

        st.stop()


    if st.session_state["document_text"]:
        st.subheader("解析全文（Markdown）")
        doc_text = "\n\n".join(st.session_state["document_text"]) or ""
        st.markdown(doc_text)

    if st.session_state["summary"]:
        st.subheader("研究摘要")
        st.write(st.session_state["summary"])

    if st.session_state["tables"]:
        from architecture.planning import TableConclusionsRequest, generate_table_conclusions
        st.subheader("表格与结论")
        try:
            if not st.session_state.get("table_conclusions"):
                with st.spinner("正在分析每张表格的结论..."):
                    tc_req = TableConclusionsRequest(
                        tables_markdown=st.session_state["tables"],
                        language=language,
                        model=model_name,
                        temperature=temperature,
                    )
                    st.session_state["table_conclusions"] = generate_table_conclusions(tc_req)
        except LLMError as e:
            st.warning(f"生成表格结论失败：{e}")
            st.session_state["table_conclusions"] = [[] for _ in st.session_state["tables"]]

        for idx, tbl_md in enumerate(st.session_state["tables"]):
            st.markdown(f"**表 {idx + 1}**")
            df = markdown_table_to_dataframe(tbl_md)
            if not df.empty:
                st.dataframe(df, use_container_width=True)
            else:
                st.code(tbl_md, language="markdown")
            conclusions = st.session_state["table_conclusions"][idx] if idx < len(st.session_state["table_conclusions"]) else []
            if conclusions:
                st.markdown("- " + "\n- ".join(conclusions))
            st.divider()

    if st.session_state["summary"] and (st.session_state.get("table_conclusions") or st.session_state.get("tables")):
        if st.button("生成图表方案", use_container_width=True):
            try:
                with st.spinner("生成图表方案..."):
                    request = ChartPlanningRequest(
                        summary_text=st.session_state["summary"],
                        table_conclusions=st.session_state.get("table_conclusions", []),
                        table_schemas=st.session_state.get("table_schemas", []),
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
        plan_pitches = [plan.get("pitch") or plan.get("title", f"方案 {idx + 1}") for idx, plan in enumerate(st.session_state["plans"])]
        selected_pitch = st.radio("选择一套方案（推荐语）", options=plan_pitches)
        st.session_state["selected_plan_index"] = plan_pitches.index(selected_pitch)

        selected_plan = st.session_state["plans"][st.session_state["selected_plan_index"]]
        with st.expander("方案详情", expanded=True):
            st.markdown(f"**标题**：{selected_plan.get('title','(未命名)')}")
            if selected_plan.get("pitch"):
                st.markdown(f"**推荐语**：{selected_plan['pitch']}")
            st.json(selected_plan)

        if st.button("生成图表", type="primary", use_container_width=True):
            try:
                with st.spinner("绘制图表..."):
                    if st.session_state.get("metrics"):
                        result = render_chart_plan(
                            st.session_state["metrics"],
                            selected_plan,
                            style=DEFAULT_STYLE_CONFIG,
                        )
                    else:
                        from architecture.rendering import render_chart_plan_from_tables
                        result = render_chart_plan_from_tables(
                            st.session_state.get("tables", []),
                            selected_plan,
                            style=DEFAULT_STYLE_CONFIG,
                        )
                    st.session_state["render_result"] = result
                    st.success("图表生成完成。")
            except Exception as error:  # pragma: no cover - UI feedback only
                st.error(f"绘制图表时出现异常: {error}")



if __name__ == "__main__":  # pragma: no cover
    main()

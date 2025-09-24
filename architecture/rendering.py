from __future__ import annotations

import math
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import matplotlib.pyplot as plt
import pandas as pd

from config import DEFAULT_STYLE_CONFIG, StyleConfig, apply_matplotlib_style
from architecture.ingestion import normalise_metrics, markdown_table_to_dataframe


@dataclass
class RenderResult:
    image_path: Path
    svg_path: Path
    pdf_path: Path


class ChartRenderingError(RuntimeError):
    pass


def render_chart_plan(
    metrics: Iterable[dict],
    plan: dict,
    *,
    style: StyleConfig = DEFAULT_STYLE_CONFIG,
    output_dir: str | os.PathLike[str] | None = None,
) -> RenderResult:
    apply_matplotlib_style(style)
    df = _metrics_to_dataframe(metrics)
    if df.empty:
        raise ChartRenderingError("No quantitative metrics were provided for rendering.")
    figure = _plot_metrics_dataframe(df, plan, style)
    output_directory = Path(output_dir) if output_dir else Path(tempfile.mkdtemp(prefix="researchchart_"))
    output_directory.mkdir(parents=True, exist_ok=True)
    title_slug = _slugify(plan.get("title") or "chart")
    png_path = output_directory / f"{title_slug}.png"
    svg_path = output_directory / f"{title_slug}.svg"
    pdf_path = output_directory / f"{title_slug}.pdf"
    figure.savefig(png_path, dpi=style.dpi, bbox_inches="tight")
    figure.savefig(svg_path, bbox_inches="tight")
    figure.savefig(pdf_path, bbox_inches="tight")
    plt.close(figure)
    return RenderResult(image_path=png_path, svg_path=svg_path, pdf_path=pdf_path)


def _metrics_to_dataframe(metrics: Iterable[dict]) -> pd.DataFrame:
    normalised = normalise_metrics(metrics)
    df = pd.DataFrame(normalised)
    if "value" in df.columns:
        df["value_numeric"] = pd.to_numeric(df["value"], errors="coerce")
    else:
        df["value_numeric"] = pd.Series(dtype=float)
    df = df.dropna(subset=["value_numeric"])
    if "note" not in df.columns:
        df["note"] = ""
    df["note"].fillna("", inplace=True)
    if "dataset" not in df.columns:
        df["dataset"] = "overall"
    if "metric" not in df.columns:
        df["metric"] = "metric"
    return df


def _plot_metrics_dataframe(df: pd.DataFrame, plan: dict, style: StyleConfig) -> plt.Figure:
    metrics = sorted(df["metric"].unique())
    cols = min(2, len(metrics))
    rows = math.ceil(len(metrics) / cols)
    figure, axes = plt.subplots(rows, cols, figsize=(6 * cols, 4 * rows), squeeze=False)
    chart_title = plan.get("title") or "Research Results"
    figure.suptitle(chart_title, fontsize=style.title_size)
    for idx, metric in enumerate(metrics):
        ax = axes[idx // cols][idx % cols]
        metric_df = df[df["metric"] == metric]
        _plot_grouped_bar(ax, metric_df, style)
        ax.set_title(metric, fontsize=style.subtitle_size)
        ax.set_xlabel("Dataset")
        ax.set_ylabel(metric)
        ax.grid(True, linestyle="--", alpha=0.4, color=style.grid_color)
    for j in range(len(metrics), rows * cols):
        figure.delaxes(axes[j // cols][j % cols])
    annotations = plan.get("annotation")
    if isinstance(annotations, str) and annotations:
        figure.text(0.5, 0.02, annotations, ha="center", fontsize=style.tick_label_size)
    figure.tight_layout(rect=[0, 0.05, 1, 0.96])
    return figure


def _plot_grouped_bar(ax: plt.Axes, metric_df: pd.DataFrame, style: StyleConfig) -> None:
    methods = metric_df["note"].replace("", "baseline").unique()
    datasets = metric_df["dataset"].unique()
    width = 0.8 / max(len(methods), 1)
    x = range(len(datasets))
    for idx, method in enumerate(methods):
        subset = metric_df[metric_df["note"] == method]
        values = [subset[subset["dataset"] == dataset]["value_numeric"].mean() for dataset in datasets]
        offsets = [i + idx * width for i in x]
        color = style.palette[idx % len(style.palette)]
        ax.bar(offsets, values, width=width, label=method or "baseline", color=color)
        std_values = []
        for dataset in datasets:
            if "std" in subset.columns:
                raw_std = subset[subset["dataset"] == dataset]["std"]
                numeric_std = pd.to_numeric(raw_std, errors="coerce").dropna()
                std_values.append(numeric_std.mean() if not numeric_std.empty else None)
            else:
                std_values.append(None)
        if any(value is not None for value in std_values):
            ax.errorbar(offsets, values, yerr=std_values, fmt="none", ecolor="black", capsize=3)
    ax.set_xticks([i + width * (len(methods) - 1) / 2 for i in x])
    ax.set_xticklabels(datasets, rotation=15)
    ax.legend()


def _slugify(value: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "-" for ch in value).strip("-") or "chart"


def _to_name(v):
    if isinstance(v, (list, tuple)):
        v = v[0] if v else None
    elif isinstance(v, set):
        v = next(iter(v), None)
    if v is None:
        return None
    return str(v)


def render_chart_plan_from_tables(
    tables_markdown: Iterable[str],
    plan: dict,
    *,
    style: StyleConfig = DEFAULT_STYLE_CONFIG,
    output_dir: str | os.PathLike[str] | None = None,
) -> RenderResult:
    apply_matplotlib_style(style)
    dfs: list[pd.DataFrame] = []
    for md in tables_markdown:
        df = markdown_table_to_dataframe(md)
        if not df.empty:
            dfs.append(df)
    if not dfs:
        raise ChartRenderingError("No valid tables available for rendering.")
    mapping = plan.get("data_mapping") or {}
    charts_obj = plan.get("charts")
    charts = charts_obj if isinstance(charts_obj, (list, tuple)) else ([charts_obj] if isinstance(charts_obj, (dict, str)) else [])
    chart_type = _to_name(plan.get("chart_type"))
    if not chart_type and charts:
        first = charts[0]
        if isinstance(first, dict):
            chart_type = _to_name(first.get("chart_type") or first.get("type"))
            mapping = first.get("data_mapping") or mapping
        elif isinstance(first, str):
            chart_type = first
    x_name = _to_name(mapping.get("x") if isinstance(mapping, dict) else None)
    y_name = _to_name(mapping.get("y") if isinstance(mapping, dict) else None)
    hue_name = _to_name(mapping.get("hue") if isinstance(mapping, dict) else None)
    df_selected: pd.DataFrame | None = None
    if x_name and y_name:
        for df in dfs:
            if x_name in df.columns and y_name in df.columns and (hue_name is None or hue_name in df.columns):
                df_selected = df
                break
    if df_selected is None:
        for df in dfs:
            num_cols = [c for c in df.columns if pd.to_numeric(df[c], errors="coerce").notna().sum() > 0]
            if len(df.columns) >= 2 and len(num_cols) >= 1:
                df_selected = df
                if not x_name:
                    x_name = df.columns[0]
                if not y_name:
                    y_name = num_cols[0]
                break
    if df_selected is None or not x_name or not y_name:
        raise ChartRenderingError("Could not infer data mapping for rendering from tables.")
    x = df_selected[x_name]
    y = pd.to_numeric(df_selected[y_name], errors="coerce")
    mask = y.notna()
    x, y = x[mask], y[mask]
    fig, ax = plt.subplots(figsize=(8, 5))
    ctype = (chart_type or "bar").lower()
    if ctype in ("bar", "barplot", "column"):
        ax.bar(range(len(y)), y.values, color=style.palette[0])
        ax.set_xticks(range(len(x)))
        ax.set_xticklabels(x.astype(str).values, rotation=15)
    elif ctype in ("line", "lineplot"):
        ax.plot(range(len(y)), y.values, color=style.palette[0], marker="o")
        ax.set_xticks(range(len(x)))
        ax.set_xticklabels(x.astype(str).values, rotation=15)
    elif ctype in ("scatter", "scatterplot"):
        ax.scatter(range(len(y)), y.values, color=style.palette[0])
        ax.set_xticks(range(len(x)))
        ax.set_xticklabels(x.astype(str).values, rotation=15)
    else:
        ax.bar(range(len(y)), y.values, color=style.palette[0])
        ax.set_xticks(range(len(x)))
        ax.set_xticklabels(x.astype(str).values, rotation=15)
    ax.set_xlabel(str(x_name))
    ax.set_ylabel(str(y_name))
    title = plan.get("title") or plan.get("pitch") or "Research Results"
    ax.set_title(title, fontsize=style.subtitle_size)
    ax.grid(True, linestyle="--", alpha=0.4, color=style.grid_color)
    output_directory = Path(output_dir) if output_dir else Path(tempfile.mkdtemp(prefix="researchchart_"))
    output_directory.mkdir(parents=True, exist_ok=True)
    title_slug = _slugify(title)
    png_path = output_directory / f"{title_slug}.png"
    svg_path = output_directory / f"{title_slug}.svg"
    pdf_path = output_directory / f"{title_slug}.pdf"
    fig.savefig(png_path, dpi=style.dpi, bbox_inches="tight")
    fig.savefig(svg_path, bbox_inches="tight")
    fig.savefig(pdf_path, bbox_inches="tight")
    plt.close(fig)
    return RenderResult(image_path=png_path, svg_path=svg_path, pdf_path=pdf_path)


"""Utility for rendering charts described by LLM plans."""

from __future__ import annotations

import math
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import matplotlib.pyplot as plt
import pandas as pd

from .config import DEFAULT_STYLE_CONFIG, StyleConfig, apply_matplotlib_style
from .document_parser import normalise_metrics


@dataclass
class RenderResult:
    """Represents the output files generated for a chart plan."""

    image_path: Path
    svg_path: Path
    pdf_path: Path


class ChartRenderingError(RuntimeError):
    """Raised when chart generation fails."""


def render_chart_plan(
    metrics: Iterable[dict],
    plan: dict,
    *,
    style: StyleConfig = DEFAULT_STYLE_CONFIG,
    output_dir: str | os.PathLike[str] | None = None,
) -> RenderResult:
    """Render a composite chart according to the plan description."""

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
    # hide unused axes
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

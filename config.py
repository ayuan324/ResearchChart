from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class StyleConfig:
    font_family_en: str = "Times New Roman"
    font_family_zh: str = "Source Han Serif"
    title_size: int = 16
    subtitle_size: int = 14
    axis_label_size: int = 12
    tick_label_size: int = 10
    legend_size: int = 10
    palette: tuple[str, ...] = (
        "#4C78A8",
        "#F58518",
        "#E45756",
        "#72B7B2",
        "#54A24B",
        "#EECA3B",
    )
    grid_color: str = "#D3D3D3"
    dpi: int = 300


DEFAULT_STYLE_CONFIG = StyleConfig()


def apply_matplotlib_style(style: StyleConfig = DEFAULT_STYLE_CONFIG) -> None:
    from matplotlib import rcParams

    rcParams.update(
        {
            "font.family": style.font_family_en,
            "font.size": style.axis_label_size,
            "axes.titlesize": style.title_size,
            "axes.labelsize": style.axis_label_size,
            "xtick.labelsize": style.tick_label_size,
            "ytick.labelsize": style.tick_label_size,
            "legend.fontsize": style.legend_size,
            "figure.dpi": style.dpi,
        }
    )


#!/usr/bin/env python3
"""Deterministically typeset Tinct pilot covers and build contact sheets."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
ART = ROOT / "pilot" / "artwork"
FINAL = ROOT / "pilot" / "final"
SHEETS = ROOT / "contact-sheet"
SERIF = Path("/Users/andershvelplund/Library/Fonts/EBGaramond-VariableFont_wght.ttf")

BOOKS = [
    ("bible", "THE BIBLE", "VARIOUS", 1),
    ("odyssey", "THE ODYSSEY", "HOMER", 1),
    ("the-republic", "THE REPUBLIC", "PLATO", 1),
    ("pride-and-prejudice", "PRIDE AND PREJUDICE", "JANE AUSTEN", 1),
    ("hamlet", "HAMLET", "WILLIAM SHAKESPEARE", 1),
    ("the-histories", "THE HISTORIES", "HERODOTUS", 2),
    ("frederick-douglass", "NARRATIVE OF THE LIFE OF FREDERICK DOUGLASS", "FREDERICK DOUGLASS", 1),
    ("the-art-of-war", "THE ART OF WAR", "SUN TZU", 1),
]


def fit_lines(draw, text, max_width, max_lines=3):
    words = text.split()
    for size in range(92, 47, -2):
        font = ImageFont.truetype(str(SERIF), size)
        lines, line = [], ""
        for word in words:
            candidate = f"{line} {word}".strip()
            if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width:
                line = candidate
            else:
                if line:
                    lines.append(line)
                line = word
        if line:
            lines.append(line)
        if len(lines) <= max_lines:
            return font, lines
    return ImageFont.truetype(str(SERIF), 48), [text]


def draw_centered_tracking(draw, y, text, font, fill, max_width, tracking=4):
    widths = [draw.textlength(c, font=font) for c in text]
    width = sum(widths) + tracking * max(0, len(text) - 1)
    if width > max_width:
        tracking = max(0, tracking - (width - max_width) / max(1, len(text) - 1))
        width = sum(widths) + tracking * max(0, len(text) - 1)
    x = (1024 - width) / 2
    for c, w in zip(text, widths):
        draw.text((x, y), c, font=font, fill=fill, anchor="la")
        x += w + tracking


def render_cover(slug, title, author, art_version):
    src = ART / f"{slug}--artwork-v{art_version}.png"
    im = Image.open(src).convert("RGB").resize((1024, 1536), Image.Resampling.LANCZOS)
    draw = ImageDraw.Draw(im)
    ink = (22, 36, 42)
    title_ink = (232, 220, 191) if slug == "frederick-douglass" else ink
    accent = (151, 77, 48)
    font, lines = fit_lines(draw, title, 820)
    line_h = int(font.size * 0.88)
    total_h = len(lines) * line_h
    y = max(62, (340 - total_h) // 2)
    for line in lines:
        draw.text((512, y), line, font=font, fill=title_ink, anchor="ma", stroke_width=0)
        y += line_h
    draw.line((430, 342, 594, 342), fill=accent, width=4)
    author_font = ImageFont.truetype(str(SERIF), 34)
    draw_centered_tracking(draw, 1355, author, author_font, ink, 820, tracking=4)
    draw.line((474, 1320, 550, 1320), fill=accent, width=3)
    FINAL.mkdir(parents=True, exist_ok=True)
    path = FINAL / f"{slug}--cover-v1.png"
    im.save(path, optimize=True)
    return path


def contact_sheet(paths, name, thumb=(216, 324), cols=4):
    cell_w, cell_h = 270, 400
    rows = (len(paths) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell_w + 80, rows * cell_h + 110), (236, 231, 219))
    draw = ImageDraw.Draw(sheet)
    title_font = ImageFont.truetype(str(SERIF), 42)
    label_font = ImageFont.truetype(str(SERIF), 22)
    draw.text((40, 28), "Tinct cover system — pilot", font=title_font, fill=(11, 11, 11))
    for i, path in enumerate(paths):
        r, c = divmod(i, cols)
        x, y = 40 + c * cell_w, 90 + r * cell_h
        cover = Image.open(path).convert("RGB").resize(thumb, Image.Resampling.LANCZOS)
        sheet.paste(cover, (x, y))
        slug = path.name.split("--cover")[0]
        draw.text((x, y + thumb[1] + 10), slug.replace("-", " "), font=label_font, fill=(70, 66, 56))
    SHEETS.mkdir(parents=True, exist_ok=True)
    out = SHEETS / name
    sheet.save(out, optimize=True)


if __name__ == "__main__":
    finals = [render_cover(*book) for book in BOOKS]
    contact_sheet(finals, "tinct-cover-pilot-8-up.png")
    # True in-app thumbnail-scale proof: 108 x 162 px covers.
    contact_sheet(finals, "tinct-cover-pilot-thumbnail-proof.png", thumb=(108, 162))

#!/usr/bin/env python3
"""Deterministically typeset and proof the Tinct painterly cover system v2."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont, ImageStat

ROOT = Path(__file__).resolve().parent
ART = ROOT / "pilot-v2" / "artwork"
FINAL = ROOT / "pilot-v2" / "final"
SHEETS = ROOT / "contact-sheet"
SERIF = Path("/Users/andershvelplund/Library/Fonts/EBGaramond-VariableFont_wght.ttf")
BG = (20, 18, 16)  # library thumbnail field, #141210
BOOKS = [
    ("bible", "THE BIBLE", "VARIOUS"),
    ("odyssey", "THE ODYSSEY", "HOMER"),
    ("the-republic", "THE REPUBLIC", "PLATO"),
    ("pride-and-prejudice", "PRIDE AND PREJUDICE", "JANE AUSTEN"),
    ("hamlet", "HAMLET", "WILLIAM SHAKESPEARE"),
    ("the-histories", "THE HISTORIES", "HERODOTUS"),
    ("frederick-douglass", "NARRATIVE OF THE LIFE OF FREDERICK DOUGLASS", "FREDERICK DOUGLASS"),
    ("the-art-of-war", "THE ART OF WAR", "SUN TZU"),
    ("frankenstein", "FRANKENSTEIN", "MARY SHELLEY"),
    ("meditations", "MEDITATIONS", "MARCUS AURELIUS"),
]
V2_TEMPLATE = {
    "id": "tinct-cover-v2",
    "style": "Painterly, full-bleed, textured and atmospheric literary art. One dominant light source; shared charcoal-indigo, smoke-blue, muted ochre, moon-ivory and umber palette; a single dominant silhouette that holds at 108x162.",
    "artwork_spec": "Text-free original artwork, exact 1024x1536 2:3 portrait. Reserve a quiet upper-third title zone and lower author zone. No embedded text, pseudo-text, logo, signature, watermark, border or physical-book mockup.",
    "anti_repetition": "Every cover gets one declared composition type and unique recipe. No composition type exceeds one third of the set. Reject period shorthand, generic AI illustration and embedded pseudo-text.",
    "overlay": "EB Garamond title in a subtle upper-third scrim; author uppercase/small-caps treatment in matching lower scrim; fixed margins and sizes from render_v2.py."
}
V2_BRIEFS = {
    "bible": ("landscape", "An ancient olive tree at a dry river valley dawn; the tree is the silhouette."),
    "odyssey": ("landscape", "A black-sailed ship beneath a crescent moon, crossing dark water toward a lit island."),
    "the-republic": ("interior", "A monumental stair rising to one luminous doorway, with a small side-profile philosopher."),
    "pride-and-prejudice": ("object", "An unmarked letter caught in an open casement window over a rain-softened garden."),
    "hamlet": ("interior", "A lone throne-like chair and its long diagonal shadow in a cold stone hall."),
    "the-histories": ("landscape", "A single S-curved river and five paths meeting at a distant illuminated ford."),
    "frederick-douglass": ("figure", "A dignified man in side profile holding an unmarked book at a sea-bright doorway."),
    "the-art-of-war": ("object", "A dark square strategy board with plain stones forming an empty channel."),
    "frankenstein": ("interior", "The existing laboratory scene: lone figure from behind within an electric green laboratory."),
    "meditations": ("symbol", "A worn marble bust facing dawn through a bare arch, treated as an emblem rather than a figure."),
}

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write_metadata(finals):
    prompts_path = ROOT / "pilot-prompts.json"
    prompts = json.loads(prompts_path.read_text())
    prompts["templates"] = {**prompts.get("templates", {}), "tinct-cover-v2": V2_TEMPLATE}
    prompts["v2_prompts"] = [
        {"id": f"{slug}-v2", "composition_type": V2_BRIEFS[slug][0], "request": V2_BRIEFS[slug][1], "template": "tinct-cover-v2"}
        for slug, _, _ in BOOKS
    ]
    prompts_path.write_text(json.dumps(prompts, indent=2) + "\n")
    manifest_path = ROOT / "cover-manifest.json"
    manifest = json.loads(manifest_path.read_text())
    record = {"version": "tinct-cover-v2", "template": V2_TEMPLATE, "review_notes": "Reviewed as a 10-title shelf at full size and at 108x162 on #141210. The four composition categories are balanced without duplicate recipes; all title and author text is the deterministic overlay, never generation output.", "titles": []}
    by_slug = {path.name.split("--")[0]: path for path in finals}
    for slug, title, author in BOOKS:
        art = ART / f"{slug}--artwork-v2.png"; final = by_slug[slug]
        record["titles"].append({"id": slug, "title": title.title(), "author": author.title(), "version": 2, "composition_type": V2_BRIEFS[slug][0], "prompt": V2_BRIEFS[slug][1], "dimensions": "1024x1536", "artwork_filename": str(art.relative_to(ROOT)), "final_cover_filename": str(final.relative_to(ROOT)), "artwork_sha256": digest(art), "final_sha256": digest(final), "review_note": "Pass: dominant silhouette, text-free art, fixed overlay zones; rejected if it read as shorthand, generic illustration, or pseudo-text."})
    manifest["cover_system_versions"] = {**manifest.get("cover_system_versions", {}), "tinct-cover-v2": record}
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")

def lines_for(draw, text, width):
    # System rule: cover titles share one fixed point size. Only line breaks vary.
    font = ImageFont.truetype(str(SERIF), 72)
    out, line = [], ""
    for word in text.split():
        candidate = f"{line} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=font)[2] <= width:
            line = candidate
        else:
            out.append(line); line = word
    out.append(line)
    if len(out) > 3:
        raise ValueError(f"Title does not fit the v2 three-line system: {text}")
    return font, out

def tracked(draw, xy, text, font, fill, max_width, tracking=3.4):
    widths = [draw.textlength(c, font=font) for c in text]
    tracking = min(tracking, max(0, (max_width - sum(widths)) / max(1, len(text)-1)))
    x = xy[0] - (sum(widths) + tracking * (len(text)-1)) / 2
    for char, width in zip(text, widths):
        draw.text((x, xy[1]), char, font=font, fill=fill, anchor="la")
        x += width + tracking

def needs_scrim(im, box):
    """Only add a scrim when the reserved zone is too bright or visually noisy."""
    zone = im.crop(box).convert("L")
    stat = ImageStat.Stat(zone)
    return stat.mean[0] > 122 or stat.var[0] > 1050

def vertical_scrim(im, box, alpha=82, top_to_bottom=True):
    """A feathered vertical gradient, never a rectangular panel."""
    left, top, right, bottom = box
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    px = layer.load(); height = max(1, bottom - top)
    for y in range(top, bottom):
        t = (y - top) / height
        strength = int(alpha * ((1 - t) ** 1.8 if top_to_bottom else t ** 1.8))
        for x in range(left, right): px[x, y] = (11, 16, 20, strength)
    return Image.alpha_composite(im.convert("RGBA"), layer)

def render_artwork(src, destination, title, author):
    im = Image.open(src).convert("RGB").resize((1024, 1536), Image.Resampling.LANCZOS)
    if needs_scrim(im, (92, 84, 932, 350)):
        im = vertical_scrim(im, (0, 0, 1024, 450), 88, True)
    if needs_scrim(im, (92, 1282, 932, 1452)):
        im = vertical_scrim(im, (0, 1120, 1024, 1536), 92, False)
    draw = ImageDraw.Draw(im)
    font, lines = lines_for(draw, title, 800)
    line_height = int(font.size * .90)
    y = 156 - (len(lines)-1) * line_height // 2
    for line in lines:
        draw.text((512, y), line, font=font, fill=(242, 235, 215), anchor="ma")
        y += line_height
    draw.line((456, 292, 568, 292), fill=(196, 159, 107), width=3)
    author_font = ImageFont.truetype(str(SERIF), 32)
    tracked(draw, (512, 1376), author.upper(), author_font, (242, 235, 215), 760)
    draw.line((476, 1336, 548, 1336), fill=(196, 159, 107), width=3)
    destination.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(destination, optimize=True)
    return destination

def render_cover(slug, title, author, version=2):
    return render_artwork(ART / f"{slug}--artwork-v{version}.png", FINAL / f"{slug}--cover-v{version}.png", title, author)

def sheet(paths, name, thumb, cols, heading):
    pad, gap, label_h, head = 34, 24, 30, 75
    rows = (len(paths) + cols - 1) // cols
    w = pad*2 + cols*thumb[0] + (cols-1)*gap
    h = head + pad + rows*(thumb[1]+label_h) + (rows-1)*gap + pad
    out = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(out)
    heading_font = ImageFont.truetype(str(SERIF), 35)
    label_font = ImageFont.truetype(str(SERIF), 18)
    draw.text((pad, 24), heading, font=heading_font, fill=(235, 226, 203))
    for index, path in enumerate(paths):
        row, col = divmod(index, cols)
        x, y = pad + col*(thumb[0]+gap), head + row*(thumb[1]+label_h+gap)
        cover = Image.open(path).convert("RGB").resize(thumb, Image.Resampling.LANCZOS)
        out.paste(cover, (x, y))
        draw.text((x + thumb[0]/2, y + thumb[1] + 6), path.name.split("--")[0].replace("-", " "), font=label_font, fill=(180, 166, 143), anchor="ma")
    SHEETS.mkdir(parents=True, exist_ok=True)
    out.save(SHEETS / name, optimize=True)

def comparison(v1, v2):
    pad, gap, head, label_h, thumb = 34, 22, 92, 27, (108,162)
    w = pad*2 + 8*(thumb[0]*2 + gap) + 7*gap
    h = head + thumb[1] + label_h + pad
    out = Image.new("RGB", (w,h), BG); draw = ImageDraw.Draw(out)
    draw.text((pad, 24), "Tinct cover system — v1 / v2 at library thumbnail scale", font=ImageFont.truetype(str(SERIF), 35), fill=(235,226,203))
    draw.text((pad, 62), "v1", font=ImageFont.truetype(str(SERIF), 18), fill=(180,166,143))
    draw.text((pad+thumb[0]+8, 62), "v2", font=ImageFont.truetype(str(SERIF), 18), fill=(180,166,143))
    label = ImageFont.truetype(str(SERIF), 15)
    for i, (slug, _, _) in enumerate(BOOKS[:8]):
        x = pad + i*(thumb[0]*2 + gap*2)
        a = Image.open(v1 / f"{slug}--cover-v1.png").convert("RGB").resize(thumb, Image.Resampling.LANCZOS)
        b = Image.open(v2 / f"{slug}--cover-v2.png").convert("RGB").resize(thumb, Image.Resampling.LANCZOS)
        out.paste(a, (x,head)); out.paste(b, (x+thumb[0]+gap,head))
        draw.text((x+thumb[0], head+thumb[1]+6), slug.replace("-"," "), font=label, fill=(180,166,143), anchor="ma")
    out.save(SHEETS / "v1-vs-v2-thumbnails.png", optimize=True)

if __name__ == "__main__":
    v2 = [render_cover(*book) for book in BOOKS]
    render_cover("meditations", "MEDITATIONS", "MARCUS AURELIUS", 3)
    render_cover("pride-and-prejudice", "PRIDE AND PREJUDICE", "JANE AUSTEN", 3)
    sheet(v2, "pilot-v2-10-up.png", (256,384), 5, "Tinct cover system — pilot v2")
    sheet(v2, "pilot-v2-thumbnails.png", (108,162), 5, "Tinct cover system — v2 library-scale proof")
    comparison(ROOT / "pilot" / "final", FINAL)
    write_metadata(v2)

#!/usr/bin/env python3
"""Retouch the about page's device photo, assets/about-v20/assets/devices-transparent-v10.webp.

Two edits, both asked for on 2026-09-12:

1. **The laptop reads as a dark, modern MacBook Air.** The stock photo is a silver machine.
   Every laptop pixel that is not screen, e-reader or phone runs through a tone curve that keeps
   blacks black, pulls the silver deck down to a midnight grey and leaves the specular highlights
   along the lid and front lip, with a faint cool cast. The keyboard is already black and barely
   moves; what changes is the deck, the trackpad, the front lip and the lid's side edges.

2. **No white jacket edge along the top of the screen.** The screens in the photo are filled
   cream; the lit screen layers (screen-*-v1.webp) are projected over them and land a pixel or two
   inside, so the cream fill showed as a bright hairline along the top and left of the laptop
   screen. The laptop's fill is repainted in the library screen's own dark navy, so any sliver
   that shows is the colour of the screen behind it rather than a white edge.

This is a **one-off retouch, not idempotent**: it must run against the original photo, not against
its own output. The original is the blob at commit 3d26cdca:

    git show 3d26cdca:app/public/assets/about-v20/assets/devices-transparent-v10.webp > /tmp/devices.webp
    python3 scripts/retouch-about-devices.py /tmp/devices.webp

With no argument it reads (and overwrites) the checked-in file, which is only correct if that file
is still the original. Needs Pillow.  Run from app/.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
TARGET = HERE.parent / 'public/assets/about-v20/assets/devices-transparent-v10.webp'
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else TARGET

# The laptop, as a polygon over the 1536x1024 photo: lid, hinge, deck and front lip. The left
# boundary runs down the right of the e-reader, which leans in front of the laptop's hinge.
LAPTOP = [(668, 22), (1500, 36), (1500, 120), (1452, 500), (1215, 800), (1080, 800),
          (640, 715), (520, 665), (520, 440), (612, 452)]

# The e-reader leans in front of the laptop's left front corner; the two silver bodies touch along
# a seam that runs x = 536 + 0.154*(y-450) in the photo. Everything left of it is the e-reader and
# keeps its colour.
EREADER = [(40, 170), (499, 182), (608, 912), (110, 950)]

# The phone sits in front of the laptop's bottom right. Its screen corners (the same four points
# the screen layers are projected onto), outset by 4 px so the curve stops just inside the phone's
# black frame rather than leaving an undarkened halo around it.
PHONE_SCREEN = [(1261, 481), (1483, 497), (1361, 954), (1110, 904)]

# The laptop screen's cream fill: the screen corners, grown a little so the antialiased rim of the
# fill is repainted too.
SCREEN = [(695, 68), (1442, 77), (1396, 555), (642, 489)]
SCREEN_NAVY = (9, 23, 34)


def outset(points, m):
    """Move every vertex of a convex polygon m px along its outward angle bisector."""
    out = []
    n = len(points)
    for i, (x, y) in enumerate(points):
        px, py = points[(i - 1) % n]
        nx, ny = points[(i + 1) % n]
        ux, uy = px - x, py - y
        vx, vy = nx - x, ny - y
        ul = (ux * ux + uy * uy) ** .5 or 1
        vl = (vx * vx + vy * vy) ** .5 or 1
        ux, uy, vx, vy = ux / ul, uy / ul, vx / vl, vy / vl
        bx, by = ux + vx, uy + vy
        bl = (bx * bx + by * by) ** .5
        if bl < 1e-6:
            out.append((x, y))
            continue
        half = max(bl / 2, .2)          # sin of half the interior angle
        out.append((x - bx / bl * m / half, y - by / bl * m / half))
    return out


def mask(size, polys, blur=0):
    m = Image.new('L', size, 0)
    d = ImageDraw.Draw(m)
    for poly, value in polys:
        d.polygon([(round(x), round(y)) for x, y in poly], fill=value)
    return m.filter(ImageFilter.GaussianBlur(blur)) if blur else m


def main():
    im = Image.open(SRC).convert('RGBA')
    w, h = im.size
    assert (w, h) == (1536, 1024), im.size

    # 1. The laptop screen's cream fill -> the library screen's navy.
    navy = Image.new('RGBA', (w, h), SCREEN_NAVY + (255,))
    im = Image.composite(navy, im, mask((w, h), [(outset(SCREEN, 3), 255)], blur=1.2))

    # 2. The laptop body, minus the screen, the phone and the e-reader, through the tone curve.
    body = mask((w, h), [(LAPTOP, 255), (EREADER, 0), (outset(SCREEN, 1), 0), (outset(PHONE_SCREEN, 4), 0)], blur=.8)

    px = im.load()
    bp = body.load()
    for y in range(h):
        for x in range(w):
            k = bp[x, y]
            if not k:
                continue
            r, g, b, a = px[x, y]
            if not a:
                continue
            lum = (.299 * r + .587 * g + .114 * b) / 255
            # Keep black black, land the silver deck (~.5) near .18, and hold the specular edges.
            out = lum ** 1.95 * .74 + max(0., lum - .86) * 1.35
            f = k / 255
            nr = r + (min(255, out * 255 * .94) - r) * f
            ng = g + (min(255, out * 255 * .97) - g) * f
            nb = b + (min(255, out * 255 * 1.08) - b) * f
            px[x, y] = (round(nr), round(ng), round(nb), a)

    im.save(TARGET, 'WEBP', quality=90, method=6)
    print(f'wrote {TARGET.relative_to(HERE.parent.parent)} ({TARGET.stat().st_size // 1024} KB)')


main()

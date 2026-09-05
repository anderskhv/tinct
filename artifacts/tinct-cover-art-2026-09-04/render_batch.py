#!/usr/bin/env python3
"""Render any approved v2 batch and produce full-size plus 108x162 proof sheets."""
import argparse
import json
from pathlib import Path
from render_v2 import ROOT, SHEETS, sheet, render_artwork

parser = argparse.ArgumentParser()
parser.add_argument("batch")
parser.add_argument("ids", nargs="+")
args = parser.parse_args()
manifest = json.loads((ROOT / "cover-manifest.json").read_text())
books = {book["id"]: book for book in manifest["books"]}
art = ROOT / "collection-v2" / "artwork"
final = ROOT / "collection-v2" / "final"
paths = []
for slug in args.ids:
    book = books[slug]
    paths.append(render_artwork(art / f"{slug}--artwork-v2.png", final / f"{slug}--cover-v2.png", book["title"].upper(), book["author"].upper()))
sheet(paths, f"batch-{args.batch}-full.png", (256, 384), 4, f"Tinct cover system — batch {args.batch}")
sheet(paths, f"batch-{args.batch}-thumbnails.png", (108, 162), 6, f"Tinct cover system — batch {args.batch} library-scale proof")

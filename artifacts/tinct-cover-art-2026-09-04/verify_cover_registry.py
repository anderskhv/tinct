#!/usr/bin/env python3
"""Registry fidelity and collection-quota gate for the cover-art batches."""
import json, re, sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REGISTRY = ROOT.parents[1] / "app" / "src" / "data" / "bookRegistry.ts"
MANIFEST = ROOT / "integration-manifest.json"

def registry_records():
    source = REGISTRY.read_text()
    pattern = re.compile(r"export const \w+: Book = \{\s*id: '([^']+)',\s*title: '([^']+)',\s*author: '([^']+)'", re.S)
    return {book_id: {"title": title, "author": author} for book_id, title, author in pattern.findall(source)}

def validate(data):
    registry = registry_records(); mismatches = []
    titles = data.get("titles", [])
    for row in titles:
        expected = registry.get(row["id"])
        if not expected or row.get("title") != expected["title"] or row.get("author") != expected["author"]:
            mismatches.append({"id": row["id"], "manifest": [row.get("title"), row.get("author")], "registry": expected})
    motifs = [row["motif"] for row in titles]
    duplicate_motifs = sorted(m for m, n in Counter(motifs).items() if n > 1)
    hues = Counter(row["hue_family"] for row in titles)
    kinds = Counter(row["composition_type"] for row in titles)
    framing = sum(1 for row in titles if row.get("framing") in {"window", "doorway"})
    errors = []
    if mismatches: errors.append(f"registry mismatches: {mismatches}")
    if duplicate_motifs: errors.append(f"duplicate motifs: {duplicate_motifs}")
    if hues and max(hues.values()) > 25: errors.append(f"hue quota exceeded: {dict(hues)}")
    if kinds["figure"] > 33: errors.append(f"figure quota exceeded: {kinds['figure']}")
    if framing > 33: errors.append(f"window/doorway quota exceeded: {framing}")
    data["running_totals"] = {"titles": len(titles), "composition_types": dict(kinds), "hue_families": dict(hues), "window_or_doorway_framings": framing}
    return errors, mismatches

if __name__ == "__main__":
    data = json.loads(MANIFEST.read_text())
    errors, mismatches = validate(data)
    print("registry mismatches:", json.dumps(mismatches, ensure_ascii=False))
    if errors:
        print("FAILED:", *errors, sep="\n", file=sys.stderr); sys.exit(1)
    print("PASS", json.dumps(data["running_totals"], ensure_ascii=False))

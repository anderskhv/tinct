#!/usr/bin/env python3
"""Evidence-based Esther/Daniel passage map for the staged WEB Catholic edition.

Greek Esther (ESG) and Greek Daniel (DAG) keep their own USFM book codes.
Equal chapter:verse numbers are NOT treated as the same passage. Instead:

1. Greek additions are identified from the source itself: square brackets in
   ESG, and in DAG the source footnote at 3:24 (3:24-90 inserted; Hebrew
   3:24-30 renumbered 3:91-97) plus the Susanna (13) and Bel (14) headings.
2. Every ESG/DAG verse is aligned to the Hebrew-tradition Esther/Daniel of the
   same official package (WEB Updated EST/DAN in the eng-web-c USFX) by a
   monotonic similarity alignment. Scores are recorded; weak pairs are flagged.
3. The same alignment is run against Tinct's live 66-book web-en and kjv-en
   editions (read-only) to give edition-local locations.
4. BSB (pinned bsb.txt from the BSB staging package) is checked at reference
   level: per-chapter verse counts must equal the Hebrew-tradition references,
   and each mapped pair carries a content-word overlap score.

Usage: python3 passage_map.py --usfx-zip PATH --bsb-txt PATH
Writes out/esther-daniel-passage-map.json. Reads live editions; writes nothing
outside ./out.
"""
from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "out"
REPO = HERE.parents[2]
LIVE = {"web-en": REPO / "app/public/data/editions/bible-web-en.json",
        "kjv-en": REPO / "app/public/data/editions/bible-kjv-en.json"}
BSB_SHA = "2ac3af1de52d4e68261cba91d85c320b7eadc6560e830d99e591767b8ff5ca96"
SUP_BACK = str.maketrans("⁰¹²³⁴⁵⁶⁷⁸⁹⁻", "0123456789-")
STOP = set("the and of to a in that he his he was is for with him them they be which i you it on as by all but not your my have from this so their said were will me at who are had".split())

# Addition D (the Greek expansion of Esther 5:1-2) carries no square brackets in
# the source, although its introduction lists 5:1 among the verses lengthened by
# additions. Recorded explicitly so bracket detection cannot silently miss it.
UNBRACKETED_EXPANSIONS = {
    "ESG.5.1": "Addition D: Greek expansion, not bracketed in source (ESG introduction names 5:1 as lengthened)",
    "ESG.5.2": "Addition D continues: Greek expansion, not bracketed in source",
}
SOURCE_MARKUP_OBSERVATIONS = [
    "ESG introduction says additions are merged at the beginning of 1:1 and after 3:13, 4:17, 8:12 and 10:3. "
    "In the markup, Addition C is numbered as separate verses 4:18-47 and Addition F as 10:4-14; "
    "Addition E's bracket opens inside 8:13, not 8:12; Addition D (5:1-2) is unbracketed.",
    "ESG has no verses 4:6, 9:5 or 9:30 in any official export (USFM, USFX, VPL). They are not filled.",
    "ESG 1:1 contains the source typo 'thingsin' (missing space); preserved verbatim.",
    "DAG Hebrew-tradition verses are close but not word-identical to WEB Updated DAN; the metadata claim that other "
    "books equal WEB Updated does not apply to Daniel's shared portions.",
    "DAG 3:24-90 is the Prayer of Azariah and Song of the Three (source footnote at 3:24); DAG 3:91-97 are the "
    "Hebrew 3:24-30 renumbered. DAG 13 is Susanna and DAG 14 is Bel and the Dragon (source headings).",
]

sys.path.insert(0, str(HERE))
from verify_artifact import usfx_verses  # noqa: E402  (independent USFX reader)


def words(s):
    return re.findall(r"[a-z0-9]+", s.lower().replace("’", "'"))


def sim(a, b):
    return difflib.SequenceMatcher(None, words(a), words(b), autojunk=False).ratio()


def content_overlap(a, b):
    wa, wb = set(words(a)) - STOP, set(words(b)) - STOP
    return round(len(wa & wb) / max(1, min(len(wa), len(wb))), 3)


def align(src, tgt, floor=0.35):
    """Monotonic alignment maximising sum(sim - floor); unmatched = gap."""
    n, m = len(src), len(tgt)
    S = [[0.0] * (m + 1) for _ in range(n + 1)]
    back = [[None] * (m + 1) for _ in range(n + 1)]
    cache = {}
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            best, arg = S[i - 1][j], "up"
            if S[i][j - 1] > best:
                best, arg = S[i][j - 1], "left"
            s = cache.setdefault((i, j), sim(src[i - 1][1], tgt[j - 1][1]))
            if s > floor and S[i - 1][j - 1] + s - floor > best:
                best, arg = S[i - 1][j - 1] + s - floor, "diag"
            S[i][j], back[i][j] = best, arg
    pairs, i, j = {}, n, m
    while i > 0 and j > 0:
        a = back[i][j]
        if a == "diag":
            pairs[src[i - 1][0]] = (tgt[j - 1][0], round(cache[(i, j)], 3))
            i, j = i - 1, j - 1
        elif a == "up":
            i -= 1
        else:
            j -= 1
    return pairs


def live_verses(path, title):
    ed = json.loads(path.read_bytes())
    out = []
    for c in ed["chapters"]:
        m = re.fullmatch(rf"{title} (\d+)", c["title"])
        if not m:
            continue
        for pi, para in enumerate(c["paragraphs"]):
            parts = re.split(r"(?:^| )([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+) ", para)
            for lab, text in zip(parts[1::2], parts[2::2]):
                out.append((f"{m.group(1)}:{lab.translate(SUP_BACK)}", text,
                            {"chapterNumber": c["number"], "chapterTitle": c["title"], "paragraphIndex": pi,
                             "verseLabel": lab.translate(SUP_BACK)}))
    return out


def addition_spans(esg):
    """Bracketed spans per ESG verse, in UTF-16 offsets of the verse text."""
    inside, spans = False, {}
    for ref, text in esg:
        units = text.encode("utf-16-le")
        cur, start = [], 0 if inside else None
        pos = 0
        for ch in text:
            if ch == "[" and not inside:
                inside, start = True, pos
            elif ch == "]" and inside:
                inside = False
                cur.append({"start": start, "end": pos + 1})
                start = None
            pos += len(ch.encode("utf-16-le")) // 2
        if inside:
            cur.append({"start": start, "end": len(units) // 2, "continuesInNextVerse": True})
        spans[ref] = cur
    return spans


def outside(text, spans):
    u = text.encode("utf-16-le")
    keep, last = [], 0
    for s in spans:
        keep.append(u[last * 2:s["start"] * 2].decode("utf-16-le"))
        last = s["end"]
    keep.append(u[last * 2:].decode("utf-16-le"))
    return re.sub(r"\s+", " ", " ".join(keep)).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--usfx-zip", required=True)
    ap.add_argument("--bsb-txt", required=True)
    args = ap.parse_args()
    bsb_bytes = Path(args.bsb_txt).read_bytes()
    if hashlib.sha256(bsb_bytes).hexdigest() != BSB_SHA:
        sys.exit("FAIL: bsb.txt differs from the hash pinned by the BSB staging package")

    xml = zipfile.ZipFile(args.usfx_zip).read("eng-web-c_usfx.xml")
    src, _ = usfx_verses(xml, ["EST", "DAN"])
    vt = json.loads((OUT / "verse-text.json").read_text())["verses"]
    webc = {b: [(r["ref"], r["text"]) for r in vt if r["book"] == b] for b in ("ESG", "DAG")}
    heb = {b: [(k, t) for k, t in src.items() if k.startswith(b + ".") and re.fullmatch(r"[A-Z]{3}\.\d+\.\d+", k)]
           for b in ("EST", "DAN")}
    bsb = {}
    for line in bsb_bytes.decode("utf-8-sig").splitlines():
        m = re.match(r"^(Esther|Daniel) (\d+):(\d+)\t(.*)$", line)
        if m:
            bsb[("EST" if m.group(1) == "Esther" else "DAN", int(m.group(2)), int(m.group(3)))] = m.group(4)

    def counts(refs):
        d = {}
        for r in refs:
            b, c, v = r.split(".")
            d.setdefault(c, 0)
            d[c] += 1
        return d

    result = {"note": ("Correspondence, not identity. Rows pair a source-native WEBC reference with the best "
                       "Hebrew-tradition verse by monotonic similarity alignment. Equal numbers are never assumed "
                       "to be the same passage; see sameNumber and scores. Offsets are UTF-16, end-exclusive, "
                       "within the verse text in verse-text.json."),
              "inputs": {"usfxZipSha256": hashlib.sha256(Path(args.usfx_zip).read_bytes()).hexdigest(),
                         "verseTextSha256": hashlib.sha256((OUT / "verse-text.json").read_bytes()).hexdigest(),
                         "bsbTxtSha256": BSB_SHA,
                         **{f"live:{k}": hashlib.sha256(p.read_bytes()).hexdigest() for k, p in LIVE.items()}},
              "sourceMarkupObservations": SOURCE_MARKUP_OBSERVATIONS,
              "books": {}}

    for gcode, hcode, title in (("ESG", "EST", "Esther"), ("DAG", "DAN", "Daniel")):
        g = webc[gcode]
        adds = addition_spans(g) if gcode == "ESG" else {r: [] for r, _ in g}
        if gcode == "DAG":
            for r, t in g:
                c, v = map(int, r.split(".")[1:])
                if (c == 3 and 24 <= v <= 90) or c in (13, 14):
                    u16 = len(t.encode("utf-16-le")) // 2
                    adds[r] = [{"start": 0, "end": u16, "sourceEvidence": "DAG 3:24 footnote" if c == 3 else ("Susanna heading" if c == 13 else "Bel and the Dragon heading")}]
        g_core = dict((r, outside(t, adds[r])) for r, t in g)
        heb_text = dict(heb[hcode])
        heb_counts = counts(heb_text)
        bsb_counts = {}
        for (b, c, v) in bsb:
            if b == hcode:
                bsb_counts[str(c)] = bsb_counts.get(str(c), 0) + 1
        live = {}
        for key, path in LIVE.items():
            lv = live_verses(path, title)
            live[key] = ({f"{hcode}.{ref.replace(':', '.')}": (t, meta) for ref, t, meta in lv},
                         counts("X." + ref.replace(":", ".") for ref, _, _ in lv))

        if gcode == "DAG":
            # Same translation family: word-sequence alignment is decisive.
            nonempty = [(r, t) for r, t in g_core.items() if t]
            pairs = align(nonempty, heb[hcode])
            method = "monotonic word-sequence alignment against WEB Updated DAN (same package)"
        else:
            # Greek-based rendering: the source states its numbering follows the
            # Hebrew verse numbers outside the bracketed additions. Record that as
            # a claim and measure it; do not treat it as passage identity.
            pairs = {}
            for r, t in g_core.items():
                h = hcode + "." + r.split(".", 1)[1]
                if t and h in heb_text:
                    pairs[r] = (h, round(sim(t, heb_text[h]), 3))
            method = ("source-stated numbering alignment (ESG introduction), measured by word-sequence similarity "
                      "and content-word overlap; Greek textual base differs from the Hebrew-based EST")
        rows, mapped_heb = [], set()
        for r, t in g:
            core = g_core[r]
            row = {"ref": r}
            if adds[r]:
                row["additionSpans"] = adds[r]
            if not core:
                row["kind"] = "greek-addition"
            elif r in pairs:
                h, s = pairs[r]
                mapped_heb.add(h)
                row["kind"] = "hebrew-tradition-counterpart" + ("-with-embedded-addition" if adds[r] else "")
                row["hebrewRef"] = h
                row["sameNumber"] = h.split(".", 1)[1] == r.split(".", 1)[1]
                row["similarityToWebuHebrew"] = s
                row["contentOverlapWithWebuHebrew"] = content_overlap(core, heb_text[h])
                if gcode == "DAG":
                    row["review"] = "ok" if s >= 0.5 else "check-by-hand"
                else:
                    row["review"] = "ok" if row["contentOverlapWithWebuHebrew"] >= 0.3 else "divergent-greek-wording-check-by-hand"
                bc, bv = map(int, h.split(".")[1:])
                if (hcode, bc, bv) in bsb:
                    row["bsb"] = {"ref": h, "contentOverlap": content_overlap(core, bsb[(hcode, bc, bv)])}
                for key, (idx, _) in live.items():
                    if h in idx:
                        lt, meta = idx[h]
                        row[key] = {**meta, "similarity": round(sim(core, lt), 3), "contentOverlap": content_overlap(core, lt)}
            else:
                row["kind"] = "no-hebrew-counterpart-found"
                row["review"] = "check-by-hand"
            if r in UNBRACKETED_EXPANSIONS:
                row["unbracketedGreekExpansion"] = UNBRACKETED_EXPANSIONS[r]
                row["review"] = "check-by-hand"
            rows.append(row)
        unmatched_heb = [h for h in heb_text if h not in mapped_heb]
        result["books"][gcode] = {
            "hebrewTraditionCode": hcode,
            "method": method,
            "webcVerses": len(g), "hebrewVerses": len(heb_text),
            "verseCountsPerChapter": {"webc": counts(r for r, _ in g), "webuHebrew": heb_counts,
                                      "bsb": bsb_counts, **{k: v[1] for k, v in live.items()}},
            "hebrewVersificationEqualsBsb": heb_counts == bsb_counts,
            "hebrewVersificationEqualsLive": {k: v[1] == heb_counts for k, v in live.items()},
            "hebrewVersesWithoutWebcCounterpart": unmatched_heb,
            "summary": {
                "greekAdditionVerses": [x["ref"] for x in rows if x["kind"] == "greek-addition"],
                "versesWithEmbeddedAddition": [x["ref"] for x in rows if x["kind"].endswith("embedded-addition")],
                "counterparts": sum(1 for x in rows if x["kind"].startswith("hebrew")),
                "counterpartsWithDifferentNumber": [f"{x['ref']}->{x['hebrewRef']}" for x in rows if x.get("hebrewRef") and not x["sameNumber"]],
                "flaggedForReview": [x["ref"] for x in rows if x.get("review") not in (None, "ok")],
            },
            "verses": rows,
        }

    (OUT / "esther-daniel-passage-map.json").write_text(json.dumps(result, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    for b, v in result["books"].items():
        print(b, json.dumps({k: v[k] for k in ("webcVerses", "hebrewVerses", "hebrewVersificationEqualsBsb",
                                              "hebrewVersificationEqualsLive", "hebrewVersesWithoutWebcCounterpart")}),
              json.dumps(v["summary"])[:2500])


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Independent read-back of the staged WEB Catholic artifact.

Does not import stage.py. Rebuilds every verse from the official USFX (XML)
export, a different file and format from the USFM the stager reads, and from
the verse-per-line (VPL) export where that export is complete. Compares them
with text reconstructed from the candidate edition through the verse
crosswalk spans. Also proves full span coverage: every character of every
candidate paragraph is either inside exactly one span or part of a verse
label / single separator space.

Usage: python3 verify_artifact.py --usfx-zip PATH --vpl-zip PATH
Exit status is non-zero on any failure. Writes out/validation.json.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

OUT = Path(__file__).resolve().parent / "out"
SUP = str.maketrans("0123456789-", "⁰¹²³⁴⁵⁶⁷⁸⁹⁻")
SKIP_TAGS = {"f", "x", "toc", "id", "ide", "h", "cl", "s", "cp"}
SKIP_P = {"mt1", "mt2", "mt3", "ip", "is1", "sp", "ms1", "ili"}
# VPL uses its own book abbreviations.
VPL_CODE = {"SNG": "SOL", "EZK": "EZE", "JOL": "JOE", "NAM": "NAH", "DAG": "DNG", "MRK": "MAR",
            "JHN": "JOH", "PHP": "PHI", "JAS": "JAM", "1JN": "1JO", "2JN": "2JO", "3JN": "3JO"}

failures: list[str] = []


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def check(cond: bool, msg: str) -> None:
    if not cond:
        failures.append(msg)


def usfx_verses(xml: bytes, books: list[str]) -> tuple[dict[str, str], dict]:
    root = ET.fromstring(xml)
    acc: dict[str, list[str]] = defaultdict(list)
    extras = {"prologue": None}
    state = {"book": None, "c": None, "v": None}

    def key():
        b, c, v = state["book"], state["c"], state["v"]
        return f"{b}.{c}.{v}" if v else f"{b}.{c}.pre"

    def add(text):
        if text and state["c"] is not None:
            acc[key()].append(text)

    def walk(e, in_d=None):
        tag = e.tag
        if tag in SKIP_TAGS:
            return
        if tag == "p" and e.get("style") in SKIP_P:
            if e.get("style") == "ip" and state["book"] == "SIR" and state["c"] is None and "WHEREAS" in "".join(e.itertext()):
                extras["prologue"] = "".join(t for t in iter_text_skipping(e))
            return
        if tag == "c":
            state["c"], state["v"] = e.get("id"), None
        elif tag == "v":
            state["v"] = e.get("id")
        elif tag == "ve":
            state["v"] = None
        if tag == "d":
            dk = f"{state['book']}.{state['c']}.d" if state["v"] is None else f"{state['book']}.{state['c']}.d+{state['v']}"
            acc[dk].append(" " + "".join(iter_text_skipping(e)) + " ")
            return
        if e.text:
            add(e.text)
        for ch in e:
            walk(ch)
            if ch.tail:
                add(ch.tail)

    def iter_text_skipping(e):
        if e.tag in SKIP_TAGS:
            return
        if e.text:
            yield e.text
        for ch in e:
            yield from iter_text_skipping(ch)
            if ch.tail:
                yield ch.tail

    for book in root.findall("book"):
        code = book.get("id")
        if code not in books:
            continue
        state.update(book=code, c=None, v=None)
        walk(book)
    out = {k: norm("".join(v)) for k, v in acc.items()}
    return {k: v for k, v in out.items() if v}, extras


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--usfx-zip", required=True)
    ap.add_argument("--vpl-zip", required=True)
    args = ap.parse_args()

    prov = json.loads((OUT / "provenance.json").read_text())
    usfx_zip_bytes = Path(args.usfx_zip).read_bytes()
    check(hashlib.sha256(usfx_zip_bytes).hexdigest() == prov["source"]["downloads"]["eng-web-c_usfx.zip"]["sha256"],
          "USFX archive hash differs from provenance")
    for name, digest in prov["outputs"].items():
        check(hashlib.sha256((OUT / name).read_bytes()).hexdigest() == digest, f"output hash mismatch {name}")

    cand_bytes = (OUT / "bible-webc-en.candidate.json").read_bytes()
    cand = json.loads(cand_bytes)
    xwalk = json.loads((OUT / "verse-crosswalk.json").read_text())
    cmap = json.loads((OUT / "chapter-crosswalk.json").read_text())
    vtext = {r["ref"]: r["text"] for r in json.loads((OUT / "verse-text.json").read_text())["verses"]}
    empty = json.loads((OUT / "official-empty-references.json").read_text())["references"]
    check(xwalk["candidateSha256"] == hashlib.sha256(cand_bytes).hexdigest(), "crosswalk not pinned to candidate")
    check(cmap["sourceSha256"] == hashlib.sha256(cand_bytes).hexdigest(), "chapter map not pinned to candidate")

    usfx_zip = zipfile.ZipFile(io.BytesIO(usfx_zip_bytes))
    meta = ET.fromstring(usfx_zip.read("eng-web-cmetadata.xml").decode("utf-8-sig"))
    order = [b.get("code") for bl in meta.iter("bookList") if bl.get("default") == "true" for b in bl.iter("book") if b.get("code")]
    check(len(order) == 73, f"official book list has {len(order)} books")

    # Chapter structure and native order.
    chapters = cand["chapters"]
    check([c["number"] for c in chapters] == list(range(1, len(chapters) + 1)), "chapter numbers not contiguous")
    check([c["chapterNumber"] for c in cmap["chapters"]] == [c["number"] for c in chapters], "chapter map numbering")
    seen_books = []
    for c in cmap["chapters"]:
        if not seen_books or seen_books[-1] != c["bookCode"]:
            seen_books.append(c["bookCode"])
    check(seen_books == order, "candidate book order differs from official native order")

    def section_books(secs):
        for s in secs:
            if "sections" in s:
                yield from section_books(s["sections"])
            else:
                yield s["chapters"]
    flat = [n for chs in section_books(cand["sections"]) for n in chs]
    check(flat == [c["number"] for c in chapters], "section tree does not list every chapter once in order")

    # Independent source.
    xml = usfx_zip.read("eng-web-c_usfx.xml")
    src, extras = usfx_verses(xml, order)
    usfx_chapters = []
    for m in re.finditer(rb'<book id="([A-Z0-9]{3})"|<c id="(\d+)"', xml):
        if m.group(1):
            cur = m.group(1).decode()
        elif cur in order:
            usfx_chapters.append((cur, int(m.group(2))))
    # USFX stores books in its own order; compare each book's chapter sequence.
    def per_book(pairs):
        d = defaultdict(list)
        for b, c in pairs:
            d[b].append(c)
        return dict(d)
    check(per_book(usfx_chapters) == per_book((c["bookCode"], c["biblicalChapter"]) for c in cmap["chapters"]),
          "chapter identities differ from USFX")

    # Reconstruct from candidate spans.
    def span_text(spans):
        out = []
        for s in spans:
            para = chapters[s["chapterNumber"] - 1]["paragraphs"][s["paragraphIndex"]]
            out.append(para.encode("utf-16-le")[s["start"] * 2:s["end"] * 2].decode("utf-16-le"))
        return norm(" ".join(out))

    recon = {k: span_text(v) for k, v in xwalk["verses"].items()}
    prologue = recon.pop("SIR.PROLOGUE", None)
    check(prologue is not None and prologue == norm(extras["prologue"] or ""), "Sirach prologue differs from USFX")
    mismatches = [k for k in src if recon.get(k) != src[k]]
    missing_in_candidate = [k for k in src if k not in recon]
    extra_in_candidate = [k for k in recon if k not in src]
    check(not mismatches, f"{len(mismatches)} verse texts differ from USFX: {mismatches[:10]}")
    check(not extra_in_candidate, f"candidate has references absent from USFX: {extra_in_candidate[:10]}")
    for k, t in vtext.items():
        if k != "SIR.PROLOGUE":
            check(recon.get(k) == norm(t), f"verse-text.json differs from span read-back at {k}")

    # Empty references must be declared in USFX and carry no text there.
    # USFX keeps a range id in `id` and only its first verse in `bcv`.
    usfx_ids = {f"{b.decode()}.{c.decode()}.{i.decode()}"
                for i, b, c in re.findall(rb'<v id="([\d-]+)" bcv="([A-Z0-9]{3})\.(\d+)\.', xml)}
    for r in empty:
        check(r["ref"] in usfx_ids and r["ref"] not in src, f"empty reference not empty in USFX: {r['ref']}")

    # Coverage: every non-span character is a label or a separator space.
    uncovered_bad = []
    by_para = defaultdict(list)
    for ref, spans in xwalk["verses"].items():
        for s in spans:
            by_para[(s["chapterNumber"], s["paragraphIndex"])].append((s["start"], s["end"], ref))
    for c in chapters:
        for i, para in enumerate(c["paragraphs"]):
            u = para.encode("utf-16-le")
            n = len(u) // 2
            covered = [0] * n
            spans = sorted(by_para.get((c["number"], i), []))
            for s, e, _ in spans:
                for j in range(s, e):
                    covered[j] += 1
            check(max(covered, default=0) <= 1, f"overlapping spans {c['number']}/{i}")
            gaps, j = [], 0
            while j < n:
                if covered[j]:
                    j += 1
                    continue
                k = j
                while k < n and not covered[k]:
                    k += 1
                gaps.append(u[j * 2:k * 2].decode("utf-16-le"))
                j = k
            # Expected labels in this paragraph, from span refs that start a verse here.
            for g in gaps:
                if not re.fullmatch(r"( ?[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+ )| ", g):
                    uncovered_bad.append((c["number"], i, g[:40]))
    check(not uncovered_bad, f"{len(uncovered_bad)} uncovered non-label text runs: {uncovered_bad[:10]}")

    # Labels match verse ids in order.
    label_bad = 0
    for ref, spans in xwalk["verses"].items():
        parts = ref.split(".")
        if len(parts) != 3 or not re.fullmatch(r"\d+(-\d+)?", parts[2]):
            continue
        s = spans[0]
        para = chapters[s["chapterNumber"] - 1]["paragraphs"][s["paragraphIndex"]]
        before = para.encode("utf-16-le")[: s["start"] * 2].decode("utf-16-le")
        if not before.endswith(parts[2].translate(SUP) + " "):
            label_bad += 1
    check(label_bad == 0, f"{label_bad} verses without matching superscript label")

    # Tertiary: VPL export (Genesis absent from this export build).
    vpl_zip = zipfile.ZipFile(io.BytesIO(Path(args.vpl_zip).read_bytes()))
    vpl = {}
    for line in vpl_zip.read("eng-web-c_vpl.txt").decode("utf-8-sig").splitlines():
        m = re.match(r"^(\S+) (\d+):(\S+) ?(.*)$", line)
        if m:
            vpl[(m.group(1), m.group(2), m.group(3))] = norm(m.group(4))
    vpl_books = sorted({k[0] for k in vpl})
    vpl_diff, vpl_absent_books = [], []
    layout = json.loads((OUT / "layout.json").read_text())["paragraphs"]
    speaker_labels = defaultdict(set)
    for entry in layout:
        for h in entry.get("headingsBefore", []):
            if h["marker"] == "sp":
                speaker_labels[entry["chapterNumber"]].add(h["text"])
    chap_of = {(c["bookCode"], c["biblicalChapter"]): c["chapterNumber"] for c in cmap["chapters"]}
    rev = {v: k for k, v in VPL_CODE.items()}
    vpl_present = {rev.get(b, b) for b in vpl_books}
    for code in order:
        if code not in vpl_present:
            vpl_absent_books.append(code)
    for k, t in src.items():
        b, c, v = k.split(".")
        if b in vpl_absent_books or not re.fullmatch(r"[\d-]+", v):
            continue
        vt = vpl.get((VPL_CODE.get(b, b), c, v))
        if vt == recon.get(k):
            continue
        # The VPL export folds unnumbered text (superscription, chapter-initial
        # line) into the following verse. Accept only that exact explanation.
        first = int(v.split("-")[0])
        prefix = recon.get(f"{b}.{c}.d") if first == 1 else recon.get(f"{b}.{c}.d+{first - 1}")
        prefix = prefix or (recon.get(f"{b}.{c}.pre") if first == 1 else None)
        cand_text = recon.get(k, "")
        suffix = recon.get(f"{b}.{c}.d+{v}")
        chap_no = chap_of.get((b, int(c)))
        labels = speaker_labels.get(chap_no, set())
        if prefix and vt == norm(prefix + " " + cand_text):
            kind = "unnumbered-text-folded-into-verse"
        elif suffix and vt == norm(cand_text + " " + suffix):
            kind = "following-superscription-folded-into-verse"
        elif labels and norm(re.sub(r"(?<![\w’])(" + "|".join(map(re.escape, labels)) + r") ", "", vt)) == cand_text:
            kind = "speaker-label-folded-into-verse"
        elif (b, c, v) == ("PSA", "68", "32") and vt.replace("— Selah", "—Selah") == cand_text:
            kind = "vpl-space-before-qs-marker"
        else:
            kind = "unexplained"
        vpl_diff.append({"ref": k, "kind": kind, "vpl": vt, "candidate": recon.get(k)})
    unexplained = [d["ref"] for d in vpl_diff if d["kind"] == "unexplained"]
    check(not unexplained, f"{len(unexplained)} unexplained VPL differences: {unexplained[:10]}")
    counts = {
        "books": len(order), "chapters": len(chapters),
        "paragraphs": sum(len(c["paragraphs"]) for c in chapters),
        "usfxTextKeys": len(src), "candidateKeys": len(recon) + 1,
        "verseMismatchesVsUsfx": len(mismatches), "missingInCandidate": missing_in_candidate,
        "emptyReferences": len(empty),
        "vplAbsentBooks": vpl_absent_books, "vplDifferences": len(vpl_diff),
        "vplUnexplainedDifferences": len(unexplained),
        "vplDifferenceKinds": {k: sum(1 for d in vpl_diff if d["kind"] == k) for k in sorted({d["kind"] for d in vpl_diff})},
    }
    report = {"ok": not failures, "failures": failures, "counts": counts, "vplDifferences": vpl_diff}
    (OUT / "validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(json.dumps({"ok": report["ok"], "failures": failures[:20], "counts": counts}, ensure_ascii=False, indent=1))
    sys.exit(0 if not failures else 1)


if __name__ == "__main__":
    main()

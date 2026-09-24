#!/usr/bin/env python3
"""Stage the World English Bible (Catholic) as an independent Tinct edition.

Content-only staging. Reads the official eBible.org USFM archive for
eng-web-c, verifies its pinned SHA-256, and writes a candidate reading edition
plus identity, layout and provenance sidecars into ./out. Nothing in the app,
registry, live editions or audio is read for writing or modified.

Wording rule: verse text is the source text with USFM markup removed
(Strong's word wrappers, footnotes, cross references). Words and punctuation
are not changed. Editorial matter (headings, speaker labels, introductions,
footnotes) is preserved in sidecars, never mixed into reading text.

Usage:
  python3 stage.py --usfm-zip PATH [--metadata-xml PATH]

The metadata XML (eng-web-cmetadata.xml, inside the official USFX archive)
supplies the native book order. Pass --usfx-zip instead to read it from there.
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
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "out"

PINNED = {
    "eng-web-c_usfm.zip": "bdcafa3c1f88d9d491595c987c137caaf39b45109aecccda87959542d8fbdf8b",
    "eng-web-c_usfx.zip": "6a34804c71b8aa2930e851a023511f702fff4dd5a5e427c393f9d6a84fe6aea2",
}
EDITION_KEY = "webc-en"  # proposal only; Codex owns the final key

SUPERSCRIPT = str.maketrans("0123456789-", "⁰¹²³⁴⁵⁶⁷⁸⁹⁻")

# Tinct section labels mirror the existing bible-web-en tree. Assignment of
# books to these groups is a presentation choice, not source data.
SECTIONS = [
    ("Old Testament", [
        ("The Pentateuch", ["GEN", "EXO", "LEV", "NUM", "DEU"]),
        ("Historical Books", ["JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH",
                              "EZR", "NEH", "TOB", "JDT", "ESG", "1MA", "2MA"]),
        ("Wisdom & Poetry", ["JOB", "PSA", "PRO", "ECC", "SNG", "WIS", "SIR"]),
        ("Major Prophets", ["ISA", "JER", "LAM", "BAR", "EZK", "DAG"]),
        ("Minor Prophets", ["HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP",
                            "HAG", "ZEC", "MAL"]),
    ]),
    ("New Testament", [
        ("The Gospels", ["MAT", "MRK", "LUK", "JHN"]),
        ("History", ["ACT"]),
        ("Pauline Epistles", ["ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH",
                              "1TI", "2TI", "TIT", "PHM"]),
        ("General Epistles", ["HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD"]),
        ("Prophecy", ["REV"]),
    ]),
]

# The Sirach prologue is part of the book in Catholic Bibles. The source
# carries it as introduction markup, so it is admitted to reading text only by
# this exact, reviewed rule. Every other introduction stays in front matter.
CANONICAL_INTRO = {("SIR", "The Prologue of the Wisdom of Jesus the Son of Sirach.")}

PARA_MARKERS = {"p", "m", "pi1", "mi", "pc"}
POETRY_MARKERS = {"q1", "q2", "q3", "li1"}
FRONT_MARKERS = {"id", "ide", "h", "toc1", "toc2", "toc3", "mt1", "mt2", "mt3"}
# USFM: an opening character marker is followed by one delimiter space that is
# not text; a closing marker (ending in *) consumes nothing after it.
KEEP_TEXT_OPEN = re.compile(r"\\\+?(?:wj|qs|bk|add|nd) ")
KEEP_TEXT_CLOSE = re.compile(r"\\\+?(?:wj|qs|bk|add|nd)\*")


def sha256(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def utf16len(s: str) -> int:
    return len(s.encode("utf-16-le")) // 2


def fail(msg: str) -> None:
    sys.exit(f"FAIL: {msg}")


def native_order(meta_xml: bytes) -> list[dict]:
    root = ET.fromstring(meta_xml.decode("utf-8-sig"))
    names = {}
    for b in root.iter("book"):
        if b.get("code") and b.find("short") is not None:
            names[b.get("code")] = {"short": b.findtext("short"), "long": b.findtext("long"), "abbr": b.findtext("abbr")}
    default = [bl for bl in root.iter("bookList") if bl.get("default") == "true"]
    if len(default) != 1:
        fail("metadata must have exactly one default bookList")
    return [{"code": b.get("code"), **names[b.get("code")]} for b in default[0].iter("book") if b.get("code")]


class Notes:
    def __init__(self) -> None:
        self.items: list[dict] = []

    def strip(self, text: str, ref: str) -> str:
        def take(kind):
            def repl(m):
                body = re.sub(r"\\\+?w ([^|\\]*)\|[^\\]*?\\\+?w\*", r"\1", m.group(1))
                self.items.append({"ref": ref, "kind": kind, "usfm": m.group(0), "text": clean_note(body)})
                return ""
            return repl
        text = re.sub(r"\\f (.*?)\\f\*", take("footnote"), text)
        text = re.sub(r"\\x (.*?)\\x\*", take("crossref"), text)
        return text


def clean_note(s: str) -> str:
    s = re.sub(r"\\\+?[a-z]+\d?\*?\s?", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def clean_text(s: str) -> str:
    s = re.sub(r"\\\+?w ([^|\\]*)\|[^\\]*?\\\+?w\*", r"\1", s)
    s = re.sub(r"\\\+?w ([^\\]*)\\\+?w\*", r"\1", s)
    s = KEEP_TEXT_CLOSE.sub("", KEEP_TEXT_OPEN.sub("", s))
    if "\\" in s:
        fail(f"unhandled USFM character marker in: {s[:160]!r}")
    return s


class Builder:
    def __init__(self, order: list[dict]):
        self.order = order
        self.chapters: list[dict] = []
        self.verse_rows: list[dict] = []
        self.spans: dict[str, list[dict]] = {}
        self.layout: list[dict] = []
        self.front: list[dict] = []
        self.empty_refs: list[dict] = []
        self.notes = Notes()
        self.chapter_map: list[dict] = []
        self.book_chapters: dict[str, list[int]] = {}

    # --- paragraph plumbing -------------------------------------------------
    def open_para(self, kind: str, style: str, continued=False):
        self.close_para()
        self.para = {"kind": kind, "style": style, "text": "", "lines": [], "continued": continued}

    def close_para(self):
        p = getattr(self, "para", None)
        self.para = None
        if not p or not p["text"].strip():
            if p and p["text"].strip() == "" and p.get("pending_refs"):
                fail("paragraph closed with verse spans but no text")
            return
        ch = self.chapter
        idx = len(ch["paragraphs"])
        ch["paragraphs"].append(p["text"])
        entry = {"chapterNumber": ch["number"], "paragraphIndex": idx, "kind": p["kind"], "style": p["style"]}
        if p["lines"]:
            entry["lines"] = p["lines"]
        if p["continued"]:
            entry["continuesPreviousParagraph"] = True
        if self.pending_headings:
            entry["headingsBefore"] = self.pending_headings
            self.pending_headings = []
        self.layout.append(entry)
        for ref, s, e in p.get("pieces", []):
            spans = self.spans.setdefault(ref, [])
            if spans and spans[-1]["chapterNumber"] == ch["number"] and spans[-1]["paragraphIndex"] == idx:
                spans[-1]["end"] = e
            else:
                spans.append({"chapterNumber": ch["number"], "paragraphIndex": idx, "start": s, "end": e})

    def append(self, text: str, ref: str | None, label: str | None = None):
        text = re.sub(r"\s+", " ", text).strip()
        if not text and not label:
            return
        if self.para is None:
            self.open_para("prose", "implicit")
            self.implicit_paras.append(self.cur_ref())
        p = self.para
        if p["text"]:
            p["text"] += " "
        if label:
            p["text"] += label + " "
        if text:
            start = utf16len(p["text"])
            p["text"] += text
            p.setdefault("pieces", []).append((ref, start, utf16len(p["text"])))

    def cur_ref(self):
        return f"{self.book}.{self.chap_id}"

    # --- main parse ---------------------------------------------------------
    def book_file(self, code: str, usfm: str):
        self.book, self.chap_id, self.verse = code, None, None
        self.para, self.chapter, self.pending_headings = None, None, []
        self.implicit_paras = []
        info = next(b for b in self.order if b["code"] == code)
        pending_is = None
        lines = usfm.replace("\r\n", "\n").split("\n")
        for raw in lines:
            line = raw.rstrip()
            if not line.strip():
                continue
            m = re.match(r"^\\(\S+)\s?(.*)$", line)
            if not m:
                if self.chapter is None:
                    fail(f"{code}: text before first chapter: {line[:80]!r}")
                self.text_run(line)
                continue
            mk, rest = m.group(1), m.group(2)
            if mk in FRONT_MARKERS:
                if self.chapter is not None and mk.startswith("mt"):
                    fail(f"{code}: title marker inside chapters")
                if mk == "id" and not rest.startswith(code):
                    fail(f"{code}: \\id mismatch {rest!r}")
                self.front.append({"book": code, "marker": mk, "text": clean_note(rest)})
                continue
            if mk == "is1":
                pending_is = clean_note(rest)
                self.front.append({"book": code, "marker": mk, "text": pending_is})
                continue
            if mk == "ip":
                if self.chapter is not None:
                    fail(f"{code}: introduction inside chapter text")
                if (code, pending_is) in CANONICAL_INTRO:
                    self.prologue = self.notes.strip(rest, f"{code}.PROLOGUE")
                    pending_is = None
                    continue
                self.front.append({"book": code, "marker": mk, "text": clean_note(self.notes.strip(rest, f"{code}.INTRO"))})
                continue
            if mk == "cl" and self.chapter is None:
                self.front.append({"book": code, "marker": mk, "text": clean_note(rest)})
                continue
            if mk == "c":
                self.close_para()
                self.new_chapter(info, rest.strip())
                continue
            if self.chapter is None:
                fail(f"{code}: marker \\{mk} before first chapter")
            if mk == "cl":
                self.front.append({"book": code, "marker": mk, "text": clean_note(rest)})
            elif mk in ("s1", "ms1", "sp"):
                self.close_para()
                self.pending_headings.append({"marker": mk, "text": clean_note(self.notes.strip(rest, self.ref_here()))})
            elif mk == "d":
                self.close_para()
                self.open_para("superscription", "d")
                # Chapter-initial superscription: BOOK.C.d. A mid-chapter one
                # (the Psalm 119 letter headings) is keyed after its verse.
                dref = f"{self.cur_ref()}.d" if self.verse is None else f"{self.cur_ref()}.d+{self.verse}"
                self.append(clean_text(self.notes.strip(rest, dref)), dref)
                self.close_para()
            elif mk == "b":
                self.close_para()
            elif mk == "nb":
                if self.para is None:
                    self.open_para("prose", "nb", continued=True)
                if rest.strip():
                    self.text_run(rest)
            elif mk in PARA_MARKERS:
                self.open_para("prose", mk)
                if rest.strip():
                    self.text_run(rest)
            elif mk in POETRY_MARKERS:
                kind = "list" if mk == "li1" else "poetry"
                if self.para is None or self.para["kind"] != kind:
                    self.open_para(kind, kind)
                self.para["lines"].append({"start": utf16len(self.para["text"]) + (1 if self.para["text"] else 0), "marker": mk})
                if rest.strip():
                    self.text_run(rest)
            elif mk == "v":
                self.text_run(line)
            else:
                fail(f"{code}: unhandled paragraph marker \\{mk}")
        self.close_para()
        if self.implicit_paras:
            fail(f"{code}: text outside any paragraph marker at {self.implicit_paras[:5]}")

    def ref_here(self):
        return f"{self.book}.{self.chap_id}.{self.verse}" if self.verse else f"{self.book}.{self.chap_id}"

    def text_run(self, s: str):
        # A run may contain one or more \v markers.
        parts = re.split(r"\\v (\S+)\s?", s)
        head = parts[0]
        if head.strip():
            if self.verse is None:
                # Chapter-initial source text before verse 1 (for example the
                # title line of Sirach 51). Kept as reading text under its own key.
                ref = f"{self.cur_ref()}.pre"
                self.unversed.append(ref)
            else:
                ref = f"{self.cur_ref()}.{self.verse}"
            self.append(clean_text(self.notes.strip(head, ref)), ref)
        for vid, body in zip(parts[1::2], parts[2::2]):
            if not re.fullmatch(r"\d+(-\d+)?", vid):
                fail(f"{self.cur_ref()}: unexpected verse id {vid!r}")
            self.verse = vid
            ref = f"{self.cur_ref()}.{vid}"
            if ref in self.seen_refs:
                fail(f"duplicate verse {ref}")
            self.seen_refs.add(ref)
            text = clean_text(self.notes.strip(body, ref))
            row = {"ref": ref, "book": self.book, "chapter": int(self.chap_id), "verse": vid}
            if re.sub(r"\s+", " ", text).strip():
                self.append(text, ref, label=vid.translate(SUPERSCRIPT))
                self.verse_rows.append(row)
            else:
                self.empty_refs.append({**row, "notes": [n["text"] for n in self.notes.items if n["ref"] == ref]})

    def new_chapter(self, info: dict, cid: str):
        if not cid.isdigit():
            fail(f"{self.book}: chapter id {cid!r}")
        self.chap_id, self.verse = cid, None
        number = len(self.chapters) + 1
        self.chapter = {"number": number, "title": f"{info['short']} {cid}", "paragraphs": []}
        self.chapters.append(self.chapter)
        self.chapter_map.append({"chapterNumber": number, "bookCode": self.book, "biblicalChapter": int(cid)})
        self.book_chapters.setdefault(self.book, []).append(number)
        if cid == "1" and getattr(self, "prologue", None):
            self.open_para("prose", "ip-prologue")
            self.pending_headings.append({"marker": "is1", "text": next(t for c, t in CANONICAL_INTRO if c == self.book)})
            ref = f"{self.book}.PROLOGUE"
            self.append(clean_text(self.prologue), ref)
            self.verse_rows.append({"ref": ref, "book": self.book, "chapter": None, "verse": "PROLOGUE"})
            self.close_para()
            self.prologue = None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--usfm-zip", required=True)
    ap.add_argument("--usfx-zip", required=True, help="official archive holding eng-web-cmetadata.xml (book order)")
    args = ap.parse_args()

    usfm_bytes = Path(args.usfm_zip).read_bytes()
    usfx_bytes = Path(args.usfx_zip).read_bytes()
    for name, data in (("eng-web-c_usfm.zip", usfm_bytes), ("eng-web-c_usfx.zip", usfx_bytes)):
        if sha256(data) != PINNED[name]:
            fail(f"{name} sha256 {sha256(data)} does not match pinned {PINNED[name]}; refusing to stage changed source")

    usfm_zip = zipfile.ZipFile(io.BytesIO(usfm_bytes))
    meta = zipfile.ZipFile(io.BytesIO(usfx_bytes)).read("eng-web-cmetadata.xml")
    order = native_order(meta)
    if len(order) != 73:
        fail(f"expected 73 books in the official book list, got {len(order)}")
    files = {}
    for n in usfm_zip.namelist():
        m = re.match(r"^\d\d-([A-Z0-9]{3})eng-web-c\.usfm$", n)
        if m:
            files[m.group(1)] = n
    if set(files) != {b["code"] for b in order}:
        fail(f"USFM files {sorted(files)} differ from official book list")

    b = Builder(order)
    b.seen_refs = set()
    b.prologue = None
    b.unversed = []
    input_hashes = {}
    for info in order:
        raw = usfm_zip.read(files[info["code"]])
        input_hashes[files[info["code"]]] = sha256(raw)
        b.book_file(info["code"], raw.decode("utf-8-sig"))

    chapter_titles = {c["number"]: c["title"] for c in b.chapters}
    sections = []
    listed = []
    for testament, groups in SECTIONS:
        tg = {"title": testament, "sections": []}
        for gname, codes in groups:
            gg = {"title": gname, "sections": []}
            for code in codes:
                info = next(x for x in order if x["code"] == code)
                gg["sections"].append({"title": info["short"], "chapters": b.book_chapters[code]})
                listed.append(code)
            tg["sections"].append(gg)
        sections.append(tg)
    if listed != [x["code"] for x in order]:
        fail("section tree does not reproduce the official native book order")

    edition = {"sections": sections, "chapters": b.chapters}
    OUT.mkdir(exist_ok=True)

    def write(name, obj, indent=None):
        data = (json.dumps(obj, ensure_ascii=False, indent=indent) + "\n").encode("utf-8")
        (OUT / name).write_bytes(data)
        return sha256(data)

    cand_sha = write("bible-webc-en.candidate.json", edition, indent=2)

    # Canonical verse text: each verse's spans joined with one space.
    verse_text = []
    for row in b.verse_rows:
        spans = b.spans[row["ref"]]
        pieces = []
        for s in spans:
            para = b.chapters[s["chapterNumber"] - 1]["paragraphs"][s["paragraphIndex"]]
            enc = para.encode("utf-16-le")
            pieces.append(enc[s["start"] * 2:s["end"] * 2].decode("utf-16-le"))
        verse_text.append({**row, "text": " ".join(pieces)})
    outputs = {"bible-webc-en.candidate.json": cand_sha}
    outputs["verse-text.json"] = write("verse-text.json", {"edition": EDITION_KEY, "verses": verse_text})
    outputs["verse-crosswalk.json"] = write("verse-crosswalk.json", {
        "edition": EDITION_KEY, "candidateSha256": cand_sha, "offsetUnit": "utf16", "endExclusive": True,
        "note": "Keys are source-native USFM references BOOK.CHAPTER.VERSE (verse may be a source range such as 15-16). "
                "Spans exclude the superscript verse label. BOOK.CHAPTER.d is a chapter-initial superscription and BOOK.CHAPTER.d+N one following verse N; BOOK.CHAPTER.pre is chapter-initial text before verse 1; SIR.PROLOGUE is the Sirach prologue.",
        "verses": {r["ref"]: b.spans[r["ref"]] for r in b.verse_rows} | {
            k: v for k, v in b.spans.items() if re.search(r"\.(d|d\+\d+|pre)$", k)},
    })
    outputs["chapter-crosswalk.json"] = write("chapter-crosswalk.json", {
        "editionKey": EDITION_KEY, "sourceSha256": cand_sha, "chapters": b.chapter_map}, indent=1)
    outputs["layout.json"] = write("layout.json", {"edition": EDITION_KEY, "candidateSha256": cand_sha,
                                                   "paragraphs": b.layout})
    outputs["front-matter.json"] = write("front-matter.json", {"items": b.front}, indent=1)
    outputs["notes.json"] = write("notes.json", {"notes": b.notes.items})
    outputs["official-empty-references.json"] = write("official-empty-references.json", {"references": b.empty_refs}, indent=1)

    stats = {
        "books": len(order), "chapters": len(b.chapters),
        "paragraphs": sum(len(c["paragraphs"]) for c in b.chapters),
        "nonemptyVerses": sum(1 for r in b.verse_rows if r["verse"] != "PROLOGUE"),
        "rangeVerses": [r["ref"] for r in b.verse_rows if "-" in r["verse"]],
        "superscriptions": sum(1 for k in b.spans if re.search(r"\.d(\+\d+)?$", k)),
        "chapterInitialUnversed": b.unversed,
        "prologues": [r["ref"] for r in b.verse_rows if r["verse"] == "PROLOGUE"],
        "emptyReferences": [r["ref"] for r in b.empty_refs],
        "notes": len(b.notes.items),
        "bookOrder": [x["code"] for x in order],
        "chaptersPerBook": {k: len(v) for k, v in b.book_chapters.items()},
    }
    (OUT / "stage-stats.json").write_text(json.dumps(stats, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    prov = {
        "source": {
            "name": "World English Bible (Catholic)", "abbreviation": "WEBC", "ebibleId": "eng-web-c",
            "details": "https://ebible.org/find/details.php?id=eng-web-c",
            "rights": "Public domain. \"World English Bible\" is a trademark of eBible.org; changed text must not carry the name (https://ebible.org/web/).",
            "downloads": {
                "eng-web-c_usfm.zip": {"url": "https://ebible.org/Scriptures/eng-web-c_usfm.zip", "sha256": PINNED["eng-web-c_usfm.zip"], "bytes": len(usfm_bytes)},
                "eng-web-c_usfx.zip": {"url": "https://ebible.org/Scriptures/eng-web-c_usfx.zip", "sha256": PINNED["eng-web-c_usfx.zip"], "bytes": len(usfx_bytes)},
            },
            "usfmMembers": input_hashes,
            "metadataXmlSha256": sha256(meta),
        },
        "stagerSha256": sha256(Path(__file__).read_bytes()),
        "outputs": outputs,
    }
    (OUT / "provenance.json").write_text(json.dumps(prov, indent=1) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in stats.items() if k not in ("chaptersPerBook", "bookOrder")}, indent=1))


if __name__ == "__main__":
    main()

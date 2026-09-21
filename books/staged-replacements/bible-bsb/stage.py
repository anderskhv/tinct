#!/usr/bin/env python3
"""Staged-only BSB import. Standard library; no inference, app writes or credentials."""
import argparse, collections, datetime, hashlib, io, json, re, urllib.request, zipfile
from pathlib import Path

BASE = "0cd12bc06850ee85a1ac5dd7749cc8153062d50c"
SOURCES = {
    "bsb_usj.zip": ("https://bereanbible.com/bsb_usj.zip", "53acad65d590f5bc8cded3e14b37b7b02916f6a365211bcf60ea733ecd800e8f"),
    "bsb.txt": ("https://bereanbible.com/bsb.txt", "2ac3af1de52d4e68261cba91d85c320b7eadc6560e830d99e591767b8ff5ca96"),
}
CODES = "GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV".split()
COUNTS = [50,40,27,36,34,24,21,4,31,24,22,25,29,36,10,13,10,42,150,31,12,8,66,52,5,48,12,14,3,9,1,4,7,3,3,3,2,14,4,28,16,24,21,28,16,16,13,6,6,4,4,5,3,6,4,3,1,13,5,5,3,5,1,1,1,22]
BODY = {"p","pc","pmo","q1","q2","qr","li1","li2"}
META = {"h","toc1","toc2","toc3","mt1","mt2","ms","mr","s1","s2","r","d","qa","b"}
SUPER = str.maketrans("0123456789", "⁰¹²³⁴⁵⁶⁷⁸⁹")
UNSUPER = str.maketrans("⁰¹²³⁴⁵⁶⁷⁸⁹", "0123456789")
MARKER = re.compile(r"(?<!\S)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)(?=\s)")

def digest(b):
    return hashlib.sha256(b).hexdigest()

def norm(s):
    # Display whitespace only; no punctuation/case/spelling normalization.
    return re.sub(r"\s+", " ", s).strip()

def utf16(s):
    return len(s.encode("utf-16-le")) // 2

def dump(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def atoms(x):
    if isinstance(x, str):
        yield x
        return
    typ = x["type"]
    if typ == "note":
        return
    if typ == "verse":
        yield x
    elif typ in {"char", "ref"}:
        if typ == "char" and x.get("marker") != "wj":
            raise ValueError("Unexpected reading character style: " + str(x))
        for c in x.get("content", []):
            yield from atoms(c)
    else:
        raise ValueError("Unexpected reading node: " + typ)

def flatten(x):
    if isinstance(x, str):
        return x
    return "".join(flatten(c) for c in x.get("content", []))

def parse_book(doc, code, title, offset):
    if doc.get("type") != "USJ" or doc.get("version") != "3.1":
        raise ValueError("Unexpected USJ schema")
    book_nodes = [x for x in doc["content"] if isinstance(x, dict) and x.get("type") == "book"]
    if len(book_nodes) != 1 or book_nodes[0]["code"] != code:
        raise ValueError("Book identity mismatch")
    chapters, verse_text, index, blocks = [], {}, {}, []
    ch = None
    current_ref = None
    pieces = collections.defaultdict(list)
    for node_number, node in enumerate(doc["content"]):
        if isinstance(node, str):
            if node.strip():
                raise ValueError("Unaccounted top-level text")
            continue
        typ = node["type"]
        if typ == "book":
            continue
        if typ == "chapter":
            number = int(node["number"])
            if number != len(chapters) + 1:
                raise ValueError("Nonsequential chapter")
            ch = {"number": offset + number, "title": f"{title} {number}", "paragraphs": []}
            chapters.append(ch)
            current_ref = None
            continue
        if typ != "para" or node["marker"] not in BODY | META:
            raise ValueError("Unknown top-level node: " + str(node))
        marker = node["marker"]
        block = {"sourceNode": node_number, "chapterNumber": ch["number"] if ch else None,
                 "marker": marker, "paragraphIndex": None, "usj": node}
        blocks.append(block)
        if marker in META:
            continue
        if ch is None:
            raise ValueError("Reading paragraph before chapter")
        segments = []
        raw = ""
        for atom in (a for child in node.get("content", []) for a in atoms(child)):
            if isinstance(atom, str):
                raw += atom
            else:
                if raw.strip():
                    if current_ref is None:
                        raise ValueError("Reading text without verse")
                    segments.append((current_ref, raw))
                raw = ""
                v = atom["number"]
                if not re.fullmatch(r"[1-9]\d*", v):
                    raise ValueError("Unsupported verse bridge/suffix: " + v)
                current_ref = f"{code}.{ch['number'] - offset}.{v}"
                if current_ref in verse_text:
                    raise ValueError("Duplicate source verse " + current_ref)
                verse_text[current_ref] = ""
                index[current_ref] = []
                # Marker retained as presentation, not part of source verse text.
                segments.append((current_ref, None))
        if raw.strip():
            if current_ref is None:
                raise ValueError("Reading text without verse")
            segments.append((current_ref, raw))
        text = ""
        spans = []
        for ref, raw in segments:
            if raw is None:
                if text and not text.endswith(" "):
                    text += " "
                text += ref.rsplit(".", 1)[1].translate(SUPER) + " "
                continue
            fragment = norm(raw)
            if not fragment:
                continue
            if text and not text.endswith(" "):
                text += " "
            start = utf16(text)
            text += fragment
            spans.append((ref, start, utf16(text), fragment))
            pieces[ref].append(fragment)
        if text.strip():
            p = len(ch["paragraphs"])
            ch["paragraphs"].append(text)
            block["paragraphIndex"] = p
            for ref, start, end, fragment in spans:
                index[ref].append({"chapterNumber": ch["number"], "paragraphIndex": p,
                                  "startUtf16": start, "endUtf16": end,
                                  "textSha256": digest(fragment.encode())})
    for ref in verse_text:
        verse_text[ref] = norm(" ".join(pieces[ref]))
        if not verse_text[ref]:
            raise ValueError("Empty source verse " + ref)
    return chapters, verse_text, index, blocks

def leaf_books(sections):
    result = []
    for s in sections:
        if s.get("chapters"):
            if s.get("sections"):
                raise ValueError("Mixed section")
            result.append(s)
        else:
            result.extend(leaf_books(s.get("sections", [])))
    return result

def parse_text_export(raw, titles):
    names = {name: code for code, name in zip(CODES, titles)}
    names["Psalm"] = "PSA"
    names["Song of Songs"] = "SNG"
    out = {}
    for line in raw.decode("utf-8-sig").splitlines():
        m = re.match(r"^(.+?) (\d+):(\d+)\t(.*)$", line)
        if not m:
            if re.search(r"\d+:\d+", line):
                raise ValueError("Unparsed text-export reference: " + line[:150])
            continue
        name, c, v, text = m.groups()
        ref = f"{names[name]}.{c}.{v}"
        if ref in out:
            raise ValueError("Duplicate text-export verse")
        out[ref] = norm(text)
    return out

def legacy_index(data, code_by_global):
    result, issues = {}, []
    for ch in data["chapters"]:
        number = ch["number"]
        code, local_ch = code_by_global[number]
        last = 0
        chapter_issues = []
        for p, text in enumerate(ch["paragraphs"]):
            markers = list(MARKER.finditer(text))
            if not markers or text[:markers[0].start()].strip():
                chapter_issues.append({"paragraphIndex": p, "kind": "unmarked_text"})
            if re.search(r"Project Gutenberg|GUTENBERG|www\.gutenberg|End of.*Project", text):
                chapter_issues.append({"paragraphIndex": p, "kind": "apparatus_contamination"})
            for i, m in enumerate(markers):
                v = int(m[1].translate(UNSUPER))
                if v <= last:
                    chapter_issues.append({"paragraphIndex": p, "kind": "nonincreasing_verse", "verse": v})
                last = v
                ref = f"{code}.{local_ch}.{v}"
                start = m.end()
                while start < len(text) and text[start].isspace():
                    start += 1
                end = markers[i + 1].start() if i + 1 < len(markers) else len(text)
                while end > start and text[end-1].isspace():
                    end -= 1
                result.setdefault(ref, []).append({
                    "chapterNumber": number, "paragraphIndex": p,
                    "startUtf16": utf16(text[:start]), "endUtf16": utf16(text[:end]),
                    "textSha256": digest(text[start:end].encode())})
        if chapter_issues:
            issues.append({"chapterNumber": number, "issues": chapter_issues})
    unsafe = {x["chapterNumber"] for x in issues}
    return result, issues, unsafe

def correspondence(refs, indices, unsafe):
    rows = {}
    for ref in refs:
        row = {}
        for ed, idx in indices.items():
            spans = idx.get(ref, [])
            if not spans:
                status = "missing_reference"
            elif any(s["chapterNumber"] in unsafe.get(ed, set()) for s in spans):
                status = "unsafe_source_chapter"
            elif ed != "bsb-en" and len(spans) != 1:
                status = "ambiguous_reference"
            else:
                status = "reference_match"
            row[ed] = {"status": status, "spans": spans}
        rows[ref] = row
    return rows

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--repo", type=Path, default=Path("."))
    args = ap.parse_args()
    # Never generate into the app or repository root.
    out = args.output.resolve()
    repo = args.repo.resolve()
    if out == repo or out == Path("/") or repo / "app" in [out, *out.parents]:
        raise ValueError("Unsafe output location")
    if out.exists() and any(out.iterdir()):
        raise ValueError("Output must be new or empty; preserve previous artifacts")
    out.mkdir(parents=True, exist_ok=True)
    provenance = {"sourceVersion": "BSB third printing; USJ 3.1", "editionKey": "bsb-en",
                  "inputBaseCommit": BASE, "acquiredAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  "rightsUrl": "https://berean.bible/terms.htm", "inputs": {}, "status": "staged-only"}
    raws = {}
    for name, (url, expected) in SOURCES.items():
        b = urllib.request.urlopen(url, timeout=90).read()
        if digest(b) != expected:
            raise ValueError(f"Official source changed: {name}; inspect and repin, never silently accept")
        raws[name] = b
        (out / name).write_bytes(b)
        provenance["inputs"][name] = {"url": url, "sha256": expected, "bytes": len(b)}
    legacy, legacy_raw = {}, {}
    for ed in ("kjv-en", "web-en"):
        p = repo / f"app/public/data/editions/bible-{ed}.json"
        b = p.read_bytes()
        legacy_raw[ed] = b
        legacy[ed] = json.loads(b)
        provenance["inputs"][ed] = {"path": str(p.relative_to(repo)), "sha256": digest(b)}
    leaves = leaf_books(legacy["kjv-en"]["sections"])
    if len(leaves) != 66:
        raise ValueError("Expected 66 existing book sections")
    titles = [s["title"] for s in leaves]
    global_map, total = {}, 0
    for code, count, leaf in zip(CODES, COUNTS, leaves):
        expected = list(range(total + 1, total + count + 1))
        if leaf["chapters"] != expected:
            raise ValueError("Legacy section identity mismatch " + code)
        for n, g in enumerate(expected, 1):
            global_map[g] = (code, n)
        total += count
    for ed, d in legacy.items():
        if [c["number"] for c in d["chapters"]] != list(range(1,1190)):
            raise ValueError("Legacy chapter identities invalid " + ed)
        if d["sections"] != legacy["kjv-en"]["sections"]:
            raise ValueError("Legacy section maps differ " + ed)
    z = zipfile.ZipFile(io.BytesIO(raws["bsb_usj.zip"]))
    names = [n for n in z.namelist() if n.endswith(".usj") and not n.startswith("__MACOSX")]
    if set(names) != {f"bsb_usj/{c}.usj" for c in CODES} or len(names) != 66:
        raise ValueError("Unexpected archive members")
    chapters, verses, indices, structure = [], {}, {}, {}
    offset = 0
    for code, title, count in zip(CODES, titles, COUNTS):
        doc = json.loads(z.read(f"bsb_usj/{code}.usj"))
        cs, vs, ix, blocks = parse_book(doc, code, title, offset)
        if len(cs) != count or any(not c["paragraphs"] for c in cs):
            raise ValueError("Wrong/empty BSB chapters " + code)
        chapters.extend(cs); verses.update(vs); indices.update(ix); structure[code] = blocks
        offset += count
    external = parse_text_export(raws["bsb.txt"], titles)
    differences = [{"reference": r, "usj": verses.get(r), "textExport": external.get(r)}
                   for r in dict.fromkeys([*external, *verses]) if verses.get(r) != external.get(r)]
    dump(out / "source-export-differences.json", differences)
    # Raw AST is preserved in archive, with all metadata/note nodes in structure sidecar.
    edition = {"sections": legacy["kjv-en"]["sections"], "chapters": chapters}
    dump(out / "bible-bsb-en.candidate.json", edition)
    dump(out / "source-structure.json", structure)
    dump(out / "bsb-verse-text.json", verses)
    all_indices = {"bsb-en": indices}
    issues, unsafe = {}, {}
    for ed, d in legacy.items():
        all_indices[ed], issues[ed], unsafe[ed] = legacy_index(d, global_map)
    refs = list(dict.fromkeys([*verses, *all_indices["kjv-en"], *all_indices["web-en"]]))
    mapping = correspondence(refs, all_indices, unsafe)
    dump(out / "verse-crosswalk.json", {"schemaVersion": 1, "offsetUnit": "UTF-16 code units, end exclusive",
         "warning": "Reference correspondence only; not semantic or word alignment. Unsafe/missing spans cannot project automatically.",
         "inputHashes": provenance["inputs"], "references": mapping})
    dump(out / "legacy-mapping-issues.json", issues)
    dump(out / "chapter-crosswalk.json", [{"chapterNumber": g, "bookCode": c, "biblicalChapter": n} for g,(c,n) in global_map.items()])
    sample_refs = ["GEN.1.1","PSA.23.1","ISA.53.5","JER.14.1","MAT.5.3","ROM.8.1","REV.21.1","REV.22.21"]
    summary = {"books":66,"chapters":len(chapters),"sourceVerses":len(verses),"textExportVerses":len(external),
       "sourceExportDifferences":len(differences), "sourceExportExamples":differences[:12],
       "paragraphs":sum(len(c["paragraphs"]) for c in chapters),
       "legacyUnsafeChapters":{ed:sorted(ns) for ed,ns in unsafe.items()},
       "crosswalkStatusCounts":{ed:dict(collections.Counter(row[ed]["status"] for row in mapping.values())) for ed in all_indices},
       "samples":{r:verses.get(r) for r in sample_refs},
       "candidateAccepted":not differences, "readerIntegration":False,"audio":False}
    dump(out / "validation.json", summary)
    provenance["outputs"] = {p.name:digest(p.read_bytes()) for p in out.glob("*.json")}
    dump(out / "provenance.json", provenance)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if differences:
        raise SystemExit("Source export differences require investigation before acceptance")
    assert len(chapters) == 1189

if __name__ == "__main__":
    main()

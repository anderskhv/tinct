#!/usr/bin/env python3
"""
Mechanical inventory + screening pass for the 2026-09-11 modern-English
translation audit.

For every book in the current bookRegistry.ts (public + staged), and for
every English-relevant edition, records:
  - chapter/paragraph counts, word counts
  - sha256 hash of the edition file (snapshot identifier)
  - per-chapter word-token similarity between the "core" English source
    (original-en / kjv-en / etc.) and modern-en, when both exist
  - structural flags: chapter-count mismatch, paragraph-count mismatch per
    chapter, empty/very-short paragraphs, byte-identical paragraphs,
    truncation ratio flags (target/source word ratio < 0.6 on paragraphs
    with >=20 source words), suspicious last-chapter length vs. book mean.

This is a SCREENING pass only. Per books/AGENTS.md and the audit brief:
similarity/length signals do not establish semantic completeness or
omission on their own. Every book still requires editorial sampling
(Phase 2) before a recommendation is made.

Output:
  mechanical/<book-id>.json   one file per book
  mechanical/summary.csv      one row per book
"""
import csv
import hashlib
import json
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REGISTRY = ROOT / "app" / "src" / "data" / "bookRegistry.ts"
EDITIONS = ROOT / "app" / "public" / "data" / "editions"
OUT_DIR = Path(__file__).resolve().parent


def find_matching(text, start, o, c):
    depth = 0
    ins = None
    esc = False
    for i in range(start, len(text)):
        ch = text[i]
        if ins:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == ins:
                ins = None
            continue
        if ch in ("'", '"', "`"):
            ins = ch
        elif ch == o:
            depth += 1
        elif ch == c:
            depth -= 1
            if depth == 0:
                return i
    raise ValueError("unmatched bracket")


def sval(k, block):
    mm = re.search(r"\b" + k + r":\s*'((?:\\'|[^'])*)'", block) or re.search(
        r'\b' + k + r':\s*"((?:\\"|[^"])*)"', block
    )
    return mm.group(1).replace("\\'", "'") if mm else None


def parse_registry():
    t = REGISTRY.read_text()
    consts = {}
    for m in re.finditer(r"export const (\w+): Book = \{", t):
        s = m.end() - 1
        e = find_matching(t, s, "{", "}")
        block = t[s : e + 1]
        d = {k: sval(k, block) for k in ["id", "title", "author"]}
        for k in ["year", "wordCount"]:
            mm = re.search(r"\b" + k + r":\s*(-?\d+)", block)
            d[k] = int(mm.group(1)) if mm else None
        em = re.search(r"editions:\s*\[", block)
        es = em.end() - 1
        ee = find_matching(block, es, "[", "]")
        eb = block[es + 1 : ee]
        eds = []
        i = 0
        while True:
            j = eb.find("{", i)
            if j < 0:
                break
            k = find_matching(eb, j, "{", "}")
            part = eb[j : k + 1]
            i = k + 1
            ed = {kk: sval(kk, part) for kk in ["key", "language", "style", "label", "translator"]}
            mm = re.search(r"\byear:\s*(-?\d+)", part)
            ed["year"] = int(mm.group(1)) if mm else None
            for kk in ["aligned", "hasAudio"]:
                mm = re.search(r"\b" + kk + r":\s*(true|false)", part)
                ed[kk] = (mm.group(1) == "true") if mm else None
            eds.append(ed)
        d["editions"] = eds
        consts[m.group(1)] = d
    bm = re.search(r"export const BOOKS: Book\[\] = \[([^\]]+)\]", t, re.S)
    names = [x.strip() for x in bm.group(1).split(",") if x.strip()]
    public_ids = {consts[n]["id"] for n in names if n in consts}
    public = [consts[n] for n in names if n in consts]
    staged = [v for k, v in consts.items() if k not in names]
    return public, staged, public_ids


def load_edition(book_id, key):
    path = EDITIONS / f"{book_id}-{key}.json"
    if not path.exists():
        return None, None
    raw = path.read_bytes()
    h = hashlib.sha256(raw).hexdigest()[:16]
    return json.loads(raw), h


def para_sim(a, b):
    if a == b:
        return 1.0
    return SequenceMatcher(None, a.split(), b.split()).ratio()


def analyze_pair(base, target):
    """base -> target chapter/paragraph comparison. Returns dict of flags."""
    bch = base.get("chapters", [])
    tch = target.get("chapters", [])
    chapter_count_mismatch = len(bch) != len(tch)
    n = min(len(bch), len(tch))
    para_count_mismatches = []
    identical_long = 0
    long_paras = 0
    truncated = []
    empty_paras = []
    sims = []
    for ci in range(n):
        bp = bch[ci].get("paragraphs", [])
        tp = tch[ci].get("paragraphs", [])
        if len(bp) != len(tp):
            para_count_mismatches.append({"chapter": ci + 1, "base_paras": len(bp), "target_paras": len(tp)})
        m = min(len(bp), len(tp))
        acc = 0.0
        wsum = 0.0
        for pi in range(m):
            a, b = bp[pi], tp[pi]
            aw = len(a.split())
            bw = len(b.split())
            if aw >= 12:
                sim = para_sim(a, b)
                w = max(aw, 1)
                acc += sim * w
                wsum += w
                if len(a) >= 80 and a == b:
                    identical_long += 1
                if len(a) >= 80:
                    long_paras += 1
            if aw >= 20 and bw / max(aw, 1) < 0.6:
                truncated.append({"chapter": ci + 1, "paragraph": pi, "src_words": aw, "tgt_words": bw, "ratio": round(bw / aw, 2)})
            if bw == 0 and aw > 0:
                empty_paras.append({"chapter": ci + 1, "paragraph": pi})
        if wsum > 0:
            sims.append((acc / wsum, sum(len(p.split()) for p in bp)))
    if sims:
        total_w = sum(w for _, w in sims)
        mean_sim = sum(s * w for s, w in sims) / total_w if total_w else None
    else:
        mean_sim = None
    pct_identical_long = round(100 * identical_long / long_paras, 1) if long_paras else 0.0
    # last-chapter length anomaly vs mean (suspicious truncated ending)
    chapter_word_counts = [sum(len(p.split()) for p in c.get("paragraphs", [])) for c in tch]
    last_chapter_flag = False
    if len(chapter_word_counts) >= 3:
        mean_others = sum(chapter_word_counts[:-1]) / max(len(chapter_word_counts) - 1, 1)
        if mean_others > 0 and chapter_word_counts[-1] < 0.15 * mean_others:
            last_chapter_flag = True
    return {
        "chapter_count_base": len(bch),
        "chapter_count_target": len(tch),
        "chapter_count_mismatch": chapter_count_mismatch,
        "para_count_mismatches": para_count_mismatches[:25],
        "para_count_mismatch_total": len(para_count_mismatches),
        "mean_weighted_similarity": round(mean_sim, 4) if mean_sim is not None else None,
        "pct_identical_long_paragraphs": pct_identical_long,
        "truncated_paragraphs_sample": truncated[:25],
        "truncated_paragraphs_total": len(truncated),
        "empty_paragraphs_sample": empty_paras[:25],
        "empty_paragraphs_total": len(empty_paras),
        "last_chapter_suspiciously_short": last_chapter_flag,
        "last_chapter_word_count": chapter_word_counts[-1] if chapter_word_counts else None,
    }


CORE_CANDIDATES = ["original-en", "kjv-en", "web-en", "original-da", "original-de", "original-it", "original-fr", "original-ru"]


def word_count(data):
    if not data:
        return 0
    return sum(len(p.split()) for c in data.get("chapters", []) for p in c.get("paragraphs", []))


def process_book(book, scope):
    book_id = book["id"]
    result = {"id": book_id, "title": book["title"], "author": book["author"], "scope": scope, "editions": {}}
    edition_keys = [e["key"] for e in book.get("editions", [])]
    # also probe disk for any edition files not in registry (registry may be stale for staged/loose)
    disk_keys = set()
    for p in EDITIONS.glob(f"{book_id}-*.json"):
        name = p.name[len(book_id) + 1 : -5]
        if " " in name or name.endswith(".bak") or name == "threads":
            continue
        disk_keys.add(name)
    all_keys = sorted(set(edition_keys) | disk_keys)
    for key in all_keys:
        data, h = load_edition(book_id, key)
        if data is None:
            result["editions"][key] = {"present": False}
            continue
        ed_meta = next((e for e in book.get("editions", []) if e["key"] == key), None)
        result["editions"][key] = {
            "present": True,
            "sha256_16": h,
            "chapters": len(data.get("chapters", [])),
            "paragraphs": sum(len(c.get("paragraphs", [])) for c in data.get("chapters", [])),
            "word_count": word_count(data),
            "sections": len(data.get("sections", [])) if isinstance(data.get("sections"), list) else 0,
            "label": ed_meta["label"] if ed_meta else None,
            "translator": ed_meta["translator"] if ed_meta else None,
            "year": ed_meta["year"] if ed_meta else None,
            "language": ed_meta["language"] if ed_meta else None,
        }
    # find core English (or core-language) baseline
    core_key = None
    for cand in CORE_CANDIDATES:
        if result["editions"].get(cand, {}).get("present"):
            core_key = cand
            break
    result["core_key"] = core_key
    # english core specifically (skip non-en originals for the EN-source comparison;
    # for non-English originals we still note there's no EN "original" -- human
    # translation research handles this in phase 3)
    core_key_en = core_key if core_key and (core_key == "original-en" or core_key.endswith("-en")) else None
    if not core_key_en and result["editions"].get("original-en", {}).get("present"):
        core_key_en = "original-en"
    result["core_key_en"] = core_key_en
    modern_present = result["editions"].get("modern-en", {}).get("present")
    result["has_modern_en"] = bool(modern_present)
    if core_key_en and modern_present:
        base_data, _ = load_edition(book_id, core_key_en)
        target_data, _ = load_edition(book_id, "modern-en")
        result["mechanical_comparison"] = analyze_pair(base_data, target_data)
    else:
        result["mechanical_comparison"] = None
    # alignment across all present EN editions (chapter/paragraph structure)
    en_like = [k for k in all_keys if k == "modern-en" or k.endswith("-en") or k in ("kjv-en", "web-en")]
    align_ok = True
    ref = None
    for k in en_like:
        d, _ = load_edition(book_id, k)
        if not d:
            continue
        counts = [len(c.get("paragraphs", [])) for c in d.get("chapters", [])]
        if ref is None:
            ref = counts
        elif counts != ref:
            align_ok = False
    result["en_editions_aligned"] = align_ok if ref is not None else None
    return result


def main():
    public, staged, public_ids = parse_registry()
    rows = []
    all_results = {}
    for scope, books in [("public", public), ("staged", staged)]:
        for book in books:
            res = process_book(book, scope)
            all_results[res["id"]] = res
            out_path = OUT_DIR / f"{res['id']}.json"
            out_path.write_text(json.dumps(res, indent=1))
            mc = res.get("mechanical_comparison") or {}
            rows.append({
                "id": res["id"],
                "title": res["title"],
                "author": res["author"],
                "scope": scope,
                "core_key_en": res.get("core_key_en"),
                "has_modern_en": res["has_modern_en"],
                "chapters_core": mc.get("chapter_count_base"),
                "chapters_modern": mc.get("chapter_count_target"),
                "chapter_count_mismatch": mc.get("chapter_count_mismatch"),
                "para_count_mismatch_total": mc.get("para_count_mismatch_total"),
                "mean_weighted_similarity": mc.get("mean_weighted_similarity"),
                "pct_identical_long_paragraphs": mc.get("pct_identical_long_paragraphs"),
                "truncated_paragraphs_total": mc.get("truncated_paragraphs_total"),
                "empty_paragraphs_total": mc.get("empty_paragraphs_total"),
                "last_chapter_suspiciously_short": mc.get("last_chapter_suspiciously_short"),
                "en_editions_aligned": res.get("en_editions_aligned"),
                "word_count_core": res["editions"].get(res.get("core_key_en") or "", {}).get("word_count"),
                "word_count_modern_en": res["editions"].get("modern-en", {}).get("word_count"),
            })
    fieldnames = list(rows[0].keys())
    with open(OUT_DIR / "summary.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in rows:
            w.writerow(r)
    print(f"Processed {len(rows)} books ({len(public)} public, {len(staged)} staged).")
    flagged = [r for r in rows if r["has_modern_en"] and (
        (r["mean_weighted_similarity"] or 0) >= 0.90
        or (r["pct_identical_long_paragraphs"] or 0) >= 5
        or r["chapter_count_mismatch"]
        or (r["para_count_mismatch_total"] or 0) > 0
        or (r["truncated_paragraphs_total"] or 0) > 5
        or r["last_chapter_suspiciously_short"]
    )]
    print(f"Books with mechanical red flags (screening only): {len(flagged)}")
    for r in flagged:
        print(f"  {r['id']}: sim={r['mean_weighted_similarity']}, identical%={r['pct_identical_long_paragraphs']}, "
              f"trunc={r['truncated_paragraphs_total']}, para_mismatch={r['para_count_mismatch_total']}, "
              f"ch_mismatch={r['chapter_count_mismatch']}, last_ch_short={r['last_chapter_suspiciously_short']}")
    no_modern = [r for r in rows if not r["has_modern_en"]]
    print(f"\nBooks with NO modern-en file: {len(no_modern)}")
    for r in no_modern:
        print(f"  {r['id']} ({r['scope']})")


if __name__ == "__main__":
    main()

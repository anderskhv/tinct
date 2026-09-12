#!/usr/bin/env python3
"""Build the frozen package artefacts for one Odyssey book, from the
committed candidate text (scripts/candidates/bookN.py) and the served
original-en. Deterministic; re-running reproduces byte-identical output.

Usage: python3 scripts/build_book_package.py N
"""
import importlib.util
import json
import hashlib
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # books/staged-replacements/odyssey
REPO_ROOT = ROOT.parent.parent.parent  # repo root
ORIGINAL_EN = REPO_ROOT / "app/public/data/editions/odyssey-original-en.json"
PACKET_SIZE = 3


# GLOSSARY.md's closed Roman -> Greek table (standing finding S1), applied to
# the CANDIDATE's chapter title only. The source doc keeps Butler's own title.
# Closed and enumerated on purpose — never assembled from a general Roman ->
# Greek deity list, which would carry "Ops -> Rhea"; see GLOSSARY.md hazard 1.
NAME_MAP = [
    ("Ulysses", "Odysseus"),
    ("Minerva", "Athena"),
    ("Jove", "Zeus"),
    ("Neptune", "Poseidon"),
    ("Mercury", "Hermes"),
    ("Saturn", "Cronus"),
    ("Diana", "Artemis"),
    ("Euryclea", "Eurycleia"),
]


def map_names(text):
    """Case-sensitive, word-bounded. GLOSSARY.md hazard 4: a case-insensitive
    pass would destroy ordinary words and the island 'Same'."""
    import re as _re
    for roman, greek in NAME_MAP:
        text = _re.sub(r"\b" + _re.escape(roman) + r"\b", greek, text)
    return text


def sha256_file(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def load_candidate_module(book_num):
    path = ROOT / "scripts" / "candidates" / f"book{book_num}.py"
    spec = importlib.util.spec_from_file_location(f"book{book_num}_candidate", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def dump_json(obj):
    # Same style as the served edition files: 1-space indent, no ensure_ascii
    # escaping (curly quotes stay as literal UTF-8), trailing newline.
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def word_count(s):
    return len(s.split())


# Books already frozen and accepted. Re-running the build for one of these
# would rewrite a file the review record cites. Book 1 in particular predates
# the candidate-title name mapping above and would change if rebuilt, so the
# guard is not theoretical.
FROZEN = {
    1: "8316ff76cdbb5d82a572bc58b9388dc76f8ab70deddec6e0dbf75f406b510db9",
}


def main():
    book_num = int(sys.argv[1])
    if book_num in FROZEN and "--force" not in sys.argv:
        sys.exit(
            f"refusing to rebuild Book {book_num}: candidate-v1.json is frozen "
            f"at {FROZEN[book_num]} and is the record of what its review round "
            f"reviewed. Pass --force only if you mean to break that."
        )
    book_dir = ROOT / f"book{book_num:02d}"
    packets_dir = book_dir / "review-packets"
    book_dir.mkdir(parents=True, exist_ok=True)
    packets_dir.mkdir(parents=True, exist_ok=True)

    original = json.loads(ORIGINAL_EN.read_text(encoding="utf-8"))
    chapter = next(c for c in original["chapters"] if c["number"] == book_num)
    src_paragraphs = chapter["paragraphs"]

    source_doc = {
        "number": chapter["number"],
        "title": chapter["title"],
        "paragraphs": src_paragraphs,
    }
    source_path = book_dir / f"source-book{book_num}.json"
    source_path.write_text(dump_json(source_doc), encoding="utf-8")

    mod = load_candidate_module(book_num)
    cand_paragraphs = mod.PARAGRAPHS
    assert len(cand_paragraphs) == len(src_paragraphs), (
        f"paragraph count mismatch: source {len(src_paragraphs)} "
        f"candidate {len(cand_paragraphs)}"
    )

    candidate_title = map_names(chapter["title"])
    candidate_doc = {
        "number": chapter["number"],
        "title": candidate_title,
        "paragraphs": cand_paragraphs,
    }
    candidate_path = book_dir / "candidate-v1.json"
    candidate_path.write_text(dump_json(candidate_doc), encoding="utf-8")

    # Readable copy
    pid_prefix = f"B{book_num:02d}"
    lines = [f"# {candidate_title} — modern-English candidate v1 (readable)\n"]
    for i, p in enumerate(cand_paragraphs):
        pid = f"{pid_prefix}-P{i + 1:03d}"
        lines.append(f"**{pid}**\n")
        lines.append(p + "\n")
    readable_path = book_dir / "candidate-v1-readable.md"
    readable_path.write_text("\n".join(lines), encoding="utf-8")

    # Word ratios
    src_words = [word_count(p) for p in src_paragraphs]
    cand_words = [word_count(p) for p in cand_paragraphs]
    total_src = sum(src_words)
    total_cand = sum(cand_words)
    ratios = [c / s if s else 1.0 for s, c in zip(src_words, cand_words)]
    min_ratio = min(ratios)
    min_ratio_idx = ratios.index(min_ratio)

    # Manifest / packets
    n = len(src_paragraphs)
    packets = []
    packet_num = 0
    for start in range(0, n, PACKET_SIZE):
        packet_num += 1
        ids = [f"{pid_prefix}-P{i + 1:03d}" for i in range(start, min(start + PACKET_SIZE, n))]
        packets.append({"packet": f"review-packets/packet-{packet_num:02d}.md", "assigned_paragraph_ids": ids})

    all_ids = [pid for p in packets for pid in p["assigned_paragraph_ids"]]
    expected_ids = [f"{pid_prefix}-P{i + 1:03d}" for i in range(n)]
    assert all_ids == expected_ids, "manifest coverage failed"

    manifest = {
        "book": book_num,
        "source_paragraph_count": n,
        "candidate_paragraph_count": len(cand_paragraphs),
        "packet_size": PACKET_SIZE,
        "packets": packets,
        "coverage_check": {
            "all_ids_present_exactly_once_in_order": True,
            "first_id": expected_ids[0],
            "last_id": expected_ids[-1],
        },
    }

    # Write packets with 1 paragraph of context before/after
    for entry in packets:
        ids = entry["assigned_paragraph_ids"]
        first_idx = int(ids[0][-3:]) - 1
        last_idx = int(ids[-1][-3:]) - 1
        lines = [f"# Review Packet {entry['packet'].split('-')[-1].split('.')[0]} — Odyssey Book {book_num}\n"]
        lines.append(
            f"Assigned paragraphs: {ids[0]}"
            + (f"–{ids[-1]}" if len(ids) > 1 else "")
            + f" (source paragraph index {first_idx}"
            + (f"–{last_idx}" if last_idx != first_idx else "")
            + ", 0-based).\n"
        )
        lines.append(
            "Source: Samuel Butler, 1900 (Project Gutenberg #1727), as served in "
            "`app/public/data/editions/odyssey-original-en.json`, chapter number "
            f"{book_num}.\n"
        )
        lines.append(
            f"Candidate: modern-English reading edition, frozen draft v1 "
            f"(`book{book_num:02d}/candidate-v1.json`). Name forms follow "
            "`GLOSSARY.md`; per-paragraph decisions are in "
            f"`book{book_num:02d}/continuity.md`.\n"
        )
        lines.append("---\n")

        ctx_before = first_idx - 1
        ctx_after = last_idx + 1

        def para_block(idx, assigned):
            pid = f"{pid_prefix}-P{idx + 1:03d}"
            heading = f"## {pid} — ASSIGNED FOR REVIEW" if assigned else f"## {pid} — CONTEXT ONLY — reviewed in another packet"
            out = [heading + "\n"]
            out.append("**Source (Butler 1900):**\n")
            out.append("> " + src_paragraphs[idx] + "\n")
            out.append("**Candidate (modern English v1):**\n")
            out.append("> " + cand_paragraphs[idx] + "\n")
            out.append("---\n")
            return "\n".join(out)

        if ctx_before >= 0:
            lines.append(para_block(ctx_before, False))
        for idx in range(first_idx, last_idx + 1):
            lines.append(para_block(idx, True))
        if ctx_after < n:
            lines.append(para_block(ctx_after, False))

        packet_path = ROOT / f"book{book_num:02d}" / entry["packet"]
        packet_path.write_text("\n".join(lines), encoding="utf-8")

    manifest_path = book_dir / "manifest.json"

    # Hashes computed after all files are written (v1 files only at this point)
    candidate_v1_sha = sha256_file(candidate_path)
    source_sha = sha256_file(source_path)

    manifest["candidate_v1_json_sha256"] = candidate_v1_sha
    manifest_path.write_text(dump_json(manifest), encoding="utf-8")

    print(f"Book {book_num}: {n} paragraphs")
    print(f"word ratio total: {total_cand}/{total_src} = {total_cand/total_src:.3f}")
    print(f"min paragraph ratio: {min_ratio:.3f} at index {min_ratio_idx} "
          f"(id {pid_prefix}-P{min_ratio_idx+1:03d})")
    print(f"source-book{book_num}.json sha256: {source_sha}")
    print(f"candidate-v1.json sha256:  {candidate_v1_sha}")
    print(f"packets written: {packet_num}")


if __name__ == "__main__":
    main()

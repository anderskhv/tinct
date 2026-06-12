#!/usr/bin/env python3
"""Inventory unpublished/WIP books from current repo files.

This is the status source of truth for "what is missing before publication".
It deliberately ignores duplicate junk files such as "* 2.json" and only
classifies books by the live app conventions:

- public books: app/src/data/bookRegistry.ts BOOKS array
- staged books: Book constants not included in BOOKS
- loose books: edition files on disk with no registry constant
"""

from __future__ import annotations

import argparse
import json
import re
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "app" / "src" / "data" / "bookRegistry.ts"
EDITIONS = ROOT / "app" / "public" / "data" / "editions"
ONBOARDING = ROOT / "app" / "public" / "data" / "onboarding"
AUDIO_BASE = "https://tinct.app/api/audio-manifest?path="
UA = {"User-Agent": "curl/8.7.1"}


@dataclass(frozen=True)
class Book:
    book_id: str
    title: str
    scope: str


def find_matching(text: str, start: int, open_ch: str, close_ch: str) -> int:
    depth = 0
    in_string: str | None = None
    escape = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_string:
                in_string = None
            continue
        if ch in ("'", '"', "`"):
            in_string = ch
        elif ch == open_ch:
            depth += 1
        elif ch == close_ch:
            depth -= 1
            if depth == 0:
                return i
    raise ValueError(f"unmatched {open_ch}")


def parse_registry() -> tuple[list[Book], list[Book]]:
    text = REGISTRY.read_text()
    consts: dict[str, tuple[str, str]] = {}
    for match in re.finditer(r"export const (\w+): Book = \{", text):
        start = match.end() - 1
        end = find_matching(text, start, "{", "}")
        block = text[start : end + 1]
        id_m = re.search(r"id:\s*'([^']+)'", block)
        title_m = re.search(r"title:\s*'((?:\\'|[^'])*)'", block)
        if not id_m:
            continue
        book_id = id_m.group(1)
        title = title_m.group(1).replace("\\'", "'") if title_m else book_id
        consts[match.group(1)] = (book_id, title)

    books_m = re.search(r"export const BOOKS: Book\[\] = \[([^\]]+)\]", text, re.S)
    if not books_m:
        raise RuntimeError("Could not parse BOOKS array")
    public_names = [x.strip() for x in books_m.group(1).split(",") if x.strip()]
    public_ids = {consts[name][0] for name in public_names if name in consts}

    public = [
        Book(consts[name][0], consts[name][1], "public")
        for name in public_names
        if name in consts
    ]
    staged = [
        Book(book_id, title, "staged")
        for book_id, title in consts.values()
        if book_id not in public_ids
    ]
    return public, staged


def loose_books(known_ids: set[str]) -> list[Book]:
    ids: set[str] = set()
    for path in EDITIONS.glob("*.json"):
        name = path.name
        if " " in name or name.endswith(".bak") or "-threads" in name:
            continue
        for suffix in ("-original-en.json", "-modern-en.json", "-modern-da.json"):
            if name.endswith(suffix):
                book_id = name[: -len(suffix)]
                if book_id not in known_ids:
                    ids.add(book_id)
    return [Book(book_id, book_id, "loose") for book_id in sorted(ids)]


def load_edition(book_id: str, edition: str) -> dict | None:
    path = EDITIONS / f"{book_id}-{edition}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text())


def chapter_count(book_id: str, edition: str) -> int:
    data = load_edition(book_id, edition)
    return len(data.get("chapters", [])) if data else 0


def aligned(book_id: str, editions: list[str]) -> bool:
    counts: list[list[int]] = []
    for edition in editions:
        data = load_edition(book_id, edition)
        if not data:
            return False
        counts.append([len(ch.get("paragraphs", [])) for ch in data.get("chapters", [])])
    return all(c == counts[0] for c in counts[1:])


def has_audio(book_id: str, edition: str, chapter: int) -> bool:
    url = AUDIO_BASE + f"{book_id}/{edition}/ch{chapter}/manifest.json"
    request = urllib.request.Request(url, method="HEAD", headers=UA)
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            return response.status == 200
    except urllib.error.HTTPError as exc:
        if exc.code in (403, 404):
            return False
        return False
    except Exception:
        return False


def audio_status(book_id: str, edition: str) -> str:
    total = chapter_count(book_id, edition)
    if total == 0:
        return "n/a"
    checks = [1] if total == 1 else [1, total]
    ok = [has_audio(book_id, edition, ch) for ch in checks]
    if all(ok):
        return "present"
    if any(ok):
        return "partial"
    return "missing"


def mechanical_warning(book_id: str) -> str:
    if book_id in {"wealth-of-nations", "essays-montaigne"}:
        return "modern-en repair"
    if book_id == "leviathan":
        return "final text QA"
    return ""


def summarize(book: Book, check_audio: bool) -> dict[str, str]:
    has_original = bool(load_edition(book.book_id, "original-en"))
    has_modern_en = bool(load_edition(book.book_id, "modern-en"))
    has_modern_da = bool(load_edition(book.book_id, "modern-da"))
    editions = [e for e, ok in [
        ("original-en", has_original),
        ("modern-en", has_modern_en),
        ("modern-da", has_modern_da),
    ] if ok]

    missing = []
    if book.scope == "loose":
        missing.append("registry")
    if not has_original:
        missing.append("original-en")
    if not has_modern_en:
        missing.append("modern-en")
    if not has_modern_da:
        missing.append("modern-da")
    if len(editions) >= 2 and not aligned(book.book_id, editions):
        missing.append("alignment")
    if not (ONBOARDING / f"{book.book_id}.json").exists():
        missing.append("onboarding")
    if not (EDITIONS / f"{book.book_id}-threads.json").exists():
        missing.append("threads")
    text_warning = mechanical_warning(book.book_id)
    if text_warning:
        missing.append(text_warning)

    en_audio = da_audio = "not checked"
    if check_audio:
        targets = []
        if has_original:
            targets.append(("original-en", audio_status(book.book_id, "original-en")))
        if has_modern_en:
            targets.append(("modern-en", audio_status(book.book_id, "modern-en")))
        en_audio = ",".join(f"{k}:{v}" for k, v in targets) or "n/a"
        da_audio = audio_status(book.book_id, "modern-da") if has_modern_da else "n/a"
        if any(v != "present" for _, v in targets):
            missing.append("english audio")
        if has_modern_da and da_audio != "present":
            missing.append("danish audio")

    return {
        "scope": book.scope,
        "book": book.book_id,
        "title": book.title,
        "editions": ",".join(editions) or "none",
        "en_audio": en_audio,
        "da_audio": da_audio,
        "missing": "; ".join(dict.fromkeys(missing)) or "ready",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audio", action="store_true", help="check first+last chapter audio on production R2")
    args = parser.parse_args()

    public, staged = parse_registry()
    known = {b.book_id for b in public + staged}
    books = staged + loose_books(known)
    rows = [summarize(book, args.audio) for book in books]

    print(f"WIP books: {len(rows)}")
    print("scope\tbook\teditions\ten_audio\tda_audio\tmissing")
    for row in rows:
        print(
            f"{row['scope']}\t{row['book']}\t{row['editions']}\t"
            f"{row['en_audio']}\t{row['da_audio']}\t{row['missing']}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"""Shared helpers for words.json sidecars — schema, text prep, alignment, validation.

Sidecars match app/src/lab/labFollow.ts WordSidecar / TimedWord. Generation uses
faster-whisper word timestamps aligned to edition tokens (same whitespace split
as the reader and Kokoro TTS).
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Iterable, List, Optional, Sequence, Tuple
from urllib.parse import quote

REPO_ROOT = Path(__file__).resolve().parents[2]
EDITIONS_DIR = REPO_ROOT / "app/public/data/editions"
EDITIONS_CHAPTERS_DIR = REPO_ROOT / "app/public/data/editions-chapters"
AUDIO_API_FILE = "https://tinct.app/api/audio-file"
AUDIO_API_MANIFEST = "https://tinct.app/api/audio-manifest"

ROMAN_TO_ARABIC = {
    "I": "1", "II": "2", "III": "3", "IV": "4", "V": "5", "VI": "6",
    "VII": "7", "VIII": "8", "IX": "9", "X": "10", "XI": "11", "XII": "12",
    "XIII": "13", "XIV": "14", "XV": "15", "XVI": "16", "XVII": "17",
    "XVIII": "18", "XIX": "19", "XX": "20", "XXI": "21", "XXII": "22",
    "XXIII": "23", "XXIV": "24",
}

# Whisper commonly transcribes a printed list marker such as ``1.`` as the
# spoken token ``one``.  This table is deliberately limited to standalone
# cardinal forms: it is an acoustic equivalence, not a fuzzy text-rewrite
# mechanism.  Speaker labels and other genuine text/audio differences must
# remain visible to the quality gate.
CARDINAL_WORDS = {
    0: "zero", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
    6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
    11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen",
    15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen",
    19: "nineteen", 20: "twenty", 30: "thirty", 40: "forty",
    50: "fifty", 60: "sixty", 70: "seventy", 80: "eighty",
    90: "ninety", 100: "onehundred",
}


def canonical_alignment_token(token: str) -> str:
    """Return a conservative acoustic comparison token for alignment only."""
    normalized = normalize_token(token)
    if not normalized:
        return normalized
    if normalized.isdecimal():
        value = int(normalized)
        if value in CARDINAL_WORDS:
            return CARDINAL_WORDS[value]
        if 21 <= value <= 99 and value % 10:
            tens, ones = divmod(value, 10)
            return CARDINAL_WORDS[tens * 10] + CARDINAL_WORDS[ones]
    return normalized


def clean_text(text: str) -> str:
    """Same normalization Kokoro uses before TTS (run-kokoro-cloud.py)."""
    superscripts = "⁰¹²³⁴⁵⁶⁷⁸⁹"
    text = re.sub(f"[{re.escape(superscripts)}]+", "", text)

    def _replace_roman(m: re.Match[str]) -> str:
        prefix, roman = m.group(1), m.group(2)
        return f"{prefix} {ROMAN_TO_ARABIC[roman]}" if roman in ROMAN_TO_ARABIC else m.group(0)

    text = re.sub(
        r"\b(Act|Scene|Book|Chapter|Part|Canto|Volume)\s+([IVX]+)\b",
        _replace_roman,
        text,
    )
    text = re.sub(r"\b([A-Z]{2,})\b", lambda m: m.group(1).title(), text)
    text = text.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    text = re.sub(r"  +", " ", text).strip()
    return text


def chapter_words_from_text(text: str) -> List[str]:
    """Matches labFollow.chapterWordsFromText."""
    return [part.strip() for part in text.split() if part.strip()]


def normalize_token(token: str) -> str:
    return re.sub(r"[^\w]", "", token.lower())


@dataclass(frozen=True)
class HeardWord:
    raw: str
    start: float
    end: float

    @property
    def norm(self) -> str:
        return normalize_token(self.raw)


@dataclass(frozen=True)
class AlignmentStats:
    """How much of an alignment came from Whisper rather than interpolation."""

    expected_words: int
    heard_words: int
    matched_words: int

    @property
    def match_ratio(self) -> float:
        if self.expected_words <= 0:
            return 1.0
        return self.matched_words / self.expected_words


def align_tokens_with_stats(
    expected_tokens: Sequence[str],
    heard: Sequence[HeardWord],
) -> Tuple[List[dict[str, Any]], AlignmentStats]:
    """Map edition tokens onto Whisper timings and report observed coverage.

    Missing edition tokens are interpolated so the reader still receives one
    timing per rendered whitespace token. ``matched_words`` deliberately counts
    only exact normalized matches produced by Whisper; interpolated tokens must
    not make a low-quality transcript look complete.
    """
    if not expected_tokens:
        return [], AlignmentStats(0, len(heard), 0)
    if not heard:
        return [], AlignmentStats(len(expected_tokens), 0, 0)

    exp_norm = [canonical_alignment_token(t) for t in expected_tokens]
    heard_norm = [canonical_alignment_token(h.raw) for h in heard]

    sm = SequenceMatcher(None, exp_norm, heard_norm, autojunk=False)
    aligned: List[Optional[dict[str, Any]]] = [None] * len(expected_tokens)
    matched_words = 0

    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            matched_words += i2 - i1
            for offset, ei in enumerate(range(i1, i2)):
                hj = j1 + offset
                aligned[ei] = {
                    "text": expected_tokens[ei],
                    "start": round(heard[hj].start, 3),
                    "end": round(heard[hj].end, 3),
                }

    # Interpolate unmatched expected tokens between neighbors.
    for ei in range(len(expected_tokens)):
        if aligned[ei] is not None:
            continue
        prev_end = 0.0
        for pj in range(ei - 1, -1, -1):
            if aligned[pj] is not None:
                prev_end = aligned[pj]["end"]
                break
        next_start = heard[-1].end
        for nj in range(ei + 1, len(expected_tokens)):
            if aligned[nj] is not None:
                next_start = aligned[nj]["start"]
                break
        mid = (prev_end + next_start) / 2
        aligned[ei] = {
            "text": expected_tokens[ei],
            "start": round(prev_end, 3),
            "end": round(max(prev_end, mid), 3),
        }

    # Clamp monotonic ends.
    for i in range(len(aligned)):
        entry = aligned[i]
        if entry["end"] < entry["start"]:
            entry["end"] = entry["start"]
        if i + 1 < len(aligned) and aligned[i + 1] is not None:
            entry["end"] = min(entry["end"], aligned[i + 1]["start"])

    words = [entry for entry in aligned if entry is not None]
    return words, AlignmentStats(len(expected_tokens), len(heard), matched_words)


def align_tokens(expected_tokens: Sequence[str], heard: Sequence[HeardWord]) -> List[dict[str, Any]]:
    """Backward-compatible alignment helper used by existing callers/tests."""
    words, _stats = align_tokens_with_stats(expected_tokens, heard)
    return words


def is_timed_word(value: Any) -> bool:
    if not isinstance(value, dict):
        return False
    text = value.get("text")
    start = value.get("start")
    end = value.get("end")
    return (
        isinstance(text, str)
        and isinstance(start, (int, float))
        and isinstance(end, (int, float))
        and start >= 0
        and end >= start
    )


def validate_sidecar(
    sidecar: dict[str, Any],
    expected_paragraphs: Optional[Sequence[Sequence[str]]] = None,
    manifest_by_paragraph: Optional[dict[int, dict[str, Any]]] = None,
) -> Tuple[bool, List[str]]:
    errors: List[str] = []
    paragraphs = sidecar.get("paragraphs")
    if not isinstance(paragraphs, list):
        return False, ["paragraphs must be an array"]

    seen_paragraphs: set[int] = set()
    for entry in paragraphs:
        if not isinstance(entry, dict):
            errors.append("paragraph entry is not an object")
            continue
        pidx = entry.get("paragraph")
        words = entry.get("words")
        if not isinstance(pidx, int):
            errors.append("paragraph index missing or not int")
            continue
        if pidx in seen_paragraphs:
            errors.append(f"paragraph {pidx}: duplicate entry")
        seen_paragraphs.add(pidx)
        if not isinstance(words, list) or len(words) == 0:
            errors.append(f"paragraph {pidx}: words missing or empty")
            continue
        duration: Optional[float] = None
        manifest_entry = (
            manifest_by_paragraph.get(pidx)
            if manifest_by_paragraph is not None else None
        )
        if manifest_by_paragraph is not None:
            if manifest_entry is None:
                errors.append(f"paragraph {pidx}: absent from audio manifest")
            else:
                expected_file = manifest_entry.get("file")
                if entry.get("file") != expected_file:
                    errors.append(f"paragraph {pidx}: file does not match audio manifest")
                manifest_duration = manifest_entry.get("duration")
                if not isinstance(manifest_duration, (int, float)) or manifest_duration < 0:
                    errors.append(f"paragraph {pidx}: audio manifest duration is invalid")
                else:
                    duration = float(manifest_duration)
        for wi, word in enumerate(words):
            if not is_timed_word(word):
                errors.append(f"paragraph {pidx} word {wi}: invalid timed word")
            elif duration is not None and word["end"] > duration + 0.05:
                errors.append(f"paragraph {pidx} word {wi}: timestamp exceeds audio duration")
        for wi in range(1, len(words)):
            if words[wi]["start"] < words[wi - 1]["start"]:
                errors.append(f"paragraph {pidx}: non-monotonic start at word {wi}")

        if expected_paragraphs is not None and 0 <= pidx < len(expected_paragraphs):
            exp = expected_paragraphs[pidx]
            if len(words) != len(exp):
                errors.append(
                    f"paragraph {pidx}: word count {len(words)} != expected {len(exp)}",
                )
            else:
                for wi, (word, expected) in enumerate(zip(words, exp)):
                    if not isinstance(word, dict):
                        continue
                    if word.get("text") != expected:
                        errors.append(
                            f"paragraph {pidx} word {wi}: text does not match edition token",
                        )
                        break

    if expected_paragraphs is not None:
        required = {
            index
            for index, expected in enumerate(expected_paragraphs)
            if len(expected) > 0
        }
        for missing in sorted(required - seen_paragraphs):
            errors.append(f"paragraph {missing}: missing sidecar entry")

    return len(errors) == 0, errors


def load_chapter_text(book: str, edition: str, chapter_number: int) -> dict[str, Any]:
    shard = EDITIONS_CHAPTERS_DIR / f"{book}-{edition}" / f"ch{chapter_number:04d}.json"
    if shard.exists():
        return json.loads(shard.read_text(encoding="utf-8"))
    full_path = EDITIONS_DIR / f"{book}-{edition}.json"
    if not full_path.exists():
        raise FileNotFoundError(f"No edition JSON for {book}-{edition}")
    data = json.loads(full_path.read_text(encoding="utf-8"))
    for chapter in data.get("chapters", []):
        if chapter.get("number") == chapter_number:
            return chapter
    raise KeyError(f"Chapter {chapter_number} not in {full_path}")


def audio_file_url(book: str, edition: str, chapter_number: int, filename: str) -> str:
    path = f"{book}/{edition}/ch{chapter_number}/{filename}"
    return f"{AUDIO_API_FILE}?path={quote(path, safe='')}"


def manifest_url(book: str, edition: str, chapter_number: int) -> str:
    path = f"{book}/{edition}/ch{chapter_number}/manifest.json"
    return f"{AUDIO_API_MANIFEST}?path={quote(path, safe='')}"


def build_sidecar(
    book: str,
    edition: str,
    chapter_number: int,
    chapter_title: str,
    paragraph_results: Iterable[Tuple[int, str, List[dict[str, Any]]]],
    method: str = "faster-whisper-word-timestamps",
) -> dict[str, Any]:
    paragraphs = []
    for pindex, _text, words in paragraph_results:
        paragraphs.append({
            "paragraph": pindex,
            "file": f"p{pindex}.mp3",
            "words": words,
        })
    return {
        "chapter": chapter_number,
        "bookId": book,
        "editionKey": edition,
        "title": chapter_title,
        "method": method,
        "paragraphs": paragraphs,
    }


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

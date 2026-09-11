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
from typing import Any, Callable, Iterable, List, Optional, Sequence, Tuple
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


# ---------------------------------------------------------------------------
# Text biasing: feed Whisper the paragraph's own words so that proper names and
# spelled-out numbers ("one hundred five") are recognised in the edition's
# form.  faster-whisper keeps at most ``max_length // 2 - 1`` = 223 prompt
# tokens; anything longer is silently cut from the FRONT, so the prompt is
# truncated here (exactly with the model tokenizer when available, otherwise
# with a conservative estimate) to keep control over which words survive.
# ---------------------------------------------------------------------------

# Request modes map 1:1 onto transcribe() arguments.  ``auto`` is a cascade
# over request modes (see ``bias_cascade``): measured 2026-09-05 on Genesis
# 5/10, ``both`` fixes spelled-out numbers but echoes on some name lists where
# ``hotwords`` alone is clean, so no single request mode clears every chapter.
BIAS_REQUEST_MODES = ("off", "prompt", "hotwords", "both")
BIAS_MODES = BIAS_REQUEST_MODES + ("auto",)
AUTO_BIAS_CASCADE = ("both", "hotwords")
WHISPER_PROMPT_TOKEN_BUDGET = 223
DEFAULT_BIAS_MAX_WORDS = 180
DEFAULT_HOTWORDS_TOKEN_BUDGET = 64
# A biased transcript that hears far fewer words than the text contains is the
# classic "echo the prompt / emit nothing" failure; fall back to a plain pass.
BIAS_MIN_HEARD_FRACTION = 0.6

TokenCounter = Callable[[str], int]


@dataclass(frozen=True)
class BiasRequest:
    """What to pass to ``model.transcribe`` for one paragraph."""

    mode: str
    initial_prompt: Optional[str] = None
    hotwords: Optional[str] = None

    @property
    def is_off(self) -> bool:
        return self.initial_prompt is None and self.hotwords is None


BIAS_OFF = BiasRequest(mode="off")


def estimate_prompt_tokens(text: str) -> int:
    """Conservative Whisper token estimate when no tokenizer is available.

    Measured on Genesis 2/5/10 (WEB + Modern): the real count never exceeded
    ``1 + len(word) // 3`` summed over words, and English prose sits well
    below it, so this only ever truncates early, never late.
    """
    return sum(1 + len(word) // 3 for word in text.split())


def bias_hotwords(expected_tokens: Sequence[str]) -> List[str]:
    """Capitalised tokens that never appear in lowercase in the paragraph.

    Sentence-initial words ("All", "Their") usually also occur lowercased in
    the same paragraph and are dropped; proper names survive.  Order is kept
    and duplicates removed so the list reads like a name roll.
    """
    lowercase_forms = {
        normalize_token(token)
        for token in expected_tokens
        if token[:1].islower()
    }
    names: List[str] = []
    seen: set[str] = set()
    for token in expected_tokens:
        word = re.sub(r"^[^\w]+|[^\w]+$", "", token)
        if not word or not word[:1].isupper() or not any(ch.isalpha() for ch in word):
            continue
        key = normalize_token(word)
        if not key or key in seen or key in lowercase_forms:
            continue
        seen.add(key)
        names.append(word)
    return names


def _fit_words(
    words: Sequence[str],
    max_tokens: int,
    count_tokens: TokenCounter,
    separator: str = " ",
) -> List[str]:
    """Longest prefix of ``words`` whose joined text fits ``max_tokens``."""
    kept = list(words)
    if max_tokens <= 0:
        return []
    while kept:
        total = count_tokens(separator.join(kept))
        if total <= max_tokens:
            break
        # Drop roughly the overshoot's worth of words (at least one) and re-count.
        per_word = total / len(kept)
        kept = kept[: len(kept) - max(1, int((total - max_tokens) / per_word))]
    return kept


def build_bias_prompt(
    expected_tokens: Sequence[str],
    max_tokens: int = WHISPER_PROMPT_TOKEN_BUDGET,
    count_tokens: Optional[TokenCounter] = None,
    max_words: int = DEFAULT_BIAS_MAX_WORDS,
    strategy: str = "names",
) -> str:
    """Paragraph text for ``initial_prompt`` within Whisper's prompt budget.

    ``head`` keeps the first ``max_words`` words.  ``names`` (default) puts
    the paragraph's capitalised tokens first and fills the rest of the budget
    with the head, for paragraphs whose names sit past the truncation point;
    at a forced 60-token budget on Genesis 10 it matched 76 % of words against
    54 % for ``head``.  When the whole paragraph fits, both strategies return
    the full text.
    """
    if strategy not in ("head", "names"):
        raise ValueError(f"unknown bias prompt strategy {strategy!r}")
    counter = count_tokens or estimate_prompt_tokens
    words = [token for token in expected_tokens if token][:max_words]
    if not words:
        return ""
    head = _fit_words(words, max_tokens, counter)
    if strategy == "head" or len(head) == len(words):
        return " ".join(head)
    names = bias_hotwords(expected_tokens)
    names = _fit_words(names, max_tokens // 2, counter, separator=", ")
    if not names:
        return " ".join(head)
    name_text = ", ".join(names) + "."
    remaining = max_tokens - counter(name_text)
    filler = _fit_words(words, remaining, counter)
    # BPE merges across the join can differ from the two separate counts;
    # trim the filler until the composed prompt itself fits.
    while filler and counter(f"{name_text} {' '.join(filler)}") > max_tokens:
        filler.pop()
    return f"{name_text} {' '.join(filler)}".strip()


def build_bias_request(
    expected_tokens: Sequence[str],
    mode: str,
    count_tokens: Optional[TokenCounter] = None,
    max_tokens: int = WHISPER_PROMPT_TOKEN_BUDGET,
    max_words: int = DEFAULT_BIAS_MAX_WORDS,
    strategy: str = "names",
    hotwords_budget: int = DEFAULT_HOTWORDS_TOKEN_BUDGET,
) -> BiasRequest:
    """Build the transcribe() biasing arguments for ``mode``.

    ``hotwords`` and ``initial_prompt`` are both prepended to Whisper's
    decoder prompt, so in ``both`` mode they share the single 223-token
    budget; otherwise the combined prompt would starve the decoder of output
    tokens on a 30 s window.  The returned ``mode`` is the *effective* one:
    a paragraph without capitalised tokens yields ``off`` in hotwords mode.
    """
    if mode not in BIAS_REQUEST_MODES:
        raise ValueError(
            f"unknown bias request mode {mode!r}; expected one of {BIAS_REQUEST_MODES}",
        )
    if mode == "off":
        return BIAS_OFF
    counter = count_tokens or estimate_prompt_tokens
    hotwords: Optional[str] = None
    prompt_budget = max_tokens
    if mode in ("hotwords", "both"):
        budget = max_tokens if mode == "hotwords" else min(hotwords_budget, max_tokens)
        names = _fit_words(bias_hotwords(expected_tokens), budget, counter, separator=", ")
        if names:
            hotwords = ", ".join(names)
            prompt_budget = max_tokens - counter(hotwords)
    initial_prompt: Optional[str] = None
    if mode in ("prompt", "both"):
        text = build_bias_prompt(
            expected_tokens,
            max_tokens=prompt_budget,
            count_tokens=counter,
            max_words=max_words,
            strategy=strategy,
        )
        initial_prompt = text or None
    if initial_prompt is None and hotwords is None:
        return BIAS_OFF
    if initial_prompt is not None and hotwords is not None:
        effective = "both"
    elif initial_prompt is not None:
        effective = "prompt"
    else:
        effective = "hotwords"
    return BiasRequest(mode=effective, initial_prompt=initial_prompt, hotwords=hotwords)


def bias_cascade(mode: str) -> Tuple[str, ...]:
    """Request modes to try, in order, for a CLI ``--bias-text`` mode."""
    if mode not in BIAS_MODES:
        raise ValueError(f"unknown bias mode {mode!r}; expected one of {BIAS_MODES}")
    if mode == "off":
        return ()
    if mode == "auto":
        return AUTO_BIAS_CASCADE
    return (mode,)


@dataclass(frozen=True)
class ParagraphAlignment:
    """One paragraph's aligned words plus the bias provenance that produced them."""

    words: List[dict[str, Any]]
    stats: AlignmentStats
    bias: str = "off"            # effective bias mode that produced ``words``
    bias_fallback: bool = False  # True when a biased pass was replaced by a plain one


# Measured 2026-09-05 (Genesis 2 WEB, small.en): with the paragraph's own text
# as prompt Whisper resumes *after* the prompt and emits only the last
# sentence(s) on 3 of 5 prose paragraphs, and silently drops 95 % -> 93 % on a
# fourth.  Cross-checking every imperfect biased paragraph against a plain pass
# is the only rule that made a biased run never worse than the plain pipeline.
DEFAULT_BIAS_RETRY_BELOW = 1.0


def should_retry_without_bias(
    stats: AlignmentStats,
    retry_below: float = DEFAULT_BIAS_RETRY_BELOW,
    min_heard_fraction: float = BIAS_MIN_HEARD_FRACTION,
) -> bool:
    """Decide whether a biased pass must be re-run without bias.

    Two triggers: the echo/dropout failure (Whisper heard far fewer words than
    the paragraph has, so the prompt replaced transcription) and a match ratio
    below ``retry_below``.  At the default 1.0 every imperfect biased paragraph
    is cross-checked against a plain pass and the better one is kept, so
    biasing can only add matches; lowering it trades that guarantee for fewer
    passes.
    """
    if stats.expected_words <= 0:
        return False
    heard_fraction = stats.heard_words / stats.expected_words
    return heard_fraction < min_heard_fraction or stats.match_ratio < retry_below


def prefer_plain_result(biased: AlignmentStats, plain: AlignmentStats) -> bool:
    """After a retry, keep the plain pass only when it observed more words."""
    return plain.matched_words > biased.matched_words


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

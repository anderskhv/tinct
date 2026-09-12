"""Shared helpers for words.json sidecars — schema, text prep, alignment, validation.

Sidecars match app/src/lab/labFollow.ts WordSidecar / TimedWord. Generation uses
faster-whisper word timestamps aligned to edition tokens (same whitespace split
as the reader and Kokoro TTS).

Revision 3 (2026-09-12) of the pinned ``f5b23de7`` helper, built on revision 2.
Everything the acceptance results were measured against is unchanged except the
comparison between expected edition tokens and recognised tokens, which now:

  * strips never-spoken markup from the EXPECTED side only — underscore
    emphasis (``_word_``), bracketed footnote markers (``[28]``,
    ``[Greek: eunouchos]``), spaced ellipses (``. . .``) and double hyphens
    (``--``, which separate words rather than being words) — revision 2,
    unchanged;
  * joins the adjacent recognised tokens that together spell one expected
    token, comparing the whole glued spelling rather than revision 2's hyphen
    pieces.  That covers revision 2's hyphen compounds (``wage-labour`` heard
    ``wage`` ``labour``) and adds em- and en-dash-glued words (``are—enough``
    heard ``Are`` ``Enough``), elisions split at the apostrophe (``He'ld``
    heard ``He`` ``'ld``), grouped numerals (``2,186`` heard ``2`` ``,186``)
    and closed compounds the recogniser opens (``heartbroken`` heard ``heart``
    ``broken``).  The joined token is timed from the first piece's start to the
    last piece's end;
  * matches the mirror case — one recognised token spelling several expected
    tokens (``every one`` heard ``everyone``) — sharing that token's own span
    between them in proportion to their length;
  * treats a short, explicit table of standard English contractions
    (``You're`` ↔ ``You are``) as equivalent spellings in both of those
    directions, the way ``CARDINAL_WORDS`` already treats ``2`` and ``two``.

The 0.85 gate, the timestamps and the interpolation rule are untouched; no
timestamp is invented outside a span the recogniser itself reported, and no
confidence is synthesised. The provenance record is
``tools/audio-highlight/aligner/PINS.md``; the replay evidence for what this
revision changes and what it leaves alone is
``docs/audio-highlight-run3-2026-09-12.md``.
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


# ---------------------------------------------------------------------------
# Revision 2: expected-side markup normalisation and compound joining.
# Revision 3: gluing — one expected token written as several recognised tokens
# (and the mirror), including contractions, grouped numerals and elisions.
# ---------------------------------------------------------------------------

# A footnote marker is ``[`` + digits + ``]`` or ``[`` + a label word + ``:``
# ... ``]`` (``[28]``, ``[Greek: eunouchos]``, ``[Footnote: ...]``).  Other
# bracketed text — stage directions such as ``[Re-enter Boatswain]`` — is
# narrated and is NOT markup; it stays in the comparison.
FOOTNOTE_MARKER = re.compile(r"\[(?:\d+|[A-Za-z]+:[^\[\]]*)\]")
FOOTNOTE_MARKER_OPEN = re.compile(r"\[(?:\d+|[A-Za-z]+:)[^\[\]]*$")
# A whitespace token that is only punctuation around a full stop: one piece of
# a spaced ellipsis when it sits in a run (``. . .``, ``more. . . .``, ``. . .,``).
ELLIPSIS_PIECE = re.compile(r"[^\w]*\.[^\w]*")
# A whitespace token that is only a run of two or more hyphens.
DASH_ONLY = re.compile(r"-{2,}")
HYPHEN_RUN = re.compile(r"-+")

# Revision 3 -----------------------------------------------------------------
# The shortest glued key that may be matched across several tokens.  Below this
# the coincidence risk outweighs the class: two one-letter recogniser tokens
# spell far too many short words.
MIN_GLUE_KEY = 3
# Contractions the recogniser and the edition spell differently.  The value is
# the expanded form's *glued* key, so the table is read in both directions:
# expected ``You're`` against heard ``You`` ``are``, and expected ``You`` ``are``
# against heard ``You're``.  This is an acoustic equivalence for the comparison
# only — the same kind of table as ``CARDINAL_WORDS`` — and it is deliberately
# limited to standard English contractions with one unambiguous expansion.
CONTRACTIONS = {
    "im": "iam", "ive": "ihave", "ill": "iwill", "id": "iwould",
    "youre": "youare", "youve": "youhave", "youll": "youwill",
    "youd": "youwould", "hes": "heis", "hell": "hewill", "hed": "hewould",
    "shes": "sheis", "shell": "shewill", "shed": "shewould",
    "its": "itis", "itll": "itwill",
    "were": "weare", "weve": "wehave", "well": "wewill", "wed": "wewould",
    "theyre": "theyare", "theyve": "theyhave", "theyll": "theywill",
    "theyd": "theywould",
    "thats": "thatis", "theres": "thereis", "heres": "hereis",
    "wheres": "whereis", "whats": "whatis", "whos": "whois",
    "hows": "howis", "lets": "letus",
    "isnt": "isnot", "arent": "arenot", "wasnt": "wasnot",
    "werent": "werenot", "dont": "donot", "doesnt": "doesnot",
    "didnt": "didnot", "cant": "cannot", "couldnt": "couldnot",
    "wouldnt": "wouldnot", "shouldnt": "shouldnot", "wont": "willnot",
    "hasnt": "hasnot", "havent": "havenot", "hadnt": "hadnot",
    "mustnt": "mustnot", "neednt": "neednot", "shant": "shallnot",
}


def strip_expected_markup(token: str) -> Tuple[str, bool]:
    """Return ``(stripped, changed)`` for one expected token.

    Removes underscore emphasis and any footnote marker that is complete
    inside the token.  Multi-token markers are handled by
    ``expected_comparison_keys``.
    """
    stripped = token.replace("_", "")
    stripped = FOOTNOTE_MARKER.sub("", stripped)
    return stripped, stripped != token


def expected_comparison_keys(expected_tokens: Sequence[str]) -> List[Optional[str]]:
    """One comparison key per expected token; ``None`` marks never-spoken markup.

    Tokens carrying no markup keep exactly the revision-1 key
    (``canonical_alignment_token``), including the empty key for a token with
    no word characters at all, so an unmarked paragraph compares identically.
    """
    stripped: List[str] = []
    unspoken: List[bool] = []
    open_marker = False
    for token in expected_tokens:
        text, changed = strip_expected_markup(token)
        if open_marker:
            if "]" in text:
                text = text.split("]", 1)[1]
                open_marker = False
            else:
                text = ""
            changed = True
        opener = FOOTNOTE_MARKER_OPEN.search(text)
        if opener:
            text = text[:opener.start()]
            open_marker = True
            changed = True
        stripped.append(text)
        has_word = any(ch.isalnum() for ch in text)
        unspoken.append(
            not has_word and (changed or DASH_ONLY.fullmatch(text) is not None),
        )
    is_dot = [
        not unspoken[i] and ELLIPSIS_PIECE.fullmatch(stripped[i]) is not None
        for i in range(len(stripped))
    ]
    for i, dot in enumerate(is_dot):
        if not dot:
            continue
        if (i > 0 and (is_dot[i - 1] or stripped[i - 1].endswith("."))) or (
            i + 1 < len(is_dot) and is_dot[i + 1]
        ):
            unspoken[i] = True
    return [
        None if unspoken[i] else canonical_alignment_token(stripped[i])
        for i in range(len(stripped))
    ]


def expected_compound_pieces(token: str) -> List[str]:
    """Canonical pieces of a hyphenated expected token (``wage-labour`` ->
    ``['wage', 'labour']``); fewer than two pieces means not a compound.

    Kept for callers that ask "is this a hyphen compound"; revision 3 no
    longer drives the join from it (see ``glue_key``).
    """
    stripped, _changed = strip_expected_markup(token)
    pieces = [canonical_alignment_token(part) for part in HYPHEN_RUN.split(stripped)]
    return [piece for piece in pieces if piece]


def glue_key(token: str) -> str:
    """The token's letters and digits with every separator removed.

    ``wage-labour.`` -> ``wagelabour``; ``are—enough,`` -> ``areenough``;
    ``He'ld`` -> ``held``; ``2,186`` -> ``2186``.  Markup is stripped first, so
    ``_well-being_`` glues like ``well-being``.  Unlike
    ``canonical_alignment_token`` this never rewrites a numeral into a cardinal
    word: gluing compares spellings across a run of tokens, and the cardinal
    table is a single-token acoustic equivalence.
    """
    stripped, _changed = strip_expected_markup(token)
    return normalize_token(stripped)


def glue_forms(key: str) -> frozenset:
    """The glued key plus its contraction equivalent, if it has one."""
    expanded = CONTRACTIONS.get(key)
    return frozenset((key, expanded)) if expanded else frozenset((key,))


def glue_matches(left: str, right: str) -> bool:
    """Do two glued keys describe the same spoken words?"""
    if len(left) < MIN_GLUE_KEY or len(right) < MIN_GLUE_KEY:
        return False
    return bool(glue_forms(left) & glue_forms(right))


@dataclass(frozen=True)
class ComparisonHeard:
    """A recognised token as compared: possibly several heard pieces joined."""

    raw: str
    start: float
    end: float
    key: str
    pieces: Tuple[int, ...]  # indexes into the original heard sequence


@dataclass
class DetailedAlignment:
    words: List[dict[str, Any]]
    stats: AlignmentStats
    opcodes: List[Tuple[str, int, int, int, int]]  # over spoken expected × comparison heard
    spoken: List[int]          # expected index for each position in the opcodes' first side
    unspoken: List[int]        # expected indexes excluded as never-spoken markup
    observed: dict[int, int]   # expected index -> comparison heard index
    heard: List[ComparisonHeard]
    merges: List[dict[str, Any]]
    groups: List[dict[str, Any]]  # one heard token covering several expected tokens


def _opcodes(expected_keys: Sequence[str], heard_keys: Sequence[str]):
    return list(SequenceMatcher(None, list(expected_keys), list(heard_keys), autojunk=False).get_opcodes())


def _join_split_compounds(
    expected_tokens: Sequence[str],
    keys: Sequence[Optional[str]],
    spoken: Sequence[int],
    heard: List[ComparisonHeard],
    opcodes,
) -> Tuple[List[ComparisonHeard], List[dict[str, Any]]]:
    """Within each unresolved ``replace`` block, join the adjacent heard tokens
    that together spell one expected token of that block.

    Revision 2 drove this from hyphen compounds only, matching the pieces one
    by one.  Revision 3 compares the whole glued spelling instead
    (``glue_key``), which covers the hyphen compounds unchanged and adds em- and
    en-dash-glued words (``are—enough``), elisions the recogniser splits at the
    apostrophe (``He'ld`` heard ``He`` ``'ld``), grouped numerals (``2,186``
    heard ``2`` ``,186``), closed compounds the recogniser opens
    (``heartbroken`` heard ``heart`` ``broken``) and contractions the edition
    writes short (``You're`` heard ``You`` ``are``).  Nothing outside an
    unresolved block is touched, so an alignment that already resolved stays as
    it was.
    """
    glued_target = {i: glue_key(expected_tokens[i]) for i in spoken}
    piece_target = {i: pieces for i in spoken
                    if len(pieces := expected_compound_pieces(expected_tokens[i])) >= 2}
    spans: List[Tuple[int, int, int]] = []
    for tag, i1, i2, j1, j2 in opcodes:
        if tag != "replace":
            continue
        block = [spoken[i] for i in range(i1, i2)]
        if not block:
            continue
        j = j1
        while j < j2:
            hit = None
            for ei in block:
                # Revision 2's rule first, so every join it made is still made:
                # the canonical pieces of a hyphen compound, one heard token
                # each (``5-7.`` heard ``5`` ``-7.``, where the cardinal table
                # makes ``5`` and ``five`` the same piece).
                pieces = piece_target.get(ei)
                if pieces is not None:
                    k = len(pieces)
                    if j + k <= j2 and [heard[x].key for x in range(j, j + k)] == pieces:
                        hit = (j, j + k, ei)
                        break
                # Revision 3: the whole glued spelling against a run of heard
                # tokens, whatever the separator was.
                target = glued_target[ei]
                if len(target) < MIN_GLUE_KEY:
                    continue
                glued = ""
                for k in range(j, j2):
                    glued += normalize_token(heard[k].raw)
                    if k == j:
                        continue  # a single token is the ordinary comparison
                    if len(glued) > len(target) + 3:
                        break
                    if glue_matches(target, glued):
                        hit = (j, k + 1, ei)
                        break
                if hit:
                    break
            if hit:
                spans.append(hit)
                j = hit[1]
            else:
                j += 1
    if not spans:
        return heard, []
    by_start = {j1: (j2, ei) for j1, j2, ei in spans}
    joined: List[ComparisonHeard] = []
    merges: List[dict[str, Any]] = []
    j = 0
    while j < len(heard):
        if j in by_start:
            j2, ei = by_start[j]
            parts = heard[j:j2]
            item = ComparisonHeard(
                raw=" ".join(part.raw for part in parts),
                start=parts[0].start,
                end=parts[-1].end,
                key=keys[ei],  # type: ignore[arg-type]
                pieces=tuple(index for part in parts for index in part.pieces),
            )
            joined.append(item)
            merges.append({
                "expected_index": ei,
                "text": expected_tokens[ei],
                "heard": item.raw,
                "heard_indexes": list(item.pieces),
                "start": item.start,
                "end": item.end,
            })
            j = j2
        else:
            joined.append(heard[j])
            j += 1
    return joined, merges


def _match_glued_expected(
    expected_tokens: Sequence[str],
    spoken: Sequence[int],
    heard: Sequence[ComparisonHeard],
    opcodes,
) -> List[Tuple[int, List[int]]]:
    """The mirror of ``_join_split_compounds``: within each unresolved
    ``replace`` block, find a single heard token that spells several adjacent
    expected tokens — ``every one`` heard ``everyone``, ``You are`` heard
    ``You're``, ``2,186`` printed ``2, 186``.  Returns ``(heard index, expected
    indexes)`` pairs; the heard token's own span is shared between them.
    """
    groups: List[Tuple[int, List[int]]] = []
    for tag, i1, i2, j1, j2 in opcodes:
        if tag != "replace":
            continue
        i = i1
        while i < i2:
            hit = None
            glued = ""
            for k in range(i, i2):
                glued += glue_key(expected_tokens[spoken[k]])
                if k == i:
                    continue  # a single token is the ordinary comparison
                if len(glued) > 40:
                    break
                for j in range(j1, j2):
                    if glue_matches(glued, normalize_token(heard[j].raw)):
                        hit = (j, [spoken[x] for x in range(i, k + 1)], k + 1)
                        break
                if hit:
                    break
            if hit:
                groups.append((hit[0], hit[1]))
                i = hit[2]
            else:
                i += 1
    return groups


def align_tokens_detailed(
    expected_tokens: Sequence[str],
    heard: Sequence[HeardWord],
) -> DetailedAlignment:
    """Revision-3 alignment with full provenance (see module docstring)."""
    keys = expected_comparison_keys(expected_tokens)
    spoken = [i for i, key in enumerate(keys) if key is not None]
    unspoken = [i for i, key in enumerate(keys) if key is None]
    comparison = [
        ComparisonHeard(h.raw, h.start, h.end, canonical_alignment_token(h.raw), (j,))
        for j, h in enumerate(heard)
    ]
    if not expected_tokens:
        return DetailedAlignment([], AlignmentStats(0, len(heard), 0), [], [], [], {}, comparison, [], [])
    if not heard:
        return DetailedAlignment([], AlignmentStats(len(spoken), 0, 0), [], spoken, unspoken, {}, [], [], [])

    expected_keys = [keys[i] for i in spoken]
    opcodes = _opcodes(expected_keys, [item.key for item in comparison])
    comparison, merges = _join_split_compounds(expected_tokens, keys, spoken, comparison, opcodes)
    if merges:
        opcodes = _opcodes(expected_keys, [item.key for item in comparison])

    observed: dict[int, int] = {}
    for tag, i1, i2, j1, j2 in opcodes:
        if tag == "equal":
            for offset in range(i2 - i1):
                observed[spoken[i1 + offset]] = j1 + offset

    grouped = _match_glued_expected(expected_tokens, spoken, comparison, opcodes)
    groups: List[dict[str, Any]] = []
    share: dict[int, Tuple[int, int, List[int]]] = {}
    for hj, indexes in grouped:
        if any(ei in observed for ei in indexes):
            continue
        weights = [max(1, len(glue_key(expected_tokens[ei]))) for ei in indexes]
        for position, ei in enumerate(indexes):
            observed[ei] = hj
            share[ei] = (hj, position, weights)
        groups.append({
            "heard_index": hj,
            "heard": comparison[hj].raw,
            "expected_indexes": list(indexes),
            "text": " ".join(expected_tokens[ei] for ei in indexes),
            "start": comparison[hj].start,
            "end": comparison[hj].end,
        })

    aligned: List[Optional[dict[str, Any]]] = [None] * len(expected_tokens)
    for ei, hj in observed.items():
        item = comparison[hj]
        start, end = item.start, item.end
        if ei in share:
            _hj, position, weights = share[ei]
            total = sum(weights)
            span = end - start
            before = sum(weights[:position])
            start, end = (
                item.start + span * before / total,
                item.start + span * (before + weights[position]) / total,
            )
        aligned[ei] = {
            "text": expected_tokens[ei],
            "start": round(start, 3),
            "end": round(end, 3),
        }

    # Interpolate unmatched expected tokens between neighbors (revision-1 rule).
    for ei in range(len(expected_tokens)):
        if aligned[ei] is not None:
            continue
        prev_end = 0.0
        for pj in range(ei - 1, -1, -1):
            if aligned[pj] is not None:
                prev_end = aligned[pj]["end"]
                break
        next_start = comparison[-1].end
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

    # Clamp monotonic ends (revision-1 rule).
    for i in range(len(aligned)):
        entry = aligned[i]
        if entry["end"] < entry["start"]:
            entry["end"] = entry["start"]
        if i + 1 < len(aligned) and aligned[i + 1] is not None:
            entry["end"] = min(entry["end"], aligned[i + 1]["start"])

    words = [entry for entry in aligned if entry is not None]
    stats = AlignmentStats(len(spoken), len(comparison), len(observed))
    return DetailedAlignment(words, stats, opcodes, spoken, unspoken, observed, comparison, merges, groups)


def align_tokens_with_stats(
    expected_tokens: Sequence[str],
    heard: Sequence[HeardWord],
) -> Tuple[List[dict[str, Any]], AlignmentStats]:
    """Map edition tokens onto Whisper timings and report observed coverage.

    Missing edition tokens are interpolated so the reader still receives one
    timing per rendered whitespace token. ``matched_words`` deliberately counts
    only exact normalized matches produced by Whisper; interpolated tokens must
    not make a low-quality transcript look complete.  Revision 3: see
    ``align_tokens_detailed``.
    """
    detailed = align_tokens_detailed(expected_tokens, heard)
    return detailed.words, detailed.stats


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

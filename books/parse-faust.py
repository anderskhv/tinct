#!/usr/bin/env python3
"""
parse-faust.py  --de|--en  --out <path>
Unified Faust Part 1 parser producing DE + EN editions for Tinct.

DE source: PG #21000 (German verse original)
EN source: Hayward 1833/1892 interlinear OCR edition

Paragraphing: ONE continuous speaker block = ONE paragraph. New speaker tag
= new paragraph. Stage directions = own paragraph [in brackets].
Inline parenthetical stage directions are EMBEDDED in the current speech.
"""

import re
import sys
import json
import argparse
from pathlib import Path

BASE = Path("/Users/andershvelplund/Documents/Projects/Tinct/books/raw/faust-part-1")
DE_FILE = BASE / "raw-de.txt"
EN_FILE = BASE / "raw-en-hayward.txt"

# 28 canonical scenes
SCENES = [
    ("Zueignung", "Dedication"),
    ("Vorspiel auf dem Theater", "Prelude on the Stage"),
    ("Prolog im Himmel", "Prologue in Heaven"),
    ("Nacht", "Night"),
    ("Vor dem Thor", "Before the Gate"),
    ("Studierzimmer (Erster Teil)", "The Study, Part I"),
    ("Studierzimmer (Zweiter Teil)", "The Study, Part II"),
    ("Auerbachs Keller in Leipzig", "Auerbach's Cellar in Leipzig"),
    ("Hexenküche", "Witch's Kitchen"),
    ("Straße", "Street"),
    ("Abend", "Evening"),
    ("Spaziergang", "Promenade"),
    ("Der Nachbarin Haus", "The Neighbour's House"),
    ("Straße II", "Street (II)"),
    ("Garten", "Garden"),
    ("Ein Gartenhäuschen", "A Summer House"),
    ("Wald und Höhle", "Forest and Cavern"),
    ("Gretchens Stube", "Margaret's Room"),
    ("Marthens Garten", "Martha's Garden"),
    ("Am Brunnen", "At the Well"),
    ("Zwinger", "Zwinger"),
    ("Nacht. Straße vor Gretchens Türe", "Night. Street before Margaret's Door"),
    ("Dom", "Cathedral"),
    ("Walpurgisnacht", "Walpurgis-Night"),
    ("Walpurgisnachtstraum", "Walpurgis-Night's Dream"),
    ("Trüber Tag. Feld", "A Gloomy Day. Open Country"),
    ("Nacht. Offen Feld", "Night. Open Field"),
    ("Kerker", "Dungeon"),
]

# Apostrophe char class covering straight ' (U+0027), left ' (U+2018), right ' (U+2019)
APS = "[\u2018\u2019\u0027]"

STRUCTURAL_DE = {
    'Tragödie', 'Theil', 'Zueignung', 'Vorspiel', 'Prolog',
    'Nacht', 'Thor', 'Studirzimmer', 'Keller', 'Küche', 'Hexenküche',
    'Abend', 'Spazirgang', 'Wald', 'Garten', 'Brunnen', 'Zwinger',
    'Dom', 'Walpurgis', 'Kerker', 'Stube', 'Hochzeit', 'Intermezzo',
    'Feld', 'Vierter', 'Dienstmädchen', 'Bürgermädchen', 'Bürger',
    'Erste', 'Zweyte', 'Dritte', 'Handwerksbursch', 'Soldaten',
    'Tanz', 'Gesang', 'Alle',
}


# ============================================================================
# DE PARSER
# ============================================================================

DE_SCENE_MARKERS = [
    '_Zueignung._',
    '_Vorspiel',
    '_Prolog',
    '_Nacht._',
    '_Vor dem Thor._',
    '_Studirzimmer._',
    '_Studirzimmer._',
    '_Auerbachs Keller in Leipzig._',
    '_Hexenküche._',
    '_Straße._',
    '_Abend._',
    '_Spazir',
    '_Der Nachbarinn Haus._',
    '_Straße._',
    '_Garten._',
    '_Ein Gartenhäuschen._',
    '_Wald und Höhle._',
    '_Gretchens Stube._',
    '_Marthens Garten._',
    '_Am Brunnen._',
    '_Zwinger._',
    '_Nacht._',
    '_Dom._',
    '_Walpurgisnacht._',
    'Walpurgisnachtstraum',
    '_Trüber Tag._',
    '_Nacht, offen Feld._',
    '_Kerker._',
]


def find_de_scene_starts(lines):
    starts = []
    search_from = 0
    for marker in DE_SCENE_MARKERS:
        found = False
        for i in range(search_from, len(lines)):
            if marker in lines[i]:
                starts.append(i)
                search_from = i + 1
                found = True
                break
        if not found:
            print(f"WARNING: DE marker not found: {marker!r} from line {search_from}", file=sys.stderr)
            starts.append(search_from)
            search_from += 1
    return starts


def clean_de(s):
    s = re.sub(r'_(.*?)_', r'\1', s)
    s = re.sub(r'\[[^\]]{1,25}\]', '', s)
    s = re.sub(r'\s+\d{3,4}\s*$', '', s)
    return s.strip()


def is_de_speaker(s):
    """Return (name, descriptor) or (None, None)."""
    m = re.match(r'^_([^_]+)\._\s*$', s)
    if m:
        name = m.group(1).strip()
        if any(w in name for w in STRUCTURAL_DE):
            return None, None
        if ',' in name:
            return None, None
        if re.match(r'.+\.\s+[A-ZÄÖÜ]', name):
            return None, None
        return name, ''
    m = re.match(r'^_([^_]+)_\s+(.+?)\.?\s*$', s)
    if m:
        name = m.group(1).strip()
        desc = m.group(2).strip()
        if any(w in name for w in STRUCTURAL_DE):
            return None, None
        if re.match(r'^[A-ZÄÖÜ][a-zA-ZäöüÄÖÜß\s\-]{1,30}$', name) and len(name.split()) <= 3:
            return name, desc
    return None, None


def upcase_de_names(text):
    names = (r'Faust|Mephistopheles|Margarete|Gretchen|Marthe|Marth[ae]|Valentin|Wagner|'
             r'Siebel|Frosch|Brander|Altmayer|Director|Dichter|Herr|Raphael|Gabriel|Michael|'
             r'Hexe|Geist|Puck|Ariel|Oberon|Titania|Theatermeister|Herold|Engel')
    return re.sub(names, lambda m: m.group(0).upper(), text)


def extract_de_paragraphs(scene_lines):
    """One speaker block = one paragraph. Blank lines within a speech are stanza breaks (ignored).
    Inline (stage dirs) are embedded in speech. Standalone bracket/paren dirs are own paragraphs."""
    paragraphs = []
    current_speaker = None
    current_lines = []
    in_speech = False

    def flush():
        nonlocal current_speaker, current_lines, in_speech
        if not current_lines:
            current_speaker = None
            in_speech = False
            return
        cleaned = [clean_de(l) for l in current_lines]
        cleaned = [c for c in cleaned if c]
        if not cleaned:
            current_speaker = None
            current_lines = []
            in_speech = False
            return
        body = '\n'.join(cleaned)
        sp = current_speaker
        para = f"{sp.upper()}. {body}" if sp else body
        paragraphs.append(para)
        current_speaker = None
        current_lines = []
        in_speech = False

    def add_stage(raw):
        text = clean_de(raw.strip().rstrip('.').strip())
        text = upcase_de_names(text)
        if text:
            paragraphs.append(f"[{text}]")

    # Skip scene header lines at top (italic/structural lines)
    content_start = 0
    for i, line in enumerate(scene_lines[:15]):
        s = line.strip()
        if not s or s.startswith('_') or re.match(r'^\(', s) or s in ('Intermezzo.',):
            content_start = i + 1
        else:
            break
    # Skip trailing blanks
    while content_start < len(scene_lines) and not scene_lines[content_start].strip():
        content_start += 1

    for line in scene_lines[content_start:]:
        s = line.strip()

        # Skip blank lines (stanza separators, NOT paragraph breaks)
        if not s:
            continue

        # Skip pure line numbers and PG boilerplate
        if re.match(r'^\d+\s*$', s) or '***' in s:
            continue

        # Inline parenthetical stage direction
        m = re.match(r'^\((.+)\)\s*$', s)
        if m:
            inner = clean_de(m.group(1).strip())
            if in_speech and current_lines:
                # Embed in current speech
                current_lines.append(f"[{upcase_de_names(inner)}]")
            else:
                flush()
                add_stage(m.group(1))
            continue

        # Bracket stage direction (standalone)
        m = re.match(r'^\[(.+)\]\s*$', s)
        if m:
            flush()
            add_stage(m.group(1))
            continue

        # Speaker tag
        name, desc = is_de_speaker(s)
        if name is not None:
            flush()
            if desc:
                add_stage(f"{name.upper()} {desc}")
            current_speaker = name
            in_speech = True
            continue

        # Structural italic line to skip
        m = re.match(r'^_([^_]+)\._\s*$', s)
        if m:
            inner = m.group(1).strip()
            if any(w in inner for w in STRUCTURAL_DE):
                continue
            if ',' in inner or re.match(r'.+\.\s+[A-ZÄÖÜ]', inner):
                flush()
                add_stage(inner)
                continue

        # Regular verse line
        current_lines.append(s)
        if current_speaker:
            in_speech = True

    flush()
    return [p for p in paragraphs if p.strip() and len(p) > 2]


def parse_de():
    text = DE_FILE.read_text(encoding='utf-8')
    lines = text.splitlines()
    pg_start = next((i+1 for i, l in enumerate(lines) if '*** START OF' in l), 0)
    pg_end = next((i for i, l in enumerate(lines) if '*** END OF' in l), len(lines))
    play = lines[pg_start:pg_end]
    starts = find_de_scene_starts(play)
    chapters = []
    for idx, start in enumerate(starts):
        end = starts[idx+1] if idx+1 < len(starts) else len(play)
        paras = extract_de_paragraphs(play[start:end])
        chapters.append({"number": idx+1, "title": SCENES[idx][0], "paragraphs": paras})
    return {"chapters": chapters}


# ============================================================================
# EN PARSER
# ============================================================================
#
# The interlinear file alternates DE-verse pages and EN-prose pages.
# Strategy: use line-level German character detection to skip German lines.
# Scene boundaries detected from EN all-caps headings.
# German page headers are SKIPPED but do NOT interrupt scene collection.

# Build regex with U+2019 in apostrophe class
_A = "[\u2018\u2019\u0027]"  # apostrophe variants (straight + curly)

# EN scene headings: (compiled pattern, scene_idx, is_continuation)
def _ep(p, si, c=True):
    return (re.compile(p, re.I | re.UNICODE), si, c)

EN_SCENE_PATS = [
    _ep(r"^DEDICATION[.;\"'''\s]",                                   0,  False),
    _ep(r'^PRELUDE ON T(?:H|I[HE])E STAGE',                               1,  True),
    _ep(r'^PROLOGUE IN HEAVEN',                                            2,  True),
    # Night first occurrence: NIGHT." or NIGHT'." (curly dot)
    _ep(u"^NIGHT[.\\u2018\\u2019'\"]{1,2}\\s*$",                      3,  False),
    # Night continuation pages: NIGHT-SCENE. N or NIGHT-SCENE, N
    _ep(r'^NIGHT[-—]SCENE[.,\s]',                                    3,  True),
    _ep(r'^BEFORE THE (?:CITY )?GATE',                                     4,  False),
    _ep(r'^BEFORE THE (?:CITY )?GATE',                                     4,  True),
    # Study I first occurrence (no page number) — FAUST'S STUDY. or FAUST'S STUDY. N
    _ep(fr'^FAUST{_A}S STUDY[.,]?\s*$',                                   5,  False),
    # Study I continuation pages
    _ep(fr'^FAUST{_A}S STUDY[.,]\s*\d',                                   5,  True),
    # FAUSI'S is OCR variant for FAUST'S
    _ep(fr'^FAUSI{_A}S STUDY',                                             5,  True),
    # FAUSTS (no apostrophe) = Study II boundary
    _ep(r'^FAUSTS STUDY[.,]?\s*$',                                         6,  False),
    _ep(r'^AUERBACH' + _A + r'S CELLAR|^CELLAR IN LEIPZIG',               7,  True),
    _ep(r'^WITCH' + _A + r'S KITCHEN',                                     8,  True),
    # Street — first standalone (no number)
    _ep(r'^(?:THE|TUE) STREET[.,]?\s*$',                                   9,  False),
    # Street continuation pages
    _ep(r'^(?:THE|TUE) STREET[.,]\s*\d',                                   9,  True),
    _ep(r'^EVENING[.,]?\s*(?:\d+)?\s*$',                                  10,  False),
    _ep(r'^EVENING[.,]\s*\d',                                             10,  True),
    _ep(r'^A PROMENADE[.,\s]',                                            11,  True),
    _ep(r'^(?:THE|TILE) NEIGHBOUR' + _A + r'S HOUSE',                    12,  True),
    # Second Street standalone
    _ep(r'^(?:THE|TUE) STREET[.,]?\s*$',                                  13,  False),
    _ep(r'^(?:THE|TUE) STREET[.,]\s*\d',                                  13,  True),
    _ep(r'^GARDEN[.,]?\s*(?:\d+)?\s*$',                                   14,  False),
    _ep(r'^GARDEN[.,]\s*\d',                                              14,  True),
    _ep(r'^A SUMMER HOUSE',                                               15,  True),
    _ep(r'^FOREST AND CAVERN',                                            16,  True),
    _ep(r'^MARGARET' + _A + r'S ROOM',                                    17,  True),
    _ep(r'^MARTHA' + _A + r'S GARDEN',                                    18,  True),
    _ep(r'^AT THE WELL',                                                   19,  True),
    _ep(r'^ZWINGER' + _A + r'?',                                          20,  True),
    _ep(r'^NIGHT[.—\-]+STREET BEFORE',                               21,  False),
    _ep(r'^STREET[.,]\s*\d',                                              21,  True),
    _ep(r'^CATHEDRAL',                                                     22,  True),
    _ep(r'^WALPURGIS.NIGHT[.,!»\s](?!.*DREAM)',                           23,  True),
    _ep(r'^WALTURGIS.NIGHT',                                              23,  True),
    _ep(r'^WALPURGIS.NIGH[TH]' + _A + r'S DREAM|^WALPURGIS.NIGHT' + _A + r'S DREAM', 24, True),
    _ep(r'^WALPURGIS.NIGHI' + _A + r'S DREAM',                           24,  True),
    _ep(r'^A GLOOMY DAY|^GLOOMY DAY',                                     25,  True),
    _ep(r'^NIGHT[.,—\-]+(?:A COMMON|OPEN)',                          26,  False),
    _ep(r'^DUNGEON',                                                       27,  True),
]

# German page header patterns (skip, do not change scene)
DE_HEADER_RE = re.compile(
    r'^(?:'
    r'\d+[\s\w\.,;\!\?\*\(\)]{0,10}'
    r'(?:NACHT|VORSPIEL|PROLOG|STUDIRZIMMER|KELLER|HEXENK|'
    r'STRAS[AZ]|ABEND|SPAZIR|NACHBARIN|GARTEN|WALD|GRETCHENS|MARTHENS|'
    r'BRUNNEN|ZWINGER|DOM|WALPURGIS|KERKER|VOR\s+DEM|AUERBACHS|EIN\s+GARTENH)'
    r'|NACHT[.,]?\s*$'
    r'|STRAS[AZ]E[.,]?\s*$|STR[A-Z]SSE[.,]?\s*$'
    r'|VORSPIEL\s+AUF\s+DEM'
    r'|PROLOG\s+IM\s+HIMMEL'
    r'|STUDIRZIMMER'
    r'|AUERBACHS?\s+KELLER|AUERBÄCH'
    r'|HEXENK[ÜU]CHE|HEXENKUCHE'
    r'|SPAZIRGANG|SPAZIERGANG'
    r'|DER\s+NACHBARIN|DER\s+NACHBARINN'
    r'|EIN\s+GARTENH'
    r'|WALD\s+UND'
    r'|GRETCHENS\s+STUBE'
    r'|MARTHENS\s+GARTEN'
    r'|AM\s+BRUNNEN'
    r'|DOM\s*[.,]?\s*$'
    r'|WALPURGISN?A(?:CH)?T(?:STRAUM)?'
    r'|WALPURGISNAOHT'
    r'|TRÜBER\s+TAG'
    r'|NACHT.*STRASZE|NACHT.*STRASE|NACHT.*GRETCHENS'
    r'|VOR\s+DEM\s+THOR'
    r'|FAUST\.\s+EINE\s+TRAG'
    r'|KELLER\s+IN\s+LEIPZIG'
    r'|WALPURGISN?A[CH]HT\b'
    r')',
    re.I
)


def has_german(s):
    return bool(re.search(r'[äöüÄÖÜß]', s))


def is_noise(s):
    if not s: return True
    if re.match(r'^\d+\s*$', s): return True
    if re.match(r'^[\d\s\.\!\?\,\;\:\'°\*\(\)\[\]]{1,10}$', s): return True
    if re.match(r'^(?:Cornell|Library|The original|There are no known|http)', s, re.I): return True
    # Orphaned scene-title fragments: non-speaker all-caps words shorter than 5 chars
    # e.g. "DOOR." from "NIGHT.—STREET BEFORE MARGARET'S / DOOR."
    if re.match(r'^(?:DOOR|THURE|HOUSE|ROOM|HALL|GATE|WELL)\.\s*$', s, re.I): return True
    return False


def classify_en_heading(s, state):
    """
    Returns (scene_idx, new_state) if s is an EN scene heading, else (-1, state).
    state = {'street': 0, 'study': 0} — tracks occurrence counts for ambiguous patterns
    """
    # Headings are all-uppercase (or near so)
    lower = sum(1 for c in s if c.islower() and c not in "'''''")
    if lower > 2:
        return -1, state

    for pat, si, is_cont in EN_SCENE_PATS:
        if not pat.match(s):
            continue

        if si == 9:  # First Street
            street = state['street']
            if street == 0 and not is_cont:
                return 9, {**state, 'street': 1}
            elif street == 0 and is_cont:
                return -1, state  # No standalone scene yet
            elif street == 1 and is_cont:
                return 9, state   # Continuation of first street
        elif si == 13:  # Second Street standalone
            street = state['street']
            if street == 1 and not is_cont:
                return 13, {**state, 'street': 2}
            elif street == 2 and is_cont:
                return 13, state  # Continuation
            elif street == 0 and not is_cont:
                # First encounter — treat as first Street
                return 9, {**state, 'street': 1}
        elif si == 5:  # Study I first
            study = state['study']
            if study == 0 and not is_cont:
                return 5, {**state, 'study': 1}
            elif study == 1 and is_cont:
                return 5, state  # Study I continuation
            elif study >= 2:
                return 6, state  # Study II continuation (after FAUSTS STUDY marker)
        elif si == 6:  # FAUSTS STUDY boundary
            return 6, {**state, 'study': 10}
        else:
            return si, state

    return -1, state


# Known EN speaker names (lowercase)
EN_SPEAKERS = {
    'faust', 'mephistopheles', 'margaret', 'margarete', 'gretchen', 'greichen',
    'martha', 'marthe', 'valentin', 'valentine', 'wagner',
    'siebel', 'frosch', 'brander', 'altmayer', 'altmann',
    'manager', 'director', 'poet', 'merryman', 'clown',
    'lord', 'the lord', 'raphael', 'gabriel', 'michael',
    'witch', 'the witch', 'old witch', 'young witch', 'a young witch', 'a witch',
    'spirit', 'earth spirit', 'evil spirit', 'good spirit', 'evil-spirit',
    'ariel', 'puck', 'oberon', 'titania', 'herald', 'stage-manager',
    'proktophantasmist', 'shooting star', 'the massive ones', 'crane',
    'both', 'all', 'chorus', 'orchestra', 'voice', 'voices',
    'a citizen', 'peasant', 'student',
    "will-o'-the-wisp", 'will-o-the-wisp',
    'bessy', 'lieschen',
    'the three', 'three archangels',
    'orthodox', 'northern artist', 'purist', 'weathercock', 'windvane',
    'inquisitive traveller', 'a pair of lovers', 'a pair',
    'xenien', 'hennings', 'musaget',
    'idealist', 'realist', 'supernaturalist', 'skeptic', 'dogmatist',
    'spirit that is fashioning itself',
    'matron', 'leader of the band', 'kapellmeister', 'conductor',
    'solo', 'mundane', 'volatile', 'cynic', 'sentimentalist',
    'servibilis', 'interlocutor', 'fiddler',
    'an old man', 'old man', 'old peasant', 'old soldier',
}

DE_SPEAKER_RE = re.compile(
    r'^(Direktor|Dichter|Lustige\s+Person|Mephistopheles|Raphael|Gabriel|Michael|'
    r'Faust|Wagner|Margarete|Marthe|Marta|Gretchen|Valentin|Brander|Siebel|Frosch|'
    r'Altmayer|Hexe|Schüler|Geist|Der\s+Herr|Die\s+Thiere|Zu\s+Dre[iy]|'
    r'Chor|Engel|Oberon|Titania|Puck|Ariel|Herold|Theatermeister|'
    r'Lustige|Junge\s+Hexe)\.\s*$',
    re.I
)

DROP_CAPS = [
    (re.compile(r'^E approach again', re.I), 'Ye approach again'),
    (re.compile(r'^E two,', re.I),           'Ye two,'),
    (re.compile(r'^HAs? now,?\s+alas', re.I),'I have now, alas'),
    (re.compile(r'^HAVE now,?\s+alas', re.I),'I have now, alas'),
    (re.compile(r'^N misery', re.I),          'In misery'),
    (re.compile(r'^UBLIME spirit', re.I),     'Sublime spirit'),
    (re.compile(r'^O-DAY we rest', re.I),     'To-day we rest'),
    (re.compile(r'^TREMOR,?\s+long', re.I),   'A tremor, long'),
    (re.compile(r'^H, incline', re.I),        'Oh, incline'),
    (re.compile(r'^HEN I was', re.I),         'When I was'),
    (re.compile(r'^AVE you heard', re.I),     'Have you heard'),
    (re.compile(r'^OULD give', re.I),         'I would give'),
    (re.compile(r'^WOULD give', re.I),        'I would give'),
    (re.compile(r'^HE sun', re.I),            'The sun'),
    (re.compile(r'^HE comes', re.I),          'He comes'),
    (re.compile(r'^ILL no one', re.I),        'Will no one'),
    (re.compile(r'^TILL no one', re.I),       'Still no one'),
    (re.compile(r'^Y peace is gone', re.I),   'My peace is gone'),
    (re.compile(r'^M ICH faszt|^M\s+ICH\b', re.I), ''),  # German drop-cap
]


def fix_drop_cap(s):
    for pat, rep in DROP_CAPS:
        m = pat.match(s)
        if m:
            return rep + s[m.end():]
    return s


def detect_en_speaker(s):
    """Returns (SPEAKER_TAG, rest) or (None, None)."""
    # Strip leading OCR junk: j, |, l, etc. before a name
    clean = re.sub(r'^[j\|l!\.,\s]+(?=[A-Z])', '', s)

    # Pattern: "Name [qualifier]." or "Name [qualifier]. rest"
    m = re.match(
        r"^([A-Z][a-zA-Z\-\' ']{1,30}(?:\s+[a-zA-Z\-']{1,20}){0,2})"
        r'(\s*\([^)]{1,80}\))?'
        r'\.\s*(.*)$',
        clean
    )
    if not m:
        return None, None

    name = m.group(1).strip()
    qual = (m.group(2) or '').strip()
    rest = m.group(3).strip()
    name_lo = name.lower()

    # Direct match
    if name_lo in EN_SPEAKERS:
        sp = name.upper()
        if qual:
            sp = f"{sp} ({qual.strip('() ').upper()})"
        return sp, rest

    # Two-word base
    parts = name_lo.split()
    if len(parts) >= 2:
        base2 = ' '.join(parts[:2])
        if base2 in EN_SPEAKERS:
            sp = name.upper()
            if qual:
                sp = f"{sp} ({qual.strip('() ').upper()})"
            return sp, rest

    return None, None


def extract_en_blocks(lines):
    """Collect raw lines per scene (0..27), skipping German-char lines and DE headers.

    Key invariant: after a DE_HEADER_RE match, enter 'german page' mode and skip
    all lines until the next EN scene heading. This prevents German verse lines that
    lack umlaut characters from bleeding into the English collection.
    """
    scene_lines = {i: [] for i in range(28)}
    current_scene = -1
    state = {'street': 0, 'study': 0}
    in_german_page = False  # True after DE_HEADER_RE match, until next EN heading

    # Find start (DEDICATION heading, after preamble)
    start_idx = 0
    for i, line in enumerate(lines):
        s = line.strip()
        if re.match(r'^DEDICATION[.;"\'\s]', s, re.I) and i > 800:
            start_idx = i
            break

    # Find end (NOTES section after Dungeon)
    end_idx = len(lines)
    for i in range(19500, min(len(lines), 23000)):
        s = lines[i].strip()
        if re.match(r'^NOTES?\.\s*$', s, re.I):
            end_idx = i
            break

    for i in range(start_idx, end_idx):
        raw = lines[i]
        s = raw.strip()

        if is_noise(s):
            continue

        # German-char lines: always skip individually (German verse / OCR bleed)
        if has_german(s):
            continue

        # Try EN scene heading — always checked, even in german-page mode
        si, new_state = classify_en_heading(s, state)
        if si >= 0:
            current_scene = si
            state = new_state
            in_german_page = False  # back to English page
            continue

        # German page header: skip, don't change scene, enter german-page mode
        # (so non-umlaut German verse lines that follow are also skipped)
        if DE_HEADER_RE.match(s):
            in_german_page = True
            continue

        # If we're in a German page, skip (German verse without umlauts)
        if in_german_page:
            continue

        # Collect
        if current_scene >= 0:
            scene_lines[current_scene].append(raw)

    return scene_lines


def extract_en_paragraphs(raw_lines):
    """Build paragraphs from raw EN scene lines."""
    paragraphs = []
    speaker = None
    prose = []
    in_stage = False

    def flush():
        nonlocal speaker, prose, in_stage
        if not prose:
            speaker = None
            in_stage = False
            return
        # Join with hyphenation fix
        parts = []
        i = 0
        while i < len(prose):
            line = prose[i]
            if line.endswith('-') and i + 1 < len(prose):
                nxt = prose[i+1]
                if nxt and nxt[0].islower():
                    parts.append(line[:-1] + nxt)
                    i += 2
                    continue
            parts.append(line)
            i += 1
        text = ' '.join(p.strip() for p in parts if p.strip())
        text = re.sub(r'\s+', ' ', text).strip()
        text = re.sub(r'[_]{1,2}([^_]+)[_]{1,2}', r'\1', text)  # remove italic markers
        if not text:
            speaker = None
            prose = []
            in_stage = False
            return
        if in_stage:
            paragraphs.append(f"[{text}]")
        elif speaker:
            paragraphs.append(f"{speaker}. {text}")
        else:
            paragraphs.append(text)
        speaker = None
        prose = []
        in_stage = False

    def add_stage(text):
        text = text.strip()
        if text:
            paragraphs.append(f"[{text}]")

    # Pre-pass: fix hyphenated line breaks and drop caps
    processed = []
    for raw in raw_lines:
        s = raw.strip()
        if is_noise(s) or has_german(s):
            processed.append('')
            continue
        if re.match(r'^\d+\s*$', s):
            processed.append('')
            continue
        processed.append(fix_drop_cap(s))

    for s in processed:
        if not s:
            if prose:
                flush()
            continue

        # Bracket stage direction
        m = re.match(r'^\[(.+)\]\s*$', s)
        if m:
            inner = m.group(1).strip()
            if not has_german(inner):
                flush()
                add_stage(inner)
            continue

        # Parenthesized stage direction (standalone uppercase start)
        m = re.match(r'^\(([A-Z].+)\)\s*$', s)
        if m:
            inner = m.group(1).strip()
            if not has_german(inner):
                flush()
                add_stage(inner)
            continue

        # Speaker tag
        sp, rest = detect_en_speaker(s)
        if sp is not None:
            flush()
            speaker = sp
            if rest:
                prose.append(rest)
            continue

        # German speaker name on DE page (skip if no current speaker context)
        if DE_SPEAKER_RE.match(s) and not speaker and not prose:
            continue

        # Regular prose
        prose.append(s)

    flush()
    return [p for p in paragraphs if p.strip() and len(p) > 3]


def parse_en():
    text = EN_FILE.read_text(encoding='utf-8', errors='replace')
    lines = text.splitlines()
    scene_map = extract_en_blocks(lines)
    chapters = []
    for idx in range(28):
        paras = extract_en_paragraphs(scene_map.get(idx, []))
        chapters.append({"number": idx+1, "title": SCENES[idx][1], "paragraphs": paras})
    return {"chapters": chapters}


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser()
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument('--de', action='store_true')
    g.add_argument('--en', action='store_true')
    parser.add_argument('--out', required=True)
    args = parser.parse_args()

    result = parse_de() if args.de else parse_en()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    total = sum(len(c['paragraphs']) for c in result['chapters'])
    lang = 'DE' if args.de else 'EN'
    print(f"{lang}: {len(result['chapters'])} chapters, {total} paragraphs → {out}")
    for c in result['chapters']:
        print(f"  Ch{c['number']:2d}: {c['title'][:45]:<45} {len(c['paragraphs'])} paragraphs")


if __name__ == '__main__':
    main()

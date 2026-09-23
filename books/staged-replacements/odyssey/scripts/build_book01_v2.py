#!/usr/bin/env python3
"""Build candidate-v2.json for Odyssey Book 1 from the frozen candidate-v1.json.

Deterministic and idempotent: re-running reproduces byte-identical output.
Applies, in this order and no other:

  1. the paragraph-level corrections answering round-1 findings
     (book01/review/findings-v1.md), each matched exactly once;
  2. the Roman -> Greek name mapping of standing finding S1, case-sensitively
     and word-bounded, from the closed seven-row table in ../GLOSSARY.md,
     plus Euryclea -> Eurycleia;
  3. the typographic-apostrophe pass of ../PUNCTUATION.md §1.

Every hazard ../GLOSSARY.md names is asserted here, before and after, so that
a later rebuild cannot lose one silently.

Usage: python3 scripts/build_book01_v2.py
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # .../odyssey
BOOK = ROOT / "book01"
REPO_ROOT = ROOT.parent.parent.parent
ORIGINAL_EN = REPO_ROOT / "app/public/data/editions/odyssey-original-en.json"

V1_SHA = "8316ff76cdbb5d82a572bc58b9388dc76f8ab70deddec6e0dbf75f406b510db9"
SOURCE_SHA = "fd364c78c4e87d0c93e529aeaa42e13bc3677f21cc3b7143d1d43df76e64f1c4"

APOS = "'"          # ASCII apostrophe, as candidate-v1 has it
CURL = "’"     # typographic apostrophe, PUNCTUATION.md §1

# ---------------------------------------------------------------- corrections
# (0-based paragraph index, finding id, old, new). Applied in list order.
# "old" must occur exactly once in its paragraph, and "new" must not already
# be present, or the build fails.
CORRECTIONS = [
    (0, "1.1",
     "that resourceful man who wandered",
     "that resourceful hero who wandered"),
    (0, "1.2",
     "daughter of Jove, whatever part of it you know.",
     "daughter of Jove, from whatever source you know it."),
    (1, "2.1 (optional, applied)",
     "without let-up",
     "without pause"),
    (2, "3.1 (optional, applied)",
     "an offering of a hundred sheep and oxen",
     "a great sacrifice of sheep and oxen"),
    (3, "4.2",
     "See how men blame us gods for their troubles, when it is really "
     "their own folly that brings them grief.",
     "See how men lay the blame on us gods for what is, after all, nothing "
     "but their own folly."),
    (3, "4.1 (SUBSTANTIVE)",
     "he had to go and seduce Agamemnon's wife, and then kill Agamemnon,",
     "he had to go and seduce Agamemnon's wife wrongfully, and then kill "
     "Agamemnon,"),
    (4, "5.1",
     "who knows the depths of every sea and holds up",
     "who has charge of the depths of the sea and holds up"),
    (5, "6.1 (SUBSTANTIVE)",
     "for blinding his son Polyphemus, king of the Cyclopes.",
     "for blinding the eye of Polyphemus, king of the Cyclopes."),
    (6, "7.1",
     "his sheep and cattle without number",
     "his sheep and oxen without number"),
    (6, "7.2",
     "of his dear father's return—and this will win him a good name "
     "among men.",
     "of his dear father's return—for this will make people speak well "
     "of him."),
    (7, "8.1",
     "spear, so heavy and strong,",
     "spear, so stout and sturdy and strong,"),
    (8, "9.1",
     "Telemachus was the first to see her.",
     "Telemachus saw her long before anyone else did."),
    (8, "9.2",
     "He took her right hand in his, took her spear from her, and said,",
     "He took her right hand in his own, asked her for her spear, and said,"),
    (9, "10.1",
     "a cloth of fine linen",
     "a cloth of damask"),
    (11, "12.1",
     "the crowning pleasures of a banquet",
     "the crowning ornaments of a banquet"),
    (12, "13.1",
     "rather than a fatter purse",
     "rather than a longer purse"),
    (12, "13.2",
     "for you can hardly have come by land",
     "for you cannot have come by land"),
    (13, "14.2",
     "under the wooded hill of Neritum",
     "under the wooded mountain Neritum"),
    (13, "14.1",
     "for he is not dead, and not yet on the mainland.",
     "for he is not dead, and yet he is not on the mainland."),
    (15, "16.1",
     "while Penelope has a son like you",
     "while Penelope has such a fine son as you"),
    (16, "17.2",
     "would have built him a burial mound",
     "would have built a mound over his ashes"),
    (16, "17.1",
     "he is gone without a trace, and I have inherited nothing but grief.",
     "he is gone without a trace, and I have inherited nothing but dismay."),
    (17, "18.1",
     "he would soon deal with these worthless suitors",
     "he would soon set about these villainous suitors"),
    (18, "19.1 (SUBSTANTIVE)",
     "raise a mound to his memory, and let your mother marry again.",
     "raise a mound to his memory, and give your mother in marriage again."),
    (18, "19.2",
     "show your mettle, then, and make yourself a name.",
     "show your mettle, then, and make yourself a name in story."),
    (20, "21.1 (optional, applied)",
     "Give me a fine one, and I will give you something of equal value in "
     "return.",
     "You shall give me a fine one, and I will give you one of no less value "
     "in return."),
    (22, "23.1 (a)",
     "and the hardships Minerva had laid on the Achaeans",
     "and the sufferings Minerva had laid on the Achaeans"),
    (23, "24.1",
     "you know many other tales of gods and heroes",
     "you know many other deeds of gods and heroes"),
    (24, "23.1 (b) + 25.1",
     "Singers do not create the misfortunes they sing of; it is Jove who "
     "does that, sending",
     "Singers do not create the sufferings they sing of; it is Jove, not "
     "they, who does it, sending"),
    (24, "25.2",
     "and the running of your maids.",
     "and the direction of your servants."),
    (25, "26.1 (optional, applied)",
     "in wonder, taking her son's words to heart.",
     "in wonder, and kept her son's words in her heart."),
    (26, "27.1",
     "a voice as fine as Phemius's",
     "a voice as divine as Phemius's"),
    (28, "29.1",
     "But I will be master in my own house, at least, and rule over those "
     "Ulysses won for me.",
     "But I will be chief in my own house, and rule those whom Ulysses won "
     "for me."),
    (29, "30.1",
     "but you shall certainly be master in your own house",
     "but you shall be master in your own house"),
    (30, "31.1",
     "and even when some rumor reaches me",
     "and even if some rumor reaches me"),
    (31, "32.1",
     "looking out over the courtyard",
     "looking out over the outer court"),
    (31, "R2",
     "under a woollen fleece",
     "under a woolen fleece"),
]

# ------------------------------------------------------------- name mapping
# GLOSSARY.md's CLOSED table. Seven Roman->Greek rows plus the one
# Cast-display-name spelling. Nothing may be added without editing GLOSSARY.md.
NAME_MAP = [
    ("Ulysses", "Odysseus"),
    ("Minerva", "Athena"),
    ("Jove", "Zeus"),
    ("Neptune", "Poseidon"),
    ("Mercury", "Hermes"),
    ("Saturn", "Cronus"),
    ("Diana", "Artemis"),     # zero occurrences in Book 1; kept for later Books
    ("Euryclea", "Eurycleia"),
]

# Expected Book-1 counts, from the reviewer's census and re-verified below.
EXPECTED_NAME_COUNTS = {
    "Ulysses": 17, "Minerva": 12, "Jove": 6, "Neptune": 6,
    "Mercury": 3, "Saturn": 2, "Diana": 0, "Euryclea": 1,
}

# Never mapped. "Ops" is Eurycleia's grandfather (a man, already Greek); a
# general Roman->Greek deity list would carry "Ops -> Rhea" and destroy him.
FORBIDDEN_AFTER = ["Rhea", "Helios"]


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def dump_json(obj):
    """Same style as the served edition files and build_book_package.py."""
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def count(word, text):
    return len(re.findall(r"\b" + re.escape(word) + r"\b", text))


def fail(msg):
    print("FAIL: " + msg, file=sys.stderr)
    sys.exit(1)


def main():
    v1_path = BOOK / "candidate-v1.json"
    v1_bytes = v1_path.read_bytes()
    if sha256_bytes(v1_bytes) != V1_SHA:
        fail("candidate-v1.json is not at its frozen hash %s" % V1_SHA)
    src_path = BOOK / "source-book1.json"
    if sha256_bytes(src_path.read_bytes()) != SOURCE_SHA:
        fail("source-book1.json is not at its recorded hash")

    v1 = json.loads(v1_bytes.decode("utf-8"))
    src = json.loads(src_path.read_text(encoding="utf-8"))
    original = json.loads(ORIGINAL_EN.read_text(encoding="utf-8"))
    chapter = next(c for c in original["chapters"] if c["number"] == 1)
    if src["paragraphs"] != chapter["paragraphs"]:
        fail("source-book1.json is not byte-identical to served chapter 1")

    paras = list(v1["paragraphs"])
    if len(paras) != 32 or len(src["paragraphs"]) != 32:
        fail("paragraph count is not 32")

    joined_v1 = "\n".join(paras)

    # ---- pre-flight: the hazard invariants, measured on v1 -----------------
    for name, n in EXPECTED_NAME_COUNTS.items():
        got = count(name, joined_v1)
        if got != n:
            fail("v1 has %d occurrences of %s, expected %d" % (got, name, n))
    heaven_v1 = count("heaven", joined_v1)
    if heaven_v1 != 10:
        fail("v1 'heaven' count is %d, expected 10" % heaven_v1)
    if count("Ops", joined_v1) != 1:
        fail("v1 does not contain exactly one 'Ops'")
    if count("Hyperion", joined_v1) != 1:
        fail("v1 does not contain exactly one 'Hyperion'")
    if "Dulichium, Same, and wooded Zacynthus" not in joined_v1:
        fail("v1 does not contain the island list with 'Same'")
    if joined_v1.count(APOS) != 22:
        fail("v1 does not carry 22 ASCII apostrophes")
    if CURL in joined_v1:
        fail("v1 already carries a typographic apostrophe")

    # ---- step 1: paragraph corrections ------------------------------------
    changed = {}
    for idx, finding, old, new in CORRECTIONS:
        p = paras[idx]
        n = p.count(old)
        if n != 1:
            fail("B01-P%03d / finding %s: old string occurs %d times, "
                 "expected exactly 1:\n  %r" % (idx + 1, finding, n, old))
        if new in p:
            fail("B01-P%03d / finding %s: new string already present"
                 % (idx + 1, finding))
        paras[idx] = p.replace(old, new)
        changed.setdefault(idx, []).append(finding)

    # every correction landed, and no v1 form survives
    for idx, finding, old, new in CORRECTIONS:
        if new not in paras[idx]:
            fail("B01-P%03d / %s: correction did not land" % (idx + 1, finding))
        if old in paras[idx]:
            fail("B01-P%03d / %s: v1 form survives" % (idx + 1, finding))

    # findings explicitly NOT applied leave their v1 wording untouched
    if "what kind of ship brought you, and how your crew brought you to Ithaca" \
            not in paras[12]:
        fail("B01-P013's doubled 'brought' was changed; it is an 'also noted' "
             "remark the reviewer declined to raise, and is left as drafted")
    if "over which he spread a cloth" not in paras[9]:
        fail("B01-P010's 'over' (for Butler's 'under') was changed; it is "
             "recorded, not corrected")
    if "draughts" not in paras[7]:
        fail("'draughts' must stay (GLOSSARY.md spelling standard)")

    # ---- step 2: the name mapping -----------------------------------------
    applied = {}
    for roman, greek in NAME_MAP:
        pat = re.compile(r"\b" + re.escape(roman) + r"\b")   # case-SENSITIVE
        total = 0
        for i, p in enumerate(paras):
            paras[i], n = pat.subn(greek, p)
            total += n
        applied[roman] = total
        if total != EXPECTED_NAME_COUNTS[roman]:
            fail("%s -> %s: substituted %d, expected %d"
                 % (roman, greek, total, EXPECTED_NAME_COUNTS[roman]))

    # the chapter title carries a name too (served modern-en does the same)
    title = v1["title"].replace("Minerva", "Athena")
    if "Minerva" in title or "Athena" not in title:
        fail("chapter title was not remapped")

    joined = "\n".join(paras)

    # ---- hazard assertions, post-mapping ----------------------------------
    for roman, _ in NAME_MAP:
        if count(roman, joined) != 0:
            fail("a Roman form survives the mapping: %s" % roman)
    for bad in FORBIDDEN_AFTER:
        if count(bad, joined) != 0:
            fail("forbidden substitution appeared: %s" % bad)
    if count("Ops", joined) != 1:
        fail("hazard 1: 'Ops' did not survive the mapping")
    if "daughter of Ops, son of Pisenor" not in joined:
        fail("hazard 1: Eurycleia's genealogy was broken")
    if count("Eurycleia", joined) != 1 or count("Euryclea", joined) != 0:
        fail("Euryclea -> Eurycleia did not apply exactly once")
    if "son of Cronus, king of kings" not in joined or \
            joined.count("son of Cronus, king of kings") != 2:
        fail("hazard 2: the fixed epithet is not 'son of Cronus, king of "
             "kings' exactly twice")
    if count("Cronos", joined) != 0:
        fail("hazard 2: the 'Cronos' spelling survives")
    if "Dulichium, Same, and wooded Zacynthus" not in joined:
        fail("hazard 4: case-sensitivity failed and the island 'Same' was "
             "destroyed")
    if count("heaven", joined) != heaven_v1:
        fail("hazard 5: 'heaven' count changed from %d to %d"
             % (heaven_v1, count("heaven", joined)))
    if count("Hyperion", joined) != 1 or "sun-god Hyperion" not in joined:
        fail("hazard 6: Hyperion was touched")

    # ---- step 3: typographic apostrophes ----------------------------------
    n_apos = joined.count(APOS)
    if n_apos != 22:
        fail("expected 22 ASCII apostrophes before the pass, found %d" % n_apos)
    paras = [p.replace(APOS, CURL) for p in paras]
    joined = "\n".join(paras)
    if APOS in joined or '"' in joined:
        fail("an ASCII apostrophe or double quote survives")
    if joined.count(CURL) != 22:
        fail("typographic apostrophe count is not 22")

    # possessive decision (GLOSSARY.md hazard 3): Odysseus’s, never Odysseus’
    poss = len(re.findall("Odysseus" + CURL + "s", joined))
    if poss != 3:
        fail("expected 3 'Odysseus’s', found %d" % poss)
    if re.search("Odysseus" + CURL + "(?!s)", joined):
        fail("hazard 3: a bare 'Odysseus’' possessive survives")

    # ---- Butler's unclosed quotation (D4) is still preserved --------------
    if paras[17].rstrip().endswith("”"):
        fail("D4: B01-P018 acquired a closing quotation mark")
    if not paras[18].lstrip().startswith("“"):
        fail("D4: B01-P019 lost its opening quotation mark")
    opens = sum(p.count("“") for p in paras)
    closes = sum(p.count("”") for p in paras)
    if (opens, closes) != (30, 29):
        fail("quotation balance changed: %d/%d, expected 30/29"
             % (opens, closes))

    # ---- alignment and ratio ----------------------------------------------
    if len(paras) != len(src["paragraphs"]):
        fail("paragraph alignment broken")
    if any("\n" in p for p in paras):
        fail("a candidate paragraph contains a newline")
    src_words = sum(len(p.split()) for p in src["paragraphs"])
    cand_words = sum(len(p.split()) for p in paras)
    ratio = cand_words / src_words
    if ratio < 0.90:
        fail("overall word ratio %.3f below 0.90" % ratio)

    # ---- write -------------------------------------------------------------
    doc = {"number": v1["number"], "title": title, "paragraphs": paras}
    out = BOOK / "candidate-v2.json"
    out.write_text(dump_json(doc), encoding="utf-8")

    lines = [
        "# The Odyssey, Book 1 — modern English (candidate v2, readable copy)",
        "",
        "Generated by `scripts/build_book01_v2.py` from `candidate-v1.json`.",
        "Paragraph IDs are outside the prose; the text itself is byte-identical",
        "to `candidate-v2.json`.",
        "",
        "**" + title + "**",
        "",
    ]
    for i, p in enumerate(paras):
        lines.append("**B01-P%03d**" % (i + 1))
        lines.append("")
        lines.append(p)
        lines.append("")
    (BOOK / "candidate-v2-readable.md").write_text(
        "\n".join(lines), encoding="utf-8")

    v1_paras = json.loads(v1_bytes.decode("utf-8"))["paragraphs"]
    diffs = [i for i in range(32) if v1_paras[i] != paras[i]]
    untouched_by_correction = sorted(set(range(32)) - set(changed))

    print("OK — candidate-v2.json written")
    print("  paragraphs                 32, 1:1 with source")
    print("  corrections applied        %d in %d paragraphs"
          % (len(CORRECTIONS), len(changed)))
    print("  name substitutions         %d (%s)"
          % (sum(applied.values()),
             ", ".join("%s %d" % (k, v) for k, v in applied.items() if v)))
    print("  apostrophes normalized     22")
    print("  paragraphs differing v1→v2 %d" % len(diffs))
    print("  paragraphs with no correction (names/apostrophes only): %s"
          % ", ".join("B01-P%03d" % (i + 1) for i in untouched_by_correction))
    print("  word ratio                 %.4f (v1 was 0.9425)" % ratio)
    print("  candidate-v2.json sha256   %s" % sha256_bytes(out.read_bytes()))


if __name__ == "__main__":
    main()

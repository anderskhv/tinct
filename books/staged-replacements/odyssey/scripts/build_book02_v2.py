#!/usr/bin/env python3
"""Build candidate-v2.json for Odyssey Book 2 from the frozen candidate-v1.json.

Deterministic and idempotent: re-running reproduces byte-identical output.

Round 1 of independent review (book02/review/findings-v1.md) returned
*Accept after corrections*: 0 substantive, 16 minor (14 paragraph-level +
2 records), 11 optional (8 paragraph-level + 2 records by this build's own
enumeration — see book02/changes-v1-to-v2.md on the count), coverage complete.

This script applies **every paragraph-level finding, minor and optional** —
23 substitutions in 15 paragraphs. Each is matched exactly once or the build
fails. The records findings (R1–R4) are answered in GLOSSARY.md, the ledger,
book02/continuity.md and book02/README.md, not here.

Book 2 was drafted under the Greek-forms decision from the start, so there is
no name-mapping pass and no apostrophe pass: v1 is already at the standard.
The build asserts that, before and after, along with every GLOSSARY.md hazard.

Usage: python3 scripts/build_book02_v2.py
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / "book02"

V1_SHA = "2b5a0280719312bbabb214f0bcbf400cde62541ab7e9c892ce2c2b65bb4273ea"
SOURCE_SHA = "3cc4f38c171e0e1d72ad741e75c745b31c7f330dfb3ed79910832ae4d04714c7"

# ---------------------------------------------------------------- corrections
# (0-based paragraph index, finding id, old, new). Applied in list order.
# "old" must occur exactly once in its paragraph and "new" must not already be
# present, or the build fails.
CORRECTIONS = [
    # --- B02-P001 -----------------------------------------------------------
    (0, "1.2 (optional, applied)",
     "Telemachus got up and dressed",
     "Telemachus rose and dressed"),
    (0, "1.1",
     "He bound his sandals on his shapely feet",
     "He bound his sandals on his comely feet"),
    (0, "1.1",
     "Athena gave him such divine grace of presence",
     "Athena gave him such divine comeliness of presence"),
    # --- B02-P002 -----------------------------------------------------------
    (1, "2.2 (optional, applied)",
     "a man bent double with age and of vast experience",
     "a man bent double with age and of infinite experience"),
    (1, "2.1",
     "to Ilius, land of fine horses",
     "to Ilius, land of noble horses"),
    # --- B02-P004 -----------------------------------------------------------
    (3, "4.1",
     "for it is I who am the most wronged",
     "for it is I who am the most aggrieved"),
    (3, "4.2",
     "slaughtering our oxen, sheep and fat goats for their banquets",
     "sacrificing our oxen, sheep and fat goats for their banquets"),
    # --- B02-P006 -----------------------------------------------------------
    (5, "6.1 (optional, applied)",
     "for I would not have my skill in needlework perish unrecorded",
     "for I would not have skill in needlework perish unrecorded"),
    # --- B02-P007 -----------------------------------------------------------
    (6, "7.1 (optional, applied)",
     "so long we shall go on eating up your estate",
     "so long shall we go on eating up your estate"),
    # --- B02-P009 -----------------------------------------------------------
    (8, "9.1",
     "gliding side by side in their own lordly flight",
     "sailing side by side in their own lordly flight"),
    # --- B02-P010 -----------------------------------------------------------
    (9, "10.1",
     "it will be better for them. I am not prophesying without due knowledge:",
     "it will be better for them, for I am not prophesying without due knowledge:"),
    # --- B02-P011 -----------------------------------------------------------
    (10, "11.2 (optional, applied)",
     "I can read these omens far better than you can",
     "I can read these omens myself far better than you can"),
    (10, "11.1 (also applied to accepted Book 1 as candidate-v3.json)",
     "all the marriage gifts a beloved daughter deserves",
     "all the marriage gifts a beloved daughter may expect"),
    # --- B02-P013 -----------------------------------------------------------
    (12, "13.1",
     "He too spoke to them plainly and in all honesty",
     "He then spoke to them plainly and in all honesty"),
    # --- B02-P015 -----------------------------------------------------------
    (14, "15.1",
     "for one man to fight a crowd over his food",
     "for one man to fight with many over his food"),
    (14, "15.2",
     "were to come upon us while we were feasting in his house",
     "were to set upon us while we were feasting in his house"),
    (14, "15.3 (optional, applied)",
     "let the boy’s father’s old friends, Mentor and Halitherses, speed him on his journey",
     "let his father’s old friends, Mentor and Halitherses, speed the boy on his journey"),
    # --- B02-P020 -----------------------------------------------------------
    (19, "20.1",
     "Antinous came up to him at once, laughed, and took his hand in his own",
     "Antinous came up to him at once and laughed as he took his hand in his own"),
    # --- B02-P023 -----------------------------------------------------------
    (22, "23.1",
     "from Pylos, or from Sparta again, where he seems bent on going",
     "from Pylos, or else from Sparta, where he seems bent on going"),
    # --- B02-P026 -----------------------------------------------------------
    (25, "26.1",
     "some of the best wine you have, after what you are keeping",
     "some of the best wine you have, apart from what you are keeping"),
    # --- B02-P031 -----------------------------------------------------------
    (30, "31.1 (optional, applied)",
     "Then she went to the house of Odysseus",
     "Next she went to the house of Odysseus"),
    # --- B02-P034 -----------------------------------------------------------
    (33, "34.2 (optional, applied)",
     "When they had brought the things down as he told them",
     "When they had brought the things as he told them"),
    (33, "34.1",
     "over the deep blue waves, whereupon Telemachus told them",
     "over the deep blue waves, and then Telemachus told them"),
]

# Dead words and forms asserted absent from the candidate. `comeliness` is
# REMOVED from v1's list at finding 1.1 — the reviewer ruled it neither
# obscure nor archaic, and it is restored deliberately to keep Butler's
# comely/comeliness pair. `whereupon` is ADDED at records finding R3: v1's
# list asserted `whereon` and the word survived under one letter's disguise.
DEAD = ("thereon", "ere long", "whereon", "whereupon", "spunging", "victuals",
        "naughtiness", "prating", "hither and thither", "abode", "save only",
        "bade", "moodily", "endowed", "tambour", "singlehanded", "unblended",
        "steeds", "amongst", "bethought", "fuddle")

BRITISH = ("grey", "honour", "harbour", "marvelled", "woollen", "travelled")


def fail(msg):
    sys.exit("build_book02_v2.py: " + msg)


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def dump_json(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def count(word, text):
    return len(re.findall(r"\b" + re.escape(word) + r"\b", text))


def main():
    v1_bytes = (BOOK / "candidate-v1.json").read_bytes()
    if sha256_bytes(v1_bytes) != V1_SHA:
        fail("candidate-v1.json is not at its frozen hash %s" % V1_SHA)
    src_bytes = (BOOK / "source-book2.json").read_bytes()
    if sha256_bytes(src_bytes) != SOURCE_SHA:
        fail("source-book2.json is not at its recorded hash")

    v1 = json.loads(v1_bytes.decode("utf-8"))
    src = json.loads(src_bytes.decode("utf-8"))
    paras = list(v1["paragraphs"])
    joined_v1 = "\n".join(paras)

    # ---- pre-flight: v1 is already at the naming and punctuation standard ---
    for name, n in (("Odysseus", 17), ("Athena", 8), ("Zeus", 6), ("Eurycleia", 2)):
        if count(name, joined_v1) != n:
            fail("v1 name count wrong for %s" % name)
    if "'" in joined_v1 or '"' in joined_v1:
        fail("v1 carries an ASCII quote")
    if count("Ops", joined_v1) != 1:
        fail("v1 does not contain exactly one 'Ops'")

    # ---- the corrections ---------------------------------------------------
    changed = {}
    for idx, finding, old, new in CORRECTIONS:
        p = paras[idx]
        n = p.count(old)
        if n != 1:
            fail("B02-P%03d / finding %s: old string occurs %d times, "
                 "expected exactly 1:\n  %r" % (idx + 1, finding, n, old))
        if new in p:
            fail("B02-P%03d / finding %s: new string already present"
                 % (idx + 1, finding))
        paras[idx] = p.replace(old, new)
        changed.setdefault(idx, []).append(finding)

    for idx, finding, old, new in CORRECTIONS:
        if new not in paras[idx]:
            fail("B02-P%03d / %s: correction did not land" % (idx + 1, finding))

    joined = "\n".join(paras)

    # ---- the findings explicitly NOT raised stay as drafted ----------------
    # "Also noted" remarks the reviewer considered and declined to raise.
    for idx, frag, why in (
        (0, "town criers", "1.x: 'criers' -> 'town criers' considered and declined"),
        (7, "choose", "8.x: Butler's 'elect' folded into 'choose'; declined"),
        (10, "because of the way she treats us", "11.x: counterfactual -> cause; declined"),
        (11, "the waste you suitors make for another twelve months",
         "12.x: Butler's 'yet' dropped in both Books; changing Book 2 alone "
         "would break the cross-Book formula"),
        (2, "an excellent man", "3.x: 'person' -> 'man'; considered and let go"),
        (14, "the rest of you go about your business", "15.x: partition; let go"),
    ):
        if frag not in paras[idx]:
            fail("B02-P%03d: a declined 'also noted' reading was changed (%s)"
                 % (idx + 1, why))

    # ---- every hazard and standard, post-correction ------------------------
    for name, n in (("Odysseus", 17), ("Athena", 8), ("Zeus", 6), ("Eurycleia", 2)):
        if count(name, joined) != n:
            fail("name count changed: %s" % name)
    for bad in ("Ulysses", "Minerva", "Jove", "Neptune", "Mercury", "Saturn",
                "Diana", "Euryclea", "Rhea", "Helios", "Cronos"):
        if count(bad, joined) != 0:
            fail("forbidden form appeared: %s" % bad)
    if count("Ops", joined) != 1 or "daughter of Ops, son of Pisenor" not in joined:
        fail("hazard 1: Ops or his genealogy disturbed")
    if count("Ilius", joined) != 1 or count("Troy", joined) != 1:
        fail("Butler's two forms Ilius/Troy must both survive, once each")

    # D13: Mycene in Book 2 is the WOMAN and keeps Butler's spelling; the city
    # (Book 3, Book 21) takes Mycenae. Book 2 contains no city.
    if count("Mycene", joined) != 1 or "Tyro, Alcmena, Mycene" not in joined:
        fail("D13: the woman Mycene must survive, once, in her list of women")
    if count("Mycenae", joined) != 0:
        fail("D13: Book 2's Mycene is the woman; the city form must not appear")

    # D12 class A: the bracket mark is dropped and Butler's supplied words stand
    if "[" in joined or "]" in joined:
        fail("D12: a bracket mark survives")
    if "councils: do not hold back, my friends" not in paras[3]:
        fail("D12 class A: the supplied words or the supplied colon were lost")

    # the one gloss
    if "the Erinyes—the spirits of vengeance—to avenge her" not in paras[7]:
        fail("the Erinyes gloss was disturbed")

    # punctuation and spelling
    if "'" in joined or '"' in joined:
        fail("an ASCII quote survives")
    opens = sum(p.count("“") for p in paras)
    closes = sum(p.count("”") for p in paras)
    if (opens, closes) != (29, 28):
        fail("quotation balance changed: %d/%d, expected 29/28" % (opens, closes))
    unbal = [i for i, p in enumerate(paras) if p.count("“") != p.count("”")]
    if unbal != [5]:
        fail("D4: the only unbalanced paragraph must be B02-P006, got %s" % unbal)
    if not paras[6].lstrip().startswith("“"):
        fail("D4: B02-P007 must open with its own mark")
    if not paras[5].rstrip().endswith("’"):
        fail("D4: Penelope's inner quotation must stay closed at B02-P006")
    low = joined.lower()
    for dead in DEAD:
        if dead in low:
            fail("archaism survives: %s" % dead)
    for brit in BRITISH:
        if count(brit, joined) != 0:
            fail("British spelling survives: %s" % brit)
    if "gray-eyed daughter of Zeus" not in paras[33]:
        fail("the Athena epithet row was disturbed")
    # finding 1.1 restores Butler's comely/comeliness pair, deliberately
    if "comely feet" not in paras[0] or "divine comeliness of presence" not in paras[0]:
        fail("finding 1.1 did not land as a pair")

    # ---- formulas shared with Book 1, now at candidate-v3 ------------------
    b1 = json.loads((ROOT / "book01/candidate-v3.json").read_bytes().decode("utf-8"))["paragraphs"]
    for frag in ("feeding off one man",
                 "will settle the account with you in full",
                 "there will be no one to avenge you",
                 "a crew of twenty men",
                 "raise a mound to his memory",
                 "all the marriage gifts a beloved daughter may expect",
                 "in low spirits",
                 "outer court"):
        if not any(frag in p for p in b1):
            fail("cross-Book formula missing from Book 1 v3: %s" % frag)
        if not any(frag in p for p in paras):
            fail("cross-Book formula missing from Book 2 v2: %s" % frag)

    # ---- alignment, newlines, ratio ----------------------------------------
    if len(paras) != len(src["paragraphs"]) or len(paras) != 35:
        fail("paragraph alignment broken")
    if any("\n" in p for p in paras):
        fail("a candidate paragraph contains a newline")
    if any(paras[i] == src["paragraphs"][i].replace("\n", " ") for i in range(35)):
        fail("a candidate paragraph is byte-identical to Butler")
    src_words = sum(len(p.split()) for p in src["paragraphs"])
    cand_words = sum(len(p.split()) for p in paras)
    ratio = cand_words / src_words
    if not 0.90 <= ratio <= 1.10:
        fail("word ratio %.4f outside 0.90-1.10" % ratio)

    # ---- retention: Butler word-tokens carried over unchanged and in order --
    retention = token_retention(src["paragraphs"], paras)

    # ---- write -------------------------------------------------------------
    doc = {"number": v1["number"], "title": v1["title"], "paragraphs": paras}
    out = BOOK / "candidate-v2.json"
    out.write_text(dump_json(doc), encoding="utf-8")

    lines = [
        "# " + doc["title"] + " — modern-English candidate v2 (readable)",
        "",
        "Generated by `scripts/build_book02_v2.py` from the frozen",
        "`candidate-v1.json`. Paragraph IDs are outside the prose; the text",
        "itself is byte-identical to `candidate-v2.json`.",
        "",
    ]
    for i, p in enumerate(paras):
        lines.append("**B02-P%03d**" % (i + 1))
        lines.append("")
        lines.append(p)
        lines.append("")
    (BOOK / "candidate-v2-readable.md").write_text("\n".join(lines), encoding="utf-8")

    diffs = [i for i in range(35) if v1["paragraphs"][i] != paras[i]]
    print("OK — candidate-v2.json written")
    print("  paragraphs                 35, 1:1 with source")
    print("  corrections applied        %d in %d paragraphs"
          % (len(CORRECTIONS), len(changed)))
    print("  paragraphs differing v1→v2 %d (%s)"
          % (len(diffs), ", ".join("B02-P%03d" % (i + 1) for i in diffs)))
    print("  word ratio                 %.4f (v1 was 0.9993)" % ratio)
    print("  Butler token retention     %.3f (v1 was 0.889)" % retention)
    print("  candidate-v2.json sha256   %s" % sha256_bytes(out.read_bytes()))


def token_retention(src_paragraphs, cand_paragraphs):
    """The Book 2 reviewer's measure: the fraction of Butler's word tokens the
    candidate carries over unchanged AND in order. Name mapping normalized,
    punctuation and case stripped, difflib matching blocks over word tokens.
    A better signal than the word-count ratio, which a light touch-up passes.
    """
    import difflib
    NAME_MAP = {"ulysses": "odysseus", "minerva": "athena", "jove": "zeus",
                "neptune": "poseidon", "mercury": "hermes", "saturn": "cronus",
                "diana": "artemis", "euryclea": "eurycleia"}

    def toks(text):
        text = text.replace("\n", " ").lower()
        out = []
        for w in re.findall(r"[a-z]+", text):
            out.append(NAME_MAP.get(w, w))
        return out

    s = toks(" ".join(src_paragraphs))
    c = toks(" ".join(cand_paragraphs))
    sm = difflib.SequenceMatcher(a=s, b=c, autojunk=False)
    kept = sum(b.size for b in sm.get_matching_blocks())
    return kept / len(s)


if __name__ == "__main__":
    main()

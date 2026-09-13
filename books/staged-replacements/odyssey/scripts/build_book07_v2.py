#!/usr/bin/env python3
"""Book 7 step 6 — apply round 1's corrections and build `candidate-v2.json`.

`book07/review/findings-v1.md`, verdict **accept after corrections**: 3
substantive, 10 minor, 7 optional, 6 records. Every finding is answered either
way (**D11**); the declined ones are asserted **still present** in the built
file, so a decline cannot be a silent application.

`candidate-v1.json` is frozen and is not edited (**D10**): this script is the
only thing that produces v2, every `old` string is asserted to occur exactly
once in its paragraph, and every `new` string is asserted to have landed.

**The headline is a number the Book published and got wrong.** Substantive
finding **S-1**: six of the candidate's fourteen semicolons are the drafter's
own, written where Butler wrote a comma, and under D20 a comma raised to a
semicolon scores as a full division for one keystroke. Aligned to Butler's own
pointing, Book 7 v1's NORM RATE is **+3.0%, not +7.5%**. The measure is now in
`checks.py` (`semicolon_provenance()`, `kept_added()`, `norm_rate_butler()`)
and is reported for every Book, and the corrections here move the figure
honestly instead: three of the six additions become periods (**M-6**), three of
Butler's own survivors become periods (**M-7**), and one of his that was lowered
to a comma comes back as a period (**M-8**).

Four of this round's repairs are **not** in the findings file. They are
**arrow C**'s, the third arrow added to `rendering_collisions.py` at this step
after the reviewer demonstrated that every instrument in the package is blind
to the class M-2, M-5 and M-10 belong to. See `book07/collisions.md`.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import checks                                                   # noqa: E402
from checks import kept_added, norm_rate, norm_rate_butler      # noqa: E402

BOOK = ROOT / "book07"
V1_SHA = "bf8cf2f76f4670daab55daf1da265ba7b1839c0cd6680e3c5691fac8d382dc33"
N = 29

# ---------------------------------------------------------------- corrections
# (0-based paragraph index, finding id, old, new). Applied in list order.
CORRECTIONS = [
    # ---- M-8 — Butler's one seam-semicolon, lowered to a comma, leaving a
    # 48-word six-link chain that the aligned growth gate reported as 46 -> 48.
    # The mark Butler supplied at the one place the sentence turns — from
    # instruction to reason — is the mark that was removed. His comma before
    # `and do not like` comes back with it.
    (3, "M-8 — the seam Butler pointed, restored as a period (30 + 19)",
     "or ask him questions, for the people here cannot abide strangers and do "
     "not like men who come from somewhere else.",
     "or ask him questions. The people here cannot abide strangers, and do not "
     "like men who come from somewhere else."),

    # ---- M-7 — a semicolon of Butler's before `but`, holding 43 words.
    (6, "M-7 — P007's 43-word sentence divided at Butler's semicolon",
     "and without a son; but he left a daughter, Arete,",
     "and without a son. But he left a daughter, Arete,"),
    # ---- O-6 — Butler's partitive `of` reads to a modern eye as an agent,
    # which inverts a comparison into a compliment from the wrong party.
    (6, "O-6 — `honored of all those who keep house` read as *honored BY*",
     "and honors as no other woman is honored of all those who keep house "
     "along with their husbands.",
     "and honors more than any other woman who keeps house beside her husband."),

    # ---- M-2 — Butler writes `abode` and, eleven words later, `house`; the
    # candidate wrote `house` twice. The B06-P019 shape the drafter identified
    # and repaired at B07-P021 and did not apply here.
    (8, "M-2 — `abode` -> `home`, freeing `house` for Butler's own",
     "where she entered the house of Erechtheus.",
     "where she entered the home of Erechtheus."),

    # ---- ARROW C, unreported by round 1. In one paragraph Butler has
    # Hephaestus `fashion` the mastiffs and the women of the house `make` the
    # hangings; the candidate wrote `made` for both, flattening a god's craft
    # onto household work in the paragraph whose subject is the palace's
    # wonder. `fashion` is current English and needed no change.
    (9, "arrow C — `fashioned expressly` -> `made` beside the women's `made`",
     "with his consummate skill, had made specially to keep watch",
     "with his consummate skill, had fashioned specially to keep watch"),
    # ---- M-10 — `chief persons` -> `chief men`, against the candidate's own
    # `chief people` two paragraphs later rendering the same Butler phrase.
    (9, "M-10 — `chief men` -> `chief people`, Butler's open word restored",
     "Here the chief men of the Phaeacians",
     "Here the chief people of the Phaeacians"),
    # ---- M-7 — a semicolon of Butler's before `and`, joining two unrelated
    # inventories (the feasting, the torch-bearing statues) across 49 words.
    (9, "M-7 — P010's 49-word sentence divided (25 + 25)",
     "for there was abundance at all seasons; and there were golden figures",
     "for there was abundance at all seasons. And there were golden figures"),

    # ---- ARROW C — Butler pointed the parallel with `nor`; the candidate
    # doubled a word he used once.
    (10, "arrow C — `never rot and never fail` doubles Butler's one `never`",
     "The fruits never rot and never fail all the year round",
     "The fruits never rot or fail all the year round"),

    # ---- M-1 — the collision the check printed and nobody ruled on, and a
    # sense change as well: `precincts` is the enclosure, and the next sentence
    # has Odysseus going straight through the court. Three paragraphs from
    # B07-P009's literal bronze walls.
    (11, "M-1 — `precincts` -> `walls` is a sense change; the courtyard is "
         "Butler's enclosure and frees `walls` for the bronze",
     "he crossed the threshold and went inside the walls of the house.",
     "he crossed the threshold and went inside the courtyard of the house."),

    # ---- M-4 — the move out of Butler's parenthesis is upheld (§5.1); its
    # execution created an intervening plural antecedent, so `them all` now
    # takes `my friends`. The clauses swap: the blessing sits against its own
    # referents and the complaint closes the speech. No word is added or lost
    # and the Book's one displaced run is untouched.
    (12, "M-4 — `them all` took `my friends` as its nearest antecedent",
     "as soon as possible, for I have been long in trouble and away from my "
     "friends. May heaven prosper them all with long life and happiness, and "
     "may they leave their possessions to their children, and all the honors "
     "the state has conferred on them.”",
     "as soon as possible. May heaven prosper them all with long life and "
     "happiness, and may they leave their possessions to their children, and "
     "all the honors the state has conferred on them. For I have been long in "
     "trouble and away from my friends.”"),

    # ---- ARROW C, unreported by round 1. Echeneus says `tell him, then, to
    # rise` and, in the same speech, `bid your servants mix some wine`. The
    # candidate wrote `Tell` for both; `bid` is a command through an
    # intermediary and `tell` is not.
    (14, "arrow C — `bid` -> `Tell` beside Butler's own `tell` in one speech",
     "Tell your servants to mix some wine and water",
     "Have your servants mix some wine and water"),
    # ---- M-7 — a semicolon of Butler's before `and`, introducing a NEW
    # imperative after a relative clause about Zeus, across 47 words. Echeneus's
    # instruction was divided once and needed dividing twice.
    (14, "M-7 — P015's 47-word sentence divided (30 + 17)",
     "under his protection; and let the housekeeper give him some supper",
     "under his protection. And let the housekeeper give him some supper"),

    # ---- A6 / findings §5.3 — D9 wins. `councillors` is the ONLY British
    # spelling in seven accepted Books, so this is one word against a named
    # rule, not house style against a rule. Costs a successor to Book 2.
    (17, "A6 / §5.3 — `councillors` -> `councilors`, D9",
     "Aldermen and town councillors", "Aldermen and town councilors"),
    # ---- M-6 — a semicolon ADDED before `but` where Butler wrote a comma:
    # the Victorian habit this edition exists to modernize away from.
    (17, "M-6 — an added semicolon before `but` becomes a period",
     "while on his homeward journey; but when he is once at home",
     "while on his homeward journey. But when he is once at home"),
    # ---- one class, two dispositions inside one Book, which is the shape
    # D16 was written about. This Book normalizes `towards` -> `toward` three
    # times, `backwards` -> `backward` and `forwards` -> `forward`, and then
    # leaves `afterwards`. Not in the findings; found by census at this step.
    (17, "D9/D16 — `afterwards` is the one -wards form this Book did not "
         "normalize (moved to P026 below)", None, None),

    # ---- M-5 — `sup` -> `eat` thirty words from Butler's own `eat`, at a
    # supper, where `sup` is the meal in front of the speaker.
    (18, "M-5 — `sup` -> `eat` beside Butler's own `eat`",
     "Nevertheless, let me eat in spite of sorrow",
     "Nevertheless, let me have my supper in spite of sorrow"),
    # ---- M-6, the sixth addition and the one §8 calls *arguable; a period is
    # cleaner*. Ruled: **period.** It is an added mark of exactly the class the
    # other three belong to; `it tells me to lay aside…` is a full independent
    # clause, so the plainer pointing is the stop; and the paragraph is already
    # a chain. Butler wrote no mark here at all — his `bids me lay aside` hangs
    # off `it insists`, so the candidate's semicolon is not even a comma raised.
    (18, "M-6 / §8 — the sixth added semicolon, ruled a period",
     "that I shall eat and drink; it tells me",
     "that I shall eat and drink. It tells me"),

    # ---- M-5 — `importunate` -> `insistent`, twenty-two words from Butler's
    # own `it insists`, which the candidate keeps. Butler varied the root.
    (18, "M-5 — `insistent` stands twenty-two words from `it insists`",
     "an empty stomach is a very insistent thing",
     "an empty stomach is a very demanding thing"),
    # ---- §8's one reading note for this paragraph.
    (18, "§8 B07-P019 — the adverb moved off the verb it was not modifying",
     "if I may first see once more my property",
     "if I may first see my property once more"),

    # ---- M-3 — the Book's clearest garden path, and the drafter built it, by
    # deleting a mark: without Butler's comma, `wearing as the work of herself`
    # is the first parse a reader builds across 21 words.
    (19, "M-3 — the comma Butler wrote before `as the work of herself`",
     "that Odysseus was wearing as the work of herself and her maids",
     "that Odysseus was wearing, as the work of herself and her maids"),
    # ---- O-2 — the serial comma had two dispositions inside one Book. The
    # house style keeps it (four times to two) and now says so.
    (19, "O-2 — the serial comma, restored where Butler had it",
     "the shirt, cloak and good clothes", "the shirt, cloak, and good clothes"),
    # ---- M-2 again, the same shape: `every man in his own abode`.
    (19, "M-2 — `abode` -> `home` at P020 as well",
     "every man to his own house", "every man to his own home"),

    # ---- ARROW C, unreported by round 1, and the sharpest of the three.
    # Butler: `she bade me depart of her own free will, either because Jove had
    # told her she must`. The sentence turns on the difference between
    # Calypso's own bidding and Zeus's telling; the candidate wrote `told` for
    # both and flattened exactly the distinction the sentence exists to pose.
    (21, "arrow C — `bade` -> `told` beside Butler's own `had told her`",
     "she told me to leave, of her own free will",
     "she ordered me to leave, of her own free will"),

    # ---- M-9 — the byte-identity repair was a disimprovement made to clear a
    # gate: `bring you on to my house` reads as `onto` at first pass, and `at
    # once` stands between the goal and `along with the maids`. Taken on its
    # merits, not to clear anything: the gate now has a declared-instance
    # escape (`DECLARED[...]['byte_identical']`), so this paragraph could have
    # been declared. It is repaired because the repair is better English than
    # both Butler and the candidate, which is what should have been reached for.
    (23, "M-9 — rendered properly rather than cosmetically",
     "not to bring you on to my house at once along with the maids",
     "not to bring you straight to my house along with the maids"),

    # ---- O-2 again.
    (25, "O-2 — the serial comma, restored where Butler had it",
     "by Father Zeus, Athena and Apollo", "by Father Zeus, Athena, and Apollo"),
    # ---- M-6 — an added semicolon before `but`, which also divides a 43-word
    # sentence.
    (25, "M-6 — an added semicolon before `but` becomes a period",
     "I will give you a house and an estate; but no one",
     "I will give you a house and an estate. But no one"),
    # ---- O-5 — the residual garden path after a good division: subject and
    # verb held apart by thirteen words, in the very sentence the drafter
    # divided and cites as the model. The when-clause goes to the front.
    (25, "O-5 — the garden path the division left behind",
     "Those of my people who saw it, when they took yellow-haired Rhadamanthus "
     "to see Tityus the son of Gaia, tell me it is the furthest of any place.",
     "When my people took yellow-haired Rhadamanthus to see Tityus the son of "
     "Gaia, those of them who saw it told me it is the furthest place of any."),
    (25, "D9/D16 — `afterwards`, the one -wards form this Book left",
     "and came back again afterwards.", "and came back again afterward."),

    # ---- M-6 — the worst of the six additions: a semicolon after a closing
    # quotation mark before `and`, which is neither Butler's pointing nor
    # modern English's.
    (27, "M-6 — `ready”; and he was glad` becomes a period and a sentence",
     "for your bed is ready”; and he was glad indeed to go to his rest.",
     "for your bed is ready.” He was glad indeed to go to his rest."),
]
CORRECTIONS = [c for c in CORRECTIONS if c[2] is not None]

# ------------------------------------------------------- the flow read, step 7
# One change, and it is a defect **this round's own correction created** —
# which is the argument for doing the continuous read after the corrections and
# not before.
#
# M-2 asks for `abode` -> `home` at B07-P020 on the ground that it "frees
# `house` for Butler's own". Applied literally it reads *"they went home to
# bed, every man to his own home"* — and Butler's clause is *"they went home to
# bed every man in his own abode"*, so he used the adverb `home` and the noun
# `abode` five words apart and the repair collapses them. **That is M-2's own
# defect, made by M-2's own repair**, and arrow C sees it: Butler's `home` is
# kept in the paragraph.
#
# Note that v1's `house` was not wrong for the reason M-2 gives — Butler writes
# no `house` anywhere in this paragraph — but it is the second rendering of
# `abode` as `house` in the Book, which is the consistency complaint. The
# rendering that satisfies both is neither of the two on offer.
FLOW = [
    (19, "flow read — the M-2 repair collapsed Butler's own `home` and "
         "`abode`, five words apart in one clause",
     "they went home to bed, every man to his own home",
     "they went away to bed, every man to his own home"),
]
CORRECTIONS += FLOW

# --------------------------------------------------------- declined, with why
# Asserted STILL PRESENT in the built file, so a decline cannot be a silent
# application (**D11**).
DECLINED = [
    ("O-4", 4, "the high walls of the city",
     "`lofty` -> `high` at P005 beside Butler's own `the sea was so terribly "
     "high` at P022. The two senses are far apart — a wall's height and a "
     "sea's — `high walls` is the natural modern phrase, and the alternatives "
     "(`towering`, `lofty` kept) are either a register this edition does not "
     "use or the archaism the Book exists to remove. The findings file itself "
     "files this one *for the record* rather than for repair. Recorded in "
     "`collisions.md` as `kept`."),
    ("O-7", 17, "if any solitary traveler happens to stumble",
     "**The proposed repair does not repair anything.** O-7 offers `lone "
     "traveler` to keep Butler's solitary sense without merging `wayfarer` "
     "onto his `traveller` at B03-P011 and B04-P027 — but the candidate "
     "already writes `solitary traveler`, which is the same repair in a "
     "different word. The merge is untouched by either, because `traveler` is "
     "the only plain modern equivalent of `wayfarer`. Reclassified in "
     "`collisions.md` from `repair` to `unavoidable-merge`."),
    ("M-7 (the fourth period)", 9, "the palace of King Alcinous; so they were",
     "**The findings file's prose and its own table disagree, and the table "
     "governs.** M-7's heading and §5.4 both say *four* of Butler's eight "
     "survivors should be periods; M-7's table rules exactly **three** as "
     "`period` (P007, P010's 49-word sentence, P015) and **five** as `keep` "
     "— P010's 30-word result clause *borderline; keep*, P011's two "
     "vineyard marks, P021's `; indeed`, P026's `; it is always better`. Three "
     "and five is eight, which is the count S-1 establishes. Three periods are "
     "taken. This one is the `borderline; keep`."),
]

# ------------------------------------------------------ settled as a decision
# The vineyard semicolons, upheld by §5.4 and recorded as a DECISION rather
# than counted as kept marks. Asserted below.
VINEYARD = ("the grapes are being made into raisins; in another part they are "
            "being gathered; some are being trodden in the wine tubs; others "
            "further on have shed their blossom and are beginning to show "
            "fruit; others again are just changing color.")


def fail(msg):
    sys.exit("build_book07_v2.py: " + msg)


def dump_json(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def main():
    v1p = BOOK / "candidate-v1.json"
    if sha256_bytes(v1p.read_bytes()) != V1_SHA:
        fail("candidate-v1.json is not the frozen file (D10)")
    v1 = json.loads(v1p.read_text(encoding="utf-8"))
    src = json.loads((BOOK / "source-book7.json").read_text(encoding="utf-8"))
    paras = list(v1["paragraphs"])
    if len(paras) != N or len(src["paragraphs"]) != N:
        fail("paragraph count moved")

    for idx, finding, old, new in CORRECTIONS:
        if paras[idx].count(old) != 1:
            fail("%s: %r occurs %d times in B07-P%03d, not once"
                 % (finding, old, paras[idx].count(old), idx + 1))
        paras[idx] = paras[idx].replace(old, new, 1)
        if new not in paras[idx]:
            fail("%s: the replacement did not land in B07-P%03d"
                 % (finding, idx + 1))

    joined = "\n".join(paras)
    src_flat = [" ".join(p.split()) for p in src["paragraphs"]]

    # ---- every decline is asserted STILL PRESENT (D11) ---------------------
    for finding, idx, frag, _why in DECLINED:
        if frag not in paras[idx]:
            fail("%s is declined and must therefore be unchanged, but %r is "
                 "gone from B07-P%03d" % (finding, frag, idx + 1))

    # ---- S-1: the semicolon arithmetic, asserted rather than described -----
    kept, added = kept_added(src_flat, paras)
    if added != 2:
        fail("S-1: exactly two added semicolons may survive — the two "
             "vineyard marks upheld at §5.4 — and %d do" % added)
    if kept != 5:
        fail("S-1: five of Butler's semicolons should survive (8 kept minus "
             "the three M-7 periods), and %d do" % kept)
    if VINEYARD not in paras[10]:
        fail("§5.4: the vineyard list's four marks are UPHELD as a "
             "decision and must stand exactly")
    if paras[10].count(";") != 4:
        fail("§5.4: B07-P011 must carry exactly four semicolons")
    # M-6: none of the three condemned additions survives.
    for frag in ("homeward journey;", "an estate;", "ready”;"):
        if frag in joined:
            fail("M-6: an added semicolon before a coordinating conjunction "
                 "survives: %r" % frag)
    # M-7: none of the three condemned survivors does either.
    for frag in ("without a son;", "at all seasons;", "his protection;"):
        if frag in joined:
            fail("M-7: a semicolon holding a 43-to-50-word sentence survives: "
                 "%r" % frag)
    # M-8: Butler's seam is a period, not a comma.
    if "ask him questions." not in paras[3]:
        fail("M-8: Butler's seam at P004 must be a period")

    # ---- the collisions this round closes (book07/collisions.md) ----------
    if re.search(r"\bwalls\b", paras[11]):
        fail("M-1: `walls` must not stand at P012")
    for i in (4, 8):
        if not re.search(r"\bwalls\b", paras[i]):
            fail("M-1: Butler's own `walls` at P%03d must stand" % (i + 1))
    if re.search(r"\babode\b", joined):
        fail("M-2: no `abode` may survive")
    if "the home of Erechtheus" not in paras[8] or \
            "the house of Alcinous" not in paras[8]:
        fail("M-2: P009 must keep Butler's `abode`/`house` discrimination")
    if "his own home" not in paras[19]:
        fail("M-2: P020's `abode` must be `home`")
    if "chief men" in joined:
        fail("M-10: `chief men` survives")
    if paras[9].count("chief people") != 1 or paras[11].count("chief people") != 1:
        fail("M-10: both `chief people` must stand")
    if "had fashioned specially" not in paras[9] or \
            "the women of the house had made" not in paras[9]:
        fail("arrow C: P010 must keep `fashioned` and `made` apart")
    if "never rot or fail" not in paras[10]:
        fail("arrow C: P011's doubled `never` survives")
    if "Have your servants mix" not in paras[14] or \
            "Tell him, then, to rise" not in paras[14]:
        fail("arrow C: P015 must keep `bid` and `tell` apart")
    # The rendering had to avoid THREE of Butler's own words in this one
    # paragraph, which is why the obvious choices are all wrong: `told` is his
    # (`Jove had told her she must`, eight words on), `sent` is his twice (`She
    # sent me from her island`, `sent me a wind`), and `let me go` is his
    # (`Poseidon would let me go no further`). Arrow C found the first two in
    # turn — the second was a defect THIS build introduced and the check caught
    # before it was frozen, which is what running a check during drafting
    # rather than after is for. `ordered` collides with nothing in the
    # paragraph, and the tension a reader feels between an order and `of her
    # own free will` is Butler's own point: the order came from her will and
    # not from Zeus.
    if "she ordered me to leave" not in paras[21] or \
            "because Zeus had told her she must" not in paras[21]:
        fail("arrow C: P022 must keep Calypso's bidding and Zeus's telling "
             "apart — the distinction the sentence exists to pose")
    if "have my supper" not in paras[18] or "I shall eat and drink" not in paras[18]:
        fail("M-5: P019 must keep `sup` and Butler's `eat` apart")
    if "very demanding thing" not in paras[18] or "it insists" not in paras[18]:
        fail("M-5: P019 must keep `importunate` and `insists` apart")
    if re.search(r"\bcouncillors?\b", joined) or "councilors" not in joined:
        fail("A6: `councillors` must be `councilors` (D9)")

    # ---- M-3 and O-2: the marks, which no measure in the package reads ----
    if "was wearing, as the work of herself" not in paras[19]:
        fail("M-3: Butler's comma before `as the work of herself` is missing")
    for idx, frag in ((19, "the shirt, cloak, and good clothes"),
                      (25, "Father Zeus, Athena, and Apollo"),
                      (4, "their places of assembly, and the high walls"),
                      (10, "pears, pomegranates, and the most delicious apples")):
        if frag not in paras[idx]:
            fail("O-2: the serial comma is missing at B07-P%03d: %r"
                 % (idx + 1, frag))

    # ---- M-4: no word added or lost, and the displaced run untouched ------
    if len(paras[12].split()) != len(v1["paragraphs"][12].split()):
        fail("M-4: the clause swap must add and lose no word (%d -> %d)"
             % (len(v1["paragraphs"][12].split()), len(paras[12].split())))

    # ---- §5.5's recorded caveat, now an assertion --------------------
    # The present-tense block at P010-P011 is upheld, and the reading depends on
    # `Such, then, were` closing it. If any later pass shortens or divides that
    # sentence the tense block loses its right-hand boundary.
    if not paras[10].rstrip().endswith(
            "Such, then, were the splendors with which the gods had endowed "
            "the house of King Alcinous."):
        fail("§5.5: the present-tense block's closing sentence must stand "
             "whole and last")
    if "There are fifty maidservants in the house" not in paras[9]:
        fail("§5.5: the present-tense block's opening must stand")

    # ---- D9/D16: one class, one disposition -------------------------------
    for bad in ("towards", "backwards", "forwards", "afterwards"):
        if re.search(r"\b" + bad + r"\b", joined):
            fail("D9/D16: the -wards form %r survives" % bad)

    # ---- the standing assertions of the Book, unmoved ----------------------
    n = lambda w, ps=None: sum(len(re.findall(r"\b" + w + r"\b", p))
                               for p in (ps or paras))
    for greek, roman in (("Odysseus", "Ulysses"), ("Athena", "Minerva"),
                         ("Zeus", "Jove"), ("Poseidon", "Neptune"),
                         ("Hephaestus", "Vulcan")):
        if n(greek) != n(roman, src_flat):
            fail("name census moved: %s %d against Butler's %s %d"
                 % (greek, n(greek), roman, n(roman, src_flat)))
    for roman in ("Ulysses", "Minerva", "Jove", "Neptune", "Mercury", "Saturn",
                  "Diana", "Euryclea", "Venus", "Juno", "Vulcan", "Ceres"):
        if n(roman):
            fail("Roman form survives: %s" % roman)
    if n("Rhea") or n("Helios"):
        fail("hazard 1: a general Roman→Greek list was applied")
    if "'" in joined or '"' in joined:
        fail("D9: an ASCII quote survives")
    if "[" in joined or "]" in joined:
        fail("D12: a bracket mark survives")
    # D4 — Butler's two unclosed quotations, reproduced exactly.
    unbal = [i + 1 for i, p in enumerate(paras)
             if p.count("“") != p.count("”")]
    if unbal != [6, 7, 21, 22]:
        fail("D4: the unbalanced paragraphs must be Butler's own four: %s"
             % unbal)
    for mark in ("“", "”"):
        if sum(p.count(mark) for p in paras) != \
                sum(p.count(mark) for p in src_flat):
            fail("D4: %s totals moved" % mark)
    if any("\n" in p or "  " in p or p != p.strip() for p in paras):
        fail("whitespace defect in a candidate paragraph")

    # ---- write -------------------------------------------------------------
    doc = {"number": v1["number"], "title": v1["title"], "paragraphs": paras}
    out = BOOK / "candidate-v2.json"
    out.write_text(dump_json(doc), encoding="utf-8")

    lines = ["# " + doc["title"] + " — modern-English candidate v2 "
             "(readable)", "",
             "Generated by `scripts/build_book07_v2.py` from the frozen",
             "`candidate-v1.json`. Paragraph IDs are outside the prose; the",
             "text itself is byte-identical to `candidate-v2.json`.", ""]
    for i, p in enumerate(paras):
        lines += ["**B07-P%03d**" % (i + 1), "", p, ""]
    (BOOK / "candidate-v2-readable.md").write_text("\n".join(lines),
                                                   encoding="utf-8")

    if "went away to bed, every man to his own home" not in paras[19]:
        fail("flow read: the P020 repair did not land")

    diffs = [i for i in range(N) if v1["paragraphs"][i] != paras[i]]
    k2, a2 = kept_added(src_flat, paras)
    k1, a1 = kept_added(src_flat, v1["paragraphs"])
    nb1 = norm_rate_butler(src_flat, v1["paragraphs"])
    nb2 = norm_rate_butler(src_flat, paras)
    nr1 = norm_rate(src_flat, v1["paragraphs"])
    nr2 = norm_rate(src_flat, paras)

    (BOOK / "changes-v1-to-v2.md").write_text("\n".join(
        ["# Book 7 — every change from `candidate-v1.json` to "
         "`candidate-v2.json`", "",
         "Written by `../scripts/build_book07_v2.py`, which is the only thing",
         "that produced them: `candidate-v1.json` is frozen and was not edited",
         "(**D10**). Each row is one substitution, in the order the build",
         "applies them, with the finding it answers. Every `old` string is",
         "asserted to occur exactly once in its paragraph, and every `new`",
         "string is asserted to have landed.", "",
         "**%d substitutions in %d of the 29 paragraphs.**"
         % (len(CORRECTIONS), len(diffs)), "",
         "| # | paragraph | finding | from | to |", "|---|---|---|---|---|"] +
        ["| %d | B07-P%03d | %s | `%s` | `%s` |"
         % (k + 1, idx + 1, f, o, nw)
         for k, (idx, f, o, nw) in enumerate(CORRECTIONS)] +
        ["", "The last row is **the flow read (step 7)**, and it is a defect "
         "this round's own",
         "correction created: M-2's literal repair gives *\u201cthey went home "
         "to bed, every man",
         "to his own home\u201d*, and Butler's clause is *\u201cthey went home "
         "to bed every man in his",
         "own abode\u201d* \u2014 the adverb and the noun five words apart, "
         "collapsed by the repair",
         "meant to stop exactly that. Arrow C sees it. The rendering that "
         "satisfies both",
         "M-2 and Butler's own clause is neither of the two on offer.", "",
         "## The semicolons — substantive finding S-1, answered", "",
         "| | v1 | v2 |", "|---|---|---|",
         "| semicolons, Butler → candidate | %d → %d | %d → %d |"
         % (sum(p.count(";") for p in src_flat), k1 + a1,
            sum(p.count(";") for p in src_flat), k2 + a2),
         "| of Butler's own, kept | %d | %d |" % (k1, k2),
         "| the draft's own, added | **%d** | **%d** |" % (a1, a2),
         "| NORM RATE as published | %+.1f%% | %+.1f%% |" % (nr1[5], nr2[5]),
         "| **NORM RATE on Butler's own pointing** | **%+.1f%%** | **%+.1f%%** |"
         % (nb1[2], nb2[2]), "",
         "The two additions that survive are the **vineyard list at "
         "B07-P011**, upheld",
         "at findings-v1 §5.4 and recorded here as a DECISION rather than "
         "counted as",
         "kept marks: the five stages are grammatically parallel clauses of one",
         "survey of one vineyard, serial semicolons between parallel clauses "
         "are",
         "correct modern usage, and **Butler pointed the same five-item list "
         "two ways**",
         "(`;` twice, then `,` twice) for no reason the text supplies. It is "
         "the one",
         "place in the Book where an added semicolon is an editorial "
         "improvement.", "",
         "## Findings not applied, and why", "",
         "Each is asserted **still present** in the built file, so a decline",
         "cannot be a silent application (**D11**).", "",
         "| finding | paragraph | reason |", "|---|---|---|"] +
        ["| %s | B07-P%03d | %s |" % (f, idx + 1, why)
         for f, idx, frag, why in DECLINED] +
        ["", "## Paragraphs differing v1 → v2", "",
         ", ".join("B07-P%03d" % (i + 1) for i in diffs), ""]),
        encoding="utf-8")

    print("OK — candidate-v2.json written")
    print("  substitutions              %d in %d paragraphs; %d declined and "
          "asserted unchanged" % (len(CORRECTIONS), len(diffs), len(DECLINED)))
    print("  semicolons  v1 %d kept + %d added   →   v2 %d kept + %d added"
          % (k1, a1, k2, a2))
    print("  NORM RATE published        %+.1f%% → %+.1f%%" % (nr1[5], nr2[5]))
    print("  NORM RATE Butler's own     %+.1f%% → %+.1f%%" % (nb1[2], nb2[2]))
    print("  candidate-v2.json sha256   %s" % sha256_bytes(out.read_bytes()))
    print()

    # ---- S-2: the checks RUN, and the manifest moves with them ------------
    # The manifest's `checks` block pinned v1. A v2 that left it there would be
    # the exact decay S-2 is about — a manifest asserting figures for a file
    # that is no longer the Book's candidate — so the block is rewritten here,
    # through `checks.manifest_checks_block()`, which is the package's only
    # writer and REFUSES unless the gates both evaluated and passed.
    figs, gate = checks.run_book(7, version=2)
    if gate.failures:
        fail("%d gate(s) failed — see book07/checks-v2.md" % len(gate.failures))
    block = checks.manifest_checks_block(figs, gate)
    mp = BOOK / "manifest.json"
    m = json.loads(mp.read_text(encoding="utf-8"))
    m["checks"] = block
    mp.write_text(dump_json(m), encoding="utf-8")
    bad = checks.verify_manifest(7, figs, gate)
    if bad:
        fail("the manifest just written does not verify:\n  "
             + "\n  ".join(bad))
    print("\nbook07/manifest.json: checks block now names %s"
          % block["candidate_file"])


if __name__ == "__main__":
    main()

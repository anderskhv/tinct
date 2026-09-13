#!/usr/bin/env python3
"""Book 8 step 6 — apply round 1's corrections and build `candidate-v2.json`.

`book08/review/findings-v1.md`, verdict **accept after corrections**: 3
substantive, 8 minor, 7 optional, 5 records. Every finding is answered either
way (**D11**); the declined ones are asserted **still present** in the built
file, so a decline cannot be a silent application.

`candidate-v1.json` is frozen and is not edited (**D10**): this script is the
only thing that produces v2, every `old` string is asserted to occur exactly
once in its paragraph, and every `new` string is asserted to have landed.

**The headline is a category decision that was made once.** Substantive finding
**S-2**: Book 8 converted **all 42** of Butler's semicolons and kept none, and
zero survivors is the shape of a decision taken for a whole class rather than
one mark at a time. 35 are correctly cashed. **Six should have survived** —
B08-P009 [10] (the specification of Euryalus's build), B08-P034 [26] (the
*therefore* of the arithmetic), B08-P039 [30] (the reason for an order),
B08-P043 [34] (protasis and apodosis of one wish, the only outright
grammatical loss), and B08-P046 [37] and [38] (the Trojans' three counsels;
the enumerative semicolon is the one use of the mark modern English has not
replaced). **[35] at P044 is a seventh**, ruled at M-2 because the period
builds a fourteen-word garden path on concessive `For all the pain…`; it is
restored rather than rewritten, because Butler's own mark is the repair.

**And the worst break in the Book is not one of the 42.** At **B08-P047** the
em dash that closes Butler's weeping-woman simile was cashed for a period,
severing the 48-word protasis *"He wept as a woman weeps when…"* from its
apodosis *"even so piteously did Odysseus weep"*, so `Even so` reads first as
*nevertheless*. Nothing in the package could see it: it is not a semicolon, it
moves no clause, it lengthens nothing. It is the argument for **D27**.

**Three words were supplied to Butler's text and none was recorded** (M-3).
D16 governs marks only. One of the three, `hardly` at B08-P042, **inverts the
sense** — Butler says Odysseus *had finished* the knot before he was called —
and it is removed here; the other two are emendations from Butler's own
parallels and are recorded under D16's new clause (b).
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import checks                                                   # noqa: E402
from checks import (kept_added, kept_added_div, norm_rate,       # noqa: E402
                    norm_rate_butler, norm_rate_butler_ext,
                    norm_rate_ext, dividing_marks)

BOOK = ROOT / "book08"
V1_SHA = "e758790c58e0ace5c97159b2fa4e6d0f987f0b0edeba9120542ed772ec6ce012"
N = 50

# ---------------------------------------------------------------- corrections
# (0-based paragraph index, finding id, old, new). Applied in list order.
CORRECTIONS = [
    # ---- M-4 — arrow C's repair was diagnosed right and executed wrong.
    # `minstrelsy` and Butler's own `music` had both been rendered `music`, so
    # `music` was reserved for P017 and P007 took `the playing that goes with
    # it`. Demodocus SINGS: the paragraph is about a bard whose singing makes
    # Odysseus weep, and its own next clause reads `they delighted in his
    # singing`. `Playing` names what a lyre does, and `minstrelsy` is the
    # superordinate of Butler's `lays`, so the repair inverted the relation.
    # `song` is exact and collides with nothing in the paragraph.
    (6, "M-4 — `the playing that goes with it` misdescribes a bard who sings",
     "the playing that goes with it", "the song that goes with it"),

    # ---- S-2 [10] — the strongest single case in the Book. The second clause
    # is the EVIDENCE for the first, not a further observation; three flat
    # sentences read as a staccato inventory where Butler has one gathering
    # appraisal.
    (8, "S-2 [10] — Butler's specifying semicolon restored at P009",
     "He seems very powerfully built. His thighs, calves, hands, and neck",
     "He seems very powerfully built; his thighs, calves, hands, and neck"),
    # ---- O-7 — `havoc with` is the living idiom (*play havoc with*); `havoc
    # of` is the older one, so the change ran against the edition's own
    # direction. Butler's word comes back.
    (8, "O-7 — `making havoc of a man` -> Butler's living `havoc with`",
     "making havoc of a man", "making havoc with a man"),

    # ---- O-4 — Butler's `so` is consequential: Ares defiles the bed, SO the
    # sun tells. `and` makes it a coincidence, and the causal chain
    # (defilement -> telling -> the smithy -> the snare) is the paragraph's
    # armature.
    (18, "O-4 — `and the sun … told` -> Butler's consequential `so`",
     "marriage bed, and the sun, who saw what they were about",
     "marriage bed, so the sun, who saw what they were about"),

    # ---- O-3 — Butler's colon, doing explanatory work (*here is why*), was
    # the ONE of his six this Book cashed: two dispositions for one mark and no
    # rule, which is the state D16 was written about. `PUNCTUATION.md` §6 now
    # carries the rule — *Butler's colons are kept unless the clause after them
    # is a new sentence's subject* — and under it this colon is kept.
    (19, "O-3 — Butler's explanatory colon at P020, restored under the new "
         "§6 rule",
     "the couch of Hephaestus. He is not at home",
     "the couch of Hephaestus: he is not at home"),

    # ---- O-6 — `vestibule` is current English and needed no change;
    # `entrance` is vaguer, and the noun is architecturally specific
    # (Hephaestus stands in the porch before the door and shouts inward). No
    # collision forces it; `collisions.md` has no row for it.
    (20, "O-6 — `entrance` is a loss with no gain; `vestibule` is current "
         "English",
     "stood in the entrance making", "stood in the vestibule making"),

    # ---- S-2 [26] — the arithmetic and the instruction it licenses. The
    # number is stated IN ORDER TO issue the order, and the semicolon is the
    # *therefore*; a period strands the number.
    (33, "S-2 [26] — the *therefore* of `counting myself there are thirteen`",
     "there are thirteen. Contribute, each of you",
     "there are thirteen; contribute, each of you"),

    # ---- S-2 [30] — reason for the order just given. A period turns a reason
    # into an announcement.
    (38, "S-2 [30] — `heat some water; our guest will take a warm bath`",
     "heat some water. Our guest will take a warm bath.",
     "heat some water; our guest will take a warm bath."),
    # ---- M-7 — the second garden path, made by the recast rather than by the
    # mark: moving `all the more` to the end of the clause puts it immediately
    # after `the singing that will follow`, where `follow all the more` reads
    # as a unit before the reader reverses it onto `enjoy`.
    (38, "M-7 — `follow all the more` read as a unit before reversing onto "
         "`enjoy`",
     "He will then enjoy both his supper and the singing that will follow all "
     "the more.",
     "He will then enjoy his supper, and the singing that follows, all the "
     "more."),

    # ---- M-3 — the supplied word that INVERTS THE SENSE. Butler: *"He had
    # done so before an upper servant told him to come to the bath"* — he had
    # FINISHED the knot before he was called. `hardly … before` says he had
    # barely finished. Butler's reading is idiomatic English and needs no help.
    (41, "M-3 — `hardly` supplied to Butler's text, inverting the sense",
     "He had hardly done so before", "He had done so before"),

    # ---- S-2 [34] — protasis and apodosis of one wish. *"So shall I…"* is
    # grammatically dependent: it is the *then* of an *if*. A period severs a
    # conditional, and this is the only one of the 42 whose loss is grammatical
    # rather than rhetorical.
    (42, "S-2 [34] — a period severing a conditional at P043",
     "reach my home. So shall I bless you",
     "reach my home; so shall I bless you"),

    # ---- M-2 [35] — the fourteen-word garden path. `for all` here is
    # CONCESSIVE (*despite*); Butler's semicolon keeps it inside the flow,
    # where the preceding clause forces that reading. At the head of a new
    # sentence `For` is first read as the causal conjunction this Book itself
    # uses four times elsewhere, and the reader must reverse at `I will salute
    # him none the less`. The review offers either the semicolon or writing the
    # concession out; the semicolon is Butler's own and is taken.
    (43, "M-2 [35] — the concessive `For all the pain…` garden path",
     "tell him to eat it. For all the pain his singing may cause me, I will "
     "salute him none the less.",
     "tell him to eat it; for all the pain his singing may cause me, I will "
     "salute him none the less."),

    # ---- S-2 [37] and [38] — the Trojans' three counsels, in one council.
    # The enumerative semicolon is the one use of the mark that no modern style
    # guide has replaced, and three parallel counsels inside one deliberation
    # is the textbook instance. Three sentences turn a debate into a list of
    # reports.
    (45, "S-2 [37] — the first seam of the three counsels",
     "then and there. Others would have it dragged",
     "then and there; others would have it dragged"),
    (45, "S-2 [38] — the third counsel, with Butler's `while` restored",
     "thrown down the precipice. Others again were for letting",
     "thrown down the precipice; while others again were for letting"),

    # ---- S-2 / M-1 — THE WORST BREAK IN THE BOOK, and it is not one of the
    # 42. Butler's em dash is the hinge of a Homeric simile: *"He wept AS a
    # woman weeps when…"* is a protasis running 48 words and *"EVEN SO
    # piteously did Odysseus weep"* is its apodosis. The dash holds the two in
    # one sentence, which is what makes the correlative pair readable across
    # that distance. A period cuts the correlative and `Even so` at the head of
    # a new sentence reads first as *nevertheless* — the wrong first reading,
    # since the sentence is not concessive.
    (46, "S-2 / M-1 — the simile's dash, and the wrong first reading it cost",
     "the beauty fades from her cheeks. Even so piteously",
     "the beauty fades from her cheeks—even so piteously"),
]

# ------------------------------------------------------- the flow read, step 7
# One change, and the corrections are what made it visible: with the semicolon
# restored two clauses earlier, B08-P039 now reads *"…heat some water; our
# guest will take a warm bath. **See too to** the careful packing…"*, and `too
# to` is a stutter a reader trips on. It is not this round's defect — v1 has it
# — but it is the kind only a continuous read finds, which is why step 7 is
# after step 6 and not before.
#
# Butler wrote *"Also, set a copper on the fire… see **also** to the careful
# packing"*, doubling `also` himself; the draft changed the second to `too` to
# avoid the doubling and bought a worse adjacency. Neither of Butler's two
# words is the answer: the clause is a third imperative in a list of
# imperatives and wants the plain connective.
FLOW = [
    (38, "flow read — `See too to` is a stutter; Butler's own `also` is "
         "doubled twelve words earlier",
     "See too to the careful packing", "And see to the careful packing"),
]
CORRECTIONS += FLOW

# --------------------------------------------------------- declined, with why
# Asserted STILL PRESENT in the built file, so a decline cannot be a silent
# application (**D11**).
DECLINED = [
    ("O-2 — `guardian angel`", 42, "as my guardian angel all my days",
     "**Kept, on the review's own ruling and for its reasons.** The package's "
     "rule is that Butler's images are kept and nothing is added, and this is "
     "Butler's image; removing it substitutes the reviewer's Homer for "
     "Butler's. The clause already ends *“for it was you who saved "
     "me”*, so `my deliverer` and `the one who saved me` are tautologies "
     "in place, and what `guardian angel` supplies that neither does is the "
     "CONTINUING relation, which is the point of `all my days`. In current "
     "English it is a dead metaphor for a protector. **The flag is made "
     "permanent rather than raised**: `butlerism` is now a named class in "
     "`continuity.md` §6, and this Book has five."),
    ("O-5 — `an offering to appease the gods`", 45,
     "as an offering to appease the gods",
     "**Kept, and recorded, which is what O-5 asks for.** Butler's *“an "
     "offering and propitiation for the gods”* is a hendiadys and the "
     "merge loses the second noun's force. But *propitiate* is not current "
     "English in the way *appease* is, `to appease the gods` carries exactly "
     "the sense the Trojans' third counsel needs — buying off divine "
     "anger — and the review rules either acceptable and asks only that "
     "the choice be written down. It is written down here."),
    ("§5.2 [41] — the optional seventh restoration", 48,
     "For the Phaeacians have no pilots. Their vessels have no rudders",
     "**Declined.** §5.2 upholds the draft on all seven of the "
     "defensible marks and adds that **if** the coordinator wants a seventh "
     "restoration it should be [41]. Six plus [35] is already 17% of the 42, "
     "against Book 7's 27% kept, and the case for [41] is that *“have no "
     "pilots”* is an odd claim the next clause makes intelligible — "
     "which is an argument for the two clauses being adjacent, not for their "
     "being one sentence. The period does not obscure it. Recorded so the "
     "record shows it was read, not skipped."),
    ("M-3 (ii) — the supplied `enough`", 44,
     "as soon as they had had enough to eat and drink",
     "**Kept, and now recorded under D16 clause (b).** A word is missing in "
     "PG and in Butler; the candidate supplies it from Butler's own parallel "
     "eleven paragraphs earlier — B08-P006 reads *“as soon as they "
     "had had enough to eat and drink”*, the identical formula. "
     "Emendation from the author's own repetition is the strongest kind."),
    ("M-3 (iii) — the supplied `There were`", 7,
     "There were Acroneos, Ocyalus, Elatreus",
     "**Kept, and now recorded under D16 clause (b).** Butler's sentence is a "
     "verbless fragment; the next sentence begins *“There was also "
     "Euryalus”*, so the supplied words are drawn from his own next "
     "clause."),
    ("O-1 — `Heracles`", 15, "such as Heracles, or Eurytus the Oechalian",
     "**Upheld, and D5 is widened rather than stretched.** The candidate's "
     "B08-P016 already reads `Ares`, `Aphrodite` and `Hephaestus` within a few "
     "hundred words, and the sentence itself continues *“…or Eurytus "
     "the Oechalian”* — a Greek name in the same list, in "
     "apposition. `Hercules` beside `Eurytus` is not a rule observed, it is a "
     "visible inconsistency. D5 now reads *any figure Butler names in a Roman "
     "form*, so Book 11 inherits a rule instead of re-arguing it for "
     "Persephone, Hades, Dionysus and Eos."),
]


def fail(msg):
    sys.exit("build_book08_v2.py: " + msg)


def dump_json(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def main():
    v1p = BOOK / "candidate-v1.json"
    if sha256_bytes(v1p.read_bytes()) != V1_SHA:
        fail("candidate-v1.json is not the frozen file (D10)")
    v1 = json.loads(v1p.read_text(encoding="utf-8"))
    src = json.loads((BOOK / "source-book8.json").read_text(encoding="utf-8"))
    paras = list(v1["paragraphs"])
    if len(paras) != N or len(src["paragraphs"]) != N:
        fail("paragraph count moved")

    for idx, finding, old, new in CORRECTIONS:
        if paras[idx].count(old) != 1:
            fail("%s: %r occurs %d times in B08-P%03d, not once"
                 % (finding, old, paras[idx].count(old), idx + 1))
        paras[idx] = paras[idx].replace(old, new, 1)
        if new not in paras[idx]:
            fail("%s: the replacement did not land in B08-P%03d"
                 % (finding, idx + 1))

    joined = "\n".join(paras)
    src_flat = [" ".join(p.split()) for p in src["paragraphs"]]

    # ---- every decline is asserted STILL PRESENT (D11) ---------------------
    for finding, idx, frag, _why in DECLINED:
        if frag not in paras[idx]:
            fail("%s is declined and must therefore be unchanged, but %r is "
                 "gone from B08-P%03d" % (finding, frag, idx + 1))

    # ---- S-2: the marks, asserted rather than described --------------------
    # Seven of Butler's semicolons, in six paragraphs, and no others. The
    # paragraph list is asserted as a SET so a semicolon appearing anywhere
    # else fails, which is the byte-identity gate's shape applied to a mark.
    want_semis = {9: 1, 34: 1, 39: 1, 43: 1, 44: 1, 46: 2}
    got_semis = {i + 1: p.count(";") for i, p in enumerate(paras)
                 if ";" in p}
    if got_semis != want_semis:
        fail("S-2: the restored semicolons must be exactly %s; the built file "
             "has %s" % (want_semis, got_semis))
    kept, added = kept_added(src_flat, paras)
    if added != 0:
        fail("S-1/D21: no semicolon may be the draft's own, and %d is/are"
             % added)
    if kept != 7:
        fail("S-2: seven of Butler's semicolons must survive and %d do" % kept)
    # The simile's dash, and it must be Butler's own, not an addition.
    if "her cheeks—even so piteously" not in paras[46]:
        fail("S-2/M-1: the weeping-woman simile's dash did not land at P047")
    # ---- O-3, and something the review's census could not see. The census
    # reads `: 6 -> 6` and calls the class untouched. It is not: the draft
    # **cashed Butler's colon at P020 and ADDED one at P008**, and a count
    # cannot tell a swap from a standstill. D27's provenance can, and does:
    # with P020 restored the Book carries **seven** colons, Butler's six all
    # kept and one of the draft's own.
    #
    # The added one is UPHELD as a decision, on Book 7 §5.4's precedent for
    # the vineyard semicolons. Butler writes *"Three sons of Alcinous,
    # Laodamas, Halios, and Clytoneus, competed also"* — a four-comma
    # appositive that a modern reader parses twice. The draft recasts it to
    # *"Three sons of Alcinous competed as well: Laodamas, Halios, and
    # Clytoneus"*, where the colon introduces a list, which is the one job
    # modern English keeps the mark for. It adds **no sentence boundary**, and
    # under D27 + D21 it is worth nothing in the compared figure, which is the
    # measure working.
    colons = checks._provenance(src_flat, paras, (":",))
    ckept = [r for r in colons if r[2] == ":"]
    cadded = [r for r in colons if r[2] != ":"]
    if len(ckept) != 6:
        fail("O-3: all six of Butler's colons must be KEPT; %d are"
             % len(ckept))
    if [r[0] for r in cadded] != [8]:
        fail("O-3: the draft's one added colon must be the P008 list colon, "
             "upheld as a decision; got %s" % [r[0] for r in cadded])
    if "the couch of Hephaestus: he is not at home" not in paras[19]:
        fail("O-3: P020's explanatory colon did not land")
    # M-3: the supplied word that inverted the sense is gone, and only it.
    if "hardly" in joined:
        fail("M-3: `hardly` survives")
    # M-4: `song`, not `playing`, and Butler's own `music` still reserved.
    if "the song that goes with it" not in paras[6]:
        fail("M-4: P007's repair did not land")
    if re.search(r"\bplaying\b", paras[6]):
        fail("M-4: `playing` survives at P007")
    if not re.search(r"\bmusic\b", paras[16]):
        fail("M-4: Butler's own `music` at P017 must still stand, which is "
             "what arrow C's repair was for")
    if paras[6].count("singing") < 1:
        fail("M-4: P007 must keep `singing` for Butler's `lays`")
    # O-7, O-6, O-4.
    if "making havoc with a man" not in paras[8]:
        fail("O-7 did not land")
    if "And see to the careful packing" not in paras[38]:
        fail("flow read: the P039 repair did not land")
    if "too to" in joined:
        fail("flow read: a `too to` adjacency survives")
    if "in the vestibule" not in paras[20]:
        fail("O-6 did not land")
    if "marriage bed, so the sun" not in paras[18]:
        fail("O-4 did not land")
    # B08-P033 is DECLARED byte-identical and must stay so (M-9's disposition).
    if paras[32] != " ".join(src["paragraphs"][32].split()):
        fail("B08-P033 is declared byte-identical and is no longer so")
    same = [i + 1 for i, (a, b) in enumerate(zip(src_flat, paras)) if a == b]
    if same != [33]:
        fail("byte-identical paragraphs must be exactly [33]; got %s" % same)
    # D9/D12 hygiene, as every build asserts.
    if "'" in joined or '"' in joined:
        fail("D9: an ASCII quote or apostrophe survives")
    if "[" in joined or "]" in joined:
        fail("D12: a square-bracket mark survives")

    # ---- write -------------------------------------------------------------
    doc = {"number": v1["number"], "title": v1["title"], "paragraphs": paras}
    out = BOOK / "candidate-v2.json"
    out.write_text(dump_json(doc), encoding="utf-8")

    lines = ["# " + doc["title"] + " — modern-English candidate v2 "
             "(readable)", "",
             "Generated by `scripts/build_book08_v2.py` from the frozen",
             "`candidate-v1.json`. Paragraph IDs are outside the prose; the",
             "text itself is byte-identical to `candidate-v2.json`.", ""]
    for i, p in enumerate(paras):
        lines += ["**B08-P%03d**" % (i + 1), "", p, ""]
    (BOOK / "candidate-v2-readable.md").write_text("\n".join(lines),
                                                   encoding="utf-8")

    diffs = [i for i in range(N) if v1["paragraphs"][i] != paras[i]]
    k1, a1 = kept_added(src_flat, v1["paragraphs"])
    k2, a2 = kept_added(src_flat, paras)
    d1, d2 = kept_added_div(src_flat, v1["paragraphs"]), \
        kept_added_div(src_flat, paras)
    nr1, nr2 = norm_rate(src_flat, v1["paragraphs"]), norm_rate(src_flat, paras)
    nb1 = norm_rate_butler(src_flat, v1["paragraphs"])
    nb2 = norm_rate_butler(src_flat, paras)
    ne1 = norm_rate_ext(src_flat, v1["paragraphs"])
    ne2 = norm_rate_ext(src_flat, paras)
    nbe1 = norm_rate_butler_ext(src_flat, v1["paragraphs"])
    nbe2 = norm_rate_butler_ext(src_flat, paras)

    (BOOK / "changes-v1-to-v2.md").write_text("\n".join(
        ["# Book 8 — every change from `candidate-v1.json` to "
         "`candidate-v2.json`", "",
         "Written by `../scripts/build_book08_v2.py`, which is the only thing",
         "that produced them: `candidate-v1.json` is frozen and was not edited",
         "(**D10**). Each row is one substitution, in the order the build",
         "applies them, with the finding it answers. Every `old` string is",
         "asserted to occur exactly once in its paragraph, and every `new`",
         "string is asserted to have landed.", "",
         "**%d substitutions in %d of the 50 paragraphs.**"
         % (len(CORRECTIONS), len(diffs)), "",
         "| # | paragraph | finding | from | to |", "|---|---|---|---|---|"] +
        ["| %d | B08-P%03d | %s | `%s` | `%s` |"
         % (k + 1, idx + 1, f, o, nw)
         for k, (idx, f, o, nw) in enumerate(CORRECTIONS)] +
        ["", "## The marks — substantive findings S-1 and S-2, answered", "",
         "| | v1 | v2 |", "|---|---|---|",
         "| semicolons, Butler → candidate | %d → %d | %d → %d |"
         % (sum(p.count(";") for p in src_flat), k1 + a1,
            sum(p.count(";") for p in src_flat), k2 + a2),
         "| of Butler's own, kept | **%d** | **%d** |" % (k1, k2),
         "| the draft's own, added | %d | %d |" % (a1, a2),
         "| **dividing marks** (D27: `;` `:` internal `—`) | %d → %d | "
         "%d → %d |" % (dividing_marks(src_flat),
                        dividing_marks(v1["paragraphs"]),
                        dividing_marks(src_flat), dividing_marks(paras)),
         "| of which kept / added | %d + %d | %d + %d |" % (d1 + d2),
         "| NORM RATE as published (D20) | %+.1f%% | %+.1f%% |"
         % (nr1[5], nr2[5]),
         "| NORM RATE on Butler's pointing (D21) | %+.1f%% | %+.1f%% |"
         % (nb1[2], nb2[2]),
         "| NORM RATE, every dividing mark (D27) | %+.1f%% | %+.1f%% |"
         % (ne1[2], ne2[2]),
         "| **NORM RATE, D27 on Butler's pointing — the compared figure** | "
         "**%+.1f%%** | **%+.1f%%** |" % (nbe1[2], nbe2[2]), "",
         "**Zero survivors was the shape of a decision made once for a whole",
         "category.** Seven of Butler's semicolons now stand, in six",
         "paragraphs, and the build asserts the set exactly, so an eighth",
         "appearing anywhere fails the build. Six are S-2's; the seventh is",
         "[35] at P044, ruled at M-2. **And the eighth mark restored is not a",
         "semicolon at all** — the em dash at B08-P047 that closes the",
         "weeping-woman simile, which no measure in this package could see and",
         "which is the argument D27 was decided on.", "",
         "**The figure fell and that is the point.** The +27.1% raw rate was",
         "85%% cashed pointing; on the D27 basis v1 was **%+.1f%%** and v2 is"
         % nbe1[2],
         "**%+.1f%%**, and what is left is division of Butler's own prose."
         % nbe2[2], "",
         "## Findings not applied, and why", "",
         "Each is asserted **still present** in the built file, so a decline",
         "cannot be a silent application (**D11**).", "",
         "| finding | paragraph | reason |", "|---|---|---|"] +
        ["| %s | B08-P%03d | %s |" % (f, idx + 1, why)
         for f, idx, frag, why in DECLINED] +
        ["", "## Paragraphs differing v1 → v2", "",
         ", ".join("B08-P%03d" % (i + 1) for i in diffs), ""]),
        encoding="utf-8")

    print("OK — candidate-v2.json written")
    print("  substitutions              %d in %d paragraphs; %d declined and "
          "asserted unchanged" % (len(CORRECTIONS), len(diffs), len(DECLINED)))
    print("  semicolons  v1 %d kept + %d added   →   v2 %d kept + %d added"
          % (k1, a1, k2, a2))
    print("  dividing marks (D27)       %d + %d → %d + %d" % (d1 + d2))
    print("  NORM RATE published        %+.1f%% → %+.1f%%" % (nr1[5], nr2[5]))
    print("  NORM RATE Butler's own     %+.1f%% → %+.1f%%" % (nb1[2], nb2[2]))
    print("  NORM RATE D27              %+.1f%% → %+.1f%%" % (ne1[2], ne2[2]))
    print("  NORM RATE D27 on Butler's  %+.1f%% → %+.1f%%  (COMPARED)"
          % (nbe1[2], nbe2[2]))
    print("  candidate-v2.json sha256   %s" % sha256_bytes(out.read_bytes()))
    print()

    figs, gate = checks.run_book(8, version=2)
    if gate.failures:
        fail("%d gate(s) failed — see book08/checks-v2.md" % len(gate.failures))
    block = checks.manifest_checks_block(figs, gate)
    mp = BOOK / "manifest.json"
    m = json.loads(mp.read_text(encoding="utf-8"))
    m["checks"] = block
    mp.write_text(dump_json(m), encoding="utf-8")
    bad = checks.verify_manifest(8, figs, gate)
    if bad:
        fail("the manifest just written does not verify:\n  "
             + "\n  ".join(bad))
    print("\nbook08/manifest.json: checks block now names %s"
          % block["candidate_file"])


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Every collision row touching one Book, with a disposition on every one.

**Records finding R-2 and blind spot 8 of `book07/review/findings-v1.md`.**
Book 7's `README.md` and `review-instructions.md` said the collision check
*"found eleven rows touching this Book"*. It returns **seventy-two**. Eleven
were acted on — seven repaired, four handed to the reviewer — and **sixty-one
were dismissed with no record of having been read**, which is how `walls` <-
`precincts` (M-1) passed through: a sense change, in a Book whose walls are
literally bronze, printed by the tool and never triaged.

The reviewer's diagnosis is the right one and it is not about the instrument:

> *"This is not a gap in an instrument; it is a gap between an instrument and a
> record... the next reviewer cannot tell a judged row from an unread one."*

So this script is the record, and it is generated rather than typed. It fails
non-zero when any row touching the Book has no disposition, which makes the
triage impossible to skip in the way it was skipped.

**The disposition vocabulary.** Six classes are decided mechanically and the
rest are ruled by hand, in `RULINGS` (keyed by arrow and key, and by arrow C
row) and in `RULINGS_BY_BOOK` (keyed by Book as well), with a reason apiece.

Mechanical, in the order they are applied:

* `variant` — every rendering in the row reduces to one form once inflection,
  D9 British/American spelling and D15 compound spacing are normalized. One
  rendering in two surface forms is not two renderings.
* `kept` — **every** entry this Book contributes to the row is Butler's own
  word carried through unchanged. The Book made no rendering decision here;
  whatever the row shows belongs to whichever Book did. This is the class the
  three upheld rows fall in (`lighted`, `endowed`, `luscious`) and it is why
  they are upheld: Book 7 kept Butler's word and another Book moved.
* `common-rendering` — arrow B, where the key is a word Butler himself uses in
  eight or more paragraphs across seven Books. Arrow B is deliberately NOT
  gated on the rendering's side, so that accepted B04-P010 could be caught, and
  ~31 rows a Book are the price. **The class is dismissible only because arrow
  C carries the residue** — arrow C tests the same defect inside one paragraph
  with no frequency gate at all. That is D18's `declare_blind` shape applied to
  a triage rather than to a measure, and it is stated here for the same reason:
  a dismissal whose carrier is not named is a dismissal nobody can audit.
* `common-word` — arrow C, where the rendering is an ordinary high-frequency
  word (`said`, `nothing`) and the two uses are unrelated clauses.
* `artifact` — the diff paired two spans across a recast; there is no rendering
  pair to rule on.
* `kept-elsewhere` — **the mirror of `kept`, and its absence is why 221 rows
  accumulated.** This Book supplies the row's only rendering; every other entry
  is Butler's own word carried through unchanged by another Book. `kept`
  dismisses such a row from the KEEPER's side and there was no class to
  dismiss it from the MOVER's side, so every row of this shape stayed open
  forever in whichever Book had done the modernizing. It took 109 of the 221
  rows of the Books 1-6 backlog in one line. **Declared blind** in the same
  shape as `common-rendering`: it cannot say whether a Book that KEPT the word
  should also have moved it, and that residue is ruled by hand wherever the
  kept word is not current English in its own context.

Ruled by hand, in `RULINGS`:

* `repair` — live. Fixed in the Book's next version, named there.
* `discrimination` — two lexemes or two senses deliberately kept apart.
* `homograph` — **a new class, and the review asked for it by name.** One
  Butler spelling, two unrelated senses, therefore two different words that
  happen to be spelled alike: `issue` is *outcome* at B03-P007 and *offspring*
  at B07-P007. It is not a collision at all, and the reviewer's point is that
  it will recur (`issue`, `state`, `will`, `fair`, `want`) and costs a reviewer
  the same work from scratch every time unless the class has a name.
* `same-referent` — the rendering is Butler's own other word **for the same
  thing**, which is precision rather than flattening.
* `unavoidable-merge` — two Butler words with one plain modern equivalent. The
  merge is the correct reading and the alternative is a register distinction
  the text does not support.
* `phrase-not-word` — the rendering is a multiword idiom whose head coincides
  with a token kept elsewhere; there is no second referent.
* `divergence-recorded` — this Book is right and another accepted Book is out
  of step. Recorded with its reason, not repaired: repairing costs a successor
  for no reading gain.
* `matches-accepted` — this Book's rendering is word for word the one an
  accepted Book already uses for the same Butler word. The row exists because
  some *other* Book renders it differently, and that is that Book's decision,
  not this one's.
* `context-rendered` — one Butler word, two renderings, where the two contexts
  differ in a way that makes each rendering wrong in the other's place: deixis
  (`hereabouts` -> `in those parts` in Nestor's mouth, `near here` in
  Eidothea's), collocation (`firmament of heaven` -> `vault`, `through the
  firmament` -> `sky`), or which half of a sense is in play. **It is not a
  licence for any two synonyms**: the reason must name the difference, and
  where it cannot, the row is `free-variation` instead and says so.
* `free-variation` — the honest residue: two renderings of one Butler word that
  differ in no way a reader can attach meaning to. **Used four times in six
  Books and listed rather than folded into `variant`,** because `variant`
  claims the two forms are one word and these are two words. If this class ever
  carries a dozen rows it has become the thing it was invented to avoid.

Run: `python3 scripts/collision_triage.py 7`
"""
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from rendering_collisions import (ACCEPTED, build, build_c, load,   # noqa: E402
                                  toks)

COMMON_RENDERING_MIN = 8      # paragraphs of Butler's own, across seven Books
COMMON_WORD_MIN = 20          # arrow C only, where precision is already high

BRITISH = {"harbours": "harbors", "honours": "honors", "honoured": "honored",
           "favourite": "favorite", "travelled": "traveled",
           "traveller": "traveler", "councillors": "councilors",
           "woollen": "woolen", "amongst": "among", "whilst": "while",
           "grey": "gray", "colour": "color", "neighbours": "neighbors",
           "staid": "stayed", "whatsoever": "whatever", "forwards": "forward",
           "backwards": "backward"}


def normal(s):
    """One rendering, stripped to its form: infinitive marker, D9 spelling,
    D15 compound spacing and ordinary inflection all removed."""
    out = []
    for w in s.split():
        if w == "to":
            continue
        w = BRITISH.get(w, w)
        for suf in ("ing", "ed", "es", "s"):
            if w.endswith(suf) and len(w) - len(suf) >= 3:
                w = w[:-len(suf)]
                break
        out.append(w)
    return "".join(out)


# ---------------------------------------------------------------- the rulings
# Keyed by (arrow, key) for arrows A and B, and by (book, paragraph, Butler's
# span, the rendering) for arrow C. Every entry carries a class and a reason.
RULINGS = {
    ("A", "faring"): ("artifact",
        "Butler writes `sea-faring` with a hyphen and the tokenizer splits it, "
        "so `faring` is not a word either text uses. D15 closes it to "
        "`seafaring`, matching accepted B06-P021. There is no rendering pair."),
    ("A", "harbours"): ("variant",
        "D9, `harbours` -> `harbors`. The trailing `their` in the row is the "
        "parallel possessive Butler dropped and B07-P005 restores, recorded in "
        "`continuity.md`; the diff attached it to the same span."),
    ("A", "issue"): ("homograph",
        "**Not a collision.** Butler's `issue` is *outcome* at B03-P007 and "
        "*offspring* at B07-P007 — two words spelled alike. Both uses are "
        "archaic and both had to move, in different directions because they "
        "are different words. `without a son` is exact: Rhexenor left a "
        "daughter and no son. Upheld at findings-v1 \\u00a75.2, and this is the "
        "class that gets a name here so the next `state`, `will`, `fair` or "
        "`want` does not cost a reviewer the same work from scratch."),
    ("B", "talked"): ("unavoidable-merge",
        "`talked` carries Butler's `converse` (B04-P052, B07-P028) and his own "
        "`talked` (B02-P025). `converse` as an intransitive verb is archaic and "
        "`talk` is its only plain modern equivalent; the alternative is a "
        "register difference Butler does not make. B07-P028 matches accepted "
        "B04-P052 word for word, which is the consistency the package asks for."),
    ("B", "traveler"): ("unavoidable-merge",
        "**O-7, declined, and the reason is that the proposed repair does not "
        "repair anything.** `wayfarer` -> `traveler` at B07-P018 does land on "
        "the rendering of Butler's `traveller` at accepted B03-P011 and "
        "B04-P027. But O-7 offers `lone traveler` to keep the solitary sense "
        "without the merge, and the candidate **already writes `solitary "
        "traveler`** — the same repair in a different word, with the merge "
        "untouched either way, because `traveler` is the only plain modern "
        "equivalent of `wayfarer`."),
    ("A", "husbands"): ("variant",
        "One word, inflected for number. O-6's repair recasts Butler's "
        "comparison from *`honored of all those who keep house along with "
        "their husbands`* to *`honors more than any other woman who keeps "
        "house beside her husband`*, which is singular because the comparison "
        "now has one term. Butler's own plural at B07-P008 stands."),
    ("B", "bondservants"): ("artifact",
        "Butler's `bondsmen` is rendered `bondservants` in BOTH accepted "
        "B04-P055 and B07-P019 — the row exists only because §8's reordering "
        "of `see my property once more` pulled `property` into the diff's "
        "span, so the two source sides read `bondsmen` and `property my "
        "bondsmen`. There is one rendering and it is consistent."),
    ("B", "courtyard"): ("same-referent",
        "The M-1 repair. `courtyard` now carries Butler's own `courtyard` "
        "(accepted B04-P005) and his `precincts` (B07-P012) — and his "
        "`precincts` IS the courtyard: the next sentence has Odysseus going "
        "`straight through the court`. Using Butler's own word for the thing "
        "he is describing is what M-1 asked for, and it is what frees `walls` "
        "for the bronze."),
    ("B", "until"): ("phrase-not-word",
        "`hitherto` -> `until now` at B07-P018, beside Butler's own `until` "
        "elsewhere. `until now` is a fixed adverbial phrase, not a second use "
        "of the preposition, and there is no second referent. Upheld."),
    ("A", "precincts"): ("discrimination",
        "**Ruled at Book 8, and the two renderings are deliberate.** B07-P012 "
        "is a man crossing a threshold into an enclosure, and there "
        "`precincts` was rendered `courtyard` for two reasons (finding M-1): "
        "`walls` was a sense change, and the Book's walls are literally "
        "bronze. B08-P004 is the plural grounds of a palace — *the "
        "outbuildings, the yards, and all the precincts were filled with "
        "crowds* — where `precincts` is current English and needs no change. "
        "Recorded in `book08/continuity.md` \u00a76."),
    ("B", "walls"): ("repair",
        "**M-1, and the row nobody ruled on.** `precincts` -> `walls` at "
        "B07-P012, three paragraphs from B07-P009's literal bronze walls and "
        "B07-P005's city walls. It is a sense change as well as a collision: "
        "`precincts` is the enclosure, and the next sentence has Odysseus "
        "going straight through the court, so `inside the walls of the house` "
        "puts him inside the building. Repaired in v2 to `inside the "
        "courtyard of the house`."),
    ("B", "wrapped"): ("unavoidable-merge",
        "`wrapped` carries Butler's `enveloped` (B05-P030, B07-P012) and his "
        "own `wrapped` (B03-P035). `envelop` is not plain modern English of a "
        "mist, `wrap` is, and the two Books render it identically, which is "
        "the consistency the package asks for."),

    # ---------------------------------------------------------------- Book 8
    ("A", "ambuscade"): ("matches-accepted",
        "`ambuscade` -> `ambush` at B08-P046 is word for word accepted "
        "B04-P044's rendering of the same Butler word. The third rendering in "
        "the row, `lying in wait there` at B04-P037, is Book 4's phrase-level "
        "recast, where `ambuscade` has no word rendering at all."),
    ("B", "ambush"): ("unavoidable-merge",
        "`ambush` carries Butler's `ambuscade` and his own `ambush` "
        "(B04-P034, B04-P081). `ambuscade` is archaic and `ambush` is its only "
        "plain modern equivalent; both accepted Book 4 and Book 8 render it so."),
    ("A", "appearance"): ("homograph",
        "One Butler spelling, two senses. `the appearance of Odysseus` at "
        "B08-P002 is how he looks; `the presents began to make their "
        "appearance` at B08-P038 is an idiom meaning they arrived. Two words "
        "that happen to be spelled alike, like `issue` at Book 7."),
    ("A", "infinite"): ("matches-accepted",
        "`infinite trouble` -> `endless trouble` at B08-P012 is word for word "
        "accepted B05-P018's rendering. The other rendering in the row is "
        "Book 2's, where B02-P002 keeps Butler's `infinite` because it is "
        "current English in its own context; that is Book 2's decision."),
    ("A", "mantle"): ("matches-accepted",
        "`mantle` -> `cloak` at B08-P007 is accepted B04-P013's rendering. "
        "B03-P036's `fine cloak` is the same rendering with Butler's own "
        "adjective attached."),
    ("A", "raiment"): ("discrimination",
        "**Ruled, and the two renderings are deliberate.** Butler uses "
        "`raiment` twice in this Book for two different things: the divine "
        "dress the Graces put on Aphrodite at B08-P030, rendered `robes`, and "
        "the gift-clothes the Phaeacians pack in Arete's chest at B08-P040, "
        "rendered `clothing` — which is word for word accepted B05-P004's "
        "rendering. `clothing of the most enchanting beauty` said of a goddess "
        "is flat, and `robes` said of a chest of presents is wrong."),
    ("B", "clothing"): ("matches-accepted",
        "See (A, raiment). B08-P040 uses accepted B05-P004's rendering "
        "exactly; B07-P022's `clothing` is Butler's own word kept."),
    ("B", "robes"): ("discrimination",
        "See (A, raiment). `robes` carries Butler's `raiment` at B08-P030 and "
        "his own `robes` at B06-P003 — both are garments worn, and the merge "
        "is the correct reading rather than a loss."),
    ("A", "remained"): ("artifact",
        "Butler's `who as long as he remained with her had taken as good care "
        "of him` became `who for as long as he was with her` — a phrase-level "
        "recast made to keep `stayed` free for Butler's own `staid`/`stayed` "
        "(B03-P015, B04-P009, B07-P022). The diff paired `remained` with "
        "`was`; there is no rendering pair to rule on."),
    ("B", "appease"): ("artifact",
        "Butler's `as an offering and propitiation for the gods` became `as an "
        "offering to appease the gods`. `propitiation` is a noun and `appease` "
        "a verb; the diff paired the spans across the recast."),
    ("B", "aware"): ("matches-accepted",
        "`perceived` -> `was aware of` at B08-P047 is the rendering accepted "
        "B05-P018 already uses. It was chosen at this Book precisely to keep "
        "`noticed` free for Butler's own `noticed` at B08-P007, which arrow C "
        "caught flattened in the first draft."),
    ("B", "cross"): ("unavoidable-merge",
        "`cross` carries Butler's `traverse` at B08-P049 and his own `cross` "
        "in four accepted Books. `traverse the sea` is not plain modern "
        "English and `cross` is its only ordinary equivalent."),
    ("B", "entrance"): ("unavoidable-merge",
        "`entrance` carries Butler's `vestibule` at B08-P021 and his own "
        "`entrance` at B06-P021 — the same part of the same kind of house. "
        "`doorway` was not available: Butler uses it himself two paragraphs "
        "later at B08-P023, where the gods stand in it."),
    ("B", "halios"): ("variant",
        "**Butler spells one man's name two ways** — `Halios` at B08-P008 and "
        "`Halius` at B08-P032, for the same son of Alcinous, and the check "
        "found it. This is the **D13** shape with the opposite resolution: "
        "D13 split `Mycene` by *referent* because there were two people; here "
        "there is one man, so one spelling, and Butler's first is taken. "
        "Recorded in `continuity.md`, not silently regularized."),
    ("B", "neighbor"): ("variant",
        "D9, `neighbour` -> `neighbor`. The trailing `saying` in the row is "
        "Butler's participle, which the recast `and one would turn to his "
        "neighbor and say` absorbed; the diff attached it to the same span."),
    ("B", "playing"): ("homograph",
        "One spelling, two unrelated senses. `the playing that goes with it` "
        "at B08-P007 renders Butler's `minstrelsy`; his own `playing` "
        "elsewhere is children at play (B01-P008, B07-P023) and a flame "
        "playing about a tripod (B08-P040). No referent is shared."),

    (7, 7, "male issue", "son"): ("same-referent",
        "Butler's `issue` here IS the son — Rhexenor left a daughter and no "
        "son, which the same paragraph states. Using Butler's own `son` for "
        "his `male issue` is precision, not flattening. Upheld at \\u00a75.2."),
    (7, 9, "abode", "house"): ("repair",
        "**M-2.** Butler writes `the abode of Erechtheus` and, eleven words "
        "later, `the house of Alcinous`; the candidate writes `house` twice. "
        "This is the B06-P019 shape the drafter identified and repaired at "
        "B07-P021 and did not apply here. Repaired in v2 to `the home of "
        "Erechtheus` (and `his own home` at B07-P020, the same shape again)."),
    (7, 10, "fashioned expressly", "made"): ("repair",
        "**Unreported by round 1 — arrow C's own finding.** In one paragraph "
        "Butler writes that Hephaestus `fashioned` the mastiffs and that the "
        "women of the house `made` the hangings. The candidate writes `made` "
        "for both, and the distinction it loses is between a god's craft and "
        "household work, in the paragraph whose whole subject is the wonder of "
        "the palace. Repaired in v2 to `had fashioned specially`; `fashion` is "
        "current English and needed no change."),
    (7, 10, "persons", "men"): ("repair",
        "**M-10.** `chief persons` -> `chief men`, against the candidate's own "
        "`chief people` two paragraphs later at B07-P012 rendering the same "
        "Butler phrase. In a Book whose argument turns on Arete it narrows a "
        "word Butler chose to be open. Repaired in v2 to `chief people`."),
    (7, 11, "nor", "never"): ("repair",
        "Butler: `The fruits never rot nor fail all the year round`. The "
        "candidate writes `never rot and never fail`, doubling a word Butler "
        "used once and pointing a parallel he pointed with `nor`. Repaired in "
        "v2 to `never rot or fail`."),
    (7, 15, "and bid", "tell"): ("repair",
        "**Unreported by round 1 — arrow C's own finding.** Echeneus says "
        "`tell him, then, to rise` and, in the same speech, `bid your servants "
        "mix some wine`. The candidate writes `tell` for both. `bid` is a "
        "command through an intermediary and `tell` is not. Repaired in v2 to "
        "`have your servants mix some wine`."),
    (7, 18, "hitherto", "now"): ("phrase-not-word",
        "`until now` again — see (B, until). Butler's other `now` is the "
        "discourse adverb in `so now go home to bed`, a different clause and a "
        "different part of speech."),
    (7, 19, "itself", "nothing"): ("artifact",
        "`dwell only on the due replenishing of itself` was recast to `think "
        "of nothing but being refilled`, a sound collision repair against "
        "accepted B04-P016's `filling`. The diff paired `itself` with "
        "`nothing` across the recast; Butler's other `nothing` is nine "
        "sentences away in `I have nothing of the immortal about me`."),
    (7, 19, "sup", "eat"): ("repair",
        "**M-5.** `let me sup in spite of sorrow` and, thirty words later, "
        "Butler's own `that I shall eat and drink`. The candidate writes `eat` "
        "for both, at a supper, where `sup` is the meal in front of the "
        "speaker and not decoration. Repaired in v2 to `let me have my supper "
        "in spite of sorrow`."),
    (7, 20, "his saying", "said"): ("common-word",
        "`Every one approved his saying` -> `Everyone approved what he said`, "
        "beside `so she said` in a different clause two sentences later. "
        "`said` is one of the commonest words in the corpus and the two uses "
        "share no referent."),
    (7, 22, "bade", "told"): ("repair",
        "**Unreported by round 1 — arrow C's own finding, and the sharpest of "
        "the three.** Butler: `she bade me depart of her own free will, either "
        "because Jove had told her she must, or because she had changed her "
        "mind`. The sentence turns on the difference between Calypso's own "
        "bidding and Zeus's telling; the candidate writes `told` for both and "
        "flattens exactly the distinction the sentence exists to pose. "
        "Repaired in v2 to `she sent me on my way`."),
}


# --------------------------------------------------- the rulings, per BOOK
# **The table above is keyed by (arrow, key) alone, and that was a defect of
# the instrument, not of anybody's ruling.** It was written when two Books had
# been triaged; with eight it is wrong, because the right disposition of a row
# DEPENDS ON WHICH BOOK YOU ARE ASKING ABOUT. `kept` says so in as many words —
# *"the decision in this row belongs to whichever Book moved"* — so a row is
# `kept` from the keeper's side and something else from the mover's side, and a
# key-keyed table can hold only one of the two. Arrow C's rulings were already
# book-keyed. These are too, and this table is consulted FIRST so that ruling
# Books 1-6 cannot reach back and change the accepted record of Books 7 and 8.
#
# **Two dismissal classes are new here and both are named so they can be
# audited:**
#
# * `context-rendered` — one Butler word, two renderings across Books (or
#   across paragraphs of one Book), where the two contexts differ in a way that
#   makes each rendering wrong in the other's place: deixis (`hereabouts`),
#   collocation (`firmament of heaven` -> `vault`, `through the firmament` ->
#   `sky`), or which half of a sense is in play (`sorely against my will` kept,
#   `pressing me sorely` -> `hard`). It is NOT a licence for any two synonyms:
#   the reason has to name the difference, and where it cannot, the row is
#   `free-variation` instead and says so.
# * `free-variation` — the honest residue. Two renderings of one Butler word
#   that differ in no way a reader can attach meaning to, in contexts sharing
#   no referent. **Used four times in six Books, and listed here rather than
#   folded into `variant`, because `variant` claims the two forms are one word
#   and these are two words.** If this class ever carries a dozen rows it has
#   stopped being a residue and has become the thing it was invented to avoid.

RULINGS_BY_BOOK = {}


def rule(books, arrow, key, klass, why):
    for b in books:
        RULINGS_BY_BOOK[(b, arrow, key)] = (klass, why)


# ---- BOOK 9, ruled at its draft (step 3), before the freeze --------------
# `RESUME.md` asks that the collision check and the compound register run
# **before** freezing and not after, and this is what that produced. The check
# returned 123 rows touching Book 9 and 27 with no disposition; **fifteen of
# the twenty-seven were live and were repaired in the draft**, which is the
# instrument doing the job it was built for at the only moment it costs
# nothing. Six of the fifteen came from arrow B across paragraphs — the blind
# spot the record says arrow C does not close — and one from arrow C itself
# (`subtlety` rendered `cunning` in the paragraph where Butler's own `cunning`
# describes Circe, eleven words away). The repairs are listed in
# `book09/continuity.md` §7. What follows is the residue, dismissed with a
# reason apiece.

rule([9], "A", "compassion", "common-rendering",
     "`take compassion upon me` is an archaic construction, not an archaic "
     "word: modern English keeps `compassion` as a noun and has lost `take "
     "compassion upon`. `take pity on me` is the living form of the same "
     "request and is what the sentence is doing.")
rule([9], "A", "continue", "variant",
     "`nor yet how to continue and conclude my tale` -> `nor how to go on and "
     "end my tale`. Butler's `continue` is current English; the pair with "
     "`conclude` is the Victorian doublet, and `go on and end` is the plain "
     "modern form of the same two verbs. No discrimination of Butler's is "
     "lost — he uses the word once in the Book.")
rule([9], "A", "hence", "variant",
     "`We sailed hence` -> `We sailed on from there`. `hence` in the spatial "
     "sense is gone from modern English; the temporal and inferential senses "
     "that survive are not what Butler means here.")
rule([9], "A", "humour", "variant",
     "`unless I am in the humour for doing so` -> `unless I am in the mood "
     "for it`. Butler's sense of `humour` is the obsolete one; the modern "
     "word means something else, which makes this a false friend rather than "
     "a formal word.")
rule([9], "A", "loose", "context-rendered",
     "Two senses, and each rendering is wrong in the other's place. `when men "
     "loose their oxen` (B09-P003) is unyoking at the day's end — the "
     "Homeric time-of-day formula — and `loose the hawsers` (B09-P011, "
     "B09-P044) is casting off, where `loose` is still the nautical word and "
     "is KEPT. `unyoke the hawsers` and `loose their oxen` are both wrong.")
rule([9], "A", "lotus", "common-rendering",
     "`gave them to eat of the lotus, which was so delicious` -> `gave them "
     "the lotus to eat. It was so delicious`. The second mention becomes a "
     "pronoun because the sentence was divided; the word is kept where "
     "Butler first writes it and three times after.")
rule([9], "A", "numbers", "context-rendered",
     "`great numbers of sheep and oxen` -> `a great many sheep and oxen` "
     "(B09-P003), against `breed there in great numbers` KEPT (B09-P007). "
     "The first counts a slaughter and takes the plain quantifier; the "
     "second is the idiom for an animal population and has no plainer form.")
rule([9], "A", "uncivilised", "variant",
     "`uncivilised savages` -> `wild savages`. Butler's pair is tautologous "
     "in modern English — a savage is by definition uncivilized — and the "
     "contrast the sentence draws is with `a hospitable and civilized race`, "
     "which KEEPS the root. One word of the pair carries it.")
rule([9], "A", "vouchsafed", "variant",
     "`vouchsafed me not one word of answer` -> `gave me not one word of "
     "answer`. `vouchsafe` survives only in legal and liturgical registers; "
     "the sentence's force is in `not one word`, which is kept exactly.")
rule([9], "B", "someone", "artifact",
     "`some one` -> `someone`, a typographic normalization of the kind D15 "
     "calls silent. Not a rendering at all.")
rule([9], "B", "times", "unavoidable-merge",
     "`thrice invoked each one of the poor fellows` (B09-P004) and `three "
     "times did I fill the bowl` (B09-P024). **Modern English has no "
     "one-word `thrice`**, so both of Butler's expressions land on `three "
     "times`. The merge is forced by the language, not chosen: the "
     "alternatives (`three separate times`, `over and over`) either pad or "
     "change the count.")

# ---- the rows BOOK 9's arrival opened in the accepted Books ---------------
# Every arrow compares across Books, so adding a ninth Book to `BOOKS` creates
# rows in the other eight. Eight such rows appeared, all of them dismissals,
# and they are ruled here rather than left for a later worker — a row with no
# disposition is the R-2 disease whoever created it.

rule([1, 2], "A", "direct", "context-rendered",
     "Butler's `direct` in `the girl who was to direct him` (B01-P019, "
     "B02-P012) is *show the way*, which modern `direct` has all but lost to "
     "*instruct* and *manage*; `guide` is the surviving word for it. Book 9 "
     "keeps `direct` at B09-P004, where `letting the wind and the steersmen "
     "direct our ship` is the living sense. Two senses, each rendered right.")
rule([1, 2], "B", "someone", "artifact",
     "`some one` -> `someone`, a typographic normalization (D15, silent). Not "
     "a rendering.")
rule([2], "A", "continue", "variant",
     "`continue eating` -> `go on eating`, the plain modern form. Same "
     "disposition as Book 9's row: Butler's `continue` is current English, "
     "but not in this construction.")
rule([3], "A", "hence", "variant",
     "`hence` in the inferential sense rendered `so` (B03-P013), against Book "
     "9's spatial `sailed hence` rendered `sailed on from there`. Two senses "
     "of one obsolete-in-place adverb; both plain modern equivalents.")
rule([4], "A", "humour", "artifact",
     "`humour` -> `humor` at B04-P020 is D9, the spelling rule, and nothing "
     "else. Book 9's row is a different matter — there the SENSE is obsolete "
     "and the word becomes `mood`.")
rule([4], "A", "vouchsafed", "context-rendered",
     "`vouchsafed` is *granted* at B04-P001, where a god bestows, and *gave* "
     "at B09-P019, where a monster answers. The verb's two uses are a favour "
     "conferred and a reply withheld; neither rendering works in the other's "
     "place.")
rule([6, 8], "A", "uncivilised", "artifact",
     "`uncivilised` -> `uncivilized` is D9, the spelling rule. Book 9's row "
     "is the separate question of Butler's tautologous `uncivilised savages`.")
rule([5], "A", "compassion", "common-rendering",
     "`take compassion upon` -> `take pity on`, the same disposition as Book "
     "9's row and the same reason: the construction is archaic, not the noun.")

# ---- arrow A ------------------------------------------------------------
rule([3, 4], "A", "begin", "matches-accepted",
     "Both accepted Books render Butler's `begin` as `start` — `start "
     "questioning` at B03-P003, `start a conversation` at B04-P014, where the "
     "longer span is Butler's own doublet `begin opening up discourse` "
     "collapsed to one verb. One rendering, two spans. Book 2 keeps `begin`, "
     "which is current English in its own context.")
rule([1], "A", "ceasing", "context-rendered",
     "Butler writes `without ceasing` twice in Book 1 and the candidate "
     "renders it `without end` (B01-P024) and `without pause` (B01-P002). The "
     "two are not interchangeable: a widow's mourning is endless, a god's "
     "persecution is unremitting, and `mourn without pause` and `persecuted "
     "him without end` are both wrong. The renderings differ because the "
     "contexts do.")
rule([1, 2], "A", "celebrate", "homograph",
     "One Butler spelling, two unrelated senses. `celebrate his funeral "
     "rites` is *perform* (B01-P019 and B02-P012 — the same Butler sentence "
     "in two Books, rendered `hold` in both, which is the consistency the "
     "package asks for). `such as poets love to celebrate` is *sing of*. **The "
     "B01-P024 rendering was separately live and is repaired**: see the arrow "
     "C row (1, 24, `celebrate`, `sing`).")
rule([1, 6], "A", "conduct", "context-rendered",
     "`the girl who was to conduct him to the city` -> `guide` (B06-P010) and "
     "`I will also conduct him to Sparta` -> `take` (B01-P007). Nausicaa shows "
     "Odysseus a way he does not know; Athena proposes to convey Telemachus on "
     "a voyage she is arranging. `guide him to Sparta` would say Telemachus "
     "cannot find it, and `take him to the city` would take the showing out of "
     "Nausicaa's hands.")
rule([3], "A", "counselled", "artifact",
     "There is ONE rendering here, `decreed`, in all three of B03-P021, "
     "B03-P023 and B03-P024. The row splits only because Butler's `long since "
     "counselled` became `long ago decreed` and the diff pulled `ago` into the "
     "span. See (3, B, `decreed`) for the merge itself.")
rule([1], "A", "couple", "free-variation",
     "`a couple of lances` keeps `a couple of` at B01-P018; `a couple of "
     "blazing torches` becomes `a pair of` at B01-P032. Fourteen paragraphs "
     "apart, no shared referent, and no reader can attach a meaning to the "
     "difference — `a couple of` and `a pair of` are interchangeable modern "
     "English. Recorded rather than repaired: a successor to an accepted Book "
     "for this would buy nothing.")
rule([1, 4], "A", "detaining", "context-rendered",
     "`savages who are detaining him against his will` -> `holding` "
     "(B01-P014); `you are detaining me from them` -> `keeping me from them` "
     "(B04-P050). The first is captivity and the second is delay, and English "
     "does not use one verb for both: `holding me from them` is not idiomatic "
     "and `keeping him against his will` loses the imprisonment.")
rule([1], "A", "feared", "variant",
     "One word in two forms. B01-P018 keeps Butler's verb (`Ilus feared the "
     "everlasting gods`); B01-P032 recasts `for he feared his wife's "
     "resentment` to the noun `for fear of his wife's anger`. Same lexeme, "
     "same sense, a part-of-speech change made by the recast.")
rule([3, 5], "A", "firmament", "context-rendered",
     "`swooped down through the firmament` -> `sky` (B05-P005); `rising into "
     "the firmament of heaven` -> `vault of heaven` (B03-P001). `the sky of "
     "heaven` is not English and `swooped down through the vault` loses the "
     "motion. The collocation decides it, not a preference.")
rule([2, 5], "A", "furthermore", "context-rendered",
     "Butler's paragraph-opening `Furthermore` is sequential narration at "
     "B02-P031 (`Next she went to the house of Odysseus`) and an additive "
     "grievance inside a speech at B05-P002 (`And now, wicked people are "
     "trying to murder his only son`). `Next` at the head of a complaint and "
     "`And now` at the head of a narrative step are each wrong in the other's "
     "place.")
rule([1, 3], "A", "hecatomb", "same-referent",
     "A hecatomb IS a sacrifice, so the rendering keeps Butler's referent and "
     "marks what would otherwise be lost — the scale — with an adjective: "
     "`great sacrifice` (B01-P003) and `fine sacrifice` (B03-P007, where "
     "`fine` is carrying Butler's own `goodly` and the scale word has nowhere "
     "to stand). **Accepted Book 4 was the one out of step**, rendering "
     "`holy hecatombs` as a bare `holy sacrifices` one sentence from Butler's "
     "own `sacrifices`; the successor `book04/candidate-v5.json` brings it "
     "into line. See the arrow C row (4, 40, `hecatombs`, `sacrifices`).")
rule([5, 6], "A", "herbage", "matches-accepted",
     "**The row this whole check was built for, and it is now consistent.** "
     "The drafter of Book 6 named `herbage`/`grass` as a call no single-Book "
     "instrument could see. Both accepted Books now render `greenery` — "
     "B06-P009 plain, B05-P006 with `lush` carrying Butler's own `luscious`. "
     "One rendering in two Books.")
rule([3, 4], "A", "hereabouts", "context-rendered",
     "**Deixis, and the clearest case of this class in the package.** "
     "B03-P024 is Nestor narrating a coast far from where he stands — `there "
     "is a high headland in those parts`. B04-P032 is Eidothea, standing on "
     "that shore, pointing — `an old immortal who lives under the sea near "
     "here`. `near here` in Nestor's mouth moves Crete to Pylos; `in those "
     "parts` in Eidothea's empties her gesture.")
rule([2, 3], "A", "marvelled", "matches-accepted",
     "B02-P001 and B03-P030 render Butler's `all marvelled` identically as "
     "`everyone marveled` — his own word, D9-respelled, with `all` opened to "
     "`everyone`. One rendering in two Books. Book 1's third entry is a diff "
     "artifact of a different recast; see (1, A, `marvelled`).")
rule([1], "A", "marvelled", "artifact",
     "Butler's `as they heard him, and marvelled at the boldness of his "
     "speech` became `as they listened, amazed at the boldness of his speech` "
     "— `heard` -> `listened` and the finite verb absorbed into a participial "
     "phrase. The diff paired `marvelled` with the two-word span `listened "
     "amazed`; there is no rendering pair to rule on. **The live question in "
     "this family is the opposite direction** and is ruled at (1, B, "
     "`marveled`).")
rule([2, 4], "A", "opening", "homograph",
     "One spelling, two unrelated senses. B04-P014 is Butler's `begin opening "
     "up discourse` — starting to talk. B02-P025 is `doors opening in the "
     "middle` — a door on its hinge. No referent is shared.")
rule([1], "A", "persist", "artifact",
     "One rendering, `go on`, in both entries. B01-P027's longer span is "
     "Butler's `persist in spunging upon one man`, where `spunging` had to "
     "move as well and the diff took the two together as `go on feeding off`.")
rule([5], "A", "retired", "context-rendered",
     "`till the wave retired` -> `retreated` (B05-P032) and `the pair retired "
     "into the inner part of the cave` -> `withdrew` (B05-P019). Water "
     "retreats and people withdraw; `the pair retreated into the cave` makes "
     "them flee and `the wave withdrew` gives it an intention.")
rule([5], "A", "sorely", "context-rendered",
     "`pressing me so sorely` -> `so hard` (B05-P023); `sorely against my "
     "will` kept (B05-P031). `sorely against my will` is a living fixed "
     "collocation and needs no change; `pressing me so sorely` is not, and "
     "`pressing me so sorely` left standing would be the only archaism in the "
     "sentence.")
rule([1, 6], "A", "thence", "context-rendered",
     "`moved them thence and settled them in Scheria` -> `from there` "
     "(B06-P001) is spatial; `thence go on to Sparta` -> `then on to Sparta` "
     "(B01-P019) is a step in an itinerary, where English says `then`. `moved "
     "them then` is wrong and `from there go on to Sparta` reads as though "
     "Pylos were the obstacle.")
rule([1], "A", "tired", "homograph",
     "One spelling, two unrelated senses. `he is tired of life` -> `sick of "
     "life` (B01-P005) is satiety; `comes in tired from working his vineyard` "
     "(B01-P014) is fatigue, and Butler's word is kept because it is current "
     "English there. `sick of life` and `tired from the vineyard` are two "
     "words, not one rendered twice.")
rule([1], "A", "value", "variant",
     "One word in two forms, twelve lines apart: `a gift of great beauty and "
     "value` becomes the adjective `something fine and valuable` (B01-P020), "
     "and the noun is kept at B01-P021 (`one of no less value in return`). "
     "The recast of the first changed the part of speech, not the word.")
rule([4, 5, 6], "A", "wherein", "free-variation",
     "`in which` at B05-P006 and B06-P004, `where` at B04-P022, all rendering "
     "Butler's relative `wherein`, all after a concrete place noun (a wood, a "
     "peacefulness of light, a wooden horse). No sense, register or referent "
     "separates them. Recorded, not repaired: three accepted Books would have "
     "to move to close a difference no reader can act on.")

# ---- arrow B ------------------------------------------------------------
rule([1, 2], "B", "anger", "unavoidable-merge",
     "`anger` carries Butler's own `anger` in five Books, his `wrath of "
     "heaven` (B02-P004) and his `wife's resentment` (B01-P032). `wrath` is "
     "elevated and archaic and `anger` is its plain modern equivalent; "
     "`resentment` is current English and needed no change, but the referent "
     "is the same jealousy and the alternative is a register distinction "
     "Butler is not making.")
rule([5], "B", "blessed", "variant",
     "`blest` -> `blessed` is D9-adjacent spelling, not a rendering: one "
     "word, two spellings, Butler's own modern one adopted. The `safe to "
     "perish blest` span is the diff carrying `I am now safe to perish` and "
     "`Blest and thrice blest` across one sentence boundary.")
rule([1], "B", "brings", "phrase-not-word",
     "`wherewith she quells the ranks of heroes` -> `with which she brings "
     "down the ranks of heroes` (B01-P008). `bring down` is a phrasal verb "
     "and Butler's own `it brings both wealth and honor` (B01-P029) is the "
     "simple transitive. Different verbs that share a syllable.")
rule([1], "B", "capable", "repair",
     "**Live, and the sharpest of this Book's arrow B rows.** Butler calls "
     "Odysseus `no more capable man on earth` (B01-P006) and Telemachus `a "
     "fine, smart looking fellow` (B01-P019); the candidate writes `capable` "
     "for both. It is a sense change as well as a collision: Butler's `smart "
     "looking` is about APPEARANCE — 1900 British `smart` is well turned out "
     "— and `capable-looking` makes Athena praise a competence she is at that "
     "moment telling him he has not yet shown. Repaired in "
     "`book01/candidate-v4.json` to `a fine, good-looking young man`.")
rule([3], "B", "company", "homograph",
     "One spelling, two unrelated senses. `nine guilds with five hundred men "
     "in each` -> `nine companies` (B03-P001) is a body of men; `sacked the "
     "town of Troy in company with yourself` -> `in your company` (B03-P011) "
     "is accompaniment. No referent is shared.")
rule([4], "B", "conversation", "discrimination",
     "**Deliberately kept apart, and the drafter was doing arrow C's work by "
     "hand before arrow C existed.** Butler's sentence has both words in it: "
     "`ashamed to come here and begin opening up discourse with one whose "
     "conversation is so divinely interesting`. The candidate gives "
     "`discourse` the word `conversation` and moves Butler's own "
     "`conversation` to `talk`, so the sentence keeps two words where Butler "
     "had two. His `conversation` is kept at B04-P050 and B04-P079, where "
     "nothing is competing for it.")
rule([1], "B", "decide", "unavoidable-merge",
     "`It rests with heaven to determine` (B01-P019) and `It rests with "
     "heaven to decide` (B01-P030) — Butler's own two verbs in the same "
     "formula, eleven paragraphs apart, with no difference between them. "
     "`decide` is the plain modern word for both and keeping `determine` "
     "would invent a distinction Butler did not make.")
rule([3], "B", "decreed", "unavoidable-merge",
     "`decreed` carries Butler's `counselled` (B03-P021, B03-P023, B03-P024) "
     "and his own `decreed` (B04-P040, three times in Book 5). `counsel` "
     "used transitively of a god ordaining a death — `heaven had counselled "
     "her destruction` — is dead English, and `decreed` is what it means; "
     "Butler himself uses `decreed` for the identical act.")
rule([2], "B", "eating", "variant",
     "`continue to eat up Telemachus's estate` -> `go on eating up` "
     "(B02-P011), beside Butler's own `eating` in the same Book. One verb in "
     "two forms: the rendering changes `continue` to `go on`, not `eat` to "
     "anything.")
rule([2, 5], "B", "fairly", "homograph",
     "One spelling, two unrelated senses. `one who will govern equitably` -> "
     "`govern fairly` (B02-P014 and B05-P002 — the same Butler sentence in "
     "two Books, rendered identically) is justice; `channels cut pretty close "
     "together` -> `fairly close together` (B05-P006) is the degree adverb. "
     "Two words spelled alike.")
rule([4], "B", "granted", "unavoidable-merge",
     "`heaven vouchsafed Helen no more children` -> `granted` (B04-P001), "
     "beside Butler's own `when heaven had granted us a safe return` "
     "(B04-P015). `vouchsafe` is archaic and `grant` is its only plain modern "
     "equivalent — and it is Butler's own word for the identical act of a god "
     "giving.")
rule([5, 6], "B", "greenery", "matches-accepted",
     "The mirror of (5/6, A, `herbage`). Both accepted Books render Butler's "
     "`herbage` as `greenery`; B05-P006's longer span is his `luscious "
     "herbage` taken together.")
rule([1, 2, 6], "B", "guide", "unavoidable-merge",
     "`guide` carries Butler's `conduct` (B06-P010), his `direct` (B01-P019 "
     "and B02-P012 — the same sentence in two Books, rendered identically) "
     "and his own `guide` (B05-P005). All three are Butler's free variants "
     "for showing somebody a way; `some heaven-sent message may direct you` "
     "and `may guide you` are the same sentence in his own idiom, and no "
     "discrimination exists to lose.")
rule([2], "B", "heads", "phrase-not-word",
     "`She caused their drink to fuddle them` -> `made their drink go to "
     "their heads` (B02-P031). `go to someone's head` is a fixed idiom whose "
     "head noun coincides with Butler's own `heads` elsewhere (`wager their "
     "heads`, `the Malean heads`); there is no second referent.")
rule([1], "B", "hurried", "unavoidable-merge",
     "`Men-servants and pages were bustling about` -> `hurried about` "
     "(B01-P008), beside Butler's own `he hurried off` (B01-P030). The two "
     "are twenty-two paragraphs apart and share no referent; `bustle` is "
     "current English and could have been kept, but nothing in the text "
     "turns on the difference between bustling and hurrying servants.")
rule([3], "B", "inner", "variant",
     "`inward meats` -> `inner meats` at B03-P001, B03-P005 and B03-P035 — "
     "one rendering, three times, consistent — beside Butler's own `inner "
     "room` at B03-P031. `inward` and `inner` are one word in two forms.")
rule([1, 4], "B", "keeping", "unavoidable-merge",
     "`keeping` carries Butler's `detaining` (B04-P050), his `preventing him "
     "from getting home` (B01-P006) and his own `keeping` in five Books. "
     "`keep X from Y` is the plain modern idiom for both, and the three "
     "instances are in three Books with no shared referent.")
rule([4], "B", "lives", "unavoidable-merge",
     "`Ulysses who dwells in Ithaca` -> `lives` (B04-P047), beside Butler's "
     "own `lives` in five Books including B04-P032 fifteen paragraphs away. "
     "`dwell` is archaic and `live` is its plain equivalent. **Accepted Book "
     "7 keeps `dwells` at B07-P021** and that divergence is recorded rather "
     "than repaired: both readings are defensible and neither is wrong.")
rule([4], "B", "lying", "phrase-not-word",
     "`Our ambuscade would have been intolerable` -> `Lying in wait there "
     "would have been unbearable` (B04-P037). `lie in wait` is a fixed idiom "
     "whose participle coincides with Butler's own `lying` in six Books; "
     "there is no second referent. See (4, C, `our ambuscade` -> `wait`) and "
     "the Book 8 ruling at (A, `ambuscade`).")
rule([2, 3], "B", "marveled", "matches-accepted",
     "B02-P001 and B03-P030 both render Butler's `all marvelled` as "
     "`everyone marveled` — his own word, D9-respelled. The row exists "
     "because a THIRD Book put `marveled` where Butler wrote something else; "
     "that is Book 1's decision and it is ruled at (1, B, `marveled`).")
rule([1], "B", "marveled", "repair",
     "**Live, and avoidable, which is what makes it worth a successor.** "
     "Butler writes `He felt the change, wondered at it` at B01-P022 and the "
     "candidate writes `marveled at it` — putting `marveled` where Butler "
     "wrote `wondered`, while accepted Books 2 and 3 use `marveled` for his "
     "own `marvelled`. Two Butler words flattened into one across Books, and "
     "the substitution buys nothing: `wondered at it` is current English and "
     "was already right. Repaired in `book01/candidate-v4.json` by restoring "
     "Butler's `wondered`.")
rule([1, 2, 6], "B", "offense", "unavoidable-merge",
     "D9, `offence` -> `offense`, plus one recast: Butler's `you will not be "
     "offended with what I am going to say` (B01-P013) becomes `you will not "
     "take offense at what I am about to say`, which is the idiom Butler "
     "HIMSELF uses at B02-P008 and B06-P012 (`take offence at`). The merge "
     "makes Book 1 agree with two accepted Books on one speech act.")
rule([1, 3], "B", "sacrifice", "same-referent",
     "The other direction of (1/3, A, `hecatomb`). `sacrifice` carries "
     "Butler's `hecatomb` and his own `sacrifice`, and a hecatomb is a "
     "sacrifice — Butler's own other word for the same act. Both Books mark "
     "what the merge would otherwise cost with an adjective of scale.")
rule([1, 2, 6], "B", "search", "unavoidable-merge",
     "**Butler himself alternates, inside one speech, which settles it.** He "
     "writes `sail the seas in search of my father who has so long been "
     "missing` at B02-P018 and `go to Sparta and to Pylos in quest of my "
     "father who has so long been missing` at B02-P012 — the same formula, "
     "six paragraphs apart, in his own two words. `quest` is archaic outside "
     "fixed phrases; `search` is what he means by both, and three accepted "
     "Books render it identically.")
rule([3, 4], "B", "showed", "unavoidable-merge",
     "`showed` carries Butler's `shewed` (B03-P030 — his own archaic "
     "spelling of this very word), his `manifested herself visibly` "
     "(B03-P033) and his `what courage he displayed` (B04-P022). A goddess "
     "manifesting and a man displaying courage are both `showing` in plain "
     "English, and the third is not a second word at all.")
rule([1], "B", "spears", "same-referent",
     "`a couple of lances` -> `a couple of spears` (B01-P018), beside "
     "Butler's own `spears` eight paragraphs earlier in the same Book. "
     "Butler's `lances` and `spears` are the same weapon — he uses `spears` "
     "for the rack in Odysseus's hall and `lances` once, of the same arms — "
     "so using his own commoner word is precision, not flattening.")
rule([3, 4], "B", "start", "homograph",
     "One spelling, two unrelated senses. `ashamed to begin questioning` -> "
     "`start questioning` (B03-P003) and `begin opening up discourse` -> "
     "`start a conversation` (B04-P014) are *commence*; Butler's own `that he "
     "may start at once` (B03-P036) and its kin in Books 5, 6 and 8 are *set "
     "out on a journey*. The two senses never meet.")
rule([5], "B", "streams", "homograph",
     "One spelling, two unrelated senses. `four running rills of water in "
     "channels` -> `four running streams` (B05-P006) is a watercourse; `the "
     "bitter brine running down his face in streams` (B05-P024) is Butler's "
     "own word for a flood of liquid, kept. No referent is shared.")
rule([4], "B", "struck", "phrase-not-word",
     "`smote the grey sea with our oars` -> `struck the gray sea` "
     "(B04-P048), beside Butler's own `when the man struck up his tune` "
     "(B04-P002). `strike up` is a fixed idiom for beginning to play, not a "
     "second use of the transitive verb, and `smite` has no modern equivalent "
     "but `strike`.")
rule([6], "B", "suppose", "unavoidable-merge",
     "`I can only conjecture that you are Zeus's daughter` -> `suppose` "
     "(B06-P013), beside Butler's own `suppose` twice in the same Book and in "
     "four others. `conjecture` as a finite verb is formal to the point of "
     "stiffness in a castaway's plea, and `suppose` is what Butler himself "
     "writes elsewhere for exactly this hedged guess.")
rule([1], "B", "waste", "phrase-not-word",
     "`they are making havoc of my estate` -> `laying waste to my estate` "
     "(B01-P017), beside Butler's own noun `the waste these suitors make` "
     "(B01-P019). `lay waste to` is a fixed idiom and the head noun is not a "
     "second use of his count noun.")
rule([2], "B", "wickedness", "unavoidable-merge",
     "`violence in the naughtiness of their hearts` -> `in the wickedness of "
     "their hearts` (B02-P014), beside Butler's own `put a stop to this "
     "wickedness` (B02-P010). Butler's `naughtiness` is the older strong "
     "sense — it IS wickedness — and modern `naughtiness` means the opposite "
     "in force, so it had to move; both phrases name the same conduct of the "
     "same suitors four paragraphs apart, which is why the merge is the "
     "correct reading.")

# ---- the last five: two accepted Books rendering one Butler sentence alike --
rule([2, 4], "A", "girded", "matches-accepted",
     "Butler's dressing formula is word for word the same at B02-P001 and "
     "B04-P025 and both accepted Books render `girded his sword about his "
     "shoulder(s)` as `slung his sword over his shoulder(s)` — one rendering "
     "in two Books. Book 8 keeps `girded` at B08-P038, of a different act "
     "(girding oneself for the games), and that is Book 8's decision.")
rule([3, 4], "A", "singularly", "matches-accepted",
     "`singularly fleet of foot and in fight valiant` is Butler's epithet for "
     "Antilochus in both Books, and both render it `remarkably swift of foot "
     "and valiant in a fight` — identical, which is exactly the cross-Book "
     "consistency arrow A exists to check for. Book 8 keeps `singularly` in a "
     "different construction.")
rule([1, 2], "B", "account", "phrase-not-word",
     "`Jove shall reckon with you in full` -> `Zeus will settle the account "
     "with you in full`, word for word the same in both accepted Books, of "
     "Butler's own sentence repeated verbatim across them. `settle the "
     "account` is one fixed idiom; its two head words happen to coincide with "
     "Butler's own `account` (three times in Book 4) and his own `settle` "
     "(Books 5 and 7). One idiom, not two borrowed words. Ruled the same way "
     "from the other head at (1/2, B, `settle`).")
rule([1, 2], "B", "settle", "phrase-not-word",
     "The other head of the same idiom — see (1/2, B, `account`). `settle the "
     "account` renders Butler's `reckon with you`, and `settle` in it is not "
     "a second use of his own `settle` at B05-P013 and B07-P008.")
rule([1], "B", "showed", "phrase-not-word",
     "**Introduced by this package's own repair, and ruled rather than left "
     "to be rediscovered.** The B01-P010 repair renders Butler's `he "
     "conducted her to a richly decorated seat` as `showed her to a richly "
     "worked seat`. `show someone to a seat` is a fixed idiom for conducting "
     "them to it; it is not a second use of the simple verb that renders "
     "Butler's `shewed`, `manifested` and `displayed` in Books 3 and 4 (see "
     "(3/4, B, `showed`)). A repair that trades one collision for another "
     "unruled row is not a repair, so the row is ruled here in the same pass "
     "that created it.")
rule([3, 4], "B", "plainly", "unavoidable-merge",
     "`tell me in all plainness exactly what you saw` -> `tell me plainly and "
     "exactly`, identical in both accepted Books, beside Butler's own "
     "`plainly` in Books 2 and 7. His `in all plainness` is an adverbial "
     "periphrasis for exactly the adverb he uses elsewhere; modern English "
     "has the adverb and not the periphrasis, so the merge is what "
     "modernizing this phrase means.")

# ---- arrow C -----------------------------------------------------------
RULINGS.update({
    (1, 10, "he conducted", "led"): ("repair",
        "**Live.** Butler writes `He led the way as he spoke` and, twenty-five "
        "words later, `he conducted her to a richly decorated seat`; the "
        "candidate writes `led` for both and produces a repetition Butler "
        "avoided. This is the M-2 shape exactly. Repaired in "
        "`book01/candidate-v4.json` to `showed her to a richly worked seat`, "
        "which is the ordinary modern English for conducting somebody to a "
        "seat."),
    (1, 11, "brought", "poured"): ("artifact",
        "Butler's `a manservant brought them wine and poured it out for them` "
        "became `a manservant poured them wine` — one doublet compressed, not "
        "one word rendered as another. The diff paired `brought` with "
        "`poured` across the compression; Butler's own `poured it into a "
        "silver basin` is kept unchanged."),
    (1, 13, "and tell me true", "truly"): ("variant",
        "`tell me and tell me true` and `Tell me also truly` are Butler's own "
        "formula in two forms of ONE word, and the candidate renders both "
        "`tell me truly`. There is no discrimination to lose: `true` and "
        "`truly` are the adjective and adverb of the same lexeme, and the "
        "doubling is Homeric formula rather than a distinction."),
    (1, 14, "and tell me true", "truly"): ("variant",
        "The same formula and the same ruling as at B01-P013: `I will tell "
        "you truly` and `tell me, and tell me true` are one word in two "
        "forms."),
    (1, 14, "never", "longer"): ("phrase-not-word",
        "`he never comes to town now` -> `he no longer comes to town now`. "
        "`no longer` is a fixed adverbial phrase, not a second use of the "
        "comparative in Butler's own `he will not be away much longer` and "
        "`if I keep them waiting longer`, which are durations. Same shape as "
        "(B, `until`) at Book 7."),
    (1, 17, "so also with myself", "same"): ("homograph",
        "**Not a collision, and a pleasing one.** The word arrow C finds "
        "`kept` in this paragraph is **`Same` the island** — `Dulichium, "
        "Same, and wooded Zacynthus` — a proper noun. The rendering is `they "
        "will do the same to me`, the ordinary pronoun. Two words spelled "
        "alike with nothing whatever in common, which is `issue` at Book 7 in "
        "its purest form."),
    (1, 19, "marry", "marriage"): ("variant",
        "`make your mother marry again` -> `give your mother in marriage "
        "again`, beside Butler's own `all the marriage gifts` in the same "
        "paragraph. One lexeme, verb and noun; the recast changed the part of "
        "speech."),
    (1, 19, "prevail upon", "urge"): ("repair",
        "**Live, and inside one speech.** Butler: `I would, however, urge you "
        "to set about trying to get rid of these suitors` and, a hundred words "
        "later in the same speech by the same speaker, `let me prevail upon "
        "you to take the best ship you can get`. The candidate writes `urge` "
        "for both. Butler's two verbs are two different degrees of pressing — "
        "advice, then persuasion — and the sentence that loses the second is "
        "the one where Athena asks for the voyage the whole Book turns on. "
        "Repaired in `book01/candidate-v4.json` to `let me persuade you`."),
    (1, 23, "supported", "held"): ("phrase-not-word",
        "`the bearing posts that supported the roof` -> `the pillars that "
        "held up the roof`, beside Butler's own `She held a veil before her "
        "face`. `hold up` is a phrasal verb meaning support; `held a veil` is "
        "the simple transitive. Two verbs that share a syllable, and no "
        "referent is shared."),
    (1, 24, "celebrate", "sing"): ("repair",
        "**Live, and the candidate's own sentence convicts it.** Butler: "
        "`you know many another feat of gods and heroes, such as poets love "
        "to celebrate. Sing the suitors some one of these`. The candidate "
        "writes `that poets love to sing. Sing the suitors one of those` — "
        "the word twice at the join of two sentences, where Butler had two "
        "words and no repetition. Repaired in `book01/candidate-v4.json` by "
        "restoring Butler's `celebrate`, which is current English in this "
        "construction and needed no change; the same repair as `fashioned` at "
        "Book 7."),
    (1, 32, "women", "woman"): ("variant",
        "One word inflected for number, and the inflection follows the "
        "recast: `better than any of the other women in the house` becomes "
        "`better than any other woman in the house`, which is singular "
        "because the comparison now has one term. Butler's own `A good old "
        "woman, Euryclea` stands. The `husbands` ruling at Book 7 exactly."),
    (2, 1, "called them", "call"): ("variant",
        "`sent the criers round to call the people in assembly, so they "
        "called them` -> `to call the people to assembly; they made the "
        "call`. One lexeme, verb and noun, inside Butler's own immediate "
        "repetition of it. There is no second word."),
    (3, 21, "elsewhither", "else"): ("phrase-not-word",
        "`voyaging elsewhither among mankind` -> `voyaging somewhere else`. "
        "`somewhere else` is a fixed adverbial phrase; Butler's own `else` in "
        "this paragraph is the bound postpositive of `something else` and "
        "`anyone else`, which is a different construction and not a second "
        "referent."),
    (3, 31, "he was minded", "each"): ("artifact",
        "Butler's `had drunk each as much as he was minded` became `had drunk "
        "as much as each of them wanted`. `each` did not move — the clause "
        "was reordered around it — and the diff paired `he was minded` with "
        "the `each` that crossed the seam. There is no rendering pair."),
    (3, 31, "pray", "prayed"): ("variant",
        "`Thus did he pray` -> `So he prayed`, beside Butler's own `he prayed "
        "much` -> `he prayed at length` in the same paragraph. One word, two "
        "tenses; the inversion is what changed."),
    (3, 37, "steeds take", "horses"): ("same-referent",
        "Butler writes `horses` four times in this paragraph and `steeds` "
        "once, at its close — `so well did their steeds take them`. The "
        "candidate writes `so well did their horses carry them`. They are the "
        "same animals and Butler's own commoner word is the one used, which "
        "is the `courtyard` ruling at Book 7: his own other word for the "
        "thing he is describing. What the merge costs is the lift of register "
        "at the end of a travel formula, and the candidate pays it back with "
        "`carry` for `take`."),
    (4, 6, "by the side of", "beside"): ("variant",
        "Butler uses three surface forms of one preposition in this "
        "paragraph — `by the side of Menelaus`, `beside them`, `by their "
        "side` — and the candidate uses `beside` for all three. One "
        "preposition, not three words."),
    (4, 17, "forenoon", "morning"): ("repair",
        "**Live, and the sharpest finding of this backlog, because the "
        "candidate's own sentence is tautological.** Butler: `Morning will "
        "come in due course, and in the forenoon I care not how much I cry "
        "for those that are dead and gone.` Pisistratus is refusing to weep "
        "at the evening meal and naming the hours when weeping is proper. The "
        "candidate writes `Morning will come in its own time, and in the "
        "morning I do not care how much I cry`, which says a thing will come "
        "and that when it has come it will be there. The whole point of the "
        "sentence — the deferral — is carried by the second word and the "
        "candidate spent it on the first. Repaired in "
        "`book04/candidate-v5.json` to `and later in the day`, which keeps "
        "the deferral; it widens Butler's pre-noon hours slightly and that is "
        "recorded in `book04/continuity.md` rather than hidden."),
    (4, 37, "our ambuscade", "wait"): ("phrase-not-word",
        "`Our ambuscade would have been intolerable` -> `Lying in wait there "
        "would have been unbearable`, beside Butler's own `sat down to wait "
        "till we should come up`. `lie in wait` is a fixed idiom and `wait` "
        "in it is not a second use of the verb Butler kept. Ruled the same "
        "way from the other side at (4, B, `lying`)."),
    (4, 40, "hecatombs", "sacrifices"): ("same-referent",
        "Butler: `you must offer sacrifices to Jove ... and offered holy "
        "hecatombs to the immortal gods`. A hecatomb IS a sacrifice, so the "
        "referent is his own and the merge is not a sense change; what it "
        "costs is the SCALE, and that is the one thing accepted Books 1 and 3 "
        "both paid for with an adjective (`great sacrifice`, `fine "
        "sacrifice`) and Book 4 did not. **Book 4 was the accepted Book out "
        "of step**, which is the `luscious` shape again. The successor "
        "`book04/candidate-v5.json` writes `great and holy sacrifices`, "
        "matching Book 1's scale word. The row does not disappear and is not "
        "meant to: the noun is still Butler's own, which is what "
        "`same-referent` says."),
    (5, 12, "ever filled with", "always"): ("unavoidable-merge",
        "`his eyes ever filled with tears` -> `always full of tears`, beside "
        "Butler's own `always looking out upon the sea` in the same "
        "paragraph. `ever` in this adverbial sense and `always` are one "
        "meaning in two words of Butler's own, and modern English has only "
        "the second: `his eyes ever full of tears` is the archaism the "
        "edition exists to remove."),
    (5, 14, "meaning", "mean"): ("variant",
        "`you cannot be really meaning to help me home` -> `You cannot really "
        "mean to help me home`, beside Butler's own `unless you first "
        "solemnly swear that you mean me no mischief`. One verb, two forms; "
        "the progressive was flattened, not the word."),
    (5, 35, "laid himself", "lay"): ("unavoidable-merge",
        "`he left the river, laid himself down among the rushes` -> `lay down "
        "among the rushes`, beside `lay swooning from sheer exhaustion` -> "
        "`he lay in a faint`. Butler's reflexive `laid himself down` has "
        "exactly one modern form and it is `lay down`; the two uses are the "
        "same man in the same posture eight lines apart, so there is no "
        "discrimination to keep."),
    (6, 13, "scion", "woman"): ("unavoidable-merge",
        "**The row the whole check was built to convict, ruled at last.** The "
        "drafter of Book 6 made this call by hand and refused `creature` "
        "because it is the edition's rendering of Butler's OWN `creature` in "
        "Books 4 and 5 — which is the defect arrow B exists to catch, avoided "
        "before arrow B existed. `so fair a scion as yourself` became `so "
        "fair a young woman as yourself`, beside Butler's own `a mortal "
        "woman` and `neither man nor woman` in the same paragraph. `scion` is "
        "a shoot of a plant and has no plain modern equivalent for a person; "
        "what it prefigures — the young palm at Delos, three sentences later "
        "— is carried by that simile itself, in Butler's own words, kept. "
        "Recorded rather than repaired: no available word both reads as "
        "modern English and keeps the graft metaphor."),
})


def rows_for(book):
    """Every row of every arrow that touches this Book, with its disposition."""
    books = [(n, load("book%02d/source-book%d.json" % (n, n)), load(f))
             for n, f in ACCEPTED]
    freq = defaultdict(int)
    for _, s, _ in books:
        for p in s:
            for w in set(toks(p)):
                freq[w] += 1
    fwd, back = build(books)
    tag = "B%d-P" % book
    out = []

    for arrow, D in (("A", fwd), ("B", back)):
        for key, v in sorted(D.items()):
            if len({x for x, _ in v}) < 2:
                continue
            mine = sorted((x, p) for x, p in v if p.startswith(tag))
            if not mine:
                continue
            rends = sorted({x for x, _ in v})
            row = dict(arrow=arrow, key=key, rends=rends, mine=mine,
                       freq=freq[key])
            if (book, arrow, key) in RULINGS_BY_BOOK:
                row["klass"], row["why"] = RULINGS_BY_BOOK[(book, arrow, key)]
            elif (arrow, key) in RULINGS:
                row["klass"], row["why"] = RULINGS[(arrow, key)]
            elif len({normal(x) for x in rends}) == 1:
                row["klass"], row["why"] = "variant", (
                    "every rendering in the row reduces to `%s` once "
                    "inflection, D9 spelling and D15 compound spacing are "
                    "normalized" % normal(rends[0]))
            elif all(x == key for x, _ in mine):
                row["klass"], row["why"] = "kept", (
                    "every entry Book %d contributes is Butler's own `%s` "
                    "carried through unchanged; the decision in this row "
                    "belongs to whichever Book moved" % (book, key))
            elif arrow == "B" and freq[key] >= COMMON_RENDERING_MIN:
                row["klass"], row["why"] = "common-rendering", (
                    "`%s` is a word Butler himself uses in %d paragraphs "
                    "across seven Books, so its reuse as a rendering is not a "
                    "decision; arrow B is ungated on this side on purpose and "
                    "arrow C carries the residue" % (key, freq[key]))
            elif (all(x == key for x, p in v if not p.startswith(tag))
                  and any(not p.startswith(tag) for _, p in v)
                  and len({normal(x) for x, _ in mine}) == 1):
                row["klass"], row["why"] = "kept-elsewhere", (
                    "Book %d supplies the row's only rendering (`%s`); every "
                    "other entry is Butler's own `%s` carried through "
                    "unchanged by another Book. There is one rendering "
                    "decision in this row, not two, so there is nothing to "
                    "reconcile. **Declared blind:** this class cannot say "
                    "whether a Book that KEPT `%s` should also have moved it. "
                    "That residue is ruled by hand in `RULINGS_BY_BOOK` "
                    "wherever the kept word is not current English in its own "
                    "context (see `luscious` at Book 5)."
                    % (book, mine[0][0], key, key))
            else:
                row["klass"], row["why"] = None, None
            out.append(row)

    for n, i, span, rend in build_c(books):
        if n != book:
            continue
        row = dict(arrow="C", key=rend, rends=[span], mine=[(span, "B%d-P%03d"
                                                             % (n, i))],
                   freq=freq[rend])
        k = (n, i, span, rend)
        if k in RULINGS:
            row["klass"], row["why"] = RULINGS[k]
        elif freq[rend] >= COMMON_WORD_MIN:
            row["klass"], row["why"] = "common-word", (
                "`%s` is an ordinary word Butler uses in %d paragraphs and the "
                "two uses share no referent" % (rend, freq[rend]))
        else:
            row["klass"], row["why"] = None, None
        out.append(row)
    return out


def main():
    book = int(sys.argv[1])
    rows = rows_for(book)
    unruled = [r for r in rows if r["klass"] is None]
    counts = defaultdict(int)
    for r in rows:
        counts[r["klass"] or "UNRULED"] += 1

    L = ["# Odyssey Book %d — the collision report, dispositioned" % book, "",
         "Written by `scripts/collision_triage.py`. Every row of every arrow "
         "that touches", "this Book, with a disposition on each. **Records "
         "finding R-2 and blind spot 8**", "of `book07/review/findings-v1.md`: "
         "the check returned seventy-two rows touching",
         "Book 7, eleven were acted on, and sixty-one were dismissed with no "
         "record of",
         "having been read. This file is that record, and it is generated, not "
         "typed.", "",
         "**%d rows touch Book %d.**" % (len(rows), book), "",
         "| disposition | rows |", "|---|---|"]
    for k in sorted(counts):
        L.append("| `%s` | %d |" % (k, counts[k]))
    L += ["", "The vocabulary is defined in the script's docstring. `homograph`,",
          "`same-referent`, `unavoidable-merge` and `phrase-not-word` are new "
          "here;",
          "`homograph` is the one the review asked for by name.", ""]

    for arrow, title in (("A", "ARROW A — one Butler word, two or more "
                                "renderings, across Books"),
                         ("B", "ARROW B — one rendering, two or more Butler "
                                "words, across Books"),
                         ("C", "ARROW C — one paragraph, one rendering ← a "
                                "word Butler keeps in that same paragraph")):
        rs = [r for r in rows if r["arrow"] == arrow]
        L += ["## %s" % title, "", "%d rows." % len(rs), "",
              "| key | this Book's entries | disposition | reason |",
              "|---|---|---|---|"]
        for r in rs:
            mine = ", ".join("`%s` (%s)" % (x, p) for x, p in r["mine"])
            L.append("| `%s` | %s | **`%s`** | %s |"
                     % (r["key"], mine, r["klass"] or "UNRULED",
                        (r["why"] or "").replace("\n", " ")))
        L.append("")

    path = ROOT / ("book%02d/collisions.md" % book)
    path.write_text("\n".join(L) + "\n", encoding="utf-8")
    print("%s: %d rows" % (path.relative_to(ROOT), len(rows)))
    for k in sorted(counts):
        print("  %-20s %d" % (k, counts[k]))
    if unruled:
        print("\n%d row(s) have NO disposition. Every row touching a Book must "
              "be ruled or dismissed with a reason." % len(unruled))
        for r in unruled:
            print("  ✗ %s %-14s %s" % (r["arrow"], r["key"], r["mine"]))
        return 1
    print("\nEvery row touching Book %d has a disposition." % book)
    return 0


if __name__ == "__main__":
    sys.exit(main())

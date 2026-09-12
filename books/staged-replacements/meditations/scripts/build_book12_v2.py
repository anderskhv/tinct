#!/usr/bin/env python3
"""Apply the round-1 independent-review corrections to Book XII.

Reads book12/candidate-v1.json (frozen at sha256 8665adc8...), applies the
substitutions in CHANGES (each must match exactly once in its paragraph),
writes candidate-v2.json, candidate-v2-readable.md and changes-v1-to-v2.md,
and prints a per-paragraph word diff so every changed passage can be verified
against source-book12.json. Same pattern as scripts/build_book11_v2.py.

Two things are asserted here that the Book XII README check block could not:

* the punctuation tally is compared by COMMA POSITION, not by net comma count
  (finding 2.1: XII.2 removes one comma and adds another, so its net is zero
  and the old check could not see either change);
* the bracket arithmetic is asserted from an enumerated list rather than from a
  numeral (the Book X finding C1 ruling), as v1's check already did.
"""
import json, os, hashlib, difflib, re

HERE = os.path.dirname(os.path.abspath(__file__))
B12 = os.path.join(HERE, '..', 'book12')
PG = os.path.join(HERE, '..', 'source', 'pg15877-long-1862.txt')
STAGED = os.path.join(HERE, '..', 'meditations-original-en.staged.json')
N = 36
V1_SHA = '8665adc87689b8a97c26e6b16277a9c7132aa9d92762c71a702322f04e71863c'

# (paragraph number, finding id, old text, new text) -- applied in order
CHANGES = [
 (3,  '3.1',  'whatever the vortex that flows round you from outside whirls about',
              'whatever the vortex that flows round from outside whirls about'),
 (3,  '1.1/3.2', 'if you will separate, I say, from this ruling part',
              'if you separate, I say, from this ruling part'),
 (3,  '1.1/3.2', "and will make yourself like Empedocles' sphere",
              "and make yourself like Empedocles' sphere"),
 (4,  '4.1',  'than for what we shall think of ourselves.',
              'than for what we will think of ourselves.'),
 (5,  '5.1',  'for you see even of yourself that in this inquiry',
              'for you see for yourself that in this inquiry'),
 (15, '15.1', 'and justice and temperance, be extinguished before your death?',
              'and justice and temperance be extinguished before your death?'),
 (18, '18.1', 'dividing it into its form, its matter, its purpose, and the time',
              'dividing it into the form, the matter, the purpose, and the time'),
 (26, '26.1', "every man's intelligence is a god and flows out from the divine",
              "every man's intelligence is a god and an outflow from the divine"),
 (34, '34.1', 'This reflection is most adapted to move us to contempt of death',
              'This reflection is best suited to move us to contempt of death'),
 (36, '36.1', 'whether for five years or three? For that which is in accordance with the laws',
              'whether for five years or three? for that which is in accordance with the laws'),
 (36, '36.1', 'who brought you into it? The same as if a praetor',
              'who brought you into it? the same as if a praetor'),
]

# The one dagger clause (0-based index, clause in source, clause in v2)
DAGGERS = [
 (15, 'If then thou art irritable, cure this man', 'If then you are irritable, cure this man'),
]

# --- the bracket arithmetic, asserted from the list rather than from a numeral
FOLDS = [
 (14, 'be extinguished before your death?',        'XII.15 "[before thy death]"'),
 (15, 'having done wrong, say, How then do I know', 'XII.16 "[say]"'),
 (35, 'a citizen in this great state, the world',   'XII.36 "[the world]"'),
 (35, 'whether for five years or three?',           'XII.36 "[or three]"'),
]
D11_DROPS = [
 (1,  '[ruling principles]', 'ruling principles', 'XII.2 "[ruling principles]"'),
 (2,  'a little breath [life], intelligence', '[life]', 'XII.3 "[life]" (1)'),
 (2,  'in the breath [life], which is by nature', '[life]', 'XII.3 "[life]" (2)'),
 (2,  '[to the god that is within thee]', 'that is within', 'XII.3 "[to the god that is within thee]"'),
 (7,  '[forms]', 'forms', 'XII.8 "[forms]"'),
 (26, '[or Rufus at Velia]', 'Velia', 'XII.27 "[or Rufus at Velia]"'),
 (29, '[or individuals]', 'individuals', 'XII.30 "[or individuals]"'),
]
TEXTUAL_DOUBT_MARKS = [
 (16, '[For let thy efforts be—]', 'For let your efforts be—', 'XII.17 "[For let thy efforts be—]"'),
]
D13_DROPS = []   # Book XII contains no bracketed translator's note of the X.23 kind

# --- every comma difference that falls inside text otherwise identical to Long.
# Four additions, four removals; the two remaining additions lie inside spans
# whose wording was modernised and are enumerated below. (Finding 2.1.)
EXPECTED_COMMA_DIFF = [
 (1,  'added',   'piety'),      # XII.1, making Long's two parallel sentences agree
 (2,  'removed', 'him'),        # XII.2, between a long subject and its verb
 (3,  'added',   'breath'),     # XII.3, Long's comma after the dropped "[life]" (1)
 (3,  'added',   'breath'),     # XII.3, Long's comma after the dropped "[life]" (2)
 (16, 'added',   'wrong'),      # XII.16, before the folded "[say]"
 (16, 'removed', 'wrong'),      # XII.16, between a long subject and its verb
 (23, 'removed', 'act'),        # XII.23, with the first resumptive construction
 (23, 'removed', 'time'),       # XII.23, with the second resumptive construction
 (30, 'added',   'together'),   # XII.30, before Long's elliptical second subject
 (36, 'added',   'state'),      # XII.36, the apposition fold "[the world]"
]
# (0-based paragraph, Long without the comma, candidate with it)
COMMAS_IN_MODERNISED_WORDING = [
 (14, 'the truth which is in thee and justice', 'the truth which is in you, and justice'),
 (1,  'and such like externals and show', 'and externals of that kind, and show'),
]

APPLIED = (
 "## The eleven minor findings — all applied\n\n"
 "The round-1 verdict was *Accept after corrections* with **0 substantive** findings: \"nothing is "
 "missing, nothing is added, nothing is softened, nothing is expanded, nothing is imported, and the "
 "last meditation carries no valedictory colour that Long does not have\". Eleven minor findings "
 "and six optional preferences were raised. **All eleven minor findings are applied.** Seven change "
 "the text (1.1 with 3.2, 4.1, 5.1, 15.1, 34.1, 36.1); four are record corrections that change no "
 "word (2.1, 23.1, C1, C2).\n\n"
 "**1.1 with 3.2 — applied, and decided once for the book.** Long's \"wilt\" in a conditional "
 "was dropped at XII.1 (\"if thou wilt take no notice of all the past\" → \"if you take no "
 "notice\") and kept at XII.3 (\"if thou wilt separate, I say\" → \"if you will separate, I "
 "say\"; \"and wilt make thyself\" → \"and will make yourself\"). Neither treatment breaks a "
 "rule — the \"shall\" rule governs \"shall / shalt\" and says nothing about \"wilt\" — "
 "but the same modal in the same position was decided two ways two sections apart, and "
 "`continuity.md` did not record the XII.1 drop at all. **Aligned on the present**, which is what "
 "English uses in an if-clause and what XII.1 already had: v2 reads \"if you separate, I say, from "
 "this ruling part\" and \"and make yourself like Empedocles' sphere\". The reviewer's reason is "
 "the deciding one: \"if you will separate\" reads as volitional — *if you are willing to* "
 "— which imports a shade Long's plain future does not carry, and \"and will make yourself\" "
 "inside a protasis is marked English. The alternative the reviewer allowed (keep \"will\" in all "
 "three) is equally consistent but would have put a modal into two clauses that do not need one "
 "and would have left XII.1 the odd one out. The treatment is now recorded beside the \"shall\" "
 "inventory in `continuity.md`, so that \"wilt\" is not left as an unruled class.\n\n"
 "**2.1 — applied as a record correction; no word changes, and the mechanical check is "
 "repaired as well.** Two punctuation changes at XII.2 were undocumented in a sheet that calls its "
 "tally exhaustive: a comma removed between Long's long subject and its verb (\"he who regards not "
 "the poor flesh which envelops him**,** surely will not trouble himself\") and a comma added "
 "before the last member of his polysyndetic list (\"and externals of that kind**,** and show\"). "
 "Both are right — the removal is the X.6 / X.20 / X.33 / XI.10 / XI.21 class, and the "
 "addition is earned, because with \"such like\" moved behind the noun as \"of that kind\", "
 "\"externals of that kind and show\" can be read as \"externals and show, both of that kind\". "
 "Both are now in `continuity.md`, and the tally reads **two commas removed between a long subject "
 "and its verb (XII.2, XII.16)** and **six commas added, not five**. **The reviewer's second point "
 "is taken too**: the check block asserted *net* comma counts per paragraph, so a paragraph that "
 "swaps one comma for another passed unseen. `scripts/build_book12_v2.py` and the `README.md` "
 "check now compare **comma positions** — the sequence of words each comma follows — so "
 "every added and removed comma in the book is enumerated and asserted individually.\n\n"
 "**4.1 — applied; \"will\" in both halves of the comparison.** v1 read \"So much more respect "
 "do we have for what our neighbors **will** think of us than for what we **shall** think of "
 "ourselves\", which is what the rule mechanically produces (third-person plain future → "
 "\"will\"; first person kept). But the rule's licence for first-person \"shall\" is stated as a "
 "condition and not a blanket — it is kept \"only where it is current English **in its own "
 "right**\" — and in every earlier instance the package keeps (II.1, VIII.45, X.6 ×5, "
 "XI.18 ×2) the \"shall\" stands alone. Here two futures are set against each other four words "
 "apart in one balanced comparison, and a modern reader without the prescriptive distribution hears "
 "the switch as marking a difference between the clauses, when the whole force of the sentence is "
 "that they are the *same* act of anticipation differently valued. v2 reads \"than for what we "
 "**will** think of ourselves.\" **Consequence for the inventory: the candidate now keeps none of "
 "Long's ten \"shall / shalt\"**, and the rule's other instances, all unpaired, are untouched.\n\n"
 "**5.1 — applied; a dead idiom retired.** XII.5 read \"for you **see even of yourself** that "
 "in this inquiry you are disputing with the divine\". \"Of yourself\" in the sense *unprompted, "
 "without being told* is no longer current: a modern reader either gets nothing or reads \"of "
 "yourself\" as the object of \"see\". The thou-form had been converted and the idiom had not, "
 "which is the same defect the book fixes at XII.2 (\"regards not\" → \"does not regard\"). v2 "
 "reads \"for you **see for yourself** that in this inquiry you are disputing with the divine\". "
 "**Long's \"even\" goes with the idiom, and that is deliberate:** \"even of thyself\" is one "
 "idiomatic unit — *of your own accord, without being told* — and \"for yourself\" "
 "carries the whole of it, where \"even for yourself\" would read as a different claim (*even in "
 "your own case*). The reviewer's second option, \"you see even without being told\", says the same "
 "thing in more words and further from Long; \"for yourself\" is preferred, as the reviewer "
 "prefers it.\n\n"
 "**15.1 — applied; the second added comma goes.** v1 read \"and will the truth which is in "
 "you**,** and justice and temperance**,** be extinguished before your death?\" The first comma "
 "does real work: without it \"the truth which is in you and justice and temperance\" reads as one "
 "relative clause with three objects of \"in\". The second closes a parenthesis, and its effect is "
 "to make \"and justice and temperance\" an aside about the truth rather than two further subjects "
 "of \"be extinguished\" — the opposite of what is wanted. It also sits between a compound "
 "subject and its verb, which is exactly the comma this book removes at XII.2 and XII.16 on the "
 "X.6 / X.20 / X.33 / XI.10 / XI.21 practice, so XI.21's ruling (decide two identical constructions "
 "alike) was being applied against itself. v2 reads \"and will the truth which is in you, and "
 "justice and temperance be extinguished before your death?\" The reviewer's alternative — "
 "drop both and leave Long unpunctuated, on Book IX's finding 7.1 — is declined for the "
 "reviewer's own reason: the first comma resolves a genuine ambiguity, not an unevenness.\n\n"
 "**23.1 — applied as a record correction; the repairs stand, their stated ground does not.** "
 "`continuity.md` said of both XII.23 resumptive repairs that \"no word is added or dropped\". A "
 "word is dropped in each, and it is the same word: Long's resumptive \"he\" (\"nor he who has done "
 "this act, **does he** suffer any evil\"; \"nor he who has terminated this series at the proper "
 "time, **has he** been ill dealt with\"). That is exactly right as a repair — the resumptive "
 "pronoun *is* the construction, and removing the construction removes it — but the false "
 "claim was the ground on which the repairs were put to the reviewer. The entry now reads: *Long's "
 "resumptive pronoun is removed with the construction it belongs to — two words in all, \"he\" "
 "in each clause — and no other word is added, dropped or reordered beyond the fronting the "
 "repair requires.* The text is unchanged; the reviewer allowed the repairs.\n\n"
 "**34.1 — applied; one byte-identical paragraph is byte-identical no longer, and rightly.** "
 "XII.34 read \"This reflection is **most adapted to move** us to contempt of death\". \"Adapted "
 "to\" in the sense *suited to* is the one dead usage among the five byte-identical paragraphs; the "
 "live modern sense is *altered to fit*, so a reader can take the sentence as \"this reflection has "
 "been most altered in order to move us\", which is not merely obscure but wrong. It survived "
 "because the paragraph carried no thou-form to force a second look. v2 reads \"This reflection is "
 "**best suited to move** us to contempt of death\". Two words for two, the rest untouched, and the "
 "byte-identical count drops from five to four — which is the right outcome, since a "
 "byte-identical paragraph is a result and not a target. **The class is wider than this book** and "
 "is carried to the cross-book pass: \"adapted to\" in the dead sense also stands at V.8, VI.16 and "
 "X.11 in accepted books.\n\n"
 "**36.1 — applied; Long's lowercase restored after both question marks.** v1 printed \"? "
 "**For** that which is in accordance with the laws\" and \"? **The** same as if a praetor\", and "
 "`continuity.md` recorded the capitalisation as \"the only change\" in those two places. But "
 "lowercase after a question mark is Long's settled habit and the package's settled practice: it "
 "stands twice in Book XII itself (XII.15 \"? **and** will the truth\", XII.33 \"? **for** all lies "
 "in this\") and at VIII.17, VIII.36, IX.40, X.1 ×2, X.24 ×5 and X.30 in the accepted "
 "books — including three accepted instances of the very construction capitalised here, a "
 "question mark followed by \"for\". Capitalising twice in the last paragraph of the last book "
 "would have left one construction punctuated two ways inside one book and one way in every other, "
 "against Book IX's finding 7.1 ruling that Long's uneven punctuation is not normalised for "
 "evenness. v2 restores \"? for that which is in accordance with the laws is just for all.\" and "
 "\"? the same as if a praetor who has employed an actor dismisses him from the stage.\"\n\n"
 "**C1 — applied; the nine-space leak lands in XII.4, not XII.3.** The methodological finding "
 "is confirmed and untouched: PG 6886 is the second half of footnote [A]'s body, indented **nine** "
 "spaces, and the Book XI reviewer's alternative rule — drop the four-space runs — would "
 "have kept it and leaked `[Greek: Sphairos kykloteres monie perigethei gaion.]` into the body. But "
 "the reviewer did not reason about the rule; it implemented it and ran it, and the block stands "
 "between the end of XII.4 (PG 6881, \"of ourselves.\") and the start of XII.5 (PG 6890), so \"the "
 "paragraph before it\" is **XII.4**. XII.3 ends at PG 6872 and the whole of XII.4 stands between. "
 "The section number is corrected in all four documents that carried it — `../PROVENANCE.md` "
 "§4, `README.md`, `continuity.md` and `review-instructions.md` — **and the conclusion is "
 "kept verbatim: \"a number taken from one book does not transfer; only the shape of the rule "
 "does.\"** The finding's force is that a verification claim must be checkable, and a checkable "
 "claim with a wrong number in it is what makes the next agent distrust the right part.\n\n"
 "**C2 — applied; the ratio note no longer contradicts itself, and the claim it supports is "
 "stronger than it was stated.** The sheet read: \"Of the paragraphs that carry no apparatus at "
 "all, none is below 0.96 — the lowest are XII.19 (0.96, which is its cross-reference) and "
 "XII.21 (0.96, likewise).\" XII.19 and XII.21 both carry a cross-reference, as the same sentence "
 "says, so they cannot be the lowest of the paragraphs carrying none. Recomputed paragraph by "
 "paragraph: of the twenty-two paragraphs carrying neither a bracket nor a cross-reference the "
 "lowest is **XII.29 at 0.983**, then XII.4, XII.23 and XII.1. The entry now reads: *Of the "
 "paragraphs that carry no apparatus at all, none is below 0.98; the lowest is XII.29 at 0.983, "
 "whose entire difference is the base-text correction and the glossary row. XII.19 (0.96) and "
 "XII.21 (0.96) are the lowest paragraphs whose only apparatus is a cross-reference.* The figures "
 "are recomputed by this build script against v2 rather than carried over."
)

OPTIONAL = (
 "## The six optional findings — three applied, three recorded\n\n"
 "**3.1 — applied.** XII.3's \"whatever **the vortex that flows round you from outside** "
 "whirls about\" supplied an object Long does not have: he says what the vortex is, not what it "
 "circles. The rendering of \"circumfluent\" as \"that flows round\" and of \"external\" as \"from "
 "outside\" is right and stands; the supplied \"you\" goes. v2 reads \"whatever the vortex that "
 "flows round from outside whirls about\". The surrounding clauses are explicit about their objects "
 "(\"in the body which envelops you\", \"attached to you\"), so Long's silence here is audible, and "
 "the package's standard is that nothing is added. Applied under **D8**: `continuity.md` recorded "
 "no considered reason for the addition, so there was nothing on record better than the reviewer's "
 "point.\n\n"
 "**14.1 — applied as a record correction; no word changes.** XII.14's supplied indefinite "
 "article (\"a fatal necessity **and invincible order**\" → \"a necessity of fate **and an "
 "invincible order**\") is right and close to forced — without it, \"a necessity of fate and "
 "invincible order\" reads as one compound thing and destroys the three-way choice the meditation "
 "turns on — but it was not recorded, and it is invisible in the word count because the "
 "dropped cross-reference offsets it. Now recorded at XII.14.\n\n"
 "**18.1 — applied.** XII.18 read \"dividing it into **its** form, **its** matter, **its** "
 "purpose, and the time within which it must end\". The glossary row licenses \"form\" and "
 "\"matter\" for Long's nominalised adjectives and names XII.18; it does not license the change of "
 "determiner. v2 keeps Long's articles: \"dividing it into **the** form, **the** matter, **the** "
 "purpose, and the time within which it must end.\" One fewer departure for the same clarity, and "
 "it matches XII.29, where \"its\" is Long's own word and is therefore his.\n\n"
 "**26.1 — applied.** XII.26 read \"every man's intelligence is a god and **flows out from** "
 "the divine\". Retiring \"efflux\" is right — it now reads as a discharge of fluid or gas, "
 "and the accepted Book II renders the same noun as a flowing at II.4 — but Long's sentence is "
 "two predicate nominals in parallel (\"is a god\", \"is an efflux of\"), and a finite verb phrase "
 "loses the parallel. v2 reads \"every man's intelligence is a god and **an outflow from** the "
 "divine\": one word for one word, plain current English, Long's noun and his parallel both kept, "
 "and the II.4 precedent untouched, since II.4 renders a different sentence.\n\n"
 "**27.1 — applied as a record correction; no word changes and PG still stands.** "
 "`continuity.md` said of PG's \"Fabius **Catellinus**\" against SE's \"Catullinus\" that \"both "
 "are possible Roman cognomina and **nothing in the sentence decides** between them\". Nothing in "
 "the *sentence* does, but Catullinus is the form the standard editions carry and an attested "
 "cognomen of the gens Fabia, and Catellinus is not attested — an argument of the same species "
 "as, though much weaker than, the one that carries \"Baiae\" three words later. The entry now "
 "reads: *the name is less well attested than SE's form, but it is a possible cognomen and the "
 "departure threshold is not met — the threshold is that the printed word names nothing "
 "(Briae) or makes the sentence say the opposite of its argument (XII.29), and \"Catellinus\" meets "
 "neither; PG stands under D6.* \"Nothing decides\" invited a later editor to reopen it as an "
 "oversight; \"the threshold is not met\" closes it.\n\n"
 "**C3 — applied; D13's textual-doubt sentence is widened at acceptance.** The row described "
 "the class by XI.26's bracketed proper name alone, and XII.17 extends it to a whole clause. The "
 "sentence now reads \"a word **or a clause**\" and names both instances (XI.26's \"[Ephesians]\", "
 "XII.17's \"[For let thy efforts be—]\"), so that a class illustrated only by a one-word "
 "instance is not read as word-sized. This is the same discipline as the Book XI amendment that "
 "forbade D13 a size threshold, and it is what the ledger is for."
)

RULINGS = (
 "## The rulings, all confirming the drafter's calls\n\n"
 "Every one of the five flagged decisions, the point offered for confirmation and the two points "
 "put with reasons was ruled on, and **every substantive call stands**. "
 "**XII.27 \"Baiae\" and XII.29 \"what\" — both confirmed**, each on its own evidence, with "
 "the reviewer noting that the *number* of departures in a book is a symptom and not a standard; "
 "XII.29 is \"the stronger evidence of the two\", because \"that\" turns the second member of a "
 "three-member series of questions into an assertion identifying a thing with its matter — the "
 "identity the meditation exists to deny — and strands the elided verb of the third. "
 "**XII.3's \"[to the god that is within thee]\" — route and outcome confirmed**; the VII.17 "
 "alternative is declined, because VII.13 and VII.17 keep Long's Greek where the meditations *are* "
 "arguments about the Greek words, and XII.3 contains no such argument. "
 "**XII.17's \"[For let thy efforts be—]\" — confirmed**, and D13's own Book XI amendment "
 "(\"voice and subject, not length\") is read as supporting the extension from a word to a clause; "
 "the row is widened at acceptance (C3). "
 "**XII.27's \"[or Rufus at Velia]\" — confirmed**: D11 reaches an alternative *construal*, "
 "and unlike the XI.26 / XII.17 class the bracketed words cannot stand as text once the mark is "
 "removed. "
 "**\"Pancratiast\" at XII.9 — confirmed.** "
 "**XII.23's two resumptive repairs — allowed** (with finding 23.1 correcting their stated "
 "ground). "
 "**The added commas — four of the five earned**, XII.15's second not (finding 15.1), and "
 "there are six, not five (finding 2.1). "
 "**D13 fires nowhere in Book XII — agreed**, tested bracket by bracket against the row's own "
 "voice-and-subject test; X.23 remains its only instance in the work, and the rule is not idle for "
 "that, since it is what stopped a Books XI–XII drafter folding such a bracket. "
 "**The XII.12 stray \"18\" never reaches the candidate — confirmed.** "
 "**The step-1 no-rebuild finding — upheld**, by a third reconstruction of a third kind "
 "(`review/verify_book12_source_review.py`, which uses no indentation magnitude at all and decides "
 "each indented run by sentence continuity in the body accumulated so far): 36 paragraphs, one "
 "differing paragraph, XII.16, differing only by the documented dagger. **Only finding 4.1 went "
 "against the drafter's disposition, and it is a ruling on a rule, not an error.**"
)

NOT_CHANGED = (
 "**Findings applied: all eleven minor (1.1, 2.1, 3.2, 4.1, 5.1, 15.1, 23.1, 34.1, 36.1, C1, C2) "
 "and three of the six optional (3.1, 18.1, 26.1); the other three optional findings (14.1, 27.1, "
 "C3) are record corrections and are applied as such, so every one of the seventeen findings is "
 "answered and none is declined.** There was no substantive finding. Ten substitutions in eight "
 "paragraphs change the text; seven findings change the record and no word (2.1, 14.1, 23.1, 27.1, "
 "C1, C2, C3). Of the reviewer's unnumbered \"also noted\" remarks none required a change: they "
 "confirm renderings the glossary or `continuity.md` already fixes — XII.1's \"but because "
 "you fear\", XII.4's bare infinitive after \"bid\", XII.6's \"practice yourself\", XII.12's "
 "dropped cross-reference and its stray \"18\", XII.16's dagger clause and its bare infinitives "
 "after causative \"have\", XII.20's \"without consideration\", XII.22's \"doubled the "
 "promontory\", XII.29's asymmetric ellipsis, XII.31's physical \"movement\", XII.35's closing "
 "inversion, and XII.36's \"will be a complete drama\"."
)

FLOW = (
 "**Flow read (step 7):** `candidate-v2-readable.md` read continuously XII.1–XII.36 after the "
 "build. No change was made from the read.\n\n"
 "The eight corrected paragraphs read without a snag in place. XII.3's long conditional now runs "
 "on one modal footing from its first clause to its last — \"if you separate … if you "
 "separate, I say … and make yourself like Empedocles' sphere … and if you strive\" "
 "— which is what the sentence is: one condition stated, restated and extended, not a "
 "willingness asked for; and the vortex now flows round from outside without being told what it "
 "circles, as in Long. XII.4's comparison balances on one modal, so the sentence's point (that the "
 "two anticipations are the same act, differently valued) is no longer cut across by its own "
 "grammar. XII.5's \"for you see for yourself that in this inquiry you are disputing with the "
 "divine\" is the first place in the paragraph where Marcus turns on himself, and it now lands. "
 "XII.15's question keeps the one comma that disambiguates and loses the one that made two of its "
 "three subjects an aside. XII.18's \"the form, the matter, the purpose, and the time\" reads as "
 "Long's list of four. XII.26's \"is a god and an outflow from the divine\" restores the parallel "
 "of the two predicates. XII.34 no longer says that the reflection has been altered. And XII.36 "
 "— the last paragraph of the last book — now punctuates its two question marks as "
 "XII.15 and XII.33 do eight and twenty sections earlier.\n\n"
 "The book still reads as one self-address in one voice, and the closing meditation carries no "
 "valedictory colour Long does not have: \"Depart then satisfied, for he also who releases you is "
 "satisfied\" is his sentence and his word twice. Pacing survives the modernisation: the three long "
 "argumentative sections (XII.1, XII.3, XII.5) still open the book slowly, the middle run of "
 "one-line meditations (XII.7, XII.10, XII.11, XII.13, XII.17, XII.25) still lands as a change of "
 "tempo, and the actor-and-praetor image still closes it. Terminology holds across the book and "
 "across the eleven accepted ones: \"the whole\" and \"the universe\" never drift into each other; "
 "\"the ruling part\" (XII.1, XII.3, XII.33) is one phrase; \"the god within\" covers XII.1's "
 "\"divinity within thee\" and XII.3's \"daemon\", and \"the divine\" every bare abstract; "
 "\"impressions\" and \"movement\" keep the glossary's lines; \"opinion\" is never expanded; "
 "\"feelings\" carries XII.19's \"affects\". Long's own uncommon but current words stand because "
 "they are his: \"pancratiast\", \"praetor\", \"propitiated\", \"doubled the promontory\". The "
 "dagger clause at XII.16 leaves its sentence exactly as abrupt as Long leaves it, and XII.17 stops "
 "where Long's Greek stops. Four paragraphs are now byte-identical to Long (XII.7, XII.10, XII.11, "
 "XII.13); the fifth was XII.34, and finding 34.1 was right to take it."
)


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def comma_tokens(text):
    """(word, comma-follows-it) for every word of a paragraph."""
    out = []
    for w in text.split():
        w = w.rstrip()
        out.append((w.rstrip(',').rstrip(), w.endswith(',') or w.endswith(',\u2014')))
    return out


def comma_diff(source, candidate):
    """Every comma difference that falls inside text otherwise identical to Long.

    Aligns the two paragraphs word by word (commas stripped) and compares the
    comma that follows each aligned pair. This is the positional check finding
    2.1 asks for: a paragraph that removes one comma and adds another nets to
    zero and is invisible to a count, but shows here as two entries. Commas
    inside a span where the wording itself changed cannot be aligned and are
    enumerated separately in COMMAS_IN_MODERNISED_WORDING.
    """
    st, ct = comma_tokens(source), comma_tokens(candidate)
    sm = difflib.SequenceMatcher(a=[w for w, _ in st], b=[w for w, _ in ct], autojunk=False)
    out = []
    for i1, j1, n in sm.get_matching_blocks():
        for k in range(n):
            if st[i1 + k][1] != ct[j1 + k][1]:
                out.append(('removed' if st[i1 + k][1] else 'added', st[i1 + k][0]))
    return out


def main():
    v1 = json.load(open(os.path.join(B12, 'candidate-v1.json'), encoding='utf-8'))
    src = json.load(open(os.path.join(B12, 'source-book12.json'), encoding='utf-8'))
    assert sha(os.path.join(B12, 'candidate-v1.json')) == V1_SHA, 'v1 is frozen'
    paras = list(v1['paragraphs'])
    log = []
    for n, fid, old, new in CHANGES:
        i = n - 1
        assert paras[i].count(old) == 1, (n, fid, old)
        paras[i] = paras[i].replace(old, new)
        log.append((n, fid, old, new))
    v2 = {'number': v1['number'], 'title': v1['title'], 'paragraphs': paras}
    assert len(paras) == N and all(p.startswith(f'{i+1}. ') for i, p in enumerate(paras))

    # --- bracket arithmetic, asserted from the list (Book X finding C1 ruling)
    total_brackets = sum(p.count('[') for p in src['paragraphs'])
    assert total_brackets == 12, total_brackets
    for k, needle, label in FOLDS:
        assert needle in paras[k], ('fold missing', label)
    for k, in_src, gone, label in D11_DROPS:
        assert in_src in src['paragraphs'][k], ('D11 source', label)
        assert gone not in paras[k], ('D11 not dropped', label)
    for k, in_src, stands, label in TEXTUAL_DOUBT_MARKS:
        assert in_src in src['paragraphs'][k] and stands in paras[k], label
    assert (len(FOLDS), len(D11_DROPS), len(TEXTUAL_DOUBT_MARKS), len(D13_DROPS)) == (4, 7, 1, 0)
    assert len(FOLDS) + len(D11_DROPS) + len(TEXTUAL_DOUBT_MARKS) + len(D13_DROPS) == total_brackets
    assert not any('[' in p for p in paras)
    assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p) for p in paras)
    assert [i + 1 for i, p in enumerate(src['paragraphs'])
            if re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p)] == [3, 12, 14, 19, 21, 35]

    # --- the one dagger clause, with Long's comma
    for k, s_, c_ in DAGGERS:
        assert s_ in src['paragraphs'][k] and c_ in paras[k], k

    # --- the corrections themselves (finding by finding)
    assert 'the vortex that flows round from outside' in paras[2]        # 3.1
    assert 'flows round you from outside' not in paras[2]
    assert 'if you separate, I say, from this ruling part' in paras[2]   # 1.1 / 3.2
    assert "and make yourself like Empedocles’ sphere" in paras[2] or \
           "and make yourself like Empedocles' sphere" in paras[2]
    assert 'will separate, I say' not in paras[2] and 'and will make yourself' not in paras[2]
    assert 'than for what we will think of ourselves' in paras[3]        # 4.1
    assert 'we shall think' not in paras[3]
    assert 'you see for yourself that in this inquiry' in paras[4]       # 5.1
    assert 'see even of yourself' not in paras[4]
    assert 'and justice and temperance be extinguished' in paras[14]     # 15.1
    assert 'and temperance, be extinguished' not in paras[14]
    assert 'into the form, the matter, the purpose, and the time' in paras[17]   # 18.1
    assert 'into its form' not in paras[17]
    assert 'is a god and an outflow from the divine' in paras[25]        # 26.1
    assert 'flows out from the divine' not in paras[25]
    assert 'is best suited to move us to contempt of death' in paras[33]  # 34.1
    assert 'most adapted' not in paras[33]
    assert 'or three? for that which is in accordance with the laws' in paras[35]   # 36.1
    assert 'into it? the same as if a praetor' in paras[35]
    assert '? For that' not in paras[35] and '? The same' not in paras[35]
    # the two places the same construction is kept lowercase, unchanged by v2
    assert 'its splendor until it is extinguished? and will the truth' in paras[14]
    assert 'make use of itself? for all lies in this' in paras[32]

    # --- unchanged by v2: rulings confirmed at round 1
    assert 'Stertinius at Briae' in src['paragraphs'][26] and 'Stertinius at Baiae' in paras[26]
    assert 'that is its material' in src['paragraphs'][28] and 'what is its matter' in paras[28]
    assert 'Fabius Catellinus' in src['paragraphs'][26] and 'Fabius Catellinus' in paras[26]
    assert 'disputing with the divine' in paras[4]
    assert 'without a governor' in paras[13]
    assert 'who dwell all around in the air' in paras[23]
    assert 'the same thing in his mind' in paras[22]
    assert 'pancratiast' in paras[8]
    assert 'For let your efforts be—' in paras[16]
    assert 'obedient to the god within you' in paras[2]
    assert 'nor does he who has done this act suffer any evil' in paras[22]
    assert 'nor has he who has terminated this series at the proper time been' in paras[22]
    assert 'fig tree' in paras[15] and 'fig-tree' in src['paragraphs'][15]
    assert 'Practice yourself' in paras[5] and 'practiced in this' in paras[5]

    # --- the "shall" inventory after finding 4.1: Long has ten, the candidate keeps NONE
    assert sum(len(re.findall(r'\bshal[lt]\b', p, re.I)) for p in src['paragraphs']) == 10
    assert [i + 1 for i, p in enumerate(paras) if re.search(r'\bshall\b', p, re.I)] == []
    assert not any(re.search(
        r'\b(thou|thy|thee|thyself|shalt|hast|dost|doest|wilt|wast|wert|hadst|shouldst|thine|'
        r'seest|usest|sayest|mayest|mayst|worshippest|creepest|despairest)\b', p) for p in paras)

    # --- punctuation, compared BY POSITION rather than by net count (finding 2.1)
    assert sum(p.count(',\u2014') for p in src['paragraphs']) == 2      # XII.3, XII.19
    assert sum(p.count(',\u2014') for p in paras) == 0
    positional = []
    for i, (s_, c_) in enumerate(zip(src['paragraphs'], paras)):
        positional += [(i + 1, kind, w) for kind, w in comma_diff(s_, c_)]
    assert positional == EXPECTED_COMMA_DIFF, positional
    for k, without, with_ in COMMAS_IN_MODERNISED_WORDING:
        assert without in src['paragraphs'][k] and with_ in paras[k], (k, with_)
    # The whole tally, from the enumerated lists rather than from a numeral:
    # SIX commas added (finding 2.1 corrects "five"), SIX removed, TWO of Long's
    # own commas relocated onto the preceding word by a D11 drop at XII.3.
    reloc = [x for x in positional if (x[0], x[2]) == (3, 'breath')]
    assert len(reloc) == 2
    added_commas = [x for x in positional if x[1] == 'added' and x not in reloc]
    removed_commas = [x for x in positional if x[1] == 'removed']
    assert len(added_commas) + len(COMMAS_IN_MODERNISED_WORDING) == 6, added_commas
    assert len(removed_commas) + sum(p.count(',\u2014') for p in src['paragraphs']) == 6
    assert sorted(n for n, _, _ in added_commas) + \
        sorted(n + 1 for n, _, _ in COMMAS_IN_MODERNISED_WORDING) == [1, 16, 30, 36, 2, 15]

    # --- four paragraphs byte-identical to Long (XII.34 is no longer one)
    ident = [i + 1 for i, (s_, c_) in enumerate(zip(src['paragraphs'], paras)) if s_ == c_]
    assert ident == [7, 10, 11, 13], ident

    # --- the staged original is untouched by this book's acceptance
    staged = json.load(open(STAGED, encoding='utf-8'))
    assert sha(STAGED) == '7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830'
    assert [len(c['paragraphs']) for c in staged['chapters']] == \
        [17, 17, 16, 51, 36, 59, 75, 61, 42, 38, 39, 36]
    assert staged['chapters'][11]['paragraphs'] == src['paragraphs']
    assert not any('(Greek:' in p for p in staged['chapters'][11]['paragraphs'])

    # --- finding C1, asserted against the raw PG text: PG 6886 is indented nine
    #     spaces, and the paragraph before it is XII.4, not XII.3.
    pg = open(PG, encoding='utf-8').read().split('\n')
    assert pg[6885].startswith(' ' * 9) and not pg[6885].startswith(' ' * 10)
    assert '[Greek: Sphairos' in pg[6885]
    assert pg[6880].rstrip().endswith('of ourselves.')      # PG 6881, the end of XII.4
    assert pg[6889].lstrip().startswith('5.')               # PG 6890, the start of XII.5
    assert pg[6871].rstrip().endswith('.')                  # PG 6872, the end of XII.3
    assert pg[6872].strip() == '' and pg[6873].lstrip().startswith('4.')   # XII.4 opens at 6874
    greek = [i for i in range(6818, 7175) if '[Greek:' in pg[i - 1]]
    assert greek == [6886, 6969, 6971, 7069], greek
    assert all(pg[i - 1].startswith('    ') for i in greek)
    # D14: the space-before-punctuation rule fires nowhere in Book XII's range
    assert not any(re.search(r'\s[,;:.?!]', pg[i - 1]) for i in range(6818, 7175))

    json.dump(v2, open(os.path.join(B12, 'candidate-v2.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)

    lines = ['# Meditations, Book 12 — modern-English candidate v2', '',
             f'**Title:** {v2["title"]}', '',
             'Candidate v1 with the round-1 independent-review corrections applied (see '
             '`changes-v1-to-v2.md`). Paragraph IDs `B12-Pxxx` are for reference only; the leading '
             'number is part of the text.', '']
    for i, p in enumerate(paras):
        lines += [f'**[B12-P{i+1:03d}]**', '', p, '']
    open(os.path.join(B12, 'candidate-v2-readable.md'), 'w', encoding='utf-8').write('\n'.join(lines))

    sw = sum(len(p.split()) for p in src['paragraphs'])
    cw = sum(len(p.split()) for p in paras)
    ratios = sorted((len(c_.split()) / len(s_.split()), i + 1)
                    for i, (s_, c_) in enumerate(zip(src['paragraphs'], paras)))
    apparatus = {3, 12, 14, 19, 21, 35, 2, 8, 27, 30, 15, 16, 36, 17}   # bracket or cross-reference
    clean = sorted((r, n) for r, n in ratios if n not in apparatus)

    ch = ['# Changes v1 → v2 — Meditations, Book XII', '',
          'Every change made to `candidate-v1.json` to produce `candidate-v2.json`, by paragraph ID, '
          'with the round-1 finding it answers (`review/findings-v1.md`). Applied mechanically by '
          '`scripts/build_book12_v2.py`; each "old" string matched exactly once in its paragraph. '
          'Paragraphs not listed are byte-identical between v1 and v2.', '',
          '| Paragraph | Finding | v1 | v2 |', '|---|---|---|---|']
    for n, fid, old, new in log:
        ch.append(f'| B12-P{n:03d} (XII.{n}) | {fid} | {old} | {new} |')
    changed = sorted({n for n, *_ in log})
    ch += ['', f'**Paragraphs changed:** {len(changed)} of {N} '
           f'({", ".join("XII." + str(n) for n in changed)}). Unchanged: '
           + ', '.join('XII.' + str(n) for n in range(1, N + 1) if n not in changed) + '.', '',
           '**Record-only findings (no word of the text changes):** 2.1 (XII.2\'s two undocumented '
           'punctuation changes recorded, the tally corrected to **six** added commas and **two** '
           'subject–verb removals, and the mechanical check changed from net comma counts to '
           'comma **positions**), 14.1 (XII.14\'s supplied article recorded), 23.1 (XII.23\'s two '
           'dropped resumptive "he"s recorded and the false "no word is added or dropped" '
           'withdrawn), 27.1 (XII.27\'s "Catellinus" entry reworded from "nothing decides" to "the '
           'departure threshold is not met"), C1 (the nine-space leak placed in **XII.4**, in '
           '`../PROVENANCE.md` §4, `README.md`, `continuity.md` and `review-instructions.md`, '
           'with the conclusion kept verbatim), C2 (the ratio note corrected: the lowest '
           'apparatus-free paragraph is **XII.29 at 0.983**) and C3 (**D13**\'s textual-doubt '
           'sentence widened to "a word or a clause", naming XI.26 and XII.17).', '',
           f'**Bracket arithmetic after v2:** {len(FOLDS)} folded + {len(D11_DROPS)} dropped under '
           f'D11 + {len(TEXTUAL_DOUBT_MARKS)} textual-doubt mark + {len(D13_DROPS)} dropped under '
           f'D13 = **{total_brackets}** brackets in Long\'s Book XII — unchanged by v2, and '
           'asserted by the build from the enumerated list.', '',
           f'**Word ratio after v2:** {sw} → {cw} = **{cw/sw:.4f}** (v1 was 0.9844). Minimum '
           f'paragraph ratio XII.{ratios[0][1]} at {ratios[0][0]:.3f} (its nine-word '
           f'cross-reference); maximum XII.{ratios[-1][1]} at {ratios[-1][0]:.3f}. Of the '
           f'paragraphs carrying no bracket and no cross-reference the lowest is '
           f'**XII.{clean[0][1]} at {clean[0][0]:.3f}** (finding C2). **Byte-identical to Long: '
           f'{len(ident)}** — ' + ', '.join('XII.' + str(n) for n in ident) +
           ' (XII.34 was the fifth; finding 34.1 took it).', '',
           NOT_CHANGED, '', APPLIED, '', OPTIONAL, '', RULINGS, '', FLOW, '',
           f'**Hashes:** candidate-v1.json `{sha(os.path.join(B12, "candidate-v1.json"))}`; '
           f'candidate-v2.json `{sha(os.path.join(B12, "candidate-v2.json"))}`.']
    open(os.path.join(B12, 'changes-v1-to-v2.md'), 'w', encoding='utf-8').write('\n'.join(ch) + '\n')

    print('paragraphs changed:', changed)
    for n in changed:
        a = v1['paragraphs'][n - 1].split()
        b = paras[n - 1].split()
        d = [x for x in difflib.ndiff(a, b) if x[0] in '+-']
        print(f'XII.{n}: ' + ' '.join(d))
    print('brackets %d = %d folds + %d D11 + %d textual-doubt + %d D13' %
          (total_brackets, len(FOLDS), len(D11_DROPS), len(TEXTUAL_DOUBT_MARKS), len(D13_DROPS)))
    print('comma diff (positional)', positional)
    print('commas added', len(added_commas) + len(COMMAS_IN_MODERNISED_WORDING),
          'removed', len(removed_commas) + 2, 'relocated', len(reloc))
    print('v1 sha256', sha(os.path.join(B12, 'candidate-v1.json')))
    print('v2 sha256', sha(os.path.join(B12, 'candidate-v2.json')))
    print('words source', sw, 'v2', cw, 'ratio %.4f' % (cw / sw))
    print('min paragraph ratios', ['XII.%d %.3f' % (n, r) for r, n in ratios[:4]])
    print('max paragraph ratio', 'XII.%d %.3f' % (ratios[-1][1], ratios[-1][0]))
    print('lowest apparatus-free', ['XII.%d %.3f' % (n, r) for r, n in clean[:4]])
    print('identical to Long:', ident)


if __name__ == '__main__':
    main()

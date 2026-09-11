# meditations — Meditations, Marcus Aurelius

**Scope:** public. Audited 2026-09-11.

## Edition snapshot (Phase 1)

| edition | sha256_16 | chapters | paragraphs | words | label in registry |
|---|---|---|---|---|---|
| original-en | `4f811221abc8dd10` | 12 | 412 | 57,307 | "Long Translation (1862)", translator `George Long`, year `1862` |
| modern-en | `e551f78e2ed26d47` | 12 | 412 | 57,236 | "Modern English" |
| modern-da | `94f696f9bbd47d5a` | 12 | 412 | 32,687 | "Moderne Dansk" |

Mechanical comparison (original-en → modern-en): mean weighted similarity **0.8393**,
identical long paragraphs **1.7%**, 0 truncation flags, 0 empty paragraphs, 0 paragraph-count
mismatches, editions aligned.

## CRITICAL: the core English text is misattributed

`bookRegistry.ts` (line ~866) declares `original-en` as **"Long Translation (1862)" / translator
"George Long" / year 1862**. **The file is not George Long's translation.** It is **Meric
Casaubon's 1634 translation**, taken from Project Gutenberg ebook #2680.

Evidence:
- Our `meditations-original-en.json` ch1 ¶0 reads verbatim: *"I. Of my grandfather Verus I have
  learned to be gentle and meek, and to refrain from all anger and passion."*
- PG #2680 (`https://www.gutenberg.org/cache/epub/2680/pg2680.txt`) opens with exactly that
  sentence. PG's own front matter credits the text as originally translated by Meric Casaubon.
  Casaubon's 1634 edition is titled *Marcus Aurelius Antoninus, His Meditations concerning
  himselfe* — the first English Meditations.
- George Long's actual 1862 translation (PG #15877, fetched and read) reads entirely differently.
  Long IV.3: *"Men seek retreats for themselves, houses in the country, sea-shores, and mountains;
  and thou too art wont to desire such things very much."* Ours: *"They seek for themselves private
  retiring places, as country villages, the sea-shore, mountains; yea thou thyself art wont to long
  much after such places."* Different translation.

So the registry is off by **228 years and the wrong translator**. Both texts are public domain, so
there is no rights exposure — but the attribution shown to readers is false, and the editorial
consequence is large: Casaubon 1634 is far harder English than Long 1862, and the modern-en was
built on top of the harder text.

## Samples inspected (5)

### 1. Opening — Book 1, ¶0–3 (the debts to family and teachers)

SRC ¶0: *"From the fame and memory of him that begot me I have learned both shamefastness and
manlike behaviour."*
MOD ¶0: *"From the reputation and memory of the man who fathered me I learned both modesty and
manly bearing."*

SRC ¶2: *"…by sorcerers, or prestidigitators, and impostors…"*
MOD ¶2: *"…the sorcerers, conjurers, and impostors…"*

**Finding — strong, but reveals the method.** Every clause is present, nothing is added, and
genuinely obsolete single words are swapped ("shamefastness"→"modesty", "prestidigitators"→
"conjurers", "I am beholding"→"I am indebted"). This is careful work. But the *operation* is
word-level substitution inside Casaubon's sentence frames, not re-expression.

### 2. Book 4 ¶2–4 (IV.3, the retreat into oneself — the book's most famous passage)

SRC ¶2 (711 w) / MOD ¶2 (699 w). Representative:

SRC: *"Afford then thyself this retiring continually, and thereby refresh and renew thyself."*
MOD: *"Afford then to yourself this retiring continually, and thereby refresh and renew yourself."*

SRC ¶3: *"If reason is general, then is that reason also, which prescribeth what is to be done and
what not, common unto all. If that, then law. If law, then are we fellow-citizens."*
MOD ¶3: *"If reason is general, then is that reason also which prescribes what is to be done and
what not, common to all. If that, then law. If law, then are we fellow-citizens."*

**Finding — LIGHT/MECHANICAL modernization confirmed.** `thou`→`you`, `-eth`→`-s`, `doth`→`does`,
`unto`→`to`. Inverted Early-Modern syntax ("then is that reason … common to all", "then are we
fellow-citizens") is carried over unchanged. "Afford then to yourself this retiring continually" is
not modern English by any reading.

For comparison, the same passage in **Long 1862** (the translator the registry claims we are using):
*"Men seek retreats for themselves, houses in the country, sea-shores, and mountains… For nowhere
either with more quiet or more freedom from trouble does a man retire than into his own soul."*
Long — without any modernization — is clearer than our *modern* edition.

### 3. Book 5 ¶0–1 (V.1, "in the morning when thou findest thyself unwilling to rise")

SRC ¶0: *"Nature hath of that also, as well as of eating and drinking, allowed thee a certain stint.
But thou guest beyond thy stint…"*
MOD ¶0: *"Nature has of that also, as well as of eating and drinking, allowed you a certain stint.
But you go beyond your stint…"*

SRC ¶0: *"These to whatsoever they take an affection, can be content to want their meat and sleep…"*
MOD ¶0: *"These, to whatever they take an affection, can be content to want their meat and sleep…"*

SRC ¶1: *"…to put off from him all turbulent adventitious imaginations…"*
MOD ¶1: *"…to put off from him all turbulent adventitious imaginations…"* (identical)

**Finding — failure of first-read clarity.** "a certain stint", "want their meat", "take an
affection", "adventitious imaginations", "an ordinary mechanic his trade" all survive untouched and
unglossed. A modern reader will mis-parse "want their meat and sleep" (= go without food and sleep)
and "mechanic" (= manual craftsman). The standard requires explaining essential unfamiliar terms at
the point of need; none is explained anywhere in this passage.

One genuine improvement: the source carries an OCR corruption *"how every tree md plant"*, which
modern-en silently repairs to *"every tree and plant"*.

### 4. Book 8 ¶45–48 (middle; VIII.46–49)

SRC ¶45: *"…yea though it so fall out, that it be even against reason itself, that it cloth bandy."*
MOD ¶45: *"…yea, though it so fall out that it be even against reason itself that she bandy."*

SRC ¶47: *"Is the cucumber bitter? set it away. Brambles are in the way? avoid them."*
MOD ¶47: *"Is the cucumber bitter? Set it away. Brambles are in the way? Avoid them."*

SRC ¶48: *"Not basely to contract thy soul; nor boisterously to sally out with it… nor ever to want
employment."*
MOD ¶48: *"Not basely to contract your soul, nor boisterously to sally out with it… nor ever to want
employment."*

**Finding.** ¶45 repairs an OCR artifact ("cloth"→"she") — good. But "that she bandy" is left as an
untranslatable puzzle; "Set it away", "nor ever to want employment", "sally out" are unchanged. ¶48
differs from the source only in punctuation and two pronouns.

### 5. Ending — Book 12 ¶24–26 (XII.25–27, the play-of-three-acts close)

SRC ¶26: *"To stir up a man to the contempt of death this among other things, is of good power and
efficacy, that even they who esteemed pleasure to be happiness… did nevertheless many of them
contemn death as much as any."*
MOD ¶26: *"To stir up a man to the contempt of death, this among other things is of good power and
efficacy: that even they who esteemed pleasure to be happiness… did nevertheless many of them
contemn death as much as any."*

SRC ¶25: *"What is the present estate of my understanding?… they are without the compass of mine own
will"*
MOD ¶25: *"What is the present estate of my understanding?… they are without the compass of my own
will"*

**Finding.** The closing pages are the clearest demonstration. "contemn" (twice), "of good power and
efficacy", "the present estate of my understanding", "without the compass of my own will", and
"praetor" all pass through unaltered and unglossed. Aside from `mine`→`my` and one em-dash, ¶25–26
are Casaubon verbatim.

## Meaningful-repetition check (batch-specific concern)

The concern raised was that modernization might vary Marcus's deliberately repeated phrasings for
stylistic variety, eroding the notebook quality. **Disconfirmed — and it could hardly be otherwise.**
Because the modernization operates at the word-substitution level, repeated formulas are preserved
identically across books ("retire into yourself", "the common nature", "that which is in your
power", "it is against their wills that they offend"). Three long paragraphs (ch6 ¶24, ch8 ¶36,
ch11 ¶23) are byte-identical to the source. The self-addressed, aphoristic, circling character of
the notebook is fully intact. This is the edition's genuine strength.

## Phase 1 flags: confirmed vs. disconfirmed

- **Mean similarity 0.8393 — CONFIRMED as a real quality signal.** Word counts are 57,307 → 57,236
  (99.88%). The high similarity is not an artifact; it reflects near-copying.
- **1.7% identical long paragraphs — confirmed** (3 paragraphs ≥25 words are byte-identical). Small
  in itself, but consistent with the above.
- **0 truncations / 0 empty paragraphs / alignment intact — confirmed.** No completeness problems.

## Phase 3 — human-edition research

**Candidate A — George Long (1862), Standard Ebooks production.**
- URL: `https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long`
- Translator: George Long (1800–1879). Complete (all 12 books; ~45,600 words).
- Text fetched and read (single-page HTML). Clean, modern typography, no OCR damage.
- Rights: **public domain** (Long d. 1879 — PD in US and EU/Denmark). Standard Ebooks' own
  production layer is dedicated to the public domain: *"Content produced by or for Standard Ebooks
  L³C is dedicated to the public domain via the CC0 1.0 Universal Public Domain Dedication."*
  Rights-clear for commercial distribution in both the US and Denmark/EU.
- Readability sample (Book V.1): *"In the morning when thou risest unwillingly, let this thought be
  present — I am rising to the work of a human being… Dost thou not see the little plants, the little
  birds, the ants, the spiders, the bees working together to put in order their several parts of the
  universe?"* — against Casaubon's *"Seest thou not how all things in the world besides, how every
  tree md plant… are intent as it were orderly to perform whatsoever (towards the preservation of
  this orderly universe) naturally doth become and belong unto thin?"*
- Assessment: substantially clearer than our current core text, but **retains thou/thee/dost**, so
  it does *not* by itself meet our reading standard for a modern edition. Its correct role is as the
  **replacement `original-en` and the base for a real modernization**.
- Alignment work required: Long's section numbering matches (12 books, numbered sections), but
  paragraph splits differ from our Casaubon-derived 412-paragraph array — re-alignment needed.

**Candidate B — George Long (1862), Project Gutenberg #15877.** Same translation, plain text,
`https://www.gutenberg.org/cache/epub/15877/pg15877.txt`. Fetched. PD. Carries Long's long
introduction and footnotes; Standard Ebooks' version is the cleaner production.

**Not researched / not pursued:** Gregory Hays (2002, Modern Library) and Robin Hard (2011, OUP) are
the two best modern English Meditations, but both are in copyright — permission required, not
viable. C. R. Haines (Loeb, 1916) is US-PD but its English is no clearer than Long's.

**"None found" vs "none exists":** I found no complete, rights-clear human English Meditations that
by itself meets our "clear, natural English for a thoughtful modern adult" bar. I did not
exhaustively search 20th-century American PD printings.

## Ratings

| dimension | weight | score | note |
|---|---|---|---|
| fidelity / completeness | 40% | 5 | nothing omitted, nothing invented, 412/412 aligned; OCR damage repaired |
| first-read clarity | 25% | 2 | 1634 vocabulary and syntax left in place, unglossed |
| literary voice | 20% | 4 | Casaubon's voice and Marcus's repetitions fully preserved |
| restraint / no invention | 10% | 5 | no added interpretation anywhere in 5 samples |
| naturalness | 5% | 2 | inverted Early-Modern syntax throughout |

**Weighted score: 3.9.** **Band: Mixed.**

The weighted score flatters this edition: the 40% fidelity weight rewards near-copying, which is
precisely the defect. Judged against the standard's own test — *"a separate modern edition is
worthwhile only when it removes a substantial reader barrier"* — this edition does not remove the
barrier it exists to remove.

## Recommendation

**RETRANSLATE** — confidence **high** for the diagnosis, **medium** for book-wide extrapolation
(5 samples, ~1,900 source words of 57,307 ≈ 3%; but the defect was uniform across all five, spread
from Book 1 to Book 12, and is corroborated by the 0.84 similarity and 99.9% word-count parity over
the whole book).

**Correction scope: substantial.**

Two prerequisite fixes before any retranslation:
1. **Correct the registry attribution.** `original-en` is Meric Casaubon (1634), not George Long
   (1862). Shipping a false translator credit is a standalone bug independent of this audit.
2. **Rebase.** Replace `original-en` with the Standard Ebooks George Long text (CC0/PD), then
   modernize *from Long*. Modernizing Casaubon means fighting 1634 English to reach 2026 English
   through a translation that is itself two removes from the Greek.

## Limitations of this review

- 5 passages, ~1,900 source words out of 57,307 (~3%). Books 2, 3, 6, 7, 9, 10, 11 were not
  sampled at paragraph level.
- I did not audit `modern-da`. Note for whoever does: modern-da is **32,687 words against
  modern-en's 57,236 (57%)** — a gap far larger than English→Danish compression explains. That is a
  strong independent signal worth checking.
- I did not check the Greek. All fidelity judgments are English-to-English (Casaubon → modern-en).
- I did not verify Standard Ebooks' Long text against a print copy of Long 1862 line by line; I read
  Books IV and V and compared against PG #15877, which matched.
- Audio manifests, onboarding JSON, and Cast/threads data for this book were not inspected.

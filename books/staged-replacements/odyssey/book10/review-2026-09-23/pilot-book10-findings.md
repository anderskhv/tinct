# Independent Review — Odyssey Book 10 Pilot (`candidate-v1.json`)

**Reviewer:** independent review session (Opus 5), content review only.
**Commit reviewed:** `25d36f36b0ee7dad1a10ff956415dcb3204bb15d` (branch `claude/wizardly-allen-ra9p0k`).
**Fidelity anchor:** Samuel Butler's prose Odyssey as carried in
`app/public/data/editions/odyssey-original-en.json`, chapter `number: 10`.
**Scope:** `candidate-v1.json` was not modified. No app code, registry, live
content, landing pages, or audio were touched. Nothing merged or deployed.

---

## 1. Integrity verification

Performed in an isolated git worktree checked out at the review commit; the
primary checkout was not disturbed.

| Check | Result |
|---|---|
| `odyssey-original-en.json` sha256 | `da03f6ac…822f07` — matches `provenance.json` |
| `source-book10.json` sha256 | `15064e9b…06455f` — matches `provenance.json` |
| `candidate-v1.json` sha256 | `6a5e9ef6…0b63d6a4f` — matches `provenance.json` |
| Chapters with `number == 10` in the app edition | exactly 1 |
| `source-book10.json` paragraphs vs. the app edition's chapter 10 | byte-identical, 49 paragraphs |
| Candidate paragraph count | 49, one-to-one with source |
| Manifest coverage | all of `B10-P001`–`B10-P049` assigned exactly once, in order, no gaps or duplicates |
| Packets reproduce assigned source text | 17/17 exact |
| Packets reproduce assigned candidate text | 17/17 exact |
| `candidate-v1-readable.md` vs. `candidate-v1.json` | every paragraph present verbatim |

**One item to record, not a defect.** `provenance.json` names commit
`9453bf8f203b32300456439fb5b501cc8d3b0479`, not the commit under review.
`9453bf8f` is the direct parent of `25d36f36`; the whole pilot directory was
added in `25d36f36`, and `odyssey-original-en.json` is unchanged between the
two (hash verified). The provenance record is therefore accurate about what
the source was extracted from. No discrepancy in the files themselves.

**Source/candidate title differ** — source `Book 10 — Aeolus, the
Laestrygones, Circe`, candidate `…the Laestrygonians, Circe`. This is the
documented spelling normalization in `continuity.md`; it resolves Butler's own
title/body inconsistency and I accept it.

---

## 2. Per-paragraph findings

Reviewed packet by packet, sequentially, findings recorded before opening the
next packet. Every paragraph below carries either findings or "No material
issue found."

### Must fix (3)

---

**B10-P024**

- Source: "the gods call it Moly, and **mortal men cannot uproot it**, but the gods can do whatever they like."
- Candidate: "The gods call it moly. **It is hard for mortal men to dig up**, but the gods can do anything."
- **Difference:** an absolute impossibility is downgraded to a difficulty.
  Butler's point is that moly is categorically beyond mortal reach — which is
  why Hermes has to pull it — and the contrast with "but the gods can do
  whatever they like" depends on that absoluteness. "Hard" makes the following
  clause nearly a non-sequitur.
- **Smallest correction:** "It cannot be dug up by mortal men, but the gods can do anything."
- **Confidence:** high. **Alternative reading:** "hard to dig" is the reading
  found in several other English Odysseys, so this may be a considered choice
  rather than a slip — but it departs from the stated Butler anchor, and the
  brief treats negation and certainty as first-order checks. I have not checked
  the Greek and make no claim about where the reading came from.

---

**B10-P032**

- Source: "and **Circe herself was so sorry for them** that she came up to me and said…"
- Candidate: "and **Circe herself was so moved by their happiness** that she came up to me and said…"
- **Difference:** both the emotion and its cause change. Butler has pity for
  what the men have suffered; the candidate has Circe touched by their joy.
  Pity is the hinge of Circe's turn from antagonist to host — it is the first
  sign she is on Odysseus's side — and it is the reading the surrounding text
  supports (she immediately starts organizing their care).
- **Smallest correction:** "and Circe herself felt such pity for them that she came up to me and said…"
- **Confidence:** high. **Alternative reading:** none that I find plausible;
  Butler's "sorry for them" cannot carry "moved by their happiness."

---

**B10-P049**

- Source: "Circe brought the ram and the ewe, and **we made them fast** hard by the ship."
- Candidate: "Circe brought the ram and the ewe **and tied them fast** beside the ship."
- **Difference:** the tying is reassigned from the crew to Circe. This is a
  changed actor, and it works against the very next sentence: "She passed
  through the midst of us without our noticing." A goddess who has just walked
  among the men tethering livestock beside their ship is not passing
  unnoticed. Butler keeps her delivery invisible and the handling human.
- **Smallest correction:** "Circe brought the ram and the ewe, and we tied them fast beside the ship."
- **Confidence:** high. **Alternative reading:** none; the source pronoun is explicit.

---

### Worth improving (23 findings across 17 paragraphs)

| ID | Source | Candidate | Difference and why it matters | Smallest correction | Conf. |
|---|---|---|---|---|---|
| **P001** | "Thence we went on to the Aeolian island… It is an island that floats (as it were) upon the sea" | "we came to **the floating island** of Aeolus… **It floats on the sea**, so to speak" | The candidate states the floating twice, two clauses apart. Butler names the island, then characterizes it once. Introduced redundancy in the chapter's opening line. | "we came to the Aeolian island, where Aeolus, son of Hippotas, lives, a man dear to the immortal gods. It floats on the sea, so to speak…" | High |
| **P002** | "he **flayed me a prime ox-hide** to hold the ways of the roaring winds" | "He **flayed a full-grown ox and made a hide bag** to hold the paths…" | Two changes: "prime" (quality) becomes "full-grown" (age), and a fabrication step ("made a hide bag") is added that Butler does not narrate. | "He flayed a prime ox-hide to hold the paths of the blustering winds" | High |
| **P003** | "we could see the **stubble fires burning**" | "close enough to see **men tending the stubble fires**" | Human figures are added to the homecoming sight. Butler shows Odysseus only the fires. This is the unsupported-addition class the brief asks about. | "close enough to see the stubble fires burning" | High |
| **P003** | "come back with **hands as empty as we set out with**" | "come back with **empty hands**" | The complaint's force is the comparison — nothing gained over the whole voyage — not merely that their hands are empty. | "come back with hands as empty as when we started" | High |
| **P009** | "I sent two of my company **with an attendant**" | "two of my men, **with an attendant under their command**" | "under their command" invents a chain of command Butler does not state; the third man simply goes along. | "with an attendant" | High |
| **P013** | "He was coming down **his pasture in the forest** to drink of the river" | "coming down from his **mountain pasture** to drink at the river" | The stag's ground moves from forest to mountain. The island's forest is a recurring setting (Circe's house sits in it, the smoke rises from it); relocating the stag weakens that consistency and is unsupported. | "coming down from his pasture in the forest to drink at the river" | High |
| **P015** | "the savage **ogre** Polyphemus" | "the savage **Cyclops** Polyphemus" | Butler's word is replaced, and the replacement breaks a deliberate echo: four paragraphs earlier the Laestrygonians are "ogres, not men" (P011, which the candidate keeps). Butler uses one word to link the two monster-episodes the men are recalling. | "the savage ogre Polyphemus" | Medium — `continuity.md` documents this as an intentional Book 9 alignment; the echo loss may still not be worth it |
| **P016** | "poor bewitched creatures whom she had **tamed by her enchantments and drugged into subjection**" | "poor bewitched creatures she had **tamed with her drugs and enchantments**" | Two distinct acts (enchanting, then drugging into subjection) collapse into one act with two instruments, and "into subjection" is lost. `continuity.md` itself insists Circe's wand and drug stay distinct; the same discipline applies here. | "tamed by her enchantments and drugged into subjection" | Medium-high |
| **P022** | "like so many wild boars **in their lairs**" | "like so many wild boars **in their pens**" | "Lairs" are wild dens; the point of the simile is that these are *wild* boars, not livestock. "Pens" collapses the simile into the pigsties mentioned in the same sentence. | "like so many wild boars in their dens" | High |
| **P022** | "it will be a talisman to you **against every kind of mischief**" | "It will guard you against every kind of **harm she can work**" | The herb's protection is narrowed from unrestricted to Circe-specific. Hermes offers a general safeguard. | "It will guard you against every kind of harm." | High |
| **P022** | "whither are you going **over this mountain top**" | "over this **high ground**" | A named feature softened to a vague one. Minor, but it is the candidate removing "mountain" here while adding it at P013 — the two changes point opposite ways. | "over this mountain top" | Medium |
| **P023** | "all the wicked **witchcraft** that Circe will try to practice upon you" | "all the wicked **tricks** Circe will try on you" | Magic is downgraded to trickery. The whole warning is about spells that Odysseus needs a magical herb to survive, not about cunning. | "all the wicked magic Circe will try on you" | High |
| **P023** | "she will **drug the meal with which she makes it**" | "and **drug it with her potions**" | What is drugged changes (the meal, an ingredient → the finished dish), and "her potions" is invented. Butler's mechanic matters because the herb's counter-magic works on the drugged meal. | "and drug the meal she makes it with" | Medium-high |
| **P023** | "when she has got you **naked** she will unman you" | "once she has you **at her mercy**, she will unman you" | A concrete physical circumstance becomes an abstraction. The threat is specifically about being disarmed and undressed in her bed — which is why the oath is demanded first. | "once she has you stripped, she will unman you" | High |
| **P025** | "be off to the pigstye, and **make your lair** with the rest of them" | "off to the pigsty with you, and **take your place** among the rest" | The animal-den verb is what makes the line a curse; "take your place" is neutral. Compounds the same loss at P022. | "and make your den with the rest of them" | High |
| **P026** | "whereon she **fell** with a loud scream, clasped my knees" | "and she **fell back** with a loud scream, clasped my knees" | "Fell back" reads as recoiling away, which conflicts with the supplication posture she immediately adopts. Butler has her drop where she stands and take his knees. | "she fell with a loud scream, clasped my knees" | High |
| **P027** | "**you mean me mischief when you ask me** to go to bed with you, **and** will unman me" | "you want me to go to bed with you **only so you can** unman me" | Two parallel assertions are recast as one purpose clause asserting Circe's sole motive. That is an invented causal link — exactly the failure class the pilot is testing for. | "you mean me harm in asking me to go to bed with you, and will unman me and leave me fit for nothing" | High |
| **P033** | "as **calves break out** and gambol round their mothers" | "like calves **let loose from their pens**" | Agency reverses: the calves force their own way out in Butler; someone releases them in the candidate. The simile's energy is the breaking out. | "like calves breaking out to frisk round their mothers" | High |
| **P033** | "said the affectionate **creatures**" | "said the affectionate **fellows**" | "Creatures" carries the calf simile through to the men, which is Butler's joke. "Fellows" drops it and repeats a word used two sentences earlier ("the foolish, tearful fellows"). | "said the affectionate creatures" | Medium-high |
| **P036** | "I was **in two minds whether or no** to draw the keen blade… and cut his head off" | "I was **tempted to** draw the sharp blade… and cut off his head" | Deliberation between two courses becomes a passing urge. Butler shows Odysseus genuinely weighing killing a kinsman, which is why the men have to intervene. | "I was of two minds whether to draw the sharp blade…" | High |
| **P036** | "Sir, **if it may so be**, let this fellow stay here" | "Sir, **if it must be**, let this man stay here" | A deferential hedge ("if you'll allow it") becomes resignation to necessity. It changes who is conceding to whom in the exchange. | "Sir, if you are willing, let this man stay here" | Medium-high |
| **P041** | "the other ghosts **flit about aimlessly**" | "the other ghosts only flit about **without sense**" | Butler gives a separate image (purposeless motion); "without sense" merely restates the preceding clause about Teiresias alone keeping understanding, so the sentence loses its second idea. | "the other ghosts merely flit about aimlessly" | Medium |
| **P042** | "would gladly have **lived no longer to see the light of the sun**" | "would gladly have **given up living to see the light of the sun again**" | The candidate reads two ways — "given up [hope of] living to see the sun" and, wrongly, "given up living, in order to see the sun" — and "again" is added. Butler's statement of wanting to die is plain; the candidate's is not. This is the one place where the modernized syntax obstructs rather than helps. | "and would gladly have died rather than go on seeing the light of the sun" | High |
| **P044** | Circe's speech runs open into P045 (no closing quote) | Candidate closes the speech: "…the finest in your flocks.**'**" then reopens at P045 | Mechanical inconsistency: P043 correctly leaves the speech open, P044 closes it mid-speech. A reader sees Circe stop and restart for no reason. | Delete the closing quote at the end of P044 | High |

### Optional preference (54 findings across 27 paragraphs)

Recorded for completeness; none of these needs to change for the edition to be
sound, and several are defensible as-is. Grouped by paragraph.

- **P001** "between the blankets" → "beside him under the blankets" (position added).
- **P002** "which was fair for us" → "since that one was fair for us" (relative clause becomes causal); "a breath of a **side**-wind" → "a breath of wind" ("side-" dropped).
- **P003** "Bless my heart" → "Just look" (exclamation flattened); "makes friends to whatever city or country he may go" → "welcomed wherever he goes".
- **P004** "the wind flew howling forth" (sing.) → "the winds burst out" (pl.); "evil counsels prevailed" → "this bad idea won out" (register dip — see §3); "covered myself up" → "covered my face" (narrowed); "live on and make the best of it" → "endure it and live".
- **P005** "we… dined hard by the ships" → "**the men** ate their meal", then "as soon as **we** had eaten" (subject wobble); "what brings you here" → "what brings you back"; "further you on your way" → "send you **safely** on your way".
- **P007** "him whom **heaven** hates" → "a man **the gods** hate", while the next clause keeps "loathed by heaven" (two divine terms in one short speech).
- **P008** "his sheep and goats" → "his flock" (concrete pair lost); "one as a herdsman of cattle, and another as a shepherd" → "**first**… **then**…" (sequence added).
- **P009** "land-locked under steep cliffs" → "enclosed by steep cliffs **on every side**".
- **P011** "from **the place of** assembly" → "from the assembly"; "took them **home** to eat them" → "carried them off to eat"; "there was not one of them left" → "not one **man** survived".
- **P012** "though we had lost our comrades" → "but **grieving for** our lost comrades" (emotion added, doubling "sailed on in sorrow"); "send some of them" → "send some of them **ahead**".
- **P013** "he **lay** groaning in the dust until the life went out of him" → "he **fell** groaning… until" (posture changed; "until" sits oddly on "fell"); "the **noble** creature" → "the creature"; "a splendid **fellow**" → "a splendid **animal**" (personification lost).
- **P017** "meal" → "**barley** meal" ("barley" not in Butler); "head, hair, and all" → "heads, **bodies**, and bristles" (third item added); "unfastened the door" → "unbarred" (a bar specified).
- **P018** "we **forced** his story out of him" → "we **drew** the story out of him"; "so overcome **with dismay**" → "so overcome".
- **P021** "I am **most urgently** bound to do so" → "I am bound to it **and cannot refuse**".
- **P023** "and to take good care also of yourself" — Butler is ambiguous about who does the caring; the candidate resolves it to Circe ("take good care of you as well"). Defensible, but it settles an ambiguity the source leaves open.
- **P024** "shewed me **what it was like**" → "showed it to me".
- **P026** "from what **place** and people have you come" → "what is your **city**"; "a taste of the herb **I gave you**" → "a taste of **that** herb".
- **P029** "washing me from the cauldron about the head and shoulders" → "**pouring it over** my head and shoulders" (action made explicit); "**offered** me many things of what there was in the house" → "**set out** many of the **good** things"; "still moody and **suspicious**" → "still troubled and **wary**", while P030/P031 keep "suspicious".
- **P031** "until **you** have set his friends free" → "until his friends **have been set** free" (Circe removed as agent).
- **P032** "the **bad** drug" → "the **first** drug"; "your **ship's** gear and property" → "your gear and belongings".
- **P035** "his sheer **folly**" → "his sheer **recklessness**".
- **P038** "You keep **all the time** thinking" → "You keep thinking".
- **P043** "you will see a rock **near it**" → "a rock **there**".
- **P044** "dig a **trench**" → "dig a **pit**"; "poor **feeble** ghosts" → "poor, **powerless** ghosts".
- **P046** "a **beautiful** light gossamer **fabric**" → "a light, gossamer **robe**"; "covered her head with a **mantle**" → "with a **veil**"; "said I to them" / "as I **bade** them" → "I **told** them" / "as I **told** them" (word repeated).
- **P047** "**I** did not get **them** away without misadventure" → "**we** did not get away" (Odysseus's agency and implied responsibility diffused); "not very remarkable for **sense**" → "not especially **clever**"; "forgot all about **coming down by the main staircase**" → "forgot all about the stairway".
- **P048** "**You** think **you are** about to start home **again**" → "You think **we're** about to set out for home".

### No material issue found (12 paragraphs)

B10-P006, P010, P014, P019, P020, P028, P030, P034, P037, P039, P040, P045.

Worth naming positively: **P014** preserves Butler's own internal
inconsistency ("I went as high as I could **this morning**," said the morning
after the climb) without silently correcting it — the right call. **P044**'s
cubit gloss ("about a cubit — roughly eighteen inches") and **P013**'s fathom
handling ("a stout rope about six feet long", keeping "or so" as "about") are
both well judged. "Fountain Artacia" → "spring Artacia", "beech masts" →
"beechnuts", "covered cloisters" → "covered porches", and "willows that shed
their fruit untimely" → "shed their fruit before it ripens" are all clean
modernizations that cost nothing.

---

## 3. Chapter-level findings (continuous read)

**C1 — Frame quotation marks dropped, undocumented.** All 49 source
paragraphs open with `“` because Book 10 sits inside Odysseus's narration to
the Phaeacians; no candidate paragraph does. `continuity.md` explains the
source convention but does not record dropping it as a decision. The choice is
reasonable for a modern reading edition — a quote mark that never closes is
noise — but it should be a recorded, chapter-consistent policy, especially if
Books 9–12 are to match. *Worth improving (documentation), Optional (text).*

**C2 — Mixed US/UK spelling.** The candidate is otherwise consistently
American — "harbor", "neighbor", "honored", "color", "traveled", "labored" —
but keeps British "woollen" (P038). One-word fix. *Worth improving.*

**C3 — The beast-den motif is flattened twice.** P022 "lairs" → "pens" and
P025 "make your lair" → "take your place". Butler sustains one image across
Hermes's warning and Circe's curse: the men are being kept as animals. Fixing
these two together restores a through-line, not just two words. *Worth
improving (already listed per-paragraph).*

**C4 — One systematic pattern behind most findings.** The great majority of
the Worth-improving items share a single mechanism: Butler's looser or more
reticent phrasing is resolved into a sharper, more explicit modern statement.
Relative clauses become causal ones (P002), parallel assertions become purpose
clauses (P027), an absolute becomes a gradable (P024), an unstated agent gets
supplied (P049, P009, P033), a vague circumstance gets specified (P023
"naked" → "at her mercy" runs the other way, but is the same instinct to
smooth). This is not carelessness — it is a consistent stylistic habit of
over-resolving. Whoever prepares v2 should treat "is the candidate more
definite than Butler here?" as the primary diagnostic question; it would have
caught most of this list, including all three Must-fix items.

**C5 — Voice and pacing are otherwise good.** The prose reads as intended:
clear, unfussy, literary without period costume. Paragraph rhythm tracks the
source. The one place the register drops below the surrounding voice is P004's
"this bad idea won out" for "evil counsels prevailed" — the sentence that
launches the chapter's first catastrophe reads like office chat. *Optional, but
the most audible tonal moment in the chapter.*

**C6 — Terminology discipline is clean.** Mechanically verified across all 49
paragraphs: no leakage of Ulysses, Jove, Mercury, or Proserpine; "Odysseus,
noble son of Laertes" appears three times, exactly as `continuity.md`
promises; "spring" (not "fountain") is used consistently; the wand-vs-drug
distinction is preserved at every occurrence. Every proper noun in the source
appears in the candidate under its mapped form, and every quantity survives
intact — twenty-two men, four servants, six daughters and six sons, nine days,
the tenth day, six days of rowing and the seventh day, a full year. Butler's
repeated furniture (the silver-inlaid chair with its footstool, P025 and P029)
and the repeated "as though I meant to kill her" between Hermes's instruction
and its execution (P023, P026) are both carried through deliberately.

---

## 4. Verdict

**Accept after corrections.**

The candidate is a sound, readable modern edition with disciplined name and
terminology handling and no structural omissions. It is not ready to ship as
is: three paragraphs carry errors that change what happens or who does it, and
a further seventeen contain losses of image, force, or precision that are
cheap to repair. None of this calls for a redraft — every correction proposed
above is a phrase-level edit against an otherwise good draft.

- **Paragraphs reviewed:** 49 of 49.
- **Paragraphs with Must-fix findings:** 3 (B10-P024, B10-P032, B10-P049).
- **Worth-improving findings:** 23, across 17 paragraphs, plus 3 chapter-level.
- **Optional-preference findings:** 54, across 27 paragraphs.
- **Paragraphs with no material issue:** 12.

**Most important examples:**

1. **B10-P049** — the tying of the sacrificial animals is reassigned from the
   crew to Circe, contradicting the next sentence, which has her pass among
   them unseen. A changed actor with a visible knock-on effect.
2. **B10-P032** — Circe's pity becomes being "moved by their happiness",
   replacing both the emotion and its cause at the chapter's pivot from threat
   to hospitality.
3. **B10-P024** — "mortal men cannot uproot it" becomes "it is hard for mortal
   men to dig up", weakening an absolute into a difficulty and leaving the
   following contrast with the gods hanging.
4. **B10-P027** — "you mean me mischief when you ask me… and will unman me"
   becomes "you want me to go to bed with you only so you can unman me", an
   invented purpose clause asserting a single motive.
5. **B10-P003** — "we could see the stubble fires burning" becomes "close
   enough to see men tending the stubble fires", adding human figures Butler
   does not put there.

**On the pilot's own question** — whether three-paragraph packets catch more
than a single full-chapter pass — this review cannot answer it alone, since it
ran only the packet arm. What I can report is that the packet format worked
well: the neighbor-paragraph context was sufficient in every case, and the
packets never obstructed a judgment. Two of the three Must-fix findings
(P024, P032) are single-word or single-phrase substitutions inside long
paragraphs — the kind most likely to be skimmed past in a continuous read.
The third (P049) needed only its own paragraph. Against that, three findings
were only visible *across* packets — the ogre/Cyclops echo (P011/P015), the
lair motif (P022/P025), and the "fellows" repetition (P033) — and those came
out of the chapter-level pass, not the packets. The two passes appear
complementary rather than redundant; I would not drop either.

## 5. Coverage limitations

- **Butler is the only anchor.** I compared the candidate against the Butler
  text supplied in this repository and nothing else. I did not consult the
  Greek, and I make no claim anywhere above that a candidate reading was
  imported from the Greek or from another translation. Where a candidate
  reading departs from Butler but resembles readings found elsewhere in
  English (P003 "men tending", P024 "hard to dig up"), I have said only that it
  departs from Butler.
- **Butler's own accuracy is out of scope.** Where Butler is inconsistent
  (P014's "this morning", the Laestrygones/Laestrygonians title split) I
  checked only that the candidate did not silently correct him.
- **Edition provenance remains unverified.** As `provenance.json` and
  `continuity.md` both record, the Butler attribution for
  `odyssey-original-en.json` rests on textual identification, not a located
  Gutenberg header or `SOURCE.md`. I did not resolve this and it remains open.
- **This is a content review only.** No rendering, pagination, audio
  alignment, Danish edition, registry, or app-integration checking was
  performed, and nothing was deployed.
- **Completeness is not guaranteed.** Paragraph counts, word counts, and the
  proper-noun and quantity sweeps in §3 establish that nothing is grossly
  missing; they do not establish that every semantic detail survives. A second
  independent reader would likely find items I did not. I make no claim that
  the chapter is error-free, and I have assigned no numerical score.

---

## 6. Review artifacts

- **Review branch:** `claude/review-book10-opus`, based on
  `25d36f36b0ee7dad1a10ff956415dcb3204bb15d`.
- **Report path:** `books/staged-replacements/odyssey-book10-pilot/review-findings-opus.md`
- **`candidate-v1.json` is unchanged** — hash still
  `6a5e9ef63ca6f80e020a089a94072de28c925302c0d233adb0a13a20b63d6a4f`.
  Per the pilot's frozen-draft discipline, corrections belong in a new
  `candidate-v2.json`.

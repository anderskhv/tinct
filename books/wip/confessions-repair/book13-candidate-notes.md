# Book 13 — Modern English Candidate Notes

Source: Pusey (1838), `book13-source.json`, 53 paragraphs. Output: `book13-candidate.json`, 53 paragraphs, one-to-one.

## 1. Ambiguity preserved

- Para 7 ("Was it because it was fitting...") — Pusey leaves this as an odd unpunctuated rhetorical assertion rather than a clean question (no "?" in the source at that point, despite the "Was it because" phrasing that reads like a question start). I kept the same unresolved, slightly ambiguous grammatical shape ("It was because it was fitting...") rather than forcing it into either a clean question or a confident declarative — the source itself doesn't resolve which it is.
- Para 33/45 — the "increase and multiply" / "very good" material explicitly holds two readings in tension (literal generation vs. figurative abundance of meaning) without Augustine picking one exclusively. I preserved both registers side by side rather than collapsing to one reading (see item 9 below and the carry-forward gate).
- Para 46/32 — "as the appetite of doing is fain to conceive the skill of right-doing from the reason of the mind" is a compressed analogy Augustine doesn't fully unpack (soul's directing power : subject power :: mind's reason : body's practical appetite :: husband : wife). I rendered it as literally as English allows without adding an explanatory gloss that isn't in the source.
- Para 43 (the voice "unto Thee") — I kept the shift from third-person report to first-person divine speech exactly where the source shifts it, without adding a framing phrase like "and God said" that isn't in the Pusey text.

## 2. Technical terms / allegorical mappings kept, and why

Kept consistent throughout (established at first use, reused verbatim after):
- "firmament" — kept as "firmament," not "sky" or "dome," since it is Augustine's fixed technical anchor for the whole allegory (Scripture/the Church's authority) and later paragraphs (32, 33, 47, 48) depend on readers recognizing the same word.
- "the deep" — kept as "the deep" (not "the abyss" except where Augustine himself uses "abyss" alongside it), since it recurs as the technical name for formlessness/darkness/unbelief across paras 2, 3, 9, 13, 25, 28, 44.
- "waters above" / "waters below the firmament" — kept literally, since para 17-18's whole point is a spatial image (angels above, need no Scripture; mortals below, need it).
- "gathered together... the sea" / "dry land" — kept as "sea" and "dry land," never varied to "ocean" or "ground," since paras 19-21 build a sustained metaphor keyed to those exact nouns.
- "living soul" vs. "moving creature that hath life" — kept as two distinct phrases exactly as Pusey distinguishes them (paras 27-28), since the whole point of that section is that these are *not* the same allegorical category (baptized/faithful earth vs. sea-born converts still needing signs).
- "gift" vs. "fruit" — kept as the two fixed nouns throughout paras 39-40, since Augustine defines them as a technical pair and the argument depends on the reader tracking which is which.

## 3. Hardest paragraphs and tradeoffs

- **Para 8** — the extended "weight of evil desires... charity raises up" passage has five questions stacked with almost no connective tissue ("To whom shall I speak this? how speak... to whom shall I speak it? how speak it?"). I kept the repetitive, halting rhetorical structure rather than smoothing it into fluent prose, since the halting repetition is Augustine's own device (his struggle to find words), and smoothing it would misrepresent the passage.
- **Para 22** — the longest paragraph in the book, moving through the full "lights in the firmament" allegory (spiritual gifts, sun/day vs. moon-stars/night, tongues at Pentecost implicitly present via "signs of times"). I split nothing and merged nothing; the paragraph is one long unbroken argument in the source and stays that way here, even though it strains readability — merging or splitting it would violate the one-to-one paragraph rule.
- **Para 45** — the "It is one thing... another thing... and another thing still" three-part distinction (thinking good is bad / seeing that good is good / God seeing his own goodness in a person) is dense and easy to flatten. I kept all three legs distinct and in the source's order rather than collapsing the second and third into one, since collapsing them would erase the theological point (love of God vs. mere pleasure in creatures vs. God's own act of seeing in us).
- **Para 32** (male/female mapping) — highest risk of accidental inversion. Source: those "spiritually set over" others = one leg; those "spiritually subject to those set over them" = the other leg; "in this way didst Thou make man male and female." I verified against the source that "set over" maps to the leading/directing role and "subject" to the obeying role, and did not assign these to "male" and "female" myself — Augustine's own sentence doesn't explicitly say "male = set over," it says the Church contains both kinds of spiritual people and "in this way" (i.e., by that same duality) man was made male and female. I kept the mapping exactly as unstated/implicit as Augustine leaves it in this paragraph, and did not add a bridge that isn't there. Para 46 later does explicitly assign directing to "his soul" and one dominion power, and subjection to "the woman... in the sex of her body" — I kept that direction (directing power → man/husband; subject role, bodily sex → woman) exactly as stated there, without carrying an invented explicit gender assignment back into para 32 where Augustine himself doesn't make it explicit.

## 4. Question-mark and exclamation-mark count table (source vs. output)

| # | src ? | out ? | src ! | out ! | match |
|---|---|---|---|---|---|
| 1 | 0 | 0 | 0 | 0 | OK |
| 2 | 2 | 2 | 0 | 0 | OK |
| 3 | 2 | 2 | 0 | 0 | OK |
| 4 | 0 | 0 | 0 | 0 | OK |
| 5 | 1 | 1 | 0 | 0 | OK |
| 6 | 0 | 0 | 0 | 0 | OK |
| 7 | 3 | 3 | 0 | 0 | OK |
| 8 | 5 | 5 | 0 | 0 | OK |
| 9 | 0 | 0 | 0 | 0 | OK |
| 10 | 3 | 3 | 0 | 0 | OK |
| 11 | 1 | 1 | 0 | 0 | OK |
| 12 | 5 | 5 | 0 | 0 | OK |
| 13 | 0 | 0 | 0 | 0 | OK |
| 14 | 3 | 3 | 0 | 0 | OK |
| 15 | 4 | 4 | 1 | 1 | OK |
| 16 | 1 | 1 | 0 | 0 | OK |
| 17 | 0 | 0 | 0 | 0 | OK |
| 18 | 0 | 0 | 0 | 0 | OK |
| 19 | 0 | 0 | 0 | 0 | OK |
| 20 | 2 | 2 | 0 | 0 | OK |
| 21 | 0 | 0 | 0 | 0 | OK |
| 22 | 0 | 0 | 0 | 0 | OK |
| 23 | 1 | 1 | 0 | 0 | OK |
| 24 | 0 | 0 | 0 | 0 | OK |
| 25 | 0 | 0 | 0 | 0 | OK |
| 26 | 1 | 1 | 0 | 0 | OK |
| 27 | 0 | 0 | 0 | 0 | OK |
| 28 | 0 | 0 | 0 | 0 | OK |
| 29 | 0 | 0 | 0 | 0 | OK |
| 30 | 0 | 0 | 0 | 0 | OK |
| 31 | 0 | 0 | 0 | 0 | OK |
| 32 | 1 | 1 | 0 | 0 | OK |
| 33 | 0 | 0 | 0 | 0 | OK |
| 34 | 3 | 3 | 0 | 0 | OK |
| 35 | 3 | 3 | 0 | 0 | OK |
| 36 | 0 | 0 | 0 | 0 | OK |
| 37 | 0 | 0 | 0 | 0 | OK |
| 38 | 0 | 0 | 0 | 0 | OK |
| 39 | 4 | 4 | 0 | 0 | OK |
| 40 | 3 | 3 | 0 | 0 | OK |
| 41 | 0 | 0 | 0 | 0 | OK |
| 42 | 0 | 0 | 0 | 0 | OK |
| 43 | 1 | 1 | 0 | 0 | OK |
| 44 | 0 | 0 | 0 | 0 | OK |
| 45 | 2 | 2 | 0 | 0 | OK |
| 46 | 0 | 0 | 0 | 0 | OK |
| 47 | 0 | 0 | 0 | 0 | OK |
| 48 | 0 | 0 | 0 | 0 | OK |
| 49 | 0 | 0 | 0 | 0 | OK |
| 50 | 0 | 0 | 0 | 0 | OK |
| 51 | 0 | 0 | 0 | 0 | OK |
| 52 | 3 | 3 | 0 | 0 | OK |
| 53 | 0 | 0 | 0 | 0 | OK |
| **Total** | **54** | **54** | **1** | **1** | **0 mismatches** |

Computed by script (`p.count('?')`, `p.count('!')` per paragraph, source vs. candidate JSON, exact string match). Zero mismatches after two correction passes (paras 7, 39, 43 initially had a stray or missing "?" from a rhetorical-question rephrasing and were fixed to match the source's own punctuation exactly).

## 5. Allegorical mappings — creation-day element → spiritual referent (direction verified against source)

| Creation element | Spiritual/allegorical referent | Direction verified in |
|---|---|---|
| Heaven and earth (Gen. 1:1, cosmic) | Spiritual and bodily (corporeal) creation broadly | paras 2-6 |
| Heaven and earth (in the Church, para 13) | The spiritual people and the carnal (fleshly) people of the Church | para 13: "God make heaven and earth, namely, the spiritual and carnal people of His Church" — heaven = spiritual people, earth = carnal people, not reversed |
| The Spirit "borne over the waters" | Grace/charity preceding and lifting up the soul, not resting on merit; NOT the Spirit being held up or supported by the waters | paras 5, 8-10: "borne over," "not borne up by them, as if He rested upon them" — explicit in source, direction preserved (Spirit acts on/above the waters, waters do not support the Spirit) |
| "Let there be light" / light | The beginning of spiritual illumination / conversion — the spiritual creature turning to God and becoming light | paras 4, 8, 11, 13 (applied first to the "heaven of heavens," then to the Church, then to the individual convert) |
| Darkness (vs. light) | The unconverted / still-fallen state — spiritual creatures (including angels and souls) that have not turned to God | paras 3, 9, 13-15, 19: "we were sometimes darkness, but now light" — darkness is the prior/unbelieving state, light is the converted state; never swapped |
| Division of light from darkness | The division between the spiritually-minded and the carnally-minded (or between the elect, known secretly to God, and others) | paras 19, 32: "Thou... dividest," "hast divided and called them in secret, or ever the firmament was made" |
| Firmament ("stretched out like a skin") | Scripture's authority / "the firmament of Thy Book" — its authority is heightened, not lessened, by the death of the mortal writers | paras 16, 17, 32-33, 47-48 |
| Waters above the firmament | The angels / the "supercelestial people" — immortal, read God's face directly, no need of Scripture | para 18: explicit — "waters... above this firmament, I believe immortal... Thine angels, who have no need... by reading to know of Thy Word" |
| Waters below the firmament (the people beneath) | Mortal humanity, who do need Scripture read to them, "the infirmity of the lower people" | para 18 (implicit contrast with the waters above) |
| Gathering together of the waters into one place ("the sea") | The society/conspiracy of the "embittered" — those pursuing earthly, temporal happiness; unbelievers bound together by shared worldly desire | paras 19-20, 48: "gatheredst together the society of unbelievers into one conspiracy" — sea = unbelievers, never the faithful |
| Dry land appearing | The visible Church / the souls that thirst after God, separated out from the bitterness of the sea | paras 19-21, 27-28, 48 |
| Earth bringing forth fruit (herbs, trees) | Works of mercy performed by the faithful (relief of bodily need = herb yielding seed; protection of the wronged = tree yielding fruit) | paras 21-22, 48 |
| Lights in the firmament | Spiritual gifts and those who hold them — teachers/"holy ones" shining with authority, not the natural sun/moon/stars themselves | paras 21-24, 47-48 |
| Sun ("rule of the day") | The greater spiritual gift — clear, perspicuous truth/wisdom, given to the mature/spiritual | para 22 |
| Moon and stars ("rule of the night") | Lesser gifts — sacraments and enumerated "notices of gifts" (healing, tongues, etc.), suited to those still carnal/immature ("babe in Christ... fed on milk") | para 22 — direction verified: moon/stars = night = for the less mature, NOT for the mature; sun = day = for the mature |
| Gathering of waters bringing forth "moving creature... and fowl" | Sacraments (moving creatures) and the preached word / miracles (birds flying above the earth, under the authority of the firmament/Book) | paras 24-27, 29 |
| Whales ("great wonders") | Great miracles | para 24 |
| Earth (separated from bitterness of waters) bringing forth "living soul" (not "moving creature") | The already-faithful/baptized, who no longer need miracles or signs to believe — explicitly distinguished from those still needing sacraments/signs (the sea-born creatures) | paras 27-28: careful preservation — "not the moving creature... but the living soul... For now hath it no more need of baptism, as the heathen have" |
| Wild beasts tamed / cattle broken to the yoke / serpents made harmless | Pride tamed / lust(self-indulgence) brought under control / curiosity made safe, respectively, as the three named "motions of a dead soul": "haughtiness of pride, the delight of lust, and the poison of curiosity" | para 29 — order in the allegory (wild beasts→pride, cattle→lust, serpents→curiosity) matches the order of the three named vices exactly; not reordered |
| Man made after God's image, renewed in mind ("Let us make man... after our image," not "after his kind") | The mind renewed by direct relation to God, not by imitating another human as a model/"kind" | paras 30-31 |
| Man's dominion over fish/birds/cattle/wild beasts/creeping things | The spiritual man's authority to judge/approve (not to judge Scripture, the firmament, the secret election of light from darkness, or the "sea" of the unquiet world, which are all explicitly placed OUTSIDE his judgment) — dominion over fish = judging sacraments; over birds/flying = judging preached words/signs; over cattle/creeping things/living soul = judging works of mercy and self-discipline | paras 31-33: explicit list of what is NOT judged (firmament, day/night division, gathering of waters/sea) vs. what IS (fish, fowl, cattle, earth, creeping things) |
| Male and female | Those spiritually "set over" others (directing) and those spiritually "subject" to those set over them (obeying) — explicitly NOT tied to bodily sex ("where, according to the sex of body, there is neither male nor female") in para 32; later, in para 46, the directing/subject duality IS explicitly mapped onto husband/wife bodily sex as a secondary, distinct point | paras 32, 46 — kept as two related but distinct statements, not merged into one |
| "Increase and multiply" | NOT read as purely literal procreation only — read as the abundance of meanings a single scriptural sign can carry, and the abundance of true senses a single scriptural statement can be understood in; explicitly qualified as applying to "multitude" across spiritual and bodily creatures alike, following the same list of allegorical categories already established (heaven/earth, light/darkness, firmament, sea, dry land, herbs/trees, lights, living soul) | paras 33-36 — Augustine's own qualification preserved: this is presented as one legitimate figurative reading alongside the literal one ("If therefore we conceive of the natures of the things themselves, not allegorically, but properly, then does the phrase... agree unto all things, that come of seed. But if we treat of the words as figuratively spoken...") — both readings kept, neither erased |
| Food given (herbs bearing seed, fruit trees) — NOT given to fish/whales | Spiritual nourishment / works of mercy owed to those who minister spiritual doctrine (illustrated by Onesiphorus, the Philippians, Paul's "gift vs. fruit" distinction) — NOT given to carnal/unbelieving people (fish/whales), who need miracles and sacraments instead, not works of mercy as such | paras 36-40 |
| "Very good" (collective, eighth statement) | The whole created order taken together is better/more beautiful than the sum of its parts taken singly — an aesthetic/theological point about wholeness, not a claim about time or sequence | paras 41-42 |
| The seventh day / Sabbath | The eternal rest awaiting the redeemed — without evening, without succession, unlike the six days which each had "morning and evening" | paras 48-51 |

## 6. Independent scan results

- **Single-quote-as-quotation-mark usage:** scanned every paragraph programmatically for the `'` and curly-quote characters. Result: **zero** instances used as quotation marks. The only `'` characters found are ordinary possessives ("man's soul," "men's wills," "world's temptations," "man's unbelief") — all legitimate apostrophes, not misused quote marks.
- **Stray "--" (double hyphen):** scanned every paragraph for the literal substring `--`. Result: **zero** instances. All dashes in the candidate use the proper em dash "—".
- Quote style: double quotes only, used in two places (para 7, para 16) for the technical phrase "borne above" — matches convention, no single-quote substitution.

## Summary

53/53 paragraphs, one-to-one with source. Question-mark and exclamation-mark counts match exactly per paragraph (54 "?" total, 1 "!" total, 0 mismatches, after fixing 3 paragraphs — 7, 39, 43 — where an initial rephrasing had added or dropped one rhetorical-question boundary relative to Pusey's actual punctuation). No dropped clauses found on re-check of the long periodic sentences in paras 8, 12, 18, 22, 32, 35, 36. Allegorical mappings for light/darkness, waters above/below the firmament, sea/dry land, and sea-creatures/birds vs. land-animals/living-soul were each checked against the specific source sentences making the claim, not against general assumptions, and none were found inverted.

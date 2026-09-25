# Independent re-check — Confessions modern-en, Books 8–13 (fix pass)

Scope: every paragraph that the fix pass changed in Books 8–13 (55 paragraphs: B8 ×6, B9 ×4, B10 ×12, B11 ×10, B12 ×9, B13 ×14). For each one I read the word diff (`fixdiff.py`) and the full current paragraph against Pusey (`show.py`). Where a fix concerned meaning, Genesis 1:1 capitals or *caritas*, I also read O'Donnell's Latin (`latin/bookNN.txt`). Mechanical checks on all 55: the `"` count matches Pusey in every paragraph, there are no doubled words, and there are no archaic forms. The one hit, "art" in 12 ¶38, means craft.

| book | para | fix verified? (OK / PROBLEM) | note |
|---|---|---|---|
| 8 | 3 | OK | "every kind of monster-god": stray verse capital removed; the clause is complete. |
| 8 | 15 | OK | "rich fruitfulness of the desert" (*ubertates fecundas heremi*), "Triers" (Pusey form), "the games in the circus" (*circensium*). No gloss, and all clauses kept. |
| 8 | 20 | OK | `"to will" was not the same as "to be able"`. Pusey's marks are restored and the sentence reads cleanly. |
| 8 | 23 | OK | The Manichees' cry is unmarked, as in Pusey. The sentence stays clear because "cry out, Look, …" is still set off by a comma. |
| 8 | 29 | OK | "most bitter contrition" (*contritione*). "as though a light of serenity had been poured into my heart" is complete and matches Pusey/*luce securitatis*. |
| 8 | 30 | OK | "she leaps for joy and triumphs, and blesses You". The present tense now agrees with the other verbs in the series, as in Pusey. |
| 9 | 3 | OK | "I endured them bravely; endured them, because …" gives Pusey's plain repetition without marks. It follows "I put up with that stretch of time" smoothly. |
| 9 | 25 | OK | "done this for me more abundantly, so that I now see you even despising earthly happiness and become His servant". The addition "than I asked" is gone and the sentence is grammatical. |
| 9 | 33 | OK | "a person of great love". This is the §8 default. *grandi caritate* is not a named principle and nothing collides with it. |
| 9 | 37 | OK | "than by my own prayers". The comparison of two means is restored and no "alone" claim is added. |
| 10 | 2 | OK | "love believes all things", "whose ears love opens". 1 Cor 13:7 is still recognizable, and neither sentence contains *amor*/*dilectio*. |
| 10 | 3 | OK | "For love, which makes them good, … it is love in them that believes me". This is the default. The *amore* earlier is in a separate sentence. |
| 10 | 17 | OK | `not what is "collected" just anywhere, but what is "recollected,"` restores Pusey's word-play and marks. The count (6) matches Pusey. |
| 10 | 18 | OK | "but those lines are different:" (*illae aliae sunt*). The gloss is removed and the clause is complete. |
| 10 | 25 | OK | "a fearful thing, O my God" (*nescio quid horrendum*), as Pusey has it. |
| 10 | 26 | OK | `"Is this it?" "Is that it?" I kept saying, "No,"`. Pusey's two quoted questions are restored. |
| 10 | 32 | OK | `no more hesitate to say "in the truth" than they hesitate to say "that they want to be happy."` The marks follow Pusey and the sentence is complete. |
| 10 | 46 | OK | "what is imperfect in Him". The referent is Christ ("He who has overcome the world … His body"), so the capital is correct under §1. |
| 10 | 51 | OK | "with the feet of love" (*pede caritatis*). This is the default and nothing collides. |
| 10 | 58 | OK | "In this way he may keep those who have been made like himself as his own, bound not in the harmony of love but in the fellowship of punishment" fits *sui similes factos secum habeat, non ad concordiam caritatis*. It is grammatical, and the shift to "they might serve him" stays clear. The word order is slightly heavy but acceptable. "love" has no same-sentence collision. |
| 10 | 67 | OK | "and God with God, and together one God" (*et simul unus deus*). The formula is no longer narrowed. |
| 10 | 69 | OK | "that I may live and consider wonderful things" (*ut vivam et considerem*). Both verbs are now purposes. |
| 11 | 0 | OK | Ps 145:3 and Mt 6:8 are unmarked, as in Pusey. Both sentences still read correctly. |
| 11 | 4 | OK | `"In the beginning You made heaven and earth."` The verse is plain here, and the Beginning is not identified with the Word until ¶10. This follows the §8 rule. |
| 11 | 7 | OK | "This is my beloved Son?" and "Let the heaven and the earth be made" are unmarked, as in Pusey. The soul's own speech keeps its marks. |
| 11 | 10 | OK | "oracle: How wonderful are Your works … all!" Unmarked, as in Pusey. The colon keeps the syntax clear. |
| 11 | 15 | OK | "Today I have begotten You." Unmarked, as in Pusey. The capital T is consistent with "Your Today" in the same paragraph. |
| 11 | 29 | OK | "are times, because when the sun stood still …" (*quia*, Pusey "because"). The causal logic is restored. |
| 11 | 30 | OK | "estimated, more or less, as we usually say". The added marks are removed and the count (12) matches Pusey. |
| 11 | 38 | OK | "so that through Him I may lay hold, as in Him I have been laid hold of, and be gathered back … not in distension but in intention, I press on" fits *ut … apprehendam in quo et apprehensus sum* and *secundum distentionem … intentionem*. It is a purpose clause with no invented object. The long sentence still resolves grammatically on "I press on". |
| 11 | 39 | OK | "a disease that is a punishment" (*poenali morbo*). `"never" cannot be said when "time" does not exist` restores Pusey's mention-quote. The count (12) matches Pusey. |
| 11 | 40 | OK | "his senses are distended" sets up "without any distension in Your action". It is consistent with the book's distentio rule. |
| 12 | 8 | OK | "You in the beginning created …" and "which You created in the beginning" follow the Latin, which cites the plain verse (*cum te commemorat fecisse in principio*). The identification with Wisdom is in ¶6 (*in principio, quod est de te, in sapientia tua*), not here. This follows §8. |
| 12 | 14 | OK | "before any day, in the beginning, You created" (*fecisti ante omnem diem in principio*). The plain verse, correctly lowercase. |
| 12 | 27 | OK | Only the fifth opinion, "In the beginning … at the very start" (*in ipso exordio*), is lowercased. The four "in His Word" readings keep the capital. This is correct. |
| 12 | 29 | OK | The objector quotes the plain verse, so lowercase is correct. |
| 12 | 30 | OK | "in the breadth of love" (*in latitudine caritatis*). This is the default and there is no *amor* in the sentence. |
| 12 | 31 | OK | "when he wrote, In the beginning God made heaven and earth" is the plain verse as Moses wrote it. It is consistent with the later lowercase "In the beginning" in the same paragraph. |
| 12 | 32 | OK | The first "Moses did not think what you say, but what I say." is unmarked, as in Pusey, and the count (4) matches Pusey. "because they are divinely inspired" fits *quia divini sunt*. |
| 12 | 37 | OK | The plain words and the "at first" reader ("by beginning understands the start …", "In the beginning He made … At first He made") are lowercase. "Wisdom, the Beginning" and "understand In the Beginning to mean 'In Your Wisdom …'" keep the capital. This is exactly the §8 split. |
| 12 | 38 | OK | "understands In the beginning He made only as if it said At first He made" is explicitly the "at first" reading, so lowercase is correct. |
| 13 | 3 | OK | "Let there be light, and there was light," is unmarked, as in Pusey. It is set off by commas, so the sentence parses. |
| 13 | 7 | OK | Rom 5:5 is unmarked. "a more excellent way, the way of love" (*supereminentem viam caritatis*) and "how love lifts us up again" (*sublevatione caritatis*) are the default. The *amore/amores* come in later sentences. The *caritatis Christi* ("the love of Christ") was already "love". |
| 13 | 8 | OK | "had You not said from the beginning, Let there be light, and light had come to be" is unmarked, as in Pusey, and grammatical. |
| 13 | 9 | OK | "they said to me, We will go up to the house of the Lord." Unmarked, as in Pusey. |
| 13 | 10 | OK | "in which You said, Let there be light, and there was light." Unmarked, as in Pusey. |
| 13 | 12 | OK | The Sanctus, "Let there be light: Repent, …" and "Repent; let there be light" are unmarked, as in Pusey. "that mountain equal to You, but little for our sake" fits *aequalem tibi sed parvum propter nos*. The gloss "made" is removed. |
| 13 | 13 | OK | All six quotations are unmarked, as in Pusey. "and says, When shall I come? longing to be clothed …" matches Pusey's "saith, When shall I come? desiring …". The stray comma is gone. |
| 13 | 14 | OK | "See, I too say, O my God, where are You?" and "speaks to it: Why are you sad, …" are unmarked, as in Pusey, and both sentences are clear. |
| 13 | 15 | OK | "As it is said, For heaven shall be folded up like a scroll;" Unmarked, as in Pusey. |
| 13 | 19 | OK | "who said, Let the waters be gathered … appear, the land that thirsts for You?" Unmarked, as in Pusey, and grammatical. |
| 13 | 22 | OK | "All these, he says, I have kept." matches Pusey's unmarked "All these (saith he) have I kept." |
| 13 | 23 | OK | "as if God were saying, Let there be lights in the firmament of heaven: suddenly …" Unmarked, as in Pusey. |
| 13 | 24 | OK | "through you He says, Let the waters bring forth: not the living creature …" Unmarked, as in Pusey. |
| 13 | 35 | OK | `we do find "multitude" among creatures spiritual and bodily` restores Pusey's mention-term with marks. The count (2) matches Pusey and the sentence is complete. |

## Kept "charity" cases (§8 exception)

| book | para | Latin | judgment |
|---|---|---|---|
| 10 | 39 | *o amor, qui semper ardes … caritas, deus meus, accende me* | Fits. *amor* and *caritas* are side by side in the invocation, and "love" would collapse the pair. |
| 12 | 25 | *finis eius est caritas de corde puro* (1 Tim 1:5) | Fits. This is the named "end of the commandment is charity" principle. |
| 12 | 33 | *usque ad finem caritatis* | Fits. It echoes the same 1 Tim 1:5 formula. |
| 12 | 33 | *duo praecepta caritatis* | Fits. §8 names it explicitly. |
| 12 | 33 | *ipsam offendere caritatem propter quam dixit omnia* | Fits. It refers back to the two precepts just named, as the principle behind all of Scripture, and the paragraph has *diligamus* ("Let us love"), so "love" would collide. |
| 12 | 39 | *praecepti fine, pura caritate* | Fits. This is the 1 Tim 1:5 formula, and *diligamus … diligamus te* follows nearby. |
| 13 | 6 | *per matrem caritatem* | Fits. This is the "mother Charity" §8 names. |

Every kept case falls within the §8 exception. Every *caritas* the fix pass changed to "love" was a non-principle use with no collision.

## PROBLEM rows

None.

Verdict: ALL OK

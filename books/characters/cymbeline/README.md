# Cymbeline character package

All twenty-nine scenes in both actual English editions: 81 recognition cards in the original and 80 in the modern. The cards.md review copy shows Central, Major, Supporting or Reference beside every entry. Imogen and Posthumus are Central; Cymbeline, the Queen, Cloten, Iachimo, Pisanio, Belarius, Guiderius, Arviragus, Lucius and Jupiter are Major; the rest of the speaking and stage cast and the nine named groups are Supporting; the British and Roman figures of the tribute argument, and the classical figures, are Reference.

Ordinary identity is supplied at first mention: Imogen is Cymbeline's daughter and Posthumus's wife, Cloten is the Queen's son by an earlier husband, Pisanio is Posthumus's servant, Philario is Posthumus's host in Rome. Later cards stay short. Coordinates are reading-unit number and zero-based paragraph, with gates at paragraph end.

## The three concealments

**The stolen princes.** Belarius, Guiderius and Arviragus enter at 15:0 under their own names, because the stage directions and speech cues use them, but nothing the reader has yet seen says who they are. Their first cards therefore identify them only as an old man and two young men living in a Welsh cave, and name the names they go by — Morgan, Polydore, Cadwal. A test asserts that the words "Cymbeline", "stolen", "son", "banish" and "stole" appear in none of those first cards. Everything else unlocks at a single point: Belarius's soliloquy at 15:11, where he tells the audience that Polydore is Guiderius the heir, Cadwal is Arviragus, Euriphile was their nurse, and he himself is the banished Belarius who is called Morgan. Each of the three has exactly one later card and it is gated there. Cymbeline's court does not learn any of this until 29:123, but the reader does at 15:11, and the cards follow the reader.

**Fidele.** Imogen's disguise arrives in two steps and the cards follow them: the boy's clothes after 16:38, where Pisanio's plan is settled and the scene ends, and the name Fidele after 19:18, where she first gives it. Her first card mentions neither, and a test asserts it. She is known again at her father's court after 29:90.

**Posthumus's two changes.** He comes to Britain in the Roman army and resolves at 25:1 to fight as a British peasant; at 27:19 he gives himself out as a Roman so as to be taken prisoner. Both are gated where he says them.

**Richard du Champ** is a name Imogen invents on the spot at 22:152 for a master she never had. It is bound with kind `unresolved-name`, and its card says plainly that no such man exists in the play, so that a reader who taps it is not handed an invented character.

## Binding review

- **Two Caesars in one argument.** Scene 13 is the tribute debate, and the bare imperial name means Julius in one line and the reigning Augustus in the next. "Julius Caesar" and "Augustus Caesar" are longer spans and win where the text prints them; every bare occurrence was reviewed one at a time. Julius: 13:2 ("Famous in Caesar's praises", of Cassibelan's opponent), both at 13:5 ("A kind of conquest Caesar made here", "to master Caesar's sword"), 13:9 ("Caesar's ambition ... did extort this tribute"), and the second at 13:11 ("whose use the sword of Caesar hath too much mangled"). Augustus: the first at 13:11 ("Say then to Caesar"), both bare ones at 13:12, both at 13:13 ("Thy Caesar knighted me"), 20:1, 29:159 and 29:160. Cloten's 13:8 ("If Caesar can hide the sun from us") is bound to Augustus as the emperor presently demanding tribute; it is the least clear of the set and is recorded here as a judgment rather than a certainty. The plural at 13:4, "There be many Caesars ere such another Julius", is emperors at large and is not bound; the bare "Julius" beside it is the conqueror.
- **One LADY cue, two households.** Imogen's woman speaks in scenes 4, 9 and 10 and answers to Helen when Imogen calls her at 9:2; the LADY in scene 6 is one of the Queen's flower-gatherers. They are separate entries.
- **Dorothy is not Helen.** At 10:58 Imogen sends word "To Dorothy my woman". The play names two of her women and never says whether Dorothy is the one who speaks. Dorothy has her own Reference entry, bound only at that line, and no card claims they are the same person.
- **One LORD cue, two places**: Cymbeline's court in scene 23 and the battlefield in scene 27. One MESSENGER cue likewise serves the court in scene 10 and the prison in scene 28. Each pair is separate.
- The gaoler who talks with Posthumus about dying is bound from both the GAOLER and FIRST GAOLER cues; the SECOND GAOLER who calls him out is a separate entry.
- Jupiter and Jove are one god: the descending JUPITER of scene 28 and the Jove sworn by throughout, together with "the Thunderer". He speaks and acts, so he is Major rather than Reference.
- The Soothsayer is named Philarmonus only once, by Lucius at 29:149; that name is bound to him.
- Iachimo's brother is named only by his title, "Sienna's brother", at 22:142.
- The collective cues BOTH (scene 22), BROTHERS, LADIES and ALL are left unbound rather than given group entities that would double the individuals already covered.
- The Queen has no name in the play and none is supplied; her card says so.
- Milford Haven, Lud's Town, Cambria and the Severn are places and are not bound as people.

## Source review

Both source files have 29 aligned scenes and 1,133 paragraphs. No source edits. Three differences are recorded:

1. **A truncated opening stage direction.** Scene 9 (Act 2, Scene 2) begins with the bare fragment `in one corner.` at 9:0 in both editions, before the entry direction at 9:1. The lost words are the ones that put the trunk in Imogen's bedchamber — the play's central stage property. Nothing is bound to the fragment. This is cosmetic in the reader and does not affect any binding, but a release owner restoring the full direction would change both files' bytes and require a rebuild.
2. **Titan survives only in the original.** At 16:32 Pisanio speaks of "common-kissing Titan"; the modern reads "the common-kissing sun". `titan` is recorded in `validation-report.json` as an `omittedEntities` entry for `modern-en` — an entity genuinely absent from that edition, not an unresolved binding.
3. **Spellings that differ between the settings.** The original prints `Cæsar` and `Æneas` with the ligature; the modern prints `Caesar` and `Aeneas`. Both forms are carried as edition-appropriate aliases and a test asserts each appears only where it should.

None of the three blocks safe enablement.

The local complete text supplies the card evidence. [Folger's complete play](https://www.folger.edu/explore/shakespeares-works/cymbeline/read/) and its [editorial cast list](https://www.folger.edu/explore/shakespeares-works/cymbeline/read/characterList/) were consulted for the speaking-role distinctions, for Helen as Imogen's attendant and for the standing of Dorothy as a separate name. Folger is a comparison edition, not the offset source.

Run `python3 books/characters/build_cymbeline.py --check` and `python3 -m unittest discover -s books/characters -p test_cymbeline.py`. Eight tests cover source hashes, exact UTF-16 spans, the four assumed names and the invented one, the two Caesars occurrence by occurrence, the scene-local lady, lord and messenger roles, all three concealments and their gates, the edition omission and spellings, and every paragraph-end snapshot. Release owner must register both English editions, version the asset, run app gates and production verification. Validated content is not live coverage.

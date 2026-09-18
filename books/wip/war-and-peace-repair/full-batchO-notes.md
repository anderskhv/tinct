# Batch O Fidelity Check Notes (chapters 330–332)

Source: `full-batchO-source.json` | Candidate: `full-batchO-current-modern-en.json` | Corrected output: `full-batchO-corrected.json`

## Paragraph-count table (script-verified)

| Chapter | Title | Source paragraphs | Corrected paragraphs | Match |
|---|---|---|---|---|
| 330 | Book Fifteen — Ch. 13 | 31 | 31 | OK |
| 331 | Book Fifteen — Ch. 14 | 9 | 9 | OK |
| 332 | Book Fifteen — Ch. 15 | 24 | 24 | OK |

(Verified by script: iterated both JSON files, asserted `chapter numbers` and `len(paragraphs)` match pairwise for all 3 chapters. All pass.)

## Chapter-by-chapter findings

**330 (Book Fifteen, Ch. 13) — SOUND.** Pierre's transformation during his convalescence at Orël — his new equanimity, the eldest princess's grudging affection, Terénty and Váska's observations, the doctor, the Italian officer's devotion, Willarski's visit, and Pierre's newfound practical decisiveness (refusing the French colonel, deciding to rebuild in Moscow) — is rendered completely and faithfully across all 31 paragraphs. No omissions, inventions, or distortions found.

**331 (Book Fifteen, Ch. 14) — DEFECTIVE (2 fixes).**

1. **Invented content (paragraph 7 of 9, the "plundering" paragraph).** Source: "But plundering by the Russians, with which the reoccupation of the city began, had an opposite effect: the longer it continued and the greater the number of people taking part in it the more rapidly was the wealth of the city and its regular life restored." The candidate kept this claim but then appended a substantial invented simile with no basis in the source at all: *"And just as water seeping into a dry sponge does not flow freely anymore, neither separately nor as a pool, so the army and population flooding into Moscow simply spread through the ruined city, which soaked them up, and the process of restoration began."* This sponge/water image does not exist anywhere in Tolstoy's text (the actual sponge/ant imagery in this chapter belongs to paragraph 1's ant-hill analogy, not this paragraph). Fixed by removing the invented material and restoring a direct rendering of the source's actual claim about Russian plundering accelerating the city's recovery.

2. **Fabricated/nonsensical replacement of the chapter's final sentence (paragraph 9 of 9).** Source ends the chapter: *"And Count Rostopchín wrote proclamations."* — a dry, ironic closing beat (Rostopchín, the wartime governor of Moscow, issuing propaganda leaflets amid the chaos). The candidate replaced this with: *"The old count's Rostov spirit was alive, regenerating the city."* This is fabricated content that (a) does not appear in the source at all, (b) confuses Count Rostopchín (a real historical figure, Moscow's governor) with the fictional Rostóv family, and (c) inverts the passage's dry irony into unearned sentimentality. Fixed by restoring the correct closing sentence: "And Count Rostopchin wrote proclamations."

Rest of the chapter (the ant-hill analogy, the wave of plunderers, the city's gradual repopulation and reconstruction) is otherwise rendered faithfully.

**332 (Book Fifteen, Ch. 15) — SOUND.** Pierre's return to Moscow, his visit to Princess Mary, and his recognition of Natásha in the darkened room are all rendered completely and faithfully, including the emotional beats (his confusion, his dawning realization, Natásha's transformed appearance) and all dialogue.

## Summary
- 3 chapters checked.
- 2 sound, unchanged (330, 332).
- 1 defective, corrected (331): one invented simile removed/replaced with a faithful rendering, and one fabricated closing sentence replaced with the correct translation of the source's actual final line.

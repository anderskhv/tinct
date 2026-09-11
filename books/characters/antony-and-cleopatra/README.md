# Antony and Cleopatra character package

All forty-two scenes in both actual English editions: 102 recognition cards in the original and 101 in the modern. The cards.md review copy shows Central, Major, Supporting or Reference beside every entry. Antony, Cleopatra and Octavius Caesar are Central; Enobarbus, Charmian, Sextus Pompeius, Lepidus, Menas, Eros, Agrippa and Dolabella are Major; the rest of the speaking and stage cast and the seven named groups are Supporting; the client kings, the captains of the two rolls, the Roman past behind the action and the gods are Reference.

Ordinary identity is supplied at first mention: Antony is one of the three rulers of the Roman world, Octavia is Octavius Caesar's sister, Enobarbus is Antony's closest officer, Charmian and Iras attend Cleopatra. Later cards stay short, and there are only four of them. Antony's and Octavia's marriage unlocks after 8:3; Enobarbus's desertion after 30:7, where the soldier says he is with Caesar; Cleopatra's confinement in her monument after 42:11. Coordinates are reading-unit number and zero-based paragraph, with gates at paragraph end.

No card reports a death. Fulvia's, Enobarbus's, Antony's, Iras's, Charmian's and Cleopatra's all happen inside the play, and each belongs to the passage that carries it; a test asserts that the words "dies" and "death" appear in no card body for Antony, Cleopatra or Enobarbus.

## Binding review

- **Two Caesars.** "Caesar" is the living Octavius in all but thirteen of its occurrences. The dead Julius has them at 5:15 ("Broad-fronted Caesar"), 5:26, 5:27, 5:29 and 5:30 (Cleopatra and Charmian on her earlier love), 7:86 (Agrippa: "She made great Caesar lay his sword to bed"), 11:3 and 11:24 (both printed "Julius Caesar"), 11:31 (Enobarbus on the queen delivered "to Caesar in a mattress"), 14:40 ("When Antony found Julius Caesar dead"), 19:19 ("at Pharsalia, where Caesar fought with Pompey"), 25:62 ("Dead Caesar's trencher") and 25:44. Each was reviewed against the speech it stands in, and a test pins the exact set in both editions. At 25:44 one phrase carries both men: "Your Caesar's father" binds the name to Octavius and the word "father" to Julius.
- **Three Pompeys.** The character is Sextus Pompeius. His father, Pompey the Great, has four: 2:106 ("throw Pompey the Great and all his dignities upon his son"), 5:15 ("great Pompey"), 19:19 (Pharsalia) and 11:41, where Menas says "Thy father, Pompey" — the modern reads "Your father" and both forms are bound. His elder brother is named once, as "Gneius Pompey" at 25:62, and has his own entry. The reading of 5:15's "great Pompey" as the father rather than the brother follows the majority of editors; the play does not settle it, and this note is here rather than in the card.
- **Marcus is four men.** Marcus Antonius is Antony; Marcus Crassus is the general Ventidius avenges in Parthia; Marcus Octavius and Marcus Justeius are two of Antony's sea-captains at 19:38. Marcus Octavius is *not* Octavius Caesar: the longer span takes precedence and a test asserts it.
- **Two Ptolemys and an Alexander who is not the Macedonian.** "Ptolemy" at 4:1 and 4:3 is Cleopatra's dead brother-husband, whose queen she is called; at 18:3 it is her son by Antony, given Syria at the enthronement. The Alexander given Media in that same line is her other son, not Alexander the Great, and he is bound only there. Philadelphos in the roll of kings at 18:23 is the king of Paphlagonia and is kept separate from the Ptolemy of 18:3.
- **"The guard" is sometimes not a body of men.** "Court of guard" at 34:1 and 34:20 is a watch-post and "made good guard for itself" at 26:2 is abstract. Neither is bound; the guard Antony calls for and the company that enters at 39:43 are.
- The Ambassador who comes from Antony is his schoolmaster; the play does not give him the name Euphronius that some editions supply, and none is invented here.
- Herod of Jewry is one man across all five of his mentions, including Alexas's failed embassy at 31:9.
- Egypt, Rome, Actium, Pharsalia, Philippi, Cydnus, Toryne, the Nile and Jewry are places and are not bound as people.
- Generic titles are not bound. "Emperor", "queen", "triumvir" and "general" are left alone, as is the constant "the gods".

## Source review

Both source files have 42 aligned scenes and 1,513 paragraphs. No source edits. Three differences are recorded:

1. **The modern uppercases names inside stage directions where the original keeps title case.** "Enter Demetrius and Philo" becomes "[Enter DEMETRIUS and PHILO.]" This is systematic, and every person in the package carries both the capital and title-case forms as aliases. It is the main reason the raw title-case counts differ so widely between the two files.
2. **The original prints the ligature in Phœbus**; the modern prints Phoebus. Both are aliases on the one entry and a test asserts each appears only in its own edition. Unlike Cymbeline, both settings of this play spell Caesar plainly, with no ligature.
3. **"Ladies" survives only in the original**, in the entry direction at 1:2, where the modern rewrites the direction without the word. `ladies` is recorded in `validation-report.json` as an `omittedEntities` entry for `modern-en` — an entity genuinely absent from that edition, not an unresolved binding.

None of the three blocks safe enablement.

The local complete text supplies the card evidence. [Folger's complete play](https://www.folger.edu/explore/shakespeares-works/antony-and-cleopatra/read/) and its [editorial cast list](https://www.folger.edu/explore/shakespeares-works/antony-and-cleopatra/read/characterList/) were consulted for the speaking-role distinctions, for the identity of the Ambassador as Antony's schoolmaster, and for the two sons named at the enthronement. Folger is a comparison edition, not the offset source.

Run `python3 books/characters/build_antony_and_cleopatra.py --check` and `python3 -m unittest discover -s books/characters -p test_antony_and_cleopatra.py`. Eight tests cover source hashes, exact UTF-16 spans, the exact set of Julius Caesar paragraphs, the three Pompeys, the namesakes in the two rolls, the guard that is a post rather than a company, the four gates and the edition omission, and every paragraph-end snapshot. Release owner must register both English editions, version the asset, run app gates and production verification. Validated content is not live coverage.

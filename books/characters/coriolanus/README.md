# Coriolanus character package

All twenty-nine scenes in both actual English editions: 90 recognition cards in each. The cards.md review copy shows Central, Major, Supporting or Reference beside every entry. Caius Martius is Central; Menenius, the two tribunes, Cominius, Volumnia, Aufidius and Virgilia are Major; the rest of the speaking and stage cast and the sixteen named groups are Supporting; the Martian genealogy, the classical figures and the people named only in report are Reference.

Ordinary identity is supplied at first mention: Caius Martius is a Roman patrician and the city's foremost soldier, Volumnia is his mother, Virgilia his wife, Young Martius their son, Aufidius the Volscian general. Later cards stay short. Coordinates are reading-unit number and zero-based paragraph, with gates at paragraph end.

## The name he earns and the sentence that takes it away

The play's central figure changes speech cue partway through: he speaks as MARTIUS until the army gives him a surname and as CORIOLANUS afterwards. Both cues are one entity, and his cards follow the change rather than pretending it away. His first card calls him Caius Martius and does not use the name Coriolanus at all; a test asserts it. The name unlocks after 9:11, where Cominius proclaims "Caius Martius Coriolanus" to the host, and his banishment after 16:60, where Brutus pronounces the sentence. Nothing later is imported into either: the last act's alliance with the Volsces and its end are left to the passages that carry them.

## Binding review

- **Martius is three things.** Bare "Martius" is Caius Martius everywhere except inside two longer spans, which take precedence: "Ancus Martius", the king of Rome in the Senate's genealogy at 13:97, and "young Martius", his son. The same speech names the house of the Martians as a family, bound to a group entry rather than to any person. A test asserts that no bare "Martius" is bound to anything but the central figure, that 13:97 does not bind him at all, and that all three of Young Martius's mentions carry the longer span.
- **Marcus is not Martius.** At 29:45 a Volscian in the crowd at Corioles cries "He killed my cousin Marcus!" That is a dead Volscian with his own entry, not the Roman the crowd is shouting at, and 29:45 binds nothing else.
- **Young Martius sits inside italic markup in two places.** At 26:28 the original prints `[_To young Martius_.]` and at 26:32 `[_Young Martius rises._]`. Underscore is a word character, so the shared exact-alias matcher can see neither end of the name there. This book binds that one name with letter/digit boundaries instead, in both settings, so the two editions cover the same three occurrences.
- **Two gentlewomen in one scene.** The gentlewoman who brings Virgilia word of the visit at 3:4 and 3:10 is not the one who comes in attending Valeria at 3:13. They are separate entries.
- **The two agents on the road** in scene 19 name each other: the ROMAN cue is Nicanor and the VOLSCE cue (VOLSCIAN in the modern setting) is Adrian. Each cue is bound to the man the other addresses by name.
- **Cotus** is called for by name at 21:4 and never brought on. He has his own entry and is deliberately not merged into any of the three numbered servingmen, since the source does not say which of them he is.
- **Hob and Dick** at 13:51 are not two men of the play. They are common names Coriolanus throws out for ordinary citizens at large, and they are bound with kind `unresolved-name` to a single entry whose card says so.
- Publicola is named once, at 26:24, as Valeria's brother; that is the whole of what the play says of him and the whole of what his card says.
- Corioles, Antium, the Tarpeian rock, the Tiber, Ithaca and Greece are places and are not bound as people. The Antiates and the Volsces are peoples and have group entries.
- Generic titles are not bound. "General", "Consul", "Tribunes" and "Senators" as offices are left alone except where they are the plural group itself; bare "the people" and "the commons" are likewise not bound.

## Source review

Both source files have 29 aligned scenes and 1,379 paragraphs, the same speaking roles and no omitted entities on either side. No source edits. Two differences are recorded:

1. **The Volscian agent's cue is spelled differently.** The original prints `VOLSCE.` and the modern `VOLSCIAN.` for the same seven speeches. Both are carried as aliases on the one entry and a test asserts each appears only in its own edition.
2. **The huntress is spelled differently.** The original prints `Dian` at 26:24 where the modern prints `Diana`. Both are aliases on the one entry.

The original also carries Gutenberg-style italic underscores in some stage directions, which is what makes the Young Martius rule above necessary; the modern setting keeps the same two directions without them. Nothing was stripped, and no source bytes were changed. Neither difference blocks safe enablement.

The local complete text supplies the card evidence. [Folger's complete play](https://www.folger.edu/explore/shakespeares-works/coriolanus/read/) and its [editorial cast list](https://www.folger.edu/explore/shakespeares-works/coriolanus/read/characterList/) were consulted for the speaking-role distinctions, for Nicanor and Adrian, and for Publicola as Valeria's brother. Folger is a comparison edition, not the offset source.

Run `python3 books/characters/build_coriolanus.py --check` and `python3 -m unittest discover -s books/characters -p test_coriolanus.py`. Seven tests cover source hashes, exact UTF-16 spans, the three Martian namesakes, the earned name and the banishment gate, the scene-local gentlewomen and the two road agents, the stock names and the edition spellings, and every paragraph-end snapshot. Release owner must register both English editions, version the asset, run app gates and production verification. Validated content is not live coverage.

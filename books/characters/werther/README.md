# The Sorrows of Young Werther: complete recognition package

Manually authored and source-reviewed across all 84 reading units, including the editor’s final narrative and the quoted Ossian poems. Both English editions contain 139 cards. Original English has 822 mentions; modern English has 772. Each source contains 354 paragraphs. No source text, app code or runtime registration is changed.

Read cards.md for the complete copy with categories. Werther is Central; Charlotte, Albert and Wilhelm are Major. The local cast is Supporting. Authors, religious allusions and characters within quoted literature are Reference in relation to this novel. These categories are available with the first recognition card.

## Recognition and gates

- Werther is simply the main character whose letters tell the story. No diagnosis or death is supplied in his first card.
- Charlotte is named at the district judge’s “eldest daughter” in 7:4. Her care for her younger siblings and engagement to Albert are ordinary identifying facts, not concealed identities. Albert is named at the aunt’s reference to Charlotte’s fiancé in 12:7 in both editions. Wilhelm is identified at the opening address to the dear friend in 2:0.
- Charlotte’s reminder shortens after 14:5 to the woman Werther loves, engaged to Albert. Marriage changes only after 47:1 ends; Albert’s card then becomes “Charlotte’s husband.” Werther’s later imagined marriage never changes that fact.
- Henry/Heinrich is named at the first description of the man looking for flowers in 80:1. His former employment and connection to Charlotte are held until 81:0 ends. He is not merged with the peasant lad.
- The peasant lad initially works for the widow. The reminder changes to former servant after 61:2. The replacement servant remains separate. No early card calls the lad a murderer or exposes the later outcome.
- Two Leonoras: Werther’s earlier acquaintance in 2:0 and Charlotte’s fictional example in 12:12. No assertion they are the same person.
- Hans, also called John in the original at 58:0, is the youngest boy. Modern English calls him Hans there. Philip and the eldest brother are separate, as are this family’s parents and Charlotte’s family. No current ages are frozen into running cards.
- The old vicar and his predecessor, the old vicar’s wife, the new vicar and his wife are separate. The tree-dispute steward is not Charlotte’s father, although the final narrative also calls her father “steward.” The schoolmaster in that dispute is not conjecturally merged with the Walheim mother’s father.
- The late Count M and his garden are distinct from Werther’s embassy friend Count C. The source later calls the latter Count O; the narrative explicitly refers back to the repeatedly mentioned friendly count. The final “count’s garden” is the earlier local garden, not a new appearance by the embassy friend.
- The ambassador is not bound at Werther’s imagined future job in modern 49:0. The crown prince and the prince offering hospitality remain separate. Generic hypothetical princes are not assigned either identity.
- The servant and maid in Albert’s pistol anecdote are separate from Werther’s servant and Charlotte’s household servant. The surgeon in that anecdote is not the later doctor attending Werther. No invented landlord characters from other versions are added to these actual source files.
- In the Ossian passage: Colma’s father/brother, Minona’s father Torman, Morar’s mother/beloved, Morglan, Armin/Arindal/Daura, Carmor/Colgar/Annira and Erath’s brother have distinct bindings. The last “brother” in 84:76 is Arindal; the earlier one is Erath’s brother. Geographic names such as Lora, Selma, Fura, Gorma and Galmal are not people. The son of the rock is an echo, not a hidden person.
- Son of God resolves to Jesus, not the shorter God span inside it. The Good Samaritan parable’s priest, Levite and Samaritan are literary references; the generic absent funeral priest is not the parable character. Emilia Galotti and The Vicar of Wakefield are book titles here, not direct references assigned invented local cast roles.

## Inherited source differences for release review

Both sources preserve Count C / Count O variation. The original’s Chancellor N and patched-coat I become a court councillor R and patched-coat J in modern English. Their role-identifying cards remain consistent without inventing full names. The unrelated sick N at 69:0 is separate. Original “young W. Seldstadt” lacks the separating comma explicit in modern “young W., Selstadt”; the two companions are kept separate. These source differences are documented, not silently rewritten by the card package.

Original Andran / modern Audran, Henry / Heinrich, Sultzer / Sulzer, Winkelmann / Winckelmann, Batteaux / Batteux, Kennicot / Kennicott and Ernestine / Ernesti are retained in exact bindings. Wetstein is a publishing name, not confidently assigned to a particular scholar with that surname.

Francis I in the coronation comparison is the eighteenth-century Holy Roman emperor, consistent with the [Habsburg historical collection](https://www.habsburger.net/en/persons/habsburg-emperor/franz-i-stephan-lorraine), not the later Austrian emperor or the French king. All plot and Ossian family bindings are reviewed against the actual local source paragraphs; no Threads summaries were copied.

## Validation and integration

Run `python3 books/characters/build_werther.py --check` and `python3 -m unittest discover -s books/characters -p test_werther.py`.

Eight focused tests cover exact UTF-16 spans and hashes, ordinary identities on first encounter, marriage and shorter reminders, Henry’s gated connection, namesakes and officials, distinct servants, Ossian families and complete source scope. Each English source must match its recorded fingerprint before enablement. This is authoring-agent review, not independent editorial approval, and is awaiting integration and production verification by the existing release owner. Review the inherited naming discrepancies before shipping; regenerate if any source bytes change.

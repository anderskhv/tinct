# Chapters I–II — early checkpoint

118 source paragraphs map one-to-one to 118 manually rendered modern paragraphs. All meet the 75% source word-count floor. Both chapter openings and endings were checked against the source, along with the false assumptions about the household and the dialogue attribution around the tea invitation.

Lockwood’s misplaced confidence, “never told my love” quotation, Biblical possessed swine and King Lear allusions remain. Joseph retains `ye`, `t’`, regional syntax and the distinctive `nobbut`; opaque dialect spellings are made readable. Zillah and Hareton retain their own less extreme regional speech. Heathcliff’s ethnicity is left as Lockwood’s description, not supplied as objective biographical fact.

Blocking command (unchanged existing tool):

`python3 books/classify-modern-en.py "$PWD/books/wip/wuthering-heights/review/batch-1-2/wuthering-heights" --gate --chapters 1-2`

The tool has a hard-coded live-edition directory but accepts an absolute filename stem. This routes its reads to these explicit completed-range excerpts without editing tools or live files. Full original-en remains 34 chapters; partial modern-en has no fake trailing chapters. Gate PASS, similarity 0.478, 0/2 light/mechanical, 0/88 identical long paragraphs, no wrapped scaffolding or truncated quotations. See saved output.

Independent editorial acceptance is pending; the classifier does not establish semantic fidelity on its own.

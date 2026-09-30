# Changes to existing links

The live `bible.v1.json` (main fe699e90, contentVersion `2026-09-24.1`) carries 1,444 (kjv-en) and 1,437 (web-en) links. Every one of them was compared with the new package by chapter/paragraph/offset. Card ids are unchanged; **no saved link can point at an id that no longer exists**. Machine-readable list: `changes-to-existing-links.json`.

|  | kjv-en | web-en |
|---|---|---|
| Old links | 1,444 | 1,437 |
| Kept, identical span and card | 1298 | 1297 |
| Kept, same card, span changed (widened/narrowed) | 34 | 29 |
| Same place, **different card** (identity correction) | 55 | 56 |
| **Removed** (not a reference to that card) | 57 | 55 |
| New links in the package | 11,241 | 11,332 |

About 90% of the old links stand exactly as they were. The rest were wrong or imprecise and fall into these groups.

## Span changes (same card)

- “John” → “John the Baptist”, “Peter” → “Simon Peter”, “Judas” → “Judas Iscariot”, “Joseph” → “Joseph of Arimathaea”: the full name is now one span.
- “the Word”, “the Lamb”, “the devil” → “Word”, “Lamb”, “devil”: the span is the name-bearing word, so the same words are used in all four editions.
- “Caesar Augustus” (Luke 2:1) → “Augustus”.

## Identity corrections (same place, different card)

| Reference | Was | Now | Text | Editions |
|---|---|---|---|---|
| Acts 10:18 | `simon-magus` | `simon-peter` | Simon | kjv-en, web-en |
| Acts 10:37 | `john-apostle` | `john-the-baptist` | John | kjv-en, web-en |
| Acts 10:5 | `simon-magus` | `simon-peter` | Simon | kjv-en, web-en |
| Acts 11:13 | `simon-magus` | `simon-peter` | Simon | kjv-en, web-en |
| Acts 12:2 | `james-the-just` | `james-zebedee` | James | kjv-en, web-en |
| Acts 12:25 | `john-apostle` | `mark-evangelist` | John | web-en |
| Acts 13:13 | `john-apostle` | `mark-evangelist` | John | web-en |
| Acts 13:21 | `saul-paul` | `saul-king` | Saul | kjv-en, web-en |
| Acts 13:24 | `john-apostle` | `john-the-baptist` | John | kjv-en |
| Acts 13:25 | `john-apostle` | `john-the-baptist` | John | web-en |
| Acts 13:5 | `john-apostle` | `mark-evangelist` | John | kjv-en |
| Acts 15:37 | `john-apostle` | `mark-evangelist` | John | kjv-en |
| Acts 19:3 | `john-apostle` | `john-the-baptist` | John | kjv-en, web-en |
| Acts 1:13 | `james-the-just` | `james-zebedee` | James | kjv-en, web-en |
| Acts 1:13 | `james-the-just` | `the-other-apostles` | James | kjv-en, web-en |
| Acts 1:13 | `james-zebedee` | `the-other-apostles` | James | kjv-en, web-en |
| Acts 1:13 | `judas-iscariot` | `the-other-apostles` | Judas | web-en |
| Acts 1:13 | `simon-magus` | `the-other-apostles` | Simon | kjv-en, web-en |
| Acts 1:22 | `john-apostle` | `john-the-baptist` | John | kjv-en, web-en |
| Acts 1:5 | `john-apostle` | `john-the-baptist` | John | kjv-en, web-en |
| Acts 21:18 | `james-zebedee` | `james-the-just` | James | kjv-en, web-en |
| Acts 5:1 | `ananias-of-damascus` | `ananias-and-sapphira` | Ananias | kjv-en, web-en |
| Acts 5:5 | `ananias-of-damascus` | `ananias-and-sapphira` | Ananias | kjv-en, web-en |
| Genesis 34:7 | `jacob` | `israel-the-people` | Israel | kjv-en |
| Genesis 36:31 | `jacob` | `israel-the-people` | Israel | web-en |
| Genesis 47:27 | `jacob` | `israel-the-people` | Israel | web-en |
| Genesis 49:16 | `jacob` | `israel-the-people` | Israel | kjv-en, web-en |
| Genesis 49:28 | `jacob` | `israel-the-people` | Israel | kjv-en, web-en |
| Genesis 50:25 | `jacob` | `israel-the-people` | Israel | kjv-en, web-en |
| Isaiah 2:3 | `jacob` | `israel-the-people` | Jacob | kjv-en |
| Isaiah 42:24 | `jacob` | `israel-the-people` | Jacob | web-en |
| Isaiah 43:1 | `jacob` | `israel-the-people` | Jacob | kjv-en |
| Isaiah 59:20 | `jacob` | `israel-the-people` | Jacob | web-en |
| Isaiah 60:16 | `jacob` | `israel-the-people` | Jacob | kjv-en |
| John 11:19 | `mary-mother-of-jesus` | `mary-of-bethany` | Mary | kjv-en, web-en |
| John 11:32 | `mary-mother-of-jesus` | `mary-of-bethany` | Mary | kjv-en, web-en |
| John 19:25 | `mary-of-bethany` | `mary-magdalene` | Mary | kjv-en, web-en |
| John 20:16 | `mary-mother-of-jesus` | `mary-magdalene` | Mary | kjv-en, web-en |
| John 20:18 | `mary-of-bethany` | `mary-magdalene` | Mary | kjv-en, web-en |
| John 4:5 | `joseph-of-arimathea` | `joseph-patriarch` | Joseph | kjv-en, web-en |
| John 6:42 | `joseph-of-arimathea` | `joseph-husband-of-mary` | Joseph | kjv-en, web-en |
| Lamentations 2:2 | `jacob` | `israel-the-people` | Jacob | web-en |
| Lamentations 2:3 | `jacob` | `israel-the-people` | Jacob | kjv-en |
| Luke 10:39 | `mary-mother-of-jesus` | `mary-of-bethany` | Mary | kjv-en, web-en |
| Luke 1:27 | `mary-of-bethany` | `mary-mother-of-jesus` | Mary | kjv-en, web-en |
| Luke 1:39 | `mary-of-bethany` | `mary-mother-of-jesus` | Mary | kjv-en, web-en |
| Luke 23:15 | `herod-the-great` | `herod-antipas` | Herod | kjv-en, web-en |
| Luke 23:50 | `joseph-husband-of-mary` | `joseph-of-arimathea` | Joseph | kjv-en, web-en |
| Luke 23:7 | `herod-the-great` | `herod-antipas` | Herod | kjv-en, web-en |
| Luke 2:16 | `mary-of-bethany` | `mary-mother-of-jesus` | Mary | kjv-en, web-en |
| Luke 3:19 | `herod-the-great` | `herod-antipas` | Herod | kjv-en, web-en |
| Luke 6:14 | `john-the-baptist` | `john-apostle` | John | kjv-en |
| Luke 9:28 | `john-the-baptist` | `john-apostle` | John | kjv-en |
| Luke 9:9 | `herod-the-great` | `herod-antipas` | Herod | kjv-en, web-en |
| Mark 14:33 | `john-the-baptist` | `john-apostle` | John | web-en |
| Mark 3:18 | `james-zebedee` | `the-other-apostles` | James | kjv-en, web-en |
| Matthew 14:6 | `herod-the-great` | `herod-antipas` | Herod | kjv-en, web-en |
| Matthew 17:1 | `john-the-baptist` | `john-apostle` | John | web-en |
| Matthew 1:2 | `judas-iscariot` | `judah-patriarch` | Judas | kjv-en |
| Matthew 27:59 | `joseph-husband-of-mary` | `joseph-of-arimathea` | Joseph | kjv-en, web-en |
| Matthew 27:61 | `mary-mother-of-jesus` | `mary-magdalene` | Mary | kjv-en, web-en |
| Matthew 2:1 | `herod-antipas` | `herod-the-great` | Herod | kjv-en, web-en |
| Matthew 2:16 | `herod-antipas` | `herod-the-great` | Herod | kjv-en, web-en |
| Micah 2:7 | `jacob` | `israel-the-people` | Jacob | kjv-en, web-en |
| Numbers 23:23 | `jacob` | `israel-the-people` | Jacob | web-en |
| Numbers 24:5 | `jacob` | `israel-the-people` | Jacob | kjv-en |
| Psalms 147:19 | `jacob` | `israel-the-people` | Jacob | web-en |
| Psalms 78:21 | `jacob` | `israel-the-people` | Jacob | kjv-en |
| Psalms 78:5 | `jacob` | `israel-the-people` | Jacob | web-en |

## Removed links

**another person of the same name (no card)** (45)

| Reference | Was | Text | Editions |
|---|---|---|---|
| 1 Kings 14:10 | `jeroboam` | Jeroboam | kjv-en, web-en |
| 1 Kings 16:1 | `jehu` | Jehu | kjv-en, web-en |
| 1 Kings 4:3 | `jehoshaphat` | Jehoshaphat | kjv-en, web-en |
| 1 Kings 4:5 | `nathan-prophet` | Nathan | kjv-en, web-en |
| 2 Chronicles 22:8 | `ahab` | Ahab | kjv-en, web-en |
| 2 Chronicles 30:11 | `manasseh-king` | Manasseh | kjv-en, web-en |
| 2 Chronicles 34:9 | `manasseh-king` | Manasseh | kjv-en, web-en |
| 2 Kings 15:8 | `jeroboam` | Jeroboam | kjv-en, web-en |
| 2 Kings 21:13 | `ahab` | Ahab | kjv-en, web-en |
| 2 Kings 9:7 | `ahab` | Ahab | kjv-en, web-en |
| 2 Kings 9:9 | `jeroboam` | Jeroboam | kjv-en, web-en |
| 2 Samuel 23:32 | `jonathan` | Jonathan | kjv-en, web-en |
| 2 Samuel 5:14 | `nathan-prophet` | Nathan | kjv-en, web-en |
| Acts 12:12 | `mary-mother-of-jesus` | Mary | kjv-en, web-en |
| Acts 12:6 | `herod-antipas` | Herod | kjv-en, web-en |
| Acts 15:32 | `judas-iscariot` | Judas | kjv-en, web-en |
| Acts 1:13 | `james-the-just` | James | kjv-en, web-en |
| Acts 1:13 | `the-other-apostles` | Zealot | web-en |
| Acts 23:35 | `herod-antipas` | Herod | kjv-en, web-en |
| Acts 24:1 | `ananias-of-damascus` | Ananias | kjv-en, web-en |
| Acts 4:6 | `john-apostle` | John | kjv-en |
| Acts 5:37 | `judas-iscariot` | Judas | web-en |
| Acts 9:11 | `judas-iscariot` | Judas | kjv-en |
| Ezekiel 14:14 | `daniel` | Daniel | kjv-en, web-en |
| Ezra 10:21 | `elijah` | Elijah | kjv-en, web-en |
| Ezra 2:2 | `nehemiah` | Nehemiah | kjv-en, web-en |
| Genesis 46:21 | `naaman` | Naaman | kjv-en, web-en |
| Genesis 4:22 | `cain` | Cain | web-en |
| Genesis 50:11 | `abel` | Abel | web-en |
| Jeremiah 52:1 | `jeremiah` | Jeremiah | kjv-en, web-en |
| John 19:25 | `mary-mother-of-jesus` | Mary | kjv-en, web-en |
| Joshua 17:3 | `noah` | Noah | web-en |
| Luke 24:10 | `mary-mother-of-jesus` | Mary | kjv-en, web-en |
| Luke 3:1 | `philip-apostle` | Philip | kjv-en, web-en |
| Luke 3:26 | `joseph-husband-of-mary` | Joseph | kjv-en, web-en |
| Luke 6:15 | `the-other-apostles` | Zealot | web-en |
| Mark 16:1 | `james-zebedee` | James | kjv-en, web-en |
| Mark 3:18 | `the-other-apostles` | Zealot | web-en |
| Matthew 27:56 | `james-zebedee` | James | kjv-en, web-en |
| Matthew 28:1 | `mary-mother-of-jesus` | Mary | kjv-en, web-en |
| Nehemiah 12:1 | `ezra` | Ezra | kjv-en, web-en |
| Nehemiah 3:16 | `nehemiah` | Nehemiah | kjv-en, web-en |
| Nehemiah 7:7 | `nehemiah` | Nehemiah | kjv-en, web-en |
| Numbers 26:46 | `sarah` | Sarah | kjv-en |
| Revelation 2:20 | `jezebel` | Jezebel | kjv-en, web-en |

**not the referent (animal / building / other emperor or cohort)** (7)

| Reference | Was | Text | Editions |
|---|---|---|---|
| Acts 25:21 | `caesar-augustus` | Augustus | kjv-en |
| Acts 25:25 | `caesar-augustus` | Augustus | kjv-en |
| Acts 27:1 | `caesar-augustus` | Augustus | kjv-en |
| Exodus 23:19 | `the-temple` | the house of the LORD | kjv-en |
| Ezra 5:14 | `the-temple` | the temple | web-en |
| Genesis 49:17 | `serpent-eden` | serpent | kjv-en, web-en |
| Revelation 21:22 | `the-temple` | the temple | kjv-en |

**city / tower / house / dynasty of David** (5)

| Reference | Was | Text | Editions |
|---|---|---|---|
| 2 Chronicles 21:20 | `david` | David | kjv-en |
| 2 Chronicles 32:33 | `david` | David | web-en |
| 2 Kings 12:21 | `david` | David | kjv-en |
| 2 Kings 8:24 | `david` | David | web-en |
| Song of Solomon 4:4 | `david` | David | kjv-en, web-en |

**Gamaliel son of Pedahzur (Numbers)** (4)

| Reference | Was | Text | Editions |
|---|---|---|---|
| Numbers 10:23 | `gamaliel` | Gamaliel | kjv-en, web-en |
| Numbers 1:10 | `gamaliel` | Gamaliel | kjv-en, web-en |
| Numbers 7:54 | `gamaliel` | Gamaliel | kjv-en, web-en |
| Numbers 7:59 | `gamaliel` | Gamaliel | kjv-en, web-en |

**nation/tribe or tribal-blessing use** (4)

| Reference | Was | Text | Editions |
|---|---|---|---|
| Genesis 33:20 | `jacob` | Israel | web-en |
| Genesis 49:10 | `judah-patriarch` | Judah | kjv-en, web-en |
| Genesis 49:24 | `jacob` | Jacob | kjv-en |
| Genesis 49:27 | `benjamin` | Benjamin | kjv-en, web-en |

**demon / human adversary, not Satan** (3)

| Reference | Was | Text | Editions |
|---|---|---|---|
| Mark 5:18 | `satan` | the devil | kjv-en |
| Matthew 16:23 | `satan` | Satan | web-en |
| Psalms 109:6 | `satan` | Satan | kjv-en |

**Lud (Ezekiel 30:5), a country** (1)

| Reference | Was | Text | Editions |
|---|---|---|---|
| Ezekiel 30:5 | `lydia` | Lydia | kjv-en |

Every removed link is either a tribal/national/dynastic/place use, a different person or thing sharing the name, or (Ezekiel 14:14 Daniel, Psalm 109:6 Satan) a use the text itself does not tie to the card. None of them removes a card from an edition: all 149 cards keep ≥1 link in every edition.


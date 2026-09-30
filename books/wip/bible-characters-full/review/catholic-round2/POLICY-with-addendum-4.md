# Identity adjudication policy (Bible character cards)

You decide, for each marked name occurrence, WHICH CARD (if any) the name refers to in that verse.
You are shown: edition, reference, the previous verse tail, the verse with the target as [[Name]], and the candidate cards.
Answer with a candidate card id, or NONE (the name refers to someone/something with no candidate card, or is not a person reference).

## Global rules (Anders' decision + house rules)
1. Identity first. Decide from the exact verse and its immediate context. Use your knowledge of the whole Bible, but the verse text and its surrounding narrative must support the identification.
2. NONE when the referent is a different person with no candidate card (e.g. another man of the same name), a tribe, nation, dynasty ("house of X"), place, or people named after an ancestor ("children of Israel", "tribe of Judah", "land of Judah", "city of David"), or when a name is used as a curse/address that is not the person.
3. When you cannot tell, answer NONE and say why. Never guess to fill coverage.
4. Name variants of the same person count (Elias = Elijah, Esaias = Isaiah, Judas in KJV Matt 1:2-3 = Judah, Simeon = Peter at Acts 15:14).
5. Pronouns are irrelevant; only the marked name.
6. A person named by genealogy/ancestry ("son of Abraham", "God of Abraham, Isaac and Jacob", "Jacob begat Joseph") IS a reference to that person -> link. A patriarch's name used as a synonym for the nation (poetry/prophets: "Jacob shall rejoice", "O house of Jacob") is NOT the person -> NONE.
7. Catholic books (Tobit, Judith, Maccabees, Sirach, Susanna, Bel): candidates include new cards; a same-named person of the older canon is NOT the person of the Catholic book unless the text says so.

## Reply format (strict)
One JSON object per line, in the SAME order as the input, no prose around it:
{"id":"<item id>","d":"<card id or NONE>","q":"<3-8 consecutive words copied EXACTLY from that item's PREV or TEXT that justify the decision>","r":"<=12 words reason"}
Never invent card ids. Every input item needs exactly one output line.
HARD REQUIREMENTS: read and decide EVERY item individually. Do NOT write scripts, loops, sed/awk or any bulk-labelling: no shell/programmatic generation of answers, even for runs that look uniform. Write the answer file yourself with the Write tool (or Edit to append) after reading the items. A checker will reject any line whose "q" is not an exact substring of the item text, and lines whose reason is copy-pasted across many items.

## Family notes
MARY: candidates mary-mother-of-jesus; mary-magdalene; mary-of-bethany (sister of Martha and Lazarus: Luke 10, John 11, 12). NONE: Mary wife of Clopas/Cleophas (John 19:25), "the other Mary"/Mary mother of James and Joses (Matt 27:56,61; 28:1; Mark 15:40,47; 16:1; Luke 24:10), Mary mother of John Mark (Acts 12:12), Mary of Rom 16:6. John 19:25 lists three Marys/women: the mother of Jesus, his mother's sister (Mary of Clopas), Mary Magdalene. John 20:11-18 = Magdalene.
JAMES: james-zebedee (brother of John; killed by Herod Agrippa I, Acts 12:2); james-the-just (the Lord's brother; Jerusalem leader: Acts 12:17, 15:13, 21:18; 1 Cor 15:7; Gal 1:19, 2:9, 2:12; Jude 1; Matt 13:55; Mark 6:3); the-other-apostles (James son of Alphaeus, in lists of the Twelve, e.g. Matt 10:3, Mark 3:18, Luke 6:15, Acts 1:13 second James). "James the less" / "Mary the mother of James (and Joses)" -> NONE (identity not fixed by the text).
JUDAS: judas-iscariot (betrayer, incl. "Judas Iscariot", John 6:71, 12:4, 13:2,26,29); the-other-apostles ("Judas not Iscariot" John 14:22; "Judas (the brother/son) of James", Luke 6:16, Acts 1:13; Thaddaeus/Lebbaeus); jude-apostle (Judas/Juda the brother of Jesus, Matt 13:55, Mark 6:3); judah-patriarch (KJV Matt 1:2-3 "Judas"); NONE: Judas of Galilee (Acts 5:37), Judas of Damascus (Acts 9:11), Judas Barsabbas (Acts 15).
SIMON: simon-peter (Simon Peter, Simon Barjona, "Simon whose surname is Peter", Simon in Gospel scenes with Peter); simon-magus (Acts 8); the-other-apostles (Simon the Zealot/Cananaean in lists of the Twelve). NONE: Simon the leper (Matt 26:6; Mark 14:3), Simon of Cyrene, Simon the Pharisee (Luke 7:36-50), Simon father of Judas Iscariot (John 6:71; 13:2,26), Simon brother of Jesus (Matt 13:55; Mark 6:3), Simon the tanner (Acts 9:43; 10).
JOHN: john-the-baptist; john-apostle (son of Zebedee; also the John of Revelation by tradition: link Rev 1:1,4,9; 22:8); mark-evangelist (John Mark, Acts 12:12,25; 13:5,13; 15:37). NONE: John of the high-priestly family (Acts 4:6); Peter's father "John"/"Jona(s)" (John 1:42; 21:15-17); John Gaddi etc. in Maccabees.
HEROD: herod-the-great (king at Jesus' birth: Matt 2; Luke 1:5); herod-antipas (tetrarch of Galilee: Matt 14; Mark 6; 8:15; Luke 3:1,19; 8:3; 9:7,9; 13:31; 23:7-15; Acts 4:27; 13:1). NONE: Herod Agrippa I (Acts 12 "Herod the king" who kills James), Herod Archelaus (only named Archelaus). 
PHILIP: philip-apostle. NONE: Philip the evangelist/deacon (Acts 6:5; 8; 21:8), Philip the tetrarch (Luke 3:1), Philip Herod's brother (Matt 14:3; Mark 6:17), Philips of 1-2 Maccabees.
ANANIAS: ananias-of-damascus (Acts 9:10-17; 22:12); ananias-and-sapphira (Acts 5:1-5); NONE: high priest Ananias (Acts 23:2; 24:1); Tobit's Ananias.
JOSEPH: joseph-patriarch (son of Jacob, incl. Exodus 1, Ps 105:17, Acts 7, Heb 11:21-22, John 4:5); joseph-husband-of-mary (Matt 1-2, Luke 1-4, John 1:45; 6:42); joseph-of-arimathea; barnabas (Acts 4:36 in editions that read Joseph/Joses). NONE: the tribe/house/sons of Joseph (Ephraim and Manasseh: Ps 78:67; 80:1; Amos 5:6; Ezek 37:16,19; 47:13; Obad 18; Zech 10:6; Rev 7:8; Deut 33:13-16; Num 1:10,32; 13:11); Joseph brother of Jesus (Matt 13:55 "Joses"); Joseph father of Igal; Joseph in Luke 3:24,26,30; Joseph Barsabbas (Acts 1:23); other OT Josephs (1 Chr 25:2,9; Ezra 10:42; Neh 12:14).
JACOB / ISRAEL: link only the man Jacob/Israel (Genesis 25 ff., patriarch formulas like "God of Abraham, of Isaac and of Jacob", NT references to the patriarch, "Jacob and his sons/household"). NONE for the nation, "Jacob" as poetic parallel for Israel in Psalms/prophets, "house of Jacob", "God of Jacob" as a title of God in Psalms, tribes.
JUDAH: judah-patriarch = Jacob's son (Gen 29:35; 37-38; 43-44; 46; 49:8-12 address to Judah the man). NONE: tribe of Judah, kingdom, land, men of Judah, sons of Judah as tribe, Judah in Chronicles genealogies unless clearly the man.
BENJAMIN: benjamin = Jacob's youngest son (Gen 35:16-45 etc., Exodus 1:3). NONE: tribe/land/Benjamites, Ezra 10:32 and Neh 3:23 (other men).
MANASSEH: manasseh-king = king of Judah, son of Hezekiah. NONE: son of Joseph, tribe, Judith's husband Manasses.
ESAU: esau = twin of Jacob (Gen 25-36; Rom 9:13; Heb 11:20; 12:16). NONE: Esau = Edom/Edomites as nation (Deut 2; Obadiah; Jer 49:8,10; Mal 1:2-3).
JEROBOAM: jeroboam = Jeroboam I son of Nebat (1 Kings 11-14 and every "sin(s) of Jeroboam the son of Nebat"). NONE: Jeroboam II son of Joash (2 Kings 13:13; 14:16-29; 15:1,8; Hos 1:1; Amos 1:1; 7:9-11; 1 Chr 5:17).
PHARAOH: pharaoh-exodus = the Pharaoh of Moses' time (Exodus 1-15 and later retrospective references to him: Deut 6:21-22; 7:8,18; 11:3; 29:2; 34:11; Neh 9:10; Ps 135:9; 136:15; Rom 9:17; Acts 7:21-23; Heb 11:24). NONE: other pharaohs (Genesis, Solomon's father-in-law, Necho, Hophra...).
JEHU: jehu = king Jehu son of Nimshi. NONE: prophet Jehu son of Hanani, other Jehus.
DEVIL: satan = Satan/the devil as the tempter/adversary (Matt 4; Rev 12:9; 20:2, 10 etc.). NONE for "devils" (demons), "a devil" meaning a demon or a person called devil (John 6:70 "one of you is a devil" = Judas, figurative; Matt 11:18 "hath a devil" = demon).
ISAAC etc. use the rules above.


## POLICY ADDENDUM 2 (binding; overrides anything above that conflicts)
JACOB / ISRAEL (also applies to "sons/children of Jacob/Israel"):
 LINK when the verse names the man as an individual: narrative about him; patriarch formulas ("God of Abraham, Isaac and Jacob", "Isaac and Jacob", "Isaac begat Jacob", genealogies); NT retrospectives naming the patriarch (Acts 7, Rom 9:13, Heb 11); an explicit renaming or blessing ("thy name shall be Israel", "hearken unto Israel your father"); "sons/children of Israel/Jacob" ONLY inside the Genesis 32-50 / Exodus 1:1-5 family narrative where the sons are literally his household (e.g. Gen 42:5, 45:21, 46:5,8), or where the verse itself says the sons of the man Jacob "whom he named Israel" (1 Kings 18:31; 2 Kings 17:34).
 NONE for the nation/people/land/kingdom/tribes: "children of Israel" from Exodus onward, "house of Jacob/Israel", "seed of Jacob", "O Jacob" as address to the people, poetic Jacob/Israel parallelism in Psalms and prophets, Numbers 23-24, Deut 32-33 blessings of tribes, anachronistic Genesis uses for the people (Gen 34:7, 36:31, 47:27, 48:20, 49:7, 49:16, 49:28, 50:25).
 "God of Jacob" / "Holy One of Jacob" / "Mighty One of Jacob" / "the excellency of Jacob" as divine titles or possessions of the people: NONE (Psalms, Isaiah, Acts 7:46), EXCEPT in the triple patriarch formula naming all three men.
 Malachi 1:2-3, Obadiah, Jeremiah 49:8-10, Isaiah 43-49 "Jacob whom I have chosen" etc.: nations -> NONE.
ESAU: link the man (Genesis 25-36 incl. Gen 36 "Esau is Edom" as founder; Rom 9:13; Heb 11:20; 12:16; Deut 2:5 and Josh 24:4 "I gave unto Esau mount Seir"); NONE for Edom-the-nation uses ("children of Esau" in Deut 2:4,8,12,22,29; Obadiah; Jer 49; Mal 1:2-3).
JOSEPH: link the man, including patronymic phrases ("Joseph the son of Israel", 1 Chr 5:1-2; 7:29), "sons/children of Joseph" when they are his literal sons Ephraim and Manasseh (Gen 48; Heb 11:21). NONE for tribe/house/land ("house of Joseph", "tribe of Joseph", Ps 78:67, 80:1, 81:5, Amos, Ezekiel, Obadiah, Zechariah 10:6, Rev 7:8, Josh 17:14-17, 18:5, Num 1:32).  Ps 77:15 "sons of Jacob and Joseph" -> the people -> NONE. Ps 105:17 and Ps 80:1? only 105:17 (the man) is a link.
JUDAH / JUDA / JUDAS (KJV Matt 1:2-3 and Luke 3:33-34 = the patriarch): link only the man; tribe/land/kingdom/men of Judah = NONE. Gen 49:8-10: 49:8 "Judah, thou art he" address to the man -> link; 49:9-10 "Judah is a lion's whelp", "sceptre shall not depart from Judah" -> the tribe -> NONE. Heb 7:14 and Rev 5:5, 7:5 = tribe -> NONE.
BENJAMIN: link the man only (Gen 35:16-45:34, 46:19-22, 49:27 blessing of the tribe -> NONE, Exodus 1:3, 1 Chr 2:2 sons of Israel list, 1 Chr 7:6 and 8:1 as ancestor of the Benjamite genealogy -> link). Deut 33:12 tribe -> NONE.
JOHN: candidates now include mark-evangelist for John Mark (Acts 12:12,25; 13:5,13; 15:37). JUDAS: candidates include jude-apostle for Jesus' brother Judas/Juda (Matt 13:55; Mark 6:3).


## POLICY ADDENDUM 3 (Catholic books; binding)
JUDAS in 1-2 Maccabees = judas-maccabeus (Mattathias' son, "Judas who was called Maccabaeus"); NONE for other men named Judas (e.g. Judas son of Chalphi, 1 Macc 11:70; Judas the envoy/messenger sent to Rome or Sparta if a different man; Judas the Galilean is NT). If the verse is about the brother-leader of the revolt (battles, purification of the temple, death at Elasa), link.
JONATHAN in 1 Maccabees = jonathan-maccabeus (Mattathias' youngest son "called Apphus", later high priest); NONE for Jonathan son of Absalom (the envoy at Joppa, 1 Macc 13:11) and any other man. SIMON = simon-maccabeus (brother, later high priest; 1 Macc 2:3,65; 13-16) ; NONE for Simon of Benjamin (temple guardian, 2 Macc 3-4), "Simeon" ancestors (1 Macc 2:1), other Simons (e.g. 2 Macc 10:19 commander) unless the text shows the Maccabee.
ANTIOCHUS = antiochus-epiphanes ONLY for Antiochus IV Epiphanes (1 Macc 1:10-6:16, which ends with his death; 2 Macc 4:7-9:29 and back-references). NONE for Antiochus III "the Great" (1 Macc 8:6), Antiochus V Eupator (his son: 1 Macc 6:17 ff; 2 Macc 10:10 ff), Antiochus VI (1 Macc 11:39 ff), Antiochus VII Sidetes (1 Macc 15) and "Antiochus" used of a father or son when not Epiphanes.
ONIAS = onias-iii the pious high priest of 2 Macc 3-4 and 15:12 (Judas' dream). NONE for Onias I (letters, 1 Macc 12:7,19-20) and Onias, founder of the temple at Leontopolis, etc.
ELEAZAR = eleazar-scribe only for the martyr of 2 Macc 6:18-31. NONE for Eleazar son of Aaron, Eleazar Avaran (1 Macc 2:5; 6:43), Eleazar son of Jason?/envoys (1 Macc 8:17) and Eleazar brother of Judas (2 Macc 8:22).
JESUS in Sirach: jesus-ben-sira for the author (prologue "my grandfather Jesus"; Sirach 50:27; 51 heading "A Prayer of Jesus the son of Sirach"); joshua for Joshua son of Nun (also written Jesus in 1 Macc 2:55); NONE for "Jesus the son of Josedek" (high priest, Sirach 49:12); jesus only for the Jesus of the Gospels.
TOBIT: "Sarah" in the book of Tobit = sarah-raguel (Raguel's daughter, Tobias' wife), NOT Abraham's wife sarah, unless the verse explicitly says Abraham's wife. "Azarias" = the name the angel Raphael gives himself (Tobit 5:12 ff): link to raphael-angel when it names that companion ("Brother Azarias", "I am Azarias"); NONE for Azarias/Ananias as the alleged father (Tobit 5:12-13 "Ananias the great" is fictional). NOTE Tobit's "Achiacharus"/"Ahikar" = ahikar.
NEHEMIAH in 2 Maccabees = nehemiah (the governor) when the text is about the rebuilder/governor (2 Macc 1:18-36; 2:13). JONAH in Tobit 14:4,8 = jonah the prophet. DANIEL in Susanna/Bel = daniel.


## POLICY ADDENDUM 4 (Catholic historical figures; binding for this batch)
Every item below is a name in Tobit, Judith, 1 Maccabees or 2 Maccabees (webc-en). Decide which candidate card the marked name is, or NONE. Card meanings:
- nicanor: Nicanor the Seleucid general who fights Judas (1 Macc 3:38; 7; 2 Macc 8; 14–15). NONE: Nicanor governor of Cyprus (2 Macc 12:2).
- bacchides: Bacchides, the king's friend who fights Judas and Jonathan (1 Macc 7–9). NONE: 2 Macc 8:30 "Timotheus and Bacchides" (a possibly different officer).
- alcimus: Alcimus the would-be/appointed high priest (1 Macc 7, 9; 2 Macc 14).
- gorgias: Gorgias the Seleucid commander (1 Macc 3–5; 2 Macc 8, 10, 12).
- tryphon: Tryphon, general who backs the child Antiochus VI, then kills Jonathan and the child king (1 Macc 11–15).
- lysias: Lysias, regent/guardian of Antiochus V (1 Macc 3–7; 2 Macc 10–14).
- razis: Razis, elder of Jerusalem (2 Macc 14).
- bagoas: Bagoas, Holofernes' eunuch (Judith 12–14).
- manasses-judith: Manasses, Judith's dead husband (Judith 8, 10, 16). NONE: Manasses in Tobit 14:10.
- gabael: Gabael of Rages who holds Tobit's money (Tobit 1:14–10). NONE: Gabael the ancestor of Tobit in Tobit 1:1.
- demetrius-i: Demetrius I Soter, son of Seleucus (1 Macc 7:1–10:52; 2 Macc 14). Also the father named in "Demetrius, son of Demetrius" (1 Macc 10:67, second occurrence).
- demetrius-ii: Demetrius II Nicator, son of Demetrius I (1 Macc 10:67 first occurrence to 1 Macc 15:22; 2 Macc 1:7; "Antiochus son of Demetrius the king" 1 Macc 15:1 names Demetrius II).
- alexander-balas: Alexander Balas / Alexander Epiphanes, claimant king (1 Macc 10:1–11:39). NONE: Alexander the Great (1 Macc 1:1, 1:7, 6:2) and any other Alexander.
- ptolemy-philometor: Ptolemy VI Philometor, king of Egypt (1 Macc 1:18, 10:51–11:18; 2 Macc 1:10, 9:29).
- ptolemy-dorymenes: Ptolemy son of Dorymenes (1 Macc 3:38; 2 Macc 4:45–46).
- ptolemy-abubus: Ptolemy son of Abubus who murders Simon (1 Macc 16). NONE: other Ptolemies (1 Macc 15:16; 2 Macc 6:8; 8:8–9; 10:12 Macron).
- jason-high-priest: Jason brother of Onias, usurping high priest (2 Macc 1:7?, 4:7–5:10). NONE: Jason son of Eleazar (1 Macc 8:17), Antipater son of Jason (1 Macc 12:16; 14:22), Jason of Cyrene (2 Macc 2:23).
- apollonius-samaria: Apollonius, commander from Samaria killed by Judas (1 Macc 3:10–12).
- apollonius-coelesyria: Apollonius appointed by Demetrius II over Coelesyria, fights Jonathan (1 Macc 10:69–89).
- apollonius-menestheus: Apollonius son of Menestheus (2 Macc 4:4; 4:21). NONE: Apollonius of Tarsus (2 Macc 3:5,7), Apollonius the "lord of pollutions" (5:24), Apollonius son of Gennaeus (12:2).
If the verse does not let you tell which of two candidates it is, answer NONE and say why.

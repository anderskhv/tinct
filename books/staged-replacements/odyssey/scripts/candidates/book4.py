# Frozen candidate text for Odyssey Book 4, v1.
#
# Drafted paragraph-for-paragraph from the served original-en (Samuel Butler,
# 1900; Project Gutenberg #1727), whose Book 4 was verified by
# scripts/verify_source_book4.py — a fourth kind of rule, needle-located from
# the served file's own words and character-exact: 81 of 81 paragraphs
# byte-identical after removing only the 14 classified footnote markers, 8,042
# words compared word for word, 0 mismatches, four negative controls failing as
# they should.
#
# TWO CLASSIFIED DIFFERENCES between the served file and PG, neither a word:
#   B04-P001  the served file capitalizes Butler's lower-case "they" (PG opens
#             Book IV mid-sentence, as it opens Book III). The candidate opens
#             "They".
#   B04-P034  PG's footnote marker 44 is SPACE-SET rather than glued to the
#             word before it; the served file removes the marker and one space.
#   (And, not a difference but an artefact of the same class: marker 48's
#   removal left a DOUBLED SPACE in the served B04-P050. The candidate prints
#   one space. See book04/continuity.md.)
#
# NAME FORMS are the Greek ones, per GLOSSARY.md (D5-D8). Book 4 is the first
# Book to meet three Roman names the table did not yet carry, and the table is
# EXTENDED by enumeration, never generated (D6):
#     Venus  -> Aphrodite   (B04-P001, B04-P021)
#     Juno   -> Hera        (B04-P043)
#     Vulcan -> Hephaestus  (B04-P051)
# Evidence, by the method D5 used: the served modern-en being replaced prints
# Aphrodite 14 / Venus 0, Hera 6 / Juno 0, Hephaestus 20 / Vulcan 0.
# The Book's other Roman forms are the table's own: Ulysses -> Odysseus (18),
# Minerva -> Athena (7), Jove -> Zeus (11), Neptune -> Poseidon (3),
# Diana -> Artemis (1), Euryclea -> Eurycleia (1, D8's second firing).
# NOT mapped, and flagged rather than corrected, because the Cast has no
# display name for her and D8 is therefore silent: Butler's "Idothea"
# (the served modern-en prints "Eidothea"; the Cast prints neither).
# "Diomed" (B04-P022) is flagged for the same reason, as in Book 3.
#
# D12 CLASS C fires for the first time in the poem, at B04-P001 (PG 1552,
# footnote 36), and class C was settled at Book 3's round 1: the mark is
# dropped, EVERY WORD STANDS, and nothing is recast across the point where the
# bracket opened. That bracket is NEVER CLOSED in the base text, so its extent
# is not determined here. B04-P052 carries the second instance (PG 2067-2070,
# footnote 49), closed, handled the same way. Both are recorded in
# book04/continuity.md with Butler's notes quoted.
#
# D3 (hecatomb -> a plain description, no number) fires three times: B04-P029,
# B04-P040, B04-P048. D7 possessives throughout. "barrow" -> "mound", the
# Book 1 / Book 2 / Book 3 row, at B04-P048.
#
# PUNCTUATION follows PUNCTUATION.md: typographic marks throughout, no ASCII
# apostrophe or double quote. D4 applies on a scale nothing earlier in the
# package has needed — Menelaus's Proteus narrative runs unbroken from
# B04-P028 to B04-P049, so twenty-one consecutive paragraphs open their own
# quotation mark and close none, with Proteus's and Idothea's speeches nested
# inside in single marks. Reproduced exactly, mark for mark.
# ONE base-text slip is repaired and recorded: Butler's B04-P040 opens
# `“Then,’ he said, ‘if…` — a double opening mark where the nested speech
# needs a single one. The candidate prints `“‘Then,’ he said, ‘if…`. See
# book04/continuity.md, "Base-text defects".

PARAGRAPHS = [
    # B04-P001
    # D12 class C, the poem's first instance (PG 1552, fn 36). Mark dropped,
    # every word kept, and the sentence NOT recast across the point where the
    # bracket opens — which is why "abode" becomes "home" rather than "house".
    "They reached the low lying city of Lacedaemon, where they drove "
    "straight to the home of Menelaus and found him in his own house, "
    "feasting with his many clansmen in honor of the wedding of his son, and "
    "also of his daughter, whom he was marrying to the son of that valiant "
    "warrior Achilles. He had given his consent and promised her to him while "
    "he was still at Troy, and now the gods were bringing the marriage about; "
    "so he was sending her with chariots and horses to the city of the "
    "Myrmidons, over whom Achilles’s son was reigning. For his only son he "
    "had found a bride from Sparta, the daughter of Alector. This son, "
    "Megapenthes, was born to him of a bondwoman, for heaven granted Helen no "
    "more children after she had borne Hermione, who was as fair as golden "
    "Aphrodite herself.",

    # B04-P002
    "So the neighbors and kinsmen of Menelaus were feasting and making merry "
    "in his house. There was a bard, too, to sing to them and play his lyre, "
    "while two tumblers went about performing in the middle of them whenever "
    "the man struck up his tune.",

    # B04-P003
    "Telemachus and the son of Nestor stopped their horses at the gate, at "
    "which Eteoneus, a servant of Menelaus, came out, and as soon as he saw "
    "them ran hurrying back into the house to tell his master. He went close "
    "up to him and said, “Menelaus, there are some strangers come here, two "
    "men, who look like sons of Zeus. What are we to do? Shall we take their "
    "horses out, or tell them to find friends elsewhere as best they can?”",

    # B04-P004
    "Menelaus was very angry and said, “Eteoneus, son of Boethous, you never "
    "used to be a fool, but now you talk like a simpleton. Take their horses "
    "out, of course, and show the strangers in so that they may have supper; "
    "you and I have stayed often enough at other people’s houses before we "
    "got back here, where heaven grant that we may rest in peace from now "
    "on.”",

    # B04-P005
    "So Eteoneus bustled back and told the other servants to come with him. "
    "They took the sweating horses from under the yoke, made them fast to the "
    "mangers, and gave them a feed of oats and barley mixed. Then they leaned "
    "the chariot against the end wall of the courtyard, and led the way into "
    "the house. Telemachus and Pisistratus were astonished when they saw it, "
    "for its splendor was like that of the sun and moon; then, when they had "
    "admired everything to their heart’s content, they went into the bathroom "
    "and washed themselves.",

    # B04-P006
    # Butler's sentence here is all but word for word his B01-P011, which is
    # accepted; rendered with accepted Book 1's words, and differing from it
    # only where he differs (no "then", no manservant with wine, "while the
    # carver").
    "When the servants had washed them and anointed them with oil, they "
    "brought them woolen cloaks and shirts, and the two took their seats "
    "beside Menelaus. A maidservant brought them water in a fine golden "
    "pitcher and poured it into a silver basin so they could wash their "
    "hands, and drew up a clean table beside them. A senior servant brought "
    "them bread and set before them many good things from the stores of the "
    "house, while the carver brought plates of every kind of meat and set "
    "golden cups beside them.",

    # B04-P007
    "Menelaus then greeted them, saying, “Fall to, and welcome; when you have "
    "finished supper I shall ask who you are, for the lineage of such men as "
    "you cannot have been lost. You must be descended from a line of "
    "scepter-bearing kings, for poor people do not have such sons as you "
    "are.”",

    # B04-P008
    "On this he handed them a piece of fat roast loin, which had been set "
    "near him as a prime part, and they laid their hands on the good things "
    "that were before them. As soon as they had had enough to eat and drink, "
    "Telemachus said to the son of Nestor, with his head so close that no one "
    "might hear, “Look, Pisistratus, man after my own heart, see the gleam of "
    "bronze and gold—of amber, ivory, and silver. Everything is so splendid "
    "that it is like seeing the palace of Olympian Zeus. I am lost in "
    "admiration.”",

    # B04-P009
    "Menelaus overheard him and said, “No one, my sons, can hold his own with "
    "Zeus, for his house and everything about him is immortal; but among "
    "mortal men—well, there may be another who has as much wealth as I have, "
    "or there may not; but at all events I have traveled much and have "
    "undergone much hardship, for it was nearly eight years before I could "
    "get home with my fleet. I went to Cyprus, Phoenicia and the Egyptians; I "
    "went also to the Ethiopians, the Sidonians, and the Erembians, and to "
    "Libya where the lambs have horns as soon as they are born, and the sheep "
    "lamb down three times a year. Everyone in that country, whether master "
    "or man, has plenty of cheese, meat, and good milk, for the ewes yield "
    "all the year round. But while I was traveling and getting great riches "
    "among these people, my brother was secretly and shockingly murdered "
    "through the treachery of his wicked wife, so that I have no pleasure in "
    "being lord of all this wealth. Whoever your parents may be, they must "
    "have told you about all this, and of my heavy loss in the ruin of a "
    "stately house, fully and magnificently furnished. I wish I had only a "
    "third of what I now have, so long as I had stayed at home, and all those "
    "were living who died on the plain of Troy, far from Argos. I often "
    "grieve, as I sit here in my house, for one and all of them. At times I "
    "cry aloud for sorrow, but presently I leave off again, for crying is "
    "cold comfort and one soon tires of it. Yet grieve for these as I may, I "
    "do so for one man more than for them all. I cannot even think of him "
    "without loathing both food and sleep, so miserable does he make me, for "
    "no one of all the Achaeans worked so hard or risked so much as he did. "
    "He took nothing by it, and has left a legacy of sorrow to myself, for he "
    "has been gone a long time, and we do not know whether he is alive or "
    "dead. His old father, his long-suffering wife Penelope, and his son "
    "Telemachus, whom he left behind him an infant in arms, are plunged in "
    "grief on his account.”",

    # B04-P010
    "So spoke Menelaus, and the heart of Telemachus yearned as he thought of "
    "his father. Tears fell from his eyes as he heard him mentioned in this "
    "way, so that he held his cloak before his face with both hands. When "
    "Menelaus saw this he was in two minds whether to let him choose his own "
    "time for speaking, or to ask him at once and find out what it was all "
    "about.",

    # B04-P011
    "While he was still undecided, Helen came down from her high vaulted and "
    "perfumed room, looking as lovely as Artemis herself. Adraste brought her "
    "a seat, Alcippe a soft woolen rug, while Phylo fetched her the silver "
    "work box which Alcandra, wife of Polybus, had given her. Polybus lived "
    "in Egyptian Thebes, which is the richest city in the whole world; he "
    "gave Menelaus two baths, both of pure silver, two tripods, and ten "
    "talents of gold; besides all this, his wife gave Helen some beautiful "
    "presents, namely a golden distaff, and a silver work box that ran on "
    "wheels, with a gold band round the top of it. Phylo now placed this by "
    "her side, full of fine-spun yarn, and a distaff loaded with "
    "violet-colored wool was laid on the top of it. Then Helen took her seat, "
    "put her feet on the footstool, and began to question her husband.",

    # B04-P012
    "“Do we know, Menelaus,” said she, “the names of these strangers who have "
    "come to visit us? Shall I guess right or wrong?—but I cannot help saying "
    "what I think. Never yet have I seen either man or woman so like somebody "
    "else (indeed when I look at him I hardly know what to think) as this "
    "young man is like Telemachus, whom Odysseus left as a baby behind him, "
    "when you Achaeans went to Troy with battle in your hearts, on account of "
    "my most shameless self.”",

    # B04-P013
    "“My dear wife,” replied Menelaus, “I see the likeness just as you do. "
    "His hands and feet are just like Odysseus’s; so is his hair, with the "
    "shape of his head and the expression of his eyes. Moreover, when I was "
    "talking about Odysseus, and saying how much he had suffered on my "
    "account, tears fell from his eyes, and he hid his face in his cloak.”",

    # B04-P014
    "Then Pisistratus said, “Menelaus, son of Atreus, you are right in "
    "thinking that this young man is Telemachus, but he is very modest, and "
    "is ashamed to come here and start a conversation with one whose talk is "
    "as divinely interesting as your own. My father, Nestor, sent me to "
    "escort him here, for he wanted to know whether you could give him any "
    "counsel or suggestion. A son always has trouble at home when his father "
    "has gone away leaving him without supporters; and this is how Telemachus "
    "is now placed, for his father is absent, and there is no one among his "
    "own people to stand by him.”",

    # B04-P015
    "“Bless my heart,” replied Menelaus, “then I am receiving a visit from "
    "the son of a very dear friend, who suffered much hardship for my sake. I "
    "had always hoped to entertain him with every mark of distinction when "
    "heaven had granted us a safe return from beyond the seas. I should have "
    "founded a city for him in Argos, and built him a house. I should have "
    "made him leave Ithaca with his goods, his son, and all his people, and "
    "should have sacked for them some one of the neighboring cities that are "
    "subject to me. We should then have seen one another continually, and "
    "nothing but death could have interrupted so close and happy a "
    "friendship. I suppose, however, that heaven grudged us such great good "
    "fortune, for it has prevented the poor fellow from ever getting home at "
    "all.”",

    # B04-P016
    "So he spoke, and his words set them all weeping. Helen wept, Telemachus "
    "wept, and so did Menelaus, nor could Pisistratus keep his eyes from "
    "filling, when he remembered his dear brother Antilochus, whom the son of "
    "bright Dawn had killed. Then he said to Menelaus,",

    # B04-P017
    "“Sir, my father Nestor, when we used to talk about you at home, told me "
    "you were a man of rare and excellent understanding. If, then, it is "
    "possible, do as I would urge you. I am not fond of crying while I am "
    "getting my supper. Morning will come in due course, and in the morning I "
    "do not care how much I cry for those that are dead and gone. This is all "
    "we can do for the poor things. We can only shave our heads for them and "
    "wring the tears from our cheeks. I had a brother who died at Troy; he "
    "was by no means the worst man there; you are sure to have known him—his "
    "name was Antilochus; I never set eyes on him myself, but they say that "
    "he was remarkably swift of foot and valiant in a fight.”",

    # B04-P018
    "“Your discretion, my friend,” answered Menelaus, “is beyond your years. "
    "It is plain you take after your father. One can soon see when a man is "
    "son to one whom heaven has blessed both as regards wife and "
    "offspring—and it has blessed Nestor from first to last all his days, "
    "giving him a green old age in his own house, with sons about him who are "
    "both well disposed and valiant. We will put an end, therefore, to all "
    "this weeping, and attend to our supper again. Let water be poured over "
    "our hands. Telemachus and I can talk with one another fully in the "
    "morning.”",

    # B04-P019
    "On this Asphalion, one of the servants, poured water over their hands "
    "and they laid their hands on the good things that were before them.",

    # B04-P020
    "Then Zeus’s daughter Helen thought of another matter. She drugged the "
    "wine with a herb that banishes all care, sorrow, and ill humor. Whoever "
    "drinks wine drugged in this way cannot shed a single tear all the rest "
    "of the day, not even though his father and mother both of them drop down "
    "dead, or he sees a brother or a son cut down before his very eyes. This "
    "drug, of such sovereign power and virtue, had been given to Helen by "
    "Polydamna, wife of Thon, a woman of Egypt, where there grow all sorts of "
    "herbs, some good to put into the mixing-bowl and others poisonous. "
    "Moreover, everyone in the whole country is a skilled physician, for they "
    "are of the race of Paeeon. When Helen had put this drug in the bowl, and "
    "had told the servants to serve the wine round, she said:",

    # B04-P021
    "“Menelaus, son of Atreus, and you my good friends, sons of honorable men "
    "(which is as Zeus wills, for he is the giver both of good and evil, and "
    "can do what he chooses), feast here as you will, and listen while I tell "
    "you a tale in season. I cannot indeed name every single one of the "
    "exploits of Odysseus, but I can say what he did when he was before Troy, "
    "and you Achaeans were in all sorts of difficulties. He covered himself "
    "with wounds and bruises, dressed himself all in rags, and entered the "
    "enemy’s city looking like a servant or a beggar, and quite different "
    "from what he was among his own people. In this disguise he entered the "
    "city of Troy, and no one said anything to him. I alone recognized him "
    "and began to question him, but he was too cunning for me. When, "
    "however, I had washed and anointed him and had given him clothes, and "
    "after I had sworn a solemn oath not to betray him to the Trojans till he "
    "had got safely back to his own camp and to the ships, he told me all "
    "that the Achaeans meant to do. He killed many Trojans and got much "
    "information before he reached the Argive camp, for all which things the "
    "Trojan women made lamentation, but for my own part I was glad, for my "
    "heart was beginning to yearn after my home, and I was unhappy about the "
    "wrong that Aphrodite had done me in taking me over there, away from my "
    "country, my girl, and my lawful wedded husband, who is certainly not "
    "lacking either in looks or in understanding.”",

    # B04-P022
    "Then Menelaus said, “All that you have been saying, my dear wife, is "
    "true. I have traveled much, and have had much to do with heroes, but I "
    "have never seen such another man as Odysseus. What endurance too, and "
    "what courage he showed within the wooden horse, where all the bravest of "
    "the Argives were lying in wait to bring death and destruction upon the "
    "Trojans. At that moment you came up to us; some god who wished well to "
    "the Trojans must have set you on to it, and you had Deiphobus with you. "
    "Three times did you go all round our hiding place and pat it; you called "
    "our chiefs each by his own name, and mimicked all our wives—Diomed, "
    "Odysseus, and I from our seats inside heard what a noise you made. "
    "Diomed and I could not make up our minds whether to spring out then and "
    "there, or to answer you from inside, but Odysseus held us all in check, "
    "so we sat quite still, all except Anticlus, who was beginning to answer "
    "you, when Odysseus clapped his two brawny hands over his mouth, and kept "
    "them there. It was this that saved us all, for he muzzled Anticlus till "
    "Athena took you away again.”",

    # B04-P023
    "“How sad,” exclaimed Telemachus, “that all this was of no use to save "
    "him, nor yet his own iron courage. But now, sir, be pleased to send us "
    "all to bed, that we may lie down and enjoy the blessed boon of sleep.”",

    # B04-P024
    "On this Helen told the maidservants to set beds in the room that was in "
    "the gatehouse, and to make them with good red rugs, and spread coverlets "
    "on the top of them with woolen cloaks for the guests to wear. So the "
    "maids went out, carrying a torch, and made the beds, to which a "
    "manservant presently conducted the strangers. So, then, did Telemachus "
    "and Pisistratus sleep there in the forecourt, while the son of Atreus "
    "lay in an inner room with lovely Helen by his side.",

    # B04-P025
    "When Dawn, the rosy-fingered child of morning, appeared, Menelaus rose "
    "and dressed. He bound his sandals on his comely feet, slung his sword "
    "over his shoulders, and left his room looking like an immortal god. "
    "Then, taking a seat near Telemachus, he said:",

    # B04-P026
    "“And what, Telemachus, has led you to take this long sea voyage to "
    "Lacedaemon? Are you on public business, or private? Tell me all about "
    "it.”",

    # B04-P027
    # Butler's sentence here is his B03-P011 again, and not word for word:
    # see the entry in continuity.md. Rendered with accepted Book 3's words,
    # and differing from them exactly where he differs.
    "“I have come, sir,” replied Telemachus, “to see if you can tell me "
    "anything about my father. I am being eaten out of house and home; my "
    "fair estate is being wasted, and my house is full of scoundrels who keep "
    "killing great numbers of my sheep and oxen, on the pretense of paying "
    "their addresses to my mother. So I come as a suppliant to your knees, in "
    "the hope that you may tell me about my father’s wretched end, whether "
    "you saw it with your own eyes or heard it from some other traveler—for "
    "he was a man born to trouble. Do not soften things out of any pity for "
    "myself, but tell me plainly and exactly what you saw. If my brave father "
    "Odysseus ever did you loyal service, by word or by deed, when you "
    "Achaeans were being harried by the Trojans, bear it in mind now in my "
    "favor and tell me truly all.”",

    # B04-P028
    # D4 opens here and does not close again until B04-P049: Menelaus speaks
    # continuously for twenty-two paragraphs, and Butler omits every closing
    # mark in between. Reproduced exactly.
    "Menelaus, on hearing this, was very much shocked. “So,” he exclaimed, "
    "“these cowards would usurp a brave man’s bed? A hind might as well lay "
    "her new born young in the lair of a lion, and then go off to feed in the "
    "forest or in some grassy hollow: the lion, when he comes back to his "
    "lair, will make short work with the pair of them—and so will Odysseus "
    "with these suitors. By father Zeus, Athena, and Apollo, if Odysseus is "
    "still the man that he was when he wrestled with Philomeleides in Lesbos, "
    "and threw him so heavily that all the Achaeans cheered him—if he is "
    "still such a man and were to come near these suitors, they would have a "
    "short shrift and a sorry wedding. As regards your questions, however, I "
    "will not evade them nor deceive you, but will tell you without "
    "concealment all that the old man of the sea told me.",

    # B04-P029
    # D3: Butler's "hecatombs" become a plain description, with no number
    # supplied, as at B01-P003 and B03-P007.
    "“I was trying to come on here, but the gods kept me in Egypt, for my "
    "great sacrifices had not given them full satisfaction, and the gods are "
    "very strict about having their dues. Now off Egypt, about as far as a "
    "ship can sail in a day with a good stiff breeze behind her, there is an "
    "island called Pharos—it has a good harbor from which vessels can get out "
    "into open sea when they have taken in water—and here the gods becalmed "
    "me twenty days without so much as a breath of fair wind to help me "
    "forward. We should have run clean out of provisions and my men would "
    "have starved, if a goddess had not taken pity on me and saved me in the "
    "person of Idothea, daughter to Proteus, the old man of the sea, for she "
    "had taken a great fancy to me.",

    # B04-P030
    "“She came to me one day when I was by myself, as I often was, for the "
    "men used to go with their barbed hooks, all over the island, in the hope "
    "of catching a fish or two to save them from the pangs of hunger. "
    "‘Stranger,’ said she, ‘it seems to me that you like starving in this "
    "way—at any rate it does not greatly trouble you, for you stick here day "
    "after day, without even trying to get away, though your men are dying by "
    "inches.’",

    # B04-P031
    "“‘Let me tell you,’ said I, ‘whichever of the goddesses you may happen "
    "to be, that I am not staying here of my own accord, but must have "
    "offended the gods that live in heaven. Tell me, therefore, for the gods "
    "know everything, which of the immortals it is that is hindering me in "
    "this way, and tell me also how I may sail the sea so as to reach my "
    "home.’",

    # B04-P032
    "“‘Stranger,’ replied she, ‘I will make it all quite clear to you. There "
    "is an old immortal who lives under the sea hereabouts and whose name is "
    "Proteus. He is an Egyptian, and people say he is my father; he is "
    "Poseidon’s head man and knows every inch of ground all over the bottom "
    "of the sea. If you can snare him and hold him tight, he will tell you "
    "about your voyage, what courses you are to take, and how you are to sail "
    "the sea so as to reach your home. He will also tell you, if you so will, "
    "all that has been going on at your house both good and bad, while you "
    "have been away on your long and dangerous journey.’",

    # B04-P033
    "“‘Can you show me,’ said I, ‘some stratagem by means of which I may "
    "catch this old god without his suspecting it and finding me out? For a "
    "god is not easily caught—not by a mortal man.’",

    # B04-P034
    "“‘Stranger,’ said she, ‘I will make it all quite clear to you. About the "
    "time when the sun has reached the middle of the sky, the old man of the "
    "sea comes up from under the waves, heralded by the West wind that "
    "ruffles the water over his head. As soon as he has come up he lies down, "
    "and goes to sleep in a great sea cave, where the seals—Halosydne’s "
    "chickens, as they call them—come up also from the gray sea, and go to "
    "sleep in shoals all round him; and a very strong and fish-like smell do "
    "they bring with them. Early tomorrow morning I will take you to this "
    "place and will lay you in ambush. Pick out, therefore, the three best "
    "men you have in your fleet, and I will tell you all the tricks that the "
    "old man will play you.",

    # B04-P035
    "“‘First he will look over all his seals, and count them; then, when he "
    "has seen them and tallied them on his five fingers, he will go to sleep "
    "among them, as a shepherd among his sheep. The moment you see that he is "
    "asleep, seize him; put out all your strength and hold him fast, for he "
    "will do his very utmost to get away from you. He will turn himself into "
    "every kind of creature that goes upon the earth, and will become both "
    "fire and water as well; but you must hold him fast and grip him tighter "
    "and tighter, till he begins to talk to you and comes back to what he was "
    "when you saw him go to sleep; then you may slacken your hold and let him "
    "go; and you can ask him which of the gods it is that is angry with you, "
    "and what you must do to reach your home over the seas.’",

    # B04-P036
    "“Having said this she dived under the waves, and I turned back to the "
    "place where my ships were drawn up on the shore; and my heart was "
    "clouded with care as I went along. When I reached my ship we got supper "
    "ready, for night was falling, and camped down on the beach.",

    # B04-P037
    "“When Dawn, the rosy-fingered child of morning, appeared, I took the "
    "three men on whose prowess of all kinds I could most rely, and went "
    "along by the sea side, praying heartily to heaven. Meanwhile the goddess "
    "fetched me up four seal skins from the bottom of the sea, all of them "
    "just skinned, for she meant playing a trick on her father. Then she dug "
    "four pits for us to lie in, and sat down to wait till we should come up. "
    "When we were close to her, she made us lie down in the pits one after "
    "the other, and threw a seal skin over each of us. Our ambush would have "
    "been unbearable, for the stench of the fishy seals was most "
    "distressing—who would go to bed with a sea monster if he could help "
    "it?—but here, too, the goddess helped us, and thought of something that "
    "gave us great relief, for she put some ambrosia under each man’s "
    "nostrils, which was so fragrant that it killed the smell of the seals.",

    # B04-P038
    "“We waited the whole morning and made the best of it, watching the seals "
    "come up in hundreds to bask on the sea shore, till at noon the old man "
    "of the sea came up too, and when he had found his fat seals he went over "
    "them and counted them. We were among the first he counted, and he never "
    "suspected any trickery, but laid himself down to sleep as soon as he had "
    "done counting. Then we rushed on him with a shout and seized him; on "
    "which he began at once with his old tricks, and changed himself first "
    "into a lion with a great mane; then all of a sudden he became a dragon, "
    "a leopard, a wild boar; the next moment he was running water, and then "
    "again directly he was a tree, but we stuck to him and never lost hold, "
    "till at last the cunning old creature became distressed, and said, "
    "‘Which of the gods was it, son of Atreus, that hatched this plot with "
    "you for snaring me and seizing me against my will? What do you want?’",

    # B04-P039
    "“‘You know that yourself, old man,’ I answered, ‘you will gain nothing "
    "by trying to put me off. It is because I have been kept so long in this "
    "island, and see no sign of my being able to get away. I am losing all "
    "heart; tell me, then, for you gods know everything, which of the "
    "immortals it is that is hindering me, and tell me also how I may sail "
    "the sea so as to reach my home?’",

    # B04-P040
    # Butler prints `“Then,’ he said, ‘if…` — a double opening mark where the
    # nested speech needs a single one. Repaired here and recorded in
    # continuity.md, "Base-text defects"; it is the class PUNCTUATION.md §3
    # normalizes, a mark a modern reader reads as an error because it is one.
    "“‘Then,’ he said, ‘if you would finish your voyage and get home "
    "quickly, you must offer sacrifices to Zeus and to the rest of the gods "
    "before embarking; for it is decreed that you shall not get back to your "
    "friends, and to your own house, till you have returned to the "
    "heaven-fed stream of Egypt, and offered holy sacrifices to the immortal "
    "gods that reign in heaven. When you have done this they will let you "
    "finish your voyage.’",

    # B04-P041
    "“I was broken hearted when I heard that I must go back all that long and "
    "terrible voyage to Egypt; nevertheless, I answered, ‘I will do all, old "
    "man, that you have laid upon me; but now tell me, and tell me true, "
    "whether all the Achaeans whom Nestor and I left behind us when we set "
    "sail from Troy have got home safely, or whether any one of them came to "
    "a bad end either on board his own ship or among his friends when the "
    "days of his fighting were done.’",

    # B04-P042
    "“‘Son of Atreus,’ he answered, ‘why ask me? You had better not know what "
    "I can tell you, for your eyes will surely fill when you have heard my "
    "story. Many of those about whom you ask are dead and gone, but many "
    "still remain, and only two of the chief men among the Achaeans perished "
    "during their return home. As for what happened on the field of "
    "battle—you were there yourself. A third Achaean leader is still at sea, "
    "alive, but hindered from returning. Ajax was wrecked, for Poseidon drove "
    "him onto the great rocks of Gyrae; nevertheless, he let him get safe out "
    "of the water, and in spite of all Athena’s hatred he would have escaped "
    "death, if he had not ruined himself by boasting. He said the gods could "
    "not drown him even though they had tried to do so, and when Poseidon "
    "heard this big talk, he seized his trident in his two brawny hands, and "
    "split the rock of Gyrae in two pieces. The base remained where it was, "
    "but the part on which Ajax was sitting fell headlong into the sea and "
    "carried Ajax with it; so he drank salt water and was drowned.",
]

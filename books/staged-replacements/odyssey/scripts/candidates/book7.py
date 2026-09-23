# -*- coding: utf-8 -*-
"""The Odyssey, Book 7 — modern-English candidate text, frozen draft v1.

Drafted from Samuel Butler's 1900 prose translation (the served
`original-en`, Project Gutenberg #1727) and from nothing else. No other
translation was read, consulted, or recalled; the served `modern-en` being
replaced supplied no wording and was not opened.

Names follow GLOSSARY.md's closed table (D5–D8). Book 7 adds **no** row: every
Roman name it carries — Ulysses, Minerva, Jove, Neptune, Mercury, Vulcan — is
already in it. `Apollo`, `Atlas`, `Calypso`, `Gaia` and `Hades` are Butler's
own Greek forms and are untouched. The hazard worth naming here is **`Arete`**,
the queen: a case-insensitive or stem-based pass over a general deity list
touches nothing of hers, but a careless `Ares` rule would, and her name is the
one in this Book that a reader cannot afford to have moved — she is named
eleven times and the whole of Athena's instruction turns on her.

Paragraph-aligned one-to-one with the source: 29 paragraphs, in order.

**D4 fires twice in this Book**, as it did in Book 6 — Butler's unclosed
quotation at a paragraph break, preserved exactly: Athena's instruction runs
B07-P006 → B07-P007 → B07-P008, and Odysseus's account of his wanderings runs
B07-P021 → B07-P022 → B07-P023. Each continued paragraph opens its own mark and
only the last of each run closes it. Closing them would tell the reader the
speaker stopped and started again.

**Butler's present-tense ekphrasis is kept** (B07-P010, B07-P011). He describes
the palace and the garden in the present tense in the middle of a past-tense
narrative — *"There are fifty maidservants in the house"*, *"Outside the gate
of the outer court there is a large garden"* — and then closes the garden on a
past tense again, *"Such, then, were the splendors…"*. It is Homer's shift, not
a slip, and it is reproduced exactly.
"""



PARAGRAPHS = [
    # B07-P001
    "So Odysseus waited and prayed, but the girl drove on to the town. When "
    "she reached her father’s house she drew up at the gateway, and her "
    "brothers—comely as the gods—gathered round her, took the mules out of "
    "the wagon, and carried the clothes into the house. Meanwhile she went "
    "to her own room, where an old servant, Eurymedusa of Apeira, lit the "
    "fire for her. This old woman had been brought by sea from Apeira, and "
    "had been chosen as a prize for Alcinous because he was king over the "
    "Phaeacians, and the people obeyed him as though he were a god. She had "
    "been nurse to Nausicaa, and had now lit the fire for her, and brought "
    "her supper to her in her own room.",

    # B07-P002
    "Presently Odysseus got up to go toward the town, and Athena shed a "
    "thick mist all round him to hide him, in case any of the proud "
    "Phaeacians who met him should be rude to him or ask him who he was. "
    "Then, just as he was entering the town, she came toward him in the "
    "likeness of a little girl carrying a pitcher. She stood right in front "
    "of him, and Odysseus said:",

    # B07-P003
    "“My dear, will you be so kind as to show me the house of King "
    "Alcinous? I am an unfortunate foreigner in distress, and I do not know "
    "anyone in your town or your country.”",

    # B07-P004
    "Then Athena said, “Yes, father stranger, I will show you the house you "
    "want, for Alcinous lives quite close to my own father. I will go in "
    "front of you and show the way, but do not say a word as you go, and do "
    "not look at any man or ask him questions, for the people here cannot "
    "abide strangers and do not like men who come from somewhere else. They "
    "are a seafaring folk, and sail the seas by the grace of Poseidon in "
    "ships that glide along like thought, or like a bird in the air.”",

    # B07-P005
    "At this she led the way, and Odysseus followed in her steps. Not one "
    "of the Phaeacians could see him as he passed through the city in the "
    "middle of them, for the great goddess Athena in her good will toward "
    "him had hidden him in a thick cloud of darkness. He admired their "
    "harbors, their ships, their places of assembly, and the high walls of "
    "the city, which, with the palisade along the top of them, were very "
    "striking. And when they reached the king’s house Athena said:",

    # B07-P006
    "“This is the house, father stranger, that you wanted me to show you. "
    "You will find a number of great people sitting at table, but do not be "
    "afraid. Go straight in, for the bolder a man is the more likely he is "
    "to carry his point, even though he is a stranger. First find the "
    "queen. Her name is Arete, and she comes of the same family as her "
    "husband Alcinous. They both descend originally from Poseidon, who was "
    "father to Nausithous by Periboea, a woman of great beauty. Periboea "
    "was the youngest daughter of Eurymedon, who at one time reigned over "
    "the giants, but he ruined his ill-fated people and lost his own life "
    "as well.",

    # B07-P007
    "“Poseidon, however, lay with his daughter, and she had a son by him, "
    "the great Nausithous, who reigned over the Phaeacians. Nausithous had "
    "two sons, Rhexenor and Alcinous. Apollo killed the first of them while "
    "he was still a bridegroom and without a son; but he left a daughter, "
    "Arete, whom Alcinous married, and honors as no other woman is honored "
    "of all those who keep house along with their husbands.",

    # B07-P008
    "“So she was, and still is, respected beyond measure by her children, "
    "by Alcinous himself, and by the whole people, who look on her as a "
    "goddess and greet her whenever she goes about the city. For she is a "
    "thoroughly good woman both in head and heart, and when any women are "
    "friends of hers she will help their husbands also to settle their "
    "disputes. If you can win her good will, you may have every hope of "
    "seeing your friends again, and of getting safely back to your home and "
    "country.”",

    # B07-P009
    "Then Athena left Scheria and went away over the sea. She went to "
    "Marathon and to the spacious streets of Athens, where she entered the "
    "house of Erechtheus. But Odysseus went on to the house of Alcinous, "
    "and he pondered much as he paused a while before reaching the "
    "threshold of bronze, for the splendor of the palace was like that of "
    "the sun or the moon. The walls on either side were of bronze from end "
    "to end, and the cornice was of blue enamel. The doors were gold, and "
    "hung on pillars of silver that rose from a floor of bronze, while the "
    "lintel was silver and the hook of the door was of gold.",

    # B07-P010
    "On either side there stood gold and silver mastiffs which Hephaestus, "
    "with his consummate skill, had made specially to keep watch over the "
    "palace of King Alcinous; so they were immortal and could never grow "
    "old. Seats were ranged all along the wall, here and there from one end "
    "to the other, with coverings of fine woven work that the women of the "
    "house had made. Here the chief men of the Phaeacians used to sit and "
    "eat and drink, for there was abundance at all seasons; and there were "
    "golden figures of young men with lighted torches in their hands, "
    "raised on pedestals, to give light by night to those who were at "
    "table. There are fifty maidservants in the house, some of whom are "
    "always grinding rich yellow grain at the mill, while others work at "
    "the loom, or sit and spin, and their shuttles go backward and forward "
    "like the fluttering of aspen leaves, while the linen is so closely "
    "woven that it sheds oil. As the Phaeacians are the best sailors in the "
    "world, so their women excel all others in weaving, for Athena has "
    "taught them every kind of useful art, and they are very intelligent.",

    # B07-P002
    "Outside the gate of the outer court there is a large garden of about "
    "four acres with a wall all round it. It is full of beautiful "
    "trees—pears, pomegranates, and the most delicious apples. There are "
    "luscious figs also, and olives in full growth. The fruits never rot "
    "and never fail all the year round, neither in winter nor in summer, "
    "for the air is so soft that a new crop ripens before the old has "
    "dropped. Pear grows on pear, apple on apple, and fig on fig, and so it "
    "is with the grapes as well, for there is an excellent vineyard. On the "
    "level ground of a part of it the grapes are being made into raisins; "
    "in another part they are being gathered; some are being trodden in the "
    "wine tubs; others further on have shed their blossom and are beginning "
    "to show fruit; others again are just changing color. In the furthest "
    "part of the ground there are beautifully arranged beds of flowers that "
    "are in bloom all the year round. Two streams go through it, the one "
    "turned in ducts throughout the whole garden, while the other is "
    "carried under the ground of the outer court to the house itself, and "
    "the townspeople draw water from it. Such, then, were the splendors "
    "with which the gods had endowed the house of King Alcinous.",

    # B07-P012
    "So here Odysseus stood for a while and looked about him, but when he "
    "had looked long enough he crossed the threshold and went inside the "
    "walls of the house. There he found all the chief people among the "
    "Phaeacians making their drink offerings to Hermes, which they always "
    "did the last thing before going away for the night. He went straight "
    "through the court, still hidden by the cloak of darkness in which "
    "Athena had wrapped him, till he reached Arete and King Alcinous. Then "
    "he laid his hands on the knees of the queen, and at that moment the "
    "miraculous darkness fell away from him and he became visible. Everyone "
    "was speechless with surprise at seeing a man there, but Odysseus began "
    "at once with his petition.",

    # B07-P013
    "“Queen Arete,” he exclaimed, “daughter of great Rhexenor, in my "
    "distress I humbly beg you, and your husband too, and these guests of "
    "yours, to help me home to my own country as soon as possible, for I "
    "have been long in trouble and away from my friends. May heaven prosper "
    "them all with long life and happiness, and may they leave their "
    "possessions to their children, and all the honors the state has "
    "conferred on them.”",

    # B07-P014
    "Then he sat down on the hearth among the ashes, and they all held "
    "their peace, till presently the old hero Echeneus, who was an "
    "excellent speaker and an elder among the Phaeacians, spoke to them "
    "plainly and in all honesty, and said:",

    # B07-P015
    "“Alcinous,” he said, “it is not creditable to you that a stranger "
    "should be seen sitting among the ashes of your hearth. Everyone is "
    "waiting to hear what you are going to say. Tell him, then, to rise and "
    "take a seat on a stool inlaid with silver. Tell your servants to mix "
    "some wine and water so that we may make a drink offering to Zeus the "
    "lord of thunder, who takes all well-disposed suppliants under his "
    "protection; and let the housekeeper give him some supper, of whatever "
    "there may be in the house.”",

    # B07-P003
    "When Alcinous heard this he took Odysseus by the hand, raised him from "
    "the hearth, and told him to take the seat of Laodamas, who had been "
    "sitting beside him and was his favorite son. A maidservant then "
    "brought him water in a beautiful golden ewer and poured it into a "
    "silver basin for him to wash his hands, and she drew a clean table "
    "beside him. An upper servant brought him bread and offered him many "
    "good things of what there was in the house, and Odysseus ate and "
    "drank. Then Alcinous said to one of the servants, “Pontonous, mix a "
    "cup of wine and hand it round, so that we may make drink offerings to "
    "Zeus the lord of thunder, who is the protector of all well-disposed "
    "suppliants.”",

    # B07-P017
    "Pontonous then mixed wine and water, and handed it round after giving "
    "every man his drink offering. When they had made their offerings, and "
    "had each drunk as much as he wanted, Alcinous said:",

    # B07-P018
    "“Aldermen and town councillors of the Phaeacians, hear my words. You "
    "have had your supper, so now go home to bed. Tomorrow morning I shall "
    "invite a still larger number of aldermen, and will give a sacrificial "
    "banquet in honor of our guest. We can then discuss the question of his "
    "escort, and consider how we may at once send him back rejoicing to his "
    "own country without trouble or inconvenience to himself, no matter how "
    "distant it may be. We must see that he comes to no harm while on his "
    "homeward journey; but when he is once at home he will have to take the "
    "luck he was born with, for better or worse, like other people. It is "
    "possible, however, that the stranger is one of the immortals who has "
    "come down from heaven to visit us. But in that case the gods are "
    "departing from their usual practice, for until now they have made "
    "themselves perfectly clear to us when we have been offering them great "
    "sacrifices. They come and sit at our feasts just like one of "
    "ourselves, and if any solitary traveler happens to stumble upon one or "
    "other of them, they make no attempt at concealment, for we are as near "
    "of kin to the gods as the Cyclopes and the savage giants are.”",

    # B07-P004
    "Then Odysseus said, “Please, Alcinous, do not take any such notion "
    "into your head. I have nothing of the immortal about me, neither in "
    "body nor in mind, and I most resemble those among you who are the most "
    "afflicted. Indeed, were I to tell you all that heaven has seen fit to "
    "lay upon me, you would say that I was still worse off than they are. "
    "Nevertheless, let me eat in spite of sorrow, for an empty stomach is a "
    "very insistent thing, and forces itself on a man’s notice no matter "
    "how dire his distress is. I am in great trouble, yet it insists that I "
    "shall eat and drink; it tells me to lay aside all memory of my sorrows "
    "and to think of nothing but being refilled. As for yourselves, do as "
    "you propose, and at break of day set about helping me to get home. I "
    "shall be content to die if I may first see once more my property, my "
    "bondservants, and all the greatness of my house.”",

    # B07-P020
    "So he spoke. Everyone approved what he said, and agreed that he should "
    "have his escort, since he had spoken reasonably. Then, when they had "
    "made their drink offerings and had each drunk as much as he wanted, "
    "they went home to bed, every man to his own house, leaving Odysseus in "
    "the gallery with Arete and Alcinous while the servants were taking the "
    "things away after supper. Arete was the first to speak, for she "
    "recognized the shirt, cloak and good clothes that Odysseus was wearing "
    "as the work of herself and her maids. So she said, “Stranger, before "
    "we go any further, there is a question I should like to ask you. Who "
    "are you, and where do you come from, and who gave you those clothes? "
    "Did you not say you had come here from beyond the sea?”",

    # B07-P021
    "And Odysseus answered, “It would be a long story, madam, were I to "
    "relate in full the tale of my misfortunes, for the hand of heaven has "
    "been laid heavy upon me. But as regards your question, there is an "
    "island far away in the sea which is called ‘the Ogygian.’ Here dwells "
    "the cunning and powerful goddess Calypso, daughter of Atlas. She lives "
    "by herself, far from all neighbors, human or divine. Fortune, however, "
    "brought me to her hearth, all desolate and alone, for Zeus struck my "
    "ship with his thunderbolts and broke it up in mid-ocean. My brave "
    "comrades were drowned, every man of them, but I stuck to the keel and "
    "was carried this way and that for the space of nine days. At last, "
    "during the darkness of the tenth night, the gods brought me to the "
    "Ogygian island where the great goddess Calypso lives. She took me in "
    "and treated me with the utmost kindness; indeed, she wanted to make me "
    "immortal so that I might never grow old, but she could not persuade me "
    "to let her do it.",

    # B07-P022
    "“I stayed with Calypso seven years straight on end, and watered the "
    "good clothes she gave me with my tears the whole time. But at last, "
    "when the eighth year came round, she told me to leave, of her own free "
    "will, either because Zeus had told her she must, or because she had "
    "changed her mind. She sent me from her island on a raft, which she "
    "provisioned with abundance of bread and wine. She gave me good stout "
    "clothing too, and sent me a wind that blew both warm and fair. For "
    "seventeen days I sailed over the sea, and on the eighteenth I caught "
    "sight of the first outlines of the mountains upon your coast—and I was "
    "glad indeed to set eyes upon them. Nevertheless there was still much "
    "trouble in store for me, for at this point Poseidon would let me go no "
    "further, and raised a great storm against me. The sea was so terribly "
    "high that I could no longer keep to my raft, which went to pieces "
    "under the fury of the gale, and I had to swim for it, till wind and "
    "current brought me to your shores.",

    # B07-P023
    "“There I tried to land, but could not, for it was a bad place and the "
    "waves dashed me against the rocks. So I again took to the sea and swam "
    "on till I came to a river that seemed the most likely landing place, "
    "for there were no rocks and it was sheltered from the wind. Here, "
    "then, I got out of the water and gathered my senses together again. "
    "Night was coming on, so I left the river and went into a thicket, "
    "where I covered myself all over with leaves, and presently heaven sent "
    "me off into a very deep sleep. Sick and sorry as I was, I slept among "
    "the leaves all night, and through the next day till afternoon, when I "
    "woke as the sun was sinking westward, and saw your daughter’s "
    "maidservants playing upon the beach, and your daughter among them "
    "looking like a goddess. I begged her for aid, and she proved to be of "
    "an excellent disposition, much more so than could be expected from so "
    "young a person—for young people are apt to be thoughtless. She gave me "
    "plenty of bread and wine, and when she had had me washed in the river "
    "she also gave me the clothes in which you see me. Now, therefore, "
    "though it has pained me to do so, I have told you the whole truth.”",

    # B07-P024
    "Then Alcinous said, “Stranger, it was very wrong of my daughter not to "
    "bring you on to my house at once along with the maids, seeing that she "
    "was the first person whose aid you asked.”",

    # B07-P025
    "“Please do not scold her,” Odysseus replied. “She is not to blame. She "
    "did tell me to follow along with the maids, but I was ashamed and "
    "afraid, for I thought you might perhaps be displeased if you saw me. "
    "Every human being is sometimes a little suspicious and irritable.”",

    # B07-P005
    "“Stranger,” Alcinous replied, “I am not the kind of man to get angry "
    "about nothing; it is always better to be reasonable. But by Father "
    "Zeus, Athena and Apollo, now that I see what kind of person you are, "
    "and how much you think as I do, I wish you would stay here, marry my "
    "daughter, and become my son-in-law. If you will stay I will give you a "
    "house and an estate; but no one—heaven forbid—shall keep you here "
    "against your own wish, and so that you may be sure of this I will "
    "attend tomorrow to the matter of your escort. You can sleep during the "
    "whole voyage if you like, and the men shall sail you over smooth "
    "waters either to your own home or wherever you please, even if it is a "
    "long way further off than Euboea. Those of my people who saw it, when "
    "they took yellow-haired Rhadamanthus to see Tityus the son of Gaia, "
    "tell me it is the furthest of any place. And yet they did the whole "
    "voyage in a single day without distressing themselves, and came back "
    "again afterwards. You will see from this how much my ships excel all "
    "others, and what magnificent oarsmen my sailors are.”",

    # B07-P027
    "Then Odysseus was glad, and prayed aloud, “Father Zeus, grant that "
    "Alcinous may do all as he has said, for so he will win an imperishable "
    "name among mankind, and at the same time I shall return to my "
    "country.”",

    # B07-P028
    "So they talked together. Then Arete told her maids to set a bed in the "
    "room that was in the gatehouse, and to make it with good red rugs, and "
    "to spread coverlets on the top of them with woolen cloaks for Odysseus "
    "to wear. So the maids went out with torches in their hands, and when "
    "they had made the bed they came up to Odysseus and said, “Rise, sir "
    "stranger, and come with us, for your bed is ready”; and he was glad "
    "indeed to go to his rest.",

    # B07-P029
    "So Odysseus slept in a bed placed in a room over the echoing gateway, "
    "but Alcinous lay in the inner part of the house, with the queen his "
    "wife by his side.",
]

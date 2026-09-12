# Frozen candidate text for Odyssey Book 2, v1.
#
# Drafted paragraph-for-paragraph from the served original-en (Samuel Butler,
# 1900; Project Gutenberg #1727), whose Book 2 was re-verified independently
# by scripts/verify_source_book2.py (35 of 35 paragraphs byte-identical to a
# reconstruction built from PG's own numbered footnote-entry list).
#
# Name forms are the GREEK forms, per GLOSSARY.md's revised naming decision
# (standing finding S1, accepted at Book 1): Ulysses -> Odysseus (17),
# Minerva -> Athena (8), Jove -> Zeus (6), Euryclea -> Eurycleia (2).
# Neptune, Mercury, Saturn and Diana do not occur in Book 2. Ops (B02-P025)
# is Butler's Greek name for Eurycleia's grandfather and is NOT mapped.
#
# Punctuation follows PUNCTUATION.md: typographic quotation marks and
# apostrophes throughout; no ASCII apostrophe or double quote.
#
# Note on B02-P006/B02-P007: Butler does not close Antinous's quotation at the
# end of source paragraph 6 (his speech runs on into paragraph 7 as one
# continuous speech); the candidate preserves this, per decision D4, so
# B02-P006 ends without a closing quotation mark and B02-P007 opens with one.
#
# One list entry per source paragraph, same order, same count.

PARAGRAPHS = [
    # B02-P001
    "When Dawn, the rosy-fingered child of morning, appeared, Telemachus got "
    "up and dressed. He bound his sandals on his shapely feet, slung his "
    "sword over his shoulder, and left his room looking like an immortal god. "
    "He sent the town criers round at once to call the people to assembly; "
    "they made the call, and the people gathered. Then, when they had come "
    "together, he went to the place of assembly with his spear in his hand—"
    "not alone, for his two hounds went with him. Athena gave him such divine "
    "grace of presence that everyone marveled at him as he went by, and when "
    "he took his place in his father’s seat even the oldest councillors made "
    "way for him.",

    # B02-P002
    "Aegyptius, a man bent double with age and of vast experience, was the "
    "first to speak. His son Antiphus had gone with Odysseus to Ilius, land "
    "of fine horses, but the savage Cyclops had killed him when they were all "
    "shut up in the cave, and had cooked his last dinner for him. He had "
    "three sons left: two of them still worked on their father’s land, while "
    "the third, Eurynomus, was one of the suitors. Even so, their father "
    "could not get over the loss of Antiphus, and he was still weeping for "
    "him when he began to speak.",

    # B02-P003
    "“Men of Ithaca,” he said, “hear what I have to say. From the day "
    "Odysseus left us there has been no meeting of our councillors until now. "
    "Who is it, then, old or young, who finds it so necessary to call us "
    "together? Has he got wind of some army approaching, and does he want to "
    "warn us? Or is there some other matter of public importance he means to "
    "speak about? I am sure he is an excellent man, and I hope Zeus will "
    "grant him his heart’s desire.”",

    # B02-P004
    "Telemachus took this speech as a good omen and rose at once, for he was "
    "bursting with what he had to say. He stood in the middle of the "
    "assembly, and the good herald Pisenor brought him his staff. Then, "
    "turning to Aegyptius, “Sir,” he said, “it is I, as you will shortly "
    "learn, who have called you together, for it is I who am the most "
    "wronged. I have not got wind of any army approaching that I would warn "
    "you about, nor is there any matter of public importance I mean to speak "
    "on. My grievance is purely personal, and it turns on two great "
    "misfortunes that have fallen on my house. The first is the loss of my "
    "excellent father, who was chief among all of you here present, and was "
    "like a father to every one of you. The second is much more serious, and "
    "before long it will be the utter ruin of my estate. The sons of all the "
    "chief men among you are pestering my mother to marry them against her "
    "will. They are afraid to go to her father Icarius and ask him to choose "
    "the one he likes best and to provide marriage gifts for his daughter; "
    "instead they hang about my father’s house day after day, slaughtering "
    "our oxen, sheep and fat goats for their banquets, and never giving so "
    "much as a thought to the quantity of wine they drink. No estate can "
    "stand such recklessness. We have no Odysseus now to keep harm from our "
    "doors, and I cannot hold my own against them. I shall never all my days "
    "be as good a man as he was; still, I would certainly defend myself if I "
    "had the power to do it, for I cannot stand such treatment any longer. My "
    "house is being disgraced and ruined. Have respect, then, for your own "
    "consciences and for public opinion. Fear the anger of heaven too, in "
    "case the gods are displeased and turn on you. I beg you, by Zeus and by "
    "Themis, who is the beginning and the end of councils: do not hold back, "
    "my friends, and leave me single-handed—unless it be that my brave father "
    "Odysseus did the Achaeans some wrong that you would now avenge on me, by "
    "aiding and abetting these suitors. And if I am to be eaten out of house "
    "and home at all, I would rather you did the eating yourselves, for then "
    "I could take action against you to some purpose, and serve you with "
    "notices from house to house until I got paid in full, whereas now I have "
    "no remedy.”",

    # B02-P005
    "With this Telemachus dashed his staff to the ground and burst into "
    "tears. Everyone was very sorry for him, but they all sat still and no "
    "one ventured to give him an angry answer—no one but Antinous, who said:",

    # B02-P006
    "“Telemachus, you insolent braggart, how dare you try to throw the blame "
    "on us suitors? It is your mother’s fault, not ours, for she is a very "
    "artful woman. For three years now, and close on four, she has been "
    "driving us out of our minds by encouraging every one of us and sending "
    "each of us messages without meaning a word of what she says. And then "
    "there was that other trick she played on us. She set up a great "
    "embroidery frame in her room and began to work on an enormous piece of "
    "fine needlework. ‘Sweethearts,’ she said, ‘Odysseus is indeed dead, but "
    "do not press me to marry again just yet—wait, for I would not have my "
    "skill in needlework perish unrecorded—until I have finished a pall for "
    "the hero Laertes, ready for the time when death takes him. He is very "
    "rich, and the women of the place will talk if he is laid out without a "
    "pall.’",

    # B02-P007
    "“This was what she said, and we agreed; and after that we could see her "
    "working at her great web all day long, but at night she would unpick the "
    "stitches again by torchlight. She fooled us this way for three years and "
    "we never found her out; but as time wore on and she was now in her "
    "fourth year, one of her maids who knew what she was doing told us, and "
    "we caught her in the act of undoing her work, so she had to finish it "
    "whether she liked it or not. So the suitors make you this answer, that "
    "both you and the Achaeans may understand it: ‘Send your mother away, and "
    "tell her to marry the man of her own choice and her father’s.’ For I do "
    "not know what will happen if she goes on plaguing us much longer with "
    "the airs she gives herself on the strength of the skills Athena has "
    "taught her, and because she is so clever. We never yet heard of such a "
    "woman. We know all about Tyro, Alcmena, Mycene and the famous women of "
    "old, but not one of them was anything to your mother. It was not fair of "
    "her to treat us in that way, and as long as she stays in the mind heaven "
    "has now given her, so long we shall go on eating up your estate; and I "
    "do not see why she should change, for she gets all the honor and glory, "
    "and it is you who pay for it, not she. Understand, then, that we will "
    "not go back to our lands, here or anywhere else, until she has made her "
    "choice and married one or other of us.”",

    # B02-P008
    "Telemachus answered, “Antinous, how can I drive the mother who bore me "
    "out of my father’s house? My father is abroad and we do not know whether "
    "he is alive or dead. It will go hard with me if I have to pay Icarius "
    "the large sum I must give him if I insist on sending his daughter back "
    "to him. Not only will he deal harshly with me, but heaven will punish me "
    "as well; for my mother, when she leaves the house, will call on the "
    "Erinyes—the spirits of vengeance—to avenge her. Besides, it would not be "
    "a creditable thing to do, and I will have nothing to say to it. If you "
    "choose to take offense at this, leave the house and feast elsewhere, at "
    "one another’s houses, at your own expense, turn and turn about. But if "
    "you choose instead to go on feeding off one man, heaven help me, but "
    "Zeus will settle the account with you in full, and when you fall in my "
    "father’s house, there will be no one to avenge you.”",

    # B02-P009
    "As he spoke, Zeus sent two eagles from the top of the mountain, and they "
    "flew on and on with the wind, gliding side by side in their own lordly "
    "flight. When they were right over the middle of the assembly they "
    "wheeled and circled about, beating the air with their wings and glaring "
    "death into the eyes of the men below; then, fighting fiercely and "
    "tearing at one another, they flew off to the right, over the town. The "
    "people wondered as they watched them, and asked each other what all this "
    "might mean; and then Halitherses, who was the best prophet and reader of "
    "omens among them, spoke to them plainly and in all honesty, and said:",

    # B02-P010
    "“Hear me, men of Ithaca, and I speak to the suitors above all, for I see "
    "trouble brewing for them. Odysseus is not going to be away much longer; "
    "indeed he is close at hand, to deal out death and destruction—not on "
    "them alone, but on many another of us who live in Ithaca. Let us be wise "
    "in time, then, and put a stop to this wickedness before he comes. Let "
    "the suitors do it of their own accord; it will be better for them. I am "
    "not prophesying without due knowledge: everything has happened to "
    "Odysseus as I foretold when the Argives set out for Troy, and he with "
    "them. I said that after going through much hardship and losing all his "
    "men he would come home again in the twentieth year, and that no one "
    "would know him; and now all this is coming true.”",

    # B02-P011
    "Eurymachus, son of Polybus, then said, “Go home, old man, and prophesy "
    "to your own children, or it may go worse for them. I can read these "
    "omens far better than you can. Birds are always flying about in the "
    "sunshine somewhere or other, but they seldom mean anything. Odysseus has "
    "died in a far country, and it is a pity you are not dead along with him "
    "instead of going on here about omens and adding fuel to the anger of "
    "Telemachus, which is fierce enough as it is. I suppose you think he will "
    "give you something for your family. But I tell you—and it will surely "
    "happen—when an old man like you, who should know better, talks a young "
    "one round until he becomes troublesome, then in the first place his "
    "young friend will only fare so much the worse (he will take nothing by "
    "it, for the suitors will prevent that), and in the second, we will lay a "
    "heavier fine on you, sir, than you will at all like paying, for it will "
    "bear hard on you. As for Telemachus, I warn him in front of you all to "
    "send his mother back to her father, who will find her a husband and "
    "provide all the marriage gifts a beloved daughter deserves. Until then "
    "we shall go on harassing him with our suit; for we fear no man, and we "
    "care neither for him, with all his fine speeches, nor for any "
    "fortune-telling of yours. You may preach as much as you please, but we "
    "shall only hate you the more. We shall go back and go on eating up "
    "Telemachus’s estate without paying him, until such time as his mother "
    "stops tormenting us by keeping us day after day on tiptoe with "
    "expectation, each of us vying with the others in his suit for a prize of "
    "such rare perfection. And we cannot go after the other women whom we "
    "should be marrying in due course, because of the way she treats us.”",

    # B02-P012
    "Then Telemachus said, “Eurymachus, and you other suitors, I shall say no "
    "more and entreat you no further, for the gods and the people of Ithaca "
    "now know my story. Give me, then, a ship and a crew of twenty men to "
    "take me here and there, and I will go to Sparta and to Pylos in search "
    "of my father, who has been missing so long. Someone may tell me "
    "something, or—as often happens—some message from heaven may guide me. If "
    "I can hear that he is alive and on his way home, I will put up with the "
    "waste you suitors make for another twelve months. If on the other hand I "
    "hear that he is dead, I will come home at once, hold his funeral rites "
    "with full honor, raise a mound to his memory, and give my mother in "
    "marriage again.”",

    # B02-P013
    "With these words he sat down, and Mentor, who had been a friend of "
    "Odysseus and had been left in charge of everything with full authority "
    "over the servants, rose to speak. He too spoke to them plainly and in "
    "all honesty, and said:",

    # B02-P014
    "“Hear me, men of Ithaca. I hope you may never again have a kind and "
    "well-disposed ruler, nor one who will govern you fairly; I hope that all "
    "your chiefs from now on may be cruel and unjust—for there is not one of "
    "you who has not forgotten Odysseus, who ruled you as though he were your "
    "father. I am not half so angry with the suitors: if they choose to do "
    "violence in the wickedness of their hearts, and stake their heads on "
    "Odysseus never coming back, then they can take the high hand and eat up "
    "his estate. But as for the rest of you, I am shocked at the way you all "
    "sit still without even trying to stop such scandalous goings-on—which "
    "you could do if you chose, for you are many and they are few.”",

    # B02-P015
    "Leiocritus, son of Evenor, answered him: “Mentor, what folly is all "
    "this, that you should set the people on to stop us? It is a hard thing "
    "for one man to fight a crowd over his food. Even if Odysseus himself "
    "were to come upon us while we were feasting in his house, and do his "
    "best to drive us out, his wife—who wants him back so very badly—would "
    "have small cause to rejoice, and his blood would be on his own head if "
    "he fought against such great odds. There is no sense in what you have "
    "been saying. Now, then, the rest of you go about your business, and let "
    "the boy’s father’s old friends, Mentor and Halitherses, speed him on his "
    "journey—if he goes at all, which I do not think he will, for he is more "
    "likely to stay where he is until someone comes and tells him something.”",

    # B02-P016
    "With this he broke up the assembly, and every man went back to his own "
    "home, while the suitors returned to the house of Odysseus.",

    # B02-P017
    "Then Telemachus went off all alone along the sea shore, washed his hands "
    "in the gray waves, and prayed to Athena.",

    # B02-P018
    "“Hear me,” he cried, “you god who came to me yesterday and told me to "
    "sail the seas in search of my father, who has been missing so long. I "
    "would obey you, but the Achaeans, and the wicked suitors above all, are "
    "hindering me, so that I cannot.”",

    # B02-P019
    "As he was praying, Athena came up close to him in the likeness and with "
    "the voice of Mentor. “Telemachus,” she said, “if you are made of the "
    "same stuff as your father, you will be neither fool nor coward from now "
    "on, for Odysseus never broke his word nor left his work half done. If "
    "you take after him, then, your voyage will not be fruitless; but unless "
    "you have the blood of Odysseus and of Penelope in your veins, I see no "
    "likelihood of your succeeding. Sons are seldom as good men as their "
    "fathers; they are generally worse, not better. Still, as you are not "
    "going to be either fool or coward from now on, and are not entirely "
    "without some share of your father’s wise discernment, I look with hope "
    "on your undertaking. But mind you never make common cause with any of "
    "those foolish suitors, for they have neither sense nor virtue, and they "
    "give no thought to death and to the doom that will shortly fall on one "
    "and all of them, so that they shall perish on the same day. As for your "
    "voyage, it shall not be long delayed. Your father was such an old friend "
    "of mine that I will find you a ship, and will come with you myself. For "
    "now, go home and move about among the suitors; begin getting provisions "
    "ready for your voyage. See everything well stowed—the wine in jars, and "
    "the barley meal, which is the staff of life, in leather bags—while I go "
    "round the town and round up volunteers at once. There are many ships in "
    "Ithaca, both old and new; I will run my eye over them for you and will "
    "choose the best. We will get her ready and put out to sea without "
    "delay.”",

    # B02-P020
    "So spoke Athena, daughter of Zeus, and Telemachus lost no time in doing "
    "as the goddess told him. He went home in low spirits, and found the "
    "suitors flaying goats and singeing pigs in the outer court. Antinous "
    "came up to him at once, laughed, and took his hand in his own, saying, "
    "“Telemachus, my fine hothead, bear no more ill will, in word or deed, "
    "but eat and drink with us as you used to. The Achaeans will provide you "
    "with everything—a ship and a picked crew as well—so that you can set "
    "sail for Pylos at once and get news of your noble father.”",

    # B02-P021
    "“Antinous,” Telemachus answered, “I cannot eat in peace, nor take "
    "pleasure of any kind, in the company of men like you. Was it not enough "
    "that you wasted so much good property of mine while I was still a boy? "
    "Now that I am older and know more about it, I am stronger too, and "
    "whether here among these people or by going to Pylos, I will do you all "
    "the harm I can. I shall go, and my going will not be in vain—though, "
    "thanks to you suitors, I have neither ship nor crew of my own, and must "
    "be a passenger and not a captain.”",

    # B02-P022
    "As he spoke he snatched his hand out of Antinous’s. Meanwhile the others "
    "went on getting dinner ready about the buildings, jeering at him "
    "tauntingly as they did so.",

    # B02-P023
    "“Telemachus,” said one young man, “means to be the death of us. I "
    "suppose he thinks he can bring friends to help him from Pylos, or from "
    "Sparta again, where he seems bent on going. Or will he go to Ephyra as "
    "well, for poison to put in our wine and kill us?”",

    # B02-P024
    "Another said, “Perhaps, if Telemachus goes on board ship, he will be "
    "like his father and perish far from his friends. In that case we should "
    "have plenty to do, for we could then divide up his property among us—and "
    "as for the house, we can let his mother and the man who marries her have "
    "that.”",

    # B02-P025
    "This was how they talked. But Telemachus went down into the high, "
    "spacious store-room where his father’s treasure of gold and bronze lay "
    "heaped up on the floor, and where the linen and spare clothes were kept "
    "in open chests. Here too there was a store of fragrant olive oil, while "
    "casks of old, well-ripened wine, unmixed and fit for a god to drink, "
    "stood ranged against the wall in case Odysseus should come home again "
    "after all. The room was closed with well-made doors that opened in the "
    "middle; and the faithful old housekeeper Eurycleia, daughter of Ops, son "
    "of Pisenor, was in charge of everything, night and day. Telemachus "
    "called her to the store-room and said:",

    # B02-P026
    "“Nurse, draw me off some of the best wine you have, after what you are "
    "keeping for my father’s own drinking, in case, poor man, he should "
    "escape death and find his way home again after all. Let me have twelve "
    "jars, and see that they all have lids. Fill me some well-sewn leather "
    "bags with barley meal too—about twenty measures in all. Get these things "
    "put together at once, and say nothing about it. I will take everything "
    "away this evening, as soon as my mother has gone upstairs for the night. "
    "I am going to Sparta and to Pylos to see if I can hear anything about "
    "the return of my dear father.”",

    # B02-P027
    "When Eurycleia heard this she began to cry, and spoke fondly to him: "
    "“My dear child, whatever can have put such a notion as that into your "
    "head? Where in the world do you want to go—you, who are the one hope of "
    "this house? Your poor father is dead and gone in some foreign country, "
    "nobody knows where, and as soon as your back is turned these wicked men "
    "here will be scheming to get you put out of the way, and will share all "
    "your possessions among themselves. Stay where you are among your own "
    "people, and do not go wandering and worrying your life out on the barren "
    "sea.”",

    # B02-P028
    "“Do not be afraid, nurse,” Telemachus answered, “my plan is not without "
    "heaven’s sanction; but swear that you will say nothing about any of this "
    "to my mother until I have been away some ten or twelve days—unless she "
    "hears that I have gone and asks you—for I do not want her to spoil her "
    "beauty with crying.”",

    # B02-P029
    "The old woman swore most solemnly that she would not, and when she had "
    "finished her oath she began drawing off the wine into jars and getting "
    "the barley meal into the bags, while Telemachus went back to the "
    "suitors.",

    # B02-P030
    "Then Athena thought of something else. She took his shape and went round "
    "the town to each one of the crew, telling them to meet at the ship by "
    "sundown. She went to Noemon, son of Phronius, as well, and asked him to "
    "let her have a ship—which he was very ready to do. When the sun had set "
    "and darkness was over all the land, she got the ship into the water, put "
    "on board her all the tackle that ships generally carry, and stationed "
    "her at the end of the harbor. Presently the crew came up, and the "
    "goddess spoke encouragingly to each of them.",

    # B02-P031
    "Then she went to the house of Odysseus, and threw the suitors into a "
    "deep slumber. She made their drink go to their heads, and made them drop "
    "their cups from their hands, so that instead of sitting over their wine "
    "they went back into the town to sleep, with their eyes heavy and full of "
    "drowsiness. Then she took the form and voice of Mentor, and called "
    "Telemachus to come outside.",

    # B02-P032
    "“Telemachus,” she said, “the men are on board and at their oars, waiting "
    "for you to give your orders, so make haste and let us be off.”",

    # B02-P033
    "With this she led the way, while Telemachus followed in her steps. When "
    "they got to the ship they found the crew waiting by the water side, and "
    "Telemachus said, “Now, my men, help me get the stores on board. They are "
    "all put together in the gallery, and my mother knows nothing about it, "
    "nor do any of the maidservants except one.”",

    # B02-P034
    "With these words he led the way and the others followed after. When they "
    "had brought the things down as he told them, Telemachus went on board, "
    "Athena going before him and taking her seat in the stern of the vessel, "
    "while Telemachus sat beside her. Then the men loosed the hawsers and "
    "took their places on the benches. Athena sent them a fair wind from the "
    "west, that whistled over the deep blue waves, whereupon Telemachus told "
    "them to catch hold of the ropes and hoist sail, and they did as he told "
    "them. They set the mast in its socket in the cross plank, raised it, and "
    "made it fast with the forestays; then they hoisted their white sails "
    "aloft with ropes of twisted ox hide. As the sail bellied out with the "
    "wind, the ship flew through the deep blue water, and the foam hissed "
    "against her bows as she sped onward. Then they made all fast throughout "
    "the ship, filled the mixing bowls to the brim, and made drink offerings "
    "to the immortal gods that are from everlasting—and above all to the "
    "gray-eyed daughter of Zeus.",

    # B02-P035
    "And so the ship sped on her way through the watches of the night, from "
    "dark till dawn.",
]

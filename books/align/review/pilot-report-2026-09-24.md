# Alignment review report

Checks in this report are **model review** (Claude), not human verification.
`O` = original edition, `M` = modern edition. Segment arrays are
`[kind, s0, s1, t0, t1]` in whitespace-word offsets (see README).

## hamlet

- reviewState: `first-pass`, approved: `None`, counts: `{'auto': 44, 'auto-flagged': 1, 'model': 20, 'human': 0}`
- modern-vs-original word overlap (Jaccard, long paragraphs): 0.30

### Auto-accepted, random — chapter 1, paragraph 52

- **match** `['m', 0, 1, 0, 1]`
  - O: HORATIO.
  - M: HORATIO.
- **match** `['m', 1, 41, 1, 36]`
  - O: That can I; At least, the whisper goes so. Our last King, Whose image even but now appear’d to us, Was, as you know, by Fortinbras of Norway, Thereto prick’d on by a most emulate pride, Dar’d to the combat;
  - M: I can — at least, the rumor goes like this. Our late King, whose image just appeared to us, was challenged to single combat by Fortinbras of Norway, who was driven by fierce competitive pride.
- **match** `['m', 41, 99, 36, 66]`
  - O: in which our valiant Hamlet, For so this side of our known world esteem’d him, Did slay this Fortinbras; who by a seal’d compact, Well ratified by law and heraldry, Did forfeit, with his life, all those his lands Which he stood seiz’d of, to the conqueror; Against the which, a moiety competent Was gaged by our King;
  - M: Our brave King Hamlet — as the whole world honored him — killed this Fortinbras, who, by a legally sealed agreement, forfeited all the lands he possessed to the conqueror.
- **match** `['m', 99, 164, 66, 130]`
  - O: which had return’d To the inheritance of Fortinbras, Had he been vanquisher; as by the same cov’nant And carriage of the article design’d, His fell to Hamlet. Now, sir, young Fortinbras, Of unimproved mettle, hot and full, Hath in the skirts of Norway, here and there, Shark’d up a list of lawless resolutes, For food and diet, to some enterprise That hath a stomach in’t;
  - M: In return, our King had wagered an equal portion of his own lands, which would have gone to Fortinbras had he won — as the terms of the same contract specified. Now, young Fortinbras — full of untested ambition and hot blood — has been gathering up a ragtag army of lawless mercenaries from the fringes of Norway, feeding them for some bold enterprise.
- … 1 more segments

### Auto-accepted, hardest segments (lowest shared-word score)

Chapter 18, paragraph 23, segment 1 (score 0.19), with neighbours:
- **match** `['m', 0, 1, 0, 1]`
  - O: KING.
  - M: KING.
- **match** `['m', 1, 37, 1, 33]`
  - O: A very riband in the cap of youth, Yet needful too, for youth no less becomes The light and careless livery that it wears Than settled age his sables and his weeds, Importing health and graveness.
  - M: Just a ribbon in the cap of youth, but a necessary one too — because youthful energy is as naturally suited to light and carefree attire as maturity is to dignified clothing.
- **match** `['m', 37, 110, 33, 83]`
  - O: Two months since Here was a gentleman of Normandy,— I’ve seen myself, and serv’d against, the French, And they can well on horseback, but this gallant Had witchcraft in’t. He grew unto his seat, And to such wondrous doing brought his horse, As had he been incorps’d and demi-natur’d With the brave beast. So far he topp’d my thought That I in forgery of shapes and tricks, Come short of what he did.
  - M: About two months ago, a gentleman from Normandy visited — I've fought against the French myself, and they're superb horsemen — but this fellow seemed to be made one with his horse. He was so extraordinary on horseback that I couldn't even imagine what he did, let alone describe it.

Chapter 11, paragraph 66, segment 2 (score 0.21), with neighbours:
- **match** `['m', 1, 34, 1, 38]`
  - O: There’s letters seal’d: and my two schoolfellows, Whom I will trust as I will adders fang’d,— They bear the mandate, they must sweep my way And marshal me to knavery. Let it work;
  - M: There are sealed letters — and my two school friends, whom I trust about as far as I'd trust venomous snakes — they carry the orders and will escort me straight into a trap. Let it happen.
- **match** `['m', 34, 79, 38, 81]`
  - O: For ’tis the sport to have the enginer Hoist with his own petard, and ’t shall go hard But I will delve one yard below their mines And blow them at the moon. O, ’tis most sweet, When in one line two crafts directly meet.
  - M: There's a special pleasure in seeing the bomb-maker blown up by his own bomb. And it'll be a hard day when I can't dig a yard deeper than their tunnels and blow them sky-high. Oh, it's so satisfying when two schemes collide head-on.
- **match** `['m', 79, 93, 81, 95]`
  - O: This man shall set me packing. I’ll lug the guts into the neighbour room.
  - M: This man will get me moving. I'll drag the body into the next room.

Chapter 3, paragraph 29, segment 4 (score 0.22), with neighbours:
- **match** `['m', 56, 93, 66, 87]`
  - O: Set your entreatments at a higher rate Than a command to parley. For Lord Hamlet, Believe so much in him that he is young; And with a larger tether may he walk Than may be given you.
  - M: As for Lord Hamlet, believe this much about him: he is young, and he has a longer leash than you do.
- **match** `['m', 93, 133, 87, 121]`
  - O: In few, Ophelia, Do not believe his vows; for they are brokers, Not of that dye which their investments show, But mere implorators of unholy suits, Breathing like sanctified and pious bawds, The better to beguile. This is for all:
  - M: In short, Ophelia, don't believe his promises. They're go-betweens — not what they appear to be — mere promoters of dishonorable intentions, dressed up to sound pious and holy in order to deceive you.
- **match** `['m', 133, 165, 121, 148]`
  - O: I would not, in plain terms, from this time forth Have you so slander any moment leisure As to give words or talk with the Lord Hamlet. Look to’t, I charge you;
  - M: This is my final word: from this point forward, I do not want you wasting any of your free time talking with Lord Hamlet. See to it.

Model-corrected paragraphs: 20 — 2/17, 2/23, 3/5, 3/12, 4/14, 5/18, 7/23, 7/30, 7/42, 7/194, 8/50, 9/1, 9/3, 9/19, 9/69, 9/74, 11/33, 16/40, 18/33, 18/37 (showing 3).

### Model-corrected — chapter 16, paragraph 40

First-pass draft had 6 segments (1 unresolved); model review has 10.
- **match** `['m', 0, 1, 0, 1]`
  - O: KING.
  - M: KING.
- **match** `['m', 1, 16, 1, 17]`
  - O: O, this is the poison of deep grief; it springs All from her father’s death.
  - M: Oh, this is the poison of deep grief — it all springs from her father's death.
- **match** `['m', 16, 30, 17, 35]`
  - O: O Gertrude, Gertrude, When sorrows come, they come not single spies, But in battalions.
  - M: Oh Gertrude, Gertrude — when sorrows come, they come not one at a time, but in whole armies.
- **match** `['m', 30, 34, 35, 39]`
  - O: First, her father slain;
  - M: First, her father killed.
- **match** `['m', 34, 48, 39, 54]`
  - O: Next, your son gone; and he most violent author Of his own just remove;
  - M: Then your son, gone — and he himself the violent cause of his own banishment.
- **match** `['m', 48, 63, 54, 67]`
  - O: the people muddied, Thick, and unwholesome in their thoughts and whispers For good Polonius’ death;
  - M: The people are confused, thick with unwholesome thoughts and whispers about Polonius's death.
- … 4 more segments

### Model-corrected — chapter 4, paragraph 14

First-pass draft had 6 segments (1 unresolved); model review has 11.
- **match** `['m', 0, 1, 0, 1]`
  - O: HAMLET.
  - M: HAMLET.
- **match** `['m', 1, 8, 1, 8]`
  - O: Angels and ministers of grace defend us!
  - M: Angels and ministers of grace, defend us!
- **match** `['m', 8, 46, 8, 48]`
  - O: Be thou a spirit of health or goblin damn’d, Bring with thee airs from heaven or blasts from hell, Be thy intents wicked or charitable, Thou com’st in such a questionable shape That I will speak to thee.
  - M: Whether you are a good spirit or a demon, whether you bring air from heaven or fire from hell, whether your intentions are wicked or kind — you come in such a familiar shape that I will speak to you.
- **match** `['m', 46, 54, 48, 56]`
  - O: I’ll call thee Hamlet, King, father, royal Dane.
  - M: I'll call you Hamlet, King, father, royal Dane.
- **match** `['m', 54, 57, 56, 58]`
  - O: O, answer me!
  - M: Answer me!
- **match** `['m', 57, 63, 58, 64]`
  - O: Let me not burst in ignorance;
  - M: Don't let me die in ignorance.
- … 5 more segments

### Model-corrected — chapter 18, paragraph 37

First-pass draft had 4 segments (1 unresolved); model review has 8.
- **match** `['m', 0, 1, 0, 1]`
  - O: KING.
  - M: KING.
- **match** `['m', 1, 20, 1, 15]`
  - O: Let’s further think of this, Weigh what convenience both of time and means May fit us to our shape.
  - M: Let's think this through further and consider what timing and circumstances will work best.
- **match** `['m', 20, 37, 15, 37]`
  - O: If this should fail, And that our drift look through our bad performance. ’Twere better not assay’d.
  - M: If this plan fails and our intentions are exposed through poor execution, it would have been better not to try at all.
- **match** `['m', 37, 55, 37, 56]`
  - O: Therefore this project Should have a back or second, that might hold If this did blast in proof.
  - M: So this scheme should have a backup — a second plan that holds if the first one doesn't work.
- **match** `['m', 55, 59, 56, 59]`
  - O: Soft, let me see.
  - M: Let me think.
- **match** `['m', 59, 69, 59, 72]`
  - O: We’ll make a solemn wager on your cunnings,— I ha’t!
  - M: We'll set up a formal wager on your skills — I have it!
- … 2 more segments

### Unresolved and one-sided segments (1)

Chapter 10, paragraph 13 (auto-flagged):
- **UNRESOLVED** `['u', 57, 96, 57, 101]`
  - O: He took my father grossly, full of bread, With all his crimes broad blown, as flush as May; And how his audit stands, who knows save heaven? But in our circumstance and course of thought, ’Tis heavy with him.
  - M: He killed my father while my father was unprepared — full of earthly pleasures, with all his sins in full bloom. And what his account looks like before God, only heaven knows — but by our way of thinking, it weighs heavily against him.

## macbeth

- reviewState: `reviewed`, approved: `None`, counts: `{'auto': 0, 'auto-flagged': 0, 'model': 23, 'human': 0}`
- modern-vs-original word overlap (Jaccard, long paragraphs): 0.34

Model-corrected paragraphs: 23 — 2/3, 3/21, 3/47, 5/1, 7/1, 7/7, 7/9, 7/11, 10/1, 12/28, 13/8, 15/58, 16/2, 17/1, 17/2, 18/53, 18/67, 19/6, 20/9, 20/21, 20/29, 25/15, 28/29 (showing 3).

### Model-corrected — chapter 20, paragraph 9

First-pass draft had 4 segments (0 unresolved); model review has 7.
- **match** `['m', 0, 1, 0, 1]`
  - O: MALCOLM.
  - M: MALCOLM.
- **match** `['m', 1, 4, 1, 4]`
  - O: Be not offended:
  - M: Don't be offended.
- **match** `['m', 4, 13, 4, 12]`
  - O: I speak not as in absolute fear of you.
  - M: I don't speak from absolute distrust of you.
- **match** `['m', 13, 21, 12, 22]`
  - O: I think our country sinks beneath the yoke;
  - M: I know our country is sinking under the tyrant's yoke.
- **match** `['m', 21, 36, 22, 35]`
  - O: It weeps, it bleeds; and each new day a gash Is added to her wounds.
  - M: It weeps, it bleeds, and each new day a fresh wound is added.
- **match** `['m', 36, 58, 35, 59]`
  - O: I think, withal, There would be hands uplifted in my right; And here, from gracious England, have I offer Of goodly thousands:
  - M: I know there would be men willing to fight for my cause, and here in generous England I've been offered thousands of good soldiers.
- … 1 more segments

### Model-corrected — chapter 3, paragraph 21

First-pass draft had 3 segments (0 unresolved); model review has 5.
- **match** `['m', 0, 1, 0, 1]`
  - O: BANQUO.
  - M: BANQUO.
- **match** `['m', 1, 31, 1, 35]`
  - O: Good sir, why do you start and seem to fear Things that do sound so fair?—I’ th’ name of truth, Are ye fantastical, or that indeed Which outwardly ye show?
  - M: My good sir, why do you flinch and seem afraid of things that sound so promising? In the name of truth, are you supernatural beings, or are you actually what you appear to be?
- **match** `['m', 31, 54, 35, 61]`
  - O: My noble partner You greet with present grace and great prediction Of noble having and of royal hope, That he seems rapt withal.
  - M: You greet my noble partner with his present title and a grand prophecy of noble rank and royal destiny, so that he seems lost in thought.
- **match** `['m', 54, 59, 61, 67]`
  - O: To me you speak not.
  - M: But you say nothing to me.
- **match** `['m', 59, 92, 67, 102]`
  - O: If you can look into the seeds of time, And say which grain will grow, and which will not, Speak then to me, who neither beg nor fear Your favours nor your hate.
  - M: If you can see into the seeds of time and tell which ones will grow and which will not, then speak to me as well. I neither beg for your favor nor fear your hatred.

### Model-corrected — chapter 17, paragraph 1

First-pass draft had 9 segments (0 unresolved); model review has 17.
Reviewer note: Draft misaligned 'damned fact!'/'A damned act!' by one sentence; fixed.
- **match** `['m', 0, 1, 0, 1]`
  - O: LENNOX.
  - M: LENNOX.
- **match** `['m', 1, 13, 1, 19]`
  - O: My former speeches have but hit your thoughts, Which can interpret farther:
  - M: My earlier remarks have only echoed what you were already thinking, and you can draw your own conclusions.
- **match** `['m', 13, 21, 19, 28]`
  - O: only, I say, Thing’s have been strangely borne.
  - M: I'll only say that things have been strangely managed.
- **match** `['m', 21, 39, 28, 53]`
  - O: The gracious Duncan Was pitied of Macbeth:—marry, he was dead:— And the right valiant Banquo walk’d too late;
  - M: The gracious Duncan was pitied by Macbeth, sure, but Duncan was already dead by then. And the brave Banquo walked out too late at night.
- **match** `['m', 39, 51, 53, 67]`
  - O: Whom, you may say, if’t please you, Fleance kill’d, For Fleance fled.
  - M: You might say, if you like, that Fleance killed him, since Fleance ran away.
- **match** `['m', 51, 57, 67, 72]`
  - O: Men must not walk too late.
  - M: People shouldn't walk so late.
- … 11 more segments

### Unresolved and one-sided segments (3)

Chapter 5, paragraph 1 (model): note: Draft's boundary at O10 was wrong (M0-26 already fully covers O0-26 as one sentence). M130-end is the next O paragraph's soliloquy ('Glamis thou art...'), no counterpart in this O paragraph.
- **TARGET-ONLY** `['t', 130, 266]`
  - O: —
  - M: Glamis you are, and Cawdor, and you shall be what you are promised. Yet I fear your nature. It is too full of the milk of human kindness to take the shortest route. You have ambition, but you lack the ruthle … an pour my determination into your ear and use the boldness of my tongue to drive away everything that stands between you and the golden crown that fate and supernatural forces seem to have destined for you.
Chapter 18, paragraph 53 (model): note: Draft misplaced 'Another!' (M63-64) by one sentence. 'Horrible sight!...blood-bolter'd Banquo...What!' region marked u: O and M sentence breaks don't line up cleanly.
- **UNRESOLVED** `['u', 83, 102, 92, 115]`
  - O: Horrible sight!—Now I see ’tis true; For the blood-bolter’d Banquo smiles upon me, And points at them for his.—What!
  - M: Horrible sight! Now I see it is true, for the blood-clotted Banquo smiles at me and points at them as his descendants. What!
Chapter 20, paragraph 21 (model): note: Draft misplaced 'for even now I...Unspeak mine own detraction' by one sentence, and its 'u' block was mis-scoped (missed O85-94). Fixed; O85-123 (six short O clauses) still marked u as they merge into one M sentence (90-134).
- **UNRESOLVED** `['u', 85, 123, 90, 134]`
  - O: I am yet Unknown to woman; never was forsworn; Scarcely have coveted what was mine own; At no time broke my faith; would not betray The devil to his fellow; and delight No less in truth than life:
  - M: I am still unknown to women, have never broken an oath, have scarcely desired what was already mine, have never betrayed my word, would not hand over even the devil to his fellow, and take no less delight in truth than in life itself.

## frederick-douglass

- reviewState: `first-pass`, approved: `None`, counts: `{'auto': 111, 'auto-flagged': 0, 'model': 7, 'human': 0}`
- modern-vs-original word overlap (Jaccard, long paragraphs): 0.55

### Auto-accepted, random — chapter 5, paragraph 10

- **match** `['m', 0, 19, 0, 20]`
  - O: I look upon my departure from Colonel Lloyd’s plantation as one of the most interesting events of my life.
  - M: I look back on my departure from Colonel Lloyd’s plantation as one of the most significant events of my life.
- **match** `['m', 19, 91, 20, 88]`
  - O: It is possible, and even quite probable, that but for the mere circumstance of being removed from that plantation to Baltimore, I should have to-day, instead of being here seated by my own table, in the enjo … dom and the happiness of home, writing this Narrative, been confined in the galling chains of slavery. Going to live at Baltimore laid the foundation, and opened the gateway, to all my subsequent prosperity.
  - M: It is possible, and even quite likely, that but for the simple circumstance of being moved from that plantation to Baltimore, I would today—instead of sitting here at my own table, enjoying my freedom and the happiness of a home, writing this Narrative—be locked in the galling chains of slavery. Going to live in Baltimore laid the foundation and opened the gateway to all my later good fortune.
- **match** `['m', 91, 129, 88, 130]`
  - O: I have ever regarded it as the first plain manifestation of that kind providence which has ever since attended me, and marked my life with so many favors. I regarded the selection of myself as being somewhat remarkable.
  - M: I have always regarded it as the first clear sign of that kind providence which has watched over me ever since and marked my life with so many favors. The fact that I was the one chosen struck me as somewhat remarkable.
- **match** `['m', 129, 146, 130, 147]`
  - O: There were a number of slave children that might have been sent from the plantation to Baltimore.
  - M: There were a number of slave children who might have been sent from the plantation to Baltimore.
- … 2 more segments

### Auto-accepted, hardest segments (lowest shared-word score)

Chapter 10, paragraph 38, segment 2 (score 0.22), with neighbours:
- **match** `['m', 27, 29, 27, 29]`
  - O: “I won’t!”
  - M: “I won’t!”
- **match** `['m', 29, 45, 29, 42]`
  - O: said Henry, in a firm tone, indicating his readiness to meet the consequences of his refusal.
  - M: said Henry firmly, showing he was ready to face whatever came of refusing.
- **match** `['m', 45, 47, 42, 44]`
  - O: “Won’t you?”
  - M: “Won’t you?”

Chapter 10, paragraph 0, segment 6 (score 0.29), with neighbours:
- **match** `['m', 251, 300, 221, 264]`
  - O: I expected every moment that my brains would be dashed out against the trees. After running thus for a considerable distance, they finally upset the cart, dashing it with great force against a tree, and threw themselves into a dense thicket. How I escaped death, I do not know.
  - M: At every moment I braced for my skull to be smashed against a tree. After charging on like this for a good distance, they finally flipped the cart, ramming it hard into a tree, and flung themselves into a thick patch of brush.
- **match** `['m', 300, 336, 264, 298]`
  - O: There I was, entirely alone, in a thick wood, in a place new to me. My cart was upset and shattered, my oxen were entangled among the young trees, and there was none to help me.
  - M: How I came out alive I cannot say. There I stood, completely alone, deep in a strange wood, my cart overturned and wrecked, my oxen tangled in the saplings, and nobody to help me.
- **match** `['m', 336, 390, 298, 349]`
  - O: After a long spell of effort, I succeeded in getting my cart righted, my oxen disentangled, and again yoked to the cart. I now proceeded with my team to the place where I had, the day before, been chopping wood, and loaded my cart pretty heavily, thinking in this way to tame my oxen.
  - M: After a long, hard struggle I got the cart upright again, the oxen freed, and the team re-yoked. I drove on to the spot where I had been chopping the day before, and loaded the cart down heavily, figuring a heavy load might calm the oxen. Then I started for home.

Chapter 11, paragraph 0, segment 2 (score 0.30), with neighbours:
- **match** `['m', 22, 61, 20, 57]`
  - O: But before narrating any of the peculiar circumstances, I deem it proper to make known my intention not to state all the facts connected with the transaction. My reasons for pursuing this course may be understood from the following:
  - M: Before I describe any of the particular circumstances, though, I think I should say plainly that I do not intend to lay out every fact connected with what happened. My reasons will be clear from the following.
- **match** `['m', 61, 134, 57, 129]`
  - O: First, were I to give a minute statement of all the facts, it is not only possible, but quite probable, that others would thereby be involved in the most embarrassing difficulties. Secondly, such a statement … reater vigilance on the part of slaveholders than has existed heretofore among them; which would, of course, be the means of guarding a door whereby some dear brother bondman might escape his galling chains.
  - M: First, if I gave a detailed account of everything, it is not just possible but quite likely that other people would be dragged into the most awkward and dangerous trouble. Second, such an account would surely make slaveholders far more watchful than they have ever been before — and that watchfulness would, of course, slam shut a door through which some dear fellow slave might have slipped free of his galling chains.
- **match** `['m', 134, 203, 129, 184]`
  - O: I deeply regret the necessity that impels me to suppress any thing of importance connected with my experience in slavery. It would afford me great pleasure indeed, as well as materially add to the interest of my narrative, were I at liberty to gratify a curiosity, which I know exists in the minds of many, by an accurate statement of all the facts pertaining to my most fortunate escape.
  - M: I deeply regret that I am forced to hold back anything important about my experience in slavery. It would genuinely please me, and would add a great deal to the interest of my story, if I were free to satisfy the curiosity I know many people feel by stating every fact about my lucky escape.

Model-corrected paragraphs: 6 — 3/2, 10/3, 10/9, 11/5, 11/6, 12/2 (showing 3).

### Model-corrected — chapter 10, paragraph 9

First-pass draft had 8 segments (1 unresolved); model review has 12.
- **match** `['m', 0, 26, 0, 23]`
  - O: I have already intimated that my condition was much worse, during the first six months of my stay at Mr. Covey’s, than in the last six.
  - M: I have already hinted that my situation was far worse during the first six months at Mr. Covey's than in the last six.
- **match** `['m', 26, 45, 23, 41]`
  - O: The circumstances leading to the change in Mr. Covey’s course toward me form an epoch in my humble history.
  - M: What brought about the change in how he treated me marks a turning point in my humble story.
- **match** `['m', 45, 55, 41, 51]`
  - O: You have seen how a man was made a slave;
  - M: You have seen how a man was made a slave;
- **match** `['m', 55, 65, 51, 62]`
  - O: you shall see how a slave was made a man.
  - M: now you will see how a slave was made a man.
- **match** `['m', 65, 92, 62, 85]`
  - O: On one of the hottest days of the month of August, 1833, Bill Smith, William Hughes, a slave named Eli, and myself, were engaged in fanning wheat.
  - M: On one of the hottest days of August 1833, Bill Smith, William Hughes, a slave named Eli, and I were busy fanning wheat.
- **match** `['m', 92, 116, 85, 114]`
  - O: Hughes was clearing the fanned wheat from before the fan. Eli was turning, Smith was feeding, and I was carrying wheat to the fan.
  - M: Hughes was clearing away the fanned wheat from the front of the fan, Eli was turning, Smith was feeding, and I was carrying the wheat over to the fan.
- … 6 more segments

### Model-corrected — chapter 11, paragraph 5

First-pass draft had 7 segments (1 unresolved); model review has 15.
Reviewer note: Final segment: single long em-dash-chained periodic sentence (Douglass' famous run-on); M breaks it into several clauses in the same order but exact sub-clause word boundaries are unverifiable, so kept as one uncertain block.
- **match** `['m', 0, 16, 0, 16]`
  - O: I have been frequently asked how I felt when I found myself in a free State.
  - M: People have often asked me how I felt when I found myself in a free State.
- **match** `['m', 16, 30, 16, 30]`
  - O: I have never been able to answer the question with any satisfaction to myself.
  - M: I have never been able to answer in a way that satisfied even me.
- **match** `['m', 30, 41, 30, 41]`
  - O: It was a moment of the highest excitement I ever experienced.
  - M: It was the most intensely exciting moment I have ever known.
- **match** `['m', 41, 68, 41, 62]`
  - O: I suppose I felt as one may imagine the unarmed mariner to feel when he is rescued by a friendly man-of-war from the pursuit of a pirate.
  - M: I imagine I felt the way an unarmed sailor must feel when a friendly warship rescues him from a pirate's pursuit.
- **match** `['m', 68, 95, 62, 87]`
  - O: In writing to a dear friend, immediately after my arrival at New York, I said I felt like one who had escaped a den of hungry lions.
  - M: Writing to a dear friend right after I reached New York, I said I felt like someone who had escaped a den of hungry lions.
- **match** `['m', 95, 116, 87, 105]`
  - O: This state of mind, however, very soon subsided; and I was again seized with a feeling of great insecurity and loneliness.
  - M: But this mood soon faded, and I was seized again by a deep sense of insecurity and loneliness.
- … 9 more segments

### Model-corrected — chapter 12, paragraph 2

First-pass draft had 18 segments (1 unresolved); model review has 18.
Reviewer note: Segment at [77,82)/[73,78): five literal ellipsis-period tokens on each side, verbatim KJV citation.
- **match** `['m', 0, 52, 0, 48]`
  - O: The Christianity of America is a Christianity, of whose votaries it may be as truly said, as it was of the ancient scribes and Pharisees, “They bind heavy burdens, and grievous to be borne, and lay them on men’s shoulders, but they themselves will not move them with one of their fingers.
  - M: The Christianity of America is one whose followers can be described just as truly as the ancient scribes and Pharisees were: “They bind heavy burdens, and grievous to be borne, and lay them on men’s shoulders, but they themselves will not move them with one of their fingers.
- **match** `['m', 52, 77, 48, 73]`
  - O: All their works they do for to be seen of men.—They love the uppermost rooms at feasts, and the chief seats in the synagogues, .
  - M: All their works they do for to be seen of men.—They love the uppermost rooms at feasts, and the chief seats in the synagogues, .
- **match** `['m', 77, 82, 73, 78]`
  - O: . . . . .
  - M: . . . . .
- **match** `['m', 82, 97, 78, 93]`
  - O: and to be called of men, Rabbi, Rabbi.—But woe unto you, scribes and Pharisees, hypocrites!
  - M: and to be called of men, Rabbi, Rabbi.—But woe unto you, scribes and Pharisees, hypocrites!
- **match** `['m', 97, 107, 93, 103]`
  - O: for ye shut up the kingdom of heaven against men;
  - M: for ye shut up the kingdom of heaven against men;
- **match** `['m', 107, 123, 103, 119]`
  - O: for ye neither go in yourselves, neither suffer ye them that are entering to go in.
  - M: for ye neither go in yourselves, neither suffer ye them that are entering to go in.
- … 12 more segments

### Unresolved and one-sided segments (1)

Chapter 11, paragraph 5 (model): note: Final segment: single long em-dash-chained periodic sentence (Douglass' famous run-on); M breaks it into several clauses in the same order but exact sub-clause word boundaries are unverifiable, so kept as one uncertain block.
- **UNRESOLVED** `['u', 297, 514, 285, 510]`
  - O: Let him be a fugitive slave in a strange land—a land given up to be the hunting-ground for slaveholders—whose inhabitants are legalized kidnappers—where he is every moment subjected to the terrible liability … most trying situation,—the situation in which I was placed,—then, and not till then, will he fully appreciate the hardships of, and know how to sympathize with, the toil-worn and whip-scarred fugitive slave.
  - M: Let him be a fugitive slave in a strange land — a land handed over as a hunting ground for slaveholders, whose people are kidnappers protected by law, where at every moment he risks being seized by his fello …  say, be put in this most agonizing situation — the situation I was in — and then, and only then, will he fully grasp the hardships of the worn-out, whip-scarred fugitive slave, and know how to feel for him.

## walden

- reviewState: `first-pass`, approved: `None`, counts: `{'auto': 347, 'auto-flagged': 0, 'model': 0, 'human': 0}`
- modern-vs-original word overlap (Jaccard, long paragraphs): 0.94 — near-identical editions; alignment here is easy and says little about modernised prose

### Auto-accepted, random — chapter 9, paragraph 0

- **match** `['m', 0, 65, 0, 65]`
  - O: Sometimes, having had a surfeit of human society and gossip, and worn out all my village friends, I rambled still farther westward than I habitually dwell, into yet more unfrequented parts of the town, “to fresh woods and pastures new,” or, while the sun was setting, made my supper of huckleberries and blueberries on Fair Haven Hill, and laid up a store for several days.
  - M: Sometimes, having had a surfeit of human society and gossip, and worn out all my village friends, I rambled still farther westward than I habitually dwell, into yet more unfrequented parts of the town, "to fresh woods and pastures new," or, while the sun was setting, made my supper of huckleberries and blueberries on Fair Haven Hill, and laid up a store for several days.
- **match** `['m', 65, 87, 65, 87]`
  - O: The fruits do not yield their true flavor to the purchaser of them, nor to him who raises them for the market.
  - M: The fruits do not yield their true flavor to the purchaser of them, nor to him who raises them for the market.
- **match** `['m', 87, 100, 87, 100]`
  - O: There is but one way to obtain it, yet few take that way.
  - M: There is but one way to obtain it, yet few take that way.
- **match** `['m', 100, 114, 100, 114]`
  - O: If you would know the flavor of huckleberries, ask the cow-boy or the partridge.
  - M: If you would know the flavor of huckleberries, ask the cowboy or the partridge.
- … 5 more segments

### Auto-accepted, hardest segments (lowest shared-word score)

Chapter 1, paragraph 1, segment 1 (score 0.29), with neighbours:
- **match** `['m', 0, 61, 0, 56]`
  - O: I should not obtrude my affairs so much on the notice of my readers if very particular inquiries had not been made by my townsmen concerning my mode of life, which some would call impertinent, though they do not appear to me at all impertinent, but, considering the circumstances, very natural and pertinent. Some have asked what I got to eat;
  - M: I would not press my own affairs on my readers so insistently if my townspeople had not asked very pointed questions about my way of life—questions some would call rude, though they do not seem rude to me at all. Given the circumstances they were perfectly natural and pertinent. Some asked what I had to eat;
- **match** `['m', 61, 72, 56, 64]`
  - O: if I did not feel lonesome; if I was not afraid;
  - M: whether I felt lonely; whether I was afraid;
- **match** `['m', 72, 75, 64, 67]`
  - O: and the like.
  - M: and the like.

Chapter 1, paragraph 1, segment 0 (score 0.46), with neighbours:
- **match** `['m', 0, 61, 0, 56]`
  - O: I should not obtrude my affairs so much on the notice of my readers if very particular inquiries had not been made by my townsmen concerning my mode of life, which some would call impertinent, though they do not appear to me at all impertinent, but, considering the circumstances, very natural and pertinent. Some have asked what I got to eat;
  - M: I would not press my own affairs on my readers so insistently if my townspeople had not asked very pointed questions about my way of life—questions some would call rude, though they do not seem rude to me at all. Given the circumstances they were perfectly natural and pertinent. Some asked what I had to eat;
- **match** `['m', 61, 72, 56, 64]`
  - O: if I did not feel lonesome; if I was not afraid;
  - M: whether I felt lonely; whether I was afraid;

Chapter 18, paragraph 0, segment 2 (score 0.63), with neighbours:
- **match** `['m', 13, 21, 13, 21]`
  - O: Thank Heaven, here is not all the world.
  - M: Thank Heaven, here is not all the world.
- **match** `['m', 21, 36, 21, 36]`
  - O: The buck-eye does not grow in New England, and the mocking-bird is rarely heard here.
  - M: The buckeye does not grow in New England, and the mockingbird is rarely heard here.
- **match** `['m', 36, 45, 36, 45]`
  - O: The wild-goose is more of a cosmopolite than we;
  - M: The wild-goose is more of a cosmopolite than we;

### Unresolved and one-sided segments (0)

None.

## on-liberty

- reviewState: `first-pass`, approved: `None`, counts: `{'auto': 113, 'auto-flagged': 0, 'model': 0, 'human': 0}`
- modern-vs-original word overlap (Jaccard, long paragraphs): 0.91 — near-identical editions; alignment here is easy and says little about modernised prose

### Auto-accepted, random — chapter 2, paragraph 44

- **match** `['m', 0, 36, 0, 36]`
  - O: If the arguments of the present chapter are of any validity, there ought to exist the fullest liberty of professing and discussing, as a matter of ethical conviction, any doctrine, however immoral it may be considered.
  - M: If the arguments of the present chapter are of any validity, there ought to exist the fullest liberty of professing and discussing, as a matter of ethical conviction, any doctrine, however immoral it may be considered.
- **match** `['m', 36, 56, 36, 56]`
  - O: It would, therefore, be irrelevant and out of place to examine here, whether the doctrine of Tyrannicide deserves that title.
  - M: It would therefore be irrelevant and out of place to examine here whether the doctrine of Tyrannicide deserves that title.
- **match** `['m', 56, 77, 56, 77]`
  - O: I shall content myself with saying, that the subject has been at all times one of the open questions of morals;
  - M: I shall content myself with saying that the subject has at all times been one of the open questions of morals;
- **match** `['m', 77, 132, 77, 132]`
  - O: that the act of a private citizen in striking down a criminal, who, by raising himself above the law, has placed himself beyond the reach of legal punishment or control, has been accounted by whole nations, and by some of the best and wisest of men, not a crime, but an act of exalted virtue;
  - M: that the act of a private citizen in striking down a criminal who, by raising himself above the law, has placed himself beyond the reach of legal punishment or control, has been accounted by whole nations, and by some of the best and wisest of men, not a crime, but an act of exalted virtue;
- … 3 more segments

### Auto-accepted, hardest segments (lowest shared-word score)

Chapter 1, paragraph 0, segment 2 (score 0.65), with neighbours:
- **match** `['m', 49, 67, 53, 70]`
  - O: Like all that I have written for many years, it belongs as much to her as to me;
  - M: Like everything I have written for many years, it belongs as much to her as to me;
- **match** `['m', 67, 108, 70, 110]`
  - O: but the work as it stands has had, in a very insufficient degree, the inestimable advantage of her revision; some of the most important portions having been reserved for a more careful re-examination, which they are now never destined to receive.
  - M: but the work as it stands has had, only in a very insufficient degree, the priceless benefit of her revision. Some of the most important sections were held back for a more careful re-examination they are now never to receive.
- **match** `['m', 108, 162, 110, 156]`
  - O: Were I but capable of interpreting to the world one-half the great thoughts and noble feelings which are buried in her grave, I should be the medium of a greater benefit to it than is ever likely to arise from anything that I can write, unprompted and unassisted by her all but unrivalled wisdom.
  - M: If I could interpret to the world even half the great thoughts and noble feelings that lie buried in her grave, I would do it a greater service than is likely to come from anything I can write unprompted and unaided by her almost unrivaled wisdom.

Chapter 1, paragraph 3, segment 3 (score 0.73), with neighbours:
- **match** `['m', 47, 59, 46, 58]`
  - O: By liberty, was meant protection against the tyranny of the political rulers.
  - M: By liberty was meant protection against the tyranny of the political rulers.
- **match** `['m', 59, 140, 58, 143]`
  - O: The rulers were conceived (except in some of the popular governments of Greece) as in a necessarily antagonistic position to the people whom they ruled. They consisted of a governing One, or a governing trib …  all events, did not hold it at the pleasure of the governed, and whose supremacy men did not venture, perhaps did not desire, to contest, whatever precautions might be taken against its oppressive exercise.
  - M: The rulers were thought of (except in some of the popular governments of Greece) as standing in a necessarily antagonistic position to the people they ruled. They consisted of a governing One, or a governing … o in any case did not hold it at the pleasure of the governed, and whose supremacy people did not dare — perhaps did not even wish — to contest, however carefully they might guard against its oppressive use.
- **match** `['m', 140, 151, 143, 155]`
  - O: Their power was regarded as necessary, but also as highly dangerous;
  - M: The rulers' power was regarded as necessary, but also as highly dangerous:

Chapter 1, paragraph 8, segment 1 (score 0.73), with neighbours:
- **match** `['m', 0, 36, 0, 35]`
  - O: The likings and dislikings of society, or of some powerful portion of it, are thus the main thing which has practically determined the rules laid down for general observance, under the penalties of law or opinion.
  - M: The likings and dislikings of society, or of some powerful portion of it, are thus the main thing that has practically determined the rules laid down for general observance, under penalties of law or opinion.
- **match** `['m', 36, 74, 35, 71]`
  - O: And in general, those who have been in advance of society in thought and feeling have left this condition of things unassailed in principle, however they may have come into conflict with it in some of its details.
  - M: And in general, those who have been ahead of society in thought and feeling have left this state of affairs unassailed in principle, however much they may have come into conflict with it on particular details.
- **match** `['m', 74, 103, 71, 100]`
  - O: They have occupied themselves rather in inquiring what things society ought to like or dislike, than in questioning whether its likings or dislikings should be a law to individuals.
  - M: They have busied themselves more with inquiring what things society ought to like or dislike, than with questioning whether its likings and dislikings should be a law to individuals.

### Unresolved and one-sided segments (0)

None.


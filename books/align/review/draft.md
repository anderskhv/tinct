# Alignment review report

Checks in this report are **model review** (Claude), not human verification.
`O` = original edition, `M` = modern edition. Segment arrays are
`[kind, s0, s1, t0, t1]` in whitespace-word offsets (see README).

## hamlet

- reviewState: `first-pass`, approved: `None`, counts: `{'auto': 45, 'auto-flagged': 0, 'model': 20, 'human': 0}`
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

Chapter 10, paragraph 13, segment 6 (score 0.22), with neighbours:
- **match** `['m', 49, 75, 50, 78]`
  - O: O, this is hire and salary, not revenge. He took my father grossly, full of bread, With all his crimes broad blown, as flush as May;
  - M: No — that's a reward, not revenge. He killed my father while my father was unprepared — full of earthly pleasures, with all his sins in full bloom.
- **match** `['m', 75, 119, 78, 121]`
  - O: And how his audit stands, who knows save heaven? But in our circumstance and course of thought, ’Tis heavy with him. And am I then reveng’d, To take him in the purging of his soul, When he is fit and season’d for his passage?
  - M: And what his account looks like before God, only heaven knows — but by our way of thinking, it weighs heavily against him. And would it be revenge to kill him while he's purifying his soul, when he's prepared and ready for death?
- **match** `['m', 119, 129, 121, 129]`
  - O: No. Up, sword, and know thou a more horrid hent:
  - M: No. Sword, wait for a more terrible opportunity:

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

### Unresolved and one-sided segments (0)

None.

## frederick-douglass

- reviewState: `first-pass`, approved: `None`, counts: `{'auto': 111, 'auto-flagged': 7, 'model': 0, 'human': 0}`
- modern-vs-original word overlap (Jaccard, long paragraphs): 0.55

### Auto-accepted, random — chapter 10, paragraph 20

- **match** `['m', 0, 14, 0, 13]`
  - O: But to return to Mr. Freeland, and to my experience while in his employment.
  - M: But to come back to Mr. Freeland and my time working for him.
- **match** `['m', 14, 23, 13, 22]`
  - O: He, like Mr. Covey, gave us enough to eat;
  - M: Like Mr. Covey he gave us enough to eat;
- **match** `['m', 23, 26, 22, 25]`
  - O: but, unlike Mr.
  - M: but unlike Mr.
- **match** `['m', 26, 37, 25, 35]`
  - O: Covey, he also gave us sufficient time to take our meals.
  - M: Covey he also gave us enough time to eat it.
- … 4 more segments

### Auto-accepted, hardest segments (lowest shared-word score)

Chapter 10, paragraph 20, segment 0 (score 0.20), with neighbours:
- **match** `['m', 0, 14, 0, 13]`
  - O: But to return to Mr. Freeland, and to my experience while in his employment.
  - M: But to come back to Mr. Freeland and my time working for him.
- **match** `['m', 14, 23, 13, 22]`
  - O: He, like Mr. Covey, gave us enough to eat;
  - M: Like Mr. Covey he gave us enough to eat;

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

Chapter 10, paragraph 2, segment 4 (score 0.23), with neighbours:
- **match** `['m', 69, 101, 62, 115]`
  - O: He knew by himself just what a man or a boy could do. There was no deceiving him. His work went on in his absence almost as well as in his presence;
  - M: Because he did the labor himself, he knew exactly how much a man or a boy could manage, and you could never fool him. The work went on nearly as well when he was away as when he was present, because he had a knack for making us feel he was always watching.
- **match** `['m', 101, 140, 115, 150]`
  - O: and he had the faculty of making us feel that he was ever present with us. This he did by surprising us. He seldom approached the spot where we were at work openly, if he could do it secretly.
  - M: He pulled this off by catching us off guard. He almost never came up to where we were working in plain sight if he could do it in secret — surprise was always his aim.
- **match** `['m', 140, 198, 150, 195]`
  - O: He always aimed at taking us by surprise. Such was his cunning, that we used to call him, among ourselves, “the snake.” When we were at work in the cornfield, he would sometimes crawl on his hands and knees to avoid detection, and all at once he would rise nearly in our midst, and scream out, “Ha, ha!
  - M: He was so sly that among ourselves we called him "the snake." When we were working the cornfield, he would sometimes crawl on his hands and knees to keep from being seen, then suddenly rise up almost on top of us and yell, "Ha, ha!

### Unresolved and one-sided segments (7)

Chapter 3, paragraph 2 (auto-flagged):
- **UNRESOLVED** `['u', 33, 109, 41, 89]`
  - O: for in nothing was Colonel Lloyd more particular than in the management of his horses. The slightest inattention to these was unpardonable, and was visited upon those, under whose care they were placed, with … shield them, if the colonel only suspected any want of attention to his horses—a supposition which he frequently indulged, and one which, of course, made the office of old and young Barney a very trying one.
  - M: The slightest bit of neglect was unforgivable and brought the harshest punishment down on whoever was responsible. No excuse could protect them if the colonel so much as suspected that his horses had been neglected—and he suspected it often, which made the two Barneys' position a miserable one.
Chapter 10, paragraph 3 (auto-flagged):
- **UNRESOLVED** `['u', 232, 245, 221, 226]`
  - O: The facts in the case are these: Mr. Covey was a poor man;
  - M: Here are the facts. Mr.
Chapter 10, paragraph 9 (auto-flagged):
- **UNRESOLVED** `['u', 146, 169, 134, 176]`
  - O: my strength failed me; I was seized with a violent aching of the head, attended with extreme dizziness; I trembled in every limb.
  - M: Around three o'clock that afternoon I gave out — my strength failed, my head began pounding violently, I was swept with terrible dizziness, and every limb shook. Feeling it coming on, I braced myself, sure that stopping was out of the question.
Chapter 10, paragraph 10 (auto-flagged):
- **UNRESOLVED** `['u', 763, 875, 716, 837]`
  - O: Master Thomas ridiculed the idea that there was any danger of Mr. Covey’s killing me, and said that he knew Mr. Covey; that he was a good man, and that he could not think of taking me from him; that, should  … ight; and that I must not trouble him with any more stories, or that he would himself _get hold of me_. After threatening me thus, he gave me a very large dose of salts, telling me that I might remain in St.
  - M: Covey would surely kill me, and was well on the way to it. Master Thomas laughed off the notion that Covey was any danger to my life, said he knew the man, that he was a good man, and that he could not think …  matter what, and that I had better not bother him with any more such stories, or he would get hold of me himself. After threatening me like that, he gave me a huge dose of salts, told me I could stay in St.
Chapter 11, paragraph 5 (auto-flagged):
- **UNRESOLVED** `['u', 259, 514, 263, 510]`
  - O: I saw in every white man an enemy, and in almost every colored man cause for distrust. It was a most painful situation; and, to understand it, one must needs experience it, or imagine himself in similar circ … most trying situation,—the situation in which I was placed,—then, and not till then, will he fully appreciate the hardships of, and know how to sympathize with, the toil-worn and whip-scarred fugitive slave.
  - M: It was an agonizing situation, and to understand it one must either live through it or imagine himself in the same place. Let him be a fugitive slave in a strange land — a land handed over as a hunting groun …  say, be put in this most agonizing situation — the situation I was in — and then, and only then, will he fully grasp the hardships of the worn-out, whip-scarred fugitive slave, and know how to feel for him.
Chapter 11, paragraph 6 (auto-flagged):
- **UNRESOLVED** `['u', 0, 12, 0, 15]`
  - O: Thank Heaven, I remained but a short time in this distressed situation.
  - M: Thankfully, I did not stay trapped in that misery for long. The kindness of _Mr.
Chapter 12, paragraph 2 (auto-flagged):
- **UNRESOLVED** `['u', 78, 80, 75, 77]`
  - O: . .
  - M: . .

## walden

- reviewState: `first-pass`, approved: `None`, counts: `{'auto': 347, 'auto-flagged': 0, 'model': 0, 'human': 0}`
- modern-vs-original word overlap (Jaccard, long paragraphs): 0.94 — near-identical editions; alignment here is easy and says little about modernised prose

### Auto-accepted, random — chapter 1, paragraph 48

- **match** `['m', 0, 22, 0, 22]`
  - O: In the savage state every family owns a shelter as good as the best, and sufficient for its coarser and simpler wants;
  - M: In the savage state every family owns a shelter as good as the best, and sufficient for its coarser and simpler wants;
- **match** `['m', 22, 67, 22, 65]`
  - O: but I think that I speak within bounds when I say that, though the birds of the air have their nests, and the foxes their holes, and the savages their wigwams, in modern civilized society not more than one half the families own a shelter.
  - M: but I think I speak within bounds when I say that, though the birds of the air have their nests, and the foxes their holes, and the savages their wigwams, in modern civilized society not more than half the families own a shelter.
- **match** `['m', 67, 93, 65, 91]`
  - O: In the large towns and cities, where civilization especially prevails, the number of those who own a shelter is a very small fraction of the whole.
  - M: In the large towns and cities, where civilization especially prevails, the number of those who own a shelter is a very small fraction of the whole.
- **match** `['m', 93, 130, 91, 131]`
  - O: The rest pay an annual tax for this outside garment of all, become indispensable summer and winter, which would buy a village of Indian wigwams, but now helps to keep them poor as long as they live.
  - M: The rest pay an annual tax for this outermost garment of all, which has become indispensable summer and winter, and which would buy a village of Indian wigwams, but now helps to keep them poor as long as they live.
- … 10 more segments

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


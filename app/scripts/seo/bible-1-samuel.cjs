// SEO content data for 1 Samuel — eighth book of the Hebrew Bible.
// Deuteronomistic History, edited 6th c. BCE.
// Voice: literary, declarative present.

const chapters = require('/tmp/bible-1-samuel-chunk-1.json');

module.exports = {
  id: 'bible-1-samuel',
  title: '1 Samuel',
  author: 'Anonymous (Deuteronomistic History)',
  byline: 'c. 6th c. BCE · Hebrew Bible · Former Prophets',
  titleAccent: 'a guided tour',
  hook: 'A barren woman prays silently in a sanctuary. Her son anoints two kings. The second kills a giant and becomes the most famous figure in the Hebrew Bible. The first falls apart.',
  themesBlurb: 'Divine choice, the cost of monarchy, paranoia and loyalty, the unlikely raised up.',
  castBlurb: 'The house of Israel at the birth of the kingdom',
  castDesc: 'The sanctuary at Shiloh, the court of Saul, and the wilderness of Judah.',
  chapterLabel: n => '1 Samuel ' + n,
  genre: ['Scripture', 'Hebrew Bible', 'Historical narrative'],

  about: [
    `<em>1 Samuel</em> is the book in which Israel becomes a kingdom. It opens with a barren woman praying silently in a sanctuary at Shiloh and closes with the body of King Saul stripped on the slopes of Mount Gilboa. Between those two scenes the prophet Samuel calls Israel to repentance, anoints two kings against his better judgment, and watches the second king — a shepherd boy from Bethlehem — outgrow him. It is the book of Hannah's prayer, of David and Goliath, of Saul's slow undoing, of one of the most fully drawn male friendships in ancient literature, and of the question that has haunted political theology ever since: should there be a king, and if so, what is he for?`,
    `The book reaches its present form during or just after the Babylonian exile, edited as part of the Deuteronomistic History that runs from Joshua through 2 Kings. It draws on older sources of remarkable variety — a temple narrative, an ark narrative, a pro-monarchic strand and an anti-monarchic strand placed side by side without harmonization, and court memoirs about Saul and David that may go back to the tenth century. The result is one of the most psychologically rich and morally complicated narratives in the Hebrew Bible.`,
  ],
  chaptersSubtitle: "All 31 chapters — from Hannah's prayer to the death of Saul on Mount Gilboa.",
  chaptersLead: `<p>1 Samuel divides into three large arcs. Chapters 1–7 are about Samuel: his miraculous birth, his call as a boy, and his emergence as judge and prophet. Chapters 8–15 are about the demand for a king and the rise and fall of Saul. Chapters 16–31 are about David and Saul together: the secret anointing, the killing of Goliath, the friendship with Jonathan, Saul's paranoia and pursuit, and his death on Gilboa.</p>`,
  themesByline: 'Five threads through the book',
  themesLead: `1 Samuel is structured around a question it never fully answers: what does it mean for a free people to accept a king? It asks the question through Hannah, Samuel, Saul, David, and Jonathan, each of whom embodies a different answer — and none of whom is proved entirely right.`,

  groups: [
    { label: "Samuel · ch 1–7", subtitle: "Hannah's prayer. The boy Samuel. The ark's capture. Samuel as judge.", chapters: [1, 2, 3, 4, 5, 6, 7] },
    { label: 'Saul · ch 8–15', subtitle: 'The demand for a king. Saul anointed, tested, and rejected.', chapters: [8, 9, 10, 11, 12, 13, 14, 15] },
    { label: "David's rise · ch 16–31", subtitle: "The secret anointing. Goliath. Jonathan. The long pursuit. Saul's end.", chapters: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31] },
  ],

  themes: [
    {
      slug: 'hannah',
      title: "Hannah's prayer and the song",
      greek: 'the barren woman who opens the book',
      preview: "1 Samuel opens not with a king or a war but with a woman weeping in a sanctuary. Her silent prayer, her vow, and her song set the book's central argument: God's choices fall on the small and the hidden.",
      essay: [
        `1 Samuel opens with a woman in a sanctuary, weeping. Hannah is the wife of Elkanah, of Ramathaim-zophim in the hill country of Ephraim. He has another wife, Peninnah, who has children. Hannah does not. The other woman provokes her every year when they go up to the sanctuary at Shiloh. Hannah weeps and will not eat. Her husband's well-meaning attempt to console her — am I not more to you than ten sons — does not help, as the text quietly notes.`,
        `In distress of soul she goes to the sanctuary and prays silently, only her lips moving — a striking detail, since prayer in this period was almost always aloud. The silent prayer is so unfamiliar that the priest Eli, watching her from his seat by the doorpost, assumes she is drunk and rebukes her. She corrects him. I am a woman deeply troubled, she says. I have been pouring out my soul before the Lord. Eli accepts the correction and blesses her. She goes home, conceives, and bears a son, whom she names Samuel — heard of God.`,
        `When the boy is weaned she brings him back to Shiloh and gives him to the Lord, in fulfilment of her vow. Then she sings. The Song of Hannah — <em>My heart exults in the Lord, there is no Rock like our God</em> — is one of the most influential poems in the Hebrew Bible. Its argument is the reversal of fortunes: the bows of the mighty are broken, but the feeble gird on strength; the Lord raises the poor from the dust; he lifts the needy from the ash heap to make them sit with princes.`,
        `The Magnificat in Luke's Gospel, the song of Mary at the Visitation, is essentially a Christian rewriting of the Song of Hannah, with the same vocabulary and the same theological move. The poem is announcing, in a barren woman's song over an unexpected son, the theme that will run through the entire book: God's choices fall on the small, the hidden, the unlikely. Samuel will be such a one. David, the youngest of eight sons, will be such a one. The book opens with the song that explains why.`,
      ],
      where: [
        { n: 1, label: "1 Samuel 1 (Hannah's prayer and vow)" },
        { n: 2, label: '1 Samuel 2 (the Song of Hannah)' },
        { n: 3, label: '1 Samuel 3 (the call of Samuel as a boy)' },
      ],
    },
    {
      slug: 'monarchy',
      title: 'The request for a king',
      greek: '"They have rejected me from being king over them"',
      preview: "Chapter 8 is the pivot of the book. Israel asks for a king like other nations. Samuel's warning — a king will take, take, take — is the Hebrew Bible's most remarkable speech on political authority.",
      essay: [
        `Chapter 8 is the pivot of 1 Samuel. Samuel has grown old. His sons, whom he has appointed as judges, take bribes and pervert justice. The elders of Israel come to Samuel at Ramah and say: you are old, and your sons do not follow in your ways; appoint for us a king to govern us, like other nations. The thing displeases Samuel, but he prays. The Lord answers: they have not rejected you, but they have rejected me from being king over them. Listen to their voice — only solemnly warn them, and show them the ways of the king who shall reign over them.`,
        `What follows is one of the most remarkable political speeches in the Hebrew Bible. Samuel tells the people what a king will do. He will take your sons and appoint them to his chariots. He will take your daughters to be perfumers and cooks and bakers. He will take the best of your fields and vineyards and give them to his servants. He will take one tenth of your grain and your flocks. And you yourselves will be his slaves.`,
        `The verb take is the rhythmic centre of the speech — eight times in eight verses. The speech is not anti-government in the abstract; it is precise. A king will be an institution that takes. A king will appropriate the produce of your labour and the lives of your children for purposes that are not yours. The reader who knows the rest of the Hebrew Bible — Solomon's forced labour, Rehoboam's tax revolt, Jezebel's murder of Naboth for the vineyard the king wants — recognizes the speech as a prophecy that comes true in detail.`,
        `And the people insist anyway. We are determined to have a king over us, so that we also may be like other nations, and that our king may go out before us and fight our battles. The book lets the request stand. It does not condemn monarchy outright — the rest of the Hebrew Bible will be unable to do without a king when there is one. But it has named what a king will cost, in advance, in the voice of the prophet who anointed the first one. The whole subsequent history of monarchy in Israel reads in part as a long footnote to this chapter.`,
      ],
      where: [
        { n: 8, label: '1 Samuel 8 (the request and the warning)' },
        { n: 9, label: '1 Samuel 9 (Saul found by Samuel)' },
        { n: 12, label: "1 Samuel 12 (Samuel's farewell speech)" },
      ],
    },
    {
      slug: 'saul',
      title: 'Saul: the first king',
      greek: 'the man who could not keep the command',
      preview: 'Saul is the tallest man in Israel, anointed privately and then by lot, a capable soldier who defeats the Ammonites and the Philistines. The book gives him every advantage. Then it takes everything away.',
      essay: [
        `Saul is introduced in chapter 9 as a young man of the tribe of Benjamin, the smallest of the tribes. He is the son of Kish, head and shoulders taller than any other Israelite, sent out to look for some lost donkeys. In the course of the search he comes to the town where Samuel is. The Lord has already told Samuel — the day before — to expect him. Saul appears in the gate. Samuel anoints him privately the next morning, kisses him, and tells him a series of signs that will confirm the call.`,
        `His early career is mixed. He is publicly chosen by lot at Mizpah but cannot be found at first because he has hidden himself among the baggage. He delivers Jabesh-gilead from the Ammonites and is acclaimed king at Gilgal. Then the trouble begins. In chapter 13 Saul is facing a Philistine army; Samuel has told him to wait seven days for him to come and offer sacrifices. The seventh day passes, the army is melting away in fear, and Samuel has not come. Saul, in panic, offers the burnt offering himself. Samuel arrives just as he has finished. You have done foolishly, Samuel says. The Lord would have established your kingdom forever, but now your kingdom shall not continue.`,
        `In chapter 15 the disqualification is sealed. Saul is sent to wage war on the Amalekites under the herem ban — total destruction. He defeats them but spares Agag the king and the best of the livestock. To obey is better than sacrifice, Samuel tells him, in the line that has echoed through every later moral tradition. Because you have rejected the word of the Lord, he has rejected you from being king. Samuel hews Agag in pieces with his own hand, goes home to Ramah, and never sees Saul again until the day of his death.`,
        `The rest of the book watches Saul deteriorate. The spirit of the Lord departs from him; an evil spirit torments him; David is brought into court to play the harp and ease his moods. Saul's paranoia grows — he tries to kill David with a spear, he hunts him through the wilderness. In the end, abandoned by Samuel and by God, he consults a medium at Endor and asks her to bring up Samuel from the dead. Samuel comes up and tells him that tomorrow he and his sons will be with him. The next day they are. Saul falls on his own sword on Mount Gilboa. He is one of the most psychologically realized characters in any ancient narrative — a man given everything, who could never quite hold it.`,
      ],
      where: [
        { n: 9, label: "1 Samuel 9 (Saul's introduction)" },
        { n: 13, label: '1 Samuel 13 (the unauthorized sacrifice)' },
        { n: 15, label: '1 Samuel 15 (the rejection)' },
        { n: 28, label: '1 Samuel 28 (the medium at Endor)' },
        { n: 31, label: '1 Samuel 31 (the death of Saul)' },
      ],
    },
    {
      slug: 'goliath',
      title: 'David and Goliath',
      greek: 'five smooth stones from the brook',
      preview: 'Chapter 17 is the chapter in the Hebrew Bible with the largest popular footprint. Read it twice: once for the story, and once for the literary craft — the forty days, the slow catalogue of armour, the walk across the valley.',
      essay: [
        `The Philistine army is encamped at Socoh in Judah. Saul's army is camped on the opposite hill, with the valley of Elah between them. Each morning and each evening for forty days the Philistine champion comes out and shouts a challenge: choose a man to fight me, and the loser's people will be the winner's slaves. The text is careful to give his measurements. He is six cubits and a span — about nine feet — and his armour is described in unusual detail: a bronze helmet, a coat of mail weighing five thousand shekels, greaves, a javelin, a spear with a shaft like a weaver's beam and an iron head weighing six hundred shekels. The detail is meant to oppress. The narrative dwells on the size and the weight.`,
        `David is at home in Bethlehem keeping his father's sheep — his three older brothers are with the army. Jesse sends him to take provisions and bring back word. He arrives just as Goliath is shouting his daily challenge. He hears the men talking about the reward — great wealth, the king's daughter, exemption from taxes. He asks more than once. His oldest brother Eliab loses his temper. Saul hears about him and sends for him.`,
        `The central exchange between David and Saul is among the finest pieces of dialogue in ancient narrative. Saul tells him he cannot fight; he is only a youth. David's answer is the speech that has been quoted for three thousand years: Your servant used to keep sheep, and whenever a lion or a bear came and took a lamb from the flock, I went after it and struck it down. The Lord who saved me from the paw of the lion and the paw of the bear will save me from the hand of this Philistine.`,
        `Saul tries to give David his own armour. David puts it on, walks a few steps, takes it off — he cannot move in it. He goes down to the brook, picks up five smooth stones, takes his sling, and walks across the valley. The stone strikes Goliath in the forehead. He falls face down. David pulls Goliath's sword from its sheath and cuts off his head. The chapter is brilliantly paced: forty days of waiting, the slow build of the descriptions, the walk across the valley, and then — in three verses — the killing. David and Goliath has become available to every later language as a metaphor for the smaller force defeating the larger by guile and faith, and the chapter earns that status on every reading.`,
      ],
      where: [
        { n: 16, label: '1 Samuel 16 (the secret anointing of David)' },
        { n: 17, label: '1 Samuel 17 (David and Goliath)' },
        { n: 18, label: "1 Samuel 18 (David enters Saul's court)" },
      ],
    },
    {
      slug: 'jonathan',
      title: 'David and Jonathan',
      greek: '"Your love to me was wonderful, passing the love of women"',
      preview: "Among the human relationships in the Hebrew Bible, the friendship of David and Jonathan is the one the text returns to with the greatest emotional warmth. Jonathan, the rightful heir to the throne, accepts that David will be king — and accepts it without bitterness.",
      essay: [
        `Jonathan is Saul's eldest son, the heir to the kingdom that has just been forfeited. By every conventional measure of self-interest, he should be David's enemy. Instead, from the moment they meet in chapter 18 — just after the killing of Goliath — the soul of Jonathan was bound to the soul of David, and Jonathan loved him as his own soul. He gives David his royal robe and armour, his sword and his bow and his belt. He makes a covenant with him.`,
        `The friendship is tested across multiple chapters. When Saul tries to kill David with a spear at table, it is Jonathan who first refuses to believe the report and then, after testing his father, confirms it. Their farewell scene in chapter 20, in the field by the stone Ezel, is one of the great parting scenes in any literature. Jonathan has shot the arrow past his servant boy as the prearranged signal that David must flee. The boy is dismissed. David comes out from hiding. They embrace and weep, the text says, until David wept the more.`,
        `They meet only once more in the book — in chapter 23, in the wilderness of Ziph, when Jonathan finds David hiding and strengthens his hand in God. He says: do not fear, for the hand of my father Saul shall not find you, and you shall be king over Israel, and I shall be next to you. The line is the central declaration of the friendship. Jonathan, the rightful heir by the conventions of his society, accepts that he will not be king and that David will, and accepts it without bitterness because he loves the man whose kingdom it will be.`,
        `When Jonathan dies on Mount Gilboa at the end of the book, David's lament for him in 2 Samuel 1 becomes one of the most quoted passages in the Hebrew Bible. <em>Saul and Jonathan, beloved and lovely, in life and in death they were not divided. I am distressed for you, my brother Jonathan; greatly beloved were you to me; your love to me was wonderful, passing the love of women.</em> The book of 1 Samuel is the foundation of one of the great pictures of male friendship in any literature — built scene by scene over more than ten chapters.`,
      ],
      where: [
        { n: 18, label: '1 Samuel 18 (the covenant made)' },
        { n: 19, label: '1 Samuel 19 (Jonathan defends David)' },
        { n: 20, label: '1 Samuel 20 (the farewell at Ezel)' },
        { n: 23, label: '1 Samuel 23 (the meeting in the wilderness)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Hannah', role: 'Mother of Samuel', body: `The barren wife of Elkanah whose silent prayer at the sanctuary at Shiloh opens the book. She vows that if she is given a son she will give him to the Lord. She conceives, bears Samuel, weans him, brings him back to the sanctuary, and leaves him there. Then she sings the Song of Hannah — the great reversal poem on which Mary's Magnificat in Luke's Gospel is patterned. One of the most fully realized women in the Hebrew Bible, and the book opens with her because she announces its whole pattern: the unlikely raised up.` },
    { name: 'Samuel', role: 'Last judge, first of the great prophets', body: `Hannah's son, given to the Lord at Shiloh, raised under the high priest Eli. Called by name as a boy — speak, Lord, your servant is listening — and from that point recognized throughout Israel as a prophet. Emerges as judge after the disaster at Aphek. Anoints Saul as the first king of Israel and later anoints David as the second. Dies before the end of the book, mourned by all Israel, and is brought up by the medium at Endor for one final scene with Saul on the eve of Saul's death.` },
    { name: 'Saul', role: 'First king of Israel', body: `Of the tribe of Benjamin, head and shoulders taller than any other Israelite. Anointed privately by Samuel, then publicly by lot at Mizpah, then acclaimed king after his deliverance of Jabesh-gilead. His first failures come quickly — the unauthorized sacrifice at Gilgal, the sparing of Agag — and from chapter 16 the spirit of the Lord has departed from him. The rest of his reign is a slow disintegration, marked by paranoia, futile pursuit of David, consultation with the medium at Endor, and finally death on Mount Gilboa with three of his sons. One of the most psychologically realized characters in any ancient narrative.` },
    { name: 'David', role: 'Shepherd, harpist, giant-killer, king-in-waiting', body: `Youngest of the eight sons of Jesse of Bethlehem, secretly anointed as Saul's successor while still keeping his father's sheep. Brought into Saul's court as a harpist. Kills Goliath. Marries Saul's daughter Michal. Becomes the bosom friend of Saul's son Jonathan. Survives Saul's paranoia and lives as an outlaw in the wilderness, twice sparing Saul's life when he had him at his mercy. The book closes with him still in exile and the kingdom in disarray — everything that Israel will later become is already in seed in him.` },
    { name: 'Jonathan', role: 'Prince, heir, covenant friend', body: `Saul's eldest son and the heir to the kingdom. Brave — in chapter 14 he and his armour-bearer climb a Philistine outpost alone and rout the garrison. Loyal to David from the moment they meet with a depth the text returns to repeatedly. He gives David his own robe and weapons, makes a covenant with him, defends him to Saul, warns him to flee, meets him secretly in the wilderness to strengthen his hand, and accepts that David will be king while he himself will be next to him. Dies with his father on Mount Gilboa.` },
    { name: 'Eli', role: 'High priest at Shiloh', body: `Old, heavy, going blind — the priest at Shiloh under whom Samuel grows up. He misjudges Hannah's silent prayer as drunkenness; raises Samuel from a small boy; hears the prophecy against his own house from Samuel without bitterness. His sons Hophni and Phinehas are scoundrels who take the best offerings and sleep with the women at the tent of meeting. Both die when the ark is captured at Aphek. When the news reaches Eli at Shiloh he falls back from his seat, breaks his neck, and dies. The book treats him with a kind of weary tenderness: not a successful priest, but not a wicked man either.` },
  ],

  castSubtitle: 'The sanctuary at Shiloh, the court at Gibeah, and the wilderness of Judah.',
  castLead: `<p>1 Samuel has a relatively focused cast: Hannah and Eli in the opening, Samuel across the whole, Saul dominating the middle, and David and Jonathan in the second half. Almost every named figure has a clearly defined relationship to the question of who should be king — and almost none of them agrees.</p>`,
  castGroups: [
    {
      label: 'The sanctuary',
      characters: [
        { id: 'hannah', tag: 'Prophet', tagClass: 'prophet', name: 'Hannah', epithet: 'The barren woman who opens the book', body: `Wife of Elkanah, of Ramathaim-zophim in the hill country of Ephraim. Her rival Peninnah has children; Hannah does not. Her silent prayer at the sanctuary at Shiloh opens the book. She vows her son to God if she is given one, receives Samuel, raises him to weaning age, and brings him back to Shiloh. Then she sings one of the great poems in the Hebrew Bible — the Song of Hannah, the model for Mary's Magnificat. Bears five more children after Samuel. Visits him each year with a little robe she has made.`, appears: [1, 2] },
        { id: 'eli', tag: 'Priest', tagClass: 'priest', name: 'Eli', epithet: 'High priest at Shiloh', body: `The high priest under whom Samuel grows up. Old, heavy, going blind. Misjudges Hannah's silent prayer as drunkenness; accepts her correction with grace. Raises Samuel from a small boy, receives the prophecy against his house from the boy without bitterness — it is the Lord, let him do what seems good to him. His sons Hophni and Phinehas are scoundrels. Both die when the ark is captured at Aphek. Eli falls back from his seat at the gate when the news reaches him, breaks his neck, and dies. He is ninety-eight.`, appears: [1, 2, 3, 4] },
        { id: 'samuel', tag: 'Prophet', tagClass: 'prophet', name: 'Samuel', epithet: 'Prophet, judge, and kingmaker', body: `Hannah's son, given to the Lord at Shiloh, raised under Eli. Called by name as a boy in chapter 3 — the Lord calls four times before Samuel understands what is happening; Eli tells him: say, speak Lord, your servant is listening. Recognized throughout Israel as a prophet from that point. Delivers Israel from the Philistines at Mizpah after the ark disaster. Anoints Saul, then David. His verdict on Saul in chapter 15 — to obey is better than sacrifice — is among the most-quoted lines in the Hebrew Bible. Dies before the end of the book; brought up from the dead at Endor for one final scene.`, appears: [1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 13, 15, 16, 19, 25, 28] },
      ],
    },
    {
      label: 'The first king and his court',
      characters: [
        { id: 'saul', tag: 'King', tagClass: 'king', name: 'Saul', epithet: 'First king of Israel', body: `Of the tribe of Benjamin, head and shoulders taller than any other Israelite. Sent out by his father Kish to find lost donkeys; found instead by Samuel, who anoints him. Chosen publicly by lot at Mizpah — but first he hides among the baggage. Delivers Jabesh-gilead from the Ammonites; acclaimed king at Gilgal. Then: the unauthorized sacrifice in chapter 13, the sparing of Agag in chapter 15. The spirit of the Lord departs from him; an evil spirit torments him. The rest of the book is his slow deterioration — paranoia, the pursuit of David through the wilderness, the consultation with the medium at Endor, death on Mount Gilboa.`, appears: [9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 26, 28, 31] },
        { id: 'jonathan', tag: 'Prince', tagClass: 'mortal', name: 'Jonathan', epithet: "Saul's heir — and David's covenant friend", body: `Saul's eldest son. Brave: in chapter 14 he and his armour-bearer climb a Philistine outpost alone and rout the garrison, triggering a larger Israelite victory. From the moment he meets David in chapter 18, the soul of Jonathan was bound to the soul of David. He gives David his robe, weapons, and a covenant. Defends David to Saul; warns him to flee; meets him secretly in the wilderness in chapter 23 to strengthen his hand and accept, without bitterness, that David will be king. Dies with his father and two brothers on Mount Gilboa.`, appears: [13, 14, 18, 19, 20, 23, 31] },
        { id: 'michal', tag: 'Princess', tagClass: 'mortal', name: 'Michal', epithet: "Saul's daughter, David's wife", body: `Saul's younger daughter, who loves David — the text says this explicitly, one of very few times in the Hebrew Bible that a woman's love for a man is stated directly. Saul gives her to David in marriage as a trap; she saves David's life in chapter 19 by helping him escape through a window and delaying Saul's messengers with an idol in the bed. Saul later gives her to another man, Paltiel, while David is in exile. She reappears in 2 Samuel.`, appears: [14, 18, 19, 25] },
        { id: 'abner', tag: 'Commander', tagClass: 'mortal', name: 'Abner', epithet: "Commander of Saul's army", body: `Saul's cousin and the commander of his forces. Present at Saul's table when David is at court and at the encampments during the wilderness pursuit. David publicly rebukes him in chapter 26 for failing to keep watch while Saul slept — his spear and water jug taken from his head without anyone waking. A figure of military competence and political loyalty to the house of Saul; his role becomes significant in 2 Samuel.`, appears: [14, 17, 26] },
      ],
    },
    {
      label: 'David and his circle',
      characters: [
        { id: 'david', tag: 'King', tagClass: 'king', name: 'David', epithet: 'Shepherd, harpist, giant-killer, king-in-waiting', body: `Youngest of eight sons of Jesse of Bethlehem. Secretly anointed by Samuel in chapter 16 while still keeping his father's sheep. Brought into Saul's court to play the harp and ease the king's moods. Kills Goliath in chapter 17 — the stone from the sling, the head taken with the giant's own sword. Marries Michal; befriends Jonathan; survives Saul's paranoia by living as an outlaw in the Judean wilderness. Twice spares Saul's life when he has him at his mercy. Spends time among the Philistines at Gath. Still in exile when the book ends.`, appears: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
        { id: 'goliath', tag: 'Champion', tagClass: 'creature', name: 'Goliath', epithet: 'Philistine champion of Gath', body: `Six cubits and a span tall — about nine feet. Coat of mail weighing five thousand shekels of bronze; spear head weighing six hundred shekels of iron; shield-bearer walking before him. Comes out morning and evening for forty days to challenge Israel to a single-combat duel. Killed in chapter 17 by the youngest son of a Bethlehem shepherd with a sling and a stone, then beheaded with his own sword. His name has been a metaphor for overwhelming odds in every language since.`, appears: [17] },
        { id: 'abigail', tag: 'Wise woman', tagClass: 'mortal', name: 'Abigail', epithet: 'Wife of Nabal — and then of David', body: `Introduced in chapter 25 as the wife of Nabal, a wealthy man of Maon who refuses David's men any of the provisions David had indirectly protected. Abigail intercepts David on his way to kill Nabal and all his household, with five loaves, two skins of wine, five dressed sheep, grain, raisins, and figs. Her speech of intercession is one of the most remarkable pieces of diplomacy in 1 Samuel. Nabal dies of shock ten days later. David immediately sends for her and marries her. She is described as intelligent and beautiful.`, appears: [25] },
      ],
    },
  ],

  chapters,
};

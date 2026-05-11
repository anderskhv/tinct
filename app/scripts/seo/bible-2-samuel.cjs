// 2 Samuel — SEO page data for build-seo-pages.cjs
// Hebrew historical narrative; the central panel of the David story.
// Voice: literary, declarative present. Take the text seriously as text.

const chapters = require('/tmp/bible-2-samuel-chunk-1.json')

module.exports = {
  id: 'bible-2-samuel',
  title: '2 Samuel',
  author: 'Anonymous (Deuteronomistic History)',
  byline: 'c. 6th c. BCE · Hebrew Bible · Former Prophets',
  titleAccent: 'a guided tour',
  hook: 'A king at the height of his powers stays home from a war, walks on a rooftop one evening, and sees a woman bathing. Everything in the second half of the book follows from that pause.',
  themesBlurb: 'Power, consequence, grief, the dynastic promise, and the realism of the prose.',
  castBlurb: 'David\'s court',
  castDesc: 'The household of a king who has everything and gives most of it away.',
  chapterLabel: n => '2 Samuel ' + n,
  genre: ['Historical narrative', 'Hebrew Bible', 'Ancient literature'],

  about: [
    `<em>2 Samuel</em> is the book in which David becomes king, takes Jerusalem, dances before the ark, sleeps with Bathsheba, has Uriah killed, and watches the consequences of that single evening on the rooftop work their way through the rest of his life. It is the most psychologically exact narrative in the Hebrew Bible — a portrait of a king at the height of his powers brought down, slowly, by what he chose to do one spring when the army was away.`,
    `The book opens with the elegy for Saul and Jonathan — <em>how are the mighty fallen</em> — and closes with a census and a plague and an altar on a threshing floor that will one day be the site of the temple. Between those two points are the consolidation of the kingdom, the dynastic promise in chapter 7, the Bathsheba affair in chapter 11, Nathan's parable of the ewe lamb in chapter 12, the rape of Tamar, the rebellion of Absalom, the flight from Jerusalem, the death in the oak, and David's collapse at the news. It has been read for two and a half thousand years as the founding charter of Israelite kingship and as one of the strangest royal portraits ever written. A 21st-century reader picks it up for the literary craft of the Court History, for the political education in how a regime consolidates and then begins to crack, and for the question the book refuses to settle: whether God's promise to David survives David's behaviour, or whether the promise is precisely what survives it.`,
  ],
  chaptersSubtitle: 'All 24 chapters, from the lament for Saul to the altar on the threshing floor.',
  chaptersLead: `<p>2 Samuel divides into three movements. Chapters 1–10 are the consolidation: the elegy, the civil war with the house of Saul, the taking of Jerusalem, the ark's procession, Nathan's oracle. Chapters 11–20 are the unwinding: Bathsheba, Uriah, Nathan's confrontation, the death of the child, Amnon, Tamar, Absalom, the rebellion, the death in the oak, Joab's rebuke, the return. Chapters 21–24 are the appendices — famine, plague, a roll call of the mighty men. Twenty-four chapters, two halves, one pivot in chapter 11.</p>`,
  themesByline: 'Five threads through the book',
  themesLead: `2 Samuel is built around a single consequential decision. Chapter 7 gives David the dynastic promise. Chapter 11 shows what David does in the year of his greatest security. The rest of the book is the moral logic of those two facts working themselves out. The themes below are the threads that hold the logic together.`,

  groups: [
    { label: 'David in Hebron · chs 1–4', subtitle: 'The civil war with the house of Saul; Abner and Ish-bosheth.', chapters: [1, 2, 3, 4] },
    { label: 'Davidic covenant · chs 5–10', subtitle: 'Jerusalem taken, the ark brought up, Nathan\'s oracle, wars on every front.', chapters: [5, 6, 7, 8, 9, 10] },
    { label: 'Bathsheba and Absalom · chs 11–20', subtitle: 'The sin, the parable, the consequences, the rebellion, the death, the return.', chapters: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    { label: 'Appendices · chs 21–24', subtitle: 'Famine, plague, the mighty men, a psalm, the threshing floor.', chapters: [21, 22, 23, 24] },
  ],

  themes: [
    {
      slug: 'the-bathsheba-afternoon',
      title: 'The Bathsheba afternoon — and what it commits the book to argue',
      greek: '"But David tarried still at Jerusalem"',
      preview: 'Chapter 11 opens with one of the most quietly damning sentences in ancient literature. The king who has fought his way up from a shepherd\'s field is the king who is, this season, not at the front. From the roof he sees a woman washing herself, and the second half of the book begins.',
      essay: [
        `Chapter 11 opens with a sentence the reader needs to sit with. <em>And it came to pass, in the time when kings go forth to battle, that David sent Joab, and his servants with him, and all Israel; and they destroyed the children of Ammon, and besieged Rabbah. But David tarried still at Jerusalem.</em> Everything that follows is contained in that pause. The verbs then accelerate: he sees, he sends, he inquires, he sends again, he takes, he lies with her, he sends her back. Bathsheba is the grammatical object throughout. When the news comes that she is pregnant, the king's first move is concealment.`,
        `He sends for Uriah the Hittite, her husband, from the front. He tries to manoeuvre him into sleeping with her so the child can be assigned to him. Uriah, whom the narrative goes out of its way to portray as honourable, refuses to sleep at home while the army is in the field. <em>Shall I then go into mine house, to eat and to drink, and to lie with my wife? As thou livest, and as thy soul liveth, I will not do this thing.</em> David gets him drunk. Uriah still sleeps at the door of the king's house with the servants. The cover-up has failed, and the king moves to the next plan: the letter Uriah carries back to Joab, which contains the order that the bearer be placed in the front of the hardest fighting and abandoned.`,
        `The chapter ends with the report from the front. The king receives it without flinching and tells the messenger to encourage Joab — <em>let not this thing displease thee, for the sword devoureth one as well as another.</em> The narrator allows himself a single editorial sentence at the close: <em>But the thing that David had done displeased the Lord.</em> The whole second half of the book is the unfolding of that displeasure.`,
        `What 2 Samuel commits itself to argue, from chapter 12 forward, is that the king is not above the moral order; that the consequences of a private sin in the royal household will run, with the patience of a slow tide, through the next ten years; and that the same God who has promised David an everlasting house has also bound the king, in the same breath, to the same law as everyone else. The book does not resolve the tension between the unconditional promise of chapter 7 and the conditional demands of the moral law. It holds both facts in the same hand and refuses to release either.`,
      ],
      where: [
        { n: 11, label: '2 Samuel 11 (David and Bathsheba)' },
        { n: 12, label: '2 Samuel 12 (Nathan\'s confrontation)' },
        { n: 13, label: '2 Samuel 13 (Amnon and Tamar)' },
        { n: 18, label: '2 Samuel 18 (Absalom\'s death)' },
      ],
    },
    {
      slug: 'nathans-parable',
      title: 'Nathan\'s parable — the prophetic confrontation',
      greek: '"Thou art the man"',
      preview: 'Chapter 12 contains one of the most famous moments in the Hebrew Bible. The prophet Nathan comes to David and tells him a story. A rich man had many flocks; a poor man had one little ewe lamb. The reversal is one of the cleanest in any literature.',
      essay: [
        `The prophet Nathan comes to David — sent, the narrative says plainly, by the Lord — and tells him a story. There were two men in one city, the one rich and the other poor. The rich man had exceeding many flocks and herds. The poor man had nothing save one little ewe lamb, which he had bought and nourished up, and it grew up together with him and with his children, ate of his own meat and drank of his own cup and lay in his bosom and was unto him as a daughter. A traveller came to the rich man, and the rich man, unwilling to take from his own flock, took the poor man's lamb and dressed it for the man that was come to him.`,
        `David's anger, the text says, was greatly kindled, and he said: <em>As the Lord liveth, the man that hath done this thing shall surely die, and he shall restore the lamb fourfold.</em> Nathan answers in three syllables: <em>Thou art the man.</em> The reversal is one of the cleanest in any literature. The king has condemned himself. The parable has worked because the king was free to deliver justice on someone else's case while remaining blind to his own; once the case was named as his, the verdict was already in his mouth.`,
        `Nathan delivers the divine sentence — the sword shall not depart from David's house, the trouble shall come up against him out of his own house, what he did in secret shall be done to him in public — and David, with what is either the most economical confession in religious literature or the great unresolved sentence of his life, says: <em>I have sinned against the Lord.</em> Nathan answers, just as economically, that the Lord has put away his sin and he shall not die. But the child will.`,
        `The chapter is a prose argument about how power is brought back under judgment. It does not work by external punishment. It works by getting the powerful man to pronounce sentence on himself before he knows what he is doing. The mechanism Nathan uses is the same one prophets use throughout the Hebrew Bible: a story, told carefully, that strips the listener of his defences before he can refuse them. The parable form is what this chapter gives to the literary tradition.`,
      ],
      where: [
        { n: 12, label: '2 Samuel 12 (Nathan\'s parable)' },
        { n: 14, label: '2 Samuel 14 (the woman of Tekoa)' },
        { n: 7, label: '2 Samuel 7 (Nathan\'s oracle)' },
      ],
    },
    {
      slug: 'absalom-and-the-long-shadow',
      title: 'Absalom — and the long shadow',
      greek: '"O my son Absalom, my son, my son Absalom!"',
      preview: 'Nathan\'s sentence — that the sword shall not depart from David\'s house — is fulfilled not in a single event but over the next ten years, in a sequence of family catastrophes that the book traces with terrible patience.',
      essay: [
        `The first catastrophe is in chapter 13. David's son Amnon falls obsessively in love with his half-sister Tamar, lures her into his chamber, rapes her, and then — in the brutal phrase the narrative gives — hates her with great hatred so that the hatred wherewith he hated her was greater than the love wherewith he had loved her. He throws her out. David, the text says simply, was very wroth, but does nothing. Two years later Absalom invites Amnon to a sheep-shearing feast and has his servants kill him at the table. Absalom flees. David mourns Amnon, then begins to long for Absalom, and Joab arranges his return — but not his full reconciliation.`,
        `Absalom uses the years of his rehabilitation to build a faction. He sits at the gate, intercepts anyone who has a suit before the king, and suggests that if only he were judge the matter would go better. <em>So Absalom stole the hearts of the men of Israel.</em> In chapter 15 he has himself proclaimed king at Hebron, and David flees Jerusalem barefoot, his head covered, going up the Mount of Olives weeping. The civil war that follows is the lowest point of David's life. He refuses to fight against Absalom personally, gives orders that the young man be dealt with gently, and learns, while waiting in the gate at Mahanaim, that Absalom has been caught by his hair in the branches of a great oak and run through by Joab against orders.`,
        `David's lament — <em>O my son Absalom, my son, my son Absalom! Would God I had died for thee, O Absalom, my son, my son!</em> — is the book's emotional climax. Joab's response, when he comes in to the king and sees that the army has shrunk back into the city in shame at having beaten the enemy, is the realist counterweight: get up and speak comfortably to the men, or there will not tarry one with thee tonight. David rises, sits in the gate, and the political life of the kingdom resumes.`,
        `But the book has done something the reader cannot undo. It has shown what a sin in chapter 11 produces by chapter 18. It has insisted, with the patience of someone who has watched this happen in his own time, that the moral universe is structured in such a way that the consequences cannot be paid off in private and must, finally, be paid in public — and not by the perpetrator alone.`,
      ],
      where: [
        { n: 13, label: '2 Samuel 13 (Amnon and Tamar)' },
        { n: 15, label: '2 Samuel 15 (Absalom\'s revolt)' },
        { n: 18, label: '2 Samuel 18 (the death in the oak)' },
        { n: 19, label: '2 Samuel 19 (Joab\'s rebuke)' },
      ],
    },
    {
      slug: 'the-dynastic-promise',
      title: 'The dynastic promise — and what survives David',
      greek: '"I will be his father, and he shall be my son"',
      preview: 'Chapter 7 contains the other pivot of the book, and the one that has shaped Western religious imagination more than any single passage outside the Pentateuch. God refuses to let David build a temple — and promises to build David a house instead.',
      essay: [
        `David is settled in his cedar-panelled house in Jerusalem and observes to Nathan that he, the king, is dwelling in cedar while the ark of God dwells within curtains. He proposes to build a temple. Nathan tells him, on the evening of the same day, to do as he wishes — and that night the word of the Lord comes to Nathan and reverses the answer. You shall not build me a house; I will build you a house. The wordplay turns on the double meaning of the Hebrew <em>bayit</em> — house in the architectural sense, household and dynasty in the social sense.`,
        `The promise is unconditional in the prose of chapter 7. Solomon will build the temple. But David's house, his line, his dynasty, will be established by God himself. <em>I will be his father, and he shall be my son.</em> The throne of his kingdom will be established forever. This is the textual seed of every later messianic hope: the expectation, in the late prophetic books, of a restored Davidic king; the New Testament's careful insistence that Jesus is of the house and lineage of David; the rabbinic tradition of the Davidic messiah.`,
        `What 2 Samuel forces the reader to think about, by placing this promise in chapter 7 and the Bathsheba afternoon in chapter 11, is the relation between the promise and the man. The man fails. The promise does not fail. By the end of the book the dynasty is intact, the king is back in Jerusalem, and the line that will run forward into Solomon and the divided kingdom and exile and eventually into the messianic expectations of two religions has been established.`,
        `Whatever the book is doing theologically, it is at least committing itself to the proposition that what God promises is not contingent on the perfection of the one who receives the promise. This is the seed of grace as a theological concept and the seed of the long argument, in both Judaism and Christianity, about how a faithful God deals with an unfaithful people.`,
      ],
      where: [
        { n: 7, label: '2 Samuel 7 (Nathan\'s oracle)' },
        { n: 12, label: '2 Samuel 12 (Nathan\'s confrontation)' },
        { n: 22, label: '2 Samuel 22 (David\'s psalm)' },
        { n: 23, label: '2 Samuel 23 (David\'s last words)' },
      ],
    },
    {
      slug: 'the-realism-of-the-prose',
      title: 'The realism of the prose',
      greek: '"But the thing that David had done displeased the Lord"',
      preview: 'The Court History of David is one of the earliest sustained works of historical prose anywhere. What is remarkable about it, by the standards of any ancient royal narrative, is its freedom from propaganda.',
      essay: [
        `The Court History of David — the long narrative running from roughly chapter 9 of 2 Samuel through 1 Kings 2 — was almost certainly written within a generation or two of the events it describes, by someone with intimate access to the court. What is remarkable about it, by the standards of any ancient royal narrative, is its freedom from propaganda. The Egyptian and Mesopotamian royal inscriptions of the same period are concerned almost exclusively with the king's piety, military success, and divine favour. The Court History has its kings sin, scheme, weep, fail to discipline their sons, lose battles to their own children, and die in bed asking that their old enemies be eliminated as a final favour.`,
        `It contains observations no royal apologist would write — that David's army shrank back into Mahanaim ashamed of its victory because the king was weeping for the dead rebel, that Joab had to scold his sovereign into resuming the duties of office, that the old David at the end of his life had to be warmed with a young virgin from Shunem because the cold was killing him. The narrative never editorialises except in the briefest, almost throwaway sentences: <em>But the thing that David had done displeased the Lord.</em>`,
        `The prose is also extraordinarily compressed. Verbs do most of the work. Interior life is rarely named directly, but is shown through the timing of an action — <em>David tarried still at Jerusalem; David rose from his bed at evening tide.</em> Speeches are short, exact, and revealing. Joab's dressing-down of David in chapter 19 takes about ten verses and has the entire shape of a political relationship in it.`,
        `For a 21st-century reader of fiction, the technique looks almost modern. Robert Alter has argued that the Court History invents resources of psychological realism that European prose did not really recover until the eighteenth century. Whether or not the genealogy is exactly that, what one can say without controversy is that no other portrait of a king from the ancient world is as honest about its subject as this one — and that the honesty is part of what has kept the book alive for two and a half thousand years.`,
      ],
      where: [
        { n: 1, label: '2 Samuel 1 (the elegy)' },
        { n: 11, label: '2 Samuel 11 (David stays home)' },
        { n: 19, label: '2 Samuel 19 (Joab\'s rebuke)' },
        { n: 23, label: '2 Samuel 23 (David\'s last words)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'David', role: 'King of Israel', body: `The book's subject. Anointed at Hebron after Saul's death, then king of all Israel after the long civil war with the house of Saul. Takes Jerusalem from the Jebusites, brings up the ark with dancing, receives the dynastic promise from Nathan in chapter 7, wins every war he fights. Then, in the spring when kings go out to battle, stays home and sees Bathsheba bathing. The Bathsheba affair, the killing of Uriah, Nathan's confrontation, the death of the child, and the long unwinding through Amnon, Tamar, and Absalom occupy the rest of the book. The strangest royal portrait in ancient literature: a man whose flaws the text refuses to hide and whose election it refuses to take back.` },
    { name: 'Nathan', role: 'Prophet', body: `The court prophet of David's reign, not a wilderness figure but a member of the royal entourage with access to the king. He delivers the dynastic promise in chapter 7 and the parable of the ewe lamb in chapter 12 — the two pivots of the book. Nathan's three Hebrew syllables of indictment, <em>thou art the man</em>, have echoed through every later literature in which an outsider holds a mirror up to a powerful man and refuses to lower it.` },
    { name: 'Bathsheba', role: 'Wife of Uriah, then of David', body: `First introduced in chapter 11 as the woman David sees from the roof. The Hebrew gives her almost no interior life in the chapter that bears her body — she appears, conceives, mourns Uriah, marries the king, bears the child that dies. The narrative will not let the reader settle the question of her agency; the verbs are all David's. She bears David four sons, of whom Solomon is the second to survive. In 1 Kings she will speak, decisively, to secure Solomon's succession.` },
    { name: 'Absalom', role: 'David\'s son, rebel', body: `David's third son, famous for his beauty and his hair. Avenges the rape of his sister Tamar by having her brother Amnon killed. Flees, returns, spends four years building a faction, has himself proclaimed king at Hebron, drives David from Jerusalem, pursues David's army across the Jordan. Dies caught by his hair in the branches of a great oak in the wood of Ephraim, run through by Joab against the king's orders. David's cry — <em>O my son Absalom</em> — is the book's emotional climax.` },
    { name: 'Joab', role: 'General', body: `David's nephew, commander of his army from the early Hebron years to the end. Brutally effective, politically ruthless, and at least twice the man who does what David is too divided to do himself. He kills Abner, carries out the order to expose Uriah at the wall, kills Absalom in the oak when David has commanded that the young man be dealt with gently, and scolds the king back into the gate at Mahanaim when grief is destroying the army's morale. The book's great study of the realist who serves a king who is not, finally, willing to do what realism requires.` },
    { name: 'Uriah the Hittite', role: 'Soldier, Bathsheba\'s husband', body: `One of David's mighty men, listed by name in the roll call at the end of the book. A Hittite who has thrown in his lot with Israel and with David's God. The narrator goes out of his way in chapter 11 to make him honourable. Summoned home from the front by a king trying to hide a pregnancy, Uriah refuses to sleep with his wife while the ark and the army are in the field. He carries, unknowing, the letter that orders his death. His shadow in the book is longer than the chapter that contains him.` },
  ],

  castSubtitle: 'David\'s court — the household of a king who has everything and gives most of it away.',
  castLead: `<p>2 Samuel has a relatively contained cast built around David's family and his military entourage. The central figures are David himself, his prophet Nathan, his general Joab, his wife Bathsheba, and his son Absalom. Almost every named figure in the cast is there because of their relationship to David — either serving his power or suffering its consequences.</p>`,
  castGroups: [
    {
      label: 'The king and his prophet',
      characters: [
        {
          id: 'david',
          tag: 'King',
          tagClass: 'king',
          name: 'David',
          epithet: 'King of all Israel',
          body: `Anointed at Hebron in chapter 2, then king of all Israel in chapter 5. Takes Jerusalem from the Jebusites and makes it his capital. Brings the ark up with dancing and is mocked by his wife Michal for it. Receives the unconditional dynastic promise from Nathan in chapter 7. Wins every war he fights. Then, in chapter 11, stays home from the Ammonite campaign, sees Bathsheba from the roof, and sets the second half of the book in motion. Mourns the child that dies. Mourns Amnon. Mourns Absalom, who has driven him from his throne and is pursuing him across the Jordan. Returns to Jerusalem after Joab's rebuke. Closes the book with a plague, a psalm, and the purchase of a threshing floor that will become the site of the temple. The most fully realised individual in the Hebrew Bible — at the height of his power and in the depths of his failure, consistently and without flattery.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
        },
        {
          id: 'nathan',
          tag: 'Prophet',
          tagClass: 'prophet',
          name: 'Nathan',
          epithet: 'Court prophet',
          body: `The court prophet of David's reign — not a wilderness figure but a man with direct access to the king. He delivers the dynastic promise in chapter 7, immediately after telling David he can build the temple: God reverses Nathan's own initial answer in the same night. He returns in chapter 12 with the parable of the ewe lamb and the three-syllable indictment that has echoed through every later literature. He appears again at the end of David's life in 1 Kings to engineer Solomon's succession against Adonijah's bid. Throughout, he is the figure who proves that the prophetic office in Israel is not subordinate to the throne.`,
          appears: [7, 12, 24],
        },
      ],
    },
    {
      label: 'The general and the soldiers',
      characters: [
        {
          id: 'joab',
          tag: 'General',
          name: 'Joab',
          epithet: 'David\'s nephew, commander of the army',
          body: `Son of David's sister Zeruiah, commander of the army from the early Hebron years to the end. He kills Abner, David's rival's general, in revenge for his brother Asahel — over the king's objections. He carries out the military order that exposes Uriah to death at the wall. He kills Absalom in the oak at the wood of Ephraim against David's explicit command. He drags the king back into the gate at Mahanaim with a speech of devastating political clarity: you are shaming the army that saved you; get up and speak to them or they will all be gone tonight. He is the book's great study of the man of action serving a man of feeling, and the text is scrupulously honest about what such service costs both of them.`,
          appears: [2, 3, 5, 8, 10, 11, 12, 14, 17, 18, 19, 20, 23, 24],
        },
        {
          id: 'uriah',
          tag: 'Soldier',
          name: 'Uriah the Hittite',
          epithet: 'Bathsheba\'s husband, one of David\'s mighty men',
          body: `A Hittite — a foreigner who has joined David's army and David's God. Listed by name in the roll call of the mighty men at the end of the book. Summoned home from the front by the king, he refuses to sleep at home while the ark and the army are in the field: <em>As thou livest, and as thy soul liveth, I will not do this thing.</em> The line is one of the most uncomfortable in the book; it shows the soldier behaving by the code David himself would have honoured a few years earlier. He carries, unknowing, the letter that orders his death. He is killed at the wall of Rabbah. His shadow in the book is longer than the chapter that contains him.`,
          appears: [11, 23],
        },
      ],
    },
    {
      label: 'The women of the court',
      characters: [
        {
          id: 'bathsheba',
          tag: 'Queen',
          name: 'Bathsheba',
          epithet: 'Wife of Uriah, then of David',
          body: `Introduced in chapter 11 as the woman David sees from the roof. The Hebrew gives her almost no interior life in the chapter that bears her body — she appears, conceives, sends word to the king, mourns Uriah, is gathered into David's house, and bears a son who dies. The narrative will not let the reader settle the question of her consent; the verbs are all David's, and the gap is part of what the chapter forces the reader to feel. She reappears in 1 Kings to secure Solomon's succession. Her name appears in the genealogy that opens the New Testament, where Matthew calls her not Bathsheba but <em>her that had been the wife of Urias</em> — as if the gospel writer too could not let the name stand without the wound attached.`,
          appears: [11, 12],
        },
        {
          id: 'tamar',
          tag: 'Princess',
          name: 'Tamar',
          epithet: 'David\'s daughter, Absalom\'s sister',
          body: `David's daughter by Maacah, full sister of Absalom and half-sister of Amnon. The subject of chapter 13's opening catastrophe. Amnon lures her into his chamber under pretext of illness, rapes her, and then — in the phrase the narrator gives without softening — hates her with a hatred greater than his love. He throws her out. She goes to live as a desolate woman in Absalom's house. David hears and does nothing. Her desolation is the seed of Absalom's revenge and the first outworking of Nathan's sentence that the sword shall not depart from David's house.`,
          appears: [13],
        },
      ],
    },
    {
      label: 'The sons',
      characters: [
        {
          id: 'absalom',
          tag: 'Prince',
          name: 'Absalom',
          epithet: 'David\'s son, rebel',
          body: `David's third son, by Maacah daughter of the king of Geshur. Beautiful in a way the narrative pauses to describe — from the sole of his foot to the crown of his head there was no blemish in him — and famous for his hair, which he weighed annually. Avenges the rape of his sister Tamar by having Amnon killed at a sheep-shearing feast. Flees to Geshur for three years, is brought back to Jerusalem by Joab's stratagem, reconciled formally to the king in chapter 14, and spends four years building a political faction. Proclaimed king at Hebron; drives David from Jerusalem barefoot and weeping; sleeps with David's concubines on the roof in deliberate public humiliation; pursues David's army across the Jordan. Caught by his hair in the branches of a great oak in the wood of Ephraim and run through by Joab against the king's orders. David's lament for him — <em>O my son Absalom, my son, my son Absalom!</em> — is the book's emotional climax.`,
          appears: [13, 14, 15, 16, 17, 18],
        },
        {
          id: 'amnon',
          tag: 'Prince',
          name: 'Amnon',
          epithet: 'David\'s firstborn son',
          body: `David's eldest son, by Ahinoam of Jezreel. Falls obsessively in love with his half-sister Tamar, engineers her into his chamber with a false sickness, rapes her, and then hates her with a hatred greater than his love and throws her out. David is furious but does nothing — possibly because Amnon is his firstborn and beloved. Two years later Absalom has him killed at a sheep-shearing feast. His death is the first outworking of Nathan's sentence and the hinge on which Absalom's story turns.`,
          appears: [13],
        },
      ],
    },
  ],

  chapters,
}

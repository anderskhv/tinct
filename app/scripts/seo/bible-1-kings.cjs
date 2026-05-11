// SEO content data for the First Book of Kings.
// Hebrew historical narrative; Solomon's reign, the divided kingdom, the Elijah cycle.
// Voice: literary, declarative present.

const chapters = require('/tmp/bible-1-kings-chunk-1.json');

module.exports = {
  id: 'bible-1-kings',
  title: '1 Kings',
  author: 'Anonymous (Deuteronomistic History)',
  byline: 'c. 6th c. BCE · Hebrew Bible · Former Prophets',
  titleAccent: 'a guided tour',
  hook: 'A dying king is cold, a beautiful girl is brought to warm him, and while David lies in bed his sons are already fighting over the throne. The book that begins with a deathbed succession ends with Elijah hearing God in a sound of thin silence.',
  genre: ['Scripture', 'Historical narrative', 'Hebrew Bible'],

  about: [
    `<em>1 Kings</em> continues the Deuteronomistic History — the long narrative arc from Joshua through 2 Kings, compiled in something close to its present form during the Babylonian exile. It covers roughly a century and a half: the final days of David, the reign of Solomon, the catastrophic schism that divides the kingdom into Israel and Judah the day after Solomon is buried, and the prophetic career of Elijah in the court of Ahab and Jezebel.`,
    `The book divides cleanly into three movements. Chapters 1–11 are Solomon's reign — the wisest king in the world, builder of the temple, author of three thousand proverbs, and the man whose seven hundred wives turn his heart to foreign gods before he dies. Chapters 12–16 are the schism and the rapid succession of kings in the divided kingdoms, narrated in a tight evaluative formula. Chapters 17–22 are the Elijah cycle, one of the most influential prophetic narratives in the Hebrew Bible.`,
  ],

  chaptersSubtitle: "All 22 chapters — from David's deathbed and Solomon's anointing to Ahab's death at Ramoth-gilead.",
  chaptersLead: `<p>1 Kings divides into three movements. Solomon (chapters 1–11): the succession, the dream at Gibeon, the temple, the Queen of Sheba, and the slow accounting of what the wisdom cost. The divided kingdom (chapters 12–16): the schism, the evaluative formula, the rapid succession of northern kings. The Elijah cycle (chapters 17–22): the drought, Mount Carmel, the still small voice at Horeb, the vineyard of Naboth, and Ahab's death in battle.</p>`,

  themesByline: 'Five threads through the book',
  themesLead: `1 Kings is three books in one binding — a court history, a regnal chronicle, and a prophetic narrative — and its themes run differently through each section. What unifies them is the Deuteronomistic question underneath: did the king keep the covenant? The answer, almost always, is no.`,

  themesBlurb: 'Wisdom and its cost, the schism formula, Elijah on Carmel, the still small voice, the vineyard of Naboth.',
  castBlurb: 'Jerusalem, Samaria, the wilderness',
  castDesc: 'A unified kingdom, then a divided one, then a prophetic challenge to both.',
  castSubtitle: 'Jerusalem, Samaria, and the wilderness — a kingdom that split and a prophet who survived it.',

  chapterLabel: n => '1 Kings ' + n,

  groups: [
    {
      label: 'Solomon · ch 1–11',
      subtitle: 'The wisest king in the world builds the temple, takes seven hundred wives, and dies leaving a kingdom about to split.',
      chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    },
    {
      label: 'The divided kingdom · ch 12–16',
      subtitle: "Rehoboam's folly, the northern secession, and the rapid succession of kings evaluated by a single formula.",
      chapters: [12, 13, 14, 15, 16],
    },
    {
      label: 'The Elijah cycle · ch 17–22',
      subtitle: "A prophet out of nowhere announces a drought, calls down fire on Carmel, hears God in thin silence, and walks into a king's vineyard with an indictment.",
      chapters: [17, 18, 19, 20, 21, 22],
    },
  ],

  themes: [
    {
      slug: 'solomons-wisdom-and-the-cost-of-the-temple',
      title: "Solomon's wisdom and the cost of the temple",
      preview: "The Solomon of chapters 3 to 10 is the wisest king in the world. He asks for an understanding heart at Gibeon and is given that and everything else he did not ask for. By chapter 11 the foreign wives have turned his heart, and the prophet Ahijah tears a new cloak into twelve pieces.",
      essay: [
        `The Solomon of chapters 3 to 10 is the wisest king in the world. He asks for an understanding heart at Gibeon and is given that and everything else he did not ask for. He judges between the two prostitutes by proposing to cut the living child in half, and the narrative invites the reader, with the watching court, to recognise the move as theatre that elicits the truth. The Queen of Sheba comes to test him with hard questions and goes home stunned. He speaks three thousand proverbs and writes a thousand and five songs. He knows trees from the cedar of Lebanon to the hyssop on the wall, and beasts and fowl and creeping things and fish.`,
        `The picture is of a polymath sovereign at the height of intellectual prestige, ruling from Jerusalem at the centre of an empire that runs from the Euphrates to the border of Egypt. And then the same chapters slowly accumulate a counter-narrative the reader is expected to notice. The temple is built, but the labour is conscripted — thirty thousand men sent to Lebanon in shifts of ten thousand a month, seventy thousand bearers, eighty thousand stonecutters in the hills. The book of Deuteronomy, on which the Deuteronomistic History is theologically based, had given specific warnings against a king who multiplied horses, multiplied wives, multiplied silver and gold to himself. Solomon does each of these things in scale.`,
        `The narrative takes its time before drawing the conclusion. Chapter 11 finally states it: 'his wives turned away his heart after other gods,' and the high places of Chemosh and Milcom and Ashtoreth are built on the mount facing Jerusalem. The prophet Ahijah meets Jeroboam outside the city and tears the new cloak into twelve pieces. Solomon's wisdom did not save him. The temple, the prayer at the dedication, the visit of the Queen of Sheba — none of it saved him. The book is making a careful argument, not against wisdom, but against the assumption that wisdom is sufficient.`,
        `The same book that gives us the wisest king in the world gives us the schism that begins the day after his funeral. What 1 Kings has the courage to do is hold both pictures together and refuse to choose between them. Solomon is the wisest and the most catastrophically failed. The temple is the greatest human achievement in the narrative and the thing whose construction cost the seeds of the division. The book does not resolve the contradiction. It just shows you both sides and lets the irony do its work.`,
      ],
      where: [
        { n: 3, label: '1 Kings 3 (the dream at Gibeon)' },
        { n: 8, label: '1 Kings 8 (the dedicatory prayer)' },
        { n: 10, label: '1 Kings 10 (the Queen of Sheba)' },
        { n: 11, label: '1 Kings 11 (the foreign wives; the schism foretold)' },
      ],
    },
    {
      slug: 'the-schism-and-the-formula',
      title: 'The schism and the formula',
      preview: "When the northern tribes secede under Jeroboam in chapter 12, the narrative gear changes. From this point the historian works in a tightly disciplined formula, evaluating each king by a single criterion and compressing two centuries of history into a sequence of brief, almost identical paragraphs.",
      essay: [
        `When the northern tribes secede under Jeroboam in chapter 12, the narrative gear changes. From this point through the end of 2 Kings the historian works in a tightly disciplined formula. Each king is introduced by name, with his accession year synchronised to the reign of the king of the other kingdom; his capital and the length of his reign are given; his mother is named for the kings of Judah; and a single evaluative sentence is delivered. He did that which was right in the sight of the Lord. He did evil in the sight of the Lord, and walked in the way of his father.`,
        `The formula is unyielding and it is a literary form in its own right. It compresses two centuries of history into a sequence of brief, almost identical paragraphs, broken occasionally by an extended episode when something theologically interesting happens — a war, a reform, a prophet, a foreign treaty. The cumulative effect is the slow, unsentimental documentation of a downward slope. Most northern kings are judged failures. Most southern kings are judged compromises — right in their hearts, perhaps, but the high places of local worship persist.`,
        `The historian is not interested in the kings as personalities; he is interested in them as test cases for a single thesis: whether a king kept the covenant, by which the historian means whether he walked in the law of the Lord and refused the worship of other gods. The formula is the historical engine of the Deuteronomistic vision: history is the long unfolding of the consequence of obedience and disobedience to the covenant, and the kings of Israel and Judah are the figures by whom the verdict is read.`,
        `By 1 Kings the formula is in place. 2 Kings will run it through to the destruction of Samaria in 722 BCE and the burning of Jerusalem in 586 BCE. Reading it in 1 Kings, the reader feels the rhythm beginning — the alternation of kingdoms, the synchronised years, the evaluative sentence — and understands that the historian is not telling adventure stories but running an argument. The argument will take another book to finish.`,
      ],
      where: [
        { n: 12, label: "1 Kings 12 (the schism; Jeroboam's golden calves)" },
        { n: 15, label: '1 Kings 15 (the formula at full speed: Abijam, Asa, Nadab, Baasha)' },
        { n: 16, label: '1 Kings 16 (four northern kings in one chapter)' },
        { n: 22, label: "1 Kings 22 (Ahab's death; the formula closes his reign)" },
      ],
    },
    {
      slug: 'elijah-on-carmel',
      title: 'Elijah on Carmel',
      preview: "Chapter 17 introduces Elijah the Tishbite without preamble — no genealogy, no court of origin. He simply appears in Ahab's throne room and announces a drought. Two chapters later he stands alone on Carmel against four hundred and fifty prophets of Baal and calls down fire.",
      essay: [
        `Chapter 17 introduces Elijah the Tishbite without preamble. The reader is given no genealogy, no court of origin, no ordination. He simply appears in the throne room of Ahab — the king who has married the Sidonian princess Jezebel and built a temple to Baal in Samaria — and announces that there will be neither dew nor rain except by his word. Then he disappears into the wilderness, fed by ravens, then by a widow at Zarephath in Sidonian territory whose oil and meal do not run out and whose son he raises from the dead.`,
        `After three years of drought he comes back. The confrontation with Ahab is wary and personal — 'art thou he that troubleth Israel?' 'I have not troubled Israel; thou hast' — and Elijah proposes the trial that gives the book its most theatrical scene. He summons all Israel to Mount Carmel, with the four hundred and fifty prophets of Baal and the four hundred prophets of Asherah. Two bullocks are prepared; no fire is set under either. Whichever god answers by fire, that one is God.`,
        `The Baal prophets cry out from morning to noon and Elijah mocks them: cry aloud, for he is a god — peradventure he sleepeth, and must be awaked. They cut themselves with knives and lancets till the blood gushes out; nothing answers. Elijah builds his altar with twelve stones, lays the wood, slaughters the bullock, and pours so much water over the offering that it fills the trench around the altar. Then he prays a prayer that takes about three sentences and the fire of the Lord falls and consumes the burnt sacrifice and the wood and the stones and the dust and licks up the water in the trench. The people fall on their faces. Elijah seizes the prophets of Baal and slaughters them at the brook Kishon. Then the rain comes.`,
        `The chapter is the high point of prophetic theatre in the Hebrew Bible — a single figure, in a hairy mantle, standing alone against a state-sponsored religion at the height of its political power, and winning. What it says about the prophetic office is what the rest of the Elijah cycle will refine: that the prophet does not work for the king; that the prophet does not need the apparatus of the state; that when the king and the official religion have abandoned the covenant, the covenant continues to make demands, and the demands will be voiced.`,
      ],
      where: [
        { n: 17, label: '1 Kings 17 (Elijah appears; the drought; Zarephath)' },
        { n: 18, label: '1 Kings 18 (Mount Carmel; the fire; the rain)' },
        { n: 21, label: '1 Kings 21 (the vineyard; the second confrontation with Ahab)' },
        { n: 22, label: "1 Kings 22 (Ahab's last battle; Elijah's prophecy fulfilled)" },
      ],
    },
    {
      slug: 'the-still-small-voice',
      title: 'The still small voice',
      preview: "Immediately after Carmel, Jezebel sends a death threat and Elijah runs. He sits under a juniper tree and asks to die. He travels forty days to Horeb. There he hears God not in wind, not in earthquake, not in fire — but in a sound of thin silence.",
      essay: [
        `Chapter 19 is the chapter that has saved the Elijah cycle from being read only as triumph. Immediately after Carmel, Jezebel sends a message: by this time tomorrow, your life shall be as the life of one of those prophets you slaughtered. Elijah, who stood alone against four hundred and fifty prophets the previous afternoon, runs. He goes a day's journey into the wilderness, sits down under a juniper tree, and asks to die. 'It is enough; now, O Lord, take away my life, for I am not better than my fathers.' He sleeps. An angel wakes him and feeds him. He sleeps again.`,
        `The angel wakes him a second time and he travels — the text says with a deliberate echo of the Mosaic forty — forty days and forty nights to Horeb the mount of God, the mountain where Moses received the law. He goes into a cave and lodges there. The word of the Lord asks him what he is doing there. Elijah answers with the speech of a man at the end of his strength: 'I have been very jealous for the Lord God of hosts; the children of Israel have forsaken thy covenant, thrown down thine altars, and slain thy prophets with the sword; and I, even I only, am left, and they seek my life, to take it away.'`,
        `He is told to stand on the mount before the Lord, and the Lord passes by. A great and strong wind rends the mountains and breaks the rocks, but the Lord is not in the wind. After the wind, an earthquake; the Lord is not in the earthquake. After the earthquake, a fire; the Lord is not in the fire. And after the fire, a still small voice. The Hebrew is qol demamah daqqah — a sound of thin silence, the most untranslatable phrase in the chapter. Elijah wraps his face in his mantle and goes out to stand at the entrance of the cave.`,
        `The voice asks him again what he is doing there. He gives the same speech, word for word. He is told to go back, anoint Hazael over Syria, and Jehu over Israel, and Elisha to take his own place; and that there are seven thousand in Israel who have not bowed the knee to Baal. The chapter is the great Hebrew Bible meditation on the prophet's exhaustion and on the form in which God meets him afterwards. Not in the spectacular phenomena that match the prophet's mood. In something quieter, after the storm has passed. The phrase has carried for two and a half thousand years, and what carries with it is the doctrine that what is decisive is not always loud.`,
      ],
      where: [
        { n: 19, label: "1 Kings 19 (Horeb; the still small voice; Elisha's call)" },
        { n: 17, label: "1 Kings 17 (the widow of Zarephath; Elijah's first low point)" },
        { n: 18, label: '1 Kings 18 (Carmel; the triumph before the collapse)' },
        { n: 21, label: '1 Kings 21 (Elijah walks back into danger against Ahab)' },
      ],
    },
    {
      slug: 'the-vineyard-of-naboth',
      title: 'The vineyard of Naboth',
      preview: "Ahab the king wants his neighbour's vineyard for a kitchen garden. Naboth refuses — the land is his fathers' inheritance. Ahab comes home heavy and displeased and lies on his bed and turns his face away. Jezebel takes care of it. Elijah walks into the vineyard with an indictment.",
      essay: [
        `Chapter 21 is one of the most exact pieces of political prose in the Hebrew Bible. Ahab the king of Samaria wants Naboth's vineyard, which adjoins the royal palace, for a kitchen garden. Naboth refuses to sell because the land is the inheritance of his fathers and the Levitical law forbids the alienation of ancestral land. Ahab comes home to his house heavy and displeased and lies down upon his bed and turns away his face and will not eat. The image is precise: a king sulking like a child because the law has stood between him and what he wants.`,
        `Jezebel comes in and asks why he is sulking. He explains. She answers with the line that contains the whole chapter: 'Dost thou now govern the kingdom of Israel? Arise, and eat bread, and let thine heart be merry; I will give thee the vineyard of Naboth the Jezreelite.' She writes letters in the king's name and seals them with his seal and sends them to the elders and nobles of Naboth's city. The letters call a fast and seat Naboth at the head of the people and find two false witnesses to testify that he has blasphemed God and the king. Naboth is taken out and stoned. The vineyard falls to Ahab by escheat.`,
        `Then Elijah meets Ahab in the vineyard, and the indictment is delivered in two sentences: 'Hast thou killed, and also taken possession?' And: 'In the place where dogs licked the blood of Naboth shall dogs lick thy blood, even thine.' The chapter shows precisely how royal power, when uninterrupted, will bend the apparatus of justice — courts, witnesses, religious occasions, the seal of the king — to satisfy the desire of the moment. It shows the prophet, alone, naming the deed in the place where it happened.`,
        `Naboth's vineyard is the locus classicus for every later argument in the Western tradition that even kings are bound by the law and that even the absence of an external check does not abolish the moral one. The chapter is also the prose of the prophetic office at its sharpest: the prophet does not stand on a mountain and call down fire here. He walks into a private vineyard, speaks two sentences, and leaves. The economy is part of the point. The word is enough.`,
      ],
      where: [
        { n: 21, label: "1 Kings 21 (Naboth; Jezebel's letters; Elijah's indictment)" },
        { n: 22, label: '1 Kings 22 (Ahab dies as Elijah said; dogs lick the blood)' },
        { n: 20, label: '1 Kings 20 (Ahab spares Ben-hadad; a prophet condemns him)' },
        { n: 18, label: '1 Kings 18 (Elijah confronts the king the first time: "art thou he that troubleth Israel?")' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Solomon', role: 'King of united Israel', body: `David's son by Bathsheba. Anointed at Gihon while Adonijah is still feasting. Asks for an understanding heart at Gibeon. Builds the temple over seven years. Speaks three thousand proverbs. Marries seven hundred wives and three hundred concubines; by chapter 11 his heart is turned. Dies after a forty-year reign leaving a kingdom that splits the next day.` },
    { name: 'Elijah', role: 'Prophet of the North', body: `Appears in chapter 17 without genealogy — Elijah the Tishbite, of the inhabitants of Gilead. Announces a three-year drought to Ahab. Confronts the prophets of Baal on Mount Carmel and calls down fire. Runs from Jezebel's death threat, hears God in a sound of thin silence at Horeb. Confronts Ahab in Naboth's vineyard. The model of the prophet who works outside the apparatus of the state.` },
    { name: 'Ahab', role: 'King of Israel', body: `Son of Omri, king in Samaria for twenty-two years. Marries Jezebel of Sidon, builds the temple of Baal in Samaria. Sulks when Naboth refuses to sell his vineyard. Dies disguised in his chariot at Ramoth-gilead — struck by an arrow shot at random; the dogs lick his blood at the pool of Samaria, as Elijah had said.` },
    { name: 'Jezebel', role: 'Queen of Israel', body: `Daughter of Ethbaal king of the Sidonians. Brings her own prophets to Samaria and persecutes the prophets of the Lord. Writes the letters that procure Naboth's death, sealing them with the king's seal. The political will Ahab lacks. Her daughter Athaliah marries into the house of Judah; the Davidic line will nearly end in her purges in 2 Kings 11.` },
    { name: 'Jeroboam', role: 'First king of the northern kingdom', body: `Solomon's official over the labour gangs. Ahijah the prophet tears a cloak into twelve pieces and gives him ten. After Solomon's death, Rehoboam's folly drives the northern tribes to him. He sets up golden calves at Bethel and Dan — "these be thy gods, O Israel" — and becomes the template against whom every subsequent northern king is measured: "in the sin of Jeroboam who made Israel to sin."` },
    { name: 'The Queen of Sheba', role: 'Foreign monarch', body: `Comes to Jerusalem with a great train and camels bearing spices and gold and precious stones to test Solomon with hard questions. He answers all of them. When she has seen his wisdom, his table, his palace, his ascent to the temple — there was no more spirit in her. The chapter is the high point of Solomon's international prestige, and the moment after which the narrative will begin to count the cost.` },
  ],

  castLead: `<p>1 Kings has a large cast spread across more than a century. The Solomon section features the court of the united kingdom — the king, his foreign wives, the craftsman Hiram of Tyre, the Queen of Sheba. The divided-kingdom section moves fast through a succession of northern and southern rulers. The Elijah cycle narrows to three figures: the prophet, the king, and the queen.</p>`,

  cast: [
    {
      name: 'Solomon',
      role: 'KING OF UNITED ISRAEL',
      body: `David's son by Bathsheba, anointed at Gihon while Adonijah is still feasting at the spring of En-rogel. Asks for an understanding heart at Gibeon and is given wisdom, riches, and honour. Builds the temple over seven years using cedars from Lebanon supplied by Hiram of Tyre. Dedicates it with the long prayer of chapter 8. Receives the Queen of Sheba. Speaks three thousand proverbs and writes a thousand and five songs. Marries Pharaoh's daughter, then seven hundred more wives and three hundred concubines from Moab, Ammon, Edom, Sidon, and the Hittites. The high places of Chemosh and Milcom and Ashtoreth are built on the mount facing Jerusalem and his heart, the narrative says plainly, is turned away. Dies after a forty-year reign, leaving a kingdom that splits the day after his funeral. The book's most ambivalent portrait — wisest king of his age, and the king who set up the schism.`,
    },
    {
      name: 'Elijah',
      role: 'PROPHET OF THE NORTH',
      body: `Appears in chapter 17 without genealogy or introduction — Elijah the Tishbite, of the inhabitants of Gilead. Announces a three-year drought to Ahab. Fed by ravens at the brook Cherith, then by a Sidonian widow at Zarephath whose oil and meal do not run out and whose son he raises. Confronts the prophets of Baal on Mount Carmel and calls down fire. Runs from Jezebel's death threat into the wilderness, sleeps under a juniper, asks to die, is fed by an angel and travels forty days to Horeb, where he hears God in a sound of thin silence. Confronts Ahab in Naboth's vineyard. Anoints Elisha as his successor in chapter 19. The model of the prophet who works outside the apparatus of the state, in a hairy mantle, fed by what comes to hand.`,
    },
    {
      name: 'Ahab',
      role: 'KING OF ISRAEL',
      body: `Son of Omri, king in Samaria for twenty-two years. The narrator's verdict in chapter 16 is as harsh as any in the book: 'Ahab the son of Omri did evil in the sight of the Lord above all that were before him.' Builds the temple of Baal in Samaria, marries Jezebel, fights three wars with Ben-hadad of Syria, and presides over the Naboth episode. The book's portrait is more textured than the verdict — Ahab fasts and tears his clothes and walks softly when Elijah delivers the sentence over Naboth, and the Lord postpones the judgment a generation in response. Dies disguised in his chariot at Ramoth-gilead in chapter 22, struck by an arrow shot at random; the chariot is washed at the pool of Samaria and the dogs lick the blood, as Elijah had said.`,
    },
    {
      name: 'Jezebel',
      role: 'QUEEN OF ISRAEL',
      body: `Daughter of Ethbaal king of the Sidonians, married to Ahab as part of the Phoenician alliance that brings prosperity and Baal worship to Samaria together. Brings her own prophets — four hundred and fifty of Baal and four hundred of Asherah, who eat at her table — and persecutes the prophets of the Lord, with Obadiah hiding a hundred of them in two caves. Writes the letters that procure Naboth's death, sealing them with the king's seal. The political will Ahab lacks. Her line continues: her daughter Athaliah marries the king of Judah, and the Davidic line nearly ends in her purges in 2 Kings 11.`,
    },
    {
      name: 'Jeroboam',
      role: 'FIRST KING OF ISRAEL',
      body: `Solomon's official over the labour gangs, identified by the prophet Ahijah in chapter 11 as the man who will receive ten of the twelve tribes. After Solomon's death, Rehoboam's folly at Shechem drives the northern tribes to him. He sets up golden calves at Bethel and Dan to prevent the northern tribes from worshipping in Jerusalem — 'these be thy gods, O Israel, which brought thee up out of the land of Egypt.' The verdict in chapter 12 will be repeated hundreds of times through 1 and 2 Kings: every northern king who fails is measured by "the sin of Jeroboam who made Israel to sin."`,
    },
    {
      name: 'The Queen of Sheba',
      role: 'FOREIGN MONARCH',
      body: `Comes to Jerusalem in chapter 10 with a great train, with camels that bare spices, and very much gold, and precious stones, to test Solomon with hard questions. He answered all her questions; there was not anything hid from the king, which he told her not. When she has seen his wisdom, the house he had built, the meat of his table, the sitting of his servants, the attendance of his ministers and their apparel, his cupbearers, and his ascent by which he went up unto the house of the Lord — there was no more spirit in her. Sheba is probably ancient Saba, in southern Arabia. The queen is unnamed in 1 Kings. The chapter is the high point of Solomon's international prestige and the moment after which the narrative will begin to count the cost.`,
    },
    {
      name: 'Elisha',
      role: 'PROPHET, SUCCESSOR',
      body: `Found by Elijah in chapter 19, plowing with twelve yoke of oxen at Abel-meholah. Elijah throws his mantle on him and Elisha leaves the oxen, runs after him, asks leave to kiss his father and mother, slaughters a yoke of oxen and boils them with the wood of the plowing instruments and gives the meat to the people, and follows Elijah and ministers to him. He appears only briefly in 1 Kings; his ministry occupies most of the first half of 2 Kings, where he asks for and receives a double portion of Elijah's spirit.`,
    },
  ],

  castGroups: [
    {
      label: 'The house of David',
      characters: [
        { id: 'solomon', tag: 'King', name: 'Solomon', epithet: 'King of united Israel', body: `David's son by Bathsheba, the last king of the unified kingdom. Forty-year reign. Builds the temple. Asks for wisdom and is given that and everything else. Marries seven hundred wives and three hundred concubines. Dies leaving a kingdom that splits the day after his funeral.`, appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
        { id: 'rehoboam', tag: 'King', name: 'Rehoboam', epithet: `Solomon's son, king of Judah`, body: `Goes to Shechem to be confirmed by the northern tribes, takes the young men's advice over the elders', and tells the north his little finger will be thicker than his father's loins. The northern tribes secede. He reigns in Judah for seventeen years. His mother is Naamah the Ammonitess.`, appears: [12, 14] },
      ],
    },
    {
      label: 'The northern kings',
      characters: [
        { id: 'jeroboam', tag: 'King', name: 'Jeroboam', epithet: 'First king of Israel', body: `Solomon's official, chosen by the prophet Ahijah to receive ten tribes. Sets up golden calves at Bethel and Dan. Becomes the template against whom every subsequent northern king is measured. His son Abijah dies as a sign of Ahijah's oracle against the house.`, appears: [11, 12, 13, 14] },
        { id: 'omri', tag: 'King', name: 'Omri', epithet: 'King of Israel, founder of Samaria', body: `Commander of the army who seizes the throne after Zimri's seven-day coup. Buys the hill of Shomron and builds Samaria as his capital. Father of Ahab. The Deuteronomistic historian judges him harshly; the Assyrian records call Israel "the house of Omri" for a century after his death.`, appears: [16] },
        { id: 'ahab', tag: 'King', name: 'Ahab', epithet: 'King of Israel', body: `Son of Omri, king for twenty-two years. Builds the temple of Baal in Samaria. Marries Jezebel. Sulks over Naboth's vineyard. Fights three wars with Ben-hadad of Syria. Dies in battle at Ramoth-gilead — struck by an arrow shot at random; the dogs lick his blood at the pool of Samaria, as Elijah said.`, appears: [16, 17, 18, 19, 20, 21, 22] },
      ],
    },
    {
      label: 'The prophets',
      characters: [
        { id: 'elijah', tag: 'Prophet', name: 'Elijah', epithet: 'The Tishbite', body: `Appears without introduction in chapter 17 and announces a drought. Fed by ravens and by the widow of Zarephath. Confronts the prophets of Baal on Mount Carmel and calls down fire. Hears God in a sound of thin silence at Horeb. Confronts Ahab in Naboth's vineyard. Anoints Elisha as his successor. Taken up in the chariot of fire in 2 Kings.`, appears: [17, 18, 19, 21, 22] },
        { id: 'elisha', tag: 'Prophet', name: 'Elisha', epithet: `Elijah's successor`, body: `Called at Abel-meholah, where Elijah throws his mantle on him while he is plowing. Slaughters his oxen, boils them with the plowing wood, and follows. Appears briefly in 1 Kings; his ministry dominates the first half of 2 Kings, where he receives a double portion of Elijah's spirit.`, appears: [19] },
        { id: 'ahijah', tag: 'Prophet', name: 'Ahijah', epithet: 'Prophet of Shiloh', body: `Meets Jeroboam in chapter 11 outside Jerusalem, tears a new cloak into twelve pieces, and gives him ten. The cloak is the kingdom. By chapter 14 he is blind but still sharp: when Jeroboam's wife comes disguised to ask about the sick child, Ahijah knows her at the threshold and delivers the oracle that ends the house of Jeroboam.`, appears: [11, 14] },
      ],
    },
    {
      label: 'The foreign powers',
      characters: [
        { id: 'the-queen-of-sheba', tag: 'Monarch', name: 'The Queen of Sheba', epithet: 'Unnamed foreign monarch', body: `Comes to Jerusalem with spices and gold and hard questions. Tests Solomon's wisdom and finds no more spirit in her when she has seen everything. The chapter is the peak of Solomon's international prestige. She is unnamed in 1 Kings; later traditions give her names and elaborate her story.`, appears: [10] },
        { id: 'jezebel', tag: 'Queen', name: 'Jezebel', epithet: 'Queen of Israel, daughter of Ethbaal', body: `The Sidonian princess who marries Ahab and brings Baal worship to Samaria. Persecutes the prophets of the Lord. Writes the letters that procure Naboth's death. Sends the death threat that drives Elijah into the desert after Carmel. The political will that Ahab lacks.`, appears: [16, 18, 19, 21, 22] },
        { id: 'hiram', tag: 'King', name: 'Hiram', epithet: 'King of Tyre', body: `The Phoenician king who supplies cedar and fir timber from Lebanon for the temple and palace, in exchange for wheat and olive oil. Also sends a craftsman of the same name — a widow's son of the tribe of Naphtali — to cast the great bronze furnishings of the temple, including the two pillars Jachin and Boaz.`, appears: [5, 7, 9] },
      ],
    },
  ],

  chapters,
};

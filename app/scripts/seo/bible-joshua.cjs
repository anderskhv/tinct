// Joshua — SEO page data for build-seo-pages.cjs
// Deuteronomistic History, c. 6th century BCE.
// Voice: literary, declarative present.

const chapters = require('/tmp/bible-joshua-chunk-1.json');

module.exports = {
  id: 'bible-joshua',
  title: 'Joshua',
  author: 'Anonymous (Deuteronomistic History)',
  byline: 'c. 6th c. BCE · Hebrew Bible · Former Prophets',
  titleAccent: 'a guided tour',
  hook: 'Moses is dead. The Jordan is in flood. The people who have wandered for forty years are about to walk into the land that was promised to their great-great-grandfather Abraham. The sixth book of the Hebrew Bible is a crossing, a conquest, an allotment, and a final knife-edged covenant ceremony at Shechem — and one of the most morally difficult books in the canon.',
  genre: ['Historical narrative', 'Hebrew Bible', 'Deuteronomistic History'],
  themesBlurb: 'Conquest, inheritance, covenant, and the cost of holy war.',
  castBlurb: 'The people of the land',
  castDesc: 'The leaders, the survivors, and the figures the book will not let you forget.',

  about: [
    `<em>Joshua</em> is the book of the crossing. Moses is dead, the Jordan is in flood at harvest time, and the people who have wandered for forty years are about to walk into the land that was promised to their ancestor Abraham. What follows — twenty-four chapters of conquest, allotment, and a final covenant ceremony at Shechem — has been read for nearly three thousand years as both the fulfilment of the promise and one of the most morally difficult books in the Hebrew canon. Both readings are honest. The book has shaped Jewish, Christian, and modern political imaginations of land, conquest, and possession in ways that have not stopped reverberating.`,
    `Joshua reaches its present form during or just after the Babylonian exile in the 6th century BCE, as part of what scholars call the Deuteronomistic History — the long narrative running from Joshua through 2 Kings, edited under the influence of Deuteronomy and reading the eventual loss of the land as the consequence of long covenant failure. The traditional view assigns the book to Joshua himself; the modern critical view sees a composite work drawing on older traditions recast by exilic editors with a coherent theological program. Whether the conquest happened on the scale the book describes is one of the most contested questions in biblical archaeology, with the textual claim of a unified campaign poorly matched by the archaeological record of the late Bronze Age. A 21st-century reader picks Joshua up because the questions it raises about land, promise, conquest, and the moral cost of inheritance have not gone away.`,
  ],

  chaptersSubtitle: 'All 24 chapters — the crossing, the conquest, the allotment, and the farewell.',
  chaptersLead: `<p>Joshua has three large movements. Chapters 1–12 are the conquest narrative: the commissioning of Joshua, Rahab's sheltering of the spies, the crossing of the Jordan with the ark, the fall of Jericho, the disaster at Ai because of Achan's hidden plunder, the Gibeonite deception, the long day at Aijalon when the sun stands still, and the southern and northern campaigns. Chapters 13–22 are the apportionment of the land among the twelve tribes, with the Levites given forty-eight cities and six cities of refuge designated. Chapters 23–24 are Joshua's farewell and the covenant renewal at Shechem.</p>`,

  themesByline: 'Five threads through the book',
  themesLead: `Joshua is a book about what a promise looks like when it is finally kept — and what keeping it costs. The crossing of the Jordan, the siege of Jericho, Achan's hidden plunder, the long allotment chapters, and the covenant at Shechem are not episodes; they are arguments. Each one asks something the reader has to carry past the final page.`,

  groups: [
    { label: 'The conquest (ch. 1–12)', subtitle: 'From the commissioning of Joshua to the list of defeated kings.', chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { label: 'The allotments (ch. 13–21)', subtitle: 'The land divided tribe by tribe, the Levitical cities, the cities of refuge.', chapters: [13, 14, 15, 16, 17, 18, 19, 20, 21] },
    { label: 'Covenant renewal (ch. 22–24)', subtitle: 'The altar dispute, Joshua\'s farewell, and the choice at Shechem.', chapters: [22, 23, 24] },
  ],

  themes: [
    {
      slug: 'crossing-the-jordan',
      title: 'Crossing the Jordan',
      greek: 'the river parts; the land begins',
      preview: 'The Jordan is in flood at harvest time. When the priests carrying the ark step into the water, the flow is cut off and the people cross on dry ground. The parallel with the Red Sea crossing is exact and intentional — the book is announcing that the deliverance from Egypt is now being completed.',
      essay: [
        `Joshua opens with a crossing. Moses is dead. The people are camped on the east bank of the Jordan in the place where Deuteronomy ended. Joshua is commissioned by God with the words that have become liturgy: be strong and courageous, do not be frightened or dismayed, for the Lord your God is with you wherever you go. He sends two spies into Jericho. They are sheltered by Rahab the prostitute, who hides them under stalks of flax on her roof and lets them down by a rope through her window in the city wall. They return with their report. The people break camp and come to the river.`,
        `The Jordan is in flood — chapter 3 takes care to mention this. It is harvest time and the river is overrunning its banks. The priests carrying the ark of the covenant step into the water at the head of the column. The flow is cut off. The waters from upstream pile up in a heap at a town called Adam, and the people cross on dry ground. The whole nation passes over while the priests stand with the ark in the middle of the river bed. After they have crossed, twelve men — one from each tribe — go back to the river and bring up twelve stones from the place where the priests stood, and Joshua sets them up at Gilgal as a memorial.`,
        `The parallel with the Red Sea crossing in Exodus is exact and intentional. The book wants the reader to feel that the deliverance from Egypt is being completed here. The same waters part. The same dry ground appears. The same trembling people pass through. The river is the threshold. On the east side they are nomads; on the west side they are about to become a settled people in a land. The crossing is the founding act of the new condition.`,
        `The twelve memorial stones at Gilgal have a specific liturgical purpose, spelled out in chapter 4. When in time to come your children ask, what do these stones mean, then you shall let them know: Israel crossed over the Jordan here on dry ground. The whole crossing is being framed — as the Passover was framed in Exodus — as a future memory. The act is designed to be remembered. It is the inauguration of a national history with deliberately constructed monuments, and a model for how Joshua wants its events to be carried forward.`,
      ],
      where: [
        { n: 1, label: 'Joshua 1 (the commissioning)' },
        { n: 3, label: 'Joshua 3 (the crossing)' },
        { n: 4, label: 'Joshua 4 (the twelve stones)' },
        { n: 5, label: 'Joshua 5 (first Passover in the land)' },
      ],
    },
    {
      slug: 'jericho-and-the-walls',
      title: 'Jericho and the walls',
      greek: 'march seven times; give a great shout',
      preview: 'The instructions God gives Joshua for the siege of Jericho are unlike any military instructions in ancient narrative. No battering ram. No tunnel. A procession with an ark and seven horns, and on the seventh day the wall falls down flat. The strangest siege in literature is also the book\'s purest theological statement: the land is being given, not taken.',
      essay: [
        `Jericho is the first city in the land. It is heavily fortified, with the population shut up against the Israelite advance. The instructions God gives Joshua in chapter 6 are unlike any military instructions in any other ancient narrative. March around the city once a day for six days. On the seventh day, march around it seven times. The seven priests carrying the seven trumpets of rams' horns will blow them, and then the people will give a great shout, and the wall will fall down flat, and the people will go up, every one straight ahead.`,
        `This is the strangest siege in literature. There is no battering ram. There is no tunnel under the wall. There is no starvation, no betrayal, no negotiation. There is a procession with an ark and a number of horns, and after seven days the wall comes down. The text gives the bare account without explaining the mechanism. Whatever historians and archaeologists have made of it — and the archaeological evidence at Tell es-Sultan is famously contested — what the book is doing is theological. The first city is taken not by conventional siegecraft but by liturgy. The land is being given, and the giving is being shown.`,
        `Then the dark side. The instructions also include the herem — the dedication of the city to total destruction. The Israelites are to put everyone in Jericho to the sword: men and women, young and old, oxen, sheep, and donkeys. Only Rahab and her household are spared, because she had hidden the spies and tied a scarlet cord in her window. The silver and gold and bronze and iron are to go into the treasury of the Lord's house. Nothing else is to be taken; everything is to be destroyed.`,
        `The herem is the moral problem of the book, and there is no point softening it. It is a category of warfare that appears in other ancient Near Eastern texts — Mesha's Moabite Stone records a similar dedication of captives to a god — and it is presented in Joshua as the express command of God. Modern readers of every theological persuasion have struggled with what to do with these texts. Some have read them as mostly hyperbolic, since the rest of the book and Judges show clearly that the inhabitants were not in fact all destroyed. Others have read them as historically conditioned commands tied to a specific moment that the larger biblical witness moves beyond. Others have read them as a permanent scandal the canon does not resolve. The honest reader takes them seriously as something the text itself is asserting, and lets them sit as the difficulty they are.`,
      ],
      where: [
        { n: 6, label: 'Joshua 6 (the fall of Jericho)' },
        { n: 9, label: 'Joshua 9 (the Gibeonite deception)' },
        { n: 10, label: 'Joshua 10 (the long day at Aijalon)' },
        { n: 11, label: 'Joshua 11 (the northern campaign)' },
      ],
    },
    {
      slug: 'achan-and-the-hidden-plunder',
      title: 'Achan and the hidden plunder',
      greek: '"Israel has sinned"',
      preview: 'After Jericho\'s miraculous fall, thirty-six Israelites are killed in flight from tiny Ai. The reason: one man named Achan hid a Babylonian mantle, two hundred shekels of silver, and a wedge of gold under his tent. The scene is the book\'s argument about collective integrity — one hidden disobedience contaminates the whole.',
      essay: [
        `After Jericho, the next target is Ai — a much smaller town. Joshua sends three thousand men, expecting an easy victory. They are routed. Thirty-six Israelites are killed, the rest flee, and the hearts of the people, the text says, melted and became as water. Joshua tears his clothes and falls on his face before the ark. Why have you brought us across the Jordan, he asks, only to deliver us into the hand of the Amorites to destroy us?`,
        `The Lord's answer in chapter 7 is sharp. Israel has sinned. They have transgressed the covenant by taking some of the things devoted to destruction at Jericho. The herem has been violated. Until the violator is found and the devoted thing destroyed, no victory will come. Joshua brings the people forward by tribes, then by clans, then by households, then by individuals. The lot falls on a man named Achan of the tribe of Judah. He confesses: he saw a beautiful Babylonian mantle, and two hundred shekels of silver, and a wedge of gold weighing fifty shekels, and he coveted them and took them, and they are buried under his tent. The plunder is dug up. Achan is brought out, with his sons and daughters and oxen and donkeys and sheep, into the Valley of Achor, and they are stoned and burned with fire. They raise over them a great heap of stones that remains, the text says, to this day. The valley is named Achor — trouble.`,
        `The scene is one of the most disturbing in the book and one of the most carefully constructed. The narrative wants the reader to feel that the prosperity of the people in the land depends on a kind of collective integrity. One man's hidden disobedience contaminates the whole. The image of the secret thing buried under the tent — the one bad spot on the collective body — is the book's controlling metaphor for failure. The execution that follows is brutal even by the standards of the book; the inclusion of Achan's children in the killing is one of the passages later Jewish and Christian commentators have struggled most with. The text presents it without softening.`,
        `What the chapter is doing structurally is setting up the second taking of Ai in chapter 8. With the contamination removed, the city is taken by a careful military stratagem — an ambush, a feigned retreat, the city emptied of defenders, the army in the city set on fire. The whole population of Ai is killed. The contrast between Jericho's miraculous fall and Ai's tactical fall, and the placement of the Achan story between them, is the book's argument: the giving of the land requires the people to be the kind of people the giving requires. When they are not, the giving stalls.`,
      ],
      where: [
        { n: 7, label: 'Joshua 7 (Achan found and executed)' },
        { n: 8, label: 'Joshua 8 (Ai taken; the altar at Ebal)' },
      ],
    },
    {
      slug: 'allotment-of-the-land',
      title: 'The allotment of the land',
      greek: 'not one of all the good promises had failed',
      preview: 'Almost half of Joshua is taken up with the apportionment of the land among the twelve tribes. To a modern reader, these chapters can look like a tax assessor\'s report. They are also the theological climax: the promise to Abraham, six hundred years earlier — to your offspring I will give this land — is being made specific, boundary stone by boundary stone.',
      essay: [
        `Almost half of Joshua — chapters 13 through 21 — is taken up with the apportionment of the land among the twelve tribes. To a modern reader these chapters can look like a tax assessor's report: this is the boundary of the territory of Reuben, these are the cities of Simeon, this is the inheritance of the children of Manasseh according to their families. The detail is forbidding. It is also the theological point. The land that has been promised, and given, and taken, is now being possessed in pieces by particular families with particular boundaries running between particular hills and particular springs. The promise is being made specific.`,
        `Reuben, Gad, and the half-tribe of Manasseh receive their inheritance east of the Jordan, where they had asked for it under Moses. The other nine and a half tribes receive their territories west of the Jordan, with Judah getting the largest southern territory, Ephraim and Manasseh dominating the centre, and the smaller tribes distributed around them. The Levites receive no territorial inheritance — the Lord is their inheritance — but they are given forty-eight cities scattered through the territories of the other tribes. Six of those cities are designated cities of refuge, where someone who has killed unintentionally can flee from the avenger of blood and have his case heard.`,
        `The cities of refuge are one of the most striking legal institutions in the Hebrew Bible, and Joshua is where they are actually established on the ground. The institution recognizes the reality of blood feud — a man killed accidentally still has a family with the right of vengeance — and tries to break the feud cycle by providing a sanctuary in which the manslayer can live until the death of the high priest, after which he can return home. It is one of the early attempts in human legal history to interpose a public institution between a wrong and the private vengeance it would otherwise produce.`,
        `The long allotment chapters end with a striking theological note. Chapter 21 closes: thus the Lord gave to Israel all the land that he swore to their ancestors that he would give them. Not one of all the good promises that the Lord had made to the house of Israel had failed; all came to pass. The line is the book's theological climax. The promise to Abraham, six hundred years earlier — to your offspring I will give this land — has been fulfilled. The argument of the book is complete. What follows in the closing chapters is the question of whether Israel can keep what has been given.`,
      ],
      where: [
        { n: 13, label: 'Joshua 13 (territories yet to be taken)' },
        { n: 14, label: 'Joshua 14 (Caleb claims Hebron)' },
        { n: 20, label: 'Joshua 20 (cities of refuge)' },
        { n: 21, label: 'Joshua 21 (Levitical cities; promise fulfilled)' },
      ],
    },
    {
      slug: 'covenant-at-shechem',
      title: 'The covenant at Shechem',
      greek: '"Choose this day whom you will serve"',
      preview: 'Chapter 24 is the literary climax of the book. Joshua gathers all Israel at Shechem, recites the whole history of God\'s acts from Abraham to the crossing, and issues a challenge that has been carved into church entrances for two thousand years: as for me and my house, we will serve the Lord.',
      essay: [
        `Chapter 24 is the literary climax of the book. Joshua, an old man, gathers all the tribes of Israel to Shechem and summons their elders, heads, judges, and officers. They present themselves before God. Joshua speaks for God and gives them, in his own voice and in the voice of the Lord, a long historical recitation. Long ago your ancestors lived beyond the Euphrates and served other gods. I took your ancestor Abraham from beyond the river and led him through the land of Canaan and gave him many offspring. I sent Moses and Aaron and plagued Egypt. I brought you out of Egypt. I gave you a land on which you had not laboured, and towns that you had not built, and you live in them; you eat the fruit of vineyards and oliveyards that you did not plant.`,
        `Then the demand. Now therefore revere the Lord and serve him in sincerity and in faithfulness; put away the gods that your ancestors served beyond the river and in Egypt, and serve the Lord. The book has not previously been very interested in which gods the people might be tempted by. Here it acknowledges them: gods from beyond the Euphrates, gods from Egypt, gods of the Amorites in whose land they now live. The choice is among real options.`,
        `If you are unwilling to serve the Lord, Joshua continues, choose this day whom you will serve, whether the gods your ancestors served in the region beyond the river or the gods of the Amorites in whose land you are living. Then the line that has been carved into a thousand church entrances and household plaques: as for me and my house, we will serve the Lord. The people answer. Far be it from us that we should forsake the Lord to serve other gods. Joshua, in a strange move, presses them. You cannot serve the Lord, he says — for he is a holy God, he is a jealous God, he will not forgive your transgressions or your sins. The people insist. So Joshua makes a covenant with the people that day, writes the words in a book, and sets up a great stone under the oak in the sanctuary of the Lord as a witness.`,
        `Then Joshua dies. He is one hundred and ten years old. They bury him on his own land at Timnath-serah. The bones of Joseph, which the Israelites had carried out of Egypt, are buried at Shechem in the plot of land Jacob had bought there. Eleazar the high priest dies and is buried in the hill country of Ephraim. The book ends with three burials — three settled bodies in the soil of the inheritance. The promise that began at Ur with one childless man has come to rest, on the page, in three graves and a covenant under an oak.`,
      ],
      where: [
        { n: 22, label: 'Joshua 22 (the altar of witness)' },
        { n: 23, label: 'Joshua 23 (Joshua\'s first farewell)' },
        { n: 24, label: 'Joshua 24 (covenant at Shechem)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Joshua', role: 'General and successor to Moses', body: `Son of Nun, of the tribe of Ephraim, Moses's assistant since the wilderness years, and one of only two of the original twelve spies who came back from Canaan urging the people to go in. Commissioned at the start of the book to lead the people across the Jordan. Strong, decisive, faithful, and — as the book carefully shows — entirely dependent on the Lord for the victories that follow. He dies at one hundred and ten and is buried in the territory the people gave him. The book's final note about him is that Israel served the Lord all the days of Joshua, and all the days of the elders who outlived Joshua and had known all the work that the Lord had done for Israel.` },
    { name: 'Rahab', role: 'Woman of Jericho who sheltered the spies', body: `A woman of Jericho who runs an inn or a brothel — the text uses the word <em>zonah</em>, which can mean either — built into the city wall. The two Israelite spies come to her house. She hides them under stalks of flax on her roof, misdirects the king's men, and extracts a promise of safety for her family when the city falls. The scarlet cord in her window marks her household for preservation. She becomes part of Israel, and according to the genealogy in Matthew's Gospel is an ancestor of David and of Jesus. Hebrews 11 includes her among the heroes of faith. Among all the figures in Joshua, she is the most quietly elevated.` },
    { name: 'Caleb', role: 'The faithful spy who waited forty-five years', body: `Son of Jephunneh, of the tribe of Judah, the other of the original twelve spies who came back from Canaan urging the people to go in. Forty-five years later, in chapter 14, he comes to Joshua at Gilgal and reminds him of the promise Moses made: I am still as strong this day as I was on the day Moses sent me, my strength now is as my strength was then for war and for going and coming. Give me this hill country. Joshua blesses him and gives him Hebron. He drives out the three sons of Anak who lived there. Caleb is the embodiment in the book of the promise long deferred and still kept.` },
    { name: 'Achan', role: 'The man whose hidden plunder stalled the conquest', body: `Of the tribe of Judah, the man whose hidden plunder from Jericho brings disaster on the army at Ai and through whom the book stages its insistence on the integrity of the herem. After the rout at Ai, the lot falls on him; he confesses; the plunder is dug up from under his tent; he and his household are stoned and burned in the Valley of Achor — the valley of trouble. The book uses his story as a parable of how a single hidden disobedience can stall the whole project of inheritance. His name becomes proverbial in later Hebrew literature.` },
    { name: 'Eleazar', role: 'High priest alongside Joshua', body: `Son of Aaron, the high priest who serves alongside Joshua throughout the book. He carries the breastplate with the urim and thummim, the sacred lots used to determine God's will at decisive moments. He stands with Joshua at the apportionment of the land, which is done by lot before the Lord at Shiloh. He is the priestly counterpart to Joshua's military and civil leadership. He dies in the closing chapter, just after Joshua, and is buried in the hill country of Ephraim.` },
  ],

  castSubtitle: 'The leaders, the survivors, and the figures the book will not let you forget.',
  castLead: `<p>Joshua has a relatively small named cast for a book of its length. The action is concentrated on Joshua, the leaders of the tribes, a handful of central figures in the conquest narrative, and two figures from Jericho — Rahab and the Gibeonites — whose presence complicates the herem rhetoric. The cast page follows them through the chapters they appear in.</p>`,

  castGroups: [
    {
      label: 'The leaders',
      characters: [
        {
          id: 'joshua',
          tag: 'General',
          name: 'Joshua',
          epithet: 'Son of Nun — successor to Moses',
          body: `Moses's assistant since the wilderness years, one of only two of the original twelve spies who urged the people to go in to Canaan. Commissioned by God at the book's opening with the repeated charge — be strong and courageous — and by the people with an oath of loyalty. Leads the crossing of the Jordan, the siege of Jericho, the campaign against Ai, the southern and northern coalitions, and finally the apportionment of the land. He gathers the tribes at Shechem at the end and issues the covenant challenge. Dies at one hundred and ten and is buried at Timnath-serah. The book's final note about him: Israel served the Lord all the days of Joshua, and all the days of the elders who outlived Joshua and had known all the work that the Lord had done.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
        },
        {
          id: 'eleazar',
          tag: 'Priest',
          name: 'Eleazar',
          epithet: 'High priest — son of Aaron',
          body: `The high priest who serves alongside Joshua throughout the book. Carries the breastplate with the urim and thummim used for divination. Stands with Joshua at the apportionment of the land in chapters 13–21, which is done by lot before the Lord at Shiloh. He is the priestly counterpart to Joshua's military and civil leadership — the pairing of general and high priest is the book's working model of how the new community is governed. Dies in the closing chapter and is buried in the hill country of Ephraim on his son Phinehas's land.`,
          appears: [3, 13, 14, 16, 17, 18, 19, 20, 21, 22, 24],
        },
      ],
    },
    {
      label: 'The central figures',
      characters: [
        {
          id: 'rahab',
          tag: 'Survivor',
          name: 'Rahab',
          epithet: 'The woman of Jericho',
          body: `A woman of Jericho who hides the two Israelite spies under stalks of flax on her roof, misdirects the king's messengers, and extracts a sworn promise of safety for her family before letting the spies down through her window on a rope. She ties a scarlet cord in the window as the agreed signal, and when Jericho falls, only her household survives the herem. She settles in Israel and becomes part of the people. Matthew's genealogy of Jesus includes her as an ancestor of David. Hebrews 11 names her among the heroes of faith alongside Abraham and Moses. She is the most morally complicated and the most quietly elevated figure in the book.`,
          appears: [2, 6],
        },
        {
          id: 'caleb',
          tag: 'Elder',
          name: 'Caleb',
          epithet: 'Son of Jephunneh — the faithful spy',
          body: `Of the tribe of Judah, the other of the original twelve spies who came back from Canaan urging the people to go in. Forty-five years later, in chapter 14, he comes to Joshua at Gilgal and claims the hill country of Hebron that Moses had promised him — I am still as strong this day as I was then. Joshua blesses him and gives him Hebron. He drives out the three sons of Anak who had lived there. His daughter Achsah marries his nephew Othniel after Othniel takes Kiriath-sepher. Caleb at eighty-five is the embodiment of the promise long deferred and still kept — and of the kind of faithfulness the book is asking of the whole people.`,
          appears: [14, 15],
        },
        {
          id: 'achan',
          tag: 'Transgressor',
          name: 'Achan',
          epithet: 'The man who took what was devoted',
          body: `Of the tribe of Judah, the man whose hidden plunder from Jericho brings disaster on the army at Ai and through whom the book stages its terrible insistence on collective integrity. He saw a beautiful Babylonian mantle, two hundred shekels of silver, and a wedge of gold weighing fifty shekels — and coveted and took them, burying them under his tent. After the rout at Ai, the lot falls on him by tribe, clan, household, and individual. He confesses. The plunder is dug up. He and his sons and daughters and animals are stoned and burned in the Valley of Achor. His name becomes proverbial in later Hebrew literature; Hosea, centuries later, will speak of the valley of Achor as a door of hope, redirecting the dark name into a vision of restoration.`,
          appears: [7],
        },
        {
          id: 'the-gibeonites',
          tag: 'Allies',
          name: 'The Gibeonites',
          epithet: 'The trickster allies from nearby',
          body: `The inhabitants of a small confederation of cities in central Canaan — Gibeon, Chephirah, Beeroth, Kiriath-jearim — who hear what has happened at Jericho and Ai and decide their best chance is a deception. They dress in worn-out clothes, load their donkeys with mouldy bread and patched wineskins, and come to Joshua at Gilgal claiming to be ambassadors from a far country wanting a treaty. Joshua and the elders, the text notes pointedly, did not ask the counsel of the Lord. They make a covenant with them. Three days later they discover the deception. By then the oath sworn in the name of the Lord cannot be undone. The Gibeonites become hewers of wood and drawers of water for the assembly — and their attack by the southern coalition triggers the long day at Aijalon. They reappear in 2 Samuel with a grievance against Saul that David has to settle.`,
          appears: [9, 10],
        },
      ],
    },
  ],

  chapterLabel: n => 'Joshua ' + n,

  chapters: chapters.map(c => ({
    n: c.n,
    title: c.tourTitle,
    hook: c.hook,
    blurb: c.blurb,
    summary: c.summary,
    tour: c.tour,
    themes: c.themes,
    appears: c.appears,
  })),
};

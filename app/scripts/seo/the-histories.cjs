// SEO content data for Herodotus's The Histories (c. 440 BCE).
// The first work of history in the Western tradition. Nine books, named after the nine Muses.
// 1,525 chapters — the largest single work in the Tinct library.

const chapters = require('/tmp/the-histories-chapters-filled.json');
const range = (a, b) => Array.from({length: b - a + 1}, (_, i) => a + i);

module.exports = {
  id: 'the-histories',
  title: 'The Histories',
  author: 'Herodotus',
  byline: 'c. 440 BC · Greek history',
  titleAccent: 'a guided tour',
  hook: 'A man from Halicarnassus travels the known world, talking to everyone he meets, and decides to write it all down before the great deeds of Greeks and barbarians are forgotten. The result is the founding book of Western history — half travelogue, half war narrative, entirely unlike anything that came before it.',

  genre: ['History', 'Ancient literature', 'Greek prose', 'Ethnography'],

  about: [
    `<em>The Histories</em> is the oldest surviving work of history in the Western tradition, written by Herodotus of Halicarnassus in the middle decades of the fifth century BCE and published, in portions, to audiences across the Greek world. Its subject is the long quarrel between Greeks and Persians that culminated in Xerxes’s invasion of Greece in 480 BCE — the battles of Thermopylae, Salamis, and Plataea that every later generation of Europeans has used as a foundation story. But the Histories is also a great deal more than that. Herodotus begins not with Persia but with Lydia, not with battles but with myth, not with Greeks but with Phoenicians and Egyptians and Scythians and dozens of other peoples whose customs and geography he describes in detail that no other ancient author matches.`,
    `More than half the work, by word count, is ethnography and geography rather than military narrative. Herodotus invented both the method and the name: the word <em>historia</em>, originally meaning inquiry, is used in the opening sentence for the first time in its historical sense, and it is an accurate description of what Herodotus does throughout. He travels, he asks, he reports, he names his sources when he can, and he admits when he cannot decide between competing accounts. The result is a work of inexhaustible curiosity and almost superhuman range — a man who wanted to preserve what had been done and to explain how it happened, and who did both things in a voice so distinctive that it has been imitated and argued over for two and a half thousand years.`,
  ],

  chaptersSubtitle: 'All 1,525 chapters, grouped by the nine books — from the abduction of Io to the punishment of impiety after Plataea.',
  chaptersLead: `<p>The Histories is divided by later editors into nine books, each named after one of the nine Muses. Books I–II are the great digressions: Lydia, the rise of Persia under Cyrus and Cambyses, and an extended treatment of Egypt that is the longest piece of ancient ethnography that survives. Books III–IV are Darius’s empire and his campaigns against the Scythians and the Libyans. Books V–VI bring the Ionian Revolt and Darius’s first expedition against mainland Greece, ending at the battle of Marathon. Books VII–IX are the great war narrative: Xerxes’s invasion, Thermopylae, Salamis, Plataea, Mycale. Do not skip the early books. The digressions are part of the argument.</p>`,
  themesByline: 'Five threads through all nine books',
  themesLead: `Herodotus wrote at a moment when Greeks were still living with the memory of Xerxes’s invasion and trying to understand what it had meant. The five themes below are the questions he was trying to answer: what method produces reliable knowledge, what caused the war, how do different peoples live, what brings great powers down, and why free cities fight harder than empires.`,

  castLead: `<p>The Histories contains more named individuals than any other ancient text — historians have counted over nine hundred. The figures below are those who appear most often and most fully. A complete cast would be a book in itself.</p>`,

  groups: [
    {
      label: 'Book I — Clio',
      subtitle: 'Lydia, Croesus, Cyrus, and the founding of Persian power. The doctrine of hubris and reversal stated in full.',
      chapters: range(1, 240),
    },
    {
      label: 'Book II — Euterpe',
      subtitle: 'Egypt — geography, customs, religion, and history. The longest sustained ethnography of antiquity.',
      chapters: range(241, 480),
    },
    {
      label: 'Book III — Thalia',
      subtitle: 'Cambyses in Egypt, the great debate on constitutions, the accession of Darius, and the empire reorganised.',
      chapters: range(481, 570),
    },
    {
      label: 'Book IV — Melpomene',
      subtitle: "Scythia, Libya, and Darius's failed campaign north of the Danube. The world beyond the civilised edge.",
      chapters: range(571, 761),
    },
    {
      label: 'Book V — Terpsichore',
      subtitle: 'The Ionian Revolt begins. Athens supports the rebels. Persia prepares its response.',
      chapters: range(762, 886),
    },
    {
      label: 'Book VI — Erato',
      subtitle: "The Ionian Revolt crushed at Lade. Darius's first invasion. The battle of Marathon.",
      chapters: range(887, 1050),
    },
    {
      label: 'Book VII — Polymnia',
      subtitle: "Xerxes decides to invade. The Hellespont bridged. Thermopylae and Leonidas's last stand.",
      chapters: range(1051, 1260),
    },
    {
      label: 'Book VIII — Urania',
      subtitle: 'Artemision. The fall of Athens. The battle of Salamis and the rout of the Persian fleet.',
      chapters: range(1261, 1440),
    },
    {
      label: 'Book IX — Calliope',
      subtitle: "Plataea. Mycale. The war is over. Herodotus's closing meditation on impiety and divine retribution.",
      chapters: range(1441, 1525),
    },
  ],

  themes: [
    {
      slug: 'inquiry-as-method',
      title: 'Inquiry as Method',
      preview: "Herodotus invented the practice of history as an act of structured inquiry — historia, the Greek word for investigation — and the opening sentence states his method: record what people say, name your sources, suspend judgment when evidence conflicts. What he built has been the foundation of every honest history written since.",
      essay: [
        `What Herodotus invents, more than anything else, is a method. The word he uses for his project, <em>historia</em>, originally meant inquiry — the kind of investigation a witness or a judge undertakes — and Herodotus brings to large historical questions the practice of someone trying to determine what actually happened. He travels widely, talks to people, and reports what they tell him, often by name. When his sources disagree, as they often do, he names the disagreement and sometimes refuses to adjudicate. “I am bound to record the things I am told,” he writes in one famous formula, “but I am not at all bound to believe them.”`,
        `The method has been mocked and admired in roughly equal measure for two and a half thousand years. Cicero called Herodotus the father of history; Plutarch wrote a treatise called <em>On the Malice of Herodotus</em> accusing him of crediting too freely the malicious gossip of his foreign sources. The truth is that Herodotus’s method is recognisably the method of every honest historian who has come after him — the painstaking accumulation of testimony from people in a position to know, the comparison of conflicting accounts, the suspended judgment when the evidence is unclear, the willingness to report what may turn out to be wrong because the alternative is to pretend a certainty no inquiry can produce.`,
        `The reliability of any individual story Herodotus reports is debated; the reliability of his method is the foundation of every later history. The first pages of Book I demonstrate it at once: Herodotus begins by reporting the Persian account of the origins of the quarrel, then the Greek account, notes they conflict, and moves on. He is not a propagandist. He is an inquirer, and the distinction matters.`,
        `Modern readers sometimes find the digressions frustrating — why describe Egyptian crocodile-fishing when you are supposed to be writing about the Persian Wars? But the digressions are the method. Herodotus cannot explain Xerxes’s invasion without explaining what Persia was, what Lydia was before Persia absorbed it, what Egypt contributed to the empire, what Scythia meant when Darius failed to conquer it. Every digression is a piece of evidence. The patience required to read them is the same patience the inquiry required to gather them.`,
      ],
      where: [
        { n: 1, label: 'Book I, Ch. 1 — the opening statement of method' },
        { n: 5, label: 'Book I, Ch. 5 — “I am bound to record what I am told”' },
        { n: 241, label: 'Book II, Ch. 1 — Egypt as extended inquiry' },
        { n: 887, label: 'Book VI, Ch. 1 — Ionian sources named' },
        { n: 1051, label: 'Book VII, Ch. 1 — Xerxes’s deliberation reported from multiple sides' },
      ],
    },
    {
      slug: 'causes-of-the-war',
      title: 'The Causes of the War',
      preview: "The opening sentence announces that the cause of the quarrel between Greeks and Persians shall not be forgotten. Herodotus’s answer is multiple, unhurried, and refusal to offer a single explanation is itself part of the argument.",
      essay: [
        `The opening sentence of the Histories announces that the cause of the great quarrel between Greeks and Persians shall not be forgotten, and the question of cause runs through the whole work. Herodotus’s answer is multiple and unhurried. There is, in the Greek imagination he records, a long sequence of mutual abductions — Io, Europa, Medea, Helen — that the Persian historians cite, half-jokingly, as evidence that Asians and Europeans have always been at one another for the same kinds of reasons.`,
        `There is the rise of Lydian power under Croesus and the fall of Lydia to the Persians, which brings Persia to the edge of the Greek world. There is the Ionian Revolt of 499–494, in which Athens supports the rebellion of the Greek cities of Asia Minor against their Persian governors, and which gives Darius and then Xerxes a specific grievance against Athens. There is, more deeply, the Persian conviction that all of Asia is Persian by right and that any free Greek city is therefore an anomaly to be corrected.`,
        `And there is the irreducible factor of human ambition and divine reversal — the long pattern, which Herodotus traces with extraordinary care, in which a man or a people grows to greatness, becomes proud, attempts a reach beyond what their condition can sustain, and is brought down. Cyrus, Cambyses, Darius, and Xerxes each fit this pattern at different scales.`,
        `The narrative of cause is therefore at once political, personal, and metaphysical, and Herodotus does not separate the three in the way later historians have learned to. The war happens because of things people said to each other centuries before the first Persian ship crossed the Aegean, and also because a particular king in a particular mood listened to bad advice rather than good, and also because the structure of the cosmos does not allow any single power to grow without limit. All three explanations are present in the text. Herodotus does not choose between them.`,
      ],
      where: [
        { n: 1, label: 'Book I, Ch. 1 — the Persian account of Io' },
        { n: 4, label: 'Book I, Ch. 4 — the Greeks refuse the exchange' },
        { n: 153, label: 'Book I, Ch. 153 — Cyrus dismisses Greek traders' },
        { n: 762, label: 'Book V, Ch. 1 — the Ionian Revolt and Athens’s fateful decision' },
        { n: 1051, label: 'Book VII, Ch. 1 — Xerxes deliberates on invasion' },
      ],
    },
    {
      slug: 'ethnography',
      title: 'Ethnography and the Known World',
      preview: "More than half the Histories, by word count, is not about war at all. It is about peoples — their geography, customs, religion, and the strange ways they bury their dead and treat their cattle. Herodotus is the first writer in the Western tradition to take other cultures seriously on their own terms.",
      essay: [
        `More than half of the Histories, by word count, is not about war at all. It is about peoples — their geography, their customs, their religion, their forms of government, the strange ways they bury their dead and treat their cattle and reckon their years. Book II, on Egypt, is the longest sustained ethnographic treatise we have from antiquity, and the first one anywhere in the European tradition that attempts to describe a foreign culture on something like its own terms.`,
        `Herodotus believes that customs are local, and that a people’s customs make sense within the conditions of their land — climate, river, terrain, neighbours. The famous example is his treatment of the Persians and the Egyptians, both of whom he respects, both of whom he describes from the inside as much as he can. He records the Persian custom of debating important matters first drunk and then sober so that decisions can be tested under both conditions. He records that the Egyptians do everything backward — women go to market, men weave at home; men carry burdens on their heads, women on their shoulders. He is not condescending. He is curious.`,
        `The cosmopolitanism of the early chapters has, in modern times, given Herodotus a second life as one of the founders of comparative anthropology. Edward Said, who was sharply critical of much European ethnography of the East, made an exception for Herodotus’s seriousness about the cultures he described. Whether that judgment is right in detail, the Histories is the first work in the Western tradition that takes other peoples as worth careful description and not merely as enemies or barbarians.`,
        `The fact that the very word <em>barbarian</em> — foreign-tongued, non-Greek-speaking — does not in Herodotus carry the weight of contempt it later acquired is the simplest indicator of how he was working. A barbarian in the Histories can be admirable, wise, and worth listening to. Cyrus is a barbarian. So is Croesus, in his way. The category is linguistic, not moral. That distinction was not obvious to everyone in the fifth century BCE, and Herodotus’s maintenance of it is part of what makes the Histories remarkable.`,
      ],
      where: [
        { n: 10, label: 'Book I, Ch. 10 — Lydian customs introduced' },
        { n: 241, label: 'Book II, Ch. 1 — Egypt begins' },
        { n: 571, label: 'Book IV, Ch. 1 — Scythian customs in full' },
        { n: 762, label: 'Book V, Ch. 1 — Thracian customs' },
        { n: 1085, label: 'Book VII, Ch. 35 — the great catalogue of Xerxes’s nations' },
      ],
    },
    {
      slug: 'hubris-and-reversal',
      title: 'Hubris and Reversal',
      preview: "Herodotus has a doctrine of how power works in time: what rises far must fall. The pattern runs from Croesus on his pyre calling Solon’s name, through Cyrus dying foolishly beyond the Oxus, to Xerxes watching his fleet burn at Salamis. It is the shape of Greek tragedy moved into prose.",
      essay: [
        `Herodotus has a doctrine of how power works in time, and the doctrine shapes the entire arc of his narrative. The pattern, which he names without quite naming it, is that human prosperity is unstable — that what rises far must fall, that the gods do not let any greatness go uncorrected, that pride invites the reversal that brings it down.`,
        `In Book I the Lydian king Croesus, having reached the height of his wealth, is visited by the Athenian Solon. Croesus shows Solon his treasures and asks who in the world Solon would call most happy. Solon names two unknown Greeks who died well, and refuses to call Croesus happy because his life is not yet over. Croesus dismisses him. A year or two later Croesus’s beloved son is killed in a hunting accident; not long after, his kingdom falls to Cyrus; on the pyre on which Cyrus has ordered him burned, Croesus calls out three times the name of Solon, and Cyrus, hearing the name, asks what it means and is moved by the reply to spare him. The whole sequence is a single demonstration of the doctrine.`,
        `The same pattern operates at scale. Cyrus dies on a foolish campaign against the Massagetae beyond the Oxus. Cambyses dies in Egypt in disgrace. Darius’s first invasion of Greece is destroyed at Marathon. Xerxes’s vast invasion is broken at Salamis and Plataea. The doctrine has a metaphysical grain and a political grain, and Herodotus does not separate them. To overreach is to invite the reversal; the gods, or fortune, or the structure of the cosmos, do not allow any single human power to grow without limit.`,
        `The doctrine is the shape of Greek tragedy moved into prose, and it gives the Histories its moral seriousness without ever turning it into a sermon. Herodotus is not a moralist hammering a point; he is a historian who has noticed a pattern and reports it honestly, including the cases where it is complicated. Themistocles, the architect of Salamis, ends his life as a guest at the Persian court he defeated. The pattern does not always resolve neatly. It is a structural observation, not a guarantee.`,
      ],
      where: [
        { n: 30, label: 'Book I, Ch. 30 — Solon visits Croesus' },
        { n: 86, label: 'Book I, Ch. 86 — Croesus on the pyre calls Solon’s name' },
        { n: 214, label: 'Book I, Ch. 214 — Cyrus dies against the Massagetae' },
        { n: 1000, label: 'Book VI, Ch. 114 — Marathon and the reversal of Darius' },
        { n: 1261, label: 'Book VIII, Ch. 1 — Salamis and Xerxes on his throne' },
      ],
    },
    {
      slug: 'freedom-and-despotism',
      title: 'Freedom and Despotism',
      preview: "Underneath the multicultural curiosity of the Histories runs a steady preference: constitutional self-government produces a tougher kind of citizen than any empire can. The argument is made not by polemic but by accumulation — Thermopylae, Salamis, Plataea as its proof.",
      essay: [
        `Underneath the multicultural curiosity of the Histories runs a steady, unmistakable preference. Herodotus is a Greek of the fifth century, and he is convinced — and convinces his reader — that there is something in the constitutional life of the Greek city-states that produces, all things considered, a stronger and freer kind of human being than the great empires of the East are able to produce. The argument is made not by polemic but by accumulation.`,
        `The Persian system, however magnificent, depends on the will of one man; the Greek system, in the cities Herodotus most admires, depends on the laws those cities have given themselves. He records, in Book VII, the conversation between Xerxes and the exiled Spartan king Demaratus before Thermopylae. Xerxes asks how Greeks can possibly resist his enormous army when they are so few. Demaratus answers that the Greeks Xerxes is about to fight are fighting not for any king but for their own laws, and that they fear those laws more than Xerxes’s subjects fear him. The line is the heart of the book’s political theory.`,
        `The famous battles that follow — Thermopylae, Salamis, Plataea — are presented less as triumphs of military skill (though they are also that) than as vindications of the proposition Demaratus has stated. A people fighting for its own laws will, in extremity, do things a people fighting for a king will not. The Athenians evacuate their city, watch it burn, return after the war, and rebuild. This is the kind of thing free citizens do.`,
        `The doctrine has been read as Greek chauvinism, and it is, but it is also one of the founding statements of the Western political idea that constitutional self-government produces a different and tougher kind of citizen than autocracy can. The doctrine runs straight through to Pericles’s funeral oration in Thucydides a generation later, and from there into every later defence of free institutions. Book III also contains the first comparative discussion of constitutions in European literature: Otanes argues for democracy, Megabyzus for oligarchy, Darius for monarchy, before Darius wins and takes the throne.`,
      ],
      where: [
        { n: 481, label: 'Book III, Ch. 84 — the great debate on constitutions' },
        { n: 762, label: 'Book V, Ch. 1 — Ionian cities prefer self-rule to Persian order' },
        { n: 1123, label: 'Book VII, Ch. 73 — Demaratus explains Greek freedom to Xerxes' },
        { n: 1232, label: 'Book VII, Ch. 182 — Thermopylae begins' },
        { n: 1261, label: 'Book VIII, Ch. 1 — Salamis' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Herodotus',
      role: 'Author',
      body: "Born around 484 BCE in Halicarnassus, a Greek-speaking city on the southwestern coast of Asia Minor (modern Bodrum, Turkey), then under Persian rule. Of mixed Greek and Carian descent. Travels widely as a young man — Egypt, the Levant, Babylon, the Black Sea, southern Italy, mainland Greece. Spends time in Athens during the great period of the early Periclean democracy; recites portions of the Histories there to acclaim. Almost everything we know about his life is reconstructed from internal evidence in the work.",
    },
    {
      name: 'Croesus',
      role: 'Lydian king',
      body: "King of Lydia from 560 to 547 BCE, master of an immensely wealthy kingdom in western Asia Minor. Conquered by Cyrus the Great and brought to Persia, where he served as advisor to Cyrus and Cambyses. The opening books of the Histories use Croesus as the case study in hubris and reversal — the king who consults Delphi, receives an ambiguous oracle, destroys his own empire, and ends on a pyre calling Solon’s name.",
    },
    {
      name: 'Cyrus',
      role: 'Founder of Persia',
      body: "Founder of the Achaemenid Persian Empire. Reigns from around 559 to 530 BCE. Overthrows the Median king Astyages, conquers Lydia in 547, takes Babylon in 539, and creates an empire stretching from the Aegean to the Indus. Treated by Herodotus with genuine respect. Dies on a foolish campaign against the Massagetae beyond the Oxus — the first great figure to be destroyed by the overreach that the Histories charts throughout.",
    },
    {
      name: 'Darius',
      role: 'Persian king',
      body: "Third king of Persia, reigns from 522 to 486 BCE. Reorganises the empire into satrapies, builds the royal road from Susa to Sardis, founds Persepolis. Suppresses the Ionian Revolt, sends an expedition against Athens and Eretria that is defeated at Marathon in 490. Dies in 486 preparing a second expedition, which his son Xerxes inherits. Herodotus admires Darius as an organiser; Darius’s restraint contrasts with Xerxes’s overreach.",
    },
    {
      name: 'Xerxes',
      role: 'Antagonist',
      body: "King of Persia from 486 to 465 BCE, the central antagonist of Books VII–IX. Inherits his father’s plan to invade Greece, bridges the Hellespont, and marches an army of hundreds of thousands into mainland Greece. Watches from a throne as his fleet is destroyed at Salamis. Returns to Persia leaving his general Mardonius to finish the campaign; Mardonius is defeated and killed at Plataea. The great example, in the Histories, of how vast resources combined with imperial pride produce the reversal that destroys them.",
    },
    {
      name: 'Themistocles',
      role: 'Athenian architect of Salamis',
      body: "Athenian politician and general who persuades the Athenians to use the silver from the Laurion mines to build a fleet of two hundred triremes. When Xerxes invades, convinces the other Greek commanders to fight in the narrow strait of Salamis, where the Persian numerical advantage is neutralised. The fleet is destroyed; the war is effectively decided in a single day. A complicated figure in Herodotus — brilliant, devious, ultimately exiled from Athens and ending his life as a guest of the Persian king he had defeated.",
    },
    {
      name: 'Leonidas',
      role: 'Spartan king',
      body: "King of Sparta who commands the Greek forces at the pass of Thermopylae in 480 BCE. Leads three hundred Spartans and several thousand allies in three days of fighting against Xerxes’s whole army before a Greek traitor reveals a mountain path that allows the Persians to encircle them. Stays with those who cannot escape and dies fighting. His death becomes the Histories’ emblem for what free citizens will do in extremity — and for the gap between what a king commands and what a law can inspire.",
    },
  ],

  cast: [
    {
      name: 'Herodotus',
      role: 'AUTHOR',
      body: "Born around 484 BCE in Halicarnassus on the southwestern coast of Asia Minor. Travels widely — Egypt, the Levant, Babylon, the Black Sea, southern Italy, mainland Greece — gathering the testimony that fills the Histories. The founding figure of Western historiography, equally celebrated and attacked in antiquity and ever since.",
    },
    {
      name: 'Croesus',
      role: 'LYDIAN KING',
      body: "The opening case study of the whole work. His story — riches, pride, the warning of Solon, the fall, the pyre, and the last calling of Solon’s name — states the Histories’ doctrine of hubris and reversal more completely than anything else in the nine books.",
    },
    {
      name: 'Cyrus',
      role: 'PERSIAN FOUNDER',
      body: "Founder of the empire that the rest of the Histories is about. Treated with unusual respect by Herodotus for a foreign conqueror. Dies foolishly against the Massagetae, the first king in the long sequence of overreachers the Histories traces.",
    },
    {
      name: 'Darius',
      role: 'PERSIAN KING',
      body: "The organiser of the Persian Empire. His failed campaign against Scythia in Book IV and his defeat at Marathon in Book VI set the stage for Xerxes’s invasion. The restraint of his reign makes Xerxes’s excess more visible by contrast.",
    },
    {
      name: 'Xerxes',
      role: 'ANTAGONIST',
      body: "The central figure of the last three books. The man who bridged the Hellespont and marched half a continent into Greece, watched Thermopylae and Salamis from a throne, and returned to Persia leaving the war to others. The Histories’ great example of how vast resources meet their limit.",
    },
    {
      name: 'Leonidas',
      role: 'SPARTAN KING',
      body: "The commander of Thermopylae. His three hundred Spartans are the most famous soldiers in antiquity. His death — chosen, knowingly, with eyes open — is what Herodotus means when he says free citizens fight differently from subjects.",
    },
    {
      name: 'Themistocles',
      role: 'ATHENIAN STRATEGIST',
      body: "The architect of Salamis. Built the Athenian fleet before the war came, manoeuvred the Greek commanders into the narrow strait that saved Greece, and lived to be exiled and end his life at the Persian court. The most brilliant and the most troubling of the Greek figures in the work.",
    },
  ],

  castGroups: [
    {
      label: 'The Persian kings',
      characters: [
        { id: 'cyrus', tag: 'KING', name: 'Cyrus', epithet: 'Founder of the empire', body: "Reigns 559–530 BCE. Overthrows Media, conquers Lydia and Babylon. Treated with respect by Herodotus as a just founder. Dies on a foolish campaign against the Massagetae.", appears: range(71, 214) },
        { id: 'cambyses', tag: 'KING', name: 'Cambyses', epithet: "Cyrus's son", body: "Conquers Egypt in 525 BCE. Behaves erratically and sacrilegiously, in Herodotus’s account, stabbing the sacred Apis bull and killing his own brother. Dies in disgrace returning from Egypt.", appears: range(400, 480) },
        { id: 'darius', tag: 'KING', name: 'Darius', epithet: 'Organiser of empire', body: "Reigns 522–486 BCE. Comes to the throne through conspiracy after Cambyses. Reorganises the empire, campaigns against Scythia, suppresses the Ionian Revolt, and sends the expedition that fails at Marathon.", appears: range(481, 1050) },
        { id: 'xerxes', tag: 'KING', name: 'Xerxes', epithet: 'The invader', body: "Reigns 486–465 BCE. Decides, against Artabanus’s advice, to invade Greece with an army of overwhelming size. Watches Thermopylae and Salamis from a throne. Returns to Persia when the war is lost.", appears: range(1051, 1410) },
      ],
    },
    {
      label: 'The Greeks',
      characters: [
        { id: 'croesus', tag: 'KING', name: 'Croesus', epithet: 'Rich as Croesus', body: "The Lydian king whose wealth, pride, and fall open the whole work. His story is the Histories’ first and clearest statement of the pattern that governs everything that follows.", appears: range(1, 90) },
        { id: 'leonidas', tag: 'KING', name: 'Leonidas', epithet: 'King of Sparta', body: "Commands the Greek forces at Thermopylae. Stays with his three hundred to die when the Persians find the mountain path. His death is the work’s emblem of what citizenship at its best can demand and produce.", appears: range(1224, 1260) },
        { id: 'themistocles', tag: 'GENERAL', name: 'Themistocles', epithet: 'Architect of Salamis', body: "Built the Athenian fleet before the war, manoeuvred the Greek commanders into the narrow strait of Salamis, destroyed the Persian fleet in a single afternoon. Exiled from Athens and died as a guest of the Persian court.", appears: range(887, 1410) },
        { id: 'pausanias', tag: 'GENERAL', name: 'Pausanias', epithet: 'Spartan regent, victor at Plataea', body: "Commands the Greek land forces at Plataea in 479. Defeats and kills the Persian general Mardonius. Later disgraced for negotiating with Persia.", appears: range(1441, 1525) },
      ],
    },
    {
      label: 'Advisors and witnesses',
      characters: [
        { id: 'solon', tag: 'SAGE', name: 'Solon', epithet: 'Athenian lawgiver', body: "The Athenian who visits Croesus and refuses to call him happy while he is still alive. Appears only in Books I and III but names the doctrine the Histories is built on.", appears: [30, 31, 32, 86] },
        { id: 'artabanus', tag: 'ADVISOR', name: 'Artabanus', epithet: "Xerxes's uncle", body: "Argues against the invasion of Greece and against the bridging of the Hellespont. Herodotus uses him as the voice of reason that power overrules. His counsel summarises the Histories’ doctrine of reversal.", appears: range(1051, 1090) },
        { id: 'demaratus', tag: 'EXILE', name: 'Demaratus', epithet: 'Exiled Spartan king', body: "Travels with Xerxes after his exile from Sparta. Gives Xerxes the famous answer about why Greeks fighting for their own laws will resist an army fighting for a king. The political theory of the Histories in a single conversation.", appears: range(1123, 1258) },
      ],
    },
  ],

  chapterLabel: n => "Chapter " + n,

  chapters,
};

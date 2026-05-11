// Acts of the Apostles — SEO page data for build-seo-pages.cjs
// Luke, c. 80-90 CE. The second volume of the two-volume work that begins with the Gospel of Luke.
// Voice: literary, declarative present. Treat the text as text — for faithful and secular readers alike.

const chapters = require('/tmp/bible-acts-chunk-1.json');

module.exports = {
  id: 'bible-acts',
  title: 'Acts of the Apostles',
  author: 'Luke (traditional)',
  byline: 'c. 80–90 CE · New Testament · Christian origins narrative',
  titleAccent: 'a guided tour',
  hook: 'A small group of disciples in a locked room in Jerusalem become, in three decades, a movement that reaches Rome. This is the only narrative we have of the first generation of Christianity.',
  themesBlurb: 'The Spirit, geography, apostolic figures, the Jerusalem Council, the abrupt ending.',
  castBlurb: 'Jerusalem to Rome',
  castDesc: 'The apostles, converts, and officials who carry the gospel from Judea to the empire.',
  chapterLabel: n => 'Acts ' + n,
  genre: ['History', 'New Testament', 'Early Christianity'],

  about: [
    `<em>Acts of the Apostles</em> is the only narrative we have of the first generation of Christianity. It picks up exactly where the Gospel of Luke ends — the disciples gathered in Jerusalem after the resurrection — and carries the story forward three decades, to Paul under house arrest in Rome, awaiting trial before Caesar, preaching the kingdom of God openly and unhindered. No other book of the New Testament does this. Without Acts, we would have only Paul's letters and the gospels to reconstruct the earliest church, and the reconstruction would be guesswork.`,
    `The book is organized around a single verse, spoken by the risen Jesus just before the ascension: <em>you shall be my witnesses in Jerusalem, and in all Judea and Samaria, and to the end of the earth</em> (1:8). Twenty-eight chapters later, the gospel is in Rome. The structure is the argument. Luke is not writing biography or theology in the abstract — he is writing a narrative of a movement spreading across the Roman empire, blocked at every turn and getting through anyway. The last word of the book in Greek is <em>akōlytōs</em>: unhindered.`,
  ],
  chaptersSubtitle: 'All 28 chapters — from the ascension in Jerusalem to house arrest in Rome.',
  chaptersLead: `<p>Acts divides into four movements: Jerusalem (1–7), the widening mission through Judea and Samaria (8–12), Paul's three missionary journeys through Asia Minor and Greece (13–21), and the long arrest sequence from Jerusalem to Rome (21–28). Chapter 15 — the Jerusalem Council — is the structural pivot. Everything before it points toward it; everything after is its consequence.</p>`,
  themesByline: 'Five threads through the book',
  themesLead: `Acts is a book with an argument: that the spread of the gospel is not the achievement of the apostles but the action of the Spirit through them — and that no human authority has been able to stop it. These five threads trace that argument from Pentecost to Rome.`,

  groups: [
    { label: "Jerusalem · Acts 1–7", subtitle: "Pentecost, the early community, Stephen’s speech and martyrdom.", chapters: [1, 2, 3, 4, 5, 6, 7] },
    { label: "Wider mission · Acts 8–12", subtitle: "Philip, the Ethiopian, Paul’s conversion, Peter and Cornelius, Herod’s death.", chapters: [8, 9, 10, 11, 12] },
    { label: "Paul’s journeys · Acts 13–21", subtitle: "Three missionary circuits from Antioch through the eastern Mediterranean.", chapters: [13, 14, 15, 16, 17, 18, 19, 20, 21] },
    { label: "Arrest and Rome · Acts 22–28", subtitle: "Paul before councils and kings, the shipwreck on Malta, and the word that reaches the capital.", chapters: [22, 23, 24, 25, 26, 27, 28] },
  ],

  themes: [
    {
      slug: 'pentecost-and-the-spirit',
      title: 'Pentecost and the Spirit',
      preview: 'The narrative engine of Acts is the Holy Spirit, and the engine starts in chapter 2. The disciples in Jerusalem on Shavuot, tongues of fire, languages from across the empire — and three thousand baptized in a day. Luke is making a theological argument that will run for twenty-eight chapters: the apostles are not the protagonists of their own story.',
      essay: [
        `Fifty days after Passover, on the festival of Shavuot — called Pentecost in Greek, the celebration of the giving of the law at Sinai — the disciples are gathered together in one place in Jerusalem. There is a sound like a rushing mighty wind. Tongues as of fire come to rest on each of them. They are all filled with the Holy Spirit and begin to speak in other languages. The crowd in Jerusalem for the festival — pilgrims from across the Mediterranean and the Near East — hears the disciples each in his own language. Luke names the languages with a deliberateness that is the inverse of the tower of Babel. There the languages were scattered as a judgment; here they are gathered into a single intelligibility, not by everyone speaking one language but by each person hearing his own.`,
        `Peter stands and preaches the first Christian sermon. He quotes the prophet Joel — <em>in the last days, says God, I will pour out my Spirit on all flesh</em> — and applies the prophecy to what has just happened. He retells the story of Jesus, the crucifixion and resurrection, and applies Psalm 16 to it: God has made him both Lord and Messiah, this Jesus whom you crucified. The crowd is cut to the heart and asks what they should do. Peter says: repent and be baptized in the name of Jesus Christ for the forgiveness of your sins, and you shall receive the gift of the Holy Spirit. Three thousand are baptized that day.`,
        `What Pentecost establishes is the pattern the rest of the book follows. The Spirit is the active force; the disciples are instruments; the result is preaching, baptism, and the formation of communities. Every major turning point in Acts is initiated by the Spirit. The Spirit sends Philip to the Ethiopian eunuch in chapter 8. The Spirit tells Peter to go with the men from Cornelius's house in chapter 10. The Spirit sets apart Barnabas and Saul from Antioch in chapter 13. The Spirit forbids Paul to enter Bithynia in chapter 16, redirecting him toward Macedonia and the first European mission. The book is saturated with this language. Luke is making, throughout, an argument that the apostles are usually surprised by what they end up doing. Peter is surprised that he is going to Cornelius's house. The Jerusalem church is surprised that Gentiles are receiving the Spirit. Paul is surprised by the Macedonian call. The disciples are not the protagonists of their own story.`,
      ],
      where: [
        { n: 2, label: "Acts 2 (Pentecost and Peter's sermon)" },
        { n: 8, label: 'Acts 8 (Philip and the Ethiopian)' },
        { n: 10, label: 'Acts 10 (the great sheet at Joppa)' },
        { n: 13, label: 'Acts 13 (the Spirit sends Barnabas and Saul)' },
        { n: 16, label: 'Acts 16 (the Macedonian call)' },
      ],
    },
    {
      slug: 'from-jerusalem-to-rome',
      title: 'From Jerusalem to Rome',
      preview: 'Acts 1:8 is the table of contents for all twenty-eight chapters. The narrative does exactly what the verse says: Jerusalem, Judea and Samaria, the end of the earth. The last word of the book in Greek is <em>akōlytōs</em> — unhindered. Luke ends on that word because that is the point.',
      essay: [
        `<em>You shall be my witnesses in Jerusalem, and in all Judea and Samaria, and to the end of the earth</em> — Acts 1:8, spoken by the risen Jesus just before the ascension. The verse is the table of contents for the book. The narrative does exactly what the verse says it will do. Chapters 1–7 are Jerusalem. Chapter 8 begins with the scattering after Stephen's stoning, which sends the disciples into Judea and Samaria; chapter 8 itself is the Samaritan mission of Philip. Chapters 9–12 widen the circle further, into the coastal cities and into Antioch, where the disciples are first called Christians and where the Gentile mission begins in earnest.`,
        `From chapter 13 forward, the geographical reach expands with each journey. Cyprus, southern Asia Minor, central Asia Minor, then across the Aegean into Macedonia and Greece — Philippi, Thessalonica, Athens, Corinth — then back to Asia Minor for the long Ephesus years, then back through Greece and back to Jerusalem, and from there under guard to Caesarea, by sea to Sidon and Crete and Malta, and finally to Rome. The end of the earth, in the geography of Luke's audience, is Rome. The empire's capital is the natural endpoint of the narrative because Rome is, for the writer's purposes, the symbolic and political horizon of the world the early Christians lived in.`,
        `The book ends with Paul there, under house arrest, awaiting his trial before Caesar — which never appears in the narrative — welcoming all who come to him, preaching the kingdom of God and teaching the things concerning the Lord Jesus Christ with all boldness, unhindered. The last word of the book in Greek is <em>akōlytōs</em> — unhindered. Luke ends on that word because the book has been an argument that the gospel cannot be hindered. Every effort to suppress it has failed. The Sanhedrin tried in Jerusalem; Stephen was killed and the gospel went out into Samaria. Herod killed James and imprisoned Peter; Peter was rescued by an angel. Paul was arrested in Jerusalem; Roman tribunes protected him. Storms and shipwrecks have not stopped him. He is now in Rome. The apostle's eventual death — probable under Nero in the mid-60s — is not narrated because, on Luke's reading, it is not the point.`,
      ],
      where: [
        { n: 1, label: 'Acts 1:8 (the programmatic verse)' },
        { n: 8, label: 'Acts 8 (scattering into Samaria)' },
        { n: 13, label: 'Acts 13 (the first journey begins)' },
        { n: 17, label: 'Acts 17 (Athens and the Areopagus)' },
        { n: 28, label: 'Acts 28 (Rome — akōlytōs)' },
      ],
    },
    {
      slug: 'peter-and-paul',
      title: 'Peter and Paul',
      preview: 'Acts is built around two great figures in deliberate symmetry. Peter carries the first half (chapters 1–12); Paul carries the second (13–28). The order is theologically careful: Peter opens the door to the Gentiles first. Paul walks through it.',
      essay: [
        `Acts is structured around two great figures, and the symmetry of the structure is part of the writing. Peter is the protagonist of the first half (chapters 1–12), Paul of the second (13–28). The transition is gradual. Peter's last major scene is his miraculous escape from Herod's prison in chapter 12; Paul's first missionary journey begins in chapter 13. The two meet at the Jerusalem Council in chapter 15; after that, Peter disappears entirely from the narrative.`,
        `Luke's portrait of Peter is consistent with the gospel's portrait. He is impulsive, devoted, often surprised by what God is doing. He preaches at Pentecost, heals a lame man at the temple gate, defies the Sanhedrin (<em>we must obey God rather than men</em>), is delivered from prison by an angel. Most importantly, he is the first apostle to baptize a Gentile. The Cornelius episode in chapters 10–11 is the structural pivot. Peter has a vision at Joppa of a great sheet let down from heaven full of all kinds of unclean animals; a voice tells him to kill and eat; he refuses; the voice replies: <em>what God has cleansed, you must not call common</em>. The vision repeats three times. As Peter is wondering what it means, men arrive from Cornelius's house in Caesarea, asking him to come. He goes. He preaches. The Spirit falls on the Gentile household before he has finished speaking. He has them baptized.`,
        `Paul's portrait is more complex. He appears first as the young Pharisee Saul, holding the cloaks of those who stone Stephen. In chapter 9 he is on the road to Damascus, meaning to arrest Christians there, when he is struck blind by a vision of the risen Jesus and converted. Luke tells the conversion story three times in the book — once as narrator in chapter 9, once in Paul's defense before the Jerusalem crowd in chapter 22, once before King Agrippa in chapter 26. The repetition is deliberate. The two figures together carry the book's theological argument. Peter, the disciple of Jesus, opens the door to the Gentiles. Paul, the former persecutor turned apostle, walks through it and carries the gospel to the empire. The order matters. Luke is at pains to show that the Gentile mission is not a Pauline innovation against the Jerusalem apostles but a development that began with Peter, was confirmed at the Jerusalem Council, and was carried forward by Paul with full apostolic backing.`,
      ],
      where: [
        { n: 2, label: 'Acts 2 (Peter at Pentecost)' },
        { n: 9, label: 'Acts 9 (Paul on the Damascus road)' },
        { n: 10, label: 'Acts 10 (Peter and Cornelius)' },
        { n: 15, label: 'Acts 15 (both at the Jerusalem Council)' },
        { n: 26, label: 'Acts 26 (the third conversion account)' },
      ],
    },
    {
      slug: 'the-jerusalem-council',
      title: 'The Jerusalem Council',
      preview: 'Chapter 15 is the structural centre of Acts and the most consequential meeting in early Christian history. The question: must Gentile converts be circumcised? The answer changes everything.',
      essay: [
        `Acts 15 is the structural centre of the book and the most consequential meeting in early Christian history. The question is whether Gentile converts to the Christian movement must be circumcised and keep the law of Moses. Some men from Judea have been teaching in Antioch that without circumcision they cannot be saved. Paul and Barnabas have argued against them. The dispute cannot be settled in Antioch, and the church sends them to Jerusalem to put the question to the apostles and elders.`,
        `The meeting itself is described with surprising restraint. There is much debate. Peter stands and reminds the council of what happened with Cornelius — God who knows the heart bore witness to them, giving them the Holy Spirit just as he did to us, and made no distinction between us and them, having cleansed their hearts by faith. Why then are you putting God to the test by placing on the necks of the disciples a yoke that neither our fathers nor we have been able to bear? Paul and Barnabas describe the signs and wonders God has done among the Gentiles through them. James, the brother of the Lord, who appears here as the leading figure in the Jerusalem church, gives the verdict: his judgment is that the Gentiles not be troubled, and need only abstain from food sacrificed to idols, from blood, from what has been strangled, and from sexual immorality. No circumcision. A letter is sent to the Gentile churches.`,
        `The decision is one of the most consequential in the history of religion. It cuts the cord that had tied the new movement to the boundaries of Israel and makes possible the transformation of a Jewish messianic sect into a religion that could spread across the Roman empire and beyond. Without the Jerusalem Council, there is no Gentile Christianity in any form modern readers would recognize. With it, the door is open, and the Pauline mission of chapters 13–28 can do what it does. Luke's careful framing — the speeches in order, the Spirit's role explicit, the consensus of the apostles and elders — is his argument that the decision was not a Pauline coup but the considered judgment of the whole apostolic church together.`,
      ],
      where: [
        { n: 10, label: 'Acts 10–11 (Cornelius — the founding precedent)' },
        { n: 15, label: 'Acts 15 (the council itself)' },
        { n: 21, label: 'Acts 21 (Paul reports back to Jerusalem)' },
      ],
    },
    {
      slug: 'the-abrupt-ending',
      title: 'The abrupt ending',
      preview: 'Paul has survived a hurricane, a shipwreck, a snake bite, and two years of Roman custody. He is now in Rome, awaiting trial before Caesar. The trial never comes. The book ends mid-story. The last word is <em>unhindered</em>. The choice is deliberate.',
      essay: [
        `The last verse of Acts is unexpectedly brief, and readers have noticed for two thousand years that the book does not end the way one would expect. Paul has been on trial in Caesarea before the governors Felix and Festus, has appealed as a Roman citizen to the emperor's court, has been put on a ship for Italy, has survived a hurricane and a shipwreck off Malta, and has finally arrived in Rome. The book gives one chapter to his arrival and to the meetings with the Jewish community there. Then the closing two verses: he lived there two whole years at his own expense, and welcomed all who came to him, preaching the kingdom of God and teaching about the Lord Jesus Christ with all boldness and without hindrance. The book ends. There is no trial, no verdict, no death.`,
        `What happened to Paul? Early Christian tradition holds that he was tried, possibly released for a time, and finally executed under Nero, probably in the mid-60s, beheaded by sword as a Roman citizen on the Ostian Way outside Rome. Luke, writing twenty or thirty years later, would have known what happened. He chooses not to tell the reader. The ending is deliberate. The book is not the biography of Paul; it is the story of how the gospel reached the ends of the earth. By the end of chapter 28, the gospel is in Rome, being preached openly and without hindrance. The final word of the book in Greek is <em>akōlytōs</em> — unhindered — and Luke ends on it because that is the point.`,
        `The ending also leaves the reader in a particular position. The book stops while the work is unfinished. The kingdom is being preached in Rome, but the world has not been reached; the imperial trial has not happened; the apostle is alive and teaching. The narrative is open. The implication, for the reader of the next generation and every generation after, is that the work continues. Luke's last word is an instruction the book never quite says aloud: keep going.`,
      ],
      where: [
        { n: 25, label: 'Acts 25 (the appeal to Caesar)' },
        { n: 27, label: 'Acts 27 (the shipwreck)' },
        { n: 28, label: 'Acts 28 (Rome — the final word)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Peter', role: 'Apostle, protagonist of Acts 1–12', body: `The protagonist of the first half and the bridge between Jesus and the Gentile mission. Preaches the first Christian sermon at Pentecost, defies the Sanhedrin, is delivered from Herod's prison by an angel. The structural pivot is his vision of the great sheet at Joppa and his baptism of Cornelius the Roman centurion — the first Gentile baptism, performed by the leading Jerusalem apostle, that makes the Pauline mission of the second half possible.` },
    { name: 'Paul', role: 'Apostle, protagonist of Acts 13–28', body: `Appears first as Saul the Pharisee, consenting to the stoning of Stephen. Converted on the road to Damascus — a story Luke tells three times — he becomes the most important figure in the expansion of the gospel into Asia Minor, Macedonia, Greece, and Rome. Arrested in Jerusalem, he spends two years under guard in Caesarea, appeals to Caesar as a Roman citizen, survives shipwreck on Malta, and arrives in Rome. The book ends with him there, awaiting a trial that never appears in the narrative.` },
    { name: 'Stephen', role: 'First martyr', body: `One of the seven appointed to serve the community in Jerusalem. His speech before the Sanhedrin in chapter 7 — the longest in Acts, retelling the entire Hebrew Bible as a pattern of Israel's resistance to God's messengers — ends with his execution by stoning. The young Saul holds the cloaks of those who throw the stones. Stephen's death triggers the scattering that begins the wider mission.` },
    { name: 'Cornelius', role: 'Roman centurion, the founding Gentile', body: `A centurion of the Italian Cohort at Caesarea, a devout man who feared God and prayed continually. His vision in chapter 10 sends men to fetch Peter. Peter's vision of the great sheet of unclean animals runs in parallel. When Peter arrives and preaches, the Spirit falls on Cornelius's household before the sermon is finished — the founding precedent that the Jerusalem Council will cite when settling the question of Gentile inclusion.` },
    { name: 'Lydia', role: 'First European convert', body: `A businesswoman from Thyatira living in Philippi, a dealer in expensive purple cloth and a worshipper of God. She meets Paul in chapter 16 by the river outside the city, where women have gathered for prayer on the sabbath. The Lord opens her heart to listen. She is baptized along with her household and immediately offers her house as a base for the mission. The church at Philippi meets in her house; Paul's letter to that church, written from prison years later, is the most affectionate he ever sent.` },
  ],

  cast: [
    {
      name: 'Peter',
      role: 'APOSTLE',
      body: `The protagonist of the first half of Acts. Preaches the first Christian sermon at Pentecost in chapter 2 and sees three thousand baptized. Heals a lame man at the temple gate, defies the Sanhedrin, is delivered from Herod's prison by an angel. The structural pivot is his vision at Joppa — <em>what God has cleansed, you must not call common</em> — and his baptism of Cornelius the Roman centurion, the first Gentile baptism, performed by the leading Jerusalem apostle. He disappears from the narrative after the Jerusalem Council in chapter 15.`,
    },
    {
      name: 'Paul',
      role: 'APOSTLE',
      body: `The protagonist of the second half. Appears first as the young Pharisee Saul, holding the cloaks of those who stone Stephen. Converted on the road to Damascus in chapter 9 — blind for three days, then sight restored through the disciple Ananias — he begins preaching the very faith he had set out to destroy. Three missionary journeys carry the gospel through Cyprus, Asia Minor, Macedonia, Greece, and Ephesus. Arrested in Jerusalem, transferred to Caesarea, shipwrecked on Malta, he arrives in Rome in chapter 28 to preach the kingdom of God, unhindered.`,
    },
    {
      name: 'Stephen',
      role: 'FIRST MARTYR',
      body: `One of the seven appointed in chapter 6 to oversee the daily distribution of food to the widows. Full of the Spirit and of wisdom. Brought before the Sanhedrin on charges of speaking against the temple and the law, his defense in chapter 7 is the longest single speech in Acts — a retelling of Israel's history as a pattern of resisting God's messengers. The speech ends with a direct accusation and a vision of the Son of Man at God's right hand. The crowd drags him outside and stones him; he dies asking forgiveness for his killers. The young Saul holds the cloaks. Stephen's death is the trigger for the wider mission.`,
    },
    {
      name: 'Cornelius',
      role: 'ROMAN CENTURION',
      body: `A centurion of the Italian Cohort stationed at Caesarea — the Roman administrative capital of Judea — a devout man who feared God with all his household. In chapter 10 he sees an angel and sends men for Peter. Peter arrives, preaches, and the Spirit falls on Cornelius's household before the sermon is finished. Peter orders them baptized. The episode is the structural pivot of the first half of the book and the founding precedent the Jerusalem Council will cite when settling the question of Gentile inclusion.`,
    },
    {
      name: 'Lydia',
      role: 'FIRST EUROPEAN CONVERT',
      body: `A businesswoman from Thyatira living in Philippi in Macedonia, a dealer in purple cloth and a worshipper of God. She meets Paul in chapter 16 by the river outside the city on the sabbath. The Lord opens her heart to listen. She is baptized along with her household and immediately offers her house as a base for the mission. The church at Philippi meets in her house. Luke's portrait of Lydia is one of the clearest examples of his consistent attention to women as agents in their own right.`,
    },
    {
      name: 'The Jerusalem Council',
      role: 'DELIBERATIVE BODY',
      body: `The meeting in chapter 15 of the apostles, the elders, and representatives from Antioch, called to settle whether Gentile converts must be circumcised and keep the law of Moses. Peter recalls the precedent of Cornelius; Paul and Barnabas describe signs worked among the Gentiles; James, the brother of the Lord and leader of the Jerusalem church, cites Amos and gives the ruling. The decision — no circumcision required — is the structural pivot of the whole book and one of the most consequential decisions in the history of religion.`,
    },
  ],

  castGroups: [
    {
      label: 'The apostles',
      characters: [
        {
          id: 'peter',
          tag: 'Apostle',
          name: 'Peter',
          epithet: 'Protagonist of Acts 1–12',
          body: `The leading figure of the Jerusalem church and the protagonist of the first half of Acts. Preaches at Pentecost. Heals at the temple gate. Defies the Sanhedrin. Escapes Herod's prison through an angel. His baptism of Cornelius the Roman centurion — the founding Gentile conversion — is the structural pivot that makes the Pauline mission possible. Disappears from the narrative after chapter 15.`,
          appears: [1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 15],
        },
        {
          id: 'paul',
          tag: 'Apostle',
          name: 'Paul',
          epithet: 'Protagonist of Acts 13–28',
          body: `First appears as Saul the Pharisee, consenting to the stoning of Stephen and holding the cloaks of those who throw the stones. Converted on the road to Damascus — struck blind by a vision of the risen Jesus, sight restored three days later through Ananias — he becomes the book's dominant figure from chapter 13 onward. His three missionary journeys, his arrest in Jerusalem, his years under guard in Caesarea, his shipwreck on Malta, and his arrival in Rome to preach unhindered are the spine of the second half.`,
          appears: [7, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
        },
      ],
    },
    {
      label: 'Key figures',
      characters: [
        {
          id: 'stephen',
          tag: 'Martyr',
          name: 'Stephen',
          epithet: 'First Christian martyr',
          body: `One of the seven appointed to serve the Jerusalem community. Brought before the Sanhedrin, he delivers the longest speech in Acts — a retelling of Israel's history as a pattern of resisting God's messengers. He dies by stoning outside the city, asking forgiveness for his killers. His death triggers the scattering that begins the wider mission. The young Saul holds the cloaks of those who throw the stones.`,
          appears: [6, 7],
        },
        {
          id: 'cornelius',
          tag: 'Centurion',
          name: 'Cornelius',
          epithet: 'First Gentile baptized by Peter',
          body: `A Roman centurion stationed at Caesarea, devout and generous, a worshipper of God. His vision in chapter 10 sends men to fetch Peter. Peter's simultaneous vision of the great sheet of unclean animals runs in parallel. When Peter arrives and preaches, the Spirit falls on the household before the sermon is finished. This episode — Peter baptizing a Gentile by manifest divine initiative — is the founding precedent for the Jerusalem Council's ruling.`,
          appears: [10, 11],
        },
        {
          id: 'lydia',
          tag: 'Convert',
          name: 'Lydia',
          epithet: 'First European convert',
          body: `A businesswoman from Thyatira living in Philippi, a dealer in expensive purple cloth and a worshipper of God. She meets Paul at the riverside prayer gathering in chapter 16. The Lord opens her heart; she is baptized along with her household and immediately offers her house as the Philippian mission's base. The church at Philippi meets in her house. The most affectionate of Paul's letters will be sent there years later.`,
          appears: [16],
        },
        {
          id: 'the-jerusalem-council',
          tag: 'Body',
          name: 'The Jerusalem Council',
          epithet: 'The meeting that opened the door',
          body: `The apostles, elders, and representatives from Antioch, gathered in chapter 15 to decide whether Gentile converts must be circumcised. Peter recalls Cornelius; Paul and Barnabas report signs among the Gentiles; James rules. The decision — no circumcision required — cuts the cord between the new movement and the boundaries of Israel and makes possible everything that follows in the book.`,
          appears: [4, 15],
        },
      ],
    },
    {
      label: 'Roman officials',
      characters: [
        {
          id: 'felix',
          tag: 'Governor',
          name: 'Felix',
          epithet: 'Roman governor of Judea',
          body: `The governor before whom Paul appears in chapter 24 after his transfer from Jerusalem to Caesarea. He listens to Paul's defense and is moved enough to call for him repeatedly and hear him speak. He keeps Paul under guard for two years, hoping for a bribe. He is succeeded by Festus, who reopens the case.`,
          appears: [24],
        },
        {
          id: 'festus',
          tag: 'Governor',
          name: 'Festus',
          epithet: 'Roman governor, successor to Felix',
          body: `The governor who reopens Paul's case in chapter 25 after succeeding Felix. When Festus suggests sending Paul back to Jerusalem for trial — a move that would expose him to assassination — Paul invokes his right as a Roman citizen: <em>I appeal to Caesar</em>. Festus has no choice but to send him to Rome. He discusses the case with King Agrippa before doing so.`,
          appears: [25, 26],
        },
        {
          id: 'agrippa',
          tag: 'King',
          name: 'Agrippa II',
          epithet: 'King of Chalcis, before whom Paul speaks',
          body: `The client king of a small territory in northern Palestine, present in Caesarea in chapter 25 when Festus is uncertain how to frame Paul's case for Nero. Agrippa hears Paul's defense in chapter 26 — Paul's third and most elaborate retelling of his Damascus road conversion. Agrippa's verdict to Festus is dry: <em>This man could have been set free if he had not appealed to Caesar</em>.`,
          appears: [25, 26],
        },
      ],
    },
  ],

  chapters,
};

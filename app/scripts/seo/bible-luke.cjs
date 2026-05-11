// Luke — SEO page data for build-seo-pages.cjs
// Gospel of Luke, c. 80-90 CE. The longest gospel and the most carefully crafted in literary Greek.
// Voice: literary, declarative present. Scholarly/historical framing throughout.

const chapters = require('/tmp/bible-luke-chunk-1.json');

module.exports = {
  id: 'bible-luke',
  title: 'Luke',
  author: 'Anonymous (traditionally Luke the companion of Paul)',
  byline: 'c. 80-90 CE · New Testament · Third Gospel',
  titleAccent: 'a guided tour',
  hook: 'An anonymous Greek historian addresses Theophilus, promises an orderly account of the things fulfilled among us, and gives us the manger, the good Samaritan, the prodigal son, and the road to Emmaus.',
  themesBlurb: 'The marginalized, the Holy Spirit, the parables Luke alone preserves, the journey to Jerusalem, the road to Emmaus.',
  castBlurb: 'The Gospel of Luke',
  castDesc: 'The figures of the third gospel, from the hill country of Judea to the upper room in Jerusalem.',
  chapterLabel: n => 'Luke ' + n,
  genre: ['Gospel', 'New Testament', 'Ancient biography'],

  about: [
    `<em>Luke</em> is the first half of a two-volume work composed somewhere in the Greek-speaking eastern Mediterranean in the 80s CE. The author writes polished literary Greek superior to Mark's and to most of the New Testament; he has read Mark and used it as a source; he shares with Matthew a sayings collection scholars call Q; and he has access to material no other gospel preserves — stories, parables, infancy narratives, the road to Emmaus. The book opens with a formal preface in the manner of Hellenistic historiography, addressed to a certain Theophilus, in which the author states he has investigated everything carefully and writes so that Theophilus may know the truth concerning the things about which he has been instructed.`,
    `The structure is clear and deliberate. Chapters 1 and 2 give the infancy narratives: two angelic annunciations, the Magnificat, the nativity at Bethlehem, the shepherds in the fields, the presentation in the temple where Simeon and Anna recognize the child. Chapters 3 through 9 are the Galilean ministry. Then at 9:51 the gospel turns on a hinge: <em>he set his face to go to Jerusalem.</em> From that verse through chapter 19 runs Luke's long travel narrative, unique among the gospels, where most of his distinctive parables live — the good Samaritan, the prodigal son, Lazarus and the rich man, the Pharisee and the tax collector, Zacchaeus. The Jerusalem chapters move quickly to the trial, the passion, and a resurrection chapter told with the deliberate patience of a writer who knows exactly what he is doing. The story does not end here; the second volume picks up at the ascension.`,
  ],
  chaptersSubtitle: 'All 24 chapters, from the angel in the temple to the ascension at Bethany.',
  chaptersLead: `<p>Luke's 24 chapters divide into four movements. The infancy narrative (1-2) gives the canticles and the Christmas story. The Galilean ministry (3-9:50) opens with John's preaching and ends with the transfiguration. At 9:51 the long travel narrative begins — ten chapters of teaching on the road to Jerusalem, where Luke's great parables are gathered. The Jerusalem section (19-24) moves through the passion to the resurrection morning, the walk to Emmaus, and the ascension at Bethany.</p>`,
  themesByline: 'Five threads through the gospel',
  themesLead: `Luke is the most literary of the four evangelists and the most deliberate about what he includes. His distinctive emphases — the Spirit, the poor, the great parables, the journey motif, the patient resurrection chapter — are not accidents of source material. They are a theological program expressed through narrative selection and arrangement.`,

  groups: [
    { label: 'Infancy narrative', subtitle: 'Two annunciations, three canticles, a manger, and the boy in the temple.', chapters: [1, 2] },
    { label: 'Galilean ministry', subtitle: 'The baptism, the temptation, Nazareth, the calling, and the transfiguration.', chapters: [3, 4, 5, 6, 7, 8, 9] },
    { label: 'Central Section — the journey south', subtitle: 'He set his face to go to Jerusalem. The great parables gather on the road.', chapters: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19] },
    { label: 'Jerusalem ministry and passion', subtitle: 'The entry, the temple controversies, the last supper, trial, and cross.', chapters: [20, 21, 22, 23] },
    { label: 'Resurrection', subtitle: 'The empty tomb at dawn, seven miles to Emmaus, and the ascension at Bethany.', chapters: [24] },
  ],

  themes: [
    {
      slug: 'marginalized',
      title: 'The Gospel for the Marginalized',
      preview: 'Of the four gospels, Luke is the one most consistently attentive to the people the ancient world overlooked. Women, the poor, Samaritans, tax collectors, lepers, foreigners, the elderly — they appear with a frequency and dignity in Luke that they do not have in Mark or Matthew.',
      essay: [
        `The pattern is set in the opening chapters. The first canticle in the gospel is the Magnificat, sung by an unmarried pregnant teenager from a small town in Galilee, and it is one of the most politically charged poems in the Bible: he has scattered the proud in the imagination of their hearts, he has put down the mighty from their thrones and exalted those of low degree, he has filled the hungry with good things and sent the rich away empty. The first witnesses to the birth, in chapter 2, are not magi from the east but shepherds — herdsmen on the night shift, the kind of working men no other Mediterranean infancy narrative would have bothered to put in the room.`,
        `Luke gives Jesus his programmatic sermon at Nazareth in chapter 4, where he reads from Isaiah: the Spirit of the Lord is upon me, because he has anointed me to preach good news to the poor, to proclaim release to the captives and recovery of sight to the blind, to set at liberty those who are oppressed. The audience starts proud and ends ready to throw him off a cliff. Luke alone tells the parable of the good Samaritan, in which the foreigner outperforms the priest and the Levite. Luke alone has the line about the women who travelled with the disciples and supported the ministry out of their own resources. Luke alone has the parable of the prodigal son's father, who runs to embrace a returning son in a culture where dignified men did not run.`,
        `The accumulation is not accidental. Luke is making an argument by selection. The kingdom of God arrives in his telling among the people the world has not been counting. The proud and the rich and the religiously secure are not damned in his gospel — but they are warned, repeatedly and specifically, that the kingdom is coming for the others first, and that whether they will recognize it when it arrives is an open question.`,
      ],
      where: [
        { n: 1, label: 'Luke 1 (the Magnificat)' },
        { n: 4, label: 'Luke 4 (Isaiah at Nazareth)' },
        { n: 10, label: 'Luke 10 (the good Samaritan)' },
        { n: 15, label: 'Luke 15 (the prodigal son)' },
      ],
    },
    {
      slug: 'holy-spirit',
      title: 'The Holy Spirit at Work',
      preview: 'Luke names the Spirit more often than any other gospel — about twenty times across the book, against five or six in Mark. For Luke the Spirit is not a vague divine atmosphere but the active power by which God moves the story forward.',
      essay: [
        `The pattern begins in the first chapter. John the Baptist is filled with the Holy Spirit even in the womb. Mary conceives by the Spirit. Elizabeth, when Mary greets her, is filled with the Spirit and recognizes what no one else yet knows. Zechariah, when his tongue is loosed at the naming of John, is filled with the Spirit and prophesies. Simeon comes to the temple led by the Spirit and recognizes the child. The Spirit descends on Jesus at his baptism in the bodily form of a dove; the Spirit drives him into the wilderness; he returns to Galilee in the power of the Spirit; he reads at Nazareth the verse <em>the Spirit of the Lord is upon me</em>, and announces that today this scripture is fulfilled in your hearing.`,
        `The Spirit is the through-line. Luke does not present a Jesus who acts on his own initiative against a backdrop of divine absence; he presents a Jesus moved at every step by the same Spirit who has moved every other significant figure in the gospel. The pattern is what makes the second volume of Luke's work — Acts — make sense. When the Spirit comes on the disciples at Pentecost in Acts 2, it is not a new development but the continuation of what the Spirit has been doing throughout the gospel.`,
        `The doctrine has practical edges. For Luke, the Spirit is the engine of inclusion. In the gospel the same dynamic is already visible: the Spirit moves the story toward the people the religious establishment is not expecting. To read Luke without attending to the Spirit is to miss the gospel's account of how God works. He works, on Luke's reading, by getting inside ordinary people and changing what they can do.`,
      ],
      where: [
        { n: 1, label: 'Luke 1 (Spirit fills Elizabeth, Zechariah)' },
        { n: 3, label: 'Luke 3 (descent of the Spirit at baptism)' },
        { n: 4, label: 'Luke 4 (Spirit drives Jesus to the wilderness)' },
        { n: 11, label: 'Luke 11 (the Father gives the Holy Spirit)' },
      ],
    },
    {
      slug: 'parables',
      title: 'The Parables Luke Alone Preserves',
      preview: 'About a third of Luke\'s gospel consists of material no other gospel has, and the densest cluster of that material is the long travel narrative from 9:51 to 19:27 — the section where the great parables live, and only here.',
      essay: [
        `The good Samaritan, in chapter 10, in which a man going down from Jerusalem to Jericho is robbed and left for dead, and a priest passes by, and a Levite passes by, and a Samaritan — a member of a despised neighbouring people — stops, treats his wounds, takes him to an inn, and pays for his care. The parable was told to a lawyer who had asked who counts as my neighbour, and it answers his question by changing it: not who is my neighbour, but who acts as one.`,
        `The prodigal son, in chapter 15, in which a younger son demands his inheritance, leaves home, wastes it in a far country, comes to himself in a pig pen, decides to go home as a hired servant, and is met on the road by his father, who runs to him, embraces him, kisses him, and orders the fatted calf killed for a feast. The older son, who has stayed home and worked, refuses to come in. The parable ends with the father's pleading and not with the older son's answer; the question of whether the older son will come to the feast is left to the reader. Luke's careful word choice — the father saw him while he was yet a great way off, and had compassion, and ran — is unmatched in concision in any of the gospels.`,
        `Lazarus and the rich man, in chapter 16, in which a rich man feasts daily while a beggar named Lazarus dies at his gate covered in sores, and after death Lazarus is carried to Abraham's bosom and the rich man is in torment. The Pharisee and the tax collector, in chapter 18, in which the Pharisee thanks God that he is not like other people and the tax collector stands far off and beats his breast and says God be merciful to me a sinner, and goes home justified. Zacchaeus the chief tax collector, short, climbing a sycamore tree to see Jesus pass, and Jesus calling him by name. What these parables share is precision and reversal: the expected hero fails; the despised outsider acts; the careful religious man goes home unjustified; the wastrel is welcomed.`,
      ],
      where: [
        { n: 10, label: 'Luke 10 (good Samaritan)' },
        { n: 15, label: 'Luke 15 (prodigal son)' },
        { n: 16, label: 'Luke 16 (Lazarus and the rich man)' },
        { n: 18, label: 'Luke 18 (Pharisee and tax collector)' },
      ],
    },
    {
      slug: 'jerusalem',
      title: 'He Set His Face to Go to Jerusalem',
      preview: 'Luke 9:51 is one of the most carefully placed sentences in the gospel. When the days drew near for him to be received up, he set his face to go to Jerusalem. Everything after it is movement, deliberate and eyes-open, toward the city where the gospel will end.',
      essay: [
        `The phrase <em>he set his face</em> is biblical and old. It echoes Isaiah 50:7 (I have set my face like flint, and I know that I shall not be put to shame), part of the suffering servant material that Luke and the early Christians took as foundational. The Greek verb <em>stērizō</em> means to set firmly, to make resolute, to fix in place. Jesus is not drifting toward Jerusalem; he is going. He knows what is there. He has already told his disciples, three times, that the Son of Man must suffer many things and be rejected by the elders and chief priests and scribes and be killed and on the third day rise.`,
        `What Luke uses the long journey for is teaching. Most of the distinctive material — the great parables, the controversies, the meals with sinners and Pharisees, the warnings about wealth, the instructions to the seventy — is gathered into these chapters. The disciples do not yet understand what Jerusalem will mean. The crowds do not yet understand. Jesus teaches them on the road. The reader, who knows what is coming, watches the teaching land or fail to land in figures who have not yet been told everything the reader has been told.`,
        `By the time the travel narrative ends and the entry into Jerusalem begins in chapter 19, the reader has been on the road long enough to feel the weight of the destination. The structure is one of the most sophisticated narrative devices in the gospels, and it is uniquely Lukan.`,
      ],
      where: [
        { n: 9, label: 'Luke 9:51 (the pivot)' },
        { n: 13, label: 'Luke 13 (lament over Jerusalem)' },
        { n: 19, label: 'Luke 19 (the entry)' },
        { n: 21, label: 'Luke 21 (Jerusalem discourse)' },
      ],
    },
    {
      slug: 'emmaus',
      title: 'The Road to Emmaus',
      preview: "Luke's resurrection chapter is patient in a way the other gospels' resurrection chapters are not. After the women report the empty tomb, the chapter follows two disciples seven miles to Emmaus — and back.",
      essay: [
        `Two disciples — one named Cleopas, one not named at all — are walking from Jerusalem to a village called Emmaus, about seven miles from the city. They are talking about everything that has happened. A stranger joins them on the road. He asks what they are discussing. They are amazed he does not know. They tell him the story: a prophet mighty in deed and word, condemned, crucified, the women's strange report this morning of an empty tomb. We had hoped, they say — three of the saddest words in the gospels — we had hoped that he was the one to redeem Israel.`,
        `The stranger answers them. He begins with Moses and goes through all the prophets, interpreting to them in all the scriptures the things concerning himself. They reach the village. He acts as if he is going further. They press him to stay; the day is far spent. He goes in. At the table, he takes the bread, blesses it, breaks it, gives it to them. Their eyes are opened. They recognize him. He vanishes from their sight. They get up that same hour and walk the seven miles back to Jerusalem.`,
        `The Emmaus scene is one of the most carefully written narratives in the New Testament. Luke does not have his risen Lord burst into the room in glory. He has him walk seven miles with two disappointed people who do not know who he is, listen to their grief, answer it from the scriptures, and reveal himself only at a meal, and only for a moment. The chapter is a warning to every reader who wants the resurrection to be obvious. In Luke, it is not obvious. It happens at table, it is recognized only afterward, and it sends the people who saw it walking back through the dark to tell what they have seen.`,
      ],
      where: [
        { n: 24, label: 'Luke 24 (the road to Emmaus)' },
        { n: 22, label: 'Luke 22 (the last supper — bread and cup)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Jesus', role: 'Teacher and Savior', body: `The Lukan Jesus eats with sinners and tax collectors at every opportunity; pays attention to women, Samaritans, and the poor; praises a foreigner's faith over a religious insider's, repeatedly. He is the Jesus of the great parables — the prodigal son's father, the good Samaritan, the Pharisee and the tax collector. He prays more in Luke than in any other gospel. At the end he prays for his executioners from the cross, promises the repentant thief a place in paradise, and dies with a verse from the Psalms. He rises on the third day and walks seven miles with two disappointed disciples before he lets them recognize him.` },
    { name: 'Mary', role: 'Mother of Jesus', body: `Luke gives Mary more material than any other gospel — the annunciation by Gabriel, the visit to Elizabeth, the Magnificat, the birth narrative, the presentation in the temple. The Magnificat she sings in 1:46-55 is one of the great political poems of the Bible, and Luke gives it to an unmarried pregnant teenager from a small town in Galilee without any sense that it is unusual for her to be the one who speaks it.` },
    { name: 'Elizabeth and Zechariah', role: 'Parents of John the Baptist', body: `An elderly priestly couple, both barren, both righteous. The angel Gabriel appears to Zechariah in the temple and tells him Elizabeth will bear a son named John. Zechariah doubts and is struck mute. When the pregnant Mary visits Elizabeth, the child in the womb leaps and Elizabeth is filled with the Spirit. At the naming of John, Zechariah's tongue is loosed and he prophesies the Benedictus. They hold the door open between the old prophetic order and what is about to begin.` },
    { name: 'Simeon and Anna', role: 'Temple witnesses', body: `Two elderly figures who recognize the infant Jesus when his parents bring him to the temple for the rite of purification. Simeon takes the child in his arms and sings the Nunc Dimittis: now let your servant depart in peace, for my eyes have seen your salvation. He warns Mary that a sword will pierce her own soul. Anna, an eighty-four-year-old widow, comes up at that very moment and speaks of the child to all who were waiting for the redemption of Jerusalem.` },
    { name: 'The Prodigal Son\'s Father', role: 'Central figure of the parable', body: `Not a person in the narrative but the figure on whom the parable of chapter 15 turns. He has two sons. When the younger returns from a far country in rags, the father sees him from a great distance, has compassion, runs — a thing dignified men did not do — embraces him, kisses him, calls for the best robe and the ring and the fatted calf. When the older son refuses to come in to the feast, the father goes out and pleads with him. The parable ends without telling us whether the older son comes in.` },
    { name: 'The Centurion at Capernaum', role: 'Gentile of faith', body: `The Roman centurion whose servant is sick at the point of death. He sends Jewish elders to ask Jesus for help; as Jesus approaches the house he sends a second message: do not trouble yourself, I am not worthy that you should come under my roof; but say the word, and let my servant be healed. I am a man under authority. Jesus marvels and turns to the crowd: I tell you, not even in Israel have I found such faith. Luke uses the centurion as one of many figures marking the slow extension of the gospel beyond the boundaries of Israel.` },
  ],

  castSubtitle: 'The Gospel of Luke — from the hill country of Judea to the upper room in Jerusalem.',
  castLead: `<p>Luke's cast is larger than Mark's and more carefully distributed across class, gender, and ethnicity than any other gospel. Women, foreigners, tax collectors, and the elderly appear throughout with speaking parts and names. The figures listed here are the ones who carry the gospel's distinctive theological weight.</p>`,
  castGroups: [
    {
      label: 'The central figure',
      characters: [
        { id: 'jesus', tag: 'Teacher', name: 'Jesus', epithet: 'The Lukan Christ', body: `The Lukan Jesus eats with sinners and tax collectors at every opportunity Luke gives him; pays attention to women and Samaritans; praises a foreigner's faith over a religious insider's, repeatedly. He is the Jesus of the great parables — the prodigal son's father, the good Samaritan, the lost sheep, the Pharisee and the tax collector. He prays more in Luke than in any other gospel, often alone on a mountain, often through the night. At the end he prays for his executioners from the cross, promises the repentant thief a place in paradise, and dies with a verse from the Psalms — Father, into your hands I commit my spirit. He rises on the third day and walks seven miles with two disappointed disciples before he lets them recognize him.`, appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] },
      ],
    },
    {
      label: 'Infancy figures',
      characters: [
        { id: 'mary', tag: 'Mother', name: 'Mary', epithet: 'Mother of Jesus', body: `Luke gives Mary more material than any other gospel — the annunciation by Gabriel in chapter 1, the visit to Elizabeth in the hill country, the Magnificat, the birth narrative, the presentation in the temple, the Simeon prophecy that a sword will pierce her own soul, the loss and finding of the twelve-year-old Jesus in the temple, and the recurring note that she pondered all these things in her heart. The Magnificat she sings in 1:46-55 is one of the great political poems of the Bible — the proud scattered, the mighty pulled down, the hungry filled, the rich sent empty away — and Luke gives it to her without any sense that it is unusual for an unmarried pregnant teenager from a small town in Galilee to be the one who speaks it.`, appears: [1, 2, 8, 24] },
        { id: 'zechariah', tag: 'Priest', name: 'Elizabeth and Zechariah', epithet: 'Parents of John the Baptist', body: `An elderly priestly couple in the hill country of Judea, both barren, both righteous before God. The angel Gabriel appears to Zechariah in the temple while he is offering incense and tells him Elizabeth will bear a son named John. Zechariah doubts and is struck mute until the boy is born. When the pregnant Mary visits Elizabeth in the sixth month, the child in her womb leaps, and Elizabeth is filled with the Spirit and recognizes Mary as the mother of her Lord. At the naming of John, Zechariah's tongue is loosed and he prophesies — the Benedictus, the second canticle of the gospel. Together they hold the door open between the old prophetic order and what is about to begin.`, appears: [1] },
        { id: 'simeon-anna', tag: 'Witness', name: 'Simeon and Anna', epithet: 'Temple witnesses', body: `Two elderly figures who recognize the infant Jesus when his parents bring him to the temple for purification. Simeon is a righteous and devout man to whom the Spirit had revealed that he would not see death before he had seen the Lord's anointed; he comes into the temple led by the Spirit, takes the child in his arms, and sings the Nunc Dimittis: now let your servant depart in peace, for my eyes have seen your salvation. He warns Mary that a sword will pierce her own soul also. Anna is an eighty-four-year-old widow who has lived in the temple in fasting and prayer; she comes up at that very moment, gives thanks, and speaks of the child to all who were waiting for the redemption of Jerusalem.`, appears: [2] },
      ],
    },
    {
      label: 'Key figures on the road',
      characters: [
        { id: 'centurion', tag: 'Gentile', name: 'The Centurion at Capernaum', epithet: 'A Roman officer of remarkable faith', body: `A Roman centurion whose servant is sick at the point of death. He does not approach Jesus directly — he sends Jewish elders who testify that he loves the Jewish nation and built their synagogue. As Jesus approaches, the centurion sends a second message: do not trouble yourself; I am not worthy that you should enter under my roof; but say the word and let my servant be healed. I am a man under authority, with soldiers under me. Jesus marvels — Luke uses the word for amazement that Jesus more usually elicits in others — and says he has not found such faith, not even in Israel.`, appears: [7] },
        { id: 'prodigal-father', tag: 'Parable', name: "The Prodigal Son's Father", epithet: 'Figure of the defining parable', body: `Not a person in the narrative but the central figure of the parable Jesus tells in chapter 15 — and the most carefully drawn figure in any of the gospels. He has two sons. The younger demands his inheritance and wastes it. When the younger comes to himself in a pig pen and decides to walk home as a hired servant, the father sees him from a great distance, has compassion, runs (a thing dignified men did not do in that culture), embraces him, kisses him, calls for the best robe and the ring and the fatted calf. When the older son refuses to come in, the father goes out and pleads with him. The parable ends without telling us whether the older son comes in. What God is, on the parable's reading, is whatever the father in the parable is.`, appears: [15] },
      ],
    },
  ],

  chapters: chapters.map(ch => ({
    n: ch.n,
    title: ch.title,
    tourTitle: ch.tourTitle,
    hook: ch.hook,
    tour: ch.tour,
    blurb: ch.blurb,
    summary: typeof ch.summary === 'string' ? JSON.parse(ch.summary) : ch.summary,
    appears: ch.appears,
    themes: ch.themes,
  })),
};

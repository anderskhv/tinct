// SEO content data for the Gospel According to Mark (c. 65-75 CE).
// The earliest of the four canonical gospels.
// Voice: literary, declarative present, attentive to the gospel's urgent register.

const chapters = require('/tmp/bible-mark-chunk-1.json');

module.exports = {
  id: 'bible-mark',
  bookId: 'bible-mark',
  title: 'Mark',
  author: 'Anonymous (traditionally John Mark)',
  byline: 'c. 65–75 CE · New Testament · Earliest Gospel',
  titleAccent: 'a guided tour',
  hook: 'The shortest, fastest gospel. The first chapter baptizes Jesus, drives him into the wilderness, and fills Capernaum with exorcisms and healings — all in forty verses. The favourite word is and immediately. The gospel ends at an empty tomb with the women fleeing in terror, having said nothing to anyone, for they were afraid.',
  themesBlurb: 'Urgency, the messianic secret, disciples who do not understand, the cross, the empty tomb.',
  castBlurb: 'Galilee and Jerusalem',
  castDesc: 'The people around Jesus in his ministry and his death.',
  chapterLabel: n => 'Mark ' + n,
  genre: ['Gospel', 'New Testament', 'Early Christian literature'],

  about: [
    `<em>Mark</em> is the shortest, fastest, and earliest of the four gospels — sixteen chapters, probably written in the late 60s or early 70s CE, around the time of the First Jewish Revolt and the destruction of the Jerusalem temple. The traditional ascription to John Mark, companion of Peter, is second-century; the author is anonymous. What is not in dispute is the book's particular register: rougher Greek than the other gospels, a favourite word in <em>kai euthus</em> (and immediately), no genealogy and no infancy narrative. The gospel opens at the Jordan River and does not slow down until Gethsemane.`,
    `The gospel is structured around the confession at Caesarea Philippi in chapter 8: before it, the question of who Jesus is stays open; after it, the gospel turns toward Jerusalem and the cross. Chapters 14 and 15 — the Passion narrative — are the only place the book slows. The centurion at the foot of the cross confesses <em>truly this man was the Son of God</em> — the only human to do so in the whole gospel. The oldest manuscripts end at 16:8, with the women fleeing the empty tomb in terror, having said nothing to anyone. The longer ending (16:9–20) is a second-century addition; most critical editions bracket it.`,
  ],
  chaptersSubtitle: 'All 16 chapters — from the Jordan River to the empty tomb.',
  chaptersLead: `<p>Mark divides naturally into three movements. The Galilean ministry (chapters 1–8:21) is the gospel at full speed: calling, healing, exorcism, controversy. The pivot at Caesarea Philippi (8:22–10) turns the gospel south, with three Passion predictions each followed by the disciples' incomprehension. Jerusalem and the Passion (chapters 11–16) bring the entry, the temple controversies, the apocalyptic discourse, the Passion narrative, and the empty tomb.</p>`,
  themesByline: 'Five threads through the earliest gospel',
  themesLead: `Mark is the gospel that invented the genre. The other three drew from it. Reading it is reading the form in its most urgent and least polished version — and in that roughness is the argument.`,

  groups: [
    { label: 'Galilean ministry · 1–8:21', subtitle: 'Calling, healing, exorcism, controversy — and immediate, always immediate.', chapters: [1, 2, 3, 4, 5, 6, 7, 8] },
    { label: 'Caesarea Philippi pivot to Jerusalem · 8:22–10', subtitle: 'Three Passion predictions; three revelations of incomprehension.', chapters: [9, 10] },
    { label: 'Jerusalem and the Passion · 11–16', subtitle: 'The entry, the temple, the cross, the centurion, the empty tomb.', chapters: [11, 12, 13, 14, 15, 16] },
  ],

  themes: [
    {
      slug: 'and-immediately',
      title: 'And immediately',
      greek: "kai euthus — the gospel's engine",
      preview: "Mark's gospel runs faster than the other three. The favourite word is kai euthus — and immediately — and it appears more than forty times in sixteen chapters. The first chapter alone uses it eleven times. The speed is the gospel's argument.",
      essay: [
        `Mark's gospel runs faster than the other three. The favourite word is <em>kai euthus</em>, <em>kai euthos</em>, <em>kai euthys</em> — and immediately, and at once, and straightaway — and it appears more than forty times in sixteen chapters. The first chapter alone uses it eleven times. Jesus is baptized and immediately the heavens tear open; immediately the Spirit drives him into the wilderness; he calls the first disciples and they immediately leave their nets; they go to Capernaum and immediately on the Sabbath he enters the synagogue; the unclean spirit cries out and immediately he comes out of the man; immediately his fame spreads through all the surrounding region.`,
        `What the speed does is refuse the reader the comfortable distance of contemplation. The other three gospels arrange the material at different paces — Matthew gives long discourses, Luke gives long travel narratives, John gives sustained dialogues — and the reader can pause inside the arrangement. Mark refuses to pause. The episodes follow each other without transition; the connectives are <em>kai</em> (and) and <em>kai euthus</em> (and immediately) where Greek narrative would normally use particles indicating logical or temporal relation. The effect, in Mark's Greek, is paratactic and breathless, the way a witness who has just come from the scene speaks.`,
        `The argument the speed makes is that the announcement of Jesus is news, in the sense in which urgent news is told. The very title of the book — <em>euangelion</em>, the gospel, literally the good announcement — is a word that in the Roman world was used for the proclamation of military victories and imperial accessions. Mark uses it in 1:1 to introduce his book and in 1:14–15 to summarize what Jesus preaches: the time is fulfilled, and the kingdom of God is at hand; repent and believe in the gospel. The genre Mark invents is the genre of urgent announcement. The speed is the form's first feature, and Mark is the only gospel where the speed has not been slowed by literary smoothing.`,
      ],
      where: [
        { n: 1, label: 'Mark 1 (eleven uses in one chapter)' },
        { n: 4, label: 'Mark 4 (parables slowing the pace)' },
        { n: 14, label: 'Mark 14 (the first sustained slowing — Gethsemane)' },
      ],
    },
    {
      slug: 'messianic-secret',
      title: 'The messianic secret',
      greek: 'William Wrede named it in 1901',
      preview: 'Throughout the gospel, when demons recognize Jesus and shout his identity, he silences them. When he heals, he charges silence. The pattern is deliberate and consistent: the identity cannot be properly understood except through the cross.',
      essay: [
        `One of the most distinctive features of Mark's gospel is the pattern that William Wrede in 1901 called the messianic secret. Throughout the gospel, when the demons recognize Jesus and shout out his identity — <em>I know who you are, the Holy One of God</em> (1:24); <em>you are the Son of God</em> (3:11); <em>what have you to do with me, Jesus, Son of the Most High God?</em> (5:7) — Jesus immediately silences them. When he heals the leper, he charges him to say nothing to anyone (1:44). After the transfiguration, he charges Peter, James, and John to tell no one what they had seen until the Son of Man should have risen from the dead (9:9). The pattern runs through the gospel and is clearly a deliberate compositional decision.`,
        `The theological work the secret does is to refuse premature recognition of Jesus' identity. The demons can name him correctly — Son of the Most High God — but their naming is not yet the right naming, because they are naming him as a powerful exorcist, not as the suffering Messiah who will go up to Jerusalem and be killed. Even Peter, when he confesses Jesus as the Christ in chapter 8, is given the strictest charge to tell no one — and immediately afterward is rebuked as Satan when he objects to the prediction of suffering. <em>Get behind me, Satan, for you are not setting your mind on the things of God, but on the things of men.</em>`,
        `The secret is broken at exactly two moments, both at the cross. The first is the trial: <em>Are you the Christ, the Son of the Blessed?</em> Jesus answers, <em>I am.</em> It is the only place in Mark where Jesus accepts a christological title in his own voice without qualifying or silencing it. The second is the centurion at the foot of the cross: <em>Truly this man was the Son of God</em> (15:39). The centurion is the only human being in Mark's gospel to make the confession, and he does so at the moment of Jesus' death. The pattern is exact. The identity kept secret for fifteen chapters is finally announced in the immediate context of the death — because in Mark's gospel, the death is what the identity means.`,
      ],
      where: [
        { n: 1, label: 'Mark 1 (first silencing of the demons)' },
        { n: 8, label: "Mark 8 (Peter's confession and the rebuke)" },
        { n: 9, label: 'Mark 9 (the transfiguration charge)' },
        { n: 15, label: "Mark 15 (the centurion's confession)" },
      ],
    },
    {
      slug: 'disciples-who-do-not-understand',
      title: 'The disciples who do not understand',
      greek: '"Do you not yet understand?"',
      preview: 'If the demons know exactly who Jesus is, the disciples are with him throughout and do not understand. After the feeding of the five thousand, the gospel says explicitly: they did not understand about the loaves, but their hearts were hardened.',
      essay: [
        `If the demons in Mark's gospel know exactly who Jesus is and are silenced, the disciples are with Jesus throughout and do not understand him. They are with him for the storm at sea in chapter 4, and after he calms it they say <em>who then is this, that even the wind and sea obey him?</em> — a year into the ministry. They are with him for the feeding of the five thousand in chapter 6, and the gospel says explicitly in 6:52 that <em>they did not understand about the loaves, but their hearts were hardened.</em> After the second feeding of the four thousand in chapter 8, they are in the boat worrying that they have only one loaf — and Jesus launches into the longest string of questions in the gospel: <em>Do you not yet perceive or understand? Are your hearts hardened? Having eyes do you not see, and having ears do you not hear?</em>`,
        `The incomprehension is not an accident of characterisation. After Caesarea Philippi, each of the three Passion predictions is followed by an episode in which the disciples reveal they have heard the words and missed the point. After the first prediction, Peter rebukes Jesus and is called Satan. After the second, the disciples are arguing about who is the greatest. After the third, James and John ask for the seats at his right and left in glory. At Gethsemane, Jesus asks them to watch with him; they sleep. At the arrest, they all desert him and flee. Peter's denials are described in detail. At the cross, the named witnesses watching from afar are the women who had followed from Galilee.`,
        `The gospel's portrait of the disciples has been read in different ways. The early-church reading was that they represent the believers who must learn slowly and through failure. More recent readings hold both: the disciples are exemplary in their being-with Jesus and in their failure to understand him, and the gospel's structural argument is that the failure is the believer's, not just theirs. The gospel ends at 16:8 with the women also failing — fleeing in fear, having said nothing to anyone. The reader is left at the empty tomb with the announcement made and no one yet having carried it. The next sentence is the reader's.`,
      ],
      where: [
        { n: 4, label: 'Mark 4 (who then is this?)' },
        { n: 6, label: 'Mark 6 (they did not understand the loaves)' },
        { n: 8, label: 'Mark 8 (do you not yet understand?)' },
        { n: 14, label: 'Mark 14 (they all desert him)' },
      ],
    },
    {
      slug: 'cross-and-centurion',
      title: 'The cross and the centurion',
      greek: '"Truly this man was the Son of God"',
      preview: 'The Passion narrative is the first sustained piece of slow narration in a gospel that runs at speed. The centurion who has been at the foot of the cross for three hours makes the confession the disciples could not make in sixteen chapters.',
      essay: [
        `The Passion narrative in Mark's gospel is the longest sustained piece of slow narration in the book. Where the rest of the gospel runs at the speed of <em>kai euthus</em>, the events of chapters 14 and 15 are given in detail and at length. The anointing at Bethany, the Last Supper, Gethsemane, the arrest, the trial before the Sanhedrin, the trial before Pilate, the mocking, the crucifixion, the cry of dereliction, the death, the centurion's confession, the burial — each is given its due. The slowing is structural. The gospel that has been racing has arrived at what it has been racing toward.`,
        `The crucifixion itself is given in three timed acts, each marked by the hour. They crucified him at the third hour. From the sixth hour there was darkness over the whole land until the ninth hour. At the ninth hour, Jesus cried with a loud voice, <em>Eloi, Eloi, lema sabachthani</em> — which is, <em>my God, my God, why have you forsaken me?</em> The cry is in Aramaic; Mark transliterates and then translates. It is the opening line of Psalm 22. Jesus utters a loud cry and breathes his last. The curtain of the temple is torn in two, from top to bottom.`,
        `And then the centurion who was standing facing him, when he saw that he thus breathed his last, said, <em>Truly this man was the Son of God.</em> He is a Roman officer, a Gentile, a representative of the empire that has just executed Jesus, and he is the first and only human being in Mark's gospel to confess Jesus as Son of God. The disciples have been with Jesus for sixteen chapters and have not got it; the centurion has been at the foot of the cross for three hours and has. The confession is the climax of the gospel's christological argument. The identity that has been the secret all along is finally announced by a human voice at the moment of the death — because the death is what the title means.`,
      ],
      where: [
        { n: 14, label: 'Mark 14 (Gethsemane and the arrest)' },
        { n: 15, label: 'Mark 15 (the crucifixion and the centurion)' },
      ],
    },
    {
      slug: 'empty-tomb',
      title: 'The empty tomb and the ending at fear',
      greek: '"They said nothing to anyone, for they were afraid"',
      preview: 'The oldest manuscripts end at 16:8. Three women come to the tomb, find it empty, hear the announcement of resurrection, and flee in terror saying nothing to anyone. The longer ending (16:9–20) is a second-century addition. The gospel Mark wrote ends at the tomb.',
      essay: [
        `The Gospel of Mark, in the oldest and best manuscripts, ends at 16:8. Three women — Mary Magdalene, Mary the mother of James, and Salome — come to the tomb very early on the first day of the week. They enter, see a young man in white who tells them Jesus has risen and to go and tell the disciples and Peter that he is going before them to Galilee. <em>And they went out and fled from the tomb, for trembling and astonishment had seized them; and they said nothing to anyone, for they were afraid.</em> <em>Ephobounto gar</em> — for they were afraid — ends a sentence with the conjunction <em>gar</em> (for), which is unusual in Greek. It ends the gospel without a resurrection appearance, without the women obeying, without Galilee being reached.`,
        `Later scribes were uncomfortable with the ending; the longer ending (16:9–20) is a second-century addition that adds resurrection appearances and a brief commission, and there is also a shorter ending in some manuscripts. The argument for the originality of the ending at 16:8 is decisive on textual grounds — the verse 8 ending is in Codex Sinaiticus and Codex Vaticanus; the longer ending uses a different vocabulary; and multiple competing endings in the manuscript tradition is the pattern that develops when an unsatisfactory ending is being supplemented by later hands.`,
        `What the gospel does, by ending at 16:8, is hand the resurrection back to the reader. The young man's announcement is given. <em>He is not here; he has risen; he is going before you to Galilee; there you will see him.</em> Galilee is where the gospel began. The reader who has followed from chapter 1 has been at Capernaum, at the lake, on the mountain, at the foot of the cross. The instruction sends the reader back to Galilee — to the beginning of the gospel — to find the risen Jesus where the calling of the disciples and the first <em>kai euthus</em> had happened. The empty tomb does not close the story; it opens it. The gospel ends at 16:8, and the next sentence is the reader's.`,
      ],
      where: [
        { n: 16, label: 'Mark 16 (the empty tomb and the ending at fear)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Jesus', role: 'Driven Messiah', body: `The Markan Jesus is the most urgent of the four gospel portraits — driven into the wilderness by the Spirit, moving from Capernaum to the lake to the surrounding villages and back, often misunderstood, often impatient with the disciples' incomprehension, often touching the unclean (the leper, the menstruant, the corpse). He silences the demons who name him correctly and accepts the title Christ from Peter only with the immediate qualification that the Son of Man must suffer. His authority is unmistakable to the crowds and to the demons, hidden from the disciples, and finally legible at the cross to the centurion. The cry of dereliction at the ninth hour — my God, my God, why have you forsaken me? — is given without softening; the gospel records only the loud cry and the breath.` },
    { name: 'The Disciples', role: 'Those who do not get it', body: `Mark's portrait of the Twelve is the most exposed and least flattering in the four gospels. They are called in chapter 1 and leave their nets immediately; from there they fail to understand the parables, the loaves, who Jesus is, Gethsemane, and at the arrest they all desert him and flee. The gospel uses them as a structural device — every Passion prediction is followed by an episode revealing their incomprehension. The reader is being asked to recognise themselves in the failure.` },
    { name: 'Peter', role: 'First and denying', body: `First disciple called (1:16–18); first to confess Jesus as the Christ at Caesarea Philippi (8:29); immediately rebuked as Satan when he objects to the prediction of suffering. He swears in the upper room that he will not deny Jesus, denies him three times in the courtyard during the trial, and goes out and weeps. The young man at the empty tomb mentions him by name in the announcement to the women: tell his disciples and Peter.` },
    { name: 'Mary Magdalene', role: 'Witness', body: `One of the women who had followed Jesus from Galilee and ministered to him there. Named among those watching from afar at the cross (15:40). She and the other Mary see where the body is laid (15:47). At dawn on the first day of the week she returns to the tomb with the others, finds it empty, hears the announcement of the resurrection, and flees in fear. She is the figure of the faithful witness whose courage held at the cross when the male disciples had fled, and whose voice at the tomb falls silent in fear.` },
    { name: 'The Centurion', role: 'First confessor', body: `The Roman centurion who stood facing Jesus during the three hours on the cross. He sees the manner of Jesus' breath at the ninth hour and says the line that closes the gospel's christological argument: truly this man was the Son of God (15:39). He is the only human being in Mark's gospel to make that confession. He has no name. He is, in the gospel's structure, the figure of the reader who has read through to the cross and is being asked to make the confession the gospel has been waiting for.` },
    { name: 'Pilate', role: 'Procurator', body: `Pontius Pilate, prefect of Judea from 26 to 36 CE. Mark's portrait is brief and tactical: Pilate recognises the chief priests have handed Jesus over out of envy (15:10), tries to release him via the Passover custom, and finally gives the crowd what they demand. In Mark he marvels at Jesus' silence (15:5) and hands him over to be crucified to satisfy the crowd. The Markan Pilate is a Roman administrator solving a political problem; the gospel neither exonerates nor vilifies him beyond the simple narration of what he does.` },
  ],

  cast: [
    {
      name: 'Jesus',
      role: 'DRIVEN MESSIAH',
      body:
        'The Markan Jesus is the most urgent of the four gospel portraits — driven into the wilderness by the Spirit, moving from Capernaum to the lake to the surrounding villages and back, often misunderstood, often impatient with the disciples\' incomprehension, often touching the unclean (the leper, the menstruant, the corpse). He silences the demons who name him correctly and accepts the title Christ from Peter only with the immediate qualification that the Son of Man must suffer. His authority is unmistakable to the crowds and to the demons, hidden from the disciples, and finally legible at the cross to the centurion. The cry of dereliction at the ninth hour — my God, my God, why have you forsaken me? — is given by Mark without softening; the gospel does not record a saying after it, only the loud cry and the breath.',
    },
    {
      name: 'The Disciples',
      role: 'THOSE WHO DO NOT GET IT',
      body:
        "Mark's portrait of the Twelve is the most exposed and least flattering in the four gospels. They are called in chapter 1 and they leave their nets immediately; from there they fail to understand the parables, fail to understand the loaves, fail to understand who Jesus is, fail to keep watch in Gethsemane, and at the arrest they all desert him and flee. The gospel uses them as a structural device — every prediction of the Passion is followed by an episode revealing their incomprehension — and the device is deliberate. The gospel's reader is being asked to recognize themselves in the disciples' failure and to do, at the empty tomb, what the disciples did not do at the cross.",
    },
    {
      name: 'Peter',
      role: 'FIRST AND DENYING',
      body:
        'Simon, called Peter. The first disciple called (1:16–18); the host at Capernaum whose mother-in-law Jesus heals (1:29–31); one of the three taken apart for the raising of Jairus\'s daughter (5:37), the transfiguration (9:2–8), and Gethsemane (14:33). He confesses Jesus as the Christ at Caesarea Philippi (8:29) and is immediately rebuked as Satan when he objects to the prediction of suffering. He swears in the upper room that he will not deny Jesus and is told that before the cock crows twice he will deny him three times (14:30). In the courtyard during the trial he denies him three times; the cock crows the second time; he goes out and weeps. The young man at the empty tomb mentions him by name: tell his disciples and Peter.',
    },
    {
      name: 'Mary Magdalene',
      role: 'WITNESS',
      body:
        'One of the women who had followed Jesus from Galilee and ministered to him there. Named in 15:40 among those watching from afar at the cross. She and the other Mary see where the body is laid (15:47). At dawn on the first day of the week she returns to the tomb with the others, finds it empty, hears the announcement of the resurrection from the young man in white, flees in fear, and says nothing to anyone. She is the figure of the faithful witness whose courage held at the cross when the male disciples had fled, and whose voice at the tomb falls silent in fear.',
    },
    {
      name: 'Pilate',
      role: 'PROCURATOR',
      body:
        'Pontius Pilate, prefect of Judea from 26 to 36 CE, the Roman governor before whom Jesus is tried. Mark\'s portrait is brief and tactical; Pilate recognises that the chief priests have handed Jesus over out of envy (15:10), tries to release him via the Passover custom, and finally gives the crowd what they demand. In Mark, Pilate marvels at Jesus\' silence (15:5), gives the crowd the choice that they take by demanding Barabbas, and hands Jesus over to be crucified to satisfy the crowd. He is the figure through whom the empire executes Jesus.',
    },
    {
      name: 'The Centurion at the Cross',
      role: 'FIRST CONFESSOR',
      body:
        'The Roman centurion who stood facing Jesus during the three hours on the cross. He sees the manner of Jesus\' breath at the ninth hour and says the line that closes the gospel\'s christological argument: truly this man was the Son of God (15:39). He is the only human being in Mark\'s gospel to confess Jesus as Son of God in his own voice. The disciples have been with Jesus for sixteen chapters and have not made the confession; the centurion has been at the foot of the cross for three hours and makes it. He has no name. He is, in the gospel\'s structure, the figure of the reader who has read the gospel through to the cross and is being asked to make the confession the gospel has been waiting for.',
    },
  ],

  castSubtitle: 'Galilee and Jerusalem — the people around Jesus in his ministry and his death.',
  castLead: `<p>Mark's cast is dominated by Jesus and the failure of those closest to him to understand him. The demons know his identity; the disciples do not. The women hold at the cross when the men have fled. The centurion confesses what sixteen chapters of discipleship could not produce.</p>`,
  castGroups: [
    {
      label: 'Jesus',
      characters: [
        {
          id: 'jesus',
          tag: 'Messiah',
          name: 'Jesus',
          epithet: 'Son of God, driven Messiah',
          body: `The Markan Jesus is the most urgent of the four gospel portraits — driven by the Spirit, moving from Capernaum to the lake to the surrounding villages, often touching the unclean, often impatient with incomprehension. He silences the demons who name him correctly and accepts the title Christ from Peter only with the immediate qualification that the Son of Man must suffer. His authority is unmistakable to the crowds and to the demons, hidden from the disciples, and finally legible at the cross to the centurion.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        },
      ],
    },
    {
      label: 'The disciples',
      characters: [
        {
          id: 'peter',
          tag: 'Mortal',
          name: 'Peter',
          epithet: 'First called, first denying',
          body: `Simon, called Peter. First disciple called (1:16–18). He confesses Jesus as the Christ at Caesarea Philippi (8:29) and is immediately rebuked as Satan when he objects to the prediction of suffering. He swears in the upper room that he will not deny Jesus; in the courtyard during the trial he denies him three times; the cock crows the second time; he goes out and weeps. The young man at the empty tomb mentions him by name — tell his disciples and Peter.`,
          appears: [1, 5, 8, 9, 14, 16],
        },
        {
          id: 'disciples',
          tag: 'Mortal',
          name: 'The Twelve',
          epithet: 'Those who do not understand',
          body: `Called in chapter 1, they leave their nets immediately. From there they fail to understand the parables, the loaves, who Jesus is, Gethsemane. At the arrest they all desert him and flee. Mark uses them as a structural device: every Passion prediction is followed by an episode revealing their incomprehension. The reader is being asked to recognise themselves in the failure.`,
          appears: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14],
        },
      ],
    },
    {
      label: 'The women at the cross',
      characters: [
        {
          id: 'mary-magdalene',
          tag: 'Mortal',
          name: 'Mary Magdalene',
          epithet: 'Witness',
          body: `One of the women who had followed Jesus from Galilee and ministered to him there. Named among those watching from afar at the cross (15:40). At dawn on the first day of the week she returns to the tomb with the others, finds it empty, hears the announcement of the resurrection, and flees in fear saying nothing to anyone. She is the figure of the faithful witness whose courage held at the cross when the male disciples had fled.`,
          appears: [15, 16],
        },
      ],
    },
    {
      label: 'The authorities',
      characters: [
        {
          id: 'pilate',
          tag: 'Mortal',
          name: 'Pilate',
          epithet: 'Procurator of Judea',
          body: `Pontius Pilate, prefect of Judea from 26 to 36 CE. Mark's portrait is brief and tactical: Pilate recognises the chief priests have handed Jesus over out of envy (15:10), tries to release him via the Passover custom, and finally gives the crowd what they demand. He marvels at Jesus' silence (15:5) and hands him over to be crucified. He is the figure through whom the empire executes Jesus.`,
          appears: [15],
        },
        {
          id: 'centurion',
          tag: 'Mortal',
          name: 'The Centurion',
          epithet: 'First confessor',
          body: `The Roman officer standing at the foot of the cross for three hours. When Jesus breathes his last, the centurion says: truly this man was the Son of God (15:39). He is the only human being in Mark's gospel to confess Jesus as Son of God. He has no name. He is the figure of the reader who has read the gospel through to the cross and is being asked to make the confession the gospel has been waiting for.`,
          appears: [15],
        },
      ],
    },
  ],

  chapters,
};

// John — SEO page data for build-seo-pages.cjs
// Gospel of John, 21 chapters. c. 90-110 CE. The Fourth Gospel.
// Voice: literary, declarative present. Treat the text as text — for faithful and secular readers alike.

'use strict';
const chapters = require('/tmp/bible-john-chunk-1.json');

module.exports = {
  id: 'bible-john',
  title: 'John',
  author: 'Anonymous (traditionally John son of Zebedee; the Beloved Disciple)',
  byline: 'c. 90–110 CE · New Testament · Fourth Gospel',
  titleAccent: 'a guided tour',
  hook: 'The gospel that begins in eternity, not Bethlehem. Seven signs. Seven I am sayings. A Farewell Discourse four chapters long. And a resurrection scene in a garden where the risen Jesus speaks one word — a name — and is recognized.',

  genre: ['Gospel', 'New Testament', 'Ancient literature'],

  about: [
    `<em>John</em> is the latest of the four canonical gospels and the most theologically distinct. Where Mark, Matthew, and Luke share a basic narrative shape, John works on its own terms — long discourses instead of parables, seven carefully framed signs instead of crowds of healings, and a Jesus who speaks of himself as the Word made flesh, the bread of life, the light of the world, the resurrection and the life. The gospel opens in eternity (<em>in the beginning was the Word</em>) and ends with a breakfast on the beach in Galilee. Between those two scenes it produces some of the most quoted sentences in any literature, and a portrait of Jesus that has shaped Christian theology more than any other single book of the Bible.`,
    `The structure splits roughly in half. Chapters 1–12 are sometimes called the Book of Signs — the public ministry, the seven signs and the discourses they generate, the rising opposition from the religious authorities. Chapters 13–21 are the Book of Glory: the foot-washing at the last supper, the long Farewell Discourse (chapters 14–17, including the high-priestly prayer of chapter 17), the arrest, trial, crucifixion, resurrection, and post-resurrection appearances. John says plainly at the end why he wrote: <em>these are written so that you may believe that Jesus is the Christ, the Son of God, and that by believing you may have life in his name.</em>`,
  ],

  chaptersSubtitle: 'All 21 chapters — from the Word in eternity to breakfast on the beach.',
  chaptersLead: `<p>John falls into three movements: the Book of Signs (chapters 1–12), in which Jesus performs seven signs and the public controversy escalates; the Book of Glory (chapters 13–20), which begins with the foot-washing and ends with Thomas's confession; and a closing epilogue (chapter 21) on the beach at Tiberias. Twenty-one chapters total.</p>`,

  chapterLabel: n => 'John ' + n,

  groups: [
    {
      label: 'Book of Signs · Chapters 1–12',
      subtitle: 'The prologue, the seven signs, the public ministry, and the rising controversy.',
      chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    {
      label: 'Book of Glory · Chapters 13–20',
      subtitle: 'The foot-washing, the Farewell Discourse, the passion, and the resurrection.',
      chapters: [13, 14, 15, 16, 17, 18, 19, 20],
    },
    {
      label: 'Epilogue · Chapter 21',
      subtitle: 'A morning on the lake and Peter restored.',
      chapters: [21],
    },
  ],

  themesByline: 'Five threads through the Fourth Gospel',
  themesLead: `John is a gospel that has been contemplated for two thousand years and still yields more on re-reading. These five threads run through the whole — from the prologue to the final scene on the beach.`,

  themes: [
    {
      slug: 'word-prologue',
      title: 'In the Beginning Was the Word',
      greek: 'ἐν ἀρχῇ ἦν ὁ λόγος',
      preview: `The first eighteen verses of John are one of the most carefully constructed passages in the New Testament, and one of the most consequential. The gospel does not begin in Galilee or Bethlehem; it begins where Genesis 1 begins, with the same opening words.`,
      essay: [
        `The prologue to John (1:1–18) is one of the most consequential passages in the New Testament. John begins where Genesis begins — <em>in the beginning</em> — and identifies the agent of creation as the Word (Greek: <em>logos</em>), which was with God and was God. The Greek term carried enormous philosophical weight in the Hellenistic world: for the Stoics it meant the rational principle ordering the cosmos; for Heraclitus, six centuries earlier, it had meant the underlying account by which the world makes sense; for Philo of Alexandria, a Jewish contemporary of Jesus, it meant the divine reason as mediator between the unknowable God and the created world. John takes this word and applies it to a particular man.`,
        `The move is audacious in a way modern readers, who have heard the prologue too often, can miss. John is saying that the principle by which the cosmos was made — the rational order behind everything that exists — became flesh and lived among us. Verse 14 is the centre: <em>the Word became flesh and pitched his tent among us, and we have seen his glory.</em> The Greek word for <em>dwelt</em> — <em>eskēnōsen</em> — literally means pitched a tent, with a deliberate echo of the tabernacle in the Hebrew Bible, the tent in which God's presence dwelt with Israel in the wilderness. John is not making a metaphor; he is making an identification.`,
        `The prologue ends with a contrast that runs through the entire gospel: <em>the law was given through Moses; grace and truth came through Jesus Christ.</em> No one has ever seen God; the only Son has made him known. Everything else in the gospel is the working out of the prologue. To read the rest of John without these eighteen verses in mind is to lose the frame the writer has so carefully built.`,
      ],
      where: [
        { n: 1, label: 'John 1 (the prologue itself)' },
        { n: 8, label: 'John 8 (before Abraham was, I am)' },
        { n: 17, label: 'John 17 (glory before the world existed)' },
      ],
    },
    {
      slug: 'seven-signs',
      title: 'The Seven Signs',
      greek: 'σημεῖα',
      preview: `John never calls the miracles miracles. He calls them signs, and the change in vocabulary is theologically loaded. A sign in John is not primarily an act of power; it is an act that points to something beyond itself.`,
      essay: [
        `John never calls the miracles miracles. He calls them <em>signs</em> (<em>sēmeia</em>), and the change in vocabulary is theologically loaded. A sign in John is not primarily an act of power; it is an act that points to something beyond itself, and the something it points to is who Jesus is. There are seven of them in the public ministry, and the number is almost certainly intentional — seven is the biblical number of fullness.`,
        `The first is the wedding at Cana (chapter 2): water turned to wine, the best wine, saved for last. The second is the healing of the royal official's son (chapter 4) — Jesus speaks the word from a distance and the boy lives. The third is the healing at the pool of Bethesda (chapter 5), a man ill for thirty-eight years healed on a Sabbath — which provokes the first sustained controversy. The fourth is the feeding of the five thousand (chapter 6), with the bread-of-life discourse following. The fifth is the healing of the man born blind (chapter 9), the most novelistic chapter in John: the investigation that follows shows the religious authorities growing steadily blinder as the healed man grows steadily clearer.`,
        `The sixth is the raising of Lazarus (chapter 11). Lazarus has been dead four days; his sisters have given up; Jesus weeps at the tomb; Lazarus comes out bound in the grave clothes. It is the climax of the public ministry, and the chapter notes that from that day the authorities took counsel to put Jesus to death. The seventh is the resurrection itself (chapters 20–21), framed as the culmination of the sign sequence. Each sign builds on the last; each provokes a deeper revelation; the seventh closes the series. John says explicitly: <em>these are written so that you may believe that Jesus is the Christ, the Son of God, and that believing you may have life in his name.</em>`,
      ],
      where: [
        { n: 2, label: 'John 2 (Cana — first sign)' },
        { n: 9, label: 'John 9 (man born blind — fifth sign)' },
        { n: 11, label: 'John 11 (Lazarus — sixth sign)' },
        { n: 20, label: 'John 20 (resurrection — seventh sign)' },
      ],
    },
    {
      slug: 'i-am-sayings',
      title: 'The I Am Sayings',
      greek: 'ἐγώ εἰμι',
      preview: `Seven times in this gospel and only here, Jesus says I am — egō eimi in Greek — followed by a metaphor rich in the Hebrew Bible. The phrase itself carries the weight of the divine name revealed at the burning bush.`,
      essay: [
        `Seven times in this gospel and only here, Jesus says <em>I am</em> — <em>egō eimi</em> in Greek — followed by a metaphor that places him at the centre of an image rich in the Hebrew Bible. I am the bread of life (6:35). I am the light of the world (8:12). I am the door of the sheep (10:7). I am the good shepherd (10:11). I am the resurrection and the life (11:25). I am the way, and the truth, and the life (14:6). I am the true vine (15:1). The pattern is too consistent to be accidental.`,
        `The phrase <em>egō eimi</em> itself carries Hebrew Bible weight. In the Septuagint, the Greek translation of the Hebrew scriptures, the divine name revealed to Moses at the burning bush — <em>I am who I am</em> — is rendered with the same Greek words John uses. When Jesus says <em>I am the bread of life</em>, he is using a phrase that in Greek echoes the divine self-identification at Sinai. The doubling is most explicit in chapter 8, where Jesus says <em>before Abraham was, I am</em>, and the crowd takes up stones to throw at him because they understand exactly what he has just claimed.`,
        `The images do work. Bread is what sustains daily life; Jesus is the true sustenance, the manna that does not run out. Light is what makes seeing possible; Jesus is the light by which the world is illuminated. The shepherd is the figure used through the Hebrew Bible for the king and for God himself (Psalm 23, Ezekiel 34); Jesus is the good shepherd who lays down his life for the sheep. The vine is the image used in Isaiah and Jeremiah for Israel itself; Jesus, in chapter 15, claims to be the <em>true</em> vine — implying that the old vine was real but that he is its fulfilment. What the sayings amount to, taken together, is John's most concentrated argument that Jesus is doing on a personal scale what God did on a national scale in the older covenant.`,
      ],
      where: [
        { n: 6, label: 'John 6 (bread of life)' },
        { n: 8, label: 'John 8 (light of the world; before Abraham was)' },
        { n: 10, label: 'John 10 (door; good shepherd)' },
        { n: 11, label: 'John 11 (resurrection and the life)' },
        { n: 14, label: 'John 14 (the way, truth, and life)' },
        { n: 15, label: 'John 15 (the true vine)' },
      ],
    },
    {
      slug: 'farewell-discourse',
      title: 'The Farewell Discourse',
      greek: 'chapters 13–17',
      preview: `After the foot-washing in chapter 13, the gospel slows almost to a standstill. Jesus speaks to his disciples for four chapters — a farewell meditation unique in the New Testament.`,
      essay: [
        `Chapters 13 through 17 of John are unique in the New Testament. After the foot-washing at the last supper, the gospel slows almost to a standstill. Jesus speaks to his disciples for four chapters — unhurried, layered, often circling back on itself, repeatedly interrupted by disciples who do not understand and ask questions that open deeper teaching. Peter asks where Jesus is going. Thomas says they do not know the way. Philip asks to be shown the Father. Judas (not Iscariot) asks how Jesus will reveal himself to them and not to the world. Each question unlocks another layer.`,
        `The themes are the great themes of the second half of the gospel. The new commandment that the disciples love one another as Jesus has loved them. The promise of many rooms in the Father's house. The Paraclete — the Spirit of truth, another Helper — who will come when Jesus is gone and will teach them all things and bring to remembrance everything he has said. The vine and the branches in chapter 15: <em>abide in me, as I abide in you.</em> As the branch cannot bear fruit by itself, neither can you unless you abide in me. The warning that the world that hated Jesus will hate them.`,
        `Chapter 17 is the high-priestly prayer — Jesus prays at length and aloud to the Father, in the hearing of the disciples, on the night of his arrest. The prayer moves in three movements: for himself (that the Father glorify the Son so the Son may glorify the Father); for the disciples present (that they be kept in the Father's name, not taken out of the world but kept from the evil one); and for all who will believe through their word — that they may all be one, as the Father and the Son are one. The prayer for unity has been central to ecumenical discussion for centuries. When it ends, Jesus and the disciples leave the room and cross the Kidron valley to the garden where the arrest will happen.`,
      ],
      where: [
        { n: 13, label: 'John 13 (foot-washing; new commandment)' },
        { n: 14, label: 'John 14 (many rooms; Paraclete)' },
        { n: 15, label: 'John 15 (vine and branches; world\'s hatred)' },
        { n: 16, label: 'John 16 (sorrow into joy)' },
        { n: 17, label: 'John 17 (high-priestly prayer)' },
      ],
    },
    {
      slug: 'witness-testimony',
      title: 'Witness and Testimony',
      greek: 'μαρτυρία',
      preview: `John is structured like a legal proceeding. Witness language runs through the entire gospel — the Baptist witnesses, the works witness, the Father witnesses, the Beloved Disciple witnesses. John ends with a claim of eyewitness authority.`,
      essay: [
        `Witness language runs through the entire gospel of John, and it is not incidental. The Greek word <em>martyria</em> — witness, testimony — appears more in John than in any other gospel. John the Baptist appears <em>as a witness, to bear witness to the light</em> (1:7). In chapter 5 Jesus presents a cumulative case: four witnesses confirm who he is — the Baptist, the works he does, the Father who sent him, and the scriptures themselves. The gospel is structured like a legal proceeding, with evidence gathered and presented, objections raised, and the reader placed in the position of the jury.`,
        `The witness structure reaches its climax in the passion narrative. When a soldier pierces Jesus's side at the crucifixion and blood and water come out, John inserts an unusual claim: <em>He who saw it has borne witness — his testimony is true, and he knows that he is telling the truth — that you also may believe</em> (19:35). The emphasis on eyewitness authority is extraordinary. The gospel is not presenting a tradition at several removes; it is claiming direct testimony from someone who was there.`,
        `The Beloved Disciple is the named witness. He reclines next to Jesus at the supper, stands at the foot of the cross, runs to the empty tomb, recognizes the risen Jesus on the beach. The gospel ends: <em>this is the disciple who is bearing witness to these things, and who has written these things, and we know that his testimony is true.</em> Whoever the Beloved Disciple is — the apostle John in self-reference, or a distinct figure who founded the Johannine community — the gospel insists his testimony stands behind every word. The reader is asked not simply to believe a story, but to trust a witness.`,
      ],
      where: [
        { n: 1, label: 'John 1 (the Baptist as witness)' },
        { n: 5, label: 'John 5 (the four witnesses)' },
        { n: 19, label: 'John 19 (eyewitness at the cross)' },
        { n: 21, label: 'John 21 (the Beloved Disciple\'s testimony)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Jesus',
      role: 'The Word Made Flesh',
      body: `The Johannine Jesus is the most theologically explicit of the four gospels' portraits. He speaks of himself in long discourses rather than parables; he uses the I am formula seven times; he claims pre-existence (<em>before Abraham was, I am</em>) and equality with the Father (<em>I and the Father are one</em>) in language that is unmistakable. He performs seven signs, each carefully framed. He weeps at Lazarus's tomb. He washes his disciples' feet. He prays for them at length on the night of his arrest. He is in command throughout the passion in a way the synoptic Jesus is not — Pilate does not condemn him so much as fail to free him — and Jesus dies saying <em>it is finished</em>, having handed over the Spirit.`,
    },
    {
      name: 'The Beloved Disciple',
      role: 'Witness and Implied Author',
      body: `The unnamed figure introduced at the last supper as the disciple whom Jesus loved. He reclines next to Jesus at the meal, stands with Mary at the foot of the cross, runs with Peter to the empty tomb, recognizes the risen Jesus on the beach before Peter does. The gospel ends with a direct claim: <em>this is the disciple who is bearing witness to these things, and we know that his testimony is true.</em> Tradition identifies him as John the apostle, the son of Zebedee; modern scholarship is divided. Whoever he is, John insists on his presence at the central scenes and on his testimony as the gospel's authoritative source.`,
    },
    {
      name: 'Mary Magdalene',
      role: 'First Witness to the Resurrection',
      body: `John's account of the resurrection morning belongs almost entirely to her. She comes to the tomb while it is still dark, sees the stone removed, runs to tell Peter and the Beloved Disciple, returns weeping, sees two angels in white, turns and sees a man she takes for the gardener. He says her name — <em>Mary</em> — and she says <em>Rabboni</em>. He tells her to go and tell his brothers he is ascending to the Father. She goes and tells the disciples <em>I have seen the Lord</em>. The early church called her, on the strength of this chapter, the apostle to the apostles.`,
    },
    {
      name: 'Pilate',
      role: 'Roman Prefect',
      body: `The Roman prefect of Judea from 26 to 36 CE. The historical Pilate was, by the testimony of Josephus and Philo, a brutal administrator. The Johannine Pilate is more layered. He interrogates Jesus, asks if he is a king, hears the answer about bearing witness to the truth, and replies with the line that has echoed for two thousand years: <em>what is truth?</em> He tries repeatedly to release Jesus, presents him in the purple robe and crown of thorns — <em>behold the man</em> — and finally hands him over. He writes the inscription <em>Jesus of Nazareth, the King of the Jews</em> in three languages and refuses to change it: <em>what I have written I have written.</em>`,
    },
    {
      name: 'Thomas',
      role: 'The Doubting Disciple',
      body: `One of the Twelve, called Didymus (the twin). He appears three times in John. In chapter 11 he says <em>let us also go, that we may die with him</em> — a line of grim, courageous loyalty. In chapter 14 his question — <em>Lord, we do not know where you are going; how can we know the way?</em> — prompts the I am the way saying. In chapter 20 he is absent when the risen Jesus first appears, refuses to believe without touching the wounds, and eight days later addresses Jesus with the gospel's highest Christological confession: <em>my Lord and my God.</em>`,
    },
  ],

  castSubtitle: 'The Fourth Gospel — the Word made flesh and those who encounter him.',
  castLead: `<p>John has a smaller named cast than the synoptic gospels and a distinctive set of figures who appear only here: Nicodemus, the Samaritan woman, Lazarus, Martha and Mary of Bethany, the Beloved Disciple. The gospel is built around a series of encounters — each one a test of recognition, belief, and witness.</p>`,

  castGroups: [
    {
      label: 'The central figure',
      characters: [
        {
          id: 'jesus',
          tag: 'Word',
          tagClass: 'creature',
          name: 'Jesus',
          epithet: 'The Word made flesh',
          body: `The Johannine Jesus is the most theologically explicit of the four gospels' portraits. He opens the gospel in eternity — <em>in the beginning was the Word</em> — and ends it cooking breakfast on a beach. He performs seven carefully framed signs, speaks seven I am sayings, delivers a four-chapter farewell discourse, and prays the high-priestly prayer on the night of his arrest. He weeps at Lazarus's tomb. He washes his disciples' feet. He dies saying <em>it is finished</em> and hands over the Spirit. The resurrection morning he speaks one word — Mary's name — and is recognized.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
        },
      ],
    },
    {
      label: 'The witnesses',
      characters: [
        {
          id: 'the-beloved-disciple',
          tag: 'Disciple',
          name: 'The Beloved Disciple',
          epithet: 'Witness and implied author',
          body: `The unnamed figure introduced at the last supper as <em>the disciple whom Jesus loved.</em> He reclines next to Jesus at the meal, stands at the foot of the cross, receives Mary into his care, runs with Peter to the empty tomb — arriving first, looking in, and believing. He recognizes the risen Jesus on the beach before anyone else. The gospel ends: <em>this is the disciple who is bearing witness to these things, and we know that his testimony is true.</em> Tradition identifies him as the apostle John; modern scholarship debates the question. His presence at the central scenes is the gospel's claim to authority.`,
          appears: [13, 18, 19, 20, 21],
        },
        {
          id: 'mary-magdalene',
          tag: 'Disciple',
          name: 'Mary Magdalene',
          epithet: 'First witness to the resurrection',
          body: `She comes to the tomb while it is still dark. She runs to tell Peter and the Beloved Disciple. She returns, stands weeping at the tomb, looks in and sees two angels, turns and sees a man she takes for the gardener. He says her name. She says <em>Rabboni.</em> The scene is one of the most carefully written in any gospel — recognition turning on a single word. She goes and tells the disciples: <em>I have seen the Lord.</em> The early church called her, on the strength of this chapter, the apostle to the apostles.`,
          appears: [19, 20],
        },
        {
          id: 'john-the-baptist',
          tag: 'Prophet',
          name: 'John the Baptist',
          epithet: 'Witness to the light',
          body: `In John, the Baptist has no baptism of Jesus, no desert ministry, no crowd sermons. He is a witness and nothing else — his entire function is to point to the one who comes after him. <em>He came as a witness, to bear witness to the light.</em> He is the voice in the wilderness; he calls Jesus the Lamb of God who takes away the sin of the world; he identifies himself as the friend of the bridegroom. In chapter 3 he gives his final testimony — <em>he must increase, but I must decrease</em> — and disappears from the gospel.`,
          appears: [1, 3],
        },
      ],
    },
    {
      label: 'The disciples',
      characters: [
        {
          id: 'peter',
          tag: 'Disciple',
          name: 'Peter',
          epithet: 'Simon Peter, called Cephas',
          body: `Peter in John is a study in the gap between declaration and reality. He says <em>Lord, to whom shall we go? You have the words of eternal life.</em> He refuses to let Jesus wash his feet, then demands total washing. He draws a sword at the arrest and cuts off an ear. He follows to the high priest's courtyard and denies Jesus three times, each denial timed by John with care. In chapter 21 the three-question rehabilitation mirrors the three denials exactly, and he is given the pastoral commission — <em>feed my sheep</em> — that the gospel leaves as his final word.`,
          appears: [1, 6, 13, 18, 20, 21],
        },
        {
          id: 'thomas',
          tag: 'Disciple',
          name: 'Thomas',
          epithet: 'Called Didymus, the twin',
          body: `Thomas appears three times in John, each time more fully himself. In chapter 11 he says <em>let us also go, that we may die with him</em> — grim loyalty. In chapter 14 his question about not knowing the way prompts the I am the way saying. In chapter 20 he is absent at the first resurrection appearance, refuses to believe without touching the wounds, and eight days later delivers the highest Christological confession in the gospel: <em>my Lord and my God.</em> Jesus's response to him — <em>blessed are those who have not seen and yet have believed</em> — addresses every reader who comes after.`,
          appears: [11, 14, 20, 21],
        },
        {
          id: 'philip',
          tag: 'Disciple',
          name: 'Philip',
          epithet: 'Disciple from Bethsaida',
          body: `Philip appears at the calling of the first disciples (chapter 1), where Jesus calls him directly and Philip immediately finds Nathanael. He is tested by Jesus at the feeding of the five thousand — <em>where are we to buy bread?</em> — and answers practically: two hundred denarii would not be enough. In chapter 14 his question — <em>Lord, show us the Father, and it is enough for us</em> — draws one of the Farewell Discourse's most important answers: <em>whoever has seen me has seen the Father.</em>`,
          appears: [1, 6, 12, 14],
        },
        {
          id: 'andrew',
          tag: 'Disciple',
          name: 'Andrew',
          epithet: 'Simon Peter\'s brother',
          body: `Andrew appears at key moments in John: he is one of the two disciples who follow Jesus after the Baptist's testimony, and he brings his brother Simon Peter to Jesus. At the feeding of the five thousand it is Andrew who mentions the boy with five loaves and two fish — and adds the practical observation that it is not nearly enough. He appears once more in chapter 12, when he and Philip together bring word to Jesus that some Greeks wish to see him.`,
          appears: [1, 6, 12],
        },
        {
          id: 'nathanael',
          tag: 'Disciple',
          name: 'Nathanael',
          epithet: 'An Israelite in whom there is no deceit',
          body: `Nathanael appears only in chapters 1 and 21. In chapter 1 Philip tells him they have found the one Moses wrote about — Jesus of Nazareth — and Nathanael asks the question that became proverbial: <em>can anything good come out of Nazareth?</em> Philip says <em>come and see.</em> Jesus greets him as an Israelite in whom there is no deceit and says he saw him under the fig tree; Nathanael says you are the Son of God, the King of Israel. Jesus says he will see greater things. He is among the seven disciples fishing in chapter 21, the last scene of the gospel.`,
          appears: [1, 21],
        },
        {
          id: 'judas-iscariot',
          tag: 'Disciple',
          name: 'Judas Iscariot',
          epithet: 'Keeper of the money bag',
          body: `John frames Judas with consistent darkness. At the anointing in Bethany, Judas objects to what he calls waste; John notes he was a thief and used to steal from the common purse. At the last supper Jesus gives him the morsel that identifies the betrayer; Satan enters into him; he goes out into the night. John says of no one else that the devil entered them. He comes to the garden with soldiers and officers; in John there is no kiss of betrayal — Jesus goes forward and identifies himself. Judas disappears from the narrative at the arrest and is not mentioned again.`,
          appears: [6, 12, 13, 18],
        },
      ],
    },
    {
      label: 'The encounters',
      characters: [
        {
          id: 'nicodemus',
          tag: 'Pharisee',
          name: 'Nicodemus',
          epithet: 'A ruler of the Jews who came by night',
          body: `Nicodemus appears three times in John, each time marginally closer to the light. In chapter 3 he comes to Jesus at night and hears the you-must-be-born-again discourse and the famous verse 3:16. In chapter 7 he makes a procedural objection on Jesus's behalf at the council: <em>does our law judge a man without first giving him a hearing?</em> He is dismissed. In chapter 19 he brings seventy-five pounds of myrrh and aloes to help Joseph of Arimathea bury the body — an extravagant gesture that functions as the final declaration he never made during the public ministry.`,
          appears: [3, 7, 19],
        },
        {
          id: 'samaritan-woman',
          tag: 'Samaritan',
          name: 'The Samaritan Woman',
          epithet: 'At Jacob\'s well near Sychar',
          body: `She has no name in the gospel but is the subject of the longest conversation Jesus has with anyone in any of the four gospels. She crosses every social boundary of the scene — a Samaritan, a woman, alone with a Jewish stranger — and holds her own in the conversation: raising practical objections, asking the territorial question about worship, invoking the coming Messiah. Jesus tells her he is the one. She goes back to the city and says <em>come, see a man who told me all that I ever did.</em> The Samaritans believe first because of her testimony, then because they hear Jesus themselves.`,
          appears: [4],
        },
        {
          id: 'lazarus',
          tag: 'Friend',
          name: 'Lazarus',
          epithet: 'The one whom Jesus loved',
          body: `Lazarus of Bethany is the brother of Mary and Martha and the subject of the sixth sign — the raising of the dead — which is the climax of the public ministry. He does not speak in the gospel; he is ill, then dead, then called out of the tomb still bound in grave clothes. Jesus weeps at his tomb. After the raising, many Jews believe; the authorities plan to kill both Jesus and Lazarus as the cause of defection. He appears again at the dinner six days before the Passover, reclining at the table while Mary anoints Jesus's feet with expensive ointment.`,
          appears: [11, 12],
        },
        {
          id: 'martha',
          tag: 'Friend',
          name: 'Martha',
          epithet: 'Sister of Lazarus, of Bethany',
          body: `Martha comes out to meet Jesus on the road before he enters Bethany, and the exchange between them is the theological heart of chapter 11. She says if you had been here my brother would not have died — but even now she knows God will give Jesus whatever he asks. She confirms she believes in the resurrection at the last day. Jesus says <em>I am the resurrection and the life</em> and asks if she believes this. She says: <em>yes, Lord; I believe that you are the Christ, the Son of God, who is coming into the world.</em> Her confession precedes the miracle.`,
          appears: [11, 12],
        },
        {
          id: 'mary-of-bethany',
          tag: 'Friend',
          name: 'Mary of Bethany',
          epithet: 'Sister of Lazarus',
          body: `Mary of Bethany appears in chapters 11 and 12. In chapter 11 she falls at Jesus's feet weeping and says what her sister has said: if you had been here my brother would not have died. Jesus, seeing her weeping and the crowd weeping with her, is deeply moved and troubled and asks where Lazarus is laid. In chapter 12, six days before the Passover, she takes a pound of expensive ointment and anoints Jesus's feet, wiping them with her hair. The house is filled with the fragrance. Jesus defends her against Judas's complaint: she has kept this for the day of his burial.`,
          appears: [11, 12],
        },
        {
          id: 'pilate',
          tag: 'Roman Prefect',
          name: 'Pilate',
          epithet: 'Prefect of Judea, 26–36 CE',
          body: `The Roman prefect of Judea. The Johannine Pilate is John's most developed portrait of a secular authority confronting truth. He interrogates Jesus with genuine curiosity — <em>what is truth?</em> — but goes back out to the crowd and tries to release him. He has Jesus scourged and presented in the crown of thorns: <em>behold the man.</em> He sits on the judgment seat and says <em>behold your king</em> — and when the crowd says they have no king but Caesar, he hands Jesus over. He writes the inscription in three languages and refuses to change it. John's Pilate is neither hero nor monster; he is a man caught between truth and power who chooses power.`,
          appears: [18, 19],
        },
        {
          id: 'mary-mother',
          tag: 'Mother',
          name: 'Mary the Mother',
          epithet: 'The mother of Jesus',
          body: `John gives Mary two scenes and nothing else — but both are charged. At the wedding at Cana she notices the wine has run out and tells Jesus; he answers formally (<em>woman, what does this have to do with me?</em>) and she ignores the formality and tells the servants to do whatever he tells them. She opens the public ministry. At the cross she stands with the Beloved Disciple; Jesus from the cross gives her into his care: <em>woman, behold your son.</em> The two scenes frame the public ministry — she opens it at Cana and stands at its end at Calvary. Both are written with deliberate restraint.`,
          appears: [2, 19],
        },
      ],
    },
  ],

  chapters: chapters.map(c => ({
    n: c.n,
    title: c.title,
    tourTitle: c.tourTitle,
    hook: c.hook,
    tour: c.tour,
    blurb: c.blurb,
    summary: c.summary,
    appears: c.appears,
    themes: c.themes,
  })),
};

// SEO content data for the Song of Solomon (also Song of Songs, Canticles).
// Eight chapters of erotic Hebrew love poetry preserved in the canon.
// Composition probably 5th-3rd century BCE; traditionally attributed to Solomon.
// Voice: literary, declarative present, attentive to the strangeness of the book's place in scripture.

const chapters = require('/tmp/bible-song-of-solomon-chunk-1.json')

module.exports = {
  id: 'bible-song-of-solomon',
  title: 'Song of Solomon',
  author: 'Anonymous (traditionally Solomon)',
  byline: 'c. 5th–3rd c. BCE · Hebrew Bible · Writings · Five Megillot · Love poetry',
  titleAccent: 'a guided tour',
  hook: 'The most unlikely book in the Hebrew Bible: eight chapters of erotic love poetry, unembarrassed and unedited, preserved in the canon because the rabbis who argued over it decided the desire it described was holy.',

  genre: ['Hebrew poetry', 'Love poetry', 'Wisdom literature', 'Biblical literature'],

  about: [
    `<em>Song of Solomon</em> — also called Song of Songs (the Hebrew superlative: the song that surpasses all songs) and, in older English Bibles, Canticles — is a sequence of love poems in eight short chapters. The traditional attribution is to Solomon, the king named in the opening verse and in several places throughout the text. Modern scholarship places the composition considerably later, probably between the 5th and 3rd centuries BCE, on the basis of vocabulary, Persian loanwords, and the literary character of the verse. The book has no narrative in the ordinary sense. It is a sequence of voices: the Beloved (a young woman who speaks first and speaks more than anyone), the Lover (a young man), and the daughters of Jerusalem (a chorus who frame and respond). They are speaking before, during, and after physical love, in a register that has no real parallel elsewhere in the Hebrew Bible.`,
    `The Song's place in the canon was contested in antiquity and settled in its favour for reasons that have shaped its reading ever since. Rabbi Akiva, at the Council of Jamnia in the late first century, declared the day the Song was given to Israel as holy as the day the Law was given on Sinai. The allegorical tradition — which reads the Beloved and Lover as Israel and God, or (in the Christian tradition) as the Church and Christ — enabled the book to remain in scripture and produced, over the centuries, some of the most ardent mystical literature in both traditions: Bernard of Clairvaux's eighty-six sermons on the first two chapters, John of the Cross's <em>Spiritual Canticle</em>, the love poetry of the Spanish Carmelites. In the modern period the literal reading has returned with force. Most contemporary scholars treat the book first as what it manifestly is — a sustained celebration of erotic love between two unmarried young people — and the allegorical traditions as one of the things later readers did with that material. Both readings are now standard, and the most thoughtful contemporary commentary holds them together.`,
  ],

  chaptersSubtitle: "All 8 chapters, song by song — from the Beloved's first imperative to her final call for the Lover to come away.",
  chaptersLead: `<p>The Song of Solomon is too short for conventional chapter groupings; it reads more naturally as a sequence of songs with recurring voices and images. The eight chapters fall into two broad movements: the songs of meeting and longing (1–4), which establish the voices, the geography (city and garden), and the two dream sequences; and the songs of praise and declaration (5–8), which contain the Beloved's wasf of the Lover, the book's great climax ("love is as strong as death"), and the closing call. Read in a single sitting if possible — the book is twenty minutes. Read aloud to feel the Hebrew verse rhythms under the King James translation.</p>`,

  themesByline: 'Five threads through the Song',
  themesLead: `The Song of Solomon is a short book with a long afterlife. The threads below trace what the book is doing on its own terms and what two thousand years of readers have done with it — without collapsing either into the other.`,

  groups: [
    {
      label: 'Songs of meeting and longing',
      subtitle: 'The Beloved speaks first. The Lover comes to the lattice. The first dream, the royal procession, the garden opened.',
      chapters: [1, 2, 3, 4],
    },
    {
      label: 'Songs of praise and declaration',
      subtitle: 'The Beloved searches and is beaten. The ascending wasf. Love as strong as death. The Beloved calls him to come away.',
      chapters: [5, 6, 7, 8],
    },
  ],

  chapterLabel: n => `Song of Solomon ${n}`,

  themes: [
    {
      slug: 'erotic-poetry-in-the-canon',
      title: 'Erotic Poetry in the Canon',
      preview: 'The most striking fact about the Song of Solomon is that it is in the Bible at all. There is no other book like it in the Hebrew canon — no mention of God, no covenant, no prophet, no law. There is, instead, sustained and unembarrassed erotic poetry.',
      essay: [
        `The most striking fact about the Song of Solomon is that it is in the Bible at all. There is no other book like it in the Hebrew canon. There is no mention of God — the divine name does not appear, with the possible exception of a single contested word in 8:6 that some translators render as a flame of Yah. There is no covenant, no prophet, no patriarch, no exodus, no law, no temple. There is no narrative arc that ties the book into the wider story scripture is telling. There is no obvious moral instruction. There is, instead, sustained and unembarrassed erotic poetry — two unmarried young people praising each other's bodies, longing for each other in absence, finding each other and losing each other, calling each other to come away.`,
        `The fact that this book is in the canon is one of the most theologically significant facts about the canon. The rabbis who debated its inclusion in the late first and early second centuries CE knew exactly what they were debating. Some held that the book was sung in taverns and should not be sanctified by inclusion in scripture. Akiva held the opposite — that the book was the holy of holies of the writings, that the day it was given was as holy as the day the law was given on Sinai. Akiva won. The argument he won is not the one the modern reader would expect. It was not that the Song is allegorical and therefore safe; it was that the love the Song describes is itself holy, and that any reading that fails to feel the holiness of that love has missed the point.`,
        `The Christian inclusion of the book in its own canon followed a similar logic, mediated through the allegorical traditions that read the human lovers as figures for divine love. But the literal sense was never wholly suppressed, and the great mystical readings — Bernard, John of the Cross, the Carmelite tradition — are explicit that the divine love they are reading the book to describe is known to them, in part, through the analogy of the human love the book actually depicts.`,
        `The Song is, in this sense, the place in scripture where the goodness of the body and the goodness of erotic love are affirmed without qualification. There is no moralising. There is no warning. There is no marriage ceremony anywhere in the book. There is only the desire of two people for each other, given the highest poetic register the Hebrew language could produce, and preserved in the canon by a community that judged this desire to be worth preserving.`,
      ],
      where: [
        { n: 1, label: 'Song 1 (the Beloved speaks first)' },
        { n: 4, label: "Song 4 (the Lover's wasf, the garden)" },
        { n: 5, label: "Song 5 (the Beloved's wasf)" },
        { n: 8, label: 'Song 8 (love as strong as death)' },
      ],
    },
    {
      slug: 'the-beloved-as-active-voice',
      title: 'The Beloved as Active Voice',
      preview: 'The most quietly radical feature of the Song is that the Beloved speaks more than the Lover, opens the book, closes the book, and is the more active partner throughout. She initiates. Her first word is an imperative.',
      essay: [
        `The most quietly radical feature of the Song of Solomon is that the Beloved — the young woman — speaks more than the Lover, opens the book, closes the book, and is the more active partner throughout. She is the one who initiates. The first verse out of her mouth is an imperative: let him kiss me with the kisses of his mouth. She describes herself with attention and without apology — I am dark and beautiful, daughters of Jerusalem, dark as the tents of Kedar, lovely as the curtains of Solomon — answering, evidently, daughters who have asked about her complexion.`,
        `She invites the Lover into her mother's house, into her chamber, into the garden she calls her own. She praises his body in a wasf as detailed and sensual as anything he gives her. She searches for him in the streets of the city when he is gone — twice, in the two dream sequences — and is willing to face the watchmen who beat her in the second of those dreams. The book's most quoted lines, near the end, are spoken by her: set me as a seal upon thy heart, as a seal upon thine arm; for love is strong as death. The closing line is hers: make haste, my beloved, and be thou like to a roe or to a young hart upon the mountains of spices.`,
        `There is no other book in the Hebrew canon in which a female voice has this much room. Most narratives in the Hebrew Bible are told from a male perspective; women appear, are described, sometimes speak, but rarely sustain a long lyrical voice in their own right. The Song reverses this. The Beloved is the centre of the poem and the voice the reader most often hears.`,
        `She has been read as a single character and as a generic figure; she has been identified with the Shulamite (a name that appears once, in 6:13, with disputed meaning) and with various candidates from the Solomon legend; she has been identified allegorically with Israel, with the Church, with the soul. None of these readings displaces the simple fact that, on the page, she is a young woman who knows what she wants and is not embarrassed about wanting it. The book's preservation of her voice is, on any reading, one of its theological gifts to the tradition.`,
      ],
      where: [
        { n: 1, label: 'Song 1 (the Beloved speaks first)' },
        { n: 3, label: 'Song 3 (the first night search)' },
        { n: 5, label: "Song 5 (the second search; the Beloved's wasf)" },
        { n: 8, label: 'Song 8 (set me as a seal; the closing call)' },
      ],
    },
    {
      slug: 'the-garden-the-city-and-the-watchmen',
      title: 'The Garden, the City, and the Watchmen',
      preview: "The Song's symbolic geography is small and concentrated: a city with streets and watchmen, a wilderness, vineyards, and above all the garden — recurring more than any other image, the book's central landscape of desire.",
      essay: [
        `The Song's symbolic geography is small and concentrated. There is a city — Jerusalem, named throughout — with streets the Beloved walks at night and walls patrolled by watchmen. There is a wilderness from which the wedding procession comes up. There are vineyards, in which the Beloved is set to keep guard but cannot keep her own. There is a garden, recurring more than any other image: the locked garden, the sealed fountain, the garden of nuts and pomegranates and spices, the garden into which the Lover comes and from which he is sent away again.`,
        `The garden is the central image of the book and probably its richest. It is the Beloved's body, which the Lover praises as a garden and into which she invites him; it is the place of meeting, where the lovers come together away from the city and the chorus; it is, on the allegorical reading, paradise restored, the Eden the lovers have walked back into without shame. The verb "to come into the garden" is unmistakably erotic in the Hebrew, and the Lover's repeated invitation and the Beloved's answering call set the dominant image of physical love in the book as the image of a man entering a garden tended for his arrival.`,
        `The city is the garden's opposite. In the city, the Beloved cannot find the Lover; the watchmen find her instead, and in the second dream sequence beat her and tear off her veil. The city is the world of the chorus, the daughters of Jerusalem, the social order that watches and judges and asks questions about the Beloved's complexion. The garden is the place where the social order does not enter, where the lovers are alone and unsupervised, where the language can be as direct as it wants to be.`,
        `The book's structure shuttles between these two places. The Beloved seeks the Lover in the city and finds him only when she leaves it; the lovers meet in the garden and are at home there; the dream sequences map the failure to find as a city sequence and the success as a garden sequence. The reader who tracks the geography will find that the book has more shape than it first appears — that the apparent disorder of voices and scenes is held together by the recurring movement out of the city and into the garden, and by the answering movement of the Lover into the garden the Beloved has prepared for him.`,
      ],
      where: [
        { n: 2, label: 'Song 2 (the lattice window; the invitation)' },
        { n: 3, label: 'Song 3 (the first night search through the city)' },
        { n: 4, label: 'Song 4 (the locked garden)' },
        { n: 5, label: 'Song 5 (the watchmen beat the Beloved)' },
      ],
    },
    {
      slug: 'allegory-israel-and-god-christ-and-the-church',
      title: 'Allegory: Israel and God, Christ and the Church',
      preview: 'The allegorical reading of the Song is older than any surviving record of the literal reading. The Jewish tradition reads it as God and Israel; the Christian tradition as Christ and the Church or the soul. Both produced extraordinary literature.',
      essay: [
        `The allegorical reading of the Song of Solomon is older than any surviving record of the literal reading and was probably the reason the book remained in the canon. The Jewish allegorical tradition, codified in the Targum and developed through the rabbinic literature, reads the Song as the love between God and Israel — the bridegroom is God, the bride is Israel, the dream sequences are the exile and the seeking after God in the dark, the wedding procession is the giving of the Torah at Sinai, the locked garden is the sanctity of Israel's covenant.`,
        `The Christian allegorical tradition, beginning with Origen in the third century and developed by Bernard of Clairvaux, John of the Cross, and the whole of medieval and early modern mysticism, reads it as the love between Christ and the Church or between Christ and the individual soul. Bernard of Clairvaux preached eighty-six sermons on the first two chapters of the Song, all on the theme of the kiss with which the Beloved opens the book — the kiss of the mouth as the highest spiritual union, the kiss of the hand and the foot as preparatory degrees. John of the Cross wrote his <em>Spiritual Canticle</em> as a direct imitation of the Song, in Spanish verse of extraordinary intensity, with prose commentary that maps the soul's journey through purgation, illumination, and union onto the lovers' meetings and partings.`,
        `The allegorical tradition is not, on its strongest readings, an evasion of the literal sense. It is the conviction that human erotic love, taken as seriously as the Song takes it, is itself a true analogy for the love between the soul and God — that what the lovers in the poem feel and what the soul feels in mystical union are not opposed but related, the one a foretaste and figure of the other.`,
        `The literal and allegorical readings are therefore not in zero-sum competition. The strongest tradition of reading the Song in both Judaism and Christianity has been to hold them together: to feel the human love in the poem fully, and to feel through it the divine love the tradition has heard the poem also describing. The reader new to the book is best served by reading it first for what it manifestly is, then reading the allegorical tradition, then returning to the poem with both sets of ears open.`,
      ],
      where: [
        { n: 3, label: 'Song 3 (the royal procession; the wedding allegory)' },
        { n: 4, label: 'Song 4 (the locked garden as covenant)' },
        { n: 5, label: 'Song 5 (the second dream; seeking in absence)' },
        { n: 8, label: 'Song 8 (love as strong as death; the divine name)' },
      ],
    },
    {
      slug: 'love-as-strong-as-death',
      title: 'Love as Strong as Death',
      preview: "Near the end of chapter 8 the Beloved makes the Song's only explicit theological claim: love is as strong as death; jealousy is cruel as the grave; many waters cannot quench love. The lines have been quoted at weddings and funerals for two thousand years.",
      essay: [
        `Near the end of the eighth chapter, in a passage that has been quoted at weddings and funerals for two thousand years, the Beloved says: set me as a seal upon thine heart, as a seal upon thine arm: for love is strong as death; jealousy is cruel as the grave: the coals thereof are coals of fire, which hath a most vehement flame. Many waters cannot quench love, neither can the floods drown it: if a man would give all the substance of his house for love, it would utterly be contemned.`,
        `The lines are the Song's most explicit statement of what its lovers take love to be, and they are one of the most concentrated passages of love poetry in the Hebrew Bible. Three claims are pressed in close succession. The first is that love is as strong as death — that the force the lovers feel for each other is on the same scale as the force that ends every human life, and is the only force that meets death on equal terms. The second is that jealousy is as fierce as Sheol, the realm of the dead — jealousy here being not the petty possessiveness of weak loves but the answering ferocity that real love carries against anything that threatens it. The third is that love cannot be bought.`,
        `The Hebrew for "most vehement flame" — shalhevet-yah — contains what may be the only occurrence of the divine name in the book, read by some as a compound (flame of Yah, a divine superlative) and by others as a common intensifier; the translation debate has shaped the allegorical tradition's reading of these lines as the love of God for Israel or for the soul.`,
        `The lines are not a moral lesson. They are a description, given by one lover to another, of the kind of thing the love between them is. They are also given without religious framing. The Beloved is not invoking God or covenant or temple; she is naming what she and the Lover have, and the naming is enough. That the canon includes this claim, and that it is given to a young woman to make, is among the book's enduring gifts to whatever reader comes to it.`,
      ],
      where: [
        { n: 2, label: "Song 2 (I am my beloved's and my beloved is mine)" },
        { n: 6, label: 'Song 6 (the formula of reciprocal possession)' },
        { n: 7, label: "Song 7 (I am my beloved's and his desire is toward me)" },
        { n: 8, label: 'Song 8 (love as strong as death)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'The Beloved',
      role: 'The young woman who opens, dominates, and closes the Song',
      body: `The Beloved speaks more than anyone else in the book. She initiates the lovers' meetings, describes herself and her Lover with precision and without embarrassment, searches for him in the streets of the city at night (twice), and gives the Song its most quoted lines near the end. She has been called the Shulamite (from 6:13) and identified allegorically with Israel, with the Church, with the soul. On the page she is a young woman who knows her own desire and her own body and the body of the man she loves, and is not afraid to put any of it into words. The Song closes on her voice, calling him to come away.`,
    },
    {
      name: 'The Lover',
      role: 'The young man whose presence the Beloved seeks',
      body: `The Beloved's male counterpart. He praises her body part by part in three extended wasf passages, calls her his sister and his bride (the kinship terms of formal love poetry, not literal blood), comes into the garden she has prepared for him, leaves and returns. He speaks less than she does; the book's structure puts the female voice at the centre and gives the male voice the answering role. He has been identified, on the surface narrative, with Solomon, and allegorically with God and with Christ in the mystical tradition.`,
    },
    {
      name: 'The Daughters of Jerusalem',
      role: 'The chorus of city women who witness and frame',
      body: `A group of young women of the city who speak as a collective voice. The Beloved addresses them repeatedly, asks them questions, charges them with oaths (do not stir up or awaken love — the famous threefold refrain of 2:7, 3:5, and 8:4), tells them about her search for the Lover. They serve the formal function of a Greek chorus — framing, witnessing, asking the questions the audience would ask — and they are also the social world of the city against which the lovers' more private exchanges in the garden are set.`,
    },
  ],

  castBlurb: 'Voices of the Song',
  castDesc: 'The speakers and figures who move through the eight chapters.',
  castSubtitle: 'Three voices and the figures who shadow them.',
  castLead: `<p>The Song of Solomon has no cast in the conventional sense — no named characters except Solomon (named but not a speaker), no attributed speeches in the Hebrew text. What it has is voices: the Beloved, the Lover, the Daughters of Jerusalem, the Watchmen, and the Dream Sequences as recurring presences. Attribution of individual verses is itself a scholarly debate. The figures below represent the poem's speaking and significant presences, not dramatic characters with fixed roles.</p>`,

  castGroups: [
    {
      label: 'The voices',
      characters: [
        {
          id: 'beloved',
          tag: 'SPEAKER',
          name: 'The Beloved',
          epithet: 'The young woman who opens, dominates, and closes the Song',
          body: `The young woman whose voice opens the Song (let him kiss me with the kisses of his mouth) and closes it (make haste, my beloved). She speaks more than anyone else, initiates the lovers' meetings, describes herself with attention and without apology — dark as the tents of Kedar, lovely as the curtains of Solomon — and gives the Song its most quoted lines. She has been called the Shulamite (6:13), identified allegorically with Israel, the Church, the soul. On the page she is a young woman who knows what she wants and is not embarrassed about wanting it.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8],
        },
        {
          id: 'lover',
          tag: 'SPEAKER',
          name: 'The Lover',
          epithet: 'The young man whose presence the Beloved seeks',
          body: `The Beloved's counterpart. He praises her body part by part in three extended wasf passages, calls her his sister and his bride (the kinship terms of formal love poetry, not literal blood), comes into the garden she has prepared for him, leaves and returns. He speaks less than she does. He has been identified with Solomon on the surface narrative, and allegorically with God and with Christ in the mystical traditions of both Judaism and Christianity.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8],
        },
        {
          id: 'daughters-of-jerusalem',
          tag: 'CHORUS',
          name: 'The Daughters of Jerusalem',
          epithet: 'The city women who witness and frame',
          body: `A group of young women who speak as a collective voice throughout the Song. The Beloved addresses them repeatedly, charges them with the threefold oath (do not stir up or awaken love — 2:7, 3:5, 8:4), tells them about her searches for the Lover. They serve as a Greek chorus — framing, witnessing, asking the questions the audience would ask — and represent the social world of the city against which the lovers' more private garden exchanges are set.`,
          appears: [1, 2, 3, 5, 6, 7, 8],
        },
      ],
    },
    {
      label: 'The presences',
      characters: [
        {
          id: 'solomon',
          tag: 'NAMED KING',
          name: 'Solomon',
          epithet: 'The king invoked but not speaking',
          body: `Named in the opening verse — the Song of Songs, which is Solomon's — and named again in several places throughout (the royal procession of 3:6-11, the vineyard at Baal-hamon in 8:11-12). Whether Solomon is a character, the author, or simply a literary figure invoked for his association with love and luxury and song is one of the standing questions of the book's interpretation. Modern critical reading takes him as a literary presence — the patron of love poetry in the Israelite tradition — rather than a speaker or historical author.`,
          appears: [3, 6, 8],
        },
        {
          id: 'watchmen',
          tag: 'GUARDS',
          name: 'The Watchmen',
          epithet: 'The men who patrol the city walls at night',
          body: `The men who patrol the walls of Jerusalem and who appear in both of the Song's dream sequences. In the first (3:1-5) the Beloved asks them whether they have seen her lover and finds him soon after. In the second (5:2-8) they find her again, beat her, take away her veil. The watchmen are the figures of the city's social order — the rules governing who can be where and when. They are not villains; they are doing their job. The book does not editorialise about them. It records that the Beloved encountered them, that the second encounter ended with her beaten, and that she nonetheless continued her search.`,
          appears: [3, 5],
        },
        {
          id: 'dream-sequences',
          tag: 'INTERIOR LANDSCAPE',
          name: 'The Dream Sequences',
          epithet: "The Beloved's night searches",
          body: `Two passages — 3:1-5 and 5:2-8 — describe the Beloved going out into the city at night to search for the Lover she cannot find. The framing in both is dreamlike: she is on her bed, she rises, she goes out, she searches, she meets the watchmen, she finds him or does not find him. The first sequence ends in finding. The second ends in failure and pain. The dream sequences are the Song's most psychologically interior passages and the most clearly structured. They preserve the experience of longing in absence as one of the book's most concentrated images of what love is.`,
          appears: [3, 5],
        },
      ],
    },
  ],

  chapters,
}

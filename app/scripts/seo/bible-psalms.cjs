// SEO content data for the Book of Psalms.
// Hebrew prayer book and hymnal; collection of 150 poems.
// Voice: literary, declarative present.

const chapters = require('/tmp/bible-psalms-chapters-merged.json');

module.exports = {
  id: 'bible-psalms',
  title: 'Psalms',
  author: 'Multiple (David, Asaph, Korah, Solomon, Moses, anonymous)',
  byline: 'c. 10th–3rd c. BCE · Hebrew Bible · Writings · Psalter',
  titleAccent: 'a guided tour',
  hook: 'One hundred and fifty poems, written across six centuries. Praise that does not hesitate. Lament that addresses God in the second person and demands an answer. Imprecations that make every later reader uncomfortable. And five closing doxologies that simply say: hallelujah.',
  themesBlurb: 'Praise, lament, imprecation, royalty, and the longest unbroken conversation in human literature.',
  castBlurb: 'The Psalter',
  castDesc: "The voices of Israel's prayer book.",

  genre: ['Poetry', 'Prayer', 'Hebrew Bible', 'Wisdom literature'],

  about: [
    `The <em>Psalms</em> are the prayer book of ancient Israel and the hymnal of every later religion that traces its lineage back to it. One hundred and fifty poems, written across at least six centuries, covering every register the religious life can know: praise that does not hesitate, lament that does not console itself, complaint that addresses God in the second person and demands an answer, royal hymns for coronation days, pilgrim songs for the road up to Jerusalem, and the final five doxologies that simply say hallelujah, hallelujah, hallelujah, until the book ends.`,
    `The poems reached their present form during the late post-exilic period, probably in the fifth or fourth century BCE, but the individual poems span a much longer history. Seventy-three are attributed to David, twelve to Asaph, eleven to the sons of Korah — both temple guilds of Levitical singers — two to Solomon, one to Moses (Psalm 90), one to Ethan, and many to no one at all. The 150 poems are arranged into five books, each ending with a doxology, in conscious imitation of the five books of the Torah. The Psalter has been the central prayer book of Judaism and Christianity for over two thousand years. Jesus quotes it more than any other Hebrew Bible book; the New Testament cites it more than any other source except possibly Isaiah. A 21st-century reader picks it up for the literary range — there is no other ancient text that contains lyric poetry of this caliber across this many registers — and for the strange experience of reading prayers that have been prayed continuously for the better part of three millennia.`,
  ],

  chaptersSubtitle: "All 150 psalms, arranged in the Psalter's five ancient books.",
  chaptersLead: `<p>The Psalter is not a narrative. It is an anthology — the same speakers, the same God, the same range of address, but the occasions are particular and varied. The five books within it each end with a doxology. Book I (Psalms 1–41) contains most of the Davidic laments. Book II (42–72) closes with the note "the prayers of David are ended." Book III (73–89) is dominated by Asaph and the Korahites. Book IV (90–106) opens with Moses's psalm and contains the great enthronement psalms. Book V (107–150) closes with the Songs of Ascents, the Hallel psalms, and the five final doxologies of pure praise.</p>`,

  themesByline: 'Five threads through the prayer book',
  themesLead: `The Psalter is the most emotionally honest book in the Hebrew Bible. More than a third of it is lament. It provides language for praise and for disorientation alike, and does not require the reader to graduate from one to the other.`,

  castSubtitle: "The Psalter — voices of Israel's prayer.",
  castLead: `<p>The Psalms do not have characters in the narrative sense. They have voices — recurring types of speaker whose situations recur across the collection. These are the six voices that between them account for most of the Psalter's range.</p>`,

  chapterLabel: n => `Psalm ${n}`,

  groups: [
    {
      label: 'Book I · Psalms 1–41',
      subtitle: 'The Davidic laments and hymns. The foundational core of the Psalter.',
      chapters: Array.from({ length: 41 }, (_, i) => i + 1),
    },
    {
      label: 'Book II · Psalms 42–72',
      subtitle: 'Korahite psalms, more Davidic psalms. Closes: "the prayers of David are ended."',
      chapters: Array.from({ length: 31 }, (_, i) => i + 42),
    },
    {
      label: 'Book III · Psalms 73–89',
      subtitle: 'Asaph and the Korahites dominate. The darkest book of the Psalter.',
      chapters: Array.from({ length: 17 }, (_, i) => i + 73),
    },
    {
      label: 'Book IV · Psalms 90–106',
      subtitle: 'Opens with Moses. Contains the great enthronement psalms.',
      chapters: Array.from({ length: 17 }, (_, i) => i + 90),
    },
    {
      label: 'Book V · Psalms 107–150',
      subtitle: 'Songs of Ascents, the Hallel psalms, and five closing doxologies of pure praise.',
      chapters: Array.from({ length: 44 }, (_, i) => i + 107),
    },
  ],

  themes: [
    {
      slug: 'full-range-of-religious-affections',
      title: 'The full range of the religious affections',
      greek: 'orientation, disorientation, new orientation',
      preview: 'The Psalter is the most emotionally honest book in the Hebrew Bible. More than a third of it is lament. It does not ask the reader to graduate from disorientation — it keeps the full keyboard available.',
      essay: [
        `The biblical scholar Walter Brueggemann has organised the collection into three broad movements that recur across the whole book: psalms of orientation, psalms of disorientation, and psalms of new orientation. Psalms of orientation — Psalm 1, Psalm 8, Psalm 19, Psalm 145, much of the wisdom and creation material — articulate the world as it is meant to be: ordered, just, beautiful, the work of a wise creator. Psalms of disorientation — the great laments and the imprecatory psalms — articulate the world as it sometimes appears to those living in it: cruel, silent, dominated by the wicked, with God either absent or present and not acting. Psalms of new orientation are not a return to the first naïveté but the gratitude of someone who has come through disorientation and discovered, on the far side, that the world is held by something the disorientation could not finally negate.`,
        `What is striking, by the standards of religious literature anywhere else, is the proportion. More than a third of the Psalter is lament. Disorientation is not the exception; it is the largest single mode of address. The book takes for granted that a person who actually prays will, in the course of a life, spend long stretches in each of these registers, and it provides language for each. It does not ask the reader to graduate from disorientation, as if mature faith would have moved past it. It assumes that mature faith continues to use Psalm 88 alongside Psalm 100, and that the same person who sings the one will, in another season, need the other. This is what most religious poetry since the Psalter has been unable to sustain. Most later religious poetry tilts toward orientation or stages a single dramatic transition through disorientation to new orientation. The Psalter does not graduate. It just keeps the full keyboard available.`,
      ],
      where: [
        { n: 1, label: 'Psalm 1 (the two ways)' },
        { n: 22, label: 'Psalm 22 (forsaken — and pivot)' },
        { n: 88, label: 'Psalm 88 (no pivot — darkness only)' },
        { n: 100, label: 'Psalm 100 (pure praise)' },
      ],
    },
    {
      slug: 'lament-tradition',
      title: 'The lament tradition',
      greek: '"My God, my God, why hast thou forsaken me"',
      preview: 'A lament addresses God by name, describes the trouble in vivid detail, complains — often angrily — and almost always pivots, mid-psalm or at the end, to an act of confidence. Psalm 88 is the great exception.',
      essay: [
        `More than a third of the Psalter is lament, and the form is so consistent across the laments that most critical scholars treat it as one of the book's two or three native genres. A lament addresses God by name. It describes the trouble — usually with the speaker as victim of enemies, sickness, false accusation, or the silence of God himself — in vivid concrete detail that the modern reader sometimes finds disorienting in its specificity. It complains, often angrily, often bitterly, sometimes accusing God of having forgotten the speaker or of being asleep. It asks for deliverance, often with imprecation against the enemies. And then, almost always, it pivots — sometimes mid-psalm, sometimes only in the last verse — to an expression of confidence or vow of thanksgiving.`,
        `Psalm 22 is the most famous example: "My God, my God, why hast thou forsaken me" opens it; "I will declare thy name unto my brethren" closes it. Christian readers have heard the opening from the cross, in Mark and Matthew. Jewish readers have prayed the whole psalm for two and a half millennia. The pivot is what gives the lament its peculiar shape: it is not a complaint that ends in despair, and it is not a complaint that resolves itself by withdrawing the complaint. It holds, simultaneously, the trouble and the trust. Psalm 88 is the great exception that proves the rule: it is the only psalm that ends in unrelieved darkness, with "lover and friend hast thou put far from me, and mine acquaintance into darkness." That the book includes Psalm 88 at all is one of the most striking facts about it. The Psalter does not require even its laments to resolve.`,
      ],
      where: [
        { n: 6, label: 'Psalm 6 (the penitential lament)' },
        { n: 22, label: 'Psalm 22 (the great lament)' },
        { n: 42, label: 'Psalm 42–43 (as a deer pants)' },
        { n: 88, label: 'Psalm 88 (no resolution)' },
      ],
    },
    {
      slug: 'imprecatory-psalms',
      title: 'The imprecatory psalms',
      greek: '"Happy shall he be, that taketh and dasheth thy little ones against the stones"',
      preview: 'A small group of psalms pray violent things against enemies. Modern liturgical practice has often quietly omitted them. The Psalter has not.',
      essay: [
        `There is a small group of psalms — Psalms 35, 58, 69, 109, 137 are the most discussed — that pray for violent things to happen to enemies. The most famous and the most uncomfortable is the closing of Psalm 137, the great exilic lament "by the rivers of Babylon, there we sat down, yea, we wept, when we remembered Zion," which ends with the line: "O daughter of Babylon, who art to be destroyed; happy shall he be that rewardeth thee as thou hast served us. Happy shall he be, that taketh and dasheth thy little ones against the stones."`,
        `Modern liturgical practice has often quietly suppressed these verses. C. S. Lewis, in <em>Reflections on the Psalms</em>, argued that the imprecations are evidence both of the Psalmists' moral seriousness — they cared enough about justice to pray fiercely against injustice — and of the gap between the ancient ethic and the New Testament's love of enemies. Many modern Jewish commentators have argued that the imprecations are exactly what makes the Psalter usable for people in real, ongoing oppression: they refuse to spiritualise the desire for justice and put the desire in the mouth of the speaker rather than the hand. To pray Psalm 137 is to refuse the option of carrying out the violence oneself; the violence is committed to God. What is undeniable is that these psalms are in the book, and any reading of the Psalter that pretends they are not is a reading the book itself does not authorise.`,
      ],
      where: [
        { n: 35, label: 'Psalm 35' },
        { n: 58, label: 'Psalm 58 (break their teeth)' },
        { n: 109, label: 'Psalm 109 (the great imprecation)' },
        { n: 137, label: 'Psalm 137 (by the rivers of Babylon)' },
      ],
    },
    {
      slug: 'royal-and-messianic',
      title: 'The royal and messianic register',
      greek: '"The Lord said unto my Lord, Sit thou at my right hand"',
      preview: 'About a dozen psalms concern the king of Israel — his coronation, his battles, the dynastic promise. After the monarchy ended in 586 BCE, the royal psalms continued to be sung as the language of a king to come.',
      essay: [
        `About a dozen psalms are royal — Psalms 2, 18, 20, 21, 45, 72, 89, 101, 110, 132, 144 are the standard list. They concern the king of Israel: his coronation (Psalm 2), his marriage (Psalm 45), his battles, his prayer (Psalm 18), his enthronement, the dynastic promise that descends to him from David. Psalm 110 is the most disputed. "The Lord said unto my Lord, Sit thou at my right hand, until I make thine enemies thy footstool." The line is quoted more often in the New Testament than any other line from the Hebrew Bible, and the Christian tradition has read it from the beginning as a messianic statement about the relation between the Father and the Son.`,
        `What is interesting about the royal psalms is that they continued to be sung even after the monarchy ended. There was no king in Jerusalem after 586 BCE. But the psalms about the king were preserved, sung in the second temple, and read as if they were still about a king to come. This is the textual basis of the messianic expectation in late Second Temple Judaism, and the basis of the New Testament's reading of these psalms as fulfilled in Jesus. Whether one accepts that fulfilment or not, the historical fact is that the royal psalms outlived the institution they were composed for, and the book preserved them as future-oriented texts.`,
      ],
      where: [
        { n: 2, label: 'Psalm 2 (the coronation)' },
        { n: 45, label: 'Psalm 45 (the royal marriage)' },
        { n: 110, label: 'Psalm 110 (sit at my right hand)' },
        { n: 132, label: 'Psalm 132 (the dynastic promise)' },
      ],
    },
    {
      slug: 'unbroken-conversation',
      title: 'The Psalter as the prayer book Jesus knew',
      greek: '"The longest unbroken conversation in human literature"',
      preview: 'The Psalms have been prayed daily, by living people, for nearly three thousand years — Jewish before Jesus, Jewish and Christian since. The reader who picks up the Psalter today is joining a conversation that has never stopped.',
      essay: [
        `Whatever else the Psalms are, they are the prayer book of Second Temple Judaism, and they are the prayer book Jesus knew. Jesus would have grown up reciting psalms in synagogue and at home, would have heard them sung in the temple by Levitical choirs, would have used them as the texts of his daily prayer. The Hallel — Psalms 113–118 — was sung at Passover, which means that Jesus, on the night before his death, almost certainly sang Psalm 118 with his disciples in the upper room. From the cross, Mark and Matthew report him quoting the opening of Psalm 22. Luke reports him quoting Psalm 31.`,
        `The early monastic communities of the third and fourth centuries adopted the Psalter as the daily diet of prayer, and the practice has continued, in different forms, in the Orthodox, Catholic, Anglican, and Reformed traditions ever since. The Benedictine office prays the entire Psalter every week. The Anglican office prays it every month. There is, in other words, an unbroken chain — Jewish before Jesus, Jewish and Christian since — of the same poems being prayed daily, by living people, in the same shape, for nearly three thousand years. The reader who picks up the Psalter today is not picking up an ancient text in the sense in which one picks up Aristotle or Cicero. One is joining a conversation that has been going on, continuously, since the Israelite court at Jerusalem in the tenth century BCE.`,
      ],
      where: [
        { n: 22, label: 'Psalm 22 (quoted from the cross)' },
        { n: 113, label: 'Psalm 113 (the Hallel begins)' },
        { n: 118, label: 'Psalm 118 (sung at the Last Supper)' },
        { n: 150, label: 'Psalm 150 (the final doxology)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'David',
      role: 'THE PRAYING KING',
      body: `Seventy-three psalms carry the heading "le-David." The historical David of 1 and 2 Samuel is a singer and player of the lyre — the dynastic founder who dances before the ark, weeps at his son's death, and is shown in his weakness without varnish. Whether or not he composed Psalm 23 or Psalm 51, the figure of David hangs over the Psalter as the type of the king who prays: not the model of righteousness, but the model of someone who keeps speaking to God in every condition, including the condition of having been the man Nathan exposed.`,
    },
    {
      name: 'Asaph',
      role: 'THE TEMPLE SINGER',
      body: `Twelve psalms are attributed to Asaph, the head of a Levitical guild of temple singers. The Asaph psalms dominate Book III (73–89), the darkest book of the Psalter. Psalm 73 — one of the great wisdom psalms — opens with near-apostasy ("as for me, my feet were almost gone") and resolves in an act of sustained trust. The Asaph collection is the Psalter's most theologically complex, grappling most directly with the problem of the prosperity of the wicked.`,
    },
    {
      name: 'The Lament Voice',
      role: 'PSALMS 6, 13, 22, 42–43, 88, 130',
      body: `Treat the lament tradition as a single figure speaking across the book in a hundred different specific situations. The voice is in trouble. The trouble is described concretely: enemies surround, sickness consumes, the bones are out of joint, the heart is melted like wax. The voice addresses God directly, often by name, and accuses God of distance: how long, O Lord, how long. Then, almost always, the voice pivots to declare that it will trust again. Psalm 88 is the great exception: the only psalm that ends in unrelieved darkness, with "lover and friend hast thou put far from me, and mine acquaintance into darkness."`,
    },
    {
      name: 'The Royal Voice',
      role: 'PSALMS 2, 18, 20, 21, 45, 72, 89, 110, 132',
      body: `The voice of the king of Israel — at his coronation, his marriage, his battle, his enthronement. The royal psalms speak of the king as the Lord's anointed (the Hebrew is <em>mashiach</em>, from which "messiah" descends), seated on Zion, ruling from sea to sea. After the monarchy ended in 586 BCE, the royal psalms continued to be sung, and their language, originally addressed to actual Davidic kings, was increasingly read as the language of a king to come. The messianic expectation of late Second Temple Judaism and the Christian reading of Jesus as that expected king both depend, textually, on the Psalter's preservation of the royal voice.`,
    },
    {
      name: 'The Songs of Ascents',
      role: 'PSALMS 120–134',
      body: `Fifteen short psalms, each headed "a song of ascents," traditionally understood as the songs pilgrims sang on the road up to Jerusalem for the three great feasts. They are short — Psalm 131 has only three verses — and read together as a sequence. They cover the road: leaving home in trouble (120), looking up to the hills (121), arriving at the gates of Jerusalem (122), the soul at rest like a weaned child (131), the brothers dwelling together in unity (133), the night watchmen blessing the Lord in the temple (134). They are the most accessible cluster in the Psalter and are often where first-time readers begin.`,
    },
    {
      name: 'The Closing Doxology',
      role: 'PSALMS 146–150',
      body: `The Psalter closes on five psalms of pure praise, each beginning and ending with the word hallelujah — praise the Lord. Not because the trouble has been resolved, not because the imprecations have been answered, not because the questions of Psalm 88 have been laid to rest. The book ends in praise because the book is, finally, a book of prayer addressed to God, and praise is the form prayer takes when it has nothing left to ask for. Psalm 150 ends: "let every thing that hath breath praise the Lord." The book ends.`,
    },
  ],

  cast: [
    {
      name: 'David',
      role: 'THE PRAYING KING',
      body: `Seventy-three psalms carry the heading "le-David." The historical David of 1 and 2 Samuel is a singer and player of the lyre — the dynastic founder who dances before the ark, weeps at his son's death, and is shown in his weakness without varnish. Whether or not he composed Psalm 23 or Psalm 51, the figure of David hangs over the Psalter as the type of the king who prays: not the model of righteousness, but the model of someone who keeps speaking to God in every condition, including the condition of having been the man Nathan exposed. The penitential psalms in particular, especially Psalm 51 with its superscription "when Nathan the prophet came unto him, after he had gone in to Bath-sheba," depend on that connection.`,
    },
    {
      name: 'The Lament Voice',
      role: 'PSALMS 6, 13, 22, 42–43, 88, 130',
      body: `Treat the lament tradition as a single figure speaking across the book in a hundred different specific situations. The voice is in trouble. The trouble is described concretely: enemies surround, sickness consumes, the bones are out of joint, the heart is melted like wax, the speaker is forgotten, the speaker is mocked, the night is long. The voice addresses God directly, often by name, and accuses God of distance: how long, O Lord, how long. Then, almost always, the voice pivots — sometimes mid-psalm, sometimes only at the end — to declare that it will trust again, that it will praise again. Psalm 88 is the great exception that proves the rule: it is the only psalm that ends in unrelieved darkness, with "lover and friend hast thou put far from me, and mine acquaintance into darkness."`,
    },
    {
      name: 'The Imprecatory Voice',
      role: 'PSALMS 35, 58, 69, 109, 137',
      body: `The voice that prays violent things against enemies. "Break their teeth, O God, in their mouth." "Let his children be fatherless, and his wife a widow." "Happy shall he be, that taketh and dasheth thy little ones against the stones." The imprecatory voice has been the most uncomfortable feature of the Psalter for two and a half thousand years, and modern liturgical practice has often quietly suppressed it. The voice is not foreign to the book; it is one of its native registers, and it is the voice of someone who is committing his desire for vengeance to God rather than carrying it out. The book does not endorse the imprecations theologically. It records them — which is, in a book of prayer, a kind of permission.`,
    },
    {
      name: 'The Royal Voice',
      role: 'PSALMS 2, 18, 20, 21, 45, 72, 89, 110, 132',
      body: `The voice of the king of Israel — at his coronation, at his marriage, at his battle, at his enthronement, at his prayer. The royal psalms speak of the king as the Lord's anointed (the Hebrew is <em>mashiach</em>, from which "messiah" descends), seated on Zion, ruling from sea to sea, putting down the kings of the earth. After the monarchy ended in 586 BCE, the royal psalms continued to be sung, and their language, originally addressed to actual kings of the Davidic line, was increasingly read as the language of a king to come. The messianic expectation of late Second Temple Judaism and the Christian reading of Jesus as that expected one both depend, textually, on the Psalter's preservation of the royal voice.`,
    },
    {
      name: 'The Songs of Ascents',
      role: 'PSALMS 120–134',
      body: `Fifteen short psalms, each with the heading "a song of degrees" or "a song of ascents," traditionally understood as the songs pilgrims sang on the road up to Jerusalem for the three great feasts. They are short — Psalm 131 has only three verses — and read together as a sequence. They cover the road: leaving home in trouble (120), looking up to the hills (121), arriving at the gates of Jerusalem (122), the city as the place of God's throne (124, 125, 126), the family at home in God's blessing (127, 128), the trouble that has not gone away (129, 130), the soul at rest like a weaned child (131), the brothers dwelling together in unity (133), the night watchmen blessing the Lord in the temple (134). They are also the prayer book of pilgrimage in the literal sense — songs for people who are on a road, going up.`,
    },
    {
      name: 'The Closing Doxology',
      role: 'PSALMS 146–150',
      body: `The Psalter does not end on a lament, on a psalm of resolution, on a psalm of testimony. It closes on five psalms of pure praise, each beginning and ending with the word hallelujah — praise the Lord. Psalm 146: praise the Lord, who lifteth up them that are bowed down. Psalm 147: praise the Lord, who healeth the broken in heart and bindeth up their wounds. Psalm 148: praise the Lord from the heavens; praise him in the heights. Psalm 149: sing unto the Lord a new song. Psalm 150: praise him with the sound of the trumpet, with the psaltery and harp, with the timbrel and dance, with stringed instruments and organs, with the loud cymbals — let every thing that hath breath praise the Lord. Praise ye the Lord.`,
    },
  ],

  castGroups: [
    {
      label: 'The attributed voices',
      characters: [
        {
          id: 'david',
          tag: 'Poet',
          name: 'David',
          epithet: 'The praying king',
          body: `Seventy-three psalms carry the heading "le-David" — "of David," "belonging to David," "in the manner of David." The historical David is the dynastic founder of Jerusalem; the David of the Psalter is the type of the king who prays in every condition, including the condition of having sinned. Psalm 51, the great penitential psalm, carries the superscription "when Nathan the prophet came unto him, after he had gone in to Bath-sheba." Whether he composed it or not, the connection is theological, not just biographical.`,
          appears: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 39, 40, 41, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 68, 69, 70, 86, 101, 103, 108, 109, 110, 122, 124, 131, 133, 138, 139, 140, 141, 142, 143, 144, 145],
        },
        {
          id: 'asaph',
          tag: 'Poet',
          name: 'Asaph',
          epithet: 'The temple singer',
          body: `Twelve psalms are attributed to Asaph, the head of a Levitical guild of temple singers. The Asaph psalms dominate Book III (73–89), the darkest book of the Psalter. Psalm 73 — one of the great wisdom psalms — opens with near-apostasy ("as for me, my feet were almost gone") and resolves in an act of sustained trust. Asaph is the Psalter's most direct theologian of suffering, grappling most explicitly with the problem of the prosperity of the wicked and the silence of God.`,
          appears: [50, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83],
        },
        {
          id: 'sons-of-korah',
          tag: 'Poet',
          name: 'The Sons of Korah',
          epithet: 'The Korahite guild',
          body: `Eleven psalms are attributed to the sons of Korah, another Levitical guild of temple singers. Their psalms — concentrated in Books II and III — include some of the most celebrated in the collection: Psalm 42–43 (as a deer pants for water), Psalm 46 (God is our refuge and strength), Psalm 84 (how lovely is thy tabernacle), Psalm 87 (glorious things of thee are spoken, O city of God). The Korahite collection has a distinctive intensity of longing for the temple and the presence of God.`,
          appears: [42, 43, 44, 45, 46, 47, 48, 49, 84, 85, 87, 88],
        },
        {
          id: 'moses',
          tag: 'Poet',
          name: 'Moses',
          epithet: 'Author of Psalm 90',
          body: `Only one psalm is attributed to Moses: Psalm 90, which opens Book IV. "Lord, thou hast been our dwelling place in all generations. Before the mountains were brought forth, or ever thou hadst formed the earth and the world, even from everlasting to everlasting, thou art God." It is the oldest psalm in the collection and the one most directly concerned with the disproportion between human time — "a thousand years in thy sight are but as yesterday when it is past" — and divine eternity. The context of the wilderness wandering, in which Moses watched a whole generation die without reaching the land, gives the psalm its weight.`,
          appears: [90],
        },
      ],
    },
    {
      label: 'The structural voices',
      characters: [
        {
          id: 'lament-voice',
          tag: 'Genre',
          name: 'The Lament Voice',
          epithet: 'Psalms 6, 13, 22, 42–43, 88, 130',
          body: `More than a third of the Psalter is lament. The form is consistent: address God by name, describe the trouble in vivid detail, complain — sometimes accuse God directly of abandonment — ask for deliverance, and almost always pivot to an act of trust or vow of thanksgiving before the deliverance has come. Psalm 22 is the most famous: "My God, my God, why hast thou forsaken me" opens it; "I will declare thy name unto my brethren" closes it. Psalm 88 is the only psalm that does not pivot — it ends in darkness, and the book includes it without apology.`,
          appears: [6, 13, 22, 25, 31, 38, 42, 43, 51, 54, 55, 56, 57, 59, 61, 64, 69, 70, 71, 77, 86, 88, 102, 109, 120, 130, 140, 141, 142, 143],
        },
        {
          id: 'imprecatory-voice',
          tag: 'Genre',
          name: 'The Imprecatory Voice',
          epithet: 'Psalms 35, 58, 69, 109, 137',
          body: `The psalms that pray violent things against enemies. Modern liturgical practice has often quietly suppressed them; the book has not. The imprecatory voice commits its desire for vengeance to God rather than carrying it out — which is either the model of moral maturity or its failure, depending on the tradition one reads from. C. S. Lewis argued that the imprecations at least evidence genuine moral seriousness: the psalmist cares enough about justice to pray fiercely about it. The book records the voice without endorsing it theologically, and leaves the reader to reckon with what it means that prayer includes this.`,
          appears: [35, 58, 69, 83, 109, 137, 139, 140],
        },
        {
          id: 'royal-voice',
          tag: 'Genre',
          name: 'The Royal Voice',
          epithet: 'Psalms 2, 18, 20, 21, 45, 72, 89, 110, 132',
          body: `The voice of the Davidic king — at coronation, marriage, battle, enthronement, and prayer. Contains the line most quoted in the New Testament: "The Lord said unto my Lord, Sit thou at my right hand" (Psalm 110:1). After the monarchy ended in 586 BCE the royal psalms continued to be sung in the second temple, their language increasingly read as the language of a king to come. The messianic expectation of late Second Temple Judaism, and the Christian reading of Jesus as that expected king, both depend textually on the Psalter's preservation of the royal voice beyond the monarchy's end.`,
          appears: [2, 18, 20, 21, 45, 72, 89, 101, 110, 132, 144],
        },
      ],
    },
  ],

  chapters,
};

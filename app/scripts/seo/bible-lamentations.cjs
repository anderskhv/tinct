// SEO content data for the book of Lamentations.
// Five poems composed in the aftermath of the destruction of Jerusalem in 586 BCE.
// Hebrew title: Eikhah ('How…'). Traditionally attributed to Jeremiah; modern scholarship treats it as anonymous.
// First four chapters are alphabetic acrostics; chapter 3 is a triple acrostic.
// Voice: literary, declarative present, attentive to grief held in form.

const chapters = require('/tmp/bible-lamentations-chunk-1.json');

module.exports = {
  id: 'bible-lamentations',
  title: 'Lamentations',
  author: 'Anonymous (traditionally Jeremiah)',
  byline: 'c. 6th c. BCE · Hebrew Bible · Writings · Five Megillot',
  titleAccent: 'a guided tour',
  hook: 'Jerusalem has fallen. The temple is ash. Five poems, each one a different voice holding grief in the strictest possible form — because without form, chaos wins.',
  genre: ['Poetry', 'Elegy', 'Hebrew Bible', 'Ancient literature'],

  about: [
    `<em>Lamentations</em> is five poems composed in the immediate aftermath of the Babylonian destruction of Jerusalem in 586 BCE — the burning of Solomon's temple, the breach of the walls, the slaughter of those who had not already died of starvation, the deportation of the surviving population to Babylon. The Hebrew title is <em>Eikhah</em>, "How" — the word that opens the first poem and is the conventional first word of a Hebrew funeral song. Four of the five chapters are alphabetic acrostics: each verse begins with the next letter of the twenty-two-letter Hebrew alphabet, in order, from aleph to taw. Chapter 3 is a triple acrostic — three verses per letter, sixty-six verses in all. The formal discipline is not ornamental. It is the act of imposing the most rigorous available order on the worst possible event.`,
    `The book has five distinct voices and one sustained subject: what it is to live inside an unresolved catastrophe. Chapter 1 gives the city a face — Jerusalem personified as a widow, weeping in the night, eventually allowed to speak for herself. Chapter 2 names God directly as the agent of the destruction, without evasion or mitigation. Chapter 3 — the formal and theological centre — gives the floor to a single man who has seen affliction, moves through sixty-six verses of concentrated suffering, and at the centre of the centre recovers one conviction: <em>It is of the Lord's mercies that we are not consumed. They are new every morning. Great is thy faithfulness.</em> Chapter 4 returns to the city with unsparing specificity — the children in the streets, the famine, the siege. Chapter 5 gives the floor to the surviving community, speaking together as <em>we</em>, in the only chapter without an acrostic. The book ends without an answer from God. That is not an accident.`,
  ],

  chaptersSubtitle: 'All 5 poems, in order — from the widow weeping in the night to the community\'s unanswered petition.',
  chaptersLead: `<p>Lamentations is short — readable in under an hour — and the order matters. Each poem is a different formal experiment in how to hold grief: different voice, different acrostic structure (or its deliberate absence), different theological angle. Read them in sequence and the cumulative effect, ending in chapter 5\'s open question, is the book\'s argument.</p>`,

  themesByline: 'Five threads through the five poems',
  themesLead: `Lamentations does not resolve. It records. The five themes below are the formal and theological moves the book makes as it holds the catastrophe in view — the discipline of form, the face of the city, the silence of God, the mercies that are new every morning, and the ending that refuses to close.`,

  chapterLabel: n => 'Lamentations ' + n,

  groups: [
    {
      label: 'Five poems · The long hearing',
      subtitle: 'The widow, the enemy named, the centre, the children, the community\'s petition.',
      chapters: [1, 2, 3, 4, 5],
    },
  ],

  themes: [
    {
      slug: 'acrostic-as-discipline',
      title: 'The Acrostic as Discipline against Chaos',
      greek: 'from aleph to taw — the alphabet as the frame of grief',
      preview: 'Four of the five chapters impose the Hebrew alphabet on their structure, verse by verse. It is the most rigorous formal device available in the tradition, applied to the worst possible grief — because grief without form has no end.',
      essay: [
        `The most distinctive formal feature of Lamentations is the acrostic structure of four of its five chapters. In chapters 1, 2, and 4, each verse begins with a successive letter of the twenty-two-letter Hebrew alphabet — the first verse with aleph, the second with bet, and so on through to taw. In chapter 3, the acrostic is tripled: three verses for each letter, sixty-six verses in total, with all three verses of each triplet beginning with the same letter. Only chapter 5 abandons the acrostic, and even there the chapter has the canonical twenty-two verses, retaining the formal frame without the alphabetic ornament.`,
        `The grief the poems describe is, by any reasonable measure, beyond ordering. The city is destroyed. The temple is burnt. Children are starving in the streets. Mothers are eating their own children — a horror twice mentioned, in 2:20 and 4:10, and not euphemised. The prophets have had no vision; the priests are dead; the elders sit silent. Into this collapse the poet imposes the most rigorous formal discipline available in his tradition: the alphabet itself, applied verse by verse, with the pattern visible to any reader who could spell. The discipline does not minimise the grief; it carries it. It says, as plainly as form can say anything, that the grief will be expressed completely (from aleph to taw), that it will be expressed in order, and that the order will not be allowed to fail.`,
        `There is also a liturgical function. An acrostic is more memorisable than a formless lament, easier to recite, easier to hold in a community's collective memory. The book has been read aloud on the ninth of Av — the fast day commemorating the destruction of both temples — for over two thousand years, and the acrostic structure is part of why that recitation has remained possible. Grief, the form says, is not opposed to discipline; the discipline of form is one of the things that makes sustained grief bearable. The same insight runs through every literature that has had to mourn at scale. Lamentations is one of its earliest and most rigorous statements.`,
      ],
      where: [
        { n: 1, label: 'Ch 1 (aleph through taw — the opening acrostic)' },
        { n: 3, label: 'Ch 3 (the triple acrostic — three verses per letter)' },
        { n: 4, label: 'Ch 4 (the shortened acrostic — briefer verses, same discipline)' },
        { n: 5, label: 'Ch 5 (twenty-two verses without the acrostic — the deliberate break)' },
      ],
    },
    {
      slug: 'daughter-zion',
      title: 'Daughter Zion',
      greek: '"Is it nothing to you, all ye that pass by?"',
      preview: 'Jerusalem personified as a widow, an abandoned woman, a mother whose children are gone. The personification is the structural device by which the poet gives the destruction a face. Daughter Zion is not an allegory; she is the figure the book insists you see.',
      essay: [
        `The dominant figure of the first two chapters and a recurring presence throughout the book is the personified city — Zion, Jerusalem, the daughter of Zion, the daughter of my people. The personification is not casual decoration; it is the structural device by which the poet gives the destruction a face and a voice. In chapter 1 the city sits solitary in the night, weeping bitterly with tears on her cheeks; her lovers have abandoned her; her enemies have prevailed; her children have gone into captivity. The poet describes her in the third person for the first half of the chapter, and then, in a shift that is one of the most powerful single moves in the book, lets her speak. <em>Is it nothing to you, all you that pass by? Behold and see if there be any sorrow like unto my sorrow.</em>`,
        `The voice that emerges from the description is the voice of a woman who has lost everything — her husband (figured as God's protective presence), her children (the population deported and killed), her honour (the temple violated), her place. In chapter 2 the personification continues but the framing shifts; now God himself is the active agent of the destruction, and the city is described in language that draws on the imagery of marital betrayal. Chapter 4 returns to the city and to the children, and the poet's voice describes the daughter of my people in the most concrete and unsparing terms in the book. Chapter 5 closes the cycle with the community's collective voice, the surviving fragment, addressing God directly.`,
        `The personification of the city as a woman has roots earlier in the prophetic tradition — Hosea, Jeremiah, Ezekiel all use it — but Lamentations gives the figure a sustained psychological reality that is, on the page, unmatched. Daughter Zion is the figure who carries the book's grief as an embodied person, not as an abstraction. The line from 1:12 — <em>is it nothing to you, all you that pass by</em> — is one of the most quoted in the book and one of the most theologically pressing. To read Lamentations is to be the one who passes by, and to be asked, by the city herself, to stop.`,
      ],
      where: [
        { n: 1, label: 'Ch 1 (the widow described, then speaking — verse 12)' },
        { n: 2, label: 'Ch 2 (God becomes as an enemy; the city addressed directly)' },
        { n: 4, label: 'Ch 4 (the daughter of my people — the famine and the children)' },
      ],
    },
    {
      slug: 'silence-of-god',
      title: 'The Silence of God',
      greek: 'God named on every page; speaking on none',
      preview: 'There is no oracle from God anywhere in the five chapters. God is the agent named behind every catastrophe the poems describe, and the addressee of the community\'s final petition. He does not answer within the text. The silence is one of the book\'s theological gifts.',
      essay: [
        `God is named on every page of the book and speaks on no page of the book. There is no oracle delivered in God's voice anywhere in the five chapters. There is no answer to any of the questions the poems raise. The community petitions; God does not respond within the text. Most other prophetic literature in the Hebrew Bible follows a recognisable pattern: judgement is announced, judgement falls, comfort is offered. Lamentations stops at the second of these steps. The judgement has fallen. The comfort has not yet come.`,
        `What is present, throughout, is God as the one who has done this — the agent named, again and again, behind every catastrophe the poems describe. Chapter 2 is the most uncompromising on this point: <em>The Lord has become as an enemy; he hath swallowed up Israel.</em> Chapter 3 wrestles directly with this, in the voice of the man who has seen affliction: <em>he has led me into darkness, he has hedged me about, he has chained me.</em> The book does not retreat from naming God as the agent. It also does not retreat from the silence.`,
        `The most quoted lines in the book — 3:22-23, <em>the Lord's mercies are new every morning, great is thy faithfulness</em> — are spoken not as a divine answer but as the speaker's own conviction held against the silence. They are, in form, a piece of recovered theology in the middle of a longer expression of suffering. The reader who comes to Lamentations expecting consolation will find some — chapter 3 in particular contains it — but the consolation is offered not from God's mouth, but from the speaker's own resolve to remember what he had been taught. The God who is silent in the book is the same God who, the speaker still affirms, is faithful. Whether the affirmation can be sustained is one of the questions the book leaves the reader holding.`,
      ],
      where: [
        { n: 1, label: 'Ch 1 (the city petitions; no answer arrives)' },
        { n: 2, label: 'Ch 2 (God named as the agent; the city addressed)' },
        { n: 3, label: 'Ch 3 (the man who has seen affliction; the recovery of faithfulness)' },
        { n: 5, label: 'Ch 5 (the community\'s petition; the silence continues)' },
      ],
    },
    {
      slug: 'mercies-new-every-morning',
      title: 'Mercies New Every Morning',
      greek: '"This I recall to my mind, and therefore I have hope"',
      preview: 'At the formal centre of the book — inside the longest chapter, in the middle of sustained suffering — a speaker deliberately calls something to mind. Not a consolation from outside. A recovered conviction from within.',
      essay: [
        `The formal centre of Lamentations is chapter 3, the longest and most structurally elaborate of the five poems. It is a triple acrostic: three verses begin with aleph, three with bet, and so on through all twenty-two Hebrew letters, for a total of sixty-six verses. The speaker is a first-person male voice — the man that hath seen affliction — who has no name and is not identified with Jeremiah or any historical figure, despite the traditional attribution. The first twenty verses are a description of his suffering in language that draws on the full tradition of Hebrew personal lament: darkness, broken bones, enclosure, derision, despair.`,
        `Then, at verse 21, in the centre of the centre of the book, comes the turn. <em>This I recall to my mind, and therefore I have hope.</em> It is of the Lord's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness. The Lord is my portion, saith my soul; therefore will I hope in him. Several features of the passage are worth noticing carefully. It is spoken in the middle of unrelieved suffering, not after it; the speaker is not consoled by external events, only by what he chooses to call to mind. The structure is recursive: the verb in verse 21 is <em>I recall to my mind</em>; the speaker is doing something deliberate with his memory, calling up theological convictions he had been taught in better days, and using them to maintain hope in the present.`,
        `The passage does not resolve the book. The chapter continues for another forty verses, and the book continues for two more chapters, both of which return to the suffering. The mercies new every morning are not the book's last word. They are its centre — the moment at which the speaker, in the deepest part of the cycle of grief, recovers a single conviction strong enough to keep speaking. That recovery, in the formal middle of the book, is the structural answer Lamentations offers to the question of how to live in unresolved catastrophe. Thomas Chisholm's 1923 hymn <em>Great Is Thy Faithfulness</em> paraphrases this passage directly; it is the most widely sung theology drawn from Lamentations, and it comes from a chapter that does not resolve the suffering it is held inside.`,
      ],
      where: [
        { n: 3, label: 'Ch 3 verses 1-20 (the suffering described)' },
        { n: 3, label: 'Ch 3 verses 21-24 (the turn — "this I recall to my mind")' },
        { n: 3, label: 'Ch 3 verses 25-66 (petition and communal lament resume)' },
      ],
    },
    {
      slug: 'unresolved-ending',
      title: 'The Unresolved Ending',
      greek: '"Turn thou us unto thee, O Lord — unless thou hast utterly rejected us"',
      preview: 'The most disputed verse in the book is its last. The community petitions for restoration. Then comes verse 22 of chapter 5, whose grammar is ambiguous in Hebrew and whose three possible readings carry different theological weights. The book ends on the open question.',
      essay: [
        `The most controversial feature of Lamentations is its last verse. The book ends, in chapter 5, with a collective petition — the surviving community speaking together to God after the four preceding poems have given the catastrophe its long expression. The petition is the only chapter not in acrostic form, and it ends with a prayer in the imperative: <em>turn thou us unto thee, O Lord, and we shall be turned; renew our days as of old.</em> This would be a fitting close to the book — a request for restoration grounded in the community's recognition that the turning must come from God's side.`,
        `But the verse that follows, 5:22, has been one of the most disputed verses in the Hebrew Bible. The Hebrew is grammatically ambiguous and admits at least three different translations. The KJV gives: <em>but thou hast utterly rejected us; thou art very wroth against us.</em> Most modern translations give some version of: <em>unless you have utterly rejected us, and are angry with us beyond measure.</em> A third reading, found in some recent scholarship, gives: <em>even though you have utterly rejected us</em> — a defiant concession. The three readings produce theologically very different endings. What is not ambiguous is that the book ends without an answer from God.`,
        `The Jewish liturgical practice in the synagogue is to repeat the second-to-last verse aloud after the last verse, so that the book does not end on the harshness of the closing line; the same practice is followed at the end of Isaiah, the Twelve, and Ecclesiastes for similar reasons. The book as written closes on the open question. The book that began with <em>How</em> — the cry of formal lament — ends with a question the book does not resolve. The reader who comes to Lamentations looking for the book in scripture that will let grief be grief, without forcing it toward premature comfort, will find that Lamentations is exactly that book, and that its last word is the open question every grieving community has had to carry.`,
      ],
      where: [
        { n: 5, label: 'Ch 5 verses 19-21 (the petition for restoration)' },
        { n: 5, label: 'Ch 5 verse 22 (the disputed closing — statement, conditional, or defiance)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Daughter Zion',
      role: 'Personified city',
      body: `Jerusalem personified as a widow, mother, and abandoned bride. Described in the third person for the first half of chapter 1, then allowed to speak for herself — "Is it nothing to you, all ye that pass by?" — in one of the most powerful single moves in the book. She returns through chapters 2 and 4 as the figure who gives the destruction a face. She is treated, in the poems, as a person whose pain the reader is being asked to see.`,
    },
    {
      name: 'The Man That Hath Seen Affliction',
      role: 'Speaker of chapter 3',
      body: `The first-person male voice who speaks the formal centre of the book. Unnamed, unidentified with Jeremiah or any historical figure. He moves through sixty-six verses: the first twenty are concentrated suffering; at verse 21 he turns deliberately — "this I recall to my mind, therefore I have hope" — and gives the most quoted passage of the whole book, the mercies new every morning. He is not consoled by external events. He calls up what he had been taught. He is the figure through whom the book offers its central answer to grief: not resolution, but the deliberate act of remembering what you believe, in the middle of what you are enduring.`,
    },
    {
      name: 'The Adversary',
      role: 'Babylon / divine wrath',
      body: `On the surface of the historical narrative, the adversary is Babylon — Nebuchadnezzar's army, the besieging force, the soldiers who burned the temple and deported the population. The book names this enemy at points. But the deeper adversary, named again and again, is God himself. The poems insist, with a theological severity that has unsettled readers for two and a half thousand years, that God is the one who has done this. The historical Babylonians are the instrument; God is the agent. The adversary and the redeemer are, in the theology of Lamentations, the same God. The book does not resolve the difficulty. It records it.`,
    },
    {
      name: 'The Surviving Children',
      role: 'Witnesses to the siege',
      body: `The most concrete and unsparing single subject of the book is the suffering of the children. Babies and sucklings faint in the streets of the city. The young children ask their mothers for bread and receive none. The tongue of the sucking child cleaves to the roof of his mouth for thirst. Mothers, pitiful and compassionate, have boiled their own children — a horror stated twice, in 2:20 and 4:10, without euphemism. The book refuses to abstract the catastrophe. The children carry the weight of its theological severity at its sharpest point.`,
    },
    {
      name: 'The Priests and the Elders',
      role: 'Failed leadership',
      body: `Throughout the book, the religious and civic leadership of the destroyed city are named as having failed. The priests and the elders gave up the ghost in the city while they sought food. The prophets find no vision from the Lord. The elders of the daughter of Zion sit upon the ground and keep silence, with dust on their heads and sackcloth on their bodies. They are not primarily villains here; they are figures of broken authority, sharing the catastrophe they had been called to prevent, sitting silent in the ash with everyone else.`,
    },
    {
      name: 'God-as-Silent-Presence',
      role: 'Addressed throughout; never answering',
      body: `God is named on every page of the book and speaks on no page of the book. There is no oracle delivered in God's voice anywhere in the five chapters. God is the agent of the destruction, named explicitly in chapters 2 and 3 as the one who has bent his bow and become as an enemy. God is the addressee of the community's petition in chapter 5. God is the one whose mercies the speaker of chapter 3 calls to mind. God is everywhere in the book and nowhere speaking. Whether the silence is rejection, judgement, mystery, or grief on God's own part is a question the book does not settle. It preserves the silence as one of its theological gifts.`,
    },
  ],

  castSubtitle: 'Jerusalem after the fall — the voices inside the catastrophe.',
  castLead: `<p>Lamentations has no named human characters. Its cast is theological and figural — voices that carry different relationships to the catastrophe: the personified city, the anonymous witness at the centre, the community speaking together, the God who is named but not speaking. The book's cast is its argument about what grief requires.</p>`,

  castGroups: [
    {
      label: 'The voices',
      characters: [
        {
          id: 'daughter-zion',
          tag: 'CITY',
          name: 'Daughter Zion',
          epithet: 'Jerusalem personified',
          body: `The dominant figure of chapters 1 and 2 and a recurring presence throughout. Jerusalem personified as a widow and abandoned mother: her lovers have abandoned her, her children are in captivity, her temple violated, her roads in mourning. In chapter 1, after eleven verses of third-person description, the city speaks for herself — "Is it nothing to you, all ye that pass by?" The shift is the book's most powerful single move. She is the structural device by which the poet gives the destruction a face, and the figure the book most insists must be seen.`,
          appears: [1, 2, 4, 5],
        },
        {
          id: 'the-man-that-hath-seen-affliction',
          tag: 'WITNESS',
          name: 'The Man That Hath Seen Affliction',
          epithet: 'Speaker of chapter 3',
          body: `The first-person male voice who speaks the triple acrostic at the formal centre of the book. He calls himself the man that hath seen affliction by the rod of God's wrath. The first twenty verses describe his suffering in concentrated language; then, at verse 21, he turns deliberately: "This I recall to my mind, therefore I have hope" — and gives the most quoted passage of the whole book. He moves from suffering to recovered theology to renewed petition, and the book does not resolve him. He is the figure through whom the book offers its central answer to grief.`,
          appears: [3],
        },
        {
          id: 'the-surviving-community',
          tag: 'REMNANT',
          name: 'The Surviving Community',
          epithet: 'The collective we of chapter 5',
          body: `The voice of chapter 5, the only chapter not in acrostic form. The shift from the individual voices of the first four chapters to the collective we is theologically significant: this is the remnant speaking, the surviving fragment of the destroyed city, addressing God directly. The chapter is a catalogue of what has been lost and what is now endured, closing with the petition "Turn thou us unto thee, O Lord" — and then the most debated verse in the book, whose grammar leaves the ending open.`,
          appears: [5],
        },
      ],
    },
    {
      label: 'Figures in the background',
      characters: [
        {
          id: 'god-as-silent-presence',
          tag: 'ABSENT / PRESENT',
          name: 'God-as-Silent-Presence',
          epithet: 'Named throughout; speaking nowhere',
          body: `God is named on every page of the book and speaks on no page. There is no oracle, no answer, no consoling framework delivered in God's voice. He is named as the agent of the destruction in chapter 2 — "the Lord has become as an enemy" — and as the addressee of every petition in the book. The community's final petition in chapter 5 receives no answer within the text. The book preserves the silence, without resolving it, as one of its theological gifts to every community that has had to live with the same absence.`,
          appears: [1, 2, 3, 4, 5],
        },
        {
          id: 'the-surviving-children',
          tag: 'WITNESSES',
          name: 'The Surviving Children',
          epithet: 'The most concrete subject in the book',
          body: `The book returns to the children again and again. Babies faint in the streets. Young children beg bread from their mothers and receive none. The tongue of the suckling child cleaves to the roof of his mouth for thirst. Mothers compassionate have boiled their own children — a horror recorded in 2:20 and 4:10 without euphemism or abstraction. The surviving children are not a theme; they are the evidence. They are the reason the book refuses to move quickly toward consolation.`,
          appears: [1, 2, 4, 5],
        },
        {
          id: 'priests-and-elders',
          tag: 'LEADERSHIP',
          name: 'The Priests and the Elders',
          epithet: 'The silent remnant of the leadership',
          body: `The religious and civic leadership of Jerusalem appear throughout the book as figures of broken authority. The priests sigh; the prophets find no vision from the Lord; the elders sit upon the ground in silence, dust on their heads and sackcloth on their bodies. They are not primarily condemned in Lamentations — the prophetic indictment of false prophets and corrupt priests belongs to Jeremiah and Ezekiel. Here they sit silent in the ash with everyone else. Their silence is part of what the book records.`,
          appears: [1, 2, 4, 5],
        },
      ],
    },
  ],

  chapters,
};

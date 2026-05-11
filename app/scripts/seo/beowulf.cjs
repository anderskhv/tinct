// SEO content data for Beowulf — Old English epic, c. 700-1000 CE.
// Anonymous, composed orally, surviving in a single manuscript.
// Voice: literary, declarative present. Specific about manuscript history and scholarship.

module.exports = {
  id: 'beowulf',
  title: 'Beowulf',
  author: 'Anonymous',
  byline: 'c. 700\u20131000 AD \u00b7 Old English epic',
  titleAccent: 'a guided tour',
  hook: 'A young warrior crosses the sea to a foreign hall emptied for twelve years by something that comes out of the dark. He kills it with his bare hands. He kills its mother in her cave under a haunted lake. Fifty years later, he dies fighting a dragon. Beowulf is the oldest long poem in the English language, and one sustained meditation on the kind of courage that does its work knowing the work will not be enough.',

  genre: ['Epic poetry', 'Old English literature', 'Heroic narrative'],

  themesBlurb: 'Heroic courage, the hall and the dark, monsters and their genealogy, gold and the gift economy.',
  castBlurb: 'The Geats and the Danes',
  castDesc: 'Warriors, kings, and the creatures that come in the night.',
  castSubtitle: 'The Geats and the Danes — warriors, kings, and the creatures that come in the night.',

  chapterLabel: n => `Fitt ${n}`,

  about: [
    `<em>Beowulf</em> is the longest poem in Old English \u2014 3,182 lines of alliterative verse, surviving in a single manuscript in the British Library, copied around the year 1000 CE by two monastic scribes whose names we do not know. The poem is older than the manuscript, probably by two or three centuries; the precise date of composition is one of the longest-running arguments in English studies. The setting is older still: early sixth-century Scandinavia, a world the poem\'s English audience knew through legend rather than memory. The hero is Beowulf, a young warrior of the Geats, a tribe inhabiting what is now southern Sweden.`,
    `The poem falls into three movements. In the first, Beowulf hears that the Danish king Hrothgar\'s great hall, Heorot, has for twelve years been emptied every night by a monster called Grendel \u2014 descendant of Cain, the poem says, marked by God\'s curse. Beowulf crosses the sea and kills Grendel barehanded in the dark hall, then kills Grendel\'s mother in her cave under a haunted mere. In the third movement, fifty years later, an old king now, he faces a dragon roused by the theft of a single cup from its hoard. He kills it with the help of one loyal young kinsman named Wiglaf, and dies of its venom in the same fight.`,
    `J.R.R. Tolkien\'s 1936 lecture \u2018Beowulf: The Monsters and the Critics\u2019 rescued the poem from being read as a historical curiosity and established it as the major literary work it is. Its deep subject is the dignity of acting well in a world where action does not save what it acts for \u2014 what Tolkien called \u2018the theory of courage.\u2019 Heorot will burn. The Geats will be overrun. The hoard Beowulf died for will be reburied, useless. The poem knows all of this, and makes its case for the courage anyway.`,
  ],

  chaptersSubtitle: 'All 43 fitts, from the funeral ship of Scyld to the burning of Beowulf.',
  chaptersLead: `<p>Beowulf is structured in 43 fitts \u2014 numbered sections of the original manuscript. The poem moves in three great arcs: Fitts I\u2013XXI cover the voyage to Denmark, the killing of Grendel, and the return; Fitts XX\u2013XXVII descend to the mere and Grendel\'s mother; Fitts XXXII\u2013XLIII are the dragon and the funeral, fifty years later. The digressions \u2014 the Finn episode, the lay of the last survivor, the Heremod warnings \u2014 are not detours. They are the poem\'s argument.</p>`,

  themesByline: 'Five threads through the poem',
  themesLead: `Beowulf is a heroic poem that refuses the consolations of the heroic genre. Every victory is real; none of it holds. Tolkien named the pattern: the poem\'s argument is that courage is dignity, not salvation. Here are the five threads that carry it.`,

  groups: [
    {
      label: 'Fitts I\u2013XXI \u00b7 Grendel at Heorot',
      subtitle: 'Beowulf crosses the sea, waits in the dark hall, and tears the monster apart.',
      chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    },
    {
      label: "Fitts XXII\u2013XXXI \u00b7 Grendel\'s mother",
      subtitle: "Beowulf follows her into the haunted mere and fights her at the bottom of the lake.",
      chapters: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    },
    {
      label: 'Fitts XXXII\u2013XLIII \u00b7 The dragon',
      subtitle: 'Fifty years later, an old king faces a dragon. He kills it. It kills him.',
      chapters: [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43],
    },
  ],

  themes: [
    {
      slug: 'the-long-defeat',
      title: 'The Long Defeat',
      preview: 'Tolkien named the pattern: every victory in the poem is real, and none of it holds. Heorot will burn. The Geats will be overrun. The hoard will be reburied, useless. The poem\'s argument is that the courage was worth having anyway.',
      essay: [
        `Beowulf is structured around an argument that Tolkien named more precisely than any other reader of the poem: that the heroic life is not redemptive in any final sense but is dignified anyway. The poem is unflinching about the futility of its own action. Heorot, whose construction is described in the opening as one of the wonders of the age, is shadowed from the moment of its building by the poet\'s brief aside that it will burn \u2014 in a feud the poem only sketches, between Hrothgar\'s Danes and the Heathobards.`,
        `Beowulf\'s killing of Grendel saves the hall for a season but does not save it from history. His killing of Grendel\'s mother does not heal the larger feuds. His fifty winters as king of the Geats, peaceful and prosperous, end in a dragon-fight he cannot win without dying, after which his country is overrun by enemies kept in check only by his presence. The hoard he died winning is reburied with him because no one alive can use it.`,
        `Every piece of action in the poem, taken individually, is a victory. Every piece taken in context is a deferral of the loss it will eventually meet. The poem does not pretend this is anything other than what it is. The poet steps back, again and again, to remind the audience that the king will die, that the hall will burn, that the gold will lie buried again, that the songs sung in the halls of the great will be sung in different halls by different singers when these singers are gone.`,
        `What the poem refuses to do is conclude that the action was therefore not worth doing. Beowulf goes against the dragon as an old man and dies. Wiglaf stays at his side. The funeral pyre at the end of the poem is enormous and the lament is long. The argument of the poem is that the funeral is not a defeat of the courage; it is the form the courage takes when the world is what the world is. Tolkien, who called this \u2018the theory of courage,\u2019 read it as the deepest thing the Northern imagination had given to European literature.`,
      ],
      where: [
        { n: 1, label: 'Fitt I (Scyld\'s funeral ship)' },
        { n: 14, label: 'Fitt XIV (Heorot\'s shadow foretold)' },
        { n: 32, label: 'Fitt XXXII (the last survivor\'s lament)' },
        { n: 43, label: 'Fitt XLIII (the burning of Beowulf)' },
      ],
    },
    {
      slug: 'the-hall-and-the-dark',
      title: 'The Hall and the Dark',
      preview: 'Old English society is built on the hall: the lord at the high seat, the warriors at the long tables, the fire burning, the songs linking the present to the lost past. Outside is everything the hall keeps out. The poem\'s monsters all come from outside, and they all attack the hall directly.',
      essay: [
        `The image at the centre of the poem is the great hall \u2014 Heorot in the first movement, Beowulf\'s own hall in the third \u2014 set against the night and the wilderness outside it. Old English society as the poem imagines it is built on the hall: the lord at the high seat, the warriors on benches at the long tables, the gift-giving by which loyalty is paid for, the songs that link the present to the lost past, the fire burning. Outside the hall is everything the hall keeps out: the cold, the wolves, the mere where Grendel\'s kin live, the dragons sleeping in their barrows, the feuds that have not yet broken, the night.`,
        `The poem\'s monsters all come from outside the hall, and they all attack it directly. Grendel hates the sound of song coming from Heorot and pulls down the warriors who sleep there. The dragon, when its hoard is disturbed, burns Beowulf\'s hall to the foundations. The mere where Grendel\'s mother lives is described with concentrated dread \u2014 the bottomless water, the trees leaning over with their roots burning, the deer that will not enter the woods even pursued by hounds \u2014 so that Beowulf\'s descent into it is the most claustrophobic passage in the poem.`,
        `What the hall represents is not only safety but meaning: the place where the past can be sung, where gifts can be given that bind one warrior to another, where a young man like Beowulf can be welcomed by a king and given a place at the bench. The dark is what dissolves all of this. The poem\'s structural genius is to show, again and again, that the hall is built directly on the dark, that the dark is older than the hall, that the dark waits.`,
        `The Old English elegies \u2014 <em>The Wanderer</em>, <em>The Seafarer</em>, <em>The Ruin</em> \u2014 share the same vision in shorter compass. <em>Beowulf</em> is the long version. The hall is the poem\'s answer to the dark, and the answer is never permanent. The only response available to the people inside is to live well there for as long as the fire burns.`,
      ],
      where: [
        { n: 2, label: 'Fitt II (Heorot rising)' },
        { n: 3, label: 'Fitt III (twelve winters of terror)' },
        { n: 21, label: 'Fitt XXI (description of the mere)' },
        { n: 32, label: 'Fitt XXXII (the dragon burns Beowulf\'s hall)' },
      ],
    },
    {
      slug: 'grendel-and-the-kin-of-cain',
      title: 'Grendel and the Kin of Cain',
      preview: 'The poet\'s choice to identify Grendel as a descendant of Cain places him in the genealogy of the Hebrew Bible. He is not just an animal threatening a settlement; he is a creature whose existence is the consequence of the world\'s first wrong choice.',
      essay: [
        `The poet\'s choice to identify Grendel as a descendant of Cain \u2014 explicit at lines 102\u2013114 and again at 1260\u20131267 \u2014 is one of the most consequential single moves in the poem. Grendel could have been a generic Northern monster, of which the Old English imagination had plenty. Instead the poet places him in the genealogy of the Hebrew Bible, descended from the first murderer, exiled from the human community by an act of fratricide whose punishment was to wander the dark places of the earth.`,
        `The decision changes the whole register of the conflict. Grendel is not just an animal threatening a settlement; he is a creature whose existence is the consequence of the world\'s first wrong choice, and his hatred for the song coming from Heorot is the hatred of the cursed for the unfallen. The poet, working in a Christian tradition that had absorbed the older heroic material rather than replacing it, reads the heroic-age violence of his own legendary past through the lens of the Genesis story he believes is the true history of all violence.`,
        `The result is not allegory. Grendel remains a creature, with arms and breath and blood, and Beowulf kills him in a wrestling match that is one of the most physical sequences in early English poetry. The Christian frame deepens the action rather than displacing it. Grendel\'s mother, when she comes the next night, is the same kind of being \u2014 kin of Cain, a creature whose grief for her son is recognizable as grief and whose fight Beowulf nearly loses.`,
        `The poem refuses to make either of them merely evil. They are exiled. They are lonely. They are cursed. They are also dangerous, and Beowulf kills them, and the killing is necessary, and the necessity is part of what the poem is grieving. The hardest reading the poem demands is the one that holds both at once.`,
      ],
      where: [
        { n: 3, label: 'Fitt III (Grendel introduced, the Cain genealogy)' },
        { n: 12, label: 'Fitt XII (the wrestling match)' },
        { n: 20, label: 'Fitt XX (Grendel\'s mother arrives)' },
        { n: 23, label: 'Fitt XXIII (fight in the cave)' },
      ],
    },
    {
      slug: 'gold-gift-and-the-breaking-of-bonds',
      title: 'Gold, Gift, and the Breaking of Bonds',
      preview: 'Old English heroic society is held together by exchange: the lord gives gifts; the retainers give loyalty. The poem\'s three monsters are all perversions of this economy. The dragon is its absolute negation: a creature who has gathered an entire treasury and lies on it, taking pleasure in possession without exchange.',
      essay: [
        `The poem\'s economic vocabulary is one of its central themes. Old English heroic society is held together by an exchange \u2014 the lord gives gifts; the retainers give loyalty; the bond between them is renewed by the giving. The most loaded compound noun in the poem is <em>beag-gyfa</em>, ring-giver, the king who hands out arm-rings and torcs from the high seat. The most loaded scene is the giving of treasure \u2014 when Hrothgar showers Beowulf with horses, weapons, and gold cups \u2014 and the most loaded image is the hoard.`,
        `The poem\'s three monsters are all, in different ways, perversions of the gift economy. Grendel is the outcast who has no lord, no hall, no place at the bench, and whose attacks on Heorot are the act of one excluded from the system trying to destroy it. Grendel\'s mother, defending her son\'s right to vengeance, is acting under the laws of feud rather than gift. The dragon is the absolute negation: a creature who has gathered an entire treasury and lies on it, taking pleasure in possession without exchange, until a single stolen cup brings down its rage.`,
        `The poet sets against the dragon image the lay of the last survivor \u2014 a long passage in which a man, the only one left of his people, brings the buried gold of his kin into the barrow that the dragon will later occupy, and laments that there is no one left to give the gold to. The lament is the poem\'s argument in miniature. Gold is not a substance; it is a relation. When the relations break, the gold becomes the dragon\'s.`,
        `When Beowulf dies and the hoard he won is buried with him, useless, the poem is showing the same logic from the other side. The one act of pure gift in the final movement is Wiglaf\'s \u2014 the young warrior who stays by Beowulf\'s side in the dragon-fight when ten others run, and who has nothing to gain from the staying. The poem ends with that act registered.`,
      ],
      where: [
        { n: 15, label: 'Fitt XV (Hrothgar\'s gifts after the killing)' },
        { n: 32, label: 'Fitt XXXII (the hoard and the dragon; lay of the last survivor)' },
        { n: 36, label: 'Fitt XXXVI (Wiglaf stays when others flee)' },
        { n: 38, label: 'Fitt XXXVIII (the hoard brought out for the dying king)' },
      ],
    },
    {
      slug: 'the-manuscript-that-almost-burned',
      title: 'The Manuscript That Almost Burned',
      preview: 'Beowulf survives in one manuscript \u2014 Cotton Vitellius A.xv \u2014 which was itself nearly destroyed in the Ashburnham House fire of 1731. Almost all of the rest of the alliterative oral tradition is gone. The narrowness of the survival is part of what gives the poem its weight.',
      essay: [
        `The Cotton Vitellius A.xv codex, in which <em>Beowulf</em> alone survives, was part of the library gathered by the antiquary Sir Robert Cotton in the late sixteenth and early seventeenth centuries from the dispersal of monastic libraries after Henry VIII\'s dissolution. By the early eighteenth century the collection had passed to his grandson and was lodged in Ashburnham House at Westminster. On 23 October 1731, Ashburnham House caught fire. Roughly a quarter of the Cotton library was destroyed and most of the rest damaged. <em>Beowulf</em> survived \u2014 but the manuscript was severely scorched, the edges of the leaves crumbling for decades afterward, and the poem nearly lost.`,
        `The first transcription of any substance was made between 1786 and 1787 by the Icelandic-born scholar Gr\u00edmur J\u00f3nsson Thorkelin, from a manuscript whose readable surface was already shrinking. Thorkelin\'s two transcripts \u2014 one made by him, one by a professional copyist \u2014 preserve readings the original no longer yields, because the binding methods of early nineteenth-century restorers covered some text that has not been recovered since. The first printed edition was Thorkelin\'s, in 1815, with a parallel Latin translation that was wrong in many places.`,
        `For nearly a century after its publication, the poem was regarded primarily as a historical document \u2014 a window onto the lost world of Northern paganism, useful for what it told scholars about the Migration Period rather than for what it was as a poem. Tolkien\'s 1936 lecture to the British Academy changed that. After Tolkien, the poem\'s deep theme is no longer in dispute: it is the dignity of acting well in a world where action does not save what it acts for.`,
        `Almost all of the rest of the Old English alliterative oral tradition is gone. What survives \u2014 the elegies, the riddles, <em>The Battle of Maldon</em>, some saints\u2019 lives \u2014 is a fraction of what must have been composed. <em>Beowulf</em> is the long poem of a tradition we have only in pieces, copied by scribes who may not have fully understood it, preserved by an accident of fire and water that could have gone the other way. The narrowness of the survival is part of what gives the poem its weight. It is a letter from a world that almost entirely vanished.`,
      ],
      where: [
        { n: 1, label: 'Fitt I (the opening summons: Hw\u00e6t)' },
        { n: 17, label: 'Fitt XVII (the Finn episode \u2014 a lost world within the poem)' },
        { n: 43, label: 'Fitt XLIII (the funeral pyre; the poem\'s last image)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Beowulf',
      role: 'Geatish warrior and king',
      body: `Nephew of Hygelac, king of the Geats \u2014 a tribe inhabiting what is now southern Sweden in the early sixth century. He appears first as a young man of unusually great strength, the strength of thirty men in his hand-grip, who hears of Hrothgar\'s trouble and crosses the sea to help. He kills Grendel barehanded and Grendel\'s mother with a giant\'s sword found in her cave. He declines the throne after returning home, accepts it only when his cousin is killed, and rules the Geats for fifty winters. Dies of the dragon\'s venom in the poem\'s final movement. His pyre, a great mound built on the headland of Hronesness visible to sailors, ends the poem.`,
    },
    {
      name: 'Hrothgar',
      role: 'Danish king',
      body: `King of the Danes at Heorot. By the time Beowulf arrives he is an old man, his hall the wonder of the age, but he has been unable for twelve years to keep Grendel from emptying it nightly. He receives Beowulf with gift-giving generosity, weeps with relief after both killings, and gives the long sermon warning Beowulf against pride \u2014 the most extended piece of moral reflection in the poem. The poem foreshadows but does not narrate the eventual destruction of his hall in a feud his marriage diplomacy could not prevent.`,
    },
    {
      name: 'Wiglaf',
      role: 'Young kinsman and the poem\'s moral center',
      body: `A young Geatish warrior, kin of Beowulf, present in the dragon-fight as one of eleven companions. When the dragon\'s flame breaks the resolve of the others and they flee, Wiglaf stays. He delivers a speech to the running men \u2014 that they had taken arms and gold from Beowulf\'s hand and that the time of repayment is now \u2014 goes alone to the king\'s side, and helps Beowulf land the killing blow. After the funeral, Wiglaf delivers the poem\'s harshest judgment on the men who fled. He is the figure on whom the third movement turns.`,
    },
    {
      name: 'Grendel',
      role: 'Descendant of Cain',
      body: `Descended, the poet says, from Cain \u2014 exiled with the giants and the trolls and all the cursed kindred who came of the first murder. He lives with his mother in a haunted mere and has for twelve years come into Heorot at night to take and devour the warriors sleeping there. His hatred for the hall is specifically a hatred of the song of creation coming from it. Beowulf tears his arm from its socket; he flees to the mere to die. The poem gives him a genealogy that makes him the consequence of an older fall, not merely a beast in the dark.`,
    },
    {
      name: "Grendel\'s Mother",
      role: 'Avenging kin',
      body: `She comes from the mere on the second night to take revenge for her son. Beowulf follows her down through the haunted lake \u2014 a passage of extraordinary atmosphere \u2014 and fights her in her own cave. His sword Hrunting fails on her hide; she nearly kills him before he finds a giant-forged sword on the cave wall and kills her with it. The poem treats her with gravity. She is a mother. She is acting under the laws of feud her own world recognizes. The poet does not deny her grief; he does not allow it to stop the killing.`,
    },
    {
      name: 'The Dragon',
      role: 'Hoard-guard and final antagonist',
      body: `An old serpent that has lain on a buried hoard \u2014 the gold of a vanished people, brought into a barrow centuries earlier by their last survivor \u2014 for three hundred winters before the poem\'s third movement. A fugitive slave takes a single cup from the hoard to ransom himself. The dragon discovers the theft and burns the country, including Beowulf\'s hall. The poem treats the dragon less as a personality than as a force: the spirit of pure possession, the negation of the gift economy by which Beowulf\'s world was held together. When the fight is over the gold is reburied and is, by the poem\'s report, useless to all men ever after.`,
    },
  ],

  castLead: `<p><em>Beowulf</em> has a focused cast concentrated in three households: the Geatish royal family, the Danish court at Heorot, and the monsters from the mere and the barrow. The poem is not an ensemble drama \u2014 it follows one figure from young manhood to old age, and the figures around him exist largely to illuminate what his choices mean.</p>`,

  castGroups: [
    {
      label: 'The Geats',
      characters: [
        {
          id: 'beowulf',
          tag: 'WARRIOR · KING',
          name: 'Beowulf',
          epithet: 'The Geat',
          body: `The poem\'s hero across both halves of his life. Strong beyond any normal man \u2014 the strength of thirty in his grip. Kills Grendel barehanded, Grendel\'s mother with a cave-forged sword. Returns home, refuses the throne until it falls to him by default, rules fifty winters, dies fighting the dragon in old age. His pyre ends the poem.`,
          appears: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 35, 36, 37, 38, 43],
        },
        {
          id: 'wiglaf',
          tag: 'YOUNG KINSMAN',
          name: 'Wiglaf',
          epithet: 'The one who stayed',
          body: `Beowulf\'s young kinsman, the only one of eleven companions who does not flee the dragon. Stays at Beowulf\'s side, helps land the killing blow, holds him as he dies, fetches the hoard from the barrow at Beowulf\'s request, and delivers the poem\'s harshest judgment on the men who ran. The poem leaves the future of the Geats in his hands.`,
          appears: [36, 37, 38, 39, 40, 41, 42, 43],
        },
        {
          id: 'hygelac',
          tag: 'GEATISH KING',
          name: 'Hygelac',
          epithet: 'Beowulf\'s uncle and lord',
          body: `King of the Geats, Beowulf\'s uncle and lord. He receives Beowulf with joy when he returns from Denmark, hears the full account of the Grendel fights, and rewards him lavishly. His death in a raid on Frisian territory \u2014 historical, mentioned in Frankish chronicles \u2014 is the event that eventually brings Beowulf to the throne.`,
          appears: [28, 29, 30, 31],
        },
      ],
    },
    {
      label: 'The Danes',
      characters: [
        {
          id: 'hrothgar',
          tag: 'DANISH KING',
          name: 'Hrothgar',
          epithet: 'Lord of Heorot',
          body: `The old king whose great hall has been emptied for twelve years by Grendel. He receives Beowulf with the gift-giving generosity the poem celebrates, and gives the long sermon on pride and kingship after the killing of Grendel\'s mother \u2014 the most extended moral reflection in the poem. He calls Beowulf the son he never had.`,
          appears: [5, 6, 7, 8, 10, 13, 14, 15, 16, 17, 18, 21, 25, 26, 27],
        },
        {
          id: 'unferth',
          tag: 'DANISH THANE',
          name: 'Unferth',
          epithet: 'The hall\'s skeptic',
          body: `A thane of Hrothgar\'s court who challenges Beowulf\'s credentials at the first feast \u2014 bringing up a swimming contest from Beowulf\'s youth and implying he lost. Beowulf gives him a long, pointed answer. Unferth later lends Beowulf his sword Hrunting for the fight with Grendel\'s mother. The sword fails. Beowulf returns it politely.`,
          appears: [9, 10, 22],
        },
        {
          id: 'aeschere',
          tag: 'DANISH COUNSELLOR',
          name: 'Aeschere',
          epithet: 'Hrothgar\'s most beloved companion',
          body: `The king\'s most trusted counsellor and rune-speaker. Grendel\'s mother seizes him on her retaliatory raid and carries his severed head to the cliff above the mere. Hrothgar\'s grief over his death is the spur that drives Beowulf to follow her into the lake. His death is the point at which the poem\'s second movement becomes inevitable.`,
          appears: [21],
        },
      ],
    },
    {
      label: 'The creatures',
      characters: [
        {
          id: 'grendel',
          tag: 'KIN OF CAIN',
          name: 'Grendel',
          epithet: 'The outcast',
          body: `Descended from Cain, exiled with the giants and all the cursed kindred of the first murder. Lives in the haunted mere outside human settlement. Has emptied Heorot\'s nights for twelve years. Beowulf tears his arm from its socket in a wrestling match in the dark hall. He flees to the mere to die. The poem gives him a genealogy and, obliquely, a grief.`,
          appears: [3, 11, 12, 13, 14],
        },
        {
          id: 'grendels-mother',
          tag: 'AVENGING KIN',
          name: "Grendel\'s Mother",
          epithet: 'She who came the second night',
          body: `She comes to Heorot on the night after Grendel dies, to take revenge for her son. Seizes Aeschere and carries him off. Beowulf follows her into the mere, finds her cave, fights her in the dark water. His sword fails; she nearly kills him. He kills her with a giant-forged blade found on the cave wall. The poem treats her grief as real and her killing as necessary.`,
          appears: [20, 21, 22, 23, 24],
        },
        {
          id: 'the-dragon',
          tag: 'HOARD-GUARD',
          name: 'The Dragon',
          epithet: 'Three hundred winters on its gold',
          body: `An old serpent on a buried hoard. A fugitive slave takes a single cup; the dragon discovers the loss and burns the country. Beowulf goes against it with an iron shield, expecting to die. He kills it with Wiglaf\'s help and dies of its venom in the same fight. The poem treats it less as a personality than as a force: pure possession without exchange, the negation of everything the gift economy held together.`,
          appears: [32, 33, 34, 35, 36, 37, 38],
        },
      ],
    },
  ],

  chapters: [
    {
      n: 1,
      title: "Fitt I \u2014 The Life and Death of Scyld",
      tourTitle: "Scyld's Funeral Ship",
      hook: "The poem opens not with Beowulf but with Scyld Scefing \u2014 a king sent to a people in misery, whose funeral ship is loaded with treasure and set adrift on the tide.",
      tour: "The poet begins with a summons: 'Listen!' \u2014 the Old English 'Hw\u00e6t,' the word that calls a hall to silence. What follows is the founding frame of the poem's world: a king arrives from nowhere, rises to power, and dies. Scyld Scefing comes to the Danes friendless and wretched, becomes their greatest lord, and at his death is laid on a ring-prowed ship with gold, weapons, and jewels piled at the mast \u2014 then pushed out to sea, destination unknown. The ship-burial is the poem's first great image: treasure that can't be spent, a leader who cannot be held. The scene establishes what Beowulf will return to repeatedly \u2014 that power is given, used for a season, and then reclaimed by the tide. The genealogy that follows traces Hrothgar's lineage and the construction of Heorot, the greatest mead-hall ever built. It too is shadowed: the poet notes, almost as an aside, that Heorot will burn.",
      blurb: "Scyld Scefing's funeral ship is loaded with gold and set adrift \u2014 the poem's opening image of power given, used briefly, and surrendered to the sea.",
      summary: [
        "The poem opens with a formulaic call \u2014 'Hw\u00e6t,' Listen \u2014 that signals to its hall audience that a performance of memory is beginning. The subject is the Spear-Danes and their great kings, and the first named is Scyld Scefing, who arrived among the Danes friendless and alone but grew beneath the sky into a lord so powerful that neighboring peoples across the sea were compelled to pay him tribute. The poet praises him as an excellent prince and notes, with the pragmatic clarity the poem will maintain throughout, that the lesson of Scyld is the lesson of proper lordship: a young man must, through generosity to his father's friends and loyal service, earn the companions who will stand by him when he is old and war assaults him.",
        "Scyld dies, still warlike, and his warriors carry him to the sea. The ship-funeral described here is one of the poem's most sustained passages of visual concentration: a ring-prowed vessel lying at anchor, icy and gleaming; the body laid at the mast with weapons and jewels; a gold-wrought standard stretched above his head; and then the ship released to the current while the warriors stand on the shore in grief. The poet remarks that no one alive could say where the ship came to rest. The detail is not decorative \u2014 it establishes the poem's fundamental attitude toward loss. Great things pass out of knowledge. The ocean takes them. What remains is the song.",
        "From Scyld the poet traces a genealogy down to Hrothgar, the Danish king whose troubles will bring Beowulf across the sea. Hrothgar's glory in battle grows until his kinsmen willingly obey him and he resolves to build a great mead-hall \u2014 larger than any before it \u2014 where he can share with young and old all the blessings God has given him, except life itself. The hall is named Heorot, and the poet describes it towering high and gable-crested between its antler-like horns. Then comes the poem's first shadow: the hall awaits waves of battle and blasting fire, for before long sword-wrath between a woman's husband and her father will arise. Heorot will burn. The audience knows it before the story has properly begun.",
      ],
      appears: [{
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 2,
      title: "Fitt II \u2014 Scyld's Successors \u2014 Hrothgar's Great Mead-hall",
      tourTitle: "Heorot Rising",
      hook: "Hrothgar builds Heorot, the greatest mead-hall ever raised \u2014 and the first sound that reaches the monster in the dark is the song of creation.",
      tour: "This fitt closes the genealogical preamble and opens the poem's conflict. Hrothgar, war-famed and powerful, resolves to build a hall grander than any before it \u2014 a place for gift-giving, feasting, and the binding of warriors to their lord. He names it Heorot, the Hart. Workers come from across middle-earth to raise it. The hall is described as towering, gleaming, enormous between its antler-like horns \u2014 and the poet notes quietly that it awaits its own destruction in a feud not yet narrated. Inside Heorot, the scop sings of creation \u2014 of the Father Almighty shaping earth and sea, setting sun and moon in the sky, filling the land with creatures. It is exactly this song that wakes the monster in the darkness. Grendel is introduced as a 'famous march-stepper,' a creature of the moor-fens who descends from the cursed line of Cain. The hall and the dark are now formally opposed.",
      blurb: "Heorot rises as the wonder of the age \u2014 and from the moor-fens, Grendel hears its songs of creation and is filled with hatred.",
      summary: [
        "The poet traces Hrothgar's lineage from Scyld through Healfdene, who fathered four children \u2014 Heorogar, Hrothgar, Halga the good, and a daughter who became consort to Ongentheow, the Swedish king. Glory in battle falls to Hrothgar, and as his war-fame grows, his kinsmen obey him willingly until a numerous band of warriors gathers around him. It burns in his spirit to build something worthy of his power: a mead-hall grander than any the world has yet seen, where he can distribute to young and old every blessing the Lord has given him \u2014 except life itself and his retainers. The hall will be the material form of his lordship, the place where the gift-economy that holds his world together is enacted every day.",
        "Workers are summoned from far and wide, and Heorot rises \u2014 vast, gable-crested, enormous between its antler-like horns. Hrothgar names it and does not break his promise: he lavishes rings and treasure at the banquet inside. The hall is described as waiting for waves of battle and blasting fire, the destruction that a feud between kinsmen will eventually bring \u2014 but not yet. For now the hall is joyful. The scop at the high seat sings of creation: how the Father Almighty shaped the earth, set sun and moon in the vault of heaven, and adorned the land with every living creature. It is the poem's most explicitly Christian passage, and it is the song that breaks open the conflict.",
        "Grendel is introduced. The gloomy-minded being dwells in the moor-fens, the land of the giants, having been banned and branded by the Creator as a descendant of Cain \u2014 the first murderer, whose fratricide brought the curse of exile on his entire line. What the monster cannot bear is the sound of joy in the hall: the harp-music, the clear song, the laughter. From the moment of Heorot's construction the poem has been setting the hall and the dark against each other. Now the darkness has a name and a genealogy, and it has heard the songs inside the gleaming walls.",
      ],
      appears: [{
        "id": "hrothgar",
        "name": "Hrothgar",
      }, {
        "id": "grendel",
        "name": "Grendel",
      }],
      themes: [{
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }, {
        "slug": "grendel-and-the-kin-of-cain",
        "label": "Grendel and the Kin of Cain",
      }, {
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }],
    },
    {
      n: 3,
      title: "Fitt III \u2014 Grendel the Murderer",
      tourTitle: "Twelve Winters of Terror",
      hook: "Grendel empties Heorot nightly for twelve years, tearing thirty thanes from their sleep, and no man can stop him \u2014 because no man dares to stay.",
      tour: "This is the sustained description of Grendel's reign. He comes at night, finds the warriors sleeping, tears thirty men from their beds, and departs laughing. The morning cry of grief, the blood on the benches, the warriors who quietly find other places to sleep \u2014 the poet builds the horror through accumulation rather than spectacle. Twelve winters pass. The poem is unflinching about what twelve winters of this means: Heorot still stands but is effectively abandoned after dark. Hrothgar's counselors pray at their shrines, and the poet notes with gentle irony that they remembered hell in their spirit \u2014 they did not know God. The Christian frame is present throughout, not as allegory but as the explanatory context the Anglo-Saxon poet brings to his pagan material. Grendel is a creature of divine punishment; the Danes' paganism means they cannot reach the remedy for him.",
      blurb: "Grendel tears thirty thanes from their sleep and rules Heorot's nights for twelve unbroken winters \u2014 no weapon can touch him, and no man dares the dark.",
      summary: [
        "When the sun goes down, Grendel sets out for Heorot. He finds the warriors sleeping after their feast and wastes no time: greedy and cruel, he tears thirty thanes from their slumber, then departs leaping and laughing to his lair with a surfeit of slaughter. The dawn brings the morning cry \u2014 the king's grief, the warriors' horror, the visible track of the hateful pursuer. Not long afterward, Grendel comes again. The poem builds his reign through repetition: night after night, the routine of murder, until the pattern is so established that warriors quietly seek other places to sleep. The greatest hall ever built is effectively empty after dark.",
        "Twelve winters pass. The poet lets the number settle. Twelve years of this: of Hrothgar suffering torture, of endless agony, of the sad songs that circulate among the neighboring peoples about how Grendel long struggled against the Danish king. The monster cherishes his grudges with unremitting intensity. He will accept no compensation, no payment, no settling of the feud by money \u2014 the normal mechanism for ending Old English blood-disputes. He has no lord, no hall, no place in the system that the poem's world runs on, and so the system has nothing to offer him and no hold over him.",
        "Hrothgar's counselors meet in private, hold conferences about what the brave might do. At the shrines of their idols they pray \u2014 and the poet pauses here to explain, with the even-handed clarity of a Christian writing about pagans he respects, that they remembered hell in their innermost spirit, did not know God, could give no praise to the Guardian of Heaven. Their paganism is not condemned but observed. It is the explanation for their helplessness: they are praying at the wrong address. The foe of mankind will be overcome, but not by any wisdom available to a people who worship at shrines. The remedy will have to come from outside.",
      ],
      appears: [{
        "id": "hrothgar",
        "name": "Hrothgar",
      }, {
        "id": "grendel",
        "name": "Grendel",
      }],
      themes: [{
        "slug": "grendel-and-the-kin-of-cain",
        "label": "Grendel and the Kin of Cain",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }],
    },
    {
      n: 4,
      title: "Fitt IV \u2014 Beowulf Goes to Hrothgar's Assistance",
      tourTitle: "The Crossing",
      hook: "Beowulf hears of Grendel's deeds in his far-off fatherland and orders a ship fitted out \u2014 fourteen companions, a foam-necked vessel, a long sea-crossing toward the gleaming cliffs.",
      tour: "The poem's hero enters here, already characterized before he speaks: stoutest and strongest of the living, noble and sturdy, a man whose wise companions urge him on without trying to dissuade him. He orders fourteen companions, a trusty ship, and makes the crossing. The sea-journey is handled in the poem's characteristic quick-cut manner \u2014 the ship afloat, the breeze, the foam-necked vessel most like a bird \u2014 and then the cliffs of Denmark appear. On the heights above stands the coastguard, Hrothgar's sentinel, who rides down to challenge the strangers with a lance. His challenge is both practical and thematic: he notes that he has never seen a greater earl on earth than one of their company, and asks plainly who they are and where they come from. It is the poem's first formal confrontation, and Beowulf is not yet named in it.",
      blurb: "News of Grendel's reign reaches Geatland, and Beowulf \u2014 strongest of living men \u2014 orders a ship fitted out and crosses the sea with fourteen companions.",
      summary: [
        "While Hrothgar broods on his long-lasting sorrow, unable in any way to escape the terror, Beowulf hears of Grendel's deeds at home in Geatland. He is described in terms that establish him immediately: of heroes then living, he was stoutest and strongest, sturdy and noble, the nephew of King Hygelac. He orders a ship prepared and tells his companions he will seek the war-king across the ocean because Hrothgar needs warriors. His wise companions chide him little for the venture \u2014 they know his worth \u2014 and urge him on, foretelling his glory. He selects fourteen of the likeliest, and a sea-crafty pilot guides them to the water's edge.",
        "The crossing is swift. The foam-necked ship, driven by the breeze, glides over the waters most like a bird. Twenty-four hours later the sailors see the sloping embankments, the sea-cliffs gleaming, the steep mountains \u2014 Denmark. They climb ashore and thank the Lord for a gentle crossing. The arrival is not quiet: battle-gear rattles, mail-coats clatter. The noise of armed men on a foreign shore in an age of raids is precisely the sound the coastguard has been appointed to detect. He appears at once, high on his horse, mightily brandishing his lance.",
        "The coastguard's challenge is formal and searching. He notes he has stood watch against the possibility of an enemy fleet \u2014 no warriors have ever come more boldly. He is also, notably, already impressed: never has he seen a greater earl on earth than one among their company, a man of striking presence who is clearly no low-ranking fellow merely adorned with weapons. He demands to know their race and origin before they travel further inland. The challenge sets the poem's first test of Beowulf \u2014 not physical but verbal, a demonstration that arrival in a new hall requires the proper account of oneself.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 5,
      title: "Fitt V \u2014 The Geats Reach Heorot",
      tourTitle: "The Boar-Crested Helmets",
      hook: "Beowulf opens his word-hoard to the coastguard, speaks plainly of Grendel and of his purpose, and is granted passage \u2014 the warriors march toward Heorot with their boar-crested helmets gleaming.",
      tour: "This fitt is about the social machinery of heroic arrival: who you are, what your lineage is, what you have come to do, and whether your purpose is honorable enough to be admitted. Beowulf opens his word-hoard \u2014 the poem's kenning for the act of speech \u2014 and gives a measured, accurate account of his lineage, his errand, and the kind of help he intends to offer. The coastguard, satisfied, leads them himself to Heorot and leaves a guard on their ship. The march to the hall is one of the poem's great visual passages: the ring-mail glistening, the ringing sword bright, the boar-figures on their helmets vivid with gilding and flame-hardened. The boar is the Old English warrior's standard protective emblem, and its description here as 'keeping watch' \u2014 guarding the bearers \u2014 is the poem's characteristic animation of objects.",
      blurb: "Beowulf speaks plainly of his errand and his lineage; the coastguard, satisfied, leads the Geats to Heorot with their boar-crested helmets flashing in the light.",
      summary: [
        "Beowulf opens his word-hoard and gives the coastguard a full account: he is of Geatish lineage, hearth-companion to Hygelac, son of Ecgtheow \u2014 a man known to heroes beyond counting. He has come with kindly spirit to visit Hrothgar, the son of Healfdene, and he bears a weighty message. He will not hide his errand: he has heard of the savage ravager haunting Heorot, and he believes he can offer counsel \u2014 a way for Hrothgar to overcome the destroyer. He says plainly: with the least selfish intent, and if he is wrong, Hrothgar need simply continue to endure. The speech is careful and precise. It claims authority through lineage, states purpose without boasting, and invites the king to judge for himself.",
        "The coastguard's reply is equally measured. A warlike shield-bearer who judges wisely, he says, will know the difference between words and deeds \u2014 and what he hears suggests no malice. He grants them passage, personally leads them to Heorot, and orders his own men to guard the Geats' tarred ship against any opponent until the beloved hero returns. The social exchange is complete: strangers have been tested, found honorable, and admitted. The coastguard will not appear again in the poem, but his judgment is part of what the poem establishes about Beowulf before he ever enters the hall.",
        "The march to Heorot is rendered in the poem's most concentrated visual register. The vessel lies quiet at anchor; the warriors advance; their firm and hand-linked war-mail glistens; the ringing sword sounds bright; the lances stand upright in a cluster when they set them against the wall. Most striking are the helmets: boar-figures glistening, vivid with gilding, flame-hardened and brilliant \u2014 the boar keeping watch. The repeated attention to weapons and armor throughout this section is not decoration but argument. These men are from a tradition where equipment is identity: to describe the armor is to describe the warrior.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 6,
      title: "Fitt VI \u2014 Beowulf Introduces Himself at the Palace",
      tourTitle: "At the Threshold",
      hook: "Inside Heorot's outer walls, a second retainer questions the newcomers \u2014 and Beowulf names himself for the first time, asking to speak with Hrothgar directly.",
      tour: "Arrival in an Old English hall is a graduated process of identification. The Geats have passed the coastguard; now, inside the precinct, a proud-minded retainer challenges them again. The challenge is nearly identical in form \u2014 lineage, purpose, origin \u2014 and Beowulf's reply is briefer now that the ground has been covered: 'I am called Beowulf.' He asks to be brought before Hrothgar. The retainer, Wulfgar, prince of the Wendels, is named and characterized in a line: his boldness of spirit, prowess and prudence were known to many. He takes the message to Hrothgar, who is sitting old and hoary with his earls around him. This fitt is about thresholds: each one crossed requires an account of oneself, and the account must be earned by the self's actual content.",
      blurb: "A second challenge inside Heorot's walls \u2014 Beowulf names himself and requests an audience, and Wulfgar carries the message to Hrothgar's high seat.",
      summary: [
        "The Geats have set their broad war-shields against the outer wall and stacked their lances when a proud-minded hero questions them from within: from what borders do they bring their plated war-shields, their gray mail-coats, their heap of war-lances? He is Hrothgar's retainer, and he has never seen so many men of such courageous bearing come from far lands. He is certain it is out of valor and greatness of soul that they have come \u2014 not as outlaws \u2014 but he must hear it from them before admitting them further.",
        "Beowulf's reply is short. He has already given his full account once. Now: his name is Beowulf, he is Higelac's companion, and he will freely tell his mission to Hrothgar's son \u2014 if the king will graciously hear it and grant that they may greet one so gracious to all men. The formulation is precisely calibrated: a direct request without presumption, a stated willingness to be refused, an implicit compliment to Hrothgar's reputation for openness. Wulfgar, prince of the Wendels \u2014 his boldness, prowess, and prudence known to many \u2014 takes the message to Hrothgar.",
        "Wulfgar's report to Hrothgar condenses Beowulf's account into what a courtier brings to a king: men of the Geats have come from far lands; their foremost in rank calls himself Beowulf; they petition for a conference. He offers his own judgment: judging by their war-gear, they seem worthy of being honored among earls; surely the prince who led these heroes hither is a doughty one. It is a recommendation delivered as observation \u2014 Wulfgar is not telling Hrothgar what to think, but he is clearly telling Hrothgar what he thinks. The king's response will open the next fitt.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }],
    },
    {
      n: 7,
      title: "Fitt VII \u2014 Hrothgar and Beowulf",
      tourTitle: "The King Remembers",
      hook: "Hrothgar remembers Beowulf's father and believes God has sent the young warrior to help; Beowulf enters the hall and volunteers to fight Grendel with his bare hands.",
      tour: "This fitt is the poem's central introduction scene, and it carries enormous weight. Hrothgar recognizes Beowulf before meeting him \u2014 he remembers Ecgtheow, the hero's father, and knows the family's history. He says that God the Creator has sent this man to the West-Danes against Grendel's grimness. When Beowulf enters, his speech is one of the poem's great formal set-pieces: he offers his lineage, his combat record, and his specific request \u2014 to fight Grendel with no weapons, only his hand-grip, matching the monster's own terms. The reason is tactical and thematic at once: Grendel uses no weapons, so Beowulf will use none, and he frames the fight as a matter to be decided by the judgment of the Lord. He also warns Hrothgar, with the directness the poem consistently admires, that he may be eaten \u2014 and that if so, Hrothgar need not trouble about his funeral.",
      blurb: "Hrothgar recognizes Beowulf's lineage and calls his arrival an act of God; Beowulf volunteers to fight Grendel barehanded, framing the outcome as the Lord's to decide.",
      summary: [
        "Hrothgar's response to Wulfgar's report is immediate recognition. He remembers Beowulf as the merest of striplings \u2014 a boy he knew of long ago. He recalls Ecgtheow, the father, who received Hrothgar's own daughter; he has heard from sea-farers that this son has the grip of thirty men in his hand. The holy Creator has sent him, Hrothgar believes, to the West-Dane warriors against Grendel's grimness. He will give the good one treasures for his courage. The welcome is not merely diplomatic \u2014 it is theological. Hrothgar reads Beowulf's arrival as providential, as the answer to twelve years of prayer that has not reached its proper address until now.",
        "Beowulf enters the hall in his gleaming mail-coat and addresses Hrothgar directly. His self-presentation is the poem's most compressed heroic r\u00e9sum\u00e9: he is Higelac's kinsman, he has dared many wonders as a young man, he heard of Grendel far off in Geatland, and his wise counselors urged him to come. His combat credentials are specific \u2014 he has bound five enemies, killed sea-monsters by night, driven them from the waters. He comes now to settle the matter with Grendel alone. Then his key request: do not refuse him permission to purify Heorot with his bare hands, no sword, no shield \u2014 because Grendel himself uses no weapons, and the fight must be matched accordingly.",
        "The theological framing of the combat is explicit. Beowulf does not say he will win. He says he will grapple with Grendel hand to hand, foeman against foeman, and whichever side death lays hold of, the Lord will decide. If he loses, Grendel will eat him \u2014 dripping and dreary with gore, the hated enemy carrying him off, the solitary creature feasting on him in the moor-fens. Hrothgar need not trouble about a funeral. The directness is not bravado; it is an accurate accounting of the odds. Beowulf is asking only for permission to fight. The outcome is genuinely uncertain, and the poem is not pretending otherwise.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "grendel-and-the-kin-of-cain",
        "label": "Grendel and the Kin of Cain",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }],
    },
    {
      n: 8,
      title: "Fitt VIII \u2014 Hrothgar and Beowulf \u2014 Continued",
      tourTitle: "The Weight of Twelve Years",
      hook: "Hrothgar tells Beowulf of the feud that brought his father to Denmark, the debt he repaid, and twelve years of warriors who swore over the ale-cup to wait for Grendel \u2014 and were eaten before dawn.",
      tour: "Hrothgar's speech in this fitt is one of the most revealing passages in the first movement: an old king's honest account of what it costs to be helpless. He accepts Beowulf's offer and then explains the history \u2014 Ecgtheow's feud with the Wilfings, the exile, the oath sworn to Hrothgar across the sea, the debt the king paid on his behalf. The backstory establishes that Beowulf owes Hrothgar a family debt, which gives the visit a moral weight beyond heroic volunteering. Then comes the grief: Hrothgar describes what twelve years of Grendel has done to his hall-troop. Warriors brave over ale have promised to wait for the monster \u2014 and in the morning the hall is bloody, the bench-planks flooded, the men gone. The banquet that follows is deliberately juxtaposed against this account: the warriors sit down, an ornamented goblet is passed, the minstrel sings. Joy and dread occupy the same hall.",
      blurb: "Hrothgar tells Beowulf of Ecgtheow's old debt and describes twelve years of brave men who swore to face Grendel \u2014 and were gone before morning.",
      summary: [
        "Hrothgar accepts Beowulf's offer and then tells him the backstory he needs to understand. Beowulf's father Ecgtheow once killed Heatholaf in hand-to-hand combat among the Wilfings; the Weder people, fearing the resulting feud, were forced to disown him, and he fled south to the Scyldings. Hrothgar, newly come to power and rich in jewels, ended the feud by sending gold ornaments to the Wilfings. Ecgtheow swore oaths in return. The transaction is the poem's gift-economy working as intended: a feud settled, a debt incurred, loyalty secured across generations. Beowulf has come to repay what his father owed, and Hrothgar names it.",
        "The king then describes the reality of twelve years under Grendel's raids. His war-band has waned; fate has cast his hall-troop into the monster's clutches. Warriors in armor, after drinking their beer, often promised over the ale-cup that they would wait willingly at the feasting benches for a grapple with Grendel. Then in the morning the mead-hall was reeking with murder, the building bloody at daybreak, the bench-planks flooded and dripping. Hrothgar had fewer retainers, fewer dear warriors, whom death had taken. The repetition is carefully structured: the courage promised in the evening, the carnage visible at dawn, the gap between them filled by darkness the poem does not render directly.",
        "The fitt ends with the beginning of the banquet. A bench is made ready for the Geats; they take their seats, proud and exultant; a retainer bears a gleaming drink in an ornamented goblet; the minstrel sings heartily in Heorot. The transition from Hrothgar's grief-laden account to this scene of hall-joy is not ironic \u2014 it is the poem's argument about what halls are for. Joy continues even in the presence of danger. The mead-cup circulates. The warriors feast. Tomorrow the darkness will come again, and tonight that is exactly what makes the feast worth having.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }],
    },
    {
      n: 9,
      title: "Fitt IX \u2014 Unferth Taunts Beowulf",
      tourTitle: "Unferth's Challenge",
      hook: "Unferth, bitter that any man should win more glory than himself, challenges Beowulf across the ale-bench: you lost your swimming match with Breca \u2014 what makes you think you can face Grendel?",
      tour: "Unferth is one of the poem's most carefully constructed minor figures. He sits at the feet of Hrothgar and is introduced as a man who could not grant that any other under heaven should gain more glory than himself. His taunting of Beowulf is socially understood: in the hall, a new man with extravagant credentials will attract a challenge from the resident champion. The story Unferth tells is specific \u2014 the swimming match with Breca on the open sea, the seven nights of struggle, Beowulf's defeat when the currents washed Breca ashore first. The details are precise and the tone is contemptuous: you were beaten at swimming by Breca; what makes you think you can face Grendel? Beowulf's reply will begin in the next fitt. The challenge itself shows how the poem tests its heroes: first the coastguard, then Wulfgar's retainer, now Unferth \u2014 every threshold requires an accounting.",
      blurb: "Unferth taunts Beowulf across the ale-bench, claiming Beowulf was bested by Breca in their famous swimming contest \u2014 and demanding to know how he expects to face Grendel.",
      summary: [
        "Unferth, son of Ecglaf, sits at the feet of the lord of the Scyldings and opens the verbal sparring. The poem identifies his motive immediately: Beowulf's journey, the doughty sea-farer's undertaking, gave sorrow and bitter chagrin to Unferth, for he never granted that any other man on earth should attain more glory than himself. The taunting is not irrational \u2014 in a society where reputation is currency, a newcomer claiming to be the strongest living man is a direct economic threat to the man who previously held that position. Unferth's challenge is the hall's mechanism for stress-testing the claim.",
        "The story of Breca is Unferth's weapon: he recounts how Beowulf and Breca once competed in the open sea, swimming for seven nights through winter storms, and how Breca outlasted Beowulf and was washed ashore among the Heathoremes, returning victorious to his home among the Brondings. Unferth's telling emphasizes the vainest boasting and pride that motivated the contest, the seven nights of struggle that ended in Beowulf's defeat. The pledge that Breca made \u2014 to outswim Beowulf \u2014 he truly fulfilled. The implication is plain: a man beaten in a swimming match by Breca is not a man who should expect to survive a night waiting for Grendel.",
        "Unferth's challenge is also a gift, though neither party knows it in the moment. By forcing Beowulf to account for the Breca episode publicly, Unferth creates the occasion for Beowulf to tell his version of the story \u2014 which is much longer, much darker, and much more impressive than the truncated account Unferth has given. The challenge calls forth the defense, and the defense reveals the hero. The hall is watching: the mead-bench, the ornamented goblet, the minstrel silent now. This is the kind of contest that matters in Heorot, and Beowulf will not be found wanting.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }],
    },
    {
      n: 10,
      title: "Fitt X \u2014 Beowulf Silences Unferth \u2014 Glee is High",
      tourTitle: "The Breca Swim, Told True",
      hook: "Beowulf corrects the record: the swimming match involved sea-monsters, five nights of combat, and a nine-monster kill at the end \u2014 and Grendel would not be a problem if Unferth's heart were half as bold as his tongue.",
      tour: "Beowulf's answer to Unferth is the first extended display of the hero's voice, and it is a masterclass in the Old English art of the flyting \u2014 a formal verbal duel where claims about the past are weapons. He accepts Unferth's challenge as freely and wildly spoken, fuddled with beer, and then gives the corrected account: the swimming match was a mutual teenage boast, and what actually happened in the water was not a competition but five nights of combat against sea-monsters who dragged him to the sea-floor and were killed with his sword. He fetched up alive on the Finnish coast after killing nine of them. This is greater than anything Breca did, greater than anything Unferth has done \u2014 and Unferth, the poem notes, killed his own brothers, a deeper disgrace than any swimming loss. The counter-attack is complete: Beowulf's past is more impressive, and Unferth's disqualifying crime is named. The hall's glee rises; the queen enters; Beowulf drinks his cup.",
      blurb: "Beowulf corrects Unferth's account: the sea-contest involved five nights of monster-killing, not a simple race \u2014 and Grendel, he says, would be no problem if Unferth had half the courage he claims.",
      summary: [
        "Beowulf's counter begins with formal dismissal \u2014 Unferth has spoken freely and wildly, fuddled with beer \u2014 and then gives the full account. He and Breca were striplings when they made the boast, young men who agreed to test themselves in the sea. What actually happened in those waters was not a race: ill-meaning enemies caused the sorest sorrow, and Beowulf killed them with his sword while they dragged him to the sea-floor. He served them in return \u2014 as was fitting. They missed out on the pleasure of feasting on him; instead he killed nine sea-monsters with his weapon, and their bodies lay stretched on the strand come morning.",
        "Fate often saves an undoomed hero if his valor is stout \u2014 and Beowulf's is. Light came from the east, God's beautiful beacon, and the waters subsided. He reached the land of the Finns. He then turns on Unferth directly: he has never heard of such daring deeds done by Unferth, or of any sword-terror Unferth has inspired. Then the killing blow: though with cold-blooded cruelty you killed your brothers, your nearest kin, and for that you must suffer dire damnation in hell, however sharp your wits may be. Unferth's fratricide is named and judged in a single sentence. The formal charge is graver than any swimming defeat.",
        "The argument closes with a prediction rather than a boast. Grendel would never have done such countless horrors to Hrothgar if Unferth's heart were as sturdy as Unferth describes. But the terrible enemy has discovered that the fierce-burning hatred and the battle-edge of all the Victory-Scyldings need dismay him little. He takes his toll, kills and feasts, expecting no resistance \u2014 from Danes. Now there will be resistance. The hall's response is immediate: the mead-cup circulates, the glee is high. Wealhtheow, queen of the Scyldings, enters under her golden crown and presents Beowulf his cup. The challenge has been answered, the hall has approved, and the night is coming.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 11,
      title: "Fitt XI \u2014 All Sleep Save One",
      tourTitle: "The Watcher in the Dark",
      hook: "Hrothgar leaves for his bedchamber; Beowulf lays aside his armor and sword, trusting only his hand-grip \u2014 and in the dark hall, alone among sleeping warriors, he waits for Grendel.",
      tour: "This fitt is the hinge of the poem's first movement: the transition from the hall's joy to the monster's approach. Hrothgar departs, leaving Beowulf formally entrusted with the watch. Beowulf removes his iron armor, hands off his sword, and makes a speech of quiet defiance: he holds himself no meaner in matters of prowess than Grendel himself, and so he will not use a sword-edge on him. The fight will be hand to hand, weaponless, because Grendel has no skill with weapons and Beowulf will match him equally. The wise-minded Father will assign the glory to whichever side he sees fit. Then Beowulf bends to his pillow and the other warriors sleep \u2014 many of them for the last time, the poem says, adding its characteristic note of prior knowledge. Through the dark the twilight traveler comes tramping and striding. All sleep save one.",
      blurb: "Beowulf removes his armor and sword to fight Grendel bare-handed; the hall sleeps; through the darkness the twilight traveler comes striding \u2014 all save one warrior wait without knowing.",
      summary: [
        "Hrothgar departs from the hall with his earls to seek his bedchamber, having formally entrusted the building and its watch to Beowulf \u2014 a hall-watch against the giant, a special service. Beowulf accepts the trust. He takes off his iron armor, the helmet from his head, hands his chased-hilted chain-sword to his attendant, and bids him guard the battle-equipment. The removal of armor is not negligence but deliberate matching of terms: he will fight Grendel as Grendel fights, with his hands, because the wise-minded Father will decide the outcome and weapons are beside the point.",
        "Beowulf's speech before lying down is measured and clear. He holds himself no meaner in matters of prowess than Grendel himself; so he will not use a sword to put the monster to sleep, though he well could. Grendel has no skill with weapons, cannot strike a blow with a shield \u2014 but he is mighty in strife and destruction, and the fight will be conducted without edges, if the monster dares come to weaponless warfare. God ever-holy will assign the glory to whichever side seems proper to him. The formulation is not resignation; it is precision about the terms of an encounter he intends to win.",
        "The brave-minded hero bends to his slumber. The pillow receives the noble's cheek. Many a warrior of the sea-band sinks into sleep. The poet pauses to note what they did not know: it seemed unlikely that any of them would ever afterward hope to visit friend-lords or the lordly stronghold of their childhood. They had heard about Grendel's raids; they were sleeping anyway. This is the poem's argument about the hall in its most compressed form. Outside, through the dark, the twilight traveler comes tramping: the warriors who should have kept watch are sleeping. All but one. Beowulf, serving as warder, a terror to foes, angrily awaits the outcome of battle.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }, {
        "id": "grendel",
        "name": "Grendel",
      }],
      themes: [{
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "grendel-and-the-kin-of-cain",
        "label": "Grendel and the Kin of Cain",
      }],
    },
    {
      n: 12,
      title: "Fitt XII \u2014 Grendel and Beowulf",
      tourTitle: "The Hand-Grip",
      hook: "Grendel comes down from the cloud-dark cliffs, his eyes shining like flame \u2014 and seizes a sleeping warrior before he notices the one awake man whose grip is stronger than anything on earth.",
      tour: "This is the poem's first great set-piece of violence, rendered in a characteristically Old English mix of distance and physical immediacy. Grendel moves beneath the sky to the wine-joyful building, flings open the iron-banded door with a touch of his fingers, and surveys the hall with eyes shining like flame. He seizes a sleeping warrior, bites through his bone-cage, drinks the blood in streams, swallows him in great mouthfuls. Then he steps toward the next man \u2014 and something reaches up and grips his hand. The moment Beowulf's grip closes on Grendel's arm is the moment the monster's whole confidence collapses: nowhere in middle-earth had he ever felt a hand-grip stronger than this. Fear seizes him. He cannot break free. He is thinking of death. The physical shock of it is rendered in a single sustained sentence whose grammar enacts the trap closing.",
      blurb: "Grendel enters Heorot blazing-eyed, devours a sleeping warrior, and reaches for another \u2014 and finds himself caught in a hand-grip stronger than anything in middle-earth.",
      summary: [
        "Grendel comes from the cloud-dark cliffs, striding from the moor, bearing God's anger \u2014 the poem has never stopped insisting on the theological frame. He moves beneath the sky until he reaches the wine-joyful building gleaming with gold plate. This is not the first time he has sought out Hrothgar's home and manor. He has never before met a harder hero or a more steadfast hall-guard \u2014 but he does not know this yet. He comes striding toward the building, cut off from joy. The door bursts open at the touch of his fingers, though it is bound with forged iron bands. He steps onto the shining hall-floor, striding in rage. From his eyes shines out a hideous light, most like to flame.",
        "He surveys the hall. Warriors in their numbers, a circle of kinsmen sleeping together, a throng. His thoughts leap with triumph: he means to sever the life from every man there before morning comes. Providence will not let him. Hygelac's kinsman is watching, pained, waiting to see how the savage creature will carry out his sudden assault. The monster wastes no time: he seizes a warrior in his sleep, tears him apart at once, bites through his bone-cage, drinks the blood in streams, swallows him in great mouthfuls. The directness of the description is the poem's deliberate strategy: Grendel is neither softened nor fantasticated. He eats the man. He steps closer.",
        "He reaches toward the next man \u2014 and the stout-hearted warrior reaches up from where he lies still, gripping the enemy's hand. The foeman lunges forward; Beowulf catches him. The master of malice knows in that instant that nowhere in middle-earth, beneath the whole of the heavens, had he ever met a hand-grip stronger than this in any man. Fear seizes his spirit. His courage begins to fail. He cannot break free. He is thinking of death. The episode that took twelve years to produce is decided in a handful of lines, and the poem's language contracts to match: the trap has closed, and both the monster and the reader feel it at the same moment.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "grendel",
        "name": "Grendel",
      }],
      themes: [{
        "slug": "grendel-and-the-kin-of-cain",
        "label": "Grendel and the Kin of Cain",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }],
    },
    {
      n: 13,
      title: "Fitt XIII \u2014 Grendel is Vanquished",
      tourTitle: "The Shoulder Torn",
      hook: "Beowulf's companions slash at Grendel with their swords and find the blades will not bite him \u2014 but Beowulf's bare hands hold, and the monster's shoulder bursts open as he wrenches free and flees to die in the mere.",
      tour: "The outcome of the fight is rendered in the poem's most physically specific passage of violence. Beowulf's companions rush to help with their battle-swords, slashing at Grendel from all sides \u2014 and the blades do nothing. Grendel has sworn himself safe from victory-swords; the enchantment holds. But Beowulf's grip holds too, and the contest between hand and hand is decided when the sinews of Grendel's shoulder split apart and the body bursts open. Grendel flees, trailing death-wound, to hide in the fen-cliffs and marshes. He will die there. The visible proof of the victory is left hanging under the great hall-roof: Grendel's arm \u2014 hand, arm, and shoulder, all the claw together \u2014 hung up by Beowulf as the dawn trophy of the night's work.",
      blurb: "Swords cannot bite Grendel's hide, but Beowulf's hand-grip holds until the monster's shoulder tears; Grendel flees to the mere to die, leaving his arm hanging in Heorot.",
      summary: [
        "Beowulf will not release Grendel while he lives \u2014 he judges the monster's existence utterly useless to men under heaven. His noble companions rush in with their ancient battle-swords, eager to protect their lord if only they could. They slash at Grendel from all sides, meaning to carve him into slivers \u2014 and the blades do nothing. The relentless enemy cannot be harmed by the finest edge anywhere on earth: he has sworn himself safe from victory-swords and all such weapons. His death must come another way. The enchantment is the poem's explanation for why twelve years of armed warriors could not touch him; Beowulf's choice to fight barehanded was not ignorance but superior tactical intelligence.",
        "The fight becomes a contest of grip. Grendel's exiled spirit will travel far into the enemy's power \u2014 he sees plainly now that his body is giving way. Hygelac's hardy thane holds him by the hand. Each one is hateful to the other while he lives. Then the fearful demon suffers a body-wound: damage past healing shows on his shoulder. His sinews split apart. His body bursts open. To Beowulf is given glory in battle. Grendel now has to flee \u2014 sick to death, seeking his dwelling place, joyless and woeful. He knows more clearly than ever that the end of his earthly life is near.",
        "For the Danes, their wish is at last fulfilled. The stranger from afar has cleansed the war-hall of Hrothgar from its evil \u2014 wise and valiant, saved it from violence. Beowulf takes joy in the night's work and in his reputation: the prince of the Geats has made good his boast to the East-Danish people and cured them fully of the heavy sorrows they had suffered. The trophy is mounted in the morning: the battle-hero hangs beneath the great hall-roof the hand, the arm and shoulder \u2014 all of Grendel's claw together \u2014 as the visible, daylit proof that the night's work was real.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "grendel",
        "name": "Grendel",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "grendel-and-the-kin-of-cain",
        "label": "Grendel and the Kin of Cain",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 14,
      title: "Fitt XIV \u2014 Rejoicing of the Danes",
      tourTitle: "The Morning After",
      hook: "Warriors from near and far gather to see Grendel's tracks and the blood-churning mere where he crawled to die; riders race and the scop composes new verses, linking Beowulf's victory to the legend of Sigmund the dragon-slayer.",
      tour: "The morning after the fight is the poem in its celebratory mode, and the celebration is characteristically complicated. Warriors come from across the country to examine Grendel's trail and the pool where he died \u2014 the water bubbling with blood, the angry eddies seething with gore. They see the monster is gone and feel little grief. Young men ride horseback, racing along the country roads, and the scop begins composing new verses on the spot: Beowulf's feat is immediately absorbed into the tradition of heroic song, placed beside the legends of Sigmund the dragon-slayer and the cautionary tale of Heremod, the failed king. The poem within the poem is the highest honor the tradition can confer \u2014 to be turned into song while still alive.",
      blurb: "At dawn, warriors ride out to trace Grendel's death-trail to the blood-churning mere; riders race and the scop weaves Beowulf's name into new verses beside Sigmund the dragon-slayer.",
      summary: [
        "In the morning mist, warriors gather around the gift-hall from near and far on long journeys to see the wonder \u2014 the footprints of the enemy. Few of them feel much grief at Grendel's parting from life; they follow the tracks where the defeated creature dragged himself away, weary in spirit and beaten in combat, down to the water-monsters' pool. There the currents bubble with blood, the angry eddies stir and churn, seething with gore, welling up with sword-blood. The death-doomed creature had hidden himself there, stripped of all joy, and had laid down his life in the lair to which he fled. His heathen spirit went where hell received him.",
        "The warriors turn back. Young men ride briskly from the scene, striding on stallions, heroes on horseback. Beowulf's praises fill the air: many declare again and again that no one, south or north, anywhere between the seas, under the arch of the sky, is a better shield-bearing warrior, none more worthy to rule. Yet no word of blame falls against their own gracious lord Hrothgar \u2014 he was a good king, and the poem insists on this alongside its celebration of the foreigner who solved the problem the king could not solve for twelve years.",
        "The famous riders let their horses run in contest, and now and then a skilled thane of the king \u2014 a man with ancient traditions stored in memory \u2014 weaves new phrases together and begins to tell of Beowulf's venture. The scop links him to Sigmund, son of Waels, the famous dragon-slayer of legend, praising Beowulf's glory among the nations. Against Sigmund's reputation the scop places Heremod \u2014 a king who turned against his own people, gave no rings to the Danes for their honor, lived in joylessness. The contrast is explicit: Beowulf is the right kind of hero, not the Heremod kind. The tradition is already sorting him into its categories.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }, {
        "id": "grendel",
        "name": "Grendel",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }, {
        "slug": "the-manuscript-that-almost-burned",
        "label": "The Manuscript That Almost Burned",
      }],
    },
    {
      n: 15,
      title: "Fitt XV \u2014 Hrothgar's Gratitude",
      tourTitle: "Hrothgar's Joy and Warning",
      hook: "Hrothgar stands beneath the hanging claw and calls Beowulf the son he never had \u2014 then delivers a long speech of gratitude that carries the poem's first serious warning about pride and the limits of power.",
      tour: "This fitt is Hrothgar at his most fully realized: a king grateful beyond words, generous to the point of calling Beowulf his own son, and wise enough in age to look at the trophy in the rafters and know what it means and what it does not mean. His speech of gratitude is also a speech about God's power to work wonder upon wonder \u2014 the theological frame reasserts itself at the moment of triumph. Beowulf's own reply is telling: he is sorry Hrothgar could not see Grendel in person, he wanted to hold the monster more firmly, he wanted to lay him dead on the death-bed. Beowulf is already moving toward the next problem. The fitt ends with the preparation for the great feast of reward.",
      blurb: "Hrothgar stands beneath Grendel's hanging claw and calls Beowulf the son he never had \u2014 thanking God and the hero in the same breath, promising treasure, warning of pride's consequences.",
      summary: [
        "Hrothgar goes up to the hall, stands at the pillar, and sees the steep-rising hall-roof gleaming with gold and Grendel's hand hanging from it. The sight breaks open the gratitude he has been holding for twelve years. He gives thanks at once to the Ruler \u2014 much evil has he borne, grief at Grendel's hands, but God can always work wonder upon wonder, Lord of Glory. Just lately he thought he would never find comfort for any of his sorrows; now a single brave warrior has accomplished what all of his excellent wisdom had failed to do. The theological attribution is absolute: this is God's work, not merely a hero's strength.",
        "The personal expression of gratitude follows. Hrothgar says he will love Beowulf in his heart as his own son, and keep well from now on this new kinship. Beowulf shall never lack any of the earth-joys Hrothgar can give him. Often for lesser service, he says, he has given treasure to a less hardy hero, a weaker man in war. By deeds of distinction Beowulf has now gained a glory that will flourish forever and ever. The language of gift-giving and kinship \u2014 the poem's economic and emotional register simultaneously \u2014 is deployed at its fullest extension here: Hrothgar is adopting the hero into his household as the supreme expression of gratitude.",
        "Beowulf's reply is characteristic. He would have liked to show Hrothgar the creature in person \u2014 he meant to bind him fast on the death-bed with fetters, so that the hated enemy would have lain low in a life-and-death struggle. But God did not will it; the foe was too swift. Still: the monster left his arm behind as a marker. The reply is not modest \u2014 it notes what Beowulf intended and why it was better than what happened \u2014 but it is honest about the outcome. The preparation for the great feast of reward begins, and Heorot is set right by hand: tapestries gleaming on the walls, the hall made whole again except for its torn hinges and twisted door-bands.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "grendel-and-the-kin-of-cain",
        "label": "Grendel and the Kin of Cain",
      }],
    },
    {
      n: 16,
      title: "Fitt XVI \u2014 Hrothgar Lavishes Gifts Upon His Deliverer",
      tourTitle: "The Gift of Horses and Swords",
      hook: "Hrothgar presents Beowulf with a golden standard, a mail-coat, a helmet, a famous sword, eight gold-bridled horses, and a saddle wrought with jewels \u2014 the poem's greatest scene of gift-giving as bond-making.",
      tour: "This fitt enacts the gift-economy at its most ceremonially elaborate. Hrothgar presents Beowulf with gifts that constitute an entire warrior's complement: standard, embroidered banner, mail-coat, helmet, and a sword carried before the hero with ceremony. Then eight horses with gold-plated bridles, and on one of them the king's own battle-saddle set with jewels. The poem notes with the specificity it reserves for things that matter that no one who tells the truth in full fairness will condemn Hrothgar for the generosity. The presentation is not mere reward \u2014 it is the formal sealing of the bond between them, the material form of the kinship Hrothgar declared in the previous fitt. Gifts are not optional in this world; they are the mechanism by which loyalty is built and remembered.",
      blurb: "Hrothgar presents Beowulf with standard, mail-coat, helmet, sword, and eight gold-bridled horses \u2014 the poem's most elaborate scene of gift-giving as bond between king and hero.",
      summary: [
        "Heorot is set right by hand \u2014 gold-embroidered tapestries shining out along the walls, the hall made beautiful again for the feast. The beautiful building has been broken to pieces even though bound with iron; its hinges have been torn away. Only the roof survived whole when the terrible creature crept away, despairing of his life. The poem pauses to observe that it is hard to escape the end \u2014 everyone must come in time to the place appointed for all soul-bearers and earth-dwellers. The observation is not depressing in context but structural: it frames the gift-giving that follows within the poem's awareness that nothing given lasts forever.",
        "Hrothgar presents the gifts in formal sequence. A golden standard as reward for the victory. An embroidered banner. A mail-coat. A helmet. A famous sword carried before the hero. Beowulf drinks from the cup in the hall \u2014 that gift of treasure he had no reason to be ashamed of. The poet adds the comparison explicitly: he has never heard of four bright jewels adorned with gold-work presented at an ale-bench in friendlier fashion. Around the crown of the helmet runs a ridge-piece braided with wire and studded with bosses, so that battle-hardened swords cannot harm the hero when he sets out against enemies. The description of the helmet is characteristic: to name the object's protective purpose is to name the danger it guards against.",
        "Then eight horses. Gold-plated, gleaming bridles. On one of them stands a saddle richly worked with art and set with jewels \u2014 the king's own seat, where Hrothgar himself sat in the play of the sword-edges. The famous one's valor never failed at the front when the slain were falling. He grants Beowulf power over both the war-horses and the weapons and bids him enjoy them well. The poet's comment is a judgment: in so manly a way the mighty-famed chieftain, hoard-keeper of heroes, repaid the storms of battle with horses and jewels that no one willing to tell the truth will ever condemn him. The formula confirms that the transaction has been completed with proper generosity \u2014 the gold given matches the danger faced.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }],
    },
    {
      n: 17,
      title: "Fitt XVII \u2014 Banquet (continued) \u2014 The Scop's Song of Finn and Hn\u00e6f",
      tourTitle: "The Finn Episode",
      hook: "As the feast continues and gifts are distributed to Beowulf's companions, the scop sings the lay of Finn and Hn\u00e6f \u2014 a digression about a failed peace, a winter captivity, and a hall that burned.",
      tour: "This is the poem's most sustained digression, and it is not accidental. The Finn episode is sung in Heorot at the height of the hall's celebration, immediately after Hrothgar's great gift-giving \u2014 and it tells the story of a hall that was the site of a massacre, a winter endured in enforced company with an enemy, and an eventual revenge that destroyed the peace that had been carefully constructed. The half-Danish hero Hn\u00e6f is killed; his sister Hildeburg loses both son and brother on the same pyre; Finn, her husband, accepts a settlement that survives one winter before Hengest takes his revenge. The digression is a shadow-story: the audience of Heorot knows, as they listen, that Heorot too will burn in a feud between kinsmen. The scop is not singing about the past. He is singing about the future.",
      blurb: "The scop's lay of Finn and Hn\u00e6f \u2014 a failed peace, a winter at the enemy's hearth, and a hall destroyed \u2014 casts its shadow over Heorot's celebration of Beowulf's triumph.",
      summary: [
        "The prince of warriors gives each of Beowulf's sea-companions a costly gift at the mead-bench \u2014 heirlooms and gold as compensation for the man Grendel earlier wickedly slaughtered. The Father was governing all earth-dwellers then, as always; that is why foresight of spirit is most fitting for all men \u2014 the poem's characteristic reminder that joy is not a permanent condition. Music and merriment mingle in honor of Healfdene's leader; the harp is played; verses recited. Then the bard of Hrothgar begins to speak of the lay of Finn.",
        "The half-Danish hero Hn\u00e6f of the Scyldings is fated to fall on the field of the Frisians. Hildeburg \u2014 who is both Finn's wife and Hn\u00e6f's sister \u2014 has no reason to praise the faith of the Jutes; she loses sons and brothers in the same slaughter, war sweeping away what had been the brightest of earth-joys. A few of Hengest's men survive the battle; Finn cannot finish them off, so he offers terms: a new hall, shared rule, daily honor to the Danes at the gift-giving, gold distributed as freely as to the Frisians. On both sides they swear a binding compact. Hn\u00e6f's body is readied for the pyre.",
        "Hildeburg orders her own son laid on the same pyre as her brother Hn\u00e6f \u2014 the two halves of her world that the feud has destroyed, burned together. The blood-stained mail-coat, the boar-crest with its gilding, many nobles with fatal wounds. The lay pauses here at the moment of the pyre, before resuming in the next fitt with the winter that follows. The digression's placement is deliberate: the poem is showing Heorot what it risks. Every hall in this world stands above the same dark, and every peace between hostile peoples is a flame in the wind.",
      ],
      appears: [{
        "id": "hrothgar",
        "name": "Hrothgar",
      }, {
        "id": "beowulf",
        "name": "Beowulf",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 18,
      title: "Fitt XVIII \u2014 The Finn Episode (continued) \u2014 The Banquet Continues",
      tourTitle: "Hengest's Revenge and Wealhtheow's Gifts",
      hook: "Hengest endures a winter at Finn's hearth dreaming of revenge; when spring comes and a sword is placed in his hand, he leads the slaughter; then the banquet resumes and Wealhtheow presents Beowulf the great Brosing necklace.",
      tour: "The Finn lay concludes and the feast resumes \u2014 the transition is one of the poem's most deliberate juxtapositions. Hengest survives the blood-tainted winter at Finn's court, unable to sail home, enduring in the company of his lord's killer. When spring comes and the seas open, his thoughts run more to revenge than to the sea-voyage; when Hun of the Frisians places the battle-sword L\u00e1fing in his hand, the decision is made. Guthlaf and Oslaf's mournful accusation breaks Finn's spirit; the hall is covered in corpses, Finn is slain, and Hildeburg is carried back to Denmark captive. The lay ends. Cheers rise. The cup-bearers pour wine. Wealhtheow comes forward under her golden crown to present Beowulf the greatest neck-ring he has ever heard of \u2014 and to ask him to be gentle with her sons.",
      blurb: "Hengest's winter captivity ends in the slaughter of Finn and the recovery of Hildeburg; the lay closes and Wealhtheow presents Beowulf the Brosing necklace with a mother's quiet plea.",
      summary: [
        "The warriors who survived depart to see Friesland again. Hengest stays \u2014 living with Finn through the blood-tainted winter, never leaving him, though thinking always of his fatherland. He cannot drive his ring-prowed ship over the ocean paths; winter locks the currents in ice-bonds. He broods on grim revenge more eagerly than on any sea-voyage, wondering whether he can bring about an attack to call the sons of the Jutes to account. When spring comes and the seas open, Hun of the Frisians places the battle-sword L\u00e1fing \u2014 fairest of blades, famous in the folk-talk of Jutland \u2014 in his hand as a friendly gift. The gesture is the trigger. The sword in the hand means the time for endurance is over.",
        "A savage sword-fury seizes bold-spirited Finn where he sits in his palace when Guthlaf and Oslaf mournfully speak of the grim grappling, laying part of the blame on him. The restless spirit cannot be kept in his chest. The hall is covered with the corpses of enemies. Finn is slain, the king with his companions, and the queen is taken captive. The Scylding troops carry everything the land-king had kept in his palace \u2014 trinkets and treasures, whatever they could find \u2014 and ferry Hildeburg back to Daneland on the sea-journey, back to her own people. The lay ends. Cheers rise again. Bench-glee resounds. The cup-bearers pour wine from wondrous vessels.",
        "Wealhtheow comes forward walking beneath her golden crown to where Hrothgar and Hrothulf are seated, uncle and nephew, their peace still mutual. She speaks to Beowulf and presents him the greatest of neck-rings \u2014 greater even than the Brosing necklace that Hama stole from Eormenric's bright city, choosing lasting reward over a tyrant's service. The necklace will later hang around Hygelac's neck when he falls among the Frisians; the poet follows the object's future in a digression that is characteristically pre-emptive. Then Wealhtheow's real request: be kind to my son, she says; be gentle with your counsel; remember my children when I am gone. The plea beneath the gift is the most human moment in the hall's celebration.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 19,
      title: "Fitt XIX \u2014 Beowulf Receives Further Honor",
      tourTitle: "The Feast's End",
      hook: "Wealhtheow presents Beowulf with arm-jewels and a mail-shirt, the warriors settle to sleep in the hall \u2014 and among them, doomed and unknowing, one man who will not see morning.",
      tour: "This short fitt closes the feast and opens the hall to the night again. Wealhtheow completes her gift-giving with twisted gold \u2014 arm-jewels and rings and a mail-shirt, the greatest of neck-rings she has heard of. She charges Beowulf directly: enjoy this collar in safety, show yourself strong, be gentle with counsel. She commends him to her son and to the peace of the hall. Then the warriors clear the ale-benches, cover the floor with beds and pillows, and sleep. The poet names what they do not know: there is a fate already set for many of them, a cruel destiny that will befall more than one noble. Doomed to his death, one of the beer-thanes bows down to sleep. The night is coming again.",
      blurb: "Wealhtheow completes her gifts to Beowulf; the warriors clear the benches and settle to sleep \u2014 the poet noting quietly that one among them will not survive the night.",
      summary: [
        "A cup is brought to Beowulf and an invitation to drink is graciously given, and twisted gold is presented with pleasure \u2014 a pair of arm-jewels, rings, and a mail-shirt, the greatest of neck-rings heard of under heaven. The poet follows the great Brosing necklace in a brief digression \u2014 Hama carried it off from Eormenric's city; Hygelac last held it when he marched beneath his banner; fate carried him off when he endured calamity among the Frisians; the corpse of the king came into the possession of the Franks. The object's history is the poem's argument in miniature: gold passes from hand to hand, owner to owner, death to death, and the giving does not protect the giver from the receiving of the same fate eventually.",
        "Wealhtheow addresses the company directly. Enjoy this collar in safety, worthy Beowulf, make good use of this armor, prosper well, show yourself strong, be to these warriors gentle with your counsel. She will not forget his reward. He has brought it about that far and near, forever and ever, men shall honor him as widely as the ocean surrounds the windy headlands. Be, as long as you live, a prosperous prince. Be kind to my son, living in joy. The speech is a mother's request dressed in a queen's formality \u2014 she is asking the strongest man in the hall to use that strength for protection rather than competition when she is no longer able to ask.",
        "When evening has come and Hrothgar has gone off to his quarters, warriors beyond counting guard the building as often before. They clear the ale-benches; the floor is covered with beds and pillows. Among them, doomed to his death, one of the beer-thanes bows down to sleep. They set their battle-shields at the heads of their beds, their bright-gleaming bucklers, their helmets, their ring-mail coats, their mighty war-spears visible above each noble on his bench. The custom of that people is always to be ready for battle. One among them will be gone before morning. The poem knows it; the warrior does not.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 20,
      title: "Fitt XX \u2014 The Mother of Grendel",
      tourTitle: "She Comes for Her Son",
      hook: "While the hall sleeps, Grendel's mother comes \u2014 a monstrous woman, less terrible than her son but fast enough \u2014 seizes Hrothgar's most beloved counselor, and takes Grendel's hanging claw back into the dark.",
      tour: "The poem's second movement opens without ceremony: one man pays with his life for his evening rest, as they often paid before. Grendel's mother is introduced as a second threat that the killing of the first monster has activated: a monstrous woman who has kept her sorrow in mind, descended from the same line of Cain, living in the horrible waters. The poet compares her to her son explicitly \u2014 the terror is less severe, only by as much as the war-strength of a woman is less than a warrior's. She is still more than enough. She seizes Aeschere, Hrothgar's dearest counselor and shoulder-companion, and carries him off. She takes Grendel's claw back with her. The uproar in Heorot wakes Beowulf in his separate chamber; the old ruler is stricken in spirit; and the poem has announced a second problem that the first solution did not solve.',",
      blurb: "Grendel's mother comes in the night and seizes Aeschere, Hrothgar's most beloved counselor \u2014 the first killing solved nothing; the grief merely changed its shape.",
      summary: [
        "One of the warriors pays with sorrow for his evening rest \u2014 as had often happened when Grendel held the gold-adorned palace. An avenger still outlived the hated creature: the mother of Grendel, a monstrous woman, has kept her sorrow in mind. She has lived in the horrible waters, the cold-running currents, ever since Cain became a slayer by the sword of his one and only brother. From that first murder demons awoke, sent forth by fate \u2014 one of them was Grendel, and now another comes in his place. The theological genealogy is reiterated: she is kin of Cain, shaped by the same original wrong that shaped her son.",
        "She comes to Heorot. The terror is less severe only by as much as the war-strength of a woman is less than a warrior's \u2014 the poem does not pretend she is not dangerous, only that she is slightly less catastrophic than what came before. Hard-edged weapons are snatched up through the building, blades lifted from benches, shields raised \u2014 no one thinks of helmet or mail-coat; terror has taken hold. She moves quickly, meaning to escape once she is spotted. She lays hold of one of the nobles and hurries off toward the fens. He is the dearest of heroes to Hrothgar, a mighty shield-warrior, widely-famed \u2014 his name is Aeschere, elder brother of Yrmenlaf, Hrothgar's most beloved counselor and shoulder-companion.",
        "She takes also the famous hand \u2014 Grendel's claw, still gory, hanging from the roof. The trophy of victory is reclaimed. Grief is renewed in homes and houses; it was no happy exchange. The old ruler is stricken in spirit; Beowulf is summoned swiftly from his separate chamber, brave and triumphant, to where the wise king waits to see whether all-gracious God will grant him any relief after the grief he has suffered. The battle-worthy hero crosses the pavement \u2014 the hall-floor thundering under them \u2014 and asks whether the night has been fully refreshing. The question is characteristic Beowulf: polite, formal, knowing perfectly well that it has not been.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }, {
        "id": "grendelsMother",
        "name": "Grendel's Mother",
      }],
      themes: [{
        "slug": "grendel-and-the-kin-of-cain",
        "label": "Grendel and the Kin of Cain",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }],
    },
    {
      n: 21,
      title: "Fitt XXI \u2014 Hrothgar's Account of the Monsters",
      tourTitle: "The Mere Described",
      hook: "Hrothgar tells Beowulf of Aeschere's death and describes the monsters' haunted mere \u2014 frost-white trees hanging over black water where fire burns on the surface at night and deer will die on the bank before entering.",
      tour: "This fitt is the poem's finest piece of landscape writing. Hrothgar describes the place where Grendel's mother has gone with Aeschere: a pair of great march-striding creatures haunting the moorlands, one in the shape of a man, one a woman; earth-dwelling people in the old days called the male one Grendel; no one knows his father. They guard wolf-coverts and wind-beaten headlands, the most dreadful fen-deeps, where a flood from the mountains rattles downward beneath mists on the cliffs. The mere where they live is not far in miles but worlds away in spirit: forests hanging frost-white over the water, an uncanny darkness, fire on the surface at night, and the heath-stepper \u2014 the stag pursued by hounds even unto death \u2014 who will die sooner on the bank than venture in to hide his head. The description is the poem's most concentrated rendering of the dark that surrounds the hall.",
      blurb: "Hrothgar describes the monsters' haunted mere \u2014 frost-white forests, black water, fire at night, and a deer that would rather die on the bank than enter \u2014 and asks Beowulf to go against it.",
      summary: [
        "Hrothgar speaks his grief plainly: Aeschere is dead \u2014 elder brother of Yrmenlaf, his true-hearted counselor, his trusted adviser, his shoulder-companion who guarded his head when they fought in battle and troops clashed. Such a man should a noble always be, as Aeschere proved himself. In Heorot the restless death-spirit became his murderer; Hrothgar cannot say where the cruel one went off gorged with her prey. She took revenge for the killing done last night \u2014 since Beowulf slew Grendel in the most terrible fashion, Grendel had for too long thinned Hrothgar's household. He fell. Now another has come in his place, a mighty doer of crimes, avenging her kinsman.",
        "The description of the monsters' territory is extended and precise. Hrothgar has heard from his retainers of a pair of such great march-striding creatures, far-dwelling spirits, haunting the moorlands. One wears the shape of a woman; the other, wretched, walks the paths of exile in the form of a man, except bigger than any other man \u2014 earth-dwelling people in the old days called him Grendel; no one knows his father, whether any other evil spirits were ever born to him before. They guard wolf-coverts, lands no one can reach, wind-beaten headlands, the most dreadful fen-deeps, where a flood from the mountains rattles downward beneath mists on the cliffs, a stream running under the earth.",
        "The mere itself is not far in miles, but Hrothgar's account of it is the poem's most atmospheric passage. Forests hang over it, frost-whitened, a firm-rooted forest overshadowing the water. Every night an ominous wonder may be seen: fire on the water. Not one of the children of men lives wise enough to know its bottom. Though the heath-stepper \u2014 the stag, harassed by hounds, fleeing from far off through the forest \u2014 will give up his life, sooner yield his spirit on the bank than venture in to hide his head there. It is an uncanny place. From it the surging of waters rises upward, dark against the sky, when the wind stirs ugly weathers until the air grows gloomy. Now help must come from Beowulf, and from him only. He is the one who can go there.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }, {
        "id": "grendelsMother",
        "name": "Grendel's Mother",
      }],
      themes: [{
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }, {
        "slug": "grendel-and-the-kin-of-cain",
        "label": "Grendel and the Kin of Cain",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }],
    },
    {
      n: 22,
      title: "Fitt XXII \u2014 Beowulf Seeks Grendel's Mother",
      tourTitle: "Into the Mere",
      hook: "Beowulf vows the creature will not escape \u2014 into earth, mountain forest, or the depths of the sea \u2014 then arms himself with Hrunting, the poison-stained sword, and follows Grendel's mother's trail to the blood-churning water.",
      tour: "The descent to the mere is the poem's most carefully prepared sequence of action. Beowulf's vow to Hrothgar is absolute: wherever she tries to go \u2014 earth, mountain, or sea-bottom \u2014 she will not escape. He arms with inlaid mail-coat, bright-shining helmet, and Hrunting, the great sword lent by Unferth \u2014 old and most excellent among all treasures, its blade of iron stained with poison, hardened with battle-gore, never having failed any hero who held it. The trail leads over stony cliffs and through close-covered paths to the joyless forest and the mere below, where the water stands welling up and gory. The warriors find Aeschere's head on the cliff. Serpents and sea-dragons try the waters. Beowulf sends an arrow into one of them. Then he puts on his battle-gear and dives. This fitt ends at the threshold of the cave \u2014 the most claustrophobic passage in the poem is still to come.",
      blurb: "Beowulf arms with Hrunting, the poison-stained sword, and follows the trail to the blood-welling mere where sea-serpents haunt the cliffs and Aeschere's head lies on the bank.",
      summary: [
        "Beowulf's vow to Hrothgar is immediate and unconditional. For every man it is better to avenge his friend than to mourn him too long \u2014 each of us must await the end-day of his earthly life, and let the man who can gain glory before death. Rise up, king, let us hurry at once to look at the trail. He promises this now: she shall not escape to her place, not into the earth's embrace, not into any mountain forest, not into the depths of the sea \u2014 wherever she tries to go. For today endure each of your sorrows with patience, as he truly expects. The old king springs up, gives thanks to the All-Ruler, and has a war-horse bridled at once.",
        "The trail leads over the stony, steeply dropping cliffs, the close-covered paths, the narrow passes, the unfrequented tracks, abrupt headlands, many haunts of water-monsters. One of only a few wise-minded heroes goes ahead to scout. Then all at once: mountain-woods hanging over gray stones, a joyless forest; the water below, welling up and gory. It is painful in spirit to all the Danes and many a retainer, hard to bear, a sorrow not small to each of the warriors \u2014 when they come upon Aeschere's head on the cliff. The current seethes with blood and gore. The soldiers gaze at it. The horn sounds the battle-song.",
        "The troop sits along the water and sees many a serpent: wondrous sea-dragons trying the waters, water-monsters lying on the headland cliffs. At midday they set out on the sea-deeps on their sorrowful journeys \u2014 wild beasts and serpent-kind. They hurry off hot-tempered and hateful when they hear the great clamor of the war-trumpet. One of them Beowulf cuts off from earth's joys with an arrow, pierces him to the vitals; the trusty war-shaft kills him. Then Beowulf dresses in his battle-gear: inlaid ample mail-coat, bright-shining helmet ringed with jewels, and Hrunting \u2014 old and most excellent among all treasures, its blade of iron stained with poison and hardened with battle-gore, never having failed any hero who dared to take the terrible journeys. He has not yet failed with it. He will.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }, {
        "id": "grendelsMother",
        "name": "Grendel's Mother",
      }],
      themes: [{
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "grendel-and-the-kin-of-cain",
        "label": "Grendel and the Kin of Cain",
      }],
    },
    {
      n: 23,
      title: "Fitt XXIII \u2014 Beowulf's Fight with Grendel's Mother",
      tourTitle: "Into the Mere",
      hook: "Beowulf dives into the haunted lake, sinks a full day, and meets Grendel's mother in her cave beneath the currents.",
      tour: "Fitt XXIII is the descent sequence \u2014 the most atmospherically dense passage in the poem. Beowulf bequeaths Hrunting to Unferth and leaps into the mere without waiting for a reply. He sinks for a full day before touching bottom. Grendel's mother seizes him, drags him into an air-filled cave beneath the water where fire-light burns despite the flood above. His mail-coat holds against her claws; the sword Hrunting, famed blade that had never failed, will not bite her hide. The chapter ends on that failure \u2014 the hero's best weapon useless, the fight at its most desperate. The cave-under-lake is the poem's most claustrophobic image: older than the hall, colder, lit by a wrong kind of fire.",
      blurb: "Beowulf enters the haunted mere without hesitation, sinks to its cave floor, and finds Hrunting useless against Grendel's mother in the firelit dark.",
      summary: [
        "Beowulf makes his last dispositions before the dive: if he does not return, Hrothgar is to send his rewards back to Hygelac, and Unferth should receive Hrunting, the famous sword, as a gift. Then he plunges in without waiting for anyone to answer, and the wave-current swallows him. He sinks for a full day before he can see the bottom of the mere.",
        "Grendel's mother has patrolled these depths for fifty winters. She finds him in the water and grabs him \u2014 her claws cannot pierce his war-shirt \u2014 then drags him down into a vaulted cave beneath the flood where, strangely, there is no water and a fire burns. Sea-beasts torment him on the way down, tearing at his mail with their tusks, but the armor holds. In the cave he can stand upright. The strange fire gives just enough light to see.",
        "He draws Hrunting and swings at her. The blade will not bite. The famed sword that had cloven helmets through all its history fails on her hide \u2014 the first time it has ever failed. The chapter ends with that failure registered and nothing yet resolved, the hero standing in his enemy's home with a useless weapon and the fight only beginning.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "grendels-mother",
        "name": "Grendel's Mother",
      }],
      themes: [{
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }, {
        "slug": "grendel-and-the-kin-of-cain",
        "label": "Grendel and the Kin of Cain",
      }],
    },
    {
      n: 24,
      title: "Fitt XXIV \u2014 Beowulf is Double-conqueror",
      tourTitle: "The Giant Sword",
      hook: "Among war-treasures in the cave Beowulf spots a giant-forged sword \u2014 larger than any man could wield \u2014 and kills Grendel's mother with it.",
      tour: "Fitt XXIV is the pivot and the resolution of the underwater fight. Hrunting has failed. Beowulf sees the ancient giant-sword on the cave wall \u2014 a weapon no human hand was supposed to hold \u2014 and uses it. One blow breaks through her bone-joints; she falls. He finds Grendel's corpse nearby and takes his head as a trophy. Then the sword's blade, touched by the venomous blood, melts down to the hilt like ice in spring: the weapon destroys itself in the act of winning. Above, Hrothgar's men have given Beowulf up for dead and gone home. Only the Geats remain at the lake-edge, waiting. Four of them carry Grendel's severed head back to Heorot on a spear.",
      blurb: "Beowulf finds a giant-forged sword in the cave, kills Grendel's mother, severs Grendel's head, and watches the blade dissolve in the monster's blood.",
      summary: [
        "Among the war-treasures in Grendel's mother's cave Beowulf spots a giant-forged sword \u2014 ancient, magnificent, and larger than any ordinary man could carry. He seizes it and strikes. One blow through the bone-joints kills her; she falls to the cave floor. The blade is bloody and the hero exults.",
        "He finds Grendel's corpse lying nearby and cuts off its head with the same blade. The venomous blood begins to work immediately: the sword-blade shrivels and melts, dissolving away until only the gold hilt remains in his hand. The weapon that killed two monsters destroys itself in the killing. He keeps the hilt.",
        "Above the mere, the Danes have concluded Beowulf is dead and departed. Only the Geats remain at the water's edge. When Beowulf surfaces the eddies are clean \u2014 the alien spirits gone from the water. He swims ashore with Grendel's head and the melted hilt. Four men are needed to carry Grendel's head on a spear to Heorot's gold-hall.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "grendels-mother",
        "name": "Grendel's Mother",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }],
    },
    {
      n: 25,
      title: "Fitt XXV \u2014 Beowulf Brings His Trophies \u2014 Hrothgar's Gratitude",
      tourTitle: "The Hilt and the Sermon Begins",
      hook: "Beowulf lays Grendel's head and the giant sword-hilt before Hrothgar, who studies the ancient runes engraved on the gold.",
      tour: "Fitt XXV is the return to the hall and the first of Hrothgar's great speeches. Beowulf presents the trophies \u2014 Grendel's head and the melted hilt \u2014 and announces that Heorot is now permanently safe. Hrothgar receives the hilt and reads the runic inscription: the story of the Flood that destroyed the giants, and the name of the sword's first owner, engraved in gleaming gold. The king then begins a long moral address to Beowulf, using the negative example of Heremod \u2014 a king who had every gift but squandered it in cruelty \u2014 as the opening of his warning against pride. The sermon is the poem's longest sustained piece of reflection and continues into the next fitt.",
      blurb: "Beowulf returns Grendel's head to Heorot, Hrothgar reads the Flood-story engraved on the ancient hilt, and begins his great sermon against pride.",
      summary: [
        "Beowulf presents his trophies to Hrothgar: the head of Grendel, which four Geats carried on a spear through the hall, and the gold hilt of the giant sword \u2014 all that remains after the blade dissolved in the monster's blood. He tells Hrothgar the hall is now permanently safe: both creatures are dead.",
        "Hrothgar receives the hilt and studies it carefully. Runic letters engraved in gleaming gold tell two stories: the beginning of the ancient conflict, the Flood that God sent to destroy the race of giants, and the name of the man for whom the sword was first made. The king holds in his hands an object older than anything in the hall, an artifact from the world before the Flood.",
        "Hrothgar begins a long formal address to Beowulf, calling him a man better by birth than any the old king has known. As the opening of a warning, he invokes the negative example of Heremod \u2014 a Danish king of an earlier age who had been given every advantage and turned it to cruelty and murder, dying unmourned. The address will continue.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-manuscript-that-almost-burned",
        "label": "The Manuscript That Almost Burned",
      }],
    },
    {
      n: 26,
      title: "Fitt XXVI \u2014 Hrothgar Moralizes \u2014 Rest After Labor",
      tourTitle: "Hrothgar's Warning",
      hook: "Hrothgar finishes his sermon: pride enters a man like an arrow under his helmet, age and illness take everything, so use what you have while you have it.",
      tour: "Fitt XXVI completes Hrothgar's great address. He describes the anatomy of pride with the precision of a physician \u2014 it enters a sleeping man like an arrow under his helmet, the guard-spirit asleep \u2014 and catalogues what strips the proud king in the end: illness, the sword, old age, fire, or the flood of water. The speech is the poem's most extended moral teaching, and it is addressed specifically to a young man at his moment of greatest triumph. The timing is the whole point. After the sermon, the hall settles into feast and sleep. Beowulf returns Hrunting to Unferth with thanks; he speaks no blame of the blade even though it failed him underwater, because courtesy is part of what the poem measures in its heroes.",
      blurb: "Hrothgar warns Beowulf that pride invades even the greatest warrior like a wound \u2014 then the hall feasts, and Beowulf returns Hrunting to Unferth with thanks.",
      summary: [
        "Hrothgar's warning reaches its sharpest point. Pride enters a man like a bitter arrow under his helmet while he sleeps \u2014 the soul's guard-spirit off duty \u2014 and once it takes root it drives a king to covetousness, cruelty, the breaking of oaths. He lists what will strip even the proudest: illness, sword-edge, old age, fire, flood. The fullness of a man's life-vigor lasts only a little while.",
        "The sermon is addressed to a young warrior at the peak of his power, having just killed two monsters in two days. The timing is deliberate: this is when the warning is needed, not after the fall has happened. Hrothgar holds himself up implicitly as evidence \u2014 a great king, once mighty, now unable to stop a night-thing from emptying his own hall for twelve years.",
        "After the speech the hall settles into feast and then sleep. Beowulf's needs are attended to with courtesy befitting a traveler from a far country. Before sleeping he returns Hrunting to Unferth and thanks him for the use of it, saying the war-friend is mighty and good \u2014 speaking no blame of the blade that failed him in the cave, because the poem's heroes are measured partly by what they choose not to say.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }],
    },
    {
      n: 27,
      title: "Fitt XXVII \u2014 Sorrow at Parting",
      tourTitle: "Farewell to Hrothgar",
      hook: "Beowulf announces his return home; Hrothgar embraces him with tears, knowing they will not meet again, and calls him the finest young ruler he has ever seen.",
      tour: "Fitt XXVII is one of the poem's most affecting passages \u2014 a departure that both men know is final. Beowulf announces the Geats are ready to sail. He offers Hrothgar Hygelac's alliance and military aid whenever it is needed. Hrothgar answers with a speech that is formally a commendation but is emotionally a farewell: he calls Beowulf the best-spoken young warrior he has known, predicts that if Hygelac dies before him Beowulf will make the finest king the Sea-Geats could choose, and then embraces him, weeps on his neck, and lets him go. The poet notes that Hrothgar did not expect to see the young hero again. The Geats walk down to the ship under the watching sun. The harbor-warden of Heorot is praised by the poet in passing: blameless in every way until age took his strength, as age often injures many.",
      blurb: "Beowulf bids Hrothgar farewell; the old Danish king weeps openly, calls him the finest young man he has known, and watches the Geats walk back to their ship.",
      summary: [
        "Beowulf formally announces the departure: the seafarers wish to seek Hygelac, and they have been honored beyond what any host is obliged to give. He then offers a political commitment \u2014 if Hrothgar ever needs military force, the young Geat warrior will bring it across the sea, with lances and the full support of his people.",
        "Hrothgar's response is the warmest passage in the poem. He praises Beowulf's wisdom \u2014 never has he heard a warrior so young speak so carefully \u2014 and predicts that if the Geat king dies and Beowulf survives, the Sea-Geats will find no fitter choice for a folk-lord than him. He calls it a hope he genuinely holds. Then he says he knows the young man can make peace between peoples whenever he chooses.",
        "The king embraces him, clasps his neck, and weeps. The tears are not concealed or apologized for; they are the visible form of what the poem values. Hrothgar, the poet says, loved Beowulf deeply, though not as a blood-kinsman, and knew in his spirit he would not see him again. The Geats walk to their ship, the sun shining. The harbor-warden meets them on the cliff and is praised in passing by the poet: blameless, until age took what age takes.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 28,
      title: "Fitt XXVIII \u2014 The Homeward Journey \u2014 The Two Queens",
      tourTitle: "Home Waters",
      hook: "The Geats sail home; Beowulf gives the shore-warden a gold-bound sword, and the poem pauses to contrast two queens \u2014 modest Hygd and the once-terrible Thrytho.",
      tour: "Fitt XXVIII is a transitional chapter but not an empty one. The homeward voyage is brisk: the harbor-guard who challenged them on arrival is now greeted as a friend, Beowulf gives him a gold-bound sword as a parting gift, and the ship runs along the sea until the Geatish cliffs appear on the horizon. The harbor-warden at home is ready for them at the shore. But the chapter's most unusual passage is a digression on two queens: Hygd, Hygelac's young wife, praised for wisdom and generosity despite her few winters in the stronghold, and then Thrytho, an earlier queen who had warriors killed for daring to look at her until marriage to Offa civilized her out of her rage. The digression on Thrytho is one of the poem's unexplained gestures \u2014 she appears, is judged, and is set aside.",
      blurb: "The Geats sail home to their own cliffs; Beowulf gifts the shore-warden a sword, and the poet pauses to contrast two queens \u2014 generous Hygd and the once-murderous Thrytho.",
      summary: [
        "The shore-warden at Heorot who had challenged the arriving Geats weeks earlier now rides down to meet the departing warriors. He is greeted without insult. Beowulf gives him a gold-bound sword as a gift \u2014 the act of a man who understands that the man who guards the approach to a great hall is worth honoring \u2014 and the ship pushes off into the sea.",
        "The voyage home is swift. The wave-goer runs on the wind until the well-known headlands of the Geats appear and the ship grinds up onto the familiar shore. The harbor-warden at home is ready, which is noted as a mark of good order in the kingdom. The treasure-laden Geats land without incident.",
        "The poet then digresses on two queens in quick succession. Hygd, Hygelac's young wife \u2014 few winters in the stronghold, yet wise and open-handed, not stingy with gifts to the Geats \u2014 is introduced and praised. Against her is set the figure of Thrytho, an earlier queen whose cruelty is remembered: she had warriors put to death for daring to look at her by daylight, until she was given in marriage to Offa and became, under his firm goodness, a better queen. The contrast of the two is left for the reader to hold.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 29,
      title: "Fitt XXIX \u2014 Beowulf and Higelac",
      tourTitle: "Report to Hygelac",
      hook: "Back at Hygelac's hall, the king questions Beowulf closely about Denmark \u2014 Beowulf's king had prayed he would not go and is relieved and curious in equal measure.",
      tour: "Fitt XXIX is the homecoming scene at Hygelac's court. Hygd passes among the benches with the mead-cups; the hall is warm and the welcome is genuine. Hygelac's first words reveal that he had been anxious \u2014 he had openly prayed that Beowulf would not seek out the murderous spirit, would leave the South-Danes to settle their own matter with Grendel. He thanks God that the warrior returned safely. Then the formal questioning begins: what happened at Heorot? The chapter is also notable for Beowulf's retelling of Hrothgar's marriage arrangement \u2014 the Dane-king gave his daughter Freawaru to Ingeld of the Heathobards to cement a peace, but Beowulf predicts the peace will not hold: old grudges between peoples do not dissolve because a woman crosses between them.",
      blurb: "Hygelac questions Beowulf eagerly in his hall, relieved he returned alive; Beowulf reports on Denmark and predicts Hrothgar's marriage-peace with the Heathobards will not last.",
      summary: [
        "At Hygelac's hall the returning hero is welcomed. Hygd, the young queen, brings mead-cups to the high-minded Geats. Hygelac's opening words to Beowulf are revealing: he says he long prayed that Beowulf would not go to Heorot, would not seek out the murderous spirit alone. He thanks God the man has come home whole. Then he turns to questions \u2014 what mournful moments did Beowulf and Grendel spend together? What happened?",
        "Beowulf begins his report. One detail he develops at length is the political situation he observed at Heorot: Hrothgar has given his daughter Freawaru in marriage to Ingeld of the Heathobards, hoping to settle a long feud between the two peoples with a wedding. Beowulf is skeptical. He describes how the thing will likely go: a Heathobard warrior will see a Dane wearing a sword that was taken from his dead father in battle, and the old anger will ignite despite the marriage.",
        "The prediction is one of the poem's darkest asides. Beowulf does not say the marriage is foolish; he says it rarely works. When a man has lost his father to an enemy and must drink beside that enemy's kinsman, the whetted memory of the dead is too old and too sharp for the peace of a political marriage to overcome. He has just spent weeks in Hrothgar's company and has read the hall politics clearly.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }],
    },
    {
      n: 30,
      title: "Fitt XXX \u2014 Beowulf Narrates His Adventures to Higelac",
      tourTitle: "The Grendel Story Retold",
      hook: "Beowulf retells the Grendel fight for Hygelac, adding details not in the earlier account \u2014 Hondscio eaten alive, the glove of human skin, the grief of Hrothgar.",
      tour: "Fitt XXX is the poem's structural mirror: Beowulf retells to Hygelac what the reader witnessed in the first movement, and the retelling is not identical to what we saw. New details appear. Hondscio, his companion eaten by Grendel, is named and mourned. The monster's battle-glove \u2014 a hideous bag sewn from human skins \u2014 is described for the first time; Grendel intended Beowulf to join the others inside it. The emotional texture of the report is different from the action: Beowulf is translating combat into words for a king who was not there. He also reports \u00c6thelric's feast and Hrothgar's grief for \u00c6schere, carried off by Grendel's mother, and the morning scene at the mere that the poem told from a distance is now seen through Beowulf's eyes.",
      blurb: "Beowulf retells the Grendel nights for Hygelac, naming the slain Hondscio and describing Grendel's bag of human skins \u2014 details the poem withheld from its own first account.",
      summary: [
        "Beowulf's retelling opens with a detail not given in the poem's first account: his companion Hondscio was killed. Grendel ate him \u2014 girded war-champion, he fell first, dead. The poem names him here and grants him a brief elegy. Beowulf describes what Grendel intended for him: a battle-glove of monstrous size, sewn from the skins of men, into which he would have been stuffed if the wrestling had gone differently.",
        "He then gives Hygelac the emotional texture of the Danish hall: Hrothgar's long feasting, the old king's gift of a neck-ring and war-horses and treasures, the joy of songs from morning to evening. And he gives the grief: Hrothgar aged and mourning, his breast boiling with memories from a time when he still had a young man's strength.",
        "The retelling of the second night \u2014 Grendel's mother coming to take \u00c6schere in revenge \u2014 is handled swiftly. Beowulf describes the morning scene at the lake: the blood-stained water, Hrothgar's sorrow for the man he had trusted most in the world, the impossibility of giving the dead counselor even a proper fire-burial because the body was in the cave under the mere.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "grendels-mother",
        "name": "Grendel's Mother",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "grendel-and-the-kin-of-cain",
        "label": "Grendel and the Kin of Cain",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 31,
      title: "Fitt XXXI \u2014 Gift-giving is Mutual",
      tourTitle: "Gifts Exchanged",
      hook: "Beowulf lays Hrothgar's treasures before Hygelac and is rewarded with the greatest sword in the Geat treasury \u2014 seven thousand hides of land and a hall.",
      tour: "Fitt XXXI is the gift-giving chapter, and it is the poem's fullest demonstration of how the hall economy works when it works well. Beowulf presents everything Hrothgar gave him to Hygelac \u2014 he brings it all, keeps nothing for himself \u2014 including the great neck-ring Wealhtheow gave him, which he passes to Hygd, Hygelac's queen. The story of the neck-ring connects it to the famous Brosinga necklace of legend, giving a moment's mythological depth to an object that was already extraordinary. Hygelac's response is what the system demands of a good lord: he gives more than he received. He brings out the heirloom sword of Hrethel, the most valuable weapon in the Geat treasury, and gives Beowulf seven thousand hides of land and a hall with lordship. The chapter also foreshadows Beowulf's accession: Hygelac will die, Heardred will be killed, and Beowulf will take the throne.",
      blurb: "Beowulf gives Hygelac everything Hrothgar awarded him, passing even the great neck-ring to the queen; Hygelac rewards him with Hrethel's heirloom sword and seven thousand hides of land.",
      summary: [
        "Beowulf lays before Hygelac the full gift-haul from Heorot: the armor, the horses, the treasures, all the ornaments Hrothgar bestowed. He holds nothing back. The great neck-ring that Wealhtheow gave him \u2014 the most magnificent single object \u2014 he presents to Hygd, Hygelac's queen, along with three saddle-bright horses. The poet links the neck-ring to the legendary Brosinga necklace, placing it in a lineage of famous objects.",
        "Hygelac's response is recorded as the correct one: he gives more than he received. He brings out the heirloom sword of Hrethel \u2014 the finest weapon in the Geat treasury, owned by Beowulf's grandfather \u2014 and presents it to Beowulf along with seven thousand hides, a hall, and lordship over land. The reciprocal giving is described as the proper functioning of the bond between lord and thane.",
        "The poet looks ahead briefly and without sentiment: after Hygelac's death and then the death of Heardred under Swedish attack, it fell to Beowulf to rule the Geats. The summary of what is coming is compressed and final-sounding. The poem has established the structure it will complete in the third movement.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "hrothgar",
        "name": "Hrothgar",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }],
    },
    {
      n: 32,
      title: "Fitt XXXII \u2014 The Hoard and the Dragon",
      tourTitle: "The Dragon Wakes",
      hook: "A slave on the run steals a gold cup from a buried hoard; the dragon who has lain on it for three hundred winters wakes, finds the theft, and begins to burn the country.",
      tour: "Fitt XXXII opens the poem's third and final movement with a shift of register and a fifty-year jump. A fugitive slave, seeking shelter and a bribe for his lord, stumbles into a barrow and takes a single cup. The chapter pauses to describe the hoard's origin: the lay of the last survivor, one of the most desolate passages in all of Old English poetry, in which the last man of a vanished people buries their gold and laments that there is no one left to give it to. The dragon has lain on this hoard for three hundred winters. It discovers the theft not immediately but eventually \u2014 sniffing along the stone until it finds the intruder's track \u2014 and then it goes out burning halls and villages in the night. By morning Beowulf's own hall is ash.",
      blurb: "A runaway slave takes a cup from a buried hoard; the dragon sleeping on it for three centuries wakes, traces the theft, and burns Beowulf's hall to the ground.",
      summary: [
        "The third movement opens under different conditions. A slave \u2014 a man fleeing punishment from his lord, seeking a bribe that might soften the punishment \u2014 takes refuge in a barrow and, in the dark, finds treasure. He takes a single gold cup to bring as an offering. The chapter does not judge him. He is a small man caught between systems larger than himself.",
        "The poem then gives the hoard its history through the lay of the last survivor: a solitary man, the only one left of his people, brings their accumulated gold into the barrow and speaks a lament over it. 'Hold now, O Earth, what heroes no longer can.' Every object listed \u2014 cups, armor, swords, helmets \u2014 is an object without anyone left to give it to. The dragon has lain on the buried treasure for three hundred winters since.",
        "The dragon wakes to the smell of the theft. It sniffs along the stone, finds the track, discovers what is missing. It does not act immediately; it circles the barrow repeatedly, waiting for night. Then it goes out over the land, flaming. By morning Beowulf's hall \u2014 the gift-seat of the Geats \u2014 is burnt to ash and the dragon is settled back on the hoard.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "the-dragon",
        "name": "The Dragon",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }],
    },
    {
      n: 33,
      title: "Fitt XXXIII \u2014 Brave Though Aged \u2014 Reminiscences",
      tourTitle: "The Old King Prepares",
      hook: "Beowulf sees his burned hall and grieves; he orders an iron shield made against dragon-fire and recalls surviving Hygelac's death at Friesland by swimming home in armor.",
      tour: "Fitt XXXIII is Beowulf as old king, and it is the poem's most explicit meditation on aged courage. When told his hall is burning, his first response is grief so sharp the poet pauses to record it \u2014 and then self-examination: had he somehow angered God? The answer he reaches is no, and then the preparations begin. He orders an iron shield, knowing wood will not hold against the dragon's fire. He considers going against it with a war-band and decides against it: this is his fight. The chapter then moves into reminiscences \u2014 Beowulf remembers the battle at Friesland where Hygelac was killed and he survived by fighting his way to the sea and swimming home in full armor. The memory of his strength in that moment is both a comfort and a marker of how much time has passed.",
      blurb: "Beowulf learns his hall is ash, grieves, orders an iron shield, and recalls swimming home from Friesland after Hygelac's death \u2014 the test his old body now faces is worse than that one.",
      summary: [
        "The news of the burning reaches Beowulf. His hall \u2014 the gift-seat of the Geats, the finest building of his kingship \u2014 is ash. The grief is immediate and physical. His breast welled within him. For a moment he wonders if he has somehow angered the everlasting Lord, acted against the ancient commandments. The self-examination is brief and sincere. He concludes it was not that.",
        "He orders a shield made of iron \u2014 wood is useless against dragon-fire; he knows this clearly. He considers assembling a large war-band and then sets the idea aside: this is not a fight he will divide the credit for, nor one where a large force would help against the creature's flame. He will go with a small group, face it himself. The king who has ruled wisely for fifty winters makes his preparations with the same clarity he brought to Heorot.",
        "The reminiscences begin. Beowulf remembers Friesland: Hygelac was killed in the battle, the Geat forces routed, and Beowulf escaped by fighting through a press of enemies to the sea and swimming home in full armor \u2014 thirty men's strength, the poem reminds us, though it does not need to. The memory of that day is registered as both proof and contrast: he was strong enough to survive that. The dragon-fight will be harder.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "the-dragon",
        "name": "The Dragon",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 34,
      title: "Fitt XXXIV \u2014 Beowulf Seeks the Dragon \u2014 Beowulf's Reminiscences",
      tourTitle: "Eleven Companions",
      hook: "With eleven companions and the unwilling slave as guide, Beowulf walks to the dragon's barrow and recalls his boyhood in Hrethel's hall \u2014 the king who died of grief.",
      tour: "Fitt XXXIV is the march to the barrow and the final round of reminiscences. Eleven companions, the reluctant slave as thirteenth man pointing the way, and Beowulf walking with fury to look upon the fire-drake. The chapter deepens the emotional register with the memory of Hrethel: Beowulf's grandfather-king who took the young Geat boy into his hall and treated him as a son. Hrethel died of grief \u2014 not in battle, not from an enemy, but because his own son H\u00e6thcyn accidentally killed his brother Herebald with an arrow, and the law gave Hrethel no recourse against his own child for his own child's death. The old king could not act, could not avenge, could not heal the wound. He chose death instead of life under those conditions. It is one of the poem's darkest human stories.",
      blurb: "Beowulf marches to the barrow with eleven men and a reluctant guide, pausing to remember Hrethel \u2014 the king who died of grief when his son killed his son and law forbade revenge.",
      summary: [
        "Beowulf goes to the dragon with eleven companions. A thirteenth man \u2014 the slave who stole the cup, wretched and captive now \u2014 is brought along against his will to identify the place. He knows where the cave is and points the way to the barrow not far from the ocean, the anger of the eddies. He does not want to be there.",
        "The march becomes a meditation. Beowulf remembers Hrethel, his grandfather-king, who received the young Beowulf into his hall and raised him alongside his own sons. He was as dear to Hrethel as any of them. Among those sons were Herebald, H\u00e6thcyn, and Hygelac. H\u00e6thcyn, practicing with a bow, shot and killed Herebald by accident \u2014 one brother striking another with a blood-sprinkled spear.",
        "Hrethel's position after the accident was unbearable. No fine could settle a death by accident within the same kindred. The law gave him no instrument of vengeance, and the law's silence on the act did not make the grief smaller. The poet compares him to a man whose son is hanged \u2014 who must watch the ravens eat the boy he cannot cut down, cannot help, cannot avenge. Hrethel chose death. The memory of a king undone not by enemies but by the structure of the world he lived in is what Beowulf carries to the barrow.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "the-dragon",
        "name": "The Dragon",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }],
    },
    {
      n: 35,
      title: "Fitt XXXV \u2014 Reminiscences (continued) \u2014 Beowulf's Last Battle",
      tourTitle: "The Last Speech",
      hook: "Beowulf makes his final speech to the eleven \u2014 no one else may fight this creature \u2014 then advances alone to the barrow's entrance and shouts his challenge into the dark.",
      tour: "Fitt XXXV completes the reminiscences and delivers Beowulf's last great formal speech. The Swedish-Geat wars are recalled: H\u00e6thcyn killed by Ongentheow, the terrible Swedish counter-assault at Ravenswood. These are the enemies who will swarm over Geat lands after Beowulf's death \u2014 a fact the poem lets the audience carry. Then the speech: Beowulf tells the eleven companions that no man may go against the dragon in his place. Not because he forbids it but because no one else can. He would rather fight it barehanded, as he fought Grendel, if he knew any way to do it without the blade \u2014 but he will use a sword and his iron shield. He advances alone to the barrow-entrance, the brook foaming with dragon-heat, and shouts his war-cry into the stone. The dragon answers with fire.",
      blurb: "After recalling the Swedish wars that will undo the Geats after his death, Beowulf makes his last speech to the eleven and walks alone to the barrow-entrance to shout his challenge.",
      summary: [
        "The Swedish-Geat wars come into the reminiscences: H\u00e6thcyn killed in battle, the Geats pursued to Ravenswood, nearly destroyed before Hygelac arrived with forces to relieve them. Ongentheow, the Swedish king, was old and terrifying and was eventually killed by Eofor and Wulf, who were rewarded generously. These are the wars Beowulf's death will reopen \u2014 the messenger who will announce the news later in the poem already knows what it means for the Geats without their king.",
        "Beowulf's final speech to the eleven is the declaration of a man who has measured the situation clearly. No other man may go against the dragon \u2014 it is not a matter of prohibition but of fitness. He says he would prefer to fight it without weapons, as he fought Grendel, but the nature of the creature doesn't permit that approach. He will go with his iron shield and his sword and his body, which has been the instrument of everything the poem describes.",
        "He walks alone down to the stone arch at the barrow's entrance. The brook flowing from it is fuming with war-flame; the heat is such that he cannot stand near it for even a moment. He waits for the anger to move through him. Then he sets his shield and shouts his challenge into the cave. The hoard-ward hears the voice of a man and answers with its breath: vapor first, then fire, then the dragon itself, erupting from the stone.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "the-dragon",
        "name": "The Dragon",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 36,
      title: "Fitt XXXVI \u2014 Wiglaf the Trusty \u2014 Beowulf is Deserted by Friends and by Sword",
      tourTitle: "Wiglaf Alone Remains",
      hook: "The dragon's flame breaks Beowulf's shield and sword; his ten companions flee into the woods; only Wiglaf stays, recalling the gold rings Beowulf gave them in the hall.",
      tour: "Fitt XXXVI introduces Wiglaf and records the moment the poem has been building toward for three movements: what a man does when his lord needs him and the cost of doing it is visible and immediate. Wiglaf's lineage is given \u2014 Weohstan's son, of the W\u00e6gmunding line, kinsman of Beowulf \u2014 and then his decision is described without ceremony. He sees his liegelord burning under the dragon's fire, he remembers the gifts given in the hall, and he goes. He speaks to the ten who are fleeing: the words about the mead-hall obligations are the poem's sharpest statement of the theme. The ten do not return. Beowulf's iron shield melts. His sword fails on the dragon's hide. He is in the same position as the cave under the mere \u2014 his weapons failing, his body taking damage \u2014 but he is fifty years older, and there is no giant sword waiting on the wall.",
      blurb: "Wiglaf watches Beowulf burning under the dragon's fire, recalls the gold given in the hall, and goes to his side alone \u2014 the ten others flee into the woods and do not return.",
      summary: [
        "Wiglaf sees his liegelord enduring the heat beneath his helmet and visor. He remembers the wealth-blessed homestead of the W\u00e6gmunding warriors, every folk-right his father held. He remembers Beowulf's gifts. His hand seizes the targe, he unsheathes the ancient sword, and he goes. His spirit is called dauntless; the decision is not presented as complicated.",
        "He speaks to the ten companions who are retreating. The speech is one of the poem's most quoted passages: they had taken arms and gold from Beowulf's hand in the hall, had pledged their service in return, and this \u2014 this precise moment of the dragon with the blazing breath \u2014 is the moment the pledge was made against. He says he would rather be consumed by the blaze than return home without having stood with his treasure-giver. He goes.",
        "The battle goes badly. Beowulf's iron shield cannot hold the dragon's fire; it shrivels and melts before its protection is used up. His sword, when he strikes the dragon, fails on the hide \u2014 the blade does not bite deep enough to harm the creature. Beowulf is being burned and his weapons are failing. For the first time in the poem there is no clear path from here to victory.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "wiglaf",
        "name": "Wiglaf",
      }, {
        "id": "the-dragon",
        "name": "The Dragon",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }],
    },
    {
      n: 37,
      title: "Fitt XXXVII \u2014 The Fatal Struggle \u2014 Beowulf's Last Moments",
      tourTitle: "The Killing Blow",
      hook: "Wiglaf drives his sword into the dragon from below; Beowulf draws his war-knife and cuts the worm in two \u2014 both foes felled, but the venom is already working in Beowulf's neck.",
      tour: "Fitt XXXVII is the killing of the dragon and the beginning of Beowulf's death. The action is swift and precise: Wiglaf, in the moment Beowulf strikes and the dragon rears, drives his sword upward from below into the creature's body. The blow lands softer and lower than the belly. Beowulf, still conscious, draws the short war-knife he carries on his armor and cuts the dragon through the middle. Both foes are felled \u2014 pair of related land-chiefs working together, the poet says. Then the wound from the dragon's venom begins to work. Beowulf walks to a seat along the wall, the strength going out of him. He removes his helmet. He sees the stone arches of the eternal earth-hall standing above him and speaks his last formal words: fifty winters of rule, no neighboring king dared face him with weapons, he held to his own, broke no oaths, killed no beloved companions in carousing.",
      blurb: "Wiglaf stabs the dragon from below; Beowulf cuts it through the middle with his war-knife \u2014 but the venom from the neck-wound is already spreading, and Beowulf sits down to die.",
      summary: [
        "Wiglaf strikes in the moment of the third dragon-charge. His sword goes upward from below, driving into the creature's body; the blow is noted as landing lower than the full force of the belly. But it weakens the dragon enough for the next move. Beowulf, burning and bitten, draws the short war-knife he carries strapped to his armor \u2014 every warrior's last tool, the thing you use when the sword is gone \u2014 and cuts the dragon through the middle. Both foes fall together.",
        "The venom is already working. Beowulf's neck-wound begins to burn and swell from inside. He makes his way, prudent of spirit, to a seat along the barrow wall. He sees the stone arches, the eternal earth-hall strengthened with pillars, standing above him. Wiglaf brings water, washes his face, unbinds his helmet. The care given to a dying king by the one man who stayed is quiet and particular.",
        "Beowulf speaks. He gives his accounting of the fifty years: no neighboring folk-king dared to meet him with weapons in war. He held his native ground and kept faith \u2014 never swore false oaths, never killed a beloved kinsman in carousing. He says the Ruler of Earth-men need not charge him with the killing of kinsmen. He is satisfied with what he did with the time. He asks Wiglaf to go quickly into the barrow and bring out the hoard, so he can see what he won before he dies.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "wiglaf",
        "name": "Wiglaf",
      }, {
        "id": "the-dragon",
        "name": "The Dragon",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }],
    },
    {
      n: 38,
      title: "Fitt XXXVIII \u2014 Wiglaf Plunders the Dragon's Den \u2014 Beowulf's Death",
      tourTitle: "The Hoard and the Death",
      hook: "Wiglaf enters the barrow alone and brings armloads of treasure back; Beowulf sees it, thanks God, gives Wiglaf his golden collar and helmet, and dies.",
      tour: "Fitt XXXVIII is one of the quietest and heaviest chapters in the poem. Wiglaf goes into the barrow alone \u2014 the dragon is dead, but the cave is still described with the full atmosphere of the dragon's presence, the ancient cups and flagons and the rotting standard of the last survivor. He loads his arms with what he can carry and brings it back to Beowulf. The dying king looks at the hoard he won and thanks God that he could gain such treasures for his people before his death-day. He asks for a burial mound to be built on the headland at Hronesness, visible to sailors. Then he gives Wiglaf everything he still wears \u2014 the golden collar, the war-mail, the gold-flashing helmet \u2014 and dies. The last act of the poem's gift economy is a dying king stripping himself to give to the one man who stayed.",
      blurb: "Wiglaf carries the dragon's hoard to the dying Beowulf, who thanks God and gives Wiglaf his collar, helmet, and mail before dying beside the barrow he conquered.",
      summary: [
        "Wiglaf enters the barrow at the dying king's request. The cave is as the poem imagines it: gold-treasure sparkling on the bottom, the ancient cups and platters standing, the tapestried standard woven with the craft of some long-dead maker. He gathers beakers and platters and the standard itself and carries them back to the light, uncertain whether Beowulf is still alive.",
        "Beowulf is still conscious. He looks at the gold and gives his final thanksgiving \u2014 not for his own survival, which is not coming, but that God allowed him to see these riches before his death, to win something he can leave to his people. He names his thanks specifically and clearly, as a man settling accounts.",
        "He gives his last instructions: a burial mound, tall and bright, to be built at Hronesness on the headland, visible to sailors far out at sea \u2014 a landmark that will carry his name when nothing else can. Then he removes his golden collar and gives it to Wiglaf, along with his gold-flashing helmet, his ring-mail, and his war-coat. He bids the young man use them well. He is the last of the W\u00e6gmundings, he says. Then Beowulf dies.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "wiglaf",
        "name": "Wiglaf",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }],
    },
    {
      n: 39,
      title: "Fitt XXXIX \u2014 The Dead Foes \u2014 Wiglaf's Bitter Taunts",
      tourTitle: "Wiglaf's Indictment",
      hook: "The ten men who fled return to find Beowulf and the dragon both dead; Wiglaf, exhausted beside his fallen king, delivers the poem's harshest judgment on cowardice.",
      tour: "Fitt XXXIX is the aftermath and the indictment. Beowulf and the dragon both lie dead \u2014 the dragon stretched nearby, forty-five feet long, the poem reports, a creature of night undone in its own darkness. The ten companions who fled into the woods while Wiglaf fought alone now come back to the scene carrying their shields. They find Wiglaf sitting exhausted at the shoulder of his dead king. His speech to them is the most cutting in the poem: they received gold and weapons from Beowulf's hand at the ale-bench, pledged to repay with service in his need, and in the moment of need they ran. He names what the armor they are wearing meant, what the oath taken over the mead-cups was for. He does not shout. He looks at the hated ones and speaks the truth, which is worse than shouting.",
      blurb: "The ten deserters return to find Wiglaf sitting exhausted beside the two dead bodies; he delivers a cold, specific indictment of what their flight at the barrow means for the Geats.",
      summary: [
        "The dragon lies stretched nearby \u2014 the round-twisted monster can no longer guard the ring-hoards; war-swords leavings of hammers have seized it, and it bleeds into the earth. Beowulf lies dead. Wiglaf sits exhausted not far from the shoulder of the man he served. He is a foot-going fighter, having given everything he had.",
        "The ten men who ran into the thicket return. They come bearing shields and armor \u2014 the same weapons Beowulf gave them. They look at Wiglaf. Wiglaf looks at them. The poet calls them 'the hated ones' in the moment before the speech, marking the judgment that is about to be delivered.",
        "Wiglaf speaks. He says whoever will speak truth can say that the liegelord who gave those men their jewels and ornament-armor had wasted his war-gear on them. He describes the mead-bench pledges they made, the boasts they offered across the ale-cups, and the exact gap between what was promised there and what they did here. He tells them that Beowulf's death-wounds were not God's will to avenge with weapons \u2014 it was just an old man killed by a dragon \u2014 but that the shame of this flight will cling to the W\u00e6gmunding name and to theirs forever. He does not raise his voice. The cold precision is what makes it devastating.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "wiglaf",
        "name": "Wiglaf",
      }, {
        "id": "the-dragon",
        "name": "The Dragon",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }],
    },
    {
      n: 40,
      title: "Fitt XL \u2014 The Messenger of Death",
      tourTitle: "The News Goes Out",
      hook: "A messenger rides to the waiting Geat host with the news of Beowulf's death and immediately predicts what it means: the Franks and Frisians and Swedes will all move against them now.",
      tour: "Fitt XL opens with the messenger dispatched to the Geat war-troop that has been sitting above the cliffs all morning waiting for news. His announcement of Beowulf's death is in the poem's characteristic mode: he states the fact and immediately sets it in the geopolitical context that makes it catastrophic. The king of the Geats is dead. And therefore the Franks and Frisians will no longer hold back \u2014 old grudges from Hygelac's fatal Frisian raid will surface. And the Swedes, the hereditary enemies, the people who drove the Geats to Ravenswood under Ongentheow, will not stay quiet either. The messenger knows exactly what the death of one king means for a small people surrounded by enemies who have been kept out only by that king's name and reputation.",
      blurb: "A messenger announces Beowulf's death to the waiting Geat host and immediately names the consequence: the Franks, Frisians, and Swedes will all attack now that the king who held them off is gone.",
      summary: [
        "Wiglaf sends a messenger to the Geat war-troop waiting above the cliffs \u2014 the hearth-companions who have sat all morning with their shields, expecting either news of victory or news of death. The messenger rides up and tells them: the free-giving friend-lord of the folk of the Weders is dead in his death-bed. The dragon lies beside him.",
        "He does not stop at the announcement. He moves immediately to what it means. For friend and for foeman, the folk now expect a season of strife. He names the enemies in order of threat. The Franks and Frisians: old enemies since Hygelac was killed in his disastrous raid on Frisia, a battle the poem has already invoked. Hygelac's death made the Franks hostile; Beowulf's death removes the last deterrent.",
        "Then the Swedes. The messenger rehearses the history of the Swedish-Geat wars: Ongentheow and his sons, H\u00e6thcyn's death, the pursuit to Ravenswood, the reversal when Hygelac arrived. Old Ongentheow's terrifying assault on the Geat survivors in the wood is described in enough detail to make the audience feel the weight of what kept those enemies at bay. Beowulf kept them at bay. Beowulf is now dead.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "wiglaf",
        "name": "Wiglaf",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "the-hall-and-the-dark",
        "label": "The Hall and the Dark",
      }],
    },
    {
      n: 41,
      title: "Fitt XLI \u2014 The Messenger's Retrospect",
      tourTitle: "The Swedish Wars",
      hook: "The messenger details the old Swedish wars: Wulf and Eofor killing Ongentheow, Higelac's generous reward \u2014 all of it the history that explains why the Geats now have no future without Beowulf.",
      tour: "Fitt XLI is the messenger's extended retrospect on the Swedish-Geat wars, given in enough detail to function as a second poem within the poem. The death of H\u00e6thcyn at Swedish hands, the Geat pursuit to Ravenswood, the terrible night in the wood under Ongentheow's siege. Then the rescue by Hygelac and the decisive counter-battle: Wulf, Wonred's son, attacking Ongentheow and being beaten back until his brother Eofor stepped in with a giant-sword and killed the old Swedish king. Hygelac rewarded both brothers handsomely \u2014 a hundred thousand in land and rings. The generosity is emphasized because it is the model of right lordship, and because it is the past that makes the present loss legible. Beowulf was the last link in that chain of gift and loyalty.",
      blurb: "The messenger recounts the Swedish wars in full: how Eofor killed Ongentheow, how Hygelac rewarded him \u2014 the history the Geats must carry forward now without a king who can hold the Swedes back.",
      summary: [
        "The death-rush of Swedes and Geats, the messenger says, was widely noticed \u2014 how the two peoples awakened the feud with each other across the wide-stretching water. The reckoning begins with H\u00e6thcyn: killed by Ongentheow at the battle where the Swedes first assaulted the Geats in force. The Geat survivors fled to Ravenswood, surrounded.",
        "Then the decisive battle. Wulf, Wonred's son, attacked Ongentheow first. The old Swedish king was terrifying \u2014 he struck back so hard that blood burst from Wulf's head through his helmet, and Wulf fell. Eofor, Wulf's brother, stepped over the fallen man, raised a giant-sword \u2014 ancient, defense of the giants \u2014 and swept it over the shield-wall. Ongentheow fell. The folk-prince's life was cut through.",
        "Hygelac's response was correct and generous: he promised rewards to the war-rushers and gave them. Eofor and Wulf each received a hundred thousand in land and rings. Eofor was given Hygelac's only daughter as a wife. The lavish payment for a great deed was the system working. No man needed to taunt Hygelac for the gifts he gave after the battle. The messenger has told the whole history because the whole history is what dies with Beowulf.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "wiglaf",
        "name": "Wiglaf",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }],
    },
    {
      n: 42,
      title: "Fitt XLII \u2014 Wiglaf's Sad Story \u2014 The Hoard Carried Off",
      tourTitle: "The Hoard Buried Again",
      hook: "Wiglaf leads seven men into the barrow to strip the hoard; they push the dragon's body into the sea and load the gold onto a wain to carry to Hronesness for the funeral.",
      tour: "Fitt XLII is the final disposition of the hoard and the beginning of the funeral preparations. Wiglaf speaks a brief, sad address to the assembled Geats \u2014 we could not dissuade our beloved liegelord from the fight, he says, and now we must carry out what he asked. He leads seven chosen men into the barrow. A torchbearer goes first. They strip the remaining treasure: cups, platters, helmets, the ancient standard. They push the dragon's body over the cliff-edge into the sea \u2014 the wave-currents take the ward of the treasures. Then the hoard is loaded onto a wain. The noblest of men \u2014 Beowulf \u2014 is carried to Hronesness. The final line of the chapter is unadorned: there wounden gold was loaded onto a wain, a mass unmeasured, the men-leader borne off to Whale's-Ness.",
      blurb: "Wiglaf leads seven men into the barrow; the dragon is pushed into the sea, the hoard loaded onto a wain, and Beowulf's body carried to Hronesness for the pyre.",
      summary: [
        "Wiglaf speaks to the assembled Geats. He says simply: often many an earl must endure sorrow on account of one man, as has happened to us. He explains that he went into the barrow alone, fetched as much of the hoard as he could carry, and brought it back to Beowulf so the dying king could see it. He describes Beowulf's final instructions: a burial mound, broad and far-famous, to be built on the fire-hill at Hronesness.",
        "Wiglaf then organizes the work. He orders the chiefs and holders of homesteads to come from far away and gather wood for the funeral pyre. Seven men he takes personally into the barrow \u2014 the eight of them carrying firelight in. They carry out the remaining cups and platters, the helmet and the ancient standard. The barrow is stripped.",
        "The dragon's body is pushed over the wall into the sea. The wave-currents take it \u2014 the ward of the treasures, the creature that held the hoard for three hundred winters, is given to the flood with no ceremony. The gold is loaded onto a wain. Beowulf's body \u2014 the hoary hero, the men-leader, the most widely honored warrior among world-dwelling warriors while he lived \u2014 is carried to Whale's-Ness.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "wiglaf",
        "name": "Wiglaf",
      }],
      themes: [{
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }, {
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }],
    },
    {
      n: 43,
      title: "Fitt XLIII \u2014 The Burning of Beowulf",
      tourTitle: "The Funeral Pyre",
      hook: "The Geats build the largest pyre they can make, burn their king hung about with helmets and byrnies, raise a great barrow visible to sailors, and bury the hoard with him \u2014 where it remains, useless to all men ever after.",
      tour: "Fitt XLIII is the end of the poem. The funeral pyre on the headland, the smoke ascending into the sky mingled with weeping. The mound built in ten days, visible far out at sea, the brave one's beacon. The twelve horsemen who ride around the mound chanting the praise-song, calling Beowulf the kindest of kings under heaven, the gentlest of men, the most winning of manner, the friendliest to folk-troops, and the fondest of honor. And the gold: all of it buried back in the earth with him. Every ornament the earls had carried from the dragon's cave \u2014 the earnings of all those warriors \u2014 entrusted again to the dust, where it yet remains as useless as it ever was. The poem ends on that line. The treasure was buried, is buried still, useless. The argument of the poem is complete.",
      blurb: "The Geats burn Beowulf on a pyre hung with helmets and war-coats, raise a great mound at Hronesness, bury the entire hoard in his barrow, and ride around it singing his name.",
      summary: [
        "The Geats build the pyre as Beowulf asked \u2014 strong for the burning, hung about with helmets and heroes' shields and bright-shining byrnies, so that the weapons he valued would burn with him. The fire is kindled. Dark smoke ascends above the vapor, the sad-roaring fire mingled with weeping, the wind-roar subsiding as the burning goes on. The wood-smoke rises black over the bone-house until the hot heart breaks.",
        "Then the mound. In ten days the Geats raise a hill on the height \u2014 high and extensive, broad and far-famous, visible from far out at sea for sailors who need a landmark. The brave one's beacon is built where the fire had been, on the headland of Hronesness. They work for ten days and the mound is done.",
        "Twelve horsemen ride around the barrow. Warriors, battle-brave, they chant the elegy \u2014 Beowulf's deeds, his worth, the judgment of those who knew him. They call him the kindest of kings under heaven, the gentlest of men, the most winning of manner, the friendliest to folk-troops, and the fondest of honor. And the gold \u2014 all the treasure stripped from the dragon's cave, the earnings of warriors won in ancient battles \u2014 is buried with him in the barrow, entrusted to the earth, where, the poet says, it yet remains as useless to men as it ever was. That is the last line. The hoard is in the ground and always was.",
      ],
      appears: [{
        "id": "beowulf",
        "name": "Beowulf",
      }, {
        "id": "wiglaf",
        "name": "Wiglaf",
      }],
      themes: [{
        "slug": "the-long-defeat",
        "label": "The Long Defeat",
      }, {
        "slug": "gold-gift-and-the-breaking-of-bonds",
        "label": "Gold, Gift, and the Breaking of Bonds",
      }],
    },
  ],
};

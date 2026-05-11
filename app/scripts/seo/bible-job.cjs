// SEO content data for the Book of Job.
// Hebrew wisdom literature, anonymous, c. 6th-4th century BCE.
// Voice: literary, declarative present. Take the text seriously as text.

const chapters = require('/tmp/bible-job-chapters-merged.json');

module.exports = {
  id: 'bible-job',
  title: 'Job',
  author: 'Anonymous',
  byline: 'c. 6th–4th c. BCE · Hebrew Bible · Writings · Wisdom',
  titleAccent: 'a guided tour',
  hook: 'A righteous man in the land of Uz loses everything in a single afternoon — and then refuses, for thirty-five chapters, to accept any of the explanations his friends offer. The answer, when it comes, is God speaking out of a whirlwind about Behemoth and Leviathan.',

  genre: ['Wisdom literature', 'Hebrew Bible', 'Poetry', 'Drama'],

  about: [
    `<em>Job</em> opens with a wager in heaven. Ha-satan — the adversary, a member of the divine council, not the medieval devil — challenges God to test whether Job's piety is disinterested. Within two chapters Job has lost his children, his livestock, and the health of his own body. He sits in the ashes outside the city, scraping himself with a potsherd, while three friends come and sit with him in silence for seven days. Then Job opens his mouth, and one of the greatest poems ever composed begins.`,
    `From chapter 3 to chapter 31 the book is a sustained poetic dialogue: Job protests, each friend answers, Job answers back — three rounds of this, with mounting intensity. The friends articulate the orthodoxy of their tradition: God is just, the righteous prosper, the wicked suffer, therefore Job must have sinned. Job rejects it. He insists, with bitterness and beauty in equal measure, that his suffering does not fit the pattern, that the friends are physicians of no value, and that he wants his day in court. The Voice from the Whirlwind arrives in chapter 38 and speaks for four chapters — not to answer the question, but to ask seventy others. Job lays his hand upon his mouth. The book is the longest sustained protest against unmerited suffering in any ancient literature, and the argument it leaves unresolved has been going on for two and a half thousand years.`,
  ],

  chapterLabel: n => `Job ${n}`,

  chaptersSubtitle: 'All 42 chapters — from the wager in heaven to the restored ending that refuses to be tidy.',
  chaptersLead: `<p>Job moves in five large arcs. The prose prologue (chapters 1–2) sets up the wager. The poetic dialogue (3–27) runs in three rounds of debate. The wisdom hymn (28) stands alone. Job's long oath of innocence (29–31) closes his case. Elihu's interruption (32–37) fills the silence before God speaks. The Voice from the Whirlwind (38–41) is the climax. Then the epilogue (42) restores Job's fortunes in a manner the poem has made impossible to read without complication.</p>`,

  themesByline: 'Five threads through the book',
  themesLead: `Job is a theology-testing machine. It takes the central claim of ancient Near Eastern wisdom — that God is just, the righteous prosper, the wicked suffer — and runs one case through it until the claim breaks. What it finds on the other side of the breaking is not a simpler answer but a larger world.`,

  groups: [
    { label: 'Prose prologue', subtitle: 'The wager in heaven; Job loses everything and refuses to curse God.', chapters: [1, 2] },
    { label: 'Three cycles of debate', subtitle: 'Job protests; each friend answers; Job answers back — three rounds of increasing severity.', chapters: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27] },
    { label: 'Wisdom hymn', subtitle: 'Where is wisdom to be found? A poem that stands apart from the dialogue.', chapters: [28] },
    { label: "Job's monologue and oath", subtitle: "Job remembers what he was, surveys what he has become, and swears a detailed oath of innocence.", chapters: [29, 30, 31] },
    { label: 'Elihu speeches', subtitle: 'A young man who held his peace now speaks — six chapters before the whirlwind arrives.', chapters: [32, 33, 34, 35, 36, 37] },
    { label: 'The Voice from the Whirlwind', subtitle: 'God speaks for four chapters about the wild creation. Job answers twice and lays his hand upon his mouth.', chapters: [38, 39, 40, 41] },
    { label: 'Epilogue', subtitle: "Job's final word; the friends rebuked; the restoration that resolves the plot without settling the question.", chapters: [42] },
  ],

  themes: [
    {
      slug: 'the-wager-in-the-prologue',
      title: 'The wager in the prologue',
      greek: '"Doth Job fear God for nought?"',
      preview: 'The book opens with two scenes in heaven that commit it, before Job ever speaks, to a precise argument. The Satan\'s challenge is that all religion is bribery — that piety dissolves the moment the rewards are removed. The book exists to test that proposition.',
      essay: [
        `The book opens with two scenes set in heaven that commit it, before Job ever speaks, to a particular argument. In the first, the sons of God present themselves before the Lord and the Satan — ha-satan, 'the adversary,' a kind of divine prosecutor — comes among them. The Lord asks whether the Satan has considered his servant Job, blameless and upright, who fears God and turns from evil. The Satan answers with the question that the rest of the book will be obliged to investigate: 'Doth Job fear God for nought?' Hast thou not made an hedge about him, and about his house, and about all that he hath, on every side? Take that protection away, and he will curse thee to thy face.`,
        `The Lord agrees to the test, with the limit that the Satan may touch what Job has but not Job himself. Job loses everything in a single afternoon and refuses to curse God; he says only, 'The Lord gave, and the Lord hath taken away; blessed be the name of the Lord.' In the second scene the Satan returns and the test is escalated: skin for skin, all that a man hath will he give for his life. Touch his bone and his flesh. The disease comes and the wife's bitter line follows: 'Curse God and die.' Job answers, 'Shall we receive good at the hand of God, and shall we not receive evil?'`,
        `What the prologue commits the book to argue, by setting up this frame, is that the question on the table is not 'why do bad things happen to good people' in the abstract sense modern theodicy gives the question, but a more specific one: whether disinterested piety exists at all. Whether anyone serves God for any reason other than the rewards he expects. The Satan's challenge is, in effect, that all religion is bribery. The book exists to test that proposition.`,
        `The answer, by the time Job is sitting in the ashes refusing to curse God even as his friends offer him every theological consolation that would let him do so under cover, is that disinterested piety does exist — but at a cost the prologue cannot accommodate, and which the dialogue will spend the next thirty chapters describing.`,
      ],
      where: [
        { n: 1, label: 'Job 1 (the first wager)' },
        { n: 2, label: 'Job 2 (the second test)' },
        { n: 31, label: 'Job 31 (the oath of innocence)' },
        { n: 42, label: 'Job 42 (the epilogue)' },
      ],
    },
    {
      slug: 'the-friends-theology-against-jobs-experience',
      title: "The friends' theology against Job's experience",
      greek: '"Physicians of no value"',
      preview: 'The three friends are not strawmen. They articulate, with increasing severity, an orthodoxy that is coherent on its own terms. The book is the demonstration that there are situations in which a correct theology does not suffice.',
      essay: [
        `The three friends are not strawmen. Eliphaz, Bildad, and Zophar speak the wisdom of their tradition, and what they say is, on its own terms, the orthodoxy of the ancient Near Eastern wisdom literature: that the moral order of the universe is administered by a just God who rewards the righteous and punishes the wicked. The friends believe this in good faith. They also believe, with the patience of men who have seen many cases like this, that no one is wholly innocent, that suffering on Job's scale is evidence of wrongdoing somewhere, and that the proper response is humility and repentance.`,
        `Eliphaz speaks from a vision he has had: 'Shall mortal man be more just than God?' Bildad speaks from the testimony of the fathers: 'Doth God pervert judgment?' Zophar speaks from common sense: 'Know therefore that God exacteth of thee less than thine iniquity deserveth.' The arguments are sober, sometimes beautiful, and from the framework the friends share, irrefutable. Job's response is not to demolish the framework. He grants, in many of his speeches, that the framework is what he has always believed too. His complaint is that the framework does not match what has happened to him.`,
        `The book is precise about this. Job is not arguing that there is no God, or that God is unjust in principle, or that the moral order should be abolished. He is arguing that in his particular case the doctrine the friends are using to interpret his suffering does not work, and he wants to put his case to God directly. The friends, increasingly, refuse to permit this. They hear Job's protest as the noise of a man who will not accept what his suffering has revealed about him, and they harden against him over the course of the dialogue. By the third round Bildad's speech is reduced to six verses; the orthodoxy is running out of arguments.`,
        `The book's central literary achievement is that it forces the reader to feel the inadequacy of an answer that, in any other context, the reader might assent to. The friends' theology is what most religious people, most of the time, believe. The book is the long demonstration that there are situations in which it does not suffice.`,
      ],
      where: [
        { n: 4, label: 'Job 4 (Eliphaz speaks first)' },
        { n: 8, label: 'Job 8 (Bildad speaks first)' },
        { n: 11, label: 'Job 11 (Zophar speaks first)' },
        { n: 19, label: 'Job 19 (the redeemer speech)' },
      ],
    },
    {
      slug: 'the-silence-of-god',
      title: 'The silence of God',
      greek: 'Thirty-five chapters without an answer',
      preview: 'From chapter 3 through chapter 37, God does not speak. The book stages, on a scale not attempted again in the Bible, the experience of religious silence — and earns the right, by the length of the wait, to ask what the answer means when it finally comes.',
      essay: [
        `From chapter 3 through chapter 37, God does not speak. The book stages, on a scale not attempted again in the Bible, the experience of religious silence. Job calls for an audience. Repeatedly, in some of the most striking poetry in the dialogues, he imagines a court at which his case can be heard. He asks for a daysman, an arbiter, who can lay his hand on both parties — on God and on Job — and hold a hearing. He swears, in the great oath of chapter 31, that he has lived a moral life so cleanly itemised that any honest court could read the indictment. He challenges, almost demands, that God answer.`,
        `And for thirty-five chapters the answer does not come. The friends speak. Elihu speaks. Job speaks again. The whirlwind has not yet arrived. The reader waits with Job through the slow accumulation of speeches that do not satisfy and a sky that does not open. This is not, in the end, the only thing the book is doing, but it is one of the things it is doing, and it is what gives the closing theophany its weight. The God who finally speaks in chapter 38 has, by the rules of the book's own dramatic time, kept silence for the whole of Job's protest.`,
        `The silence is not denial; it is not absence; it is the texture of the book's middle. When the Voice does come, what it says is shaped by the long delay. The book has earned the right to ask whether God's reply, when at last delivered, answers the question that has been asked, or whether it changes the question, or whether the act of speaking at all is itself the answer. The reader who has not sat through the silence cannot fairly judge what is given when the silence breaks.`,
      ],
      where: [
        { n: 3, label: 'Job 3 (Job breaks silence)' },
        { n: 19, label: 'Job 19 (I know that my redeemer liveth)' },
        { n: 31, label: 'Job 31 (the oath; waiting for reply)' },
        { n: 38, label: 'Job 38 (the whirlwind breaks)' },
      ],
    },
    {
      slug: 'the-voice-from-the-whirlwind',
      title: 'The Voice from the Whirlwind',
      greek: '"Where wast thou when I laid the foundations of the earth?"',
      preview: 'When God finally speaks, the answer is not an explanation. It is a tour of the wild creation — seventy questions about the foundations of the earth, the constellations, the wild ass, the war horse, Behemoth, and Leviathan.',
      essay: [
        `When God finally speaks, in chapter 38, the answer is not an explanation. It is a tour of the wild creation. The Lord answers Job out of the whirlwind and asks him where he was when the foundations of the earth were laid; who shut up the sea with doors when it brake forth as if it had issued out of the womb; who has commanded the morning since the days began; who can bind the sweet influences of Pleiades, or loose the bands of Orion; who provides for the raven his food when his young ones cry to God and wander for lack of meat.`,
        `The questions accelerate. The wild ass, scornful of the city, hearing not the crying of the driver. The wild ox, who will not consent to wear thy harness. The ostrich, who leaves her eggs in the earth and warmeth them in dust, hardened against her young as though they were not hers. The horse who paweth in the valley and rejoiceth in his strength, who saith among the trumpets, Ha, ha. The eagle who dwelleth on the rock, whose eyes behold afar off. Then, in chapters 40 and 41, two great speeches on Behemoth and Leviathan — both depicted as figures God controls and Job cannot.`,
        `The speech is one of the most magnificent passages of nature writing in any language, and it is structured as an argument: the world Job is asking the moral order to be intelligible within is a world he has not made, does not understand, and cannot administer. The answer is not that Job's suffering is justified. The answer is not that Job has sinned. The answer, if the speech contains an answer, is that the world is larger than the doctrine the friends were using to read it; that the wild creation is full of creatures whose existence has nothing to do with human moral economy; and that the same God who has not protected Job from his suffering has also not failed to govern the wild ass and the eagle and the sea.`,
        `Whether this is consolation, evasion, or theological breakthrough has been argued ever since. What can be said with confidence is that the speech is the longest sustained piece of nature poetry in the Hebrew Bible and that Job, when it ends, lays his hand upon his mouth.`,
      ],
      where: [
        { n: 38, label: 'Job 38 (the whirlwind begins)' },
        { n: 39, label: 'Job 39 (the wild creatures)' },
        { n: 40, label: 'Job 40 (Behemoth; Job\'s first answer)' },
        { n: 41, label: 'Job 41 (Leviathan)' },
      ],
    },
    {
      slug: 'the-restored-ending-and-what-it-leaves-unsettled',
      title: 'The restored ending and what it leaves unsettled',
      greek: '"The Lord turned the captivity of Job"',
      preview: 'The book closes with a prose paragraph that has divided readers for two and a half thousand years. Job is restored twofold. New children are born. Job dies old and full of days. The ending resolves the plot while leaving everything that matters permanently open.',
      essay: [
        `The book closes with a prose paragraph that has divided readers for two and a half thousand years. After the whirlwind, the Lord rebukes the friends — 'my wrath is kindled against thee, and against thy two friends; for ye have not spoken of me the thing that is right, as my servant Job hath' — and instructs them to bring sacrifices that Job will offer for them. Job prays for them and is heard.`,
        `Then, in a sentence the King James renders with the slight hesitation it earns, the Lord turned the captivity of Job and gave him twice as much as he had before. His brothers and sisters and former acquaintances come and eat bread with him in his house and bemoan him and comfort him. He is given fourteen thousand sheep, six thousand camels, a thousand yoke of oxen, a thousand she-asses, seven new sons and three new daughters — Jemimah, Keziah, and Keren-happuch, the most beautiful women in all the land, who are given inheritance among their brothers. Job lives a hundred and forty years, sees four generations, and dies old and full of days.`,
        `The reader who has come through the dialogues and the whirlwind has to decide what to do with this ending. One reading is that the restoration is consolation: the just suffer, and they are afterwards restored, and the moral order has been ratified. A second reading is that the restoration is the problem: that the children who died in chapter 1 cannot be replaced by new children in chapter 42, and that the prose ending sits in a deliberately uncomfortable relation to the whirlwind speech that preceded it. A third reading, which has accumulated through Christian, Jewish, and modern interpretation alike, is that both are true at once — that the restoration is real and inadequate, that the children are real and irreplaceable, that what the book finally gives the reader is the experience of holding both at once.`,
        `What no reading has been able to do is make the ending tidy. Job is a book that refuses the consolations of its own resolution, and the prose epilogue is the last refusal — disguised as the thing it most resembles, which is closure.`,
      ],
      where: [
        { n: 1, label: 'Job 1 (the first children)' },
        { n: 38, label: 'Job 38 (the whirlwind)' },
        { n: 42, label: 'Job 42 (the restoration)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Job', role: 'the sufferer of the land of Uz', body: `A man from the land of Uz, east of Israel — not an Israelite. Introduced as tam ve-yashar, complete and upright. Father of seven sons and three daughters, owner of prodigious wealth, the greatest of all the men of the east. Loses everything in a single afternoon. From chapter 3 forward he is the speaker of the most sustained protest against unmerited suffering in any ancient literature — theologically literate, demanding, refusing his friends' explanations, insisting on his innocence until the Voice arrives. When the Voice finally comes, he answers twice and lays his hand upon his mouth. The figure on whom every later argument about innocent suffering has had to position itself.` },
    { name: 'The Three Friends', role: 'Eliphaz, Bildad, and Zophar', body: `Three sages from the wisdom traditions of the surrounding peoples — not Israelites. Eliphaz the Temanite, Bildad the Shuhite, Zophar the Naamathite. They sit with Job in silence for seven days, then spend twenty-five chapters articulating the doctrine of retribution with increasing severity: God is just, the righteous prosper, the wicked suffer, therefore Job must have sinned. The book takes care to make the reader feel the force of what they say. In the epilogue God rebukes them, not Job.` },
    { name: 'Elihu', role: 'the young interlocutor', body: `Appears for the first time in chapter 32, younger than the friends, with a six-chapter speech that has no parallel in the rest of the book. He waited because of deference; now his anger is kindled against Job for justifying himself rather than God, and against the friends for failing to answer Job. He develops a theology of suffering as instruction. He does not appear in the prologue or the epilogue and is not rebuked. Whether his speeches advance the argument or interrupt it is one of the perennial questions of Job interpretation.` },
    { name: 'The Satan', role: 'ha-satan, the adversary', body: `Ha-satan in the Hebrew, 'the adversary' or 'the accuser,' with the definite article, not yet the proper name of the medieval devil. A member of the divine council who comes before the Lord with the other sons of God. His function is closer to that of a divine prosecutor. He proposes the test — 'Doth Job fear God for nought?' — and exits the narrative after chapter 2. He does not return. The later identification with the figure of evil is not native to this book.` },
    { name: 'The Voice from the Whirlwind', role: 'God answering out of the storm', body: `The figure who speaks in chapters 38 to 41. Comes out of the whirlwind, asks Job seventy questions about the wild creation, and never directly addresses the question Job has been asking for thirty-five chapters. Speaks the longest sustained piece of nature poetry in the Hebrew Bible. Job, when the speech ends, lays his hand upon his mouth and repents in dust and ashes — not of the sins the friends charged him with, but of speaking without understanding the scale of what he was addressing.` },
    { name: "Job's Wife", role: 'the one line she is given', body: `She has only one line: 'Dost thou still retain thine integrity? Curse God, and die.' The line has been read every way it can be read — as temptation, as mercy, as the rage of a woman who has lost the same children Job has lost and is given less screen time to grieve them. The book does not adjudicate. She is one of the great unspoken figures in the Hebrew Bible, and the line she does speak is one of the lines no pious reading can domesticate.` },
  ],

  castSubtitle: 'The land of Uz — a blameless man, a divine adversary, three unhelpful friends, and a God who speaks from a storm.',
  castLead: `<p>Job has a small named cast: the protagonist, his wife, three friends, a young latecomer, the Satan in the divine council, and finally the Voice from the Whirlwind. The book's dramatic power comes from the fact that almost all of it is dialogue — voices arguing with each other across thirty-nine chapters before the storm breaks.</p>`,

  castGroups: [
    {
      label: 'The protagonist',
      characters: [
        {
          id: 'job',
          tag: 'Sufferer',
          name: 'Job',
          epithet: 'Blameless man of the land of Uz',
          body: `The greatest of all the men of the east, introduced as tam ve-yashar — complete and upright. He loses everything in chapters 1–2 and then, from chapter 3 forward, becomes the speaker of the most sustained protest against unmerited suffering in any ancient literature. He demands an audience he is not granted for thirty-five chapters. When the Voice finally comes, he answers twice: first laying his hand upon his mouth, then confessing that he spoke of things too wonderful for him, things he did not know. In the epilogue he prays for the friends who condemned him and is restored twofold.`,
          appears: [1, 2, 3, 6, 7, 9, 10, 12, 13, 14, 16, 17, 19, 21, 23, 24, 26, 27, 28, 29, 30, 31, 40, 42],
        },
        {
          id: 'jobs-wife',
          tag: 'Witness',
          tagClass: 'creature',
          name: "Job's Wife",
          epithet: 'One line; no name',
          body: `She speaks once: 'Dost thou still retain thine integrity? Curse God, and die.' The line has been read as temptation, as mercy, and as the grief of a woman who has lost the same children Job has lost and is given far less space to grieve them. The book does not adjudicate. She is assumed by the rabbis to reappear in the closing paragraph as the mother of the seven new sons and three new daughters, but she is never named.`,
          appears: [2, 42],
        },
      ],
    },
    {
      label: 'The three friends',
      characters: [
        {
          id: 'the-three-friends',
          tag: 'Theologians',
          name: 'Eliphaz, Bildad, and Zophar',
          epithet: 'Three sages who sit in silence, then speak too much',
          body: `Eliphaz the Temanite, Bildad the Shuhite, Zophar the Naamathite. They come from their own countries, agree to meet, and sit with Job in silence for seven days and seven nights. Then, in three rounds of speeches, they articulate the doctrine of retribution with increasing severity. The book takes care to make the reader feel the force of what they say — their speeches are not stupid. In the epilogue God tells them they have not spoken of him the thing that is right, as his servant Job has, and instructs them to bring sacrifices and have Job pray for them.`,
          appears: [2, 4, 5, 8, 9, 11, 15, 18, 20, 22, 25, 42],
        },
      ],
    },
    {
      label: 'The late speaker',
      characters: [
        {
          id: 'elihu',
          tag: 'Interlocutor',
          name: 'Elihu',
          epithet: 'The young man who held his peace',
          body: `Appears for the first time in chapter 32, with a six-chapter speech that has no parallel elsewhere in the book. He held his peace out of deference to his elders; now he speaks, angry at Job for justifying himself rather than God, and angry at the friends for failing to answer Job. He develops a theology of suffering as divine instruction and disciplinary formation. He is not rebuked in the epilogue; the Voice from the Whirlwind arrives immediately after he stops speaking. Many scholars regard the Elihu material as a later editorial insertion. Whether his speeches advance the argument or interrupt it has been argued since the book first circulated.`,
          appears: [32, 33, 34, 35, 36, 37],
        },
      ],
    },
    {
      label: 'The heavenly figures',
      characters: [
        {
          id: 'the-satan',
          tag: 'Adversary',
          tagClass: 'creature',
          name: 'The Satan',
          epithet: 'Ha-satan — the accuser in the divine council',
          body: `Ha-satan, 'the adversary,' with the definite article — not the proper name of the medieval devil but a title for a role: divine prosecutor. He comes before the Lord with the other sons of God, proposes the wager ('Doth Job fear God for nought?'), and is given permission to test Job under successive constraints. He exits the narrative after chapter 2 and does not return. His function in the book is to ask a question the book is then committed to answer.`,
          appears: [1, 2],
        },
        {
          id: 'the-voice-from-the-whirlwind',
          tag: 'Divine',
          tagClass: 'creature',
          name: 'The Voice from the Whirlwind',
          epithet: 'God answering out of the storm',
          body: `Speaks in chapters 38 to 41. Comes out of the whirlwind, asks Job seventy questions about the wild creation — the foundations of the earth, the sea, the constellations, the wild ass, the war horse, Behemoth, Leviathan — and never directly addresses the question Job has been asking for thirty-five chapters. The speech is the longest sustained piece of nature poetry in the Hebrew Bible. Job, when it ends, lays his hand upon his mouth.`,
          appears: [38, 39, 40, 41],
        },
      ],
    },
  ],

  chapters,
};

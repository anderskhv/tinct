// SEO content data for Charles Dickens's Great Expectations (1861).
// Fifty-nine chapters across three volumes. Serialized weekly in All the Year Round.
// The shortest of his major novels and the only first-person narrator he sustained at length apart from Copperfield.

module.exports = {
  id: 'great-expectations',
  title: 'Great Expectations',
  author: 'Charles Dickens',
  byline: '1861 · Victorian English novel',
  titleAccent: 'a guided tour',
  hook: 'An orphan boy meets a convict in a graveyard on Christmas Eve. Twenty years later, everything he has built with his mysterious fortune traces back to that one act of frightened kindness.',
  genre: ['Novel', 'Victorian fiction', 'Bildungsroman'],

  about: [
    `<em>Great Expectations</em> is the story of Pip — orphan, blacksmith's apprentice, London gentleman, and finally a man who has learned what his life was actually made of. It opens in a Kent churchyard in winter, where a seven-year-old boy is seized by an escaped convict and terrified into bringing him food and a file. It ends, decades later, in the ruins of the mansion where a jilted woman has spent her life taking revenge on the male sex through a girl she raised to be incapable of love. In between, Dickens constructs the most precisely argued attack on Victorian class mobility in the language.`,
    `The novel's formal achievement is its narrator. The older Pip looks back at the younger one — his snobbery, his wasted years, the people he abandoned for the sake of an identity that turned out to have been built on a transported convict's gratitude — with a painful and unsparing clarity. Dickens allows the reader to see what Pip is doing before Pip can see it himself, and the sustained dramatic irony, held for fifty-nine chapters, is the technique that would teach the modern novel what kind of pressure first-person narration could carry.`,
  ],
  chaptersSubtitle: 'All 59 chapters — from the convict in the churchyard to the evening mists at Satis House.',
  chaptersLead: `<p>Great Expectations is structured as three volumes — Dickens's "Three Stages of Pip's Expectations." Stage One (Chapters 1–19) is the marshes, the forge, Satis House, and the announcement. Stage Two (Chapters 20–39) is London, the apprenticeship to gentility, and the great reveal at the end of Chapter 39. Stage Three (Chapters 40–59) is the unwinding: Magwitch in London, the escape attempt, his death, Pip's fever, and the return to Joe. The meaning of the early chapters depends on the late ones.</p>`,
  themesByline: 'Five threads through the novel',
  themesLead: `Great Expectations is a novel that teaches the reader to read it twice. The meaning of the opening chapters — the convict, the forge, the churchyard — is not available on first reading. It only becomes available when the truth arrives in Chapter 39, and by then every earlier scene must be re-read in a different light.`,

  groups: [
    {
      label: 'Stage One · The marshes and the house',
      subtitle: 'Chapters 1–19: the convict, Satis House, and the announcement of the fortune.',
      chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    },
    {
      label: 'Stage Two · London',
      subtitle: 'Chapters 20–39: the apprenticeship to gentility, and the truth about who paid for it.',
      chapters: [
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
      ],
    },
    {
      label: 'Stage Three · The unwinding',
      subtitle: 'Chapters 40–59: Magwitch, the escape, the fever, and the return home.',
      chapters: [
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
      ],
    },
  ],

  themes: [
    {
      slug: 'gentility',
      title: 'The fraud of gentility',
      greek: 'what the gentleman\'s life is actually built on',
      preview: 'Pip\'s central ambition, from the first visit to Satis House onward, is to become a gentleman. The novel spends fifty-nine chapters dismantling what that aspiration actually contains. The answer, delivered in Chapter 39, is both precise and devastating.',
      essay: [
        `Pip's central ambition, from the first visit to Satis House onward, is to become a gentleman. The word organizes everything he does for the next decade and a half. He is ashamed of his coarse hands and thick boots when Estella points them out; he is ashamed of Joe's dialect and his sister's manners; he is ashamed of the forge itself when he first sees it through Estella's eyes. The mysterious legacy from his unknown benefactor is supposed to fix this — to remove him from the village, to dress him in fine clothes, to teach him the manners of London society, to qualify him as the kind of man Estella might marry.`,
        `Dickens spends the novel systematically dismantling what that aspiration actually contains. The gentlemen of London, when Pip meets them, turn out to be either casually cruel (Bentley Drummle), pretentious nonentities (the Pocket relations), or trapped in lives of unproductive consumption (Pip himself, by Volume Two, is in debt and bored). The qualification of being a gentleman is in fact the absence of useful work, the inheritance of someone else's money, and a manner that distinguishes you from people who do work and have earned their bread.`,
        `The whole construction is parasitic, and the cleverness of the novel is that the parasite, in Pip's case, turns out to be feeding on a transported convict's gratitude. When Magwitch reveals himself in Chapter 39 as the source of the gentleman's fortune, the gentleman's life Pip has been building reveals itself as an extension of exactly the kind of person Pip's gentility had been distancing him from.`,
        `The class system Pip has been climbing is shown, in the same instant, to be sustained by money flowing from the lowest layers up — the rural poor, the criminal classes, the convicts shipped to Australia — into the leisure of the polished few. Dickens does not editorialize on the point. He lets the plot make the argument, and the plot's argument is the most precise indictment of Victorian class in any English novel of the century.`,
      ],
      where: [
        { n: 8, label: 'Chapter 8 (Estella names the shame)' },
        { n: 18, label: 'Chapter 18 (the fortune announced)' },
        { n: 34, label: 'Chapter 34 (Pip in debt, drift)' },
        { n: 39, label: 'Chapter 39 (the great reveal)' },
      ],
    },
    {
      slug: 'narrator',
      title: 'The voice of the older Pip',
      greek: 'reliable on facts, unreliable on meanings',
      preview: 'The narrator is the older Pip, looking back from years later on everything he had wanted. He does not make excuses. He also does not condemn. The gap between what the older voice understands and what the younger boy was doing is the form the novel takes.',
      essay: [
        `<em>Great Expectations</em> is the only Dickens novel apart from <em>David Copperfield</em> that he sustains in the first person across its full length, and the technical achievement of the voice is the form of the book. The narrator is the older Pip, looking back from a distance of perhaps ten or fifteen years on the events he is describing. The voice is wry, ironic about itself, ashamed of what it used to want, exact about its own snobbery. It does not make excuses for the younger Pip. It also does not condemn him in language harsher than the events themselves are already supplying.`,
        `The result is a sustained dramatic irony that runs almost to the end of the novel. The reader sees Pip's snobbery before Pip can see it; the reader sees Pip's affection for Joe before Pip will admit it to himself; the reader sees the small daily cruelties Pip is committing — the cooled welcomes, the avoidances, the one or two evenings he could have spent at the forge and did not — at the moment Pip is committing them, but with the older Pip's quiet acknowledgement framing each.`,
        `The technique allowed Dickens to do something he had not quite done before: let a reader watch a single character become wrong about his own life in real time. First-person narrators in English fiction before <em>Great Expectations</em> were generally either unreliable in the ironic-comic mode (Sterne's Tristram Shandy) or earnestly autobiographical (Defoe's Robinson Crusoe, Dickens's own David Copperfield). Pip is something new. He is reliable about facts and unreliable about meanings, and his older self is the silent reader of his younger self.`,
        `The technique would become the dominant form of the modern novel after 1900 — Henry James, Conrad, Proust, Ford Madox Ford, the entire tradition of the unreliable first-person narrator — and <em>Great Expectations</em> is one of the books that taught the form what kind of pressure it could carry. The voice is what holds the moral weight of the novel that no nineteenth-century third-person narrator could have carried without sermonizing.`,
      ],
      where: [
        { n: 1, label: 'Chapter 1 (the older Pip establishes his voice)' },
        { n: 14, label: 'Chapter 14 (ashamed of the forge)' },
        { n: 27, label: 'Chapter 27 (Joe in London)' },
        { n: 57, label: 'Chapter 57 (the fever and the reckoning)' },
      ],
    },
    {
      slug: 'cost',
      title: 'What becoming a gentleman costs',
      greek: 'the people Pip leaves behind',
      preview: 'Pip spends most of the novel trying to leave the people who raised him. Dickens is unflinching about what that distance does to the people Pip has abandoned — and what it does to Pip himself.',
      essay: [
        `Pip stops visiting Joe at the forge after he goes to London. When Joe travels up to London once to bring Pip news, Pip is embarrassed by his old clothes and rough manners and addresses him with a stiffness Joe registers and accepts without complaint, and the visit ends with Joe saying it has been a pleasure and going home alone. Pip cannot quite bring himself to write home; he sends money instead, and Biddy writes back politely on Joe's behalf and Pip resents the politeness. He misses his sister's funeral and arrives the day after.`,
        `Dickens is unflinching about what that distance does to the people Pip has abandoned and what it does to Pip himself — the small daily cruelties, the way shame poisons even his attempts at decency, the way the gentleman's life he is building requires, for its psychological coherence, that he keep on cooling toward people whose love for him is the firmest thing in his life.`,
        `When the truth about Magwitch arrives in Chapter 39, the gentleman's life Pip had been building reveals itself as a debt to a transported convict, paid in his own contempt for everyone who had actually loved him, and the moral weight is more than the structure can carry. Pip falls into a fever, is nursed back to a kind of life by Joe — who has come up to London on the news of his illness, paid his debts, and quietly gone home before Pip is well enough to thank him — and goes home to find Joe and Biddy married.`,
        `The novel is the most honest portrait in Victorian fiction of class mobility as a moral injury rather than a triumph. It is the book to read on what is lost when someone leaves where they came from for somewhere supposedly better.`,
      ],
      where: [
        { n: 19, label: 'Chapter 19 (farewell to the marshes)' },
        { n: 27, label: "Chapter 27 (Joe's visit to London)" },
        { n: 35, label: "Chapter 35 (Mrs. Joe's funeral)" },
        { n: 57, label: 'Chapter 57 (Joe nurses Pip through the fever)' },
      ],
    },
    {
      slug: 'havisham',
      title: 'Miss Havisham and the transmission of trauma',
      greek: 'what one person does to a child to carry a wound on the parent\'s behalf',
      preview: 'Miss Havisham was jilted at the altar in her youth. She has spent the decades since wearing her wedding dress, stopping every clock, and raising a girl to break men\'s hearts. The novel is exact about what this system costs everyone inside it.',
      essay: [
        `Miss Havisham was jilted at the altar in her youth — the bridegroom failed to appear at twenty to nine on her wedding morning — and has spent the decades since wearing her wedding dress, leaving the cake on the table, and stopping every clock in the house at the moment of the news. She has also raised, as her adopted daughter, a girl named Estella, whom she has taught from earliest childhood to be beautiful, cold, and incapable of love.`,
        `The whole apparatus is a long act of vengeance against the male sex generally and the bridegroom in particular, conducted by training a young woman to make men fall for her and then to break them. The novel is exact about what this system costs everyone inside it. Miss Havisham herself, by the end, is broken open by what she has done — when Estella tells her with absolute clarity that she will love no one, Miss Havisham realizes that the daughter she has raised is incapable of loving even her.`,
        `Estella, who has been formed by the system and who tells Pip plainly and repeatedly that she has no heart to give him, is the most honest character in the book about what she is — a young woman who has been turned into a weapon and who knows it. Her marriage to the brutal Bentley Drummle is the entirely predictable consequence of her formation.`,
        `Dickens's portrait is the deepest in nineteenth-century fiction of the way trauma passes between generations through the mechanism of revenge — what one person does to a child to make the child carry a wound on the parent's behalf. The novel's quiet insistence is that the system can be partially understood by Estella in the closing chapters, and partially disrupted, but not undone. The transmission can be interrupted. It cannot be reversed.`,
      ],
      where: [
        { n: 8, label: 'Chapter 8 (first visit to Satis House)' },
        { n: 38, label: 'Chapter 38 (Estella tells Havisham she cannot love)' },
        { n: 44, label: 'Chapter 44 (Pip confronts Miss Havisham)' },
        { n: 49, label: 'Chapter 49 (Miss Havisham burns)' },
      ],
    },
    {
      slug: 'reveal',
      title: 'The reveal that reorganizes everything',
      greek: 'Chapter 39 — the most consequential turn in Victorian fiction',
      preview: 'For the first thirty-eight chapters, the reader, like Pip, is allowed to believe that Miss Havisham is the benefactor. Then an old man climbs the stairs out of the rain, and everything that came before must be read again.',
      essay: [
        `For the first thirty-eight chapters of <em>Great Expectations</em>, the reader, like Pip, is allowed to believe that Miss Havisham is his secret benefactor and Estella his intended bride. The structure of the plot encourages the reading: Miss Havisham summoned Pip as a child, her lawyer is Jaggers who is also Pip's lawyer, the timing of the legacy seems to fit. Then in Chapter 39, on a stormy night in Pip's London chambers, an old man climbs the stairs out of the rain, and Pip recognizes the convict from the marshes.`,
        `Magwitch has come back to England illegally, on pain of execution if discovered, to see what his money has made of Pip. The truth, in the next thirty pages, restructures every chapter that came before. The opening encounter on the marshes is no longer a frightening prologue but the foundational debt of Pip's whole adult life. The convict's gratitude for a piece of pork pie and a file, treasured for sixteen years in the Australian sheep country, has been the engine of Pip's gentility.`,
        `Miss Havisham has been using Pip — but as a piece of cruelty against her own male relations and against the entire male sex, not as Estella's intended husband. The plot's whole previous logic falls away. The moral consequence is that Pip's gentlemanly identity was built on a stranger's gratitude rather than on a romance, and the gratitude was attached to a man Pip would have been, only weeks earlier, ashamed to know.`,
        `Dickens then does the harder thing. He makes Pip realize what Magwitch is — a man who has loved him from a distance for sixteen years, who has thought of him every day in the sheep country, who has come back to England to risk hanging just to see him — and lets the love work on Pip slowly across the closing chapters, until by Magwitch's death in the prison hospital Pip is sitting by his bed holding his hand. The novel teaches the reader to read it twice. The second reading, knowing where the money came from, is a different book from the first.`,
      ],
      where: [
        { n: 1, label: 'Chapter 1 (the convict in the churchyard)' },
        { n: 18, label: 'Chapter 18 (Jaggers announces the fortune)' },
        { n: 39, label: 'Chapter 39 (Magwitch returns)' },
        { n: 56, label: 'Chapter 56 (Magwitch dies)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Pip',
      role: 'The narrator',
      body: `Philip Pirrip, called Pip from infancy because his own tongue could make of his names nothing longer. An orphan boy raised on the Kent marshes by his much older sister and her husband Joe the blacksmith. Bright, ashamed of his origins from his first visit to Miss Havisham, and desperately susceptible to flattery — a moral weakness Dickens treats with the precision of a writer who has known it from inside. He tells the story years later from the other side of the experience it describes, and the tension between the older voice and the younger boy is the form of the book.`,
    },
    {
      name: 'Abel Magwitch',
      role: 'The true benefactor',
      body: `The escaped convict in the opening chapter, terrified and starving, who threatens Pip into bringing him a file and a piece of pork pie on Christmas Eve. He never forgets the kindness. Transported to Australia for life, he makes a substantial fortune in sheep-farming over sixteen years and devotes it secretly to making Pip a gentleman. When he returns to London illegally in Chapter 39 — on pain of death if discovered — the truth of where Pip's money came from rewrites everything. His gradual transformation in Pip's eyes from monster to the closest friend Pip will ever have is the novel's moral spine.`,
    },
    {
      name: 'Estella',
      role: "Havisham's weapon",
      body: `Adopted as a young child by Miss Havisham and raised in a closed house to be beautiful, cold, and incapable of love. She tells Pip plainly, again and again, that she has no heart to give him; he refuses to believe her. The novel reveals that her mother is Molly, the housekeeper at Jaggers's office, and her father is Magwitch — a piece of plot that knits together the book's whole social geography. She is not responsible for what she has been made into, and her clarity about her own coldness is its own kind of integrity.`,
    },
    {
      name: 'Miss Havisham',
      role: 'Grief frozen into cruelty',
      body: `A wealthy spinster, jilted at the altar in her youth at twenty to nine in the morning, who has worn her wedding dress and left the cake on the table for decades. Every clock in Satis House is stopped at the moment of the news. She has raised Estella expressly to take revenge on the male sex by making them love a girl who cannot love back. Her tragedy is that her revenge has worked too well: by the time Estella is grown, Estella will not love her either, and the system has consumed its own author.`,
    },
    {
      name: 'Joe Gargery',
      role: 'The blacksmith',
      body: `Pip's brother-in-law, who married Pip's much older sister and then quietly raised the boy as his own. A giant of a man, illiterate, gentle, completely without ambition or pretension. Pip is ashamed of him in London and avoids him for years; Joe registers the shame, accepts it, and never holds it against him. When Pip falls ill at the catastrophe of his great expectations, Joe comes up to London, nurses him through the fever for weeks without a word of reproach, quietly pays Pip's debts, and goes home before Pip is well enough to thank him. He is the standard by which Dickens measures everyone else in the novel.`,
    },
    {
      name: 'Herbert Pocket',
      role: 'The true friend',
      body: `Pip's London roommate, a cheerful young man whose financial schemes never come off and whose engagement to Clara Barley stretches across years of patient waiting. He is also the only person in London who likes Pip for who he is rather than what he might become. Pip secretly arranges an investment that sets Herbert up in a merchant partnership — the one genuinely good thing Pip does with his great expectations — and Herbert never learns it was him. By the end of the novel Herbert has married Clara, gone to Cairo, and given Pip a job.`,
    },
  ],

  castSubtitle: 'The marshes, the mansion, and the London chambers.',
  castLead: `<p>Great Expectations has a relatively tight cast for Dickens — about thirty named figures, clustered around three worlds: the Kent marshes (Joe, Biddy, Orlick), Satis House (Miss Havisham, Estella, the Pocket relations), and London (Jaggers, Wemmick, Herbert, Magwitch). The action of the novel is the slow revelation of connections between worlds that Pip had assumed were separate.</p>`,
  castGroups: [
    {
      label: 'The forge and the marshes',
      characters: [
        {
          id: 'pip',
          tag: 'Narrator',
          name: 'Pip',
          epithet: 'The orphan of the marshes',
          body: `Philip Pirrip, called Pip from infancy. An orphan raised by his sister and Joe the blacksmith at the forge on the Kent marshes. The novel is his retrospective narration from middle age of how completely wrong he was — about where his money came from, about Estella, and about the people he was leaving behind. Dies, in the structural sense, as a gentleman, and is reborn as a man with debts paid and no illusions left.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        },
        {
          id: 'joe',
          tag: 'Moral',
          name: 'Joe Gargery',
          epithet: 'The blacksmith',
          body: `Pip's brother-in-law and surrogate father. Illiterate, gentle, completely without pretension. Calls Pip "old chap" with helpless affection throughout the novel. Pip is ashamed of him in London. Joe registers the shame, never holds it against him, nurses Pip through the fever, pays his debts, and goes home before Pip can thank him. Marries Biddy in the closing chapters. They name their son Pip.`,
          appears: [2, 3, 4, 5, 6, 7, 13, 14, 15, 16, 17, 18, 19, 27, 35, 57, 58, 59],
        },
        {
          id: 'biddy',
          tag: 'Moral',
          name: 'Biddy',
          epithet: 'The village schoolmistress',
          body: `A quiet, capable young woman who was Pip's childhood friend at the village school and then came to help at the forge after Mrs. Joe's accident. She sees Pip clearly and tells him so, gently and without cruelty. Pip imagines at one point that she would make a sensible wife — a fallback plan he never quite asks for. She marries Joe in the closing chapters. She was always the right answer to the question Pip kept asking in the wrong places.`,
          appears: [17, 19, 35, 57, 58, 59],
        },
        {
          id: 'orlick',
          tag: 'Threat',
          tagClass: 'creature',
          name: 'Orlick',
          epithet: 'Joe\'s journeyman',
          body: `Joe's journeyman blacksmith at the forge, sullen and dangerous from his first appearance. He is almost certainly responsible for the attack on Mrs. Joe in Chapter 15, though it is never directly proven. He resurfaces in Chapter 53 in the old sluice house on the marshes, where he has Pip tied up and means to kill him — a scene of almost Gothic intensity in an otherwise realistic novel. His grudge against Pip is the novel's darkest underside.`,
          appears: [15, 16, 30, 53],
        },
      ],
    },
    {
      label: 'Satis House',
      characters: [
        {
          id: 'havisham',
          tag: 'Wound',
          tagClass: 'creature',
          name: 'Miss Havisham',
          epithet: 'Grief frozen into cruelty',
          body: `A wealthy spinster, jilted at the altar in her youth at twenty to nine in the morning. Every clock in Satis House stopped at that moment. Her wedding dress still on. The cake still on the table, decaying for decades. She summoned Pip to the house when he was a child to begin training Estella on him. The late scene in which she begs Pip's forgiveness on her knees is one of Dickens's most painful pages. She dies in a fire set by a stray ember before her rotting wedding cake.`,
          appears: [8, 9, 11, 12, 13, 29, 33, 38, 44, 49],
        },
        {
          id: 'estella',
          tag: 'Formed',
          name: 'Estella',
          epithet: "Havisham's weapon",
          body: `Adopted as a young child by Miss Havisham and raised to be beautiful, cold, and incapable of love. She tells Pip plainly and repeatedly that she has no heart to give him. Her parents, revealed in the closing sections, are Molly the housekeeper (defended by Jaggers on a murder charge) and Abel Magwitch the convict — a fact that knits together the whole social world of the novel. She marries Bentley Drummle; he treats her badly; she is widowed. In the final scene at Satis House she and Pip meet again, and the encounter is the most carefully balanced scene in Dickens.`,
          appears: [8, 9, 11, 12, 29, 33, 38, 44, 59],
        },
        {
          id: 'pocket-family',
          tag: 'Relation',
          name: 'The Pocket relations',
          epithet: "Miss Havisham's heirs-apparent",
          body: `A group of Miss Havisham's distant relatives who circle Satis House in hope of a legacy — Camilla, Georgiana, Cousin Raymond, and Sarah Pocket. They fawn on Miss Havisham without quite concealing their calculations. Dickens uses them as the prototype of what the gentleman's world looks like from the inside: pretentious, idle, and parasitic on inherited money they have not earned and will not receive.`,
          appears: [11, 25],
        },
      ],
    },
    {
      label: 'London',
      characters: [
        {
          id: 'magwitch',
          tag: 'Benefactor',
          name: 'Abel Magwitch',
          epithet: 'The true benefactor',
          body: `The escaped convict from Chapter 1, who returns to London in Chapter 39 as the old man "Provis" to reveal that he, not Miss Havisham, has been Pip's benefactor all along. Transported to Australia after his recapture, he made a fortune in sheep-farming and spent it on making Pip a gentleman. His love for Pip, from a distance of sixteen years, is the most uncomplicated thing in the novel. Dies in the prison hospital after the failed escape attempt down the Thames, with Pip holding his hand.`,
          appears: [1, 3, 5, 39, 40, 41, 42, 43, 45, 46, 47, 54, 55, 56],
        },
        {
          id: 'jaggers',
          tag: 'Lawyer',
          name: 'Mr. Jaggers',
          epithet: 'The lawyer who knows everything',
          body: `The London lawyer who acts as intermediary between Magwitch and Pip, and between almost everyone else in the novel who has a secret to protect. He defended Molly on a murder charge and took her into service. He adopted Estella on Magwitch's behalf and placed her with Miss Havisham. He knows more about the connections between characters than any of them know about each other. His habit of washing his hands between clients is both literal and figurative. He never lies; he simply never volunteers anything.`,
          appears: [18, 20, 24, 26, 36, 51],
        },
        {
          id: 'wemmick',
          tag: 'Double life',
          name: 'Wemmick',
          epithet: "Jaggers's clerk",
          body: `Jaggers's cheerful clerk at Little Britain, who is one person at work (dry, practical, a collector of "portable property") and a completely different person at home, in his eccentric fortified cottage in Walworth that he calls the Castle, where he keeps an "Aged Parent" and a garden and a drawbridge. The division is comic but also the novel's most sympathetic portrait of the compromises professional life demands, and his scheme to help Pip move Magwitch to safety is one of the warmer things in the book.`,
          appears: [21, 25, 36, 37, 45, 51, 52, 55],
        },
        {
          id: 'herbert',
          tag: 'Friend',
          name: 'Herbert Pocket',
          epithet: 'The true friend',
          body: `Pip's London roommate and only reliable friend. Son of Matthew Pocket, Miss Havisham's sensible cousin who actually teaches Pip. Herbert and Pip had briefly fought each other as boys in Miss Havisham's garden in Volume One, and recognized each other with surprise in London. Pip secretly funds his merchant partnership through Wemmick; Herbert never learns it. Marries Clara Barley and goes to Cairo. Gives Pip a job when Pip is broke and starting over.`,
          appears: [11, 22, 23, 25, 26, 30, 33, 34, 36, 37, 39, 40, 41, 42, 43, 45, 46, 47, 52, 53, 54, 55, 58],
        },
        {
          id: 'drummle',
          tag: 'Threat',
          tagClass: 'creature',
          name: 'Bentley Drummle',
          epithet: 'The brute Estella marries',
          body: `A fellow student at Matthew Pocket's, ungainly and disagreeable, whom Jaggers nevertheless identifies early as a man to watch — "the Spider," he calls him. Dickens uses him as the novel's portrait of what the gentleman's manner can conceal: pure brutishness. Estella marries him. He treats her badly. He dies in a riding accident before the novel closes, which is the only good thing he does.`,
          appears: [23, 26, 38, 43, 59],
        },
      ],
    },
  ],


  chapterLabel: n => 'Chapter ' + n,

  chapters: [
    {
      n: 1,
      title: `The Churchyard and the Convict`,
      tourTitle: `Pip meets Magwitch`,
      hook: `A shivering orphan boy reads his parents' tombstones in the Kent marshes — until a terrifying escaped convict seizes him by the chin.`,
      tour: `Pip introduces himself in the novel's famous opening: an orphan who cannot pronounce his own names, raised by his much older sister and her gentle blacksmith husband Joe Gargery, visiting his parents' graves in the bleak marsh churchyard. The marshes, the river, the distant sea — Dickens conjures the flat, cold Kent landscape in a single paragraph. Then Magwitch erupts from among the gravestones. Gray-clad, shackled, soaked, and desperate, he orders the small boy to bring him a file and food by dawn or face a worse man lurking in the mist. Pip, terrified, agrees. The novel's foundational debt is made in this opening scene, and everything that follows flows from it.`,
      blurb: `On a raw winter evening in the Kent marshes, seven-year-old orphan Pip is seized at his parents' graves by an escaped convict — and a debt is made that will shape his entire life.`,
      summary: [
        `Pip — Philip Pirrip, an orphan who cannot pronounce his own name — visits the churchyard where his parents and five dead brothers lie buried. He has formed his ideas of his father from the shape of the letters on the tombstone and his mother from the wording of the inscription. The marsh country spreads flat and dark beyond the graves: ditches, mounds, cattle, the low line of the river, the distant sea. This is where Pip begins, and Dickens establishes the landscape with the exactness of someone who has seen it and wants the reader to see it too. Pip is cold and frightened of the place and beginning to cry — and then the convict springs from among the graves.`,
        `Abel Magwitch is a terrifying figure: shackled, gray-clothed, soaked, cut by flints, stung by nettles, his teeth chattering. He grabs Pip by the chin and threatens to cut his throat. He demands a file and a piece of pork pie by early morning, threatening that a worse man hidden on the marshes will come for Pip if he fails. Pip, paralyzed by fear, promises everything. The convict makes him tilt and turn to check his pockets, interrogates him sharply about where he lives, and releases him only when satisfied he will come back. Pip runs for home. The scene is Dickens at full stretch — funny and terrifying at once, the boy's terror made vivid through the details of the convict's physical state.`,
        `What the reader does not yet know — but will understand completely by Chapter 39 — is that this encounter is the engine of the entire novel. Magwitch will never forget the child who brought him food on a cold morning. His gratitude, nursed through sixteen years of transportation in Australia, becomes the secret fortune that makes Pip a gentleman. The opening chapter looks like a prologue. It is the foundation. Dickens plants every element of the plot — the convict, the shackle, the marshes, Joe's forge — with a precision that only reveals itself in retrospect. The first-time reader sees a frightening opening scene. The second-time reader sees the whole novel in embryo.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `abel-magwitch`, name: `Abel Magwitch` }],
      themes: [{ slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `the-reveal-that-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }],
    },
    {
      n: 2,
      title: `Mrs. Joe and the Forge`,
      tourTitle: `Life at the forge`,
      hook: `Pip's sister has brought him up 'by hand' — a heavy hand that she lays on Joe the blacksmith just as freely as on Pip.`,
      tour: `Dickens introduces the Gargery household in full. Mrs. Joe is bony, red-skinned, perpetually aproned, and ferociously proud of having raised her orphan brother without complaint — a complaint she makes constantly. Joe is a gentle giant, fair-haired, blue-eyed, illiterate, and helplessly devoted to Pip. Pip returns from the churchyard encounter and must steal food for Magwitch from the pantry without being caught. The chapter establishes the domestic world of the forge: the kitchen fire, the pinafore, the cross fingers that Joe and Pip use as a secret signal when Mrs. Joe is in a temper. The Christmas-morning household with its leg of pork and pudding gives Dickens room to be comic about village respectability — the food Pip has just plundered will become the crisis of the next chapter.`,
      blurb: `Home is the Gargery forge: fierce Mrs. Joe who raised Pip 'by hand,' and gentle giant Joe the blacksmith who loves him without condition. Pip must steal from the pantry before dawn.`,
      summary: [
        `Mrs. Joe Gargery is introduced with Dickensian precision. She is more than twenty years older than Pip and has made her martyrdom into a domestic doctrine: she brought the boy up by hand, and she lays that hard hand on Joe as readily as on Pip. She is not good-looking, not warm, not patient. She wears her coarse apron with the authority of a soldier's uniform. Joe, by contrast, is a mild-tempered Hercules, illiterate, sweet-natured, and completely in love with Pip in the uncomplicated way of a man who has never learned to be otherwise. The forge is attached to the house, wooden and low, and it is Joe's domain — the only place in the household where he has any dignity.`,
        `Pip has agreed to bring the convict food and a file by morning. He creeps back into the house to find Joe sitting alone in the kitchen with the news that Mrs. Joe has been out a dozen times looking for him. The theft must happen before Christmas morning is well advanced. Pip lies awake through the night calculating what he can take, then rises before dawn and raids the pantry — a piece of bread, some cheese, a meat bone, a pork pie, and a bottle of brandy replaced with tar-water. He takes a file from Joe's forge and sets off across the frost-bound marshes. The domestic detail — the specific foods, the tar-water substitution, the early hour — makes the crime feel real and immediate.`,
        `The chapter also introduces the household's social world: Pumblechook, Mrs. Joe's uncle by marriage, is already being positioned as the pompous merchant who will later become Pip's unwanted patron. The Christmas dinner preparations give Mrs. Joe a theater for her martyrdom. Joe and Pip's secret code — crossed fingers to signal her temper — establishes their alliance against the household tyrant. Dickens is building the Kent village world with the density of a place he knows: every character has a texture, every domestic routine has weight.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }],
      themes: [{ slug: `what-becoming-a-gentleman-costs`, label: `What Becoming a Gentleman Costs` }, { slug: `the-voice-of-the-older-pip`, label: `The Voice of the Older Pip` }],
    },
    {
      n: 3,
      title: `Food for the Convict`,
      tourTitle: `Pip delivers the food`,
      hook: `Pip crosses the frost-covered marshes at dawn, his stolen food in hand — only to discover a second convict crouching where the first should be.`,
      tour: `The marshes in early morning are thick with guilt: every gate seems to shout 'Stop, thief!' and an accusing ox with a clerical look follows Pip with its eyes. He reaches the Battery expecting Magwitch but touches the shoulder of a different man — also gray-clothed, also shackled — who swings a wild blow at him and vanishes into the mist. Pip eventually finds Magwitch, who eats the pork pie with savage speed and files at his leg-iron as they talk. Magwitch learns about the other man and twitches with a fury he can barely contain. The two convicts are enemies. Pip runs home before anyone is awake, his errand done, his guilt intact.`,
      blurb: `Crossing the guilty marshes at first light, Pip brings Magwitch his food — and discovers a second escaped convict crouching where the first should have been.`,
      summary: [
        `The fog-bound marsh is a landscape of accusation. The gates and ditches rush at Pip as if crying out; a black ox with a white patch gives him a clerical stare; his conscience turns the whole countryside into a prosecutor. Dickens renders Pip's guilt through the external world — the mist that seems to breathe judgment, the cattle that seem to know — and the comedy of a child's frightened imagination makes the scene warmer than its setting. Pip is running toward a convict with stolen food before the household is awake, and he is genuinely terrified of the open country in the half-dark.`,
        `He finds a man sleeping at the Battery and touches his shoulder — and it is the wrong man entirely. A second convict, also in gray, also shackled, swings a feeble blow at him and staggers into the mist. Pip, who had been told to fear a worse man on the marshes, is briefly convinced this is the worse man. He eventually locates Magwitch and delivers the food. Magwitch eats with desperate speed, barely chewing, while Pip stands by watching with the concern of a small boy who is worried about the man's digestion. When Pip mentions the second man — especially the hat — Magwitch's whole body convulses with a sudden violent rage he cannot quite suppress.`,
        `The chapter establishes the enmity between Magwitch and the mysterious second convict, who will reappear later in the novel as Compeyson — the man who had ruined Magwitch in their joint crime and who will prove to be Miss Havisham's jilting bridegroom as well. All of this is invisible to the reader on first reading. Dickens is laying track for a reveal twenty chapters in the future, using the fog and the two gray figures and the hatred on Magwitch's face to plant seeds the reader cannot yet identify.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `abel-magwitch`, name: `Abel Magwitch` }],
      themes: [{ slug: `the-reveal-that-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }],
    },
    {
      n: 4,
      title: `The Christmas Dinner`,
      tourTitle: `Christmas at the Gargerys`,
      hook: `Pip survives Mrs. Joe's Christmas dinner with his secret intact — until a soldier knocks at the door with a pair of handcuffs.`,
      tour: `Pip returns from the marshes expecting arrest. Instead, Christmas dinner proceeds: Mrs. Joe's cooking, the pompous guests (Pumblechook and Mr. Wopsle), the ritual humiliation of young Pip at table — told not to be greedy, told to be grateful, told to be quiet. The comedy of Victorian bourgeois Christmas hospitality at its most punishing. Pip, sitting on a secret, is lectured by each guest in turn about the miseries they are sparing him. The pork pie is discovered missing. Joe rises to refill the brandy bottle — and Pip braces for exposure — when the soldiers knock. Sudden comic deflection: the handcuffs need a blacksmith's repair and Joe is summoned to work.`,
      blurb: `Christmas dinner with the Gargerys: Pip endures pompous guests and barely survives the discovery of the missing pie — saved only by a party of soldiers requiring Joe's forge.`,
      summary: [
        `The chapter is Dickens at his most satirically festive. The Christmas dinner is a set piece of Victorian hospitality at its worst: abundant food, self-important guests, and the systematic humiliation of the youngest person at the table. Mr. Pumblechook and Mr. Wopsle take turns delivering moral lectures at Pip. Mrs. Joe deploys the occasion to perform her martyrdom to maximum audience. Joe, who cannot contradict his wife in public, sends Pip secret signals of solidarity across the table. The food — pickled pork, roast chickens, mince pie, pudding — is described with the specificity of someone who wants the reader to taste it.`,
        `Pip sits through all of this on a live grenade. He has stolen from the pantry, he has delivered the food to a convict, and he is waiting to be found out. When the brandy bottle is passed and Joe rises to refill it, Pip knows that the tar-water substitution is about to be discovered. The chapter's comic timing is perfect: just as exposure approaches, the kitchen door bangs open and a sergeant of the military appears on the doorstep, holding out a pair of handcuffs in a friendly manner and explaining that he has some work for the blacksmith.`,
        `The arrival of the soldiers converts the domestic comedy into adventure. Joe must repair the handcuffs — the soldiers are pursuing two escaped convicts on the marshes. The dinner party rises in excitement and follows the soldiers into the evening countryside. Pip, who knows exactly who the convicts are, marches along with the group in a state of private terror, hoping the convicts are not found. The chapter ends with the hunt underway and the marshes dark around them.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }],
      themes: [{ slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `the-voice-of-the-older-pip`, label: `The Voice of the Older Pip` }],
    },
    {
      n: 5,
      title: `The Hunt on the Marshes`,
      tourTitle: `The convicts recaptured`,
      hook: `The soldiers catch both convicts fighting in a ditch — and Magwitch, looking straight at Pip, tells the officers he stole the food himself.`,
      tour: `The search party crosses the dark marshes with lanterns and guns. They hear shouting and find Magwitch and the second convict grappling in a ditch of water, each trying to drown the other. Magwitch is recaptured. He catches Pip's eye in the torchlight and gives no sign of accusation. When the soldiers ask where he got the food — the pork pie, the brandy — Magwitch says he took it himself from a house near the village. He is protecting Pip at no benefit to himself. Joe's quiet response ('we wouldn't have you starved to death for it, poor miserable fellow-creature') shows the moral standard against which the novel measures everyone else.`,
      blurb: `The soldiers find both convicts fighting in a marsh ditch. Magwitch is recaptured — and deliberately protects Pip by claiming he stole the food himself.`,
      summary: [
        `The pursuit across the dark marshes is short but vivid. Torches, shouting soldiers, the flat wet land, the river beyond. They hear the convicts before they see them — shouting, struggling in a ditch of freezing water. When the soldiers pry them apart, Magwitch is still trying to drown the other man. He does not resist arrest. He does not appeal for sympathy. What he does do, when asked about the food, is say clearly and without hesitation that he took it himself — that it wasn't the boy's fault, that the boy had nothing to do with it. He catches Pip's eye just once in the lantern light.`,
        `This moment — Magwitch protecting Pip from consequences while himself facing transportation to Australia for life — is the emotional core of the whole novel, planted in the fifth chapter. On first reading it appears to be a minor detail, an act of decency from a frightening man. On second reading, knowing that Magwitch has spent sixteen years in Australia earning money to make Pip a gentleman out of gratitude for a pork pie, the protection in Chapter 5 is the first payment on an enormous debt of love that Pip does not yet know exists.`,
        `Joe's response to learning a convict had stolen their food — 'we wouldn't have you starved to death for it, poor miserable fellow-creature' — establishes him as the novel's moral standard. It is the response of a man who has never learned to hate anyone for being hungry. Dickens gives it no emphasis, no narrative commentary. It is just what Joe says, naturally, and the contrast with Pip's later treatment of Joe is the sharpest moral irony in the book.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }, { id: `abel-magwitch`, name: `Abel Magwitch` }],
      themes: [{ slug: `the-reveal-that-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `what-becoming-a-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 6,
      title: `Silence and Guilt`,
      tourTitle: `Pip keeps his secret`,
      hook: `Pip could confess to Joe what he did — and chooses not to, because he is too afraid of losing Joe's good opinion of him.`,
      tour: `A short chapter of retrospective moral analysis. The convicts are gone. Pip has gotten away with the theft. He feels no guilt toward Mrs. Joe, but his conscience about Joe is another matter entirely. He reasons through, with painful clarity, every way in which confession would change the way Joe looks at him — the way Joe would glance at leftover meat, suspecting tainted pantry goods; the way Joe would brood by the fire; the way trust, once broken, would never look quite the same again. So Pip stays silent. He acknowledges without self-pity that he was too cowardly to do what was right, having already been too cowardly to avoid what was wrong. The older Pip, narrating, calls it self-taught moral failure — he had no model for this course of action and invented it entirely himself.`,
      blurb: `Pip escapes discovery — but he cannot confess to Joe without risking the one relationship that matters. He chooses silence, and the older Pip names that choice clearly: cowardice.`,
      summary: [
        `The chapter is a brief interior monologue in retrospect. Pip has no guilt about deceiving Mrs. Joe; she is a tyrant and he owes her nothing beyond survival. But Joe is different. Joe has let him love him — that is how Pip puts it, and the phrasing is exactly right. Joe's affection has never been conditional or educational or strategic. It has simply been there. To tell Joe the truth would be to see Joe wondering, from then on, whether Pip had been in the pantry, whether the beer was tainted, whether the boy could be trusted. Pip cannot bear the thought. He stays silent.`,
        `The older Pip, narrating from middle age, does not excuse the younger one. He describes it plainly as moral cowardice: too cowardly to confess, having been too cowardly to avoid the act in the first place. He adds that he had no experience of the world at that point and had invented this response entirely on his own — there is a dry comic note in the observation that he had not been imitating anyone, though the world is full of people who act the same way. The ironic retrospective voice is doing its characteristic work: framing the boy's choices with the understanding the man has earned.`,
        `Joe carries Pip home on his back through the cold. Mr. Wopsle, exhausted and furious, has fallen so many times in the wet that his trousers would convict him on circumstantial evidence alone. Mrs. Joe's version of events — that the convict climbed down the chimney by a rope made of cut bedding, a theory endorsed by Pumblechook with absolute confidence — is accepted by the village. Pip goes to bed with his secret intact and his conscience actively working on him. The chapter closes the first episode of the novel and begins the long movement toward Miss Havisham.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }],
      themes: [{ slug: `the-voice-of-the-older-pip`, label: `The Voice of the Older Pip` }, { slug: `what-becoming-a-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 7,
      title: `Learning to Read`,
      tourTitle: `Pip discovers ambition`,
      hook: `Pip laboriously teaches himself to read and write — then shows Joe his letter, and understands for the first time that he wants to be uncommon.`,
      tour: `A chapter spanning a year or more of apprentice boyhood. Pip attends the ludicrous school run by Mr. Wopsle's great-aunt, who falls asleep as a teaching method. Biddy, her granddaughter, is the real instructor — an orphan like Pip, untidy and capable, who teaches him everything she knows. Pip copies letters on his slate and writes a stumbling note to Joe. Joe's delighted and uncritical reception of the note — he reads it upside down with equal satisfaction — reveals to Pip both Joe's illiteracy and something else: the forge and the blacksmith's life may not be enough. When Pip tells Joe he wants to be a gentleman, Joe listens without judgment, smokes his pipe, and tells him the way to begin is to improve Pip himself. He cannot say it better than that.`,
      blurb: `Pip teaches himself to read and write with Biddy's help. Showing Joe a letter, he sees suddenly how much he wants something more than the forge — and that wanting shames him even as it drives him.`,
      summary: [
        `The village school is one of Dickens's best comic inventions. Mr. Wopsle's great-aunt runs an 'educational institution' that consists primarily of her falling asleep in front of the students, who spend the interval eating apples, stamping on each other's feet, and fighting Biddy. Biddy — plain, capable, always slightly untidy — is doing the actual teaching from a greasy price catalog and a handwritten alphabet. She and Pip begin their real lessons on the side, and Pip teaches himself to read with the seriousness of a boy who knows his future depends on it. The detail of struggling through the alphabet 'as if it were a thorn bush' captures the effort exactly.`,
        `One winter evening Pip writes Joe a letter. Joe receives it with such uncritical joy — including holding it upside down and finding it equally satisfactory — that Pip suddenly sees clearly what he has half-known: Joe cannot read. Not a word. His brother-in-law, his protector, his closest friend, is entirely without letters. Pip feels the discovery not as contempt but as a new tenderness — and also as a new distance. The letter scene is the moment Pip first articulates his ambition to be uncommon, and the first time he feels the gap between where he is and where he wants to go.`,
        `Dickens is careful not to condemn the ambition. Joe listens without offense when Pip says he wants to improve. He smokes his pipe thoughtfully and says the thing to begin with is to improve Pip, not Joe. The advice is sound, and it comes from a man who will never take it for himself — not because he lacks intelligence, but because he lacks the hunger. Joe is content, and his contentment, which is a form of grace, is also the thing that will separate them. The chapter introduces Biddy as a figure of practical intelligence and growing importance, and it plants the first seeds of Pip's dissatisfaction with the life the forge offers.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }],
      themes: [{ slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `what-becoming-a-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 8,
      title: `First Visit to Satis House`,
      tourTitle: `Pip meets Miss Havisham and Estella`,
      hook: `Pumblechook delivers Pip to the gates of Satis House — and a beautiful, cold girl lets him in, leads him through the dark, and introduces him to a woman in a rotting wedding dress.`,
      tour: `The chapter opens at Pumblechook's seed shop, where Pip spends a miserable morning being quizzed on arithmetic at breakfast. Then they walk to Satis House: old, barred, gloomy, brewery attached and long unused. Estella emerges with keys to let them in. She is immediately cold, dismissive, calls Pip a 'boy' with deliberate contempt. She leads Pip through dark passages by candlelight into the room where Miss Havisham sits at her dressing table, a stopped clock at twenty to nine, her wedding dress yellowed on her body, a decayed bridal veil on her head. The wedding cake on the long table, the cobwebs, the stopped clocks throughout the house. Miss Havisham commands Pip to play cards with Estella and watches with avid attention as Estella insults him. Pip walks home in the evening dazed, humiliated, and already in love.`,
      blurb: `Pip enters Satis House: a stopped clock, a rotting wedding dress, a cold beautiful girl named Estella — and Miss Havisham seated at her dressing table, frozen at the moment she was jilted.`,
      summary: [
        `The approach to Satis House is carefully prepared. Pumblechook's seed shop, with its smells of corduroy and moist earth, its proprietor who conducts breakfast as an arithmetic examination, its watching shopkeepers across the street — all of this is Victorian provincial commerce at its most comic, and it makes the contrast with Satis House more shocking. Satis House is not comic. It is old brick, barred windows, courtyard gates, no sunlight. A brewery that has not brewed in decades. Then Estella, emerging with her keys, looking at Pip with the specific contempt of someone who has been taught to look at boys that way.`,
        `Miss Havisham, encountered for the first time in her dressing room, is one of the great theatrical entrances in Victorian fiction. She is dressed for a wedding that took place decades ago. The clock has been stopped at twenty minutes to nine — the moment of the jilting. The wedding dress has yellowed. The veil has rotted. One shoe is on; the other has never been put on. Every clock in the house shows twenty to nine. The bridal cake sits on the long table in another room, collapsing under cobwebs and mice. Miss Havisham has stopped time, or tried to, and the house has obeyed her. She directs Pip to play cards with Estella and watches the game with the greedy concentration of someone studying an experiment.`,
        `Estella plays and wins and insults Pip throughout: he is coarse, he has thick boots, he calls knaves jacks because he is common. Each observation is exact and lands. Pip goes home confused and ashamed — of his hands, his boots, his language, Joe's forge, everything the evening has shown him is inadequate. He is already in love with Estella, though he does not have that word for it yet. The chapter establishes the mechanism of the novel's central relationship: Estella will tell Pip exactly what he is, and he will love her for it, and that love will drive him toward everything the novel then systematically dismantles.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `estella`, name: `Estella` }, { id: `miss-havisham`, name: `Miss Havisham` }],
      themes: [{ slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `miss-havisham-and-the-transmission-of-trauma`, label: `Miss Havisham and the Transmission of Trauma` }],
    },
    {
      n: 9,
      title: `Lies at Home`,
      tourTitle: `Pip invents a story`,
      hook: `Back home, Pip invents a wildly false account of Satis House — then goes out alone and cries in the dark, ashamed of himself.`,
      tour: `Mrs. Joe and Pumblechook demand to know everything about Miss Havisham's, and Pip finds he cannot tell them. Not because he doesn't know, but because he knows they won't understand — and because dragging Miss Havisham and Estella into their coarse scrutiny would feel like a betrayal of something he can't name. So he invents. He tells them about velvet coaches, four dogs fighting over cake and wine, a silver basket full of cake, Estella waving flags from the top of a tall building. Pumblechook and Mrs. Joe accept all of it gratefully. The lies disgust Pip even as he tells them. Later, alone in the yard, he cries. In the evening, Joe comes out and offers uncomplicated sympathy. Pip confesses the lies to Joe but not the truth about Satis House — a precise illustration of who, in this household, he is capable of being honest with.`,
      blurb: `Unable to explain Satis House to Mrs. Joe and Pumblechook, Pip invents an absurd fantasy — velvet coaches, four dogs, silver cake baskets — and then cries alone in the yard, disgusted with himself.`,
      summary: [
        `The chapter shows what the visit to Satis House has immediately produced in Pip: a sense of divided loyalty between the world he lives in and the world he has glimpsed. He cannot translate what he has seen into terms his sister and Pumblechook would credit or understand. Miss Havisham frozen in her wedding dress is not a story for the village kitchen; Estella's contemptuous beauty is not something he wants examined by Pumblechook's fishy eyes and gaping mouth. So he makes up something absurdly theatrical instead — velvet coaches, a silver basket, dogs fighting over food.`,
        `The invention is accepted without skepticism. Pumblechook nods. Mrs. Joe is satisfied. The village world, Dickens shows, has no capacity to detect the truth from the fiction here because it has no frame of reference for either. The lies are more comfortable than the truth would be. This says something about the village's imaginative limits, but it also says something about Pip — that he is already drawing a barrier between his inner life and his domestic world, that the secrets are already multiplying.`,
        `Pip goes out into the yard and cries. The older narrator does not explain the tears at length. The reader understands: shame at the lies, humiliation from Estella's words, a sense of inadequacy that has no prior history in Pip's life because he has never before been shown, from outside, what his life looks like. He confesses to Joe that he lied — but only the fact of the lying, not its content. Joe receives the confession with his characteristic gentleness. He says it's not a good practice, and leaves it there. The chapter ends with Pip resolving, without yet knowing how, to improve himself — to become the thing that Estella's contempt has shown him he is not.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }],
      themes: [{ slug: `the-voice-of-the-older-pip`, label: `The Voice of the Older Pip` }, { slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 10,
      title: `The Stranger with the File`,
      tourTitle: `A strange man stirs his drink`,
      hook: `In the village pub, a stranger Pip has never seen stirs his rum and water with a file — and it is the exact file Pip stole from Joe's forge for Magwitch.`,
      tour: `Pip resolves to learn everything Biddy knows, so he can become uncommon. He collects Joe from the Three Jolly Bargemen one evening and finds him in conversation with a stranger who watches Pip with a fixed interest. The stranger, over rum, stirs his drink with a file. Not just any file — Pip recognizes it as the file he took from Joe's forge and gave to Magwitch. The man catches Pip's look of recognition. Before leaving, he wraps two one-pound notes in paper and gives them to Mrs. Joe. The notes arrive home tied in the same paper. Pip hides them in the money box. The stranger is gone and will not be named for thirty chapters, but the trail from him leads directly to Magwitch and then to the entire architecture of Pip's great expectations.`,
      blurb: `In the village pub, a stranger stirs his rum with what Pip recognizes as Magwitch's file. The man gives Mrs. Joe two pounds before vanishing — a messenger whose identity won't be known for thirty chapters.`,
      summary: [
        `The chapter is a masterpiece of planting without signposting. Pip goes to collect Joe from the Three Jolly Bargemen as ordered by Mrs. Joe, and finds him in the corner with Mr. Wopsle and a stranger. The stranger is notable only for looking at Pip with particular attention. He is described briefly: not tall, dark, and not young. When the drinks are refilled, he does something odd — he stirs his rum and water not with a spoon but with a file. And Pip recognizes the file. Not abstractly or uncertainly. He knows the file. It is the one he stole from Joe's forge on the night after Christmas and pressed into the hands of Magwitch in the dark on the marshes.`,
        `The stranger catches Pip's recognition and looks at him. Neither speaks of it. The man buys a round of drinks, wraps two pound notes in paper without explanation, and presses them on Mrs. Joe before leaving. The notes come home in the same paper they were wrapped in, and Pip stows them in the household money box without examining them. The transaction is entirely unexplained. No one asks where the stranger came from, what he wanted, why he paid two pounds to a blacksmith's wife he had never met. The village accepts the windfall without curiosity.`,
        `On second reading, the stranger is clearly an emissary from Magwitch — a man sent to find Pip, to assess him, to pass a first small payment of Magwitch's gratitude back through an untraceable channel. The file is the credential: it proves the connection between the stranger and the convict in the marshes. The whole encounter is designed to be opaque on first reading and illuminating on second. Dickens is playing a long game with the reader's understanding, and this chapter is one of his most skillfully placed pieces.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }, { id: `abel-magwitch`, name: `Abel Magwitch` }],
      themes: [{ slug: `the-reveal-that-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }],
    },
    {
      n: 11,
      title: `The Relatives and the Garden Fight`,
      tourTitle: `The pale young gentleman`,
      hook: `A second visit to Satis House — but this time Pip is taken to meet Miss Havisham's fawning relatives, and a pale young gentleman in the garden challenges him to a fight.`,
      tour: `Estella leads Pip through a different part of the house to a room where three women and a man wait on Miss Havisham's charity, flattering each other and watching for advantage. Miss Havisham is carried in her wheelchair through the house, showing Pip the long table with its rotting wedding cake — she tells him she will be laid on that table when she is dead. Then Estella brings him outside to the overgrown garden, where a pale young gentleman appears and formally challenges him to combat. Pip defeats him thoroughly. Estella rewards Pip with a single kiss. He walks home with his knuckles bloodied and his heart unaccountably lifted. The pale young gentleman is Herbert Pocket.`,
      blurb: `A second visit to Satis House introduces Miss Havisham's fawning relatives and the decaying wedding banquet — then a pale young gentleman challenges Pip to a garden fight, which Pip wins.`,
      summary: [
        `The long table with the rotting wedding cake is described in full for the first time: the great cake at the center, collapsed under its own weight and colonized by mice and beetles and spiders, the web-covered silver candelabra, the yellow-gray dust over everything. Miss Havisham tells Pip with quiet matter-of-factness that when she is dead, she will be laid on this table among the ruins of the feast. The image is one of the most memorable in Victorian fiction — a woman who has made a set piece of her own grief and who intends to become, at last, the centerpiece of the spectacle she has arranged.`,
        `The relatives — Camilla, Georgiana, a man named Matthew Pocket who is spoken of but absent — wait in the ground-floor room with the studied deference of people who expect an inheritance and are uncertain of their standing. They are flatterers and frauds, and Pip sees this clearly even as a child, noting that each of them knows the others are flatterers and frauds but none of them can afford to say so, because that would make the accuser one too. The observation is sharp for a boy his age — the older Pip is already visible in it.`,
        `The garden fight with the pale young gentleman is brief and unexpected. The young man appears, formally invites Pip to fight, and is systematically defeated. Pip is modest in victory, uncertain whether he has committed some offense or some act of heroism. When he re-enters the house, Estella offers him her cheek to kiss. He does. He does not know what it means. The chapter ends with the revelation, deferred until Chapter 22, that the pale young gentleman is Herbert Pocket — who will become Pip's closest friend in London.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `estella`, name: `Estella` }, { id: `miss-havisham`, name: `Miss Havisham` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `miss-havisham-and-the-transmission-of-trauma`, label: `Miss Havisham and the Transmission of Trauma` }, { slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 12,
      title: `The Wheelchair Routine`,
      tourTitle: `Pip pushes the wheelchair`,
      hook: `Pip expects to be arrested for the garden fight — instead, nothing happens, and he settles into a routine of pushing Miss Havisham in her wheelchair for eight months.`,
      tour: `A chapter that covers the middle stretch of Pip's visits to Satis House — roughly eight to ten months summarized. Miss Havisham takes to having Pip push her around the rooms in her wheelchair, round and round, for hours at a time. She talks to him a little, asks what he is going to be, and withholds any help toward any improvement. Estella is sometimes cold, sometimes briefly almost warm, sometimes openly hostile: 'I hate you.' Miss Havisham watches Estella's moods with greedy delight and whispers in her ear, 'Break their hearts, my pride and hope.' Pip realizes he is being used as practice — a target on which Estella rehearses the cruelty she is being trained to deliver. He leaves each visit more ashamed of his origins than before.`,
      blurb: `Eight months of visits, pushing Miss Havisham's wheelchair in circles while Estella blows hot and cold. Pip hears Miss Havisham whisper to her: 'Break their hearts, my pride and hope, break their hearts.'`,
      summary: [
        `The chapter condenses nearly a year of visits into a few pages. This compression is deliberate: the visits are repetitive, circular — the wheel chair literally going in circles around the same rooms, crossing the same threshold between Miss Havisham's dressing room and the long table room, again and again. Time is passing in the outside world while time has stopped inside Satis House. Dickens uses the structure of the visits to reinforce the stopped-clock atmosphere: nothing progresses here, nothing improves, the same conversation in the same rooms under the same yellow light.`,
        `Miss Havisham is a study in purposeful cruelty that has become habitual. She watches Estella's moods with avid attention — the coldness, the occasional condescension, the direct hostility — and when Estella snubs Pip or turns on him, Miss Havisham savors it. The whispered instruction — 'Break their hearts, my pride and hope, break their hearts and have no mercy!' — overheard by Pip, makes explicit what the reader has already understood: the visits are training sessions, and Pip is the training dummy. He is not here to receive anything. He is here to give Estella practice.`,
        `The chapter also summarizes what Pip does not receive from Miss Havisham: no money, no offers of help, no guidance toward any future. She prefers him ignorant. She keeps him coming back. The older Pip, narrating, notes with characteristic dry precision that this is 'a summary of a period of at least eight or ten months' — he is telescoping time to get to the moment when things begin to move. The chapter ends with Pip being informed his visits are done and that Joe is to be brought to Satis House. The next phase is about to begin.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `estella`, name: `Estella` }, { id: `miss-havisham`, name: `Miss Havisham` }],
      themes: [{ slug: `miss-havisham-and-the-transmission-of-trauma`, label: `Miss Havisham and the Transmission of Trauma` }, { slug: `the-voice-of-the-older-pip`, label: `The Voice of the Older Pip` }],
    },
    {
      n: 13,
      title: `Joe at Satis House`,
      tourTitle: `Joe visits Miss Havisham`,
      hook: `Joe dresses in his Sunday best to accompany Pip to Miss Havisham's — and then addresses every remark to Pip rather than to Miss Havisham herself, in a scene of perfect social agony.`,
      tour: `Mrs. Joe insists on coming to town, the forge is shut, Joe chalks HOUT on the door. At Satis House, Estella leads them up through the dark passage. In Miss Havisham's room, Joe behaves with a mixture of deep respect and complete social panic — he turns his hat by the brim, addresses Pip rather than Miss Havisham whenever Miss Havisham speaks to him, and becomes more awkward the more clearly she registers her observation of his awkwardness. Miss Havisham pays Joe twenty-five pounds as Pip's premium for his apprenticeship indentures — deliberately paying Joe without speaking to him — and Pip's visits to Satis House are declared over. Pip and Joe return to Mrs. Joe and Pumblechook. The premium is consumed in a celebration that Pumblechook turns into a personal triumph for himself.`,
      blurb: `Joe accompanies Pip to receive his apprenticeship premium from Miss Havisham — but addresses every answer to Pip rather than to her, turning the interview into social comedy of the most painful kind.`,
      summary: [
        `Joe's visit to Satis House is the most careful portrait of class anxiety Dickens writes in this section of the novel. Joe is not stupid, not incompetent, not contemptible. He is a man of enormous dignity in his own world — the forge, the kitchen, the Three Jolly Bargemen — and he has never been asked to perform in a world not his own. Faced with Miss Havisham in her dressing room, surrounded by the stopped clocks and the decayed dress and the yellow light, he finds it impossible to address her directly. He speaks to Pip as if Pip were a translator.`,
        `Miss Havisham watches this with the composed attention she brings to everything, and it is unclear whether she finds it amusing or simply interesting. She pays the twenty-five pound premium and dismisses them both. Joe receives the money and pockets it without ceremony. The transaction is businesslike from her side and overwhelming from his, but he does not show the overwhelm in any way that invites pity. He is simply a blacksmith in his Sunday clothes in the wrong room, doing the best he can. The older Pip's narration is tender about this, and exact.`,
        `Back in the village, the twenty-five pounds becomes an occasion for Pumblechook's self-promotion. He arranges a celebration at which he takes credit for the arrangement, the opportunity, and, implicitly, Pip's entire future. Joe drinks his modicum of rum. Mrs. Joe is proud in proportion to how little she had to do with it. Pip's indentures are signed and his apprenticeship officially begun. He is now bound to the forge, which is exactly what he does not want — and the chapter closes the door on Satis House for what will turn out to be a long time.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }, { id: `miss-havisham`, name: `Miss Havisham` }],
      themes: [{ slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `what-becoming-a-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 14,
      title: `Ashamed of Home`,
      tourTitle: `Pip hates the forge`,
      hook: `Pip has been apprenticed to Joe — and he hates it. Home, which once seemed respectable, now seems coarse and common, and he cannot say that to Joe without cruelty.`,
      tour: `A short chapter of moral self-examination in retrospect. Pip reflects on what a miserable thing it is to be ashamed of home. Before Miss Havisham and Estella, the forge was sacred: Joe's good fire, the kitchen's honest plainness, the parlor's dignity. Now everything looks small and rough. The apprenticeship that once seemed like manhood looks like confinement. Pip carries a weight on his daily thoughts that makes the anvil feel like a feather. He cannot complain to Joe — this is the only thing he can say to his credit — but his silence is not virtue; it is Joe's faithfulness that keeps him at the forge, not his own. Pip is honest about the difference.`,
      blurb: `Apprenticed to the forge, Pip is ashamed of everything he once loved about home. He does not complain — but the older Pip is clear that credit for his faithfulness belongs to Joe, not to himself.`,
      summary: [
        `This is a chapter of direct moral confession, unusually bare for Dickens. Pip does not dramatize or justify. He simply states what he feels and acknowledges what it means. The forge, which he had imagined as a proud threshold into manhood, now looks dusty and confined. The kitchen, once warm and respectable, is coarse. The parlor's ceremonial gravity has evaporated. He has been shown his world through Estella's eyes and cannot unsee it. This is the damage Miss Havisham's experiment has done — not to Pip's morals but to his capacity for contentment.`,
        `The older narrator distinguishes carefully between faithfulness and virtue. Pip does not run away to sea or enlist as a soldier — not because he is faithful, but because Joe is faithful, and Joe's faithfulness creates a debt that Pip's restlessness cannot discharge by leaving. The credit, in other words, is entirely Joe's. Pip is at the forge every morning for the same reason he is not lying in the churchyard: because Joe made the conditions of survival tolerable. This is the most honest thing the older Pip says about his younger self in the first volume.`,
        `Dickens is setting up the contrast that will run through the entire London section: Pip leaving Joe versus the cost of the leaving. The guilt is not dramatic here — it is quiet, ongoing, domestic. It is the daily choice not to visit, not to write, not to acknowledge. The forge is still operating in the background of the novel, and Joe is still at it, and every chapter in which Pip does not think of him is its own kind of small abandonment. The chapter makes sure the reader understands that the abandonment has already begun, before London, before the fortune — it began the moment Pip first saw the forge through Estella's eyes.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }],
      themes: [{ slug: `what-becoming-a-gentleman-costs`, label: `What Becoming a Gentleman Costs` }, { slug: `the-voice-of-the-older-pip`, label: `The Voice of the Older Pip` }],
    },
    {
      n: 15,
      title: `Orlick and the Attack`,
      tourTitle: `Orlick picks a fight`,
      hook: `Pip's fellow-worker Orlick demands a half-holiday from Joe — and when Mrs. Joe intervenes, Orlick calls her names that set off a quarrel that will end the chapter in violence.`,
      tour: `Pip tries to teach Joe to read on Sunday afternoons at the old Battery. The effort produces no results but considerable goodwill, and the marshes are peaceful at low tide. Pip asks Joe if he might pay a visit to Miss Havisham — just to show he's not ungrateful. Joe is cautious: she might think he wants something. The question of visiting is shelved. At the forge, Pip's fellow-laborer Orlick — a dark, hulking, secretive man who has always resented Pip — demands a holiday when Joe agrees to give Pip one. Mrs. Joe takes offense and calls Orlick 'a foul shrew.' Orlick calls her something back. Joe is compelled by decency to fight him, wins, and the afternoon proceeds normally. That evening Mrs. Joe is found beaten on the kitchen floor, struck down from behind with a convict's leg-iron filed apart.`,
      blurb: `Pip tries to teach Joe to read on the marshes. Then Orlick and Mrs. Joe quarrel bitterly at the forge — and by evening Mrs. Joe lies senseless on the kitchen floor, beaten with a filed leg-iron.`,
      summary: [
        `The teaching sessions at the Battery are among the most touching scenes in the novel's first volume: Pip and Joe sitting on the old cannon with a broken slate and chalk, Joe smoking his pipe in a studiously intellectual manner and learning nothing whatsoever, both of them content. The marshes are peaceful on Sunday evenings, the sails moving on the river. Pip watches the distant ships and thinks of Miss Havisham and Estella, because everything beautiful reminds him of them. The scene has the warmth of the specific — a real friendship between a boy and a man who are both better off for the other's company.`,
        `Orlick is introduced as the shadow Pip casts in the forge world: dark, heavy, ungovernable, harboring a slow resentment he never fully articulates. His demand for a holiday is unremarkable — any apprentice would want the same — but his manner of making it is aggressive, and Mrs. Joe's intervention is worse. The quarrel escalates to insult; Joe is compelled to fight and wins. The afternoon seems to end normally. The violence that follows is offscreen: when Joe returns home that evening, Mrs. Joe is on the floor, struck from behind with a blunt instrument. The instrument turns out to be a convict's leg-iron, filed apart.`,
        `The attack on Mrs. Joe introduces two new pieces of the plot's architecture: Orlick, who has clearly done it, and the leg-iron, which connects the violence to the world of the marshes and Magwitch. Pip forms his own theory but keeps it to himself. Mrs. Joe survives in a damaged state — unable to speak coherently, softened somehow by the injury, requiring care — and the household is permanently changed. The chapter is a hinge point: the village world of the first volume is about to give way to London and the great expectations.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }],
      themes: [{ slug: `what-becoming-a-gentleman-costs`, label: `What Becoming a Gentleman Costs` }, { slug: `the-reveal-that-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }],
    },
    {
      n: 16,
      title: `The Leg-Iron`,
      tourTitle: `Who attacked Mrs. Joe?`,
      hook: `The weapon used on Mrs. Joe was a convict's leg-iron — filed apart long ago. Pip knows exactly whose iron it was, and knows he cannot say so.`,
      tour: `The investigation. Joe had been at the pub with witnesses. The candle was blown out but nothing taken. On the kitchen floor beside Mrs. Joe: a convict's leg-iron, filed through. Joe the blacksmith examines it and confirms it was filed some time ago. Pip forms his private theory — that this is Magwitch's own iron, the one he had watched him filing on the marshes five years before. He suspects either Orlick or the stranger with the file of using it as a weapon. The police can identify the iron as not belonging to any recently escaped convict. Mrs. Joe survives her injuries but is never the same afterward: partly paralyzed, unable to speak clearly, making signs with a slate. One of the things she draws repeatedly is a hammer — a shape that both Pip and Joe understand, privately, refers to Orlick. Biddy comes to help care for her.`,
      blurb: `The weapon was a convict's leg-iron. Pip privately identifies it as Magwitch's — but cannot say so without explaining how he knows. Biddy arrives to care for the brain-damaged Mrs. Joe.`,
      summary: [
        `The investigation is carefully managed by Dickens to distribute suspicion and withhold the answer. The physical evidence points to a filed leg-iron from the prison hulks. Joe's alibi is solid. Orlick was seen in town all evening and came home with Pip and Mr. Wopsle. The stranger who had shown Pip the file could not have quarreled with Mrs. Joe about the money because she was prepared to return it. No clear perpetrator emerges from the public investigation. Pip, privately, has a theory that points at Orlick — but it depends on information he cannot share without explaining the entire history of the marshes, the convict, and the stolen food.`,
        `Mrs. Joe survives the attack in a permanently altered state. She has lost clear speech and some of her coordination. She communicates by making signs and drawings on a slate. The person she most repeatedly refers to — drawing a hammer shape with careful effort — is Orlick. Joe and Pip understand this without saying it aloud. The woman who was a domestic tyrant is now something different: fragile, grateful, drawing her attacker's name on a slate and watching people read it. Dickens does not sentimentalize the transformation but he allows it to be human.`,
        `Biddy arrives to help care for Mrs. Joe, and her presence in the forge household becomes permanent from this point. She is capable, observant, and practically useful in a way no one else in the village is. Her arrival also shifts the emotional geometry of the household: with Mrs. Joe incapacitated, the forge becomes a different kind of place — quieter, less combative, more openly affectionate between Joe and Pip. It is the most domestic peace Pip has known in the village, and he is already beginning to leave it.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }, { id: `abel-magwitch`, name: `Abel Magwitch` }],
      themes: [{ slug: `the-reveal-that-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }],
    },
    {
      n: 17,
      title: `Biddy`,
      tourTitle: `Pip confides in Biddy`,
      hook: `Pip tells Biddy he wants to be a gentleman for Estella's sake — and Biddy, quietly and carefully, tells him she thinks Estella is not worth wanting to be a gentleman for.`,
      tour: `Time passes. The routine of the apprenticeship continues: forge, Sunday Battery lessons, yearly birthday visits to Miss Havisham who gives Pip a guinea and stays frozen in her twenty-to-nine. Pip begins to notice that Biddy has changed — her shoes fit properly, her hair is neat, her hands are clean. She has grown into something he can see clearly: plain but good, observant and honest. One Sunday on the marshes, Pip tells Biddy everything about Estella — his love, his shame, his desire to become a gentleman for her. Biddy asks whether Estella is worth it. Pip is irritated by the question. She goes further: she thinks he would do better to stop thinking of Estella. Pip knows she is right, resents it, and cannot act on it. Biddy accepts his inability with quiet understanding.`,
      blurb: `Pip confesses his love for Estella to Biddy on the marshes. Biddy, gently and precisely, suggests Estella is not worth it. Pip knows she is right and cannot stop anyway.`,
      summary: [
        `The chapter covers the middle of Pip's apprenticeship, a period during which the forge is routine and the annual visits to Miss Havisham are brief and frozen. Pip goes each birthday and receives his guinea and leaves. Miss Havisham has not changed in any way that he can detect. The house has not changed. Even the cake on the table seems not to have changed, though the older Pip reflects that time must be doing its work on it silently. The visits are an anchor backward into a world that offers him nothing and from which he cannot quite detach.`,
        `Biddy's transformation from the untidy school-helper of earlier chapters into the capable young woman of this one is described with precision: it is not that she has become beautiful, it is that she has become someone whose mind and attention are visible in her face. She watches what Pip is doing with a thoughtfulness he has not noticed before. When he confides in her on the marshes — tells her about Estella, the beauty and the coldness and the way he has loved her since the first card game — Biddy listens without flinching. Then she asks the question that the older Pip already knows the answer to: is Estella worth it?`,
        `Pip's response is to be irritated. He has not expected criticism from Biddy. He expected sympathy and solidarity. Biddy does not withdraw — she simply notes, precisely, that she thinks he would be happier if he could bring himself to care less for Estella and more for what is near him. Pip cannot disagree, and cannot comply. He resents Biddy briefly for being right. By the end of the chapter he is fond of her again, and she has accepted his limitations with the same undemanding patience Joe applies to his. The chapter ends with the sense that Biddy is the right companion for Pip, that she sees him clearly, and that he is going to leave them both.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `estella`, name: `Estella` }],
      themes: [{ slug: `what-becoming-a-gentleman-costs`, label: `What Becoming a Gentleman Costs` }, { slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 18,
      title: `The Great Expectations`,
      tourTitle: `Jaggers arrives with the news`,
      hook: `A stranger at the Three Jolly Bargemen dismantles Wopsle's amateur murder trial — then takes Pip aside and tells him he has come into a handsome property and must leave for London.`,
      tour: `A crowded pub evening, Wopsle reading a murder case from the newspaper with theatrical relish, the village verdict enthusiastically delivered. A stranger leans over the settle and proceeds to cross-examine Wopsle on the law of presumed innocence until Wopsle is reduced to silence. He is Mr. Jaggers, a London lawyer. He takes Pip and Joe aside. The news: Pip has great expectations. An anonymous benefactor has settled a large fortune on him. The conditions: Pip must always keep the name Pip, he must not ask the identity of his benefactor (it will be revealed at the proper time by the benefactor himself), and he must go to London immediately to begin his education as a gentleman. Joe is to receive no compensation for the early end of the indentures. Joe and Pip walk home from the pub in silence under the stars.`,
      blurb: `The lawyer Jaggers arrives at the Three Jolly Bargemen with the news that Pip has great expectations — a secret fortune, an anonymous benefactor, and instructions to leave for London at once.`,
      summary: [
        `The chapter turns on one of the great dramatic reversals of Victorian fiction. The pub evening — comfortable, local, comic — is interrupted by a stranger whose manner of cross-examining Wopsle on the presumption of innocence signals immediately that he is a lawyer of unusual force. Jaggers is introduced as he will always appear: commanding, sardonic, wielding legal precision like a weapon, supremely confident in the face of everyone he encounters. The village pub is no match for him; Wopsle is flattened politely but completely.`,
        `The private announcement to Pip is everything Pip has been wanting to hear since Chapter 8. A fortune. London. Education as a gentleman. The release from the forge. The news falls on him with a complexity he does not immediately understand: he is grateful, excited, already constructing in his mind the narrative that this money has come from Miss Havisham and that he is destined for Estella. Jaggers's conditions — keep the name Pip, never ask about the benefactor — are designed to preserve exactly this confusion, though he does not lie. He simply withholds. Joe listens to the news in silence and releases Pip from his indentures without argument, taking nothing for himself.`,
        `The walk home from the pub is the emotional core of the chapter. Joe and Pip walk together under the stars, the forge in front of them, London ahead. Joe is quietly devastated and shows nothing. Pip is excited and guilty and shows both. The apprenticeship is over. The novel is about to become a different kind of book. Dickens has taken nineteen chapters to build the village world — the marshes, the churchyard, the forge, Satis House — and now in the last pages of Chapter 18 he dismantles it. From here, everything Pip goes toward will be measured against what he is leaving behind.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }, { id: `abel-magwitch`, name: `Abel Magwitch` }],
      themes: [{ slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `the-reveal-that-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }],
    },
    {
      n: 19,
      title: `Farewell to the Marshes`,
      tourTitle: `Pip leaves for London`,
      hook: `Six days before London, Pip walks the marshes feeling sublime compassion for the poor creatures who will stay there forever — then sits with Joe by the fire and cannot say what he means.`,
      tour: `The week before departure is a study in how quickly good fortune makes Pip a fool. He buys fine new clothes at Trabb's and is humiliated by Trabb's boy. He visits Pumblechook and receives congratulations more fulsome than they are merited. He walks the churchyard — the convict is gone, transported to some distant place, probably dead — and feels an uneasy gratitude that the connection is severed. He wants to say something real to Joe before he leaves but manages only awkward formalities. On the last night Joe and Biddy sit together, and Pip cannot tell them what he feels because he does not know himself. He cries on the coach out of town and wipes his eyes before anyone can see.`,
      blurb: `Pip prepares to leave for London — buying fine clothes, accepting Pumblechook's congratulations, failing to say anything honest to Joe. He cries on the coach and wipes his eyes before anyone sees.`,
      summary: [
        `The week between Jaggers's announcement and Pip's departure is described with merciless accuracy. The new clothes from Trabb's tailors — ordered with the quiet authority of a young man with money behind him — are a transformation Pip enjoys more than he should. Trabb himself is obsequious; his boy is the opposite, performing elaborate pantomimes of terror and contempt at Pip's expense throughout the village. The episode with Trabb's boy is brief here and will be revisited with savage comedy in Chapter 30, but even now it establishes that Pip's new dignity is legible only to himself and those who want something from him.`,
        `Pumblechook's congratulations are the most revealing transaction of the week. He takes credit for everything, implies a particular friendship with the unnamed benefactor, shakes Pip's hand with the unction of someone investing in future gratitude, and bores him for hours with his own importance. Pip accepts all of it with the patience of someone who has not yet learned to see flattery for what it is. He will spend the rest of the novel learning. He visits Miss Havisham — she greets the news with the cryptic satisfaction of someone who has expected it, without explaining why — and leaves uncertain whether this confirms his theory about the benefactor or not.`,
        `The last evening at the forge is the hardest scene in the chapter. Joe and Biddy sit together at the fire. Pip wants to say something honest about what he feels for them, about what they have meant to him, about the guilt already forming around the departure. He cannot do it. He asks Biddy to write to him occasionally. He says he will come back often. Joe says, 'Never too often, Pip.' The scene is done in a few lines, and the restraint is perfect. The next morning Pip cries on the coach — and wipes his eyes before anyone can see him doing it. That small vanity is the beginning of the education the novel has in store.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }, { id: `miss-havisham`, name: `Miss Havisham` }],
      themes: [{ slug: `what-becoming-a-gentleman-costs`, label: `What Becoming a Gentleman Costs` }, { slug: `the-voice-of-the-older-pip`, label: `The Voice of the Older Pip` }],
    },
    {
      n: 20,
      title: `Arrival in London`,
      tourTitle: `Pip finds London ugly`,
      hook: `London — immense, narrow, crooked, and dirty. Pip goes straight to Little Britain and finds Jaggers's office, where waiting clients in varying states of desperation fill the doorway.`,
      tour: `Pip arrives by stagecoach at Cheapside and is struck by how ugly London is. He expected grandeur. What he finds is crowded, grimy, and loud. He makes his way to Jaggers's office in Little Britain, near Smithfield market — the smell of the slaughterhouse in the air. The office is dark and purposeful, hung with two dreadful plaster casts of hanged men above the fireplace. Jaggers is not yet back. His clerk Wemmick — square-faced, expressionless, with a wooden manner and a slit of a mouth — shows Pip to Barnard's Inn in Holborn, where he will lodge with Jaggers's young ward until Jaggers returns. The inn is decayed, smelling of dry rot and old stone. Herbert Pocket's rooms are at the top of the stairs.`,
      blurb: `London is ugly: narrow, crooked, dirty. Jaggers's office in Little Britain smells of Smithfield and is decorated with plaster casts of hanged men. Wemmick leads Pip to his lodgings at the decrepit Barnard's Inn.`,
      summary: [
        `The arrival in London is carefully constructed as a disappointment. Pip has been imagining London for a week as a place of improvement and greatness. What he finds is a stagecoach snarl at Cheapside, a city that smells of commerce and waste, streets that are narrow and dirty and crowded in ways the Kent marsh country has not prepared him for. The British self-satisfaction that finds London unquestionably the best of everything gets a single satirical sentence from the older Pip, and then he continues the description of how ugly it was.`,
        `Jaggers's office in Little Britain, near Smithfield meat market, has a particular atmosphere: the smell of old wood and dried matter, the dark paneling, the safe, the two plaster death masks hanging above the fireplace — casts of hanged men, from Jaggers's criminal practice. The office speaks of a man who deals professionally with the worst of human situations and is entirely at ease with it. The clients waiting outside — in various conditions of anxiety and desperation — tell you what kind of practice this is. Wemmick, Jaggers's clerk, is introduced with the description of a man chipped rather than carved: square, wooden-faced, expressionless, wearing mourning rings for the dead.`,
        `Barnard's Inn is not what the word Inn suggests. It is a set of private chambers, old, decrepit, smelling of dry rot, with a courtyard that has grass growing between the cobblestones and a pump that has not pumped for years. The building has the look of something that has given up. The name painted on the door — Herbert Pocket — is the pale young gentleman from Miss Havisham's garden. Pip stands outside the door with this revelation sinking in. London is revealing itself as a place full of connections he did not expect, most of them comic and some of them dangerous.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 21,
      title: `Wemmick`,
      tourTitle: `Pip meets Wemmick`,
      hook: `Wemmick, Jaggers's clerk, leads Pip through London — dry, wooden, watchful — while describing his 'Walworth sentiments' as entirely separate from his professional ones.`,
      tour: `Wemmick walks Pip from Little Britain to Barnard's Inn through the London streets. He is the novel's most original minor character: a man who has divided himself perfectly in two. At the office, he is Jaggers's extension — hard, official, cautious, treating everything as a legal matter. Outside it, in Walworth where he lives, he is an entirely different person: a man with a father he calls the Aged Parent, a miniature castle with a drawbridge and a cannon, a vegetable garden, and a fierce domestic joy. Wemmick explains this division with matter-of-fact clarity: portable property is the only reliable investment in London — what you can take with you when everything else fails. He studies Pip openly as they walk, assessing.`,
      blurb: `Wemmick, Jaggers's clerk, leads Pip through London: dry, expressionless, precise, wearing four mourning rings. He will prove to be, at Walworth, an entirely different person.`,
      summary: [
        `Wemmick is Dickens at his most inventive with minor character. The physical description — square wooden face chipped rather than carved, dimples that have not been smoothed, four mourning rings, the slit of a mouth — establishes a man who has been shaped by his work into something close to mechanical. He studies Pip with the open, assessing attention of a clerk who is also an intelligence-gatherer for his principal. He tells Pip London observations with the calm of someone who has processed all of them long ago and arrived at certainty.`,
        `His doctrine of portable property — 'When a man has friends, get all you can get out of them while you can, and keep it portable' — sounds cynical and is partly meant to be, but it is also the hard-won wisdom of a man who has watched Jaggers's clients lose everything and take nothing with them. It is the philosophy of a man who has learned not to attach himself to anything that cannot be carried. The mourning rings on his fingers are portable. The plaster casts of dead men in Jaggers's office are not. Wemmick has drawn the right conclusion.`,
        `The chapter is also a tour of Pip's new neighborhood: the streets between Little Britain and Holborn, the character of London as a place where money is made and kept and lost. Wemmick points out notable houses and famous addresses with the local knowledge of someone who has walked these streets every day for decades. By the time Pip reaches Barnard's Inn, he knows something about the city and something about Wemmick — though not yet the most important thing about him, which is the castle at Walworth and the man it makes him at home.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 22,
      title: `Herbert Pocket`,
      tourTitle: `Pip's new friend`,
      hook: `The pale young gentleman who Pip fought in Miss Havisham's garden turns out to be his London roommate — and they become, immediately and permanently, friends.`,
      tour: `Herbert Pocket and Pip recognize each other and burst out laughing. Herbert is cheerful, frank, without resentment over the garden fight, and introduces himself with the complete transparency of a man who has nothing to hide and no talent for concealment. He renames Pip 'Handel' — after the composer's Harmonious Blacksmith — because he finds Pip too short and plain a name. Over dinner, Herbert provides the backstory Pip has been missing: who Miss Havisham is, how she was jilted by a man named Compeyson on her wedding morning, how Estella was adopted as a child to be trained as a weapon. He tells it with the lightness of someone relating gossip without malice. Pip listens. Everything he was allowed to believe at Satis House falls quietly into a different shape.`,
      blurb: `The pale young gentleman turns out to be Herbert Pocket — Pip's London roommate. Over dinner, Herbert explains who Miss Havisham is, how she was jilted, and how Estella came to be raised as she was.`,
      summary: [
        `The recognition scene is one of the warmest in the novel. Herbert and Pip stare at each other, then both laugh, then reach for each other's hands. The friendship is established without ceremony or calculation — it simply is, from the moment of the handshake, the real thing. Herbert is the character in Great Expectations whose affection for Pip is most entirely uncomplicated. He likes Pip for being Pip, not for the fortune or the connection to Miss Havisham or the potential for social use. This is rarer in the novel than it appears.`,
        `Herbert's account of Miss Havisham is the first clear information Pip has received about her. She was the daughter of a brewer — a wealthy man who had a half-brother in secret, from an affair. The half-brother, Compeyson, grew up knowing his illegitimacy and developed a talent for crime. He met Miss Havisham and presented himself as a gentleman. She fell in love and trusted him completely. On the wedding morning he sent a letter — arriving just before nine — telling her not to come to the church. She stopped everything at that moment and has never moved since. Compeyson and Magwitch, the reader will later discover, are connected — but that connection is still twenty chapters away.`,
        `Herbert also corrects Pip's assumption about Estella and himself. He does not know for certain, but he believes Miss Havisham is not intending Estella for Pip. He says this gently, without quite committing to the statement, but it is the first honest account Pip has heard of the arrangements at Satis House. Pip cannot quite take it in. He goes to bed that night in the decayed rooms of Barnard's Inn, his head full of Herbert's information, the fireplace smoke drifting through the gaps in the chimney, London beginning its work on him.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }, { id: `miss-havisham`, name: `Miss Havisham` }, { id: `estella`, name: `Estella` }],
      themes: [{ slug: `miss-havisham-and-the-transmission-of-trauma`, label: `Miss Havisham and the Transmission of Trauma` }, { slug: `the-reveal-that-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }],
    },
    {
      n: 23,
      title: `The Pocket Household`,
      tourTitle: `The chaos of Hammersmith`,
      hook: `Pip moves to Matthew Pocket's house in Hammersmith and discovers a household held together entirely by the servants — while Mr. and Mrs. Pocket drift through it like well-meaning ghosts.`,
      tour: `Matthew Pocket — Herbert's father, a tutor who once had grander ambitions — receives Pip warmly and begins the educational arrangement. The Pocket household is an extended domestic comedy. Mrs. Pocket is the daughter of a minor knight who convinced her she was practically royalty and neglected to teach her anything useful. She sits reading, babies are mismanaged around her, the servants run everything, the household finances drift. The other lodgers are Bentley Drummle — heavy, sulky, wealthy, proud, wrong in every particular — and Startop, slight and bookish. Pip makes progress under Matthew Pocket, is told he has no profession in view and simply needs to hold his own with prosperous young men, and begins to settle into a life of systematic spending and learning.`,
      blurb: `Matthew Pocket's household in Hammersmith: a competent tutor whose wife cannot boil water and whose servants run everything. Drummle and Startop are Pip's fellow-lodgers.`,
      summary: [
        `The Pocket household is one of Dickens's best comic inventions in the London section. The domestic incompetence is systemic rather than individual: Mrs. Pocket has been raised to expect a title and has never been taught anything that might make a household function, so the servants have taken over by default and treat the Pocket family as inconvenient guests in their own house. The babies are handled by Millers, whose treatment of them is summarized by a complaint from a neighbor that she was seen slapping one. Mrs. Pocket registers this with tears and calls it extraordinary that neighbors cannot mind their own business.`,
        `Matthew Pocket, despite the comedy, is genuinely good at what he does. He is an intelligent man who had ambitions, married too quickly, and found himself tutoring second-rate young men for the rest of his life. He is honest with Pip from the start: no profession is in view, the goal is to hold your own with the prosperous class, the curriculum will be self-directed with his guidance. This is exactly the kind of frank, practical information Pip has never received from anyone connected to his expectations, and he responds to it with an effort he brings to very little else in London.`,
        `Bentley Drummle is introduced as a figure of deliberate contempt. He is stupid, proud, wealthy, and hostile by temperament. He picks up a book as if its author had done him an injury. He rows a boat by creeping along the backwater while everyone else is on the open river. He is the wrong kind of English gentleman — idle, arrogant, incapable of anything generous — and he is introduced here because he will later appear as Estella's husband, the instrument by which Miss Havisham's cruelty completes its circle back on itself.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 24,
      title: `Jaggers at Work`,
      tourTitle: `Pip visits the office`,
      hook: `Pip arranges to keep his rooms at Barnard's Inn with Herbert — and visits Jaggers's office, where a terrifying consultation with a client in the waiting area confirms everything about his guardian's authority.`,
      tour: `Pip negotiates his living arrangements with Jaggers — keeping rooms at Barnard's Inn while studying at Hammersmith — and finds Jaggers immediately agreeable: 'Go for it. I told you you'd get on.' At the office, Pip observes Wemmick's work from the inside: the safe where portable property is secured, the correspondence, the steady parade of criminal clients. He also accompanies Wemmick and Jaggers to Newgate Prison in a passage that Dickens gives particular weight — the prison is described with the uncomfortable familiarity of someone who knows it well, and Jaggers's effortless authority within it establishes him as a man for whom the criminal justice system is simply his native habitat.`,
      blurb: `Pip arranges to keep his London rooms. At Jaggers's office he observes the criminal practice from inside — and visits Newgate Prison, where Jaggers moves through the wards like a man entirely at home.`,
      summary: [
        `The practical arrangements of Pip's London life are settled in this chapter with a briskness that reflects Jaggers's style: decisions are made quickly, money is allocated precisely, conditions are stated and not repeated. Jaggers approves the plan for Barnard's Inn without sentiment. He and Pip settle the financial arrangements in a few minutes, and Pip leaves with a sum of money and no further instructions, which is exactly how Jaggers operates.`,
        `The office itself is a study in controlled information. Wemmick manages correspondence, secures property, and processes clients with the same efficient absence of expression he applies to everything. Pip watches this from the corner and begins to understand what Jaggers's practice actually consists of: criminal defense, principally; clients who are in serious trouble and who come to Little Britain because Jaggers is known to win. The professional relationship between Jaggers and Wemmick — employer and clerk, each respecting the other's competence without warmth — is one of the novel's neatest double portraits.`,
        `The visit to Newgate is brief but significant. Jaggers moves through the prison as if it were his own house. The guards know him. The prisoners know him. He stops, consults, advises, dismisses with the ease of a man who has done this hundreds of times. Pip watches and is uncomfortable. The proximity of the criminal world — which Pip associates with the marshes, with Magwitch, with the earliest years he is trying to put behind him — is uncomfortably close here. London and the forge are not as far apart as he had hoped. The prison smell follows him back to Barnard's Inn.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `the-reveal-that-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 25,
      title: `Wemmick's Castle`,
      tourTitle: `The Aged Parent`,
      hook: `Pip visits Wemmick at home in Walworth and finds a miniature Gothic castle, a working drawbridge, a cannon fired at nine o'clock, and Wemmick's nearly deaf father — the Aged Parent.`,
      tour: `Pip accepts Wemmick's invitation to visit at home. The house in Walworth is extraordinary: a tiny Gothic castle with a moat, a flagpole, a plank drawbridge that Wemmick pulls up at night, a miniature gun he fires at nine o'clock every evening ('the Aged likes it'). Inside, Wemmick's father — ancient, deaf, delighted by everything — sits by the fire and is addressed as the Aged Parent. The house has a vegetable garden, a pig, rabbits, chickens. Everything is homemade and everything works. Wemmick at home is a completely different man: warm, playful, tender with his father, proud of his domestic engineering. He tells Pip explicitly that the Walworth sentiments and the Little Britain sentiments must never be allowed to meet.`,
      blurb: `Wemmick at home in Walworth: a miniature castle with a drawbridge, a cannon fired nightly for the Aged Parent, vegetables and rabbits and a flagpole — the most cheerful domestic invention in Victorian fiction.`,
      summary: [
        `Wemmick's castle is one of the great set-piece inventions of the novel and one of Dickens's most optimistic. It is a one-man project of domestic self-creation: the wooden face who cannot allow himself feelings at the office has built, at home, a world in which feelings are the entire point. The castle has been constructed piece by piece over years — the moat, the drawbridge, the gun, the flagpole — and every element of it expresses Wemmick's actual personality, which is warm, playful, creative, and devoted to the person who depends on him.`,
        `The Aged Parent is one of the most endearing minor characters in English fiction. He is nearly stone deaf and knows it. He nods at everything said to him with the benevolent comprehension of a man who has decided to enjoy whatever is happening regardless of what it is. Wemmick shouts at him, they exchange nods, the old man is perfectly happy. The cannon is fired at nine and the Aged is delighted every night as if it were the first time. The tenderness of the relationship — the son who has built an entire domestic world around making his father comfortable and pleased — humanizes Wemmick completely.`,
        `Wemmick's doctrine of keeping Walworth and Little Britain entirely separate is the novel's most deliberate defense of the divided self. He knows the office requires a kind of person he cannot actually be, so he puts on that person every morning and takes him off at the castle gate. The arrangement works. He is effective at both. Pip, watching this, begins to understand that London is a place where people maintain these kinds of divisions as a matter of professional survival — and to wonder whether he is developing similar divisions himself.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `the-voice-of-the-older-pip`, label: `The Voice of the Older Pip` }],
    },
    {
      n: 26,
      title: `Dinner at Jaggers's`,
      tourTitle: `Jaggers as host`,
      hook: `Jaggers invites Pip and his friends to dinner — and within the first hour has focused his entire attention on Bentley Drummle, the worst person in the room.`,
      tour: `Jaggers hosts dinner in Gerrard Street: an official, sparse, heavily furnished house that feels like an extension of his office. No silver service, no comfortable excess, but solid food and a large dumb-waiter of bottles. During dinner Jaggers is fascinated by Drummle — he draws him out, debates with him, appears to enjoy his obstinate stupidity with the relish of a collector. His housekeeper, Molly, serves at table. Wemmick later identifies her to Pip: Jaggers defended her years ago on a charge of murder and strangulation. She was acquitted. She has been his housekeeper ever since. Her wrists are scarred in a way Pip cannot forget. The reader will learn, much later, that Molly is Estella's mother.`,
      blurb: `Jaggers hosts dinner for Pip and his friends — and singles out Drummle for particular attention. His housekeeper Molly, whose scarred wrists Wemmick later explains were evidence in a murder trial, serves at table.`,
      summary: [
        `Jaggers's dinner is not a comfortable occasion. The house has the same official, purposeful quality as his office: solid furniture, no ornament, books of criminal law and evidence in the bookcase, the plaster death casts on a shelf in the corner. He invites his guests with 'no ceremony, no dinner dress, no nonsense' and keeps his word. The wine is good. The food is adequate. The conversation is Jaggers's territory, and he claims it by cross-examining each of his guests in turn.`,
        `His interest in Drummle is deliberately perverse. Drummle is stupid, sulky, and proud — qualities Jaggers appears to find professionally interesting. He challenges Drummle's opinions, encourages his self-regard, and seems to find the man's obstinate dimness a source of genuine entertainment. Pip, who despises Drummle, watches this with consternation. Jaggers shows no equivalent interest in Pip, Herbert, or Startop. The preference for the most obviously unpleasant person in the room is characteristically Jaggers: he prefers what is real to what is polished.`,
        `Molly's appearance at the dinner table is the chapter's most important moment, though its importance is not yet legible. She is noted for her strong hands and scarred wrists, and Jaggers draws attention to her grip with a command she obeys. Wemmick, walking home with Pip afterward, explains: Jaggers defended her on a murder charge twenty years ago. The victim was found strangled. The defense turned on the evidence of those wrists. She was acquitted. Pip files the information away without knowing what it connects to. It connects to Estella — but that is twelve chapters away.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }, { id: `estella`, name: `Estella` }],
      themes: [{ slug: `the-reveal-that-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 27,
      title: `Joe in London`,
      tourTitle: `Joe visits Barnard's Inn`,
      hook: `Joe Gargery comes to London with news from the village — and Pip, while welcoming him, cannot stop being embarrassed by his clothes and his speech, and Joe can see every bit of it.`,
      tour: `Biddy writes to warn Pip that Joe is coming. Pip's reaction is guilt-making: he wishes Joe were not coming, worries about Drummle seeing them together, considers paying money to prevent the visit if he could. Joe arrives at Barnard's Inn in his Sunday best, holding his hat, calling Pip 'sir' and then correcting himself. He has news: Miss Havisham wishes to see Pip, and Estella is home. The visit is stilted, painful, and short. Joe does not fit in the room and cannot pretend to — not because he is stupid but because nothing in his formation has prepared him for this kind of drawing room exchange. Before leaving, he delivers a speech of such quiet dignity that Pip is demolished by it. Joe will be Joe; Pip is better off visiting him at the forge.`,
      blurb: `Joe visits Pip in London — and Pip is embarrassed by his clothes, his manners, his dialect. Joe sees all of it, and before leaving says that he's Joe at the forge, not in drawing rooms, and to come see him there.`,
      summary: [
        `The chapter is one of the most emotionally precise in the novel. Pip's internal monologue as he anticipates Joe's arrival is a masterpiece of self-exposure: he would pay money to prevent the visit; he is relieved Joe is coming to Barnard's Inn rather than Hammersmith; he worries most about Drummle seeing them together. The older Pip names it directly — our worst weaknesses are usually committed for the sake of the people we most despise. The observation is exact and applies to the chapter it appears in.`,
        `Joe arrives holding his hat, dressed in his Sunday best, and the visit immediately begins to fail. He cannot address Miss Pocket naturally because she is a woman and he is unused to that kind of room. He calls Pip 'sir' and then corrects himself. He holds his hat and keeps revolving it and sets it down and picks it up again. Herbert handles him with great tact — pouring his tea, making conversation — and Joe is grateful for it. But Pip's discomfort is visible to Joe throughout, and the older Pip does not pretend otherwise.`,
        `Joe's leave-taking is the chapter's peak. He thanks Pip quietly, says it's a rare place and a fine room, and notes that the visit has not gone well — not accusingly, but as an observation. He adds that he is Joe in his own place, at his forge and his work, and that in visiting London he is out of his place. He suggests Pip come to the forge to see him instead. The speech has the dignity of a man who knows exactly who he is and has no interest in pretending to be someone else. He takes his hat and goes. Pip is left alone in the room with his shame and the residual warmth of the visit, which is already larger than his embarrassment.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }, { id: `estella`, name: `Estella` }],
      themes: [{ slug: `what-becoming-a-gentleman-costs`, label: `What Becoming a Gentleman Costs` }, { slug: `the-voice-of-the-older-pip`, label: `The Voice of the Older Pip` }],
    },
    {
      n: 28,
      title: `Convicts on the Coach`,
      tourTitle: `Pip rides with convicts`,
      hook: `Returning to his town to visit Miss Havisham, Pip shares the stagecoach with two convicts — one of whom, he slowly realizes, is the man who gave two pounds to Mrs. Joe years ago.`,
      tour: `Pip goes back to his home town for Miss Havisham's invitation, stays at the Blue Boar rather than the forge (rationalizing every step), and rides down on the afternoon coach. Two convicts are transported on the outside of the coach as outside passengers — a common enough practice. Pip is uncomfortable with their proximity. As the journey goes on, he overhears them talking, one to the other. One of them — with a face he gradually recognizes — was the man from the Three Jolly Bargemen, the stranger who stirred his drink with a file. He speaks of Magwitch: the convict who wanted a young boy remembered. Two pounds sent to the boy. The man doesn't know the boy, doesn't know his name, doesn't care — he was just the delivery vehicle. Pip arrives at the Blue Boar shaken.`,
      blurb: `Two convicts ride the coach to Pip's home town. One of them, Pip slowly recognizes, is the man who gave two pounds to Mrs. Joe — an emissary from Magwitch who does not know Pip's name or connection.`,
      summary: [
        `Pip's decision to stay at the Blue Boar rather than Joe's forge is one of the novel's most carefully observed small betrayals. He has a dozen rationalizations: it's inconvenient, he wasn't expected, he'll be too far from Miss Havisham's, his bed won't be ready. The older Pip names these for what they are — counterfeit coins he is passing to himself as real money, the exact self-swindle of someone who does not want to examine their own choices too closely. He knows he should stay at the forge. He stays at the Blue Boar. He is not honest enough with himself to stop.`,
        `The convicts on the coach are an effective piece of plot engineering. They are uncomfortable presences for Pip, stirring the old anxiety about the marshes and the childhood debt. He does not speak to them or look at them directly. But he cannot avoid overhearing their conversation, and one of them is talking about Magwitch — not by name, but unmistakably about the transported convict who sent two one-pound notes to a boy in a village. The man doesn't know who the boy was. He was just the messenger. He handled the transaction and has forgotten it. For Pip, who knows exactly who the boy was, the conversation is electrifying.`,
        `The chapter ends with Pip at the Blue Boar, rattled by the encounter and unable to explain why to anyone he might confide in. He has not thought clearly about Magwitch in years — the convict is supposed to be dead and gone, part of a past that London and the great expectations have superseded. The stranger on the coach has reminded him that the past is not dead, that the connections are still active, that there is something large and as yet unnamed connecting the marshes, the file, the two pounds, and his fortune. He does not follow the connection to its conclusion. He is one chapter away from seeing Miss Havisham and Estella again.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `abel-magwitch`, name: `Abel Magwitch` }],
      themes: [{ slug: `the-reveal-that-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `what-becoming-a-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 29,
      title: `Estella Again`,
      tourTitle: `Pip sees Estella grown`,
      hook: `Estella, grown up, is at Satis House — and Pip loves her exactly as much as he always has, and she is exactly as cold, and she tells him so plainly.`,
      tour: `Pip walks to Satis House early, painting brilliant pictures of Miss Havisham's plans for him and Estella. At the gate he finds Orlick serving as gatekeeper — a troubling discovery he files away. Inside, Estella receives him. She is grown up now, beautiful in ways that go beyond the child he remembered, and she treats him with something that is almost warmth. Miss Havisham takes Pip's arm and they walk the rooms, Miss Havisham demanding 'Does she grow prettier and prettier?' and Pip saying yes, and Miss Havisham looking greedy. Then Estella and Pip are alone, and she tells him with complete clarity that she has no heart and cannot love, and that if anything she has said has seemed like encouragement it was not meant as such. Pip knows this is true. He loves her anyway.`,
      blurb: `Estella, grown and beautiful, receives Pip at Satis House. She tells him plainly she has no heart and cannot love him. He knows she is telling the truth and loves her regardless.`,
      summary: [
        `The walk to Satis House that morning is described as Pip painting pictures in the air — elaborate fantasies of Miss Havisham's intentions, the restoration of the house, the marriage to Estella, himself as the young knight of romance. The older Pip is careful to note that even in this romantic reverie he did not invest Estella with qualities she did not have: he knew exactly what she was, and loved her for it and despite it. This is the fixed purpose of the older narrator's note here — to establish that Pip's love for Estella was never a mistake about her character but a feeling that persisted in full knowledge of her character. Which makes it, in some ways, more serious, not less.`,
        `Estella grown is the same Estella in a different and more commanding body. She has the same manner, the same quality of assessment, the same precision about what she is and is not. She is momentarily warmer to Pip than she used to be — the childhood disdain has relaxed into something like adult courtesy — and this small shift is dangerous to him because he reads too much into it. Miss Havisham is alive to every moment of their interaction. She watches with the same greedy attention she always brought to Estella's cruelties, now transferred to something more ambiguous.`,
        `The direct conversation between Pip and Estella, when Miss Havisham leaves them briefly, is the most honest exchange in the novel. Estella tells him she has no heart. She tells him she was trained not to have one. She does not apologize for this and does not pretend it can be changed. She warns him. Pip receives the warning, acknowledges its truth, and continues to love her. The older narrator's note on this — 'I knew to my sorrow, often and often, that I loved her against reason, against promise, against peace, against hope' — is the most precise description of non-rational love in Victorian fiction.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `estella`, name: `Estella` }, { id: `miss-havisham`, name: `Miss Havisham` }],
      themes: [{ slug: `miss-havisham-and-the-transmission-of-trauma`, label: `Miss Havisham and the Transmission of Trauma` }, { slug: `the-voice-of-the-older-pip`, label: `The Voice of the Older Pip` }],
    },
    {
      n: 30,
      title: `Trabb's Boy`,
      tourTitle: `The village humiliation`,
      hook: `Pip reports Orlick to Jaggers and is duly removed. Then, walking the High Street, he is pursued by Trabb's boy doing an extended pantomime of Pip's gentlemanly airs — and the disgrace is total.`,
      tour: `Pip tells Jaggers about Orlick at the gate. Jaggers disposes of the matter in thirty seconds and with apparent pleasure. Pip walks the town before the London coach — the shopkeepers dart out to gawp, which he finds rather agreeable, until Trabb's boy appears. The boy stages a three-act pantomime in the High Street: first a parody of terror at Pip's dignity, then a pantomime of swooning, then a strutting imitation of Pip himself — hat tilted, arm on hip, 'Don't know yah! Don't know yah!' — to the delight of a growing audience of spectators. Pip is chased out of town by Trabb's boy crowing like a rooster, utterly demolished. He composes a furious letter to Trabb requesting the boy's dismissal. Herbert reads it and finds it very good.`,
      blurb: `Pip walks the High Street with the dignity of his great expectations — until Trabb's boy stages a three-act pantomime of his gentlemanly airs and chases him out of town crowing.`,
      summary: [
        `The Orlick disposal is satisfying in its efficiency. Pip raises the concern; Jaggers says the man isn't the right sort for the position, confirms he never is, and promises to go round and pay him off. He seems to relish the confrontation. Orlick, who knows Jaggers's reputation, presumably accepts dismissal without argument. The scene takes a paragraph. What follows — Trabb's boy — takes five pages and is one of the funniest episodes in the novel.`,
        `Trabb's boy understands Pip exactly. He has watched Pip swagger through the tailor's shop and purchase his fine clothes and be deferred to by Trabb, and he has processed all of it accurately. His pantomime on the High Street is a precise critical reading of Pip's new manner: the tilted hat, the arm on the hip, the 'Don't know yah' aimed at people he grew up with. The repetition — three separate acts, each escalating — is the comic structure of the thing. Pip's attempts to ignore it with serene dignity make it worse. The audience of spectators grows. By the time Trabb's boy is crowing like a rooster, Pip is ejected from his own home town by the village equivalent of a one-man satirical review.`,
        `Pip's angry letter to Trabb, demanding the boy's dismissal, is read by Herbert with genuine admiration for its vigor. Herbert thinks it well expressed. The joke — that Pip's wounded pride has produced excellent prose — carries the chapter's sting. Trabb's boy has done nothing wrong. He has simply named, publicly and comically, what Pip's London manner has made of him. The older Pip, looking back, presumably understands this. The younger Pip writes a letter of complaint. The gap between them is the form of the novel.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `the-fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `the-voice-of-the-older-pip`, label: `The Voice of the Older Pip` }],
    },
    {
      n: 31,
      title: `Mr. Wopsle on Stage`,
      tourTitle: `Mr. Wopsle's Hamlet`,
      hook: `Pip and Herbert endure Mr. Wopsle's catastrophic London debut as Hamlet, the audience turning the tragedy into comedy.`,
      tour: `Pip attends the theater with Herbert to see his old village acquaintance Mr. Wopsle play Hamlet in a London production. The evening is a disaster — the audience jeers, helps the undecided prince through his soliloquies, greets the ghost with derision, and mocks the overbrassed Queen of Denmark. Pip and Herbert laugh helplessly while also feeling genuine sympathy for Wopsle. After the performance, Wopsle joins them at supper, solemnly convinced his Hamlet was a success. The episode is comic relief at its sharpest, but Pip lingers on the strange sight of a face he half-recognizes in the audience — a detail that surfaces again only much later.`,
      blurb: `Mr. Wopsle's London debut as Hamlet is a gleeful catastrophe — the gallery helps him through every soliloquy while Pip and Herbert laugh against their will.`,
      summary: [
        `Pip and Herbert travel to a London theater to see their old village acquaintance Mr. Wopsle play the lead in Hamlet. The production is immediately chaotic: the audience treats the performance as interactive entertainment, helping the prince through his famous soliloquy with shouted yes and no answers, greeting the ghost with derision when it fumbles its ghostly manuscript, and rechristening the overbrassed Queen of Denmark 'the kettledrum.' The noble boy in the ancestral boots compounds the absurdity by playing a gravedigger, clergyman, strolling actor, and able seaman all in one evening.`,
        `Pip and Herbert find themselves laughing in spite of themselves, though they try to applaud out of loyalty to their townsman. After the performance Wopsle joins them at supper and discusses his interpretation of the prince at great scholarly length, seemingly unaware of the disaster. The evening is the novel's purest comic set piece — Dickens at his most theatrical, letting a London crowd destroy a provincial ambition with cheerful cruelty.`,
        `A small, unsettling note enters at the end of the chapter: Pip has noticed a face in the audience he cannot quite place, a face that watches him with what seems like recognition. He cannot identify it that evening and forces it to the back of his mind. The detail is planted quietly, in the manner of Dickens at his most controlled, and its significance will not emerge until the very different drama of the chapters ahead.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `voice-of-older-pip`, label: `The Voice of the Older Pip` }],
    },
    {
      n: 32,
      title: `The Nameless Shadow`,
      tourTitle: `Estella Comes to London`,
      hook: `A brief note from Estella sends Pip into rapturous anticipation; Wemmick takes him on a grim detour through Newgate Prison first.`,
      tour: `Pip receives a note from Estella announcing she will arrive in London by the midday coach and that he should meet her. His appetite vanishes and he knows no peace until the day comes. On his way to meet her, Wemmick intercepts him and takes him on a tour of Newgate Prison, introducing him to clients awaiting trial. The contrast is sharp and deliberate: Pip moves from the prison's human wreckage directly to collecting Estella from the coach, and feels contaminated by the prison's smell and atmosphere even as she arrives. She seems to notice something on him without naming it.`,
      blurb: `Estella's arrival note undoes Pip completely; a grim Newgate detour with Wemmick precedes their meeting, the prison's taint clinging to him as she steps from the coach.`,
      summary: [
        `Pip receives a note from Estella — the first she has ever written him — announcing her arrival by the midday coach from Miss Havisham's and asking him to meet her. The note undoes him. He cannot eat, cannot settle, and counts the hours in a state of helpless excitement that the older Pip narrates with rueful precision. The arrival of the day brings no peace: he wakes anxious and remains anxious until the moment the coach appears.`,
        `On his way to the coaching inn, Pip encounters Wemmick, who invites him on an impromptu tour of Newgate Prison. Wemmick moves through the prison cheerfully and professionally, greeting clients on remand, passing along small courtesies and encouragements with the manner of a man visiting an ordinary office. Pip finds the experience disturbing — the condemned cells, the waiting men, the whole mechanism of criminal justice concentrated in a single building — and feels its atmosphere on him like a stain when he leaves.`,
        `He collects Estella from the coach feeling obscurely soiled and half-convinced she will somehow sense what he has just seen. She appears more welcoming than usual, which he attributes to Miss Havisham's influence. She tells him she is going to Richmond to stay with a Mrs. Brandley, gives him her purse for expenses, and allows him to ride with her. The chapter places the prison and the beautiful woman in immediate sequence without editorializing — Pip, moving from one to the other, carries both.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `estella`, name: `Estella` }],
      themes: [{ slug: `fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 33,
      title: `Estella in London`,
      tourTitle: `Richmond`,
      hook: `Pip escorts Estella to Richmond; she is warmer than usual, and more openly cruel about it.`,
      tour: `Pip travels with Estella by carriage to Richmond, where she is to be installed at Mrs. Brandley's house to be 'shown off' in society. Estella is more openly friendly toward Pip on this journey than she has ever been — she looks at him while giving him her purse, calls him by his name, and treats him with the ease of someone who considers him a fixture of her life rather than an admirer to be managed. She also tells him with complete candor that she has no heart and no feelings, and that he should know this since he persists in attributing them to her. The conversation is characteristic: she is honest precisely where her honesty is most unkind.`,
      blurb: `Pip escorts Estella to her new Richmond residence; she is warmer than before and just as honest — telling him plainly she has no heart to give him.`,
      summary: [
        `Pip escorts Estella by carriage from London to Richmond, where she has been placed with Mrs. Brandley and her older daughter to be received into local society. Estella appears more welcoming toward Pip than she has previously allowed herself to be — Miss Havisham's influence is Pip's immediate explanation. She gives him her purse for the journey's expenses and looks at him while doing so in a way he cannot help reading as meaningful.`,
        `The journey gives them a rare sustained conversation. Estella tells Pip with characteristic directness that she has no softness in her, no sentiment, no heart to give — that he should understand this clearly since he persists in imagining otherwise. She is not cruel in the tone; she is merely honest, and the honesty is more disconcerting than cruelty would have been. Pip hears the words and registers them and does not believe them, which is his consistent response throughout the novel.`,
        `He delivers her to Mrs. Brandley's house and returns to London without her. The chapter is a brief pause in the plot's accumulation — an interlude between the Newgate episode and the coming complications — but it fixes Estella's character at an important moment: she is giving Pip every warning she can give and warning him in the clearest terms she has yet used. That she does this while being friendlier than usual is precisely the kind of ambiguity the novel returns to again and again.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `estella`, name: `Estella` }],
      themes: [{ slug: `miss-havisham-transmission-trauma`, label: `Miss Havisham and the Transmission of Trauma` }, { slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 34,
      title: `Debt and Drift`,
      tourTitle: `The Finches of the Grove`,
      hook: `Pip and Herbert slide into debt together, joining a dining club that consumes money and produces nothing — exactly the life of a London gentleman.`,
      tour: `Pip reflects on the effect his great expectations have had on his character. He has noticed the damage — the restlessness, the snobbery, the avoidance of anything that reminds him of the forge — but cannot fully account for his own moral failures because Estella is mixed up in every one of them. He and Herbert slide into debt together, joining the Finches of the Grove, a dining club whose sole object is the consumption of expensive dinners. Bentley Drummle is a member. Pip receives a letter from Trabb and Co. informing him of his sister's accident — she has been attacked and badly injured — and the chapter closes on that news.`,
      blurb: `Pip and Herbert fall into gentlemanly debt and a pointless dining club; a letter from home announces that Pip's sister has been violently attacked.`,
      summary: [
        `Pip reflects on what his great expectations have done to his character. He can see the damage clearly enough: the restlessness, the snobbery, the way Estella is so woven into his disquiet that he cannot separate his feelings about her from his feelings about everything else. He supposes that if he had had no expectations and still had Estella to think of, he would have done no better — but he is not sure, and the older Pip narrating the story cannot say either.`,
        `He and Herbert drift into serious debt. They begin by keeping late hours and late company, then on Startop's suggestion join a club called the Finches of the Grove, whose object is the spending of money at an expensive hotel in Covent Garden. Bentley Drummle belongs. Pip finds himself in debt in every direction, converting jewelry into cash, unable to see a way forward or a reason to look for one. He makes half-hearted attempts to examine his accounts with Herbert and they always end in wine and unresolved good intentions.`,
        `A letter arrives from Trabb and Co. informing Pip that his sister, Mrs. Joe, has been badly attacked. She has been found on the kitchen floor with her head badly injured, the result of an attack by an unknown person using a convict's leg-iron as the weapon. She is alive but in a grave condition, her speech and understanding permanently damaged. The chapter closes on this news — the first violent event in the novel to touch Pip's family directly, and a mystery that will not be fully resolved for several volumes.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 35,
      title: `Mrs. Joe's Funeral`,
      hook: `Pip returns to the forge for his sister's funeral — the grave opening the first gap in his road of life.`,
      tour: `Pip returns home for his sister's funeral. Mrs. Joe has lingered for some months in a semi-conscious state after the attack and has now died. Walking from the Blue Boar to the forge, Pip is struck by how completely the old landscape reconstitutes his childhood self. The funeral is managed by Trabb and Co. with their usual absurd ceremonial. Pip sits with Joe and Biddy and the neighbors through the service, feeling the strangeness of grief for a woman who had made his childhood miserable. Biddy tells Pip she thinks it was Orlick who attacked Mrs. Joe — Pip believes her and resolves to find a way to have Orlick discharged from Miss Havisham's employment where he has appeared. He also suspects, from Biddy's manner, that she has given up on him coming home.`,
      blurb: `Pip comes home for his sister's funeral, the first grave to open in his life; Biddy names Orlick as the likely attacker and quietly signals she expects nothing more from Pip.`,
      summary: [
        `Pip travels home for his sister's funeral. Mrs. Joe has died after months of decline following the attack — her speech and understanding never recovered. Walking to the forge through the summer countryside, Pip finds his childhood landscape pressing on him with unexpected force. He is swept by a wave of regret that has little to do with tenderness for his sister — he had never been tender about her — but is something closer to the shock of a familiar world suddenly diminished.`,
        `The funeral is conducted by Trabb and Co. with their customary ceremonial absurdity — the mutes in black bandages, the nodding plumes, the measured pace of grief-for-hire. Pip sits through it beside Joe, who is genuinely bereft. The neighbors fill the house afterward. Pip feels alien in a room that was once the whole of his world, and the feeling is one the older narrator describes with characteristic unsparingness.`,
        `That evening Pip walks with Biddy in the garden. She tells him she believes it was Orlick who attacked Mrs. Joe — she had seen the look he gave Mrs. Joe on an earlier occasion and the leg-iron used as a weapon confirmed her suspicion. Pip resolves to have Orlick removed from Miss Havisham's service. More significantly, he senses from Biddy's manner that she has stopped expecting him to return. When he insists he will come back more often, she receives the promise with a quietness that amounts to disbelief. The chapter ends with Joe seeing Pip off toward the Blue Boar, waving his arm until Pip can no longer see him.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }],
      themes: [{ slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }, { slug: `voice-of-older-pip`, label: `The Voice of the Older Pip` }],
    },
    {
      n: 36,
      title: `Coming of Age`,
      hook: `Pip turns twenty-one and meets Jaggers to learn his financial situation — and learns almost nothing.`,
      tour: `Pip turns twenty-one. He and Herbert have been looking forward to this birthday with great anticipation, convinced it must bring a revelation about the great expectations and their source. Pip receives an official invitation to call on Jaggers, and attends in high excitement. Jaggers informs him that he will receive five hundred pounds a year and that his benefactor has a further communication to make when Pip is ready. But Jaggers gives him no name, no timeline, no further information. Pip presses; Jaggers deflects. Pip leaves knowing nothing more than he knew before, though with five hundred pounds. He asks Wemmick afterward whether it is possible to find out who the benefactor is, and Wemmick, operating in his Little Britain mode, advises him strongly not to try.`,
      blurb: `Pip's twenty-first birthday brings five hundred pounds a year from Jaggers and no information whatsoever about his benefactor — the mystery deepens on a fixed income.`,
      summary: [
        `Pip turns twenty-one with expectations of revelation. Both he and Herbert have convinced themselves that this birthday must bring some clarification about the great expectations — a name, a timetable, an explanation. Pip receives an official summons to Jaggers's office at five in the afternoon and arrives in a state of suppressed excitement that he takes care not to show.`,
        `The meeting with Jaggers is a masterpiece of lawyerly non-disclosure. Jaggers informs Pip that he will now receive five hundred pounds per year and that his benefactor intends to make a further communication 'at a proper time.' When Pip asks who the benefactor is, Jaggers declines to tell him. When Pip asks when the proper time will be, Jaggers declines to say. The meeting ends with Pip having received money and no information, and having demonstrated, by Jaggers's patient amusement at his questions, that he was always going to receive exactly this.`,
        `Afterward Pip finds Wemmick in the outer office and asks him in private whether there is any legitimate way to discover his benefactor's identity. Wemmick, in his Little Britain mode — brisk, professional, walled — advises him strongly that such an inquiry would be inadvisable and would not succeed. Pip returns to Herbert and they count their money and try to be satisfied. The five hundred pounds is real enough; the mystery is as opaque as ever.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }],
    },
    {
      n: 37,
      title: `Wemmick's Plan`,
      tourTitle: `Wemmick's Walworth Self`,
      hook: `Pip visits Wemmick at the Castle and, appealing to his Walworth feelings, enlists his help for a secret plan to benefit Herbert.`,
      tour: `Pip visits Wemmick at the Castle on a Sunday, when Wemmick's Walworth self is in full operation — the drawbridge up, the Aged Parent warming his hands by the fire, the Union Jack flying. Pip has a request that requires Walworth sentiments rather than Little Britain professionalism: he wants to help Herbert establish himself in business, using some of his great expectations money. Wemmick, consulted at the Castle, is a different man from the office clerk — human, creative, willing to help. He identifies a merchant named Clarriker as a possible vehicle for the scheme and agrees to make quiet arrangements. The plan, which Pip funds secretly and without Herbert's knowledge, is the one genuinely good thing he will do with his expectations.`,
      blurb: `Pip visits the Castle on a Sunday to enlist Wemmick's human side in a secret plan to set Herbert up in business — the best use Pip ever finds for his money.`,
      summary: [
        `Pip visits Wemmick at home on a Sunday to consult his Walworth self about a private matter that his Little Britain self would be unable to help with. He arrives to find the drawbridge up and the Union Jack flying — Wemmick in full domestic mode. The Aged Parent is by the fire. After the usual hospitality, Pip explains his purpose: he wants to use some of his great expectations to secretly establish Herbert in a business partnership, without Herbert knowing who has funded him.`,
        `Wemmick, at Walworth, thinks this is a fine idea and takes it seriously. He is a different person here — warm, inventive, genuinely interested in Pip's welfare. He identifies a young merchant named Clarriker as the right vehicle: a man of good prospects who needs capital for a partnership and who would benefit from exactly the kind of quiet investment Pip is proposing. He agrees to make the arrangements discreetly, through channels that will prevent Herbert from tracing the money to Pip.`,
        `The scheme is the only entirely unselfish act Pip performs in the novel. He funds it from his great expectations — money he still believes comes from Miss Havisham — and he will never receive Herbert's gratitude directly, since Herbert never learns the truth. Dickens treats it without sentimentality: the chapter is warm and slightly comic, but the goodness of the act is allowed to stand on its own. When the money is spent and the scheme accomplished, it will be the one thing in the accounts of Pip's London life that he can look back on without shame.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 38,
      title: `Estella and Miss Havisham`,
      tourTitle: `Misery at Richmond`,
      hook: `Pip haunts Estella's Richmond life, suffering through every party and excursion; Miss Havisham urges him to love her while Estella watches with amusement.`,
      tour: `Pip's life in this period is organized around Estella's social calendar at Richmond. He accompanies her to picnics, operas, concerts, and parties, suffers every kind of jealousy and humiliation, and is unable to stop. Miss Havisham, when Pip visits Satis House, urges him to love Estella with increasing intensity — 'Love her, love her, love her!' — in a way that reveals the extent of her own obsession with the long revenge she has been conducting. Estella observes Miss Havisham's behavior toward Pip with a curious detached amusement. There is a scene where Estella and Miss Havisham quarrel, Estella maintaining that she is incapable of love even toward her adoptive mother, and Miss Havisham reacting with horror — a premonition of what the experiment she has conducted will eventually cost her.`,
      blurb: `Pip haunts Estella's Richmond life in perpetual misery; Miss Havisham exhorts him to 'Love her, love her!' while Estella and her adoptive mother have their first open quarrel.`,
      summary: [
        `Pip's social life in this chapter is entirely subordinated to Estella's. He attends every gathering she attends, follows her from London to Richmond and back, watches her manage admirers with cold efficiency, and suffers the jealousy of every man who speaks to her. He has one hour's happiness in her company for every twenty of wretchedness, and the older Pip records this with the unflinching self-knowledge that characterizes his retrospective narration. He cannot stop. He knows he cannot stop. He does not try.`,
        `At Satis House, Miss Havisham has been growing more urgent and more unsettling. She urges Pip — 'Love her, love her, love her!' — with an intensity that has stopped being about Pip's welfare and has become an expression of her own long obsession. She watches the effect of Estella on admirers with the satisfaction of a scientist watching an experiment succeed, and her satisfaction has a terrible quality: it is not pleasure in Pip's happiness but in Estella's power.`,
        `The chapter contains the first open quarrel between Estella and Miss Havisham. Estella tells her adoptive mother plainly that she has no love to give — not to Pip, not to Miss Havisham, not to anyone. Miss Havisham reacts with horror, accusing Estella of ingratitude and coldness. Estella receives the accusation without flinching and points out, with the calm precision of someone who understands her own formation, that she was raised this way. The scene is the novel's first direct confrontation between the weapon and the woman who forged it — and the horror on Miss Havisham's face is the first sign that she is beginning to understand what she has done.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `estella`, name: `Estella` }, { id: `miss-havisham`, name: `Miss Havisham` }],
      themes: [{ slug: `miss-havisham-transmission-trauma`, label: `Miss Havisham and the Transmission of Trauma` }, { slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 39,
      title: `The True Benefactor`,
      tourTitle: `The Convict Returns`,
      hook: `On a stormy night in Pip's London chambers, a stranger climbs the stairs — and Pip recognizes the convict from the marshes.`,
      tour: `Pip is twenty-three. Herbert is away in Marseilles. It is a stormy, wretched night in Garden Court by the river. A stranger climbs the stairs to Pip's rooms. When the man is inside and the lamp is raised, Pip recognizes him: the convict from the churchyard, Abel Magwitch. Magwitch reveals that he is Pip's benefactor. He has spent the sixteen years since his transportation in Australia building a fortune in sheep-farming, and he has devoted every penny of it to making Pip a gentleman. He is back in England illegally, on pain of death if discovered. Pip feels horror and revulsion — not gratitude. The chapter closes on Pip's dawning comprehension that the gentleman he has become was made by this man, and that everything he thought he knew about his life was wrong.`,
      blurb: `On a stormy night in his London chambers, Pip's real benefactor arrives: Abel Magwitch, the convict from the marshes, who has spent sixteen years making a fortune in Australia to make Pip a gentleman.`,
      summary: [
        `Pip is twenty-three and alone in his Temple chambers on a stormy night — Herbert in Marseilles, the wind shaking the house like cannon fire. A stranger climbs the stairs out of the rain. Pip lets him in and raises the lamp, and recognizes the convict from the churchyard who threatened him on Christmas Eve when he was seven years old. The man is older, roughened by the Australian sun and years of outdoor work, but unmistakably the same.`,
        `Magwitch tells Pip the truth. He was transported to Australia after the trial and has spent sixteen years in the sheep country, working hard and prospering, and every penny of prosperity has been sent back to England through the lawyer Jaggers to fund the gentleman Pip was becoming. He has come back to England illegally — transportation is for life, and return means the noose — because he wanted to see, with his own eyes, what his money had made. 'I've come to see my gentleman,' he says. 'And you're him.'`,
        `Pip's response is revulsion. Every comfortable assumption about his life collapses in the hour that follows: Miss Havisham is not his benefactor; Estella was not intended for him; the fortune that was supposed to remove him from the world of convicts and rough men was funded by a convict. He looks at the man sitting before him, proud and affectionate and oblivious to Pip's horror, and feels no gratitude and considerable disgust. The older Pip, narrating, does not minimize the moral failure. The chapter is the hinge of the entire novel — everything before it reads differently once it has been read.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `abel-magwitch`, name: `Abel Magwitch` }],
      themes: [{ slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 40,
      title: `The Danger of the Old Man's Return`,
      tourTitle: `The Problem of Provis`,
      hook: `Magwitch — now going by 'Provis' — must be hidden in London while Pip faces what to do next.`,
      tour: `Pip's immediate problem is practical: Magwitch cannot stay in his rooms and cannot be seen. Pip installs him under the assumed name Provis in nearby lodgings and sets about thinking. His first act the morning after is to establish that no one can have seen Provis arrive. He questions the watchman at the Temple gate and learns a second man had been on the stairs that stormy night — someone who slipped away when Pip came out. This detail lodges as a source of ongoing anxiety. Herbert returns from Marseilles and Pip tells him everything. Pip tries to weigh his position: Magwitch's money is tainted and he cannot use it; Magwitch is in England illegally and must not be discovered; Pip is responsible for the man's safety but cannot bring himself to feel anything approaching warmth.`,
      blurb: `Pip hides Magwitch as 'Provis' in nearby lodgings, tells Herbert everything, and faces the first practical crisis: someone was on the stairs that night.`,
      summary: [
        `The morning after Magwitch's arrival, Pip's first concern is whether anyone saw him come in. He questions the Temple watchman and learns there was indeed a second man on the stairs that stormy night — a man who slipped away when Pip emerged. The watchman cannot describe him further. The information settles in Pip as a permanent low-level alarm: there is someone who may know Magwitch is in London, and Pip does not know who.`,
        `He installs Magwitch in nearby lodgings under the name Provis — an assumed identity Magwitch adopts for his time in London — and begins the larger problem of how to manage the situation. Magwitch is in England illegally; the penalty for a transported man's return is death. If he is discovered, Pip will be implicated. More immediately, the fortune built up and sent to England over sixteen years will be forfeit to the Crown if Magwitch is arrested: Pip cannot touch the money and knows it.`,
        `Herbert returns from Marseilles, and Pip tells him everything. Herbert receives the news with dismay and loyalty in equal measure — the dismay is for the situation, not for Pip. The two of them sit before the fire and try to think clearly. Pip's moral position is the thing the older narrator is most precise about: he feels responsible for Magwitch's safety and cannot feel any warmth toward the man who has funded his life, and the gap between those two facts is where the coming chapters will do their work.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `abel-magwitch`, name: `Abel Magwitch` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 41,
      title: `Herbert Learns the Truth`,
      tourTitle: `Herbert's Distress`,
      hook: `Herbert and Pip confront what Magwitch's return actually means — and Magwitch, delighted by Herbert, lectures him on not being 'low.'`,
      tour: `The three of them — Pip, Herbert, and Magwitch — sit before the fire and Pip tells Herbert the whole story while Magwitch listens with proprietorial pride. Herbert's distress mirrors Pip's. Magwitch, oblivious to the effect his presence is producing, is expansive and affectionate, and at one point begins instructing Herbert on the importance of not being 'low' — a reminder to both of them that Magwitch's moral universe and theirs are separated by an unbridgeable distance. After Magwitch finally leaves, Pip and Herbert assess their situation. Herbert argues that Pip cannot honourably keep taking money now that he knows its source. Pip agrees. Neither knows what to do. The chapter documents the friendship between Pip and Herbert at its most functional: two young men trying to think honestly in a situation that has no clean solution.`,
      blurb: `Pip tells Herbert everything; Magwitch lectures them both on not being 'low' while they listen in dismay — Herbert's quiet loyalty is the chapter's real moral.`,
      summary: [
        `With Magwitch present, Pip tells Herbert the full story. Herbert receives it with the shock and distress Pip expected, and Magwitch — misreading Herbert's reaction as diffidence — is generous and expansive toward his new acquaintance. He begins to lecture Herbert on the importance of not being 'low,' apparently convinced that his own rise from convict to sheep farmer provides relevant moral instruction for a London gentleman's friend. The scene is simultaneously comic and painful.`,
        `After Magwitch leaves, Pip and Herbert sit alone and try to think clearly about their situation. Herbert raises the central moral question: now that Pip knows where the money comes from, can he honorably continue to receive it? They agree he cannot. But what follows from that agreement is less clear. Pip cannot repay what has already been spent. He cannot earn his own way in any obvious direction. He has no profession, no savings, and no prospects beyond the fortune he has just decided he cannot use.`,
        `Herbert, characteristically, focuses on what can be done rather than what cannot. He suggests that getting Magwitch safely out of England should be the first priority — after that, Pip can decide about his own future. The plan that eventually emerges — rowing Magwitch downriver to a foreign steamer — begins to form here in outline. Herbert's practical kindness is the chapter's real moral center. He never reproaches Pip for the situation and never suggests that Pip's welfare is less important for having been purchased by a convict's gratitude.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `abel-magwitch`, name: `Abel Magwitch` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 42,
      title: `Magwitch's History`,
      tourTitle: `Magwitch's Life`,
      hook: `Magwitch tells his story: orphan, criminal, the long rivalry with Compeyson — and a name that changes everything.`,
      tour: `Magwitch tells his own story, in his own words, for the first time. He was nobody — no parents, no name that mattered, raised from infancy in jails and workhouses, taken up and imprisoned so often that being 'hardened' was decided by the prison authorities before he could have been guilty of anything much. The other convict from the marshes, Compeyson, surfaces in the story as the man who used Magwitch repeatedly, involving him in forgery and fraud while staying well behind him to avoid the worst consequences when they were caught. At the trial, Compeyson's gentleman's manners and appearance got him a lighter sentence while Magwitch received the maximum. The story also contains the shadow of a woman — a young wife Magwitch had, who was tried for murder and acquitted, and whom he has not seen since. Pip and Herbert, listening, are beginning to understand more than they let on.`,
      blurb: `Magwitch tells his story from the beginning: the orphan nobody, the years of prison, and the gentleman Compeyson who used him and then ensured he took the heavier sentence.`,
      summary: [
        `Magwitch tells his story in his own voice — direct, unvarnished, in the dialect of a man who never had the luxury of softening his history. He was born nobody: no parents traceable, no fixed address, no name anyone thought worth giving him properly. He grew up in and out of jails and workhouses, labeled hardened before he could have earned the label, and fell early into a pattern of crime that was partly necessity and partly the only path open to him.`,
        `Compeyson enters the story as the man who became Magwitch's partner in forgery and fraud. Compeyson is everything Magwitch is not: educated, plausible, well-spoken, with the manner of a gentleman and the instincts of a predator. He involved Magwitch in criminal schemes and arranged matters so that when they were caught, Compeyson appeared before the court as a man led astray by a hardened criminal, while Magwitch appeared as the criminal who had led him. The sentences reflected the difference: Compeyson's gentleman's manner earned him seven years; Magwitch received fourteen.`,
        `There is also a young woman in the story — a wife Magwitch had briefly, wild and beautiful, who was tried for murder and acquitted through brilliant lawyering, and who has not been seen since. Pip and Herbert exchange a glance: both of them are beginning to understand something about who this woman might be, and the network of connections between the novel's seemingly separate characters is pulling tighter. The chapter is the second-to-last piece of exposition — after this, the plot moves.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `abel-magwitch`, name: `Abel Magwitch` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }],
    },
    {
      n: 43,
      title: `Drummle at the Inn`,
      tourTitle: `Pip Goes to Satis House`,
      hook: `Pip travels to see Estella and Miss Havisham before any escape attempt — and finds Drummle at the same inn.`,
      tour: `Pip resolves to visit Miss Havisham and Estella before making any arrangements for Magwitch's escape — both because he needs to confront what Miss Havisham has and has not done, and because he is not sure he will ever see Estella again afterward. At the inn in the town he encounters Bentley Drummle, who makes it clear by his manner that he is there to see Estella. The encounter is nasty and brief — the two men despise each other — and Pip leaves for Satis House in a worse state than he arrived. A new fear has also crystallized: if Compeyson is alive and has learned of Magwitch's return, the danger is doubled. Pip has told no one about Estella and Provis together — and he resolves he never will.`,
      blurb: `On the way to see Miss Havisham and Estella before the escape plan begins, Pip encounters Bentley Drummle at the inn — there to court Estella — which makes a bad situation worse.`,
      summary: [
        `Pip resolves to visit Miss Havisham and Estella before any escape from England becomes possible. He tells Herbert that this visit must come first: there are things that need to be said to Miss Havisham, and he is not sure he will have another opportunity. The visit is also driven, as the older narrator notes with characteristic honesty, by the impossibility of simply leaving Estella without seeing her again.`,
        `At the inn in the market town near Satis House, Pip encounters Bentley Drummle. The encounter is brief and quietly savage: Drummle makes it clear he is there for Estella, Pip responds with barely contained contempt, and the two men part without civil words. The sight of Drummle — heavy, brutal, and apparently successful in his pursuit of Estella — increases Pip's wretchedness measurably.`,
        `A new dimension of fear has also emerged in Pip's thinking. Magwitch's story about Compeyson — the gentleman-criminal who ensured Magwitch took the heavier sentence — suggests that Compeyson is still alive, may have known of Magwitch's return, and may have been the figure on the stairs that stormy night. If Compeyson has reported Magwitch to the authorities, the escape plan is already compromised. Pip cannot yet know. He goes forward to Satis House carrying this fear alongside the others.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `estella`, name: `Estella` }],
      themes: [{ slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `miss-havisham-transmission-trauma`, label: `Miss Havisham and the Transmission of Trauma` }],
    },
    {
      n: 44,
      title: `Confronting Miss Havisham`,
      tourTitle: `The Confession at Satis House`,
      hook: `Pip confronts Miss Havisham about what she allowed him to believe; then tells Estella he loves her — and she tells him she is marrying Drummle.`,
      tour: `Pip meets Miss Havisham and Estella in the candlelit room. He tells Miss Havisham that he knows she is not his benefactor, and that she allowed him to believe she was, and that people he cares about have been harmed by the deception. Miss Havisham, for the first time, shows something approaching remorse. Then Pip turns to Estella and tells her, with all the directness he has been unable to summon before, that he loves her and has always loved her and will go on loving her regardless of what she says. Estella receives this with compassion but without any softening of her position. She is engaged to Bentley Drummle. She explains, without apology, that she is marrying him. Pip goes out into the night in a state of extreme misery.`,
      blurb: `Pip tells Miss Havisham what she allowed him to believe; then confesses his love to Estella, who receives it with genuine compassion and tells him she is marrying Drummle.`,
      summary: [
        `Pip finds Miss Havisham and Estella in the lit room at Satis House. He speaks plainly to Miss Havisham: he knows she is not his benefactor; he knows she allowed him to believe she was; he wants her to understand that people who trusted her have been damaged by the misapprehension she permitted. Miss Havisham, visibly disturbed, does not deny the charge. She expresses something that looks, for the first time, like genuine remorse.`,
        `Pip then turns to Estella and confesses his love — not in the oblique, half-formed way of his earlier declarations, but clearly and fully. He tells her he loves her, has always loved her, and will go on loving her regardless of what she says or does. Estella receives this with what Pip cannot help recognizing as genuine feeling — not the feeling he wants, but something real. She is sorry. She cannot help what she has been made. And she is going to marry Bentley Drummle.`,
        `The announcement undoes what remained of Pip's composure. He argues; she listens; she does not change her answer. She explains that she is not under illusions about Drummle — she knows exactly what he is — but that she has no better or worse option available, since she cannot love anyone and Drummle at least does not ask her to. Pip walks out into the dark and the misery of the walk back to London that night is one of the most honestly described passages in the novel.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `estella`, name: `Estella` }, { id: `miss-havisham`, name: `Miss Havisham` }],
      themes: [{ slug: `miss-havisham-transmission-trauma`, label: `Miss Havisham and the Transmission of Trauma` }, { slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 45,
      title: `Wemmick's Warning`,
      tourTitle: `The Warning Note`,
      hook: `A warning note tells Pip not to go home; he spends a miserable night at an inn, then goes directly to Wemmick.`,
      tour: `Returning to London after the disaster at Satis House, Pip finds a note at the Temple gate warning him: 'Don't go home.' He goes instead to an inn in Covent Garden called the Hummums, where he spends a wretched night tormented by anxiety. In the morning he goes directly to Wemmick at his office before seeing anyone else, trusting only Wemmick's Walworth feelings with what concerns Magwitch. Wemmick tells him that Compeyson is alive and active, that Magwitch's return has been noticed, and that his chambers have been watched. He advises Pip that Provis must be moved at once from his current lodgings to somewhere safer — and identifies the house of Herbert's fiancée Clara Barley as a possible refuge near the river.`,
      blurb: `A warning note keeps Pip from his rooms; a wretched night at an inn leads to Wemmick, who confirms Compeyson is active and Magwitch's lodgings are known.`,
      summary: [
        `Returning to London after the catastrophe at Satis House, Pip finds a note at the Temple gate reading 'Don't go home.' He takes the warning seriously and goes to an inn — the Hummums in Covent Garden — where he spends a wretched night. The physical discomforts of the room — the smell of cold soot, the inadequate light, the general unwholesomeness — are the external register of Pip's internal state: he cannot sleep, cannot think clearly, cannot escape the twin catastrophes of Estella's engagement and the danger to Magwitch.`,
        `In the morning he goes to Wemmick's office before seeing anyone else, operating on the correct instinct that only Wemmick's Walworth self can be trusted in this matter. Wemmick confirms what Pip feared: Compeyson is alive, has been active in London, and the danger to Magwitch is real. Someone has been watching Pip's chambers. Magwitch's current lodgings are known, or will be known shortly.`,
        `Wemmick advises immediate action. He identifies the house of Herbert's intended, Clara Barley, near the Thames in the working riverside district, as a possible safe house: it is not connected to Pip, it is near the river (which is important for the eventual escape plan), and Clara's father is an invalid who barely registers visitors. The plan to move Magwitch begins to take shape here, and the chapter closes with Pip having something to do — which is, for the moment, what he most needs.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 46,
      title: `The River House`,
      tourTitle: `Mill Pond Bank`,
      hook: `Pip visits the riverside house where Magwitch will be hidden, meets Clara, and begins his daily rowing practice on the Thames.`,
      tour: `Pip visits Mill Pond Bank, the riverside neighborhood where Clara Barley lives with her invalid father. The house is modest and the setting is industrial — boat-builders, mast-makers, river traffic. Clara is everything Herbert has described: warm, competent, steady, and genuinely fond of her difficult father. Magwitch is to be moved here, where he can be concealed among the working riverside community and where proximity to the river will facilitate his eventual escape by boat. Pip institutes a daily routine of rowing on the Thames — apparently for exercise, in reality to make himself and his boat a familiar sight on the river so that when the time comes to row Magwitch to a foreign steamer, no one will think the departure unusual.`,
      blurb: `Pip visits the riverside house at Mill Pond Bank where Magwitch will hide; Clara is everything Herbert promised, and Pip begins daily rowing to normalize his presence on the river.`,
      summary: [
        `Pip navigates the unfamiliar working waterfront east of London Bridge to reach Mill Pond Bank and the house where Clara Barley lives with her father. The landscape is the novel's first sustained portrait of working-class industrial London — shipbreakers' yards, ooze and old anchors, the smells of timber and river mud. Herbert is at the house when Pip arrives and introduces Clara: she is everything he has described, and better.`,
        `The plan for Magwitch is set. He is to be moved from his current lodgings to a room at Clara's house, where he can be concealed. He is to go by the river rather than through the streets, to minimize the risk of recognition. Once installed at Mill Pond Bank, he is to wait until an opportunity presents itself to board a foreign steamer going downriver — Pip and Herbert will row him out to meet it in the small hours, at a prearranged point below Gravesend.`,
        `To prepare for this, Pip begins rowing on the Thames every day. The habit is deliberate: he wants his boat and his face to become familiar sights on the river, so that when the escape attempt is made, his presence on the water will attract no particular attention. He rows past Mill Pond Bank regularly to keep contact with Magwitch without visiting openly. The chapter is one of the novel's most carefully constructed — it shows Pip being genuinely effective, genuinely selfless, genuinely brave, in a situation where none of that was required of him by anything except his own sense of obligation.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `abel-magwitch`, name: `Abel Magwitch` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 47,
      title: `Waiting for Wemmick`,
      tourTitle: `Waiting`,
      hook: `Weeks pass with no signal from Wemmick; Pip's finances collapse and a growing certainty tells him Estella has married Drummle.`,
      tour: `Time passes in a state of suspended anxiety. Pip waits for Wemmick's signal that the moment to move is right, and Wemmick gives no sign. Pip continues his daily rowing, managing Magwitch's concealment, and watching his own finances deteriorate — he is selling jewelry to pay bills. He becomes increasingly certain that Estella has married Drummle, though he avoids newspapers and does not ask Herbert to confirm it. He attends a theatrical entertainment and sees Mr. Wopsle again, who tells him afterward — with enormous theatrical solemnity — that during the performance he saw someone seated behind Pip whom he recognized from the marshes long ago. It is the first indication that Compeyson has been watching Pip directly.`,
      blurb: `Weeks of waiting with no signal from Wemmick; Pip's money runs out, Estella is almost certainly married, and Mr. Wopsle spots Compeyson sitting directly behind Pip at the theater.`,
      summary: [
        `Weeks pass without a signal from Wemmick. Pip keeps rowing, keeps visiting Magwitch by night, keeps managing the concealment. His financial position worsens: he is converting jewelry to cash, pressed by creditors, unable to spend Magwitch's money and unable to earn any of his own. He has convinced himself that continuing to maintain Magwitch at Mill Pond Bank is not a use of the tainted money, since the man's safety is not a financial indulgence — but the distinction grows harder to sustain as the bills pile up.`,
        `He has become almost certain that Estella has married Drummle. He avoids the newspapers to delay the confirmation, and asks Herbert never to speak of her to him. The older narrator observes that this avoidance was irrational — the fact was all but certain regardless of his knowing it — but that he could not help clinging to the small uncertainty as if it were something.`,
        `At a theatrical evening, Pip encounters Mr. Wopsle again. After the performance, Wopsle takes Pip aside and describes, with theatrical intensity, something he noticed during the show: a man seated directly behind Pip whom Wopsle recognized from the marshes years ago — from the night the two convicts were recaptured. Wopsle means Compeyson. Pip does not reveal the name or what it means, but the information hits him like physical danger. Compeyson has been watching him — close enough to sit behind him at the theater. The escape plan becomes urgent.`
      ],
      appears: [{ id: `pip`, name: `Pip` }],
      themes: [{ slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 48,
      title: `Molly's Hands`,
      hook: `Walking with Jaggers, Pip notices Molly the housekeeper's hands and understands who Estella's mother must be.`,
      tour: `Pip encounters Jaggers in Cheapside and they dine together at Jaggers's house in Gerrard Street, with Wemmick present. At the dinner, watching Molly the housekeeper serve and clear, Pip is suddenly seized by a recognition he cannot immediately articulate: Molly's face, her hands, her movements remind him of someone. He works it out in the course of the evening — Molly looks like Estella. The likeness is unmistakable once he has seen it. On the walk home, he tells Wemmick what he has observed, and Wemmick, carefully staying within the limits of what he can say, tells him enough about Molly's history — the murder trial, the acquittal, the years in Jaggers's service — to confirm what Pip has already concluded. Molly is Estella's mother.`,
      blurb: `At dinner with Jaggers, Pip watches Molly serve and recognizes the unmistakable likeness to Estella; Wemmick, walking home, confirms it without naming it.`,
      summary: [
        `Pip meets Jaggers in Cheapside and is invited to dinner at his house in Gerrard Street, where Wemmick is also present. It is an unusual dinner — Jaggers is an unusual host, cross-examining his guests with the same professional precision he applies in court — and Pip is distracted throughout by an impression he cannot place.`,
        `Watching Molly the housekeeper move around the table, Pip is struck by a resemblance he cannot immediately identify. He watches her hands — strong, work-worn, scarred — and her face, and a memory begins to surface. By the end of the evening it has arrived: Molly looks like Estella. The resemblance, once seen, is exact — the same hands, the same quality of movement, the same cast of features. The implication is obvious.`,
        `On the walk home, Pip questions Wemmick about Molly's history. Wemmick, operating within the professional limits he cannot cross, tells Pip enough: that Molly was tried for murder years ago, that she was defended by Jaggers in a case that made his reputation, that she was acquitted, and that she has been in his service ever since. The child she had at the time of the trial was given away. Pip does not press further — he has everything he needs. Estella is Molly's daughter, and Magwitch is Estella's father. The social geography of the novel has completed its circuit.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `estella`, name: `Estella` }],
      themes: [{ slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `miss-havisham-transmission-trauma`, label: `Miss Havisham and the Transmission of Trauma` }],
    },
    {
      n: 49,
      title: `Miss Havisham Burns`,
      hook: `Miss Havisham begs Pip's forgiveness on her knees; moments later she catches fire before him and he drags her from the flames.`,
      tour: `Pip receives a note from Miss Havisham and returns to Satis House. She receives him in the same lit room, but she is changed: humbled, genuinely remorseful, stripped of her old authority. She asks his forgiveness for what she allowed him to believe, and for what she did to Estella. She asks him to tell her what he needs to understand about Herbert's investment so that she can quietly provide the money — it is the first genuinely generous act of her life. She writes a cheque. Then, as Pip wanders the decaying house before leaving, he looks back through the doorway and sees her dress catch fire from the embers of the room's grate. He rushes in and beats out the flames with his coat, burning his hands and arms badly in the process. Miss Havisham survives, barely, with severe burns over much of her body.`,
      blurb: `Miss Havisham begs forgiveness and funds Herbert's business; minutes later her dress catches fire and Pip burns his arms pulling her free — her mechanism of vengeance consuming its own author.`,
      summary: [
        `A note from Miss Havisham brings Pip back to Satis House one last time. He finds her in the room with the rotted wedding cake — the same room, the same candles, the same stopped world — but Miss Havisham herself is different. She is contrite. She asks his forgiveness plainly and receives his answer, which is measured and honest rather than warm. She asks what she can do for Herbert Pocket, whose investment she now knows Pip arranged, and Pip tells her the amount needed to complete the partnership with Clarriker. She writes a cheque without comment.`,
        `As Pip moves through the decaying rooms of Satis House before leaving — pausing in the empty chambers where the wedding feast once stood — he looks back through a doorway and sees Miss Havisham on fire. A stray ember from the old grate has caught her dress, and the ancient fabric goes up almost instantly. Pip rushes in, pulls her down, throws tablecloth and coat over her, and beats out the flames with his burning hands. When it is over, she is on the floor and Pip's hands and arms are badly injured.`,
        `Miss Havisham is removed to a bed in the house, badly burned. She is alive and will linger for some weeks. In her delirium she calls out to Pip, repeatedly, asking if she has forgiven him — the grammar is inverted, and in the inversion Dickens gives her her full complexity: the woman who caused the damage cannot, even in extremis, entirely relinquish the old posture of control. Pip's burns, which will take weeks to heal, make him temporarily useless for the escape plan — which cannot wait.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `miss-havisham`, name: `Miss Havisham` }],
      themes: [{ slug: `miss-havisham-transmission-trauma`, label: `Miss Havisham and the Transmission of Trauma` }, { slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 50,
      title: `Estella's Parents`,
      tourTitle: `Herbert's Discovery`,
      hook: `Recovering from his burns, Pip hears from Herbert what Magwitch has told him about his young wife — and the pieces lock together.`,
      tour: `Pip is laid up with his burned arms at their chambers. Herbert nurses him through the first days. While tending to Pip, Herbert passes on what Magwitch has told him in private during Pip's absence: the story of Magwitch's young wife, the murder trial, and the child. Magwitch told Herbert that the woman swore to him she would destroy the child — he never knew whether she did. Pip, who has already recognized Molly and worked out Estella's parentage, now has the final confirmation from Magwitch's own account. He tells Herbert what he knows. The parentage is now fully established: Magwitch is Estella's father, Molly is her mother, Jaggers defended the mother at trial, and Miss Havisham adopted the child and raised her to be a weapon. Herbert and Pip agree that this information is to go no further.`,
      blurb: `Recovering from his burns, Pip hears Magwitch's account of his wife and child from Herbert — confirming what he already knew: Estella is Magwitch's daughter.`,
      summary: [
        `Pip convalesces at the Temple chambers, his arms badly burned and painful, unable to do anything useful. Herbert tends to him devotedly — changing the bandages, keeping him company, managing the situation at Mill Pond Bank in Pip's absence. The recovery takes longer than they want, and the escape plan waits.`,
        `During this convalescence, Herbert passes on something Magwitch told him privately. Magwitch had a young wife who was tried for the murder of another woman — a rival — and was defended at trial by a brilliant lawyer who secured her acquittal. After the trial, she disappeared from Magwitch's life. He never saw her again. More painfully: before the trial, in the extremity of the crisis, she had told him she would destroy their child. Magwitch has never known whether she did.`,
        `Pip tells Herbert what he knows: that Molly is the woman, that Jaggers was the defending lawyer, that the child was not destroyed but given away to Miss Havisham and raised as Estella. The circuit is complete. Herbert and Pip agree that none of this should be shared further — not with Magwitch, who has lived decades not knowing his daughter is alive; not with Estella, who does not know who her parents are; and especially not with Jaggers, who has arranged his knowledge of all parties with the professional care of a man who knows exactly which truths must be kept separate.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `abel-magwitch`, name: `Abel Magwitch` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `miss-havisham-transmission-trauma`, label: `Miss Havisham and the Transmission of Trauma` }],
    },
    {
      n: 51,
      title: `Jaggers Confirms It`,
      tourTitle: `Jaggers Confirms Everything`,
      hook: `Pip challenges Jaggers about Estella's parentage; Jaggers deflects until Wemmick's presence breaks open the conversation.`,
      tour: `Pip goes to Jaggers's office and confronts him directly about Estella's parentage — Molly as her mother, Magwitch as her father. Jaggers is professionally impenetrable for most of the conversation, deflecting every question. Then Wemmick enters, and something shifts: the presence of his clerk, who knows Pip's full situation, seems to affect Jaggers's usual armor. He confirms, without quite confirming, what Pip already knows. He also explains his own reasoning in placing the child with Miss Havisham years ago: he saved one child from one life — he could not save all children from all lives, but he could do this one thing. It is the closest Jaggers comes to revealing a moral interior. The chapter is a study in two kinds of self-protection: Jaggers's legal-professional armoring, and the single humane act it barely conceals.`,
      blurb: `Pip confronts Jaggers about Estella's parentage; Jaggers deflects with professional precision until Wemmick's presence cracks the armor and he confirms it — and reveals why he placed the child with Miss Havisham.`,
      summary: [
        `Pip goes to Little Britain and confronts Jaggers directly. He lays out what he knows: Molly is Estella's mother; Magwitch is Estella's father; Jaggers defended Molly at trial and afterward placed the child with Miss Havisham. He asks Jaggers to confirm it. Jaggers responds with the professional evasion of a lifetime: he neither confirms nor denies, deflects every direct question, and reminds Pip — not unkindly — that what Pip thinks he knows and what Pip can demonstrate are different things.`,
        `Wemmick enters. His presence changes the dynamic in ways that Pip observes without fully understanding. Jaggers, looking at both of them, appears to arrive at a decision. He confirms the essential facts — not in the way a man confesses, but in the way a man allows a conclusion to be drawn. Yes, Molly is the woman; yes, he defended her; yes, there was a child; yes, the child was placed elsewhere. He does not say with whom. He does not need to.`,
        `Then Jaggers does something he has never done in the novel before: he explains himself. He says that he looked at the child and decided to give her a better chance — that one could not save every child born into misery, but one could sometimes save one. The reasoning is utilitarian and completely characteristic of him, and it is also the first evidence in the novel that he has ever done anything for a reason other than professional advantage. The older Pip, narrating, gives Jaggers full credit for the act while remaining clear-eyed about the man.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `estella`, name: `Estella` }],
      themes: [{ slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 52,
      title: `Herbert's Good News — and a Letter`,
      tourTitle: `Herbert's Good News`,
      hook: `Pip completes the Clarriker arrangement for Herbert; a letter from Wemmick finally signals the moment to move.`,
      tour: `Pip's left arm is healing slowly but his right is more useful. He goes to Clarriker's and completes the business arrangement that will establish Herbert as a partner — the scheme he began in Wemmick's Walworth garden. It is the one good thing he has done with his expectations and he does it without Herbert knowing. Then a letter arrives from Wemmick by post — cryptically worded but clearly a signal: the moment to move Magwitch is now. The chapter is brief and functional, a gear-change in the novel's machinery, moving from the quiet convalescent period into the action of the escape attempt.`,
      blurb: `Pip completes Herbert's business arrangement — his one good use of the great expectations — then receives Wemmick's signal: the escape attempt must begin.`,
      summary: [
        `Pip goes to Clarriker's office and completes the financial arrangement that establishes Herbert as a partner in the firm. The transaction is simple and final. Herbert will eventually learn that a partnership has been arranged on his behalf; he will never learn who funded it. Pip's satisfaction in having done this one genuinely good thing is the novel's most private moral moment — the older narrator does not editorialize on it, but the reader knows what it cost and what it means.`,
        `Clarriker tells Pip that the firm plans to open a branch in the East — Cairo — and that Herbert in his new capacity will go out to manage it. Herbert does not yet know this. Pip is moved by the picture of Herbert's future happiness: a partnership, a purpose, Clara Barley, a life in prospect. It is the future Pip helped to make possible, and it is the future Herbert will actually have while Pip's own prospects remain uncertain.`,
        `A letter arrives from Wemmick. It is carefully worded — all communication about Magwitch has been oblique by necessity — but the meaning is clear: conditions are right, the danger has shifted, and the escape attempt should be made now. Pip reads the letter, understands it, and immediately begins to plan. The chapter is short — a pivot point rather than a full scene — but the pivot is decisive.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }, { slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }],
    },
    {
      n: 53,
      title: `The Sluice House`,
      tourTitle: `The Limekiln Trap`,
      hook: `A summons lures Pip alone to the marshes at night — where Orlick is waiting to kill him.`,
      tour: `Pip receives a letter summoning him to the marshes that night for information bearing on his expectations, signed with initials he does not recognize. He goes alone, not telling Herbert. On the marshes at night, he reaches the limekiln and finds Orlick. Orlick has arranged this meeting deliberately: he blames Pip for his dismissal from Miss Havisham's service, among other grievances accumulated over years, and intends to kill him and dispose of the body in the lime. He keeps Pip bound and lectures him at length — including the revelation that Orlick was the man on the stairs that stormy night when Magwitch arrived, and that Orlick has been in communication with Compeyson. At the last moment, Herbert and Startop burst in — Herbert having found the note and followed. Pip is saved, battered, and taken back to London.`,
      blurb: `A forged letter lures Pip alone to the marshes at night, where Orlick has him bound at the limekiln and confesses to attacking Mrs. Joe — before Herbert and Startop arrive in time.`,
      summary: [
        `A mysterious letter summons Pip to the marshes near his childhood home, claiming to have information about his expectations. Pip goes alone, rashly, without telling Herbert or Wemmick. On the dark marshes, guided by the burning lime, he reaches the kiln and is immediately seized by Orlick — the former journeyman at Joe's forge, the man Biddy long suspected of attacking Mrs. Joe.`,
        `Orlick keeps Pip bound and delivers his resentments at length: Pip got him dismissed from Miss Havisham's service; Pip had always been in his way; Pip was responsible, by Orlick's accounting, for everything that had gone wrong in his life. He also reveals that he was the man on the stairs on the stormy night — that he was in Compeyson's pay, watching Pip, and that Compeyson knows about Magwitch's return. Most damaging for the escape plan: information has been passed, and time is very short.`,
        `Orlick intends to kill Pip and burn the evidence in the lime. He is taking his time about it. At the last possible moment — Herbert having found the letter Pip carelessly left behind, recognized the danger, gathered Startop, and raced to the marshes — there is a commotion at the kiln door. Orlick flees into the dark. Pip is rescued, shaken and bruised. They make their way back to London in the small hours. The escape attempt must happen immediately.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `fraud-of-gentility`, label: `The Fraud of Gentility` }],
    },
    {
      n: 54,
      title: `The Escape Attempt`,
      tourTitle: `The River Escape`,
      hook: `Pip, Herbert, and Startop row Magwitch downriver toward a foreign steamer — and Compeyson's boat appears from the shore.`,
      tour: `The escape attempt. On a March morning of cold sunlight and wind, Pip, Herbert, and Startop row Magwitch downriver from the Temple stairs. The plan is to row to below Gravesend, where a Hamburg steamer is expected, and transfer Magwitch aboard. They have been practicing for this for weeks. The day goes well until they approach the steamer — at which point a police galley closes in from the bank. Compeyson is in the galley and has tipped the authorities. Magwitch throws himself over the side of the boat toward Compeyson; the boats collide; the steamer passes overhead. Compeyson drowns. Magwitch is pulled from the water alive but gravely injured — he has broken ribs and a damaged lung — and is taken into custody. He will not escape England. He will die before he can be hanged.`,
      blurb: `The river escape begins perfectly and ends in catastrophe: a police galley closes in, Magwitch and Compeyson go into the river, Compeyson drowns, and Magwitch is taken gravely injured.`,
      summary: [
        `On a cold, sunlit March morning, Pip and his companions carry out the escape plan. They collect Magwitch from Mill Pond Bank and pull out into the Thames with careful casualness, four men in a rowing boat on a busy river. The day is long and the rowing hard, but everything goes according to plan through the long reaches below Gravesend. They eat cold food in the boat and wait for the Hamburg steamer that is their target.`,
        `As the steamer approaches and they move to intercept it, a galley from the shore cuts them off. It is a police boat, and Compeyson is identifiable among those on board. Magwitch has only an instant's warning. He throws himself across the boat toward Compeyson before the police can act; the two men go into the river together; the Hamburg steamer passes over the site where they went in, its paddle wheel churning the water.`,
        `Magwitch is pulled out alive but gravely hurt: two broken ribs, a punctured lung, river water in him. He cannot be moved far. He is arrested on the spot and taken into custody. He is calm. He tells Pip not to worry about him. Compeyson's body will be found miles downriver; there will be no testimony against Magwitch from that quarter. But it does not matter: Magwitch is a transported man who returned to England, and that fact alone is enough to hang him, once he is well enough to be tried.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `abel-magwitch`, name: `Abel Magwitch` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 55,
      title: `Magwitch in Custody`,
      tourTitle: `Herbert Leaves for Cairo`,
      hook: `Magwitch awaits trial in prison; Herbert breaks news about Cairo; Pip faces the end of the life he has known.`,
      tour: `Magwitch is committed for trial at the next Sessions. The case is straightforward: he is a transported man who returned. His fortune is forfeit to the Crown. Pip retains Jaggers to petition for some part of it, though Jaggers is not optimistic. Herbert comes home one evening with the news Pip had already heard from Clarriker: the firm is establishing a branch in Cairo, and Herbert is to go out and run it. He also asks Pip to come to Cairo with him once everything here is settled. The offer is genuine and the alternative it represents — a useful life abroad, away from everything the great expectations have cost him — begins to be visible to Pip as the only realistic future.`,
      blurb: `Magwitch is committed for trial, his fortune forfeit; Herbert announces his Cairo appointment and invites Pip to join him — the first glimpse of a life after the great expectations.`,
      summary: [
        `Magwitch is transferred from police custody to the prison hospital, badly injured from the river. He is committed for trial at the next Sessions — a formality, since the charge of returning from transportation admits no defense. The fortune he built in Australia over sixteen years is forfeit to the Crown. Jaggers, retained by Pip to petition for some of it, is not encouraging: the law in such cases is clear, and clear laws are Jaggers's speciality.`,
        `The body of Compeyson is found downriver, disfigured by the steamer's paddle wheel, identifiable only by documents in his pocket. The man who meant to testify against Magwitch is dead, but it changes nothing: the charge of unlawful return requires no testimony beyond established identity, and Magwitch's identity is not in question.`,
        `Herbert comes home and sits with Pip and makes the announcement Pip already knew was coming: he is going to Cairo to run the firm's eastern branch, and he is marrying Clara before he goes. He wants Pip to come with him. The offer is the first practical alternative to the gentlemanly nothing Pip has been living, and Pip receives it with something approaching relief. He cannot go until Magwitch's situation is resolved. He promises to follow Herbert to Cairo when he can.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `abel-magwitch`, name: `Abel Magwitch` }, { id: `herbert-pocket`, name: `Herbert Pocket` }],
      themes: [{ slug: `fraud-of-gentility`, label: `The Fraud of Gentility` }, { slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 56,
      title: `Magwitch Dies`,
      hook: `Magwitch is tried, sentenced to death, and dies in the prison hospital before he can be hanged — with Pip holding his hand.`,
      tour: `Magwitch lies in the prison infirmary, getting weaker. Pip visits every day. Magwitch is tried — the Sessions come and go — and sentenced to death. The sentence cannot be executed because he is too ill: he cannot stand, can barely speak, and is visibly dying. Pip sits beside him through the last days. At the end, Pip tells him what he has never told him: that Estella, his daughter, is alive and is a lady of great beauty and wealth. Magwitch dies with that knowledge, pressing Pip's hand. Pip has come to love him — slowly, across the weeks of the prison visits, the process of love working on him in exactly the way it was supposed to work, and the chapter documents it without sentimentality.`,
      blurb: `Magwitch is tried and sentenced to death but dies in the prison hospital before the sentence can be executed — Pip beside him, telling him at the end that his daughter Estella is alive.`,
      summary: [
        `Magwitch deteriorates slowly in the prison infirmary. His broken ribs have injured a lung, and the river water did further damage. He breathes with difficulty and speaks very quietly. Pip visits daily, and the visits, which began as obligation, have become something else: the older narrator is exact about when and how the change happened, and the exactness is one of the chapter's great achievements.`,
        `The Sessions arrive. Magwitch is brought before the court in a state too ill to stand without support — thirty-two men are condemned to death that day, and Magwitch is among them. The death sentence is, in the circumstances, irrelevant: he is already dying. Pip makes one last petition through Jaggers for a reprieve on grounds of physical condition. The petition goes nowhere.`,
        `In the final days, Pip sits beside Magwitch and holds his hand. Near the end, knowing the man is slipping, Pip tells him what he has never said aloud: that Magwitch's daughter is alive, that she is a lady of great beauty and good position in the world, and that Pip loves her. Magwitch presses Pip's hand and his eyes close. He dies shortly after, in the prison hospital, with Pip beside him. The death sentence dies with the man. The chapter is the moral center of everything the novel has been building toward — the love that the reveal was supposed to make impossible, achieved.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `abel-magwitch`, name: `Abel Magwitch` }],
      themes: [{ slug: `reveal-reorganizes-everything`, label: `The Reveal That Reorganizes Everything` }, { slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }],
    },
    {
      n: 57,
      title: `The Fever and the Return`,
      tourTitle: `Joe at the Bedside`,
      hook: `Pip collapses in fever after Magwitch's death; when he recovers, Joe is at his bedside — and has paid his debts.`,
      tour: `With Magwitch dead, Herbert gone to Cairo, and his fortune forfeit, Pip is alone, in debt, and seriously ill. He collapses into a prolonged fever — he wanders through his rooms in the nights, delirious, losing track of where he is and what has happened. One morning he wakes to find two strangers in the room who have come to arrest him for debt. Then another morning he wakes and Joe is there, tending him as simply and naturally as if the years in London had not happened. Joe has come up to London on news of Pip's illness, sat beside him through the fever, paid his bills, and asks nothing in return. When Pip is well enough to talk, they talk like the old chap and Pip of twenty years ago. It is the most painful reconciliation in Dickens — painful because it costs Joe nothing and costs Pip everything.`,
      blurb: `Pip collapses into fever after the collapse of his life; Joe has come up to London, nursed him through it, paid his debts, and sits beside him asking for nothing at all.`,
      summary: [
        `Pip's life falls apart simultaneously on every front: Magwitch dead, the fortune forfeit, Herbert in Cairo, his own health broken. He gives notice on his Temple chambers, puts bills in the windows, and then collapses. The fever that follows is severe and prolonged — he wanders through the rooms at night, half-aware, groping for things that are not there. Creditors send bailiffs; at one point he is technically arrested for debt in his own rooms.`,
        `When the delirium clears enough for him to register the room around him, Joe is there. Joe has come up to London on the news of his illness — no one is identified as having sent the word — and has been nursing him for some weeks. He has paid the debts that led to the arrest. He sits by the bed and calls Pip old chap and does not, in the entire convalescence, say a single reproachful word about the years of Pip's avoidance.`,
        `As Pip recovers, he and Joe find their old ease with each other — talking as they used to at the forge, going out for short walks, sitting in the evening without constraint. Joe is entirely himself; the London clothes and the address and the formality Pip had always felt in his presence have dissolved. The older narrator does not analyze this reunion at length; he simply describes it and lets the reader hold the years between them. Before Pip is fully well, Joe slips away early one morning — leaving a note and no forwarding address, having paid the bills and gone home to the forge.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }],
      themes: [{ slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }, { slug: `voice-of-older-pip`, label: `The Voice of the Older Pip` }],
    },
    {
      n: 58,
      title: `Starting Over`,
      tourTitle: `Return to the Forge`,
      hook: `Pip goes home to ask Biddy to marry him — and finds her already married to Joe.`,
      tour: `Pip travels home to the village, worn out and with nothing. The Blue Boar treats him with contempt now that his money is gone. He visits the ruins of Satis House, which is being sold at auction. Then he goes to the forge to find Joe and Biddy — and discovers that today is their wedding day. Biddy and Joe are married. The practical fallback Pip had always half-imagined, the future he might have had instead of the one he chose, has resolved itself without him and is entirely right. Pip congratulates them both, genuinely, and asks their forgiveness for what he was. Joe holds no grudge. Biddy holds no grudge. The chapter is where Pip finishes the reckoning with the world he left and discovers it has been fine without him.`,
      blurb: `Pip returns home with nothing, intending to propose to Biddy — and finds it is her wedding day. She has married Joe. The life Pip didn't choose has been quietly living itself.`,
      summary: [
        `Pip travels home to the village, exhausted and stripped of everything his great expectations had given him. The Blue Boar, which used to fawn on him, receives him with barely concealed contempt — he is given the worst room in the yard, above the carriages. In the morning he walks to Satis House and finds it being prepared for auction, the furniture tagged, the house as empty as the life Miss Havisham spent in it.`,
        `He arrives at the forge expecting to find Joe and Biddy and to say what he has come to say. They are there — and it is their wedding day. Biddy is in her wedding dress. Joe is in his best coat. The wedding has taken place that morning, and Pip has arrived, unannounced, in the afternoon. He had been coming to propose to Biddy. The proposal is no longer available.`,
        `He congratulates them with genuine warmth. Joe and Biddy receive him with generosity and ask no questions about the past. Pip asks their forgiveness for what he was. Biddy is gentle and does not deny that there is something to forgive. Joe is Joe: he holds nothing and asks for nothing and welcomes Pip completely. Pip plans to go to Cairo the following week, to join Herbert and begin whatever life comes next. He leaves the forge and does not look back.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `joe-gargery`, name: `Joe Gargery` }],
      themes: [{ slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }, { slug: `voice-of-older-pip`, label: `The Voice of the Older Pip` }],
    },
    {
      n: 59,
      title: `The Evening Mists`,
      tourTitle: `The Ruined Garden`,
      hook: `Eleven years later, Pip returns to find a son named Pip at the forge — and meets Estella in the ruins of Satis House.`,
      tour: `Eleven years have passed. Pip has been in Cairo with Herbert's firm, working, useful, earning his own way. He returns to the forge to visit Joe and Biddy and finds a small boy — their son, named Pip in his honor. The scene is warm and complete. Afterward, on impulse, he walks to the site of Satis House. The house has been demolished; the grounds are overgrown; nothing remains of Miss Havisham's frozen world. In the moonlight, Estella is there. She is a widow — Drummle treated her badly and is dead. She is changed: quieter, more herself. They walk together in the ruins. The novel ends on the published ending — 'I saw no shadow of another parting from her' — an ambiguity Dickens settled into after abandoning his original bleaker close. Both endings are worth reading.`,
      blurb: `Eleven years later, Pip returns from Cairo to find Joe and Biddy's son named after him — and meets Estella in the moonlit ruins of Satis House, the novel's final, carefully balanced ambiguity.`,
      summary: [
        `Eleven years after the collapse of his great expectations, Pip is a working partner in Herbert's Cairo firm — earning his own bread, clear of debt, useful. He returns to England for a visit and goes to the forge. Joe and Biddy have a son named Pip; the boy is healthy and bright, and the visit between the older Pip and the young Pip-of-the-forge is one of the novel's most quietly perfect scenes. The older Pip takes the boy to the churchyard and shows him the graves of the parents he never knew, and something completes itself.`,
        `That evening Pip goes on impulse to the site of Satis House. The house has been demolished; the grounds have run to wilderness; the brewery and the garden have been swallowed by time and weather. Nothing remains of the stopped world except the shapes of what was. In the early evening light — moonrise, in some descriptions — Pip finds Estella there. She too has come back, apparently for the same unarticulated reason.`,
        `Estella is widowed. Drummle treated her as she told Pip he would; that life is over. She is changed by it — not broken, but altered; more present, less armored. She and Pip walk together in the ruins. She says she often thinks of him and the boy he was in those rooms. The novel closes on the sentence Dickens substituted for his original ending: 'I saw no shadow of another parting from her.' It is deliberately ambiguous about what follows — not a wedding, not a promise, but the absence of departure. Dickens's original ending was starker: they shake hands and part. Bulwer-Lytton persuaded him to change it. Both endings are true to different things in the novel, and the serious reader reads both.`
      ],
      appears: [{ id: `pip`, name: `Pip` }, { id: `estella`, name: `Estella` }, { id: `joe-gargery`, name: `Joe Gargery` }],
      themes: [{ slug: `voice-of-older-pip`, label: `The Voice of the Older Pip` }, { slug: `what-becoming-gentleman-costs`, label: `What Becoming a Gentleman Costs` }, { slug: `miss-havisham-transmission-trauma`, label: `Miss Havisham and the Transmission of Trauma` }],
    },
  ],
};

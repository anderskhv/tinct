// SEO content data for the book of Ezekiel.
// 48 chapters; priest-prophet in Babylonian exile, 6th c. BCE.
// Strangest of the prophetic books — the chariot, the dry bones, the symbolic embodiment.
// Voice: literary, declarative present, attentive to the visionary register without flattening it.

const chapters = require('/tmp/bible-ezekiel-chapters-merged.json')

module.exports = {
  id: 'bible-ezekiel',
  title: 'Ezekiel',
  author: 'Ezekiel ben Buzi',
  byline: '6th c. BCE · Hebrew Bible · Latter Prophets',
  titleAccent: 'a guided tour',
  hook: 'A priest in Babylonian exile sees the heavens open and the glory of God arrive on a throne of living fire. The strangest book in the Hebrew prophetic canon begins here, and never becomes less strange.',
  genre: ['Prophecy', 'Hebrew Bible', 'Visionary literature'],
  themesBlurb: 'The chariot vision, the prophet\'s body as sign, the dry bones, the glory departing and returning, the visionary temple.',
  castBlurb: 'The exile community',
  castDesc: 'A priest-prophet, a chariot of living creatures, elders in Babylon, and the figures of restoration.',

  about: [
    `<em>Ezekiel</em> is the third of the major prophetic books and the strangest. A priest named Ezekiel ben Buzi has been deported to Babylon in 597 BCE, eleven years before the final destruction of Jerusalem. In the fifth year of his exile, the heavens open and he sees four living creatures bearing a throne of fire, a wheel within a wheel, and the appearance of the glory of God. He is told to speak to a rebellious house. He begins.`,
    `The book that follows contains the most elaborate visionary literature in the Hebrew Bible: the chariot, the silent prophet, the divided hair, the boiling pot, the unmourned wife, the dry bones, and forty-eight chapters of vision culminating in a new temple with a river of life flowing from beneath its threshold. Ezekiel is the prophet whose vocation has cost him most visibly — struck dumb for years, his body pressed into service as a sign — and the book preserves that cost without diminishing it.`,
  ],

  chaptersSubtitle: 'All 48 chapters, from the chariot to the city named "The LORD Is There"',
  chaptersLead: `<p>Ezekiel divides into three movements. Chapters 1–24 are oracles of judgement against Jerusalem and Judah, delivered before the city's fall. Chapters 25–32 are oracles against the foreign nations — Ammon, Moab, Edom, Philistia, Tyre, Sidon, Egypt. Chapters 33–48 are oracles of restoration: the watchman recommissioned, the dry bones, the war of Gog, and the long visionary tour of the new temple and the river of life.</p>`,
  themesByline: 'Five threads through the book',
  themesLead: `Ezekiel is the most visually elaborated of the prophetic books and the most bodily. The prophet's flesh carries the message; the chariot carries the divine presence; the dry bones carry the hope of the exiles. These five themes are the load-bearing structure.`,

  groups: [
    {
      label: 'Oracles of judgement · Chapters 1–24',
      subtitle: 'The chariot vision, the call, the symbolic acts, the siege begins.',
      chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    },
    {
      label: 'Oracles against the nations · Chapters 25–32',
      subtitle: 'Ammon, Moab, Edom, Philistia, Tyre, Sidon, and Egypt addressed in turn.',
      chapters: [25, 26, 27, 28, 29, 30, 31, 32],
    },
    {
      label: 'Restoration and the new temple · Chapters 33–48',
      subtitle: 'The watchman recommissioned, the dry bones, Gog, and the visionary city.',
      chapters: [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
    },
  ],

  chapterLabel: n => 'Ezekiel ' + n,

  themes: [
    {
      slug: 'the-chariot-vision',
      title: 'The Chariot Vision',
      preview: 'The opening chapter of Ezekiel is one of the most visually elaborate and theologically dense passages in the Hebrew Bible, and one of the most influential single visions in the entire history of Jewish and Christian mysticism.',
      essay: [
        `The prophet, by the river Chebar in the land of the Chaldeans, sees the heavens open. A stormy wind comes out of the north, a great cloud with fire flashing in it and a brightness around it, and out of the midst of the fire the appearance of four living creatures. Each creature has four faces — a man, a lion, an ox, an eagle — and four wings, and they move straight forward without turning, going wherever the spirit goes. Beside each living creature is a wheel, and the wheels themselves have wheels within them, and their rims are full of eyes, and they go wherever the creatures go because the spirit of the living creatures is in the wheels.`,
        `Above the creatures is a firmament like crystal, and above the firmament a throne like sapphire, and on the throne the likeness of a man, glowing like fire and amber, surrounded by brightness like the rainbow in a cloud on a day of rain. This was the appearance of the likeness of the glory of the Lord, the prophet says. And when I saw it, I fell upon my face. The vision is the founding moment of what later Jewish mysticism would call the Merkavah tradition — the chariot tradition — and the vision was so charged with danger that the rabbis ruled that it should not be read or expounded except by an adult well-versed in scripture, and never alone.`,
        `The four living creatures became, in the Christian tradition (refracted through the parallel vision in Revelation 4), the symbols of the four evangelists: man for Matthew, lion for Mark, ox for Luke, eagle for John. The wheels within wheels became one of the most quoted images in religious art and folk song. What is most theologically striking about the vision, on its own terms, is the location. The glory of God is appearing not in the Jerusalem temple, where the priestly tradition Ezekiel had been raised in had located it, but in Babylon — in the land of exile, by a foreign canal, among a deported community.`,
        `The vision says, with extraordinary visual force, that God is not confined to the temple. He has come out and met his people in their exile. This theological move — the portability of the divine presence, the recognition that God is not territorially bound — is one of the deepest gifts of the exilic prophets to the later traditions, and it begins, in the canonical text, with the chariot in chapter 1.`,
      ],
      where: [
        { n: 1, label: 'Ezekiel 1 (the first vision)' },
        { n: 10, label: 'Ezekiel 10 (the glory departs)' },
        { n: 43, label: 'Ezekiel 43 (the glory returns)' },
      ],
    },
    {
      slug: 'the-prophets-body-as-sign',
      title: "The Prophet's Body as Sign",
      preview: 'More than any other prophet in the Hebrew Bible, Ezekiel is required to perform his message with his own body, and the requirement is sustained, costly, and at times extreme.',
      essay: [
        `Ezekiel is struck dumb at the start of his prophetic career (3:26), able to speak only when delivering an oracle, and remains in this state until the news of Jerusalem's fall arrives some seven years later (33:22). He lies on his left side for three hundred and ninety days and then on his right side for forty days, bearing the iniquity of Israel and Judah respectively (chapter 4). He shaves the hair of his head and beard with a sharp sword, weighs and divides it into three portions, and burns one third in the city, strikes one third with the sword, and scatters one third to the wind (chapter 5). He digs a hole through the wall of his house at night and carries his belongings through the hole — the symbolic enactment of the coming exile (chapter 12).`,
        `Most extreme of all, in chapter 24, his wife — described, in one of the few personal lines in the book, as the desire of his eyes — dies suddenly, and he is told to make no public mourning for her: bind your turban on, put your shoes on your feet, do not cover your lips, do not eat the bread of mourners. He does as he is commanded. The community asks him what these things mean. He tells them. The temple, the desire of their eyes, is about to be destroyed, and they will not be permitted to mourn it in the way they had thought they would.`,
        `The theological argument behind these signs is precise. Words can be ignored, debated, dismissed. A body that has been lying on its side for over a year cannot be ignored. The exile community has to look at Ezekiel as he is, and what they see is the message. The cost of being this kind of messenger is immense, and the book preserves it without minimising it. Ezekiel is the prophet whose vocation has cost him most visibly in his flesh, and the book makes the cost part of what the prophecy is.`,
      ],
      where: [
        { n: 4, label: 'Ezekiel 4 (lying on his side)' },
        { n: 5, label: 'Ezekiel 5 (the divided hair)' },
        { n: 12, label: 'Ezekiel 12 (digging through the wall)' },
        { n: 24, label: 'Ezekiel 24 (the unmourned wife)' },
      ],
    },
    {
      slug: 'the-dry-bones',
      title: 'The Dry Bones',
      preview: 'The most quoted vision in Ezekiel, and one of the most influential single passages in the Hebrew prophetic tradition: the prophet is brought to a valley full of dry bones and told to prophesy to them.',
      essay: [
        `The prophet is brought out by the spirit of the Lord and set down in the middle of a valley full of bones — a great many bones on the floor of the valley, and they are very dry. The Lord asks him: son of man, can these bones live? And Ezekiel answers carefully: O Lord God, thou knowest. He is told to prophesy to the bones. As he prophesies, there is a noise — a rattling — and the bones come together, bone to its bone. Sinews appear on them, then flesh, then skin. But there is no breath in them.`,
        `He is told to prophesy to the wind (the same Hebrew word that means breath and spirit) — come from the four winds, O breath, and breathe upon these slain, that they may live. He prophesies, and the breath comes into them, and they live, and stand upon their feet, an exceeding great army. The vision is then interpreted explicitly: these bones are the whole house of Israel; they say, our bones are dried up, our hope is lost, we are completely cut off; therefore prophesy and say, behold, I will open your graves, and cause you to come up out of your graves, my people, and I will bring you back to the land of Israel.`,
        `The vision has been one of the most quoted passages in the Hebrew Bible. It is the source of the African American spiritual Dem Bones, in which the verbal energy of the bones coming together has been preserved into modern folk song. It has been read across two and a half thousand years as the foundation of the doctrine of bodily resurrection — explicitly so in the rabbinic literature, where the chapter is cited as one of the principal scriptural warrants for the resurrection of the dead. What is most striking on the page is the simplicity of the vision's mechanism. The bones are dry. The prophet speaks. The bones come together. The breath comes. The army stands. The pattern is the pattern of Genesis 1: God speaks, the world is.`,
      ],
      where: [
        { n: 37, label: 'Ezekiel 37 (the dry bones and the two sticks)' },
      ],
    },
    {
      slug: 'the-glory-departing-and-returning',
      title: 'The Glory Departing and Returning',
      preview: 'One of the most carefully developed theological themes in Ezekiel is the movement of the divine glory — the kavod — out of and back into the Jerusalem temple.',
      essay: [
        `In chapters 8–11, the prophet is transported in vision from his location in Babylon back to Jerusalem and shown the abominations being practised in the temple itself: the image of jealousy at the gate, seventy elders worshipping creatures painted on the wall, women weeping for Tammuz, men with their backs to the temple worshipping the rising sun. Then he is shown the chariot of God moving — first from above the cherubim in the holy of holies to the threshold of the temple (10:4), then from the threshold to the east gate (10:18–19), and finally out of the city altogether to stand on the mountain east of the city (11:23), the Mount of Olives. The glory has left the temple.`,
        `The temple is now empty of the divine presence, and the destruction that follows in 587 is, on the book's theology, the consequence of the glory's departure rather than its cause. God does not abandon a temple in which his presence still dwells; the absence of the presence makes the destruction possible. The narrative of the glory's departure is then balanced, twenty chapters later, by the narrative of its return. In chapters 40–48, in the long visionary tour of the new temple, Ezekiel is shown the glory returning — coming from the east, by the way the glory had departed (43:2), entering the new temple by the east gate, and filling the house.`,
        `The east gate by which the glory returns is then sealed (44:1–3), so that no one else may enter by it; it is reserved for the prince. The two narratives — departure and return — frame the book's theological argument about the relationship between God and the temple. The book closes with the city renamed: the Lord is there.`,
      ],
      where: [
        { n: 8, label: 'Ezekiel 8 (abominations in the temple)' },
        { n: 10, label: 'Ezekiel 10 (the glory departs)' },
        { n: 11, label: 'Ezekiel 11 (the glory leaves Jerusalem)' },
        { n: 43, label: 'Ezekiel 43 (the glory returns)' },
      ],
    },
    {
      slug: 'the-visionary-temple',
      title: 'The Visionary Temple',
      preview: 'The last nine chapters of Ezekiel — chapters 40 through 48 — contain the longest and most architecturally detailed visionary passage in the Hebrew Bible.',
      essay: [
        `The setting is twenty-five years after the fall of Jerusalem, fourteen years after the destruction. The prophet is taken in vision to a high mountain, where a man with a measuring reed is standing in a gateway. The man takes the prophet through the new temple piece by piece, measuring as he goes: the outer wall, the outer court, the gates and chambers, the inner court, the temple building itself, the altar in front of the temple. The measurements are given in cubits with painstaking specificity.`,
        `The prophet is then shown the glory returning to fill the temple (chapter 43); the regulations for the priests, the prince, and the people in the new arrangement (chapters 44–46); the river that flows out from beneath the temple, deepening as it goes — first to the ankles, then to the knees, then to the loins, then waters to swim in, a river that cannot be crossed — and reaching the Dead Sea, which it heals, so that the salt sea is filled with fish and the trees that grow on its banks bear fruit every month and their leaves are for the healing of the nations (chapter 47).`,
        `The book closes with the redivision of the land among the twelve tribes and the renaming of the city: the name of the city from that day shall be, the Lord is there (yhwh shammah, 48:35). The Jewish tradition has read it as the future temple to be built in messianic times. The Christian tradition has read it as the church, the new heavens and new earth, or a still-future eschatological structure. What is undeniable on the page is the precision of the architecture and the strangeness of the conjunction: an extraordinarily detailed building, never built, given by God in vision to a priest in exile.`,
      ],
      where: [
        { n: 40, label: 'Ezekiel 40 (the outer courts)' },
        { n: 43, label: 'Ezekiel 43 (the glory returns)' },
        { n: 47, label: 'Ezekiel 47 (the river from the threshold)' },
        { n: 48, label: 'Ezekiel 48 (the city named "The LORD Is There")' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Ezekiel',
      role: 'Priest-prophet in exile',
      body: `Born into a priestly family in Jerusalem; deported to Babylon with King Jehoiachin in 597 BCE. Settled by the river Chebar (probably the Kabaru canal near Nippur) in the exile community. Called to prophecy in 593 BCE by the chariot vision. Struck dumb for years, recovering his speech only when news of Jerusalem's fall arrives. Performs more sustained symbolic acts with his body than any other prophet in the Hebrew Bible. His wife, called the desire of his eyes, dies suddenly and he is forbidden to mourn — the last and most personally costly of the bodily signs.`,
    },
    {
      name: 'The Four Living Creatures',
      role: 'Bearers of the divine throne',
      body: `The four creatures of the opening vision of chapter 1 (identified explicitly as cherubim in chapter 10). Each creature has four faces — man, lion, ox, eagle — and four wings; they move straight forward without turning. Beside each creature is a wheel with a wheel within it, their rims full of eyes. The founding image of the Merkavah tradition and, in Christian iconography, the symbols of the four evangelists. They are the most visually elaborated angelic figures in the Hebrew Bible.`,
    },
    {
      name: 'The Elders of Israel',
      role: 'Exile community leadership',
      body: `The leaders of the Jewish exile community in Babylon, who appear repeatedly sitting before Ezekiel and asking for a word from the Lord. They come to him in chapter 8 (mid-conversation the prophet is taken in vision to Jerusalem), in chapter 14 (told they carry idols in their hearts), in chapter 20 (the whole history of Israel rehearsed as continuous rebellion), and in chapter 33 (listening as one listens to a beautiful song, without doing what they hear). They are the community to whom the prophecy is addressed and on whom it works — or does not.`,
    },
    {
      name: 'The Dry Bones',
      role: 'Vision of restoration',
      body: `The image at the centre of the most quoted vision in the book — chapter 37. The prophet is taken to a valley full of dry bones, asked whether they can live, told to prophesy to them. As he prophesies, the bones come together, take on flesh, receive the breath of life, and stand as an exceeding great army. The bones are interpreted explicitly as the whole house of Israel, who say their bones are dried up and their hope is lost. They have been read for two and a half thousand years as the scriptural foundation of the doctrine of bodily resurrection and as a vision of the future restoration of Israel.`,
    },
    {
      name: 'Gog of Magog',
      role: 'Eschatological enemy',
      body: `The figure named in chapters 38–39, an enemy from the far north — Gog, prince of the land of Magog, ruler of Meshech and Tubal — who in the latter days will lead a great coalition of nations against the restored Israel and be destroyed by direct divine action. The historical and geographical referents have been the subject of two thousand years of speculation. In Ezekiel he serves a structural function: after the restoration prophecies of chapters 33–37, before the visionary temple of 40–48, the war with Gog is the last decisive intervention God will make on Israel's behalf, and the prelude to the new temple. The figure is invoked again in Revelation 20.`,
    },
    {
      name: 'The Man with the Measuring Reed',
      role: 'Visionary guide',
      body: `The figure who appears at the start of chapter 40 — a man whose appearance was like brass, with a line of flax in his hand and a measuring reed — and who guides the prophet through the entire visionary temple of chapters 40–48. He measures the outer wall, the gates, the chambers, the courts, the temple building, the altar, and the depth of the river at successive distances. He is not named; he is the type of the divine guide, the angelic interpreter, who in later apocalyptic literature (in Daniel, in Revelation, in 4 Ezra) becomes a recognisable figure. His measuring is the vision's theology: what God has built will be measured, and what God has measured stands.`,
    },
  ],

  castSubtitle: 'The exile community — priest, elders, creatures, and the figures of restoration.',
  castLead: `<p>Ezekiel's cast is small in named human terms and enormous in its visionary population. The prophet himself is the book's only fully individual human character; the elders appear as a collective; the great figures — the four living creatures, the dry bones, Gog of Magog, the man with the measuring reed — are visionary rather than historical. Almost no one in the book speaks back to Ezekiel except God.</p>`,

  castGroups: [
    {
      label: 'The prophet',
      characters: [
        {
          id: 'ezekiel',
          tag: 'Prophet',
          name: 'Ezekiel',
          epithet: 'Priest-prophet in Babylonian exile',
          body: `Born into a priestly family in Jerusalem; deported to Babylon with King Jehoiachin in 597 BCE at approximately age twenty-five. Settled by the river Chebar (the Kabaru canal near Nippur in southern Mesopotamia) in the exile community. Called to prophecy in 593 BCE — the fifth year of his exile — by the chariot vision. Prophesies for at least twenty-two years. Married: his wife, called the desire of his eyes, dies suddenly in 588 and he is forbidden by God to make any public mourning, in symbol of the people's reaction to the destruction of the temple. Struck dumb for the early years of his vocation, recovering his speech only when news of Jerusalem's fall arrives. Performs more sustained symbolic acts with his body than any other prophet in the Hebrew Bible. Tradition holds he was eventually murdered by a fellow exile he had rebuked.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 12, 24, 33, 37, 40, 47, 48],
        },
      ],
    },
    {
      label: 'The visionary figures',
      characters: [
        {
          id: 'the-four-living-creatures',
          tag: 'Vision',
          tagClass: 'creature',
          name: 'The Four Living Creatures',
          epithet: 'Bearers of the chariot-throne',
          body: `The four creatures of the opening vision of chapter 1 (identified explicitly as cherubim in chapter 10). Each has four faces — man, lion, ox, eagle — and four wings; they move straight forward without turning, directed by the spirit. Beside each creature is a wheel with a wheel within it, their rims full of eyes, moving wherever the creatures move because the spirit of the creatures is in the wheels. The founding image of the Jewish Merkavah tradition; in Christian iconography, the symbols of the four evangelists. The most visually elaborated angelic figures in the Hebrew Bible and the source of much later angelology in both Jewish and Christian traditions.`,
          appears: [1, 10],
        },
        {
          id: 'the-dry-bones',
          tag: 'Vision',
          tagClass: 'creature',
          name: 'The Dry Bones',
          epithet: 'Vision of restoration',
          body: `The image at the centre of the most quoted vision in the book — chapter 37. The prophet is taken to a valley full of very dry bones, asked whether they can live, told to prophesy to them. As he prophesies, the bones come together bone to its bone, sinews appear, then flesh, then skin; the breath enters them and they stand as an exceeding great army. Interpreted explicitly as the whole house of Israel. Read for two and a half thousand years as the scriptural foundation of the doctrine of bodily resurrection, and as a vision of the future restoration of Israel. Source of the spiritual <em>Dem Bones</em>.`,
          appears: [37],
        },
        {
          id: 'gog-of-magog',
          tag: 'Vision',
          tagClass: 'creature',
          name: 'Gog of Magog',
          epithet: 'Eschatological enemy from the north',
          body: `The figure named in chapters 38–39: Gog, prince of the land of Magog, ruler of Meshech and Tubal, who in the latter days will lead a great coalition of nations against the restored Israel and be destroyed by direct divine action — earthquake, fire, brimstone, and a plague. The historical and geographical referents have been the subject of two thousand years of speculation. In Ezekiel he serves a structural function as the last great threat before the visionary temple, proof that God's power on the world stage is final. Invoked again in Revelation 20.`,
          appears: [38, 39],
        },
        {
          id: 'the-man-with-the-measuring-reed',
          tag: 'Vision',
          tagClass: 'creature',
          name: 'The Man with the Measuring Reed',
          epithet: 'Visionary guide through the new temple',
          body: `The figure who appears at the start of chapter 40 — a man whose appearance was like brass, with a line of flax in his hand and a measuring reed — and who guides Ezekiel through the entire visionary temple of chapters 40–48, measuring as he goes. He measures the outer wall, the gates, the courts, the temple building, the altar, the sacred chambers, and the depth of the river at successive distances. Not named; the type of the heavenly interpreter who in later apocalyptic literature (Daniel, Revelation, 4 Ezra) becomes a recognisable figure. His measuring is the vision's theology: what God has built will be measured, and what God has measured stands.`,
          appears: [40, 41, 42, 43, 44, 45, 46, 47, 48],
        },
      ],
    },
    {
      label: 'The exile community',
      characters: [
        {
          id: 'the-elders-of-israel',
          tag: 'Community',
          name: 'The Elders of Israel',
          epithet: 'Exile community leadership',
          body: `The leaders of the Jewish exile community in Babylon, who appear repeatedly sitting before Ezekiel and asking for a word from the Lord. They come to him in chapter 8 (mid-conversation the prophet is taken in vision to Jerusalem), in chapter 14 (told they carry idols in their hearts and will receive no answer while that remains true), in chapter 20 (the whole history of Israel rehearsed as continuous rebellion), and in chapter 33 (listening to the prophet's words as to a beautiful song with a lovely voice, without doing what they hear). They are not individually named or characterised; they are the community to whom the prophecy is addressed.`,
          appears: [8, 14, 20, 33],
        },
      ],
    },
  ],

  chapters,
}

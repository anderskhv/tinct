BOOK_ID = 'master-and-margarita'
CONTENT_VERSION = '2026-11-05.1'
# Tinct has no English original for this novel; the only English edition is Tinct Modern English.
EDITIONS = ['modern-en']

# Aliases are matched exactly (word-bounded) against the modern-en edition by books/characters/build_generic.py.
# Cards are first-encounter identity only: no concealed identity and no later plot development.
ENTITIES = [
    # Woland and his retinue
    {
        'id': 'woland', 'kind': 'person', 'storyRole': 'central', 'displayName': 'Woland',
        'aliases': ['Woland', 'messire', 'Messire'],
        'subtitle': 'A foreign professor of black magic',
        'body': "An elegant, mocking stranger with mismatched eyes who has arrived in Moscow from abroad, talks as if he had met both Kant and Pontius Pilate, and has a contract to give performances at the Variety Theater. He seems to know a great deal about the people he meets.",
    },
    {
        'id': 'koroviev', 'kind': 'person', 'storyRole': 'major', 'displayName': 'Koroviev',
        'aliases': ['Koroviev', 'Fagot', 'Koroviev-Fagot', 'Fagot-Koroviev', 'the choirmaster', 'The choirmaster'],
        'subtitle': "A lanky man in a checked jacket, one of Woland's companions",
        'body': "Long, thin and jeering, in a little jockey cap and a pince-nez with one lens missing, he calls himself a former choirmaster and keeps turning up at the side of the foreign professor. He talks a great deal, mostly in mock servility, and nothing he says can be taken at face value.",
    },
    {
        'id': 'behemoth', 'kind': 'person', 'storyRole': 'major', 'displayName': 'Behemoth',
        'aliases': ['Behemoth'],
        'subtitle': "An enormous black cat in Woland's retinue",
        'body': "Huge as a hog, black as soot and with a cavalryman's mustache, he walks on his hind legs, talks, drinks vodka and tries to pay his fare on the tram. He is the troupe's clown and its most enthusiastic troublemaker.",
    },
    {
        'id': 'azazello', 'kind': 'person', 'storyRole': 'major', 'displayName': 'Azazello',
        'aliases': ['Azazello'],
        'subtitle': "A short, red-haired member of Woland's retinue",
        'body': "Short, extraordinarily broad-shouldered and fiery red-haired, with a fang sticking out of his mouth, he speaks bluntly through his nose and has no patience with pretence.",
    },
    {
        'id': 'hella', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Hella',
        'aliases': ['Hella'],
        'subtitle': "Woland's maid",
        'body': "A young woman who opens the door of the apartment where the foreign artiste is staying, wearing nothing but a little lace apron, a white headpiece and golden slippers. A livid scar marks her neck.",
    },
    # The master, Margarita and those around them
    {
        'id': 'master', 'kind': 'person', 'storyRole': 'central', 'displayName': 'The master',
        'aliases': ['the master', 'The master'],
        'subtitle': "Ivan's nameless neighbor at the clinic, the author of a novel about Pilate",
        'body': "A historian by training who won a hundred thousand roubles, gave up his museum job and wrote a novel about Pontius Pilate. He will not give his name, calls himself only a master, and keeps a black cap with an M that a woman sewed for him.",
    },
    {
        'id': 'margarita', 'kind': 'person', 'storyRole': 'central', 'displayName': 'Margarita Nikolayevna',
        'aliases': ['Margarita', 'Margarita Nikolayevna', 'Queen Margot', 'Margot'],
        'subtitle': "The master's beloved",
        'body': "Thirty years old, childless, beautiful and clever, married to a prominent, kind specialist and wanting for nothing, she has not known happiness since she married at nineteen. She has had no word of the master since he disappeared and cannot tell whether he is alive.",
    },
    {
        'id': 'natasha', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Natasha',
        'aliases': ['Natasha', 'Natashka', 'Natalya Prokofyevna'],
        'subtitle': "Margarita's housemaid",
        'body': "The pretty housemaid in Margarita's home, who looks after her mistress and notices her moods.",
    },
    {
        'id': 'nikolai-ivanovich', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Nikolai Ivanovich',
        'aliases': ['Nikolai Ivanovich'],
        'subtitle': "Margarita's neighbor on the lower floor",
        'body': "A respectable resident of the ground floor of the house where Margarita lives.",
    },
    {
        'id': 'latunsky', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Latunsky',
        'aliases': ['Latunsky'],
        'subtitle': 'A literary critic',
        'body': "A Moscow literary critic. Ivan's neighbor at the clinic says he wishes it had been Latunsky under the tram instead of Berlioz.",
    },
    {
        'id': 'aloisy-mogarych', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Aloisy Mogarych',
        'aliases': ['Aloisy Mogarych', 'Aloisy', 'Mogarych'],
        'subtitle': "A journalist who befriended the master",
        'body': "A man Woland's people bring, in his underwear and clutching a suitcase, before the master and Margarita. He has some connection with the master's old basement rooms.",
    },
    # Moscow: the writers, the clinic, the Variety, the building on Sadovaya
    {
        'id': 'ivan-bezdomny', 'kind': 'person', 'storyRole': 'central', 'displayName': 'Ivan Bezdomny',
        'aliases': ['Ivan Nikolayevich Ponyrev', 'Ivan Nikolayevich Bezdomny', 'Ivan Nikolayevich', 'Ivan Bezdomny', 'Bezdomny', 'Ivan', 'Ivanushka'],
        'subtitle': 'A young Moscow poet who writes under the pen name Bezdomny',
        'body': "Ivan Nikolayevich Ponyrev is a broad-shouldered, tousle-haired young poet in a checked cap who writes under the pen name Bezdomny. He has written an anti-religious poem on commission for Berlioz's magazine.",
    },
    {
        'id': 'berlioz', 'kind': 'person', 'storyRole': 'major', 'displayName': 'Mikhail Alexandrovich Berlioz',
        'aliases': ['Mikhail Alexandrovich Berlioz', 'Mikhail Alexandrovich', 'Berlioz', 'Misha'],
        'subtitle': 'Chairman of Massolit and editor of a literary magazine',
        'body': "Short, plump, bald and well read, in huge horn-rimmed glasses, he edits a thick literary magazine and chairs the board of Massolit, one of Moscow's largest literary associations.",
    },
    {
        'id': 'annushka', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Annushka',
        'aliases': ['Annushka'],
        'subtitle': 'A Moscow woman',
        'body': "A woman the foreigner at Patriarch's Ponds mentions in passing: she has already bought sunflower oil, he says, and spilled it.",
    },
    {
        'id': 'ryukhin', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Ryukhin',
        'aliases': ['Ryukhin', 'Sashka'],
        'subtitle': 'A poet from Griboyedov House',
        'body': "A poet from the writers' house who helps carry Ivan out of Griboyedov's and goes with him to the clinic.",
    },
    {
        'id': 'archibald-archibaldovich', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Archibald Archibaldovich',
        'aliases': ['Archibald Archibaldovich'],
        'subtitle': 'Manager of the Griboyedov restaurant',
        'body': "The host of the writers' restaurant, who runs it with quiet authority and an eye for trouble.",
    },
    {
        'id': 'stravinsky', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Professor Stravinsky',
        'aliases': ['Professor Stravinsky', 'Stravinsky', 'Alexander Nikolayevich'],
        'subtitle': 'Head of the psychiatric clinic',
        'body': "The courteous, observant doctor in charge of the new clinic outside Moscow, who listens to his patients without arguing with them.",
    },
    {
        'id': 'praskovya-fyodorovna', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Praskovya Fyodorovna',
        'aliases': ['Praskovya Fyodorovna'],
        'subtitle': 'A nurse at the clinic',
        'body': "The plump nurse on Ivan's ward, who brings him paper and a pencil stub when he asks for them.",
    },
    {
        'id': 'styopa', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Styopa Likhodeyev',
        'aliases': ['Stepan Bogdanovich Likhodeyev', 'Styopa Likhodeyev', 'Stepan Bogdanovich', 'Likhodeyev', 'Styopa'],
        'subtitle': 'Director of the Variety Theater',
        'body': "Stepan Bogdanovich Likhodeyev shares apartment No. 50 on Sadovaya Street with Berlioz. He wakes there one morning with a fearful hangover and no memory of the day before.",
    },
    {
        'id': 'rimsky', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Rimsky',
        'aliases': ['Grigory Danilovich Rimsky', 'Grigory Danilovich', 'Rimsky'],
        'subtitle': 'Financial director of the Variety',
        'body': "Grigory Danilovich Rimsky is a dry, careful man in horn-rimmed glasses who keeps the theater's money.",
    },
    {
        'id': 'varenukha', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Varenukha',
        'aliases': ['Ivan Savelyevich', 'Varenukha'],
        'subtitle': 'Administrator of the Variety',
        'body': "Ivan Savelyevich Varenukha runs the theater's day-to-day business.",
    },
    {
        'id': 'bengalsky', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Georges Bengalsky',
        'aliases': ['Georges Bengalsky', 'Bengalsky'],
        'subtitle': "The Variety's master of ceremonies",
        'body': "A clean-shaven compère in a rumpled tailcoat, well known to all Moscow, who introduces the acts at the Variety.",
    },
    {
        'id': 'master-of-ceremonies', 'kind': 'person', 'storyRole': 'reference', 'displayName': 'The master of ceremonies',
        'aliases': ['the master of ceremonies', 'The master of ceremonies'],
        'subtitle': 'A stage compère',
        'body': "The man who introduces the acts on a stage. The novel uses the title for more than one compère; at the Variety it belongs to Georges Bengalsky.",
    },
    {
        'id': 'sempleyarov', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Arkady Apollonovich Sempleyarov',
        'aliases': ['Arkady Apollonovich Sempleyarov', 'Arkady Apollonovich', 'Sempleyarov'],
        'subtitle': 'Chairman of the acoustics commission',
        'body': "The evening's guest of honor at the Variety, chairman of the Acoustics Commission of the Moscow theaters. He sits in box No. 2 with two ladies and wants the tricks exposed.",
    },
    {
        'id': 'nikanor-ivanovich', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Nikanor Ivanovich Bosoy',
        'aliases': ['Nikanor Ivanovich Bosoy', 'Nikanor Ivanovich', 'Bosoy'],
        'subtitle': "Chairman of the tenants' association at No. 302-bis Sadovaya",
        'body': "The harassed head of the building where Berlioz lived. Since the editor's death he has been besieged by tenants who want the dead man's rooms.",
    },
    {
        'id': 'pelageya-antonovna', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Pelageya Antonovna',
        'aliases': ['Pelageya Antonovna'],
        'subtitle': "Nikanor Ivanovich's wife",
        'body': "She keeps house for the chairman of the tenants' association and has his dinner waiting when he gets home.",
    },
    {
        'id': 'kanavkin', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Kanavkin',
        'aliases': ['Kanavkin'],
        'subtitle': "A man in Nikanor Ivanovich's dream",
        'body': "Nikolai Kanavkin is called up onto the stage in the strange theater of Nikanor Ivanovich's dream, where the audience is pressed to hand over its hidden currency.",
    },
    {
        'id': 'prokhor-petrovich', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Prokhor Petrovich',
        'aliases': ['Prokhor Petrovich'],
        'subtitle': 'Chairman of the Entertainment Commission',
        'body': "The chairman of the Entertainment Commission, whose voice is heard giving someone a dressing-down behind his office door.",
    },
    {
        'id': 'lastochkin', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Vasily Stepanovich Lastochkin',
        'aliases': ['Vasily Stepanovich Lastochkin', 'Vasily Stepanovich'],
        'subtitle': "The Variety's accountant",
        'body': "A diligent accountant who finds himself the senior man at the Variety the morning after the performance.",
    },
    {
        'id': 'poplavsky', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Maximilian Andreyevich Poplavsky',
        'aliases': ['Maximilian Andreyevich Poplavsky', 'Maximilian Andreyevich', 'Poplavsky'],
        'subtitle': "Berlioz's uncle from Kiev",
        'body': "An economic planner from Kiev who arrives in Moscow after receiving a strange telegram about his nephew's death.",
    },
    {
        'id': 'sokov', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Andrei Fokich Sokov',
        'aliases': ['Andrei Fokich Sokov', 'Andrei Fokich', 'Sokov'],
        'subtitle': "The Variety's barman",
        'body': "The man who runs the theater's refreshment bar.",
    },
    {
        'id': 'kuzmin', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Professor Kuzmin',
        'aliases': ['Professor Kuzmin', 'Kuzmin'],
        'subtitle': 'A Moscow physician',
        'body': "One of Moscow's best-known specialists in diseases of the liver.",
    },
    {
        'id': 'meigel', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Baron Meigel',
        'aliases': ['Baron Meigel', 'Meigel'],
        'subtitle': 'A caller at apartment No. 50',
        'body': "A baron who telephones the apartment where the foreign artiste is staying and is told the artiste will be glad to see him.",
    },
    {
        'id': 'frieda', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Frieda',
        'aliases': ['Frieda'],
        'subtitle': 'A guest at the ball',
        'body': "A woman with gloomy, imploring eyes among the guests, who begs the hostess to remember her name.",
    },
    {
        'id': 'abadonna', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Abadonna',
        'aliases': ['Abadonna'],
        'subtitle': 'One of the powers who serve Woland',
        'body': "A figure whose work Woland shows Margarita on his globe, where a distant war is being fought.",
    },
    # Yershalaim
    {
        'id': 'pilate', 'kind': 'person', 'storyRole': 'central', 'displayName': 'Pontius Pilate',
        'aliases': ['Pontius Pilate', 'Pilate of Pontus', 'Pilate', 'the procurator', 'The procurator', 'hegemon'],
        'subtitle': 'The Roman procurator of Judea',
        'body': "Rome's governor of Judea, who comes out onto the colonnade of Herod's palace in a white cloak with a blood-red lining. He hates the smell of rose oil and the city of Yershalaim, and on the morning of the fourteenth of Nisan he has a crushing headache and a prisoner to judge.",
    },
    {
        'id': 'yeshua', 'kind': 'person', 'storyRole': 'central', 'displayName': 'Yeshua Ha-Notsri',
        'aliases': ['Yeshua Ha-Notsri', 'Yeshua', 'Ha-Notsri'],
        'subtitle': 'A wandering philosopher from Gamala',
        'body': "A poor, beaten young man of about twenty-seven, brought bound before Pilate. He says he has no permanent home and is alone in the world, and he calls everyone, including the men who beat him, a good person.",
    },
    {
        'id': 'levi-matvei', 'kind': 'person', 'storyRole': 'major', 'displayName': 'Levi Matvei',
        'aliases': ['Levi Matvei', 'Levi', 'Matvei'],
        'subtitle': "Yeshua's only follower",
        'body': "A former tax collector who threw his money into the road to follow Yeshua and writes down what Yeshua says on a goatskin parchment. Yeshua says he writes down things that were never said.",
    },
    {
        'id': 'aphranius', 'kind': 'person', 'storyRole': 'major', 'displayName': 'Aphranius',
        'aliases': ['Aphranius'],
        'subtitle': "Head of the procurator's secret service",
        'body': "A middle-aged officer with a pleasant face, who keeps his small eyes half-hidden under heavy lids. He knows what happens in Yershalaim and reports it to Pilate in private.",
    },
    {
        'id': 'judas', 'kind': 'person', 'storyRole': 'major', 'displayName': 'Judas from Kiriath',
        'aliases': ['Judas from Kiriath', 'Judas'],
        'subtitle': 'A young man from Kiriath',
        'body': "A young man of Yershalaim. Yeshua tells Pilate that Judas was kind and inquisitive and invited him home.",
    },
    {
        'id': 'caiaphas', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Joseph Caiaphas',
        'aliases': ['Joseph Caiaphas', 'Caiaphas'],
        'subtitle': 'The high priest and president of the Sanhedrin',
        'body': "The acting head of the Jewish council in Yershalaim, which has condemned Yeshua and must decide which prisoner to release for the feast.",
    },
    {
        'id': 'mark-ratslayer', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Mark Ratslayer',
        'aliases': ['Mark Ratslayer', 'Ratslayer', 'Mark'],
        'subtitle': 'A Roman centurion',
        'body': "A giant of a centurion whose face was disfigured in battle. Pilate sends for him to teach a prisoner how to address the procurator.",
    },
    {
        'id': 'niza', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Niza',
        'aliases': ['Niza'],
        'subtitle': 'A young woman of Yershalaim',
        'body': "A young married woman of Yershalaim who knows Aphranius.",
    },
    {
        'id': 'bar-rabban', 'kind': 'person', 'storyRole': 'reference', 'displayName': 'Bar-Rabban',
        'aliases': ['Bar-Rabban'],
        'subtitle': 'A prisoner in Yershalaim',
        'body': "A man Pilate names while questioning Yeshua; his case also comes before the procurator that morning.",
    },
    {
        'id': 'dismas', 'kind': 'person', 'storyRole': 'reference', 'displayName': 'Dismas',
        'aliases': ['Dismas'],
        'subtitle': 'A prisoner in Yershalaim',
        'body': "A man Pilate names while questioning Yeshua; his case also comes before the procurator that morning.",
    },
    {
        'id': 'gestas', 'kind': 'person', 'storyRole': 'reference', 'displayName': 'Gestas',
        'aliases': ['Gestas'],
        'subtitle': 'A prisoner in Yershalaim',
        'body': "A man Pilate names while questioning Yeshua; his case also comes before the procurator that morning.",
    },
    {
        'id': 'banga', 'kind': 'creature', 'storyRole': 'supporting', 'displayName': 'Banga',
        'aliases': ['Banga'],
        'subtitle': "Pilate's dog",
        'body': "The dog Pilate calls for when his headaches overwhelm him.",
    },
]

BOOK_ID = 'crime-and-punishment'
CONTENT_VERSION = '2026-09-12.1'
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [
    {
        'id': 'raskolnikov', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Rodion Romanovich Raskolnikov', 'Rodion Romanovitch', 'Raskolnikov', 'Rodya', 'Rodenka'],
        'subtitle': 'A destitute former student in St. Petersburg',
        'body': "Living in a cramped, rented garret and behind on rent he cannot pay, he has withdrawn from friends and studies alike to brood over an idea he cannot quite bring himself to name. He sets out one hot evening on what he calls, to himself, only a rehearsal.",
    },
    {
        'id': 'sonya', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Sofya Semyonovna Marmeladov', 'Sofya Semyonovna', 'Sonya', 'Sonia'],
        'subtitle': "Marmeladov's daughter, forced into prostitution",
        'body': "Gentle and devout despite the life circumstances have forced on her, she supports her stepmother and half-siblings with money earned on the street. Raskolnikov hears her story from her drunken father before he ever meets her.",
    },
    {
        'id': 'razumikhin', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Dmitri Prokofitch Razumihin', 'Razumihin', 'Razumikhin'],
        'subtitle': "Raskolnikov's loyal former fellow student",
        'body': "Poor himself but relentlessly cheerful and resourceful, he has kept up his friendship with Raskolnikov even as the latter has cut off nearly everyone else. He takes it on himself to look after his friend once Raskolnikov falls seriously ill.",
    },
    {
        'id': 'porfiry', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Porfiry Petrovich', 'Porfiry'],
        'subtitle': 'The examining magistrate investigating the murders',
        'body': "A relation of Razumikhin's, sharp, talkative, and fond of drawn-out psychological sparring rather than direct accusation. His conversations with Raskolnikov circle the case with unsettling patience.",
    },
    {
        'id': 'dunya', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Avdotya Romanovna Raskolnikov', 'Avdotya Romanovna', 'Dunya', 'Dounia', 'Dunechka'],
        'subtitle': "Raskolnikov's younger sister",
        'body': "Intelligent, proud, and recently freed from an ugly situation as a governess, she has just become engaged to a lawyer she does not love in order to help her brother. She and their mother travel to St. Petersburg expecting a joyful reunion.",
    },
    {
        'id': 'pulkheria', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Pulcheria Alexandrovna', 'Pulkheria Alexandrovna'],
        'subtitle': "Raskolnikov's mother",
        'body': "Devoted and anxious about her son, whose infrequent, evasive letters have started to worry her badly. She travels to the capital with Dunya, hoping to see her son settled and well.",
    },
    {
        'id': 'luzhin', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Pyotr Petrovich Luzhin', 'Luzhin', 'Pyotr Petrovich'],
        'subtitle': "Dunya's wealthy, self-satisfied fiancé",
        'body': "A middle-aged lawyer of some means who has proposed to Dunya expecting a wife grateful enough to defer to him in everything. Raskolnikov takes an instant dislike to him, sight unseen, from his sister's letter alone.",
    },
    {
        'id': 'svidrigailov', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Arkady Ivanovitch Svidrigailov', 'Svidrigailov', 'Svidrigaïlov'],
        'subtitle': "Dunya's former employer, with a dark reputation",
        'body': "Wealthy, unsettling, and recently widowed, he pursued Dunya while she worked in his household and is rumored to be responsible for terrible things. His arrival in St. Petersburg alarms the whole Raskolnikov family.",
    },
    {
        'id': 'marmeladov', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Semyon Zakharovich Marmeladov', 'Marmeladov'],
        'subtitle': "Sonya's father, a ruined former civil servant",
        'body': "A hopeless drunkard who has driven his family into poverty and his daughter onto the street, he pours out his shame to Raskolnikov in a tavern with startling, self-lacerating honesty. His account is the reader's introduction to Sonya before she ever appears.",
    },
    {
        'id': 'katerina-ivanovna', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Katerina Ivanovna'],
        'subtitle': "Marmeladov's consumptive second wife",
        'body': "Once a genteel officer's daughter, now reduced to poverty and illness, she is proud, quick-tempered, and fiercely protective of her children by her first marriage. Her situation only worsens after her husband's accident.",
    },
    {
        'id': 'alyona-ivanovna', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Alyona Ivanovna'],
        'subtitle': 'An elderly pawnbroker',
        'body': "Miserly and widely disliked, she lends small sums against pledged goods at punishing rates from her cramped apartment. Raskolnikov has visited her before to pawn a watch and a ring.",
    },
    {
        'id': 'lizaveta', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Lizaveta Ivanovna', 'Lizaveta'],
        'subtitle': "Alyona Ivanovna's simple, put-upon half-sister",
        'body': "Meek and constantly at her sister's beck and call, she trades goods and does errands around the neighborhood, where Sonya and others know her as harmless and kind. She happens to keep company with the pawnbroker at an unfortunate hour.",
    },
    {
        'id': 'lebezyatnikov', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Andrei Semyonovitch Lebeziatnikov', 'Lebeziatnikov'],
        'subtitle': "Luzhin's roommate, a follower of fashionable new ideas",
        'body': "Earnest and easily excitable about the latest progressive theories, he shares lodgings with Luzhin and disapproves of his roommate's treatment of Sonya. His convictions are more sincere than his judgment.",
    },
    {
        'id': 'nastasya', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Nastasya'],
        'subtitle': "The landlady's servant who looks in on Raskolnikov",
        'body': "Blunt but not unkind, she brings Raskolnikov what food and news he gets in his isolated garret room. She is often the only person he speaks to for days at a stretch.",
    },
    {
        'id': 'zosimov', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Zossimov'],
        'subtitle': "A young doctor, Razumikhin's friend",
        'body': "Called in to attend Raskolnikov during his illness, he takes a professional, faintly curious interest in his patient's strange symptoms. He and Razumikhin discuss the case with more frankness than Raskolnikov would like.",
    },
    {
        'id': 'ilya-petrovich', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Ilya Petrovitch', 'Ilya Petrovich'],
        'subtitle': 'A police lieutenant nicknamed Gunpowder',
        'body': "Excitable and quick-tempered at the district police station, where Raskolnikov is summoned on an unrelated debt matter not long after the murders. His temperament earns him a nickname among the clerks.",
    },
    {
        'id': 'zamyotov', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Alexander Grigorievitch Zametov', 'Zametov'],
        'subtitle': 'A police clerk',
        'body': "Young and sharp, he is present at the station when Raskolnikov faints during questioning about the debt, and later listens, startled, as Raskolnikov half-jokingly describes exactly how he might have committed the murders. Razumikhin introduces the two over drinks.",
    },
    {
        'id': 'nikolai', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Nikolai', 'Mikolka'],
        'subtitle': 'A house painter who confesses to the murders',
        'body': "Working in the building at the time of the crime, he unexpectedly comes forward and confesses to a crime he did not commit, complicating the investigation considerably. Porfiry does not seem nearly as convinced by the confession as the reader might expect.",
    },
    {
        'id': 'polenka', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Polenka'],
        'subtitle': "Katerina Ivanovna's eldest daughter",
        'body': "Still a child, she is old enough to help look after her younger siblings and to feel her family's poverty and shame keenly. Raskolnikov shows her an unexpected tenderness.",
    },
]

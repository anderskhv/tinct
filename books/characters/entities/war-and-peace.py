# -*- coding: utf-8 -*-
BOOK_ID = 'war-and-peace'
CONTENT_VERSION = '2026-09-12.1'
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [
    {
        'id': 'pierre', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Pierre Bezúkhov', 'Pierre'],
        'subtitle': "Count Bezukhov's illegitimate son, newly returned from abroad",
        'body': "Large, awkward, and out of place among the polished company of a St. Petersburg soiree, he has just come back from years of education in France with opinions his hostess finds alarming. His father's fortune and title are about to change his life considerably.",
    },
    {
        'id': 'andrew', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Prince Andrew Bolkónski', 'Prince Andrew', 'Andrew Bolkónski'],
        'subtitle': "A discontented young officer, Pierre's closest friend",
        'body': "Clever, restless, and privately weary of both his marriage and society's chatter, he is about to leave for the army in search of the kind of glory he cannot find at home. His friendship with Pierre is one of the few things he takes entirely seriously.",
    },
    {
        'id': 'natasha', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Natásha Rostóva', 'Natásha', 'Natasha'],
        'subtitle': "The lively young daughter of the Rostov family",
        'body': "Still a girl at her family's name-day party, impulsive and full of feeling in a way her more careful relations are not, she grows up through the novel into the center of several men's hopes. Her warmth draws people to the Rostov household from every side.",
    },
    {
        'id': 'count-rostov', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Count Rostóv', 'Count Rostov'],
        'subtitle': "Natasha's father, a generous, improvident Moscow nobleman",
        'body': "Warmhearted and hospitable to a fault, he spends far more than the family's estate can support and leaves its finances in steadily worsening order. His household is nonetheless one of the warmest in Moscow.",
    },
    {
        'id': 'countess-rostova', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Countess Rostóva', 'Countess Rostova'],
        'subtitle': "Natasha's mother",
        'body': "Devoted to her children and increasingly anxious about the family's finances, she manages the Rostov household with more realism than her husband allows himself. Her children's marriages matter to her as much for security as for love.",
    },
    {
        'id': 'nicholas-rostov', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Nicholas Rostóv', 'Nicholas Rostov'],
        'subtitle': "Natasha's elder brother, a young hussar",
        'body': "Eager and impressionable, he leaves for the army early in the novel with romantic ideas about war that his first real campaign complicates considerably. His devotion to his regiment and his emperor runs deep.",
    },
    {
        'id': 'sonya', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Sónya', 'Sonya'],
        'subtitle': "A poor cousin raised alongside the Rostov children",
        'body': "Quiet and fiercely loyal, she has grown up in the Rostov household as one of the family without ever quite having a family of her own. Her attachment to Nicholas is the deepest feeling she has.",
    },
    {
        'id': 'petya', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Pétya Rostóv', 'Pétya', 'Petya'],
        'subtitle': "The youngest Rostov son",
        'body': "Still a boy for much of the novel, he idolizes his older brother Nicholas and longs for nothing more than to be old enough to join the army himself. His enthusiasm for glory is entirely unclouded by experience.",
    },
    {
        'id': 'vera', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Véra Rostóva', 'Véra', 'Vera Rostova'],
        'subtitle': "The eldest Rostov daughter",
        'body': "Correct and rather cold where her siblings are warm, she is generally considered the least charming of the Rostov children. Her engagement to Berg suits her practical temperament.",
    },
    {
        'id': 'berg', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Berg'],
        'subtitle': "An ambitious, methodical young officer",
        'body': "Precise to the point of absurdity about his own career and possessions, he courts and eventually marries Vera Rostova. His single-minded self-advancement amuses the rest of the Rostov family more than it impresses them.",
    },
    {
        'id': 'princess-mary', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Princess Mary Bolkónskaya', 'Princess Mary'],
        'subtitle': "Prince Andrew's plain, devout sister",
        'body': "Living under her demanding father's roof in the countryside, she finds her chief consolation in religion and in letters from a close friend in Moscow. Her father's temper and her own sense of duty leave her little room for a life of her own.",
    },
    {
        'id': 'old-prince-bolkonski', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['old Prince Bolkónski', 'old Prince Bolkonski'],
        'subtitle': "Andrew and Mary's father, a retired general",
        'body': "Exacting, sharp-tongued, and unable to tolerate idleness in himself or anyone near him, he keeps a strict household on his country estate. His children love him without ever quite feeling at ease around him.",
    },
    {
        'id': 'prince-vasili', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Prince Vasíli Kurágin', 'Prince Vasíli', 'Prince Vasili'],
        'subtitle': 'A well-connected St. Petersburg courtier',
        'body': "Smooth, calculating, and always alert to a useful match or a favor worth doing, he takes an active interest in Pierre's sudden inheritance and in placing his own children advantageously. Little he does in society is without a further motive.",
    },
    {
        'id': 'anatole', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Anatole Kurágin', 'Anatole'],
        'subtitle': "Prince Vasili's handsome, reckless son",
        'body': "Charming, careless with money and with other people's feelings, he drifts through society leaving debts and complications behind him. His good looks open doors his character does nothing to deserve.",
    },
    {
        'id': 'helene', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Hélène Kurágina', 'Hélène', 'Helene'],
        'subtitle': "Prince Vasili's beautiful daughter",
        'body': "Celebrated everywhere for her looks and her poise, she becomes entangled with Pierre's life not long after his fortune changes. Her serene surface gives away very little of what she actually wants.",
    },
    {
        'id': 'boris', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Borís Drubetskóy', 'Borís', 'Boris Drubetskoy', 'Boris'],
        'subtitle': "The ambitious son of a poor widowed friend of the Rostovs",
        'body': "Determined to make his way in the world through good connections rather than good luck, he cultivates useful friendships in the army and in society with quiet persistence. His childhood attachment to Natasha does not survive his ambitions.",
    },
    {
        'id': 'dolokhov', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Dólokhov', 'Dolokhov'],
        'subtitle': "A daring, dangerous officer and gambler",
        'body': "Fearless in battle and ruthless at the card table, he is a close companion of Anatole's in the wilder side of Moscow society. Few people cross him without regretting it.",
    },
    {
        'id': 'denisov', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Denísov', 'Denisov'],
        'subtitle': "Nicholas Rostov's hussar commander and friend",
        'body': "Blustering, warmhearted, and given to a speech impediment that softens his fierce reputation, he takes young Nicholas Rostov under his wing in the regiment. He later falls under Natasha's spell during a visit to Moscow.",
    },
    {
        'id': 'kutuzov', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Kutúzov', 'Kutuzov'],
        'subtitle': 'The aging Russian commander-in-chief',
        'body': "Patient, unglamorous, and often distrusted by the younger officers around him, he commands the Russian armies against Napoleon with a fatalism that looks like weakness until events prove otherwise. His calm is deliberate, not accidental.",
    },
    {
        'id': 'napoleon', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Napoleon'],
        'subtitle': 'The French emperor',
        'body': "Discussed, admired, and feared across Russian drawing rooms long before he ever appears in the story directly, he embodies the historical current the whole novel moves against. Pierre in particular cannot decide what to make of him.",
    },
    {
        'id': 'platon-karataev', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Platón Karatáev', 'Karatáev', 'Platon Karataev'],
        'subtitle': 'A simple peasant soldier Pierre meets as a prisoner',
        'body': "Round, gentle, and entirely at peace with whatever happens to him, he shares Pierre's captivity and offers him a way of seeing the world that Pierre has never encountered among his own class. His effect on Pierre outlasts their brief acquaintance.",
    },
    {
        'id': 'marya-dmitrievna', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Márya Dmítrievna', 'Marya Dmitrievna'],
        'subtitle': 'A blunt, formidable family friend of the Rostovs',
        'body': "Known throughout Moscow for saying exactly what she thinks regardless of rank, she is one of the few people who can speak plainly to the Rostov family in a crisis. Her bluntness comes from real affection, not indifference.",
    },
]

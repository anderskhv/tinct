# -*- coding: utf-8 -*-
"""Essays (Montaigne) — entity declarations for build_generic.py.

The 10 existing entries (montaigne-himself through the-body-and-experience)
are carried over verbatim, bodies unchanged, from the released package.
That package predates this session and uses an unusual editorial style for
this book — several cards are essay-theme personifications rather than
individuals, and two ("seneca-and-plutarch", "cato-and-roman-exemplars")
merge multiple distinct historical people under one card. That merge is a
real identity-resolution defect by this project's own standard (see the
character-coverage-library-batch ledger), but splitting it safely needs the
same context-scoped, per-occurrence binding used for the Bible's Zedekiahs
-- out of scope for this pass, which only adds cleanly-identifiable missing
individuals. Flagged, not fixed, here.
"""

BOOK_ID = 'essays-montaigne'
CONTENT_VERSION = '2026-09-17.1'
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [
    {
        'id': 'montaigne-himself', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Montaigne created the expression', 'Montaigne'],
        'subtitle': 'The essayist, examining his own mind',
        'body': "The author's own running self-portrait, the true subject of the Essays. A translator's note preserves the moment he coined the term \"popular poetry\" in French — a small, telling instance of a mind that constantly names and studies its own operations.",
    },
    {
        'id': 'death', 'kind': 'personification', 'storyRole': 'central',
        'aliases': ['to prepare one’s self to die', 'to prepare oneself to die'],
        'subtitle': "'To philosophize is to learn to die'",
        'body': "The subject of one of Montaigne's most famous essays, which opens by citing Cicero's claim that to study philosophy is nothing but to prepare oneself to die — study being, Montaigne argues, a kind of apprenticeship in separating the soul from the body.",
    },
    {
        'id': 'socrates', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Socrates answer Crito', 'Socrates'],
        'subtitle': "Montaigne's most-cited exemplar",
        'body': "Montaigne's recurring model of composed, undramatic wisdom — invoked here for his famously offhand answer to Crito, who asked at his death how he wished to be buried, treating the disposal of his body as a matter of supreme indifference.",
    },
    {
        'id': 'etienne-de-la-boetie', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['La Boetie) called it', 'La Boétie', 'Étienne de La Boétie'],
        'subtitle': "Montaigne's late, irreplaceable friend",
        'body': "The friend whose death Montaigne mourned all his life and whose sayings he quotes throughout the Essays — here credited with calling beauty \"a short tyranny,\" one of the small fragments of La Boétie's mind Montaigne preserves by continuing to converse with him in writing.",
    },
    {
        'id': 'seneca-and-plutarch', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Plutarch says of those who', 'Seneca, Hippolytus'],
        'subtitle': "Montaigne's two constant companions",
        'body': "The Stoic Seneca and the moralist Plutarch, quoted and paraphrased more often than any other authors in the Essays — less as authorities to defer to than as conversation partners Montaigne argues with, borrows from, and measures his own experience against.",
    },
    {
        'id': 'cato-and-roman-exemplars', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Octavius and Cato'],
        'subtitle': 'Ancient models of constancy',
        'body': "Cato the Younger and figures like him — the great men of the Roman civil wars invoked here — serve Montaigne as touchstones for constancy and self-command under extremity, examples he tests as often as he admires.",
    },
    {
        'id': 'skepticism-que-sais-je', 'kind': 'personification', 'storyRole': 'central',
        'aliases': ['What do I know'],
        'subtitle': "Montaigne's chosen motto",
        'body': "The question Montaigne adopted as his personal motto, borne with the emblem of a pair of scales: a deliberate, working skepticism that treats even the most certain-seeming statement — \"it is fine weather\" — as a form of speech that can still deceive us.",
    },
    {
        'id': 'cannibals-new-world', 'kind': 'personification', 'storyRole': 'major',
        'aliases': ['barbarians', 'the New World'],
        'subtitle': "'Of Cannibals'",
        'body': "The subject of one of the boldest essays: an account, drawn from a servant who had lived years in Brazil, of a people Europeans called barbarous — which Montaigne uses to argue that \"barbarism\" is mostly a matter of being unlike one's own customs.",
    },
    {
        'id': 'custom-and-cruelty', 'kind': 'personification', 'storyRole': 'major',
        'aliases': ['the power of custom'],
        'subtitle': 'How habit reshapes nature',
        'body': "The subject of \"Of Custom\": Montaigne's argument, illustrated by the story of a countrywoman who carried a growing calf every day until she could carry a full-grown ox, that habit can make the most unnatural things feel entirely natural to us.",
    },
    {
        'id': 'the-body-and-experience', 'kind': 'personification', 'storyRole': 'major',
        'aliases': ['we therein employ experience', 'we call in experience'],
        'subtitle': "Montaigne's late, physical philosophy",
        'body': "The turn, especially pronounced in the later books, toward the body's own testimony — illness, aging, appetite, and sensation treated as sources of philosophical knowledge in their own right, not distractions from the mind's proper business.",
    },
    # -- New: the most-cited classical authorities with no card at all --
    {
        'id': 'cicero', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Cicero'],
        'subtitle': 'Roman orator and philosopher, Montaigne’s most-quoted source',
        'body': "The single most frequently cited authority in the Essays, quoted and argued with on questions from death and grief to old age and public duty. Montaigne treats him as a peer to reason with, not just an authority to defer to.",
    },
    {
        'id': 'plato', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Plato'],
        'subtitle': 'Greek philosopher, cited throughout as a moral authority',
        'body': "Repeatedly invoked for precepts such as “know thyself” and for his views on education, the soul, and the good life, treated as one of Montaigne's central philosophical touchstones alongside Cicero and Seneca.",
    },
    {
        'id': 'horace', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Horace'],
        'subtitle': 'Roman poet, frequently quoted in the essays’ marginal citations',
        'body': "Quoted throughout the Essays, often in the bracketed Latin citations that punctuate Montaigne's prose, on themes of moderation, mortality, and how to live.",
    },
    {
        'id': 'julius-caesar-montaigne', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Caesar'],
        'subtitle': 'Roman general and statesman, cited as a historical exemplar',
        'body': "Cited repeatedly as a historical example of ambition, courage, and fortune. Most bare references to “Caesar” in the Essays are to Julius Caesar, though a handful explicitly concern Augustus Caesar instead — those specific occurrences have not been separated out from this card, and remain an acknowledged limit rather than a claim that every occurrence is Julius.",
    },
    {
        'id': 'aristotle', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Aristotle'],
        'subtitle': 'Greek philosopher, cited as an authority Montaigne often tests',
        'body': "Cited on questions of ethics and natural philosophy, frequently as a position Montaigne examines and sometimes pushes back against rather than simply accepts.",
    },
    {
        'id': 'lucretius', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Lucretius'],
        'subtitle': 'Roman poet-philosopher, a recurring source of quoted verse',
        'body': "Quoted repeatedly, especially in the bracketed Latin citations, on the nature of the soul, death, and the physical world.",
    },
    {
        'id': 'alexander-montaigne', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Alexander'],
        'subtitle': 'Alexander the Great, cited as a historical exemplar',
        'body': "Cited as a historical example, among others, of conquest, ambition, and how great men treated the cities and people they overcame.",
    },
]

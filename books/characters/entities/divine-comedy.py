# -*- coding: utf-8 -*-
"""The Divine Comedy — entity declarations for build_generic.py.

The 22 existing entries are carried over verbatim (name/subtitle/body/
aliases copied exactly from the released package) from the released
package. Adds 6 clearly identifiable, previously uncarded figures found
via a frequency scan against existing coverage. Given the sheer scale of
named allusions in this poem (comparable to The Republic), this is
explicitly a bounded, not exhaustive, pass — see the library-batch ledger
for what remains undone, including the ambiguous "Guido" references
(Dante names at least two different Guidos — da Montefeltro and
Cavalcanti — and this pass does not attempt to disambiguate per-occurrence).
"""

BOOK_ID = 'divine-comedy'
CONTENT_VERSION = '2026-09-17.1'
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [
    {'id': 'dante', 'kind': 'person', 'storyRole': 'central', 'aliases': ['Dante'], 'subtitle': '',
     'body': "The poem's pilgrim and narrator, a man lost in a dark wood at the midpoint of his life, from where his journey through the afterlife begins. He rarely names himself in the poem, though the whole account is told in his own voice."},
    {'id': 'virgil', 'kind': 'person', 'storyRole': 'central', 'aliases': ['Virgilius', 'Virgil'], 'subtitle': '',
     'body': "The Roman poet, author of the Aeneid, sent to guide Dante the pilgrim through Hell and up the mountain of Purgatory. He speaks with the authority of a revered master, though as a pagan he cannot himself enter Paradise."},
    {'id': 'beatrice', 'kind': 'person', 'storyRole': 'central', 'aliases': ['Beatrice'], 'subtitle': '',
     'body': "A woman Dante loved and lost to death in his youth, who sends Virgil to rescue him and later becomes his own guide through Paradise. Her appearance marks the point at which Virgil's guidance gives way to hers."},
    {'id': 'francesca', 'kind': 'person', 'storyRole': 'major', 'aliases': ['Francesca'], 'subtitle': '',
     'body': "A woman punished among the lustful for an adulterous love affair that ended in her murder alongside her lover. She speaks to Dante with a courtesy that makes her circle of Hell one of the poem's most affecting encounters."},
    {'id': 'farinata', 'kind': 'person', 'storyRole': 'supporting', 'aliases': ['Farinata'], 'subtitle': '',
     'body': "A Florentine nobleman and leader of the Ghibelline faction, discovered by Dante standing upright in a flaming tomb among the heretics. His pride in his political legacy survives even his damnation."},
    {'id': 'ulysses', 'kind': 'person', 'storyRole': 'major', 'aliases': ['Ulysses'], 'subtitle': '',
     'body': "The Greek hero of Homer's epics, encountered by Dante wrapped in a tongue of flame among the fraudulent counselors. He recounts a final voyage undertaken after his return to Ithaca, never told by Homer."},
    {'id': 'ugolino', 'kind': 'person', 'storyRole': 'major', 'aliases': ['Ugolino'], 'subtitle': '',
     'body': "Count Ugolino, a Pisan nobleman frozen in the ice of the lowest circle of Hell, gnawing at the skull of the archbishop who betrayed him. He tells Dante the story of his own downfall and the fate of his sons, imprisoned with him."},
    {'id': 'lucifer', 'kind': 'person', 'storyRole': 'central', 'aliases': ['Lucifer', 'Satan'], 'subtitle': '',
     'body': "The fallen archangel, frozen at the absolute center of the earth in the lowest depth of Hell. Once the most beautiful of the angels, his three faces and beating wings mark the physical bottom of Dante's descent."},
    {'id': 'statius', 'kind': 'person', 'storyRole': 'supporting', 'aliases': ['Statius'], 'subtitle': '',
     'body': "A Roman poet who joins Dante and Virgil partway up the mountain of Purgatory, newly freed after centuries of penance. He reveals to a surprised Virgil that he was, in secret, a Christian."},
    {'id': 'bernard', 'kind': 'person', 'storyRole': 'supporting', 'aliases': ['Bernard'], 'subtitle': '',
     'body': "Bernard of Clairvaux, a medieval mystic and contemplative who takes over from Beatrice as Dante's final guide in the highest reaches of Paradise. He leads Dante in prayer to the Virgin Mary at the poem's climax."},
    {'id': 'cato', 'kind': 'person', 'storyRole': 'supporting', 'aliases': ['Cato'], 'subtitle': '',
     'body': "Cato of Utica, a Roman Stoic and famous suicide, found by Dante and Virgil guarding the shore at the foot of Mount Purgatory. His presence there, among the saved, is one of the poem's more startling choices."},
    {'id': 'brunetto', 'kind': 'person', 'storyRole': 'supporting', 'aliases': ['Brunetto'], 'subtitle': '',
     'body': "Brunetto Latini, a Florentine scholar and statesman who had been Dante's own teacher. Dante finds him running eternally among the sodomites, and the two speak with evident mutual affection despite the circumstances."},
    {'id': 'thomas-aquinas', 'kind': 'person', 'storyRole': 'supporting', 'aliases': ['Thomas'], 'subtitle': '',
     'body': "The great Dominican theologian, encountered by Dante among the wise spirits in the heaven of the sun. He introduces Dante to the circle of learned souls gathered there."},
    {'id': 'cacciaguida', 'kind': 'person', 'storyRole': 'supporting', 'aliases': ['Cacciaguida'], 'subtitle': '',
     'body': "Dante's own great-great-grandfather, a crusader knight met in the heaven of Mars. He speaks to Dante of old Florence and foretells the exile still to come in the poet's own life."},
    {'id': 'sordello', 'kind': 'person', 'storyRole': 'supporting', 'aliases': ['Sordello'], 'subtitle': '',
     'body': "A troubadour poet of Mantua, encountered among the late-repentant souls in ante-Purgatory. His warm greeting of a fellow Mantuan, Virgil, opens a long passage on the state of Italy's politics."},
    {'id': 'forese', 'kind': 'person', 'storyRole': 'supporting', 'aliases': ['Forese'], 'subtitle': '',
     'body': "Forese Donati, a Florentine friend of Dante's from his youth, found gaunt with hunger among those purging the sin of gluttony. Their reunion is affectionate and marked by frank talk of Florence's decline."},
    {'id': 'manfred', 'kind': 'person', 'storyRole': 'supporting', 'aliases': ['Manfredi'], 'subtitle': '',
     'body': "The excommunicated King of Sicily, met among the late-repentant on the shore of Purgatory. He explains to Dante how a last-minute act of repentance saved him from damnation despite the Church's condemnation."},
    {'id': 'matelda', 'kind': 'person', 'storyRole': 'supporting', 'aliases': ['Matilda'], 'subtitle': '',
     'body': "A woman who tends the garden of the Earthly Paradise atop Mount Purgatory, singing and gathering flowers when Dante first sees her. She explains the nature of the place before Beatrice's arrival."},
    {'id': 'mary', 'kind': 'person', 'storyRole': 'reference', 'aliases': ['Mary'], 'subtitle': '',
     'body': "The Virgin Mary, invoked throughout the poem as an intercessor and the one who first set Dante's rescue in motion. She appears directly only near the poem's end, in the highest reaches of Paradise."},
    {'id': 'charon', 'kind': 'person', 'storyRole': 'reference', 'aliases': ['Charon'], 'subtitle': '',
     'body': "The ferryman of classical myth who carries the souls of the damned across the river into Hell proper. He balks at first when he sees a living man among the dead waiting to cross."},
    {'id': 'minos', 'kind': 'person', 'storyRole': 'reference', 'aliases': ['Minos'], 'subtitle': '',
     'body': "The mythical judge of the underworld, who assigns each arriving soul to its circle of Hell by the coiling of his tail. His judgment is the formality every damned soul must pass on entering Hell proper."},
    {'id': 'pier-della-vigna', 'kind': 'person', 'storyRole': 'supporting', 'aliases': ['Pier'], 'subtitle': '',
     'body': "Once a powerful chancellor to the Emperor Frederick II, before a fall from favor drove him to suicide. Dante finds him transformed into a gnarled tree among the suicides in the wood of the second ring."},
    # -- New --
    {
        'id': 'saint-peter', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Saint Peter', 'Peter'],
        'subtitle': 'The apostle, examiner of faith in Paradise',
        'body': "Named first as the saint whose gate Dante hopes to reach, and later encountered directly among the blessed in Paradise, where he questions Dante on the nature of faith.",
    },
    {
        'id': 'adam', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Adam'],
        'subtitle': 'The first man',
        'body': "Named first in a phrase for fallen humanity generally (“the evil seed of Adam”), and later encountered directly as a soul in Paradise, where he speaks with Dante about his own creation and fall.",
    },
    {
        'id': 'emperor-frederick-ii', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Frederick'],
        'subtitle': 'Holy Roman Emperor, encountered among the heretics',
        'body': "Referred to as “the second Frederick,” found among the heretics burning in fiery tombs in the sixth circle of Hell.",
    },
    {
        'id': 'empress-piccarda', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Piccarda'],
        'subtitle': 'A soul Dante meets in the lowest sphere of Paradise',
        'body': "A soul Dante's guide points out in the sphere of the Moon, the first of the blessed he speaks with directly in Paradise.",
    },
    {
        'id': 'justinian', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Justinian'],
        'subtitle': 'Roman emperor and lawgiver, encountered in Paradise',
        'body': "Named in the sphere of Mercury, where he recounts the history of the Roman Empire and his own work codifying its laws.",
    },
    {
        'id': 'pope-boniface-viii', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Boniface'],
        'subtitle': 'A pope condemned among the simoniacs',
        'body': "Mistaken by a soul already in the pit of the simoniac popes for the pope he expects to arrive next — a foretelling of Boniface's own eventual place there, seen from Hell's side of time.",
    },
]

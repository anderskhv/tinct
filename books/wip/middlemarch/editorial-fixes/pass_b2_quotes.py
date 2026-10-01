"""Pass B2: periodical/title quote marks follow the original's convention (live numbering)."""
from edits import apply

EDITS = [
    (17, 9, 'one of the Lancet’s people', 'one of the ‘Lancet’s’ people'),
    (18, 27, 'for the Twaddler’s Magazine.', 'for the ‘Twaddler’s Magazine.’'),
    (28, 23, 'such a sugary invention, as an Elizabethan might call it', 'such a ‘sugared invention,’ as an Elizabethan might call it'),
    (68, 11, 'close or let the Shrubs and', 'close or let ‘The Shrubs’ and'),
    (39, 47, 'scanning the ‘Trumpet’s’ columns', 'scanning the “Trumpet’s” columns'),
    (40, 46, 'the ‘Trumpet’s’ criticisms', 'the “Trumpet’s” criticisms'),
    (47, 14, 'making the ‘Pioneer’ famous', 'making the “Pioneer” famous'),
    (47, 18, 'editor of the ‘Pioneer’ increasingly', 'editor of the “Pioneer” increasingly'),
    (47, 20, 'editor of the ‘Trumpet,’ in asserting', 'editor of the “Trumpet,” in asserting'),
    (47, 20, 'In a ‘Trumpet’ editorial', 'In a “Trumpet” editorial'),
    (47, 28, 'over the ‘Pioneer’s’ columns', 'over the “Pioneer’s” columns'),
    (49, 2, 'Keble’s ‘Christian Year.’', 'Keble’s “Christian Year.”'),
    (63, 11, 'a thoroughly blue scandal', 'a sad dark-blue scandal'),
]

if __name__ == '__main__':
    apply(EDITS)

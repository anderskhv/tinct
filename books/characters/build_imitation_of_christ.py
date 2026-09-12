import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble, main as run

BASE = Path(__file__).resolve().parent / 'imitation-of-christ'

# Every Bible-book-named entity is bound only at its exact confirmed
# prose location(s), never by a global alias -- see author_content.py's
# module docstring for why (76 of 774 paragraphs per edition are
# dedicated scripture-citation strings that would otherwise collide).
LOCATION_BINDINGS = {
    'john-baptist': [(101, 2), (113, 4)],
    'job-person': [(34, 5)],
    'luke-evangelist': [(19, 7)],
    'moses': [(39, 1), (39, 3), (75, 2), (97, 5)],
    'samuel-prophet': [(39, 1)],
    'solomon': [(97, 5)],
    'noah': [(97, 5)],
    'joshua': [(75, 2)],
    'david': [(97, 9)],
    'paul-apostle': [(13, 9), (31, 4), (37, 12), (73, 1)],
    'peter-apostle': [(90, 1)],
}

WORD_FOR_ENTITY = {
    'john-baptist': r'(?<!\w)John(?!\w)',
    'job-person': r'(?<!\w)Job(?!\w)',
    'luke-evangelist': r'(?<!\w)Luke(?!\w)',
    'moses': r'(?<!\w)Moses(?!\w)',
    'samuel-prophet': r'(?<!\w)Samuel(?!\w)',
    'solomon': r'(?<!\w)Solomon(?!\w)',
    'noah': r'(?<!\w)Noah(?!\w)',
    'joshua': r'(?<!\w)Joshua(?!\w)',
    'david': r'(?<!\w)David(?!\w)',
    'paul-apostle': r'(?<!\w)Paul(?!\w)',
    'peter-apostle': r'(?<!\w)Peter(?!\w)',
}


def bind(edition, ch, pi, text, entities):
    out = exact(edition, ch, pi, text, entities)
    for entity_id, locs in LOCATION_BINDINGS.items():
        if (ch, pi) in locs:
            for m in re.finditer(WORD_FOR_ENTITY[entity_id], text):
                out.append((m.start(), m.end(), entity_id, 'reviewed-context'))
    return out


def compile_package():
    return assemble('imitation-of-christ', bind)


if __name__ == '__main__':
    run('imitation-of-christ', 'The Imitation of Christ', bind)

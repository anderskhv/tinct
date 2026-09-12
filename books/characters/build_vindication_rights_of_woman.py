import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble, main as run

BASE = Path(__file__).resolve().parent / 'vindication-rights-of-woman'

# "Eloisa" names two different women in this book (see author_content.py's
# module docstring): Rousseau's fictional Julie at (4, 51), and the real
# historical Heloise at (6, 85). Neither entity carries a global alias for
# that spelling; both are bound only at their confirmed location(s).
ELOISA_LOCATIONS = {
    'eloisa-julie': [(4, 51)],
    'heloise-historical': [(6, 85)],
}

# "Day" (Thomas Day, author of Sandford and Merton) is an ordinary word
# throughout this book, so it carries no global alias either -- bound only
# at its one confirmed prose location.
DAY_LOCATIONS = [(5, 9)]


def bind(edition, ch, pi, text, entities):
    out = exact(edition, ch, pi, text, entities)
    for entity_id, locs in ELOISA_LOCATIONS.items():
        if (ch, pi) in locs:
            for m in re.finditer(r'(?<!\w)Eloisa(?!\w)', text):
                out.append((m.start(), m.end(), entity_id, 'reviewed-context'))
    if (ch, pi) in DAY_LOCATIONS:
        for m in re.finditer(r'(?<!\w)Day(?!\w)', text):
            out.append((m.start(), m.end(), 'thomas-day', 'reviewed-context'))
    return out


def compile_package():
    return assemble('vindication-rights-of-woman', bind)


if __name__ == '__main__':
    run('vindication-rights-of-woman', 'A Vindication of the Rights of Woman', bind)

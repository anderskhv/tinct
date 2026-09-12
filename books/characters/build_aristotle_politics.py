import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble, main as run

BASE = Path(__file__).resolve().parent / 'aristotle-politics'


def bind(edition, ch, pi, text, entities):
    out = exact(edition, ch, pi, text, entities)

    # "Dionysius" names two tyrants of Syracuse, father and son. Neither
    # carries a global alias; each bare mention is bound to its Dionysius
    # by location. Dionysius II is explicitly "the younger" at 5:59.
    dionysius_i_locs = {(1, 41), (3, 70), (5, 19), (5, 21), (5, 29), (5, 49), (5, 67)}
    dionysius_ii_locs = {(5, 59), (5, 61), (5, 63)}
    if (ch, pi) in dionysius_i_locs:
        for m in re.finditer(r'(?<!\w)Dionysius(?!\w)', text):
            out.append((m.start(), m.end(), 'dionysius-i', 'reviewed-context'))
    if (ch, pi) in dionysius_ii_locs:
        for m in re.finditer(r'(?<!\w)Dionysius(?!\w)', text):
            out.append((m.start(), m.end(), 'dionysius-ii', 'reviewed-context'))

    # "Periander" names two tyrants. Corinth's carries the global alias
    # "Periander" (via reviewed_aliases, already in `out`); Ambracia's two
    # locations are excluded from that and rebound here instead.
    if (ch, pi) in {(5, 15), (5, 54)}:
        out = [m for m in out if m[2] != 'periander-corinth']
        for m in re.finditer(r'(?<!\w)Periander(?!\w)', text):
            out.append((m.start(), m.end(), 'periander-ambracia', 'reviewed-context'))

    # "Thrasybulus" names two different tyrants; neither carries a global
    # alias.
    if (ch, pi) in {(3, 54), (5, 52)}:
        for m in re.finditer(r'(?<!\w)Thrasybulus(?!\w)', text):
            out.append((m.start(), m.end(), 'thrasybulus-miletus', 'reviewed-context'))
    if (ch, pi) in {(5, 63), (5, 76)}:
        for m in re.finditer(r'(?<!\w)Thrasybulus(?!\w)', text):
            out.append((m.start(), m.end(), 'thrasybulus-syracuse', 'reviewed-context'))

    # "Pausanias" names three different men; none carries a global alias.
    if (ch, pi) in {(5, 2), (7, 57)}:
        for m in re.finditer(r'(?<!\w)Pausanias(?!\w)', text):
            out.append((m.start(), m.end(), 'king-pausanias', 'reviewed-context'))
    if (ch, pi) == (5, 26):
        for m in re.finditer(r'(?<!\w)Pausanias(?!\w)', text):
            out.append((m.start(), m.end(), 'pausanias-regent', 'reviewed-context'))
    if (ch, pi) == (5, 54):
        for m in re.finditer(r'(?<!\w)Pausanias(?!\w)', text):
            out.append((m.start(), m.end(), 'pausanias-assassin', 'reviewed-context'))

    # "Cleisthenes" names grandfather and grandson; neither carries a
    # global alias.
    if (ch, pi) in {(3, 5), (6, 11)}:
        for m in re.finditer(r'(?<!\w)Cleisthenes(?!\w)', text):
            out.append((m.start(), m.end(), 'cleisthenes-athens', 'reviewed-context'))
    if (ch, pi) in {(5, 74), (5, 78)}:
        for m in re.finditer(r'(?<!\w)Cleisthenes(?!\w)', text):
            out.append((m.start(), m.end(), 'cleisthenes-sicyon', 'reviewed-context'))

    # "Timophanes" names two unrelated men; neither carries a global
    # alias.
    if (ch, pi) == (5, 14):
        for m in re.finditer(r'(?<!\w)Timophanes(?!\w)', text):
            out.append((m.start(), m.end(), 'timophanes-mitylene', 'reviewed-context'))
    if (ch, pi) == (5, 22):
        for m in re.finditer(r'(?<!\w)Timophanes(?!\w)', text):
            out.append((m.start(), m.end(), 'timophanes-corinth', 'reviewed-context'))

    # "Amyntas" (son of Archelaus) has no global alias -- it would collide
    # with "Amyntas the little"'s own bare fallback if both were global at
    # 5:54. "Amyntas the little"/"Amyntas the Little" is a global alias
    # (via reviewed_aliases) and always outscores the bare form at the
    # same position via longest-span-first, so only the *other* bare
    # "Amyntas" in the same paragraph needs binding here.
    if (ch, pi) == (5, 54):
        for m in re.finditer(r'(?<!\w)Amyntas(?!\w)', text):
            if text[m.end():m.end() + 10].lstrip().lower().startswith('the little'):
                continue
            out.append((m.start(), m.end(), 'amyntas-son-of-archelaus', 'reviewed-context'))

    # Dionysius II is never named directly by a global alias (it would
    # collide with Dionysius I's); bind its own three locations here too,
    # already covered above via dionysius_ii_locs -- no separate action
    # needed for the entity's *identity* card, only for suppressing a
    # duplicate global match, which reviewed_aliases never produces since
    # dionysius-ii carries no alias at all.

    return out


def compile_package():
    return assemble('aristotle-politics', bind)


if __name__ == '__main__':
    run('aristotle-politics', 'Politics', bind)

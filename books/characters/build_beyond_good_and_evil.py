import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble, main as run

BASE = Path(__file__).resolve().parent / 'beyond-good-and-evil'


def bind(edition, ch, pi, text, entities):
    out = exact(edition, ch, pi, text, entities)

    # original-en's "Caesar Borgia" (6:11) contains the bare word "Caesar",
    # which the exact matcher would otherwise misbind to Julius Caesar via
    # his 'Caesar' alias. modern-en spells it "Cesare Borgia" and never
    # collides, so this filter is a no-op there.
    if (ch, pi) == (6, 11):
        out = [m for m in out if m[2] != 'julius-caesar']

    # original-en's "Pascal-like SACRIFIZIA DELL' INTELLETO" (8:15) is an
    # adjective, not a mention of Pascal himself -- the hyphen (not a \w
    # character) lets the word-boundary-safe matcher through where it would
    # correctly reject a suffixed form like "Pascalian" (modern-en's actual
    # word there, which never matches at all).
    if (ch, pi) == (8, 15):
        out = [m for m in out if not (m[2] == 'pascal' and text[m[0]:m[1]] == 'Pascal'
                                       and text[m[1]:m[1] + 5] == '-like')]

    # "Frederick" names two different men, split cleanly by location:
    # Frederick II of Hohenstaufen (6:14) and Frederick the Great of
    # Prussia (7:5). Neither entity carries a global alias for the bare
    # name -- both are bound only here.
    if (ch, pi) == (6, 14):
        for m in re.finditer(r'(?<!\w)Frederick(?!\w)', text):
            out.append((m.start(), m.end(), 'frederick-ii-hohenstaufen', 'reviewed-context'))
    if (ch, pi) == (7, 5):
        for m in re.finditer(r'(?<!\w)Frederick(?!\w)', text):
            out.append((m.start(), m.end(), 'frederick-the-great', 'reviewed-context'))

    # "Sand" names two different people, split cleanly by location: George
    # Sand the novelist (8:19) and Karl Ludwig Sand, Kotzebue's assassin
    # (9:4). Neither entity carries a global alias for the bare name.
    if (ch, pi) == (8, 19):
        for m in re.finditer(r'(?<!\w)Sand(?!\w)', text):
            out.append((m.start(), m.end(), 'george-sand', 'reviewed-context'))
    if (ch, pi) == (9, 4):
        for m in re.finditer(r'(?<!\w)Sand(?!\w)', text):
            out.append((m.start(), m.end(), 'karl-ludwig-sand', 'reviewed-context'))

    return out


def compile_package():
    return assemble('beyond-good-and-evil', bind)


if __name__ == '__main__':
    run('beyond-good-and-evil', 'Beyond Good and Evil', bind)

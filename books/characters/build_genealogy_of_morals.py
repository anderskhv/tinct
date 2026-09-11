"""Deterministic binding for the Genealogy of Morals character package.

Every bound name in this book resolves to exactly one entity: there is no
namesake collision among the entries in editorial.json (verified against
both English editions before authoring -- see README, 'Namesakes'). So the
plain exact-alias matcher is sufficient for everything except one work-named-
after-its-protagonist trap: "Zarathustra" also names Nietzsche's own book
(the Preface's "my Zarathustra" and the Third Essay's epigraph attribution
"Thus Spake Zarathustra"), so that entity carries no bare alias and is bound
only at its one genuine person reference, 3:31 -- see README, 'Person or not'.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble, main as run

BASE = Path(__file__).resolve().parent / 'genealogy-of-morals'


def bind(edition, ch, pi, text, entities):
    out = exact(edition, ch, pi, text, entities)
    if (ch, pi) == (3, 31):
        for m in re.finditer(r'(?<!\w)Zarathustra(?!\w)', text):
            out.append((m.start(), m.end(), 'zarathustra', 'reviewed-context'))
    return out


def compile_package():
    return assemble('genealogy-of-morals', bind)


if __name__ == '__main__':
    run('genealogy-of-morals', 'On the Genealogy of Morals', bind)

"""Deterministic binding for the Fear and Trembling character package.

One real namesake collision in this book: "Sarah" names two different
people. Abraham's wife is named everywhere in the Exordium, the Eulogy, and
the frame of Problema III (7:0-7:39, 7:47 onward); a wholly different
Sarah -- daughter of Raguel and Edna in the Book of Tobit -- is named only
within Johannes de Silentio's digression on the Book of Tobit, 7:40 through
7:46 inclusive. Both editions place every "Sarah" occurrence at the same
locations (verified before authoring), so the same paragraph-range rule
binds correctly in original-en and modern-en alike.

Every other bound name in this book resolves to exactly one entity with
the plain exact-alias matcher; see reviewed_aliases.py.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble, main as run

BASE = Path(__file__).resolve().parent / 'fear-and-trembling'

TOBIT_SARAH_PARAGRAPHS = {40, 42, 43, 44, 46}


def bind(edition, ch, pi, text, entities):
    # sarah / sarah-tobit carry no aliases in editorial.json, so exact()
    # never matches them; this loop is the only source of "Sarah" mentions.
    out = exact(edition, ch, pi, text, entities)
    sarah_id = 'sarah-tobit' if (ch == 7 and pi in TOBIT_SARAH_PARAGRAPHS) else 'sarah'
    for m in re.finditer(r'(?<!\w)Sarah(?!\w)', text):
        out.append((m.start(), m.end(), sarah_id, 'reviewed-context'))
    return out


def compile_package():
    return assemble('fear-and-trembling', bind)


if __name__ == '__main__':
    run('fear-and-trembling', 'Fear and Trembling', bind)

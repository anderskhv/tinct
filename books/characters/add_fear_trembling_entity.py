#!/usr/bin/env python3
"""Add the Agnete/Agnes figure from Kierkegaard's "legend of Agnete and the
merman" to Fear and Trembling's character package -- the book's extended
worked example in the "Problema" sections (61 occurrences across two
spellings, 'Agnete' and 'Agnes', entirely uncarded). This is a discursive
illustration, not a narrative character, so it is added as a reference/
concept card, in the same spirit as pre-existing reference cards elsewhere
in this library (e.g. essays-montaigne's "the-body-and-experience"). The
Merman himself is not bound: "merman"/"mermen" is used generically
throughout the surrounding philosophical discussion, not only for this
specific figure, so a bare-word bind would be ambiguous.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity

add_entity(
    'fear-and-trembling', 'agnete', 'Agnete', '',
    "The innocent girl in the legend of Agnete and the merman, which Kierkegaard uses at length as a worked illustration of the demonic and of repentance alongside his reading of Abraham.",
    'reference', 'concept', ['Agnete', 'Agnes'],
)

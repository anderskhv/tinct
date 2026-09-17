#!/usr/bin/env python3
"""Add Jonah to Moby-Dick's character package -- a real, substantial gap
found screening this book (29 occurrences, uncarded), culminating in
Father Mapple's entire sermon in Chapter 9. Added as a reference/concept
card, matching the treatment of Agnete in fear-and-trembling: a
discursive/scriptural figure the narrative repeatedly invokes rather than
a character who appears on the page.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity

add_entity(
    'moby-dick', 'jonah', 'Jonah', '',
    "The Biblical prophet swallowed by a whale after fleeing God's call, invoked from the very first chapters as a type for the novel's own concerns and made the subject of Father Mapple's sermon.",
    'reference', 'concept', ['Jonah'],
)

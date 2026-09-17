#!/usr/bin/env python3
"""Add Schopenhauer to the Genealogy of Morals character package. Other
philosophers Nietzsche argues with or against (Rée, Kant, Dühring) already
have cards; Schopenhauer -- discussed at length in the third essay on the
ascetic ideal -- was the one real gap found screening this book.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity

add_entity(
    'genealogy-of-morals', 'schopenhauer', 'Arthur Schopenhauer', '',
    "The philosopher of the will and of aesthetic disinterestedness, whose account of the ascetic ideal Nietzsche examines and argues against at length in the third essay.",
    'major', 'person', ['Schopenhauer'],
)

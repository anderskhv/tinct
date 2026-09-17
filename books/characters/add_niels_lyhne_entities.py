#!/usr/bin/env python3
"""Add Frithjof and Dr. Hjerrild to Niels Lyhne's character package.
Screening found both as real, substantially-mentioned uncarded characters
-- see docs/character-coverage-library-batch-2026-09-17-round3.md.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity

add_entity(
    'niels-lyhne', 'frithjof', 'Frithjof', '',
    "The local pastor's son, one of Niels's childhood playmates.",
    'supporting', 'person', ['Frithjof'],
)
add_entity(
    'niels-lyhne', 'hjerrild', 'Dr. Hjerrild', '',
    "A young doctor Niels meets at the Neergaards', known for his liberal religious views.",
    'supporting', 'person', ['Hjerrild'],
)

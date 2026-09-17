#!/usr/bin/env python3
"""Add Brita and Mother Stina to the Jerusalem character package.
Screening found both as real, substantially-mentioned uncarded characters
(84 and 70 occurrences respectively) -- see
docs/character-coverage-library-batch-2026-09-17-round3.md.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity

add_entity(
    'jerusalem', 'brita', 'Brita', '',
    "A young woman from Bergskog, a somewhat better-off farming family whose father sits in Parliament. Ingmar Ingmarsson courted her, and the two became engaged to marry.",
    'major', 'person', ['Brita'],
)
add_entity(
    'jerusalem', 'mother-stina', 'Mother Stina', '',
    "Storm the schoolmaster's wife. She keeps the schoolhouse kitchen and is known for dressing every bride in the parish.",
    'supporting', 'person', ['Stina', 'Mother Stina'],
)

"""Deterministic binding for the Second Treatise of Government package.

Every bound name in this book resolves to exactly one entity; there is no
namesake collision among the entries in editorial.json (verified against
both English editions before authoring -- see README, 'Namesakes'). So the
plain exact-alias matcher is sufficient; no reviewed-context overrides are
needed. Two entries carry an extra alias for a source-text spelling
variant rather than a namesake: 'jephthah' (Jeptha|Jephthah) and 'juvenal'
(juvenal|Juvenal) -- see README.
"""
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble, main as run

BASE = Path(__file__).resolve().parent / 'second-treatise'


def bind(edition, ch, pi, text, entities):
    return exact(edition, ch, pi, text, entities)


def compile_package():
    return assemble('second-treatise', bind)


if __name__ == '__main__':
    run('second-treatise', 'Second Treatise of Government', bind)

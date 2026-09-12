"""Book-specific reviewed Confessions aliases.

No custom bind() override is needed -- see author_content.py's module
docstring for why. reviewed_aliases.bind is used directly.
"""
from pathlib import Path
from build_reviewed import compile_package as assemble, main as run
from reviewed_aliases import bind

BASE = Path(__file__).resolve().parent / 'confessions'


def compile_package():
    return assemble('confessions', bind)


if __name__ == '__main__':
    run('confessions', 'Confessions', bind)

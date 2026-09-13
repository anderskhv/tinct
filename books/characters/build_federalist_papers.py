from pathlib import Path
from reviewed_aliases import bind
from build_reviewed import compile_package as assemble, main as run

BASE = Path(__file__).resolve().parent / 'federalist-papers'


def compile_package():
    return assemble('federalist-papers', bind)


if __name__ == '__main__':
    run('federalist-papers', "The Federalist Papers", bind)

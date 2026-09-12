from pathlib import Path
from reviewed_aliases import bind
from build_reviewed import compile_package as assemble, main as run

BASE = Path(__file__).resolve().parent / 'nicomachean-ethics'


def compile_package():
    return assemble('nicomachean-ethics', bind)


if __name__ == '__main__':
    run('nicomachean-ethics', "The Nicomachean Ethics", bind)

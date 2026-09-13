from pathlib import Path
from reviewed_aliases import bind
from build_reviewed import compile_package as assemble, main as run

BASE = Path(__file__).resolve().parent / 'democracy-in-america'

def compile_package():
    return assemble('democracy-in-america', bind)

if __name__ == '__main__':
    run('democracy-in-america', "Democracy in America", bind)

from pathlib import Path
from reviewed_aliases import bind
from build_reviewed import compile_package as assemble, main as run

BASE = Path(__file__).resolve().parent / 'wealth-of-nations'

def compile_package():
    return assemble('wealth-of-nations', bind)

if __name__ == '__main__':
    run('wealth-of-nations', "The Wealth of Nations", bind)

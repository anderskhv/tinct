"""Reviewed exact references for The Manual."""
from pathlib import Path
from build_reviewed import compile_package as assemble,main as run
from reviewed_aliases import bind
BASE=Path(__file__).resolve().parent/'the-manual'
def compile_package():return assemble('the-manual',bind)
if __name__=='__main__':run('the-manual','The Manual',bind)

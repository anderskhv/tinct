"""Exact names; movement names such as Owenites do not become personal mentions."""
from pathlib import Path
from reviewed_aliases import bind
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'communist-manifesto'
def compile_package():return assemble('communist-manifesto',bind)
if __name__=='__main__':run('communist-manifesto','The Communist Manifesto',bind)

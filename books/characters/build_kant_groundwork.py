"""Reviewed unambiguous names and the Gospel epithet."""
from pathlib import Path
from reviewed_aliases import bind
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'kant-groundwork'
def compile_package():return assemble('kant-groundwork',bind)
if __name__=='__main__':run('kant-groundwork','Groundwork of the Metaphysics of Morals',bind)

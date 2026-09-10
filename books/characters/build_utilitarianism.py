"""Exact reviewed names; philosophical-school adjectives are not personal aliases."""
from pathlib import Path
from reviewed_aliases import bind
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'utilitarianism'
def compile_package():return assemble('utilitarianism',bind)
if __name__=='__main__':run('utilitarianism','Utilitarianism',bind)

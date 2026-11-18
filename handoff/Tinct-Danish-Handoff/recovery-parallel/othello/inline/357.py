from pathlib import Path
p=Path('qa.py');p.write_text(p.read_text().replace("(11,115):('Hvad'","(11,115):('Hvilken'"))

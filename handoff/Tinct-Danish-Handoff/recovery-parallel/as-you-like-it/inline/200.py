from prep import *
lines=(p/'scene01.txt').read_text().splitlines();assert len(lines)==47;save(1,dict(enumerate(lines,1)),47)

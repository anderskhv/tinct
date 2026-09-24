import sys
from common import *
E = editions()
ed = sys.argv[1]; ch = int(sys.argv[2]); a = int(sys.argv[3]); b = int(sys.argv[4])
for i in range(a, b+1):
    t = para(ed, ch, i); print(f"[{ch}.{i} len={u16len(t)}] {t}\n")

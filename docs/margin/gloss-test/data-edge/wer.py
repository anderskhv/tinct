import pymupdf, re, difflib, sys
gt = ' '.join(pg.get_text() for pg in pymupdf.open(sys.argv[1]))
def toks(s): return re.findall(r"[A-Za-z]{3,}", s.replace('-\n','').lower())
G = toks(gt)
for f in sys.argv[2:]:
    T = toks(open(f).read())
    sm = difflib.SequenceMatcher(None, G, T, autojunk=False)
    match = sum(b.size for b in sm.get_matching_blocks())
    print(f, 'gt words', len(G), 'got', len(T), 'matched %.1f%%' % (100*match/len(G)))

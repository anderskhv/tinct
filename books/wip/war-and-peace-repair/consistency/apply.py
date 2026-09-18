#!/usr/bin/env python3
"""War and Peace modern-en consistency pass (2026-09-18): titles, quote style, name spellings by identity.
Input: current modern-en (baseline b269fb96 + accepted pilot chapters are NOT merged here; pilots merge later).
Output: consistency/modern-en-consistency-candidate.json + REPORT.md. Nothing touches the live file."""
import json, re, collections, hashlib
SRC='app/public/data/editions/war-and-peace-original-en.json'; CUR='app/public/data/editions/war-and-peace-modern-en.json'
OUT='books/wip/war-and-peace-repair/consistency/modern-en-consistency-candidate.json'
o=json.load(open(SRC))['chapters']; n=json.load(open(CUR))['chapters']
rep=collections.Counter(); changed=collections.defaultdict(set); notes=[]
# 1. titles: mirror source for every chapter
for c,m in zip(o,n):
    if m['title']!=c['title']: notes.append(f"title ch{c['number']}: {m['title']!r} -> {c['title']!r}"); m['title']=c['title']; rep['title']+=1
# 2. quote style in single-quote chapters
QCH=[283,285,286,289,292,293,295,296,302,303,305,306,307,308,309]
def convert_quotes(p):
    out=[]; open_=False; i=0; L=len(p)
    while i<L:
        ch=p[i]
        if ch=='"': out.append("'"); i+=1; continue          # inner double -> single
        if ch=="'":
            prev=p[i-1] if i>0 else ' '; nxt=p[i+1] if i+1<L else ' '
            if not open_ and (prev in ' —(\n' or i==0) and nxt not in ' ':
                out.append('"'); open_=True; i+=1; continue
            if open_ and prev not in ' ' and (nxt in ' .,;:!?—)\n' or i+1==L) and not (prev.isalpha() and nxt.isalpha()):
                # closer unless it's a possessive plural inside speech (heuristic: prev 's' and next is space and speech continues) — left to parity check
                out.append('"'); open_=False; i+=1; continue
        out.append(ch); i+=1
    return ''.join(out)
parity=[]
for c,m in zip(o,n):
    if m['number'] in QCH:
        for j,p in enumerate(m['paragraphs']):
            q=convert_quotes(p)
            if q!=p: m['paragraphs'][j]=q; rep['quote-para']+=1; changed[m['number']].add(j)
            sq=c['paragraphs'][j].count('“')+c['paragraphs'][j].count('”'); dq=q.count('"')
            if sq!=dq: parity.append((m['number'],j,sq,dq))
# 3. names by identity (surname/whole-family or unique-referent forms only)
NAMES=[(r'\bBolkonsky\b','Bolkonski'),(r'\bHélène\b','Helene'),(r'\bNesvitski\b','Nesvitsky'),(r'\bKozlovski\b','Kozlovsky'),(r'\bKamenski\b','Kamensky'),(r'\bMikhailovna\b','Mikhaylovna'),(r'\bKirill\b','Cyril'),(r'\bPrince Andrei\b','Prince Andrew'),(r'\bCampan\b','Compans')]
for m in n:
    for j,p in enumerate(m['paragraphs']):
        q=p
        for pat,rp in NAMES:
            q2,k=re.subn(pat,rp,q)
            if k: rep['name:'+rp]+=k; q=q2
        if q!=p: m['paragraphs'][j]=q; changed[m['number']].add(j)
json.dump({'chapters':n},open(OUT,'w'),ensure_ascii=False)
h=hashlib.sha256(open(OUT,'rb').read()).hexdigest()
with open('books/wip/war-and-peace-repair/consistency/REPORT.md','w') as f:
    f.write(f"# Consistency pass report\n\nOutput sha256 {h}\n\nCounts: {dict(rep)}\n\nChapters touched: {len(changed)}; paragraphs touched: {sum(len(v) for v in changed.values())}\n\n## Title changes\n"+'\n'.join('- '+x for x in notes)+f"\n\n## Quote-count parity failures (candidate \" count != source curly-quote count) — {len(parity)} paragraphs, each needs a human/Opus look\n"+'\n'.join(f"- ch{a} p{b}: source {c} vs candidate {d}" for a,b,c,d in parity)+"\n")
print('sha',h[:16],'counts',dict(rep),'parity failures',len(parity),'touched paras',sum(len(v) for v in changed.values()))

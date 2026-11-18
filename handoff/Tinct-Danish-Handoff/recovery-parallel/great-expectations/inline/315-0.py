from inspect_pairs import *
import subprocess,collections
z=books[3];words=re.findall(r"[A-Za-zÆØÅæøåÀ-ÿ]{3,}",' '.join(v for c in z for v in c['paragraphs']));u=collections.Counter(words)
r=subprocess.run(['hunspell','-d','/tmp/tinct-ge-dictionary/da_DK','-l'],input='\n'.join(sorted(u)),text=True,capture_output=True,check=True)
mistakes=set(r.stdout.splitlines()); rare=[(u[t],t) for t in mistakes if t.islower()];put(p/'review'/'spelling-review.json',sorted(rare,reverse=True));print(len(rare),sorted(rare,reverse=True)[:170]);print(sorted(t for c,t in rare if c==1)[:500])

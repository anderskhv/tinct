import pathlib,urllib.request,concurrent.futures,re,time
from bs4 import BeautifulSoup
p=pathlib.Path(__file__).parent
s=BeautifulSoup((p/'source-russian-index.html').read_bytes(),'html.parser');nums=sorted(set(int(re.search(r'/p\.(\d+)/',a['href'])[1]) for a in s.select('a[href]') if re.search(r'/p\.(\d+)/',a['href'])))
def get(n):
 f=p/f'source-russian-{n:03}.html'
 if not f.exists():f.write_bytes(urllib.request.urlopen(f'https://ilibrary.ru/text/1099/p.{n}/index.html',timeout=40).read())
 h=BeautifulSoup(f.read_bytes(),'html.parser');v=h.select_one('.chapter') or h.select_one('#text') or h
 (p/f'source-russian-{n:03}.txt').write_text(v.get_text('\n',strip=True)+'\n');return n
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as e:
 for n in e.map(get,nums):
  if n%20==0:print(n,flush=True)
print('complete',len(nums),flush=True)

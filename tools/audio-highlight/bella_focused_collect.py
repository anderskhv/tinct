import os,json,urllib.request,urllib.parse,zipfile,io,time,subprocess
from pathlib import Path
ROOT=Path("artifacts/bella-focused-acoustic-2026-09-21");ROOT.mkdir(parents=True,exist_ok=True)
class Redirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  r=super().redirect_request(req,fp,code,msg,headers,newurl)
  if r and urllib.parse.urlparse(newurl).netloc!=urllib.parse.urlparse(req.full_url).netloc:r.remove_header("Authorization")
  return r
opener=urllib.request.build_opener(Redirect())
def gh(path):
 req=urllib.request.Request("https://api.github.com/repos/anderskhv/tinct/"+path,headers={"Authorization":"Bearer "+os.environ["GH_TOKEN"],"User-Agent":"tinct-evidence"})
 return opener.open(req,timeout=90).read()
seen=set()
for iteration in range(70):
 rows=json.loads(gh("actions/runs/35609361452/artifacts"))["artifacts"]
 changed=False
 for row in rows:
  if row["id"] in seen or not row["name"].startswith("focused-"):continue
  z=zipfile.ZipFile(io.BytesIO(gh("actions/artifacts/"+str(row["id"])+"/zip")))
  for n in z.namelist():
   p=Path(n)
   assert not p.is_absolute() and ".." not in p.parts
   if p.suffix not in (".json",".txt",".log"):continue
   dest=ROOT/p;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(z.read(n))
  seen.add(row["id"]);changed=True
 if changed:
  results=[]
  for p in ROOT.rglob("result.json"):results.append(json.loads(p.read_text()))
  (ROOT/"live-summary.json").write_text(json.dumps(results,indent=1))
  subprocess.run(["git","add","-f",str(ROOT)],check=True)
  subprocess.run(["git","commit","-m","Preserve available focused chapter results [skip ci]"],check=True)
  subprocess.run(["git","push","origin","HEAD:codex/bella-focused-collected-20260921"],check=True)
  print(json.dumps(results),flush=True)
 if len(seen)>=9:break
 run=json.loads(gh("actions/runs/35609361452"))
 if run["status"]=="completed":break
 time.sleep(30)

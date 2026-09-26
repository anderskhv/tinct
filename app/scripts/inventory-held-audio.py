#!/usr/bin/env python3
"""Read-only exact-prefix R2 census. Never deletes or starts narration."""
import json,os,urllib.request,urllib.parse,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
out=ROOT/"app/artifacts/held-audio-inventory";out.mkdir(parents=True,exist_ok=True)
holds=json.loads((ROOT/"app/src/data/editionAvailability.json").read_text())["editions"]
token=os.environ.get("CLOUDFLARE_API_TOKEN","")
account=os.environ.get("CLOUDFLARE_ACCOUNT_ID") or "58f26c4a077e8c66e0b017d2399ae1b3"
base=f"https://api.cloudflare.com/client/v4/accounts/{account}/r2/buckets/tinct-audio/objects"
report={"mode":"read-only","complete":False,"prefixes":[],"readerImpact":"unknown","readerAccessConfigured":bool(os.environ.get("SUPABASE_SERVICE_ROLE_KEY"))}
try:
 if not token: raise RuntimeError("Cloudflare credential unavailable")
 for key in holds:
  for prefix in [key+"/"]+[f"narration/{provider}/map/{key}/" for provider in ["fish","google","grok"]]:
   cursor=None;seen=set();objects=[]
   while True:
    params={"prefix":prefix}
    if cursor: params["cursor"]=cursor
    req=urllib.request.Request(base+"?"+urllib.parse.urlencode(params),headers={"Authorization":"Bearer "+token})
    with urllib.request.urlopen(req,timeout=60) as response: payload=json.load(response)
    if not payload.get("success"): raise RuntimeError("R2 list rejected")
    rows=payload["result"];assert isinstance(rows,list)
    for obj in rows:
     assert obj["key"].startswith(prefix)
     objects.append({k:obj.get(k) for k in ["key","size","etag","last_modified"]})
    info=payload.get("result_info",{})
    if not info.get("is_truncated"): break
    cursor=info.get("cursor")
    if not cursor or cursor in seen: raise RuntimeError("Incomplete pagination")
    seen.add(cursor)
   report["prefixes"].append({"prefix":prefix,"objects":objects,"bytes":sum(x["size"] or 0 for x in objects)})
 report["complete"]=True
except urllib.error.HTTPError as e: report["error"]="R2 HTTP "+str(e.code)
except Exception as e: report["error"]=str(e) if isinstance(e,RuntimeError) else type(e).__name__
(out/"inventory.json").write_text(json.dumps(report,indent=2)+"\n")
print(json.dumps({k:v for k,v in report.items() if k!="prefixes"}))
for row in report["prefixes"]: print(row["prefix"],len(row["objects"]),row["bytes"])

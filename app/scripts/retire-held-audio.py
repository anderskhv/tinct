#!/usr/bin/env python3
"""Exact-inventory legacy audio retirement. Dry-run unless --apply is supplied.
No content assets, account records, or shared narration blobs are addressed.
Uses the existing Cloudflare token's documented S3 identity; creates no credentials.
"""
import argparse,base64,datetime,hashlib,hmac,json,os,time,urllib.request,urllib.parse,urllib.error,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"app/artifacts/held-audio-cleanup";OUT.mkdir(parents=True,exist_ok=True)
EXPECTED="bada011b6e9a453504a806bd81292dbae251167d1a166383b1a8f2671da435b7"
BUCKET="tinct-audio"
def digest(b):return hashlib.sha256(b).hexdigest()
def get_json(url,headers=None):
 with urllib.request.urlopen(urllib.request.Request(url,headers=headers or {}),timeout=60) as r:return json.load(r)
class S3:
 def __init__(self):
  token=os.environ["CLOUDFLARE_API_TOKEN"]
  account=os.environ.get("CLOUDFLARE_ACCOUNT_ID") or "58f26c4a077e8c66e0b017d2399ae1b3"
  identity=None
  for path in ["user/tokens/verify",f"accounts/{account}/tokens/verify"]:
   try:
    payload=get_json("https://api.cloudflare.com/client/v4/"+path,{"Authorization":"Bearer "+token})
    if payload.get("success") and payload.get("result",{}).get("status")=="active":
     identity=payload["result"]["id"];break
   except urllib.error.HTTPError:pass
  if not identity:raise RuntimeError("Cannot resolve existing token identity; no credentials changed")
  self.access=identity;self.secret=digest(token.encode());self.host=account+".r2.cloudflarestorage.com"
 def request(self,method,query,body=b""):
  now=datetime.datetime.now(datetime.timezone.utc);date=now.strftime("%Y%m%d");stamp=now.strftime("%Y%m%dT%H%M%SZ")
  params="&".join(urllib.parse.quote(str(k),safe="")+"="+urllib.parse.quote(str(v),safe="") for k,v in sorted(query.items()))
  headers={"host":self.host,"x-amz-content-sha256":digest(body),"x-amz-date":stamp}
  if method=="POST":headers["content-md5"]=base64.b64encode(hashlib.md5(body,usedforsecurity=False).digest()).decode()
  names=";".join(sorted(headers));canonical="".join(k+":"+headers[k]+"\n" for k in sorted(headers))
  scope=date+"/auto/s3/aws4_request"
  request="\n".join([method,"/"+BUCKET,params,canonical,names,digest(body)])
  signing=("AWS4"+self.secret).encode()
  for item in [date,"auto","s3","aws4_request"]:signing=hmac.new(signing,item.encode(),hashlib.sha256).digest()
  signature=hmac.new(signing,("AWS4-HMAC-SHA256\n"+stamp+"\n"+scope+"\n"+digest(request.encode())).encode(),hashlib.sha256).hexdigest()
  headers["Authorization"]="AWS4-HMAC-SHA256 Credential="+self.access+"/"+scope+", SignedHeaders="+names+", Signature="+signature
  req=urllib.request.Request("https://"+self.host+"/"+BUCKET+"?"+params,data=body if method=="POST" else None,headers=headers,method=method)
  with urllib.request.urlopen(req,timeout=60) as r:return ET.fromstring(r.read())
 def list(self,prefix):
  cursor=None;seen=set();rows=[]
  while True:
   query={"list-type":"2","prefix":prefix,"max-keys":"1000"}
   if cursor:query["continuation-token"]=cursor
   xml=self.request("GET",query)
   for obj in xml.findall("{*}Contents"):
    key=obj.findtext("{*}Key");assert key.startswith(prefix)
    rows.append({"key":key,"size":int(obj.findtext("{*}Size")),"etag":obj.findtext("{*}ETag").strip('"')})
   if xml.findtext("{*}IsTruncated")!="true":break
   cursor=xml.findtext("{*}NextContinuationToken");assert cursor and cursor not in seen
   seen.add(cursor)
  return sorted(rows,key=lambda x:x["key"])
 def delete(self,keys):
  assert 0<len(keys)<=1000
  root=ET.Element("Delete",xmlns="http://s3.amazonaws.com/doc/2006-03-01/")
  for key in keys:ET.SubElement(ET.SubElement(root,"Object"),"Key").text=key
  ET.SubElement(root,"Quiet").text="false"
  result=self.request("POST",{"delete":""},ET.tostring(root,encoding="utf-8"))
  errors=result.findall("{*}Error")
  if errors:raise RuntimeError("S3 reported object deletion errors")
  deleted=[x.findtext("{*}Key") for x in result.findall("{*}Deleted")]
  assert set(deleted)==set(keys),"Incomplete delete acknowledgement"
  return deleted
def normalized(rows):return sorted([{"key":r["key"],"size":r["size"],"etag":r["etag"].strip('"')} for r in rows],key=lambda x:x["key"])
def production_guards(holds):
 for key in holds:
  for route,suffix in [("audio-file","/ch1/p0.mp3"),("audio-manifest","/ch1/manifest.json")]:
   url="https://tinct.app/api/"+route+"?"+urllib.parse.urlencode({"path":key+suffix,"cleanup-check":str(time.time_ns())})
   try:urllib.request.urlopen(url,timeout=30);raise RuntimeError("Production audio hold missing")
   except urllib.error.HTTPError as e:
    assert e.code==503 and e.headers.get("Cache-Control")=="no-store","Production guard not deployed"
    data=json.load(e);assert data.get("error")=="Edition temporarily unavailable"
def main():
 parser=argparse.ArgumentParser();parser.add_argument("--apply",action="store_true");args=parser.parse_args()
 raw=(ROOT/"app/artifacts/held-audio-source/inventory.json").read_bytes();assert digest(raw)==EXPECTED
 inventory=json.loads(raw);assert inventory["complete"]
 holds=json.loads((ROOT/"app/src/data/editionAvailability.json").read_text())["editions"]
 prefixes=[k+"/" for k in holds];assert len(prefixes)==16
 targets=[p for p in inventory["prefixes"] if p["prefix"] in prefixes]
 objects=[o for p in targets for o in p["objects"]]
 assert len(objects)==14279 and sum(o["size"] for o in objects)==1642373839
 assert all(o["key"].endswith((".mp3",".json")) and any(o["key"].startswith(p) for p in prefixes) for o in objects)
 assert all(not p["objects"] for p in inventory["prefixes"] if p["prefix"].startswith("narration/"))
 report={"apply":args.apply,"complete":False,"inventorySha256":EXPECTED,"objects":len(objects),"bytes":sum(o["size"] for o in objects),"deleted":[],"prefixes":[]}
 def save():(OUT/"receipt.json").write_text(json.dumps(report,indent=2)+"\n")
 save();client=S3();books=sorted({key.split("/")[0] for key in holds})
 protected={}
 for book in books:
  protected[book]=[o for o in client.list(book+"/") if not any(o["key"].startswith(p) for p in prefixes)]
 # Exact identity, not just count: abort before mutation if anything changed.
 for row in targets:
  live=client.list(row["prefix"]);assert live==normalized(row["objects"]),("Inventory drift",row["prefix"])
  report["prefixes"].append({"prefix":row["prefix"],"before":len(live)})
 for key in holds:
  for provider in ["fish","google","grok"]:
   assert not client.list(f"narration/{provider}/map/{key}/"),"New narration mappings require review"
 report["protectedSiblingObjects"]=sum(map(len,protected.values()));save()
 print("Verified exact inventory and sound siblings",len(objects),report["protectedSiblingObjects"],flush=True)
 if args.apply:
  production_guards(holds)
  for row in targets:
   keys=[o["key"] for o in row["objects"]]
   # Re-check exact prefix immediately before its batch deletion.
   assert client.list(row["prefix"])==normalized(row["objects"])
   for i in range(0,len(keys),1000):
    deleted=client.delete(keys[i:i+1000]);report["deleted"].extend(deleted);save()
   assert not client.list(row["prefix"]),("Prefix not empty after deletion",row["prefix"])
   print("Deleted and verified",row["prefix"],len(keys),flush=True)
  for book,original in protected.items():assert client.list(book+"/")==original,("Sound sibling changed",book)
  production_guards(holds)
 report["complete"]=True;save()
 print(json.dumps({k:v for k,v in report.items() if k not in ["deleted","prefixes"]}),flush=True)
if __name__=="__main__":
 try:main()
 except urllib.error.HTTPError as e:
  print("Remote operation failed: HTTP",e.code,flush=True);raise SystemExit(1)

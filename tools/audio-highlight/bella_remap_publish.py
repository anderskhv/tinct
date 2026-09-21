"""Atomically activate verified audio mappings and embedded timings.
No reader changes. Existing recordings and the previous manifest are retained.
The caller must first establish acoustic and reader-data acceptance.
"""
import hashlib,json
BUCKET="tinct-audio"
def sha(body): return hashlib.sha256(body).hexdigest()
def encoded(value): return (json.dumps(value,ensure_ascii=False,indent=1)+"\n").encode()
def get(s3,key):
 r=s3.get_object(Bucket=BUCKET,Key=key)
 return r["Body"].read(),r["ETag"]
def put_immutable(s3,key,body,kind):
 try: s3.put_object(Bucket=BUCKET,Key=key,Body=body,ContentType=kind,IfNoneMatch="*")
 except Exception:
  found,_=get(s3,key)
  if found!=body: raise
def activate(s3,plan,manifest,sidecar,current_text,title_source):
 key=plan["key"];book,edition,ch=key.split("/")
 assert current_text["paragraphs"]==plan["sourceText"]["paragraphs"],"source text changed"
 assert current_text["title"]==plan["sourceText"]["title"],"source title changed"
 old,etag=get(s3,key+"/manifest.json")
 assert sha(old)==plan["oldManifestSha256"],"manifest changed"
 assert json.loads(old)==plan["oldManifest"]
 assert manifest["chapter"]==int(ch[2:]) and manifest["title"]==current_text["title"]
 assert sidecar["chapter"]==int(ch[2:])
 body_entries=[p for p in manifest["paragraphs"] if p["paragraph"]>=0]
 assert [p["paragraph"] for p in body_entries]==list(range(len(current_text["paragraphs"])))
 timings={p["paragraph"]:p for p in sidecar["paragraphs"]}
 staged=[]
 for entry,record in zip(body_entries,plan["recordings"]):
  assert entry["paragraph"]==record["paragraph"]
  assert key+"/"+entry["file"]==record["destination"]
  assert entry["words"]==timings[entry["paragraph"]]["words"]
  assert entry["file"]==timings[entry["paragraph"]]["file"]
  assert entry["words"] and all(0<=w["start"]<=w["end"]<=entry["duration"]+0.1 for w in entry["words"])
  audio,_=get(s3,record["source"])
  assert sha(audio)==record["sha256"] and len(audio)==record["bytes"],"recording changed"
  staged.append((record["destination"],audio))
 assert len(staged)==len(body_entries)==len(plan["recordings"])
 title_bytes,_=get(s3,title_source["key"])
 assert sha(title_bytes)==title_source["sha256"],"title recording changed"
 title_file="bella-sync-"+sha(title_bytes)[:16]+"-title.mp3"
 manifest=json.loads(json.dumps(manifest))
 manifest["paragraphs"].insert(0,{"paragraph":-1,"file":title_file,"duration":title_source["duration"]})
 staged.append((key+"/"+title_file,title_bytes))
 new=encoded(manifest)
 backup=key+"/manifest-before-"+sha(old)[:16]+".json"
 put_immutable(s3,backup,old,"application/json")
 for dest,audio in staged: put_immutable(s3,dest,audio,"audio/mpeg")
 # One conditional write activates audio and word timings together.
 s3.put_object(Bucket=BUCKET,Key=key+"/manifest.json",Body=new,ContentType="application/json",IfMatch=etag)
 actual,_=get(s3,key+"/manifest.json")
 assert actual==new,"manifest readback mismatch"
 put_immutable(s3,key+"/words.json",encoded(sidecar),"application/json")
 return {"key":key,"manifestSha256":sha(new),"sidecarSha256":sha(encoded(sidecar)),
         "backupKey":backup,"oldManifestSha256":sha(old),"recordingsCopied":len(staged),
         "conditionalActivation":True,"embeddedWordTimings":True,"readerChanged":False}

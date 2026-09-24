#!/usr/bin/env python3
"""Integrate the independently accepted WEB Revelation trailer removal."""
import argparse, copy, hashlib, json, re, subprocess, urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BASE="c9ff3d7bf2e9d6ebd6df47d2ffe5ab06d8202fa0"
REVIEW="30e7f8233f6da09909921ae736fc518d1c268b9a"
FOLDER="books/wip/web-revelation-22-cleanup"
BEFORE="46d206635dc79214cb29a8b27f392f3d4a5f856bdedb3441315973f542c4eeae"
AFTER="b0f491656782257e7b20f4a80add615cb363b8f324e54a4c1c457648328762aa"
REVISION="2026-09-24.1"
digest=lambda b:hashlib.sha256(b if isinstance(b,bytes) else b.encode()).hexdigest()
def fetch(ref,path):
 return urllib.request.urlopen(urllib.request.Request(f"https://raw.githubusercontent.com/anderskhv/tinct/{ref}/{path}",headers={"User-Agent":"Tinct-reviewed-release"}),timeout=45).read()
parser=argparse.ArgumentParser();parser.add_argument("--verify",action="store_true");args=parser.parse_args()
edition=ROOT/"app/public/data/editions/bible-web-en.json"
card=ROOT/"app/public/data/characters/bible.v1.json"
before=fetch(BASE,"app/public/data/editions/bible-web-en.json")
after=fetch(REVIEW,FOLDER+"/out/bible-web-en.candidate.json")
assert digest(before)==BEFORE and digest(after)==AFTER
a,b=json.loads(before),json.loads(after)
expected=copy.deepcopy(a)
paragraph=expected["chapters"][1188]["paragraphs"][4]
assert expected["chapters"][1188]["number"]==1189
assert len(paragraph.encode("utf-16-le"))//2==18247
assert paragraph[67:].startswith(" *** END OF THE PROJECT GUTENBERG EBOOK")
assert digest(paragraph[68:])=="fd4d478bccb640bb5fb13f2a8f25c204cba05aa2b6f2f337cd7abcccf992d1bc"
expected["chapters"][1188]["paragraphs"][4]=paragraph[:67]
assert expected==b
assert digest(paragraph[:67])=="7c307a62d147383da90c83e5e6e87e264fd507448cc58f28247dcb65a5134f34"
record_raw=fetch(REVIEW,FOLDER+"/out/change-record.json")
assert digest(record_raw)=="214850afdba971275b117eaec0b4f7ab459ed13646ff272f490c15fd61cacd50"
record=json.loads(record_raw)
assert len(record["verseMapping"])==21
for v in record["verseMapping"]:
 p=b["chapters"][1188]["paragraphs"][v["paragraphIndex"]]
 old=a["chapters"][1188]["paragraphs"][v["paragraphIndex"]]
 span=lambda text:text.encode("utf-16-le")[v["start"]*2:v["end"]*2].decode("utf-16-le")
 assert span(p)==span(old) and digest(span(p))==v["textSha256"]
previous=json.loads(fetch(BASE,"app/public/data/characters/bible.v1.json"))
asset=copy.deepcopy(previous);block=asset["editions"]["web-en"]
assert block["sourceSha256"]==BEFORE
assert block["paragraphHashes"]["1189"][4]==digest(paragraph)
block["sourceSha256"]=AFTER
block["paragraphHashes"]["1189"][4]=digest(paragraph[:67])
asset["contentVersion"]=REVISION
mentions=[m for m in block["mentions"] if m["chapterNumber"]==1189]
assert len(mentions)==4
for m in mentions:
 text=b["chapters"][1188]["paragraphs"][m["paragraphIndex"]]
 assert text.encode("utf-16-le")[m["startOffset"]*2:m["endOffset"]*2].decode("utf-16-le")==m["text"]
def verify_points(node):
 if isinstance(node,list):
  for value in node:verify_points(value)
 elif isinstance(node,dict):
  if node.get("chapterNumber")==1189 and node.get("paragraphIndex")==4:
   for key in ("offset","throughOffset","startOffset","endOffset"):
    if key in node:assert node[key]<=67,(key,node)
  for value in node.values():verify_points(value)
verify_points(block)
out=json.dumps(asset,ensure_ascii=False).encode()
service=ROOT/"app/src/services/characters/characterCards.ts"
service_text,count=re.subn(r"(bible:\s*\{\s*editions:\s*\['kjv-en', 'web-en'\],\s*revision:\s*)'[^']+'",lambda m:m.group(1)+repr(REVISION),service.read_text());assert count==1
receipt={"reviewRef":REVIEW,"baselineSha256":BEFORE,"acceptedSha256":AFTER,"cardSha256":digest(out),"unchangedVerseSpans":21,"unchangedChapterMentions":4}
report=ROOT/"books/wip/web-revelation-release-20260924.json"
if args.verify:
 assert edition.read_bytes()==after and card.read_bytes()==out
 assert service.read_text()==service_text and json.loads(report.read_bytes())==receipt
else:
 assert digest(edition.read_bytes()) in (BEFORE,AFTER)
 edition.write_bytes(after);card.write_bytes(out);service.write_text(service_text)
 subprocess.run(["node","scripts/split-edition-chapters.cjs","bible-web-en"],cwd=ROOT/"app",check=True)
 report.write_text(json.dumps(receipt,indent=2)+"\n")
shards=ROOT/"app/public/data/editions-chapters/bible-web-en"
manifest=json.loads((shards/"manifest.json").read_bytes())
assert len(manifest["chapters"])==1189
for entry,ch in zip(manifest["chapters"],b["chapters"],strict=True):
 assert entry["number"]==ch["number"] and entry["paragraphCount"]==len(ch["paragraphs"])
 assert json.loads((shards/entry["path"]).read_bytes())==ch
assert digest((shards/"ch1189.json").read_bytes())=="df0f57ab799913a44cfd951941e310fbdaa5142392c0ea019cb888d3475d9614"
print(json.dumps(receipt,indent=2))

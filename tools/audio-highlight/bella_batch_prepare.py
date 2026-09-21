import json,urllib.request,sys
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import prodapi
root=Path("artifacts/bella-completion-wave02-2026-09-21");root.mkdir(parents=True,exist_ok=True)
rows=json.load(urllib.request.urlopen("https://raw.githubusercontent.com/anderskhv/tinct/codex/bella-completion-ledger-20260921/artifacts/bella-completion-ledger-2026-09-21/pending.json"))
excluded={ (x["bookId"],x["edition"],x["chapter"]) for x in json.loads("[\n {\n  \"bookId\": \"merchant-of-venice\",\n  \"edition\": \"original-en\",\n  \"chapter\": 6\n },\n {\n  \"bookId\": \"winters-tale\",\n  \"edition\": \"original-en\",\n  \"chapter\": 9\n },\n {\n  \"bookId\": \"merchant-of-venice\",\n  \"edition\": \"original-en\",\n  \"chapter\": 15\n },\n {\n  \"bookId\": \"merchant-of-venice\",\n  \"edition\": \"original-en\",\n  \"chapter\": 4\n },\n {\n  \"bookId\": \"merchant-of-venice\",\n  \"edition\": \"original-en\",\n  \"chapter\": 11\n },\n {\n  \"bookId\": \"as-you-like-it\",\n  \"edition\": \"original-en\",\n  \"chapter\": 6\n },\n {\n  \"bookId\": \"war-and-peace\",\n  \"edition\": \"original-en\",\n  \"chapter\": 337\n },\n {\n  \"bookId\": \"war-and-peace\",\n  \"edition\": \"original-en\",\n  \"chapter\": 312\n },\n {\n  \"bookId\": \"war-and-peace\",\n  \"edition\": \"original-en\",\n  \"chapter\": 314\n },\n {\n  \"bookId\": \"war-and-peace\",\n  \"edition\": \"original-en\",\n  \"chapter\": 91\n },\n {\n  \"bookId\": \"war-and-peace\",\n  \"edition\": \"original-en\",\n  \"chapter\": 297\n },\n {\n  \"bookId\": \"winters-tale\",\n  \"edition\": \"original-en\",\n  \"chapter\": 4\n },\n {\n  \"bookId\": \"war-and-peace\",\n  \"edition\": \"original-en\",\n  \"chapter\": 259\n },\n {\n  \"bookId\": \"merchant-of-venice\",\n  \"edition\": \"original-en\",\n  \"chapter\": 10\n },\n {\n  \"bookId\": \"war-and-peace\",\n  \"edition\": \"original-en\",\n  \"chapter\": 316\n },\n {\n  \"bookId\": \"war-and-peace\",\n  \"edition\": \"original-en\",\n  \"chapter\": 213\n },\n {\n  \"bookId\": \"merchant-of-venice\",\n  \"edition\": \"original-en\",\n  \"chapter\": 9\n },\n {\n  \"bookId\": \"war-and-peace\",\n  \"edition\": \"original-en\",\n  \"chapter\": 283\n },\n {\n  \"bookId\": \"bible\",\n  \"edition\": \"web-en\",\n  \"chapter\": 976\n },\n {\n  \"bookId\": \"war-and-peace\",\n  \"edition\": \"original-en\",\n  \"chapter\": 281\n }\n]") }
rows=sorted([x for x in rows if x["nextAction"]=="first-current-alignment"],key=lambda x:x.get("durationSeconds",999999))
targets=[];seconds=0
for r in rows:
 if len(targets)>=60:break
 if (r["bookId"],r["edition"],r["chapter"]) in excluded:continue
 if seconds+r.get("durationSeconds",0)>8*3600:continue
 key=f'{r["bookId"]}/{r["edition"]}/ch{r["chapter"]}'
 if prodapi.audio_object_size(key+"/words.json")[0]!=404:continue
 targets.append({k:r[k] for k in ("bookId","edition","chapter")});seconds+=r.get("durationSeconds",0)
(root/"batch.json").write_text(json.dumps(targets,indent=1))
print(len(targets),"chapters",round(seconds/3600,2),"audio hours",flush=True)
if not targets:raise SystemExit("No targets")

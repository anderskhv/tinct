import io,json,unittest
from bella_remap_publish import activate,sha
class S3:
 def __init__(self): self.data={};self.writes=[];self.race=False
 def get_object(self,Bucket,Key): return {"Body":io.BytesIO(self.data[Key]),"ETag":sha(self.data[Key])}
 def put_object(self,Bucket,Key,Body,**kw):
  if kw.get("IfNoneMatch")=="*" and Key in self.data: raise RuntimeError("exists")
  if "IfMatch" in kw and (self.race or kw["IfMatch"]!=sha(self.data[Key])): raise RuntimeError("changed")
  self.data[Key]=Body;self.writes.append(Key)
class Tests(unittest.TestCase):
 def fixture(self):
  s=S3();key="book/original-en/ch1";old={"chapter":1,"paragraphs":[]};raw=json.dumps(old).encode()
  s.data={key+"/manifest.json":raw,"old/p1.mp3":b"audio","old/title.mp3":b"title"}
  words=[{"text":"hello","start":0,"end":1}]
  entry={"paragraph":0,"file":"bella-a.mp3","duration":2,"words":words}
  text={"title":"Chapter 1","paragraphs":["hello"]}
  plan={"key":key,"oldManifest":old,"oldManifestSha256":sha(raw),"sourceText":text,
   "recordings":[{"paragraph":0,"destination":key+"/bella-a.mp3","source":"old/p1.mp3","sha256":sha(b"audio"),"bytes":5}]}
  manifest={"chapter":1,"title":"Chapter 1","paragraphs":[entry]}
  sidecar={"chapter":1,"paragraphs":[entry]}
  title={"key":"old/title.mp3","sha256":sha(b"title"),"duration":1}
  return s,plan,manifest,sidecar,text,title
 def test_atomic_success_preserves_originals(self):
  a=self.fixture();r=activate(*a);s=a[0]
  self.assertEqual(s.data["old/p1.mp3"],b"audio")
  self.assertIn(r["backupKey"],s.data)
  m=json.loads(s.data[a[1]["key"]+"/manifest.json"])
  self.assertEqual(m["paragraphs"][1]["words"],a[3]["paragraphs"][0]["words"])
 def test_changed_audio_no_writes(self):
  a=self.fixture();a[0].data["old/p1.mp3"]=b"other"
  with self.assertRaises(AssertionError): activate(*a)
  self.assertEqual(a[0].writes,[])
 def test_changed_text_no_writes(self):
  a=list(self.fixture());a[4]={"title":"Chapter 1","paragraphs":["changed"]}
  with self.assertRaises(AssertionError): activate(*a)
  self.assertEqual(a[0].writes,[])
 def test_concurrent_manifest_never_overwritten(self):
  a=self.fixture();s=a[0];old=s.data[a[1]["key"]+"/manifest.json"];s.race=True
  with self.assertRaises(RuntimeError): activate(*a)
  self.assertEqual(s.data[a[1]["key"]+"/manifest.json"],old)
  self.assertNotIn(a[1]["key"]+"/words.json",s.data)
 def test_mismatched_word_file_no_writes(self):
  a=list(self.fixture());a[3]=json.loads(json.dumps(a[3]));a[3]["paragraphs"][0]["file"]="wrong.mp3"
  with self.assertRaises(AssertionError): activate(*a)
  self.assertEqual(a[0].writes,[])
if __name__=="__main__":unittest.main()

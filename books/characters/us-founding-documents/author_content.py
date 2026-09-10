"""People/religious references actually present; no inferred signatory list."""
import json
from pathlib import Path
entities=[]
def C(id,name,body,kind):
 entities.append(dict(id=id,name=name,category='reference',body=body,subtitle='',kind=kind,aliases=[],snapshots=[]))
C('george-iii','George III','The king of Great Britain against whom the Declaration directs its grievances.','person')
C('god','God','The divine creator and judge invoked in the Declaration’s argument for independence.','religious-figure')
C('jesus','Jesus Christ','The figure referred to by “our Lord” in the Constitution’s Christian dating formula.','religious-figure')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='us-founding-documents',contentVersion='2026-09-10.1',coverage='All four source sections in both English editions. These local texts omit the signatory lists; the actual individual references are George III and the religious invocations. Constitutional offices and institutions are not assigned to historical officeholders.',entities=entities),ensure_ascii=False,indent=2)+'\n')

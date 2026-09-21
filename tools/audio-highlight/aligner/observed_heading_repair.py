"""Recover a heading only when every word is observed in the recording."""
import re
import pinned_words_sidecar_lib_v4 as lib
MONTHS=set("january february march april may june july august september october november december".split())
def normalize_date(tokens,heard):
 result=list(heard);changes=[]
 for i in range(1,len(tokens)-1):
  if tokens[i-1].strip(".,").lower() not in MONTHS:continue
  day=tokens[i].strip(".,")
  if not day.isdigit() or not 1<=int(day)<=31 or not re.fullmatch(r"[12][0-9]{3}[.,]?",tokens[i+1]):continue
  for j in range(1,len(result)-1):
   h=result[j];m=re.fullmatch(r"([0-9]{1,2})(st|nd|rd|th)[.,]?",h.raw.lower())
   if not m or int(m.group(1))!=int(day):continue
   if result[j-1].raw.strip(".,").lower()!=tokens[i-1].strip(".,").lower():continue
   if result[j+1].raw.strip(".,")!=tokens[i+1].strip(".,"):continue
   result[j]=lib.HeardWord(day,h.start,h.end);changes.append({"heardIndex":j,"raw":h.raw,"comparison":day})
 return result,changes
def recover(source,heard_rows):
 tokens=lib.chapter_words_from_text(source)
 heard=[lib.HeardWord(h["raw"],h["start"],h["end"]) for h in heard_rows]
 heard,changes=normalize_date(tokens,heard)
 # v4 retains spoken headings; v7's shape-only heading rule is not used here.
 detail=lib.align_tokens_detailed(tokens,heard)
 if detail.stats.matched_words!=len(tokens) or len(detail.words)!=len(tokens):return None
 if any(w["end"]<=w["start"] for w in detail.words):return None
 return {"words":detail.words,"normalizations":changes,"matched":detail.stats.matched_words}

"""Restore stripped speaker labels only when recognition actually observed them."""
import copy,re
import pinned_words_sidecar_lib_v7 as lib
def restore_observed_prefix(words,source,acoustic,heard):
    result=copy.deepcopy(words)
    n=0
    while n<len(words) and words[n]["start"]==words[n]["end"]:n+=1
    if n<=0 or n>=len(source) or not acoustic:return result,0
    if lib.canonical_alignment_token(source[n])!=lib.canonical_alignment_token(acoustic[0]):return result,0
    prefix=" ".join(source[:n])
    if not re.fullmatch(r"[A-Z][A-Z .'’\\-]*[.:]",prefix):return result,0
    if len(heard)<n+1:return result,0
    canonical=lib.canonical_alignment_token
    if [canonical(x) for x in source[:n+1]]!=[canonical(h["raw"]) for h in heard[:n+1]]:return result,0
    if any(result[i]["start"]!=result[i]["end"] for i in range(n)):return result,0
    if any(h["start"]<0 or h["end"]<=h["start"] for h in heard[:n]):return result,0
    if any(heard[i]["end"]>heard[i+1]["start"] for i in range(n-1)):return result,0
    if heard[n-1]["end"]>result[n]["start"]:return result,0
    for i in range(n):
        result[i]=dict(result[i],start=round(heard[i]["start"],3),end=round(heard[i]["end"],3))
    return result,n

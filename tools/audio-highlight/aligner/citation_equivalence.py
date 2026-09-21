"""Conservative citation-only Roman numeral comparison experiment.
Keeps v7 frozen, source words and ASR timestamps unchanged; never weakens the gate.
"""
import re
import pinned_words_sidecar_lib_v7 as base
BOOKS=set("genesis exodus leviticus numbers deuteronomy joshua judges ruth samuel kings chronicles ezra nehemiah esther job psalm psalms proverbs ecclesiastes isaiah jeremiah lamentations ezekiel daniel hosea joel amos obadiah jonah micah nahum habakkuk zephaniah haggai zechariah malachi matthew mark luke john acts romans corinthians galatians ephesians philippians colossians thessalonians timothy titus philemon hebrews james peter jude revelation".split())
def roman(n):
    out=""
    for value,label in [(1000,"M"),(900,"CM"),(500,"D"),(400,"CD"),(100,"C"),(90,"XC"),(50,"L"),(40,"XL"),(10,"X"),(9,"IX"),(5,"V"),(4,"IV"),(1,"I")]:
        while n>=value:out+=label;n-=value
    return out
def references(tokens):
    changes={}
    for i in range(1,len(tokens)-1):
        token=tokens[i].rstrip(".,:;").upper()
        if tokens[i-1].strip(".,:;").lower() not in BOOKS:continue
        if not re.fullmatch(r"[IVXLCDM]+",token):continue
        if not re.fullmatch(r"[0-9]+[.,:;]?",tokens[i+1]):continue
        values={"I":1,"V":5,"X":10,"L":50,"C":100,"D":500,"M":1000}
        n=sum(-values[c] if j+1<len(token) and values[c]<values[token[j+1]] else values[c] for j,c in enumerate(token))
        if 1<=n<=150 and roman(n)==token:changes[i]=str(n)
    return changes
def align(expected,heard):
    before=base.align_tokens_detailed(expected,heard)
    changes=references(expected)
    if not changes:return before,{}
    numeric=list(expected)
    for i,value in changes.items():numeric[i]=value
    after=base.align_tokens_detailed(numeric,heard)
    if after.stats.matched_words<=before.stats.matched_words or not set(before.observed).issubset(after.observed):
        return before,{}
    for i in changes:after.words[i]["text"]=expected[i]
    return after,changes

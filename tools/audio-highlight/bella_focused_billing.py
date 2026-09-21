import os,json,urllib.request,time
from pathlib import Path
out=Path("artifacts/bella-focused-acceptance-2026-09-21");out.mkdir(parents=True,exist_ok=True)
key=os.environ["RUNPOD_API_KEY"]
def get(path):
 req=urllib.request.Request("https://rest.runpod.io/v1/"+path,headers={"Authorization":"Bearer "+key,"User-Agent":"tinct-billing-check/1.0"})
 return json.load(urllib.request.urlopen(req,timeout=60))
try:
 rows=get("billing/pods");today=time.strftime("%Y-%m-%d",time.gmtime())
 selected=[r for r in rows if r.get("time","").startswith(today)]
 remap=[r for r in rows if r.get("podId")=="4bo0xt6dkphk67"]
 report=dict(checkedAt=time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),newRunPodJobs=0,newRunPodSpend=0,preRemapConservativeCarry=3.00,remapPod="4bo0xt6dkphk67",remapBillingRows=remap,remapBilled=sum(r["amount"] for r in remap),accountTodayBillingRows=selected,accountTodayBilled=sum(r["amount"] for r in selected),note="Billing rows may lag; account total is not task-specific. No new paid provider work launched.")
except Exception as e:report=dict(error=type(e).__name__+": "+str(e),newRunPodJobs=0,newRunPodSpend=0,preRemapConservativeCarry=3)
(out/"billing.json").write_text(json.dumps(report,indent=1))
print(json.dumps({k:v for k,v in report.items() if not k.endswith("Rows")}))

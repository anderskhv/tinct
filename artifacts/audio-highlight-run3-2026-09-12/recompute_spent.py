import json,glob
p="/home/user/tinct/artifacts/audio-highlight-run3-2026-09-12"
tot=0.0
for f in glob.glob(p+"/pods/*/pod.json"):
    d=json.load(open(f))
    if d.get("estimatedCost"): tot+=d["estimatedCost"]
open(p+"/spent.txt","w").write(f"{tot:.4f}\n")
print(f"{tot:.4f}")

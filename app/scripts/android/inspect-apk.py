"""Inspect the cloud-built review APK; no inference or publication."""
import json, pathlib, zipfile, hashlib
apk=pathlib.Path('android/app/build/outputs/apk/debug/app-debug.apk')
out=pathlib.Path('artifacts/android');out.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(apk) as z:
    entries=sorted(z.infolist(),key=lambda i:i.file_size,reverse=True)
    groups={}
    for i in entries:
        parts=i.filename.split('/')
        key='/'.join(parts[:4]) if i.filename.startswith('assets/public/') else parts[0]
        group=groups.setdefault(key,{'uncompressedBytes':0,'compressedBytes':0,'files':0})
        group['uncompressedBytes']+=i.file_size;group['compressedBytes']+=i.compress_size;group['files']+=1
    report={'kind':'debug review baseline, not hardware-accepted release','apkBytes':apk.stat().st_size,'sha256':hashlib.sha256(apk.read_bytes()).hexdigest(),'groups':groups,'largestFiles':[{'path':i.filename,'bytes':i.file_size} for i in entries[:40]]}
(out/'size-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))

import json, os, sys, time, base64, urllib.request
H = {'Authorization': 'Bearer ' + os.environ['XAI_API_KEY'], 'Content-Type': 'application/json'}
def call(url, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None, headers=H, method='POST' if body else 'GET')
    try: return json.load(urllib.request.urlopen(req, timeout=120))
    except urllib.error.HTTPError as e: print('HTTP', e.code, e.read()[:600].decode(errors='ignore')); sys.exit(1)
def gen(name, image, prompt, duration=6, model='grok-imagine-video-1.5', resolution='720p'):
    b64 = base64.b64encode(open(image, 'rb').read()).decode()
    r = call('https://api.x.ai/v1/videos/generations', {'model': model, 'prompt': prompt, 'image': {'url': 'data:image/jpeg;base64,' + b64},
             'duration': duration, 'aspect_ratio': '16:9', 'resolution': resolution})
    print('submitted', r); rid = r.get('request_id') or r.get('id')
    open(name + '.rid', 'w').write(rid)
    while True:
        time.sleep(8); s = call(f'https://api.x.ai/v1/videos/{rid}')
        st = s.get('status'); print(st, {k: v for k, v in s.items() if k not in ('video',)} if st != 'pending' else '')
        if st and st not in ('pending', 'processing', 'queued', 'in_progress'): break
    import subprocess
    if (s.get('video') or {}).get('url'):
        subprocess.run([os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fetch.sh'), rid, name + '.mp4'])
    return s
if __name__ == '__main__':
    spec = json.load(open(sys.argv[1]))
    for x in spec: gen(**x)

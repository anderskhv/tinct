import json, os, sys, base64, urllib.request
def gen(name, prompt, n=1, model='grok-imagine-image', aspect=None, image=None):
    body = {'model': model, 'prompt': prompt, 'n': n, 'response_format': 'b64_json'}
    if aspect: body['aspect_ratio'] = aspect
    if image: body['image'] = {'url': 'data:image/jpeg;base64,' + base64.b64encode(open(image, 'rb').read()).decode(), 'type': 'image_url'}
    url = 'https://api.x.ai/v1/images/edits' if image else 'https://api.x.ai/v1/images/generations'
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Authorization': 'Bearer ' + os.environ['XAI_API_KEY'], 'Content-Type': 'application/json'})
    try:
        d = json.load(urllib.request.urlopen(req, timeout=180))
    except urllib.error.HTTPError as e:
        print(name, 'HTTP', e.code, e.read()[:400]); return []
    out = []
    for i, it in enumerate(d.get('data', [])):
        f = f'{name}_{i}.jpg'; open(f, 'wb').write(base64.b64decode(it['b64_json'])); out.append(f)
    print(name, out, {k: v for k, v in d.items() if k != 'data'}); return out
if __name__ == '__main__':
    spec = json.load(open(sys.argv[1]))
    for s in spec: gen(**s)

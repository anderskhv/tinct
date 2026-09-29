"""Copy reviewed, licensed author images into their public paths without editing bytes."""
import hashlib,json,pathlib,time,urllib.request,urllib.error
root=pathlib.Path(__file__).resolve().parents[1]
manifest=json.loads((root/'public/lab/library_2/author-images.json').read_text())
assert len(manifest['images'])==63 and len(manifest['books'])==101
for image in manifest['images']:
    url=image['assetUrl']
    assert url.startswith(('https://upload.wikimedia.org/','https://thumb.wikimedia.org/')),image['id']
    target=root/'public'/image['publicPath'].lstrip('/')
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()==image['sha256']:
        print(image['id'],'already matches');continue
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'TinctAuthorAssets/1.0 (reviewed author image integration)'}),timeout=45) as response:
                data=response.read(4*1024*1024)
            break
        except urllib.error.HTTPError as error:
            if error.code!=429 or attempt==2:raise
            time.sleep(5*(attempt+1))
    assert hashlib.sha256(data).hexdigest()==image['sha256'],image['id']+' differs from reviewed asset'
    target.write_bytes(data)
    print(image['id'],len(data),'verified')
print('All 63 assets match the reviewed hashes; all 101 books are mapped.')

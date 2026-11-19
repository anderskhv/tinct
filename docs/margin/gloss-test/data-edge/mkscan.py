import pymupdf, random, io
from PIL import Image, ImageFilter
random.seed(3)
src = pymupdf.open('../p2/gan.pdf'); out = pymupdf.open()
for pg in src:
    pix = pg.get_pixmap(dpi=200, colorspace=pymupdf.csGRAY)
    im = Image.frombytes('L', (pix.width, pix.height), pix.samples)
    im = im.rotate(random.uniform(-0.6, 0.6), resample=Image.BICUBIC, fillcolor=245, expand=False)
    im = im.filter(ImageFilter.GaussianBlur(0.5)).point(lambda v: min(255, int(v * 0.93 + 10)))
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=70)
    r = pg.rect; p = out.new_page(width=r.width, height=r.height); p.insert_image(r, stream=buf.getvalue())
out.save('gan-scan.pdf', deflate=True)
d = pymupdf.open('gan-scan.pdf'); print(d.page_count, repr(d[0].get_text()[:50]))
d[0].get_pixmap(dpi=60).save('scan-p1.png')

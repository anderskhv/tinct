# Scans, figures and long books (15 October 2026)

Report: `../edge.html`. Files tested (not stored here):
- ResNet: https://arxiv.org/pdf/1512.03385v1
- Scan: the GAN paper (arXiv 1406.2661) rasterised to an image-only PDF with `mkscan.py`
- Long book: Sutton and Barto, http://incompleteideas.net/book/RLbook2020.pdf

`wer.py` compares recognised text with the original text layer. Runners use the helpers in `../data/` (th.mjs, lib.mjs).

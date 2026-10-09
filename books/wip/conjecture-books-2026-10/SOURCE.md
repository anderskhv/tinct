# Sources and provenance

Five EPUBs supplied by Anders on 8 October 2026. They are free downloads from Conjecture Press and are used with the publisher's permission (see [rights/permission.md](rights/permission.md)). None is public domain.

The source EPUBs are **not committed**. This repository is public, and raw sources stay out of git under the book workflow. Their byte hashes pin the exact files. Codex can get the same files from Anders's upload or from Conjecture Press and check them against these hashes.

| Book id | Supplied file | Size (bytes) | SHA-256 |
|---|---|---|---|
| `the-sovereign-child` | `45eddbe8-The-Sovereign-Child.epub` | 1,556,672 | `ce88ebc1cff5384a0871e207c30620e04c8d78225c63a561f6aba5b1877ed618` |
| `lords-of-the-cosmos` | `4b5ee88e-Arjun-Khemani_Lords-of-the-Cosmos.epub` | 5,199,597 | `1f95a362a28147b253f7c747b396a8d7f8da405053989485dcbbe18401253704` |
| `bold-conjectures-volume-1` | `c874b450-Bold-Conjectures-Volume-I.epub` | 1,102,066 | `4f0e06a680ed9fa60d52b03f67f6bbfd22c0ad15742f5c67b519a704c4c6c696` |
| `bold-conjectures-volume-2` | `7239fb9a-Bold_Conjectures_Volume_II.epub` | 1,701,852 | `231e2ca29185c30616a0ecf560cf8222b9b2a65aa10ba6b5ba59ec41a0f5d09e` |
| `the-farthest-reaches` | `a31c63aa-The-Farthest-Reaches.epub` | 655,708 | `ca5b3ba147b33f14dbfd402ca8ad88ffad3bacc5de358056a6c1f618b6759be2` |

A second upload, `e94a9fc9-Bold-Conjectures-Volume-I.epub`, is byte-identical to the Volume I file above (same SHA-256). It was not used separately.

None of the files has DRM: there is no `META-INF/rights.xml` and no `encryption.xml`. The app converter would refuse a protected file.

## Identification (from each EPUB)

| Book | Title (OPF) | Creator (OPF, role) | Cover credit | Publisher | Dates | Language | ISBN(s) |
|---|---|---|---|---|---|---|---|
| The Sovereign Child | *The Sovereign Child*; description "How a Forgotten Philosophy Can Liberate Kids and Their Parents" | Aaron Stupple | "Aaron Stupple *with* Logan Chipkin" | Conjecture Institute | © 2025; OPF date 2024-12-17 (production file) | en-US | 978-1-5445-4798-5 |
| Lords of the Cosmos | *Lords of the Cosmos*; "From Stasis to Stars" | Arjun Khemani and Logan Chipkin | "Arjun Khemani *and* Logan Chipkin" | Conjecture Institute | © 2025; OPF 2025-08-26 | en-US | 978-1-5445-4954-5 |
| Bold Conjectures, Volume I | *Bold Conjectures, Volume I*; cover subtitle "Select Interviews of David Deutsch" | Logan Chipkin (OPF role `aut`; cover "Edited by Logan Chipkin") | "Edited by Logan Chipkin" | Book's last page: "Published by Conjecture Institute". OPF `dc:publisher`: Brownstone Institute. Anders's brief also names Brownstone. | © 2025; OPF 2025-12-15 | en | Digital 979-8-218-78566-6; print 979-8-218-78567-3 |
| Bold Conjectures, Volume II | *Bold Conjectures, Volume II: Essays Across Physics* | Logan Chipkin (OPF role `edt`) | "Edited by Logan Chipkin" | Conjecture Press (title page, OPF); © Conjecture Institute | © 2026; OPF 2026-08-03 | en (en-GB markup) | Digital 979-8-9946212-2-6; print 979-8-9946212-3-3 |
| The Farthest Reaches | *The Farthest Reaches*; title page subtitle "Why People Are the Most Important Entities in the Universe" | Brett Hall (`aut`) | "Brett Hall" | Conjecture Institute | © 2026; OPF 2026-03-13 | en (en-GB markup) | Digital 979-8-9946212-0-2; print 979-8-9946212-1-9 |

**Publisher discrepancy (Volume I):** the EPUB's own last page says "Published by Conjecture Institute". Its OPF metadata and Anders's brief name Brownstone Institute. The proposed metadata gives the book's own statement and records the OPF value. Anders should choose which name to display.

**Author credit (The Sovereign Child):** the OPF lists only Aaron Stupple. The cover reads "Aaron Stupple with Logan Chipkin", and the back cover of *Bold Conjectures* I calls Chipkin its "junior author". The proposed display author is "Aaron Stupple", with "with Logan Chipkin" as a credit line.

## Covers

Each cover is the EPUB's own declared cover image (`cover-image` manifest property or `<meta name="cover">`). It is extracted byte-for-byte at the full resolution in the file, with no re-encoding:

| Book | EPUB path | Pixels | SHA-256 |
|---|---|---|---|
| The Sovereign Child | `OEBPS/image/cover.jpg` | 1375 × 2125 | `31bc81df0da5b1adb7d0c510f01a95e4106c7fa7db65c73e5f198ecb61f5ea6b` |
| Lords of the Cosmos | `OEBPS/image/cover.jpg` | 1500 × 2250 | `458b70a701fcd3ec8973df1d08ce4d8357a06a9278293dc5987960a3a306f2c2` |
| Bold Conjectures I | `OEBPS/images/cover.jpg` | 600 × 900 | `ec4428018845711c27fc8eb3d91204259d6ee61882df6ce77b341baa8b2a6cfb` |
| Bold Conjectures II | `OEBPS/images/cover.jpg` | 600 × 957 | `971ba9dcf36441e513d107c7f5c0cb8f2131a1607242039f981623097164f175` |
| The Farthest Reaches | `OEBPS/images/cover.jpg` | 600 × 957 | `1c3648b0f97808a6417eecd119f79a1bc0d09ffa84bdc2bedc15c65a0c11517a` |

The Volume I EPUB also has `bcover.jpg`, the back cover (blurb, editor and publisher text, barcode). It is not used.

The covers of *Bold Conjectures* I and II and *The Farthest Reaches* are only 600 px wide in their EPUBs. That is the highest resolution in the supplied files. A sharper cover for a large hero display would have to come from the publisher.

## Edition candidates

Hashes and counts for the committed `*-original-en.json` files are in [package-summary.json](package-summary.json). [CONVERSION.md](CONVERSION.md) describes how the files were produced and verified.

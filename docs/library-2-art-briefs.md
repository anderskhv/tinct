# Library 2 art briefs

Art needed for the new library (`app/public/lab/library_2`). Frankenstein is
finished and is the reference for everything below. Claude integrates the
images (cropping, compression, wiring); the generator only has to produce them.

**Where to put generated files:** `app/public/lab/library_2/assets/incoming/`,
named exactly as listed. Do not edit code, do not overwrite existing assets.

**Generation sizes:** portrait images at 1024×1536, landscape at 1536×1024,
sketch sheets at 1536×512 (or the closest supported 3:1). Claude crops to the
final sizes, so keep the important content away from the outer 8% of each edge.

---

## 1. House style (applies to every image)

Look at these first and match them:
`assets/room-sharp.jpg`, `assets/room-wide-v2.jpg`, `assets/frankenstein.jpg`,
`assets/frankenstein-character-studies.png`.

- **Painterly realism.** Oil-painting texture, visible but fine brushwork,
  cinematic lighting. Not photographic, not cartoon, not 3D render.
- **Dark and atmospheric.** Deep shadows, one or two light sources (window
  light, candle, lamp). Mid-tones sit dark so cream text reads on top.
- **Palette.** Deep green-black shadows, warm amber highlights, one cool
  accent per scene (storm teal, sea indigo, winter blue). Nothing neon,
  nothing oversaturated.
- **No text, letters, logos, signatures or watermarks** anywhere in scenes.
- **No people in scenes.** Scenes are places. People appear only in the
  character sketches.
- **A clear surface for the book.** Every scene has a dark, slightly
  reflective table or floor across the lower 40–45% of the frame, with the
  centre left empty. The site places a book cover there; the surface should
  catch faint reflections of the light source.

## 2. Signature books

Five books join Frankenstein. Each needs **a phone scene, a wide scene and a
character sketch sheet**. Covers already exist (`assets/<book-id>.jpg`).

### Scene composition (same for all five)
- **Phone scene** (portrait, 1024×1536): the room or place fills the upper
  55%; the table/floor surface fills the lower 45%. The main light source sits
  upper-centre or upper-right. The centre of the surface is empty.
- **Wide scene** (landscape, 1536×1024): the same place, wider. The left third
  is darker and quieter (text sits there); the light source and the most
  interesting detail sit in the right half. The surface runs across the lower
  40%, empty in the centre-right.
- Phone and wide are the same place and light, not two different ideas.

### Character sketch sheets (same format for all)
Match `frankenstein-character-studies.png` exactly: **pencil and ink portrait
studies, head and shoulders, on warm cream paper (#ece5d3 to #efe8d6), evenly
spaced in a single row**, faint cross-hatching, loose lines that fade out at
the shoulders, no borders, no names, no background. Each figure is distinct
(face shape, hair, clothing of the period), faces three-quarter or profile,
suggestive rather than fully rendered. Use a 3:1 sheet even when there are
only two figures (leave the third third blank paper).

---

### 2.1 Pride and Prejudice — `pride-and-prejudice`
- **Files:** `pride-and-prejudice-scene-phone.jpg`,
  `pride-and-prejudice-scene-wide.jpg`,
  `pride-and-prejudice-character-studies.png`
- **Scene prompt:** A Regency drawing room at Pemberley in late-afternoon
  light. Tall sash windows with thin glazing bars look out over a green park
  sloping down to a lake and a stone bridge. Pale panelled walls in shadow, a
  gilt-framed landscape painting, the edge of a pianoforte and a vase of
  garden roses in the dim background. Golden low sunlight falls through the
  windows in long shafts. Foreground: a polished dark rosewood table whose
  surface reflects the window light, empty in the centre. Painterly oil
  realism, cinematic, dark vignette. Palette: soft gold, sage green, ivory,
  deep brown shadows. No people, no text.
- **Sketch sheet (3):** Elizabeth Bennet (young woman, dark curls pinned up,
  lively intelligent eyes, slight amused smile, Regency high-waisted dress
  neckline); Mr Darcy (tall, reserved, dark hair, high collar and cravat,
  looking away, proud set of the mouth); Jane Bennet (gentle, fair, soft
  features, ribbon in hair, looking down).

### 2.2 The Odyssey — `odyssey`
- **Files:** `odyssey-scene-phone.jpg`, `odyssey-scene-wide.jpg`,
  `odyssey-character-studies.png`
- **Scene prompt:** The hall of Odysseus's house on Ithaca at dusk, open to
  the sea. Rough stone columns and a timber roof in shadow, a large upright
  loom with an unfinished weaving half-lit in the background, a bronze oil
  lamp burning with a warm flame. Beyond the columns, the wine-dark sea under
  a violet-indigo sky, a single black ship with a square sail far on the
  horizon. Foreground: a heavy olive-wood table, dark and worn smooth, faint
  reflections of lamplight, empty in the centre. Painterly oil realism,
  cinematic. Palette: deep indigo, bronze, warm lamp amber, stone grey. No
  people, no text.
- **Sketch sheet (3):** Odysseus (weathered middle-aged man, short beard,
  deep-set watchful eyes, simple cloak pinned at the shoulder); Penelope
  (dignified woman, hair veiled, calm and guarded expression, looking aside);
  Telemachus (young man, barely bearded, earnest and uncertain, looking
  outward).

### 2.3 Crime and Punishment — `crime-and-punishment`
- **Files:** `crime-and-punishment-scene-phone.jpg`,
  `crime-and-punishment-scene-wide.jpg`,
  `crime-and-punishment-character-studies.png`
- **Scene prompt:** A cramped St Petersburg garret room in the 1860s on a
  summer white night. Low sloping ceiling, peeling yellowish wallpaper, a tall
  narrow window looking down onto a canal, an iron bridge and pale stucco
  buildings under a luminous grey-blue sky. A single candle stub on a saucer
  gives a small warm light. Foreground: a bare scarred wooden table, dark,
  catching the window light, empty in the centre. Oppressive, feverish mood.
  Painterly oil realism, cinematic. Palette: sickly ochre, grey-blue, candle
  amber, deep brown-black. No people, no text.
- **Sketch sheet (3):** Raskolnikov (gaunt young man, hollow cheeks, unkempt
  dark hair, worn student's coat, feverish stare downward); Sonya Marmeladov
  (very young woman, thin, pale, headscarf, timid but steady gaze); Porfiry
  Petrovich (plump middle-aged investigator, round face, short hair, faint
  knowing smile, looking sideways).

### 2.4 The Prince — `the-prince`
- **Files:** `the-prince-scene-phone.jpg`, `the-prince-scene-wide.jpg`,
  `the-prince-character-studies.png`
- **Scene prompt:** Machiavelli's study at his farm near San Casciano, 1513,
  at dusk. Thick stone walls, a deep window with open wooden shutters looking
  across Tuscan hills and cypresses to the distant dome of Florence cathedral
  under a burnt-orange sky. A brass candlestick burning, a quill and inkwell
  and a few loose manuscript pages at the edge of the light. Foreground: a
  heavy walnut desk, dark and polished, reflecting the sunset, empty in the
  centre. Painterly oil realism, cinematic. Palette: terracotta, umber,
  candle gold, dusky violet sky. No people, no text.
- **Sketch sheet (2):** Niccolò Machiavelli (lean man in his forties, short
  dark hair, thin lips with a slight ironic smile, sharp cheekbones, simple
  Florentine robe; based on the Santi di Tito portrait); Cesare Borgia
  (handsome, bearded, cold level gaze, velvet cap and doublet). Leave the
  third third blank.

### 2.5 Meditations — `meditations`
- **Files:** `meditations-scene-phone.jpg`, `meditations-scene-wide.jpg`,
  `meditations-character-studies.png`
- **Scene prompt:** Inside a Roman commander's tent on the Danube frontier on
  a winter night, around 170 AD. Heavy canvas walls lit by a single bronze
  oil lamp, a folding camp chair, a cloak thrown over it, wax tablets and a
  rolled scroll near the lamp. The tent flap is open on the right onto a
  snowy riverbank, distant campfires and a cold blue night sky. Foreground: a
  plain campaign table of dark wood, faint lamplight reflections, empty in
  the centre. Quiet, solitary, disciplined mood. Painterly oil realism,
  cinematic. Palette: charcoal, ember orange, cold blue, bronze. No people,
  no text.
- **Sketch sheet (2):** Marcus Aurelius (mature bearded man, curly hair and
  beard, heavy-lidded thoughtful eyes, Roman cloak; based on the equestrian
  statue and busts); Epictetus (older man, full beard, plain rough tunic,
  calm unflinching expression). Leave the third third blank.

---

## 3. Reading-table places (returning readers)

Four shared places that rotate by time of day. Every returning reader sees
one of these behind their current books, so they must feel **cosy, calm and
inviting** rather than dramatic, and sit together as a set.

**Composition (all four):** seated eye level, looking across a table. The
table top fills the **lower 45%** of the frame, its near edge out of frame,
its surface dark and softly reflective, **completely empty** (the site places
the books). The place itself fills the upper 55%. No people, no books on the
table, no text.

**Files and sizes:** for each place, a phone version (portrait 1024×1536) and
a wide version (landscape 1536×1024), named
`table-<place>-phone.jpg` and `table-<place>-wide.jpg`.

- **`morning` — terrace by the sea.** A stone terrace high above a calm
  Mediterranean sea in early morning. Low sun from the right, pale gold light,
  a white-washed balustrade, a lemon tree in a terracotta pot, soft haze over
  the water. Table: weathered dark teak. Palette: pale gold, sea blue, warm
  stone, cool shadows.
- **`afternoon` — rainy window seat.** A deep window seat in an old house on
  a rainy afternoon. Rain streaking large panes, soft grey-green light from a
  garden outside, a wool throw and cushions on the seat in the background, a
  cup of tea steaming at the far edge of the light. Table: dark oak. Palette:
  grey-green, warm wood, soft cream.
- **`evening` — library.** A private library in the evening. Floor-to-ceiling
  shelves of old books in warm shadow, a green-shaded banker's lamp casting a
  pool of light, a leather armchair, a fire glowing low in a fireplace to the
  side. Table: polished mahogany reflecting the lamp. Palette: deep green,
  oxblood, brass, amber.
- **`night` — desk by candlelight.** A writing desk by a tall window late at
  night. Moonlight over snowy rooftops outside, two candles burning low in
  brass holders, the glass reflecting the flames. Table: near-black walnut
  with candle reflections. Palette: midnight blue, candle gold, silver
  moonlight.

---

## 4. Not for the generator

- **Author portraits** are public-domain paintings sourced from Wikimedia
  Commons (as with Mary Shelley). Claude sources them and records them in
  `assets/ATTRIBUTION.md`. Do not generate portraits of the authors.
- **Covers** already exist for all six signature books.

## 5. Checklist before handing over

- [ ] 15 signature files (3 per book × 5) and 8 table files (2 per place × 4).
- [ ] No text, letters or signatures in any scene.
- [ ] No people in scenes or table places.
- [ ] Empty, reflective surface across the lower 40–45%, centre clear.
- [ ] Sketch sheets on cream paper, single row, no names.
- [ ] Phone and wide versions show the same place and light.

## Copy-paste prompt for Codex

> Read `docs/library-2-art-briefs.md` and follow it exactly. Generate every
> image listed in sections 2 and 3 at the sizes given there, matching the
> house style and the Frankenstein reference assets. Save each file under
> `app/public/lab/library_2/assets/incoming/` with the exact filename listed.
> Do not change any code or any existing asset. When finished, list the files
> you created.

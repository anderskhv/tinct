# The Wind in the Willows (Grahame) — proposed metadata and taxonomy

Proposal only; no registry or library metadata has been changed.

| Field | Proposal | Basis |
| --- | --- | --- |
| id | `wind-in-the-willows` | Proposed id; no live id collides (checked against origin/main editions on 2026-11-19) |
| title | The Wind in the Willows | Source title |
| author | Kenneth Grahame | Gutenberg file |
| year / ySort | `1908` / `1908` | Commonly cited first publication; not stated in the file (see SOURCE.md) |
| House | `novel` | Closest existing House |
| primary Shelf | `adventure` or the existing `childrens-classics` shelf if the integration owner uses it | To be confirmed against `LIBRARY_SHELVES`; Alice’s proposal named `childrens-classics` as a possible cross-shelf |
| form | `novel` | Twelve connected episodes with inset songs |
| era | `modern` | Existing taxonomy key; historical description: Edwardian |
| themes | `friendship`, `home`, `river`, `vanity`, `adventure` | Specific to the reading text |
| hue | `140` | Optional visual proposal: river green |
| langs | `["EN","DA"]` | Original, modern English and modern Danish supplied |
| source words | 58,290 | Whitespace count of the final original JSON |
| modern words | 59,049 | Whitespace count of the final modern JSON |
| reading units | 12 chapters, no sections | Agreed structure |

Suggested blurb: **Mole, Rat, Badger and Toad share a river, a wild wood and one very reckless motor-car.**

## Canon and lists

Proposed explicit canon/list memberships: **none (`[]`)**. No reading-list match was verified for this work.

## Age band

Written for readers about 8 and up, and read aloud to younger children; the Tinct age/level field, if one exists, is for the integration owner. This is the complete literary work in a general-reader modern rendering, not a separate children’s edition (see the note on `STRATEGY.md` “Kids editions” in HANDOFF.md).

## Edition defaults

After independent content acceptance: primary `modern-en`; Compare `original-en`. Additional selectable edition: `modern-da` (Danish), same 12 chapters and 916 paragraphs in exact correspondence with the English editions, so saved positions survive edition switches.

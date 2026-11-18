from collate import *
import urllib.parse
v=read('validation.json');ed=read('modern-da.json')['chapters'];en=read('modern-en.json')['chapters'];notes=read('guide-changes.json')
dest=D/'Krig og fred – læseeksemplar.md'
dest.write_text('# Krig og fred\n\nLev Tolstoj · Dansk læseeksemplar\n\n'+'\n\n'.join('## '+c['title']+'\n\n'+'\n\n'.join(c['paragraphs']) for c in ed)+'\n')
meta=read('source-details.json')
meta['supplementary']={'coverOnlyHTML':{'url':'https://www.gutenberg.org/files/2600/2600-h/2600-h.htm','local':'input/pg2600.html','sha256':hashlib.sha256((D/'input/pg2600.html').read_bytes()).hexdigest()},'guideQuotation':'Virginia Woolf, The Common Reader, The Russian Point of View. https://americanliterature.com/author/virginia-woolf/book/the-common-reader/the-russian-point-of-view','primers':'Tinct-cloud local project, outputs/primer-complete-2026-11-05/primers/war-and-peace.{da,en}.json; input copies pinned for replay.'}
put('source-details.json',meta)
put('chapter-progress.json',[{'chapter':i,'sourceSection':b,'chapterHeading':h,'paragraphs':len(ps),'sourceMatched':True,'sentenceComparisonAvailable':(D/f'qa/verified-pairs-{i:03}.json').exists(),'checkpoint':f'chapters/ch{i:03}.json'} for i,(b,h,ps) in enumerate(parse(),1)])
assert len(list((D/'qa').glob('verified-pairs-*.json')))==365
assert all(x['number']==i for i,x in enumerate(ed,1))
for lang,f in [('da',ed),('en',en)]:
 g=read('onboarding-'+lang+'.json')
 assert g['openingText'] in f[0]['paragraphs'][0]
files=['modern-da.json','modern-en.json','onboarding-da.json','onboarding-en.json','primer-da.json','primer-en.json','change-record.json','guide-changes.json','bookmark-map.json','validation.json',dest.name]
put('manifest.json',{'status':'Local candidate for native Danish review','coverage':v['editions'],'files':{f:hashlib.sha256((D/f).read_bytes()).hexdigest() for f in files}})
def link(f):return '['+f+']('+urllib.parse.quote(f)+')'
(D/'HANDOFF.md').write_text(f'''# War and Peace · local reviewer handoff

The Danish candidate covers fifteen books and both epilogues, 365 chapters and 11,340 numbered paragraphs. The Danish reviewer owns the final read-aloud assessment and sign-off.

**Start reading** with {link(dest.name)}. The [Danish reviewer notes](reviewer-notes.md) give scene references for checking voices, rhythm and terminology. Claude’s local content files are [modern-da.json](modern-da.json) and [modern-en.json](modern-en.json).

## Coverage and edition

- The complete Aylmer and Louise Maude translation in [Project Gutenberg 2600](https://www.gutenberg.org/ebooks/2600) is the reference. An independent parse of its full text matches Tinct’s original in all 11,340 paragraphs after folding whitespace. The cipher table in chapter 186 is now expressed as letter/value pairs so the layout also works in a single paragraph.
- Maude divides the text into 15 books and two epilogues. Some editions label the same main divisions as parts within four volumes. Maude also anglicizes names and renders a substantial amount of the French in English. The candidate follows Maude for textual coverage and retains Tinct’s Danish character names. This is a Danish edition prepared through Maude’s English.
- The retained Danish and both English inputs are pinned to Tinct revision a1ee0ffda8de113b06814e2986802f90e24eccff. [Source details and digests](source-details.json) and [chapter checkpoints](chapter-progress.json) support resumption.
- Every chapter received structural and bilingual sentence screening. Editorial rereading targeted suspected discrepancies and Danish usage. Sentence matching can miss subtle losses of tone or meaning. A complete native line reading remains with the reviewer.

## Editorial work

The candidate changes {v['editions']['da']['changedParagraphs']} Danish paragraphs, {v['editions']['da']['changedTitles']} Danish heading labels and {v['editions']['en']['changedParagraphs']} modern-English paragraphs. Substantive restorations include the dog and the artillery horse at Borodino, Andrej smelling the malurt, Nikolaj learning estate management from his serfs and the family's conversation at tea. The English repairs include Pierre’s Masonic initiation entry and missing passages of the second epilogue.

[Before-and-after records](change-record.json) give the language, location, exact wording and reason for each edit. The [validation record](validation.json) confirms replay against the pinned inputs and reconstruction of every chapter from its checkpoint. [File checksums](manifest.json) identify this candidate.

## Guides and saved places

Both onboarding guides were checked against the narrative, including the death in childbirth, Natasja’s first appearance, and the distinction between the family ending and the historical argument. The separate November 5 primers were checked as well. Files are [Danish onboarding](onboarding-da.json), [English onboarding](onboarding-en.json), [Danish primer](primer-da.json), [English primer](primer-en.json) and the [guide change list](guide-changes.json).

All four stream coordinates (old/new, Danish/English) retain 365 chapters and the same paragraph count within each chapter. **Text highlights need separate treatment.** For instance, earlier English paragraph 350.1 held part of 350.2, and the old 358.15–19 divisions displaced the end of that chapter. The [bookmark map](bookmark-map.json) records these cases and exact matching character runs in UTF-16 units. Where a rewrite removed the quoted words, review the anchor manually. Heading corrections also change displayed labels, including 28 and 337, without moving their chapter numbers.

To regenerate from the frozen inputs, run save.py, guides.py, verify.py and report.py in that order in this directory. All reader-facing files are local.
''')

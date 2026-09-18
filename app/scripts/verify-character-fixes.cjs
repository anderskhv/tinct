// Read-only verification against the real Lab reader: real production
// reader code, real character assets, mocked /api/** only (no chat/account
// calls). No app code is modified by this script.
const { chromium } = require('playwright')
const fs = require('node:fs')
const assert = require('node:assert/strict')

const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5197'
const dir = process.env.ARTIFACT_DIR || '/tmp/tinct-verify-character-fixes'
fs.mkdirSync(dir, { recursive: true })

function normalized(text) {
  return text.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')
}

// [book, edition, chapterNumber, characterId, expectedName, label]
const CASES = [
  // Bible: the exact homonym-conflation fixes from this session.
  ['bible', 'kjv-en', 931, 'herod-the-great', 'Herod', 'herod-the-great-not-antipas'],
  ['bible', 'kjv-en', 975, 'mary-mother-of-jesus', 'Mary', 'mary-mother-not-bethany'],
  ['bible', 'kjv-en', 983, 'mary-of-bethany', 'Mary', 'mary-bethany-not-mother'],
  ['bible', 'kjv-en', 1019, 'john-apostle', 'John', 'john-apostle-not-baptist'],
  ['bible', 'kjv-en', 932, 'john-the-baptist', 'John', 'john-baptist-not-apostle'],
  // Bible: a bulk TIPNR addition and the Zidkijah/Zedekiah cross-edition alias.
  ['bible', 'kjv-en', 774, 'zedekiah-son-of-maaseiah', 'Zedekiah', 'zedekiah-son-of-maaseiah'],
  // Republic: the gyges/ring-of-gyges split and a new mythological figure.
  ['the-republic', 'original-en', 2, 'gyges', 'Gyges', 'gyges-not-ring'],
  ['the-republic', 'original-en', 1, 'themistocles', 'Themistocles', 'themistocles-new'],
  // War and Peace: a major new addition.
  ['war-and-peace', 'original-en', 4, 'anna-mikhaylovna', undefined, 'anna-mikhaylovna-new'],
  // Don Quixote / Great Expectations: this session's screening fixes.
  ['don-quixote', 'original-en', undefined, 'anselmo', 'Anselmo', 'anselmo-new'],
  ['great-expectations', 'original-en', undefined, 'magwitch', undefined, 'provis-alias'],
  // 10-random-books batch: essays-montaigne, divine-comedy, ulysses fixes,
  // plus one sanity-check tap each on 3 books judged clean (no fix made).
  ['essays-montaigne', 'original-en', undefined, 'cicero', 'Cicero', 'cicero-new'],
  ['essays-montaigne', 'modern-en', undefined, 'the-body-and-experience', undefined, 'body-experience-modern-alias'],
  ['divine-comedy', 'original-en', undefined, 'saint-peter', undefined, 'saint-peter-new'],
  ['divine-comedy', 'modern-en', undefined, 'virgil', undefined, 'virgil-modern-alias'],
  ['ulysses', 'original-en', undefined, 'joe-hynes', undefined, 'joe-hynes-new'],
  ['ulysses', 'original-en', undefined, 'corny-kelleher', undefined, 'corny-kelleher-new'],
  ['frankenstein', 'original-en', undefined, 'henry-clerval', undefined, 'sanity-frankenstein'],
  ['midsummer', 'original-en', undefined, 'puck', undefined, 'sanity-midsummer'],
  ['oedipus-at-colonus', 'original-en', undefined, 'theseus', undefined, 'sanity-oedipus-colonus'],
  // round 3: crime-and-punishment patronymic-spelling fix + 6 more books
  ['crime-and-punishment', 'original-en', undefined, 'raskolnikov', undefined, 'raskolnikov-patronymic'],
  ['crime-and-punishment', 'original-en', undefined, 'luzhin', undefined, 'luzhin-patronymic'],
  ['anna-karenina', 'original-en', undefined, 'varenka', undefined, 'varenka-new'],
  ['iliad', 'original-en', undefined, 'meriones', undefined, 'meriones-new'],
  ['iliad', 'modern-en', undefined, 'odysseus', undefined, 'iliad-modern-alias-sanity'],
  ['the-histories', 'modern-en', undefined, 'amasis', undefined, 'amasis-new'],
  ['odyssey', 'original-en', undefined, 'aegisthus', undefined, 'aegisthus-new'],
  ['odyssey', 'original-en', undefined, 'mentor', undefined, 'mentor-new'],
  ['the-aeneid', 'original-en', undefined, 'mezentius', undefined, 'mezentius-new'],
  ['confessions', 'original-en', undefined, 'moses', undefined, 'confessions-moses-new'],
  ['brothers-karamazov', 'original-en', undefined, 'nikolay-parfenovitch', undefined, 'nikolay-parfenovitch-new'],
  ['brothers-karamazov', 'original-en', undefined, 'pyotr-ilyitch', undefined, 'pyotr-ilyitch-new'],
  // round 4: Shakespeare ALL-CAPS speaker-label occurrence-linking gap
  // (as-you-like-it, taming-of-the-shrew, the-tempest 96-100% unbound;
  // merry-wives-of-windsor 40% unbound on the short-form "PAGE" label).
  ['as-you-like-it', 'original-en', 1, 'rosalind', undefined, 'speaker-label-rosalind'],
  ['as-you-like-it', 'original-en', 1, 'orlando', undefined, 'speaker-label-orlando'],
  ['taming-of-the-shrew', 'original-en', 2, 'petruchio', undefined, 'speaker-label-petruchio'],
  ['taming-of-the-shrew', 'original-en', 1, 'katherina', undefined, 'speaker-label-katherina'],
  ['the-tempest', 'original-en', 2, 'prospero', undefined, 'speaker-label-prospero'],
  ['the-tempest', 'original-en', 2, 'ariel', undefined, 'speaker-label-ariel'],
  ['merry-wives-of-windsor', 'original-en', 1, 'page', 'Page', 'mww-short-form-page'],
  ['merry-wives-of-windsor', 'original-en', undefined, 'falstaff', undefined, 'mww-sanity-falstaff'],
  // round 3 continued: 5 more books screened, real gaps fixed
  ['jerusalem', 'original-en', undefined, 'brita', undefined, 'brita-new'],
  ['jerusalem', 'original-en', undefined, 'mother-stina', undefined, 'mother-stina-new'],
  ['fear-and-trembling', 'original-en', undefined, 'agnete', undefined, 'agnete-new'],
  ['niels-lyhne', 'original-en', undefined, 'frithjof', undefined, 'frithjof-new'],
  ['niels-lyhne', 'original-en', undefined, 'hjerrild', undefined, 'hjerrild-new'],
  ['genealogy-of-morals', 'original-en', undefined, 'schopenhauer', undefined, 'schopenhauer-new'],
  ['moby-dick', 'original-en', undefined, 'jonah', undefined, 'jonah-new'],
  // war-and-peace pilot of the full clickable-names pass: alias fixes plus
  // a sample of the ~84 newly added minor/reference figures.
  ['war-and-peace', 'original-en', undefined, 'napoleon', 'Napoleon', 'napoleon-buonaparte-alias'],
  ['war-and-peace', 'original-en', undefined, 'pierre', 'Pierre', 'pierre-kirilovich-alias'],
  ['war-and-peace', 'original-en', undefined, 'helene', 'Hélène', 'helene-bezukhova-alias'],
  ['war-and-peace', 'original-en', undefined, 'bennigsen', undefined, 'wp-bennigsen-new'],
  ['war-and-peace', 'original-en', undefined, 'ramballe', undefined, 'wp-ramballe-new'],
  ['war-and-peace', 'original-en', undefined, 'julie-karagina', undefined, 'wp-julie-karagina-new'],
  ['war-and-peace', 'original-en', undefined, 'volkonski', undefined, 'wp-volkonski-new'],
  ['war-and-peace', 'original-en', undefined, 'alexander-tsar', undefined, 'wp-alexander-tsar-new'],
  ['war-and-peace', 'original-en', undefined, 'dorokhov', undefined, 'wp-dorokhov-new'],
  ['war-and-peace', 'original-en', undefined, 'makar-alexeevich', undefined, 'wp-makar-alexeevich-new'],
  ['war-and-peace', 'original-en', undefined, 'mortier', undefined, 'wp-mortier-new'],
  ['war-and-peace', 'original-en', undefined, 'count-rostov', 'Count Rostóv', 'wp-ilya-alias'],
  ['war-and-peace', 'original-en', undefined, 'natasha', 'Natásha', 'wp-natalie-alias'],
  ['war-and-peace', 'original-en', undefined, 'princess-mary', undefined, 'wp-marie-alias'],
  ['war-and-peace', 'original-en', undefined, 'tit-the-cook', undefined, 'wp-tit-new'],
  ['war-and-peace', 'original-en', undefined, 'simon-chekmar', undefined, 'wp-simon-chekmar-new'],
  ['war-and-peace', 'original-en', undefined, 'louis-xvi', undefined, 'wp-louis-xvi-new'],
  // war-and-peace modern-en gap closed: same characters, that edition's spelling
  ['war-and-peace', 'modern-en', undefined, 'volkonski', undefined, 'wp-modern-volkonski'],
  ['war-and-peace', 'modern-en', undefined, 'raevski', undefined, 'wp-modern-raevski'],
  ['war-and-peace', 'modern-en', undefined, 'narishkin', undefined, 'wp-modern-narishkin'],
  ['war-and-peace', 'modern-en', undefined, 'theodore-ivanych', undefined, 'wp-modern-theodore-ivanych'],
  ['war-and-peace', 'modern-en', undefined, 'dorokhov', undefined, 'wp-modern-dorokhov'],
  ['war-and-peace', 'modern-en', undefined, 'rostopchin', undefined, 'wp-modern-rostopchin'],
  // the-histories: new characters plus homonym-disambiguation checks
  // (Herodotus reuses names across unrelated figures).
  ['the-histories', 'original-en', undefined, 'aristagoras-milesian', 'Aristagoras', 'hist-aristagoras-milesian'],
  ['the-histories', 'original-en', undefined, 'aristodemos-ancestor', 'Aristodemos', 'hist-aristodemos-ancestor'],
  ['the-histories', 'original-en', undefined, 'aristodemos-thermopylae', 'Aristodemos', 'hist-aristodemos-thermopylae'],
  ['the-histories', 'original-en', undefined, 'lycurgos-athenian', 'Lycurgos', 'hist-lycurgos-athenian'],
  ['the-histories', 'original-en', undefined, 'lycurgos-spartan', 'Lycurgos', 'hist-lycurgos-spartan'],
  ['the-histories', 'original-en', undefined, 'hegesistratos-sigeion', 'Hegesistratos', 'hist-hegesistratos-sigeion'],
  ['the-histories', 'original-en', undefined, 'hegesistratos-diviner', 'Hegesistratos', 'hist-hegesistratos-diviner'],
  ['the-histories', 'original-en', undefined, 'tomyris', undefined, 'hist-tomyris-new'],
  ['the-histories', 'original-en', undefined, 'zopyros', undefined, 'hist-zopyros-new'],
  ['the-histories', 'original-en', undefined, 'masistes', undefined, 'hist-masistes-new'],
  ['the-histories', 'original-en', undefined, 'megistias', undefined, 'hist-megistias-new'],
  // divine-comedy: new characters plus the Francis/Brutus disambiguation
  ['divine-comedy', 'original-en', undefined, 'virgil', undefined, 'dc-mantuan-alias'],
  ['divine-comedy', 'original-en', undefined, 'francis-of-accorso', 'Francis of Accorso', 'dc-francis-of-accorso'],
  ['divine-comedy', 'original-en', undefined, 'saint-francis', 'Saint Francis', 'dc-saint-francis'],
  ['divine-comedy', 'original-en', undefined, 'brutus-lucius', 'Brutus', 'dc-brutus-lucius'],
  ['divine-comedy', 'original-en', undefined, 'brutus-marcus', 'Brutus', 'dc-brutus-marcus'],
  ['divine-comedy', 'original-en', undefined, 'christ', undefined, 'dc-christ-new'],
  ['divine-comedy', 'original-en', undefined, 'buonconte', undefined, 'dc-buonconte-new'],
  ['divine-comedy', 'original-en', undefined, 'marco-lombardo', undefined, 'dc-marco-lombardo-new'],
  ['divine-comedy', 'original-en', undefined, 'branca-doria', undefined, 'dc-branca-doria-new'],
  // moby-dick: new characters plus the Gabriel homonym split and Yarman alias
  ['moby-dick', 'original-en', undefined, 'gabriel-prophet', 'Gabriel', 'md-gabriel-prophet'],
  ['moby-dick', 'original-en', undefined, 'derick-de-deer', 'Derick De Deer', 'md-yarman-alias'],
  ['moby-dick', 'original-en', undefined, 'hosea-hussey', undefined, 'md-hosea-hussey-new'],
  ['moby-dick', 'original-en', undefined, 'peter-coffin', undefined, 'md-peter-coffin-new'],
  ['moby-dick', 'original-en', undefined, 'radney', undefined, 'md-radney-new'],
  ['moby-dick', 'original-en', undefined, 'captain-gardiner', undefined, 'md-captain-gardiner-new'],
  ['moby-dick', 'original-en', undefined, 'dr-bunger', undefined, 'md-dr-bunger-new'],
  // don-quixote: new characters, the Pedro/Corchuelo/Clara/Sancha splits,
  // aliases folded onto existing cards, and one modern-en spelling rebind.
  ['don-quixote', 'original-en', undefined, 'master-pedro', 'Master Pedro', 'dq-master-pedro'],
  ['don-quixote', 'original-en', undefined, 'pedro-goatherd', 'Pedro', 'dq-pedro-goatherd'],
  ['don-quixote', 'original-en', undefined, 'corchuelo-bachelor', 'Corchuelo', 'dq-corchuelo-bachelor'],
  ['don-quixote', 'original-en', undefined, 'lorenzo-corchuelo', 'Lorenzo Corchuelo', 'dq-lorenzo-corchuelo'],
  ['don-quixote', 'original-en', undefined, 'dona-clara', undefined, 'dq-dona-clara'],
  ['don-quixote', 'original-en', undefined, 'sanchica', undefined, 'dq-sanchica'],
  ['don-quixote', 'original-en', undefined, 'cide-hamete-benengeli', undefined, 'dq-cide-hamete'],
  ['don-quixote', 'original-en', undefined, 'amadis-of-gaul', undefined, 'dq-amadis'],
  ['don-quixote', 'original-en', undefined, 'dulcinea', 'Dulcinea', 'dq-aldonza-alias'],
  ['don-quixote', 'original-en', undefined, 'teresa-panza', 'Teresa Panza', 'dq-mari-gutierrez-alias'],
  ['don-quixote', 'original-en', undefined, 'zoraida', undefined, 'dq-zoraida'],
  ['don-quixote', 'original-en', undefined, 'ricote', undefined, 'dq-ricote'],
  ['don-quixote', 'modern-en', undefined, 'dapple', undefined, 'dq-modern-dapple'],
  ['divine-comedy', 'modern-en', undefined, 'branca-doria', undefined, 'dc-modern-doria-rebind'],
  // the-aeneid: names spaCy missed entirely, epithet aliases, Saturnia -> Juno
  ['the-aeneid', 'original-en', undefined, 'achates', undefined, 'ae-achates'],
  ['the-aeneid', 'original-en', undefined, 'neptune', undefined, 'ae-neptune'],
  // chapter 2: the first mention is "Phoebus’ influence", a curly-apostrophe
  // possessive the reader's trim rules don't strip (known app-side gap).
  ['the-aeneid', 'original-en', 2, 'apollo', 'Apollo', 'ae-apollo-phoebus'],
  ['the-aeneid', 'original-en', undefined, 'hercules', 'Hercules', 'ae-hercules-alcides'],
  ['the-aeneid', 'original-en', undefined, 'juno', 'Juno', 'ae-saturnia-alias'],
  ['the-aeneid', 'original-en', undefined, 'anna', undefined, 'ae-anna'],
  ['the-aeneid', 'original-en', undefined, 'euryalus', undefined, 'ae-euryalus'],
  ['the-aeneid', 'original-en', undefined, 'fame', undefined, 'ae-fame'],
  ['the-aeneid', 'modern-en', undefined, 'acestes', undefined, 'ae-modern-acestes-reanchored'],
  // paradise-lost: angels spaCy missed, the fallen-gods catalogue, Satan aliases, personified Night
  ['paradise-lost', 'original-en', undefined, 'uriel', undefined, 'pl-uriel'],
  ['paradise-lost', 'original-en', undefined, 'mulciber', undefined, 'pl-mulciber'],
  ['paradise-lost', 'original-en', undefined, 'astoreth', 'Astoreth', 'pl-astoreth-reanchored'],
  ['paradise-lost', 'original-en', undefined, 'chaos', undefined, 'pl-chaos'],
  ['paradise-lost', 'original-en', undefined, 'night', 'Night', 'pl-night-personified'],
  ['paradise-lost', 'original-en', undefined, 'satan', 'Satan', 'pl-tempter-alias'],
  ['paradise-lost', 'original-en', undefined, 'the-serpent', undefined, 'pl-serpent'],
  ['paradise-lost', 'original-en', undefined, 'the-son', undefined, 'pl-jesus-alias'],
  // anna-karenina: aliases onto existing cards, homonym splits, the brother mis-binding fix
  ['anna-karenina', 'original-en', undefined, 'levin', 'Levin', 'ak-kostya-alias'],
  ['anna-karenina', 'original-en', undefined, 'kitty', 'Kitty', 'ak-katya-alias'],
  ['anna-karenina', 'original-en', undefined, 'alexander-vronsky', undefined, 'ak-alexander-vronsky'],
  ['anna-karenina', 'original-en', undefined, 'prince-shtcherbatsky', undefined, 'ak-prince-shtcherbatsky'],
  ['anna-karenina', 'original-en', undefined, 'young-shtcherbatsky', undefined, 'ak-young-shtcherbatsky'],
  ['anna-karenina', 'original-en', undefined, 'pyotr-footman', 'Pyotr', 'ak-pyotr-footman'],
  ['anna-karenina', 'original-en', undefined, 'princess-varvara', undefined, 'ak-princess-varvara'],
  ['anna-karenina', 'original-en', undefined, 'laska', undefined, 'ak-laska'],
  ['anna-karenina', 'original-en', undefined, 'golenishtchev', undefined, 'ak-golenishtchev'],
  // peloponnesian-war: the author's own card, homonym splits, minor commanders
  ['peloponnesian-war', 'original-en', undefined, 'thucydides', undefined, 'pw-thucydides'],
  ['peloponnesian-war', 'original-en', undefined, 'hippias-tyrant', 'Hippias', 'pw-hippias-tyrant'],
  ['peloponnesian-war', 'original-en', undefined, 'hippias-arcadian', 'Hippias', 'pw-hippias-arcadian'],
  ['peloponnesian-war', 'original-en', undefined, 'hippocrates-of-gela', 'Hippocrates', 'pw-hippocrates-gela'],
  ['peloponnesian-war', 'original-en', undefined, 'aristeus', undefined, 'pw-aristeus'],
  ['peloponnesian-war', 'original-en', undefined, 'leon-athenian', 'Leon', 'pw-leon-athenian'],
  ['peloponnesian-war', 'original-en', undefined, 'epitadas', undefined, 'pw-epitadas'],
  ['peloponnesian-war', 'original-en', undefined, 'agis', undefined, 'pw-agis'],
  // Iliad — clickable-name pass (batch 3)
  ['iliad', 'original-en', undefined, 'peleus', undefined, 'il-peleus'],
  ['iliad', 'original-en', undefined, 'tydeus', undefined, 'il-tydeus'],
  ['iliad', 'original-en', undefined, 'antilochus', undefined, 'il-antilochus'],
  ['iliad', 'original-en', undefined, 'iris', undefined, 'il-iris'],
  ['iliad', 'original-en', 16, 'xanthus-horse', 'Xanthus', 'il-xanthus-horse'],
  ['iliad', 'original-en', 21, 'scamander', 'Scamander', 'il-scamander-river'],
  ['iliad', 'original-en', 21, 'lycaon', undefined, 'il-lycaon-priamson'],
  ['iliad', 'original-en', 14, 'sleep', undefined, 'il-sleep-personified'],
  ['iliad', 'original-en', undefined, 'cronos', 'Saturn', 'il-cronos-saturn-alias'],
  ['iliad', 'original-en', undefined, 'heracles', 'Hercules', 'il-heracles-hercules-alias'],
  ['iliad', 'original-en', undefined, 'artemis', 'Diana', 'il-artemis-diana-alias'],
  ['iliad', 'original-en', undefined, 'helenus', undefined, 'il-helenus'],
  ['iliad', 'original-en', undefined, 'thoas', undefined, 'il-thoas'],
  ['iliad', 'original-en', undefined, 'medon', undefined, 'il-medon'],
  ['iliad', 'original-en', 11, 'antiphus', undefined, 'il-antiphus-priamson'],
  ['iliad', 'original-en', undefined, 'bellerophon', undefined, 'il-bellerophon-reanchored'],
  ['iliad', 'original-en', undefined, 'dione', undefined, 'il-dione-reanchored'],
  ['iliad', 'modern-en', undefined, 'peleus', undefined, 'il-modern-peleus'],
  ['iliad', 'modern-en', undefined, 'artemis', undefined, 'il-modern-artemis'],
  ['iliad', 'modern-en', 21, 'scamander', 'Scamander', 'il-modern-scamander'],
  // Faust Part 1 — clickable-names pass (batch 4)
  ['faust-part-1', 'original-en', undefined, 'manager', undefined, 'fa-manager'],
  ['faust-part-1', 'original-en', undefined, 'theatre-poet', undefined, 'fa-theatre-poet'],
  ['faust-part-1', 'original-en', undefined, 'merryman', undefined, 'fa-merryman'],
  ['faust-part-1', 'original-en', undefined, 'earth-spirit', undefined, 'fa-earth-spirit'],
  ['faust-part-1', 'original-en', 3, 'the-lord', undefined, 'fa-lord-alias-prologue'],
  ['faust-part-1', 'original-en', undefined, 'old-peasant', undefined, 'fa-old-peasant'],
  ['faust-part-1', 'original-en', 8, 'frosch', undefined, 'fa-speaker-label-frosch'],
  ['faust-part-1', 'original-en', undefined, 'hans-of-rippach', undefined, 'fa-hans-of-rippach'],
  ['faust-part-1', 'original-en', undefined, 'satan', undefined, 'fa-satan'],
  ['faust-part-1', 'original-en', undefined, 'bessy', undefined, 'fa-bessy'],
  ['faust-part-1', 'original-en', undefined, 'barbara', undefined, 'fa-barbara'],
  ['faust-part-1', 'original-en', undefined, 'evil-spirit', undefined, 'fa-evil-spirit'],
  ['faust-part-1', 'original-en', undefined, 'will-o-the-wisp', undefined, 'fa-will-o-the-wisp'],
  ['faust-part-1', 'original-en', undefined, 'lilith', undefined, 'fa-lilith'],
  ['faust-part-1', 'original-en', undefined, 'procktophantasmist', undefined, 'fa-procktophantasmist'],
  ['faust-part-1', 'original-en', undefined, 'oberon', undefined, 'fa-oberon'],
  ['faust-part-1', 'original-en', undefined, 'puck', undefined, 'fa-puck'],
  ['faust-part-1', 'original-en', undefined, 'xenien', undefined, 'fa-xenien'],
  ['faust-part-1', 'original-en', undefined, 'the-crane', undefined, 'fa-the-crane'],
  ['faust-part-1', 'original-en', undefined, 'sceptic', undefined, 'fa-sceptic'],
  ['faust-part-1', 'modern-en', undefined, 'manager', undefined, 'fa-modern-manager'],
  ['faust-part-1', 'modern-en', undefined, 'will-o-the-wisp', undefined, 'fa-modern-will-o-the-wisp'],
  ['faust-part-1', 'modern-en', undefined, 'procktophantasmist', undefined, 'fa-modern-procktophantasmist'],
  ['faust-part-1', 'modern-en', undefined, 'sceptic', undefined, 'fa-modern-sceptic'],
  // Brothers Karamazov — clickable-names pass (batch 4)
  ['brothers-karamazov', 'original-en', 1, 'ivan', 'Ivan', 'bk-ivan-bare-alias'],
  ['brothers-karamazov', 'original-en', 1, 'dmitri', undefined, 'bk-dmitri-bare-alias'],
  ['brothers-karamazov', 'original-en', 12, 'katerina', undefined, 'bk-katerina-ch12'],
  ['brothers-karamazov', 'original-en', 27, 'kolya', undefined, 'bk-kolya-krassotkin-first'],
  ['brothers-karamazov', 'original-en', undefined, 'marfa', undefined, 'bk-marfa'],
  ['brothers-karamazov', 'original-en', undefined, 'miusov', undefined, 'bk-miusov'],
  ['brothers-karamazov', 'original-en', undefined, 'maximov', undefined, 'bk-maximov'],
  ['brothers-karamazov', 'original-en', undefined, 'father-paissy', undefined, 'bk-father-paissy'],
  ['brothers-karamazov', 'original-en', undefined, 'fenya', undefined, 'bk-fenya'],
  ['brothers-karamazov', 'original-en', undefined, 'christ', undefined, 'bk-christ'],
  ['brothers-karamazov', 'original-en', 36, 'christ', undefined, 'bk-christ-prisoner-alias'],
  ['brothers-karamazov', 'original-en', undefined, 'grand-inquisitor', undefined, 'bk-grand-inquisitor'],
  ['brothers-karamazov', 'original-en', undefined, 'claude-bernard', undefined, 'bk-claude-bernard'],
  ['brothers-karamazov', 'original-en', undefined, 'agafya-ivanovna', undefined, 'bk-agafya-ivanovna'],
  ['brothers-karamazov', 'original-en', undefined, 'agafya-servant', undefined, 'bk-agafya-servant'],
  ['brothers-karamazov', 'original-en', undefined, 'lizaveta-smerdyastchaya', undefined, 'bk-lizaveta-smerdyastchaya'],
  ['brothers-karamazov', 'original-en', undefined, 'lizaveta-child', undefined, 'bk-lizaveta-child'],
  ['brothers-karamazov', 'original-en', undefined, 'misha-boy', undefined, 'bk-misha-boy'],
  ['brothers-karamazov', 'original-en', 12, 'rakitin', undefined, 'bk-rakitin-ch12'],
  ['brothers-karamazov', 'original-en', undefined, 'perezvon', undefined, 'bk-perezvon'],
  ['brothers-karamazov', 'original-en', undefined, 'madame-krassotkin', undefined, 'bk-madame-krassotkin'],
  ['brothers-karamazov', 'original-en', undefined, 'president', undefined, 'bk-president'],
  ['brothers-karamazov', 'original-en', undefined, 'job', undefined, 'bk-job-patriarch'],
  ['brothers-karamazov', 'original-en', undefined, 'job-monk', undefined, 'bk-job-monk'],
  ['brothers-karamazov', 'original-en', undefined, 'karl-moor', undefined, 'bk-karl-moor'],
  ['brothers-karamazov', 'original-en', undefined, 'samsonov', undefined, 'bk-samsonov'],
  ['brothers-karamazov', 'original-en', undefined, 'trifon-borissovitch', undefined, 'bk-trifon-borissovitch'],
  ['brothers-karamazov', 'original-en', undefined, 'trifon-nikititch', undefined, 'bk-trifon-nikititch'],
  ['brothers-karamazov', 'original-en', undefined, 'andrey', undefined, 'bk-andrey'],
  ['brothers-karamazov', 'original-en', undefined, 'richard', undefined, 'bk-richard'],
  ['brothers-karamazov', 'original-en', undefined, 'varvara-snegiryov', undefined, 'bk-varvara-snegiryov'],
  ['brothers-karamazov', 'original-en', undefined, 'yefim-petrovitch', undefined, 'bk-yefim-petrovitch'],
  ['brothers-karamazov', 'original-en', undefined, 'mihail-visitor', undefined, 'bk-mihail-visitor'],
  ['brothers-karamazov', 'original-en', undefined, 'tchizhov', undefined, 'bk-tchizhov'],
  ['brothers-karamazov', 'modern-en', 1, 'ivan', 'Ivan', 'bk-modern-ivan-bare-alias'],
  ['brothers-karamazov', 'modern-en', undefined, 'aesop', undefined, 'bk-modern-aesop'],
  ['brothers-karamazov', 'modern-en', undefined, 'perezvon', undefined, 'bk-modern-perezvon'],
  ['brothers-karamazov', 'modern-en', undefined, 'marya-kondratyevna', undefined, 'bk-modern-marya-kondratyevna'],
  // Great Expectations — clickable-names pass (batch 4)
  ['great-expectations', 'original-en', 1, 'pip', 'Pip', 'ge-pip-philip-alias'],
  ['great-expectations', 'original-en', 22, 'pip', 'Pip', 'ge-pip-handel-alias-ch22'],
  ['great-expectations', 'original-en', undefined, 'philip-pirrip-senior', undefined, 'ge-philip-pirrip-senior'],
  ['great-expectations', 'original-en', 1, 'georgiana-pirrip', undefined, 'ge-georgiana-pirrip'],
  ['great-expectations', 'original-en', 11, 'georgiana-pocket', undefined, 'ge-georgiana-pocket'],
  ['great-expectations', 'original-en', undefined, 'pips-brothers', undefined, 'ge-pips-brothers'],
  ['great-expectations', 'original-en', 7, 'joe', 'Joe', 'ge-joe-joseph-region'],
  ['great-expectations', 'original-en', undefined, 'mrs-hubble', undefined, 'ge-mrs-hubble'],
  ['great-expectations', 'original-en', undefined, 'mr-hubble', undefined, 'ge-mr-hubble'],
  ['great-expectations', 'original-en', undefined, 'wopsles-great-aunt', undefined, 'ge-wopsles-great-aunt'],
  ['great-expectations', 'original-en', undefined, 'trabbs-boy', undefined, 'ge-trabbs-boy'],
  ['great-expectations', 'original-en', undefined, 'trabb', undefined, 'ge-trabb'],
  ['great-expectations', 'original-en', undefined, 'miss-skiffins', undefined, 'ge-miss-skiffins'],
  ['great-expectations', 'original-en', undefined, 'skiffins-brother', undefined, 'ge-skiffins-brother'],
  ['great-expectations', 'original-en', undefined, 'camilla', undefined, 'ge-camilla'],
  ['great-expectations', 'original-en', undefined, 'mr-camilla', undefined, 'ge-mr-camilla'],
  ['great-expectations', 'original-en', undefined, 'raymond', undefined, 'ge-raymond'],
  ['great-expectations', 'original-en', undefined, 'sarah-pocket', undefined, 'ge-sarah-pocket'],
  ['great-expectations', 'original-en', undefined, 'mrs-pocket', undefined, 'ge-mrs-pocket'],
  ['great-expectations', 'original-en', undefined, 'flopson', undefined, 'ge-flopson'],
  ['great-expectations', 'original-en', undefined, 'jane-pocket', undefined, 'ge-jane-pocket'],
  ['great-expectations', 'original-en', undefined, 'clara', undefined, 'ge-clara'],
  ['great-expectations', 'original-en', undefined, 'bill-barley', undefined, 'ge-bill-barley-gruffandgrim'],
  ['great-expectations', 'original-en', undefined, 'pepper', undefined, 'ge-pepper-avenger'],
  ['great-expectations', 'original-en', undefined, 'mr-wemmicks-father', undefined, 'ge-aged-alias'],
  ['great-expectations', 'original-en', 37, 'wemmick', undefined, 'ge-wemmick-ch37'],
  ['great-expectations', 'original-en', 31, 'mr-wopsle', undefined, 'ge-wopsle-waldengarver-ch31'],
  ['great-expectations', 'original-en', 46, 'magwitch', undefined, 'ge-magwitch-ch46'],
  ['great-expectations', 'original-en', undefined, 'molly', undefined, 'ge-molly'],
  ['great-expectations', 'original-en', undefined, 'mike', undefined, 'ge-mike'],
  ['great-expectations', 'original-en', undefined, 'arthur-havisham', undefined, 'ge-arthur-havisham'],
  ['great-expectations', 'original-en', undefined, 'jack', undefined, 'ge-jack-causeway'],
  ['great-expectations', 'original-en', undefined, 'handel-composer', undefined, 'ge-handel-composer'],
  ['great-expectations', 'original-en', undefined, 'george-barnwell', undefined, 'ge-george-barnwell'],
  ['great-expectations', 'modern-en', undefined, 'trabbs-boy', undefined, 'ge-modern-trabbs-boy'],
  ['great-expectations', 'modern-en', undefined, 'wopsles-great-aunt', undefined, 'ge-modern-wopsles-great-aunt'],
  ['great-expectations', 'modern-en', 1, 'georgiana-pirrip', undefined, 'ge-modern-georgiana-pirrip'],
  ['great-expectations', 'modern-en', undefined, 'pepper', undefined, 'ge-modern-pepper'],
  // Jane Eyre — clickable-names pass (batch 4)
  ['jane-eyre', 'original-en', 1, 'jane', 'Jane', 'je-jane-bare-alias'],
  ['jane-eyre', 'original-en', 23, 'rochester', undefined, 'je-rochester-ch23'],
  ['jane-eyre', 'original-en', 11, 'adele', undefined, 'je-adele-miss-varens-alias'],
  ['jane-eyre', 'original-en', 29, 'st-john-rivers', undefined, 'je-st-john-ch29'],
  ['jane-eyre', 'original-en', undefined, 'mary-rivers', undefined, 'je-mary-rivers-bare'],
  ['jane-eyre', 'original-en', 1, 'john-reed', undefined, 'je-john-reed-bare'],
  ['jane-eyre', 'original-en', undefined, 'john-servant', undefined, 'je-john-servant'],
  ['jane-eyre', 'original-en', undefined, 'mary-servant', undefined, 'je-mary-servant'],
  ['jane-eyre', 'original-en', undefined, 'mary-ingram', undefined, 'je-mary-ingram'],
  ['jane-eyre', 'original-en', undefined, 'mary-ann-wilson', undefined, 'je-mary-ann-wilson'],
  ['jane-eyre', 'original-en', undefined, 'bertha-mason', undefined, 'je-bertha-mrs-rochester'],
  ['jane-eyre', 'original-en', undefined, 'rowland-rochester', undefined, 'je-rowland-rochester'],
  ['jane-eyre', 'original-en', undefined, 'old-mr-rochester', undefined, 'je-old-mr-rochester'],
  ['jane-eyre', 'original-en', undefined, 'celine-varens', undefined, 'je-celine-varens'],
  ['jane-eyre', 'original-en', undefined, 'lord-ingram', undefined, 'je-lord-ingram'],
  ['jane-eyre', 'original-en', 17, 'lord-ingram', undefined, 'je-lord-ingram-theodore-ch17'],
  ['jane-eyre', 'original-en', undefined, 'theodore-brocklehurst', undefined, 'je-theodore-brocklehurst'],
  ['jane-eyre', 'original-en', undefined, 'robert-leaven', undefined, 'je-robert-leaven'],
  ['jane-eyre', 'original-en', undefined, 'bobby-leaven', undefined, 'je-bobby-leaven'],
  ['jane-eyre', 'original-en', undefined, 'uncle-reed', undefined, 'je-uncle-reed'],
  ['jane-eyre', 'original-en', undefined, 'john-eyre', undefined, 'je-john-eyre'],
  ['jane-eyre', 'original-en', undefined, 'abbot', undefined, 'je-abbot'],
  ['jane-eyre', 'original-en', undefined, 'mr-lloyd', undefined, 'je-mr-lloyd'],
  ['jane-eyre', 'original-en', undefined, 'miss-miller', undefined, 'je-miss-miller'],
  ['jane-eyre', 'original-en', undefined, 'julia-severn', undefined, 'je-julia-severn'],
  ['jane-eyre', 'original-en', undefined, 'leah', undefined, 'je-leah'],
  ['jane-eyre', 'original-en', undefined, 'sophie', undefined, 'je-sophie'],
  ['jane-eyre', 'original-en', undefined, 'pilot', undefined, 'je-pilot'],
  ['jane-eyre', 'original-en', undefined, 'mesrour', undefined, 'je-mesrour'],
  ['jane-eyre', 'original-en', undefined, 'grace-poole', undefined, 'je-grace-poole'],
  ['jane-eyre', 'original-en', 20, 'mason', undefined, 'je-mason-ch20'],
  ['jane-eyre', 'original-en', undefined, 'mr-carter', undefined, 'je-mr-carter'],
  ['jane-eyre', 'original-en', undefined, 'sam', undefined, 'je-sam'],
  ['jane-eyre', 'original-en', undefined, 'mrs-dent', undefined, 'je-mrs-dent'],
  ['jane-eyre', 'original-en', undefined, 'amy-eshton', undefined, 'je-amy-eshton'],
  ['jane-eyre', 'original-en', undefined, 'mr-briggs', undefined, 'je-mr-briggs'],
  ['jane-eyre', 'original-en', undefined, 'mr-wood', undefined, 'je-mr-wood'],
  ['jane-eyre', 'original-en', undefined, 'gytrash', undefined, 'je-gytrash'],
  ['jane-eyre', 'original-en', undefined, 'hannah', undefined, 'je-hannah'],
  ['jane-eyre', 'original-en', undefined, 'carlo', undefined, 'je-carlo'],
  ['jane-eyre', 'original-en', undefined, 'mr-oliver', undefined, 'je-mr-oliver'],
  ['jane-eyre', 'original-en', undefined, 'bewick', undefined, 'je-bewick'],
  ['jane-eyre', 'modern-en', 1, 'jane', 'Jane', 'je-modern-jane-bare-alias'],
  ['jane-eyre', 'modern-en', undefined, 'mahomet', undefined, 'je-modern-mohammed'],
  ['jane-eyre', 'modern-en', undefined, 'john-servant', undefined, 'je-modern-john-servant'],
  ['jane-eyre', 'modern-en', undefined, 'bertha-mason', undefined, 'je-modern-bertha'],
  // Walden — clickable-names pass (batch 4)
  ['walden', 'original-en', undefined, 'james-collins', undefined, 'wa-james-collins'],
  ['walden', 'original-en', undefined, 'mrs-c', undefined, 'wa-mrs-c'],
  ['walden', 'original-en', undefined, 'cato', undefined, 'wa-cato'],
  ['walden', 'original-en', undefined, 'evelyn', undefined, 'wa-evelyn'],
  ['walden', 'original-en', undefined, 'confucius', undefined, 'wa-confucius'],
  ['walden', 'original-en', undefined, 'homer', undefined, 'wa-homer'],
  ['walden', 'original-en', undefined, 'aurora', undefined, 'wa-aurora'],
  ['walden', 'original-en', undefined, 'hercules', undefined, 'wa-hercules'],
  ['walden', 'original-en', undefined, 'sheik-sadi', undefined, 'wa-sheik-sadi'],
  ['walden', 'original-en', undefined, 'kirby-and-spence', undefined, 'wa-kirby-and-spence'],
  ['walden', 'original-en', undefined, 'flint', undefined, 'wa-flint'],
  ['walden', 'original-en', undefined, 'solomon-hand', undefined, 'wa-solomon-farm-hand'],
  ['walden', 'original-en', undefined, 'king-solomon', undefined, 'wa-king-solomon'],
  ['walden', 'original-en', undefined, 'say', undefined, 'wa-say-economist'],
  ['walden', 'original-en', undefined, 'william-tell', undefined, 'wa-william-tell'],
  ['walden', 'original-en', undefined, 'jesus-christ', undefined, 'wa-jesus-christ'],
  ['walden', 'original-en', undefined, 'duncan-ingraham', undefined, 'wa-duncan-ingraham'],
  ['walden', 'original-en', undefined, 'tom-hyde', undefined, 'wa-tom-hyde'],
  ['walden', 'modern-en', undefined, 'cato', undefined, 'wa-modern-cato'],
  ['walden', 'modern-en', undefined, 'aurora', undefined, 'wa-modern-aurora'],
  // 30-cap rebind: principal names past the 30th occurrence (late chapters)
  ['odyssey', 'original-en', 22, 'odysseus', 'Ulysses', 'cap-odyssey-ulysses-ch22'],
  ['odyssey', 'original-en', 23, 'penelope', undefined, 'cap-odyssey-penelope-ch23'],
  ['odyssey', 'modern-en', 24, 'telemachus', undefined, 'cap-odyssey-modern-telemachus-ch24'],
  ['iliad', 'original-en', 22, 'hector', undefined, 'cap-iliad-hector-ch22'],
  ['iliad', 'original-en', 24, 'achilles', undefined, 'cap-iliad-achilles-ch24'],
  ['iliad', 'original-en', 15, 'ajax-great', 'Ajax', 'cap-iliad-ajax-great-ch15'],
  ['the-aeneid', 'original-en', 12, 'turnus', undefined, 'cap-aeneid-turnus-ch12'],
  ['paradise-lost', 'original-en', 10, 'eve', undefined, 'cap-pl-eve-ch10'],
  ['peloponnesian-war', 'original-en', 22, 'nicias', undefined, 'cap-pw-nicias-ch22'],
  ['the-histories', 'original-en', 1519, 'xerxes', undefined, 'cap-hist-xerxes-late'],
  ['taming-of-the-shrew', 'original-en', 12, 'bianca', undefined, 'cap-shrew-bianca-late'],
  ['jerusalem', 'original-en', 8, 'big-ingmar', undefined, 'cap-jerusalem-big-ingmar-ch8'],
]

function findMention(book, edition, characterId, chapterHint) {
  const asset = JSON.parse(fs.readFileSync(`public/data/characters/${book}.v1.json`, 'utf8'))
  const ed = asset.editions[edition]
  const candidates = ed.mentions.filter(m => m.characterId === characterId && (chapterHint === undefined || m.chapterNumber === chapterHint))
  assert.ok(candidates.length, `no mention found for ${book}/${edition}/${characterId} (chapter hint ${chapterHint})`)
  const m = candidates[0]
  const character = ed.characters.find(c => c.id === characterId)
  assert.ok(character, `no character record for ${characterId}`)
  return { m, character, asset }
}

async function run(conf, engine) {
  const b = await engine.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
  const results = []
  try {
    for (const [book, edition, chapterHint, characterId, expectedNameSubstring, label] of CASES) {
      const { m, character } = findMention(book, edition, characterId, chapterHint)
      const source = JSON.parse(fs.readFileSync(`public/data/editions/${book}-${edition}.json`, 'utf8'))
      const chapter = source.chapters.find(c => c.number === m.chapterNumber)
      const text = normalized(chapter.paragraphs[m.paragraphIndex])
      const wordIndex = [...text.matchAll(/\S+/g)].findIndex(w => w.index < m.endOffset && w.index + w[0].length > m.startOffset)
      assert.ok(wordIndex >= 0, `${label}: could not locate word index`)

      const p = await b.newPage({ viewport: conf.width ? { width: conf.width, height: conf.height } : undefined, isMobile: conf.name === 'phone', hasTouch: conf.name === 'phone' })
      p.setDefaultTimeout(15000)
      const pageErrors = []
      p.on('pageerror', e => pageErrors.push(e.message))
      await p.route('**/api/**', r => r.fulfill({ status: 404, body: '{}' }))
      await p.addInitScript(({ book, edition, ch, paragraphIndex }) => {
        sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
          kind: 'open-reader', bookId: book, primaryEditionKey: edition,
          savedPlace: { bookId: book, chapterNumber: ch, paragraphIndex, page: 0 },
        }))
      }, { book, edition, ch: m.chapterNumber, paragraphIndex: m.paragraphIndex })

      await p.goto(origin + '/reader')
      await p.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
      await p.waitForTimeout(1000)

      // Multiple .lab-page-wrap containers can exist in the DOM at once
      // (adjacent pages pre-rendered for pagination); .first() plus a raw
      // coordinate check is not enough to confirm the match is the actual
      // visible, tappable instance -- confirm elementFromPoint at the
      // candidate's own center resolves back to this same element.
      const word = p.locator(`.lab-page-wrap [data-paragraph-index="${m.paragraphIndex}"][data-word-index="${wordIndex}"]`).first()
      const onPage = async () => {
        if (!(await word.count())) return false
        const box = await word.boundingBox()
        const vp = p.viewportSize()
        if (!box || box.x < 0 || box.y < 0 || box.x + box.width > vp.width || box.y + box.height > vp.height) return false
        return word.evaluate((el, { cx, cy }) => {
          const top = document.elementFromPoint(cx, cy)
          return !!top && (top === el || el.contains(top) || top.contains(el))
        }, { cx: box.x + box.width / 2, cy: box.y + box.height / 2 })
      }
      let paged = false
      for (let i = 0; i < 25 && !(await onPage()); i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(180); paged = true }
      const found = await onPage()
      if (!found) {
        await p.screenshot({ path: `${dir}/${conf.name}-${label}-notfound.png` })
        results.push({ label, status: 'WORD_NOT_FOUND_ON_ANY_PAGE', device: conf.name, book, characterId })
        await p.close(); continue
      }

      if (conf.name === 'desktop') await word.click()
      else {
        const box = await word.boundingBox()
        await word.dispatchEvent('pointerdown', { pointerType: 'touch', pointerId: 1, clientX: box.x + 3, clientY: box.y + 3 })
        await p.waitForTimeout(300)
        await word.dispatchEvent('pointerup', { pointerType: 'touch', pointerId: 1, clientX: box.x + 3, clientY: box.y + 3 })
      }

      let popupText = null, status = 'PASS'
      try {
        await p.locator('[data-popup-mode="character"]').waitFor({ timeout: 5000 })
        popupText = await p.locator('.popup-character h2').innerText().catch(() => null)
        const expected = expectedNameSubstring || character.snapshots[0].name
        if (!popupText || !popupText.includes(expected)) status = `WRONG_NAME (got "${popupText}", expected to include "${expected}")`
      } catch (e) {
        status = 'NO_CARD_OPENED'
      }
      if (pageErrors.length) status += ` + JS_ERRORS: ${pageErrors.join('; ')}`
      await p.screenshot({ path: `${dir}/${conf.name}-${label}.png` })
      results.push({ label, status, device: conf.name, book, characterId, expectedName: expectedNameSubstring || character.snapshots[0].name, gotName: popupText, paged })
      await p.close()
    }
  } finally {
    await b.close()
  }
  return results
}

;(async () => {
  const all = []
  all.push(...await run({ name: 'desktop', width: 1440, height: 950 }, chromium))
  all.push(...await run({ name: 'phone', width: 390, height: 844 }, chromium))
  fs.writeFileSync(`${dir}/results.json`, JSON.stringify(all, null, 2))
  const failures = all.filter(r => r.status !== 'PASS')
  console.log(JSON.stringify(all, null, 2))
  console.log(`\n${all.length - failures.length}/${all.length} passed.`)
  if (failures.length) { console.log('FAILURES:', JSON.stringify(failures, null, 2)); process.exitCode = 1 }
})().catch(e => { console.error(e); process.exitCode = 1 })

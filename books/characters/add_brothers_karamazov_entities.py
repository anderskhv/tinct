#!/usr/bin/env python3
"""Brothers Karamazov: clickable-names pass.

Two halves:
1. Aliases on the 17 existing cards. The original bindings only used
   formal name+patronymic forms, so the everyday forms were dead: bare
   "Ivan" (650 untappable occurrences), "Kolya", "Katya", "Grusha",
   "Dmitri", "Alexey", "Perhotin", "Zossima", "Snegiryov" ...
2. New minimal cards for everyone else who is named, with the homonyms
   read in context and split by paragraph (Agafya Ivanovna vs the
   Krassotkins' servant Agafya, Misha = Rakitin vs Misha the shop boy,
   the two Lizavetas, the three Maryas, Kuzma/Trifon namesakes, Job the
   patriarch vs Job the monk, ...).

Specific-name entities are bound BEFORE bare-name aliases so the longer
form claims the span first (Tchizhov "Alexey Ivanitch" before Alyosha's
"Alexey"; "Trifon Nikititch" before Trifon Borissovitch's bare "Trifon").
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases
from add_aliases_restricted import add_aliases_restricted

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'brothers-karamazov'
P = 'person'
D = 'deity'

_ED = json.loads((ROOT / f'app/public/data/editions/{BOOK}-original-en.json').read_text())
_PARAS = [(c['number'], i, p) for c in _ED['chapters'] for i, p in enumerate(c['paragraphs'])]


def paras_with(pattern, chapters=None):
    rx = re.compile(pattern)
    return {(ch, i) for ch, i, p in _PARAS if (chapters is None or ch in chapters) and rx.search(p)}


def chapters(*chs):
    return {(ch, i) for ch, i, p in _PARAS if ch in chs}


def remove_mentions(char_id, predicate):
    """Drop mentions of char_id whose surrounding text matches predicate(before, text)."""
    path = ROOT / f'app/public/data/characters/{BOOK}.v1.json'
    pkg = json.loads(path.read_text())
    for ek, ed in pkg['editions'].items():
        edp = ROOT / f'app/public/data/editions/{BOOK}-{ek}.json'
        data = json.loads(edp.read_text())
        paras = {(c['number'], i): p for c in data['chapters'] for i, p in enumerate(c['paragraphs'])}
        keep, dropped = [], 0
        for m in ed['mentions']:
            if m['characterId'] == char_id:
                t = paras[(m['chapterNumber'], m['paragraphIndex'])]
                before = t[max(0, m['startOffset'] - 12):m['startOffset']]
                if predicate(before, m['text']):
                    dropped += 1
                    continue
            keep.append(m)
        ed['mentions'] = keep
        print(BOOK, ek, char_id, 'removed', dropped, 'mis-bound mentions')
    path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')


def main():
    # ---- clean-ups on existing bindings ---------------------------------
    # "Krassotkin" inside "Madame Krassotkin" was bound to Kolya.
    remove_mentions('kolya', lambda before, text: before.endswith('Madame ') and text == 'Krassotkin')

    # ---- specific-name entities that must claim spans first -------------
    add_e(BOOK, 'tchizhov', 'Tchizhov', 'Alexey Ivanitch', "The man the market women insist Kolya must mean, not Sabaneyev.", 'reference', P, ['Alexey Ivanitch Tchizhov', 'Tchizhov', 'Alexey Ivanitch'])
    add_e(BOOK, 'sabaneyev', 'Sabaneyev', '', "The name Kolya throws at the market women to bewilder them.", 'reference', P, ['Sabaneyev'])
    add_e(BOOK, 'trifon-nikititch', 'Trifon Nikititch', '', "The name the peasant boy gives for a man the market woman says is really called Kuzma.", 'reference', P, ['Trifon Nikititch'])
    add_e(BOOK, 'korneplodov', 'Korneplodov', 'Provincial lawyer', "Pavel Pavlovitch Korneplodov, the distinguished lawyer Mitya consulted about his claim.", 'reference', P, ['Pavel Pavlovitch Korneplodov', 'Korneplodov'])
    add_e(BOOK, 'father-pavel', 'Father Pavel', 'Priest of Ilyinskoe', "The priest who brings Mitya to Lyagavy's hut.", 'reference', P, ['Father Pavel'])
    add_e(BOOK, 'nazar-ivanovitch', 'Nazar Ivanovitch', 'Chief porter', "The porter Fenya begs not to let the captain in again.", 'reference', P, ['Nazar Ivanovitch'])
    add_e(BOOK, 'nastasya-petrovna', 'Nastasya Petrovna', '', "Named in Snegiryov's speech as 'of the brood of hell'.", 'reference', P, ['Nastasya Petrovna'])
    add_e(BOOK, 'alexandr-alexandrovitch', 'Alexandr Alexandrovitch', '', "A man of the noblest heart, in Snegiryov's account.", 'reference', P, ['Alexandr Alexandrovitch'])
    add_e(BOOK, 'agafya-ivanovna', 'Agafya Ivanovna', "Katerina's half-sister", "Katerina Ivanovna's elder half-sister, whom Mitya nearly ruined and who kept his secret.", 'supporting', P,
          ['Agafya Ivanovna', 'Agafya'], only_paragraphs=chapters(17, 18, 23, 29))
    add_e(BOOK, 'agafya-servant', 'Agafya', "The Krassotkins' servant", "Madame Krassotkin's stout servant, whom Kolya leaves in charge of the neighbours' children.", 'reference', P,
          ['Agafya'], only_paragraphs=chapters(64))
    add_e(BOOK, 'stepanida-ilyinishna', 'Stepanida Ilyinishna', "Merchant's wife", "Told the grieving pilgrim to have her son's name put down for prayer.", 'reference', P, ['Stepanida Ilyinishna'])
    add_e(BOOK, 'stepanida', 'Stepanida', 'Mokroe girl', "One of the girls Mitya calls for at Mokroe; plays the bear-keeper in the dance.", 'reference', P, ['Stepanida'], only_paragraphs=chapters(51, 53))
    add_e(BOOK, 'arina-petrovna', 'Arina Petrovna', "Snegiryov's wife", "The captain's crippled, half-mad wife, 'mamma'.", 'supporting', P, ['Arina Petrovna'])
    add_e(BOOK, 'arina', 'Arina', 'Mokroe girl', "One of the girls Mitya calls for at Mokroe.", 'reference', P, ['Arina'], only_paragraphs={(51, 74)})
    add_e(BOOK, 'marya-kondratyevna', 'Marya Kondratyevna', "Neighbour's daughter", "The neighbour's daughter Smerdyakov courts with his guitar, and at whose house he lies ill.", 'supporting', P,
          ['Marya Kondratyevna', 'Marya'], exclude_paragraphs=chapters(51, 52, 53, 65))
    add_e(BOOK, 'marya-mokroe', 'Marya', 'Mokroe girl', "The girl Mitya especially wants for the chorus at Mokroe.", 'reference', P, ['Marya'], only_paragraphs=chapters(51, 52, 53))
    add_e(BOOK, 'marya-market', 'Marya', 'Market woman', "The market woman who objects to Kolya calling her Natasha.", 'reference', P, ['Marya'], only_paragraphs=chapters(65))
    add_e(BOOK, 'lizaveta-child', 'Lizaveta', "Pilgrim's baby", "The infant daughter the peasant mother from Vishegorye brings to the elder.", 'reference', P, ['Lizaveta'], only_paragraphs={(8, 51), (8, 52), (39, 5)})
    add_e(BOOK, 'lizaveta-smerdyastchaya', 'Lizaveta Smerdyastchaya', 'Stinking Lizaveta', "The town's holy idiot, who died giving birth to Smerdyakov in Fyodor Pavlovitch's garden.", 'supporting', P,
          ['Lizaveta Smerdyastchaya', 'Stinking Lizaveta', 'stinking Lizaveta', 'Lizaveta'], exclude_paragraphs={(8, 51), (8, 52), (39, 5)})
    add_e(BOOK, 'job-monk', 'Job', 'Monk', "An old monk of the monastery, dead seventy years, whose memory was still cherished.", 'reference', P, ['Job'], only_paragraphs={(42, 15)})
    add_e(BOOK, 'job', 'Job', 'Biblical patriarch', "The righteous man tested by God — Zossima's favourite book, and Ivan's stumbling block.", 'reference', P, ['Job'], exclude_paragraphs={(42, 15)})
    add_e(BOOK, 'isaac-the-syrian', 'Isaac the Syrian', 'Church father', "The ascetic whose sayings Grigory read for years, and which Ivan reads mechanically.", 'reference', P, ['Isaac the Syrian', 'Father Isaac'])
    add_e(BOOK, 'isaac', 'Isaac', 'Biblical patriarch', "Named with Rebecca in Zossima's list of the stories to read to the people.", 'reference', P, ['Isaac'], only_paragraphs={(39, 49)})
    add_e(BOOK, 'mihail-visitor', 'Mihail', 'The mysterious visitor', "The 'servant of God' who confessed a murder to the young Zossima; remembered in his prayers.", 'supporting', P, ['Mihail'], only_paragraphs={(40, 161)})
    add_e(BOOK, 'father-mihail', 'Father Mihaïl', 'Warden of the hermitage', "One of the four monks at Zossima's last talk.", 'reference', P, ['Father Mihaïl'])
    add_e(BOOK, 'mihail-mihailovitch', 'Mihail Mihailovitch', 'Captain of police', "Favourably disposed to Grushenka; not to be confused with Mihail Makarovitch.", 'reference', P, ['Mihail Mihailovitch'])
    add_e(BOOK, 'mihail-semyonovitch', 'Mihail Semyonovitch', '', "Addressed in the talk after the trial.", 'reference', P, ['Mihail Semyonovitch'])
    add_e(BOOK, 'misha-boy', 'Misha', 'Shop boy', "The boy Mitya sends running with the order for the Mokroe provisions.", 'reference', P, ['Misha'], only_paragraphs=chapters(50))

    # ---- aliases on existing cards --------------------------------------
    add_aliases(BOOK, 'ivan', ['Ivan Fyodorovitch', 'Ivan Karamazov', 'Ivan'])
    add_aliases(BOOK, 'dmitri', ['Dmitri Karamazov', 'Dmitri', 'Mitenka'])
    add_aliases(BOOK, 'alyosha', ['Alexey Karamazov', 'Alexey'])
    add_aliases(BOOK, 'fyodor', ['Fyodor'])
    add_aliases(BOOK, 'katerina', ['Katya', 'Katenka', 'Katerina'])
    add_aliases(BOOK, 'grushenka', ['Agrafena Alexandrovna', 'Agrafena', 'Grusha'])
    add_aliases(BOOK, 'kolya', ['Nikolay Ivanovitch Krassotkin', 'Nikolay Krassotkin', 'Kolya'])
    add_aliases_restricted(BOOK, 'kolya', ['Nikolay'], only_paragraphs={(66, 22)})
    add_aliases(BOOK, 'snegiryov', ['Nikolay Ilyitch Snegiryov', 'Nikolay Ilyitch', 'Snegiryov'])
    add_aliases(BOOK, 'pyotr-ilyitch', ['Perhotin'])
    add_aliases(BOOK, 'zossima', ['Zossima'])
    add_aliases(BOOK, 'madame-hohlakov', ['Hohlakov'])
    add_aliases(BOOK, 'rakitin', ['Mihail Osipovitch'])
    add_aliases_restricted(BOOK, 'rakitin', ['Misha'], only_paragraphs=chapters(12, 44))
    add_aliases(BOOK, 'smerdyakov', ['Pavel Fyodorovitch'])
    add_aliases_restricted(BOOK, 'smerdyakov', ['Pavel'], only_paragraphs={(15, 4)})
    add_aliases(BOOK, 'nikolay-parfenovitch', ['Nelyudov'])

    # ---- the household, the town, the monastery -------------------------
    add_e(BOOK, 'marfa', 'Marfa Ignatyevna', "Grigory's wife", "Grigory's wife, who raised the foundling Smerdyakov; her screams raise the alarm on the night of the murder.", 'supporting', P, ['Marfa Ignatyevna', 'Marfa'])
    add_e(BOOK, 'miusov', 'Miüsov', 'Pyotr Alexandrovitch', "A liberal, Paris-polished landowner and relative of the first Madame Karamazov; Fyodor's foil at the monastery.", 'supporting', P,
          ['Pyotr Alexandrovitch Miüsov', 'Miüsov', 'Pyotr Alexandrovitch'])
    add_e(BOOK, 'maximov', 'Maximov', 'Landowner', "A shabby, comic little landowner who attaches himself to Fyodor and later to Grushenka.", 'supporting', P, ['Maximov', 'Maximushka'])
    add_e(BOOK, 'kalganov', 'Kalganov', 'Pyotr Fomitch', "A young relative of Miüsov's, present at Mokroe on the fatal night.", 'supporting', P, ['Pyotr Fomitch Kalganov', 'Kalganov', 'Pyotr Fomitch'])
    add_e(BOOK, 'von-sohn', 'Von Sohn', "Fyodor's nickname for Maximov", "The murdered man in a notorious case; Fyodor insists Maximov is his double.", 'reference', P, ['von Sohn', 'Von Sohn'])
    add_e(BOOK, 'father-paissy', 'Father Païssy', 'Learned monk', "The learned, stern monk who takes over Alyosha's guidance after Zossima's death.", 'supporting', P, ['Father Païssy', 'Païssy'])
    add_e(BOOK, 'father-iosif', 'Father Iosif', 'Librarian', "The Father Librarian of the monastery, present at the debate on Church courts.", 'supporting', P, ['Father Iosif', 'Iosif', 'Father Librarian'])
    add_e(BOOK, 'father-ferapont', 'Father Ferapont', 'Ascetic', "The fanatic old ascetic who sees devils and denounces the dead elder.", 'supporting', P, ['Father Ferapont', 'Ferapont'])
    add_e(BOOK, 'father-superior', 'The Father Superior', 'Head of the monastery', "Host of the dinner Fyodor Pavlovitch disgraces.", 'reference', P, ['Father Superior'])
    add_e(BOOK, 'father-anfim', 'Father Anfim', 'Old monk', "The humble old monk with whom the young Zossima travelled collecting alms.", 'reference', P, ['Father Anfim', 'Anfim'])
    add_e(BOOK, 'father-iona', 'Father Iona', 'Ascetic', "A great ascetic of the past, who lived to a hundred and five.", 'reference', P, ['Father Iona'])
    add_e(BOOK, 'father-isidor', 'Father Isidor', 'Monk', "Shouts after the departing Karamazovs from the Superior's steps.", 'reference', P, ['Father Isidor'])
    add_e(BOOK, 'varsonofy', 'Varsonofy', 'The previous elder', "Zossima's predecessor, remembered as strange but incorruptible.", 'reference', P, ['Varsonofy'])
    add_e(BOOK, 'porfiry', 'Porfiry', 'Novice', "The novice who waits on Father Zossima.", 'reference', P, ['Porfiry'])
    add_e(BOOK, 'markel', 'Markel', "Zossima's brother", "Zossima's elder brother, whose deathbed conversion shaped his whole life.", 'supporting', P, ['Markel'])
    add_e(BOOK, 'afanasy', 'Afanasy', "Zossima's orderly", "The orderly the young Zossima struck and then begged forgiveness of; met again years later.", 'supporting', P, ['Afanasy Pavlovitch', 'Afanasy'])
    add_e(BOOK, 'prohorovna', 'Prohorovna', 'Grieving mother', "The sergeant's widow who asks whether she may pray for her absent son as if dead.", 'reference', P, ['Prohorovna'])
    add_e(BOOK, 'vassenka', 'Vassenka', "Prohorovna's son", "Prohorovna's son in the commissariat, gone to Irkutsk without writing.", 'reference', P, ['Vassenka', 'Vasenka', 'Vassya'])
    add_e(BOOK, 'nikita', 'Nikita', "Pilgrim's husband", "Husband of the peasant woman grieving her last child; has begun drinking.", 'reference', P, ['Nikita'])
    add_e(BOOK, 'nastasya-pilgrim', 'Nastasya', 'Pilgrim', "The peasant woman sent on from three monasteries to the elder.", 'reference', P, ['Nastasya'], only_paragraphs={(8, 11)})
    add_e(BOOK, 'fenya', 'Fenya', "Grushenka's maid", "Grushenka's maid, who tells Mitya where her mistress has gone.", 'supporting', P, ['Fenya'])
    add_e(BOOK, 'matryona', 'Matryona', 'Old cook', "Fenya's grandmother, the old cook.", 'reference', P, ['Matryona'])
    add_e(BOOK, 'samsonov', 'Samsonov', 'Kuzma Kuzmitch', "The old merchant who kept Grushenka; Mitya begs him for money.", 'supporting', P, ['Kuzma Kuzmitch Samsonov', 'Kuzma Samsonov', 'Samsonov', 'Kuzma Kuzmitch', 'Kuzma'], exclude_paragraphs={(65, 92)})
    add_e(BOOK, 'lyagavy', 'Lyagavy', 'Gorstkin', "The drunken timber merchant Mitya rides out to see about the copse.", 'reference', P, ['Lyagavy', 'Gorstkin'])
    add_e(BOOK, 'trifon-borissovitch', 'Trifon Borissovitch', 'Innkeeper at Mokroe', "The Mokroe innkeeper who fleeced Mitya on both his sprees.", 'supporting', P, ['Trifon Borissovitch', 'Trifon'], exclude_paragraphs={(65, 92)})
    add_e(BOOK, 'andrey', 'Andrey', 'Driver', "The talkative driver who takes Mitya to Mokroe on the night of the murder.", 'supporting', P, ['Andrey'])
    add_e(BOOK, 'timofey', 'Timofey', 'Driver', "The driver who took Grushenka to Mokroe ahead of Mitya.", 'reference', P, ['Timofey'])
    add_e(BOOK, 'akim', 'Akim', 'Peasant', "A Mokroe peasant; picked up a hundred-rouble note after the first carousal.", 'reference', P, ['Akim'])
    add_e(BOOK, 'stepan', 'Stepan', 'Peasant', "A Mokroe peasant who heard Mitya boast of his money.", 'reference', P, ['Stepan'])
    add_e(BOOK, 'semyon', 'Semyon', 'Peasant', "A Mokroe peasant who heard Mitya boast of his money.", 'reference', P, ['Semyon'])
    add_e(BOOK, 'plastunov', 'Plastunov', 'Innkeeper', "Keeps the inn at Mokroe that lets out horses.", 'reference', P, ['Plastunov'])
    add_e(BOOK, 'vrublevsky', 'Pan Vrublevsky', 'Pole', "The tall Pole who comes to Mokroe with Grushenka's former lover.", 'supporting', P, ['Pan Vrublevsky', 'Vrublevsky'])
    add_e(BOOK, 'mussyalovitch', 'Pan Mussyalovitch', "Grushenka's former lover", "The Polish officer who abandoned Grushenka and returns to claim her at Mokroe.", 'supporting', P, ['Pan Mussyalovitch', 'Mussyalovitch'])
    add_e(BOOK, 'podvysotsky', 'Podvysotsky', '', "A Pole in the Poles' anecdote at cards.", 'reference', P, ['Podvysotsky', 'Pan Podvysotsky'])
    add_e(BOOK, 'foma', 'Foma', 'Ex-soldier', "A former soldier lodging where Mitya hides to watch for Grushenka.", 'reference', P, ['Foma'])
    add_e(BOOK, 'ilya', 'Ilya', "Lizaveta's father", "The sickly drunkard who beat Stinking Lizaveta.", 'reference', P, ['Ilya'])
    add_e(BOOK, 'kondratyev', 'Kondratyev', "Merchant's widow", "Took Lizaveta into her house.", 'reference', P, ['Kondratyev'])
    add_e(BOOK, 'mihail-makarovitch', 'Mihail Makarovitch', 'Police captain', "Makarov, the genial captain of police, at whose house the Mokroe party is investigated.", 'supporting', P, ['Mihail Makarovitch Makarov', 'Mihail Makarovitch', 'Makarov'])
    add_e(BOOK, 'mavriky', 'Mavriky Mavrikyevitch', 'Police officer', "The officer who escorts Mitya back to town.", 'reference', P, ['Mavriky Mavrikyevitch', 'Mavriky'])
    add_e(BOOK, 'ippolit-kirillovitch', 'Ippolit Kirillovitch', 'Prosecutor', "The ambitious prosecutor whose speech reconstructs the murder.", 'major', P, ['Ippolit Kirillovitch', 'Ippolit'])
    add_e(BOOK, 'fetyukovitch', 'Fetyukovitch', 'Defence counsel', "The famous Petersburg advocate who defends Mitya.", 'major', P, ['Fetyukovitch'])
    add_e(BOOK, 'president', 'The President', 'Of the court', "The presiding judge at Mitya's trial.", 'reference', P, ['President'], only_paragraphs=chapters(80, 81, 83, 84, 85, 91, 92, 93))
    add_e(BOOK, 'herzenstube', 'Doctor Herzenstube', 'Town doctor', "The kindly, muddled old German doctor.", 'supporting', P, ['Doctor Herzenstube', 'Herzenstube'])
    add_e(BOOK, 'varvinsky', 'Doctor Varvinsky', 'Young doctor', "The young district doctor who examines Smerdyakov.", 'reference', P, ['Doctor Varvinsky', 'Varvinsky'])
    add_e(BOOK, 'kravchenko', 'Dr. Kravchenko', '', "Declared Mitya's colonel really ill.", 'reference', P, ['Kravchenko'])
    add_e(BOOK, 'lepelletier', 'Lepelletier', 'Paris specialist', "The mental specialist the doctor recommends for Ilusha.", 'reference', P, ['Lepelletier'])
    add_e(BOOK, 'svyetlov', 'Madame Svyetlov', "Grushenka's surname", "The name under which Grushenka appears in official talk.", 'reference', P, ['Madame Svyetlov', 'Svyetlov'])
    add_e(BOOK, 'madame-krassotkin', 'Madame Krassotkin', "Kolya's mother", "Anna Fyodorovna, the young widow who adores and fears for her son Kolya.", 'supporting', P, ['Madame Krassotkin', 'Anna Fyodorovna'])
    add_e(BOOK, 'dardanelov', 'Dardanelov', 'Schoolmaster', "The teacher in love with Madame Krassotkin; Kolya's rival at universal history.", 'supporting', P, ['Dardanelov'])
    add_e(BOOK, 'kolbasnikov', 'Kolbasnikov', 'Schoolmaster', "The master who is savage with Kolya.", 'reference', P, ['Kolbasnikov'])
    add_e(BOOK, 'smurov', 'Smurov', 'Schoolboy', "The small boy who brings Kolya to Ilusha's bedside.", 'supporting', P, ['Smurov'])
    add_e(BOOK, 'kartashov', 'Kartashov', 'Schoolboy', "The shy boy who found out who founded Troy.", 'reference', P, ['Kartashov'])
    add_e(BOOK, 'nastya', 'Nastya', "Neighbour's child", "The eight-year-old Kolya minds; always gets the better of her brother.", 'reference', P, ['Nastya'])
    add_e(BOOK, 'kostya', 'Kostya', "Neighbour's child", "The seven-year-old Kolya minds; likes the cannon better.", 'reference', P, ['Kostya'])
    add_e(BOOK, 'perezvon', 'Perezvon', 'Dog (Zhutchka)', "The dog Kolya trains — Ilusha's lost Zhutchka, produced at the bedside.", 'supporting', P, ['Perezvon', 'Zhutchka'])
    add_e(BOOK, 'matvey', 'Matvey', 'Peasant', "The peasant Kolya strikes up talk with in the market.", 'reference', P, ['Matvey'])
    add_e(BOOK, 'nina', 'Nina', "Snegiryov's daughter", "Ilusha's gentle, crippled sister.", 'supporting', P, ['Nina'])
    add_e(BOOK, 'varvara-snegiryov', 'Varvara', "Snegiryov's daughter", "The captain's sharp-tongued, educated elder daughter.", 'supporting', P, ['Varvara'], only_paragraphs=chapters(30, 31, 67))
    add_e(BOOK, 'saint-varvara', 'Saint Varvara', 'Holy martyr', "The ikon from her relics Grushenka hangs round Mitya's neck.", 'reference', P, ['Varvara'], only_paragraphs={(48, 47), (54, 29)})
    add_e(BOOK, 'varvara-alexyevna', 'Varvara Alexyevna', 'Shop mistress', "Owner of the shop's carriage.", 'reference', P, ['Varvara Alexyevna'])
    add_e(BOOK, 'yefim-petrovitch', 'Yefim Petrovitch', 'Polenov', "The marshal of nobility who took in and raised Ivan and Alyosha.", 'supporting', P, ['Yefim Petrovitch Polenov', 'Yefim Petrovitch', 'Polenov'])
    add_e(BOOK, 'adelaida-ivanovna', 'Adelaïda Ivanovna', "Fyodor's first wife", "Miüsov's relative, Dmitri's mother, who ran off and died in Petersburg.", 'supporting', P, ['Adelaïda Ivanovna'])
    add_e(BOOK, 'sofya-ivanovna', 'Sofya Ivanovna', "Fyodor's second wife", "The 'shrieker', mother of Ivan and Alyosha.", 'supporting', P, ['Sofya Ivanovna'])
    add_e(BOOK, 'belmesov', 'Belmesov', "Madame Hohlakov's cousin", "The cousin she claims to have saved with gold-mines.", 'reference', P, ['Madame Belmesov', 'Belmesov'])
    add_e(BOOK, 'katchalnikov', 'Katchalnikov', 'Justice of the peace', "Described Fyodor as of unstable and unbalanced mind.", 'reference', P, ['Katchalnikov'])
    add_e(BOOK, 'nazaryev', 'Nazaryev', 'Juryman', "The merchant with the medal on the jury.", 'reference', P, ['Nazaryev'])
    add_e(BOOK, 'kalmikov', 'Kalmikov', '', "The woman in whose house Snegiryov lodges.", 'reference', P, ['Kalmikov'])
    add_e(BOOK, 'lukyanov', 'Lukyanov', 'Shopkeeper', "Told Smerdyakov the story of the Russian soldier.", 'reference', P, ['Lukyanov'])
    add_e(BOOK, 'schultz', 'Governor Schultz', '', "To whom Ivan said 'Credo, but I don't know in what'.", 'reference', P, ['Governor Schultz', 'Schultz'])
    add_e(BOOK, 'von-schmidt', 'von Schmidt', 'Retired colonel', "Former owner of the house with the garden fence.", 'reference', P, ['von Schmidt'])
    add_e(BOOK, 'tchernomazov', 'Tchernomazov', "Snegiryov's wife's name for Alyosha", "'Black-smeared' for Karamazov.", 'reference', P, ['Tchernomazov'])
    add_e(BOOK, 'jewkins', 'Jewkins', '', "Fyodor's mocking coinage for the Jews he did business with.", 'reference', P, ['Jewkins'])

    # ---- named in stories, allusions, quotations ------------------------
    add_e(BOOK, 'christ', 'Christ', '', "Jesus Christ; the silent Prisoner of Ivan's Grand Inquisitor poem.", 'reference', D, ['Jesus Christ', 'Christ', 'Jesus'])
    add_aliases_restricted(BOOK, 'christ', ['Prisoner'], only_paragraphs=chapters(36))
    add_e(BOOK, 'grand-inquisitor', 'The Grand Inquisitor', "Ivan's poem", "The ninety-year-old cardinal who arrests Christ in Seville and explains why the Church has corrected His work.", 'major', P, ['Grand Inquisitor', 'Inquisitor'], only_paragraphs=chapters(35, 36))
    add_e(BOOK, 'richard', 'Richard', 'Executed murderer', "The Genevan murderer converted at the scaffold, in Ivan's story.", 'reference', P, ['Richard'])
    add_e(BOOK, 'madonna', 'The Madonna', '', "The ideal Dmitri says a man begins with and ends with the ideal of Sodom.", 'reference', D, ['Madonna'])
    add_e(BOOK, 'diderot', 'Diderot', 'Philosopher', "Fyodor's invented anecdote about Diderot's conversion.", 'reference', P, ['Diderot'])
    add_e(BOOK, 'piron', 'Piron', 'French writer', "Maximov's anecdote about the epigram on his own tomb.", 'reference', P, ['Piron'])
    add_e(BOOK, 'dashkov', 'Princess Dashkov', '', "Diderot's godmother, in Fyodor's tale.", 'reference', P, ['Princess Dashkov', 'Dashkov'])
    add_e(BOOK, 'potyomkin', 'Potyomkin', '', "Diderot's godfather, in Fyodor's tale.", 'reference', P, ['Potyomkin'])
    add_e(BOOK, 'claude-bernard', 'Claude Bernard', 'Physiologist', "The scientist whose name Mitya turns into an insult for Rakitin: 'a Bernard'.", 'reference', P, ['Claude Bernard', 'Karl Bernard', 'Bernard', 'Bernards'])
    add_e(BOOK, 'karl-moor', 'Karl Moor', "Schiller's Robbers", "The dutiful son in Schiller's play, as Fyodor casts Ivan.", 'reference', P, ['Karl von Moor', 'Karl Moor', 'Count von Moor', 'Karl'], exclude_paragraphs={(73, 19)})
    add_e(BOOK, 'franz-moor', 'Franz Moor', "Schiller's Robbers", "The undutiful son, as Fyodor casts Dmitri.", 'reference', P, ['Franz Moor'])
    add_e(BOOK, 'schiller', 'Schiller', 'Poet', "Dmitri's poet: the Hymn to Joy, the Robbers.", 'reference', P, ['Schiller'])
    add_e(BOOK, 'pushkin', 'Pushkin', 'Poet', "", 'reference', P, ['Pushkin'])
    add_e(BOOK, 'gogol', 'Gogol', 'Novelist', "", 'reference', P, ['Gogol'])
    add_e(BOOK, 'tchitchikov', 'Tchitchikov', "Gogol's Dead Souls", "", 'reference', P, ['Tchitchikov'])
    add_e(BOOK, 'nozdryov', 'Nozdryov', "Gogol's Dead Souls", "Maximov claims to be the original.", 'reference', P, ['Nozdryov'])
    add_e(BOOK, 'kuvshinikov', 'Kuvshinikov', "Gogol's Dead Souls", "", 'reference', P, ['Kuvshinikov'])
    add_e(BOOK, 'mamsel-fenardi', 'Mamsel Fenardi', "Gogol's Dead Souls", "", 'reference', P, ['Mamsel Fenardi'])
    add_e(BOOK, 'onyegin', 'Onyegin', "Pushkin's hero", "", 'reference', P, ['Onyegin'])
    add_e(BOOK, 'hlestakov', 'Hlestakov', "Gogol's Inspector", "", 'reference', P, ['Hlestakov'])
    add_e(BOOK, 'famusov', 'Famusov', "Griboyedov's Woe from Wit", "", 'reference', P, ['Famusov'])
    add_e(BOOK, 'tchatsky', 'Tchatsky', "Griboyedov's Woe from Wit", "", 'reference', P, ['Tchatsky'])
    add_e(BOOK, 'arbenin', 'Arbenin', "Lermontov's hero", "", 'reference', P, ['Arbenin'])
    add_e(BOOK, 'byelinsky', 'Byelinsky', 'Critic', "", 'reference', P, ['Byelinsky'])
    add_e(BOOK, 'voltaire', 'Voltaire', '', "", 'reference', P, ['Voltaire'])
    add_e(BOOK, 'napoleon', 'Napoleon', '', "", 'reference', P, ['Napoleon'])
    add_e(BOOK, 'shakespeare', 'Shakespeare', '', "", 'reference', P, ['Shakespeare'])
    add_e(BOOK, 'hamlet', 'Hamlet', '', "", 'reference', P, ['Hamlet'])
    add_e(BOOK, 'yorick', 'Yorick', "Hamlet's jester", "", 'reference', P, ['Yorick'])
    add_e(BOOK, 'polonius', 'Polonius', '', "", 'reference', P, ['Polonius'])
    add_e(BOOK, 'ophelia', 'Ophelia', '', "", 'reference', P, ['Ophelia'])
    add_e(BOOK, 'heine', 'Heine', 'Poet', "", 'reference', P, ['Heine'])
    add_e(BOOK, 'luther', 'Luther', '', "", 'reference', P, ['Luther'])
    add_e(BOOK, 'dante', 'Dante', '', "", 'reference', P, ['Dante'])
    add_e(BOOK, 'tyutchev', 'Tyutchev', 'Poet', "", 'reference', P, ['Tyutchev'])
    add_e(BOOK, 'paul-de-kock', 'Paul de Kock', 'Novelist', "", 'reference', P, ['Paul de Kock'])
    add_e(BOOK, 'boileau', 'Boileau', '', "", 'reference', P, ['Boileau'])
    add_e(BOOK, 'sappho', 'Sappho', '', "", 'reference', P, ['Sappho'])
    add_e(BOOK, 'pierrot', 'Pierrot', '', "", 'reference', P, ['Pierrot'])
    add_e(BOOK, 'aesop', 'Æsop', 'Fabulist', "Miüsov's nickname for Fyodor.", 'reference', P, ['Æsop'])
    add_e(BOOK, 'napravnik', 'Napravnik', 'Conductor', "The pun Fyodor made on the police captain's title.", 'reference', P, ['Napravnik'])
    add_e(BOOK, 'phoebus', 'Phœbus', 'The sun god', "Mitya's toast to the golden-haired sun of tomorrow.", 'reference', D, ['Phœbus'])
    add_e(BOOK, 'ceres', 'Ceres', 'Goddess', "In Schiller's Eleusinian Festival, as Mitya recites it.", 'reference', D, ['Ceres'])
    add_e(BOOK, 'silenus', 'Silenus', '', "Miüsov's phrase for the drunken Fyodor.", 'reference', P, ['Silenus'])
    add_e(BOOK, 'proserpine', 'Proserpine', '', "", 'reference', D, ['Proserpine'])
    add_e(BOOK, 'alexander-of-macedon', 'Alexander of Macedon', '', "", 'reference', P, ['Alexander of Macedon', 'Alexander'])
    add_e(BOOK, 'peter-the-great', 'Peter the Great', '', "", 'reference', P, ['Peter the Great'])
    add_e(BOOK, 'louis-xi', 'Louis XI', '', "", 'reference', P, ['Louis XI'])
    add_e(BOOK, 'pope-gregory', 'Pope Gregory', '', "", 'reference', P, ['Pope Gregory'])
    add_e(BOOK, 'john-the-merciful', 'John the Merciful', 'Saint', "The saint who warmed a frozen beggar in his own bed — Ivan's example.", 'reference', P, ['John the Merciful'])
    add_e(BOOK, 'mary-of-egypt', 'Mary of Egypt', 'Saint', "", 'reference', P, ['Mary of Egypt'])
    add_e(BOOK, 'archangel-michael', 'Archangel Michael', '', "", 'reference', D, ['Archangel Michael'])
    add_e(BOOK, 'apostle-thomas', 'Thomas', 'The Apostle', "Who would not believe till he saw — and believed because he wanted to.", 'reference', P, ['Apostle Thomas', 'Thomas'])
    add_e(BOOK, 'judas', 'Judas', '', "", 'reference', P, ['Judas'])
    add_e(BOOK, 'magdalene', 'Magdalene', '', "", 'reference', P, ['Magdalene'])
    add_e(BOOK, 'abraham', 'Abraham', '', "", 'reference', P, ['Abraham'])
    add_e(BOOK, 'sarah', 'Sarah', '', "", 'reference', P, ['Sarah'])
    add_e(BOOK, 'rebecca', 'Rebecca', '', "", 'reference', P, ['Rebecca'])
    add_e(BOOK, 'jacob', 'Jacob', '', "", 'reference', P, ['Jacob'])
    add_e(BOOK, 'laban', 'Laban', '', "", 'reference', P, ['Laban'])
    add_e(BOOK, 'joseph', 'Joseph', '', "The tender boy sold by his brothers — Zossima's favourite story.", 'reference', P, ['Joseph'])
    add_e(BOOK, 'benjamin', 'Benjamin', '', "", 'reference', P, ['Benjamin'])
    add_e(BOOK, 'esther', 'Esther', '', "", 'reference', P, ['Esther'])
    add_e(BOOK, 'vashti', 'Vashti', '', "", 'reference', P, ['Vashti'])
    add_e(BOOK, 'jonah', 'Jonah', '', "", 'reference', P, ['Jonah'])
    add_e(BOOK, 'balaam', 'Balaam', '', "Balaam's ass — Fyodor's name for Smerdyakov when he suddenly speaks.", 'reference', P, ['Balaam'])
    add_e(BOOK, 'adam', 'Adam', '', "", 'reference', P, ['Adam'], only_paragraphs={(76, 49)})


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Crime and Punishment (Garnett): clickable-names pass.

Aliases for the everyday forms the existing 19 cards missed (Rodion,
Sofya, Dmitri Prokofitch, Arkady Ivanovitch, Andrey Semyonovitch,
Nikolay, Polya, Pashenka...) and ~70 new cards: Marfa Petrovna, Nikodim
Fomitch, the Marmeladov children, Amalia the landlady under all four of
her names, Koch and Pestryakov, the witnesses and creditors, the
Lazarus reading, the allusions.

Homonyms split: Dmitri (Razumihin) vs Dmitri the house-painter (Mitka);
Karl at Luise Ivanovna's vs "Karl from the chemist's"; Philip the
servant who hanged himself vs Philip the waiter.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases
from add_aliases_restricted import add_aliases_restricted

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'crime-and-punishment'
P = 'person'
_ED = json.loads((ROOT / f'app/public/data/editions/{BOOK}-original-en.json').read_text())
_PARAS = [(c['number'], i, p) for c in _ED['chapters'] for i, p in enumerate(c['paragraphs'])]


def chapters(*chs):
    return {(ch, i) for ch, i, p in _PARAS if ch in chs}


def r(eid, name, subtitle, body, aliases, role='reference', **kw):
    add_e(BOOK, eid, name, subtitle, body, role, P, aliases, **kw)


def main():
    # ---- splits first ----------------------------------------------------
    r('mitka', 'Mitka', 'House-painter', "Dmitri, Nikolay's fellow painter, with whom he was larking on the stairs at the hour of the murder.", ['Mitka', 'Dmitri'], only_paragraphs=chapters(7, 11, 26))
    r('karl-porter', 'Karl', "Porter at Luise Ivanovna's", "", ['Karl'], only_paragraphs=chapters(8))
    r('karl-chemist', "Karl from the chemist's", '', "The subject of Katerina Ivanovna's story of the cabman.", ['Karl'], only_paragraphs=chapters(28))
    r('philip-servant', 'Philip', "Svidrigaïlov's servant", "Died of ill-treatment — or hanged himself — in the Svidrigaïlovs' house.", ['Philip'], only_paragraphs=chapters(22))
    r('philip-waiter', 'Philip', 'Waiter', "At the tavern where Svidrigaïlov drinks with Raskolnikov.", ['Philip'], only_paragraphs=chapters(34, 35))

    # ---- aliases on existing cards ---------------------------------------
    add_aliases(BOOK, 'raskolnikov', ['Rodion'])
    add_aliases(BOOK, 'sonya', ['Sofya'])
    add_aliases_restricted(BOOK, 'razumikhin', ['Dmitri Prokofitch', 'Vrazumihin', 'Razsudkin', 'Dmitri'], exclude_paragraphs=chapters(7, 11, 26))
    add_aliases(BOOK, 'svidrigailov', ['Arkady Ivanovitch', 'Arkady'])
    add_aliases(BOOK, 'marmeladov', ['Semyon Zaharovitch'])
    add_aliases(BOOK, 'lebezyatnikov', ['Andrey Semyonovitch'])
    add_aliases(BOOK, 'nikolai', ['Nikolay Dementyev', 'Nikolay'])
    add_aliases(BOOK, 'nastasya', ['Nastasya Petrovna', 'Nastasya Nikiforovna'])
    add_aliases(BOOK, 'zamyotov', ['Alexandr Grigorievitch'])
    add_aliases(BOOK, 'polenka', ['Polya'])
    add_aliases(BOOK, 'porfiry', ['Porfiry Petrovitch'])

    # ---- new cards -------------------------------------------------------
    r('marfa-petrovna', 'Marfa Petrovna', "Svidrigaïlov's wife", "Who slandered Dounia, then cleared her; dead in the country, and reappearing to her husband.", ['Marfa Petrovna'], role='major')
    r('nikodim-fomitch', 'Nikodim Fomitch', 'Police superintendent', "The affable district superintendent.", ['Nikodim Fomitch', 'Mr. Captain'], role='supporting')
    r('lida', 'Lida', "Katerina Ivanovna's daughter", "The youngest, Marmeladov's favourite.", ['Lida'], role='supporting')
    r('kolya', 'Kolya', "Katerina Ivanovna's son", "", ['Kolya'], role='supporting')
    r('amalia-ivanovna', 'Amalia Ivanovna', 'Landlady', "Amalia Lippevechsel — Fyodorovna, Ivanovna or Ludwigovna, depending on who is angry with her.", ['Amalia Fyodorovna Lippevechsel', 'Amalia Lippevechsel', 'Madame Lippevechsel', 'Amalia Ludwigovna', 'Amalia Ivanovna', 'Amalia Fyodorovna', 'Lippevechsel', 'Amalia', 'Ludwigovna'], role='supporting')
    r('koch', 'Koch', 'Witness', "The visitor who rang at the pawnbroker's door while Raskolnikov stood inside.", ['Koch'], role='supporting')
    r('pestryakov', 'Pestryakov', 'Student', "Came up the stairs with Koch.", ['Pestryakov'])
    r('kapernaumov', 'Kapernaumov', 'Tailor', "Sonia's lame, cleft-palated landlord.", ['Kapernaumovs', 'Kapernaumov'])
    r('tchebarov', 'Tchebarov', 'Business man', "Bought Raskolnikov's I O U from the landlady.", ['Tchebarov'])
    r('dushkin', 'Dushkin', 'Dram-shop keeper', "The pawnbroker-publican who brought the earrings to the police.", ['Dushkin'])
    r('resslich', 'Madame Resslich', "Svidrigaïlov's landlady", "A foreigner who lent small sums; her deaf-and-dumb niece hanged herself.", ['Madame Resslich', 'Resslich'])
    r('vahrushin', 'Vahrushin', 'Merchant', "Through whom Pulcheria Alexandrovna sends Raskolnikov money.", ['Afanasy Ivanovitch Vahrushin', 'Vassily Ivanovitch Vahrushin', 'Vahrushin', 'Afanasy Ivanovitch', 'Afanasy Ivanitch'])
    r('darya-frantsovna', 'Darya Frantsovna', '', "A woman of evil character who pressed Sonia into the trade.", ['Darya Frantsovna'])
    r('bakaleyev', 'Bakaleyev', '', "Whose house holds the lodgings Razumihin finds for the ladies.", ['Bakaleyev'])
    r('ivan-afanasyvitch', 'Ivan Afanasyvitch', 'His Excellency', "Who took Marmeladov back into the service.", ['Ivan Afanasyvitch'])
    r('semyon-semyonovitch', 'Semyon Semyonovitch', 'Merchant', "", ['Semyon Semyonovitch'])
    r('shelopaev', 'Shelopaev', 'Merchant', "", ['Shelopaev'])
    r('alexey-semyonovitch', 'Alexey Semyonovitch', 'Clerk', "", ['Alexey Semyonovitch'])
    r('zarnitsyn', 'Zarnitsyn', "Assessor's widow", "", ['Zarnitsyn'])
    r('heruvimov', 'Heruvimov', 'Bookseller', "", ['Heruvimov'])
    r('harlamov', 'Harlamov', '', "Whose house was really Buch's.", ['Harlamov', 'Buch'])
    r('praskovya-pavlovna', 'Praskovya Pavlovna', "Raskolnikov's landlady", "Pashenka, whose dead daughter he had promised to marry.", ['Praskovya Pavlovna', 'Pashenka'], role='supporting')
    r('natalya-yegorovna', 'Natalya Yegorovna', "The landlady's daughter", "", ['Natalya Yegorovna'])
    r('pokorev', 'Pokorev', 'Student', "", ['Pokorev'])
    r('tolstyakov', 'Tolstyakov', '', "", ['Tolstyakov'])
    r('kryukov', 'Kryukov', '', "", ['Kryukov'])
    r('yushin', 'Yushin', 'Merchant', "", ['Yushin'])
    r('tit-vassilitch', 'Tit Vassilitch', '', "", ['Tit Vassilitch'])
    r('ivan-mihailovitch', 'Ivan Mihailovitch', "Katerina Ivanovna's father", "", ['Ivan Mihailovitch'])
    r('luise-ivanovna', 'Luise Ivanovna', 'Brothel-keeper', "", ['Luise Ivanovna', 'Luise'])
    r('henriette', 'Henriette', '', "", ['Henriette'])
    r('vasya', 'Vasya', 'Messenger boy', "", ['Vasya'])
    r('aniska', 'Aniska', 'Dressmaker', "", ['Aniska'])
    r('svirbey', 'Prince Svirbey', '', "", ['Prince Svirbey', 'Svirbey'])
    r('mangot', 'Mangot', 'French teacher', "", ['Mangot'])
    r('fedosya', 'Fedosya', 'Cook', "", ['Fedosya'])
    r('parasha', 'Parasha', 'Country girl', "", ['Parasha'])
    r('terebyeva', 'Terebyeva', '', "", ['Terebyeva'])
    r('klopstock', 'Klopstock', 'Ivan Ivanitch', "The civil counsellor who would not pay for the shirts.", ['Ivan Ivanitch Klopstock', 'Klopstock', 'Ivan Ivanitch'])
    r('afanasy-pavlovitch', 'Afanasy Pavlovitch', '', "", ['Afanasy Pavlovitch'])
    r('achilles', 'Achilles', 'The watchman', "The Jewish watchman in the copper helmet who witnesses Svidrigaïlov's end.", ['Achilles'], role='supporting')
    r('berg', 'Berg', 'Balloonist', "", ['Berg'])
    r('general-mack', 'General Mack', '', "", ['General Mack', 'Mack'])
    r('martha', 'Martha', 'Sister of Lazarus', "", ['Martha'])
    r('mary-of-bethany', 'Mary', 'Sister of Lazarus', "", ['Mary'])
    r('lazarus', 'Lazarus', '', "The raising of Lazarus, which Sonia reads to Raskolnikov.", ['Lazarus'], role='supporting')
    r('jesus', 'Jesus', '', "", ['Jesus'])
    r('napoleon', 'Napoleon', '', "The extraordinary man of Raskolnikov's article.", ['Napoleon'], role='supporting')
    r('lycurgus', 'Lycurgus', '', "", ['Lycurgus'])
    r('mahomet', 'Mahomet', '', "", ['Mahomet'])
    r('pushkin', 'Pushkin', '', "", ['Pushkin'])
    r('gogol', 'Gogol', '', "", ['Gogol'])
    r('rousseau', 'Rousseau', '', "", ['Rousseau'])
    r('radishchev', 'Radishchev', '', "", ['Radishchev'])
    r('fourier', 'Fourier', '', "", ['Fourier'])
    r('schiller', 'Schiller', '', "", ['Schiller'])
    r('newton', 'Newton', '', "", ['Newton'])
    r('kepler', 'Kepler', '', "", ['Kepler'])
    r('raphael', 'Raphael', '', "", ['Raphael'])


if __name__ == '__main__':
    main()

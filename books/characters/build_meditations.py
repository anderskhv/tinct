import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble, main as run

BASE = Path(__file__).resolve().parent / 'meditations'


def bind(edition, ch, pi, text, entities):
    out = exact(edition, ch, pi, text, entities)

    # "Verus" names two different men with no shared global alias: Marcus's
    # paternal grandfather (1:0, the book's opening line) and Marcus's own
    # father (8:23, in the "Lucilla buried Verus" couplet). Bound only here.
    if (ch, pi) == (1, 0):
        for m in re.finditer(r'(?<!\w)Verus(?!\w)', text):
            out.append((m.start(), m.end(), 'verus-grandfather', 'reviewed-context'))
    if (ch, pi) == (8, 23):
        for m in re.finditer(r'(?<!\w)Verus(?!\w)', text):
            out.append((m.start(), m.end(), 'verus-father', 'reviewed-context'))

    # "Cato" names two different problems, not two resolvable people: 1:10's
    # bare "Cato" is unambiguous in context (grouped with Thrasea, Helvidius,
    # Dio, Brutus -- the standard libertas roll-call), so it alone is bound.
    # 4:27's bare "Cato" (and, separately, its bare "Scipio") sit in an
    # undifferentiated list with no distinguishing epithet and no scholarly
    # consensus; both stay unbound there rather than guessed.
    if (ch, pi) == (1, 10):
        for m in re.finditer(r'(?<!\w)Cato(?!\w)', text):
            out.append((m.start(), m.end(), 'cato-the-younger', 'reviewed-context'))

    # "Severus" names Marcus's teacher-"brother" at 1:10, but a second bare
    # "Severus" in Book 10's private list of namesakes (10:29) has nothing in
    # its context tying it back to that figure, so it is left unbound.
    if (ch, pi) == (1, 10):
        for m in re.finditer(r'(?<!\w)Severus(?!\w)', text):
            out.append((m.start(), m.end(), 'severus-brother', 'reviewed-context'))

    # "Maximus" names two different men. Claudius Maximus (the Book 1
    # teacher) is named in full only once (1:11); the bare form recurs at
    # 1:12 and 1:13 referring back to him. A wholly different, unrelated
    # "Maximus" -- a household figure paired with "Secunda" -- appears once
    # at 8:23. Neither entity carries a global bare-"Maximus" alias.
    if (ch, pi) in ((1, 12), (1, 13)):
        for m in re.finditer(r'(?<!\w)Maximus(?!\w)', text):
            out.append((m.start(), m.end(), 'claudius-maximus', 'reviewed-context'))
    if (ch, pi) == (8, 23):
        for m in re.finditer(r'(?<!\w)Maximus(?!\w)', text):
            out.append((m.start(), m.end(), 'maximus-household', 'reviewed-context'))

    # "Antoninus" (bare, without "Pius") names Marcus's father once more at
    # 8:23 -- a backward reference within the same sentence that first says
    # "Antoninus Pius" in full ("So Antoninus Pius, Faustina his wife; then
    # Antoninus himself"). Elsewhere (6:22, 6:35) bare "Antoninus" is Marcus
    # referring to himself; per editorial policy, a treatise's author is not
    # cast as a character, so those two self-references are deliberately
    # left unbound and antoninus-pius carries no global bare-name alias.
    if (ch, pi) == (8, 23):
        for m in re.finditer(r'(?<!\w)Antoninus(?!\w)', text):
            out.append((m.start(), m.end(), 'antoninus-pius', 'reviewed-context'))

    return out


def compile_package():
    return assemble('meditations', bind)


if __name__ == '__main__':
    run('meditations', 'Meditations', bind)

import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble, main as run

BASE = Path(__file__).resolve().parent / 'walden'


def bind(edition, ch, pi, text, entities):
    out = exact(edition, ch, pi, text, entities)

    # "Cato" names two different men with no shared global alias: Cato the
    # Elder, the Roman agricultural writer quoted for farming advice
    # (1:102, 2:6, 7:19, 13:5), and Cato Ingraham, the formerly enslaved
    # Concord resident of Chapter 14 (14:1, three times, and 14:11) --
    # whom the text itself disambiguates from the Roman Cato of Utica in
    # the same breath. cato-ingraham carries no global alias.
    if (ch, pi) in ((14, 1), (14, 11)):
        out = [m for m in out if m[2] != 'cato-elder']
        for m in re.finditer(r'(?<!\w)Cato(?!\w)', text):
            out.append((m.start(), m.end(), 'cato-ingraham', 'reviewed-context'))

    # "Nutting" names two different people: a bare-surname former-
    # inhabitant family in Chapter 14 (14:8, no global alias -- see
    # nutting-le-grosse) and Sam Nutting, the bear-hunter of Chapter 15,
    # introduced by full name at 15:10 and then referred to again by bare
    # surname later in the same paragraph. The bare backward reference
    # would otherwise collide with the Chapter 14 family's surname; both
    # "Nutting"s in 15:10 are bound here (the one inside "Sam Nutting" is
    # a redundant, fully-contained match that the assembler silently
    # drops in favor of the longer global-alias span).
    if (ch, pi) == (14, 8):
        for m in re.finditer(r'(?<!\w)Nutting(?!\w)', text):
            out.append((m.start(), m.end(), 'nutting-le-grosse', 'reviewed-context'))
    if (ch, pi) == (15, 10):
        for m in re.finditer(r'(?<!\w)Nutting(?!\w)', text):
            out.append((m.start(), m.end(), 'sam-nutting', 'reviewed-context'))

    # "Stratton" names two different people, resolved the same way as
    # Nutting above: the bare-surname former-inhabitant family of Chapter
    # 14 (14:0, 14:4 -- see stratton-family) and Hezekiah Stratton, named
    # in full in the Chapter 15 ledger excerpt (15:10) and then referred
    # to again by bare surname later in the same sentence.
    if (ch, pi) in ((14, 0), (14, 4)):
        for m in re.finditer(r'(?<!\w)Stratton(?!\w)', text):
            out.append((m.start(), m.end(), 'stratton-family', 'reviewed-context'))
    if (ch, pi) == (15, 10):
        for m in re.finditer(r'(?<!\w)Stratton(?!\w)', text):
            out.append((m.start(), m.end(), 'hezekiah-stratton', 'reviewed-context'))

    # "Atropos" is printed italicized with underscores ("_Atropos_"),
    # and underscore is a \w character, so the word-boundary-safe alias
    # regex can never match it (the lookbehind/lookahead both see a
    # word character). Matched here directly, binding only the inner
    # word so the mention text reads "Atropos," not "_Atropos_".
    if (ch, pi) == (4, 10):
        for m in re.finditer(r'_Atropos_', text):
            out.append((m.start() + 1, m.end() - 1, 'atropos', 'reviewed-context'))

    # "Say" is a common-word collision, not a namesake one: Jean-Baptiste
    # Say, the economist named once alongside Adam Smith and Ricardo
    # (1:79), shares his surname with the ordinary English verb "say,"
    # which the text also capitalizes at two sentence-openings (12:1,
    # 18:16). say-economist carries no global alias at all.
    if (ch, pi) == (1, 79):
        for m in re.finditer(r'(?<!\w)Say(?!\w)', text):
            out.append((m.start(), m.end(), 'say-economist', 'reviewed-context'))

    return out


def compile_package():
    return assemble('walden', bind)


if __name__ == '__main__':
    run('walden', 'Walden', bind)

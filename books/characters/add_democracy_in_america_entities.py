#!/usr/bin/env python3
"""Democracy in America: clickable-names pass.

Minimal cards for everyone Tocqueville names or cites: the jurists
(Story, Kent, Marshall, Blackstone), the reports (Clarke and Cass, Bell,
Carey, Pitkin, Tanner, Malte Brun, Charlevoix, Nathaniel Morton,
Hutchinson, Beverley), the French kings and thinkers (Louis XI/XIV/XV,
Pascal, Descartes, Montesquieu, Lafayette, Napoleon), the American
statesmen not yet carded (Franklin, Monroe, Quincy Adams, Calhoun,
Clay, Jay, Lincoln) and the founders' contemporaries.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases

BOOK = 'democracy-in-america'
P = 'person'


def r(eid, name, subtitle, body, aliases, **kw):
    kw.setdefault('strict_editions', ())
    add_e(BOOK, eid, name, subtitle, body, 'reference', P, aliases, **kw)


def main():
    add_aliases(BOOK, 'george-washington', ['Washington'])
    add_aliases(BOOK, 'thomas-jefferson', ['Jefferson'])
    add_aliases(BOOK, 'andrew-jackson', ['General Jackson', 'Jackson'])
    add_aliases(BOOK, 'alexander-hamilton', ['Hamilton'])
    add_aliases(BOOK, 'james-madison', ['Madison'])
    r('judge-story', 'Mr. Story', 'Justice of the Supreme Court', "Whose Commentaries on the Constitution Tocqueville cites throughout.", ['Mr. Story', 'Story'])
    r('chancellor-kent', 'Chancellor Kent', "Kent's Commentaries", "", ['Chancellor Kent', 'Kent'])
    r('chief-justice-marshall', 'Marshall', 'Life of Washington', "", ['Marshall'])
    r('blackstone', 'Blackstone', '', "", ['Blackstone'])
    r('clarke-and-cass', 'Clarke and Cass', 'Report to Congress, 1829', "Lewis Cass, later Secretary of War, on the Indian tribes.", ['Messrs. Clarke and Cass', 'Mr. Cass', 'Clarke', 'Cass'])
    r('mr-bell', 'Mr. Bell', 'Committee on Indian Affairs', "", ['Mr. Bell', 'John Bell', 'Bell'])
    r('mr-carey', 'Mr. Carey', 'Letters on the Colonization Society', "", ['Mr. Carey', 'Carey'])
    r('pitkin', 'Pitkin', 'Historian', "", ['Pitkin'])
    r('tanner', 'Tanner', "Tanner's Narrative", "", ['Tanner'])
    r('malte-brun', 'Malte Brun', 'Geographer', "", ['Malte Brun', 'Malte-Brun'])
    r('charlevoix', 'Charlevoix', 'Historian of New France', "", ['Charlevoix'])
    r('nathaniel-morton', 'Nathaniel Morton', "New England's Memorial", "", ['Nathaniel Morton', 'Morton'])
    r('hutchinson', 'Hutchinson', 'History of Massachusetts', "", ['Hutchinson'])
    r('beverley', 'Beverley', 'History of Virginia', "", ['Beverley'])
    r('winthrop', 'Winthrop', '', "", ['Winthrop'])
    r('cotton-mather', 'Cotton Mather', '', "", ['Cotton Mather', 'Mather'])
    r('captain-smith', 'Smith', 'History of Virginia', "", ['Smith'])
    r('williams-register', "Williams' Register", '', "", ['Williams'])
    r('penn', 'Penn', '', "", ['Penn'])
    r('franklin', 'Franklin', '', "", ['Franklin'])
    r('lafayette', 'Lafayette', '', "", ['Lafayette'])
    r('monroe', 'Monroe', '', "", ['Monroe'])
    r('john-quincy-adams', 'John Quincy Adams', '', "", ['Quincy Adams'])
    r('calhoun', 'Calhoun', '', "", ['Calhoun'])
    r('henry-clay', 'Mr. Clay', '', "", ['Mr. Clay', 'Clay'])
    r('john-jay', 'Jay', '', "", ['Jay'])
    r('everett', 'Everett', '', "", ['Everett'])
    r('lincoln', 'Lincoln', '', "The translator's note on the election of 1860.", ['Mr. Lincoln', 'President Lincoln', 'Lincoln'])
    r('louis-xi', 'Louis XI', '', "", ['Louis XI'])
    r('louis-xiv', 'Louis XIV', '', "", ['Louis XIV'])
    r('louis-xv', 'Louis XV', '', "", ['Louis XV'])
    r('charles-i', 'Charles I', '', "", ['Charles I'])
    r('charles-ii', 'Charles II', '', "", ['Charles II'])
    r('henry-iv', 'Henry IV', '', "", ['Henry IV'])
    r('henry-viii', 'Henry VIII', '', "", ['Henry VIII'])
    r('elizabeth', 'Elizabeth', '', "", ['Elizabeth'])
    r('napoleon', 'Napoleon', '', "", ['Napoleon', 'Bonaparte'])
    r('pascal', 'Pascal', '', "", ['Pascal'])
    r('descartes', 'Descartes', '', "", ['Descartes'])
    r('montesquieu', 'Montesquieu', '', "", ['Montesquieu'])
    r('voltaire', 'Voltaire', '', "", ['Voltaire'])
    r('bacon', 'Bacon', '', "", ['Bacon'])
    r('volney', 'Volney', '', "", ['Volney'])
    r('luther', 'Luther', '', "", ['Luther'])
    r('raphael', 'Raphael', '', "", ['Raphael'])
    r('labruyere', 'Labruyere', '', "", ['Labruyere', 'La Bruyère'])
    r('racine', 'Racine', '', "", ['Racine'])
    r('moliere', 'Moliere', '', "", ['Moliere', 'Molière'])
    r('milton', 'Milton', '', "", ['Milton'])
    r('shakespeare', 'Shakespeare', '', "", ['Shakespeare'])
    r('plato', 'Plato', '', "", ['Plato'])
    r('socrates', 'Socrates', '', "", ['Socrates'])
    r('cicero', 'Cicero', '', "", ['Cicero'])
    r('caesar', 'Caesar', '', "", ['Caesar'])
    r('alexander', 'Alexander', '', "", ['Alexander'])
    r('jesus-christ', 'Jesus Christ', '', "", ['Jesus Christ', 'Christ', 'Jesus'])
    r('abraham', 'Abraham', '', "", ['Abraham'])
    r('tocqueville', 'Tocqueville', 'The author', "", ['Tocqueville'])


if __name__ == '__main__':
    main()

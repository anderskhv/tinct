"""Manually authored recognition identities for The Death of Ivan Ilyich."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('ivan','Ivan Ilyich Golovin','central','The judge whose life and death the novella follows; Praskovya Fedorovna’s husband.','Ivan Ilych Golovin|Ivan Ilyich Golovin|Ivan Ilych|Ivan Ilyich|Vanya|Jean')
C('praskovya','Praskovya Fedorovna','major','Ivan Ilyich’s wife and the mother of Lisa and Vasya.','Praskovya Fedorovna Golovina|Praskovya Fedorovna Mikhel|Praskovya Fedorovna|Praskoyva Fedorovna|Praskovya Fyodorovna|Praskovya')
C('gerasim','Gerasim','major','The young assistant to the Golovins’ butler, who also nurses Ivan Ilyich.','Gerasim')
C('peter-ivanovich','Peter Ivanovich','major','Ivan Ilyich’s colleague and old friend from law school.','Peter Ivanovich')
C('lisa','Lisa','supporting','Ivan Ilyich and Praskovya Fedorovna’s daughter.','Lisa')
C('vasya','Vasya','supporting','Ivan Ilyich and Praskovya Fedorovna’s schoolboy son.','Vasya|Vladimir Ivanovich')
C('petrishchev','Fedor Petrovich Petrishchev','supporting','The young examining magistrate engaged to Lisa; Dmitri Ivanovich Petrishchev’s son.','Fedor Petrovich|Petrishchev')
C('petrishchev-father','Dmitri Ivanovich Petrishchev','reference','The father of Fedor Petrovich, Lisa’s suitor.','Dmitri Ivanovich Petrishchev')
C('shebek','Ivan Egorovich Shebek','supporting','A colleague of Ivan Ilyich at the law courts.','Ivan Egorovich Shebek|Ivan Egorovich|Shebek')
C('fedor','Fedor Vasilievich','supporting','A colleague of Ivan Ilyich and one of his closer acquaintances.','Fedor Vasilievich')
C('schwartz','Schwartz','supporting','A colleague and card-playing acquaintance of Ivan Ilyich and Peter Ivanovich.','Schwartz')
C('sokolov','Sokolov','supporting','The Golovins’ butler, senior to Gerasim.','Sokolov')
C('peter-footman','Peter','supporting','A footman in Ivan Ilyich’s household.','Peter')
C('dmitri','Dmitri','reference','A servant in Ivan Ilyich’s household.','Dmitri')
C('ilya','Ilya Epimovich Golovin','reference','Ivan Ilyich’s father, a senior government official.','Ilya Epimovich Golovin|Ilya Epimovich')
C('greff','Baron Greff','reference','The government official married to Ivan Ilyich’s sister.','Baron Greff|Greff')
C('sister','Ivan Ilyich’s sister','reference','Ivan Ilyich’s sister, married to Baron Greff.','','unnamed-person')
C('brother-in-law','Praskovya’s brother','supporting','Praskovya Fedorovna’s brother, Ivan Ilyich’s brother-in-law.','','unnamed-person')
for id,name,body in [
 ('alexeev','Alexeev','A court official considered for Ivan Ilyich’s position.'),
 ('vinnikov','Vinnikov','A court official mentioned in the discussion of possible promotions.'),
 ('shtabel','Shtabel','A court official mentioned in the discussion of possible promotions.'),
 ('happe','Happe','The official who receives the judicial appointment Ivan Ilyich had expected.'),
 ('ilyin','F. I. Ilyin','Ivan Ilyich’s acquaintance, who brings news of changes at the ministry.'),
 ('minister-peter','Peter Ivanovich, the ministry official','The official being replaced in the ministry; distinct from Ivan Ilyich’s friend of the same name.'),
 ('ivan-semonovich','Ivan Semonovich','The official expected to replace Peter Ivanovich at the ministry.'),
 ('peter-petrovich','Peter Petrovich','An official whose advancement helps Ivan Ilyich’s prospects.'),
 ('zachar','Zachar Ivanovich','Ivan Ilyich’s friend and colleague, able to help him obtain an appointment.'),
 ('miller','Miller','The official whose position Zachar Ivanovich takes.'),
 ('trufonova','Princess Trufonova','A fashionable guest with whom Ivan Ilyich dances.'),
 ('mikhail','Mikhail Mikhaylovich','Ivan Ilyich’s bridge partner.'),
 ('nikolaevich','Nikolaevich','One of the doctors whose opinions on Ivan Ilyich’s illness are discussed.'),
 ('leshchetitsky','Leshchetitsky','The celebrated medical specialist whom Praskovya proposes consulting.'),
 ('michael','Michael Danilovich','The doctor attending Ivan Ilyich during his illness.')]:
 aliases={'ilyin':'F. I. Ilyin|Ilyin','minister-peter':'','zachar':'Zachar Ivanovich|Sachar Ivanovich|Zachar','trufonova':'Princess Trufonova|Trufonova'}.get(id,name)
 C(id,name,'reference' if id not in {'michael','leshchetitsky'} else 'supporting',body,aliases)
C('specialist','The visiting specialist','supporting','The doctor brought in to consult with Michael Danilovich.','','unnamed-person')
C('helen','Helen','reference','A companion joining the family’s theater outing; her relationship to them is not specified.','Helen')
C('mitya','Mitya','reference','A person in Ivan Ilyich’s childhood memories; the passage does not specify the relationship.','Mitya')
C('volodya','Volodya','reference','A person in Ivan Ilyich’s childhood memories; the passage does not specify the relationship.','Volodya')
C('katenka','Katenka','reference','A woman in Ivan Ilyich’s memories of his youth; no further identity is given.','Katenka')
C('scharmer','Scharmer','reference','The fashionable tailor from whom Ivan Ilyich buys his clothes.','Scharmer')
C('marya','Empress Marya','reference','The Russian empress whose name is borne by the charitable and educational institutions mentioned here.','Empress Marya')
C('zola','Émile Zola','reference','The French novelist whose work Ivan Ilyich tries to read.','Zola')
C('kiesewetter','Kiesewetter','reference','The German philosopher and author of the logic textbook Ivan Ilyich remembers.','Kiesewetter')
C('caius','Caius','reference','The example of a mortal man used in the logic textbook’s argument.','Caius','hypothetical-figure')
C('bernhardt','Sarah Bernhardt','reference','The celebrated French stage actress the family plans to see.','Sarah Bernhardt|Bernhardt')
C('capoul','Capoul','reference','The French tenor Victor Capoul, whose hairstyle Fedor Petrovich imitates.','Capoul')
C('adrienne','Adrienne Lecouvreur','reference','The French actress whose life is dramatized in the play discussed by the theatergoers.','Adrienne Lecouvreur')
C('reader','The Church Reader','supporting','The man reading aloud during the funeral service.','Church Reader|Reader','unnamed-role')
C('priest','The priest','supporting','The priest conducting religious rites for the family.','','unnamed-role')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='ivan-ilyich',contentVersion='2026-09-10.1',coverage='Complete novella in both English editions: named people, contextual household roles and named cultural references. Shared names are resolved by passage; hypothetical legal cases and commercial place names excluded.',entities=entities),ensure_ascii=False,indent=2)+'\n')

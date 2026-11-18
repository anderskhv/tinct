"""Local meaning/wording fixes (live numbering = reviewer/source numbering + 1; 0-based paragraph index)."""
from edits import apply

EDITS = [
    # proper noun damaged by the spelling pass (Earl Grey, the Prime Minister)
    (36, 52, 'Lord Gray took office', 'Lord Grey took office'),
    (47, 5, 'I’d support Gray.”', 'I’d support Grey.”'),
    (47, 7, 'I’d support Gray, you know', 'I’d support Grey, you know'),
    (47, 7, 'think Gray would either', 'think Grey would either'),
    # 29:11 -> live 30:11 Macbeth allusion
    (30, 11, 'Pity, that newborn child which would eventually master so many storms within her, did not ride the wind on this occasion.',
     'Pity, that “new-born babe” which was by-and-by to rule many a storm within her, did not “stride the blast” on this occasion.'),
    # 87:24 -> live 88:24 Finale
    (88, 24, 'Her sensitive spirit still produced fine effects, although few people saw them.',
     'Her finely touched spirit had still its fine issues, though they were not widely visible.'),
    (88, 24, 'The world’s growing goodness depends partly on acts that history never records.',
     'The growing good of the world depends partly on unhistoric acts.'),
    # 67:15-16 -> live 68:15-16
    (68, 15, '“I’m afraid it will be almost impossible to replace that loss to the Hospital.”',
     '“I fear the loss to the Hospital can hardly be made up.”'),
    (68, 16, '“Almost,” Bulstrode agreed', '“Hardly,” Bulstrode agreed'),
    # 72:7 -> live 73:7 Nemesis
    (73, 7, 'But some errors carry a terrible punishment: anyone who chooses can interpret them as crimes.',
     'But there is the terrible Nemesis that follows some errors: anyone who chooses can interpret them as crimes.'),
    # 46:5 -> live 47:5 period term
    (47, 5, 'work for the emancipation of enslaved black people, reform the criminal law, that sort of thing.',
     'work at Negro Emancipation, Criminal Law, that sort of thing.'),
    # 46:8 -> live 47:8 Reform argument
    (47, 8, 'People want a House of Commons weighted towards representatives of interests other than those of the landowners’ nominees.',
     'The country wants a House of Commons that is not weighted with nominees of the landed class, but with representatives of the other interests.'),
    # 71:26 -> live 72:26
    (72, 26, 'went over to the Catholics.”', 'went over to the Romans.”'),
    # 71:60 -> live 72:60
    (72, 60, 'At the word “deceit,” a rising noise', 'At the word chicanery, a rising noise'),
    # 58:65 -> live 59:65
    (59, 65, '“Then I must!”', '“Then I must ask him!”'),
    # 60:20 -> live 61:20
    (61, 20, 'also “fond of indulgence.”', 'also “given to indulgence.”'),
    # 28:12 -> live 29:12
    (29, 12, 'Dorothea also looked anxiously up at her husband. Perhaps someone seeing him after an absence could detect signs she had missed.',
     'Dorothea’s eyes too were turned anxiously up to her husband’s face, at the thought that those who saw him afresh after an absence might be aware of signs she had not noticed.'),
    # 37:38 -> live 38:38
    (38, 38, 'But I proved—not suitable enough.”', 'But I turned out to be—not good enough for it.”'),
    # nits
    (61, 5, 'as though he were constantly on the alert,', 'as though he were on the _qui vive_,'),
    (74, 9, 'His general exclusion had begun.', 'The general black-balling had begun.'),
    (84, 42, '“It’s as final as murder', '“It’s as fatal as murder'),
    (56, 20, 'any specimen of good birth and good looks that she', 'any piece of blood and beauty that she'),
    (56, 21, 'good birth and good looks would make it all the better,”', 'it would be all the better to have blood and beauty,”'),
    (56, 21, 'poorly supplied with those advantages', 'poorly endowed with those gifts'),
    (80, 10, 'another pleasing association with my name to recommend me when she hears it. Still—what does it matter now?”',
     'a new ring in the sound of my name to recommend it in her hearing; however—what does it signify now?”'),
    (88, 8, '“All the more fools they!”', '“The more spooneys they!”'),
]

if __name__ == '__main__':
    apply(EDITS)

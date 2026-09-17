#!/usr/bin/env python3
"""Add real, previously-uncarded named individuals found in war-and-peace
via the spaCy PERSON-NER scan (see rank_by_cast_density.py and the
clickable-names plan) -- including many single-scene appearances, per the
"any named individual, including passing allusions" scope decision.
Bodies are minimal, one line, drawn only from what the text itself states
at or near first mention -- no external research, matching the
"minimal, templated" card-depth decision for this pass.

Two real historical Napoleonic-War generals (Dólokhov's mother's nickname
"Fédya" for her son, and several patronymic/surname forms of Pierre and
Hélène) turned out to be aliases of already-carded characters, not new
people -- see add_aliases.py calls in the pilot commit and this file's
sibling script. "Rugáy" (a hound's name) and "the Daniel Cooper" (a
country dance) were spaCy PERSON mistags, not people, and are excluded.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity

BOOK = 'war-and-peace'

ENTITIES = [
    # (id, name, body, role, aliases)
    ('bennigsen', 'Bennigsen', "A Russian general, reported early in the novel to have won a victory over Napoleon's forces at Eylau.", 'supporting', ['Bennigsen']),
    ('bilibin', 'Bilíbin', "A Russian diplomat and acquaintance of Prince Andrew's, hosting him at Brünn.", 'supporting', ['Bilíbin']),
    ('nesvitski', 'Nesvítski', "A tall, stout staff officer, Prince Andrew's comrade, known for his kindly good humor.", 'supporting', ['Nesvítski']),
    ('dolgorukov', 'Prince Dolgorúkov', "An adjutant general and friend of Borís's, close to the Emperor's circle.", 'reference', ['Dolgorúkov']),
    ('lavrushka', 'Lavrúshka', "Denísov's orderly, known throughout the regiment as a rogue.", 'reference', ['Lavrúshka']),
    ('dron', 'Dron', "The village elder at Prince Andrew's estate, Boguchárovo.", 'reference', ['Dron']),
    ('arakcheev', 'Count Arakchéev', "A Russian military figure named in conversation as one of the few capable Russian generals, though said to have weak nerves.", 'reference', ['Arakchéev']),
    ('balashev', 'Balashëv', "An Adjutant General in closest personal attendance on Tsar Alexander.", 'reference', ['Balashëv']),
    ('pfuel', 'Pfuel', "A strategist whose plans for the campaign are debated and criticized among the Russian command.", 'supporting', ['Pfuel']),
    ('willarski', 'Count Willarski', "A fellow Freemason who gives Pierre a letter of introduction to carry to Petersburg.", 'reference', ['Willarski']),
    ('dokhturov', 'General Dokhtúrov', "A Russian general named as one of the few capable commanders, alongside Milorádovich.", 'supporting', ['Dokhtúrov']),
    ('wolzogen', 'Wolzogen', "An officer on the imperial staff at Vílna.", 'reference', ['Wolzogen']),
    ('ilyin', 'Ilyín', "A young officer of the Pávlograd hussars serving under Rostóv.", 'supporting', ['Ilyín']),
    ('suvorov', 'Field Marshal Suvórov', "A celebrated Russian general of an earlier generation, invoked in conversation as a model soldier.", 'reference', ['Suvórov']),
    ('timokhin', 'Captain Timókhin', "A red-nosed infantry captain, reprimanded for wearing a blue greatcoat, whom Prince Andrew greets warmly.", 'supporting', ['Timókhin']),
    ('michaud', 'Colonel Michaud', "A colonel in Russian service who brings headquarters news of Napoleon's movements.", 'reference', ['Michaud']),
    ('zherkov', 'Zherkóv', "A hussar cornet who once belonged to Dólokhov's wild set in Petersburg.", 'supporting', ['Zherkóv']),
    ('kozlovski', 'Kozlóvski', "A staff officer whom Kutúzov instructs to gather the scouts' reports.", 'reference', ['Kozlóvski']),
    ('raevski', 'General Raévski', "A Russian general praised for his exploits in battle.", 'supporting', ['Raévski']),
    ('ramballe', 'Ramballe', "A French captain of the 13th Light Regiment whose life Pierre saves, and with whom he later shares a meal.", 'supporting', ['Ramballe']),
    ('konovnitsyn', 'Konovnítsyn', "A general who brings Kutúzov dispatches during the campaign.", 'reference', ['Konovnítsyn']),
    ('vereshchagin', 'Vereshchágin', "A Moscow tradesman's son, accused in connection with a seditious proclamation.", 'supporting', ['Vereshchágin']),
    ('rostopchin', 'Count Rostopchín', "The governor of Moscow, one of the men who set the tone of conversation in society circles there.", 'supporting', ['Rostopchín']),
    ('dessalles', 'M. Dessalles', "A Swiss tutor old Prince Bolkónski brings from abroad for his grandson.", 'reference', ['Dessalles']),
    ('mitenka', 'Mítenka', "The steward managing the Rostóv estate's affairs at Otrádnoe.", 'supporting', ['Mítenka']),
    ('mavra-kuzminichna', 'Mávra Kuzmínichna', "The Rostóvs' former housekeeper.", 'supporting', ['Mávra Kuzmínichna']),
    ('shinshin', 'Shinshín', "An old bachelor and cousin of Countess Rostóva, known for his sharp tongue.", 'supporting', ['Shinshín']),
    ('vyazmitinov', 'Sergéy Kuzmích Vyazmítinov', "The new military governor general of Petersburg.", 'reference', ['Vyazmítinov', 'Sergéy Kuzmích']),
    ('julie-karagina', 'Julie Karágina', "A family friend of the Rostóvs and one of Nicholas's correspondents.", 'supporting', ['Julie Karágina', 'Julie']),
    ('lorrain', 'Dr. Lorrain', "The physician attending old Count Bezúkhov, Pierre's father, in his final illness.", 'reference', ['Lorrain']),
    ('langeron', 'Count Langeron', "A general in Russian service, part of the discussion before the coming battle.", 'reference', ['Langeron']),
    ('magnitski', 'Monsieur Magnítski', "Chairman of the Committee on Army Regulations, mentioned by Speránski.", 'reference', ['Magnítski']),
    ('buxhowden', 'General Buxhöwden', "A Russian general reported to be in a difficult position during the campaign.", 'reference', ['Buxhöwden']),
    ('kaysarov', 'Kaysárov', "Kutúzov's adjutant.", 'reference', ['Kaysárov']),
    ('de-beausset', 'M. de Beausset', "Prefect of Napoleon's palace, who arrives at Napoleon's headquarters before the battle of Borodinó.", 'reference', ['de Beausset']),
    ('wintzingerode', 'Wintzingerode', "A general named in a joking remark about capturing the King of Prussia's consent.", 'reference', ['Wintzingerode']),
    ('schmidt', 'General Schmidt', "An Austrian general killed in action; Prince Andrew had been in attendance on him during the battle.", 'reference', ['Schmidt']),
    ('zakhar', 'Zakhár', "A Moscow cabman Nicholas remembers fondly from his youth.", 'reference', ['Zakhár']),
    ('dimmler', 'Dimmler', "A musician living almost as a member of the Rostóv household.", 'supporting', ['Dimmler']),
    ('ney', 'Marshal Ney', "One of Napoleon's marshals.", 'reference', ['Ney']),
    ('morel', 'Morel', "Ramballe's orderly.", 'reference', ['Morel']),
    ('bogdanich', 'Bogdánich', "The nickname used in the regiment for its colonel.", 'reference', ['Bogdánich']),
    ('peronskaya', 'Perónskaya', "A maid of honor and guest who frequents the Rostóvs' gatherings in Petersburg.", 'reference', ['Perónskaya']),
    ('schoss', 'Louisa Ivánovna (Madame Schoss)', "A governess and companion in the Rostóv household.", 'supporting', ['Schoss', 'Louisa Ivánovna']),
    ('pelageya-danilovna', 'Pelagéya Danílovna Melyukóva', "A country neighbor of the Rostóvs.", 'reference', ['Pelagéya Danílovna']),
    ('chernyshev', 'Chernýshev', "The Emperor's aide-de-camp.", 'reference', ['Chernýshev']),
    ('bolkhovitinov', 'Bolkhovítinov', "A capable officer chosen to carry a dispatch to Kutúzov and explain it in person.", 'reference', ['Bolkhovítinov']),
    ('rumyantsev', 'Rumyántsev', "A statesman Prince Vasíli suggests appealing to.", 'reference', ['Rumyántsev']),
    ('auersperg', 'Auersperg', "An Austrian commander whose army's fall is discussed among the Russian officers.", 'reference', ['Auersperg']),
    ('lazarev', 'Lázarev', "A soldier singled out by his colonel and given special recognition.", 'reference', ['Lázarev']),
    ('anisya-fedorovna', 'Anísya Fëdorovna', "The housekeeper at “Uncle's” estate.", 'reference', ['Anísya Fëdorovna']),
    ('paulucci', 'Paulucci', "One of the officers at the imperial headquarters at Vílna.", 'reference', ['Paulucci']),
    ('vasilich', 'Vasílich', "A household servant Natásha calls on for help.", 'reference', ['Vasílich']),
    ('moreau', 'General Moreau', "A French general referred to in conversation as having once outmaneuvered Suvórov.", 'reference', ['Moreau']),
    ('repnin', 'Prince Repnín', "A wounded officer of the Horse Guards whom Bolkónski recognizes from Petersburg society.", 'reference', ['Repnín']),
    ('miloradovich', 'Milorádovich', "A Russian general named as one of the few capable commanders, alongside Dokhtúrov.", 'supporting', ['Milorádovich']),
    ('metivier', 'Métivier', "A French doctor who had become the fashion in Moscow society.", 'reference', ['Métivier']),
    ('balaga', 'Balagá', "A famous, daredevil troika driver known to Dólokhov and his circle.", 'supporting', ['Balagá']),
    ('stein', 'Stein', "A Prussian statesman named among the advisers surrounding the Tsar.", 'reference', ['Stein']),
    ('alexander-tsar', 'Emperor Alexander', "The reigning Tsar of Russia.", 'major', ['Alexander']),
    ('francis-emperor', 'Emperor Francis', "The Austrian Emperor.", 'supporting', ['Francis']),
    ('peter-nikolaevich', 'Peter Nikoláevich', "An officer Shinshín debates about the relative merits of cavalry and infantry service.", 'reference', ['Peter Nikoláevich']),
    ('mortier', 'Marshal Mortier', "One of Napoleon's marshals, whose division is attacked and broken up by Kutúzov's army on the Danube.", 'reference', ['Mortier']),
    ('sidorov', 'Sídorov', "A Russian soldier who mimics a French grenadier's speech to the amusement of his comrades.", 'reference', ['Sídorov']),
    ('gabriel', 'Gabriel', "A servant sent to fetch wine.", 'reference', ['Gabriel']),
    ('ivanushka', 'Ivánushka', "A young pilgrim whom Prince Andrew notices with a smile.", 'reference', ['Ivánushka']),
    ('stolypin', 'Stolýpin', "One of Speránski's guests at a small evening gathering.", 'reference', ['Stolýpin']),
    ('mitka', 'Mítka', "The count's other groom at “Uncle's” hunt, a daring horseman.", 'reference', ['Mítka']),
    ('theodore-ivanych', 'Theodore Iványch', "A steward, addressed respectfully by someone seeking horses for a journey.", 'reference', ['Theodore Iványch']),
    ('matrena-matrevna', 'Matrëna Matrévna', "A woman with a sable cloak, mentioned in Dólokhov's scheme to help Anatole elope with Natásha.", 'reference', ['Matrëna Matrévna']),
    ('agrafena-ivanovna', 'Agraféna Ivánovna Belóva', "A country neighbor of the Rostóvs who comes to Moscow to visit its shrines.", 'reference', ['Agraféna Ivánovna']),
    ('poniatowski', 'Prince Poniatowski', "A Polish prince serving as one of Napoleon's commanders.", 'reference', ['Poniatowski']),
    ('makar-alexeevich', 'Makár Alexéevich', "A person the doctor mentions visiting that evening.", 'reference', ['Makár Alexéevich']),
    ('daniel-terentich', 'Daniel Teréntich', "The old count's valet.", 'reference', ['Daniel Teréntich']),
    ('grekov', 'Major-General Grékov', "A Russian officer who leads two Cossack regiments on a raid.", 'reference', ['Grékov']),
    ('dorokhov', 'Dórokhov', "The commander of a Russian guerrilla detachment operating near Tarútino.", 'supporting', ['Dórokhov']),
    ('golitsyn', 'Prince Golítsyn', "A figure Prince Vasíli suggests as an intermediary to reach Rumyántsev.", 'reference', ['Golítsyn']),
    ('constantine-pavlovich', 'Grand Duke Constantine Pávlovich', "The Tsar's brother, commander of the Guards.", 'reference', ['Constantine Pávlovich']),
    ('markov', 'Count Markóv', "A Russian diplomat, said to be the only man who knew how to handle Napoleon in negotiation.", 'reference', ['Markóv']),
    ('von-toll', 'Captain von Toll', "An officer who rides to the Emperor's aid at a difficult moment and offers his services.", 'reference', ['von Toll']),
    ('larrey', "Larrey", "Napoleon's personal physician, ordered to attend to wounded prisoners.", 'reference', ['Larrey']),
    ('narishkin', 'Count Narýshkin', "One of the old and honored guests in Petersburg society circles.", 'reference', ['Narýshkin']),
    ('fyoka', 'Fóka', "The Rostóvs' cook.", 'reference', ['Fóka']),
    ('ostermann', 'Ostermann', "A division commander named in a military report on the state of the army's supplies.", 'reference', ['Ostermann']),
    ('zhilinski', 'Count Zhilínski', "A Polish adjutant with whom Borís lodges, rich and fond of the French.", 'reference', ['Zhilínski']),
    ('kochubey', 'Kochubéy', "One of the Tsar's close associates in his early reforms.", 'reference', ['Kochubéy']),
    ('bitski', 'Bítski', "A Petersburg committee-man, society gossip, and devotee of Speránski's new ideas.", 'reference', ['Bítski']),
    ('volkonski', 'Prince Volkónski', "The Quartermaster General heading the imperial staff -- not to be confused with the Bolkónski family.", 'supporting', ['Volkónski']),
    ('berthier', 'Marshal Berthier', "One of Napoleon's marshals, summoned for instructions.", 'reference', ['Berthier']),
    ('belliard', 'General Belliard', "A French general named alongside Murat and Lannes entering Vienna.", 'reference', ['Belliard']),
    ('catherine-petrovna', 'Catherine Petróvna', "A woman known for playing valses and the écossaise at the Rostóvs' gatherings.", 'reference', ['Catherine Petróvna']),
]

if __name__ == '__main__':
    for eid, name, body, role, aliases in ENTITIES:
        add_entity(BOOK, eid, name, '', body, role, 'person', aliases)

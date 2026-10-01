"""Pass E, hand edits: honorifics the automatic pass could not place (live numbering).
Left deliberately unchanged: 13:33 'the Featherstone pew', 30:4 'Edward Casaubon', 32:9 'Aunt Bulstrode',
33:8 'Jane Featherstone', 64:16 'the Vincy children', 75:44 'the Hackbutt children' (attributive/first-name uses)."""
from edits import apply

EDITS = [
    (49, 14, 'Dorothea,” Casaubon answered', 'Dorothea,” Mr. Casaubon answered'),
    (64, 4, '” Farebrother continued', '” Mr. Farebrother continued'),
    (67, 7, 'at Garth’s house', 'at Mr. Garth’s house'),
    (68, 11, '“Indeed,” Bulstrode replied', '“Indeed,” Mr. Bulstrode replied'),
    (69, 20, 'Harriet,” Bulstrode replied', 'Harriet,” Mr. Bulstrode replied'),
    (71, 37, 'Again Bulstrode did not', 'Again Mr. Bulstrode did not'),
    (72, 14, 'Bambridge,” Hawley insisted', 'Bambridge,” Mr. Hawley insisted'),
    (73, 9, 'Casaubon,” Farebrother said', 'Casaubon,” Mr. Farebrother said'),
    (86, 14, 'Harriet,” Bulstrode said', 'Harriet,” Mr. Bulstrode said'),
]

if __name__ == '__main__':
    apply(EDITS)

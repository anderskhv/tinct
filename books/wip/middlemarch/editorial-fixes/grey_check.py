import re
from common import *
m = load(MOD); o = load(ORG)
for oc, mc in zip(o['chapters'], m['chapters']):
    for i, (a, b) in enumerate(zip(oc['paragraphs'], mc['paragraphs'])):
        ga = re.findall(r'.{0,25}\bGrey\w*.{0,15}', a)
        gb = re.findall(r'.{0,25}\bGray\w*.{0,15}', b)
        gb0 = re.findall(r'.{0,25}\bGrey\w*.{0,15}', b)
        if ga or gb or gb0:
            print(oc['number'], i, 'O', ga, 'M-Gray', gb, 'M-Grey', gb0)

import json,pathlib,copy
p=pathlib.Path(__file__).parent
load=lambda f:json.loads((p/f).read_text())
write=lambda f,x:(p/f).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
da=load('source-onboarding-da.json');en=load('source-onboarding-en.json')
da.update(title='Et forsvar for kvindens rettigheder',length='13 kapitler samt tilegnelse og indledning',openingChapterLabel='Tilegnelse til Talleyrand',openingText='\n\n'.join(load('modern-da.json')['chapters'][0]['paragraphs'][:2]),about='Mary Wollstonecraft undersøger, hvordan opdragelse, økonomisk afhængighed og samfundets forventninger former kvinders liv. Hun angriber det ideal, der lærer kvinder at behage i stedet for at tænke selv, og argumenterer for uddannelse, selvstændig dømmekraft og fælles moralske krav til kvinder og mænd.\n\nBogen fra 1792 forbinder forholdene i hjemmet med politik og retfærdighed. Wollstonecraft diskuterer blandt andet Rousseaus syn på kvinder, ægteskab, blufærdighed, forældres ansvar og fælles skolegang for piger og drenge. Hendes argument er, at undertrykkelse skader både de afhængige og dem, der bestemmer over dem.')
en.update(length='13 chapters, dedication and introduction',openingChapterLabel='Dedication to Talleyrand',openingText='\n\n'.join(load('modern-en.json')['chapters'][0]['paragraphs'][:2]),about='Mary Wollstonecraft examines how education, economic dependence and social expectations shape women’s lives. She attacks the ideal that teaches women to please rather than think independently, and argues for education, independent judgment and shared moral standards for women and men.\n\nPublished in 1792, the book connects domestic life with politics and justice. Wollstonecraft discusses Rousseau’s views on women, marriage, modesty, parental responsibilities and schooling for girls and boys together. She argues that oppression damages both those made dependent and those who exercise power over them.')
da['angleCards']=[{'title':a,'text':b,'angleObjective':c}for a,b,c in [
('Uddannelse og selvstændighed','Følg hendes argument om, at det, kvinder lærer og får lov til, former deres evner og valg.','Jeg vil undersøge, hvordan Wollstonecraft forbinder opdragelse med kvinders selvstændighed.'),
('Opgøret med Rousseau','Wollstonecraft citerer og kritiserer Rousseaus forestilling om, at kvinders opdragelse skal rette sig efter mænds behov.','Jeg vil følge hendes indvendinger mod Rousseaus syn på kvinder og uddannelse.'),
('Samme moral for begge køn','Bogen kræver, at dyd bygger på fornuft og gælder for både mænd og kvinder.','Jeg vil følge argumentet for fælles moralske krav og se, hvordan det bruges på ægteskab og blufærdighed.'),
('Hjemmet og samfundet','Familieliv, arbejde, rang og politiske rettigheder bliver dele af den samme diskussion.','Jeg vil undersøge, hvordan ulighed i hjemmet hænger sammen med ulighed i samfundet.')]]
en['angleCards']=[{'title':a,'text':b,'angleObjective':c}for a,b,c in [
('Education and independence','Follow her argument that what women learn and are permitted to do shapes their abilities and choices.','I want to examine how Wollstonecraft connects education with women’s independence.'),
('The argument with Rousseau','Wollstonecraft quotes and challenges Rousseau’s view that women’s education should serve men’s needs.','I want to follow her objections to Rousseau’s account of women and education.'),
('One moral standard','The book insists that virtue rests on reason and applies to women and men alike.','I want to trace the case for shared moral standards and its application to marriage and modesty.'),
('Home and society','Family life, work, rank and political rights become parts of the same discussion.','I want to examine how inequality at home connects with inequality in society.')]]
da['cast']=[{'name':a,'role':b,'description':c}for a,b,c in [
('Mary Wollstonecraft','Forfatteren','Hun taler direkte til læseren, prøver sine argumenter mod hverdagens forhold og kritiserer både mænds magt og kvinders tillærte vaner.'),
('Jean-Jacques Rousseau','En vigtig modstander','Hans syn på kvinders opdragelse i Émile bliver citeret og udfordret, især i kapitel 5.'),
('Fornuften','Argumentets grundlag','Den evne, som efter Wollstonecrafts opfattelse må udvikles, hvis et menneske skal kunne handle selvstændigt og moralsk.'),
('Talleyrand','Tilegnelsens modtager','Den franske politiker og tidligere biskop, hvis skrift om national uddannelse Wollstonecraft tager afsæt i. Hun beder ham anvende principperne om frihed og rettigheder på kvinder.'),
('Den dannede selskabsdame','Et ideal under kritik','Kvinden, der lærer selskabelige færdigheder og at gøre sig tiltrækkende, men ikke får udviklet sin selvstændige dømmekraft.')]]
en['cast']=[{'name':a,'role':b,'description':c}for a,b,c in [
('Mary Wollstonecraft','The author','She addresses the reader directly, tests her arguments against everyday life and criticizes both male power and women’s learned habits.'),
('Jean-Jacques Rousseau','An important opponent','His account of women’s education in Emile is quoted and challenged, particularly in chapter 5.'),
('Reason','The foundation of the argument','The faculty that Wollstonecraft believes must develop if a person is to act independently and morally.'),
('Talleyrand','The dedicatee','The French politician and former bishop whose writing on national education provides the dedication’s starting point. She asks him to apply principles of freedom and rights to women.'),
('The accomplished woman','An ideal under criticism','The woman trained in social accomplishments and attractiveness without the development of independent judgment.')]]
da['whyItMatters']=[{'title':a,'body':b}for a,b in [
('Rettigheder og ansvar','Wollstonecraft forbinder kravet om rettigheder med muligheden for at opfylde sine pligter. Et menneske, der nægtes frihed til at bruge sin fornuft, kan ikke samtidig forventes at handle moralsk af egen overbevisning.'),
('Uddannelse er politik','Skolen og opdragelsen i hjemmet former ikke kun den enkelte. De påvirker ægteskab, forældreskab, økonomisk afhængighed og samfundets magtforhold.'),
('Et argument at diskutere','Bogen rummer både radikale krav om frihed og tidens forestillinger om køn, religion og samfund. Man kan følge dens argumenter tæt og samtidig undersøge, hvor deres forudsætninger begrænser dem.')]]
en['whyItMatters']=[{'title':a,'body':b}for a,b in [
('Rights and responsibilities','Wollstonecraft links rights with the capacity to fulfil duties. A person denied freedom to exercise reason cannot also be expected to act morally from independent conviction.'),
('Education is political','Schooling and upbringing shape more than individuals. They affect marriage, parenthood, economic dependence and social power.'),
('An argument to examine','The book combines radical demands for freedom with period assumptions about gender, religion and society. Readers can follow its arguments closely while examining where those assumptions limit them.')]]
for lang,obj in [('da',da),('en',en)]:
 write('onboarding-'+lang+'.json',obj)
 old=load('source-onboarding-'+lang+'.json')
 write('onboarding-'+lang+'-ledger.json',[{'field':k,'before':old[k],'after':v,'reason':'Source-grounded onboarding; remove unsupported first-ever/universal influence claims, fix section count and age assumption; exact opening from current edition; natural localized Danish.'}for k,v in obj.items()if old[k]!=v])

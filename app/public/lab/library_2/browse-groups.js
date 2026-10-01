// Approximate composition dates from the shared catalogue, never translation dates.
export const compositionYears = {"1984":1949.1,"gilgamesh":-2100,"iliad":-750,"odyssey":-700,"bible":-1200,"oresteia":-458,"oedipus-rex":-429,"antigone":-441,"oedipus-at-colonus":-406,"bacchae":-405,"medea":-431,"apology":-399,"crito":-398,"phaedo":-385,"symposium":-385.1,"phaedrus":-370,"the-republic":-375,"nicomachean-ethics":-350,"aristotle-politics":-335,"poetics":-334,"the-histories":-440,"peloponnesian-war":-400,"the-art-of-war":-500,"the-manual":125,"meditations":175,"the-aeneid":-19,"confessions":400,"beowulf":1000,"magna-carta":1215,"divine-comedy":1320,"imitation-of-christ":1418,"the-prince":1532,"leviathan":1651,"second-treatise":1689,"comedy-of-errors":1594,"midsummer":1595,"romeo-and-juliet":1597,"taming-of-the-shrew":1592,"richard-iii":1593,"merchant-of-venice":1598,"much-ado-about-nothing":1599,"henry-v":1599.1,"julius-caesar":1599.2,"as-you-like-it":1599.3,"henry-iv-part-2":1599.4,"merry-wives-of-windsor":1602,"hamlet":1600,"twelfth-night":1601,"othello":1603,"measure-for-measure":1604,"king-lear":1606,"macbeth":1606.1,"antony-and-cleopatra":1607,"coriolanus":1608,"winters-tale":1611,"the-tempest":1611.1,"cymbeline":1611.2,"descartes-meditations":1641,"paradise-lost":1667,"candide":1759,"discourse-on-inequality":1755,"social-contract":1762,"kant-groundwork":1785,"vindication-rights-of-woman":1792,"us-founding-documents":1776,"federalist-papers":1788,"werther":1774,"faust-part-1":1808,"pride-and-prejudice":1813,"frankenstein":1818,"democracy-in-america":1835,"fear-and-trembling":1843,"frederick-douglass":1845,"jane-eyre":1847,"communist-manifesto":1848,"moby-dick":1851,"walden":1854,"on-liberty":1859,"great-expectations":1861,"utilitarianism":1861.1,"notes-from-underground":1864,"crime-and-punishment":1866,"war-and-peace":1869,"around-the-world-80-days":1873,"niels-lyhne":1880.1,"brothers-karamazov":1880,"jekyll-and-hyde":1886,"ivan-ilyich":1886.1,"beyond-good-and-evil":1886.1,"genealogy-of-morals":1887,"jungle-book":1894,"the-awakening":1899,"heart-of-darkness":1899.1,"jerusalem":1901,"a-little-princess":1905,"ulysses":1922,"don-quixote":1605,"essays-montaigne":1580,"canterbury":1387,"summa":1265,"city-of-god":426,"anna-karenina":1877,"to-the-lighthouse":1927,"hume-enquiry":1748,"groundwork-kant":1785,"wealth-of-nations":1776.5,"phenomenology":1807,"civilization-freud":1930,"investigations":1953,"second-sex":1949,"trial-kafka":1925,"waiting-godot":1953.1,"beloved":1987,"alice-in-wonderland":1865,"wuthering-heights":1847,"middlemarch":1871,"sense-and-sensibility":1811,"adventures-of-sherlock-holmes":1892};
export const periodGroups = [
  {id:'earliest',era:'antiquity',label:'Earliest works',range:'before 1000 BC',from:-Infinity,to:-1000},
  {id:'first-millennium',era:'antiquity',label:'Early first millennium BC',range:'1000–500 BC',from:-1000,to:-500},
  {id:'later-bc',era:'antiquity',label:'Later first millennium BC',range:'500–1 BC',from:-500,to:1},
  {id:'early-ad',era:'antiquity',label:'First five centuries AD',range:'AD 1–499',from:1,to:500},
  {id:'early-medieval',era:'medieval',label:'Early medieval',range:'500–999',from:500,to:1000},
  {id:'later-medieval',era:'medieval',label:'Later medieval',range:'1000–1499',from:1000,to:1500},
  {id:'sixteenth',era:'early-modern',label:'16th century',range:'1500–1599',from:1500,to:1600},
  {id:'seventeenth',era:'early-modern',label:'17th century',range:'1600–1699',from:1600,to:1700},
  {id:'eighteenth',era:'early-modern',label:'18th century',range:'1700–1799',from:1700,to:1800},
  {id:'early-nineteenth',era:'modern',label:'Early 19th century',range:'1800–1849',from:1800,to:1850},
  {id:'late-nineteenth',era:'modern',label:'Late 19th century',range:'1850–1899',from:1850,to:1900},
  {id:'early-twentieth',era:'contemporary',label:'Early 20th century',range:'1900–1949',from:1900,to:1950},
  {id:'since-1950',era:'contemporary',label:'1950 onwards',range:'1950–',from:1950,to:Infinity},
];
export function inPeriod(book, period) {
  const year=compositionYears[book.id];
  return Number.isFinite(year) && year>=period.from && year<period.to;
}
export function populatedShelves(category, houses, books) {
  const houseId=({political:'politics',children:'young'})[category]||category;
  const ids=new Set(books.map(book=>book.id));
  return (houses.find(h=>h.id===houseId)?.shelves||[])
    .map(s=>({...s,bookIds:s.bookIds.filter(id=>ids.has(id))})).filter(s=>s.bookIds.length);
}

/** Subdivisions live on the category page; every selected book remains reachable. */
export function collectionReels(kind, id, books, houses, title) {
  let groups=[];
  if(kind==='category'&&id!=='all')groups=populatedShelves(id,houses,books)
    .map(s=>({id:s.id,title:s.title,books:books.filter(b=>s.bookIds.includes(b.id))}));
  if(kind==='era')groups=periodGroups.filter(p=>p.era===id)
    .map(p=>({id:p.id,title:p.label+' · '+p.range,books:books.filter(b=>inPeriod(b,p))})).filter(g=>g.books.length);
  if(!groups.length)return [];
  const grouped=new Set(groups.flatMap(g=>g.books.map(b=>b.id))),remaining=books.filter(b=>!grouped.has(b.id));
  if(remaining.length)groups.push({id:'more-'+id,title:'More '+title,books:remaining});
  return groups;
}

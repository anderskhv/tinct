// SEO content data for the US Founding Documents.
// Declaration of Independence (1776), Constitution (1787), Bill of Rights (1791), Later Amendments.
// Four texts, one continuous political project, two centuries in the making.
// Voice: historical-legal, declarative, precise with dates and names.

module.exports = {
  id: 'us-founding-documents',
  title: 'US Founding Documents',
  author: 'Jefferson, Madison, Hamilton & others',
  byline: '1776–1791 · The founding texts of the American republic',
  titleAccent: 'a guided tour',
  hook: 'Three documents written across fifteen years by overlapping casts of working politicians, drafted in the heat of revolution and ratification — then extended by amendment across two more centuries. Together they are the founding argument of American constitutional democracy.',
  genre: ['History', 'Political philosophy', 'Legal text'],
  themesBlurb: 'Natural rights, separation of powers, federalism, individual liberty, the limits of government.',
  castBlurb: 'Philadelphia, 1776–1787',
  castDesc: 'The delegates, drafters, and dissenters who wrote the American republic into existence.',
  chapterLabel: n => ['Declaration of Independence', 'Constitution', 'Bill of Rights', 'Later Amendments'][n - 1],

  about: [
    `The <em>Declaration of Independence</em> (July 4, 1776), the <em>Constitution</em> (September 17, 1787), and the <em>Bill of Rights</em> (December 15, 1791) are not three separate works. They are one continuous argument, made across fifteen years by people who knew they were inventing the modern republican state. The Declaration announces the philosophical premises. The Constitution lays out the working machinery. The Bill of Rights names what the machinery may not do to the people who live under it.`,
    `Read together — with the later amendments that extended the settlement across two more centuries — the documents constitute the complete founding text of the United States. The Declaration is short enough to read in twenty minutes; the Constitution takes perhaps an hour; the Bill of Rights is ten amendments, none of them long. Reading all four in sequence, in an evening, is the closest modern readers can come to watching the American republic think itself into existence.`,
  ],

  chaptersSubtitle: 'All four documents — from the philosophical case for a new nation to the amendments that extended the founding principles across two centuries.',
  chaptersLead: `<p>The Declaration of Independence is the philosophical statement — natural rights, consent of the governed, the right of revolution. The Constitution is the machinery — three branches, enumerated powers, checks and balances, the amendment process. The Bill of Rights is the political settlement of the ratification fight — ten amendments demanded by the Anti-Federalists as the price of ratification. The Later Amendments carry the founding principles into territory the framers had been unwilling or unable to reach: abolishing slavery, establishing birthright citizenship, extending the franchise.</p>`,

  themesByline: 'Five threads through the documents',
  themesLead: `The founding documents are not a finished text but a framework within which the unfinished questions of the American republic have been argued for two and a half centuries. These are the five threads that run through all four.`,

  groups: [
    { label: 'The philosophical case', subtitle: 'Natural rights, consent of the governed, the right of revolution.', chapters: [1] },
    { label: 'The working machinery', subtitle: 'Three branches, enumerated powers, checks and balances.', chapters: [2] },
    { label: 'The Anti-Federalist settlement', subtitle: 'Ten amendments naming what the federal government may not do.', chapters: [3] },
    { label: 'The extended republic', subtitle: 'Abolition, birthright citizenship, the franchise, direct taxation, Prohibition, and more.', chapters: [4] },
  ],

  themes: [
    {
      slug: 'natural-rights',
      title: 'The Lockean Argument of the Declaration',
      greek: '"unalienable Rights — Life, Liberty, and the pursuit of Happiness"',
      preview: 'The second paragraph of the Declaration is one of the most carefully composed pieces of political philosophy ever produced for a public audience, and it is closely modelled on John Locke\'s Second Treatise of Government. Jefferson is not concealing the source; he is paraphrasing it.',
      essay: [
        `The second paragraph of the Declaration of Independence is one of the most carefully composed pieces of political philosophy ever produced for a public audience, and it is closely modelled on John Locke's <em>Second Treatise of Government</em>, published almost a century earlier in 1689. Jefferson is not concealing the source; he is paraphrasing it. We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness — That to secure these rights, Governments are instituted among Men, deriving their just powers from the consent of the governed.`,
        `Every clause of the paragraph traces to Locke. The natural rights to life, liberty, and property; the doctrine that government is instituted for the protection of those rights; the principle of consent of the governed as the only legitimate ground of political authority; the right of revolution against a government that violates its trust — all of these are Lockean doctrines, taken into the Declaration with very little modification of substance.`,
        `Jefferson's chief alteration is the substitution of the pursuit of Happiness for property in the trio of natural rights — a phrase that has been variously read as a softening of Locke for revolutionary purposes, as a borrowing from the Scottish moralists Jefferson had read at William and Mary, or as a reflection of the wider Enlightenment sense of human flourishing as the aim of political life.`,
        `Whatever its source, the substitution gives the American foundation a slightly different texture from the British liberal tradition without breaking with it. The Declaration is, in this sense, the most consequential political application of Lockean philosophy in modern history. Because Jefferson chose to argue the revolution in Lockean terms, and because the Continental Congress signed his draft, the United States entered the world as a deliberately Lockean state — and the political tradition built on it has been working out the implications of that founding choice ever since.`,
      ],
      where: [
        { n: 1, label: 'Declaration — the philosophical preamble' },
        { n: 3, label: 'Bill of Rights — rights enumerated' },
        { n: 4, label: 'Later Amendments — rights extended' },
      ],
    },
    {
      slug: 'separation-of-powers',
      title: 'Separation of Powers and the Working Constitution',
      greek: '"auxiliary precautions" — Madison, Federalist 51',
      preview: 'The Constitution\'s most enduring structural achievement is the separation of powers among three coordinate branches — each given its own enumerated authority and each given the constitutional means to check the encroachments of the others.',
      essay: [
        `The Constitution's most enduring structural achievement is the separation of powers among three coordinate branches — legislative, executive, judicial — each given its own enumerated authority and each given the constitutional means to check the encroachments of the others. The doctrine had been articulated in theory by Montesquieu in <em>The Spirit of the Laws</em> (1748), but it had never been put into practice in quite the form the Convention of 1787 produced.`,
        `Article I creates a bicameral legislature — a House elected directly by the people every two years, a Senate originally chosen by state legislatures for staggered six-year terms — with carefully enumerated powers (tax, borrow, regulate commerce, coin money, declare war, raise armies) and explicit prohibitions (no titles of nobility, no bills of attainder, no ex post facto laws). Article II creates a single chief executive, elected indirectly through state electors, with vested executive power and the duty to take care that the laws be faithfully executed. Article III creates a federal judiciary with original and appellate jurisdiction over a defined set of cases.`,
        `The crucial feature is not the existence of three branches but the mutual checks among them. The legislature can be vetoed by the executive (overridden by a two-thirds vote of both houses); the executive's appointments and treaties can be blocked by the Senate; the judiciary, by Hamilton's Federalist 78 doctrine that became <em>Marbury v. Madison</em> (1803), can declare both legislative and executive acts unconstitutional.`,
        `This is what Madison, in Federalist 51, called auxiliary precautions: the constitutional architecture is designed so that the ambition of officeholders in each branch will, in the ordinary course, defend the boundaries of that branch against the others. Two and a half centuries of American constitutional development is, in one dimension, the working out of how the boundaries actually run when concrete cases arise — and the boundaries have moved, but the basic structural settlement of 1787 has held.`,
      ],
      where: [
        { n: 2, label: 'Constitution — Articles I, II, III' },
        { n: 3, label: 'Bill of Rights — limits on federal power' },
      ],
    },
    {
      slug: 'federalism',
      title: 'Federalism and the Compromise of the Convention',
      greek: '"a more perfect Union"',
      preview: 'The Constitution is, before it is anything else, a federal compromise. The central political problem of the Convention of 1787 was how to construct a national government that would actually work without dissolving the existing states or alienating any of them so badly they would refuse to ratify.',
      essay: [
        `The Constitution is, before it is anything else, a federal compromise. Twelve states sent delegations to Philadelphia in May 1787 (Rhode Island refused), and the central political problem of the Convention was how to construct a national government that would actually work without dissolving the existing states or alienating any of them so badly that they would refuse to ratify.`,
        `Two main proposals contended through June. The Virginia Plan, drafted largely by Madison and presented by Edmund Randolph, called for proportional representation in both houses based on population — a plan that would have given the large states commanding influence. The New Jersey Plan, presented by William Paterson, called for equal state representation in a single chamber — essentially a modified version of the Articles of Confederation. The Connecticut Compromise, proposed by Roger Sherman in mid-July, produced the bicameral legislature the Constitution actually has: a House apportioned by population, a Senate with two senators per state regardless of population.`,
        `A second great compromise, equally consequential and considerably more shameful, was the Three-Fifths Compromise on apportionment. Should enslaved people be counted in the population for purposes of representation? Counting them fully would have given the slave states more weight in Congress; not counting them at all would have given the free states more. The compromise — three-fifths of the enslaved population would be counted — gave the slave states a permanent disproportionate voice in the House and the Electoral College that was not finally erased until the Civil War and the Fourteenth Amendment.`,
        `The Constitution that came out of Philadelphia is therefore a document of compromise more than of principle in some of its central provisions. Reading it requires holding two truths together: that the framework it produced has lasted longer than any other written constitution in continuous force, and that some of the compromises that made the framework possible were morally indefensible at the time they were made.`,
      ],
      where: [
        { n: 2, label: 'Constitution — the structural compromise' },
        { n: 4, label: 'Later Amendments — the Fourteenth Amendment' },
      ],
    },
    {
      slug: 'bill-of-rights',
      title: 'The Bill of Rights and the Anti-Federalist Victory',
      greek: '"the enumeration of certain rights shall not be construed to deny others"',
      preview: 'The Bill of Rights exists because the Anti-Federalists won an argument the Federalists had thought they could win without conceding. During the ratification fight of 1787–88, the most consistent Anti-Federalist objection was the absence of an explicit declaration of rights.',
      essay: [
        `The Bill of Rights exists because the Anti-Federalists won an argument the Federalists had thought they could win without conceding it. During the ratification fight of 1787–88, the most consistent Anti-Federalist objection was the absence of an explicit declaration of rights — a failure that critics from George Mason in Virginia to Patrick Henry to the New York Anti-Federalists made central to their case against ratification.`,
        `Hamilton in Federalist 84 produced the most carefully argued Federalist reply: a bill of rights is unnecessary in a government of enumerated powers, because a government that has not been given the power to abridge speech, the press, or religion cannot abridge them; a bill of rights is positively dangerous, because explicit prohibitions of certain governmental powers might be read to imply that the government has any powers it has not been forbidden to exercise. The argument was logical and was made in good faith. It also lost.`,
        `State ratifying conventions in Massachusetts, New Hampshire, Virginia, and New York voted to ratify only on the explicit understanding that the first Congress would propose amendments protecting individual rights. Madison, who had agreed with Hamilton in 1788 that no bill was needed, became the political figure who took the commitment seriously. He drafted twelve proposed amendments in the summer of 1789, drawing heavily on the state-convention proposals and on the long English tradition of declarations of rights running back to Magna Carta and the 1689 Bill of Rights. Ten of the twelve were ratified by the states by December 15, 1791.`,
        `The result is the most influential single set of constitutional rights in modern history. The First Amendment's protections of religion, speech, press, and assembly; the Fourth Amendment's protection against unreasonable searches and seizures; the Fifth Amendment's due process clause and protection against self-incrimination; the Eighth Amendment's prohibition on cruel and unusual punishment — all of these have done extensive work in two centuries of American jurisprudence and have been borrowed, sometimes verbatim, into constitutional documents around the world. The Anti-Federalists were better politicians than Hamilton on this single point, and the United States has been better off for the loss.`,
      ],
      where: [
        { n: 3, label: 'Bill of Rights — all ten amendments' },
        { n: 4, label: 'Later Amendments — the Ninth and Tenth at work' },
      ],
    },
    {
      slug: 'unfinished-settlement',
      title: 'What the Documents Did Not Settle',
      greek: '"We the People" — and who was left out',
      preview: 'Reading the founding documents two and a half centuries later requires a willingness to see clearly both what they accomplished and what they did not. The accomplishment is enormous. So is the omission.',
      essay: [
        `Reading the founding documents two and a half centuries later requires a willingness to see clearly both what they accomplished and what they did not. The accomplishment is enormous and undeniable. A continental republic on the scale of the United States had no precedent in modern history; the Anti-Federalists had argued, citing Montesquieu, that republican government was possible only on a small scale. The framers' answer — an extended republic with multiple layers of government, separation of powers, federal-state division of authority, explicit individual rights — has been the working political framework of more than three hundred million people for over two centuries.`,
        `What the documents did not settle is also clear. Slavery is left in place by the Constitution and named only obliquely: the Three-Fifths Clause, the slave-trade clause that prohibits Congress from banning the importation of enslaved people before 1808, the Fugitive Slave Clause. The status of women is unspecified — women are not given the vote, are not present at the Convention or the ratifying conventions, and are not addressed as full political agents. The status of Native nations is largely subordinated to the wartime framework of the Constitution.`,
        `The founding settlement is therefore not a finished document but the framework within which the unfinished questions of the American republic have been argued. The Civil War amendments — Thirteenth, Fourteenth, Fifteenth — abolished slavery, established birthright citizenship and equal protection, and prohibited racial discrimination in the franchise. The Nineteenth Amendment (1920) extended the vote to women. The civil-rights legislation and constitutional jurisprudence of the twentieth century carried the founding principles into territory the framers had not been willing to take them.`,
        `The documents are therefore best read not as a closed text but as a starting point: the philosophical premises and the working machinery on which an ongoing political project has been built. The ongoing project has been the working out, by each subsequent generation, of what the founding principles actually require when extended to the cases the framers did not address.`,
      ],
      where: [
        { n: 1, label: 'Declaration — the philosophical premises' },
        { n: 2, label: 'Constitution — the compromises' },
        { n: 4, label: 'Later Amendments — the extensions' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Thomas Jefferson', role: 'Drafter, Declaration of Independence', body: `Born 1743 at Shadwell in Virginia, William and Mary educated, Virginia lawyer and planter, member of the Continental Congress. Thirty-three years old when assigned the drafting of the Declaration in June 1776; produced the document in about seventeen days in a rented room on Market Street in Philadelphia. The voice of the Declaration is his — Lockean in substance, Augustan in cadence. Later first Secretary of State, Vice President, and third President. Died on July 4, 1826, the fiftieth anniversary of the Declaration's adoption.` },
    { name: 'James Madison', role: 'Primary architect, Constitution and Bill of Rights', body: `Born 1751 in Virginia, Princeton-educated. The most influential single figure at the Constitutional Convention — drafter of the Virginia Plan, keeper of the famously detailed notes that are the historian's chief source for what was said behind closed doors, principal author of Federalist 10, 39, and 47–51. Drafted what became the Bill of Rights in the first session of Congress in 1789. Fourth President of the United States from 1809 to 1817.` },
    { name: 'Alexander Hamilton', role: 'Constitutional advocate and Federalist Papers co-author', body: `Born around 1755 on Nevis in the West Indies. Aide-de-camp to Washington through most of the Revolutionary War; New York lawyer afterwards; delegate to the Constitutional Convention. Wrote fifty-one of the eighty-five Federalist Papers, including the most influential papers on the executive (No. 70) and the judiciary (No. 78). First Secretary of the Treasury, designer of the federal financial system. Killed by Aaron Burr in a duel in July 1804.` },
    { name: 'George Washington', role: 'Presiding officer, Constitutional Convention', body: `Born 1732 in Virginia. Commander-in-chief of the Continental Army from 1775 to 1783, presiding officer of the Constitutional Convention of 1787. Said almost nothing during the four months of the Convention but was the silent guarantor of the entire enterprise; the framers were able to give the proposed presidency the powers they did because they assumed Washington would be the first occupant. Elected unanimously by the Electoral College in 1788 and 1792; established the foundational precedents of the office. Died December 1799.` },
    { name: 'George Mason', role: 'Anti-Federalist conscience', body: `Virginia planter, drafter of the Virginia Declaration of Rights of 1776 — the model for the natural-rights paragraph in the Declaration of Independence and for many provisions of the federal Bill of Rights. Refused to sign the finished Constitution in September 1787, chiefly because of the absence of a bill of rights. His <em>Objections to This Constitution of Government</em>, circulated in autumn 1787, was the most widely read Anti-Federalist pamphlet of the period. Died at Gunston Hall in 1792, having lived to see the ratification of the rights he had refused to sign without.` },
    { name: 'The Anti-Federalists', role: 'Ratification opposition', body: `The loose coalition of state politicians and country gentlemen who opposed ratification of the Constitution in 1787–88. Patrick Henry of Virginia, George Clinton of New York, Samuel Adams of Massachusetts, Richard Henry Lee, Elbridge Gerry — the cast varies by state but the character is consistent. They feared the new federal government was too consolidated, too distant from the people, too aristocratic in tendency. They lost the ratification fight but won, through their pressure, the commitment to a bill of rights. The American constitutional tradition is, in one of its central dimensions, the ongoing dialogue between the Federalist and Anti-Federalist visions of what kind of republic the United States was meant to be.` },
  ],

  cast: [
    {
      name: "Thomas Jefferson",
      role: "DECLARATION DRAFTER",
      body:
        "Born 1743 at Shadwell in Virginia, William and Mary educated, Virginia lawyer and planter, member of the House of Burgesses and the Continental Congress. Thirty-three years old when he was assigned the drafting of the Declaration of Independence in June 1776 by the five-man committee of the Continental Congress; produced the document in about seventeen days in a rented room on Market Street in Philadelphia. The voice of the Declaration is his — Lockean in substance, Augustan in cadence, calibrated to be read aloud and remembered. Later first Secretary of State, Vice President, and the third President of the United States; founder of the University of Virginia; principal political opponent of Hamilton in the founding decade. Owned slaves for his entire adult life and never reconciled the practice with the principles of the document he drafted. Died on 4 July 1826, the fiftieth anniversary of the Declaration's adoption. The most carefully composed sentences in American political literature are his.",
    },
    {
      name: "James Madison",
      role: "CONSTITUTION & BILL OF RIGHTS",
      body:
        "Born 1751 in Virginia, Princeton-educated, slight in physical frame and immense in political reading. The most influential single figure at the Constitutional Convention of 1787, often called its father — drafter of the Virginia Plan that set the agenda, keeper of the famously detailed notes that are our chief source for what was said behind closed doors, principal author of the most philosophically ambitious of the Federalist Papers (numbers 10, 39, 47-51). Co-founder with Jefferson of the Democratic-Republican Party in the 1790s; fourth President of the United States from 1809 to 1817. Drafted what became the Bill of Rights in the first session of Congress in 1789, against his own earlier theoretical doubts, to honour the political commitment made during ratification. Two of the three founding documents bear his fingerprints in central places, and a great deal of the structural architecture of American government was first articulated by him.",
    },
    {
      name: "Alexander Hamilton",
      role: "CONSTITUTIONAL ADVOCATE",
      body:
        "Born around 1755 on Nevis in the West Indies, illegitimate, orphaned at thirteen, sent to New York by sponsors who recognised his abilities. Aide-de-camp to Washington through most of the Revolutionary War; New York lawyer afterwards; delegate to the Constitutional Convention. Wrote fifty-one of the eighty-five Federalist Papers in defence of the proposed Constitution during the ratification fight, including the most influential papers on the executive (number 70) and the judiciary (number 78). First Secretary of the Treasury under Washington, designer of the federal financial system, founder of the Bank of the United States, principal political opponent of Jefferson and Madison in the founding decade. Killed by Aaron Burr in a duel in July 1804. The energy and ambition of the executive branch as Americans now understand it are largely his conception, and the working financial machinery of the federal government in its first generation is almost entirely his design.",
    },
    {
      name: "George Washington",
      role: "PRESIDING FIGURE",
      body:
        "Born 1732 in Virginia, surveyor, planter, Virginia militia officer in the Seven Years' War, commander-in-chief of the Continental Army from 1775 to 1783, presiding officer of the Constitutional Convention of 1787. Said almost nothing during the four months of the Convention but was the silent guarantor of the entire enterprise; the framers were able to give the proposed presidency the powers they did because they assumed Washington would be the first occupant. Elected unanimously by the Electoral College in 1788 and again in 1792, set the foundational precedents of the office (the cabinet, the two-term limit, the farewell address, the principle of civilian control over the military, the inaugural ceremony as a non-monarchical transfer of power), refused a third term and went home to Mount Vernon in March 1797. Died there in December 1799. The presidency as an institution is partly a constitutional design and partly Washington's personal interpretation of the design, and the personal interpretation has been at least as durable as the text.",
    },
    {
      name: "George Mason",
      role: "ANTI-FEDERALIST CONSCIENCE",
      body:
        "Virginia planter, neighbour and political ally of Washington and Jefferson, drafter of the Virginia Declaration of Rights of 1776 (the model for the natural-rights paragraph in the Declaration of Independence and for many provisions of the federal Bill of Rights), delegate to the Constitutional Convention. Refused to sign the finished Constitution in September 1787 — one of three delegates present at the end who did so — chiefly because of the absence of a bill of rights and because of the document's compromises with slavery. Became one of the most influential Anti-Federalists in the ratification fight; his Objections to This Constitution of Government, circulated in the autumn of 1787, was the most widely read Anti-Federalist pamphlet of the period. Lost the immediate political fight (the Constitution was ratified) but won the deeper argument: the first Congress drafted the Bill of Rights essentially to address his objections. Died at Gunston Hall in 1792, having lived to see the ratification of the rights he had refused to sign the Constitution without. The Bill of Rights is, in substance, the political settlement of his quarrel with the Federalists.",
    },
    {
      name: "The Anti-Federalists",
      role: "RATIFICATION OPPOSITION",
      body:
        "The loose coalition of state politicians, country gentlemen, small-state and rural representatives, and old radicals who opposed ratification of the Constitution in 1787-88. Patrick Henry of Virginia, George Clinton of New York, Samuel Adams of Massachusetts, Mason of Virginia, Richard Henry Lee, Elbridge Gerry — the cast varies by state but the political character is consistent. They feared that the new federal government was too consolidated, too distant from the people, too aristocratic in tendency, too much like a recreation of the British constitution they had just thrown off. They wrote pseudonymously as Cato, Brutus, the Federal Farmer, the Old Whig, and others, in newspapers across the country, in answer to Publius. They lost the ratification fight in eleven of the thirteen states (Rhode Island and North Carolina held out the longest) but they won, through their pressure, the commitment to a bill of rights. The American constitutional tradition is, in one of its central dimensions, the ongoing dialogue between the Federalist and Anti-Federalist visions of what kind of republic the United States was meant to be, and that dialogue has not ended.",
    },
  ],

  castSubtitle: 'The delegates, drafters, and dissenters — Philadelphia, 1776 and 1787.',
  castLead: `<p>The founding documents were written by a remarkably small group of men across a fifteen-year period. The Declaration was drafted by a committee of five — Jefferson did the writing, Adams and Franklin revised it. The Convention of 1787 had fifty-five delegates from twelve states; the debates that produced the Constitution were recorded in Madison's notebooks. The Bill of Rights was drafted essentially by Madison alone, in the first session of Congress, to redeem a promise made to the Anti-Federalists during ratification.</p>`,

  castGroups: [
    {
      label: 'The Declaration',
      characters: [
        {
          id: 'jefferson',
          tag: 'DRAFTER',
          name: 'Thomas Jefferson',
          epithet: 'Author of the Declaration',
          body: `Virginia planter and lawyer, thirty-three years old in June 1776. Assigned the drafting by the Committee of Five — Jefferson, Adams, Franklin, Sherman, Livingston — because of his reputation as the most polished writer among them. Produced the draft in about seventeen days. The Congress revised it heavily on the floor, including removing his passage condemning the slave trade. Died July 4, 1826, the fiftieth anniversary of the Declaration's adoption.`,
          appears: [1],
        },
        {
          id: 'adams',
          tag: 'REVISER',
          name: 'John Adams',
          epithet: 'Committee of Five, Massachusetts',
          body: `Massachusetts lawyer and political leader, member of the Continental Congress, and the most persistent advocate for independence in the debates of 1776. Assigned to the Committee of Five; revised Jefferson's draft and defended it on the floor of Congress. Later second President of the United States. Died, like Jefferson, on July 4, 1826.`,
          appears: [1],
        },
        {
          id: 'franklin',
          tag: 'REVISER',
          name: 'Benjamin Franklin',
          epithet: 'Committee of Five, Pennsylvania',
          body: `The oldest member of the Committee of Five at seventy years old in 1776. Scientist, printer, diplomat, and the most internationally famous American of the founding generation. Made light revisions to Jefferson's draft — famously changing "sacred and undeniable" truths to "self-evident" truths in the second paragraph. Also delegate to the Constitutional Convention of 1787 at age eighty-one, the oldest delegate present.`,
          appears: [1, 2],
        },
      ],
    },
    {
      label: 'The Convention',
      characters: [
        {
          id: 'washington',
          tag: 'PRESIDING',
          name: 'George Washington',
          epithet: 'President of the Convention',
          body: `Unanimously elected presiding officer of the Constitutional Convention in May 1787. Said almost nothing during the four months of debate but was the silent guarantor of the entire enterprise. The framers gave the proposed presidency the powers they did because they assumed Washington would be the first occupant. Elected unanimously to the office twice.`,
          appears: [2],
        },
        {
          id: 'madison',
          tag: 'ARCHITECT',
          name: 'James Madison',
          epithet: 'Primary drafter, Constitution and Bill of Rights',
          body: `The most influential single figure at the Constitutional Convention — drafter of the Virginia Plan, keeper of the detailed notes that are the historian's chief source for what was said behind closed doors, and principal author of Federalist 10, 39, and 47–51. Drafted the Bill of Rights in the first session of Congress in 1789 to honour the commitment made to the Anti-Federalists during ratification.`,
          appears: [2, 3],
        },
        {
          id: 'hamilton',
          tag: 'ADVOCATE',
          name: 'Alexander Hamilton',
          epithet: 'Federalist Papers, constitutional advocate',
          body: `New York delegate to the Constitutional Convention; wrote fifty-one of the eighty-five Federalist Papers defending the proposed Constitution during the ratification fight. His Federalist 78 articulated the doctrine of judicial review that became <em>Marbury v. Madison</em> in 1803. Argued in Federalist 84 that no bill of rights was necessary — an argument he lost.`,
          appears: [2],
        },
        {
          id: 'mason',
          tag: 'DISSENTER',
          name: 'George Mason',
          epithet: 'Anti-Federalist conscience',
          body: `Virginia delegate who refused to sign the finished Constitution because of the absence of a bill of rights and the document's compromises with slavery. His <em>Objections to This Constitution of Government</em> (1787) was the most widely read Anti-Federalist pamphlet of the period. The Bill of Rights is, in substance, the political settlement of his quarrel with the Federalists.`,
          appears: [2, 3],
        },
      ],
    },
  ],

  chapters: [
    {
      n: 1,
      title: 'Declaration of Independence',
      tourTitle: 'The Declaration of Independence',
      hook: 'Thomas Jefferson, in a rented room in Philadelphia, writes the philosophical case for a new nation. The second paragraph changes the world.',
      tour: `The Declaration of Independence is short — about thirteen hundred words — and divides cleanly into three parts. The opening paragraph announces the occasion: one people dissolving the political bonds that tied them to another. The second paragraph is the philosophical core: the self-evident truths, the unalienable rights, the consent of the governed, the right of the people to alter or abolish a destructive government. It is one of the most carefully composed pieces of political philosophy ever written for a public audience, and it is closely modelled on John Locke's Second Treatise of Government. Then comes the long list of grievances against George III — twenty-seven specific charges, each beginning with "He has" — which is the legal indictment, the case that the revolution is justified under the very principles just announced. The closing paragraph is the formal declaration of independence, signed by the representatives of the thirteen united States of America.`,
      blurb: `Thirteen hundred words in three parts: the philosophical preamble, the Lockean second paragraph stating the self-evident truths, the twenty-seven grievances against George III, and the formal declaration. Adopted July 4, 1776.`,
      summary: [
        `The Declaration of Independence is drafted in the late spring of 1776 by Thomas Jefferson of Virginia, with revisions by John Adams, Benjamin Franklin, and the rest of the Continental Congress, and adopted on July 4 in the State House at Philadelphia. Richard Henry Lee of Virginia introduces the resolution for independence on June 7; the Congress refers it to a five-man drafting committee — Jefferson, Adams, Franklin, Roger Sherman, Robert Livingston — and Jefferson, the youngest at thirty-three but the most polished writer, produces the draft. The committee revises lightly. The Congress revises more heavily on the floor, removing Jefferson's striking but politically untenable passage condemning the slave trade.`,
        `The document divides into three parts. The opening paragraph announces the occasion: one people dissolving the political bonds that tied them to another, as required by the laws of nature and of nature's God, and assuming their separate and equal place among the powers of the earth. The second paragraph is the philosophical core, modelled on Locke's Second Treatise: we hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable rights, that among these are life, liberty, and the pursuit of happiness — that to secure these rights, governments are instituted among men, deriving their just powers from the consent of the governed — that whenever any form of government becomes destructive of these ends, it is the right of the people to alter or to abolish it. Then come twenty-seven specific grievances against George III, each beginning with "He has," constituting the legal indictment.`,
        `The closing paragraph is the formal declaration of independence: the representatives of the thirteen united States of America, in General Congress assembled, appealing to the Supreme Judge of the world for the rectitude of their intentions, solemnly publish and declare that these colonies are, and of right ought to be, free and independent states. The vote is taken on July 2; the document is adopted on July 4; copies are sent to the states and to Europe. The Declaration is the document that announces the United States as a political project rather than as a list of colonies in revolt.`,
      ],
      appears: [
        { id: 'jefferson', name: 'Thomas Jefferson' },
        { id: 'adams', name: 'John Adams' },
        { id: 'franklin', name: 'Benjamin Franklin' },
      ],
      themes: [
        { slug: 'natural-rights', label: 'Natural rights' },
        { slug: 'unfinished-settlement', label: 'What the documents did not settle' },
      ],
    },
    {
      n: 2,
      title: 'Constitution',
      tourTitle: 'The Constitution',
      hook: 'Fifty-five delegates, four months in Philadelphia, one question: can a continental republic actually work? The document they produced has lasted two and a half centuries.',
      tour: `The Constitution is drafted eleven years after the Declaration, in a different mood. The Articles of Confederation have proved unworkable — no power of taxation, no executive, no judiciary, a unanimity rule for amendment that means nothing can be changed. The Convention of 1787 sits for four months in the same State House where the Declaration had been signed. The result is not a revision of the Articles but a wholly new framework. Read it in order: the Preamble (one sentence, the statement of purpose); Article I (Congress — the longest and most carefully constructed); Article II (the Presidency — shorter and looser, with consequences still being worked out); Article III (the courts — the briefest of the structural articles); Articles IV-VII handle relations among the states, amendment, supremacy, and ratification.`,
      blurb: `Seven articles establishing a federal government with three separate branches, enumerated powers, checks and balances, a bicameral legislature, an indirectly elected executive, and a federal judiciary. Signed September 17, 1787; ratified June 21, 1788.`,
      summary: [
        `The Constitution is drafted eleven years after the Declaration, in a different city and a different mood. The Articles of Confederation, ratified in 1781, have proved unworkable as the framework of a national government — no power of taxation, no executive, no judiciary, a unanimity rule for amendment that means nothing can be changed. A convention is called for Philadelphia in May 1787 to revise the Articles. Fifty-five delegates from twelve states attend (Rhode Island refuses). Washington presides; Madison takes the detailed notes that are the historian's chief source for what was said in the closed sessions; the Convention sits for four months in the same State House where the Declaration had been signed. The result is not a revision of the Articles but a wholly new framework.`,
        `The central structural achievements are separation of powers and federal compromise. Article I creates a bicameral legislature — a House elected directly by the people every two years, a Senate originally chosen by state legislatures for staggered six-year terms — with carefully enumerated powers and a list of explicit prohibitions. Article II creates a single chief executive, elected indirectly through state-appointed electors, with vested executive power and the duty to take care that the laws be faithfully executed. Article III creates a federal judiciary with original and appellate jurisdiction over a defined set of cases. The mutual checks among the branches — veto and override, Senate confirmation, judicial review — are Madison's "auxiliary precautions": the constitutional architecture is designed so that the ambition of officeholders in each branch will, in the ordinary course, defend the boundaries of that branch against the others.`,
        `The Convention produces two great compromises. The Connecticut Compromise creates the bicameral legislature — a House apportioned by population, a Senate with two senators per state regardless of population — breaking the deadlock between the large-state Virginia Plan and the small-state New Jersey Plan. The Three-Fifths Compromise, considerably more shameful, gives the slave states a disproportionate voice in the House and Electoral College by counting three-fifths of the enslaved population for apportionment. The Constitution is signed on September 17, 1787 and sent to the states for ratification. New Hampshire becomes the ninth state to ratify on June 21, 1788, and the Constitution comes into force.`,
      ],
      appears: [
        { id: 'washington', name: 'George Washington' },
        { id: 'madison', name: 'James Madison' },
        { id: 'hamilton', name: 'Alexander Hamilton' },
        { id: 'franklin', name: 'Benjamin Franklin' },
        { id: 'mason', name: 'George Mason' },
      ],
      themes: [
        { slug: 'separation-of-powers', label: 'Separation of powers' },
        { slug: 'federalism', label: 'Federalism' },
        { slug: 'unfinished-settlement', label: 'What the documents did not settle' },
      ],
    },
    {
      n: 3,
      title: 'Bill of Rights',
      tourTitle: 'The Bill of Rights',
      hook: 'The Anti-Federalists demanded a list of rights as the price of ratification. Madison, who had argued no such list was necessary, drafted one anyway. Ten amendments, ratified December 15, 1791.',
      tour: `The Bill of Rights is the political settlement of the ratification fight. Several state conventions had voted to ratify the Constitution only on the express understanding that the first Congress would propose amendments protecting individual rights, and Madison, who had argued in Federalist 84 that no such bill was necessary, drafted a set of twelve amendments in the summer of 1789. Ten were ratified by the states by December 15, 1791. Read them in order: the First Amendment's five freedoms (religion, speech, press, assembly, petition); the Second through Fourth (arms, quartering, search and seizure); the Fifth through Eighth (criminal procedure: grand jury, double jeopardy, self-incrimination, due process, speedy trial, jury trial, cruel and unusual punishment); and the Ninth and Tenth, which are the structural principles — the enumeration of rights is not exhaustive, and unenumerated powers are reserved to the states or to the people.`,
      blurb: `Ten amendments in three groups: the First Amendment's five freedoms; the Fourth through Eighth's criminal procedure protections; and the Ninth and Tenth's structural principles. Ratified December 15, 1791.`,
      summary: [
        `The Bill of Rights is the political settlement of the ratification fight. Several state conventions had voted to ratify the Constitution only on the express understanding that the first Congress would propose amendments protecting individual rights. Madison, who had argued in Federalist 84 that no such bill was necessary, drafted a set of twelve amendments in the summer of 1789 to honour the commitment, drawing heavily on the state-convention proposals and on the long English tradition of declarations of rights running back to Magna Carta. Ten were ratified by the states by December 15, 1791.`,
        `The First Amendment is the most expansive: Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances. Five freedoms in one sentence. The Second through Fourth Amendments address arms, quartering of troops, and unreasonable searches and seizures. The Fifth through Eighth Amendments are the core of criminal procedure: protection against self-incrimination, double jeopardy, and deprivation of life, liberty, or property without due process of law (Fifth); the right to a speedy and public trial by an impartial jury (Sixth); the right to jury trial in civil cases (Seventh); protection against cruel and unusual punishment (Eighth).`,
        `The Ninth and Tenth Amendments are the structural principles that close the document. The Ninth holds that the enumeration of certain rights in the Constitution shall not be construed to deny or disparage others retained by the people — a direct answer to Hamilton's argument in Federalist 84 that explicit enumeration of rights is dangerous. The Tenth reserves to the states or to the people all powers not delegated to the United States by the Constitution. Read together with the Declaration and the Constitution, the Bill of Rights closes the founding settlement: a statement of philosophical principles, a working framework for government, and a set of explicit limits on what that framework may do to the people who live under it.`,
      ],
      appears: [
        { id: 'madison', name: 'James Madison' },
        { id: 'mason', name: 'George Mason' },
      ],
      themes: [
        { slug: 'bill-of-rights', label: 'The Anti-Federalist victory' },
        { slug: 'natural-rights', label: 'Natural rights' },
        { slug: 'separation-of-powers', label: 'Limits on federal power' },
      ],
    },
    {
      n: 4,
      title: 'Later Amendments',
      tourTitle: 'The Later Amendments',
      hook: 'The Constitution has been amended twenty-seven times. The most consequential came in clusters: the Civil War amendments that abolished slavery and established birthright citizenship, the Progressive Era amendments that extended the franchise, and Prohibition — the one amendment later repealed.',
      tour: `The Constitution's amendment process (Article V) requires two-thirds of both houses of Congress and ratification by three-quarters of the states — deliberately hard. The first ten amendments came as a batch in 1791; the next two (the Eleventh and Twelfth) followed in 1795 and 1804. Then a long silence. The Civil War amendments — the Thirteenth (1865, abolishing slavery), Fourteenth (1868, birthright citizenship and equal protection), and Fifteenth (1870, the right to vote regardless of race) — are the second founding, extending the Declaration's principles to the people the framers had excluded. The Progressive Era brought the Sixteenth (income tax), Seventeenth (direct election of senators), Eighteenth (Prohibition), and Nineteenth (women's suffrage) in close succession between 1913 and 1920. Prohibition was repealed by the Twenty-First Amendment in 1933 — the only amendment to repeal another.`,
      blurb: `Seventeen amendments beyond the Bill of Rights: the Civil War amendments abolishing slavery and establishing birthright citizenship and equal protection; the Progressive Era amendments extending the franchise; Prohibition and its repeal; and the later amendments extending democracy and clarifying succession.`,
      summary: [
        `The Constitution has been amended twenty-seven times since 1791. The amendment process is deliberately difficult — two-thirds of both houses of Congress, then ratification by three-quarters of the states — and the result is that the amendments cluster around periods of major political crisis rather than accumulating continuously. The eleventh and twelfth came quickly (1795, 1804), addressing sovereign immunity and the Electoral College. Then a gap of sixty years.`,
        `The Civil War amendments are the second founding. The Thirteenth Amendment (1865) abolished slavery and involuntary servitude except as punishment for crime — the resolution of the Three-Fifths Compromise's original sin, through four years of war and six hundred thousand dead. The Fourteenth Amendment (1868) established birthright citizenship, equal protection of the laws, and due process as federal constitutional guarantees applying to the states — the amendment that has done the most work in twentieth-century constitutional jurisprudence. The Fifteenth Amendment (1870) prohibited denying the right to vote on account of race, color, or previous condition of servitude. Together the three amendments carry the Declaration's philosophical premises into the territory the framers had refused to take them.`,
        `The Progressive Era produced four amendments in close succession: the Sixteenth (1913, authorizing the federal income tax), the Seventeenth (1913, providing for direct election of senators rather than by state legislatures), the Eighteenth (1919, Prohibition), and the Nineteenth (1920, extending the vote to women). The Twenty-First Amendment (1933) repealed the Eighteenth — the only time the Constitution has been amended to undo an amendment. Later amendments addressed presidential succession (Twenty-Second, limiting presidents to two terms; Twenty-Fifth, governing succession on disability), the voting age (Twenty-Sixth, lowering it to eighteen), and congressional pay (Twenty-Seventh, preventing pay increases from taking effect until after an intervening election).`,
      ],
      appears: [],
      themes: [
        { slug: 'unfinished-settlement', label: 'The ongoing settlement' },
        { slug: 'federalism', label: 'Federal-state relations' },
        { slug: 'natural-rights', label: 'Rights extended' },
      ],
    },
  ],
};

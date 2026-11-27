/**
 * Resolves a poster image for every title from Wikipedia's page-summary API and writes src/data/posters.js.
 * Run: node scripts/fetch-posters.js
 * Blocks and relocated scenes reuse their parent's poster at render time, so they are not listed here.
 */
import fs from 'node:fs';
import { TITLES } from '../src/data/titles.js';

const S = (name, n) => `${name}_season_${n}`;

/** id -> candidate Wikipedia page titles, tried in order */
const PAGES = {
  'iron-man': ['Iron_Man_(2008_film)'],
  'incredible-hulk': ['The_Incredible_Hulk_(film)'],
  'iron-man-2': ['Iron_Man_2'],
  thor: ['Thor_(film)'],
  'first-avenger': ['Captain_America:_The_First_Avenger'],
  avengers: ['The_Avengers_(2012_film)'],
  'iron-man-3': ['Iron_Man_3'],
  'dark-world': ['Thor:_The_Dark_World'],
  'winter-soldier': ['Captain_America:_The_Winter_Soldier'],
  gotg: ['Guardians_of_the_Galaxy_(film)'],
  'age-of-ultron': ['Avengers:_Age_of_Ultron'],
  'ant-man': ['Ant-Man_(film)'],
  'civil-war': ['Captain_America:_Civil_War'],
  'doctor-strange': ['Doctor_Strange_(2016_film)'],
  'gotg-2': ['Guardians_of_the_Galaxy_Vol._2'],
  homecoming: ['Spider-Man:_Homecoming'],
  ragnarok: ['Thor:_Ragnarok'],
  'black-panther': ['Black_Panther_(film)'],
  'infinity-war': ['Avengers:_Infinity_War'],
  'ant-man-wasp': ['Ant-Man_and_the_Wasp'],
  'captain-marvel': ['Captain_Marvel_(film)'],
  endgame: ['Avengers:_Endgame'],
  'far-from-home': ['Spider-Man:_Far_From_Home'],
  'black-widow': ['Black_Widow_(2021_film)'],
  'shang-chi': ['Shang-Chi_and_the_Legend_of_the_Ten_Rings'],
  eternals: ['Eternals_(film)'],
  'no-way-home': ['Spider-Man:_No_Way_Home'],
  'multiverse-of-madness': ['Doctor_Strange_in_the_Multiverse_of_Madness'],
  'love-and-thunder': ['Thor:_Love_and_Thunder'],
  'wakanda-forever': ['Black_Panther:_Wakanda_Forever'],
  quantumania: ['Ant-Man_and_the_Wasp:_Quantumania'],
  'gotg-3': ['Guardians_of_the_Galaxy_Vol._3'],
  'the-marvels': ['The_Marvels'],
  'deadpool-wolverine': ['Deadpool_&_Wolverine'],
  'brave-new-world': ['Captain_America:_Brave_New_World'],
  thunderbolts: ['Thunderbolts*'],
  'f4-first-steps': ['The_Fantastic_Four:_First_Steps'],
  'brand-new-day': ['Spider-Man:_Brand_New_Day'],
  doomsday: ['Avengers:_Doomsday'],
  'secret-wars': ['Avengers:_Secret_Wars'],

  wandavision: ['WandaVision'],
  'falcon-winter-soldier': ['The_Falcon_and_the_Winter_Soldier'],
  'loki-s1': [S('Loki', 1), 'Loki_(TV_series)'],
  'loki-s2': [S('Loki', 2), 'Loki_(TV_series)'],
  'what-if-s1': [S('What_If...?', 1), 'What_If...?_(TV_series)'],
  'what-if-s2': [S('What_If...?', 2), 'What_If...?_(TV_series)'],
  'what-if-s3': [S('What_If...?', 3), 'What_If...?_(TV_series)'],
  hawkeye: ['Hawkeye_(2021_TV_series)', 'Hawkeye_(miniseries)'],
  'moon-knight': ['Moon_Knight_(miniseries)', 'Moon_Knight_(TV_series)'],
  'ms-marvel': ['Ms._Marvel_(miniseries)', 'Ms._Marvel_(TV_series)'],
  'she-hulk': ['She-Hulk:_Attorney_at_Law'],
  'werewolf-by-night': ['Werewolf_by_Night_(film)', 'Werewolf_by_Night_(TV_special)'],
  'gotg-holiday': ['The_Guardians_of_the_Galaxy_Holiday_Special'],
  'secret-invasion': ['Secret_Invasion_(miniseries)', 'Secret_Invasion_(TV_series)'],
  echo: ['Echo_(miniseries)', 'Echo_(TV_series)'],
  agatha: ['Agatha_All_Along'],
  'ddba-s1': [S('Daredevil:_Born_Again', 1), 'Daredevil:_Born_Again'],
  'ddba-s2': [S('Daredevil:_Born_Again', 2), 'Daredevil:_Born_Again'],
  ironheart: ['Ironheart_(miniseries)', 'Ironheart_(TV_series)'],
  'eyes-of-wakanda': ['Eyes_of_Wakanda'],
  'marvel-zombies': ['Marvel_Zombies_(miniseries)', 'Marvel_Zombies_(TV_series)'],
  'marvel-zombies-tws': ['Marvel_Zombies_(miniseries)', 'Marvel_Zombies_(TV_series)'],
  'wonder-man': [
    'Wonder_Man_(miniseries)',
    'Wonder_Man_(TV_series)',
    'Wonder_Man_(American_TV_series)',
    'Wonder_Man_(2026_TV_series)',
  ],
  'punisher-olk': ['The_Punisher:_One_Last_Kill'],
  visionquest: ['VisionQuest', 'VisionQuest_(TV_series)'],
  'i-am-groot-s1': ['I_Am_Groot'],
  'i-am-groot-s2': ['I_Am_Groot'],

  'dd-s1': [S('Daredevil', 1)],
  'dd-s2': [S('Daredevil', 2)],
  'dd-s3': [S('Daredevil', 3)],
  'jj-s1': [S('Jessica_Jones', 1)],
  'jj-s2': [S('Jessica_Jones', 2)],
  'jj-s3': [S('Jessica_Jones', 3)],
  'lc-s1': [S('Luke_Cage', 1)],
  'lc-s2': [S('Luke_Cage', 2)],
  'if-s1': [S('Iron_Fist', 1)],
  'if-s2': [S('Iron_Fist', 2)],
  defenders: ['The_Defenders_(miniseries)'],
  'punisher-s1': [S('The_Punisher', 1)],
  'punisher-s2': [S('The_Punisher', 2)],

  'os-consultant': ['Marvel_One-Shots'],
  'os-funny-thing': ['Marvel_One-Shots'],
  'os-item-47': ['Item_47', 'Marvel_One-Shots'],
  'os-agent-carter': ['Agent_Carter_(film)', 'Marvel_One-Shots'],
  'os-all-hail-the-king': ['All_Hail_the_King', 'Marvel_One-Shots'],

  'aos-s1': [S('Agents_of_S.H.I.E.L.D.', 1)],
  'aos-s2': [S('Agents_of_S.H.I.E.L.D.', 2)],
  'aos-s3': [S('Agents_of_S.H.I.E.L.D.', 3)],
  'aos-s4': [S('Agents_of_S.H.I.E.L.D.', 4)],
  'aos-s5': [S('Agents_of_S.H.I.E.L.D.', 5)],
  'aos-s6': [S('Agents_of_S.H.I.E.L.D.', 6)],
  'aos-s7': [S('Agents_of_S.H.I.E.L.D.', 7)],
  'agent-carter-s1': [S('Agent_Carter', 1), 'Agent_Carter_(TV_series)'],
  'agent-carter-s2': [S('Agent_Carter', 2), 'Agent_Carter_(TV_series)'],
  slingshot: ['Agents_of_S.H.I.E.L.D.:_Slingshot'],
  'team-thor': ['Team_Thor', 'Marvel_One-Shots'],
  'team-thor-2': ['Team_Thor', 'Marvel_One-Shots'],
  'team-darryl': ['Team_Thor', 'Marvel_One-Shots'],
  'yfnsm-s1': [S('Your_Friendly_Neighborhood_Spider-Man', 1), 'Your_Friendly_Neighborhood_Spider-Man'],
  'yfnsm-s2': ['Your_Friendly_Neighborhood_Spider-Man'],
  'xmen97-s1': [S("X-Men_'97", 1), "X-Men_'97"],
  'xmen97-s2': [S("X-Men_'97", 2), "X-Men_'97"],

  'xmen-first-class': ['X-Men:_First_Class'],
  'xmen-origins-wolverine': ['X-Men_Origins:_Wolverine'],
  'xmen-2000': ['X-Men_(film)'],
  x2: ['X2_(film)'],
  'last-stand': ['X-Men:_The_Last_Stand'],
  'the-wolverine': ['The_Wolverine_(film)'],
  dofp: ['X-Men:_Days_of_Future_Past'],
  'xmen-apocalypse': ['X-Men:_Apocalypse'],
  'dark-phoenix': ['Dark_Phoenix_(film)'],
  logan: ['Logan_(film)'],
  deadpool: ['Deadpool_(film)'],
  'deadpool-2': ['Deadpool_2'],
  'raimi-1': ['Spider-Man_(2002_film)'],
  'raimi-2': ['Spider-Man_2'],
  'raimi-3': ['Spider-Man_3'],
  'webb-1': ['The_Amazing_Spider-Man_(film)'],
  'webb-2': ['The_Amazing_Spider-Man_2'],
  itsv: ['Spider-Man:_Into_the_Spider-Verse'],
  'spider-ham': ['Spider-Ham:_Caught_in_a_Ham'],
  'venom-2018': ['Venom_(2018_film)'],
  'venom-2': ['Venom:_Let_There_Be_Carnage'],
  'venom-3': ['Venom:_The_Last_Dance'],
  atsv: ['Spider-Man:_Across_the_Spider-Verse'],
  'spider-within': ['The_Spider_Within:_A_Spider-Verse_Story'],
  'howard-duck': ['Howard_the_Duck_(film)'],
  'man-thing': ['Man-Thing_(film)'],
  blade: ['Blade_(film)', 'Blade_(1998_film)'],
  'blade-2': ['Blade_II'],
  'blade-3': ['Blade:_Trinity'],
  'blade-series': ['Blade:_The_Series'],
  'daredevil-2003': ['Daredevil_(film)'],
  elektra: ['Elektra_(2005_film)'],
  'punisher-2004': ['The_Punisher_(2004_film)'],
  'punisher-wz': ['Punisher:_War_Zone'],
  'hulk-2003': ['Hulk_(film)'],
  'ghost-rider': ['Ghost_Rider_(2007_film)'],
  'ghost-rider-2': ['Ghost_Rider:_Spirit_of_Vengeance'],
  'ff-2005': ['Fantastic_Four_(2005_film)'],
  'ff-2007': ['Fantastic_Four:_Rise_of_the_Silver_Surfer'],
  'ff-2015': ['Fantastic_Four_(2015_film)'],
  'new-mutants': ['The_New_Mutants_(film)'],
  'legion-s1': [S('Legion', 1), 'Legion_(TV_series)'],
  'legion-s2': [S('Legion', 2), 'Legion_(TV_series)'],
  'legion-s3': [S('Legion', 3), 'Legion_(TV_series)'],
  'gifted-s1': [S('The_Gifted', 1), 'The_Gifted_(American_TV_series)'],
  'gifted-s2': [S('The_Gifted', 2), 'The_Gifted_(American_TV_series)'],
  inhumans: ['Inhumans_(TV_series)'],
  'runaways-s1': [S('Runaways', 1), 'Runaways_(2017_TV_series)'],
  'runaways-s2': [S('Runaways', 2), 'Runaways_(2017_TV_series)'],
  'runaways-s3': [S('Runaways', 3), 'Runaways_(2017_TV_series)'],
  'cloak-dagger-s1': [S('Cloak_&_Dagger', 1), 'Cloak_&_Dagger_(TV_series)'],
  'cloak-dagger-s2': [S('Cloak_&_Dagger', 2), 'Cloak_&_Dagger_(TV_series)'],
  helstrom: ['Helstrom_(TV_series)'],
  morbius: ['Morbius_(film)'],
  'madame-web': ['Madame_Web_(film)'],
  kraven: ['Kraven_the_Hunter_(film)'],
  'spider-noir': ['Spider-Noir_(TV_series)', 'Spider-Noir'],
  'beyond-spider-verse': ['Spider-Man:_Beyond_the_Spider-Verse'],
  'expanding-universe': ['Marvel_Studios:_Expanding_the_Universe'],
  legends: ['Marvel_Studios:_Legends'],
  assembled: ['Marvel_Studios:_Assembled'],
};

const UA = 'mcu-watch-planner/1.0 (personal fan project)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (t) => t.replace(/_/g, ' ');

/** Batch lookup of lead images (up to 50 pages per request). Returns normalized title -> image url. */
async function pageImages(pages) {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'pageimages',
    piprop: 'thumbnail|original',
    pithumbsize: '500',
    pilicense: 'any',
    redirects: '1',
    format: 'json',
    formatversion: '2',
    titles: pages.map(norm).join('|'),
  });
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers: { 'User-Agent': UA } });
    if (res.status === 429 || res.status >= 500) {
      await sleep(2000 * (attempt + 1));
      continue;
    }
    const data = await res.json();
    const alias = new Map(); // requested title -> final title
    for (const n of data.query?.normalized ?? []) alias.set(n.from, n.to);
    for (const r of data.query?.redirects ?? []) alias.set(r.from, r.to);
    const final = (t) => {
      let cur = t;
      for (let i = 0; i < 3 && alias.has(cur); i++) cur = alias.get(cur);
      return cur;
    };
    const images = new Map();
    for (const p of data.query?.pages ?? []) {
      const src = p.thumbnail?.source ?? p.original?.source;
      if (src) images.set(p.title, src.split('?')[0]);
    }
    const out = new Map();
    for (const t of pages) {
      const img = images.get(final(norm(t)));
      if (img) out.set(t, img);
    }
    return out;
  }
  throw new Error('Wikipedia kept rate-limiting; try again later.');
}

const ids = TITLES.filter((t) => t.kind !== 'block' && t.kind !== 'scene').map((t) => t.id);
const allPages = [...new Set(ids.flatMap((id) => PAGES[id] ?? []))];
const found = new Map();
for (let i = 0; i < allPages.length; i += 50) {
  const batch = await pageImages(allPages.slice(i, i + 50));
  for (const [k, v] of batch) found.set(k, v);
  await sleep(500);
}

const out = {};
const missing = [];
for (const id of ids) {
  const page = (PAGES[id] ?? []).find((p) => found.has(p));
  if (page) out[id] = found.get(page);
  else missing.push(id);
}

const sorted = out;
const file = `// Generated by scripts/fetch-posters.js from Wikipedia page summaries. Do not edit by hand.\nexport const POSTERS = ${JSON.stringify(sorted, null, 2)};\n`;
fs.writeFileSync(new URL('../src/data/posters.js', import.meta.url), file);
console.log(`Posters: ${Object.keys(sorted).length}/${ids.length}`);
console.log(`Missing (${missing.length}): ${missing.join(', ')}`);

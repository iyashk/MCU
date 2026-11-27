/**
 * Looks up where each title streams in India using JustWatch's public data and writes src/data/india.js.
 * Run: node scripts/fetch-india.js
 * Availability changes month to month, so re-run this before deploying to keep the site current.
 * Episode blocks and relocated scenes reuse their parent's entry at render time, so they are not looked up.
 */
import fs from 'node:fs';
import { TITLES } from '../src/data/titles.js';

const API = 'https://apis.justwatch.com/graphql';
const OUT = new URL('../src/data/india.js', import.meta.url);

/** id -> [search query] where the title in our data doesn't search well on its own */
const QUERY = {
  'f4-first-steps': ['The Fantastic 4: First Steps'],
  'os-consultant': ['Marvel One-Shot: The Consultant'],
  'os-funny-thing': ["Marvel One-Shot: A Funny Thing Happened on the Way to Thor's Hammer"],
  'os-item-47': ['Marvel One-Shot: Item 47'],
  'os-agent-carter': ['Marvel One-Shot: Agent Carter'],
  'os-all-hail-the-king': ['Marvel One-Shot: All Hail the King'],
  'expanding-universe': ['Marvel Studios: Expanding the Universe'],
  'halloween-team-up': ['Spidey and His Amazing Friends Halloween'],
  'blade-series': ['Blade: The Series'],
  'no-good-deed': ['No Good Deed Deadpool'],
};

const STREAM = new Set(['FLATRATE', 'FREE', 'ADS']);
const PAID = new Set(['RENT', 'BUY']);

const RENAME = {
  'Apple TV Store': 'Apple TV',
  'Amazon Video': 'Prime Video',
  'Amazon Prime Video': 'Prime Video',
  'Amazon Prime Video with Ads': 'Prime Video',
  'Sony Liv': 'SonyLIV',
  'VI movies and tv': 'Vi Movies & TV',
  Zee5: 'ZEE5',
  'Google Play Movies': 'Google Play',
  'Netflix basic with Ads': 'Netflix',
};

const RANK = ['JioHotstar', 'Netflix', 'Prime Video', 'SonyLIV', 'ZEE5', 'Apple TV', 'YouTube', 'Google Play', 'Vi Movies & TV'];
const rank = (name) => {
  const i = RANK.indexOf(name);
  return i === -1 ? RANK.length : i;
};

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/^marvel'?s\s+/, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/^the/, '');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const OFFER = 'offers(country: IN, platform: WEB) { monetizationType standardWebURL package { clearName } }';
const GQL = `query($q: String!) {
  popularTitles(country: IN, first: 8, filter: { searchQuery: $q }) {
    edges { node {
      objectType
      content(country: IN, language: "en") { title originalReleaseYear fullPath }
      ${OFFER}
      ... on Show { seasons { content(country: IN, language: "en") { seasonNumber } ${OFFER} } }
    } }
  }
}`;

async function search(q) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: GQL, variables: { q } }),
    });
    if (res.status === 429 || res.status >= 500) {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    const json = await res.json();
    return json.data?.popularTitles?.edges?.map((e) => e.node) ?? [];
  }
  throw new Error(`JustWatch kept failing for "${q}"`);
}

/** Splits our title into what to search for, plus season number for series. */
function describe(t) {
  const clean = t.title.replace(/\s*\((not MCU|short)\)\s*$/, '');
  const m = clean.match(/^(.*?): Season (\d+)$/);
  const show = t.kind === 'season' ? (m ? m[1] : clean) : null;
  return {
    query: QUERY[t.id]?.[0] ?? show ?? clean,
    name: show ?? clean,
    season: t.kind === 'season' ? Number(m?.[2] ?? 1) : null,
    type: t.kind === 'film' ? 'MOVIE' : t.kind === 'season' ? 'SHOW' : null,
  };
}

const showStart = new Map();
for (const t of TITLES) {
  if (t.kind !== 'season') continue;
  const { name } = describe(t);
  const y = Number(t.release.slice(0, 4));
  showStart.set(name, Math.min(showStart.get(name) ?? y, y));
}

function pick(nodes, t, d) {
  const year = d.season ? showStart.get(d.name) : Number(t.release.slice(0, 4));
  const want = [norm(d.name), norm(d.query)];
  let best = null;
  let bestScore = 0;
  for (const n of nodes) {
    if (d.type && n.objectType !== d.type) continue;
    const got = norm(n.content.title);
    const exact = want.includes(got);
    const loose = !exact && want.some((w) => w.length > 5 && (got.includes(w) || w.includes(got)) && Math.abs(got.length - w.length) <= 12);
    if (!exact && !loose) continue;
    const dy = Math.abs((n.content.originalReleaseYear ?? 0) - year);
    if (dy > 1) continue;
    const score = (exact ? 4 : 2) + (dy === 0 ? 1 : 0);
    if (score > bestScore) {
      best = n;
      bestScore = score;
    }
  }
  return best;
}

function summarize(offers) {
  const stream = new Map();
  const paid = new Set();
  let cinema = false;
  const channels = [];
  for (const o of offers ?? []) {
    const raw = o.package.clearName;
    if (o.monetizationType === 'CINEMA') {
      cinema = true;
      continue;
    }
    if (/Amazon Channel$/i.test(raw)) {
      if (STREAM.has(o.monetizationType)) channels.push(o);
      continue;
    }
    const name = RENAME[raw] ?? raw;
    if (STREAM.has(o.monetizationType) && !stream.has(name)) stream.set(name, o.standardWebURL);
    else if (PAID.has(o.monetizationType)) paid.add(name);
  }
  if (!stream.size && channels.length) stream.set('Prime Video add-on', channels[0].standardWebURL);
  for (const s of stream.keys()) paid.delete(s);
  const out = {
    stream: [...stream].sort((a, b) => rank(a[0]) - rank(b[0])),
    rent: [...paid].sort((a, b) => rank(a) - rank(b)),
  };
  if (cinema) out.cinema = true;
  return out;
}

async function lookup(t) {
  const d = describe(t);
  let node = pick(await search(d.query), t, d);
  if (!node && d.query !== d.name) node = pick(await search(d.name), t, d);
  if (!node) return null;
  let offers = node.offers;
  if (d.season && node.seasons?.length) {
    const s = node.seasons.find((x) => x.content.seasonNumber === d.season);
    offers = s ? s.offers : [];
  }
  return { jw: node.content.fullPath, ...summarize(offers) };
}

const todo = TITLES.filter((t) => t.kind !== 'block' && t.kind !== 'scene');
const result = {};
const missing = [];
let i = 0;
async function worker() {
  while (i < todo.length) {
    const t = todo[i++];
    try {
      const r = await lookup(t);
      if (r) result[t.id] = r;
      else missing.push(t.id);
    } catch (e) {
      missing.push(t.id);
      console.error(t.id, e.message);
    }
    await sleep(150);
  }
}
await Promise.all([worker(), worker(), worker()]);

const ordered = Object.fromEntries(todo.filter((t) => result[t.id]).map((t) => [t.id, result[t.id]]));
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  OUT,
  `// Generated by scripts/fetch-india.js from JustWatch India on ${today}. Do not edit by hand; re-run the script.\n` +
    `// stream: [service, link] included with a subscription or free. rent: services that rent or sell it.\n\n` +
    `export const INDIA_CHECKED = '${today}';\n\n` +
    `export const INDIA = ${JSON.stringify(ordered, null, 1)};\n`,
);

const streaming = Object.values(ordered).filter((r) => r.stream.length).length;
console.log(`Matched ${Object.keys(ordered).length}/${todo.length} titles; ${streaming} stream on a subscription service.`);
console.log(`No match: ${missing.join(', ') || 'none'}`);
const noStream = todo.filter((t) => ordered[t.id] && !ordered[t.id].stream.length).map((t) => t.id);
console.log(`Matched but no subscription home: ${noStream.join(', ') || 'none'}`);

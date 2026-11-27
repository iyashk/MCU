import { TITLES, TITLE_BY_ID } from './data/titles.js';
import { RELEASE_ENTRIES, STORY_ENTRIES } from './data/order.js';
import { DOOMSDAY_PREP } from './data/story.js';
import { POSTERS } from './data/posters.js';
import { INDIA, INDIA_CHECKED } from './data/india.js';

/** @typedef {import('./data/titles.js').Title} Title */

const STORAGE_KEY = 'mcu-planner-v1';
const DOOM = new Set(DOOMSDAY_PREP);
const TODAY = new Date().toISOString().slice(0, 10);

const TIERS = [
  { id: 1, label: 'Core canon', color: 'var(--t1)', hint: "Disney+'s official MCU timeline, plus Brand New Day and Doomsday" },
  { id: 2, label: 'Canon-adjacent', color: 'var(--t2)', hint: 'Agents of S.H.I.E.L.D., Agent Carter, Team Thor, X-Men \u201997, Your Friendly Neighborhood Spider-Man' },
  { id: 3, label: 'Other universes', color: 'var(--t3)', hint: 'Fox X-Men, other Spider-Man films, Venom, Spider-Verse, old Marvel films and shows' },
  { id: 4, label: 'Bonus', color: 'var(--t4)', hint: 'Documentaries, recap clips and in-universe news clips' },
];
const TIER_BY_ID = Object.fromEntries(TIERS.map((t) => [t.id, t]));

const KINDS = [
  { id: 'film', label: 'Films', icon: 'film' },
  { id: 'series', label: 'Series', icon: 'tv' },
  { id: 'short', label: 'Shorts & specials', icon: 'spark' },
  { id: 'bonus', label: 'Docs & clips', icon: 'clip' },
];

const KIND_GROUP = {
  film: 'film',
  season: 'series',
  block: 'series',
  'one-shot': 'short',
  short: 'short',
  special: 'short',
  doc: 'bonus',
  viral: 'bonus',
  scene: 'scene',
};

const KIND_LABEL = {
  film: 'Film',
  season: 'Series',
  block: 'Episodes',
  'one-shot': 'One-shot',
  short: 'Short',
  special: 'Special',
  scene: 'Scene',
  doc: 'Documentary',
  viral: 'Clip',
};

const ERA_INFO = {
  'Before the MCU': ['Prologue', 'Marvel on screen before Iron Man'],
  'Phase One': ['The Infinity Saga', 'The Avengers Initiative'],
  'Phase Two': ['The Infinity Saga', 'Age of Ultron'],
  'Phase Three': ['The Infinity Saga', 'Infinity War & Endgame'],
  'Phase Four': ['The Multiverse Saga', 'Legacy'],
  'Phase Five': ['The Multiverse Saga', 'Secret Invasion era'],
  'Phase Six': ['The Multiverse Saga', 'Doomsday & Secret Wars'],
};

const CONF_LABEL = {
  official: "Official (Disney+ timeline)",
  derived: 'Derived (Chronologeek / tie-ins)',
  disputed: 'Disputed: sources disagree',
  unplaced: 'No canonical placement',
};

/* ------------------------------ icons ------------------------------ */

const svg = (d, extra = '') =>
  `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;

const ICON = {
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  skip: svg('<path d="m5 4 10 8-10 8V4z"/><path d="M19 5v14"/>'),
  info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
  search: svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  grid: svg('<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="9" rx="1"/><rect x="3" y="15" width="7" height="6" rx="1"/><rect x="14" y="15" width="7" height="6" rx="1"/>'),
  list: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
  film: svg('<rect x="2" y="2" width="20" height="20" rx="2.5"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>'),
  clock: svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
  cal: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
  orbit: svg('<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-25 12 12)"/>'),
  hourglass: svg('<path d="M5 22h14M5 2h14M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>'),
  play: svg('<polygon points="6 3 20 12 6 21 6 3"/>', 'fill="currentColor"'),
  warn: svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4M12 17h.01"/>'),
  x: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
  left: svg('<path d="m15 18-6-6 6-6"/>'),
  right: svg('<path d="m9 18 6-6-6-6"/>'),
  target: svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  tv: svg('<rect x="2" y="7" width="20" height="15" rx="2"/><path d="m17 2-5 5-5-5"/>'),
  spark: svg('<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 17v4M17 19h4"/>'),
  clip: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>'),
  flame: svg('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
  download: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>'),
  upload: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>'),
  undo: svg('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>'),
  trash: svg('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>'),
  external: svg('<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
};

/* ------------------------------ state ------------------------------ */

const defaults = () => ({
  mode: 'release',
  view: 'grid',
  tiers: [1, 2, 3, 4],
  kinds: KINDS.map((k) => k.id),
  doomsday: false,
  hideDone: false,
  splits: true,
  hoursPerWeek: 10,
  query: '',
  spoilerTipHidden: false,
  progress: {}, // id -> 'w' (watched) | 's' (skipped)
});

/** Keeps only marks for titles that exist, so an old save or a hand-edited backup can't break rendering. */
function cleanProgress(p) {
  const out = {};
  if (!p || typeof p !== 'object') return out;
  for (const [id, m] of Object.entries(p)) if (TITLE_BY_ID.has(id) && (m === 'w' || m === 's')) out[id] = m;
  return out;
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return defaults();
    return { ...defaults(), ...saved, progress: cleanProgress(saved.progress), query: '' };
  } catch {
    return defaults();
  }
}

const state = load();

// A #story or #release hash in the URL wins over the saved mode, so a mode can be linked to directly.
const hashMode = location.hash.replace('#', '');
if (hashMode === 'story' || hashMode === 'release') state.mode = hashMode;

let storageOk = true;

function save() {
  try {
    const { query, ...persisted } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    storageOk = true;
  } catch {
    if (storageOk) toast("Couldn't save: this browser is blocking local storage", true);
    storageOk = false;
  }
}

// Asked on the first mark rather than on load: Firefox shows a permission prompt for this.
let persistAsked = false;
function askPersist() {
  if (persistAsked) return;
  persistAsked = true;
  navigator.storage?.persist?.().catch(() => {});
}

let toastTimer;
function toast(msg, isError = false) {
  let node = document.getElementById('toast');
  if (!node) {
    node = Object.assign(document.createElement('div'), { id: 'toast', className: 'toast' });
    node.setAttribute('role', 'status');
    document.body.append(node);
  }
  node.innerHTML = `${isError ? ICON.warn : ICON.check}<span>${esc(msg)}</span>`;
  node.classList.toggle('err', isError);
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 2600);
}

function exportProgress() {
  const data = {
    app: 'mcu-marathon',
    version: 1,
    exportedAt: new Date().toISOString(),
    hoursPerWeek: state.hoursPerWeek,
    progress: state.progress,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `mcu-marathon-progress-${TODAY}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`Backup downloaded · ${Object.keys(state.progress).length} marks`);
}

async function importProgress(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    return toast("That file isn't a valid backup", true);
  }
  const progress = cleanProgress(data?.progress);
  const n = Object.keys(progress).length;
  if (!n) return toast('No watch progress found in that file', true);
  const current = Object.keys(state.progress).length;
  if (current && !confirm(`Replace your current progress (${current} marks) with this backup (${n} marks)?`)) return;
  state.progress = progress;
  if (Number(data.hoursPerWeek) > 0) state.hoursPerWeek = Number(data.hoursPerWeek);
  renderAll();
  toast(`Restored ${n} marks from backup`);
}

/* --------------------------- progress helpers --------------------------- */

const blocksOf = new Map();
for (const t of TITLES) {
  if (t.kind === 'block' && t.parent) {
    if (!blocksOf.has(t.parent)) blocksOf.set(t.parent, []);
    blocksOf.get(t.parent).push(t.id);
  }
}

/** 'w' | 's' | null. A season with blocks is derived from its blocks when it has no mark of its own. */
function status(id) {
  const own = state.progress[id];
  if (own) return own;
  const blocks = blocksOf.get(id);
  if (!blocks) return null;
  const marks = blocks.map((b) => state.progress[b]);
  if (marks.some((m) => !m)) return null;
  return marks.every((m) => m === 's') ? 's' : 'w';
}

function setMark(id, mark) {
  for (const i of [id, ...(blocksOf.get(id) ?? [])]) {
    if (mark) state.progress[i] = mark;
    else delete state.progress[i];
  }
}

function toggle(id, mark) {
  setMark(id, status(id) === mark ? null : mark);
}

/* ------------------------------ filtering ------------------------------ */

const isUpcoming = (t) => t.release > TODAY;

function passes(t) {
  if (state.doomsday) {
    if (!(DOOM.has(t.id) || (t.kind === 'scene' && DOOM.has(t.parent)))) return false;
  } else if (!state.tiers.includes(t.tier)) {
    return false;
  }
  const group = KIND_GROUP[t.kind];
  if (group !== 'scene' && !state.kinds.includes(group)) return false;
  if (state.hideDone && status(t.id)) return false;
  if (state.query) {
    const hay = `${t.title} ${t.universe} ${t.when} ${t.note ?? ''} ${t.platform} ${t.release.slice(0, 4)}`.toLowerCase();
    if (!state.query.split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  return true;
}

function currentItems() {
  const entries = state.mode === 'release' ? RELEASE_ENTRIES : STORY_ENTRIES;
  const out = [];
  const seenParents = new Set();
  for (const e of entries) {
    let t = e.title;
    if (state.mode === 'story' && !state.splits) {
      if (t.kind === 'scene') continue;
      if (t.kind === 'block') {
        // collapse a split season back into one entry, at the position of its first block
        if (seenParents.has(t.parent)) continue;
        seenParents.add(t.parent);
        t = TITLE_BY_ID.get(t.parent);
      }
    }
    if (passes(t)) out.push({ t, section: e.section });
  }
  return out.map((it, i) => ({ ...it, n: i + 1 }));
}

const nextOf = (items) => items.find((i) => !status(i.t.id) && !isUpcoming(i.t)) ?? null;

/* ------------------------------ formatting ------------------------------ */

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function fmtRuntime(min) {
  if (!min) return '';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`;
}

function fmtDate(t, long = false) {
  const d = new Date(`${t.release}T00:00:00Z`);
  if (t.dp === 'y') return `${d.getUTCFullYear()} · date TBA`;
  if (t.dp === 'm') return `${d.toLocaleDateString('en-US', { month: long ? 'long' : 'short', year: 'numeric', timeZone: 'UTC' })} (approx.)`;
  return d.toLocaleDateString('en-US', { month: long ? 'long' : 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

const year = (t) => t.release.slice(0, 4);

function runtimeLabel(t) {
  const rt = fmtRuntime(t.runtime);
  if (t.eps) return `${t.eps} eps${rt ? ` · ~${rt}` : ''}`;
  return rt;
}

/* ------------------------------ artwork ------------------------------ */

const posterOf = (t) => POSTERS[t.id] ?? (t.parent ? POSTERS[t.parent] : undefined);
const isLogo = (src) => /logo/i.test(src);

const PALETTES = [
  [/spider|venom|morbius|kraven|madame web/i, '#e62429', '#1e5bd6'],
  [/deadpool/i, '#c1121f', '#2b0a0d'],
  [/x-men|x2|wolverine|logan|mutants|gifted|legion|phoenix/i, '#f5c451', '#1e40af'],
  [/iron man|ironheart/i, '#d4202b', '#f5b83d'],
  [/captain america|falcon|first avenger|brave new world/i, '#1f4fd1', '#d4202b'],
  [/thor|darryl/i, '#4aa3ff', '#94a3b8'],
  [/hulk/i, '#3fb950', '#7c3aed'],
  [/guardians|groot/i, '#a855f7', '#ff8a3d'],
  [/daredevil|elektra|punisher|defenders|jessica|luke cage|iron fist|echo/i, '#9b111e', '#2b2d42'],
  [/agatha/i, '#7c3aed', '#16a34a'],
  [/loki|vision|wanda/i, '#16a34a', '#c9a227'],
  [/panther|wakanda/i, '#7c3aed', '#94a3b8'],
  [/strange|eternals|shang/i, '#ff8a3d', '#14b8a6'],
  [/ant-man|wasp|quantumania/i, '#e11d48', '#64748b'],
  [/fantastic|first steps/i, '#2563eb', '#e5e7eb'],
  [/blade|ghost rider|werewolf|man-thing|helstrom/i, '#7f1d1d', '#f97316'],
  [/s\.h\.i\.e\.l\.d|carter|slingshot|whih|bugle/i, '#334155', '#38bdf8'],
  [/avengers|secret wars|doomsday|thunderbolts|wonder man|marvel/i, '#e62429', '#7c3aed'],
];

function palette(t) {
  for (const [re, a, b] of PALETTES) if (re.test(t.title)) return [a, b];
  let h = 0;
  for (const c of t.title) h = (h * 31 + c.charCodeAt(0)) % 360;
  return [`hsl(${h} 70% 50%)`, `hsl(${(h + 70) % 360} 70% 38%)`];
}

function posterHtml(t, { lazy = true } = {}) {
  const src = posterOf(t);
  const [a, b] = palette(t);
  const logo = src && isLogo(src);
  const art = `<div class="art${logo ? ' bare' : ''}" style="--a:${a};--b:${b}"><span class="art-kind">${esc(KIND_LABEL[t.kind])}</span><span class="art-title">${esc(t.title)}</span></div>`;
  if (!src) return art;
  return `${art}<img src="${esc(src)}" alt="" ${lazy ? 'loading="lazy"' : ''} decoding="async" referrerpolicy="no-referrer" class="${logo ? 'logo' : ''}" onerror="this.previousElementSibling.classList.remove('bare');this.remove()">`;
}

/* ------------------------------ India streaming ------------------------------ */

const OTT_COLOR = {
  JioHotstar: '#2f6bff',
  Netflix: '#e50914',
  'Prime Video': '#00a8e1',
  'Prime Video add-on': '#00a8e1',
  SonyLIV: '#f2a900',
  ZEE5: '#8b3fd9',
  'Apple TV': '#d1d5db',
  YouTube: '#ff0033',
  'Vi Movies & TV': '#ee2a7b',
};

const indiaOf = (t) => INDIA[t.id] ?? (t.parent ? INDIA[t.parent] : undefined);

const checkedOn = new Date(`${INDIA_CHECKED}T00:00:00Z`).toLocaleDateString('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function ottChip(name, href) {
  const style = `style="--b:${OTT_COLOR[name] ?? '#9ba1b5'}"`;
  return href
    ? `<a class="ott" ${style} href="${esc(href)}" target="_blank" rel="noopener"><i></i>${esc(name)}${ICON.external}</a>`
    : `<span class="ott" ${style}><i></i>${esc(name)}</span>`;
}

function indiaHtml(t) {
  const r = indiaOf(t);
  const base = t.parent ? TITLE_BY_ID.get(t.parent) : t;
  const jw = r?.jw
    ? `https://www.justwatch.com${r.jw}`
    : `https://www.justwatch.com/in/search?q=${encodeURIComponent(base.title.replace(/\s*\(.*?\)\s*$/, ''))}`;
  let body;
  if (r?.stream.length) {
    body = `<div class="ott-row">${r.stream.map(([name, href]) => ottChip(name, href)).join('')}</div>`;
  } else if (r?.cinema) {
    body = `<div class="ott-row"><span class="ott cinema"><i></i>${isUpcoming(t) ? 'Coming to cinemas · advance booking open' : 'In cinemas now'}</span></div>`;
  } else if (isUpcoming(t)) {
    body = `<p class="india-none">Not released yet.</p>`;
  } else if (/youtube/i.test(t.platform)) {
    body = `<div class="ott-row">${ottChip('YouTube')}</div><p class="india-sub">Free on Marvel's YouTube channel.</p>`;
  } else {
    body = `<p class="india-none">${r ? 'Not on any Indian subscription service right now.' : 'Not listed on Indian streaming services.'}</p>`;
  }
  const rent = r?.rent.length ? `<p class="india-sub">Rent or buy: ${r.rent.map(esc).join(', ')}</p>` : '';
  return `
    <section class="india">
      <div class="india-head">
        <span class="india-flag" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="india-title">Where to watch in India</span>
        <span class="india-date">Checked ${esc(checkedOn)}</span>
      </div>
      ${body}${rent}
      <a class="india-jw" href="${esc(jw)}" target="_blank" rel="noopener">Live prices and more options on JustWatch ${ICON.external}</a>
    </section>`;
}

/* ------------------------------ shell ------------------------------ */

const app = document.getElementById('app');

const marqueeIds = TITLES.filter((t) => t.tier === 1 && t.kind === 'film' && POSTERS[t.id] && !isLogo(POSTERS[t.id])).map(
  (t) => t.id,
);
const half = Math.ceil(marqueeIds.length / 2);
const trackHtml = (ids) =>
  [...ids, ...ids].map((id) => `<img src="${esc(POSTERS[id])}" alt="" decoding="async" referrerpolicy="no-referrer">`).join('');

app.innerHTML = `
<section class="hero">
  <div class="marquee" aria-hidden="true">
    <div class="track">${trackHtml(marqueeIds.slice(0, half))}</div>
    <div class="track rev">${trackHtml(marqueeIds.slice(half))}</div>
  </div>
  <div class="wrap">
    <nav class="nav">
      <div class="brand"><span class="logo">MARVEL</span> MARATHON</div>
      <div class="nav-meta">${TITLES.filter((t) => t.inRelease).length} titles · films, series, one-shots, specials &amp; clips</div>
    </nav>

    <div class="hero-grid">
      <div>
        <span class="eyebrow"><span class="dot"></span> Every Marvel story, one watchlist</span>
        <h1>Watch the <span class="grad">entire MCU</span><br />your way.</h1>
        <p class="lede">From <b>Howard the Duck</b> to <b>Avengers: Doomsday</b>. Pick how you want to experience it, then tick off every film, series, one-shot and post-credits scene as you go.</p>

        <div class="modes" role="group" aria-label="Viewing order">
          <button class="mode-card" data-mode="release">
            <div class="mc-top"><span class="mc-icon">${ICON.film}</span><span class="mc-radio"></span></div>
            <h3>Release Order</h3>
            <p>The way audiences saw it unfold. Best for a first watch, with no spoilers.</p>
            <div class="mc-range">1986 → 2027</div>
          </button>
          <button class="mode-card" data-mode="story">
            <div class="mc-top"><span class="mc-icon">${ICON.hourglass}</span><span class="mc-radio"></span></div>
            <h3>Story Order</h3>
            <p>In-universe chronology, from ancient Wakanda to the multiverse. Best for a rewatch.</p>
            <div class="mc-range">1260 BC → 2028</div>
          </button>
        </div>
      </div>

      <div class="side">
        <div class="glass countdown">
          <div class="cd-label" id="cd-label">Countdown</div>
          <div class="cd-title">Avengers: Doomsday</div>
          <div class="cd-boxes">
            <div class="cd-box"><b id="cd-d">--</b><span>Days</span></div>
            <div class="cd-box"><b id="cd-h">--</b><span>Hours</span></div>
            <div class="cd-box"><b id="cd-m">--</b><span>Mins</span></div>
            <div class="cd-box"><b id="cd-s">--</b><span>Secs</span></div>
          </div>
          <div class="cd-foot">In theaters 17 Dec 2026 in India · 18 Dec in the US</div>
        </div>

        <div class="glass progress-card">
          <div class="ring">
            <svg viewBox="0 0 120 120">
              <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e62429"/><stop offset="60%" stop-color="#ff8a3d"/><stop offset="100%" stop-color="#f6c453"/></linearGradient></defs>
              <circle class="track-c" cx="60" cy="60" r="50"/>
              <circle class="fill-c" id="ring-fill" cx="60" cy="60" r="50" stroke-dasharray="314.16" stroke-dashoffset="314.16"/>
            </svg>
            <div class="ring-txt"><b id="ring-pct">0%</b><span>watched</span></div>
          </div>
          <div class="pstats" id="pstats"></div>
          <div class="vault" id="vault">
            <span class="vault-dot"></span>
            <span class="vault-msg" id="vault-msg">Saved in this browser</span>
            <div class="vault-acts">
              <button id="export" title="Download your progress as a backup file">${ICON.download} Export</button>
              <button id="import" title="Restore progress from a backup file">${ICON.upload} Import</button>
              <button id="reset" class="danger" title="Clear all watched and skipped marks" aria-label="Clear all progress">${ICON.trash}</button>
            </div>
            <input type="file" id="import-file" accept=".json,application/json" hidden />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="wrap upnext-wrap" id="spotlight"></div>

<div class="toolbar" id="toolbar">
  <div class="wrap">
    <div class="panel">
      <div class="tb-main">
        <div class="seg order" role="group" aria-label="Order">
          <span class="seg-thumb" aria-hidden="true"></span>
          <button data-mode="release">${ICON.film} Release</button>
          <button data-mode="story">${ICON.hourglass} Story</button>
        </div>
        <label class="search">${ICON.search}<input id="q" type="search" placeholder="Search titles, characters, years, platforms…" autocomplete="off" /><kbd>/</kbd></label>
        <button class="preset" id="doom" data-doom="1" title="Only the titles picked by Countdown to Doom">${ICON.flame}<span class="pl">Doomsday prep</span><small></small></button>
        <div class="seg icons" role="group" aria-label="Layout">
          <button data-view="grid" title="Poster grid" aria-label="Poster grid">${ICON.grid}</button>
          <button data-view="list" title="Compact list" aria-label="Compact list">${ICON.list}</button>
        </div>
      </div>
      <div class="tb-filters">
        <div class="fgroup" id="tier-group" role="group" aria-label="Universe"><span class="flabel">Universe</span><span id="tier-chips" class="fchips"></span></div>
        <div class="fgroup" role="group" aria-label="Format"><span class="flabel">Format</span><span id="kind-chips" class="fchips"></span></div>
      </div>
      <div class="tb-meta">
        <p class="summary" id="summary"></p>
        <div class="opts">
          <label class="toggle" id="splits-wrap" title="Show interleaved episode ranges and relocated post-credits scenes"><input type="checkbox" data-opt="splits" /> Split seasons &amp; scenes</label>
          <label class="toggle"><input type="checkbox" data-opt="hideDone" /> Hide watched</label>
          <button class="link-btn" id="clear-filters" hidden>${ICON.undo} Clear filters</button>
        </div>
      </div>
    </div>
  </div>
</div>

<main class="wrap">
  <div id="callout"></div>
  <div id="content"></div>
</main>

<footer class="foot">
  <div class="wrap foot-grid">
    <div>
      <h4>How the orders are built</h4>
      <ul>
        <li><b>Release order</b> sorts every title by US release date, grouped by Marvel Studios phase. Post-credits scenes stay inside their film.</li>
        <li><b>Story order</b> follows Disney+'s official MCU timeline. Agents of S.H.I.E.L.D., Agent Carter, Team Thor and the Spider-Verse and Fox X-Men segments are slotted in following Chronologeek. Placements marked derived or disputed are judgment calls, shown in each title's details.</li>
        <li>TV runtimes are estimates (episodes × typical length). Posters come from Wikipedia.</li>
        <li><b>Where to watch in India</b> comes from <a href="https://www.justwatch.com/in" target="_blank" rel="noopener">JustWatch India</a>, checked ${esc(checkedOn)}. Streaming deals change, so use the JustWatch link in each title for the latest.</li>
        <li><b>Doomsday prep</b> narrows the list to the titles picked by Countdown to Doom.</li>
      </ul>
    </div>
    <div>
      <h4>Sources</h4>
      <ul>
        <li><a href="https://www.marvel.com/articles/movies/mcu-timeline-order-disney-plus" target="_blank" rel="noopener">Marvel.com: Disney+ MCU timeline</a></li>
        <li><a href="https://chronologeek.app/marvel" target="_blank" rel="noopener">Chronologeek</a> · <a href="https://marathon.odyssey616.com" target="_blank" rel="noopener">Odyssey 616 Marathon</a></li>
        <li><a href="https://countdowntodoom.vercel.app/#planner" target="_blank" rel="noopener">Countdown to Doom</a> · <a href="https://chronolists.com/mcu" target="_blank" rel="noopener">Chronolists</a></li>
        <li><a href="https://en.wikipedia.org/wiki/Marvel_Cinematic_Universe" target="_blank" rel="noopener">Wikipedia</a></li>
      </ul>
      <p>Unofficial fan project, not affiliated with Marvel or Disney. Your progress never leaves this browser: there are no accounts and nothing is sent to a server. Use Export to back it up or move it to another device.</p>
    </div>
  </div>
</footer>

<div class="modal" id="modal" aria-hidden="true">
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="m-title" id="sheet"></div>
</div>`;

const el = {
  q: document.getElementById('q'),
  tierChips: document.getElementById('tier-chips'),
  kindChips: document.getElementById('kind-chips'),
  splitsWrap: document.getElementById('splits-wrap'),
  callout: document.getElementById('callout'),
  content: document.getElementById('content'),
  spotlight: document.getElementById('spotlight'),
  pstats: document.getElementById('pstats'),
  ringFill: document.getElementById('ring-fill'),
  ringPct: document.getElementById('ring-pct'),
  toolbar: document.getElementById('toolbar'),
  modal: document.getElementById('modal'),
  sheet: document.getElementById('sheet'),
  tierGroup: document.getElementById('tier-group'),
  doom: document.getElementById('doom'),
  summary: document.getElementById('summary'),
  clearFilters: document.getElementById('clear-filters'),
  vault: document.getElementById('vault'),
  vaultMsg: document.getElementById('vault-msg'),
  importFile: document.getElementById('import-file'),
};

el.tierChips.innerHTML = TIERS.map(
  (t) =>
    `<button class="chip" data-tier="${t.id}" style="--c:${t.color}" title="${esc(t.hint)}"><span class="sw"></span>${esc(t.label)}<small></small></button>`,
).join('');

el.kindChips.innerHTML = KINDS.map(
  (k) => `<button class="chip" data-kind="${k.id}" style="--c:#dfe4f2">${ICON[k.icon]}${esc(k.label)}</button>`,
).join('');

/* ------------------------------ countdown ------------------------------ */

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const DOOMSDAY_AT =
  tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta'
    ? new Date('2026-12-17T00:00:00+05:30')
    : new Date(2026, 11, 18, 0, 0, 0);

function tickCountdown() {
  const ms = DOOMSDAY_AT.getTime() - Date.now();
  const set = (id, v) => (document.getElementById(id).textContent = String(v).padStart(2, '0'));
  if (ms <= 0) {
    document.getElementById('cd-label').textContent = 'Now in theaters';
    ['cd-d', 'cd-h', 'cd-m', 'cd-s'].forEach((id) => set(id, 0));
    return;
  }
  const s = Math.floor(ms / 1000);
  document.getElementById('cd-label').textContent = 'Countdown to release';
  set('cd-d', Math.floor(s / 86400));
  set('cd-h', Math.floor((s % 86400) / 3600));
  set('cd-m', Math.floor((s % 3600) / 60));
  set('cd-s', s % 60);
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* ------------------------------ rendering ------------------------------ */

let lastItems = [];
let lastGroups = [];
let modalId = null;

function groupItems(items) {
  const groups = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (!last || last.section !== item.section) groups.push({ section: item.section, items: [item] });
    else last.items.push(item);
  }
  return groups;
}

function eraHead(g, idx) {
  let kicker;
  let title = g.section;
  let sub;
  const mins = g.items.reduce((s, i) => s + i.t.runtime, 0);
  const counts = `${g.items.length} ${g.items.length === 1 ? 'title' : 'titles'} · ${Math.round(mins / 60)} h`;
  if (state.mode === 'release') {
    const [saga, tag] = ERA_INFO[g.section] ?? ['', ''];
    kicker = saga;
    const y0 = year(g.items[0].t);
    const y1 = year(g.items[g.items.length - 1].t);
    sub = `${tag} · ${y0 === y1 ? y0 : `${y0}–${y1}`} · ${counts}`;
  } else {
    const m = g.section.match(/^(.*?)\s*\((.*)\)\s*$/);
    kicker = `Chapter ${idx + 1}`;
    if (m) {
      title = m[1];
      sub = `${m[2]} · ${counts}`;
    } else sub = counts;
  }
  return `
    <header class="era-head">
      <div>
        <p class="era-kicker">${esc(kicker)}</p>
        <h2>${esc(title)}</h2>
        <p class="era-sub">${esc(sub)}</p>
      </div>
      <div class="era-prog" data-prog="${idx}"></div>
    </header>`;
}

function statusClass(t, nextId) {
  const st = status(t.id);
  return [st === 'w' ? 'watched' : '', st === 's' ? 'skipped' : '', t.id === nextId ? 'next' : '', isUpcoming(t) ? 'upcoming' : '']
    .filter(Boolean)
    .join(' ');
}

function subTag(t) {
  if (t.kind === 'block') {
    const m = t.title.match(/·\s*(.*)$/);
    return `<span class="subtag">${esc(m ? m[1] : 'Episodes')}</span>`;
  }
  if (t.kind === 'scene') return `<span class="subtag scene">Post-credits scene</span>`;
  return '';
}

function cardHtml(item, nextId) {
  const { t, n } = item;
  const tc = TIER_BY_ID[t.tier].color;
  const up = isUpcoming(t);
  const meta = [up ? fmtDate(t) : year(t), runtimeLabel(t)].filter(Boolean).join(' · ');
  const when =
    state.mode === 'story'
      ? `<p class="when${t.spoiler ? ' warn' : ''}" title="${esc(t.spoiler ?? 'In-universe time')}">${esc(t.when)}</p>`
      : '';
  return `
  <article class="card ${statusClass(t, nextId)}" data-id="${esc(t.id)}" data-open="${esc(t.id)}" tabindex="0" style="--i:${n % 24};--tc:${tc}">
    <span class="upnext-tag">Up next</span>
    <div class="poster">
      ${posterHtml(t)}
      <div class="shade"></div>
      <span class="num">${n}</span>
      <span class="type">${esc(KIND_LABEL[t.kind])}</span>
      ${up ? '<span class="ribbon">Coming soon</span>' : ''}
      ${subTag(t)}
      <div class="check"><span class="ck">${ICON.check}</span><span class="sk">${ICON.skip}</span></div>
      <div class="actions">
        <button class="act watch" data-act="watch" data-id="${esc(t.id)}" title="Mark watched" aria-label="Mark ${esc(t.title)} watched">${ICON.check}</button>
        <button class="act skip" data-act="skip" data-id="${esc(t.id)}" title="Skip" aria-label="Skip ${esc(t.title)}">${ICON.skip}</button>
        <button class="act" data-open="${esc(t.id)}" title="Details" aria-label="Details for ${esc(t.title)}">${ICON.info}</button>
      </div>
    </div>
    <div class="info">
      <h3>${esc(t.title)}</h3>
      <p class="sub"><span class="tdot"></span>${esc(meta)}</p>
      ${when}
    </div>
  </article>`;
}

function rowHtml(item, nextId) {
  const { t, n } = item;
  const tc = TIER_BY_ID[t.tier].color;
  const bits = [`<span>${esc(fmtDate(t))}</span>`];
  if (state.mode === 'story') bits.unshift(`<span class="w">${esc(t.when)}</span>`);
  const rt = runtimeLabel(t);
  if (rt) bits.push(`<span>${esc(rt)}</span>`);
  bits.push(`<span style="color:${tc}">${esc(TIER_BY_ID[t.tier].label)}</span>`);
  bits.push(`<span>${esc(KIND_LABEL[t.kind])}</span>`);
  return `
  <div class="row-item ${statusClass(t, nextId)}" data-id="${esc(t.id)}" data-open="${esc(t.id)}" tabindex="0" style="--i:${n % 24}">
    <span class="rnum">${n}</span>
    <div class="thumb">${posterHtml(t)}</div>
    <div>
      <h3>${esc(t.title)}</h3>
      <div class="rmeta">${bits.join('')}</div>
    </div>
    <div class="row-acts">
      <button class="act watch" data-act="watch" data-id="${esc(t.id)}" title="Mark watched">${ICON.check}</button>
      <button class="act skip" data-act="skip" data-id="${esc(t.id)}" title="Skip">${ICON.skip}</button>
    </div>
  </div>`;
}

function renderContent() {
  const items = currentItems();
  lastItems = items;
  lastGroups = groupItems(items);
  const nextId = nextOf(items)?.t.id;

  if (!items.length) {
    el.content.innerHTML = `<div class="empty"><b>No titles here</b>Try turning a filter back on or clearing the search.</div>`;
    return;
  }
  el.content.innerHTML = lastGroups
    .map(
      (g, idx) => `
    <section class="era" data-sec="${idx}">
      ${eraHead(g, idx)}
      ${
        state.view === 'grid'
          ? `<div class="grid">${g.items.map((it) => cardHtml(it, nextId)).join('')}</div>`
          : `<div class="rows">${g.items.map((it) => rowHtml(it, nextId)).join('')}</div>`
      }
    </section>`,
    )
    .join('');
  updateEraProgress();
}

function updateEraProgress() {
  lastGroups.forEach((g, idx) => {
    const done = g.items.filter((i) => status(i.t.id)).length;
    const pct = Math.round((done / g.items.length) * 100);
    const node = el.content.querySelector(`[data-prog="${idx}"]`);
    if (node) node.innerHTML = `<b>${done}</b> / ${g.items.length} done<div class="mini"><i style="width:${pct}%"></i></div>`;
  });
}

function renderStats() {
  const items = lastItems;
  const done = items.filter((i) => status(i.t.id)).length;
  const upcoming = items.filter((i) => isUpcoming(i.t)).length;
  const remaining = items.filter((i) => !status(i.t.id) && !isUpcoming(i.t)).reduce((s, i) => s + i.t.runtime, 0);
  const pct = items.length ? done / items.length : 0;

  el.ringFill.style.strokeDashoffset = String(314.16 * (1 - pct));
  el.ringPct.textContent = `${Math.round(pct * 100)}%`;

  let finish = '—';
  if (remaining === 0) finish = 'All caught up';
  else if (state.hoursPerWeek > 0) {
    const weeks = remaining / 60 / state.hoursPerWeek;
    finish = new Date(Date.now() + weeks * 7 * 864e5).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  el.pstats.innerHTML = `
    <div class="pstat"><b>${done}<span style="color:var(--dim);font-size:14px"> / ${items.length}</span></b><span>titles done</span></div>
    <div class="pstat"><b>${Math.round(remaining / 60)}h</b><span>left to watch</span></div>
    <div class="pstat"><b>${esc(finish)}</b><span class="hpw">finish at <input id="hpw" type="number" min="1" max="100" value="${state.hoursPerWeek}" aria-label="Hours per week"> h/wk</span></div>
    <div class="pstat"><b>${upcoming}</b><span>coming soon</span></div>`;

  el.vault.classList.toggle('err', !storageOk);
  el.vaultMsg.textContent = storageOk ? 'Saved in this browser · no account needed' : 'Not saving: browser storage is blocked';

  const total = items.reduce((s, i) => s + i.t.runtime, 0);
  el.summary.innerHTML = items.length
    ? `<b>${items.length}</b> ${items.length === 1 ? 'title' : 'titles'}<i></i>${Math.round(total / 60)} h<i></i><b>${done}</b> done<i></i>${
        state.doomsday ? 'Doomsday prep' : `${state.mode} order`
      }`
    : 'Nothing matches these filters';
}

function renderSpotlight() {
  const next = nextOf(lastItems);
  if (!next) {
    el.spotlight.innerHTML = lastItems.length
      ? `<div class="spotlight glass"><div style="grid-column:1/-1;text-align:center;padding:16px"><div class="sp-kicker" style="justify-content:center">${ICON.check} All caught up</div><h2 class="sp-title">You've watched everything released</h2><p class="sp-note" style="margin:auto">Everything left is still coming soon.</p></div></div>`
      : '';
    return;
  }
  const t = next.t;
  const src = posterOf(t);
  const note = state.mode === 'story' && t.spoiler ? `${ICON.warn} ${esc(t.spoiler)}` : esc(t.note ?? '');
  el.spotlight.innerHTML = `
    <div class="spotlight">
      ${src && !isLogo(src) ? `<div class="sp-bg" style="background-image:url('${esc(src)}')"></div>` : `<div class="sp-bg" style="background:linear-gradient(120deg,${palette(t).join(',')})"></div>`}
      <div class="poster" data-open="${esc(t.id)}">${posterHtml(t, { lazy: false })}</div>
      <div>
        <div class="sp-kicker">${ICON.play} Up next · #${next.n} in ${state.mode === 'release' ? 'release' : 'story'} order</div>
        <h2 class="sp-title">${esc(t.title)}</h2>
        <div class="sp-meta">
          <span>${ICON.cal} ${esc(fmtDate(t))}</span>
          ${runtimeLabel(t) ? `<span>${ICON.clock} ${esc(runtimeLabel(t))}</span>` : ''}
          <span>${ICON.orbit} ${esc(t.when)}</span>
          ${
            indiaOf(t)?.stream.length
              ? `<span title="Streaming in India">${ICON.tv} ${esc(indiaOf(t).stream.map((s) => s[0]).join(' · '))} <em class="in-tag">IN</em></span>`
              : t.platform
                ? `<span>${ICON.tv} ${esc(t.platform)}</span>`
                : ''
          }
        </div>
        ${note ? `<p class="sp-note">${note}</p>` : ''}
      </div>
      <div class="sp-actions">
        <button class="btn primary" data-act="watch" data-id="${esc(t.id)}">${ICON.check} Mark watched</button>
        <button class="btn" data-act="skip" data-id="${esc(t.id)}">${ICON.skip} Skip</button>
        <button class="btn" data-act="locate" data-id="${esc(t.id)}">${ICON.target} Find in list</button>
      </div>
    </div>`;
}

function renderCallout() {
  el.callout.innerHTML =
    state.mode === 'story' && !state.spoilerTipHidden
      ? `<div class="callout">
          <span class="co-icon">${ICON.warn}</span>
          <div class="co-text"><b>Story order can spoil things</b>It follows in-universe time, so some reveals come early and a few post-credits scenes are moved. Titles marked <span class="bang">!</span> carry a spoiler tip. First time through? Release order is safer.</div>
          <button class="co-x" data-dismiss title="Dismiss" aria-label="Dismiss">${ICON.x}</button>
        </div>`
      : '';
}

function filtersChanged() {
  const d = defaults();
  return (
    state.doomsday ||
    state.hideDone ||
    Boolean(state.query) ||
    d.tiers.some((t) => !state.tiers.includes(t)) ||
    d.kinds.some((k) => !state.kinds.includes(k))
  );
}

function syncControls() {
  for (const b of document.querySelectorAll('[data-mode]')) b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode));
  for (const b of document.querySelectorAll('[data-view]')) b.setAttribute('aria-pressed', String(b.dataset.view === state.view));

  const entries = state.mode === 'release' ? RELEASE_ENTRIES : STORY_ENTRIES;
  for (const b of el.tierChips.querySelectorAll('[data-tier]')) {
    const id = Number(b.dataset.tier);
    b.setAttribute('aria-pressed', String(!state.doomsday && state.tiers.includes(id)));
    b.querySelector('small').textContent = String(entries.filter((e) => e.title.tier === id).length);
  }
  el.tierGroup.classList.toggle('off', state.doomsday);
  el.doom.setAttribute('aria-pressed', String(state.doomsday));
  el.doom.querySelector('small').textContent = String(
    entries.filter((e) => DOOM.has(e.title.id) || (e.title.kind === 'scene' && DOOM.has(e.title.parent))).length,
  );
  for (const b of el.kindChips.querySelectorAll('[data-kind]')) b.setAttribute('aria-pressed', String(state.kinds.includes(b.dataset.kind)));
  for (const i of document.querySelectorAll('[data-opt]')) i.checked = Boolean(state[i.dataset.opt]);
  el.splitsWrap.style.display = state.mode === 'story' ? '' : 'none';
  el.clearFilters.hidden = !filtersChanged();
}

/** Full re-render: used when the set or order of visible titles changes. */
function renderAll() {
  save();
  syncControls();
  renderCallout();
  renderContent();
  renderStats();
  renderSpotlight();
  if (modalId) renderModal();
}

/** Light update after a watched/skip change: keeps the grid in place, just updates classes and stats. */
function refresh() {
  if (state.hideDone) return renderAll();
  save();
  const nextId = nextOf(lastItems)?.t.id;
  for (const node of el.content.querySelectorAll('.card, .row-item')) {
    const t = TITLE_BY_ID.get(node.dataset.id);
    const st = status(t.id);
    node.classList.toggle('watched', st === 'w');
    node.classList.toggle('skipped', st === 's');
    node.classList.toggle('next', t.id === nextId);
  }
  updateEraProgress();
  renderStats();
  renderSpotlight();
  if (modalId) renderModal();
}

/* ------------------------------ modal ------------------------------ */

function renderModal() {
  const t = TITLE_BY_ID.get(modalId);
  if (!t) return;
  const idx = lastItems.findIndex((i) => i.t.id === t.id);
  const item = lastItems[idx];
  const prev = lastItems[idx - 1];
  const next = lastItems[idx + 1];
  const st = status(t.id);
  const src = posterOf(t);
  const tier = TIER_BY_ID[t.tier];
  const parent = t.parent ? TITLE_BY_ID.get(t.parent) : null;

  const pills = [
    `<span class="pill tier" style="--tc:${tier.color}">${esc(tier.label)}</span>`,
    `<span class="pill">${esc(KIND_LABEL[t.kind])}</span>`,
    t.phase && t.tier <= 2 ? `<span class="pill">Phase ${t.phase}</span>` : '',
    isUpcoming(t) ? `<span class="pill gold">Coming soon</span>` : '',
    DOOM.has(t.id) ? `<span class="pill gold">Doomsday prep</span>` : '',
  ].join('');

  el.sheet.innerHTML = `
    ${src && !isLogo(src) ? `<div class="sheet-bg" style="background-image:url('${esc(src)}')"></div>` : ''}
    <button class="close" data-close aria-label="Close">${ICON.x}</button>
    <div class="sheet-body">
      <div class="poster" style="--tc:${tier.color}">${posterHtml(t, { lazy: false })}<div class="shade"></div></div>
      <div>
        <div class="m-kicker">${item ? `#${item.n} in ${state.mode} order` : ''}${item ? ' · ' : ''}${esc(item?.section ?? '')}</div>
        <h2 class="m-title" id="m-title">${esc(t.title)}</h2>
        <div class="pills">${pills}</div>
        <div class="facts">
          <div class="fact"><span>Released</span><b>${esc(fmtDate(t, true))}</b></div>
          <div class="fact"><span>Takes place</span><b>${esc(t.when)}</b></div>
          <div class="fact"><span>Runtime</span><b>${esc(runtimeLabel(t) || (t.kind === 'scene' ? 'A few minutes, inside the film' : 'TBA'))}</b></div>
          <div class="fact"><span>Premiered on</span><b>${esc(t.platform || '—')}</b></div>
          <div class="fact"><span>Universe</span><b>${esc(t.universe)}</b></div>
          <div class="fact"><span>Story placement</span><b>${esc(CONF_LABEL[t.conf])}</b></div>
        </div>
        ${indiaHtml(t)}
        ${state.mode === 'story' && t.spoiler ? `<div class="m-spoiler">${ICON.warn}<div>${esc(t.spoiler)}</div></div>` : ''}
        ${t.note ? `<p class="m-note">${esc(t.note)}</p>` : ''}
        ${parent ? `<p class="m-note">Part of <b>${esc(parent.title)}</b>.</p>` : ''}
        <div class="m-actions">
          <button class="btn ${st === 'w' ? 'on' : 'primary'}" data-act="watch" data-id="${esc(t.id)}">${ICON.check} ${st === 'w' ? 'Watched' : 'Mark watched'}</button>
          <button class="btn ${st === 's' ? 'on' : ''}" data-act="skip" data-id="${esc(t.id)}">${ICON.skip} ${st === 's' ? 'Skipped' : 'Skip'}</button>
        </div>
      </div>
    </div>
    <div class="m-nav">
      <button class="btn sm" data-nav="${esc(prev?.t.id ?? '')}" ${prev ? '' : 'disabled style="visibility:hidden"'}>${ICON.left} ${esc(prev?.t.title ?? '')}</button>
      <button class="btn sm" data-nav="${esc(next?.t.id ?? '')}" ${next ? '' : 'disabled style="visibility:hidden"'}>${esc(next?.t.title ?? '')} ${ICON.right}</button>
    </div>`;
}

function openModal(id) {
  modalId = id;
  renderModal();
  el.modal.classList.add('open');
  el.modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  el.sheet.querySelector('.close')?.focus();
}

function closeModal() {
  const id = modalId;
  modalId = null;
  el.modal.classList.remove('open');
  el.modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (id) el.content.querySelector(`[data-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
}

function locate(id) {
  const node = el.content.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (!node) return;
  node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  node.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }],
    { duration: 700, delay: 350, easing: 'ease-in-out' },
  );
}

/* ------------------------------ events ------------------------------ */

document.addEventListener('click', (e) => {
  const target = e.target instanceof Element ? e.target : null;
  if (!target) return;

  const act = target.closest('[data-act]');
  if (act) {
    e.stopPropagation();
    const id = act.dataset.id;
    if (act.dataset.act === 'locate') return locate(id);
    toggle(id, act.dataset.act === 'watch' ? 'w' : 's');
    askPersist();
    refresh();
    return;
  }

  if (target.closest('[data-close]') || target === el.modal) return closeModal();

  const nav = target.closest('[data-nav]');
  if (nav && nav.dataset.nav) {
    modalId = nav.dataset.nav;
    renderModal();
    return;
  }

  const mode = target.closest('[data-mode]');
  if (mode) {
    if (state.mode !== mode.dataset.mode) {
      state.mode = mode.dataset.mode;
      history.replaceState(null, '', `#${state.mode}`);
      renderAll();
    }
    return;
  }

  const view = target.closest('[data-view]');
  if (view) {
    state.view = view.dataset.view;
    renderAll();
    return;
  }

  const tier = target.closest('[data-tier]');
  if (tier) {
    const id = Number(tier.dataset.tier);
    if (state.doomsday) state.doomsday = false;
    else state.tiers = state.tiers.includes(id) ? state.tiers.filter((x) => x !== id) : [...state.tiers, id];
    renderAll();
    return;
  }

  if (target.closest('[data-doom]')) {
    state.doomsday = !state.doomsday;
    renderAll();
    return;
  }

  const kind = target.closest('[data-kind]');
  if (kind) {
    const id = kind.dataset.kind;
    state.kinds = state.kinds.includes(id) ? state.kinds.filter((x) => x !== id) : [...state.kinds, id];
    renderAll();
    return;
  }

  if (target.closest('#reset')) {
    const n = Object.keys(state.progress).length;
    if (!n) return toast('Nothing to clear yet');
    if (confirm(`Clear all ${n} watched and skipped marks? Export a backup first if you might want them back.`)) {
      state.progress = {};
      refresh();
      toast('Progress cleared');
    }
    return;
  }

  if (target.closest('#export')) return exportProgress();
  if (target.closest('#import')) return el.importFile.click();

  if (target.closest('#clear-filters')) {
    const d = defaults();
    Object.assign(state, { tiers: d.tiers, kinds: d.kinds, doomsday: false, hideDone: false, query: '' });
    el.q.value = '';
    renderAll();
    return;
  }

  if (target.closest('[data-dismiss]')) {
    state.spoilerTipHidden = true;
    save();
    renderCallout();
    return;
  }

  const open = target.closest('[data-open]');
  if (open) openModal(open.dataset.open);
});

document.addEventListener('change', (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.dataset.opt) {
    state[target.dataset.opt] = target.checked;
    renderAll();
  } else if (target === el.importFile) {
    const file = target.files?.[0];
    target.value = '';
    if (file) importProgress(file);
  } else if (target.id === 'hpw') {
    const v = Number(target.value);
    state.hoursPerWeek = Number.isFinite(v) && v > 0 ? v : 10;
    save();
    renderStats();
  }
});

document.addEventListener('keydown', (e) => {
  if (modalId) {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const idx = lastItems.findIndex((i) => i.t.id === modalId);
      const n = lastItems[idx + (e.key === 'ArrowRight' ? 1 : -1)];
      if (n) {
        modalId = n.t.id;
        renderModal();
      }
    }
    return;
  }
  const target = e.target instanceof Element ? e.target : null;
  if (e.key === 'Enter' && target?.matches('.card, .row-item')) openModal(target.dataset.id);
  if (e.key === '/' && document.activeElement !== el.q) {
    e.preventDefault();
    el.q.focus();
  }
});

let searchTimer;
el.q.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.query = el.q.value.trim().toLowerCase();
    renderAll();
  }, 120);
});

window.addEventListener(
  'scroll',
  () => el.toolbar.classList.toggle('stuck', el.toolbar.getBoundingClientRect().top <= 0),
  { passive: true },
);

// Another tab of the site changed progress: pick it up so the two tabs can't overwrite each other.
window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY) return;
  const fresh = load();
  state.progress = fresh.progress;
  state.hoursPerWeek = fresh.hoursPerWeek;
  renderAll();
});

renderAll();

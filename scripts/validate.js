import { DOOMSDAY_PREP, STORY_ORDER } from '../src/data/story.js';
import { TITLES, TITLE_BY_ID } from '../src/data/titles.js';
import { RELEASE_ENTRIES, STORY_ENTRIES } from '../src/data/order.js';

const errors = [];
const err = (m) => errors.push(m);

// 1. unique ids
const seen = new Set();
for (const t of TITLES) {
  if (seen.has(t.id)) err(`Duplicate id: ${t.id}`);
  seen.add(t.id);
}

// 2. field sanity
for (const t of TITLES) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t.release)) err(`${t.id}: bad release date "${t.release}"`);
  if (Number.isNaN(Date.parse(t.release))) err(`${t.id}: unparsable release date`);
  if (!t.title.trim()) err(`${t.id}: empty title`);
  if (!t.when.trim()) err(`${t.id}: missing story "when"`);
  if (t.parent && !TITLE_BY_ID.has(t.parent)) err(`${t.id}: unknown parent ${t.parent}`);
  if (!t.inRelease && !t.inStory) err(`${t.id}: not in any order`);
  if (![1, 2, 3, 4].includes(t.tier)) err(`${t.id}: bad tier`);
  if (t.runtime == null || Number.isNaN(t.runtime)) err(`${t.id}: bad runtime`);
}

// 3. every inStory title appears exactly once in the story order, and nothing else does
const storyIds = STORY_ORDER.filter((k) => !k.startsWith('#'));
const counts = new Map();
for (const id of storyIds) counts.set(id, (counts.get(id) ?? 0) + 1);
for (const [id, n] of counts) {
  const t = TITLE_BY_ID.get(id);
  if (!t) err(`Story order has unknown id ${id}`);
  else if (!t.inStory) err(`Story order contains ${id}, but inStory is false`);
  if (n > 1) err(`Story order lists ${id} ${n} times`);
}
for (const t of TITLES) {
  if (t.inStory && !counts.has(t.id)) err(`${t.id} is inStory but missing from the story order`);
}

// 4. split seasons: block episodes should add up to the parent's episode count
const blocksByParent = new Map();
for (const t of TITLES) {
  if (t.kind === 'block' && t.parent) blocksByParent.set(t.parent, (blocksByParent.get(t.parent) ?? 0) + (t.eps ?? 0));
}
for (const [parentId, total] of blocksByParent) {
  const p = TITLE_BY_ID.get(parentId);
  if (p && p.eps !== total) err(`${parentId}: blocks cover ${total} episodes but the season has ${p.eps}`);
  if (p && p.inStory) err(`${parentId}: has blocks, so inStory should be false`);
}

// 5. doomsday preset ids exist
for (const id of DOOMSDAY_PREP) if (!TITLE_BY_ID.has(id)) err(`Doomsday preset has unknown id ${id}`);

// 6. release order is sorted
for (let i = 1; i < RELEASE_ENTRIES.length; i++) {
  if (RELEASE_ENTRIES[i - 1].title.release > RELEASE_ENTRIES[i].title.release) err('Release order is not sorted');
}

// Report
const byTier = [1, 2, 3, 4].map((n) => TITLES.filter((t) => t.tier === n).length);
const mins = (entries) => entries.reduce((s, e) => s + e.title.runtime, 0);
console.log(`Titles: ${TITLES.length}  (tier 1: ${byTier[0]}, tier 2: ${byTier[1]}, tier 3: ${byTier[2]}, tier 4: ${byTier[3]})`);
console.log(`Release order entries: ${RELEASE_ENTRIES.length}`);
console.log(`Story order entries:   ${STORY_ENTRIES.length}`);
console.log(`Doomsday prep titles:  ${DOOMSDAY_PREP.length}`);
console.log(`Total runtime, release order: ${Math.round(mins(RELEASE_ENTRIES) / 60)} h`);
console.log(`Total runtime, story order:   ${Math.round(mins(STORY_ENTRIES) / 60)} h`);

const disputed = TITLES.filter((t) => t.conf === 'disputed');
console.log(`\nDisputed placements (${disputed.length}):`);
for (const t of disputed) console.log(`  - ${t.title}`);

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error(`  x ${e}`);
  process.exit(1);
}
console.log('\nAll checks passed.');

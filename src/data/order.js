import { STORY_ORDER } from './story.js';
import { TITLES, TITLE_BY_ID } from './titles.js';

/**
 * @typedef {import('./titles.js').Title} Title
 * @typedef {{ title: Title, section: string }} Entry
 */

/** Release-order sections follow Marvel Studios' phase boundaries; non-MCU titles land in whichever phase they released during. */
export function releaseEra(date) {
  if (date < '2008-05-02') return 'Before the MCU';
  if (date < '2013-05-03') return 'Phase One';
  if (date < '2016-05-06') return 'Phase Two';
  if (date < '2021-01-01') return 'Phase Three';
  if (date < '2023-02-17') return 'Phase Four';
  if (date < '2025-07-25') return 'Phase Five';
  return 'Phase Six';
}

/** @returns {Entry[]} */
export function buildRelease() {
  return TITLES.filter((t) => t.inRelease)
    .slice()
    .sort((a, b) => a.release.localeCompare(b.release) || a.tier - b.tier || a.id.localeCompare(b.id))
    .map((t) => ({ title: t, section: releaseEra(t.release) }));
}

/** @returns {Entry[]} */
export function buildStory() {
  const out = [];
  let section = '';
  for (const key of STORY_ORDER) {
    if (key.startsWith('#')) {
      section = key.slice(1);
      continue;
    }
    const title = TITLE_BY_ID.get(key);
    if (!title) throw new Error(`Story order references unknown id "${key}"`);
    out.push({ title, section });
  }
  return out;
}

export const RELEASE_ENTRIES = buildRelease();
export const STORY_ENTRIES = buildStory();

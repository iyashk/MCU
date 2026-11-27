/**
 * @typedef {'film'|'season'|'block'|'one-shot'|'special'|'short'|'scene'|'doc'|'viral'} Kind
 *   block = part of a season, only used in story order (e.g. Agents of S.H.I.E.L.D. S1 E1-7)
 *   scene = a post-credits scene relocated to its in-universe position, only used in story order
 *
 * @typedef {'official'|'derived'|'disputed'|'unplaced'} Conf
 *   official = placed by Disney+'s official MCU timeline
 *   derived  = placed using Chronologeek / Marvel's Official Timeline book / episode tie-ins
 *   disputed = sources disagree on position or date
 *   unplaced = no canonical position (parallel universe or non-narrative)
 *
 * @typedef {Object} Title
 * @property {string} id
 * @property {string} title
 * @property {Kind} kind
 * @property {1|2|3|4} tier        1 core canon, 2 canon-adjacent, 3 other universes, 4 bonus material
 * @property {string} universe
 * @property {string} release      ISO date; see `dp` for how precise it really is
 * @property {'d'|'m'|'y'} dp      exact day / only month known / only year known
 * @property {number} runtime      minutes, 0 = unknown or part of another title
 * @property {number} [eps]
 * @property {string} platform
 * @property {'infinity'|'multiverse'|'other'} saga
 * @property {number} [phase]
 * @property {boolean} inRelease   listed in release order
 * @property {boolean} inStory     listed in story order
 * @property {string} when         in-universe time, free text
 * @property {Conf} conf
 * @property {string} [note]
 * @property {string} [spoiler]    shown in story order only
 * @property {string} [parent]
 */

/**
 * Source of truth for every title.
 *
 * Release dates: Wikipedia, Marvel.com, Disney+ press pages, marvelmoviesorder.com
 * Story placement: Disney+ official "MCU Complete Timeline" (Marvel.com, 22 Oct 2026) as the spine,
 *                  plus Chronologeek and Marvel's "Official Timeline" book for everything Disney+ leaves out.
 *
 * TV / block runtimes are estimates (episodes x typical length).
 */

export const U616 = 'Earth-616 (main MCU)';
export const U_FOX = 'Fox X-Men universe';
export const U_RAIMI = 'Raimi Spider-Man';
export const U_WEBB = 'Webb Spider-Man';
export const U_SSU = "Sony's Spider-Man Universe";
export const U_VERSE = 'Spider-Verse (animated)';
export const U_OTHER = 'Other Marvel universe';

function phaseOf(release) {
  if (release < '2013-05-03') return 1;
  if (release < '2016-05-06') return 2;
  if (release < '2021-01-01') return 3;
  if (release < '2023-02-17') return 4;
  if (release < '2025-07-25') return 5;
  return 6;
}

function mk(
  kind,
  id,
  title,
  release,
  runtime,
  when,
  o = {},
) {
  const tier = o.tier ?? 1;
  const universe = o.universe ?? U616;
  const defaultConf = tier === 1 ? 'official' : tier === 2 ? 'derived' : 'unplaced';
  const is616 = universe === U616;
  return {
    id,
    title,
    kind,
    tier,
    universe,
    release,
    dp: 'd',
    runtime,
    platform: '',
    saga: is616 ? (release < '2021-01-01' ? 'infinity' : 'multiverse') : 'other',
    phase: is616 && tier <= 2 ? phaseOf(release) : undefined,
    inRelease: true,
    inStory: true,
    when,
    conf: defaultConf,
    ...o,
  };
}

const film = (id, title, release, runtime, when, o = {}) =>
  mk('film', id, title, release, runtime, when, { platform: 'Theatrical', ...o });

const tv = (
  id,
  title,
  release,
  eps,
  avg,
  when,
  o = {},
) => mk('season', id, title, release, eps * avg, when, { eps, platform: 'Disney+', ...o });

const oneShot = (id, title, release, runtime, when, o = {}) =>
  mk('one-shot', id, title, release, runtime, when, { platform: 'Disney+ / home media', ...o });

/** Part of a season, only listed in story order. */
const block = (
  id,
  parent,
  title,
  release,
  eps,
  avg,
  when,
  o = {},
) =>
  mk('block', id, title, release, eps * avg, when, {
    parent,
    eps,
    inRelease: false,
    tier: 2,
    conf: 'derived',
    platform: 'Disney+',
    ...o,
  });

/** Post-credits scene shown at its in-universe position, only listed in story order. */
const scene = (id, parent, title, release, when, o = {}) =>
  mk('scene', id, title, release, 0, when, {
    parent,
    inRelease: false,
    conf: 'derived',
    platform: 'Part of the film',
    ...o,
  });

const NOT_CONFIRMED =
  'Never formally confirmed as canon by Marvel Studios, but fits the main timeline and is included by Chronologeek.';

/* -------------------------------------------------------------------------- */
/* TIER 1 — Core canon (Disney+ official complete timeline + the next films)  */
/* -------------------------------------------------------------------------- */

const tier1Films = [
  film('iron-man', 'Iron Man', '2008-05-02', 126, '2010', {
    note: "Marvel's Official Timeline book dates this to 2010; older guides say 2008. Order is unaffected.",
  }),
  film('incredible-hulk', 'The Incredible Hulk', '2008-06-13', 112, '2011 (Fury\'s Big Week)'),
  film('iron-man-2', 'Iron Man 2', '2010-05-07', 124, '2011 (Fury\'s Big Week)'),
  film('thor', 'Thor', '2011-05-06', 115, '2011 (Fury\'s Big Week)'),
  film('first-avenger', 'Captain America: The First Avenger', '2011-07-22', 124, '1943–45', {
    spoiler: 'Skip the post-credits scene here. It is just an Avengers teaser.',
  }),
  film('avengers', 'The Avengers', '2012-05-04', 143, '2012'),
  film('iron-man-3', 'Iron Man 3', '2013-05-03', 130, 'Christmas 2013'),
  film('dark-world', 'Thor: The Dark World', '2013-11-08', 112, '2013'),
  film('winter-soldier', 'Captain America: The Winter Soldier', '2014-04-04', 136, '2014'),
  film('gotg', 'Guardians of the Galaxy', '2014-08-01', 121, '2014'),
  film('age-of-ultron', 'Avengers: Age of Ultron', '2015-05-01', 141, '2015'),
  film('ant-man', 'Ant-Man', '2015-07-17', 117, '2015'),
  film('civil-war', 'Captain America: Civil War', '2016-05-06', 147, '2016'),
  film('doctor-strange', 'Doctor Strange', '2016-11-04', 115, '2016–17'),
  film('gotg-2', 'Guardians of the Galaxy Vol. 2', '2017-05-05', 136, '2014'),
  film('homecoming', 'Spider-Man: Homecoming', '2017-07-07', 133, '2016'),
  film('ragnarok', 'Thor: Ragnarok', '2017-11-03', 130, '2017', {
    spoiler: 'Skip the first post-credits scene for now. It is the opening of Infinity War and is listed there.',
  }),
  film('black-panther', 'Black Panther', '2018-02-16', 134, '2016'),
  film('infinity-war', 'Avengers: Infinity War', '2018-04-27', 149, '2018'),
  film('ant-man-wasp', 'Ant-Man and the Wasp', '2018-07-06', 118, '2018', {
    spoiler: 'Skip the first post-credits scene for now. It happens during Infinity War and is listed there.',
  }),
  film('captain-marvel', 'Captain Marvel', '2019-03-08', 123, '1995', {
    spoiler:
      'Skip the first post-credits scene here. It spoils Infinity War and is listed right after it. The second is just a joke.',
  }),
  film('endgame', 'Avengers: Endgame', '2019-04-26', 181, '2023', {
    spoiler: 'Watch the original cut, not the "Endgame Encore" re-release, which spoils later projects.',
  }),
  film('far-from-home', 'Spider-Man: Far From Home', '2019-07-02', 129, '2024'),
  film('black-widow', 'Black Widow', '2021-07-09', 134, '2016', {
    spoiler: 'Skip the post-credits scene here. It spoils Hawkeye and is listed right before it.',
  }),
  film('shang-chi', 'Shang-Chi and the Legend of the Ten Rings', '2021-09-03', 132, '2024'),
  film('eternals', 'Eternals', '2021-11-05', 156, '2024'),
  film('no-way-home', 'Spider-Man: No Way Home', '2021-12-17', 148, '2024'),
  film('multiverse-of-madness', 'Doctor Strange in the Multiverse of Madness', '2022-05-06', 126, '2024'),
  film('love-and-thunder', 'Thor: Love and Thunder', '2022-07-08', 119, '2025'),
  film('wakanda-forever', 'Black Panther: Wakanda Forever', '2022-11-11', 161, '2025'),
  film('quantumania', 'Ant-Man and the Wasp: Quantumania', '2023-02-17', 125, '2026'),
  film('gotg-3', 'Guardians of the Galaxy Vol. 3', '2023-05-05', 150, '2026'),
  film('the-marvels', 'The Marvels', '2023-11-10', 105, '2026', {
    spoiler: 'Skip the post-credits scene for now. It is listed after Deadpool & Wolverine.',
  }),
  film('deadpool-wolverine', 'Deadpool & Wolverine', '2024-07-26', 128, '2024', {
    conf: 'disputed',
    note: "Disney+ places it after What If…? S2. Wikipedia's timeline dates it to 2024, before Shang-Chi. Release order is unaffected.",
  }),
  film('brave-new-world', 'Captain America: Brave New World', '2025-02-14', 118, '2027'),
  film('thunderbolts', 'Thunderbolts*', '2025-05-02', 127, '2027', {
    spoiler: 'Skip the second post-credits scene for now. It is listed just before Doomsday.',
  }),
  film('f4-first-steps', 'The Fantastic Four: First Steps', '2025-07-25', 115, '~1964 (own universe)', {
    note: "Takes place in its own universe. Disney+ places it after Thunderbolts*, which is where it connects to the main timeline.",
  }),
  film('brand-new-day', 'Spider-Man: Brand New Day', '2026-07-31', 145, '2028', {
    conf: 'disputed',
    note: "Not in Disney+'s timeline yet. Wikipedia lists it before VisionQuest; Chronologeek and marvelmoviesorder.com place it after, so it sits after here. A December 2026 re-release with new scenes has been reported.",
  }),
  film('doomsday', 'Avengers: Doomsday', '2026-12-18', 165, '2028+', {
    note: 'US release 18 Dec 2026 (17 Dec in India).',
  }),
  film('secret-wars', 'Avengers: Secret Wars', '2027-12-01', 0, 'TBA', {
    dp: 'm',
    conf: 'derived',
    note: 'Announced for December 2027.',
  }),
];

const tier1Shows = [
  // Marvel Studios / Marvel Television / Marvel Animation on Disney+
  tv('wandavision', 'WandaVision', '2021-01-15', 9, 36, '2023'),
  tv('falcon-winter-soldier', 'The Falcon and the Winter Soldier', '2021-03-19', 6, 52, '2024'),
  tv('loki-s1', 'Loki: Season 1', '2021-06-09', 6, 47, 'Outside time (after Endgame)'),
  tv('what-if-s1', 'What If…?: Season 1', '2021-08-11', 9, 30, 'Multiverse (various)'),
  tv('hawkeye', 'Hawkeye', '2021-11-24', 6, 47, 'Christmas 2024', {
    spoiler: 'Watch the Black Widow post-credits scene right before this.',
  }),
  tv('moon-knight', 'Moon Knight', '2022-03-30', 6, 47, '2025'),
  tv('ms-marvel', 'Ms. Marvel', '2022-06-08', 6, 44, '2025'),
  tv('she-hulk', 'She-Hulk: Attorney at Law', '2022-08-18', 9, 30, '2025'),
  mk('special', 'werewolf-by-night', 'Werewolf by Night', '2022-10-07', 53, 'Unspecified (Halloween)', {
    platform: 'Disney+ (Special Presentation)',
  }),
  mk('special', 'gotg-holiday', 'The Guardians of the Galaxy Holiday Special', '2022-11-25', 44, 'Christmas 2025', {
    platform: 'Disney+ (Special Presentation)',
  }),
  tv('secret-invasion', 'Secret Invasion', '2023-06-21', 6, 46, '2026'),
  tv('loki-s2', 'Loki: Season 2', '2023-10-05', 6, 49, 'Outside time'),
  tv('what-if-s2', 'What If…?: Season 2', '2023-12-22', 9, 28, 'Multiverse (various)'),
  tv('echo', 'Echo', '2024-01-09', 5, 43, '2025'),
  tv('agatha', 'Agatha All Along', '2024-09-18', 9, 40, '2026'),
  tv('what-if-s3', 'What If…?: Season 3', '2024-12-22', 8, 27, 'Multiverse (various)'),
  tv('ddba-s1', 'Daredevil: Born Again: Season 1', '2025-03-04', 9, 50, '2026–27'),
  tv('ironheart', 'Ironheart', '2025-06-24', 6, 47, '2025'),
  tv('eyes-of-wakanda', 'Eyes of Wakanda', '2025-08-01', 4, 30, '1260 BC – 1896', {
    note: 'Animated anthology. Disney+ lists it first because its earliest story is the oldest in the MCU, but it plays better after Black Panther.',
  }),
  tv('marvel-zombies', 'Marvel Zombies', '2025-09-24', 4, 30, 'Alternate universe (after What If…? S1)'),
  tv('wonder-man', 'Wonder Man', '2026-01-27', 8, 31, '2025–27'),
  tv('ddba-s2', 'Daredevil: Born Again: Season 2', '2026-03-24', 8, 51, '2027'),
  mk('special', 'punisher-olk', 'The Punisher: One Last Kill', '2026-05-12', 51, '2027–28', {
    platform: 'Disney+ (Special Presentation)',
  }),
  tv('visionquest', 'VisionQuest', '2026-10-13', 8, 52, 'May 2028', {
    spoiler: 'The finale has a very important post-credits scene. Stay for it.',
  }),

  // Two seasons of shorts, both placed after Guardians Vol. 2 by Disney+
  tv('i-am-groot-s1', 'I Am Groot: Season 1', '2022-08-10', 5, 4, '2014 (after Guardians Vol. 2)'),
  tv('i-am-groot-s2', 'I Am Groot: Season 2', '2023-09-06', 5, 4, '2014–15'),

  // Netflix / Marvel Television, brought into the official timeline on Disney+
  tv('dd-s1', 'Daredevil: Season 1', '2015-04-10', 13, 54, '2014–15', { platform: 'Netflix / Disney+' }),
  tv('jj-s1', 'Jessica Jones: Season 1', '2015-11-20', 13, 51, '2015', { platform: 'Netflix / Disney+' }),
  tv('dd-s2', 'Daredevil: Season 2', '2016-03-18', 13, 54, '2015', { platform: 'Netflix / Disney+' }),
  tv('lc-s1', 'Luke Cage: Season 1', '2016-09-30', 13, 54, '2015', { platform: 'Netflix / Disney+' }),
  tv('if-s1', 'Iron Fist: Season 1', '2017-03-17', 13, 51, '2016', { platform: 'Netflix / Disney+' }),
  tv('defenders', 'The Defenders', '2017-08-18', 8, 50, '2016', { platform: 'Netflix / Disney+' }),
  tv('punisher-s1', 'The Punisher: Season 1', '2017-11-17', 13, 53, '2016', { platform: 'Netflix / Disney+' }),
  tv('jj-s2', 'Jessica Jones: Season 2', '2018-03-08', 13, 53, '2017', { platform: 'Netflix / Disney+' }),
  tv('lc-s2', 'Luke Cage: Season 2', '2018-06-22', 13, 55, '2017', { platform: 'Netflix / Disney+' }),
  tv('if-s2', 'Iron Fist: Season 2', '2018-09-07', 10, 50, '2017', { platform: 'Netflix / Disney+' }),
  tv('dd-s3', 'Daredevil: Season 3', '2018-10-19', 13, 54, '2017', { platform: 'Netflix / Disney+' }),
  tv('punisher-s2', 'The Punisher: Season 2', '2019-01-18', 13, 53, '2018', { platform: 'Netflix / Disney+' }),
  tv('jj-s3', 'Jessica Jones: Season 3', '2019-06-14', 13, 51, '2018', { platform: 'Netflix / Disney+' }),

  // Marvel One-Shots
  oneShot('os-consultant', 'One-Shot: The Consultant', '2011-09-13', 4, '2011', {
    note: 'Recontextualizes the Incredible Hulk post-credits scene.',
  }),
  oneShot('os-funny-thing', "One-Shot: A Funny Thing Happened on the Way to Thor's Hammer", '2011-10-25', 4, '2011'),
  oneShot('os-item-47', 'One-Shot: Item 47', '2012-09-25', 12, '2012'),
  oneShot('os-agent-carter', 'One-Shot: Agent Carter', '2013-09-03', 15, '1946'),
  oneShot('os-all-hail-the-king', 'One-Shot: All Hail the King', '2014-02-04', 14, '2014'),
];

/* -------------------------------------------------------------------------- */
/* TIER 2 — Canon-adjacent                                                    */
/* -------------------------------------------------------------------------- */

const t2 = { tier: 2 };

const tier2 = [
  // Agents of S.H.I.E.L.D. (ABC). Seasons that interleave with films are split into blocks for story order.
  tv('aos-s1', 'Agents of S.H.I.E.L.D.: Season 1', '2013-09-24', 22, 43, '2013–14', {
    ...t2,
    platform: 'ABC / Disney+',
    inStory: false,
    note: NOT_CONFIRMED,
  }),
  tv('aos-s2', 'Agents of S.H.I.E.L.D.: Season 2', '2014-09-23', 22, 43, '2014–15', {
    ...t2,
    platform: 'ABC / Disney+',
    inStory: false,
    note: NOT_CONFIRMED,
  }),
  tv('aos-s3', 'Agents of S.H.I.E.L.D.: Season 3', '2015-09-29', 22, 43, '2015–16', {
    ...t2,
    platform: 'ABC / Disney+',
    note: NOT_CONFIRMED,
  }),
  tv('aos-s4', 'Agents of S.H.I.E.L.D.: Season 4', '2016-09-20', 22, 43, '2016–17', {
    ...t2,
    platform: 'ABC / Disney+',
    note: NOT_CONFIRMED,
  }),
  tv('aos-s5', 'Agents of S.H.I.E.L.D.: Season 5', '2017-12-01', 22, 43, '2017–18', {
    ...t2,
    platform: 'ABC / Disney+',
    inStory: false,
    note: NOT_CONFIRMED,
  }),
  tv('aos-s6', 'Agents of S.H.I.E.L.D.: Season 6', '2019-05-10', 13, 43, '2019', {
    ...t2,
    platform: 'ABC / Disney+',
    note: NOT_CONFIRMED,
  }),
  tv('aos-s7', 'Agents of S.H.I.E.L.D.: Season 7', '2020-05-27', 13, 43, '2019–20', {
    ...t2,
    platform: 'ABC / Disney+',
    note: NOT_CONFIRMED,
  }),

  block('aos-s1-a', 'aos-s1', 'Agents of S.H.I.E.L.D. S1 · E1–7', '2013-09-24', 7, 43, '2013', {
    note: 'Takes place before Thor: The Dark World.',
  }),
  block('aos-s1-b', 'aos-s1', 'Agents of S.H.I.E.L.D. S1 · E8–10', '2013-11-12', 3, 43, '2013', {
    note: 'Episode 8 ties directly to Thor: The Dark World.',
  }),
  block('aos-s1-c', 'aos-s1', 'Agents of S.H.I.E.L.D. S1 · E11–16', '2014-01-07', 6, 43, '2014', {
    note: 'Sets up Captain America: The Winter Soldier.',
  }),
  block('aos-s1-d', 'aos-s1', 'Agents of S.H.I.E.L.D. S1 · E17–22', '2014-04-01', 6, 43, '2014', {
    note: 'Depicts the fall of S.H.I.E.L.D. from The Winter Soldier. Watch after the film.',
  }),
  block('aos-s2-a', 'aos-s2', 'Agents of S.H.I.E.L.D. S2 · E1–19', '2014-09-23', 19, 43, '2014–15'),
  block('aos-s2-b', 'aos-s2', 'Agents of S.H.I.E.L.D. S2 · E20–22', '2015-05-01', 3, 43, '2015', {
    note: 'Runs in parallel with the events of Avengers: Age of Ultron.',
  }),
  block('aos-s5-a', 'aos-s5', 'Agents of S.H.I.E.L.D. S5 · E1–19', '2017-12-01', 19, 43, '2017'),
  block('aos-s5-b', 'aos-s5', 'Agents of S.H.I.E.L.D. S5 · E20–22', '2018-05-18', 3, 43, 'May 2018', {
    note: 'Takes place just before Avengers: Infinity War.',
  }),

  tv('agent-carter-s1', 'Agent Carter: Season 1', '2015-01-06', 8, 43, '1946', {
    ...t2,
    platform: 'ABC / Disney+',
    note: NOT_CONFIRMED,
  }),
  tv('agent-carter-s2', 'Agent Carter: Season 2', '2016-01-19', 10, 43, '1947', {
    ...t2,
    platform: 'ABC / Disney+',
    note: NOT_CONFIRMED,
  }),
  mk('short', 'slingshot', 'Agents of S.H.I.E.L.D.: Slingshot', '2016-12-13', 30, '2016', {
    ...t2,
    platform: 'ABC.com',
    note: 'Six-episode digital spin-off. Minor side quest.',
  }),
  oneShot('team-thor', 'Team Thor', '2016-08-28', 5, '2016 (during Civil War)', {
    ...t2,
    note: 'Not on the official timeline. Taika Waititi mockumentary.',
  }),
  oneShot('team-thor-2', 'Team Thor: Part 2', '2017-02-14', 4, '2017', {
    ...t2,
    note: 'Not on the official timeline.',
  }),
  oneShot('team-darryl', 'Team Darryl', '2018-02-20', 6, '2017–18 (after Ragnarok)', {
    ...t2,
    note: 'Not on the official timeline.',
  }),
  mk('short', 'peters-todo', "Peter's To-Do List", '2019-10-01', 3, '2019 (before Far From Home)', {
    ...t2,
    platform: 'Home media',
    note: 'Short that comes with the Far From Home home release.',
  }),
  mk('short', 'deadpool-korg', 'Deadpool and Korg React', '2021-07-01', 5, 'N/A (promo)', {
    ...t2,
    dp: 'm',
    platform: 'YouTube',
    note: 'Promo clip. Exact release day not confirmed. Placed just before Deadpool & Wolverine.',
  }),
  tv('yfnsm-s1', 'Your Friendly Neighborhood Spider-Man: Season 1', '2025-01-29', 10, 24, 'Alternate 2016 universe', {
    ...t2,
    conf: 'derived',
    note: "Takes place in its own reality. Chronologeek groups it with What If…? and places it near its release.",
  }),
  tv('yfnsm-s2', 'Your Friendly Neighborhood Spider-Man: Season 2', '2027-01-01', 0, 0, 'Alternate 2016 universe', {
    ...t2,
    dp: 'y',
    conf: 'derived',
    note: 'Announced for 2027.',
  }),
  tv('marvel-zombies-tws', 'Marvel Zombies: The Winter Soldier', '2027-01-01', 0, 0, 'Alternate universe', {
    ...t2,
    dp: 'y',
    conf: 'derived',
    note: 'Announced for 2027 as a continuation special.',
  }),
  tv('xmen97-s1', "X-Men '97: Season 1", '2024-03-20', 10, 30, 'Animated, own universe', {
    ...t2,
    universe: U_OTHER,
    conf: 'unplaced',
    note: "No ties to the main timeline, but part of the multiverse. Listed with the other unplaced shows.",
  }),
  tv('xmen97-s2', "X-Men '97: Season 2", '2026-07-01', 9, 30, 'Animated, own universe', {
    ...t2,
    universe: U_OTHER,
    conf: 'unplaced',
    note: 'No ties to the main timeline.',
  }),
];

/* -------------------------------------------------------------------------- */
/* TIER 3 — Other universes                                                   */
/* -------------------------------------------------------------------------- */

const t3 = (u, platform = 'Theatrical') => ({ tier: 3, universe: u, platform });
const fox = (id, title, release, runtime, when, o = {}) =>
  film(id, title, release, runtime, when, { ...t3(U_FOX), saga: 'other', ...o });
const other = (id, title, release, runtime, when, o = {}) =>
  film(id, title, release, runtime, when, { ...t3(U_OTHER), saga: 'other', ...o });

const FOX_NOTE =
  'Fox X-Men universe. Chronologeek groups the saga here because characters return in Deadpool & Wolverine and Doomsday.';
const SPIDER_NOTE = 'Spider-Man from another universe. Chronologeek places these before No Way Home.';

const tier3 = [
  // Fox X-Men saga, in Chronologeek's order
  fox('xmen-first-class', 'X-Men: First Class', '2011-06-03', 132, '1962', { conf: 'derived', note: FOX_NOTE }),
  fox('xmen-origins-wolverine', 'X-Men Origins: Wolverine', '2009-05-01', 107, '1979', { conf: 'derived', note: FOX_NOTE }),
  fox('xmen-2000', 'X-Men', '2000-07-14', 104, '1994 (Chronologeek) / 2000s', { conf: 'derived', note: FOX_NOTE }),
  fox('x2', 'X2: X-Men United', '2003-05-02', 134, '1994', { conf: 'derived', note: FOX_NOTE }),
  fox('last-stand', 'X-Men: The Last Stand', '2006-05-26', 104, '1999', { conf: 'derived', note: FOX_NOTE }),
  fox('the-wolverine', 'The Wolverine', '2013-07-26', 126, '2013', { conf: 'derived', note: FOX_NOTE }),
  fox('dofp', 'X-Men: Days of Future Past', '2014-05-23', 132, '2023 / 1973', { conf: 'derived', note: FOX_NOTE }),
  fox('xmen-apocalypse', 'X-Men: Apocalypse', '2016-05-27', 144, '1983', { conf: 'derived', note: FOX_NOTE }),
  fox('dark-phoenix', 'Dark Phoenix', '2019-06-07', 113, '1992', { conf: 'derived', note: FOX_NOTE }),
  fox('logan', 'Logan', '2017-03-03', 137, '2029', { conf: 'derived', note: FOX_NOTE }),
  fox('deadpool', 'Deadpool', '2016-02-12', 108, '2016', {
    conf: 'derived',
    note: 'Deadpool spoils the X-Men films, so watch them first.',
  }),
  fox('deadpool-2', 'Deadpool 2', '2018-05-18', 119, '2018', { conf: 'derived', note: FOX_NOTE }),
  mk('short', 'no-good-deed', 'No Good Deed (short)', '2017-03-03', 2, '2018', {
    ...t3(U_FOX),
    saga: 'other',
    conf: 'derived',
    note: 'Deadpool short that played before Logan.',
  }),

  // Spider-Verse detour: Raimi, Webb, Sony, animated
  film('raimi-1', 'Spider-Man', '2002-05-03', 121, '2002', { ...t3(U_RAIMI), saga: 'other', conf: 'derived', note: SPIDER_NOTE }),
  film('raimi-2', 'Spider-Man 2', '2004-06-30', 127, '2004', { ...t3(U_RAIMI), saga: 'other', conf: 'derived', note: SPIDER_NOTE }),
  film('raimi-3', 'Spider-Man 3', '2007-05-04', 139, '2005', { ...t3(U_RAIMI), saga: 'other', conf: 'derived', note: SPIDER_NOTE }),
  film('webb-1', 'The Amazing Spider-Man', '2012-07-03', 136, '2013', { ...t3(U_WEBB), saga: 'other', conf: 'derived', note: SPIDER_NOTE }),
  film('webb-2', 'The Amazing Spider-Man 2', '2014-05-02', 142, '2013–14', { ...t3(U_WEBB), saga: 'other', conf: 'derived', note: SPIDER_NOTE }),
  film('itsv', 'Spider-Man: Into the Spider-Verse', '2018-12-14', 117, 'Dec 2018', {
    ...t3(U_VERSE),
    saga: 'other',
    conf: 'derived',
    note: 'Introduces the multiverse ideas that No Way Home builds on.',
  }),
  mk('short', 'spider-ham', 'Spider-Ham: Caught in a Ham', '2019-03-19', 4, 'Before Into the Spider-Verse', {
    ...t3(U_VERSE, 'Home media'),
    saga: 'other',
    conf: 'derived',
    note: 'Short that comes with the Into the Spider-Verse home release.',
  }),
  film('venom-2018', 'Venom', '2018-10-05', 112, '2018–19', {
    ...t3(U_SSU),
    saga: 'other',
    conf: 'derived',
    note: "Its sequels reference the main MCU timeline.",
  }),
  film('venom-2', 'Venom: Let There Be Carnage', '2021-10-01', 97, '2020', {
    ...t3(U_SSU),
    saga: 'other',
    conf: 'derived',
    note: 'Its post-credits scene references the main MCU timeline.',
  }),
  film('venom-3', 'Venom: The Last Dance', '2024-10-25', 109, '2020', {
    ...t3(U_SSU),
    saga: 'other',
    conf: 'derived',
    note: 'Follows directly on from the Carnage post-credits scene, so after No Way Home.',
  }),
  film('atsv', 'Spider-Man: Across the Spider-Verse', '2023-06-02', 140, '2020', {
    ...t3(U_VERSE),
    saga: 'other',
    conf: 'derived',
    note: 'References the events of No Way Home.',
  }),
  mk('short', 'spider-within', 'The Spider Within: A Spider-Verse Story', '2023-06-15', 7, 'Miles Morales', {
    ...t3(U_VERSE, 'Online'),
    dp: 'm',
    saga: 'other',
    conf: 'derived',
    note: 'Exact release day not confirmed (June 2023).',
  }),

  // Other Marvel films and shows with no canonical placement (ordered by release in the story list)
  other('howard-duck', 'Howard the Duck', '1986-08-01', 110, '1980s'),
  other('man-thing', 'Man-Thing', '2005-04-23', 98, 'Own universe', {
    platform: 'Sci-Fi Channel',
    note: 'Release date is the TV premiere.',
  }),
  other('blade', 'Blade', '1998-08-21', 120, 'Own universe', { note: 'Chronologeek: remember the cast, skip the movies.' }),
  other('blade-2', 'Blade II', '2002-03-22', 117, 'Own universe'),
  other('blade-3', 'Blade: Trinity', '2004-12-08', 113, 'Own universe'),
  mk('season', 'blade-series', 'Blade: The Series', '2006-06-28', 13 * 43, 'Own universe', {
    ...t3(U_OTHER, 'Spike TV'),
    eps: 13,
    saga: 'other',
  }),
  other('daredevil-2003', 'Daredevil', '2003-02-14', 103, 'Own universe', { note: 'Ben Affleck. Remembered via a Deadpool & Wolverine cameo.' }),
  other('elektra', 'Elektra', '2005-01-14', 97, 'Own universe'),
  other('punisher-2004', 'The Punisher', '2004-04-16', 123, 'Own universe'),
  other('punisher-wz', 'Punisher: War Zone', '2008-12-05', 103, 'Own universe'),
  other('hulk-2003', 'Hulk', '2003-06-20', 138, 'Own universe'),
  other('ghost-rider', 'Ghost Rider', '2007-02-16', 114, 'Own universe'),
  other('ghost-rider-2', 'Ghost Rider: Spirit of Vengeance', '2012-02-17', 96, 'Own universe'),
  other('ff-2005', 'Fantastic Four', '2005-07-08', 106, 'Own universe', {
    note: 'Cast cameo in Deadpool & Wolverine. The Fox FF films are skipped by Chronologeek.',
  }),
  other('ff-2007', 'Fantastic Four: Rise of the Silver Surfer', '2007-06-15', 92, 'Own universe'),
  other('ff-2015', 'Fantastic Four', '2015-08-07', 100, 'Own universe'),
  other('new-mutants', 'The New Mutants', '2020-08-28', 94, 'Own universe', {
    note: 'Fox X-Men adjacent but references none of the other films.',
  }),
  mk('season', 'legion-s1', 'Legion: Season 1', '2017-02-08', 8 * 50, 'Own universe', { ...t3(U_OTHER, 'FX'), eps: 8, saga: 'other' }),
  mk('season', 'legion-s2', 'Legion: Season 2', '2018-04-03', 11 * 52, 'Own universe', { ...t3(U_OTHER, 'FX'), eps: 11, saga: 'other' }),
  mk('season', 'legion-s3', 'Legion: Season 3', '2019-06-24', 8 * 52, 'Own universe', { ...t3(U_OTHER, 'FX'), eps: 8, saga: 'other' }),
  mk('season', 'gifted-s1', 'The Gifted: Season 1', '2017-10-02', 13 * 43, 'Own universe', { ...t3(U_OTHER, 'Fox'), eps: 13, saga: 'other' }),
  mk('season', 'gifted-s2', 'The Gifted: Season 2', '2018-09-25', 16 * 43, 'Own universe', { ...t3(U_OTHER, 'Fox'), eps: 16, saga: 'other' }),
  mk('season', 'inhumans', 'Inhumans: Season 1', '2017-09-29', 8 * 43, 'Own universe', { ...t3(U_OTHER, 'ABC'), eps: 8, saga: 'other' }),
  mk('season', 'runaways-s1', 'Runaways: Season 1', '2017-11-21', 10 * 50, 'Own universe', { ...t3(U_OTHER, 'Hulu'), eps: 10, saga: 'other' }),
  mk('season', 'runaways-s2', 'Runaways: Season 2', '2018-12-21', 13 * 45, 'Own universe', { ...t3(U_OTHER, 'Hulu'), eps: 13, saga: 'other' }),
  mk('season', 'runaways-s3', 'Runaways: Season 3', '2019-12-13', 10 * 45, 'Own universe', { ...t3(U_OTHER, 'Hulu'), eps: 10, saga: 'other' }),
  mk('season', 'cloak-dagger-s1', 'Cloak & Dagger: Season 1', '2018-06-07', 10 * 43, 'Own universe', { ...t3(U_OTHER, 'Freeform'), eps: 10, saga: 'other' }),
  mk('season', 'cloak-dagger-s2', 'Cloak & Dagger: Season 2', '2019-04-04', 10 * 43, 'Own universe', { ...t3(U_OTHER, 'Freeform'), eps: 10, saga: 'other' }),
  mk('season', 'helstrom', 'Helstrom: Season 1', '2020-10-16', 10 * 45, 'Own universe', { ...t3(U_OTHER, 'Hulu'), eps: 10, saga: 'other' }),
  film('morbius', 'Morbius', '2022-04-01', 104, 'Own universe', { ...t3(U_SSU), saga: 'other' }),
  film('madame-web', 'Madame Web', '2024-02-14', 116, 'Own universe', { ...t3(U_SSU), saga: 'other' }),
  film('kraven', 'Kraven the Hunter', '2024-12-13', 127, 'Own universe', { ...t3(U_SSU), saga: 'other' }),
  tv('spider-noir', 'Spider-Noir (not MCU)', '2026-05-25', 8, 50, '1930s New York', {
    ...t3(U_OTHER, 'MGM+ / Prime Video'),
    saga: 'other',
    note: 'Own reality, no ties to the multiverse. Chronologeek suggests watching it after the Spider-Verse films.',
  }),
  mk('special', 'halloween-team-up', 'Spidey and the Avengers: Halloween Team-Up! (not MCU)', '2026-09-24', 0, 'Own universe', {
    ...t3(U_OTHER, 'Disney+'),
    saga: 'other',
    note: 'Runtime not yet listed.',
  }),
  film('beyond-spider-verse', 'Beyond the Spider-Verse', '2027-01-01', 0, 'Miles Morales', {
    ...t3(U_VERSE),
    dp: 'y',
    saga: 'other',
    note: 'Announced for 2027.',
  }),
];

/* -------------------------------------------------------------------------- */
/* TIER 4 — Bonus material                                                    */
/* -------------------------------------------------------------------------- */

const t4 = { tier: 4, conf: 'unplaced' };

const tier4 = [
  mk('doc', 'expanding-universe', 'Marvel Studios: Expanding the Universe', '2019-11-12', 0, 'N/A (documentary)', {
    ...t4,
    platform: 'Disney+',
    note: 'Behind-the-scenes documentary released at Disney+ launch.',
  }),
  mk('doc', 'legends', 'Marvel Studios: Legends', '2021-01-08', 0, 'N/A (recap clips)', {
    ...t4,
    platform: 'Disney+',
    note: 'Clip-based character recaps released before the Disney+ series.',
  }),
  mk('doc', 'assembled', 'Marvel Studios: Assembled', '2021-03-12', 0, 'N/A (making-of specials)', {
    ...t4,
    platform: 'Disney+',
    note: 'Behind-the-scenes specials released shortly after each project. Not in-universe.',
  }),
  mk('viral', 'whih-newsfront', 'WHIH Newsfront', '2015-07-01', 0, '2015–16 (in-universe news)', {
    ...t4,
    dp: 'm',
    platform: 'YouTube',
    note: 'In-universe news segments for Ant-Man and Civil War. Release dates are approximate.',
  }),
  mk('viral', 'daily-bugle', 'The Daily Bugle', '2019-06-01', 0, '2019–2022 (in-universe news)', {
    ...t4,
    dp: 'm',
    platform: 'YouTube',
    note: 'In-universe news for Far From Home and No Way Home. Release dates are approximate.',
  }),
];

/* -------------------------------------------------------------------------- */
/* Relocated post-credits scenes (story order only)                           */
/* -------------------------------------------------------------------------- */

const scenes = [
  scene('scene-ragnarok-pcs', 'ragnarok', 'Thor: Ragnarok · first post-credits scene', '2017-11-03', 'Start of Infinity War'),
  scene('scene-amatw-pcs', 'ant-man-wasp', 'Ant-Man and the Wasp · first post-credits scene', '2018-07-06', 'During Infinity War'),
  scene('scene-cm-pcs', 'captain-marvel', 'Captain Marvel · first post-credits scene', '2019-03-08', 'After Infinity War'),
  scene('scene-bw-pcs', 'black-widow', 'Black Widow · post-credits scene', '2021-07-09', 'Shortly before Hawkeye'),
  scene('scene-marvels-pcs', 'the-marvels', 'The Marvels · post-credits scene', '2023-11-10', 'After Monica crosses the rift'),
  scene('scene-tb-pcs2', 'thunderbolts', 'Thunderbolts* · second post-credits scene', '2025-05-02', 'December 2028', {
    note: 'Likely leads into Doomsday.',
  }),
  scene('scene-endgame-encore', 'endgame', 'Avengers: Endgame Encore · extra scenes', '2019-06-28', 'After Brand New Day', {
    note: 'Only in the Endgame Encore cut: a pre-credits Peggy & Steve scene plus both post-credits scenes. Watch just before Doomsday.',
  }),
];

export const TITLES = [...tier1Films, ...tier1Shows, ...tier2, ...tier3, ...tier4, ...scenes];

export const TITLE_BY_ID = new Map(TITLES.map((t) => [t.id, t]));

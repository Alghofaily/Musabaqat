// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz where every right answer is a gamble on a hidden square more tense than plain points?
// Date: 2026-11-24
// The rules of Haql al-Alghaam (a mine field the winning team opens one square of), no drawing, no clock, no UI text.
// Failures return { ok: false, err: code } and leave the game untouched; the UI maps the codes to words. rules.test.js checks all of it.
// A game `g` is plain JSON: { size, mineCount, map: 'random'|1..10, seed, field, mines: [bool], counts: [n],
//   cells: [{ open, by: team|'blast'|null, hit, late? }], teams: [{ score, gained, lost, safe, hits }],
//   log: [{ field, team, delta, kind: 'safe'|'mine'|'adjust', at: index|null }] }. Cell index i = r*size + c.
(function (root) {
  const DEFAULT_TUNE = {
    safePoints: 10, minePenalty: 20, blast: 4, presetMaps: 10,
    suggestedMines: { 6: [5, 7, 9], 7: [7, 10, 13], 8: [10, 13, 16], 10: [15, 20, 25] },
  };
  const SIZES = [6, 7, 8, 10];

  // identical to the original so fixed maps reproduce its layouts
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function generateMines(size, count, seed) {
    const total = size * size, order = Array.from({ length: total }, (_, i) => i), rnd = mulberry32(seed);
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const mines = new Array(total).fill(false);
    for (let k = 0; k < count; k++) mines[order[k]] = true;
    return mines;
  }

  function neighbors(i, size) {
    const r = Math.floor(i / size), c = i % size, out = [];
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < size && cc >= 0 && cc < size) out.push(rr * size + cc);
      }
    return out;
  }
  const isOrthogonal = (a, b, size) => Math.floor(a / size) === Math.floor(b / size) || a % size === b % size;
  const countsFor = (mines, size) => mines.map((_, i) => neighbors(i, size).filter(j => mines[j]).length);
  const fixedSeed = (size, n) => size * 7919 + n * 104729;

  function pickSeed(size, map, rng, lastSeed) {
    if (map !== 'random') return { seed: fixedSeed(size, map) };
    let seed;
    do { seed = 1 + Math.floor(rng() * 1e9); } while (seed === lastSeed);
    return { seed };
  }

  function layout(g, seed) {
    g.seed = seed;
    g.mines = generateMines(g.size, g.mineCount, seed);
    g.counts = countsFor(g.mines, g.size);
    g.cells = g.mines.map(() => ({ open: false, by: null, hit: false }));
  }

  function newGame(o, tune, rng, lastSeed) {
    const okMap = o.map === 'random' || (Number.isInteger(o.map) && o.map >= 1 && o.map <= tune.presetMaps);
    if (!Number.isInteger(o.teams) || o.teams < 2 || o.teams > 6) throw new Error('teams must be 2..6');
    if (!SIZES.includes(o.size)) throw new Error('size must be one of ' + SIZES);
    if (!Number.isInteger(o.mines) || o.mines < 1 || o.mines >= o.size * o.size) throw new Error('bad mine count');
    if (!okMap) throw new Error('bad map');
    const g = { size: o.size, mineCount: o.mines, map: o.map, seed: 0, field: 1 };
    layout(g, pickSeed(o.size, o.map, rng, lastSeed).seed);
    g.teams = Array.from({ length: o.teams }, () => ({ score: 0, gained: 0, lost: 0, safe: 0, hits: 0 }));
    g.log = [];
    return g;
  }

  const fail = err => ({ ok: false, err });
  // clear once every SAFE square is open; the mines still closed then are shown by revealMines
const fieldClear = g => g.cells.every((c, i) => g.mines[i] || c.open);
function revealMines(g) { // the closed mines are laid bare: open, nobody's (by null), marked late, no points
  const shown = [];
  g.cells.forEach((c, i) => { if (g.mines[i] && !c.open) { c.open = true; c.by = null; c.late = true; shown.push(i); } });
  return shown;
}
  const closedCount = g => g.cells.filter(c => !c.open).length;
  const minesLeft = g => g.mines.filter((m, i) => m && !g.cells[i].open).length;

  function score(g, team, delta, kind, at) {
    const t = g.teams[team];
    t.score += delta;
    if (delta > 0) t.gained += delta; else t.lost -= delta;
    g.log.push({ field: g.field, team, delta, kind, at });
  }

  function shuffle(a, rng) {
    for (let k = a.length - 1; k > 0; k--) { const r = Math.floor(rng() * (k + 1)); [a[k], a[r]] = [a[r], a[k]]; }
    return a;
  }

  function openSquare(g, team, i, tune, rng) {
    if (fieldClear(g)) return fail('over');
    if (!Number.isInteger(team) || team < 0 || team >= g.teams.length) return fail('team');
    if (!Number.isInteger(i) || i < 0 || i >= g.cells.length) return fail('bounds');
    if (g.cells[i].open) return fail('open');
    const cell = g.cells[i];
    cell.open = true; cell.by = team;
    if (!g.mines[i]) {
      g.teams[team].safe++;
      score(g, team, tune.safePoints, 'safe', i);
      return { ok: true, kind: 'safe', delta: tune.safePoints, blasted: [] };
    }
    cell.hit = true;
    g.teams[team].hits++;
    score(g, team, -tune.minePenalty, 'mine', i);
    const closed = neighbors(i, g.size).filter(j => !g.cells[j].open);
    const blasted = [...shuffle(closed.filter(j => isOrthogonal(i, j, g.size)), rng),
      ...shuffle(closed.filter(j => !isOrthogonal(i, j, g.size)), rng)].slice(0, tune.blast);
    for (const j of blasted) { g.cells[j].open = true; g.cells[j].by = 'blast'; }
    return { ok: true, kind: 'mine', delta: -tune.minePenalty, blasted };
  }

  function nextField(g, tune, rng) {
    if (g.map !== 'random') g.map = (g.map % tune.presetMaps) + 1;
    g.field++;
    layout(g, pickSeed(g.size, g.map, rng, g.seed).seed);
  }

  const adjust = (g, team, delta) => score(g, team, delta, 'adjust', null);

  function ranking(g) {
    const rows = g.teams.map((t, team) => ({ team, score: t.score })).sort((a, b) => b.score - a.score || a.team - b.team);
    rows.forEach((r, k) => { r.place = k && rows[k - 1].score === r.score ? rows[k - 1].place : k + 1; });
    return rows;
  }

  const api = { DEFAULT_TUNE, mulberry32, generateMines, neighbors, countsFor, fixedSeed, pickSeed, newGame,
    openSquare, fieldClear, revealMines, nextField, adjust, minesLeft, closedCount, ranking };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HaqlRules = api;
})(typeof window !== 'undefined' ? window : globalThis);

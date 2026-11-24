// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz where every right answer is a gamble on a hidden square more tense than plain points?
// Date: 2026-11-24
// Checks the rules of Haql al-Alghaam. Run: node --test prototypes/haql-al-alghaam/rules.test.js
const test = require('node:test');
const assert = require('node:assert');
const R = require('./rules.js');
const T = R.DEFAULT_TUNE;

function seeded(s) { // mulberry32, so a seed gives the same game every run
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// COPY of the original Kasiha/app.js generateMines + mulberry32, used only to cross-check the module.
function origMines(size, count, seed) {
  let a = seed >>> 0;
  const rnd = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const total = size * size, order = Array.from({ length: total }, (_, i) => i);
  for (let i = total - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const m = new Array(total).fill(false);
  for (let k = 0; k < count; k++) m[order[k]] = true;
  return m;
}
const idx = m => m.map((v, i) => (v ? i : -1)).filter(x => x >= 0);
const snap = g => JSON.parse(JSON.stringify(g));
const fresh = (o = {}) => R.newGame(Object.assign({ teams: 3, size: 6, mines: 5, map: 1 }, o), T, seeded(1), 0);
// hand-built board: size 6 unless given, mines at the listed indices, counts recomputed
function board(mineIdx, o = {}) {
  const g = fresh(o);
  g.mines = g.mines.map((_, i) => mineIdx.includes(i));
  g.counts = R.countsFor(g.mines, g.size);
  g.mineCount = mineIdx.length;
  return g;
}

test('mulberry32 + generateMines reproduce the original layout (size 7, map 1, 10 mines)', () => {
  const seed = R.fixedSeed(7, 1);
  assert.strictEqual(seed, 7 * 7919 + 104729);
  const m = R.generateMines(7, 10, seed);
  assert.deepStrictEqual(idx(m), [3, 4, 5, 6, 11, 13, 19, 25, 37, 39]);
  assert.deepStrictEqual(m, origMines(7, 10, seed));
  assert.deepStrictEqual(R.generateMines(7, 10, seed), m);
});

test('generateMines: exact count, length, all sizes', () => {
  for (const [s, n] of [[6, 5], [7, 13], [8, 16], [10, 25], [6, 35]]) {
    const m = R.generateMines(s, n, 12345);
    assert.strictEqual(m.length, s * s);
    assert.strictEqual(m.filter(Boolean).length, n);
  }
});

test('neighbors: corner 3, edge 5, centre 8, in the original order', () => {
  assert.deepStrictEqual(R.neighbors(0, 6), [1, 6, 7]);
  assert.deepStrictEqual(R.neighbors(35, 6), [28, 29, 34]);
  assert.deepStrictEqual(R.neighbors(3, 6), [2, 4, 8, 9, 10]);
  assert.deepStrictEqual(R.neighbors(14, 6), [7, 8, 9, 13, 15, 19, 20, 21]);
});

test('counts on a hand-built board', () => {
  const g = board([0, 1, 14]);
  assert.strictEqual(g.counts[0], 1);   // neighbour 1
  assert.strictEqual(g.counts[7], 3);   // 0,1,14
  assert.strictEqual(g.counts[8], 2);   // 1,14
  assert.strictEqual(g.counts[35], 0);
  assert.strictEqual(g.counts[14], 0);  // a mine does not count itself
});

test('pickSeed: fixed is deterministic, random avoids the last seed', () => {
  assert.deepStrictEqual(R.pickSeed(8, 3, seeded(1), 0), { seed: 8 * 7919 + 3 * 104729 });
  const s1 = R.pickSeed(6, 'random', seeded(5), 0).seed;
  assert.ok(Number.isInteger(s1) && s1 >= 1 && s1 <= 1e9);
  assert.strictEqual(s1, 1 + Math.floor(seeded(5)() * 1e9));
  assert.notStrictEqual(R.pickSeed(6, 'random', seeded(5), s1).seed, s1);
  const seq = [0.5, 0.5, 0.7]; // first draw equals last -> redraw
  let k = 0;
  const last = 1 + Math.floor(0.5 * 1e9);
  assert.strictEqual(R.pickSeed(6, 'random', () => seq[k++], last).seed, 1 + Math.floor(0.7 * 1e9));
});

test('newGame: initial state', () => {
  const g = fresh();
  assert.strictEqual(g.field, 1);
  assert.strictEqual(g.seed, R.fixedSeed(6, 1));
  assert.strictEqual(g.map, 1);
  assert.strictEqual(g.cells.length, 36);
  assert.ok(g.cells.every(c => !c.open && c.by === null && !c.hit));
  assert.strictEqual(g.teams.length, 3);
  assert.ok(g.teams.every(t => t.score === 0 && t.gained === 0 && t.lost === 0 && t.safe === 0 && t.hits === 0));
  assert.deepStrictEqual(g.log, []);
  assert.strictEqual(R.minesLeft(g), 5);
  assert.strictEqual(R.closedCount(g), 36);
  assert.strictEqual(fresh({ map: 'random' }).map, 'random');
});

test('newGame: validation throws', () => {
  for (const bad of [{ teams: 1 }, { teams: 7 }, { size: 9 }, { mines: 0 }, { mines: 36 }, { map: 0 }, { map: 11 }, { map: 'x' }])
    assert.throws(() => fresh(bad), undefined, JSON.stringify(bad));
  assert.doesNotThrow(() => fresh({ teams: 6, size: 10, mines: 99, map: 10 }));
});

test('safe open: points, colour, stats, log', () => {
  const g = board([0]);
  const r = R.openSquare(g, 1, 35, T, seeded(1));
  assert.deepStrictEqual(r, { ok: true, kind: 'safe', delta: 10, blasted: [] });
  assert.strictEqual(g.cells[35].open, true);
  assert.strictEqual(g.cells[35].by, 1);
  assert.strictEqual(g.teams[1].score, 10);
  assert.strictEqual(g.teams[1].safe, 1);
  assert.strictEqual(g.teams[1].gained, 10);
  assert.deepStrictEqual(g.log, [{ field: 1, team: 1, delta: 10, kind: 'safe', at: 35 }]);
});

test('a 0 square opens only itself (no flood fill)', () => {
  const g = board([0]);
  assert.strictEqual(g.counts[35], 0);
  R.openSquare(g, 0, 35, T, seeded(1));
  assert.strictEqual(R.closedCount(g), 35);
});

test('mine: penalty, negative score, hit flag, stats, log', () => {
  const g = board([14]);
  const r = R.openSquare(g, 2, 14, T, seeded(1));
  assert.strictEqual(r.kind, 'mine');
  assert.strictEqual(r.delta, -20);
  assert.strictEqual(g.teams[2].score, -20);
  assert.strictEqual(g.teams[2].hits, 1);
  assert.strictEqual(g.teams[2].lost, 20);
  assert.strictEqual(g.cells[14].hit, true);
  assert.strictEqual(g.cells[14].by, 2);
  assert.deepStrictEqual(g.log[0], { field: 1, team: 2, delta: -20, kind: 'mine', at: 14 });
  assert.strictEqual(R.minesLeft(g), 0);
});

test('blast: at most tune.blast, orthogonal before diagonal, no points, no chain', () => {
  const g = board([14, 15]); // 15 is an orthogonal neighbour of 14
  const r = R.openSquare(g, 0, 14, T, seeded(7));
  assert.strictEqual(r.blasted.length, 4);
  const ortho = [8, 13, 15, 20]; // 7 neighbours' orthogonal set of 14 (up, left, right, down)
  assert.deepStrictEqual([...r.blasted].sort((a, b) => a - b), ortho);
  for (const j of r.blasted) { assert.strictEqual(g.cells[j].open, true); assert.strictEqual(g.cells[j].by, 'blast'); }
  assert.strictEqual(g.cells[15].hit, false); // blasted mine does not explode
  assert.strictEqual(g.teams[0].score, -20);  // nothing scored for blasted cells, no second penalty
  assert.strictEqual(g.teams[0].hits, 1);
  assert.strictEqual(g.log.length, 1);
});

test('blast: diagonals fill in after the orthogonals are used up', () => {
  const g = board([14]);
  g.cells[8].open = true; g.cells[13].open = true; // two orthogonal already open
  const r = R.openSquare(g, 0, 14, T, seeded(3));
  assert.strictEqual(r.blasted.length, 4);
  assert.ok(r.blasted.slice(0, 2).every(j => [15, 20].includes(j)));
  assert.ok(r.blasted.slice(2).every(j => [7, 9, 19, 21].includes(j)));
});

test('blast: tune.blast limits, and the rng picks which', () => {
  const g1 = board([14]), g2 = board([14]);
  const r1 = R.openSquare(g1, 0, 14, T, seeded(1));
  const r2 = R.openSquare(g2, 0, 14, T, seeded(1));
  assert.deepStrictEqual(r1.blasted, r2.blasted);
  const g3 = board([14]);
  assert.strictEqual(R.openSquare(g3, 0, 14, Object.assign({}, T, { blast: 2 }), seeded(1)).blasted.length, 2);
  const g4 = board([14]);
  assert.strictEqual(R.openSquare(g4, 0, 14, Object.assign({}, T, { blast: 0 }), seeded(1)).blasted.length, 0);
  const picks = new Set();
  for (let s = 1; s < 30; s++) picks.add(R.openSquare(board([14]), 0, 14, T, seeded(s)).blasted.join());
  assert.ok(picks.size > 1);
});

test('blast near an edge and in a corner', () => {
  const e = board([3]); // top edge: 2,4,8,9,10 -> 5 neighbours, blast 4: ortho 2,4,9 then one diagonal
  const re = R.openSquare(e, 0, 3, T, seeded(2));
  assert.strictEqual(re.blasted.length, 4);
  assert.ok([2, 4, 9].every(j => re.blasted.includes(j)));
  assert.ok([8, 10].includes(re.blasted[3]));
  const c = board([0]); // corner: 1,6,7
  const rc = R.openSquare(c, 0, 0, T, seeded(2));
  assert.deepStrictEqual([...rc.blasted].sort((a, b) => a - b), [1, 6, 7]);
  assert.strictEqual(rc.blasted[2], 7);
});

test('blast with fewer closed neighbours skips already-open ones', () => {
  const g = board([0]);
  g.cells[1].open = true; g.cells[6].open = true;
  const r = R.openSquare(g, 0, 0, T, seeded(1));
  assert.deepStrictEqual(r.blasted, [7]);
});

test('failures leave g unchanged: open, bounds, team, over', () => {
  const g = board([0]);
  R.openSquare(g, 0, 20, T, seeded(1));
  const before = snap(g);
  assert.deepStrictEqual(R.openSquare(g, 0, 20, T, seeded(1)), { ok: false, err: 'open' });
  assert.deepStrictEqual(R.openSquare(g, 0, -1, T, seeded(1)), { ok: false, err: 'bounds' });
  assert.deepStrictEqual(R.openSquare(g, 0, 36, T, seeded(1)), { ok: false, err: 'bounds' });
  assert.deepStrictEqual(R.openSquare(g, 0, 1.5, T, seeded(1)), { ok: false, err: 'bounds' });
  assert.deepStrictEqual(R.openSquare(g, 3, 21, T, seeded(1)), { ok: false, err: 'team' });
  assert.deepStrictEqual(R.openSquare(g, -1, 21, T, seeded(1)), { ok: false, err: 'team' });
  assert.deepStrictEqual(g, before);
  g.cells.forEach(c => { c.open = true; });
  const cleared = snap(g);
  assert.deepStrictEqual(R.openSquare(g, 0, 5, T, seeded(1)), { ok: false, err: 'over' });
  assert.deepStrictEqual(g, cleared);
});

test('fieldClear: true once every safe square is open, mines may stay closed', () => {
  const g = board([0, 7]);
  assert.strictEqual(R.fieldClear(g), false);
  g.cells.forEach((c, i) => { if (!g.mines[i]) c.open = true; });
  assert.strictEqual(R.fieldClear(g), true); // only the two mines are closed
  g.cells[4].open = false;
  assert.strictEqual(R.fieldClear(g), false);
});

test('revealMines: opens the closed mines as late, nobody\'s, no points; a field with only mines closed refuses openSquare', () => {
  const g = board([0, 7]);
  g.cells.forEach((c, i) => { if (!g.mines[i]) c.open = true; });
  g.cells[7].open = true; g.cells[7].by = 1; g.cells[7].hit = true; // one mine was hit earlier
  const score = snap(g.teams), log = g.log.length;
  assert.deepStrictEqual(R.openSquare(g, 0, 0, T, seeded(1)), { ok: false, err: 'over' });
  assert.deepStrictEqual(R.revealMines(g), [0]);
  assert.ok(g.cells[0].open && g.cells[0].by === null && g.cells[0].late === true && !g.cells[0].hit);
  assert.ok(!g.cells[7].late && g.cells[7].by === 1);
  assert.deepStrictEqual(g.teams, score); assert.strictEqual(g.log.length, log);
  assert.strictEqual(R.minesLeft(g), 0);
  assert.deepStrictEqual(R.revealMines(g), []);
});

test('a blast that opens the last safe squares clears the field', () => {
  const g = board([14]); // mine at row 2 col 2
  g.cells.forEach((c, i) => { if (!g.mines[i] && ![8, 13].includes(i)) c.open = true; });
  assert.strictEqual(R.fieldClear(g), false);
  const r = R.openSquare(g, 0, 14, T, seeded(1)); // blast throws open its closed neighbours 8 and 13
  assert.ok(r.kind === 'mine' && r.blasted.includes(8) && r.blasted.includes(13));
  assert.strictEqual(R.fieldClear(g), true);
});

test('nextField: keeps scores/stats/log, field+1, fixed map advances and wraps', () => {
  const g = fresh({ map: 3 });
  R.openSquare(g, 0, R.generateMines(6, 5, g.seed).findIndex(x => !x), T, seeded(1));
  const before = snap(g);
  R.nextField(g, T, seeded(1));
  assert.strictEqual(g.field, 2);
  assert.strictEqual(g.map, 4);
  assert.strictEqual(g.seed, R.fixedSeed(6, 4));
  assert.deepStrictEqual(g.teams, before.teams);
  assert.deepStrictEqual(g.log, before.log);
  assert.ok(g.cells.every(c => !c.open && c.by === null && !c.hit));
  assert.strictEqual(g.size, 6);
  assert.strictEqual(g.mines.filter(Boolean).length, 5);
  assert.deepStrictEqual(g.counts, R.countsFor(g.mines, 6));
  const w = fresh({ map: 10 });
  R.nextField(w, T, seeded(1));
  assert.strictEqual(w.map, 1);
});

test('nextField: random redraws a different seed and stays random', () => {
  const g = fresh({ map: 'random' });
  const old = g.seed;
  R.nextField(g, T, seeded(9));
  assert.strictEqual(g.map, 'random');
  assert.notStrictEqual(g.seed, old);
  assert.strictEqual(g.field, 2);
});

test('adjust: changes score, logged as adjust, counts in gained/lost', () => {
  const g = fresh();
  R.adjust(g, 1, 15);
  R.adjust(g, 1, -40);
  assert.strictEqual(g.teams[1].score, -25);
  assert.strictEqual(g.teams[1].gained, 15);
  assert.strictEqual(g.teams[1].lost, 40);
  assert.deepStrictEqual(g.log[1], { field: 1, team: 1, delta: -40, kind: 'adjust', at: null });
  assert.strictEqual(g.teams[1].safe, 0);
  assert.strictEqual(g.teams[1].hits, 0);
});

test('ranking: desc, ties share a place, negatives sort', () => {
  const g = fresh({ teams: 5 });
  [10, -20, 30, 10, -5].forEach((s, i) => { g.teams[i].score = s; });
  const r = R.ranking(g);
  assert.deepStrictEqual(r.map(x => x.score), [30, 10, 10, -5, -20]);
  assert.deepStrictEqual(r.map(x => x.place), [1, 2, 2, 4, 5]);
  assert.deepStrictEqual(r.map(x => x.team), [2, 0, 3, 4, 1]);
});

test('JSON round-trip keeps the game playable and identical', () => {
  const g = fresh();
  R.openSquare(g, 1, 0, T, seeded(4));
  R.adjust(g, 0, 5);
  const copy = JSON.parse(JSON.stringify(g));
  assert.deepStrictEqual(copy, g);
  const a = R.openSquare(g, 2, 35, T, seeded(8)), b = R.openSquare(copy, 2, 35, T, seeded(8));
  assert.deepStrictEqual(a, b);
  assert.deepStrictEqual(copy, g);
});

// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz where each answer buys one move on a board you can block more tense than plain points?
// Date: 2026-11-24
// Checks the board rules of Duroob. Run: node --test prototypes/duroob/rules.test.js
const test = require('node:test');
const assert = require('node:assert');
const R = require('./rules.js');
const T = R.DEFAULT_TUNE;

function seeded(s) { // mulberry32, so a seed gives the same game every run
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const fresh = (teams = 2, size = 9, opts = { walls: 'auto', boxes: false }, seed = 3) => R.newGame(size, teams, opts, T, seeded(seed));
const snap = g => JSON.parse(JSON.stringify(g));
const at = (g, i, r, c) => { g.teams[i].pos = [r, c]; };
const has = (moves, r, c) => moves.some(m => m[0] === r && m[1] === c);

test('newGame: sizes, wall stock (auto 2 teams, auto 3-4, fixed), sides, no pawns on board', () => {
  assert.strictEqual(fresh(2, 9).teams[0].walls, 10);
  assert.strictEqual(fresh(2, 12).teams[1].walls, 15);
  assert.strictEqual(fresh(3, 10).teams[2].walls, 6);
  assert.strictEqual(fresh(4, 12).teams[3].walls, 8);
  assert.strictEqual(fresh(3, 9, { walls: 7, boxes: false }).teams[0].walls, 7);
  const g = fresh(4);
  assert.strictEqual(g.size, 9);
  assert.deepStrictEqual(g.teams.map(t => t.side), [0, 1, 2, 3]);
  assert.ok(g.teams.every(t => t.pos === null && t.score === 0 && !t.frozen && t.inv.hammer === 0 && t.inv.double === 0));
});

test('boxes: count per size, interior only, none when off, JSON round-trip', () => {
  for (const [size, n] of [[9, 3], [10, 4], [12, 5]]) {
    const g = fresh(2, size, { walls: 'auto', boxes: true });
    assert.strictEqual(g.boxes.length, n);
    assert.strictEqual(new Set(g.boxes).size, n);
    for (const k of g.boxes) { const [r, c] = k.split(',').map(Number); assert.ok(r >= 1 && r <= size - 2 && c >= 1 && c <= size - 2); }
    assert.deepStrictEqual(JSON.parse(JSON.stringify(g)), g);
  }
  assert.strictEqual(fresh().boxes.length, 0);
  assert.strictEqual(R.boxesFor(10, { boxes: true }, T), 4);
  assert.strictEqual(R.wallsFor(2, 10, { walls: 'auto' }, T), 12);
});

test('orthogonal moves from the middle', () => {
  const g = fresh(); at(g, 0, 4, 4);
  const m = R.pawnMoves(g, 0);
  assert.strictEqual(m.length, 4);
  for (const [r, c] of [[3, 4], [5, 4], [4, 3], [4, 5]]) assert.ok(has(m, r, c));
  assert.deepStrictEqual(R.pawnMoves(g, 1), []);
});

test('straight jump over an adjacent pawn', () => {
  const g = fresh(); at(g, 0, 4, 4); at(g, 1, 3, 4);
  const m = R.pawnMoves(g, 0);
  assert.ok(has(m, 2, 4)); assert.ok(!has(m, 3, 4)); assert.ok(!has(m, 3, 3));
});

test('side-step when the jump is blocked by a wall, and by the edge', () => {
  let g = fresh(); at(g, 0, 4, 4); at(g, 1, 3, 4); g.hw['2,4'] = -1; // wall between rows 2 and 3
  let m = R.pawnMoves(g, 0);
  assert.ok(!has(m, 2, 4)); assert.ok(has(m, 3, 3)); assert.ok(has(m, 3, 5));
  g = fresh(); at(g, 0, 1, 4); at(g, 1, 0, 4);
  m = R.pawnMoves(g, 0);
  assert.ok(has(m, 0, 3)); assert.ok(has(m, 0, 5)); assert.ok(!has(m, 0, 4));
  assert.strictEqual(m.length, new Set(m.map(String)).size);
});

test('walls block moves, horizontal and vertical, both columns/rows they span', () => {
  const g = fresh(); g.hw['3,3'] = -1; g.vw['6,6'] = -1;
  assert.ok(R.blocked(g, 3, 3, 1, 0) && R.blocked(g, 3, 4, 1, 0) && R.blocked(g, 4, 3, -1, 0) && R.blocked(g, 4, 4, -1, 0));
  assert.ok(!R.blocked(g, 3, 5, 1, 0) && !R.blocked(g, 3, 2, 1, 0));
  assert.ok(R.blocked(g, 6, 6, 0, 1) && R.blocked(g, 7, 6, 0, 1) && R.blocked(g, 6, 7, 0, -1) && R.blocked(g, 7, 7, 0, -1));
  assert.ok(!R.blocked(g, 8, 6, 0, 1));
  at(g, 0, 3, 3);
  assert.ok(!has(R.pawnMoves(g, 0), 4, 3));
});

test('wallCheck: bounds, overlap (incl. half-overlap), cross', () => {
  const g = fresh(); const n = g.size - 2;
  for (const [r, c] of [[-1, 0], [0, -1], [n + 1, 0], [0, n + 1]]) assert.strictEqual(R.wallCheck(g, 'h', r, c).err, 'bounds');
  assert.strictEqual(R.wallCheck(g, 'v', 3, 3).err, null);
  g.hw['3,3'] = -1;
  for (const c of [2, 3, 4]) assert.strictEqual(R.wallCheck(g, 'h', 3, c).err, 'overlap');
  assert.strictEqual(R.wallCheck(g, 'h', 3, 5).err, null);
  assert.strictEqual(R.wallCheck(g, 'h', 4, 3).err, null);
  assert.strictEqual(R.wallCheck(g, 'v', 3, 3).err, 'cross');
  g.vw['5,5'] = -1;
  for (const r of [4, 5, 6]) assert.strictEqual(R.wallCheck(g, 'v', r, 5).err, 'overlap');
  assert.strictEqual(R.wallCheck(g, 'v', 7, 5).err, null);
  assert.strictEqual(R.wallCheck(g, 'h', 5, 5).err, 'cross');
});

test('a sealing wall is allowed and reported in blocks', () => {
  const g = fresh(2, 9, { walls: 100, boxes: false }); at(g, 0, 8, 0); // team 0 goal: row 0
  // seal across the whole board between rows 3 and 4 except columns 0-1; then close the last gap
  for (const c of [2, 4, 6]) g.hw['3,' + c] = 0;
  assert.deepStrictEqual(R.wallCheck(g, 'h', 3, 7).blocks, []);
  g.hw['3,7'] = 0; // covers columns 7-8; gap is columns 0-1
  assert.ok(R.hasPath(g, 0));
  const chk = R.wallCheck(g, 'h', 3, 0);
  assert.strictEqual(chk.err, null); assert.deepStrictEqual(chk.blocks, [0]);
  const before = snap(g);
  const res = R.placeWall(g, 0, 'h', 3, 0);
  assert.ok(res.ok); assert.deepStrictEqual(res.blocks, [0]);
  assert.ok(!R.hasPath(g, 0)); assert.ok(R.hasPath(g, 0, null));
  assert.strictEqual(g.teams[0].walls, before.teams[0].walls - 1);
});

test('placeWall: stock, frozen, owner recorded, failures leave g unchanged', () => {
  const g = fresh();
  assert.ok(R.placeWall(g, 1, 'v', 2, 2).ok);
  assert.strictEqual(g.vw['2,2'], 1); assert.strictEqual(g.teams[1].walls, 9);
  let before = snap(g);
  assert.deepStrictEqual(R.placeWall(g, 0, 'v', 2, 2), { ok: false, err: 'overlap', blocks: [] });
  assert.strictEqual(R.placeWall(g, 0, 'h', 2, 2).err, 'cross');
  assert.strictEqual(R.placeWall(g, 0, 'h', 9, 2).err, 'bounds');
  g.teams[0].frozen = true; before = snap(g);
  assert.strictEqual(R.placeWall(g, 0, 'h', 5, 5).err, 'frozen');
  g.teams[0].frozen = false; g.teams[0].walls = 0; before = snap(g);
  assert.strictEqual(R.placeWall(g, 0, 'h', 5, 5).err, 'no-walls');
  assert.deepStrictEqual(g, before);
});

test('enter and entryCells: start edge, empty, path preferred; frozen and bad cell fail', () => {
  const g = fresh(4);
  assert.strictEqual(R.entryCells(g, 0).length, 9);
  assert.ok(R.entryCells(g, 0).every(([r]) => r === 8));
  assert.ok(R.entryCells(g, 2).every(([, c]) => c === 8));
  assert.ok(R.entryCells(g, 3).every(([, c]) => c === 0));
  assert.ok(R.entryCells(g, 1).every(([r]) => r === 0));
  at(g, 1, 0, 4); at(g, 0, 8, 2);
  assert.ok(!has(R.entryCells(g, 1), 0, 4));
  const before = snap(g);
  assert.strictEqual(R.enter(g, 0, 5, 5).err, 'not-entry');
  assert.strictEqual(R.enter(g, 1, 0, 4).err, 'not-entry');
  assert.deepStrictEqual(g, before);
  g.teams[1].frozen = true; assert.strictEqual(R.enter(g, 1, 0, 5).err, 'frozen');
  g.teams[1].frozen = false; g.teams[1].pos = null;
  assert.deepStrictEqual(R.enter(g, 1, 0, 5), { ok: true });
  assert.deepStrictEqual(g.teams[1].pos, [0, 5]);
});

test('entryCells prefers cells with a path', () => {
  const g = fresh(2, 9, { walls: 100, boxes: false });
  // box in column 0-1 on row 8 off: wall the bottom-left corner pocket
  g.hw['7,0'] = 0; g.vw['7,1'] = 0; // cell (8,0),(8,1)... (8,0) sealed? hw 7,0 blocks cols 0-1 upward
  const cells = R.entryCells(g, 0);
  assert.ok(!has(cells, 8, 0));
  assert.ok(has(cells, 8, 5));
});

test('step: illegal move, off-board pawn, frozen; moving and scoring', () => {
  const g = fresh(); at(g, 0, 4, 4);
  const rng = seeded(1);
  let before = snap(g);
  assert.strictEqual(R.step(g, 0, 2, 4, rng, T).err, 'illegal');
  assert.strictEqual(R.step(g, 1, 0, 0, rng, T).err, 'illegal');
  g.teams[0].frozen = true; before = snap(g);
  assert.strictEqual(R.step(g, 0, 3, 4, rng, T).err, 'frozen');
  assert.deepStrictEqual(g, before);
  g.teams[0].frozen = false;
  assert.deepStrictEqual(R.step(g, 0, 3, 4, rng, T), { ok: true });
  assert.deepStrictEqual(g.teams[0].pos, [3, 4]);
});

test('scoring leaves a mark, clears pos and frozen, and the team can enter again', () => {
  const g = fresh(4); at(g, 0, 1, 4); at(g, 2, 4, 8);
  assert.deepStrictEqual(R.step(g, 0, 0, 4, seeded(1), T), { ok: true, scored: true });
  assert.strictEqual(g.teams[0].score, 1); assert.strictEqual(g.teams[0].pos, null); assert.strictEqual(g.teams[0].frozen, false);
  assert.deepStrictEqual(g.marks, [{ r: 0, c: 4, team: 0 }]);
  assert.strictEqual(R.occAt(g, 0, 4), -1);
  assert.ok(R.enter(g, 0, 8, 4).ok);
  // other sides score on their own edge
  at(g, 2, 4, 1); assert.ok(R.step(g, 2, 4, 0, seeded(1), T).scored);
  at(g, 1, 7, 2); assert.ok(R.step(g, 1, 8, 2, seeded(1), T).scored);
  at(g, 3, 5, 7); assert.ok(R.step(g, 3, 5, 8, seeded(1), T).scored);
});

function boxGame(roll, i = 0) {
  const g = fresh(); g.boxes = ['3,4']; g.boxWant = 1; at(g, i, 4, 4);
  return { g, res: R.step(g, i, 3, 4, () => roll, T) };
}

test('box effects: hammer, double, back, freeze; box removed and replaced in the interior', () => {
  let { g, res } = boxGame(0.1);
  assert.deepStrictEqual(res, { ok: true, box: 'hammer' }); assert.strictEqual(g.teams[0].inv.hammer, 1);
  ({ g, res } = boxGame(0.4));
  assert.strictEqual(res.box, 'double'); assert.strictEqual(g.teams[0].inv.double, 1);
  ({ g, res } = boxGame(0.7));
  assert.deepStrictEqual(res, { ok: true, box: 'back', pushed: 2 }); assert.deepStrictEqual(g.teams[0].pos, [5, 4]);
  ({ g, res } = boxGame(0.95));
  assert.strictEqual(res.box, 'freeze'); assert.strictEqual(g.teams[0].frozen, true);
  assert.strictEqual(g.boxes.length, 1); assert.ok(!g.boxes.includes('3,4'));
  const [r, c] = g.boxes[0].split(',').map(Number);
  assert.ok(r >= 1 && r <= 7 && c >= 1 && c <= 7);
});

test('pushBack stops at a wall, a pawn and the edge', () => {
  let g = fresh(); g.boxes = ['3,4']; g.boxWant = 1; at(g, 0, 4, 4); g.hw['4,4'] = -1;
  assert.strictEqual(R.step(g, 0, 3, 4, () => 0.7, T).pushed, 1); // wall between 4 and 5
  assert.deepStrictEqual(g.teams[0].pos, [4, 4]);
  g = fresh(); g.boxes = ['3,4']; g.boxWant = 1; at(g, 0, 3, 3); at(g, 1, 4, 4);
  const res = R.step(g, 0, 3, 4, () => 0.7, T);
  assert.strictEqual(res.pushed, 0); assert.deepStrictEqual(g.teams[0].pos, [3, 4]);
  // team 1 pushes toward row 0 and hits the edge after one square
  g = fresh(); g.boxes = ['2,4']; g.boxWant = 1; at(g, 1, 3, 4);
  assert.strictEqual(R.step(g, 1, 2, 4, () => 0.7, T).pushed, 2);
  g = fresh(); g.boxes = ['1,4']; g.boxWant = 1; at(g, 1, 2, 4); g.teams[1].side = 1;
  assert.strictEqual(R.step(g, 1, 1, 4, () => 0.7, T).pushed, 1); // (0,4) then the edge
});

test('entering never opens a box', () => {
  const g = fresh(2, 9, { walls: 'auto', boxes: true }); g.boxes = ['1,4']; // entry row is 8, boxes interior: cannot coincide
  assert.ok(R.enter(g, 0, 8, 4).ok); assert.strictEqual(g.boxes.length, 1);
});

test('box roll respects weights over many seeded rolls', () => {
  const rng = seeded(42), n = 4000, cnt = { hammer: 0, double: 0, back: 0, freeze: 0 };
  for (let k = 0; k < n; k++) cnt[R.rollBox(T, rng)]++;
  const total = 100;
  for (const [t, w] of Object.entries(T.boxWeights)) assert.ok(Math.abs(cnt[t] / n - w / total) < 0.04, t + ' ' + cnt[t]);
});

test('relocateWall: only with no stock, only own walls, not the same spot, legality without the old wall', () => {
  const g = fresh(2, 9, { walls: 1, boxes: false });
  assert.ok(R.placeWall(g, 0, 'h', 3, 3).ok); R.placeWall(g, 1, 'v', 5, 5);
  const from = { o: 'h', r: 3, c: 3 };
  assert.strictEqual(R.relocateWall(g, 1, from, { o: 'h', r: 1, c: 1 }).err, 'not-own');
  g.teams[0].walls = 1;
  assert.strictEqual(R.relocateWall(g, 0, from, { o: 'h', r: 1, c: 1 }).err, 'illegal'); // still has stock -> place instead
  g.teams[0].walls = 0;
  assert.strictEqual(R.relocateWall(g, 0, from, { o: 'h', r: 3, c: 3 }).err, 'same-spot');
  assert.strictEqual(R.relocateWall(g, 0, from, { o: 'v', r: 5, c: 5 }).err, 'overlap');
  assert.strictEqual(R.relocateWall(g, 0, from, { o: 'h', r: 8, c: 1 }).err, 'bounds');
  assert.strictEqual(R.relocateWall(g, 0, { o: 'h', r: 6, c: 6 }, { o: 'h', r: 1, c: 1 }).err, 'illegal');
  assert.ok('3,3' in g.hw);
  // moving next to its own old spot is fine (half overlap with itself ignored)
  assert.ok(R.relocateWall(g, 0, from, { o: 'h', r: 3, c: 4 }).ok);
  assert.ok(!('3,3' in g.hw) && g.hw['3,4'] === 0); assert.strictEqual(g.teams[0].walls, 0);
  assert.ok(R.relocateWall(g, 0, { o: 'h', r: 3, c: 4 }, { o: 'v', r: 1, c: 1 }).ok);
  assert.strictEqual(g.vw['1,1'], 0);
  g.teams[0].frozen = true; const before = snap(g);
  assert.strictEqual(R.relocateWall(g, 0, { o: 'v', r: 1, c: 1 }, { o: 'v', r: 2, c: 4 }).err, 'frozen');
  assert.deepStrictEqual(g, before);
});

test('hammer: needs a power, any wall, removes it, failures leave g unchanged', () => {
  const g = fresh(); g.hw['3,3'] = 1;
  let before = snap(g);
  assert.strictEqual(R.useHammer(g, 0, 'h', 3, 3).err, 'no-power');
  g.teams[0].inv.hammer = 1; before = snap(g);
  assert.strictEqual(R.useHammer(g, 0, 'h', 5, 5).err, 'illegal');
  assert.deepStrictEqual(g, before);
  g.teams[0].frozen = true; assert.strictEqual(R.useHammer(g, 0, 'h', 3, 3).err, 'frozen'); g.teams[0].frozen = false;
  assert.ok(R.useHammer(g, 0, 'h', 3, 3).ok);
  assert.ok(!('3,3' in g.hw)); assert.strictEqual(g.teams[0].inv.hammer, 0); assert.strictEqual(g.teams[1].walls, 10); // no refund
});

test('double: needs power and a pawn on the board; decrements', () => {
  const g = fresh(); g.teams[0].inv.double = 1; const before = snap(g);
  assert.strictEqual(R.useDouble(g, 0).err, 'illegal'); // off the board
  assert.deepStrictEqual(g, before);
  assert.strictEqual(R.useDouble(g, 1).err, 'no-power');
  at(g, 0, 4, 4); assert.deepStrictEqual(R.useDouble(g, 0), { ok: true });
  assert.strictEqual(g.teams[0].inv.double, 0);
});

test('removeWall returns stock to the owner; unowned walls and missing walls', () => {
  const g = fresh(); R.placeWall(g, 0, 'h', 2, 2); g.vw['5,5'] = -1;
  assert.deepStrictEqual(R.removeWall(g, 'h', 2, 2), { ok: true, owner: 0 });
  assert.strictEqual(g.teams[0].walls, 10);
  assert.deepStrictEqual(R.removeWall(g, 'v', 5, 5), { ok: true, owner: -1 });
  const before = snap(g);
  assert.strictEqual(R.removeWall(g, 'v', 5, 5).ok, false);
  assert.deepStrictEqual(g, before);
});

test('afterAction thaws everyone but the actor', () => {
  const g = fresh(3); g.teams.forEach(t => { t.frozen = true; });
  R.afterAction(g, 1);
  assert.deepStrictEqual(g.teams.map(t => t.frozen), [false, true, false]);
});

test('nextTeam rotates and skips a frozen team once', () => {
  const g = fresh(3); g.teams[1].frozen = true;
  assert.deepStrictEqual(R.nextTeam(g, 0), { team: 2, skipped: [1] });
  assert.strictEqual(g.teams[1].frozen, false);
  assert.deepStrictEqual(R.nextTeam(g, 0), { team: 1, skipped: [] });
  assert.deepStrictEqual(R.nextTeam(g, 2), { team: 0, skipped: [] });
});

test('forcedAction: null when free or off board; wall, relocate, hammer, skip in order', () => {
  const g = fresh(2, 9, { walls: 1, boxes: false });
  assert.strictEqual(R.forcedAction(g, 0), null); // off the board
  at(g, 0, 0, 0); // team 0 cornered by walls
  g.hw['0,0'] = -1; g.vw['0,0'] = -1;
  assert.strictEqual(R.pawnMoves(g, 0).length, 0);
  assert.strictEqual(R.forcedAction(g, 0), 'wall');
  g.teams[0].walls = 0; g.hw['6,6'] = 0;
  assert.strictEqual(R.forcedAction(g, 0), 'relocate');
  g.hw['6,6'] = -1;
  g.teams[0].inv.hammer = 1; assert.strictEqual(R.forcedAction(g, 0), 'hammer');
  g.teams[0].inv.hammer = 0; assert.strictEqual(R.forcedAction(g, 0), 'skip');
  g.teams[0].inv.hammer = 1; delete g.hw['0,0']; delete g.vw['0,0']; delete g.hw['6,6'];
  assert.strictEqual(R.forcedAction(g, 0), null);
});

test('ranking: sorted by score, ties share a place', () => {
  const g = fresh(4); [1, 3, 3, 0].forEach((s, i) => { g.teams[i].score = s; });
  assert.deepStrictEqual(R.ranking(g), [{ team: 1, score: 3, place: 1 }, { team: 2, score: 3, place: 1 }, { team: 0, score: 1, place: 3 }, { team: 3, score: 0, place: 4 }]);
});

test('reachedTarget: first team at the target, -1 below it, 0 means off', () => {
  const g = fresh(3); g.teams[2].score = 5;
  assert.strictEqual(R.reachedTarget(g, 5), 2);
  assert.strictEqual(R.reachedTarget(g, 6), -1);
  assert.strictEqual(R.reachedTarget(g, 0), -1);
});

test('same seed gives the same game', () => {
  const o = { walls: 'auto', boxes: true };
  assert.deepStrictEqual(R.newGame(10, 3, o, T, seeded(9)), R.newGame(10, 3, o, T, seeded(9)));
});

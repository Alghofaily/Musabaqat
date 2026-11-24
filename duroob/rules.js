// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz where each answer buys one move on a board you can block more tense than plain points?
// Date: 2026-11-24
// The board rules of Duroob (the rules of Hawajiz, no drawing, no clock, no UI text): walls, pawn moves and
// jumps, entering, scoring, hidden boxes, powers, the stuck rule, turn order. Failures return { ok: false, err: code }
// and leave the game untouched; the UI maps the codes to words. rules.test.js checks all of it.
// A game `g` is plain JSON: { size, boxWant, teams: [{ side, pos: [r,c]|null, walls, score, inv: {hammer,double}, frozen }],
//   hw: {'r,c': owner}, vw: {'r,c': owner}, boxes: ['r,c'], marks: [{ r, c, team }] }  (owner -1 = host-placed).
// A horizontal wall (r,c) sits between rows r and r+1 over columns c,c+1; a vertical one between columns c and c+1 over rows r,r+1.
(function (root) {
  const DEFAULT_TUNE = {
    wallsAuto: { 9: [10, 5], 10: [12, 6], 12: [15, 8] }, // [2 teams, 3-4 teams]
    boxesAuto: { 9: 3, 10: 4, 12: 5 },
    boxWeights: { hammer: 25, double: 30, back: 25, freeze: 20 },
    pushBack: 2,
  };
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const k = (r, c) => r + ',' + c;
  const fail = (err, extra) => Object.assign({ ok: false, err }, extra);
  const walls = (g, o) => (o === 'h' ? g.hw : g.vw);
  const inB = (g, r, c) => r >= 0 && c >= 0 && r < g.size && c < g.size;
  // per side: where the pawn enters, where it scores, which way "back" is
  const startLine = (g, s, r, c) => [r === g.size - 1, r === 0, c === g.size - 1, c === 0][s];
  const goalLine = (g, s, r, c) => [r === 0, r === g.size - 1, c === 0, c === g.size - 1][s];
  const BACK = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  const wallsFor = (teamCount, size, opts, tune) => (typeof opts.walls === 'number' ? opts.walls : tune.wallsAuto[size][teamCount === 2 ? 0 : 1]);
  const boxesFor = (size, opts, tune) => (opts.boxes ? tune.boxesAuto[size] : 0);

  function occAt(g, r, c) { return g.teams.findIndex(t => t.pos && t.pos[0] === r && t.pos[1] === c); }

  function blocked(g, r, c, dr, dc) {
    const H = g.hw, V = g.vw;
    if (dr === 1) return (k(r, c) in H) || (k(r, c - 1) in H);
    if (dr === -1) return (k(r - 1, c) in H) || (k(r - 1, c - 1) in H);
    if (dc === 1) return (k(r, c) in V) || (k(r - 1, c) in V);
    if (dc === -1) return (k(r, c - 1) in V) || (k(r - 1, c - 1) in V);
    return false;
  }

  function pawnMoves(g, i) {
    const t = g.teams[i]; if (!t.pos) return [];
    const [r, c] = t.pos, res = [];
    const add = (a, b) => { if (!res.some(m => m[0] === a && m[1] === b)) res.push([a, b]); };
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (!inB(g, nr, nc) || blocked(g, r, c, dr, dc)) continue;
      if (occAt(g, nr, nc) < 0) { add(nr, nc); continue; }
      const jr = nr + dr, jc = nc + dc;
      if (inB(g, jr, jc) && !blocked(g, nr, nc, dr, dc) && occAt(g, jr, jc) < 0) { add(jr, jc); continue; }
      for (const [sr, sc] of dr !== 0 ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]]) {
        const tr = nr + sr, tc = nc + sc;
        if (inB(g, tr, tc) && !blocked(g, nr, nc, sr, sc) && occAt(g, tr, tc) < 0) add(tr, tc);
      }
    }
    return res;
  }

  // BFS from pos to team i's goal edge, pawns ignored; true when pos is null
  function hasPath(g, i, pos) {
    if (pos === undefined) pos = g.teams[i].pos;
    if (!pos) return true;
    const s = g.teams[i].side, seen = new Set([k(pos[0], pos[1])]), q = [pos];
    while (q.length) {
      const [r, c] = q.shift();
      if (goalLine(g, s, r, c)) return true;
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (!inB(g, nr, nc) || blocked(g, r, c, dr, dc) || seen.has(k(nr, nc))) continue;
        seen.add(k(nr, nc)); q.push([nr, nc]);
      }
    }
    return false;
  }

  function wallCheck(g, o, r, c) {
    const n = g.size - 2;
    if (r < 0 || r > n || c < 0 || c > n) return { err: 'bounds', blocks: [] };
    const same = walls(g, o), other = walls(g, o === 'h' ? 'v' : 'h');
    const along = o === 'h' ? [[r, c - 1], [r, c + 1]] : [[r - 1, c], [r + 1, c]];
    if ((k(r, c) in same) || along.some(([a, b]) => k(a, b) in same)) return { err: 'overlap', blocks: [] };
    if (k(r, c) in other) return { err: 'cross', blocks: [] };
    const before = g.teams.map((_, i) => hasPath(g, i));
    same[k(r, c)] = -1;
    const after = g.teams.map((_, i) => hasPath(g, i));
    delete same[k(r, c)];
    return { err: null, blocks: g.teams.map((_, i) => i).filter(i => before[i] && !after[i]) };
  }

  function entryCells(g, i) {
    const s = g.teams[i].side, all = [], ok = [];
    for (let r = 0; r < g.size; r++) for (let c = 0; c < g.size; c++) {
      if (!startLine(g, s, r, c) || occAt(g, r, c) >= 0) continue;
      all.push([r, c]); if (hasPath(g, i, [r, c])) ok.push([r, c]);
    }
    return ok.length ? ok : all;
  }

  function enter(g, i, r, c) {
    if (g.teams[i].frozen) return fail('frozen');
    if (g.teams[i].pos || !entryCells(g, i).some(m => m[0] === r && m[1] === c)) return fail('not-entry');
    g.teams[i].pos = [r, c];
    return { ok: true };
  }

  // keep g.boxes at g.boxWant by dropping boxes on free interior squares
  function spawnBoxes(g, rng) {
    for (let guard = 0; g.boxes.length < g.boxWant && guard < 500; guard++) {
      const r = 1 + Math.floor(rng() * (g.size - 2)), c = 1 + Math.floor(rng() * (g.size - 2));
      if (!g.boxes.includes(k(r, c)) && occAt(g, r, c) < 0) g.boxes.push(k(r, c));
    }
  }

  function rollBox(tune, rng) {
    const e = Object.entries(tune.boxWeights);
    let x = rng() * e.reduce((s, [, w]) => s + w, 0);
    for (const [t, w] of e) if ((x -= w) < 0) return t;
    return e[0][0];
  }

  function newGame(size, teamCount, opts, tune, rng) {
    const per = wallsFor(teamCount, size, opts, tune);
    const g = { size, boxWant: boxesFor(size, opts, tune), teams: [], hw: {}, vw: {}, boxes: [], marks: [] };
    for (let i = 0; i < teamCount; i++) g.teams.push({ side: i, pos: null, walls: per, score: 0, inv: { hammer: 0, double: 0 }, frozen: false });
    spawnBoxes(g, rng);
    return g;
  }

  function pushBack(g, i, tune) {
    const t = g.teams[i], [dr, dc] = BACK[t.side]; let n = 0;
    for (let s = 0; s < tune.pushBack; s++) {
      const [r, c] = t.pos, nr = r + dr, nc = c + dc;
      if (!inB(g, nr, nc) || blocked(g, r, c, dr, dc) || occAt(g, nr, nc) >= 0) break;
      t.pos = [nr, nc]; n++;
    }
    return n;
  }

  function step(g, i, r, c, rng, tune) {
    const t = g.teams[i];
    if (t.frozen) return fail('frozen');
    if (!pawnMoves(g, i).some(m => m[0] === r && m[1] === c)) return fail('illegal');
    t.pos = [r, c];
    if (goalLine(g, t.side, r, c)) {
      t.score++; g.marks.push({ r, c, team: i }); t.pos = null; t.frozen = false;
      return { ok: true, scored: true };
    }
    const at = g.boxes.indexOf(k(r, c));
    if (at < 0) return { ok: true };
    g.boxes.splice(at, 1);
    const box = rollBox(tune, rng), res = { ok: true, box };
    if (box === 'hammer' || box === 'double') t.inv[box]++;
    else if (box === 'back') res.pushed = pushBack(g, i, tune);
    else t.frozen = true;
    spawnBoxes(g, rng);
    return res;
  }

  function placeWall(g, i, o, r, c) {
    const t = g.teams[i];
    if (t.frozen) return fail('frozen', { blocks: [] });
    if (t.walls <= 0) return fail('no-walls', { blocks: [] });
    const chk = wallCheck(g, o, r, c);
    if (chk.err) return fail(chk.err, { blocks: [] });
    walls(g, o)[k(r, c)] = i; t.walls--;
    return { ok: true, blocks: chk.blocks };
  }

  function relocateWall(g, i, from, to) {
    const t = g.teams[i], src = walls(g, from.o), key = k(from.r, from.c);
    if (t.frozen) return fail('frozen', { blocks: [] });
    if (t.walls !== 0 || !(key in src)) return fail('illegal', { blocks: [] });
    if (src[key] !== i) return fail('not-own', { blocks: [] });
    if (from.o === to.o && from.r === to.r && from.c === to.c) return fail('same-spot', { blocks: [] });
    delete src[key];
    const chk = wallCheck(g, to.o, to.r, to.c);
    if (chk.err) { src[key] = i; return fail(chk.err, { blocks: [] }); }
    walls(g, to.o)[k(to.r, to.c)] = i;
    return { ok: true, blocks: chk.blocks };
  }

  function useHammer(g, i, o, r, c) {
    const t = g.teams[i];
    if (t.frozen) return fail('frozen');
    if (t.inv.hammer <= 0) return fail('no-power');
    if (!(k(r, c) in walls(g, o))) return fail('illegal');
    delete walls(g, o)[k(r, c)]; t.inv.hammer--;
    return { ok: true };
  }

  // Spends one double. The UI then calls step; it may call step a second time, but must skip that
  // second step if the first scored or opened a box (the original ends the turn there), or if no move is left.
  function useDouble(g, i) {
    const t = g.teams[i];
    if (t.frozen) return fail('frozen');
    if (t.inv.double <= 0) return fail('no-power');
    if (!t.pos) return fail('illegal');
    t.inv.double--;
    return { ok: true };
  }

  function removeWall(g, o, r, c) {
    const m = walls(g, o), key = k(r, c);
    if (!(key in m)) return fail('illegal');
    const owner = m[key]; delete m[key];
    if (owner >= 0) g.teams[owner].walls++;
    return { ok: true, owner };
  }

  function afterAction(g, actor) { g.teams.forEach((t, j) => { if (j !== actor) t.frozen = false; }); }

  function forcedAction(g, i) {
    const t = g.teams[i];
    if (!t.pos || pawnMoves(g, i).length) return null;
    if (t.walls > 0) return 'wall';
    if ([g.hw, g.vw].some(m => Object.values(m).includes(i))) return 'relocate';
    if (t.inv.hammer > 0 && Object.keys(g.hw).length + Object.keys(g.vw).length > 0) return 'hammer';
    return 'skip';
  }

  function nextTeam(g, from) {
    const n = g.teams.length, skipped = []; let team = from;
    for (let s = 1; s <= n; s++) {
      team = (from + s) % n;
      if (!g.teams[team].frozen) break;
      g.teams[team].frozen = false; skipped.push(team);
    }
    return { team, skipped };
  }

  function ranking(g) {
    const rows = g.teams.map((t, team) => ({ team, score: t.score })).sort((a, b) => b.score - a.score);
    return rows.map(r => ({ ...r, place: 1 + rows.filter(o => o.score > r.score).length }));
  }

  function reachedTarget(g, target) { return target > 0 ? g.teams.findIndex(t => t.score >= target) : -1; }

  root.DuroobRules = { DEFAULT_TUNE, newGame, wallsFor, boxesFor, blocked, occAt, pawnMoves, hasPath, wallCheck, entryCells, enter, step, rollBox, placeWall, relocateWall, useHammer, useDouble, removeWall, afterAction, forcedAction, nextTeam, ranking, reachedTarget };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.DuroobRules;
})(typeof window !== 'undefined' ? window : globalThis);

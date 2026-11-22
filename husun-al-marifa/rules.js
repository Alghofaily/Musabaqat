// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz that decides who takes land more tense than plain points?
// Date: 2026-11-19
// The war's rules, with no drawing and no clock: the map, the start, who may attack what, how a
// battle ends and what a fallen capital does. index.html calls these; rules.test.js checks them.
// A game `g` is { hexes: [{ id, col, row, nb: [ids] }], owner: [team | -1], bat: [count],
// cannons: [count], fort: [bool], capital: [hexId per team], alive: [bool per team] }.
// The battle, prices, payout and score follow M3arik's Risk.exe, read with Ghidra (addresses cited).
(function (root) {
  // odd-r offset neighbours (pointy-top hexes, odd rows pushed half a hex)
  const NB = [[[1, 0], [-1, 0], [0, -1], [-1, -1], [0, 1], [-1, 1]], [[1, 0], [-1, 0], [1, -1], [0, -1], [1, 1], [0, 1]]];
  const cube = (c, r) => { const x = c - (r - (r & 1)) / 2; return [x, r, -x - r]; };
  function dist(a, b) { const p = cube(a.col, a.row), q = cube(b.col, b.row); return Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2])); }

  function connected(cells, key) {
    if (!cells.length) return false;
    const seen = new Set([key(cells[0])]), todo = [cells[0]], has = new Set(cells.map(key));
    while (todo.length) {
      const { col, row } = todo.pop();
      for (const [dc, dr] of NB[row & 1]) { const k = key({ col: col + dc, row: row + dr }); if (has.has(k) && !seen.has(k)) { seen.add(k); todo.push({ col: col + dc, row: row + dr }); } }
    }
    return seen.size === cells.length;
  }

  // A cols x rows grid with `lakes` hexes cut out, re-cut until the land is one piece.
  function makeMap(cols, rows, lakes, rng) {
    const key = h => h.col + ',' + h.row;
    let cells;
    for (let tries = 0; tries < 200; tries++) {
      cells = [];
      for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) cells.push({ col, row });
      for (let i = 0; i < lakes && cells.length > 1; i++) cells.splice(Math.floor(rng() * cells.length), 1);
      if (connected(cells, key)) break;
      cells = null;
    }
    if (!cells) { cells = []; for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) cells.push({ col, row }); }
    const id = new Map(cells.map((c, i) => [key(c), i]));
    return cells.map((c, i) => ({ id: i, col: c.col, row: c.row,
      nb: NB[c.row & 1].map(([dc, dr]) => id.get(key({ col: c.col + dc, row: c.row + dr }))).filter(x => x !== undefined) }));
  }

  // Capitals as far apart as the map allows (each the hex farthest from those already placed,
  // ties broken by rng), then each team takes the nearest free hexes around its capital.
  function placeTeams(hexes, n, startHexes, capB, otherB, rng) {
    const owner = hexes.map(() => -1), bat = hexes.map(() => 0), capital = [];
    const edge = hexes.filter(h => h.nb.length < 6);
    capital.push((edge.length ? edge : hexes)[Math.floor(rng() * (edge.length || hexes.length))].id);
    while (capital.length < n) {
      let best = -1, bestD = -1, ties = 0;
      for (const h of hexes) {
        if (capital.includes(h.id)) continue;
        const d = Math.min(...capital.map(c => dist(h, hexes[c])));
        if (d > bestD) { best = h.id; bestD = d; ties = 1; } else if (d === bestD && rng() < 1 / ++ties) best = h.id;
      }
      capital.push(best);
    }
    capital.forEach((c, t) => { owner[c] = t; bat[c] = capB; });
    for (let k = 1; k < startHexes; k++) { // in turns, so no team takes the land another needs
      capital.forEach((c, t) => {
        const free = hexes.filter(h => owner[h.id] === -1).sort((a, b) => dist(a, hexes[c]) - dist(b, hexes[c]));
        if (free.length && dist(free[0], hexes[c]) <= 2) { owner[free[0].id] = t; bat[free[0].id] = otherB; }
      });
    }
    return { hexes, owner, bat, cannons: hexes.map(() => 0), fort: hexes.map(() => false), capital, alive: capital.map(() => true) };
  }

  const isCapital = (g, h) => g.owner[h] >= 0 && g.capital[g.owner[h]] === h; // a taken capital is just land for its new owner

  // One battle hit, from M3arik (Risk.exe 0x441c20): 3 per cannon + 3, halved by a fort on the hex that takes it.
  // `P` is the tuning: { hitBase, hitPerCannon, attackMin, defenderWrongLoss }.
  const hit = (cannons, fort, P) => { const d = P.hitBase + P.hitPerCannon * cannons; return fort ? Math.trunc(d / 2) : d; };

  // Why `team` may not attack `to` from `from`, or '' when it may. Neutral land needs only a border.
  // An enemy needs attackMin battalions in the attacking hex, and more than one hit from the
  // defender's cannons (Risk.exe 0x43ebbc).
  function attackBlock(g, team, from, to, P) {
    if (g.owner[from] !== team) return 'not-yours';
    if (g.owner[to] === team) return 'own';
    if (!g.hexes[from].nb.includes(to)) return 'not-adjacent';
    if (g.owner[to] === -1) return '';
    if (g.bat[from] < P.attackMin) return 'too-few';
    if (g.bat[from] <= hit(g.cannons[to], g.fort[from], P)) return 'too-strong';
    return '';
  }

  // A battle: every battalion in the attacking hex fights. The teams answer in turn, attacker first.
  const newBattle = (g, from, to) => ({ a: g.bat[from], d: g.bat[to], turn: 'a', over: null });
  // One answer. Attacker right: the defender loses a hit from the attacker's cannons. Attacker
  // wrong or defender right: the attacker loses a hit from the defender's cannons. Defender wrong:
  // the defender loses defenderWrongLoss. The defender at 0 loses the hex; the attacker stops when
  // it could not take another such hit or has fewer than attackMin left. Returns { loser, loss }.
  function battleAnswer(g, b, from, to, right, P) {
    const toA = hit(g.cannons[to], g.fort[from], P);
    const [loser, loss] = b.turn === 'a' ? (right ? ['d', hit(g.cannons[from], g.fort[to], P)] : ['a', toA])
      : (right ? ['a', toA] : ['d', P.defenderWrongLoss]);
    b[loser] = Math.max(0, b[loser] - loss);
    if (b.d < 1) b.over = 'win';
    else if (loser === 'a' && (b.a <= loss || b.a < P.attackMin)) b.over = 'fail';
    else b.turn = b.turn === 'a' ? 'd' : 'a';
    return { loser, loss };
  }

  // A team out: its land goes back to neutral, its battalions, cannons and forts are gone.
  function eliminate(g, team) {
    g.alive[team] = false;
    g.owner.forEach((o, h) => { if (o === team) { g.owner[h] = -1; g.bat[h] = 0; g.cannons[h] = 0; g.fort[h] = false; } });
  }

  // Lands a battle (outcome 'win', 'fail' or 'withdraw'). The survivors stay in the attacking hex;
  // a taken hex starts empty, its cannons and fort lost, and taking a capital knocks its team out.
  // Neutral land is taken with outcome 'win' and b = null. Returns { taken, fell }.
  function applyBattle(g, from, to, outcome, b) {
    const team = g.owner[from];
    if (b) g.bat[from] = b.a;
    if (outcome !== 'win') { if (b) g.bat[to] = b.d; return { taken: false, fell: -1 }; }
    const defender = g.owner[to], fell = defender >= 0 && g.capital[defender] === to ? defender : -1;
    if (fell >= 0) eliminate(g, fell);
    g.owner[to] = team; g.bat[to] = 0; g.cannons[to] = 0; g.fort[to] = false;
    return { taken: true, fell };
  }

  // Own hexes reachable from `from` through the team's own land.
  function reachable(g, from) {
    const team = g.owner[from], seen = new Set([from]), todo = [from];
    while (todo.length) for (const n of g.hexes[todo.pop()].nb) if (g.owner[n] === team && !seen.has(n)) { seen.add(n); todo.push(n); }
    seen.delete(from);
    return seen;
  }

  // Market prices, from M3arik (Risk.exe 0x43cb48): chained rolls, so the three goods drift together,
  // and buying always costs a fixed step more than selling. P: { priceRoll, troopBase, cannonBase,
  // fortBase, troopSpread, cannonSpread, fortSpread }. The original: roll 20, bases 9 / 65 / 60, spreads 1 / 5 / 10.
  function rollPrices(rng, P) {
    const R = () => Math.floor(rng() * P.priceRoll) - Math.floor(P.priceRoll / 4);
    const t = R(), c1 = R() + t, f = R() + c1, c = R() + c1;
    return { troop: { sell: t + P.troopBase, buy: t + P.troopBase + P.troopSpread },
      cannon: { sell: c + P.cannonBase, buy: c + P.cannonBase + P.cannonSpread },
      fort: { sell: f + P.fortBase, buy: f + P.fortBase + P.fortSpread } };
  }

  const hexCount = (g, t) => g.owner.filter(o => o === t).length;
  const battalions = (g, t) => g.owner.reduce((a, o, h) => a + (o === t ? g.bat[h] : 0), 0);
  const cannonCount = (g, t) => g.owner.reduce((a, o, h) => a + (o === t ? g.cannons[h] : 0), 0);
  // The periodic payout (Risk.exe 0x43d7e0): each capital gets perHex battalions for every hex its team holds.
  function payout(g, perHex) { for (const t of aliveTeams(g)) g.bat[g.capital[t]] += perHex * hexCount(g, t); }
  // Score when time runs out (Risk.exe 0x43efb5): hexes x battalion price x hexWorth, plus money, plus
  // what the team's battalions, cannons and forts would sell for.
  function score(g, t, money, prices, hexWorth) {
    if (!g.alive[t]) return 0;
    let s = hexCount(g, t) * prices.troop.sell * hexWorth + money;
    g.owner.forEach((o, h) => { if (o === t) s += g.bat[h] * prices.troop.sell + g.cannons[h] * prices.cannon.sell + (g.fort[h] ? prices.fort.sell : 0); });
    return s;
  }
  const aliveTeams = g => g.alive.map((a, t) => a ? t : -1).filter(t => t >= 0);

  // The question order: every bank index once, shuffled by its own mulberry32 stream from `seed`,
  // never the game's rng(). Battles and prices then cannot move it, so a host's answer key made at
  // Start stays right for the whole game.
  function questionDeck(n, seed) {
    let s = seed | 0;
    const r = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), s | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const d = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
    return d;
  }

  // The bank indices at positions from..from+count-1 of a game's question order: pass c through the bank
  // is questionDeck(n, seed + c), exactly as index.html's drawQuestion asks them. A host's key lists these.
  function questionOrder(n, seed, from, count) {
    const out = []; let pass = -1, d = null;
    for (let k = from; k < from + count; k++) { const c = Math.floor(k / n); if (c !== pass) { pass = c; d = questionDeck(n, seed + c); } out.push(d[k % n]); }
    return out;
  }

  // 4 characters from the bank and the seed (FNV-1a): the same on the stage and on the host's key,
  // or the key belongs to another game or another bank.
  function matchCode(bank, seed) {
    let h = 0x811c9dc5;
    const s = JSON.stringify(bank) + '|' + seed;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    const A = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // no 0/O, 1/I/L
    let out = ''; h >>>= 0;
    for (let i = 0; i < 4; i++) { out += A[h % A.length]; h = Math.floor(h / A.length); }
    return out;
  }

  root.HusunRules = { makeMap, placeTeams, hit, attackBlock, newBattle, battleAnswer, applyBattle, eliminate, reachable, rollPrices, payout, isCapital, dist, hexCount, battalions, cannonCount, score, aliveTeams, questionDeck, questionOrder, matchCode };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.HusunRules;
})(typeof window !== 'undefined' ? window : globalThis);

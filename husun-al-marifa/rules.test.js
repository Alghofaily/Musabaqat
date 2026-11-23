// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz that decides who takes land more tense than plain points?
// Date: 2026-11-19
// Checks the war's rules. Run: node --test prototypes/husun-al-marifa/rules.test.js
const test = require('node:test');
const assert = require('node:assert');
const R = require('./rules.js');

function seeded(s) { // the game's mulberry32, so a seed gives the same map every run
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const MAP = { cols: 8, rows: 6, lakes: 6 };
const newGame = (n, seed = 7) => { const rng = seeded(seed); return R.placeTeams(R.makeMap(MAP.cols, MAP.rows, MAP.lakes, rng), n, 3, 50, 1, rng); };

test('the map has the right size, neighbours are mutual, and the land is one piece', () => {
  for (let s = 1; s <= 30; s++) {
    const hexes = R.makeMap(MAP.cols, MAP.rows, MAP.lakes, seeded(s));
    assert.strictEqual(hexes.length, MAP.cols * MAP.rows - MAP.lakes);
    for (const h of hexes) for (const n of h.nb) assert.ok(hexes[n].nb.includes(h.id), `seed ${s}: ${h.id}-${n}`);
    const seen = new Set([0]), todo = [0];
    while (todo.length) for (const n of hexes[todo.pop()].nb) if (!seen.has(n)) { seen.add(n); todo.push(n); }
    assert.strictEqual(seen.size, hexes.length, `seed ${s}: land in pieces`);
  }
});

test('every team starts with the same land and battalions, capitals apart', () => {
  for (let n = 2; n <= 6; n++) for (let s = 1; s <= 20; s++) {
    const g = newGame(n, s);
    const hexes = [...Array(n).keys()].map(t => R.hexCount(g, t)), bats = [...Array(n).keys()].map(t => R.battalions(g, t));
    assert.strictEqual(new Set(hexes).size, 1, `${n} teams seed ${s}: hexes ${hexes}`);
    assert.strictEqual(new Set(bats).size, 1, `${n} teams seed ${s}: battalions ${bats}`);
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) assert.ok(R.dist(g.hexes[g.capital[a]], g.hexes[g.capital[b]]) >= 2, `capitals touch: ${n} teams seed ${s}`);
  }
});

// A hand-made line of four hexes: 0 - 1 - 2 - 3, team 0 at 0 and 1, team 1's capital at 3.
function line() {
  const hexes = [0, 1, 2, 3].map(id => ({ id, col: id, row: 0, nb: [id - 1, id + 1].filter(x => x >= 0 && x <= 3) }));
  return { hexes, owner: [0, 0, -1, 1], bat: [3, 4, 0, 2], cannons: [0, 0, 0, 0], fort: [false, false, false, false], capital: [0, 3], alive: [true, true] };
}
const P = { hitBase: 3, hitPerCannon: 3, attackMin: 4, defenderWrongLoss: 3 }; // M3arik's numbers

test('a hit is 3 per cannon + 3, halved by a fort', () => {
  assert.strictEqual(R.hit(0, false, P), 3);
  assert.strictEqual(R.hit(2, false, P), 9);
  assert.strictEqual(R.hit(2, true, P), 4);                         // 9 / 2, rounded down as the original
});

test('attacks: neighbours only; an enemy needs 4 battalions and more than one hit', () => {
  const g = line();
  assert.strictEqual(R.attackBlock(g, 0, 1, 2, P), '');             // neutral land: a border is enough
  assert.strictEqual(R.attackBlock(g, 0, 0, 2, P), 'not-adjacent');
  assert.strictEqual(R.attackBlock(g, 0, 1, 0, P), 'own');
  assert.strictEqual(R.attackBlock(g, 1, 1, 2, P), 'not-yours');
  g.owner[2] = 0; g.bat[2] = 3;
  assert.strictEqual(R.attackBlock(g, 0, 2, 3, P), 'too-few');      // 3 < 4
  g.bat[2] = 4; g.cannons[3] = 1;                                   // the defender hits for 6
  assert.strictEqual(R.attackBlock(g, 0, 2, 3, P), 'too-strong');
  g.fort[2] = true;                                                 // a fort halves it to 3
  assert.strictEqual(R.attackBlock(g, 0, 2, 3, P), '');
});

test('the battle: answers take turns and the hits land on the right side', () => {
  const g = line(); g.owner[2] = 0; g.bat[2] = 20; g.cannons[2] = 1; g.bat[3] = 10; g.cannons[3] = 2;
  const b = R.newBattle(g, 2, 3);
  assert.deepStrictEqual(R.battleAnswer(g, b, 2, 3, true, P), { loser: 'd', loss: 6 });  // attacker right: 1 cannon
  assert.strictEqual(b.turn, 'd');
  assert.deepStrictEqual(R.battleAnswer(g, b, 2, 3, true, P), { loser: 'a', loss: 9 });  // defender right: 2 cannons
  assert.deepStrictEqual(R.battleAnswer(g, b, 2, 3, false, P), { loser: 'a', loss: 9 }); // attacker wrong
  assert.deepStrictEqual([b.a, b.d, b.over], [2, 4, 'fail']);      // 2 left: could not take another hit
});

test('the battle ends when the defender reaches 0; a defender miss costs 3', () => {
  const g = line(); g.owner[2] = 0; g.bat[2] = 30; g.bat[3] = 4;
  const b = R.newBattle(g, 2, 3);
  R.battleAnswer(g, b, 2, 3, false, P);                             // attacker wrong: -3 attacker
  R.battleAnswer(g, b, 2, 3, false, P);                             // defender wrong: -3 defender
  assert.deepStrictEqual([b.a, b.d, b.over, b.turn], [27, 1, null, 'a']);
  R.battleAnswer(g, b, 2, 3, true, P);
  assert.deepStrictEqual([b.d, b.over], [0, 'win']);
});

test('a win leaves the taken hex empty and the survivors at home; a loss keeps both sides\' survivors', () => {
  const g = line(); g.owner[2] = 1; g.bat[2] = 5; g.cannons[2] = 2; g.fort[2] = true;
  assert.deepStrictEqual(R.applyBattle(g, 1, 2, 'win', { a: 3, d: 0 }), { taken: true, fell: -1 });
  assert.deepStrictEqual([g.owner[2], g.bat[1], g.bat[2], g.cannons[2], g.fort[2]], [0, 3, 0, 0, false]);
  const f = line(); f.owner[2] = 1; f.bat[2] = 5;
  R.applyBattle(f, 1, 2, 'withdraw', { a: 2, d: 4 });
  assert.deepStrictEqual([f.owner[2], f.bat[1], f.bat[2]], [1, 2, 4]);
  const n = line(); R.applyBattle(n, 1, 2, 'win', null);            // neutral land: taken empty, nobody loses
  assert.deepStrictEqual([n.owner[2], n.bat[1], n.bat[2]], [0, 4, 0]);
});

test('taking a capital knocks the team out and its land goes neutral', () => {
  const g = line(); g.owner[2] = 1; g.bat[2] = 1; g.cannons[2] = 1;
  g.bat[0] = 9; g.hexes[0].nb.push(3); g.hexes[3].nb.push(0);
  assert.strictEqual(R.attackBlock(g, 0, 0, 3, P), '');
  assert.deepStrictEqual(R.applyBattle(g, 0, 3, 'win', { a: 8, d: 0 }), { taken: true, fell: 1 });
  assert.deepStrictEqual([g.alive[1], g.owner[2], g.bat[2], g.cannons[2], g.owner[3], g.bat[3], g.bat[0]], [false, -1, 0, 0, 0, 0, 8]);
  assert.strictEqual(R.isCapital(g, 3), false);
  assert.deepStrictEqual(R.aliveTeams(g), [0]);
});

test('prices follow the original\'s ranges and buy is always the fixed step above sell', () => {
  const PP = { priceRoll: 20, troopBase: 9, cannonBase: 65, fortBase: 60, troopSpread: 1, cannonSpread: 5, fortSpread: 10 };
  const rng = seeded(3);
  for (let i = 0; i < 500; i++) {
    const p = R.rollPrices(rng, PP);
    assert.ok(p.troop.sell >= 4 && p.troop.sell <= 23, 'troop ' + p.troop.sell);
    assert.ok(p.cannon.sell >= 50 && p.cannon.sell <= 107, 'cannon ' + p.cannon.sell);
    assert.ok(p.fort.sell >= 45 && p.fort.sell <= 102, 'fort ' + p.fort.sell);
    assert.deepStrictEqual([p.troop.buy - p.troop.sell, p.cannon.buy - p.cannon.sell, p.fort.buy - p.fort.sell], [1, 5, 10]);
  }
  const fixed = R.rollPrices(() => 0.5, PP);                        // every roll 10, so each step adds 5: 1.sav-like values
  assert.deepStrictEqual(fixed, { troop: { sell: 14, buy: 15 }, cannon: { sell: 80, buy: 85 }, fort: { sell: 75, buy: 85 } });
});

test('the payout fills each capital by land held; the score counts land, money and goods', () => {
  const g = line();                                                 // team 0: 2 hexes, team 1: 1
  R.payout(g, 20);
  assert.deepStrictEqual([g.bat[0], g.bat[3]], [43, 22]);
  g.cannons[1] = 2; g.fort[1] = true;
  const prices = { troop: { sell: 10 }, cannon: { sell: 70 }, fort: { sell: 60 } };
  // 2 hexes x 10 x 50 + 100 money + (43 + 4) x 10 + 2 x 70 + 60
  assert.strictEqual(R.score(g, 0, 100, prices, 50), 1000 + 100 + 470 + 140 + 60);
  R.eliminate(g, 1);
  assert.strictEqual(R.score(g, 1, 500, prices, 50), 0);
});

test('moves reach only through the team’s own land', () => {
  const g = line(); g.owner[2] = 1;
  assert.deepStrictEqual([...R.reachable(g, 0)], [1]);
  g.owner[2] = 0; g.owner[3] = 0;
  assert.deepStrictEqual([...R.reachable(g, 0)].sort(), [1, 2, 3]);
});

test('the question order is fixed by the seed, holds every question once, and no other dice move it', () => {
  const a = R.questionDeck(200, 42);
  assert.deepStrictEqual([...a].sort((x, y) => x - y), [...Array(200).keys()]);
  const r = seeded(42); for (let i = 0; i < 1000; i++) r(); // battles and prices roll the game's own dice
  assert.deepStrictEqual(R.questionDeck(200, 42), a);         // the order has its own stream
  assert.notDeepStrictEqual(R.questionDeck(200, 43), a);
});

test('the match code changes with the bank or the seed', () => {
  const bank = [['قرآن', 'ما آخر سورة نزلت؟', 'النصر', 'الفاتحة', 'الناس', 'العصر'], ['علوم', 'كم رجل للعنكبوت؟', '8', '6', '10', '4']];
  const code = R.matchCode(bank, 7);
  assert.match(code, /^[2-9A-HJKMNP-Z]{4}$/);
  assert.strictEqual(R.matchCode(bank, 7), code);
  assert.notStrictEqual(R.matchCode(bank, 8), code);
  assert.notStrictEqual(R.matchCode(bank.slice(1), 7), code);
});

test('the key\'s order is the game\'s order, across passes through the bank', () => {
  const n = 7, seed = 11;
  const game = [...R.questionDeck(n, seed), ...R.questionDeck(n, seed + 1), ...R.questionDeck(n, seed + 2)]; // drawQuestion's passes
  assert.deepStrictEqual(R.questionOrder(n, seed, 0, 3 * n), game);
  assert.deepStrictEqual(R.questionOrder(n, seed, 5, 6), game.slice(5, 11)); // a later key starts mid-pass
});

// ---- the short typed key code (keyCode / readKeyCode) ----
test('keyCode: round trip for edge seeds, and typing ignores case, spaces and the dash', () => {
  const bank = [['a', 'q1', 'x', 'y', 'z', 'w']];
  for (const s of [0, 1, -1, 2 ** 31 - 1, -(2 ** 31), Date.now() | 0]) {
    const code = R.keyCode('H', bank, s);
    assert.strictEqual(code.length, 11);
    assert.strictEqual(R.readKeyCode(code).seed, s | 0);
    assert.strictEqual(R.readKeyCode(code).game, 'H');
    const typed = (code.slice(0, 3) + ' - ' + code.slice(3)).toLowerCase();
    assert.deepStrictEqual(R.readKeyCode(typed), R.readKeyCode(code));
  }
});

test('readKeyCode: a wrong length or a forbidden letter (O 0 I 1 L) gives null', () => {
  const good = R.keyCode('H', [['a', 'q', 'x', 'y', 'z', 'w']], 7);
  assert.strictEqual(R.readKeyCode(good.slice(0, 10)), null);
  assert.strictEqual(R.readKeyCode(good + '2'), null);
  for (const bad of 'O0I1L') assert.strictEqual(R.readKeyCode(good.slice(0, 10) + bad), null, bad);
  assert.strictEqual(R.readKeyCode(''), null);
});

test('keyCode: the bank stamp changes when one bank cell changes, and does not depend on the seed', () => {
  const a = [['a', 'q1', 'x', 'y', 'z', 'w']], b = [['a', 'q1', 'x', 'y', 'z', 'v']];
  assert.notStrictEqual(R.keyCode('H', a, 7).slice(1, 3), R.keyCode('H', b, 7).slice(1, 3));
  assert.strictEqual(R.keyCode('H', a, 7).slice(1, 3), R.keyCode('H', a, 99).slice(1, 3));
});

test('keyCode: the order rebuilt from the typed code equals the game\'s own draws, across a pass boundary', () => {
  const n = 6, seed = 123456, code = R.keyCode('H', [['a', 'q', 'x', 'y', 'z', 'w']], seed), drawn = []; let deck = R.questionDeck(n, seed);
  for (let k = 0; k < 15; k++) { if (k > 0 && k % n === 0) deck = R.questionDeck(n, seed + k / n); drawn.push(deck[k % n]); } // the game's drawQuestion
  assert.deepStrictEqual(R.questionOrder(n, R.readKeyCode(code).seed, 0, 15), drawn);
});

test('readKeyCode: the check character catches every single mistyped character and every swap of two neighbours', () => {
  const A = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  for (const seed of [7, -987654321, 2147483647]) {
    const good = R.keyCode('H', [['a', 'q', 'x', 'y', 'z', 'w']], seed);
    assert.ok(R.readKeyCode(good));
    for (let i = 0; i < good.length; i++) for (const c of A) if (c !== good[i])
      assert.strictEqual(R.readKeyCode(good.slice(0, i) + c + good.slice(i + 1)), null, `seed ${seed} position ${i} -> ${c}`);
    for (let i = 0; i + 1 < good.length; i++) if (good[i] !== good[i + 1])
      assert.strictEqual(R.readKeyCode(good.slice(0, i) + good[i + 1] + good[i] + good.slice(i + 2)), null, `swap ${i}`);
  }
});

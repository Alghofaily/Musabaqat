// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz where every right answer is a gamble on a hidden square more tense than plain points?
// Date: 2026-11-24
// Checks the fixed question order. Run: node --test prototypes/haql-al-alghaam/order.test.js
const test = require('node:test');
const assert = require('node:assert');
const O = require('./order.js');

test('the same seed gives the same deck, and every index appears once', () => {
  const d = O.questionDeck(40, 7);
  assert.deepStrictEqual(d, O.questionDeck(40, 7));
  assert.deepStrictEqual([...d].sort((a, b) => a - b), Array.from({ length: 40 }, (_, i) => i));
  assert.notDeepStrictEqual(d, O.questionDeck(40, 8));
});

test('questionOrder equals successive draws, across a pass boundary too', () => {
  const n = 6, seed = 11, drawn = []; let deck = O.questionDeck(n, seed); // index.html's drawQuestion
  for (let k = 0; k < 15; k++) { if (k > 0 && k % n === 0) deck = O.questionDeck(n, seed + k / n); drawn.push(deck[k % n]); }
  assert.deepStrictEqual(O.questionOrder(n, seed, 0, 15), drawn);
  assert.deepStrictEqual(O.questionOrder(n, seed, 4, 5), drawn.slice(4, 9));
});

test('matchCode is 4 characters and changes when one bank cell or the seed changes', () => {
  const bank = [['a', 'q1', 'x', 'y', 'z', 'w'], ['a', 'q2', 'x', 'y', 'z', 'w']];
  const c = O.matchCode(bank, 7);
  assert.match(c, /^[2-9A-HJKMNP-Z]{4}$/);
  assert.strictEqual(c, O.matchCode(bank, 7));
  assert.notStrictEqual(c, O.matchCode(bank, 8));
  assert.notStrictEqual(c, O.matchCode([bank[0], ['a', 'q2', 'x', 'y', 'z', 'v']], 7));
});

// ---- the short typed key code (keyCode / readKeyCode) ----
test('keyCode: round trip for edge seeds, and typing ignores case, spaces and the dash', () => {
  const bank = [['a', 'q1', 'x', 'y', 'z', 'w']];
  for (const s of [0, 1, -1, 2 ** 31 - 1, -(2 ** 31), Date.now() | 0]) {
    const code = O.keyCode('S', bank, s);
    assert.strictEqual(code.length, 11);
    assert.strictEqual(O.readKeyCode(code).seed, s | 0);
    assert.strictEqual(O.readKeyCode(code).game, 'S');
    const typed = (code.slice(0, 3) + ' - ' + code.slice(3)).toLowerCase();
    assert.deepStrictEqual(O.readKeyCode(typed), O.readKeyCode(code));
  }
});

test('readKeyCode: a wrong length or a forbidden letter (O 0 I 1 L) gives null', () => {
  const good = O.keyCode('S', [['a', 'q', 'x', 'y', 'z', 'w']], 7);
  assert.strictEqual(O.readKeyCode(good.slice(0, 10)), null);
  assert.strictEqual(O.readKeyCode(good + '2'), null);
  for (const bad of 'O0I1L') assert.strictEqual(O.readKeyCode(good.slice(0, 10) + bad), null, bad);
  assert.strictEqual(O.readKeyCode(''), null);
});

test('keyCode: the bank stamp changes when one bank cell changes, and does not depend on the seed', () => {
  const a = [['a', 'q1', 'x', 'y', 'z', 'w']], b = [['a', 'q1', 'x', 'y', 'z', 'v']];
  assert.notStrictEqual(O.keyCode('S', a, 7).slice(1, 3), O.keyCode('S', b, 7).slice(1, 3));
  assert.strictEqual(O.keyCode('S', a, 7).slice(1, 3), O.keyCode('S', a, 99).slice(1, 3));
});

test('keyCode: the order rebuilt from the typed code equals the game\'s own draws, across a pass boundary', () => {
  const n = 6, seed = 123456, code = O.keyCode('S', [['a', 'q', 'x', 'y', 'z', 'w']], seed), drawn = []; let deck = O.questionDeck(n, seed);
  for (let k = 0; k < 15; k++) { if (k > 0 && k % n === 0) deck = O.questionDeck(n, seed + k / n); drawn.push(deck[k % n]); } // the game's drawQuestion
  assert.deepStrictEqual(O.questionOrder(n, O.readKeyCode(code).seed, 0, 15), drawn);
});

test('readKeyCode: the check character catches every single mistyped character and every swap of two neighbours', () => {
  const A = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  for (const seed of [7, -987654321, 2147483647]) {
    const good = O.keyCode('S', [['a', 'q', 'x', 'y', 'z', 'w']], seed);
    assert.ok(O.readKeyCode(good));
    for (let i = 0; i < good.length; i++) for (const c of A) if (c !== good[i])
      assert.strictEqual(O.readKeyCode(good.slice(0, i) + c + good.slice(i + 1)), null, `seed ${seed} position ${i} -> ${c}`);
    for (let i = 0; i + 1 < good.length; i++) if (good[i] !== good[i + 1])
      assert.strictEqual(O.readKeyCode(good.slice(0, i) + good[i + 1] + good[i] + good.slice(i + 2)), null, `swap ${i}`);
  }
});

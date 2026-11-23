// PROTOTYPE - NOT FOR PRODUCTION
// Question: does choosing your own risk, then flipping a luck card, make a quiz more exciting than points alone?
// Date: 2026-11-23
// Checks the fixed question order, one deck per level. Run: node --test prototypes/waraqat-al-hazz/order.test.js
const test = require('node:test');
const assert = require('node:assert');
const O = require('./order.js');

// a small bank with uneven levels: the counts must come from the bank, never from a fixed 20
const bank = [];
for (const [lv, n] of [[1, 7], [2, 5], [3, 9]]) for (let i = 0; i < n; i++) bank.push(['c', `q${lv}-${i}`, 'a', 'b', 'c', 'd', String(lv)]);

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

test('each level draws only its own rows, once each per pass, whatever its size', () => {
  for (const [lv, n] of [[1, 7], [2, 5], [3, 9]]) {
    const own = O.levelRows(bank, lv);
    assert.strictEqual(own.length, n);
    const pass = O.levelOrder(bank, 7, lv, 0, n);
    assert.deepStrictEqual([...pass].sort((a, b) => a - b), own);
    assert.ok(O.levelOrder(bank, 7, lv, 0, 3 * n).every(i => bank[i][6] === String(lv)));
  }
});

test('a level\'s order does not depend on the other levels, and levels differ from each other', () => {
  const l1 = O.levelOrder(bank, 7, 1, 0, 7), bigger = bank.concat([['c', 'extra', 'a', 'b', 'c', 'd', '3']]);
  assert.deepStrictEqual(O.levelOrder(bigger, 7, 1, 0, 7), l1);
  assert.notDeepStrictEqual(O.questionDeck(7, 7 + 1000), O.questionDeck(7, 7 + 2000));
});

test('levelOrder from a later position matches the same stretch of the whole order', () => {
  const all = O.levelOrder(bank, 7, 2, 0, 12);
  assert.deepStrictEqual(O.levelOrder(bank, 7, 2, 4, 6), all.slice(4, 10));
  assert.deepStrictEqual(O.levelOrder([bank[0]].filter(r => r[6] === '2'), 7, 2, 0, 3), []); // an empty level gives nothing
});

test('matchCode is 4 characters and changes when one bank cell or the seed changes', () => {
  const c = O.matchCode(bank, 7);
  assert.match(c, /^[2-9A-HJKMNP-Z]{4}$/);
  assert.strictEqual(c, O.matchCode(bank, 7));
  assert.notStrictEqual(c, O.matchCode(bank, 8));
  const edited = bank.map(r => r.slice()); edited[3][4] = 'changed';
  assert.notStrictEqual(c, O.matchCode(edited, 7));
});

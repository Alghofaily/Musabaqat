// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz that pays into a live stock market more exciting than plain points?
// Date: 2026-11-23
// Checks the fixed question order. Run: node --test prototypes/souq-al-marifa/order.test.js
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

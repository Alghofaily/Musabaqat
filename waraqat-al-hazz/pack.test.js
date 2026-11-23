// PROTOTYPE - NOT FOR PRODUCTION
// Question: does choosing your own risk, then flipping a luck card, make a quiz more exciting than points alone?
// Date: 2026-11-23
// Checks the host's answer key packing. Run: node --test prototypes/waraqat-al-hazz/pack.test.js
const test = require('node:test');
const assert = require('node:assert');
const K = require('./pack.js');

const KEY = { code: 'K7Q4', rows: [ // [level, number in that level, question start, answer]; the CSV-like row checks quotes, tags and commas
  [1, 1, 'ما هي آخر سورة نزلت من القرآن الكريم؟', 'سورة النصر'],
  [3, 2, 'سؤال من ملف "CSV" فيه <b>وسم</b> و , فاصلة', 'إجابة؛ فيها فاصلة منقوطة'],
] };

test('pack then unpack gives back the same key, Arabic and CSV text included', async () => {
  const text = await K.pack(KEY);
  assert.match(text, /^[A-Za-z0-9_-]+$/); // safe in a link's #hash
  assert.deepStrictEqual(await K.unpack(text), KEY);
});

test('unpack refuses text that is not a waraqa key', async () => {
  await assert.rejects(K.unpack('bm90LWEta2V5'));
  await assert.rejects(K.unpack(''));
  const ZLIB = require('node:zlib'); // a well-formed key of another game (tag 'souq') is refused too
  const other = ZLIB.deflateRawSync(Buffer.from(JSON.stringify([1, 'souq', 'K7Q4', []]))).toString('base64url');
  await assert.rejects(K.unpack(other));
});

test('cut keeps short text, shortens long text with an ellipsis, and 0 leaves it out', () => {
  assert.strictEqual(K.cut('قصير', 10), 'قصير');
  assert.strictEqual(K.cut('نص طويل جداً هنا', 6), 'نص طو…');
  assert.strictEqual(K.cut('أي نص', 0), '');
});

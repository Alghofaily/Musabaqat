// PROTOTYPE - NOT FOR PRODUCTION
// Question: does choosing your own risk, then flipping a luck card, make a quiz more exciting than points alone?
// Date: 2026-11-14
// Checks the question-file reader. Run: node --test prototypes/waraqat-al-hazz/csv.test.js
const test = require('node:test');
const assert = require('node:assert');
const { questionsFromCSV, splitCSV, TEMPLATE } = require('./csv.js');

test('reads the template: Arabic header skipped, quotes kept, one question per level', () => {
  const { questions, skipped, levelErrors } = questionsFromCSV(TEMPLATE, 'ملف');
  assert.deepStrictEqual([skipped, levelErrors], [[], []]);
  assert.deepStrictEqual(questions.map(q => q[6]), ['1', '2', '3']);
  assert.deepStrictEqual(questions[1], ['ملف', 'من مؤلف كتاب "البخلاء"؟', 'الجاحظ', 'المتنبي', 'ابن خلدون', 'الطبري', '2']);
});

test('levels may be written as ١ ٢ ٣ or سهل متوسط صعب', () => {
  const text = 'س1,أ,ب,ج,د,١\nس2,أ,ب,ج,د,متوسط\nس3,أ,ب,ج,د, صعب ';
  assert.deepStrictEqual(questionsFromCSV(text, 'c').questions.map(q => q[6]), ['1', '2', '3']);
});

test('a blank or wrong level is reported by line, so the file can be refused', () => {
  const text = 'السؤال,الخيار 1 (الإجابة),الخيار 2,الخيار 3,الخيار 4,المستوى\nس1,أ,ب,ج,د,1\nس2,أ,ب,ج,د,\nس3,أ,ب,ج,د\nس4,أ,ب,ج,د,4\n';
  assert.deepStrictEqual(questionsFromCSV(text, 'c').levelErrors, [3, 4, 5]);
});

test('other bad rows are skipped with their line and reason, blank lines ignored', () => {
  const text = 'س1,أ,ب,ج,د,1\n\nس2,أ,أ,ج,د,2\n,أ,ب,ج,د,3\n';
  const { questions, skipped, levelErrors } = questionsFromCSV(text, 'c');
  assert.strictEqual(questions.length, 1);
  assert.deepStrictEqual(levelErrors, []);
  assert.deepStrictEqual(skipped, [{ line: 3, why: 'duplicate' }, { line: 4, why: 'missing' }]);
});

test('semicolons and a comma inside quotes', () => {
  const { questions } = questionsFromCSV('"س, ١";أ;ب;ج;د;2', 'c');
  assert.deepStrictEqual(questions[0].slice(1), ['س, ١', 'أ', 'ب', 'ج', 'د', '2']);
});

test('a first row of questions is not mistaken for a header', () => {
  assert.strictEqual(questionsFromCSV('ما السؤال الأصعب؟,أ,ب,ج,د,3', 'c').questions.length, 1);
  assert.deepStrictEqual(splitCSV('a,,c'), [['a', '', 'c']]);
});

// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz that decides who takes land more tense than plain points?
// Date: 2026-11-19
// Checks the question-file reader. Run: node --test prototypes/husun-al-marifa/csv.test.js
const test = require('node:test');
const assert = require('node:assert');
const { questionsFromCSV, splitCSV, TEMPLATE } = require('./csv.js');

test('reads the template: header skipped, quotes and doubled quotes kept', () => {
  const { questions, skipped } = questionsFromCSV(TEMPLATE, 'ملف');
  assert.deepStrictEqual(skipped, []);
  assert.deepStrictEqual(questions, [
    ['ملف', 'ما عاصمة اليابان؟', 'طوكيو', 'أوساكا', 'كيوتو', 'سيول'],
    ['ملف', 'من مؤلف كتاب "البخلاء"؟', 'الجاحظ', 'المتنبي', 'ابن خلدون', 'الطبري'],
  ]);
});

test('semicolons, a comma and a new line inside quotes, CRLF, no header', () => {
  const text = 'س1;"أ, ب";ج;د;هـ\r\n"سطر\nثانٍ";1;2;3;4';
  const { questions } = questionsFromCSV(text, 'c');
  assert.deepStrictEqual(questions.map(q => q.slice(1)), [['س1', 'أ, ب', 'ج', 'د', 'هـ'], ['سطر\nثانٍ', '1', '2', '3', '4']]);
});

test('bad rows are skipped with their line and reason, blank lines ignored', () => {
  const text = 'السؤال,الخيار 1 (الإجابة),الخيار 2,الخيار 3,الخيار 4\nq1,a,b,c,d\n\nq2,a,a,c,d\nq3,a,b,c\n';
  const { questions, skipped } = questionsFromCSV(text, 'c');
  assert.strictEqual(questions.length, 1);
  assert.deepStrictEqual(skipped, [{ line: 4, why: 'duplicate' }, { line: 5, why: 'missing' }]);
});

test('a first row of questions is not mistaken for a header, even one with the word سؤال', () => {
  assert.strictEqual(questionsFromCSV('ما لون السماء؟,أزرق,أحمر,أخضر,أصفر', 'c').questions.length, 1);
  assert.strictEqual(questionsFromCSV('ما السؤال الذي لا جواب له؟,أ,ب,ج,د', 'c').questions.length, 1);
});

test('the Arabic header row is skipped, with or without spaces around the cells', () => {
  const text = ' السؤال ; الخيار 1 (الإجابة) ;الخيار 2;الخيار 3;الخيار 4\nما عاصمة مصر؟;القاهرة;الإسكندرية;أسوان;الأقصر\n';
  const { questions, skipped } = questionsFromCSV(text, 'c');
  assert.deepStrictEqual([questions.length, skipped.length], [1, 0]);
});

test('splitCSV keeps empty cells', () => {
  assert.deepStrictEqual(splitCSV('a,,c'), [['a', '', 'c']]);
});

// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz where each answer buys one move on a board you can block more tense than plain points?
// Date: 2026-11-24
// Reads the host's question file. Columns, in order, with Arabic headers:
//   السؤال، الخيار 1 (الإجابة)، الخيار 2، الخيار 3، الخيار 4
// The first choice is always the right answer; the game shuffles the choices when it asks.
// The first row is skipped as the header when its first cell is the word "السؤال" (or "Question").
// Commas, semicolons or tabs all work (Excel in Arabic often saves with semicolons), and quoted
// cells may hold commas or new lines.
(function (root) {
  const MAX_CELL = 300;   // characters in one question or answer
  const MAX_ROWS = 5000;  // questions in one file
  const HEADERS = ['السؤال', 'الخيار 1 (الإجابة)', 'الخيار 2', 'الخيار 3', 'الخيار 4'];
  const HEADER = /^(السؤال|سؤال|الأسئلة|question)$/i; // the header's first cell, exactly: a real question is never just this word

  function splitCSV(text) { // RFC 4180 cells; the delimiter is whichever of , ; tab splits the first line most
    text = String(text).replace(/^﻿/, '');
    const first = text.split(/\r?\n/, 1)[0];
    const delim = [';', '\t'].reduce((best, d) => (first.split(d).length > first.split(best).length ? d : best), ',');
    const rows = []; let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c !== '"') cell += c;
        else if (text[i + 1] === '"') { cell += '"'; i++; }
        else quoted = false;
      } else if (c === '"' && cell.trim() === '') { quoted = true; cell = ''; }
      else if (c === delim) { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  // Returns { questions: [[category, question, right, wrong, wrong, wrong]...], skipped: [{ line, why }] }.
  // why: 'missing' (a cell is empty), 'duplicate' (two choices are the same), 'long', 'limit'.
  function questionsFromCSV(text, category) {
    const rows = splitCSV(text), questions = [], skipped = [];
    let seenFirst = false;
    rows.forEach((r, i) => {
      const cells = r.map(s => s.trim()), line = i + 1;
      if (cells.every(s => !s)) return; // blank line
      if (!seenFirst) { seenFirst = true; if (HEADER.test(cells[0])) return; }
      const [q, a, b, c, d] = cells;
      if (![q, a, b, c, d].every(Boolean)) return skipped.push({ line, why: 'missing' });
      if ([q, a, b, c, d].some(s => s.length > MAX_CELL)) return skipped.push({ line, why: 'long' });
      if (new Set([a, b, c, d]).size < 4) return skipped.push({ line, why: 'duplicate' });
      if (questions.length >= MAX_ROWS) return skipped.push({ line, why: 'limit' });
      questions.push([category, q, a, b, c, d]);
    });
    return { questions, skipped };
  }

  const TEMPLATE = '\uFEFF' + HEADERS.join(',') + '\r\n' // the BOM makes Excel read the file as UTF-8
    + 'ما عاصمة اليابان؟,طوكيو,أوساكا,كيوتو,سيول\r\n'
    + '"من مؤلف كتاب ""البخلاء""؟",الجاحظ,المتنبي,ابن خلدون,الطبري\r\n';

  root.DuroobCSV = { splitCSV, questionsFromCSV, TEMPLATE, HEADERS, MAX_CELL, MAX_ROWS };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.DuroobCSV;
})(typeof window !== 'undefined' ? window : globalThis);

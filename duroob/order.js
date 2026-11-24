// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz where each answer buys one move on a board you can block more tense than plain points?
// Date: 2026-11-24
// The question order: every bank index once, shuffled by its own mulberry32 stream from `seed`, never the
// game's rng(). Trades and news then cannot move it, so a host's answer key made at Start stays right for
// the whole game. Works in the browser (root.DuroobOrder) and in Node.
(function (root) {
  'use strict';
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

  // The short typed code for the host's phone key (key.html): the game letter (H, S or W), a 2-character stamp of the
  // built-in bank (so a phone page with another bank refuses) the seed in base 31 (7 characters, padded with the
  // first letter, '2') and a check character. It holds no question and no answer: the phone rebuilds the key from the bank and the seed.
  const KEY_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // no 0/O, 1/I/L, the same as matchCode
  function keyCode(game, bank, seed) {
    let n = seed >>> 0, s = '';
    for (let i = 0; i < 7; i++) { s = KEY_ALPHABET[n % 31] + s; n = Math.floor(n / 31); }
    const body = game + matchCode(bank, 0).slice(0, 2) + s;
    return body + keyCheck(body);
  }
  // the last character: a weighted sum mod 31 (prime), so any one mistyped character, or two neighbours swapped, is caught
  function keyCheck(body) { let sum = 0; [...body].forEach((c, i) => { sum += (i + 1) * KEY_ALPHABET.indexOf(c); }); return KEY_ALPHABET[sum % 31]; }
  // text a person typed -> { game, stamp, seed } or null (case, spaces and dashes ignored; wrong length or letters: null)
  function readKeyCode(text) {
    const t = String(text).toUpperCase().replace(/[\s-]/g, '');
    if (t.length !== 11 || [...t].some(c => !KEY_ALPHABET.includes(c)) || keyCheck(t.slice(0, 10)) !== t[10]) return null;
    let n = 0; for (const c of t.slice(3, 10)) n = n * 31 + KEY_ALPHABET.indexOf(c);
    return { game: t[0], stamp: t.slice(1, 3), seed: n | 0 };
  }

  const api = { questionDeck, questionOrder, matchCode, keyCode, readKeyCode };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DuroobOrder = api;
})(typeof window !== 'undefined' ? window : globalThis);

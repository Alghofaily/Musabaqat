// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz that pays into a live stock market more exciting than plain points?
// Date: 2026-11-23
// The question order: every bank index once, shuffled by its own mulberry32 stream from `seed`, never the
// game's rng(). Trades and news then cannot move it, so a host's answer key made at Start stays right for
// the whole game. Works in the browser (root.SouqOrder) and in Node.
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

  const api = { questionDeck, questionOrder, matchCode };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SouqOrder = api;
})(typeof window !== 'undefined' ? window : globalThis);

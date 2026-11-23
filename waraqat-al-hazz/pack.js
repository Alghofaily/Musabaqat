// PROTOTYPE - NOT FOR PRODUCTION
// Question: does choosing your own risk, then flipping a luck card, make a quiz more exciting than points alone?
// Date: 2026-11-23
// The host's answer key, packed into a link's #hash and back (deflate-raw, then base64url). The
// browser never sends a #hash to the server, so the answers stay between this game and the host's
// phone. index.html packs; key.html (the phone page) unpacks. Works in the browser and in Node.
// A key is { code: match code, rows: [[level 1-3, question number in that level, question start, answer], ...] }.
(function (root) {
  'use strict';
  const cut = (t, n) => (n <= 0 ? '' : t.length > n ? t.slice(0, n - 1) + '…' : t); // 0: leave the text out

  async function pipe(bytes, stream) {
    const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
    return new Uint8Array(await out.arrayBuffer());
  }
  const toB64url = u8 => { let s = ''; for (const b of u8) s += String.fromCharCode(b);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const fromB64url = t => { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(s, c => c.charCodeAt(0)); };

  // key -> link-safe text
  async function pack(key) {
    const raw = new TextEncoder().encode(JSON.stringify([1, 'waraqa', key.code, key.rows]));
    return toB64url(await pipe(raw, new CompressionStream('deflate-raw')));
  }
  // link-safe text -> key; throws on anything that is not a waraqa key
  async function unpack(text) {
    const raw = await pipe(fromB64url(text), new DecompressionStream('deflate-raw'));
    const [v, game, code, rows] = JSON.parse(new TextDecoder().decode(raw));
    if (v !== 1 || game !== 'waraqa' || typeof code !== 'string' || !Array.isArray(rows)) throw new Error('not a key');
    return { code, rows };
  }

  const api = { cut, pack, unpack };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.WaraqaKey = api;
})(typeof window !== 'undefined' ? window : globalThis);

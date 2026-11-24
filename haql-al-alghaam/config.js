// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz where every right answer is a gamble on a hidden square more tense than plain points?
// Date: 2026-11-24
// Every tuning value lives here, each with value, min, max and step. The game reads them live
// through tune.<name> (index.html). The field rules in rules.js take the same numbers as their `tune`
// object, built from the knobs below (the original's measured values: design/originals/kasiha.md).
window.CONFIG = {
  seed: 0, // every gameplay random call reads rng(), seeded from this (or ?seed= in the address); 0: a fresh game each time
  volume: { value: 0.5, min: 0, max: 1, step: 0.05 },
  introTime: { value: 3, min: 0, max: 6, step: 0.5 },            // seconds of the logo intro on load (any key or click skips it); 0: none
  // The host's answer key on a phone (setup: شاشة المقدّم → على جوالي). One QR code carries as many
  // questions as fit; the numbers below keep it readable.
  keyQuestionChars: { value: 30, min: 0, max: 80, step: 5 },     // start of each question on the key (0: number and answer only)
  keyAnswerChars: { value: 30, min: 10, max: 80, step: 5 },      // the answer, cut with … past this
  keyMaxVersion: { value: 40, min: 10, max: 40, step: 1 },       // biggest QR code (40: 177x177 squares); lower for older phones
  keyReserve: { value: 30, min: 5, max: 120, step: 5 },          // a turn starts with a new key when fewer questions than this are left

  // Setup defaults (the host changes them on the setup screen)
  teams: { value: 4, min: 2, max: 6, step: 1 },
  fieldSize: { value: 7, min: 6, max: 10, step: 1 },             // the game offers 6, 7, 8 and 10 only; any other value snaps to the nearest
  mines: { value: 10, min: 1, max: 99, step: 1 },                // must stay below the number of squares (the setup refuses otherwise)
  layout: { value: 0, min: 0, max: 10, step: 1 },                // 0: a random layout each field; 1 to presetMaps: that fixed layout (the next field takes the next one)
  answerTime: { value: 30, min: 5, max: 180, step: 5 },          // seconds to answer
  rounds: { value: 6, min: 1, max: 50, step: 1 },                // end mode "rounds"
  minutes: { value: 60, min: 5, max: 240, step: 5 },             // end mode "timed"

  // The field's rules (rules.js DEFAULT_TUNE; measured from the original)
  safePoints: { value: 10, min: 1, max: 100, step: 1 },          // a safe square pays this
  minePenalty: { value: 20, min: 1, max: 200, step: 1 },         // a mine costs this, even below zero
  blast: { value: 4, min: 2, max: 8, step: 2 },                  // squares a mine throws open: 2, 4 or 8 (other values snap to the nearest)
  adjustStep: { value: 5, min: 1, max: 50, step: 1 },            // the host's manual plus and minus
  presetMaps: { value: 10, min: 1, max: 10, step: 1 },           // fixed layouts per size
  // data, not a knob: the suggested mine counts per size (chips on the setup screen)
  suggestedMines: { 6: [5, 7, 9], 7: [7, 10, 13], 8: [10, 13, 16], 10: [15, 20, 25] },

  // Feel
  tickWarn: { value: 5, min: 0, max: 30, step: 1 },              // seconds left when the ring starts ticking
  undoTime: { value: 8, min: 0, max: 30, step: 1 },              // seconds the undo stays after a verdict or a square; 0: none
  logLines: { value: 12, min: 3, max: 40, step: 1 },             // score changes the host's log shows
  blastStep: { value: 80, min: 0, max: 300, step: 10 },          // ms between the squares a blast throws open
  revealStep: { value: 1.2, min: 0, max: 5, step: 0.1 },         // seconds between podium places (3rd, 2nd, then 1st)
};

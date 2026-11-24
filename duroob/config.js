// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz where each answer buys one move on a board you can block more tense than plain points?
// Date: 2026-11-24
// Every tuning value lives here, each with value, min, max and step. The game reads them live
// through tune.<name> (index.html). The board rules in rules.js take the same numbers as their `tune`
// object, built from the rules* knobs below (the original's measured values: design/originals/hawajiz.md).
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
  teams: { value: 2, min: 2, max: 4, step: 1 },                  // one team per side of the board
  boardSize: { value: 9, min: 9, max: 12, step: 1 },             // the game offers 9, 10 and 12 only; any other value snaps to the nearest of them
  wallsFixed: { value: 0, min: 0, max: 15, step: 1 },            // walls per team: 0 is automatic (the tables below), 3 to 15 is fixed
  boxes: { value: 1, min: 0, max: 1, step: 1 },                  // hidden surprise squares: 1 on, 0 off
  answerTime: { value: 30, min: 5, max: 180, step: 5 },          // seconds to answer
  rounds: { value: 6, min: 1, max: 50, step: 1 },                // end mode "rounds"
  minutes: { value: 60, min: 5, max: 240, step: 5 },             // end mode "timed"
  targetPoints: { value: 5, min: 1, max: 50, step: 1 },          // end mode "first to N points"

  // The board's rules (rules.js DEFAULT_TUNE)
  walls9x2: { value: 10, min: 1, max: 20, step: 1 },             // automatic walls per team: board 9x9, 2 teams
  walls9x3: { value: 5, min: 1, max: 20, step: 1 },              //                          board 9x9, 3 or 4 teams
  walls10x2: { value: 12, min: 1, max: 20, step: 1 },
  walls10x3: { value: 6, min: 1, max: 20, step: 1 },
  walls12x2: { value: 15, min: 1, max: 20, step: 1 },
  walls12x3: { value: 8, min: 1, max: 20, step: 1 },
  boxes9: { value: 3, min: 0, max: 10, step: 1 },                // hidden surprises on the board at once, by board size
  boxes10: { value: 4, min: 0, max: 10, step: 1 },
  boxes12: { value: 5, min: 0, max: 10, step: 1 },
  boxHammer: { value: 25, min: 0, max: 100, step: 1 },           // surprise weights (out of their sum)
  boxDouble: { value: 30, min: 0, max: 100, step: 1 },
  boxBack: { value: 25, min: 0, max: 100, step: 1 },
  boxFreeze: { value: 20, min: 0, max: 100, step: 1 },
  pushBack: { value: 2, min: 1, max: 5, step: 1 },               // squares the back-trap pushes a runner

  // Feel
  tickWarn: { value: 5, min: 0, max: 30, step: 1 },              // seconds left when the ring starts ticking
  undoTime: { value: 8, min: 0, max: 30, step: 1 },              // seconds the undo stays after a verdict or an action; 0: none
  flashTime: { value: 2.2, min: 0.5, max: 6, step: 0.1 },        // seconds a revealed surprise stays lit on the board
  revealStep: { value: 1.2, min: 0, max: 5, step: 0.1 },         // seconds between podium places (3rd, 2nd, then 1st)
};

// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz that pays into a live stock market more exciting than plain points?
// Date: 2026-11-14
// Every tuning value lives here, each with value, min, max and step. The game reads them live
// through tune.<name> (index.html); the tweak panel, an add-on, writes them back here.
// The reward and trade-impact numbers start from Ma3aliSahmuk.exe's own.
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
  teams: { value: 3, min: 2, max: 6, step: 1 },
  startCash: { value: 10000, min: 1000, max: 100000, step: 500 },    // riyal per team
  startPrice: { value: 100, min: 20, max: 1000, step: 5 },           // average share price at the open
  priceSpread: { value: 0.45, min: 0, max: 0.9, step: 0.05 },        // companies open at price * (1 +- this)
  answerTime: { value: 30, min: 5, max: 180, step: 5 },              // seconds to answer
  tradeTime: { value: 60, min: 10, max: 300, step: 5 },              // seconds of trading
  rounds: { value: 6, min: 1, max: 50, step: 1 },                    // end mode "rounds"
  minutes: { value: 60, min: 5, max: 240, step: 5 },                 // end mode "timed"

  // Reward for a right answer: int(r * 0.01 * cash) * 5, r uniform in [rewardMin, rewardMax]
  rewardMin: { value: 0.25, min: 0, max: 3, step: 0.05 },            // 1.25% of cash
  rewardMax: { value: 1, min: 0, max: 3, step: 0.05 },               // 5% of cash

  // Trading
  maxBuys: { value: 2, min: 1, max: 10, step: 1 },                   // buy orders per turn
  maxSells: { value: 2, min: 1, max: 10, step: 1 },                  // sell orders per turn
  impactDivisor: { value: 500, min: 50, max: 5000, step: 50 },       // move = price * k * qty / this
  bigOrder: { value: 75, min: 1, max: 1000, step: 1 },               // shares; at or over this the move is bigger
  smallImpactMin: { value: 0.75, min: 0, max: 3, step: 0.05 },
  smallImpactMax: { value: 1.15, min: 0, max: 3, step: 0.05 },
  bigImpactMin: { value: 1.5, min: 0, max: 5, step: 0.05 },
  bigImpactMax: { value: 2.25, min: 0, max: 5, step: 0.05 },
  impactCap: { value: 0.2, min: 0.05, max: 1, step: 0.05 },          // a single trade moves the price at most this share

  // The market between turns
  driftMax: { value: 0.03, min: 0, max: 0.2, step: 0.005 },          // each full round every price moves up to +-3%
  historyLength: { value: 30, min: 5, max: 120, step: 1 },           // sparkline points kept

  // Twists (when the market opens after a right answer)
  newsChance: { value: 20, min: 0, max: 100, step: 1 },              // percent; never on the first turn
  newsSector: { value: 60, min: 0, max: 100, step: 1 },              // weight: sector news moves a whole sector
  newsDividend: { value: 25, min: 0, max: 100, step: 1 },            // weight: dividend day, every holder is paid
  newsHalt: { value: 15, min: 0, max: 100, step: 1 },                // weight: trading halt for the team on turn
  sectorMoveMin: { value: 0.08, min: 0, max: 0.5, step: 0.01 },      // sector news size
  sectorMoveMax: { value: 0.25, min: 0, max: 0.8, step: 0.01 },
  dividendMin: { value: 0.02, min: 0, max: 0.2, step: 0.005 },       // dividend per share, share of its price
  dividendMax: { value: 0.05, min: 0, max: 0.2, step: 0.005 },

  // Feel
  tickWarn: { value: 5, min: 0, max: 30, step: 1 },                  // seconds left when the ring starts ticking
  tickerSpeed: { value: 40, min: 10, max: 200, step: 5 },            // ticker tape, px per second
  undoTime: { value: 5, min: 0, max: 30, step: 1 },                 // seconds the undo stays after a verdict or a deleted question; 0: none
  revealStep: { value: 1.2, min: 0, max: 5, step: 0.1 },             // seconds between podium places (3rd, 2nd, then 1st)
};

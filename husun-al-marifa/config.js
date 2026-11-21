// PROTOTYPE - NOT FOR PRODUCTION
// Question: is a quiz that decides who takes land more tense than plain points?
// Date: 2026-11-19
// Every tuning value lives here, each with value, min, max and step. The game reads them live
// through tune.<name> (index.html); the tweak panel, an add-on, writes them back here.
window.CONFIG = {
  seed: 0, // every gameplay random call reads rng(), seeded from this (or ?seed= in the address); 0: a new map each game
  volume: { value: 0.5, min: 0, max: 1, step: 0.05 },

  // Setup defaults (the host changes them on the setup screen)
  teams: { value: 4, min: 2, max: 6, step: 1 },
  answerTime: { value: 30, min: 5, max: 180, step: 5 },          // seconds to answer a question
  rounds: { value: 8, min: 1, max: 50, step: 1 },                // end mode "rounds"
  minutes: { value: 45, min: 5, max: 240, step: 5 },             // end mode "timed"

  // The map: an odd-r hex grid with a few lakes cut out, always one connected land
  mapCols: { value: 8, min: 5, max: 12, step: 1 },
  mapRows: { value: 6, min: 4, max: 9, step: 1 },
  mapLakes: { value: 6, min: 0, max: 20, step: 1 },              // hexes removed: 8 x 6 - 6 = 42 regions

  // Start: each team holds its capital (M3arik: the capital alone, with 50 battalions)
  startHexes: { value: 1, min: 1, max: 6, step: 1 },             // capital included
  startCapitalBattalions: { value: 50, min: 1, max: 200, step: 1 },
  startOtherBattalions: { value: 1, min: 0, max: 20, step: 1 },
  startMoney: { value: 300, min: 0, max: 5000, step: 50 },

  // Money and payout (M3arik: 20 per right answer; every 4 rounds 20 battalions per hex, into the capital)
  turnReward: { value: 20, min: 0, max: 1000, step: 5 },         // a right answer to the team's own question
  payoutEvery: { value: 4, min: 1, max: 12, step: 1 },           // rounds between payouts
  payoutPerHex: { value: 20, min: 0, max: 100, step: 1 },        // battalions per hex held, added to the capital

  // Market prices, re-rolled each round (M3arik's formula; see rollPrices in rules.js)
  priceRoll: { value: 20, min: 0, max: 60, step: 2 },            // size of each random step
  troopBase: { value: 9, min: 1, max: 200, step: 1 },            // battalion sell price at the middle roll is base + 5
  cannonBase: { value: 65, min: 1, max: 500, step: 5 },
  fortBase: { value: 60, min: 1, max: 500, step: 5 },
  troopSpread: { value: 1, min: 0, max: 50, step: 1 },           // buy price = sell price + spread
  cannonSpread: { value: 5, min: 0, max: 100, step: 1 },
  fortSpread: { value: 10, min: 0, max: 100, step: 1 },

  // Battle (M3arik): a hit is hitBase + hitPerCannon x cannons, halved by a fort
  hitBase: { value: 3, min: 1, max: 20, step: 1 },
  hitPerCannon: { value: 3, min: 0, max: 20, step: 1 },
  defenderWrongLoss: { value: 3, min: 0, max: 20, step: 1 },     // the defender's own miss
  attackMin: { value: 4, min: 2, max: 20, step: 1 },             // battalions needed to attack a team, and to keep fighting
  movesPerTurn: { value: 1, min: 0, max: 5, step: 1 },

  // Score when time or rounds run out (M3arik): hexes x battalion price x hexWorth + money + goods at sell price
  hexWorth: { value: 50, min: 0, max: 200, step: 5 },

  // Feel
  tickWarn: { value: 5, min: 0, max: 30, step: 1 },              // seconds left when the ring turns red and ticks
  floodTime: { value: 0.7, min: 0.1, max: 3, step: 0.1 },        // seconds a taken hex takes to fill with its new colour
  undoSeconds: { value: 5, min: 0, max: 30, step: 1 },           // how long "تراجع (Z)" stays after a verdict, and after deleting a bank question
  fallBeat: { value: 1.5, min: 0, max: 5, step: 0.1 },           // seconds the fallen-capital beat holds the stage (Enter skips it)
};

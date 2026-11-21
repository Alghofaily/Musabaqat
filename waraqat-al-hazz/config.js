// PROTOTYPE - NOT FOR PRODUCTION
// Question: does choosing your own risk, then flipping a luck card, make a quiz more exciting than points alone?
// Date: 2026-11-14
// Every tuning value lives here, each with value, min, max and step. The game reads them live
// through tune.<name> (index.html); the tweak panel, an add-on, writes them back here.
// The card mix and the attack sizes are luckyquiz.exe's own (counted from its 96 questions).
window.CONFIG = {
  seed: 0, // every gameplay random call reads rng(), seeded from this (or ?seed= in the address); 0: a fresh game each time
  volume: { value: 0.5, min: 0, max: 1, step: 0.05 },
  introTime: { value: 3, min: 0, max: 6, step: 0.5 },            // seconds of the logo intro on load (any key or click skips it); 0: none

  // Setup defaults (the host changes them on the setup screen)
  teams: { value: 3, min: 2, max: 6, step: 1 },
  answerTime: { value: 30, min: 5, max: 180, step: 5 },   // seconds, every level
  rounds: { value: 6, min: 1, max: 50, step: 1 },          // end mode "rounds"
  minutes: { value: 60, min: 5, max: 240, step: 5 },       // end mode "timed"

  // Points for a right answer, by level
  level1Points: { value: 25, min: 0, max: 1000, step: 5 },
  level2Points: { value: 50, min: 0, max: 1000, step: 5 },
  level3Points: { value: 100, min: 0, max: 1000, step: 5 },
  wrongPenalty: { value: 0, min: 0, max: 1, step: 0.25 },  // share of the level's points lost on a wrong answer (0: none)

  // The card board
  cardsOnBoard: { value: 12, min: 4, max: 16, step: 1 },
  // How often each card comes up: luckyquiz's counts out of 96 questions
  wPlus10: { value: 6, min: 0, max: 50, step: 1 },
  wPlus100: { value: 10, min: 0, max: 50, step: 1 },
  wPlus1000: { value: 8, min: 0, max: 50, step: 1 },
  wMinus10: { value: 7, min: 0, max: 50, step: 1 },
  wMinus100: { value: 12, min: 0, max: 50, step: 1 },
  wMinus1000: { value: 4, min: 0, max: 50, step: 1 },
  wNothing: { value: 10, min: 0, max: 50, step: 1 },
  wAgain: { value: 9, min: 0, max: 50, step: 1 },          // play again
  wDove: { value: 7, min: 0, max: 50, step: 1 },           // blocks the next strike
  wLightning: { value: 9, min: 0, max: 50, step: 1 },      // strike one team
  wFire: { value: 6, min: 0, max: 50, step: 1 },           // strike every other team
  wStop: { value: 6, min: 0, max: 50, step: 1 },           // bench one team
  wNuke: { value: 2, min: 0, max: 50, step: 1 },           // big strike on every other team
  // What the attacks do (luckyquiz's numbers)
  lightningHit: { value: 200, min: 0, max: 5000, step: 10 },
  fireHit: { value: 200, min: 0, max: 5000, step: 10 },
  nukeHit: { value: 1000, min: 0, max: 5000, step: 50 },
  stopTurns: { value: 2, min: 1, max: 5, step: 1 },        // turns a benched team sits out

  // Feel
  tickWarn: { value: 5, min: 0, max: 30, step: 1 },        // seconds left when the ring starts ticking
  beamSpeed: { value: 0.35, min: 0, max: 2, step: 0.05 },  // spotlight sweep, radians per second
  // The card reveal: the chosen card travels to the stage centre, then a banner sized by impact
  revealTime: { value: 1.8, min: 0.6, max: 4, step: 0.1 },   // seconds from the pick to the buttons (Enter skips)
  revealZoom: { value: 1.45, min: 1, max: 2, step: 0.05 },   // how big the chosen card grows at the centre
  impactMedium: { value: 100, min: 0, max: 5000, step: 10 },  // points moved (all teams together) for a medium banner
  impactBig: { value: 600, min: 0, max: 10000, step: 50 },    // points moved for the big banner (+1000, −1000, fire on 3+ rivals, the bomb)
  // Mistakes
  undoSeconds: { value: 5, min: 0, max: 30, step: 1 },        // how long "تراجع" stays after a verdict, and after deleting a question
  // The winner
  resultsStep: { value: 1.1, min: 0.2, max: 3, step: 0.1 },   // seconds between 3rd, 2nd and 1st appearing
};

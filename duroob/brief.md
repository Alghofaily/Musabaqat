# Game Brief: دروب

## In your words
run the playbook on حواجز (the original: `Hawajiz/original.html`, studio only; mechanics in `design/originals/hawajiz.md`)
Questions: a right answer earns the move
Teams: 2–4
Name: دروب (not «… المعرفة»: used twice already)
Ending: the studio three + a target score

**Pitch:** A host-run team quiz on a walled board: every right answer earns one move (step your runner toward the far side or drop a wall in a rival's path), and every runner that gets across scores a point.
**Genre:** trivia-quiz × abstract race board game (host-run party game)
**Controls:** mouse or touch (the host runs it); 1–4 picks an answer in 4-choice mode; R turns a wall, Esc cancels.
**Question:** is a quiz where each answer buys one move on a board you can block more tense than plain points?
**Hooks:** knowledge becomes moves, and a right answer can be spent on blocking a rival instead of running.
**Intent:** needs 2–4 teams (you said); one team per side of the board.

## Look and references
- Look (proposed; worked out with impeccable in the UI phase): a stone courtyard at night seen from above, lantern-lit; tiles in carved stone; walls are raised stone slabs in the team's colour; each board edge glows in the colour of the team heading for it. Arabic RTL, tabular numbers. Every figure drawn, no emoji; no cross symbol anywhere. Fonts bundled (offline).
- References: حواجز (the rules and numbers, `design/originals/hawajiz.md`); the studio's host flow (husun, souq, waraqat). Nothing visual from the original.
- View: 2D · Camera: static top-down board.

## First minute
Setup on one screen: teams (2–4, named), board size, question style (4 choices / host judges / own questions), play mode (sequential / fastest), answer time, how it ends. Start → the board with each team's start edge marked → team 1's question on the timer → right: the action bar opens; the team enters its runner on its edge → next team → a few turns in, the first wall slams down across a rival's path.

## Challenge
Walls slow rivals; a wall that seals a path is allowed after a warning, and hammers and the host's remove-wall tool undo it. Hidden surprise squares reward going off the straight line (hammer, double step) or punish it (push back, freeze).

## Core loop
- A question from the bank on the answer timer. Play mode: sequential (the team on turn answers) or fastest (the question is for everyone and the host picks the team that answered first).
- Right: that team takes exactly one action: enter a new runner on its start edge, step one square (with the original's jump rules), place a wall, relocate one of its own walls (only with no walls left), or use a collected power.
- Wrong: the turn passes; no action.
- Reaching the far edge: +1 point; that runner stays as a small dot in the team colour; the team enters a new runner when it chooses.
- Next team (sequential) or next question (fastest). Ends by the chosen mode → results podium.

## Goal & fail state
- Most points when the game ends wins: a podium for the top 3 and a full table. A tie at the top is shown as a tie. No elimination.

## Rules kept from حواجز (numbers measured from its code)
- Boards 9×9, 10×10, 12×12. Walls per team, auto: 9×9 → 10 (2 teams) / 5 (3–4); 10×10 → 12 / 6; 12×12 → 15 / 8; or a fixed 3–15.
- Walls are two cells long, never overlap or cross in a «+». Sealing a path asks for confirmation.
- Jumps: straight over an adjacent runner; if blocked, to either side of it.
- Surprises (3 / 4 / 5 hidden by board size, interior only, a new one hides when one opens): hammer 25, double step 30, push back 2 squares 25, freeze 20.
- Freeze: the team can do nothing until another team has played (sequential: its next turn is skipped).
- Stuck runner (sequential): must place a wall, else relocate one, else hammer, else the turn is skipped.
- Host tool: remove any wall (returns to its owner's stock), not an action.

## Features
- [x] Setup screen: teams (2–4, named), board size, walls (auto / fixed), surprises (on / off), question mode, play mode (sequential / fastest), answer time, end mode (manual / timed minutes / rounds / first to N points), sound
- [x] Question bank: the studio's shared default bank (`tools/question-bank/`); bank editor saved in the browser; CSV upload with Arabic headers السؤال، الخيار 1 (الإجابة)، الخيار 2، الخيار 3، الخيار 4, add or replace, template download, bad rows reported by line
- [x] Question modes: 4 choices; host judges with the answer revealed after the verdict; «أسئلتي أنا» (clock + right/wrong only)
- [x] Board: runners, walls with a live placement preview (ok / seals a path / illegal), legal moves shown, score dots, surprise reveal
- [x] Host features (as in the other three): fixed question order with the question number on stage; host window on the laptop (`presenter.html`) and phone key by QR or typed code (`key.html`) in judge mode; undo after a verdict or a move; a game survives a refresh
- [x] Results podium (top 3) + standings; sounds with mute; logo intro; the Musabaqat family link

## Out of scope
- More than 4 teams (one per board side)
- Phone buzzers for teams: needs a server

## Build order
1. `rules.js` with tests: board, moves and jumps, walls and path check, surprises, freeze, stuck rules, scoring, end modes.
2. The slice: setup → question → action → next team → end → podium.
3. Host stack, bank, CSV, host screens, then the look.

---
**Kill condition:** if spending a right answer on one step feels too small, so a game drags past an hour before anyone scores, after two tuning rounds (board size, double steps).
**Who it's for / what they feel:** a host running school, family or company competitions; the tension of a blocked path and the relief of a hammer.
**Games you love / don't:** حواجز (the rules); husun, souq and waraqat (the host flow).

# Game Brief: حقل الألغام

## In your words
run the playbook on «كاسحة الألغام» (the original: `Kasiha/`, studio only; mechanics in `design/originals/kasiha.md`)
The score can go negative
Questions: a right answer opens a square
Teams: 2–6
Ending: the board is clear, or the studio three (manual / timed / rounds)
Name: حقل الألغام

**Pitch:** A host-run team quiz on a minefield: every right answer lets the team open one square; a safe square pays, a mine costs points and blows open the squares around it.
**Genre:** trivia-quiz × minesweeper (host-run party game)
**Controls:** mouse or touch (the host runs it); 1–4 picks an answer in 4-choice mode.
**Question:** is a quiz where every right answer is a gamble on a hidden square more tense than plain points?
**Hooks:** a right answer is a reward and a risk at once; the numbers on opened squares let the room reason about where the mines are, so everyone plays along.
**Intent:** needs 2–6 teams (you said).

## Look and references
- Look (proposed; worked out with impeccable in the UI phase): a sunlit surveyor's field map seen from above, distinct from دروب's night courtyard: khaki sand ground, closed squares as raised turf patches, opened squares as dug earth with the mine count, each square a team opens marked with its pennant colour; mines as round dark shells with a short fuse (no spikes, no crossing bars); a mine blast as a dust ring that throws the neighbouring squares open. Arabic RTL, tabular numbers, drawn figures only, no emoji, no cross or plus shape anywhere. Fonts bundled (offline).
- References: كاسحة الألغام (the rules and numbers, `design/originals/kasiha.md`); the studio host flow (husun, souq, waraqat, duroob). Nothing visual from the original.
- View: 2D · Camera: static top-down field.

## First minute
Setup on one screen: teams (2–6, named), field size, mines, points, question style, play mode, answer time, how it ends. Start → the closed field → team 1's question on the timer → right: the field lights up for that team; they open a square: «3» → +10 in a gold flash → next team → someone reads the numbers wrong and opens a mine: the blast throws open the squares around it and the score dips below zero.

## Challenge
Mines are hidden; the numbers on opened squares let teams (and the room) deduce safe squares. A mine costs the full penalty even below zero, and its blast opens up to 2 / 4 / 8 neighbours that score for nobody, revealing information to every team.

## Core loop
- A question from the bank on the answer timer. Play mode: sequential (the team on turn answers) or fastest (the question is for everyone and the host picks the team that answered first).
- Right: that team opens exactly one closed square. Safe: +safe points, the square shows the adjacent-mine count in the team's colour (no flood fill: a 0 opens only itself). Mine: −penalty (can go negative), the blast opens up to the blast size of closed neighbours (orthogonal first, then diagonal; no points, no chain reaction).
- Wrong: the turn passes; nothing opens.
- When the field is clear: in the «board clear» ending the game ends; in the other endings a new field is laid and the scores carry over (a new round of fields).
- Next team (sequential) or next question (fastest). Ends by the chosen mode → results podium.

## Goal & fail state
- Highest score when the game ends wins (scores may be negative): a podium for the top 3 and a full table, ties shared. No elimination.

## Rules kept from كاسحة الألغام (numbers measured from its code)
- Field sizes 6×6, 7×7, 8×8, 10×10; suggested mines 6 → 5/7/9, 7 → 7/10/13, 8 → 10/13/16, 10 → 15/20/25, or a custom count; default 7×7 with 10 mines.
- Random layout (never the same twice in a row) or one of 10 fixed layouts per size.
- Safe square +10, mine −20 (both tunable); blast size 2 / 4 / 8 (default 4).
- Host tools: undo, pause, manual ± per team (step 5), hide scores, a log of every score change.

## Features
- [x] Setup screen: teams (2–6, named), field size, mines (suggested chips or custom), layout (random / fixed 1–10), safe points, mine penalty, blast size, question mode, play mode (sequential / fastest), answer time, end mode (board clear / manual / timed minutes / rounds), sound
- [x] Question bank: the studio's shared default bank (`tools/question-bank/`); bank editor saved in the browser; CSV upload with Arabic headers السؤال، الخيار 1 (الإجابة)، الخيار 2، الخيار 3، الخيار 4, add or replace, template download, bad rows reported by line
- [x] Question modes: 4 choices; host judges with the answer revealed after the verdict; «أسئلتي أنا» (clock + right/wrong only)
- [x] Field: closed / safe (count, team colour) / mine (hit) squares, the blast, unrevealed mines shown at the end, mines-left and closed-squares counters, a new field when one is cleared (non-«board clear» endings)
- [x] Host features (as in the other games): fixed question order with the question number on stage; host window on the laptop (`presenter.html`) and phone key by QR or typed code (`key.html`) in judge mode; undo after a verdict or a square; a game survives a refresh; manual ± per team; hide scores; score log
- [x] Results podium (top 3) + standings with gained / lost; sounds with mute (the blast sound); logo intro; the Musabaqat family link

## Out of scope
- Flags / marking suspected mines (not in the original)
- Phone buzzers for teams: needs a server

## Build order
1. `rules.js` with tests: layouts (seeded, fixed maps reproducible), counts, open safe / mine, blast order, negative scores, field cleared, new field with scores kept, ranking with ties.
2. The slice: setup → question → open a square → next team → end → podium.
3. Host stack, bank, CSV, host screens, then the look.

---
**Kill condition:** if opening one square per right answer is too slow for 6 teams on a 10×10 field (a field takes more than an hour), after two tuning rounds (default size, blast).
**Who it's for / what they feel:** a host running school, family or company competitions; the gamble of a right answer and the groan of a blast.
**Games you love / don't:** كاسحة الألغام (the rules); husun, souq, waraqat and دروب (the host flow).

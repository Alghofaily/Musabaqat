# Game Brief: ورقات الحظ

## In your words
add new game luckyquiz.exe
Rights: Original, same genre (Recommended)
1. Luck draw: Flip one of several face-down cards on the board (usual).
2. How fierce the luck is: Mixed (usual): mostly gains, some losses, and a few cards that touch other teams (the cards will be exactly same as the original game).
3. Difficulty levels and the CSV: Add an optional sixth column "المستوى" (1, 2 or 3), if blank, error is shown and file will not be imported.
4. How questions are shown: same as سوق المعرفة, where the host chooses either 4 choices on screen or the question only with right/wrong buttons and the answer revealed (usual).
5. Look: A bright TV game-show set (usual): deep blue stage, golden cards, spotlight beams, flat vector style.
6. Pace and difficulty: the answer time is 30 seconds by default for every level (usual).
7. A wrong answer: you pick
After play: redo both games ui/ux

**Pitch:** A TV-style team quiz: pick how hard your question is, answer it, then flip a face-down card that can make you, break you, or let you strike a rival.
**Genre:** trivia-quiz (host-run team game show)
**Controls:** mouse or touch for everything; 1-3 picks a level, 1-4 an answer; Enter is the main button; P pauses; M mutes.
**Question:** does choosing your own risk, then flipping a luck card, make a quiz more exciting than points alone?
**Hooks:** smart AND lucky: the level you dare decides your points, the card you flip can swing the whole table.
**Intent:** needs 2-6 teams (you said: team quiz) · soft or no failure (scores may go below zero)

## Look and references
- Look: bright TV game-show set, flat vector: a deep blue stage with sweeping spotlight beams; golden card backs with a star emblem; every card face its own drawn icon (lightning bolt, flame, bomb, stop sign, dove, circular arrows, coin stacks); cards flip in place; light theme = a daytime studio. Arabic RTL. Every figure drawn, no emoji, no plain circles.
- References: luckyquiz.exe ("شاطر أو محظوظ") for the loop and the card set only (effects and how often each comes up); its name, title art, screens, credits and questions are not used.
- View: 2D · Camera: static stage.

## First minute
Setup on one screen, then the stage with each team's podium and score. Team 1 picks a level: easy 25, medium 50 or hard 100. The question appears with a 30-second ring. A right answer adds the level's points; twelve golden cards are dealt face down; the team picks one and it flips: "+1000", or البرق, and the team picks a rival for a lightning strike of −200. The hook pays off.

## Challenge
Harder levels pay four times the easy ones, but a wrong answer earns nothing and passes the turn *(provisional)*. From the first flip, cards can cost −10 to −1000, and rivals can strike with lightning, fire, a bomb, or a stop sign that benches a team for 2 turns; a dove blocks one lightning, fire or bomb strike (its holder chooses at each strike whether to spend it), never a stop sign.

## Core loop
- Pick a level → answer on the clock (4 choices, or host judges).
- Right: level points + one card flip. Attack cards are used now or kept for a later turn.
- Wrong or time out: no points, the turn passes.
- Turns rotate, skipping benched teams; the game ends by the host, after a time, or after N rounds, then a podium.

## Goal & fail state
- Most points when the game ends wins: a podium for the top 3 and full standings. No elimination; scores may go below zero.

## Features
- [x] Setup: 2–6 named teams, answer time, question mode, end mode (manual / timed / rounds), theme light/dark
- [x] Three levels: easy 25, medium 50, hard 100, each drawn from its own questions; no repeats until a level is used up
- [x] Card board: 12 face-down cards dealt from the original's 13-card mix (±10, ±100, ±1000, nothing, play again, dove, lightning, fire, stop sign, bomb), each with its own drawn face and a flip
- [x] Attack cards used now or kept; kept cards and doves shown on each team's podium and usable on that team's turn
- [x] Question bank: the studio's shared default bank (2,602 questions: 451 easy, 574 medium, 1,577 hard, made by `tools/question-bank/`); add, delete, reset
- [x] Typed key code (2026-11-23): the key screen can show a short code («أظهر رمزاً بدل QR») that the host types into `key.html`, which rebuilds the key from the built-in bank and the seed; over http(s) the QR carries only that code (small QR, the whole pass); with the host's own bank, a flash drive (file://) or a non-whole seed the full-payload QR stays.
- [x] CSV import with Arabic headers السؤال، الخيار 1 (الإجابة)، الخيار 2، الخيار 3، الخيار 4، المستوى; a blank or wrong المستوى rejects the whole file with its lines; then add or replace
- [x] Podium and standings; sounds with mute
- [x] Logo intro on load, the Musabaqat family link (title and results screens), undo after a verdict or a deleted question
- [x] Arabic README, and a row in the games repo's main README
- [x] Host features (ported from husun-al-marifa, 2026-11-23): fixed question order, one deck per level, with the question number in its level on stage (`order.js`); host screens only in judge mode, either a window on the laptop (`presenter.html`) or an answer key on the host's phone by QR with a block per level (`key.html`, `pack.js`, `vendor/qrcode.js`); «أسئلتي أنا» own-questions mode (the level still sets the points); the hold-to-peek answer is removed; a game in progress survives a refresh («متابعة اللعبة السابقة»); the stage fills any screen shape, with a portrait layout

## Your systems
- luck cards · in the slice
- difficulty levels · in the slice
- question bank and CSV import · in the slice
- end modes · in the slice

## Keep
-

## Avoid
- luckyquiz's name, title art, screens, author credits and questions

## Out of scope
- Phone buzzers for teams: needs a server

## Build order
1. The slice: setup → level → question → points → card flip with every effect → turns with benching → end by the chosen mode → podium.

---
**Kill condition:** if the cards feel random to the point that answering well stops mattering, after one tuning round.
**Who it's for / what they feel:** a host running school, family or company competitions; the gasp when a card flips.
**Games you love / don't:** luckyquiz.exe (its card set).

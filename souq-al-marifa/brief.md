# Game Brief: سوق المعرفة

## In your words
rebuild quiz game from Ma3aliSahmuk.exe (try to mimic its UI/UX)
I have the rights, build both (your version and mirror version)
2. Questions: give the option to the host (there will be a questions bank, either to show the 4 choices, or the question only with (right/wrong) buttons and showing the right answer)
3. Look: let it be similar to the trading platforms, while giving the host the option for the game theme (light / dark)
4. Ending: lets give the host the option (he ends it manually, timed-game e.g. 1 hour game, or after number of rounds). the results podium will be shown at the end.
5. Twists: I will let you decide this one
After play: for each game, the host can upload a csv file with the following columns (Question, Choice-1 (Answer), Choice-2, Choice-3, Choice-4)
After play: the columns headers will be in Arabic
After play: remove this option (استبدال البنك بملف). instead, when adding questions, ask host wheather to overwrite the existing questions or add to them
After play: redo both games ui/ux

**Pitch:** A host-run team quiz on a live trading-platform screen: every right answer pays cash and opens a trading window, and breaking news moves whole sectors.
**Genre:** trivia-quiz × trading game (host-run party game)
**Controls:** mouse or touch (the host runs it); 1–4 picks an answer in 4-choice mode.
**Question:** is a quiz that pays into a live stock market more exciting than plain points?
**Hooks:** answers become capital, and capital becomes market moves that rivals feel.
**Intent:** needs 2–6 teams (you said)

## Look and references
- Look: a modern trading-platform UI, flat with no gloss: a ticker tape across the top; a market watch table with sparklines, last price, change % and green/red flashes on every move; a team leaderboard panel; a circular countdown ring. Light and dark themes (the host picks). Dark: navy #0b1220 background, panels #121a2b, up #16c784, down #ea3943, accent #3b82f6. Light: #f5f7fb background, white panels, the same up/down colours. Signature detail: a breaking-news bar that slides in red. Arabic RTL, tabular numbers. Every figure drawn, no emoji, no plain circles.
- References: Ma3aliSahmuk.exe (the loop and its numbers: reward, trade impact, per-turn trade limits); trading platforms (the market watch, sparklines, the ticker).
- View: 2D · Camera: static dashboard.

## First minute
Setup on one screen: teams (2–6, named), cash, share price, answer and trading times, question style (4 choices / host judges), how it ends (manual / timed / rounds), and theme. Start → the market screen with team 1 highlighted → a question card opens with the ring ticking → a right answer pays cash in a gold flash → the trade panel opens: buy 30 of a company and watch its sparkline jump and flash green. The hook pays off.

## Challenge
Trades move prices (Ma3aliSahmuk's impact rule), so others' buys lift your holdings. From turn 2, a 20% chance of breaking news moves a whole sector ±8–25% (*provisional*). Every round the market drifts ±0–3%. A wrong answer skips the turn.

## Core loop
- A question from the bank (4 choices, or host-judged with the answer revealed) on the answer timer. Play mode: sequential (the team on turn answers) or fastest (the question is for everyone and the host picks the team that answered first).
- Right: reward of 1.25–5% of cash → maybe a news event → trade window: up to 2 buys and 2 sells, with live price impact.
- Next team; after each full round, a market tick (drift, sparkline point). Ends manually, on the timer, or after N rounds → results podium.

## Goal & fail state
- Highest net worth (cash + shares at market) when the game ends wins: a podium for the top 3 and a full table. No elimination.

## Features
- [x] Setup screen: teams, cash, price, timers, question mode, play mode (sequential / fastest), end mode (manual / timed minutes / rounds), theme light/dark
- [x] Question bank: the studio's shared default bank (2,602 Arabic questions in 13 categories, made by `tools/question-bank/`; levels ignored here); the host can add, delete and reset in a bank editor, saved in the browser
- [x] Typed key code (2026-11-23): the key screen can show a short code («أظهر رمزاً بدل QR») that the host types into `key.html`, which rebuilds the key from the built-in bank and the seed; over http(s) the QR carries only that code (small QR, the whole pass); with the host's own bank, a flash drive (file://) or a non-whole seed the full-payload QR stays.
- [x] Two question modes: 4 choices (teams answer on screen), or the question alone with right/wrong buttons and the answer revealed
- [x] Market watch: 10 fictional companies in 5 sectors, with sparkline, price, change % and flashes
- [x] Trade panel: buy/sell with a quantity, 2+2 limit, price impact, trading countdown
- [x] Twists (my pick): sector news (±8–25% to every company in a sector), dividend day (cash per share held), trading halt for that team
- [x] CSV upload in the bank screen: Arabic column headers السؤال، الخيار 1 (الإجابة)، الخيار 2، الخيار 3، الخيار 4; one import button, then the host is asked to add to the existing questions or replace them; template download; bad rows reported by line
- [x] Results podium (top 3) + standings; sounds with mute
- [x] Host features (ported from husun-al-marifa, 2026-11-23): fixed question order with the question number on stage (`order.js`); host screens only in judge mode, either a window on the laptop (`presenter.html`) or an answer key on the host's phone by QR (`key.html`, `pack.js`, `vendor/qrcode.js`); «أسئلتي أنا» own-questions mode; the hold-to-peek answer is removed; a game in progress survives a refresh («متابعة اللعبة السابقة»); the stage fills any screen shape, with a portrait layout; trade buttons show the total and the shortfall
- [x] Logo intro on load, the Musabaqat family link (title and results screens), undo after a verdict or a deleted question

## Your systems
- question bank · in the slice
- theme light/dark · in the slice
- end modes · in the slice

## Avoid
- The song

## Out of scope
- Phone buzzers for teams: needs a server

## Build order
1. The slice: setup → turns with questions → reward → trading with impact → news → end by the chosen mode → podium.

---
**Kill condition:** if trading slows each turn so much that the quiz loses its pace after two tuning rounds.
**Who it's for / what they feel:** a host running school, family or company competitions; the excitement of a live market.
**Games you love / don't:** Ma3aliSahmuk (the loop).

# Game Brief: حصون المعرفة

## In your words
there is a folder called M3arik, that folder has a quiz game … I want to recreate the game using HTML, same as we did with the other quiz games
Scope: War game only
Map: Abstract hex map
1–7. for now, do the usual options

**Pitch:** A host-run team quiz on a hex war map: every attack is a battle of questions the two teams answer in turn, right answers pay for battalions, and losing your capital knocks you out.
**Genre:** trivia-quiz × turn-based-strategy (host-run party game)
**Controls:** mouse or touch (the host runs it); 1–4 pick an answer in 4-choice mode.
**Question:** is a quiz that decides who takes land more tense than plain points?
**Hooks:** knowledge becomes territory, and every answer in a battle knocks battalions off one side.
**Intent:** needs 2–6 teams (you said)

## Look and references
- Look: a dark "war room" table: navy-steel background #0e1624, panels #162133, brass lines and accents #c9a24a, light ink text #e8e6df; each team a bold colour (red #e5484d, blue #2f6bf0, mint #4de8c8, sky #1fb2f0, magenta #c42a9c, yellow #f0d63a), chosen to stay distinct for colour-blind players and apart from the brass UI, and each with its own emblem on its banner and capital; hexes with flat fills and brass borders; a drawn banner per team; capitals marked with a drawn fortress; battalion counts in a shield badge on each hex. A light theme (parchment #f4ecd8, ink #2a2a2a, same team colours) is a host toggle. Signature detail: when a hex is taken it floods with the winner's colour and the banner plants. Arabic RTL, tabular numbers. Every figure drawn, no emoji, no plain circles. *(provisional)*
- References: the mechanics only of a third-party quiz war game (attack by question, battalions, shop, capitals, game timer); souq-al-marifa and waraqat-al-hazz (setup screen, question bank, CSV upload, help screen, podium).
- View: 2D · Camera: static, one map that fits the screen *(provisional)*

## First minute
Setup on one screen: teams (2–6, named), question style, how it ends, timers, theme → Start → the map with every team's capital and a few battalions; team 1 is highlighted, with money and income in its panel → a question for team 1 (right = money) → the shop: buy 2 battalions and place them next to an enemy hex → attack: the defending team is named and a forecast shows both sides' battalions and hits → the teams answer in turn, attacker first, and the host marks each right or wrong → each answer knocks a hit off one side until the defenders fall, so the hex floods with their colour and the banner plants. The hook pays off.

## Challenge
From round 2, neighbours touch borders, so every attack risks a counterattack. A capital has no extra defence, but the team is out when it falls. In a battle each answer costs one side a hit (3 + 3 per cannon, halved by a fort; the full table is in README.md, the values in config.js); the attacker can withdraw between questions. Every 4 rounds each team gets 20 battalions per hex it holds, into its capital, so land is income and a team that falls behind can still return by answering well. *(provisional)*

## Core loop
- The team on turn gets a question (right = money).
- The shop: buy battalions, cannons and forts with money (prices re-roll each round) and place them on its own hexes.
- One attack on a neighbouring enemy or empty hex: a battle where the teams answer in turn, attacker first. Attacker right: the defender loses a hit; attacker wrong or defender right: the attacker loses a hit; defender wrong: the defender loses 3. It ends when the defenders fall, the attacker can't take another hit or has fewer than 4 battalions, or the attacker withdraws. Empty hexes are taken by answering right.
- One move: battalions from one hex to a connected hex the team owns.
- Next team; every 4 rounds, battalions per hex held go into each capital. The game ends on the chosen mode → podium.
- Leads: strategy leads the map, turns and economy; the quiz leads questions, answers and the reveal.

## Goal & fail state
- Last capital standing wins, or the highest score (hexes + battalions + money) when the timer or the round limit ends. A team whose capital falls is out; its hexes become neutral. *(provisional)*

## Features
- [x] Setup screen: 2–6 named teams, question style (4 choices / host judges), end mode (last capital / timed minutes / rounds), answer timer, light/dark theme
- [x] A generated ~40-hex map with fair, spread-out starting capitals
- [x] Turns: question → shop → attack → move, with a clear step bar
- [x] Attack battle: the teams answer in turn, the host marks each, hits by cannons and forts, withdraw between questions; a forecast before attacking (battalions and hits both sides)
- [x] Money: a correct answer pays; every 4 rounds, battalions per hex held go into the capital
- [x] Capitals: a fortress, and the team is out when it falls
- [x] Question bank: starter Arabic questions, a bank editor, CSV upload with Arabic headers (السؤال، الخيار 1 (الإجابة)، الخيار 2، الخيار 3، الخيار 4), add to or replace the existing questions, a template download, bad rows reported by line
- [x] Answer timer ring, answer reveal, sounds for right and wrong answers with a mute button
- [x] In-game help screens, like the other games
- [x] Results podium (top 3) + standings

## Your systems
- shop and battalions · in the slice
- capitals and elimination · in the slice
- game timer / end modes · in the slice
- question bank and CSV upload · in the slice

## Avoid
- M3arik's name, art, screens, videos and sounds (its question banks are used, by the owner's choice on 2026-11-20)

## Out of scope
- Memory and picture games: add them later as separate games
- Phone buzzers for teams: needs a server

## Build order
1. The slice: setup → map → turns (question, shop, attack battle, move) → elimination → end by the chosen mode → podium.

## Keep

---
**Kill condition:** if a battle of several answers per attack makes rounds drag so a 6-team game feels slow after two tuning rounds.
**Who it's for / what they feel:** a host running school, family or company competitions; the excitement of defending your capital.
**Games you love / don't:** souq-al-marifa and waraqat-al-hazz (the host flow).

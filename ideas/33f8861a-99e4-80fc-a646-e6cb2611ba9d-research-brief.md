## Problem summary
The portfolio has no daily habit or casual game. A Sudoku or crossword-style game would fill that niche — something a person opens every morning, completes in a few minutes, and feels good about. The question is whether building a puzzle game from scratch is a meaningful use of effort given what the market already provides, and whether it can be differentiated enough to be worth playing over the obvious incumbents.

## Market landscape
The daily puzzle market is dominated by a single player. NYT Games had 10M+ daily players as of 2024 and recorded 11.1 billion puzzle plays in June 2025 alone. Wordle, Connections, and Strands — all NYT Games products — drive enormous daily engagement. Mobile puzzle games broadly pulled in over $3 billion in August 2025, so the category is commercially real. However, the market structure is winner-take-most: people have a daily puzzle habit with a specific app, and changing that habit requires either extreme novelty or convenience. The indie space (Monday Fills, etc.) exists but serves constructor communities and puzzle enthusiasts, not casual daily players.

## Prior art + competitors
- **NYT Games** — Crossword, Mini Crossword, Sudoku, Wordle, Connections, Strands, Pips. The full suite. 10M daily players. Subscription-based. Effectively the default.
- **Washington Post Games** — Crossword, Sudoku, Mahjong, Solitaire. Lower market share, broader casual catalog.
- **Wordscapes** — Crossword-meets-word-search hybrid. Strong mobile numbers, freemium with ads.
- **Sudoku.com (Easybrain)** — Dedicated Sudoku app, 50M+ installs, aggressive ad monetization.
- **Monday Fills** — Indie crossword platform for constructors and enthusiasts. Not a casual product.
- **React Native open-source implementations** — Building a functional Sudoku or crossword in React Native is technically straightforward. Puzzle generation libraries (sudoku-umd) exist. Crossword construction (grid, wordlist, clue writing) is the hard part.

## Open questions
- Is the goal to compete broadly (daily habit for anyone) or build a personal tool (just for Chase)?
- If personal: which format is preferred — Sudoku (logic, no words) or crossword (vocabulary, culture)?
- If Sudoku: procedurally generated puzzles are solvable with existing libraries. If crossword: clue writing is editorial work that cannot be fully automated.
- What would differentiate this from just using the NYT Mini or the free Sudoku.com app?
- Is there a specific feature or aesthetic angle that isn't available in existing apps?

## Recommendation
**Proceed only with a clear personal-use framing.** As a public product competing with NYT Games, this is a non-starter — the audience is already captured and the investment to build equivalent quality is very high. As a personal daily tool with a custom aesthetic and no monetization pressure, it becomes much more viable. Sudoku is technically easier to execute (procedural generation + solver libraries exist) and has no editorial dependency. Crossword requires either a word/clue database or manual construction. Recommend scoping to Sudoku first with a personal, designed aesthetic, and treating it as a portfolio piece and personal habit tool rather than a distribution product.

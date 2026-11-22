# Through the Eras

A football career-mode game designed by Mayan (Tejas's son). Tejas and Claude build it; Mayan is the designer and has the final say on how it plays and on player ratings. Use UK spelling.

Live at https://patelt79-eng.github.io/through-the-eras/ via GitHub Pages from `main` (root). Anything pushed to `main` goes live within a couple of minutes, so test before pushing.

## The idea (from Mayan's notebook)

Career mode where you choose the season you start in, from 1990 onwards. Each era should look and feel like its time: rules, money, media, presentation. Key ideas from his notes:

- Main menu of four big tiles: Career Mode, International, Objectives, Load Save
- Console-style slanted menu bars (Home, Squad, Gameplan, Transfers, Scout, Table, News, Records, Settings)
- Five-step pre-season checklist that blocks the season until done: hire coaches, meet the media, set gameplan, set up scouting, review objectives
- Real manager or create your own
- Transfers that are realistic, players take a few days to decide, rivals refuse to sell
- Ratings move with form; older players decline
- Era-specific media: newspapers in the 1990s, early digital in the 2000s, TV-style in the 2010s, social media in the 2020s
- Youth academy, manager reputation tiers, dynamic news, international management (later)

## Phases

1. **2022/23 Premier League** — done (v1). Squads as of 5 Aug 2022, real fixtures, winter World Cup break, real transfers and sackings replay unless the player changes history.
2. **2004/05** — next. Early-digital presentation (blue/silver, Verdana-ish, TV-style match reports). Mourinho's first Chelsea season, Arsenal defending the Invincibles title.
3. **1992/93** — first Premier League season. Newspaper/teletext presentation, back-pass rule, three subs, 22 clubs, 42 games.

Later: International mode, multi-season careers, more eras.

## Layout

- `index.html` — the built game (engine + UI in one file). **Generated — do not edit by hand.** Season data is not inlined: the page fetches `data/<season>/*.json` when an era is picked, so it needs a web server (GitHub Pages, or the `game` server in `.claude/launch.json`), not `file://`.
- `src/template.html` — HTML shell and all CSS (dark floodlit look, Saira Condensed + Barlow)
- `src/engine.js` — pure game logic, no DOM: match engine, table, transfers, contracts, calendar, news, board
- `src/ui.js` — all screens and event handling
- `src/build.py` — inlines engine + ui into `index.html` and stamps a build hash used to bust cached data
- `data/eras.json` — list of seasons. `data/<season>/` (e.g. `data/2022-23/`) holds `players.json`, `fixtures.json`, `real_table.json` and `season.json`.
- `season.json` holds everything era-specific: clubs (colours, stadium, manager, budget, `league`, rivals), rules (`subs`, `bench`, `awayGoals`, `points`), competitions, transfer windows, dated real events, real manager changes, referees, scouting regions, foreign buyers.
- `tools/` — the scripts that produced the 2022/23 data, `test.js` (headless full-season sim) and `test_comps.js` (made-up season testing two divisions, a cup and a European group competition)

## Commands

```
python3 src/build.py          # rebuild index.html after any change in src/ or data/
# play locally: start the "game" server in .claude/launch.json (http://localhost:8765)
node tools/test.js LIV 1      # simulate a whole season headless (club code, seed)
node tools/test_comps.js LIV 5   # competition engine checks over 5 seeds; exits non-zero on failure
```

Sanity targets for a simulated 2022/23 season: champion on roughly 85–95 points, about 2.5–2.9 goals a game (real: 2.85), bottom club around 20–35 points.

## Data rules (Tejas asked for accuracy from recognised sources)

- 2022/23 squads, fixtures, results and prices come from official Fantasy Premier League data via github.com/vaastav/Fantasy-Premier-League. Birth dates, shirt numbers and exact positions from Transfermarkt; 401 birth dates were cross-checked with zero mismatches.
- Every player should be confirmed in two sources where possible; flag rather than guess.
- Never copy EA Sports FC or Football Manager ratings. Ratings are our own model.
- 2022/23 ratings = f(FPL start price, 2021/22 minutes and bonus points per 90, club strength), then about 230 hand adjustments in `tools/make_data.py` (`ADJ`).
- Wages, contracts, budgets and potential are estimates — say so in the UI.
- Opta is licensed and not available.

**Phase 2 data warning:** FPL data only exists from 2016/17, so the 2022/23 rating model does not carry over. For 2004/05, use Transfermarkt season squad pages (squads, DOB, positions, market values) and football-data.co.uk or Wikipedia for fixtures and results. Ratings will need a new model (e.g. Transfermarkt market value + appearances/goals that season + club finish), then a hand-check of the big names. Plan this with Tejas before building.

## Engine notes

- Game state lives in `ENGINE.S` (shape version `S.v`, currently 4). Add defaults for new fields in `ENGINE.migrate()` so old saves keep loading.
- Saves: 15 slots in IndexedDB (`through-the-eras` DB, stores `meta` and `state`; localStorage fallback). A hidden `auto` record is written after every action for crash recovery; a slot only changes when the player saves. The red ✕ (leave without saving) deletes `auto`. The old single `tte_save_v1` save is moved into slot 1 on first load.
- Time moves day by day: `advanceStep()` stops on any day a message of a stopping kind arrives (`STOP_KINDS` in `msg()`), or on match day. `advance()` ignores stops and is only for the headless sim.
- `realHistory`, `REAL_SACKINGS` and the external players' `rt`/`rw` fields drive history replaying. Keep this pattern per era.
- Match engine is Poisson-style per minute; tune via `lambdas()`. Out-of-position players are weighted down via `compat()`.
- The page must work at phone width (no horizontal scroll) — Mayan plays on mobile too.

## Working style

- Tejas wants direct answers and his ideas challenged where they're weak.
- Before pushing: rebuild, run `tools/test.js` for two or three seeds, and play a few matches in a browser.
- Commit and push only when asked.
- Competitions (`season.json` → `competitions`): `league` (table in `S.tables[id]`; fixtures from fixtures.json or generated from `dates`), `cup` (rounds with `enter`, `legs`, `replay`, `neutral`, optional fixed `ties`), `groups` (group tables in `S.tables['ID:A']`, then knockout `rounds`). Knockout state is in `S.cups[id]`. Each fixture has `comp`; cup fixtures also have `tie`, `leg`, `rd`.
- Knockout deciders go to extra time and penalties inside `finalize()`, so live matches and the headless sim share the same path. Draws in rounds with a `replay` date get a replay instead.

# Through the Eras

A football career-mode game designed by Mayan. Pick any Premier League club, take charge for the 2022/23 season and try to beat history.

**Play:** open the GitHub Pages link for this repository (Settings → Pages shows it). It runs in any browser, on a computer, tablet or phone.

## What's in version 1

- All 20 Premier League clubs, with squads as they stood on the opening weekend (5 August 2022)
- The real 2022/23 fixture list, kick-off times and the winter World Cup break
- Pre-season checklist: hire coaches, meet the media, set your gameplan, set up scouting, review objectives
- Live text commentary with substitutions, mentality changes and match ratings
- Transfers and contracts: bids, counter-offers, players taking a few days to decide, loans, rival clubs refusing to sell
- Real history replays: real transfers and manager sackings happen on their real dates unless your results change them
- A social-media style news feed, scout reports, league table, top scorers and season records

Coming later: the 2004/05 and 1992/93 eras, and International mode.

## Saves

The game saves automatically after every match, in the browser you play on. A save on one device won't appear on another.

## Where the data comes from

- Squads, fixtures, results and player prices: the official Fantasy Premier League data for 2022/23, via [vaastav/Fantasy-Premier-League](https://github.com/vaastav/Fantasy-Premier-League)
- Birth dates, shirt numbers and exact positions: Transfermarkt 2022/23 squad pages
- Player ratings: calculated from each player's FPL starting price, 2021/22 minutes, bonus points per 90 and club strength, then hand-checked for about 230 players
- Wages, contract lengths, budgets and potential are estimates

This is a fan-made game for fun. It isn't affiliated with the Premier League, any club or EA Sports.

## Editing the game

`index.html` is built from the files in `src/` and `data/`. After changing them, run:

```
python3 src/build.py
```

`node tools/test.js LIV 1` simulates a whole season without the interface, which is handy for checking balance.

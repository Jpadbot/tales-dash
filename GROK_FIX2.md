# GROK FIX PASS 2 (small) — AI balance + podium polish

Same rules as before: only edit src/game.js (and src/index.html if needed), then `node build.mjs`. Targeted edits only; no rewrite; no servers/commits/npm installs.

## 1. AI race balance (main issue)
Operator measured full natural vs races (headless, timeScale 4):
- Player idle (not moving): only 1 of 7 AI (糖糖, 72.0 s) finished; the other 6 were still far behind when the 10 s TIME OVER hit → 6 × 「未完成」.
- Player on autopilot: player 58.4 s, and ALL 7 AI were 「未完成」.
The field is far too spread out / the weaker AI lose too much time (probably repeated falls in the block gap, hedges/hurdle knock-downs, ball hits). Target feel = a tight pack like the reference game:
- Best AI ≈ 63–67 s, median AI ≈ 68–72 s, slowest ≈ 75–78 s.
- With an idle player: at least 5 of 7 AI finish within the 10 s window after the first AI.
- With the autopilot player (keep STRONG ~58–61 s): usually 1–3 AI finish within the 10 s window.
- AI still make visible mistakes (an occasional hurdle knock-down, an occasional fall in the gap — cap it so an AI rarely falls more than once or twice per race; after a fall they should be more careful, e.g. halve mistake chance for that section).
- Keep rubber-banding (dash regen faster when behind) and add mild catch-up for AI far behind the leader (e.g. +3–6% speed when > 25 m behind the leading runner), never for the player.
Write a quick headless diagnostic (node + puppeteer-core in /workspace/agent-tools/pw/node_modules, chrome /usr/bin/google-chrome, args --use-angle=swiftshader --enable-unsafe-swiftshader; `__td.start('vs')`, `__td.timeScale(4)`, optionally `__td.autopilot(true)`) that logs each AI's falls / knock-downs / finish time, run it 2–3 times each way, and tune until targets hold. Put the diagnostic in /workspace/agent-tools/pw/ (not in the repo).

## 2. Podium polish (vs results)
In the 3D podium the steps are small and the 1/2/3 numbers are not visible; non-podium runners stand in front and block it. Make the podium clearly readable: three bigger stepped blocks (1 centre tallest, 2 left, 3 right) with large numbers "1" "2" "3" on their front faces (canvas texture), bright colours (gold / silver / bronze trims on a candy base), a round stage disc underneath. Place the other 5 runners behind-and-beside the podium or in a row lower/further in front but off to the sides so they don't cover steps or top-3. Keep the landscape layout (podium on left half, table on right) and portrait layout (podium top, table bottom).

Afterwards: `node build.mjs`, confirm no console errors, print the measured AI finish-time results and a short summary.

# GROK TASK: 實作「童話衝刺」單檔遊戲 index.html

Work ONLY in the current directory (/workspace/tales-dash). Read PRODUCT.md and TICKET.md first. Create exactly one game file: `index.html` (all JS/CSS inline, no external requests, no CDN, no images/fonts downloaded). Do NOT touch any other directory. Do NOT start servers, tunnels, or git commit — the operator does that. You may run `node` for syntax checks (e.g. extract the script and run `node --check`).

## Legal / originality
Inspired by the GAMEPLAY and UI LAYOUT of the classic online running game TalesRunner, but 100% original: do not use its name, logos, character names, art, or audio anywhere in the file. Game title: 「童話衝刺」 (subtitle "Tales Dash"). All art drawn with canvas shapes/gradients; sound (optional) synthesized with WebAudio (short beeps for countdown/jump/boost/finish), muted until first user gesture.

## Tech
- One `<canvas>` filling the viewport (handle devicePixelRatio, resize, orientation change). Use a fixed logical world height (e.g. 540 units) scaled to fit screen height; camera follows the player horizontally. Must work both portrait (390x844) and landscape (844x390): in portrait, the game view should still be readable (scale so ~ that the visible world width is at least ~600 units; letterbox or larger zoom-out is fine). HUD/touch buttons can be DOM overlays or canvas-drawn; keep buttons >= 64px and away from safe-area edges (use env(safe-area-inset-*)).
- `<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">`, `touch-action:none`, prevent scroll/zoom/long-press selection. Multi-touch: holding right + tapping jump simultaneously must work (pointer events with pointerId tracking).
- requestAnimationFrame loop with fixed-timestep physics (e.g. 1/120s steps, clamp dt), so it is frame-rate independent.
- All UI text Traditional Chinese.

## Gameplay
- Side-scrolling platform race, left→right, track length ~ 60–90 s for a good run (e.g. ~9000–12000 world units).
- Player runner: original cute character (e.g. round-headed kid with a cape/hood), simple run animation (bobbing legs), jump pose.
- Controls: left/right move (with acceleration; running right is the main direction, left allowed), jump with double jump, dash/boost (hold/tap dash: big speed burst, consumes stamina bar that regenerates slowly). Keyboard: ←/→ or A/D move, Space/↑/W jump, Shift (either) or K dash, P/Esc pause, R restart.
- Track sections (hand-authored level data array): ground segments with gaps (pits), low obstacles to jump (e.g. mushrooms, stacked book blocks, candy fences), a spike/thorn-bush trap zone, jump pads (springy mushrooms that launch high), speed-boost pickups (stars) giving temporary speed, and at least one SHORTCUT: an upper floating-platform route reached by a jump pad that skips a long winding/slow section (e.g. a mud/slow zone below). Checkpoints (flags) every ~1/4 of track; finish gate (castle arch) at end.
- Falling into a pit (or touching thorn trap) → brief fade, respawn at last checkpoint, +2.0 s time penalty, show floating text「+2 秒」.
- Countdown 3-2-1-開跑！ before input is enabled; timer starts at 開跑.

## Modes (main menu)
Main menu screen (DOM overlay, bright fairy-tale style): title, two big buttons 「自己玩」 and 「同電腦鬥」, best time display 「最佳時間：xx.xx 秒」 (or 「最佳時間：未有紀錄」), and a short how-to section (「玩法」: ← → 移動、跳（可二段跳）、衝（用體力）、跌落坑洞會回到檢查點並加 2 秒、踩彈跳蘑菇走上層捷徑). In 同電腦鬥 mode allow choosing number of AI (3/4/5) — default 4.
1. 自己玩 (solo): timer, checkpoints, best time saved to localStorage key `talesdash_best`; results screen shows time, best, 「新紀錄！」 when beaten. Optional: none-interactive ghost not needed.
2. 同電腦鬥 (vs AI): 3–5 AI runners with original names (e.g. 小兔寶、南瓜仔、糖糖、星星妹、蘑菇叔), distinct colors, each with skill params: base speed, jump timing accuracy, probability to take the shortcut, probability to mistime a jump and fall into a pit (then respawn at checkpoint with same penalty), dash usage. AI should follow the same physics/level as the player (simple look-ahead: jump before gaps/obstacles, use jump pads when choosing shortcut). Make them competitive but beatable: fastest AI roughly equal to a decent player using dash. Live ranking computed by progress (x along track; finished runners ranked by finish time). When player finishes, keep AI running (or simulate remaining) until all finish or 20 s cap, then show results table: 名次 / 跑手 / 時間 (DNF shown as 「未完成」), player row highlighted. Also update best time from vs mode? No — best time only for solo.

## HUD (TalesRunner-like layout)
- Top-left: big rank indicator 「第1名」 with ordinal styling (solo mode: show checkpoint count e.g. 「檢查點 1/3」 instead, or 「單人」).
- Top-center: timer 「00:00.00」.
- Top (below timer) full-width horizontal track progress bar: start flag, checkpoint ticks, finish flag, a colored dot/head icon for each runner (player bigger with outline).
- Top-right: pause button 「❚❚」.
- Stamina bar near dash button or under rank.
- Bottom-left: ◀ ▶ buttons. Bottom-right: 「跳」 and 「衝」 buttons (衝 dimmed when stamina low).
- Pause overlay: 「繼續」「重新開始」「主選單」.
- Results overlay: 「再玩一次」「主選單」.

## Visual style
Bright cartoon fairy tale: sky gradient, parallax hills, clouds, candy trees, distant castle; ground with grass top and cookie/soil layers; particles for dust on landing, sparkle on boost, speed lines when dashing. Runners with outlines and name tags above AI.

## Test hook (required for automated verification)
Expose `window.__td` with:
- `state()` → returns `{screen:'menu'|'countdown'|'race'|'paused'|'results', mode:'solo'|'vs'|null, time:Number, runners:[{name, x, y, finished, finishTime, rank, isPlayer}], trackLength:Number}`
- `start(mode, aiCount)` → starts a race programmatically (same as clicking buttons).
- `autopilot(on)` → when true, the player is driven by the same AI logic (a strong skill profile) so an automated test can reach the finish.
- `timeScale(n)` → multiply simulation speed (e.g. 4) for quick tests; physics must stay stable (run more fixed substeps, not bigger steps).

## Quality
- No console errors. Keep code organized (sections: config, level, physics, AI, render, UI, input, audio). Aim for a polished, fun v1; ~1200–2000 lines is fine.
- After writing, syntax-check the JS with node and fix any errors. Finally print a short summary of what you built.

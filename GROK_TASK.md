# GROK TASK v2: 「童話衝刺」3D 背後視角賽跑（three.js）

Work ONLY in the current directory (/workspace/tales-dash). Read PRODUCT.md and TICKET.md first.
v1 (side-scroller, current index.html) is REJECTED — do not reuse its design; rebuild from scratch as a **3D behind-the-runner chase-camera race**.
Do NOT touch other directories. Do NOT start servers/tunnels, do NOT git commit, do NOT npm install (three@0.160.0 and esbuild are already in node_modules).

## Files you create
- `src/index.html` — full page: meta viewport, CSS, all DOM overlays (menu, HUD, touch controls, pause, results, rotate hint). It must contain EXACTLY these two script tags (the build relies on them):
  ```html
  <script type="importmap">{"imports":{"three":"../node_modules/three/build/three.module.js"}}</script>
  <script type="module" src="./game.js"></script>
  ```
  (place both at end of body). No other external requests (no CDN, no web fonts, no images).
- `src/game.js` — ES module, `import * as THREE from 'three';` All game code. Organize in sections: CONFIG, UTIL, TRACK, WORLD/DECOR, OBSTACLES, RUNNER MODEL, PHYSICS, AI, CAMERA, HUD, INPUT, AUDIO, GAME FLOW, TEST HOOK.
- Then run `node build.mjs` (already exists; do not modify) which writes the final single-file `index.html` (three tree-shaken + inlined). Also run `node --check` on an extracted copy if helpful. Fix any build errors.
- Note: esbuild bundles to IIFE, so do NOT use top-level await. Use `THREE.xxx` via the namespace import only.

## Originality (hard rule)
Inspired by the gameplay and HUD layout of TalesRunner, but 100% original: never write "TalesRunner", "跑Online", or any official character/map names. Title 「童話衝刺」 (subtitle "Tales Dash"). All art = three.js primitives + vertex colors / MeshToonMaterial or MeshLambertMaterial with a small gradientMap; sound = tiny WebAudio beeps (muted until first gesture).

## Rendering / performance (phone-first)
- `WebGLRenderer({antialias:true, powerPreference:'high-performance'})`, `setPixelRatio(Math.min(devicePixelRatio,2))`, NO shadow maps. Blob shadows = a shared transparent dark circle (CanvasTexture radial gradient) on a plane under each runner/ball, projected to the ground height below.
- Keep total triangles < 60k (log `renderer.info.render.triangles` in `__td.state()`). Low-segment spheres (12x8 etc.).
- Repeated things (hurdles, blocks, trees/mushrooms, candy posts, clouds, track-edge posts, boost pads) → `InstancedMesh`.
- Sky: large inverted sphere with vertex-color gradient (deep sky blue top → pale cyan/pink horizon) or scene.background gradient CanvasTexture; `scene.fog` (light) for depth. Hemisphere light + one directional light.
- Resize handler (window resize + orientationchange + visualViewport), camera aspect update.
- requestAnimationFrame with fixed-timestep simulation at 1/60 s (accumulator, clamp frame dt to 0.1 s); `timeScale` runs more fixed steps per frame, never bigger steps.

## Track (built in code)
- Centerline: `THREE.CatmullRomCurve3` through ~12–16 hand-placed points; gentle S-curves (left and right bends), mostly flat with some gentle slopes; total length ≈ 520–650 m so a good run (base speed ~8 m/s, dash ~11–12 m/s, boost pads 14 m/s) takes 60–90 s.
- Precompute a lookup table: for arc distance `s` (every 0.5 m) → position, tangent, right vector (horizontal, perpendicular to tangent), height. All gameplay uses track coordinates **(s, x, y)**: s = distance along track, x = lateral offset from centerline (−W/2..W/2, W = 7 m), y = height above the track surface. Convert to world with `pos(s) + right(s)*x + up*(trackHeight(s)+y)`.
- Road mesh: custom BufferGeometry ribbon extruded along the LUT (every ~1 m), with side skirts (a thick edge so it looks like a floating storybook road), vertex colors: alternating pastel stripes (candy colors) per section + white lane lines every 1.75 m, bright edge trims. Low rails/candy posts along edges (InstancedMesh) where there is no gap.
- Section layout (s ranges approximate; tune so it plays well):
  1. **Sky-drop start + boost straight** (0–120 m): runners spawn at y = 18 m in a 2x4 grid above the start and fall onto the track (mashing Jump while falling makes you fall faster; pressing dash within 150 ms of landing = landing dash burst). START arch (candy striped arch with flags). 3–4 **boost pads** (glowing arrow-chevron planes on the road; stepping on = speed 14 m/s for 1.2 s, flash). Checkpoint 1 at s=0.
  2. **Hurdle section** (120–260 m): rows of hurdles across the full width (instanced; white/red bars on posts, bar height ~0.8 m), rows every ~12–15 m, some rows with a 1-lane gap. Touching a hurdle bar while y < 0.9 → **knock-down**: tumble animation, speed 0 for 0.9 s then stand back up. Checkpoint 2 at section start (a flag gate).
  3. **Floating blocks over a gap** (260–380 m): the road ribbon STOPS (real gap, you can see clouds far below). Replace with candy blocks (box ~2.2x2.2 m top, instanced, bright yellow/orange/mint/pink) arranged in 2–3 lanes with ~1–2 m gaps you must jump; some **bob up/down**, some **wobble/tilt sideways**, some **vanish** on a timer (flash then disappear for 1.2 s, cycle ~3 s). Blocks are the only ground here. Falling below y = −6 → **respawn** at checkpoint 3 (section start) with a blue sparkle/fade, and the runner is frozen ~2 s total (penalty) — show 「跌落！+2 秒」 for the player. Camera goes higher & steeper here (≈ 4.5 m up, 35–40° down).
  4. **Rolling balls, swinging hammers, springs, sprint** (380–end): the road resumes. **Giant balls** (r ≈ 1.6 m, candy-striped) roll backwards down the track toward runners (spawn every ~2.5 s at random lanes ahead, move at −9 m/s in s, despawn behind); hit = knock-down. **Swinging hammers** (2–3): pendulum from an overhead frame, sweeping laterally across the road; hit = knock-down + small lateral push. **Spring boards** (2): step on → launch up (vy 13) and forward boost, can clear a low wall section. Then the final straight with a big GOAL arch (castle-style with towers + checkered banner). Checkpoint 4 at section start.
- Checkpoints: a thin arch/flag gate at each section start; passing it sets respawn point for that runner and shows 「檢查點」 toast for the player.
- Decor (cheap, instanced): giant mushrooms (stalk + spotted cap), lollipop trees, candy cane posts, cloud puffs (merged spheres), floating islands, a distant storybook castle made of cylinders + cones, hills around the track below; a large ground plane far below (grass) that is visible through the block-section gap; flags. Bright saturated palette.

## Runner model (chibi, all runners share geometry; different materials)
- Group: big head sphere (r 0.42), face details (two small black eye spheres, pink cheek discs) on the FRONT (+forward), torso capsule/cylinder, two arms and two legs as capsules pivoting from shoulder/hip groups, shoes, and a HAT that differs per runner (cone wizard hat, cap with brim, crown, bunny ears, beret, top hat, flower, horn...). Total height ~1.3 m. Name tag above AI heads (small sprite with canvas text) — optional; the player shows a small down-arrow marker.
- Animations (procedural): run = limbs swing ±50° at a rate ∝ speed, body bob; dash = lean forward + faster swing + small speed-line particles/trail; jump = arms up, legs tucked; double jump = forward flip (rotate 360° over 0.35 s); knock-down = tumble (fall backwards, roll) then get up; exhausted = hunched, slow wobble, sweat drop; idle/podium = wave/cheer.
- Runner faces along track tangent (plus small yaw toward lateral velocity).
- Player colors: red/white; 7 AI with distinct color + hat. Original AI names (Traditional Chinese), e.g. 小兔寶、南瓜仔、糖糖、星星妹、蘑菇叔、雪球、豆豆.

## Physics (per runner, in track coords)
- State: s, x, y, vs (forward speed), vx, vy, grounded, jumpsUsed, dashGauge(0..1), exhaustedT, knockT, boostT, landDashT, respawnT, finished, finishTime, checkpointIndex.
- Auto-run: target vs = 8 m/s (base; per-AI multiplier 0.9–1.05), accelerate 12 m/s², dash target 11.5 m/s, boost 14 m/s, landing-dash burst 12.5 m/s for 0.8 s.
- Steering: vx toward input*6 m/s (input −1..1), accel 30 m/s². Clamp |x| ≤ W/2 − 0.4 where there are rails; in the block gap section there are no rails (you can step off blocks and fall).
- Gravity −28 m/s², jump vy 9.5, double jump vy 8.5 (only one extra jump in the air). **Fast-fall**: while falling (vy<0) and in the air, each jump tap after the double jump adds vy −= 6 (max fall speed −30).
- Ground height = 0 on the road (y is relative to trackHeight(s)); over the gap ground = top of any block under (s,x) (moving blocks carry the runner), else none → fall.
- Dash: hold → drains 0.33/s; regen 0.08/s base, ×(1 + 0.25·(rank−1)) rubber-band for runners behind (both player and AI). Dash at gauge 0 → exhausted 1.5 s (speed 4 m/s, cannot dash/jump high), red flash on gauge.
- **Landing dash**: pressing dash within 150 ms after landing (or pressing it up to 150 ms before landing) → free burst (no gauge cost) + white/gold ring flash at feet + 「完美著地！」 small text for the player.
- Runner–runner light collision: circles r=0.45 in (s,x) plane; push apart along lateral axis mostly, slight speed exchange; faster runner bumping from behind nudges the slower one sideways.
- Finishing: s ≥ trackLength → finished, record time; runner keeps jogging slowly then stops past the GOAL.

## AI (7 runners) — same physics/inputs as player
- Per-AI profile: speedMul (0.92–1.04), reaction (0.08–0.30 s look-ahead delay), mistakeRate (0.03–0.18: chance to mistime a hurdle jump or a block jump), dashAggression, preferredLane.
- Behaviour: look ahead in s for hurdles → jump at the right distance (±error); in the block section pick the nearest reachable block ahead in a lane and steer to its center, jump across gaps (sometimes miss → fall → respawn); dodge balls by steering to a free lane when a ball is within ~20 m in the same lane; time hammer passes coarsely; use dash when gauge > 0.4 on straights, do landing dashes sometimes; wander lanes a bit; don't all bunch in one line.
- Make them competitive but beatable: a good player with dash+landing dash should usually win; the best AI finishes around 70–80 s.

## Camera
- PerspectiveCamera FOV 65 (dash → lerp to 72; landscape/portrait: in portrait (aspect < 1) raise FOV to ~78 so enough track is visible).
- Target position = runner world pos − forward*5 + up*3 (block section: −forward*6 + up*4.5), where forward = track tangent at runner's s smoothed (look-ahead average over s..s+4). lookAt = runner pos + forward*3 + up*0.5 so the runner sits horizontally centered, about 60–70% down the screen, tilt ≈ 25° down. Smooth with exponential lerp (k≈6/s position, 8/s look target). Don't follow the runner's jump height fully (follow 50% of y) so jumps read well.
- Pre-race sky drop: camera starts higher, follows the fall. Podium: separate camera shot.

## Game flow / screens
1. **Menu** (DOM over a slow-orbiting 3D idle scene of the track start with runners idling): title 「童話衝刺」 + "Tales Dash" subtitle, two big buttons 「自己玩」 and 「同電腦鬥」, 「最佳時間：01:12.34」 or 「最佳時間：未有紀錄」, short 「玩法」 box: 「自動向前跑・左邊拖動轉向・跳（空中再按二段跳，下墜連按加速落地）・按住衝刺（用衝刺計，用盡會力竭）・落地瞬間按衝刺＝著地衝刺」, keyboard hint line 「鍵盤：←→ 轉向　Space/Ctrl 跳　Z/Shift 衝刺　P 暫停」.
2. **Sky drop + countdown**: runners appear high above the start, a big 「3」「2」「1」「開跑！」 countdown in the center; runners are released at 3 and fall (drop lands around GO), timer starts at 開跑！. Input for steering/jump-mashing allowed during the fall; forward motion starts at 開跑！.
3. **Race** with HUD.
4. **Vs mode finish rule**: when the FIRST runner crosses GOAL, show a big top-center 10-second countdown 「10」…「1」 for everyone else; at 0 → 「TIME OVER」 banner; unfinished runners are DNF. If the player finishes, show 「GOAL!」 banner; the camera keeps following the player (or spectates) until the countdown ends or all finish.
   **Solo**: when player crosses GOAL → 「GOAL!」 → results after ~2 s.
5. **Results**: Vs → a 3D **podium** scene (three stepped cylinders labelled 1/2/3 with big numbers via canvas textures, confetti particles, top 3 runners standing and cheering on them, others standing in front) with a camera shot facing it, plus a DOM results table overlay: 名次 / 跑手 / 時間 (DNF → 「未完成」), player row highlighted, buttons 「再玩一次」「主選單」. Solo → podium not needed; show time, best time, 「新紀錄！」 when beaten (localStorage key `talesdash3d_best`), buttons.
6. **Pause**: button top-right (「❚❚」), overlay 「暫停」 with 「繼續」「重新開始」「回主選單」. P/Esc toggles. Auto-pause on `visibilitychange` hidden.
7. **Rotate hint**: in portrait (innerHeight > innerWidth) show a small dismissible pill at top-center 「轉橫手機，體驗更佳 ⟳」 (non-blocking; game stays playable).

## HUD (HTML overlay; layout like the reference, own style)
- Top-left: huge gold italic rank text with dark outline + gradient (「1st」「2nd」「3rd」「4th」…; in solo show 「單人」 small or hide rank and keep TIME), under it 「TIME 01:02.34」.
- Below: round portrait (a small CSS/canvas drawn face in the player color) surrounded by an **SVG circular dash-gauge ring** (blue; turns red + flashes when < 15%; grey when exhausted).
- Left column below the portrait: compact racer list (all 8 in vs, sorted by rank, colored dot + name; player highlighted).
- Bottom-center: **START ──── GOAL** progress bar (rounded, blue fill = player progress), small colored runner icons (dots/tiny heads) positioned at s/trackLength for every runner, player icon larger with a ▼ marker; checkpoint ticks.
- Center: countdown numbers, 「GOAL!」 / 「TIME OVER」 banners, toasts (「檢查點」「跌落！+2 秒」「完美著地！」「加速！」「力竭！」), a red vignette flash when dash gauge empty.
- Top-center (vs, after first finish): big 10-second countdown.
- Size HUD with clamp()/vmin so it fits both 844x390 and 390x844; respect `env(safe-area-inset-*)`.

## Input
- Pointer events with pointerId tracking (multi-touch). `touch-action:none`, prevent default on the game layer, no text selection / long-press menu / double-tap zoom.
- **Steer zone**: left half of screen (below the HUD top area). On pointerdown remember origin; horizontal drag dx maps to steer input = clamp(dx/60px, −1, 1); show a subtle virtual-joystick ring+knob at the touch origin. Release → 0.
- **Right-side buttons** (large ~78–96 px, semi-transparent round, bottom-right, safe-area aware): 「跳」 (bottom-right corner) and 「衝刺」 (up-left of it). 衝刺 is hold. Show gauge state (dim when exhausted).
- Keyboard: ←/→ (and A/D) steer, Space / Ctrl / ↑ / W jump, Z / Shift / X dash (hold), P / Esc pause, Enter starts from menu/results.

## Audio (optional, tiny)
WebAudio oscillator beeps: countdown, go, jump, land-dash, boost, knock, respawn, goal. Unlock on first gesture. No audio files.

## Test hook (required)
`window.__td = {`
- `state()` → `{screen:'menu'|'countdown'|'race'|'paused'|'results', mode:'solo'|'vs'|null, time, trackLength, section (1-4), countdown10 (number|null), triangles, fps, camera:{x,y,z}, player:{s,x,y,vs,grounded,dash,knocked,exhausted,respawning,finished}, runners:[{name, s, x, y, finished, finishTime, rank, isPlayer, dnf}] }`
- `start(mode)` → starts race like clicking the button.
- `autopilot(on)` → player driven by a strong AI profile (low mistakes) so tests can reach GOAL.
- `timeScale(n)` → more fixed substeps per frame (1..8).
- `teleport(s, x)` → move the player to track distance s (for testing sections); sets the checkpoint accordingly.
- `forceFall()` → drop the player into the gap/void so respawn can be tested (e.g. teleport into the block section at x off any block).
- `pause()` / `resume()`.
`}`

## Quality bar
- Must actually look like a bright 3D fairy-tale race viewed from behind the runner (like a kart/runner game), NOT a side view.
- No console errors or warnings in normal play. Clean, readable code; ~1800–2800 lines in game.js is fine.
- After writing: run `node build.mjs` and confirm it succeeds. Print a short summary of what you built and any known limitations.

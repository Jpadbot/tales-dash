# 開發紀錄 / Provenance

## v2（3D 背後視角，2026-09-30 HKT）
- Grok CLI：`grok update` → 已是最新 **grok 1.0.45 (c33bff361a6f) [alpha]**；`grok models` 預設 **grok-4.7**（另有 grok-4.7-build-fast、grok-4.6、grok-4.5）。
- 使用模式：**plain（非互動）**，`grok --prompt-file <file> --output-format plain -m grok-4.7 --always-approve`（此環境無可見桌面終端，未用 TUI）。
  1. 主要實作：`GROK_TASK.md` → `grok-run-v2.log`（約 70 分鐘）。Grok 寫了 `src/index.html`、`src/game.js`（全部遊戲程式：賽道、跑者模型、物理、AI、鏡頭、HUD、輸入、頒獎台、測試介面）。
  2. 修正 1：`GROK_FIX1.md` → `grok-run-v2-fix1.log`（直向鏡頭、橫向選單、頒獎台版面、GOAL 拱門、霧/顏色、檢查點拱門、teleport、滾球、camInfo）。
  3. 修正 2：`GROK_FIX2.md` → `grok-run-v2-fix2.log`（AI 平衡、頒獎台 1/2/3）。
- 代理（非 Grok）直接撰寫／修改：
  - `PRODUCT.md`、`TICKET.md`、`GROK_TASK.md`、`GROK_FIX1.md`、`GROK_FIX2.md`、`NOTES.md`、`build.mjs`（esbuild 打包並內嵌 three r160）、`package.json`、`.gitignore`。
  - `src/game.js` 小修：
    - 跨欄碰撞半寬 0.82 → 0.98（原本相鄰欄之間有縫，站在中線 x=0 會穿過所有欄）。
    - 每場隨機種子（原本 AI 失誤固定，每場結果一樣）；`__td.seed(n)` 可固定。
    - GOAL/START 橫額改為兩塊單面平面（背面文字不再左右反轉）。
    - 過終點慶祝鏡頭改為繞跑者環繞（原本直線移動會穿過角色）。
    - 鏡頭 lookUp 微調：橫向跑者約在畫面 60–62%，直向約 63–66%。
- 驗證腳本（repo 外）：`/workspace/agent-tools/pw/td3d-test.js`、`td3d-vsfull.js`、`mech.js`、`pcam.js`、`goalshot.js`（puppeteer-core + Chrome 無頭，`--use-angle=swiftshader --enable-unsafe-swiftshader`）。
- 建置：`npm i && node build.mjs` → 單一 `index.html`（約 567 KB，three.js r160 tree-shaken 內嵌，無外部請求）。
- 本地：`python3 -m http.server 4192 --bind 127.0.0.1`；公開預覽：cloudflared quick tunnel（見 PUBLIC_URL.txt，臨時網址）。

## v1（已棄用：橫向捲軸）
- Grok CLI 1.0.45 / grok-4.7 plain 一次完成（grok-run.log）。用家評為「完全唔係跑Online」，v2 全部重做。

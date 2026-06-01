# PROGRESS — Warhammer 40K《為了帝皇》

> 橫向卷軸動作遊戲，純前端單檔（`index.html`）。手機優先 + PWA。
> 線上：https://rai0603.github.io/warhammer40k/

---

## 專案結構

```
warhammer40k/
├── index.html      ← 唯一檔案（HTML + CSS + JS 全內嵌，~1095 行）
├── PROGRESS.md
└── README.md
```

**單檔架構**：所有邏輯、樣式、PWA manifest、Service Worker、音樂都內嵌在 `index.html`。
改任何東西只動這一個檔；GitHub Pages 從 `main` branch root 自動部署。

## 技術棧

| 項目 | 用法 |
|---|---|
| 渲染 | 原生 Canvas 2D，內部解析度 `VW=480 × VH=270`，等比縮放鋪滿螢幕（`resize()`）|
| 音樂/音效 | **Tone.js**（CDN），程式合成，無音檔。每關一首 8-bar loop + Boss 專曲 |
| PWA | inline blob manifest + Service Worker（離線快取自身），iOS standalone 全螢幕 |
| 操控 | 觸控按鈕（左下移動 / 右下動作鑽石佈局 + 武器切換）+ 鍵盤（`bindBtn`）|
| 版控/部署 | git → GitHub `rai0603/warhammer40k` → GitHub Pages（main root auto-deploy）|

## 遊戲設計現況（v1.0）

### 流程
`TITLE → PLAY ×5 關 → (每關 TRANS 過場) → VICTORY`，死亡進 `GAMEOVER`。狀態機在 `update()` / `state` 變數。

### 關卡（5 關，`level` 0–4）
- 敵血量逐關遞增：`ENEMY_HP_MULT=[1.00,1.10,1.21,1.27,1.33]`
- brute 出現率隨關卡 5%→17%
- 每關尾 Boss：

| 關 | Boss | HP |
|---|---|---|
| 1 | 噬肉巢母 DEVOURER BROODMOTHER | 4500 |
| 2 | 裂顎屠夫 RENDCLAW BUTCHER | 8000 |
| 3 | 瘟疫宿主 PLAGUEBOUND HERALD | 13600 |
| 4 | 影刃潛獵者 SHADOWBLADE STALKER | 24500 |
| 5 | （第 5 Boss，見 `BOSSES[]`）| — |

Boss 三階段（HP >66% / >33% / 其餘）行為切換。

### 武器（拾取「武器晶片」或能量滿 100 升級，上限 LV5）
**遠程 `RANGED[]`**：爆彈槍 BOLTER / 火焰槍 FLAMER（散射）/ 電磁砲 RAILGUN（穿透）/ 槍榴彈 GRENADE（拋射+範圍爆破，射速隨等級加快）
**近戰 `MELEE[]`**：動力劍 POWER SWORD / 動力錘 THUNDER HAMMER（高傷高擊退）/ 動力拳 POWER FIST

### 敵人 `spawnEnemy()`
`crawler / upright / infected / spitter / flyer(飛行)` + `brute`（重裝，會遠程+踩踏）

### 掉落物 `maybeDrop()` / `pickupDrop()`
HP+30 / 能量+40 / 護盾+40 / 武器晶片 / 彈藥強化(180f) / ★帝皇恩賜（無敵+雙倍火力 300f，稀有 1.5%）

### 玩家系統
HP、能量（滿 100 自動升級當前武器）、護盾（上限 60）、無敵幀 `inv`、祝福 `blessing`、分數 `score`。

---

## 程式碼地圖（`index.html` 行號，改動前先定位）

| 區塊 | 行號附近 | 函式 |
|---|---|---|
| PWA / manifest / SW | 99–126 | inline blob |
| 縮放 / 全螢幕 / 暫停 | 137–185 | `resize` `toggleFs` `togglePause` |
| 音樂引擎 | 200–336 | `buildTrack` `initAudio` `setMusic` `sfx` |
| 武器定義 | 339–351 | `RANGED` `MELEE` |
| 關卡 / 生怪 / Boss | 391–456 | `buildLevel` `spawnEnemy` `spawnBoss` `BOSSES` |
| 戰鬥 | 456–541 | `fireRanged` `doMelee` `damageEnemy` `damageBoss` `hurtPlayer` |
| 掉落 / 升級 | 519–535 | `maybeDrop` `checkUpgrade` `pickupDrop` |
| 主迴圈 | 544–714 | `update()` |
| 繪圖 | 715–1035 | `px` `drawMarine` `drawEnemy` `drawBoss` `drawHUD` `drawTitle` 等 |

---

## 待辦 / 點子（TODO）

- [ ] 第 5 Boss 名稱與機制確認 / 補完
- [x] 分數排行榜（localStorage 本地，存玩家手機）— ✅ 2026-05-30
- [ ] 難度選擇（影響 `ENEMY_HP_MULT` 與生怪密度）
- [ ] 真正的 PNG icon（目前 manifest icon 為程式生成）
- [ ] 開場操作教學 / 武器說明
- [ ] 觸控手感微調（移動慣性、跳躍判定）

---

## 開發備忘

- **本地預覽**：`python3 -m http.server 8000` 後開 `http://localhost:8000/`（Tone.js / SW 需 http 環境，直接開檔 file:// 部分功能會失效）
- **部署**：`git push` 到 `main` 即自動上線（GitHub Pages），約 1 分鐘生效
- **改完更新此檔**：每次新增功能 / 調平衡，更新上面「現況」與「TODO」

## 變更日誌

- **2026-05-30** — 初版上線：5 關 + 5 Boss、4 遠程 / 3 近戰武器、PWA、Tone.js 配樂。建立 git + GitHub Pages 部署。
- **2026-05-30** — 手機操控優化：左右方向鍵 58→76px、間距加倍；暫停/全螢幕鍵從貼邊改距邊 12%；右下動作叢集整體內縮(跳鍵離開圓角)、射擊↔近戰互換並等大放大為 70px。
- **2026-05-30** — 新增**開場角色選擇 (SELECT 狀態)**：5 軍團各有專屬配色 / 英雄名 / 初期加成；陸戰隊依軍團上色。
  - 極限戰士(藍/提圖斯)：最大生命+30｜血天使(紅/但丁)：近戰起始Lv3｜太空野狼(灰藍/羅根)：護盾+60 生命+10｜暗黑天使(綠/以西結)：爆彈槍起始Lv3｜帝國之拳(金/利西克斯)：電磁砲Lv2 能量+50
  - 操作：點卡片選、再點卡片或「確認出戰」鍵開打；鍵盤 ←→ 選 ENTER 出戰。加成在 `startGame()` 末套用(`LEGIONS[selLegion].apply`)、配色在 `drawMarine()`。
- **2026-05-30** — **本地排行榜**：每場結束 `recordScore()` 把(分數/關卡/軍團/勝負/日期)寫入 `localStorage['wh40k_scores_v1']`(存玩家手機)；GAMEOVER/VICTORY 以 `drawLeaderboard()` 顯示 Top5 + 新紀錄高亮。
- **2026-05-30** — **自動更新機制**：SW 從 inline blob(cache-first)改為獨立 `sw.js`(**network-first**：上線永遠最新、離線備援)。`index.html` 加 `<meta name="build">`，`checkBuild()` 每 2 分鐘比對線上版本，有新版跳「立即更新」橫幅。更新只清舊快取、**不動 localStorage 分數**。

> ⚠️ **部署慣例**：每次改 `index.html` 要 deploy 時，**手動把 `<meta name="build">` 的值改新**（如日期+流水號），否則開著遊戲的玩家不會收到更新提示。`sw.js` 若有改也順手 bump `const C='wh40k-vN'`。目前 build = **2026.06.01.1**。
- **2026-05-31** — **解析度 2×(960×540)** 地基 + **主角 sprite 重繪**(頭盔呼吸面罩/發光護目鏡/肩甲軍團徽+戰損/胸甲鷹徽/腹甲分段/膝甲護靴/純潔聖印)。
- **2026-05-31** — **大招量子光砲 + 2.5× 難度 + 魔王終極技**：同時長按近戰+遠程 1s 開始集氣(無法攻擊)、3s 滿→釋放穿透光砲(槍榴彈 5×)。右上集氣條滿時晃動+發光。敵人/魔王普攻 ×2.5(集中於 `hurtPlayer`)。魔王蓄力晃動 ~1s 後發射光砲(每關不同色，非主角紫)，為普攻 5×。全自包覆於 `pbeams/bbeams`，未動既有彈道/HUD。
- **2026-05-30** — **死亡音效**：`gameOver()` 觸發 `deathSfx()`，~2 秒下行哀號(D 小調)+低音下沉+終結重擊延音，用 `Tone.now()` 直接排程(不靠已停的 Transport)。
- **2026-05-30** — **開場/選角選單音樂**：新增 `MENU_SONG`(D 小調進行曲) + `buildMenuTrack()`，`setMusic('menu')`；`loop()` 在 TITLE/SELECT 且 audioReady 時自動播放，進 PLAY 由 `buildLevel()` 切回關卡曲。
  - ⚠️ 教訓：build .3 因 `setMusic` 字串比對沒中、`buildMenuTrack` 沒插進去但 `initAudio` 已呼叫它 → ReferenceError 開不了遊戲；build .4 修復。改字串前務必先讀到「真實」內容。
- **2026-05-31** — **大招當機修復 + HUD/按鈕重排 + ALL CLEAR 結局**（build .4）：
  - 🐛 修復釋放量子光砲時呼叫未定義的 `particle()` → ReferenceError 凍結整個 loop（連帶死亡不記分/無結局）；補上 `particle()` helper。
  - 集氣條移到**底部中央**(不擋近戰武器欄)；分數即時顯示**正上方中央**；暫停/全螢幕鍵移到上方靠中間 38%(不擋 HP/武器)。
  - 通關結局：動畫化 **ALL CLEAR** + 大型**戰鬥運輸艦**降臨→牽引主角上艦→起飛離去(`drawVictory`/`drawTransport`/`victoryT`)。
  - 敵人&魔王傷害倍率 2.5→**1.25**(降 50%)。
- **2026-05-31** — **大招改龜派氣功式波動拳**（build .5–.6）：量子光砲不再瞬發全螢幕，改為前進的大型能量波動(`drawWave`，寬約主角身高一半 r≈11)，速度比子彈(6.5)慢一點(主角 5.0/魔王 4.2)、穿透傷害。魔王大招驅動原誤用 `boss.intro`(undefined)→改全域 `bossIntro` 才真正會發動。魔王蓄力 **2 秒**(原地抖動)後才發射；拖尾加長至 `R*2.5`(主角魔王共用)。
- **2026-05-31** — **蹲下動作**（build .7–.9）：新增 `keys.down`/↓/S/手機「蹲」鈕(左下叢集)。地面按下→**深蹲**(上半身保持原形隨 `crD` 下沉、雙腿膝彎外張踏地，非壓扁)、鎖移動與跳但可攻擊；蹲下時子彈從降低槍口射出。跳起**落地遲滯**`landLag`(蹲姿、不能移動)。
- **2026-06-01** — 落地遲滯 0.2s→**0.3s**(`landLag=18`)（build .11）。
- **2026-06-01** — **音樂破音(clipping)修復**（build 2026.06.01.1）：末端加 `Limiter(-1dB)` 防削峰、壓縮器改 `-24,4`→接 Limiter、失真 0.32→**0.12**、kick -3→-8dB、hurt -2→-7dB、lead -17→-19dB 留 headroom。根因是無總限幅器 + 失真過重 + 鼓組音量太燙，多軌相加爆表。
- **build 版本進程**：目前線上 **2026.06.01.1**(`<meta name="build">` 與 `sw.js` C 版本)。

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
- [ ] 分數排行榜（localStorage 本地）
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

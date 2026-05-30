# 一人系統 ｜ solosystem.cc

> 不是更努力，是把工作和生活當系統來設計——一個真實經營者的系統實作紀錄。

本 repo 是 [solosystem.cc](https://solosystem.cc) 的原始碼：一個用 [Astro](https://astro.build) 建的靜態部落格，記錄一個同時經營事業與內容的人，怎麼用系統思維（與 AI 這個時代最強的槓桿）設計自己的工作與生活。

內容主軸（四 pillar）：

| Pillar | 主軸 | 狀態 |
|--------|------|------|
| ① AI 工作流 | 把 AI 從聊天工具變成工作基礎設施 | 連載中 |
| ② 工作術／系統 | 個人工作流、決策、思考習慣 | 規劃中 |
| ③ 經營心法 | 跨產業的經營／管理智慧 | 規劃中 |
| ④ 生活術／心法 | 一個人在這時代怎麼安排生活與心態 | 規劃中 |

---

## 技術選型

- **Astro** — 靜態網站生成；預設幾乎不送 JavaScript，Core Web Vitals 天生達標。
- **內容＝Markdown** — 文章是 `src/content/blog/` 下的 `.md`，內容與程式分離。
- **Cloudflare Pages** — 連 git 自動建置部署，免費 CDN、自動 HTTPS。
- **永續原則**：零持續成本（唯一花費是網域）、低維護摩擦（無資料庫／後台／外掛）、內容所有權（markdown 存在自己的 git）。

繁體中文（`lang="zh-Hant"`），鎖定台灣讀者。

---

## 本機開發

需求：Node 18+、npm。

```sh
npm install        # 安裝相依
npm run dev        # 本機預覽 http://localhost:4321
npm run build      # 產生正式站到 ./dist/
npm run preview    # 本機預覽 build 結果
```

---

## 專案結構

```text
├── public/                  靜態資產（favicon 等）
├── src/
│   ├── assets/              字型、圖片
│   ├── components/          Header / Footer / BaseHead（SEO head）等
│   ├── content/
│   │   └── blog/            ← 文章 markdown（內容就放這）
│   ├── content.config.ts    frontmatter schema（title/description/pubDate/pillar/tags…）
│   ├── layouts/             BlogPost 版型
│   ├── pages/               首頁、關於、blog 列表與文章路由、rss.xml
│   └── styles/global.css    全站樣式（簡潔置左、小字級、RWD）
├── astro.config.mjs         site 網址、sitemap、字型設定
└── package.json
```

---

## 新增一篇文章

1. 在 `src/content/blog/` 新增 `<slug>.md`，frontmatter：

   ```yaml
   ---
   title: '文章標題（含目標關鍵字）'
   description: '一句話描述，給搜尋結果與社群預覽用。'
   pubDate: '2026-06-06'
   pillar: 'AI 工作流'
   tags: ['關鍵字1', '關鍵字2']
   ---
   ```

2. 內文用 Markdown 撰寫（H2 問句、段首給結論、FAQ、內鏈）。
3. `npm run build` 本機驗證 → commit → `git push`。
4. Cloudflare Pages 自動建置上線。

> slug 即網址：`/blog/<slug>/`。用英文語意 slug。

---

## 部署

Cloudflare Pages 連本 repo，設定：

| 項目 | 值 |
|------|-----|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

自訂網域 `solosystem.cc`（Cloudflare 代管 DNS，自動簽 SSL）。
`astro.config.mjs` 的 `site` 必須與正式網域一致（影響 sitemap／RSS／canonical／Open Graph 的絕對網址）。

---

## 維護備忘

- **相依套件**：每季 `npm update` 一次即可（靜態站風險低）。
- **新鮮度**：改舊文時更新 frontmatter 的 `updatedDate`（SEO 訊號）。
- **隱私**：本站採半匿名創作，發布前確認內文不含可辨識的第三方資訊（同事、合作對象、患者等）。
- **建置產物**：`node_modules`、`dist`、`.astro` 已由 `.gitignore` 排除，git 只追蹤原始碼與內容。

---

版型基於 [Bear Blog](https://github.com/HermanMartinus/bearblog/) 的 Astro 範本，已大幅客製。

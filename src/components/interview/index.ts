// 「訪談解讀」版型用的 MDX 元件（2026-11-24 起；首篇 eisman-ai-bubble）。
// 一篇文章分成幾個分頁（主文／事件頁／參考文獻），內文用四種區塊：訪談摘譯、分析總結、查證、觀點與理論。
// 樣式在 interview.css，全部掛在 .iv 底下，只有用到 <Interview> 的文章會載入；架構圖 dg-* 沿用 styles/manual.css。

export { default as Interview } from './Interview.astro';
export { default as Page } from './Page.astro';
export { default as Say } from './Say.astro';
export { default as Ana } from './Ana.astro';
export { default as Chk } from './Chk.astro';
export { default as Theory } from './Theory.astro';

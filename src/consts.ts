// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = '一人系統 Solosystem';
export const SITE_DESCRIPTION =
	'不是更努力，是把工作和生活當系統來設計——一個橫跨多個事業的經營者，記錄怎麼用系統思維與 AI 設計自己的工作與生活。';
export const SITE_LANG = 'zh-Hant';

// 四大內容主軸（單一資料源：首頁卡片、pillar 頁、文章分區都讀這裡）
// key 必須與文章 frontmatter 的 `pillar` 值一致。
export interface Pillar {
	key: string; // 對應 frontmatter pillar 值
	slug: string; // 網址：/ai/、/work/…
	name: string; // 顯示名稱
	hook: string; // 副標
	order: number; // 排序
	active: boolean; // 是否已連載（false = 籌備中）
}

export const PILLARS: Pillar[] = [
	{ key: 'AI 工作流', slug: 'ai', name: 'AI 工作流', hook: '用 AI 放大一個人能做的事', order: 1, active: true },
	{ key: '工作系統', slug: 'work', name: '工作系統', hook: '把流程設計成會自己運轉的系統', order: 2, active: false },
	{ key: '經營心法', slug: 'ops', name: '經營心法', hook: '跨行業一通百通的經營直覺', order: 3, active: false },
	{ key: '生活設計', slug: 'life', name: '生活設計', hook: '把自己活成一套系統', order: 4, active: false },
];

export const getPillar = (key?: string): Pillar | undefined =>
	PILLARS.find((p) => p.key === key);

// 系列（單一資料源：系列專頁、/blog 分類入口、Header 下拉都讀這裡）
// key 必須與文章 frontmatter 的 `chapter` 值，或 `series[]` 陣列元素一致。
export interface Series {
	key: string; // 對應 frontmatter chapter 值 ＋ series[] 元素
	slug: string; // 網址：/series/<slug>/
	name: string; // 顯示名稱
	hook: string; // 副標
	order: number; // 排序
}

export const SERIES: Series[] = [
	{ key: '記憶篇', slug: 'memory', name: '記憶篇', hook: 'AI 的記憶，是要設計與維護的系統', order: 1 },
	{ key: '角色篇', slug: 'advisors', name: '角色篇', hook: '不是問 AI 問題，是啟動對的顧問', order: 2 },
	{ key: '思考習慣篇', slug: 'thinking', name: '思考習慣篇', hook: 'AI 攤開正反與盲點，裁決永遠在你', order: 3 },
	{ key: '自動化篇', slug: 'automation', name: '自動化篇', hook: '讓 AI 管理 AI——感知與維護外包，決策不外包', order: 4 },
	{ key: '進化篇', slug: 'evolution', name: '進化篇', hook: '矛盾、反省、進化——系統活著的證據', order: 5 },
	{ key: '建站實戰', slug: 'build', name: '建站實戰', hook: '不會寫程式，也能跟 AI 從零架一個自己的站', order: 6 },
	{ key: '多 session 工作法', slug: 'multi-session', name: '多 session 工作法', hook: '多開 Claude Code 並行，又不互相覆蓋', order: 7 },
];

export const getSeries = (key?: string): Series | undefined =>
	SERIES.find((s) => s.key === key);

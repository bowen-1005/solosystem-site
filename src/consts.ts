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

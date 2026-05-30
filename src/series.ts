import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'blog'>;

// 排程發佈：build 當下，pubDate 還沒到的文章一律隱藏（不建頁、不進列表/RSS/sitemap）。
// 到期後，由排程重建（GitHub Actions → Cloudflare Deploy Hook）觸發 build，文章自動現身。
export function filterPublished(posts: Post[]): Post[] {
	const now = Date.now();
	return posts.filter((p) => p.data.pubDate.valueOf() <= now);
}

// 系列閱讀順序：章節序 → EP 序 → 日期
export function sortBySeries(posts: Post[]): Post[] {
	return [...posts].sort((a, b) => {
		const ca = a.data.chapterNum ?? 999;
		const cb = b.data.chapterNum ?? 999;
		if (ca !== cb) return ca - cb;
		const ea = a.data.episode ?? 999;
		const eb = b.data.episode ?? 999;
		if (ea !== eb) return ea - eb;
		return a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
	});
}

export function sortByDateDesc(posts: Post[]): Post[] {
	return [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export interface ChapterGroup {
	chapterNum: number;
	chapter: string;
	posts: Post[];
}

// 依章節分組（已照系列順序）
export function groupByChapter(posts: Post[]): ChapterGroup[] {
	const sorted = sortBySeries(posts);
	const groups = new Map<number, ChapterGroup>();
	for (const p of sorted) {
		const cn = p.data.chapterNum ?? 999;
		if (!groups.has(cn)) {
			groups.set(cn, { chapterNum: cn, chapter: p.data.chapter ?? '其他', posts: [] });
		}
		groups.get(cn)!.posts.push(p);
	}
	return [...groups.values()].sort((a, b) => a.chapterNum - b.chapterNum);
}

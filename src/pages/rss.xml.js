import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { filterPublished, sortByDateDesc } from '../series';

const parser = new MarkdownIt({ html: true, linkify: true });

// MDX 文章（手冊版型）：RSS 用 markdown-it 轉，不認得元件。先拿掉 import 行，
// 把元件換成看得懂的粗體小標（標題、工具名、情境、步驟），其餘元件標籤直接拆掉、保留裡面的文字。
const LEVEL = { hi: '高', md: '中', lo: '低' };
const mdxToMarkdown = (src) =>
	src
		.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?[ \t]*$/gm, '')
		.replace(
			/<Flag\s+t="([^"]*)"(?:\s+en="([^"]*)")?\s*>([\s\S]*?)<\/Flag>/g,
			(_, t, en, d) => `- **${t}**${en ? `（${en}）` : ''}：${d.trim()}`
		)
		.replace(
			/<Scene\s+who="([^"]*)"\s+level="(\w+)"\s+note="([^"]*)"\s*>/g,
			(_, who, lv, note) => `**${who}**（退出難度${LEVEL[lv] ?? ''}；${note}）`
		)
		.replace(/<Tool\s+name="([^"]*)"(?:\s+en="([^"]*)")?\s*>/g, (_, n, en) => `**${n}${en ? `（${en}）` : ''}**`)
		.replace(/<Step\s+n="([^"]*)"\s+title="([^"]*)"\s*>/g, (_, n, t) => `**${n}. ${t}**`)
		.replace(/<(?:Panel|Meta|Callout)\s+title="([^"]*)"\s*>/g, (_, t) => `**${t}**`)
		.replace(/<Do>/g, '**有效做法**')
		.replace(/<Dont>/g, '**要避免**')
		.replace(/<\/?[A-Z][A-Za-z]*(\s[^>]*)?\/?>/g, '');

export async function GET(context) {
	const origin = context.site ? context.site.origin : 'https://solosystem.cc';
	const posts = sortByDateDesc(filterPublished(await getCollection('blog')));

	// 把 markdown 內文轉成 HTML 全文放進 RSS，並把站內相對連結/圖片改成絕對網址
	const toContent = (post) => {
		const body = post.body ?? '';
		const html = parser.render(post.filePath?.endsWith('.mdx') ? mdxToMarkdown(body) : body);
		const absolute = html.replace(/(href|src)="\/(?!\/)/g, `$1="${origin}/`);
		return sanitizeHtml(absolute, {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption']),
			allowedAttributes: {
				...sanitizeHtml.defaults.allowedAttributes,
				img: ['src', 'alt', 'title'],
				a: ['href', 'name', 'target', 'rel'],
			},
		});
	};

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		xmlns: { atom: 'http://www.w3.org/2005/Atom' },
		customData:
			'<language>zh-Hant</language>' +
			`<atom:link href="${new URL('rss.xml', context.site).href}" rel="self" type="application/rss+xml"/>`,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
			content: toContent(post),
		})),
	});
}

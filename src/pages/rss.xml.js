import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { filterPublished, sortByDateDesc } from '../series';

const parser = new MarkdownIt({ html: true, linkify: true });

export async function GET(context) {
	const origin = context.site ? context.site.origin : 'https://solosystem.cc';
	const posts = sortByDateDesc(filterPublished(await getCollection('blog')));

	// 把 markdown 內文轉成 HTML 全文放進 RSS，並把站內相對連結/圖片改成絕對網址
	const toContent = (post) => {
		const html = parser.render(post.body ?? '');
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

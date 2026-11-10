/**
 * rehype-manual：「手冊版型」的 build 階段轉換。
 *
 * 只在 frontmatter `look: 'manual'` 的文章生效（其他文章原樣輸出）。
 * markdown 原文不用改，照既有寫法辨識：
 *   > **你可以這樣說：** …      → 話術卡（話術放大、「（…）」說明縮小、「情境 →」變小標）
 *   > **思考重點：** …          → 淡青提示卡
 *   > ✕… / ✓…                 → 對比卡
 *   > 純文字引言（無粗體）        → 襯線引言
 *   表格                        → 圓角外框、手機可橫滑；表頭依四特質上色、「應對槓桿」列加底色
 *   整段斜體（文末說明）          → 灰色小字
 */

const TRAITS = [
	[/馬基維利/, 'tr-m'],
	[/自戀/, 'tr-n'],
	[/精神病態/, 'tr-p'],
	[/施虐/, 'tr-s'],
];

const isEl = (n, tag) => n && n.type === 'element' && (!tag || n.tagName === tag);
const isBlank = (n) => n && n.type === 'text' && !n.value.trim();
const text = (value) => ({ type: 'text', value });
const el = (tagName, className, children = []) => ({
	type: 'element',
	tagName,
	properties: className ? { className: [].concat(className) } : {},
	children,
});
const addClass = (n, c) => {
	n.properties = n.properties || {};
	const cur = n.properties.className || [];
	n.properties.className = [].concat(cur, c);
};
const textOf = (n) => {
	if (!n) return '';
	if (n.type === 'text') return n.value;
	return (n.children || []).map(textOf).join('');
};
const elementKids = (n) => (n.children || []).filter((c) => c.type === 'element');

/** 段落開頭若是粗體，回傳粗體節點 */
function leadStrong(p) {
	if (!isEl(p, 'p')) return null;
	for (const c of p.children) {
		if (isBlank(c)) continue;
		return isEl(c, 'strong') ? c : null;
	}
	return null;
}
function stripLeadStrong(p) {
	const s = leadStrong(p);
	if (!s) return;
	p.children.splice(p.children.indexOf(s), 1);
	const first = p.children[0];
	if (first && first.type === 'text') first.value = first.value.replace(/^\s+/, '');
}
const chip = (label) => el('span', 'm-chip', [text(label)]);
const onlyText = (p) => p.children.every((c) => c.type === 'text');

function sayBox(bq) {
	addClass(bq, 'm-say');
	const ps = elementKids(bq).filter((n) => isEl(n, 'p'));
	stripLeadStrong(ps[0]);
	for (const p of ps) {
		const t = textOf(p).trim();
		if (!t) {
			bq.children.splice(bq.children.indexOf(p), 1);
			continue;
		}
		if (onlyText(p) && /^（[\s\S]*）$/.test(t)) {
			addClass(p, 'm-why');
			p.children = [el('b', null, [text('為什麼這樣說')]), text(t.slice(1, -1))];
			continue;
		}
		const s = leadStrong(p);
		if (s) {
			const label = textOf(s).replace(/[：:]\s*$/, '');
			p.children[p.children.indexOf(s)] = el('span', 'm-sit', [text(label)]);
			const after = p.children[1];
			if (after && after.type === 'text') after.value = after.value.replace(/^\s+/, '');
			addClass(p, 'm-line');
			continue;
		}
		if (onlyText(p) && t.indexOf('→') > 0) {
			const i = t.indexOf('→');
			p.children = [el('span', 'm-sit', [text(t.slice(0, i).trim())]), text(t.slice(i + 1).trim())];
		}
		addClass(p, 'm-line');
	}
	bq.children.unshift(chip('你可以這樣說'));
}

function thinkBox(bq) {
	addClass(bq, 'm-think');
	stripLeadStrong(elementKids(bq)[0]);
	bq.children.unshift(chip('思考重點'));
}

function xoBox(bq) {
	addClass(bq, 'm-xo');
	for (const p of elementKids(bq)) {
		const t = textOf(p).trim();
		if (t.startsWith('✕')) addClass(p, 'm-x');
		if (t.startsWith('✓')) addClass(p, 'm-o');
	}
	bq.children.unshift(chip('對比'));
}

function blockquote(bq) {
	const first = elementKids(bq)[0];
	const lead = textOf(leadStrong(first)).trim();
	if (/^思考重點/.test(lead)) return thinkBox(bq);
	if (/^你可以這樣說/.test(lead)) return sayBox(bq);
	if (elementKids(bq).some((p) => /^[✕✓]/.test(textOf(p).trim()))) return xoBox(bq);
	const hasStrong = (n) => isEl(n, 'strong') || (n.children || []).some(hasStrong);
	if (!hasStrong(bq)) addClass(bq, 'm-pull');
}

function table(tb) {
	for (const th of findAll(tb, 'th')) {
		const t = textOf(th);
		const hit = TRAITS.find(([re]) => re.test(t));
		if (hit) addClass(th, hit[1]);
	}
	for (const tr of findAll(tb, 'tr')) {
		const firstCell = elementKids(tr)[0];
		if (/應對槓桿/.test(textOf(firstCell))) addClass(tr, 'm-lever');
	}
}

function findAll(node, tag, out = []) {
	for (const c of node.children || []) {
		if (isEl(c, tag)) out.push(c);
		findAll(c, tag, out);
	}
	return out;
}

function walk(parent) {
	const kids = parent.children || [];
	for (let i = 0; i < kids.length; i++) {
		const n = kids[i];
		if (isEl(n, 'blockquote')) {
			blockquote(n);
			continue;
		}
		if (isEl(n, 'table')) {
			table(n);
			const wrap = el('div', 'm-tbl', [n]);
			const hint = el('p', 'm-tbl-hint', [text('← 表格可左右滑動 →')]);
			kids.splice(i, 1, wrap, hint);
			i++;
			continue;
		}
		if (isEl(n, 'p')) {
			const ek = elementKids(n);
			if (ek.length === 1 && isEl(ek[0], 'em') && textOf(n).trim() === textOf(ek[0]).trim()) addClass(n, 'm-note');
		}
		if (n.children) walk(n);
	}
}

export default function rehypeManual() {
	return (tree, file) => {
		const fm = file?.data?.astro?.frontmatter;
		if (!fm || fm.look !== 'manual') return;
		walk(tree);
	};
}

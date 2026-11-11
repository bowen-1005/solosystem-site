/**
 * rehype-manual：「手冊版型」的 build 階段轉換。
 *
 * astro.config 以 { all: true } 掛上＝所有文章都套；不帶選項時只套 frontmatter `look: 'manual'` 的文章。
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

/** 引用框裡「一行一個粗體標籤」的軟換行段落，拆成一行一段（症狀／真因／解法、為什麼這樣說／接下來會發生…） */
function splitLabeledLines(bq) {
	const out = [];
	for (const n of bq.children) {
		if (!isEl(n, 'p')) {
			out.push(n);
			continue;
		}
		let cur = el('p', null, []);
		const parts = [cur];
		n.children.forEach((c, i) => {
			const next = n.children[i + 1];
			// 只在「粗體就是新一行的開頭」時才拆（換行後到粗體之間只有空白），否則原樣保留
			const nl = c.type === 'text' ? c.value.lastIndexOf('\n') : -1;
			if (nl >= 0 && isEl(next, 'strong') && !c.value.slice(nl + 1).trim()) {
				const idx = nl;
				const before = c.value.slice(0, idx);
				if (before) cur.children.push(text(before));
				cur = el('p', null, []);
				parts.push(cur);
				return;
			}
			cur.children.push(c);
		});
		parts.filter((q) => q.children.length).forEach((q) => out.push(q));
	}
	bq.children = out;
}

function opBox(bq) {
	addClass(bq, 'm-op');
	const ps = elementKids(bq).filter((n) => isEl(n, 'p'));
	const first = ps[0];
	const lead = textOf(leadStrong(first)).trim();
	// 有【實際操作】標題列就做成卡片標題；沒有（直接從「你這樣說」開始）就只放標籤
	const titled = /^【實際操作】/.test(lead);
	const head = el('div', 'm-op-title', titled ? [chip('實際操作'), text(lead.replace(/^【實際操作】\s*/, ''))] : [chip('實際操作')]);
	if (titled) bq.children[bq.children.indexOf(first)] = head;
	else bq.children.unshift(head);
	for (const p of titled ? ps.slice(1) : ps) {
		const s = leadStrong(p);
		if (!s) continue;
		const label = textOf(s).trim();
		const kind = /^▶/.test(label) ? 'chk' : /^(它|AI|Claude)/.test(label) ? 'ai' : /^你/.test(label) ? 'you' : '';
		if (!kind) continue;
		addClass(p, ['m-turn', `m-${kind}`]);
		p.children[p.children.indexOf(s)] = el('span', 'm-who', [text(label.replace(/[：:]\s*$/, ''))]);
		const after = p.children[1];
		if (after && after.type === 'text') after.value = after.value.replace(/^[\s：:]+/, '');
	}
}

/** 段落開頭若是「純文字標籤：」（非粗體，例如「你可以這樣對 AI 說：」），拿掉並回傳標籤 */
function stripLeadText(p, re) {
	const first = p && p.children[0];
	if (!first || first.type !== 'text') return '';
	const m = first.value.match(re);
	if (!m) return '';
	first.value = first.value.slice(m[0].length).replace(/^\s+/, '');
	if (!first.value) p.children.shift();
	return m[1];
}

const onlyText = (p) => p.children.every((c) => c.type === 'text');

function sayBox(bq, label = '你可以這樣說') {
	addClass(bq, 'm-say');
	const ps = elementKids(bq).filter((n) => isEl(n, 'p'));
	if (leadStrong(ps[0])) stripLeadStrong(ps[0]);
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
		const sl = textOf(s).trim();
		if (s && /^(為什麼這樣說|接下來會發生)/.test(sl)) {
			addClass(p, /^為/.test(sl) ? 'm-why' : 'm-next');
			p.children[p.children.indexOf(s)] = el('b', null, [text(sl.replace(/[：:]\s*$/, ''))]);
			const after = p.children[1];
			if (after && after.type === 'text') after.value = after.value.replace(/^[\s：:]+/, '');
			continue;
		}
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
	bq.children.unshift(chip(label));
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
	splitLabeledLines(bq);
	const first = elementKids(bq)[0];
	const lead = textOf(leadStrong(first)).trim();
	if (/^【實際操作】/.test(lead) || /^你這樣說/.test(lead)) return opBox(bq);
	if (/^思考重點/.test(lead)) return thinkBox(bq);
	if (/^你可以這樣說/.test(lead)) return sayBox(bq);
	const plainLabel = stripLeadText(first, /^(你可以這樣(?:對 ?AI ?)?說)[：:]?/);
	if (plainLabel) return sayBox(bq, plainLabel);
	if (elementKids(bq).some((p) => /^[✕✓]/.test(textOf(p).trim()))) return xoBox(bq);
	if (/^💡/.test(textOf(first).trim())) {
		addClass(bq, 'm-tip');
		return;
	}
	const hasStrong = (n) => isEl(n, 'strong') || (n.children || []).some(hasStrong);
	const ps = elementKids(bq);
	if (!hasStrong(bq) && ps.length === 1 && textOf(bq).trim().length < 160) return addClass(bq, 'm-pull');
	for (const p of ps) if (leadStrong(p)) addClass(p, 'm-kv');
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

/** options.all = true：不看 frontmatter，所有文章都套（2026-11-10 起全站預設，astro.config 這樣設） */
export default function rehypeManual(options = {}) {
	return (tree, file) => {
		const fm = file?.data?.astro?.frontmatter;
		if (!options.all && (!fm || fm.look !== 'manual')) return;
		walk(tree);
	};
}

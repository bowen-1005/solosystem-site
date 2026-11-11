// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import rehypeManual from './src/plugins/rehype-manual.mjs';

// https://astro.build/config
export default defineConfig({
	// 正式網域（2026-05-30 註冊）。影響 sitemap.xml、RSS、canonical、Open Graph 的絕對網址。
	// 若日後加掛 www 或改主網域，務必同步更新此處。
	site: 'https://solosystem.cc',
	integrations: [mdx(), sitemap()],
	markdown: {
		// 手冊版型（2026-11-10 起全站文章預設）：三標記引用框、表格自動轉成卡片
		rehypePlugins: [[rehypeManual, { all: true }]],
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			// Atkinson 只含拉丁字母，中文一律落到 fallback。
			// 明列繁中系統字型，避免 Windows/Android 拿到醜的預設 sans。
			fallbacks: ['PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', 'sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});

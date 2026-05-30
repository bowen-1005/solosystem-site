import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// 內容主軸（一人系統四 pillar）：'AI 工作流' / '工作系統' / '經營心法' / '生活設計'
			pillar: z.string().optional(),
			// 系列章節資訊（選填）：章節名、章節序號、EP 編號
			chapter: z.string().optional(),
			chapterNum: z.number().optional(),
			episode: z.number().optional(),
			tags: z.array(z.string()).optional(),
			heroImage: z.optional(image()),
		}),
});

export const collections = { blog };

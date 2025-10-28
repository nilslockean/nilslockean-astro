import { defineCollection, reference, z } from "astro:content";
import { file, glob } from "astro/loaders";

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
		}),
});

const portfolio = defineCollection({
	loader: glob({ base: "./src/content/portfolio", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			summary: z.string(),
			// Transform string to Date object
			date: z.coerce.date(),
			client: z.string().optional(),
			stack: z.array(reference("tools")),
			liveUrl: z.string().url().optional(),
			repoUrl: z.string().url().optional(),
			screenshot: image().optional(),
			featured: z.boolean().optional(),
			relatedCases: z.array(reference("cases")).optional(),
		}),
});

const cases = defineCollection({
	loader: glob({
		base: "./src/content/cases",
		pattern: "**/*.{md,mdx}",
	}),
	schema: z.object({
		title: z.string(),
		date: z.date(),
		summary: z.string(),
		portfolioItem: reference("portfolio").optional(),
		image: z.string().optional(),
	}),
});

const tools = defineCollection({
	loader: file("src/data/tools.json"),
	schema: z.object({
		title: z.string(),
		url: z.string().url(),
		icon: z.string().optional(),
	}),
});

export const collections = { blog, portfolio, cases, tools };

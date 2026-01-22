import { z } from "zod";

export const PAGE_TITLE_MAX_LENGTH = 30;
export const PAGE_DESCRIPTION_MAX_LENGTH = 300;

const descriptionSchema = z.preprocess((value) => {
	if (typeof value !== "string") {
		return value;
	}

	const trimmed = value.trim();
	return trimmed.length === 0 ? null : trimmed;
}, z
	.string()
	.trim()
	.max(PAGE_DESCRIPTION_MAX_LENGTH, `Description must be ${PAGE_DESCRIPTION_MAX_LENGTH} characters or less.`)
	.nullable()
	.optional());

export const pageDetailsSchema = z.object({
	pageId: z.string().min(1, "Page id is required."),
	title: z
		.string()
		.trim()
		.min(1, "Title is required.")
		.max(PAGE_TITLE_MAX_LENGTH, `Title must be ${PAGE_TITLE_MAX_LENGTH} characters or less.`),
	description: descriptionSchema,
});

export type PageDetailsInput = z.infer<typeof pageDetailsSchema>;

export type PageDetailsPayload = {
	title: string;
	description: string | null;
};

/**
 * Normalizes page details for persistence.
 */
export function normalizePageDetails(input: PageDetailsInput): PageDetailsPayload {
	const description = input.description?.trim() ?? null;

	return {
		title: input.title.trim(),
		description: description && description.length > 0 ? description : null,
	};
}

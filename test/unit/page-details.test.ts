import { describe, expect, it } from "vitest";

import {
	normalizePageDetails,
	PAGE_DESCRIPTION_MAX_LENGTH,
	PAGE_TITLE_MAX_LENGTH,
	pageDetailsSchema,
} from "../../app/service/pages/page-details";

describe("pageDetailsSchema", () => {
	it("accepts values at the maximum limits", () => {
		const parsed = pageDetailsSchema.safeParse({
			pageId: "page-1",
			title: "t".repeat(PAGE_TITLE_MAX_LENGTH),
			description: "d".repeat(PAGE_DESCRIPTION_MAX_LENGTH),
		});

		expect(parsed.success).toBe(true);
	});

	it("rejects values above the maximum limits", () => {
		const parsed = pageDetailsSchema.safeParse({
			pageId: "page-1",
			title: "t".repeat(PAGE_TITLE_MAX_LENGTH + 1),
			description: "d".repeat(PAGE_DESCRIPTION_MAX_LENGTH + 1),
		});

		expect(parsed.success).toBe(false);
	});
});

describe("normalizePageDetails", () => {
	it("trims and normalizes blank descriptions", () => {
		const normalized = normalizePageDetails({
			pageId: "page-2",
			title: "  Title  ",
			description: "   ",
		});

		expect(normalized).toEqual({ title: "Title", description: null });
	});
});

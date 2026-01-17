import { describe, expect, it } from "vitest";

import { ITEM_TYPES } from "@/constants/add-item-flow.data";

describe("ITEM_TYPES", () => {
	it("exposes unique item ids for tabs", () => {
		const ids = ITEM_TYPES.map((item) => item.id);

		expect(new Set(ids).size).toBe(ids.length);
		expect(ids).toContain("link");
	});
});

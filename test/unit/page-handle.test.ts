import { describe, expect, it } from "vitest";

import { formatPageHandle, handleSchema, HANDLE_ERROR_MESSAGE } from "../../app/service/pages/page-handle";

describe("handleSchema", () => {
	it("normalizes casing and validates allowed characters", () => {
		const parsed = handleSchema.safeParse("User123");

		expect(parsed.success).toBe(true);
		if (parsed.success) {
			expect(parsed.data).toBe("user123");
		}
	});

	it("rejects handles with invalid characters", () => {
		const parsed = handleSchema.safeParse("user-name");

		expect(parsed.success).toBe(false);
		if (!parsed.success) {
			expect(parsed.error.issues[0]?.message).toBe(HANDLE_ERROR_MESSAGE);
		}
	});
});

describe("formatPageHandle", () => {
	it("prefixes the handle for storage", () => {
		expect(formatPageHandle("User123")).toBe("@user123");
	});
});

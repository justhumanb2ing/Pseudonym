import { describe, expect, it } from "vitest";

import { getPageMediaValidationError, normalizeOptionalText, PAGE_MEDIA_MAX_BYTES, resolvePageMediaKind } from "@/service/pages/page-media";

describe("getPageMediaValidationError", () => {
	it("rejects files larger than 3MB", () => {
		const file = new File([new Uint8Array(PAGE_MEDIA_MAX_BYTES + 1)], "big.mp4", {
			type: "video/mp4",
		});

		expect(getPageMediaValidationError(file)).toBe("File size must be 3MB or less.");
	});

	it("accepts supported image types within limit", () => {
		const file = new File([new Uint8Array(16)], "ok.webp", {
			type: "image/webp",
		});

		expect(getPageMediaValidationError(file)).toBeNull();
	});

	it("accepts supported video types within limit", () => {
		const file = new File([new Uint8Array(16)], "ok.webm", {
			type: "video/webm",
		});

		expect(getPageMediaValidationError(file)).toBeNull();
	});

	it("rejects unsupported types", () => {
		const file = new File([new Uint8Array(16)], "doc.txt", {
			type: "text/plain",
		});

		expect(getPageMediaValidationError(file)).toBe("Unsupported file type. Use JPG, PNG, WEBP, GIF, MP4, or WEBM.");
	});
});

describe("resolvePageMediaKind", () => {
	it("detects image types by mime", () => {
		const file = new File([new Uint8Array(1)], "photo.jpg", {
			type: "image/jpeg",
		});

		expect(resolvePageMediaKind(file)).toBe("image");
	});

	it("detects video types by extension when mime is empty", () => {
		const file = new File([new Uint8Array(1)], "clip.mp4", {
			type: "",
		});

		expect(resolvePageMediaKind(file)).toBe("video");
	});
});

describe("normalizeOptionalText", () => {
	it("trims outer whitespace and returns null for empty values", () => {
		expect(normalizeOptionalText("   ")).toBeNull();
	});

	it("preserves inner whitespace while trimming outer whitespace", () => {
		expect(normalizeOptionalText(" hello   world ")).toBe("hello   world");
	});
});

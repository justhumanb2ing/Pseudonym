import { describe, expect, it } from "vitest";

import { createLinkSaver } from "../../app/service/links/save-link";

type SupabaseError = { message: string };

function createSupabaseStub({ linkError = null }: { linkError?: SupabaseError | null } = {}) {
	const calls = {
		fn: "",
		payload: null as Record<string, unknown> | null,
	};

	const supabase = {
		rpc: (fn: string, payload: Record<string, unknown>) => {
			calls.fn = fn;
			calls.payload = payload;
			return { error: linkError };
		},
	};

	return { supabase, calls };
}

describe("createLinkSaver", () => {
	it("crawls before saving the link item", async () => {
		const { supabase, calls } = createSupabaseStub();
		const crawlUrl = async () => ({
			normalizedUrl: "https://example.com",
			response: {
				ok: true,
				mode: "static",
				fallback: false,
				durationMs: 100,
				data: {
					title: "Example",
					description: "Desc",
					url: "https://example.com",
					site_name: "Example",
					image: "https://example.com/og.png",
					favicon: "https://example.com/favicon.ico",
				},
			},
		});
		const saveLink = createLinkSaver(Promise.resolve(supabase as never), {
			crawlUrl,
		});

		await saveLink({ pageId: "page-1", url: "example.com" });

		expect(calls.fn).toBe("add_page_item");
		expect(calls.payload).toEqual({
			p_page_id: "page-1",
			p_type: "link",
			p_is_active: true,
			p_config: {
				style: {
					layout: "compact",
				},
				data: {
					title: "Example",
					url: "https://example.com",
					description: "Desc",
					site_name: "Example",
					icon_url: "https://example.com/favicon.ico",
					image_url: "https://example.com/og.png",
				},
			},
		});
	});

	it("throws when the link save fails", async () => {
		const { supabase } = createSupabaseStub({
			linkError: { message: "boom" },
		});
		const crawlUrl = async () => ({
			normalizedUrl: "https://example.com",
			response: {
				ok: true,
				mode: "static",
				fallback: false,
				durationMs: 100,
				data: {
					title: "Example",
					description: null,
					url: "https://example.com",
					site_name: null,
					image: null,
					favicon: null,
				},
			},
		});
		const saveLink = createLinkSaver(Promise.resolve(supabase as never), {
			crawlUrl,
		});

		await expect(saveLink({ pageId: "page-2", url: "example.com", isActive: false })).rejects.toThrow("boom");
	});
});

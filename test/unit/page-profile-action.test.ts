import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it } from "vitest";

import {
	handleLinkRemove,
	handleLinkSave,
	handleLinkToggle,
	handleLinkUpdate,
	handlePageVisibility,
} from "../../app/service/pages/page-profile.action";
import type { Database } from "../../types/database.types";

describe("handleLinkSave", () => {
	const originalFetch = globalThis.fetch;
	const originalEndpoint = process.env.VITE_CRAWLER_SERVER_ENDPOINT;

	afterEach(() => {
		globalThis.fetch = originalFetch;
		if (originalEndpoint === undefined) {
			delete process.env.VITE_CRAWLER_SERVER_ENDPOINT;
		} else {
			process.env.VITE_CRAWLER_SERVER_ENDPOINT = originalEndpoint;
		}
	});

	it("returns field errors when the url is missing", async () => {
		const formData = new FormData();
		formData.set("pageId", "page-1");
		formData.set("url", "");

		const result = await handleLinkSave({
			formData,
			supabase: createSupabaseStub(),
		});

		expect(result.intent).toBe("link-save");
		expect(result.fieldErrors?.url).toBe("URL is required.");
	});

	it("returns success when link save succeeds", async () => {
		process.env.VITE_CRAWLER_SERVER_ENDPOINT = "https://crawler.test";
		const formData = new FormData();
		formData.set("pageId", "page-1");
		formData.set("url", "example.com");

		const { supabase, calls } = createSupabaseStub();
		const fetchCalls: Array<{ url: string; options?: RequestInit }> = [];
		globalThis.fetch = async (url, options) => {
			fetchCalls.push({ url: String(url), options });
			return {
				ok: true,
				status: 200,
				json: async () => ({
					ok: true,
					mode: "static",
					fallback: false,
					durationMs: 120,
					data: {
						title: "Example",
						description: "Desc",
						url: "https://example.com",
						site_name: "Example",
						image: null,
						favicon: null,
					},
				}),
			} as Response;
		};

		const result = await handleLinkSave({ formData, supabase });

		expect(result).toEqual({ success: true, intent: "link-save" });
		expect(fetchCalls[0]?.url).toBe("https://crawler.test/api/crawl?url=https%3A%2F%2Fexample.com&mode=auto");
		expect(calls.rpc).toEqual({
			fn: "add_page_item",
			payload: {
				p_page_id: "page-1",
				p_type: "link",
				p_is_active: true,
				p_config: {
					data: {
						title: "Example",
						url: "https://example.com",
						description: "Desc",
						site_name: "Example",
						icon_url: null,
						image_url: null,
					},
				},
			},
		});
	});
});

describe("handleLinkRemove", () => {
	it("returns field errors when the item id is missing", async () => {
		const formData = new FormData();
		formData.set("itemId", "");

		const result = await handleLinkRemove({
			formData,
			supabase: createSupabaseStub().supabase,
		});

		expect(result.intent).toBe("link-remove");
		expect(result.fieldErrors?.itemId).toBe("Item id is required.");
	});

	it("returns success when link remove succeeds", async () => {
		const formData = new FormData();
		formData.set("itemId", "item-1");

		const { supabase, calls } = createSupabaseStub();
		const result = await handleLinkRemove({ formData, supabase });

		expect(result).toEqual({ success: true, intent: "link-remove", itemId: "item-1" });
		expect(calls.delete).toEqual({
			table: "profile_items",
			column: "id",
			value: "item-1",
		});
	});
});

describe("handleLinkUpdate", () => {
	it("returns field errors when the url is missing", async () => {
		const formData = new FormData();
		formData.set("itemId", "item-1");
		formData.set("url", "");

		const result = await handleLinkUpdate({
			formData,
			supabase: createSupabaseStub().supabase,
		});

		expect(result.intent).toBe("link-update");
		expect(result.fieldErrors?.url).toBe("URL is required.");
	});

	it("returns field errors when the item id is missing", async () => {
		const formData = new FormData();
		formData.set("itemId", "");
		formData.set("url", "example.com");

		const result = await handleLinkUpdate({
			formData,
			supabase: createSupabaseStub().supabase,
		});

		expect(result.intent).toBe("link-update");
		expect(result.fieldErrors?.itemId).toBe("Item id is required.");
	});

	it("returns success when link update succeeds", async () => {
		const formData = new FormData();
		formData.set("itemId", "item-1");
		formData.set("title", "New Title");
		formData.set("url", "example.com");

		const { supabase, calls } = createSupabaseStub({
			config: {
				data: {
					title: "Old Title",
					url: "https://old.example.com",
					site_name: "Example",
				},
			},
		});
		const result = await handleLinkUpdate({ formData, supabase });

		expect(result).toEqual({ success: true, intent: "link-update", itemId: "item-1" });
		expect(calls.update).toEqual({
			table: "profile_items",
			payload: {
				config: {
					data: {
						title: "New Title",
						url: "https://example.com",
						site_name: "Example",
					},
				},
			},
			column: "id",
			value: "item-1",
		});
	});
});

describe("handleLinkToggle", () => {
	it("returns field errors when the active value is missing", async () => {
		const formData = new FormData();
		formData.set("itemId", "item-1");
		formData.set("isActive", "");

		const result = await handleLinkToggle({
			formData,
			supabase: createSupabaseStub().supabase,
		});

		expect(result.intent).toBe("link-toggle");
		expect(result.fieldErrors?.isActive).toBe("Active value is required.");
	});

	it("returns field errors when the item id is missing", async () => {
		const formData = new FormData();
		formData.set("itemId", "");
		formData.set("isActive", "true");

		const result = await handleLinkToggle({
			formData,
			supabase: createSupabaseStub().supabase,
		});

		expect(result.intent).toBe("link-toggle");
		expect(result.fieldErrors?.itemId).toBe("Item id is required.");
	});

	it("returns success when link toggle succeeds", async () => {
		const formData = new FormData();
		formData.set("itemId", "item-1");
		formData.set("isActive", "false");

		const { supabase, calls } = createSupabaseStub();
		const result = await handleLinkToggle({ formData, supabase });

		expect(result).toEqual({ success: true, intent: "link-toggle", itemId: "item-1" });
		expect(calls.update).toEqual({
			table: "profile_items",
			payload: { is_active: false },
			column: "id",
			value: "item-1",
		});
	});
});

describe("handlePageVisibility", () => {
	it("returns form errors when the visibility value is missing", async () => {
		const formData = new FormData();
		formData.set("pageId", "page-1");
		formData.set("isPublic", "");

		const result = await handlePageVisibility({
			formData,
			supabase: createSupabaseStub().supabase,
		});

		expect(result.intent).toBe("page-visibility");
		expect(result.formError).toBe("Visibility value is required.");
	});

	it("returns success when visibility update succeeds", async () => {
		const formData = new FormData();
		formData.set("pageId", "page-1");
		formData.set("isPublic", "true");

		const { supabase, calls } = createSupabaseStub();
		const result = await handlePageVisibility({ formData, supabase });

		expect(result).toEqual({ success: true, intent: "page-visibility" });
		expect(calls.update).toEqual({
			table: "pages",
			payload: { is_public: false },
			column: "id",
			value: "page-1",
		});
	});
});

function createSupabaseStub(options?: {
	deleteError?: string;
	updateError?: string;
	selectError?: string;
	config?: Record<string, unknown> | null;
}) {
	const calls = {
		rpc: null as { fn: string; payload: Record<string, unknown> } | null,
		delete: null as { table: string; column: string; value: string } | null,
		update: null as { table: string; payload: Record<string, unknown>; column: string; value: string } | null,
		select: null as { table: string; column: string; value: string } | null,
	};

	const supabase = {
		from: (table: string) => ({
			select: (_columns: string) => ({
				eq: (column: string, value: string) => ({
					maybeSingle: () => {
						calls.select = { table, column, value };
						return {
							data: { config: options?.config ?? null },
							error: options?.selectError ? { message: options.selectError } : null,
						};
					},
				}),
			}),
			delete: () => ({
				eq: (column: string, value: string) => {
					calls.delete = { table, column, value };
					return { error: options?.deleteError ? { message: options.deleteError } : null };
				},
			}),
			update: (payload: Record<string, unknown>) => ({
				eq: (column: string, value: string) => {
					calls.update = { table, payload, column, value };
					return { error: options?.updateError ? { message: options.updateError } : null };
				},
			}),
		}),
		rpc: (fn: string, payload: Record<string, unknown>) => {
			calls.rpc = { fn, payload };
			return { error: null };
		},
	} as unknown as SupabaseClient<Database>;

	return { supabase, calls };
}

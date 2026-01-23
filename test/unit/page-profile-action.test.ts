import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it } from "vitest";

import {
	handleLinkRemove,
	handleLinkSave,
	handleLinkToggle,
	handleLinkUpdate,
	handleItemsReorder,
	handleMapSave,
	handleMapUpdate,
	handlePageVisibility,
	handleSectionSave,
	handleSectionUpdate,
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
					style: {
						layout: "compact",
					},
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

describe("handleMapSave", () => {
	it("returns form errors when required values are missing", async () => {
		const formData = new FormData();
		formData.set("pageId", "");

		const result = await handleMapSave({
			formData,
			supabase: createSupabaseStub().supabase,
		});

		expect(result.intent).toBe("map-save");
		expect(result.formError).toBe("Page id is required.");
	});

	it("returns success when map save succeeds", async () => {
		const formData = new FormData();
		formData.set("pageId", "page-1");
		formData.set("lat", "37.571728994548224");
		formData.set("lng", "126.99115832321161");
		formData.set("zoom", "10.1");
		formData.set("caption", "City Center");

		const { supabase, calls } = createSupabaseStub();
		const result = await handleMapSave({ formData, supabase });

		expect(result).toEqual({ success: true, intent: "map-save" });
		expect(calls.rpc).toEqual({
			fn: "add_page_item",
			payload: {
				p_page_id: "page-1",
				p_type: "map",
				p_is_active: true,
				p_config: {
					style: {
						layout: "compact",
					},
					data: {
						url: "https://www.google.com/maps/@37.571728994548224,126.99115832321161,10.1z",
						caption: "City Center",
						lat: 37.571728994548224,
						lng: 126.99115832321161,
						zoom: 10.1,
					},
				},
			},
		});
	});
});

describe("handleMapUpdate", () => {
	it("returns form errors when required values are missing", async () => {
		const formData = new FormData();
		formData.set("itemId", "");

		const result = await handleMapUpdate({
			formData,
			supabase: createSupabaseStub().supabase,
		});

		expect(result.intent).toBe("map-update");
		expect(result.formError).toBe("Item id is required.");
	});

	it("returns success when map update succeeds", async () => {
		const formData = new FormData();
		formData.set("itemId", "item-1");
		formData.set("lat", "34.048051");
		formData.set("lng", "-118.254187");
		formData.set("zoom", "13");
		formData.set("caption", "Los Angeles");

		const { supabase, calls } = createSupabaseStub({
			config: {
				data: {
					caption: "Old",
					lat: 0,
					lng: 0,
					zoom: 1,
					url: "https://example.com",
				},
			},
		});
		const result = await handleMapUpdate({ formData, supabase });

		expect(result).toEqual({ success: true, intent: "map-update", itemId: "item-1" });
		expect(calls.update).toEqual({
			table: "profile_items",
			payload: {
				config: {
					data: {
						caption: "Los Angeles",
						lat: 34.048051,
						lng: -118.254187,
						zoom: 13,
						url: "https://www.google.com/maps/@34.048051,-118.254187,13z",
					},
				},
			},
			column: "id",
			value: "item-1",
		});
	});
});

describe("handleSectionSave", () => {
	it("returns field errors when the headline is missing", async () => {
		const formData = new FormData();
		formData.set("pageId", "page-1");
		formData.set("headline", "");

		const result = await handleSectionSave({
			formData,
			supabase: createSupabaseStub().supabase,
		});

		expect(result.intent).toBe("section-save");
		expect(result.fieldErrors?.headline).toBe("Headline is required.");
	});

	it("returns success when section save succeeds", async () => {
		const formData = new FormData();
		formData.set("pageId", "page-1");
		formData.set("headline", "About");

		const { supabase, calls } = createSupabaseStub();
		const result = await handleSectionSave({ formData, supabase });

		expect(result).toEqual({ success: true, intent: "section-save" });
		expect(calls.rpc).toEqual({
			fn: "add_page_item",
			payload: {
				p_page_id: "page-1",
				p_type: "section",
				p_is_active: true,
				p_config: {
					data: {
						headline: "About",
					},
				},
			},
		});
	});
});

describe("handleSectionUpdate", () => {
	it("returns field errors when the headline is missing", async () => {
		const formData = new FormData();
		formData.set("itemId", "item-1");
		formData.set("headline", "");

		const result = await handleSectionUpdate({
			formData,
			supabase: createSupabaseStub().supabase,
		});

		expect(result.intent).toBe("section-update");
		expect(result.fieldErrors?.headline).toBe("Headline is required.");
	});

	it("returns success when section update succeeds", async () => {
		const formData = new FormData();
		formData.set("itemId", "item-1");
		formData.set("headline", "New Headline");

		const { supabase, calls } = createSupabaseStub({
			config: {
				data: {
					headline: "Old Headline",
					title: "Other",
				},
			},
		});
		const result = await handleSectionUpdate({ formData, supabase });

		expect(result).toEqual({ success: true, intent: "section-update", itemId: "item-1" });
		expect(calls.update).toEqual({
			table: "profile_items",
			payload: {
				config: {
					data: {
						headline: "New Headline",
						title: "Other",
					},
				},
			},
			column: "id",
			value: "item-1",
		});
	});
});

describe("handleItemsReorder", () => {
	it("returns form error when page id is missing", async () => {
		const formData = new FormData();
		formData.append("orderedIds", "item-1");

		const result = await handleItemsReorder({
			formData,
			supabase: createSupabaseStub().supabase,
		});

		expect(result.intent).toBe("items-reorder");
		expect(result.formError).toBe("Page id is required.");
	});

	it("returns form error when ordered ids are missing", async () => {
		const formData = new FormData();
		formData.set("pageId", "page-1");

		const result = await handleItemsReorder({
			formData,
			supabase: createSupabaseStub().supabase,
		});

		expect(result.intent).toBe("items-reorder");
		expect(result.formError).toBe("At least one item is required.");
	});

	it("returns success when reorder succeeds", async () => {
		const formData = new FormData();
		formData.set("pageId", "page-1");
		formData.append("orderedIds", "item-1");
		formData.append("orderedIds", "item-2");

		const { supabase, calls } = createSupabaseStub();
		const result = await handleItemsReorder({ formData, supabase });

		expect(result).toEqual({ success: true, intent: "items-reorder" });
		expect(calls.rpc).toEqual({
			fn: "reorder_page_items",
			payload: { p_page_id: "page-1", p_ordered_ids: ["item-1", "item-2"] },
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

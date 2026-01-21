import { afterEach, describe, expect, it, vi } from "vitest";
import * as supabaseModule from "@/lib/supabase";
import { action } from "@/routes/($lang).studio.$handle.links";

afterEach(() => {
	vi.restoreAllMocks();
});

type SupabaseStub = {
	supabase: {
		rpc: (fn: string, payload: Record<string, unknown>) => { error: { message: string } | null };
	};
	calls: {
		rpc: { fn: string; payload: Record<string, unknown> } | null;
	};
};

function createSupabaseStub(): SupabaseStub {
	const calls = {
		rpc: null as { fn: string; payload: Record<string, unknown> } | null,
	};

	const supabase = {
		rpc: (fn: string, payload: Record<string, unknown>) => {
			calls.rpc = { fn, payload };
			return { error: null };
		},
	};

	return { supabase, calls };
}

describe("page items reorder action", () => {
	it("reorders items via rpc", async () => {
		const { supabase, calls } = createSupabaseStub();
		vi.spyOn(supabaseModule, "getSupabaseServerClient").mockResolvedValueOnce(
			supabase as unknown as Awaited<ReturnType<typeof supabaseModule.getSupabaseServerClient>>,
		);

		const formData = new URLSearchParams();
		formData.set("intent", "items-reorder");
		formData.set("pageId", "page-123");
		formData.append("orderedIds", "item-1");
		formData.append("orderedIds", "item-2");

		const request = new Request("http://localhost/en/user", {
			method: "POST",
			body: formData,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		const result = await action({
			request,
			params: { lang: "en" },
			context: {},
		} as Parameters<typeof action>[0]);

		expect(calls.rpc).toEqual({
			fn: "reorder_page_items",
			payload: { p_page_id: "page-123", p_ordered_ids: ["item-1", "item-2"] },
		});
		expect(result).toEqual({ success: true, intent: "items-reorder" });
	});
});

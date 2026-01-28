import { afterEach, describe, expect, it, vi } from "vitest";
import * as supabaseModule from "@/lib/supabase.server";
import { action } from "@/routes/studio.$handle.links";

afterEach(() => {
	vi.restoreAllMocks();
});

type SupabaseStub = {
	supabase: {
		from: (table: string) => {
			update: (payload: Record<string, unknown>) => {
				eq: (
					column: string,
					value: string,
				) => {
					error: { message: string } | null;
				};
			};
		};
	};
	calls: {
		table: string;
		payload: Record<string, unknown> | null;
		eq: { column: string; value: string };
	};
};

function createSupabaseStub(): SupabaseStub {
	const calls = {
		table: "",
		payload: null as Record<string, unknown> | null,
		eq: { column: "", value: "" },
	};

	const supabase = {
		from: (table: string) => ({
			update: (payload: Record<string, unknown>) => {
				calls.table = table;
				calls.payload = payload;
				return {
					eq: (column: string, value: string) => {
						calls.eq = { column, value };
						return { error: null };
					},
				};
			},
		}),
	};

	return { supabase, calls };
}

describe("page details action", () => {
	it("updates page details using normalized values", async () => {
		const { supabase, calls } = createSupabaseStub();
		vi.spyOn(supabaseModule, "getSupabaseServerClient").mockResolvedValueOnce(
			supabase as unknown as Awaited<ReturnType<typeof supabaseModule.getSupabaseServerClient>>,
		);

		const formData = new URLSearchParams();
		formData.set("intent", "page-details");
		formData.set("pageId", "page-123");
		formData.set("title", "  My Page  ");
		formData.set("description", "   ");

		const request = new Request("http://localhost/user", {
			method: "POST",
			body: formData,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		const result = await action({
			request,
			params: { handle: "@user" },
			context: {},
		} as Parameters<typeof action>[0]);

		expect(calls.table).toBe("pages");
		expect(calls.payload).toEqual({ title: "My Page", description: null });
		expect(calls.eq).toEqual({ column: "id", value: "page-123" });
		expect(result).toEqual({ success: true, intent: "page-details" });
	});
});

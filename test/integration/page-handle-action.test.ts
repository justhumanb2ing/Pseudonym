import { afterEach, describe, expect, it, vi } from "vitest";
import { getAuth } from "@clerk/react-router/server";
import * as supabaseModule from "@/lib/supabase";
import { action } from "@/routes/($lang).studio.$handle.handle";

vi.mock("@clerk/react-router/server", () => ({
	getAuth: vi.fn(),
}));

type SupabaseStub = {
	supabase: {
		from: (table: string) => {
			select: (columns: string) => {
				eq: (column: string, value: string) => {
					maybeSingle: () => Promise<{ data: { id: string; handle: string; owner_id: string } | null; error: { message: string } | null }>;
					neq: (column: string, value: string) => {
						maybeSingle: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
					};
				};
			};
			update: (payload: Record<string, unknown>) => {
				eq: (column: string, value: string) => {
					error: { message: string } | null;
				};
			};
		};
	};
	calls: {
		update: { table: string; payload: Record<string, unknown> | null; eq: { column: string; value: string } };
	};
};

function createSupabaseStub(): SupabaseStub {
	const calls = {
		update: { table: "", payload: null as Record<string, unknown> | null, eq: { column: "", value: "" } },
	};

	const selectResponses: Array<{ data: { id: string; handle: string; owner_id: string } | null; error: { message: string } | null }> = [
		{ data: { id: "page-1", handle: "@old", owner_id: "user-1" }, error: null },
		{ data: null, error: null },
	];

	const supabase = {
		from: (table: string) => ({
			select: (_columns: string) => ({
				eq: (_column: string, _value: string) => ({
					maybeSingle: async () => selectResponses.shift() ?? { data: null, error: null },
					neq: (_neqColumn: string, _neqValue: string) => ({
						maybeSingle: async () => selectResponses.shift() ?? { data: null, error: null },
					}),
				}),
			}),
			update: (payload: Record<string, unknown>) => ({
				eq: (column: string, value: string) => {
					calls.update = { table, payload, eq: { column, value } };
					return { error: null };
				},
			}),
		}),
	};

	return { supabase, calls };
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("handle settings action", () => {
	it("updates the handle and redirects", async () => {
		const { supabase, calls } = createSupabaseStub();
		vi.spyOn(supabaseModule, "getSupabaseServerClient").mockResolvedValueOnce(
			supabase as unknown as Awaited<ReturnType<typeof supabaseModule.getSupabaseServerClient>>,
		);
		vi.mocked(getAuth).mockResolvedValueOnce({ userId: "user-1" } as Awaited<ReturnType<typeof getAuth>>);

		const formData = new URLSearchParams();
		formData.set("handle", "NewHandle");

		const request = new Request("http://localhost/en/studio/@old/handle", {
			method: "POST",
			body: formData,
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
		});

		const result = await action({
			request,
			params: { lang: "en", handle: "@old" },
			context: {},
		} as Parameters<typeof action>[0]);

		expect(calls.update).toEqual({
			table: "pages",
			payload: { handle: "@newhandle" },
			eq: { column: "id", value: "page-1" },
		});
		expect(result.headers.get("Location")).toBe("/en/studio/@newhandle/handle");
	});
});

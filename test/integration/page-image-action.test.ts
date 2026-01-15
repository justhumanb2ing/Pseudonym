import { describe, expect, it, vi } from "vitest";

import { getAuth } from "@clerk/react-router/server";
import { action } from "@/routes/($lang).$handle._index";
import { getSupabaseServerClient } from "@/lib/supabase";

vi.mock("@clerk/react-router/server", () => ({
  getAuth: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: vi.fn(),
}));

type SupabaseStub = {
  supabase: {
    from: (table: string) => {
      update: (payload: Record<string, unknown>) => {
        eq: (
          column: string,
          value: string
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

describe("page image action", () => {
  it("updates the page image url", async () => {
    const { supabase, calls } = createSupabaseStub();
    vi.mocked(getSupabaseServerClient).mockResolvedValueOnce(
      supabase as unknown as Awaited<ReturnType<typeof getSupabaseServerClient>>
    );
    vi.mocked(getAuth).mockResolvedValueOnce({ userId: "user-1" } as Awaited<
      ReturnType<typeof getAuth>
    >);

    const formData = new FormData();
    formData.set("intent", "update-image");
    formData.set("pageId", "page-123");
    formData.set("imageUrl", "https://cdn.example.com/avatar.png");

    const request = new Request("http://localhost/en/user", {
      method: "POST",
      body: formData,
    });

    const result = await action({
      request,
      params: { lang: "en" },
      context: {},
    } as Parameters<typeof action>[0]);

    expect(calls.table).toBe("pages");
    expect(calls.payload).toEqual({
      image_url: "https://cdn.example.com/avatar.png",
    });
    expect(calls.eq).toEqual({ column: "id", value: "page-123" });
    expect(result).toEqual({ success: true, intent: "update-image" });
  });

  it("clears the page image url", async () => {
    const { supabase, calls } = createSupabaseStub();
    vi.mocked(getSupabaseServerClient).mockResolvedValueOnce(
      supabase as unknown as Awaited<ReturnType<typeof getSupabaseServerClient>>
    );
    vi.mocked(getAuth).mockResolvedValueOnce({ userId: "user-1" } as Awaited<
      ReturnType<typeof getAuth>
    >);

    const formData = new FormData();
    formData.set("intent", "remove-image");
    formData.set("pageId", "page-123");

    const request = new Request("http://localhost/en/user", {
      method: "POST",
      body: formData,
    });

    const result = await action({
      request,
      params: { lang: "en" },
      context: {},
    } as Parameters<typeof action>[0]);

    expect(calls.table).toBe("pages");
    expect(calls.payload).toEqual({ image_url: null });
    expect(calls.eq).toEqual({ column: "id", value: "page-123" });
    expect(result).toEqual({ success: true, intent: "remove-image" });
  });
});

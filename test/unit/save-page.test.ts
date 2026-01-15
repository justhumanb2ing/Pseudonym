import { describe, expect, it } from "vitest";

import { createPageSaver } from "../../app/service/pages/save-page";

type SupabaseError = { message: string };

function createSupabaseStub({
  pageError = null,
  layoutError = null,
}: {
  pageError?: SupabaseError | null;
  layoutError?: SupabaseError | null;
} = {}) {
  const calls = {
    table: "",
    payload: null as Record<string, unknown> | null,
    eq: { column: "", value: "" },
    rpc: { fn: "", payload: null as Record<string, unknown> | null },
  };

  const supabase = {
    from: (table: string) => ({
      update: (payload: Record<string, unknown>) => {
        calls.table = table;
        calls.payload = payload;
        return {
          eq: (column: string, value: string) => {
            calls.eq = { column, value };
            return { error: pageError };
          },
        };
      },
    }),
    rpc: (fn: string, payload: Record<string, unknown>) => {
      calls.rpc = { fn, payload };
      return { error: layoutError };
    },
  };

  return { supabase, calls };
}

describe("createPageSaver", () => {
  it("normalizes the update payload and targets the page id", async () => {
    const { supabase, calls } = createSupabaseStub();
    const savePage = createPageSaver(Promise.resolve(supabase as never));

    await savePage({
      pageId: "page-123",
      title: null,
      description: null,
      image_url: null,
      layout: null,
    });

    expect(calls.table).toBe("pages");
    expect(calls.payload).toEqual({
      title: "",
      description: null,
      image_url: null,
    });
    expect(calls.eq).toEqual({ column: "id", value: "page-123" });
    expect(calls.rpc).toEqual({
      fn: "save_page_layout",
      payload: { p_layout: null, p_page_id: "page-123" },
    });
  });

  it("throws when the update fails", async () => {
    const { supabase } = createSupabaseStub({ pageError: { message: "boom" } });
    const savePage = createPageSaver(Promise.resolve(supabase as never));

    await expect(
      savePage({
        pageId: "page-999",
        title: "Title",
        description: "Desc",
        image_url: "https://example.com/image.png",
        layout: null,
      })
    ).rejects.toThrow("boom");
  });
});

import { describe, expect, it } from "vitest";

import {
  createPageGridBrick,
  parsePageLayoutSnapshot,
  serializePageLayout,
  type PageGridBrick,
  type PageLayoutSnapshot,
} from "../../app/service/pages/page-grid";

function buildSampleBricks(): PageGridBrick[] {
  const first = createPageGridBrick({
    id: "brick-1",
    type: "text",
    status: "ready",
    payload: { text: "Hello world" },
  });

  const second = createPageGridBrick({
    id: "brick-2",
    type: "link",
    status: "ready",
    payload: { url: "https://example.com" },
  });

  return [first, second];
}

describe("parsePageLayoutSnapshot", () => {
  it("returns empty array for null or malformed layouts", () => {
    expect(parsePageLayoutSnapshot(null)).toEqual([]);
    expect(parsePageLayoutSnapshot("{")).toEqual([]);
  });

  it("rehydrates a serialized layout", () => {
    const bricks = buildSampleBricks();
    const layout = serializePageLayout(bricks);
    if (!layout) {
      throw new Error("expected a layout snapshot");
    }

    const parsed = parsePageLayoutSnapshot(layout);

    expect(parsed).toHaveLength(bricks.length);
    expect(parsed[0].id).toBe(bricks[0].id);
    expect(parsed[0].data).toEqual(bricks[0].data);
    expect(parsed.every((brick) => brick.status === "ready")).toBe(true);
  });

  it("supports layouts serialized as JSON strings", () => {
    const bricks = buildSampleBricks();
    const layout = serializePageLayout(bricks);
    if (!layout) {
      throw new Error("expected a layout snapshot");
    }

    const layoutString = JSON.stringify(layout);
    const parsed = parsePageLayoutSnapshot(layoutString);

    expect(parsed).toHaveLength(bricks.length);
    expect(parsed.map((brick) => brick.id)).toEqual(
      bricks.map((brick) => brick.id)
    );
  });

  it("accepts legacy objects with a bricks array", () => {
    const bricks = buildSampleBricks();
    const layout = serializePageLayout(bricks);
    if (!layout) {
      throw new Error("expected a layout snapshot");
    }

    const legacyLayout = { bricks: layout } as { bricks: PageLayoutSnapshot };
    const parsed = parsePageLayoutSnapshot(legacyLayout);

    expect(parsed).toHaveLength(bricks.length);
    expect(parsed[0].data).toEqual(bricks[0].data);
  });
});

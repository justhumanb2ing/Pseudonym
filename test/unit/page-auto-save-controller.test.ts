import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";

import {
  usePageAutoSaveController,
  usePageAutoSaveActions,
  usePageAutoSaveState,
} from "@/hooks/page/use-page-auto-save-controller";
import type { PageSavePayload, PageSnapshot } from "../../app/service/pages/save-page";

const mockSavePage = vi.fn(async (_payload: PageSavePayload) => undefined);

vi.mock("es-toolkit", async () => {
  const actual = await vi.importActual<typeof import("es-toolkit")>(
    "es-toolkit"
  );

  return {
    ...actual,
    debounce: (fn: (...args: unknown[]) => void) => {
      const immediate = (...args: unknown[]) => fn(...args);
      immediate.cancel = () => {};
      return immediate;
    },
  };
});

vi.mock("@/hooks/use-page-saver", () => ({
  usePageSaver: () => mockSavePage,
}));

const initialSnapshot: PageSnapshot = {
  title: "First",
  description: null,
  image_url: null,
  layout: null,
};

function AutoSaveHarness({ nextTitle }: { nextTitle: string }) {
  const actions = usePageAutoSaveActions();
  const state = usePageAutoSaveState();

  return createElement(
    "div",
    null,
    createElement(
      "button",
      {
        type: "button",
        onClick: () => actions.updateDraft({ title: nextTitle }),
      },
      "Update title"
    ),
    createElement("div", { "data-testid": "status" }, state.status),
    createElement("div", { "data-testid": "label" }, state.statusLabel),
    createElement("div", { "data-testid": "message" }, state.message ?? "")
  );
}

function AutoSaveControllerHarness({
  pageId,
  initialSnapshot,
  debounceMs,
  enabled,
  nextTitle,
}: {
  pageId: string;
  initialSnapshot: PageSnapshot;
  debounceMs?: number;
  enabled?: boolean;
  nextTitle: string;
}) {
  usePageAutoSaveController({
    pageId,
    initialSnapshot,
    debounceMs,
    enabled,
  });

  return createElement(AutoSaveHarness, { nextTitle });
}

describe("PageAutoSaveController", () => {
  beforeEach(() => {
    mockSavePage.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("saves a changed snapshot and reports synced", async () => {
    const user = userEvent.setup();

    render(
      createElement(AutoSaveControllerHarness, {
        pageId: "page-1",
        initialSnapshot,
        debounceMs: 200,
        nextTitle: "Updated title",
      })
    );

    await user.click(screen.getByRole("button", { name: /update title/i }));

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("synced")
    );
    expect(mockSavePage).toHaveBeenCalledWith({
      pageId: "page-1",
      title: "Updated title",
      description: null,
      image_url: null,
      layout: null,
    });
    expect(screen.getByTestId("label")).toHaveTextContent("Up to date");
  });

  it("stays idle when the snapshot is unchanged", async () => {
    const user = userEvent.setup();

    render(
      createElement(AutoSaveControllerHarness, {
        pageId: "page-1",
        initialSnapshot,
        debounceMs: 200,
        nextTitle: "First",
      })
    );

    await user.click(screen.getByRole("button", { name: /update title/i }));

    expect(mockSavePage).not.toHaveBeenCalled();
    expect(screen.getByTestId("status")).toHaveTextContent("idle");
  });

  it("surfaces the save error message", async () => {
    mockSavePage.mockRejectedValueOnce(new Error("Save failed"));
    const user = userEvent.setup();

    render(
      createElement(AutoSaveControllerHarness, {
        pageId: "page-1",
        initialSnapshot,
        debounceMs: 200,
        nextTitle: "Another title",
      })
    );

    await user.click(screen.getByRole("button", { name: /update title/i }));

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("error")
    );
    expect(screen.getByTestId("message")).toHaveTextContent("Save failed");
  });
});

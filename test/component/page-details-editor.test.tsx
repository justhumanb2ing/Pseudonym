import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import PageDetailsEditor from "@/components/page/page-details-editor";
import {
  PAGE_DESCRIPTION_MAX_LENGTH,
  PAGE_TITLE_MAX_LENGTH,
} from "@/service/pages/page-details";

let isDesktop = true;

afterEach(() => {
  cleanup();
});

beforeAll(() => {
  if (typeof window.matchMedia === "function") {
    return;
  }

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

vi.mock("@/hooks/use-media-query", () => ({
  useMediaQuery: () => isDesktop,
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>(
    "react-router"
  );

  return {
    ...actual,
    useFetcher: () => ({
      Form: ({
        children,
        ...props
      }: React.ComponentPropsWithoutRef<"form">) => (
        <form {...props}>{children}</form>
      ),
      state: "idle",
      data: undefined,
    }),
  };
});

describe("PageDetailsEditor", () => {
  it("renders a dialog editor on desktop with length limits", async () => {
    isDesktop = true;
    const user = userEvent.setup();

    render(
      <PageDetailsEditor
        pageId="page-1"
        title="My Page"
        description="Hello"
        isOwner={true}
      />
    );

    await user.click(screen.getByRole("button", { name: "My Page" }));

    const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(
      "Description"
    ) as HTMLTextAreaElement;

    expect(document.querySelector("[data-slot='dialog-content']")).not.toBeNull();
    expect(titleInput.maxLength).toBe(PAGE_TITLE_MAX_LENGTH);
    expect(descriptionInput.maxLength).toBe(PAGE_DESCRIPTION_MAX_LENGTH);

    await waitFor(() =>
      expect(
        screen.getByText(
          new RegExp(`^\\d+\\s*/\\s*${PAGE_TITLE_MAX_LENGTH}$`)
        )
      ).toBeInTheDocument()
    );
  });

  it("renders a drawer editor on smaller screens", async () => {
    isDesktop = false;
    const user = userEvent.setup();

    render(
      <PageDetailsEditor
        pageId="page-2"
        title="Mobile Page"
        description={null}
        isOwner={true}
      />
    );

    await user.click(screen.getByRole("button", { name: "Mobile Page" }));

    expect(document.querySelector("[data-slot='drawer-content']")).not.toBeNull();
    expect(document.querySelector("[data-slot='dialog-content']")).toBeNull();
  });
});

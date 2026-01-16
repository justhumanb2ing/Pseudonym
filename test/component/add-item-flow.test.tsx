import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AddItemFlow from "@/components/page/add-item-flow";

let isDesktop = false;

vi.mock("@/hooks/use-media-query", () => ({
  useMediaQuery: () => isDesktop,
}));

vi.mock("@/components/ui/drawer", () => ({
  Drawer: ({ children }: { children: ReactNode }) => (
    <div data-slot="drawer">{children}</div>
  ),
  DrawerTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  DrawerContent: ({ children }: { children: ReactNode }) => (
    <div data-slot="drawer-content">{children}</div>
  ),
  DrawerHeader: ({ children }: { children: ReactNode }) => (
    <div data-slot="drawer-header">{children}</div>
  ),
  DrawerTitle: ({ children }: { children: ReactNode }) => (
    <div data-slot="drawer-title">{children}</div>
  ),
  DrawerDescription: ({ children }: { children?: ReactNode }) => (
    <div data-slot="drawer-description">{children}</div>
  ),
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

describe("AddItemFlow", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a drawer on mobile and switches tabs", async () => {
    isDesktop = false;
    const user = userEvent.setup();

    render(<AddItemFlow pageId="page-1" />);

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(document.querySelector("[data-slot='drawer-content']")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Add link" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Image" }));

    expect(screen.getByText("Add image")).toBeInTheDocument();
  });

  it("renders a dialog on desktop and switches tabs", async () => {
    isDesktop = true;
    const user = userEvent.setup();

    render(<AddItemFlow pageId="page-2" />);

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(document.querySelector("[data-slot='dialog-content']")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Add link" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Video" }));

    expect(screen.getByText("Add video")).toBeInTheDocument();
  });
});

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import AddItemFlow from "@/components/page/add-item-flow";

let isDesktop = true;

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

describe("AddItemFlow + LinkSaveForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("enables the link submit button when a URL is entered", async () => {
    isDesktop = true;
    const user = userEvent.setup();

    render(<AddItemFlow pageId="page-1" />);

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.queryByText("URL is required.")).not.toBeInTheDocument();

    const input = screen.getByLabelText("Link URL");
    const submitButton = screen.getByRole("button", { name: "Add link" });

    expect(submitButton).toBeDisabled();

    fireEvent.change(input, { target: { value: "example.com" } });

    expect(input).toHaveValue("example.com");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Add link" })
      ).toBeEnabled();
    });
  });
});

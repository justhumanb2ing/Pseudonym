// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router";

import StudioHandleLayoutRoute from "@/routes/($lang).studio.$handle";
import StudioHandleIndexRoute from "@/routes/($lang).studio.$handle._index";

describe("studio routes", () => {
  it("renders the studio layout route", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/studio/:handle",
          element: <StudioHandleLayoutRoute />,
          children: [{ index: true, element: <div>StudioChild</div> }],
        },
      ],
      { initialEntries: ["/studio/demo"] }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText("StudioChild"))
      .toBeInTheDocument();
  });

  it("renders the studio index route", () => {
    render(<StudioHandleIndexRoute />);

    expect(screen.getByText("StudioHandleIndexRoute"))
      .toBeInTheDocument();
  });
});

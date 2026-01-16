import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router";

import StudioHandleLayoutRoute from "@/routes/($lang).studio.$handle";
import StudioHandleIndexRoute from "@/routes/($lang).studio.$handle._index";

const mockPageData = {
  page: {
    id: "test-id",
    owner_id: "test-owner-id",
    handle: "demo",
    title: "Test Page",
    description: "Test Description",
    image_url: null,
    is_public: true,
    is_primary: true,
  },
  handle: "demo",
};

describe("studio routes", () => {
  it("renders the studio layout route", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/studio/:handle",
          element: <StudioHandleLayoutRoute />,
          loader: () => mockPageData,
          hydrateFallbackElement: <div />,
          children: [{ index: true, element: <div>StudioChild</div> }],
        },
      ],
      { initialEntries: ["/studio/demo"] }
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByText("StudioChild")).toBeInTheDocument();
  });

  it("renders the studio index route", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/studio/:handle",
          element: <StudioHandleIndexRoute />,
        },
      ],
      { initialEntries: ["/studio/demo"] }
    );

    const { container } = render(<RouterProvider router={router} />);

    expect(container).toBeEmptyDOMElement();
  });
});

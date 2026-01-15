import { describe, expect, it } from "vitest";

import { buildLinkBrickViewModel } from "../../utils/link-brick-view-model";
import type { BrickLinkRow } from "../../../types/brick";

const baseData: BrickLinkRow = {
  title: "Example title",
  description: "Example description",
  url: "https://example.com/path",
  site_name: "Example",
  icon_url: "https://example.com/icon.png",
  image_url: "https://example.com/image.png",
};

describe("buildLinkBrickViewModel", () => {
  it("shows description, site label, and image when provided", () => {
    const viewModel = buildLinkBrickViewModel(baseData);

    expect(viewModel.showDescription).toBe(true);
    expect(viewModel.showSiteLabel).toBe(true);
    expect(viewModel.showImage).toBe(true);
    expect(viewModel.showIcon).toBe(true);
  });

  it("hides optional fields when missing", () => {
    const viewModel = buildLinkBrickViewModel({
      ...baseData,
      description: null,
      site_name: null,
      image_url: null,
    });

    expect(viewModel.showDescription).toBe(false);
    expect(viewModel.showSiteLabel).toBe(true);
    expect(viewModel.showImage).toBe(false);
  });

  it("falls back to hostname when site name is missing", () => {
    const viewModel = buildLinkBrickViewModel({
      ...baseData,
      site_name: null,
    });

    expect(viewModel.siteLabel).toBe("example.com");
  });

  it("uses default line limits", () => {
    const viewModel = buildLinkBrickViewModel(baseData);

    expect(viewModel.titleLines).toBe(2);
    expect(viewModel.descriptionLines).toBe(2);
  });
});

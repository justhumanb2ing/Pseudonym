import { describe, expect, it } from "vitest";

import {
  getPageImageValidationError,
  PAGE_IMAGE_MAX_BYTES,
} from "@/service/pages/page-image";

describe("getPageImageValidationError", () => {
  it("rejects files larger than 3MB", () => {
    const file = new File([new Uint8Array(PAGE_IMAGE_MAX_BYTES + 1)], "big.png", {
      type: "image/png",
    });

    expect(getPageImageValidationError(file)).toBe(
      "File size must be 3MB or less."
    );
  });

  it("accepts files up to 3MB", () => {
    const file = new File([new Uint8Array(PAGE_IMAGE_MAX_BYTES)], "ok.png", {
      type: "image/png",
    });

    expect(getPageImageValidationError(file)).toBeNull();
  });
});

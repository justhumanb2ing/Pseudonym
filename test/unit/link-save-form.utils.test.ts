import { describe, expect, it } from "vitest";

import { shouldShowUrlRequiredError } from "@/components/page/link-save-form.utils";

describe("shouldShowUrlRequiredError", () => {
  it("returns false before interaction even when empty", () => {
    expect(shouldShowUrlRequiredError(false, "")).toBe(false);
  });

  it("returns true after interaction when empty", () => {
    expect(shouldShowUrlRequiredError(true, "")).toBe(true);
  });

  it("returns false when a value is present", () => {
    expect(shouldShowUrlRequiredError(true, "example.com")).toBe(false);
  });
});

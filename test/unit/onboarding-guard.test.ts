import { describe, expect, it } from "vitest";

import { getLocalizedPathFromPathname, isOnboardingPath, isPublicAuthPath, isPublicRoute } from "@/service/auth/onboarding-guard";

describe("onboarding-guard utilities", () => {
	it("returns localized paths when locale is present", () => {
		expect(getLocalizedPathFromPathname("/en/onboarding", "/studio")).toBe("/en/studio");
	});

	it("returns non-localized paths when locale is absent", () => {
		expect(getLocalizedPathFromPathname("/studio", "/onboarding")).toBe("/onboarding");
	});

	it("detects public auth paths", () => {
		expect(isPublicAuthPath("/sign-in")).toBe(true);
		expect(isPublicAuthPath("/en/sign-up")).toBe(true);
		expect(isPublicAuthPath("/profile")).toBe(false);
	});

	it("detects public routes", () => {
		expect(isPublicRoute("/")).toBe(true);
		expect(isPublicRoute("/en")).toBe(true);
		expect(isPublicRoute("/feedback")).toBe(true);
		expect(isPublicRoute("/en/changelog")).toBe(true);
		expect(isPublicRoute("/studio")).toBe(false);
	});

	it("detects onboarding paths", () => {
		expect(isOnboardingPath("/onboarding")).toBe(true);
		expect(isOnboardingPath("/en/onboarding/step")).toBe(true);
		expect(isOnboardingPath("/sign-in")).toBe(false);
	});
});

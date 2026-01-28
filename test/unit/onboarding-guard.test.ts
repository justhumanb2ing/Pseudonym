import { describe, expect, it } from "vitest";

import { getLocalizedPathFromPathname, isOnboardingPath, isPublicAuthPath, isPublicRoute } from "@/service/auth/route-utils";

describe("onboarding-guard utilities", () => {
	it("returns the target path for redirects", () => {
		expect(getLocalizedPathFromPathname("/studio", "/onboarding")).toBe("/onboarding");
	});

	it("detects public auth paths", () => {
		expect(isPublicAuthPath("/sign-in")).toBe(true);
		expect(isPublicAuthPath("/sign-up")).toBe(false);
		expect(isPublicAuthPath("/profile")).toBe(false);
	});

	it("detects public routes", () => {
		expect(isPublicRoute("/")).toBe(true);
		expect(isPublicRoute("/en")).toBe(false);
		expect(isPublicRoute("/feedback")).toBe(true);
		expect(isPublicRoute("/changelog")).toBe(true);
		expect(isPublicRoute("/studio")).toBe(false);
	});

	it("detects onboarding paths", () => {
		expect(isOnboardingPath("/onboarding")).toBe(true);
		expect(isOnboardingPath("/onboarding/step")).toBe(true);
		expect(isOnboardingPath("/sign-in")).toBe(false);
	});
});

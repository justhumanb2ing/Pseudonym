import { describe, expect, it } from "vitest";

import { metadataConfig } from "@/config/metadata";
import { buildSignInUrl, getSignInCallbackPath } from "@/routes/_auth.sign-in";

describe("sign-in route helpers", () => {
	it("builds a callback path", () => {
		expect(getSignInCallbackPath()).toBe("/sign-in");
	});

	it("creates an absolute sign-in url using metadata base", () => {
		expect(buildSignInUrl()).toBe(new URL("/sign-in", metadataConfig.url).toString());
	});
});

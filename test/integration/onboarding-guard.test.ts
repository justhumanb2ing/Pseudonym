import { clerkClient } from "@clerk/react-router/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveOnboardingRedirect } from "@/service/auth/onboarding-guard";

vi.mock("@clerk/react-router/server", () => ({
	clerkClient: vi.fn(),
}));

type GuardArgs = Parameters<typeof resolveOnboardingRedirect>[0];

type MockedUser = {
	publicMetadata?: {
		onboardingComplete?: boolean;
	};
};

describe("resolveOnboardingRedirect", () => {
	const getUser = vi.fn<[], Promise<MockedUser>>();

	beforeEach(() => {
		vi.mocked(clerkClient).mockReturnValue({
			users: {
				getUser,
			},
		} as ReturnType<typeof clerkClient>);
		getUser.mockReset();
	});

	const createArgs = (overrides: Partial<GuardArgs> = {}): GuardArgs =>
		({
			pathname: "/dashboard",
			request: {
				auth: {
					userId: "user-1",
					sessionClaims: {
						metadata: {
							onboardingComplete: false,
						},
					},
				},
			},
			...overrides,
		}) as GuardArgs;

	it("returns null when unauthenticated", async () => {
		const result = await resolveOnboardingRedirect(
			createArgs({
				request: { auth: { userId: null, sessionClaims: null } } as GuardArgs["request"],
			}),
		);

		expect(result).toBeNull();
	});

	it("redirects completed users away from onboarding", async () => {
		const result = await resolveOnboardingRedirect(
			createArgs({
				pathname: "/en/onboarding",
				request: {
					auth: {
						userId: "user-1",
						sessionClaims: {
							metadata: {
								onboardingComplete: true,
							},
						},
					},
				} as GuardArgs["request"],
			}),
		);

		expect(result?.headers.get("Location")).toBe("/en/");
	});

	it("redirects to onboarding when metadata is incomplete", async () => {
		getUser.mockResolvedValueOnce({ publicMetadata: {} });

		const result = await resolveOnboardingRedirect(createArgs({ pathname: "/en/settings" }));

		expect(getUser).toHaveBeenCalledOnce();
		expect(result?.headers.get("Location")).toBe("/en/onboarding");
	});

	it("skips redirect when public metadata is complete", async () => {
		getUser.mockResolvedValueOnce({
			publicMetadata: { onboardingComplete: true },
		});

		const result = await resolveOnboardingRedirect(createArgs());

		expect(result).toBeNull();
	});
});

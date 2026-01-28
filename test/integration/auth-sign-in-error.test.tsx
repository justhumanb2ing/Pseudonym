import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authClient } from "@/lib/auth-client";
import SignInRoute from "@/routes/_auth.sign-in";

vi.mock("@/hooks/use-umami-page-view", () => ({
	useUmamiPageView: vi.fn(),
}));

vi.mock("@/lib/auth.client", () => ({
	authClient: {
		signIn: {
			social: vi.fn(),
		},
	},
}));

describe("SignInRoute integration", () => {
	beforeEach(() => {
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("surfaces an error message when Google sign-in fails", async () => {
		const user = userEvent.setup();
		const socialMock = authClient.signIn.social as ReturnType<typeof vi.fn>;
		socialMock.mockRejectedValueOnce(new Error("oauth unavailable"));

		render(<SignInRoute />);

		const button = screen.getByRole("button", { name: /continue with google/i });
		await user.click(button);

		const error = await screen.findByText("Could not start Google sign-in. Please try again.");
		expect(error).toBeInTheDocument();
		expect(button).not.toBeDisabled();
	});
});

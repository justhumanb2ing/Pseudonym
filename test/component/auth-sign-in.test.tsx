import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authClient } from "@/lib/auth.client";
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

vi.mock("react-router", async () => {
	const actual = await vi.importActual<typeof import("react-router")>("react-router");

	return {
		...actual,
		Link: ({ children, to, ...props }: React.ComponentPropsWithoutRef<"a"> & { to: string }) => (
			<a href={to} {...props}>
				{children}
			</a>
		),
		useFetcher: () => ({
			Form: ({ children, ...props }: React.ComponentPropsWithoutRef<"form">) => <form {...props}>{children}</form>,
			state: "idle",
			data: undefined,
		}),
		useNavigate: () => vi.fn(),
	};
});

describe("SignInRoute - Google button", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("starts better-auth social sign-in", async () => {
		const user = userEvent.setup();
		const socialMock = authClient.signIn.social as ReturnType<typeof vi.fn>;
		socialMock.mockImplementationOnce(async (_config, callbacks) => {
			callbacks?.onRequest?.();
			callbacks?.onSuccess?.();
		});

		render(<SignInRoute />);

		const button = screen.getByRole("button", { name: /continue with google/i });
		await user.click(button);

		expect(socialMock).toHaveBeenCalledTimes(1);
		expect(socialMock).toHaveBeenCalledWith(
			{
				provider: "google",
				newUserCallbackURL: "/onboarding",
			},
			expect.any(Object),
		);
	});

	it("disables the button while the sign-in request is pending", async () => {
		const user = userEvent.setup();
		let resolveSignIn: (() => void) | null = null;

		const socialMock = authClient.signIn.social as ReturnType<typeof vi.fn>;
		socialMock.mockImplementationOnce(async (_config, callbacks) => {
			callbacks?.onRequest?.();
			await new Promise<void>((resolve) => {
				resolveSignIn = resolve;
			});
			callbacks?.onSuccess?.();
		});

		render(<SignInRoute />);

		const button = screen.getByRole("button", { name: /continue with google/i });
		const clickPromise = user.click(button);

		await waitFor(() => {
			expect(button).toBeDisabled();
			expect(button).toHaveAttribute("aria-busy", "true");
		});

		resolveSignIn?.();
		await clickPromise;
		await waitFor(() => expect(button).not.toBeDisabled());
	});
});

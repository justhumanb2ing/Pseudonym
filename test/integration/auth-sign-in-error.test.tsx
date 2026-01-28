import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
		socialMock.mockImplementationOnce(async (_config, callbacks) => {
			callbacks?.onRequest?.();
			callbacks?.onError?.({ error: { message: "oauth unavailable" } });
		});

		render(<SignInRoute />);

		const button = screen.getByRole("button", { name: /continue with google/i });
		await user.click(button);

		const error = await screen.findByText("oauth unavailable");
		expect(error).toBeInTheDocument();
		expect(button).not.toBeDisabled();
	});
});

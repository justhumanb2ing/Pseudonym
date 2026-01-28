import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StudioSettingsHandleRoute from "@/routes/studio.$handle.handle";

vi.mock("react-router", async () => {
	const actual = await vi.importActual<typeof import("react-router")>("react-router");

	return {
		...actual,
		useFetcher: () => ({
			Form: ({ children, ...props }: React.ComponentPropsWithoutRef<"form">) => <form {...props}>{children}</form>,
			state: "idle",
			data: undefined,
		}),
		useOutletContext: () => ({
			page: {
				handle: "@jane",
			},
		}),
	};
});

describe("StudioSettingsHandleRoute", () => {
	it("prefills the current handle and enforces lowercase pattern", () => {
		render(<StudioSettingsHandleRoute />);

		const input = screen.getByLabelText("Handle") as HTMLInputElement;

		expect(input.value).toBe("jane");
		expect(input.getAttribute("pattern")).toBe("^[a-z0-9]+$");
		expect(screen.getByText("@")).toBeInTheDocument();
	});
});

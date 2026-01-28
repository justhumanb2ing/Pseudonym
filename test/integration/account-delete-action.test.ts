import { afterEach, describe, expect, it, vi } from "vitest";
import { clerkClient, getAuth } from "@clerk/react-router/server";
import { action } from "@/routes/studio.$handle.account";

vi.mock("@clerk/react-router/server", () => ({
	clerkClient: vi.fn(),
	getAuth: vi.fn(),
}));

afterEach(() => {
	vi.restoreAllMocks();
});

describe("account delete action", () => {
	it("deletes the authenticated user", async () => {
		const deleteUser = vi.fn().mockResolvedValueOnce(undefined);
		vi.mocked(getAuth).mockResolvedValueOnce({ userId: "user-1" } as Awaited<ReturnType<typeof getAuth>>);
		vi.mocked(clerkClient).mockReturnValue({
			users: {
				deleteUser,
			},
		} as unknown as ReturnType<typeof clerkClient>);

		const request = new Request("http://localhost/studio/@handle/account", {
			method: "POST",
		});

		const result = await action({
			request,
			params: { handle: "@handle" },
			context: {},
		} as Parameters<typeof action>[0]);

		expect(deleteUser).toHaveBeenCalledWith("user-1");
		expect(result.status).toBe(200);
		await expect(result.json()).resolves.toEqual({ message: "Account deleted." });
	});
});

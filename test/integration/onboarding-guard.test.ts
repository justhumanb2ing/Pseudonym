import { describe, it } from "vitest";

// TODO: Better Auth로 마이그레이션 후 테스트 재작성 필요
describe.skip("resolveOnboardingRedirect", () => {
	it("redirects unauthenticated users away from protected routes", async () => {
		// TODO: Better Auth mock으로 재작성
	});

	it("allows unauthenticated users on public routes", async () => {
		// TODO: Better Auth mock으로 재작성
	});

	it("allows unauthenticated users on profile routes", async () => {
		// TODO: Better Auth mock으로 재작성
	});

	it("redirects completed users away from onboarding", async () => {
		// TODO: Better Auth mock으로 재작성
	});

	it("redirects to onboarding when metadata is incomplete", async () => {
		// TODO: Better Auth mock으로 재작성
	});

	it("skips redirect when public metadata is complete", async () => {
		// TODO: Better Auth mock으로 재작성
	});
});

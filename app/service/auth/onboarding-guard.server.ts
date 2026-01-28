import { redirect } from "react-router";
import { auth } from "@/lib/auth.server";
import {
	getLocalizedPathFromPathname,
	isOnboardingPath,
	isPublicAuthPath,
	isPublicRoute,
	isUserProfilePath,
} from "./route-utils";

// Re-export utilities for backwards compatibility
export {
	getLocalizedPathFromPathname,
	isOnboardingPath,
	isPublicAuthPath,
	isPublicRoute,
	isUserProfilePath,
} from "./route-utils";

type OnboardingGuardArgs = {
	request: Request;
	pathname: string;
};

/**
 * Resolves onboarding-related redirects based on authentication and onboarding status.
 */
export async function resolveOnboardingRedirect(args: OnboardingGuardArgs): Promise<Response | null> {
	const { request, pathname } = args;

	const isPublic = isPublicRoute(pathname);
	const isAuth = isPublicAuthPath(pathname);
	const isOnboarding = isOnboardingPath(pathname);
	const isApiRoute = pathname.includes("/api/");
	const isUserProfile = isUserProfilePath(pathname);

	// API 라우트는 guard에서 제외
	if (isApiRoute) {
		return null;
	}

	// 사용자 프로필 페이지는 자체 접근 제어 로직이 있으므로 guard에서 제외
	if (isUserProfile) {
		return null;
	}

	// Better Auth 세션 확인
	const session = await auth.api.getSession({
		headers: request.headers,
	});
	const userId = session?.user?.id;

	// Case 1: 비로그인 사용자 - 공개 라우트 + /sign-in만 허용
	if (!userId) {
		if (!isPublic && !isAuth) {
			return redirect(getLocalizedPathFromPathname(pathname, "/sign-in"));
		}
		return null;
	}

	const onboardingComplete = session?.user?.userMetadata?.onboardingComplete === true;

	// Case 2: 온보딩 미완료 사용자 - /onboarding만 허용
	if (!onboardingComplete) {
		if (!isOnboarding) {
			return redirect(getLocalizedPathFromPathname(pathname, "/onboarding"));
		}
		return null;
	}

	// Case 3: 온보딩 완료 사용자 - /onboarding, /sign-in 등 인증 라우트 차단
	if (isOnboarding || isAuth) {
		return redirect(getLocalizedPathFromPathname(pathname, "/"));
	}

	return null;
}

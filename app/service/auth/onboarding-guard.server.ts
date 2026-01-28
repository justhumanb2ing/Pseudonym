import { createClient } from "@supabase/supabase-js";
import { redirect } from "react-router";
import { auth } from "@/lib/auth";
import type { Database } from "../../../types/database.types";
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
	const isUserProfile = isUserProfilePath(pathname);
	const isApiRoute = pathname.includes("/api/");

	// API 라우트는 guard에서 제외
	if (isApiRoute) {
		return null;
	}

	// Better Auth 세션 확인
	const session = await auth.api.getSession({
		headers: request.headers,
	});
	const userId = session?.user?.id;

	// Case 1: 비로그인 사용자 - 공개 라우트 + 인증 라우트 + 사용자 프로필 페이지만 허용
	if (!userId) {
		if (!isPublic && !isAuth && !isUserProfile) {
			return redirect(getLocalizedPathFromPathname(pathname, "/sign-in"));
		}
		return null;
	}

	// onboarding 완료 여부 확인 (pages 테이블에서 handle 존재 여부로 판단)
	const supabaseUrl = process.env.VITE_SB_URL;
	const supabaseKey = process.env.VITE_SB_PUBLISHABLE_KEY;

	let onboardingComplete = false;

	if (supabaseUrl && supabaseKey) {
		const supabase = createClient<Database>(supabaseUrl, supabaseKey);
		const { data } = await supabase
			.from("pages")
			.select("handle")
			.eq("owner_id", userId)
			.eq("is_primary", true)
			.maybeSingle();

		onboardingComplete = !!data?.handle;
	}

	// Case 2: 온보딩 미완료 사용자 - /onboarding만 허용
	if (!onboardingComplete) {
		if (!isOnboarding) {
			return redirect(getLocalizedPathFromPathname(pathname, "/onboarding"));
		}
		return null;
	}

	// Case 3: 온보딩 완료 사용자 - /onboarding만 차단
	if (isOnboarding) {
		return redirect(getLocalizedPathFromPathname(pathname, "/"));
	}

	return null;
}

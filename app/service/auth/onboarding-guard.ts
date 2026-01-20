import { clerkClient } from "@clerk/react-router/server";
import { redirect } from "react-router";
import { metadataConfig } from "@/config/metadata";

/**
 * Routes accessible without authentication.
 */
const PUBLIC_ROUTES = ["/", "/changelog", "/feedback"];

type ClerkClientArgs = Parameters<typeof clerkClient>[0];

type AuthSessionClaims = {
	metadata?: {
		onboardingComplete?: boolean;
	};
};

type AuthState = {
	userId?: string | null;
	sessionClaims?: AuthSessionClaims | null;
};

type AuthenticatedRequest = ClerkClientArgs["request"] & {
	auth: AuthState;
};

type OnboardingGuardArgs = ClerkClientArgs & {
	request: AuthenticatedRequest;
	pathname: string;
};

/**
 * Removes locale prefix from pathname if present.
 */
function removeLocalePrefix(pathname: string): string {
	const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
	const [, maybeLocale, ...rest] = normalizedPathname.split("/");
	const locale = metadataConfig.locales.find((value) => value === maybeLocale);

	if (locale) {
		const restPath = rest.join("/");
		return restPath ? `/${restPath}` : "/";
	}

	return normalizedPathname;
}

/**
 * Returns true when the pathname is a user profile page (/{handle}).
 * These pages have their own access control logic in the route loader.
 */
function isUserProfilePath(pathname: string): boolean {
	const pathWithoutLocale = removeLocalePrefix(pathname);
	// /{handle} 패턴: /로 시작하고, 두 번째 세그먼트가 있으며, studio/sign-in/sign-up/onboarding/changelog/feedback이 아닌 경우
	const segments = pathWithoutLocale.split("/").filter(Boolean);

	if (segments.length !== 1) return false;

	const reservedPaths = ["studio", "sign-in", "sign-up", "onboarding", "changelog", "feedback"];
	return !reservedPaths.includes(segments[0]);
}

/**
 * Returns true when the pathname is a public route accessible without authentication.
 */
export function isPublicRoute(pathname: string): boolean {
	const pathWithoutLocale = removeLocalePrefix(pathname);
	return PUBLIC_ROUTES.some((route) => pathWithoutLocale === route);
}

/**
 * Builds a localized path for a target route based on the request pathname.
 */
export function getLocalizedPathFromPathname(pathname: string, targetPath: string) {
	if (!targetPath.startsWith("/")) {
		throw new Error("pathname must start with '/'");
	}

	const [, maybeLocale] = pathname.split("/");
	const locale = metadataConfig.locales.find((value) => value === maybeLocale);

	return locale ? `/${locale}${targetPath}` : targetPath;
}

/**
 * Returns true when the pathname points to a public auth route.
 */
export function isPublicAuthPath(pathname: string) {
	const normalizedPathname = pathname.replace(/\/+$/, "");
	const authSegmentPattern = /(^|\/)(sign-in|sign-up)(\/|$)/;

	return authSegmentPattern.test(normalizedPathname);
}

/**
 * Returns true when the pathname is an onboarding route.
 */
export function isOnboardingPath(pathname: string) {
	const normalizedPathname = pathname.replace(/\/+$/, "");
	const onboardingSegmentPattern = /(^|\/)onboarding(\/|$)/;

	return onboardingSegmentPattern.test(normalizedPathname);
}

/**
 * Resolves onboarding-related redirects based on authentication and onboarding status.
 */
export async function resolveOnboardingRedirect(args: OnboardingGuardArgs): Promise<Response | null> {
	const { request, pathname } = args;
	const auth = request.auth;

	const isPublic = isPublicRoute(pathname);
	const isAuth = isPublicAuthPath(pathname);
	const isOnboarding = isOnboardingPath(pathname);
	const isUserProfile = isUserProfilePath(pathname);

	// Case 1: 비로그인 사용자 - 공개 라우트 + 인증 라우트 + 사용자 프로필 페이지만 허용
	// (사용자 프로필 페이지는 라우트 loader에서 is_public 체크)
	if (!auth.userId) {
		if (!isPublic && !isAuth && !isUserProfile) {
			return redirect(getLocalizedPathFromPathname(pathname, "/sign-in"));
		}
		return null;
	}

	// Trust session claims first for a fast-path check.
	let onboardingComplete = auth.sessionClaims?.metadata?.onboardingComplete === true;

	// If the session doesn't confirm onboarding, verify against Clerk metadata.
	if (!onboardingComplete) {
		const clerk = clerkClient(args);
		const user = await clerk.users.getUser(auth.userId);
		onboardingComplete = user.publicMetadata?.onboardingComplete === true;
	}

	// Case 2: 온보딩 미완료 사용자 - /onboarding만 허용
	if (!onboardingComplete) {
		if (!isOnboarding) {
			return redirect(getLocalizedPathFromPathname(pathname, "/onboarding"));
		}
		return null;
	}

	// Case 3: 온보딩 완료 사용자 - /onboarding만 차단
	// /sign-in, /sign-up은 라우트 loader에서 handle 조회 후 리다이렉트 처리
	if (isOnboarding) {
		return redirect(getLocalizedPathFromPathname(pathname, "/"));
	}

	// No redirect needed for authenticated, onboarded users.
	return null;
}

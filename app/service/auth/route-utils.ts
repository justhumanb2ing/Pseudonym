/**
 * Routes accessible without authentication.
 */
const PUBLIC_ROUTES = ["/", "/changelog", "/feedback"];

/**
 * Normalizes pathname and removes trailing slashes.
 */
export function removeLocalePrefix(pathname: string): string {
	return pathname.replace(/\/+$/, "") || "/";
}

/**
 * Returns true when the pathname is a user profile page (/{handle}).
 * These pages have their own access control logic in the route loader.
 */
export function isUserProfilePath(pathname: string): boolean {
	const pathWithoutLocale = removeLocalePrefix(pathname);
	// /{handle} 패턴: /로 시작하고, 두 번째 세그먼트가 있으며, studio/sign-in/sign-up/onboarding/changelog/feedback이 아닌 경우
	const segments = pathWithoutLocale.split("/").filter(Boolean);

	if (segments.length !== 1) return false;

	const reservedPaths = ["studio", "sign-in", "onboarding", "changelog", "feedback"];
	return !reservedPaths.includes(segments[0]);
}

/**
 * Returns true when the pathname is a public route accessible without authentication.
 */
export function isPublicRoute(pathname: string): boolean {
	const normalizedPathname = removeLocalePrefix(pathname);
	return PUBLIC_ROUTES.some((route) => normalizedPathname === route);
}

/**
 * Builds a redirect path for a target route based on the request pathname.
 */
export function getLocalizedPathFromPathname(pathname: string, targetPath: string) {
	if (!targetPath.startsWith("/")) {
		throw new Error("pathname must start with '/'");
	}
	return targetPath;
}

/**
 * Returns true when the pathname points to a public auth route (/sign-in).
 */
export function isPublicAuthPath(pathname: string) {
	const normalizedPathname = pathname.replace(/\/+$/, "");
	const authSegmentPattern = /(^|\/)sign-in(\/|$)/;

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

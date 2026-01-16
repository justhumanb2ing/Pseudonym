import { clerkClient } from "@clerk/react-router/server";
import { redirect } from "react-router";
import { metadataConfig } from "@/config/metadata";

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
 * Builds a localized path for a target route based on the request pathname.
 */
export function getLocalizedPathFromPathname(
  pathname: string,
  targetPath: string
) {
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
 * Resolves onboarding-related redirects for authenticated users.
 */
export async function resolveOnboardingRedirect(
  args: OnboardingGuardArgs
): Promise<Response | null> {
  const { request, pathname } = args;
  const auth = request.auth;

  // No authenticated user means no onboarding gate is enforced here.
  if (!auth.userId) {
    return null;
  }

  // Trust session claims first for a fast-path check.
  const onboardingComplete =
    auth.sessionClaims?.metadata?.onboardingComplete === true;

  // Onboarding page: completed users should not re-enter the flow.
  if (isOnboardingPath(pathname)) {
    if (onboardingComplete) {
      return redirect(getLocalizedPathFromPathname(pathname, "/"));
    }

    return null;
  }

  // Auth pages stay accessible even after login (e.g., sign-in link from email).
  if (isPublicAuthPath(pathname)) {
    return null;
  }

  // If the session doesn't confirm onboarding, verify against Clerk metadata.
  if (!onboardingComplete) {
    const clerk = clerkClient(args);
    const user = await clerk.users.getUser(auth.userId);
    const hasOnboardingComplete =
      user.publicMetadata?.onboardingComplete === true;

    // Still incomplete: force the onboarding flow.
    if (!hasOnboardingComplete) {
      return redirect(getLocalizedPathFromPathname(pathname, "/onboarding"));
    }
  }

  // No redirect needed for authenticated, onboarded users.
  return null;
}

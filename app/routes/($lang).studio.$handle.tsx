import type { Route } from "./+types/($lang).studio.$handle";
import { getAuth } from "@clerk/react-router/server";
import { Outlet, redirect } from "react-router";
import { getLocalizedPath } from "@/utils/localized-path";
import { resolveOnboardingRedirect } from "@/service/auth/onboarding-guard";

export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args);
  const requestWithAuth = Object.assign(args.request, { auth });

  if (!auth.userId) {
    throw redirect(getLocalizedPath(args.params.lang, "/sign-in"));
  }

  const pathname = new URL(args.request.url).pathname;
  const redirectResponse = await resolveOnboardingRedirect({
    ...args,
    request: requestWithAuth,
    pathname,
  });
  if (redirectResponse) {
    throw redirectResponse;
  }

  return null;
}

export default function StudioHandleLayoutRoute() {
  return <Outlet />;
}

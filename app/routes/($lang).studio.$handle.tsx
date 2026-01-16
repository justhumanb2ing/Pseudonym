import type { Route } from "./+types/($lang).studio.$handle";
import { getAuth } from "@clerk/react-router/server";
import { Outlet, redirect } from "react-router";
import { getLocalizedPath } from "@/utils/localized-path";
import { resolveOnboardingRedirect } from "@/service/auth/onboarding-guard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/common/app-sidebar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import LocaleSwitcher from "@/components/i18n/locale-switcher";

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
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="h-dvh w-full bg-sidebar flex flex-col gap-4">
        <header className="h-16 flex justify-between items-center gap-2 p-2 px-4">
          <SidebarTrigger className="size-9 bg-surface rounded-md" />
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle iconSize="size-5" />
            <LocaleSwitcher />
          </div>
        </header>
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

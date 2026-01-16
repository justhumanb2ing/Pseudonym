import type { Route } from "./+types/($lang).studio.$handle";
import { getAuth } from "@clerk/react-router/server";
import { Outlet, redirect } from "react-router";
import { getLocalizedPath } from "@/utils/localized-path";
import { resolveOnboardingRedirect } from "@/service/auth/onboarding-guard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/common/app-sidebar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import LocaleSwitcher from "@/components/i18n/locale-switcher";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { StudioOutletContext } from "types/studio.types";

export async function loader(
  args: Route.LoaderArgs
): Promise<StudioOutletContext> {
  const auth = await getAuth(args);
  const requestWithAuth = Object.assign(args.request, { auth });
  const { handle } = args.params;

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

  // 페이지 검증 및 권한 체크
  if (!handle) {
    throw new Response("Not Found", { status: 404 });
  }

  const supabase = await getSupabaseServerClient(args);
  const pageSelectQuery =
    "id, owner_id, handle, title, description, image_url, is_public, is_primary";

  const { data: page, error } = await supabase
    .from("pages")
    .select(pageSelectQuery)
    .eq("handle", handle)
    .maybeSingle();

  if (error) {
    throw new Response(error.message, { status: 500 });
  }

  if (!page) {
    throw new Response("Not Found", { status: 404 });
  }

  if (page.owner_id !== auth.userId) {
    throw new Response("Forbidden", { status: 403 });
  }

  return {
    page,
    handle,
  };
}

export default function StudioHandleLayoutRoute({
  loaderData,
}: Route.ComponentProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="h-dvh w-full bg-sidebar flex flex-col gap-4 relative">
        <aside className="absolute top-2 right-0 h-16 flex justify-between items-center gap-2 px-4">
          <div className="flex items-center gap-2 ml-auto">
            <SidebarTrigger className="size-9 bg-surface rounded-md" />
            <ThemeToggle iconSize="size-5" />
            <LocaleSwitcher />
          </div>
        </aside>
        <Outlet context={loaderData} />
      </main>
    </SidebarProvider>
  );
}

import { getAuth } from "@clerk/react-router/server";
import { Outlet, redirect } from "react-router";
import type { StudioOutletContext } from "types/studio.types";
import AppSidebar from "@/components/common/app-sidebar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import LocaleSwitcher from "@/components/i18n/locale-switcher";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getSupabaseServerClient } from "@/lib/supabase";
import { resolveOnboardingRedirect } from "@/service/auth/onboarding-guard";
import { getLocalizedPath } from "@/utils/localized-path";
import type { Route } from "./+types/($lang).studio.$handle";

export async function loader(args: Route.LoaderArgs): Promise<StudioOutletContext> {
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
	const pageSelectQuery = "id, owner_id, handle, title, description, image_url, is_public, is_primary, profile_items(*)";

	const { data: page, error } = await supabase
		.from("pages")
		.select(pageSelectQuery)
		.eq("handle", handle)
		.order("sort_key", { ascending: true, foreignTable: "profile_items" })
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

	const { profile_items: profileItems, ...pageData } = page;

	return {
		page: pageData,
		handle,
		profileItems: (profileItems as StudioOutletContext["profileItems"]) ?? [],
	};
}

export default function StudioHandleLayoutRoute({ loaderData }: Route.ComponentProps) {
	const imageUrl = loaderData.page.image_url;

	return (
		<>
			{/* LCP 이미지 preload - React 19 자동 head 호이스팅 */}
			{imageUrl && <link rel="preload" as="image" href={imageUrl} fetchPriority="high" />}
			<SidebarProvider>
				<AppSidebar pageId={loaderData.page.id} isPublic={loaderData.page.is_public} />
				{/* TODO: bg-sidebar 고려 */}
				<SidebarInset>
					<main className="relative flex h-dvh w-full min-w-0 flex-col gap-4 overflow-hidden bg-background">
						<aside className="absolute top-0 right-0 flex h-16 items-center justify-between gap-2 px-4">
							<div className="ml-auto flex items-center gap-2">
								<SidebarTrigger className="size-8 rounded-md bg-white dark:bg-black" />
								<ThemeToggle iconSize="size-4" />
								<LocaleSwitcher />
							</div>
						</aside>
						<Outlet context={loaderData} />
					</main>
				</SidebarInset>
			</SidebarProvider>
		</>
	);
}

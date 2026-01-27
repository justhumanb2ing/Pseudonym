import { Outlet } from "react-router";
import type { StudioOutletContext } from "types/studio.types";
import AppSidebar from "@/components/common/app-sidebar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import LocaleSwitcher from "@/components/i18n/locale-switcher";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requireStudioPage } from "@/service/pages/require-studio-page";
import type { Route } from "./+types/($lang).studio.$handle";

export async function loader(args: Route.LoaderArgs): Promise<StudioOutletContext> {
	const pageSelectQuery = "id, owner_id, handle, title, description, image_url, is_public, is_primary";
	const { page, handle } = await requireStudioPage<StudioOutletContext["page"]>(args, { select: pageSelectQuery });

	return {
		page,
		handle,
		profileItems: [],
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

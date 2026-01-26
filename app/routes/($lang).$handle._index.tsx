import { getAuth } from "@clerk/react-router/server";
import { SparklesIcon } from "lucide-react";
import { useEffect } from "react";
import { useLoaderData, useLocation, useRevalidator } from "react-router";
import type { StudioOutletContext } from "types/studio.types";
import { LocalizedLink } from "@/components/i18n/localized-link";
import LinkItem from "@/components/page/link-item";
import MapItem from "@/components/page/map-item";
import MediaItem from "@/components/page/media-item";
import SectionItem from "@/components/page/section-item";
import TextItem from "@/components/page/text-item";
import Watermark from "@/components/page/watermark";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useIsMobile } from "@/hooks/use-mobile";
import { isPreviewMessage, isPreviewRequest, isPreviewSearch } from "@/lib/preview";
import { getSupabaseServerClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { fetchUmamiVisits, getTodayRange, resolveUmamiConfig, UMAMI_TIMEZONE, UMAMI_UNIT, type UmamiResponse } from "../service/umami";
import type { Route } from "./+types/($lang).$handle._index";

export async function loader(args: Route.LoaderArgs) {
	const { userId } = await getAuth(args);
	const { handle } = args.params;
	const isPreview = isPreviewRequest(args.request);

	if (!handle) {
		throw new Response("Not Found", { status: 404 });
	}

	const supabase = await getSupabaseServerClient(args);
	const pageSelectQuery = "id, owner_id, handle, title, description, image_url, is_public, is_primary";

	const { data: page, error } = await supabase.from("pages").select(pageSelectQuery).eq("handle", handle).maybeSingle();

	if (error) {
		throw new Response(error.message, { status: 500 });
	}

	if (!page) {
		throw new Response("Not Found", { status: 404 });
	}

	const isOwner = page.owner_id === userId;
	if (!page.is_public && !isOwner) {
		throw new Response("Forbidden", { status: 403 });
	}

	// profile_items 조회
	const { data: profileItems, error: itemsError } = await supabase
		.from("profile_items")
		.select("*")
		.eq("page_id", page.id)
		.order("sort_key", { ascending: true });

	if (itemsError) {
		throw new Response(itemsError.message, { status: 500 });
	}

	let umamiResult: UmamiResponse | null = null;

	if (!isPreview) {
		const umamiConfig = resolveUmamiConfig();

		if (!umamiConfig) {
			umamiResult = {
				ok: false,
				status: 500,
				error: "Missing Umami environment configuration.",
			};
		} else {
			try {
				const { startAt, endAt } = getTodayRange(UMAMI_TIMEZONE);
				umamiResult = await fetchUmamiVisits({
					...umamiConfig,
					websiteId: umamiConfig.websiteId,
					startAt,
					endAt,
					unit: UMAMI_UNIT,
					timezone: UMAMI_TIMEZONE,
					pageId: page.id,
				});
			} catch (error) {
				umamiResult = {
					ok: false,
					status: 500,
					error: error instanceof Error ? error.message : error,
				};
			}
		}
	}

	return {
		page,
		handle,
		isOwner,
		umamiResult,
		profileItems: (profileItems as StudioOutletContext["profileItems"]) ?? [],
	};
}

export default function UserProfileRoute() {
	const { page, profileItems } = useLoaderData<typeof loader>();
	const location = useLocation();
	const revalidator = useRevalidator();
	const isPreview = isPreviewSearch(location.search);
	const activeProfileItems = profileItems.filter((item) => item.is_active) ?? [];
	const isMobile = useIsMobile();
	const mainClassName = isMobile
		? "h-[100dvh] w-full gap-2 overflow-hidden"
		: "container mx-auto flex h-[calc(100dvh-8rem)] max-w-md flex-col gap-2 overflow-hidden rounded-[64px] border-[0.5px] shadow-float";

	useEffect(() => {
		if (!isPreview) {
			return;
		}

		const handleMessage = (event: MessageEvent) => {
			if (event.origin !== window.location.origin) {
				return;
			}
			if (!isPreviewMessage(event.data)) {
				return;
			}
			revalidator.revalidate();
		};

		const handleSubmit = (event: Event) => {
			event.preventDefault();
			event.stopPropagation();
		};

		const handleClick = (event: MouseEvent) => {
			const target = event.target;
			if (!(target instanceof HTMLElement)) {
				return;
			}
			const button = target.closest("button");
			if (!button) {
				return;
			}
			const type = button.getAttribute("type") ?? "submit";
			if (type === "submit") {
				event.preventDefault();
				event.stopPropagation();
			}
		};

		window.addEventListener("message", handleMessage);
		document.addEventListener("submit", handleSubmit, true);
		document.addEventListener("click", handleClick, true);
		return () => {
			window.removeEventListener("message", handleMessage);
			document.removeEventListener("submit", handleSubmit, true);
			document.removeEventListener("click", handleClick, true);
		};
	}, [isPreview, revalidator]);

	return (
		<div className={cn("box-border h-dvh overflow-hidden", !isMobile && "py-10")}>
			<main className={cn(mainClassName, "scrollbar-hide relative box-border overflow-y-auto bg-white pb-10 dark:bg-black")}>
				<div className="flex flex-col gap-4 p-10 py-12 pb-2">
					<div className="size-30 overflow-hidden rounded-full md:size-36">
						{page.image_url ? (
							<img src={page.image_url} alt={page.handle} className="h-full w-full object-cover" />
						) : (
							<div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs"></div>
						)}
					</div>
					<div className="flex min-w-0 flex-col gap-2">
						<p className="font-bold text-3xl md:text-4xl">{page.title}</p>
						<p className="line-clamp-6 text-pretty font-light">{page.description}</p>
					</div>
				</div>

				<section className="flex flex-col gap-3 p-6">
					{activeProfileItems.length === 0 && (
						<Empty className="p-0">
							<EmptyHeader>
								<EmptyMedia className="size-52 overflow-hidden">
									<img src={"/cat-blunge.png"} alt="empty" className="h-full w-full object-cover grayscale-75" />
								</EmptyMedia>
								<EmptyTitle className="text-base">Something is coming together here.</EmptyTitle>
							</EmptyHeader>
						</Empty>
					)}
					{activeProfileItems.map((item) => {
						if (item.type === "text") {
							return <TextItem key={item.id} item={item} />;
						}
						if (item.type === "section") {
							return <SectionItem key={item.id} item={item} />;
						}
						if (item.type === "media") {
							return <MediaItem key={item.id} item={item} />;
						}
						if (item.type === "map") {
							return <MapItem key={item.id} item={item} />;
						}
						return <LinkItem key={item.id} item={item} />;
					})}
				</section>
				<footer className="flex justify-center py-8">
					<Watermark />
				</footer>

				<div className="absolute top-12 right-10">
					<Button
						size={"icon-lg"}
						className={"rounded-full"}
						aria-label="Let's make your unique page"
						render={
							<LocalizedLink to={"/"}>
								<SparklesIcon />
							</LocalizedLink>
						}
					></Button>
				</div>
			</main>
		</div>
	);
}

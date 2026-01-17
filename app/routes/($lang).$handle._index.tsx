import { getAuth } from "@clerk/react-router/server";
import { useEffect } from "react";
import { useLocation, useRevalidator } from "react-router";
import { isPreviewMessage, isPreviewRequest, isPreviewSearch } from "@/lib/preview";
import { getSupabaseServerClient } from "@/lib/supabase";
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
	if (!page.is_public && !isOwner) throw new Response("Not Found", { status: 404 });

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
	};
}

export default function UserProfileRoute() {
	const location = useLocation();
	const revalidator = useRevalidator();
	const isPreview = isPreviewSearch(location.search);

	useEffect(() => {
		if (!isPreview) {
			return;
		}

		const handleMessage = (event: MessageEvent) => {
			if (event.origin !== window.location.origin) {
				return;
			}
			if (event.source !== window.parent) {
				return;
			}
			if (!isPreviewMessage(event.data)) {
				return;
			}
			revalidator.revalidate();
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, [isPreview, revalidator]);

	useEffect(() => {
		if (!isPreview) {
			return;
		}

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

		document.addEventListener("submit", handleSubmit, true);
		document.addEventListener("click", handleClick, true);
		return () => {
			document.removeEventListener("submit", handleSubmit, true);
			document.removeEventListener("click", handleClick, true);
		};
	}, [isPreview]);

	return <main className="container mx-auto h-full max-w-xl p-3">Preview Mode</main>;
}

import { UnlinkIcon } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useActionData, useFetchers, useOutletContext, useParams } from "react-router";
import type { StudioOutletContext } from "types/studio.types";
import { Text } from "@/components/common/typhography";
import type { ExpandableCardItem } from "@/components/effects/expandable-card";
import { ExpandableCard } from "@/components/effects/expandable-card";
import { GlowEffect } from "@/components/effects/glow-effect";
import AddItemDrawer from "@/components/page/add-item-drawer";
import PageDetailsEditor from "@/components/page/page-details-editor";
import ProfileImageUploader from "@/components/page/profile-image-uploader";
import { profileItemCardFallbackRenderer, profileItemCardRenderers } from "@/components/page/profile-item-expandable-renderers";
import ProfilePreviewFrame from "@/components/page/profile-preview-frame";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { PREVIEW_MESSAGE_TYPE } from "@/lib/preview";
import { getSupabaseServerClient } from "@/lib/supabase";
import {
	handleLinkRemove,
	handleLinkSave,
	handleLinkToggle,
	handleLinkUpdate,
	handlePageDetails,
	handlePageVisibility,
	handleRemoveImage,
	handleUpdateImage,
	type PageProfileActionData,
} from "@/service/pages/page-profile.action";
import type { Route } from "./+types/($lang).studio.$handle.links";

export type ActionData = PageProfileActionData;

type ProfileItem = StudioOutletContext["profileItems"][number];

export async function loader(args: Route.LoaderArgs) {
	const { handle } = args.params;

	if (!handle) {
		throw new Response("Not Found", { status: 404 });
	}

	const supabase = await getSupabaseServerClient(args);
	const { data: page, error } = await supabase.from("pages").select("id").eq("handle", handle).maybeSingle();

	if (error) {
		throw new Response(error.message, { status: 500 });
	}

	if (!page) {
		throw new Response("Not Found", { status: 404 });
	}

	return { pageId: page.id };
}

export async function action(args: Route.ActionArgs) {
	const formData = await args.request.formData();
	const intent = formData.get("intent")?.toString();
	const supabase = await getSupabaseServerClient(args);
	// Intent 타입 검증
	const validIntents = [
		"page-details",
		"page-visibility",
		"update-image",
		"remove-image",
		"link-save",
		"link-remove",
		"link-update",
		"link-toggle",
	] as const;
	type ValidIntent = (typeof validIntents)[number];

	// Type guard 함수
	const isValidIntent = (value: string): value is ValidIntent => {
		return (validIntents as readonly string[]).includes(value);
	};

	if (!intent || typeof intent !== "string") {
		return {
			formError: "Action intent is required",
			success: false,
		} satisfies ActionData;
	}

	if (!isValidIntent(intent)) {
		return {
			formError: "Invalid action intent",
			success: false,
		} satisfies ActionData;
	}

	switch (intent) {
		case "update-image":
			return handleUpdateImage({ formData, supabase });
		case "remove-image":
			return handleRemoveImage({ formData, supabase });
		case "page-visibility":
			return handlePageVisibility({ formData, supabase });
		case "link-save":
			return handleLinkSave({ formData, supabase });
		case "link-remove":
			return handleLinkRemove({ formData, supabase });
		case "link-update":
			return handleLinkUpdate({ formData, supabase });
		case "link-toggle":
			return handleLinkToggle({ formData, supabase });
		case "page-details":
			return handlePageDetails({ formData, supabase });
		default:
			// 타입 시스템에서 도달 불가능한 코드
			return {
				formError: "Unhandled action intent",
				success: false,
			} satisfies ActionData;
	}
}

// TODO: AddItemFlow 사용 흐름, UI, UX 변경
export default function StudioLinksRoute(_props: Route.ComponentProps) {
	const {
		page: { id: pageId, owner_id, title, description, image_url },
		handle,
		profileItems,
	} = useOutletContext<StudioOutletContext>();
	const { lang } = useParams();
	const actionData = useActionData<ActionData>();
	const fetchers = useFetchers();
	const previewFrameRef = useRef<HTMLIFrameElement>(null);

	const lastPreviewSignalRef = useRef(new Map<string, unknown>());

	const notifyPreviewRefresh = useCallback(() => {
		const previewWindow = previewFrameRef.current?.contentWindow;
		if (!previewWindow) {
			return;
		}
		previewWindow.postMessage({ type: PREVIEW_MESSAGE_TYPE }, window.location.origin);
	}, []);

	useEffect(() => {
		if (actionData?.success) {
			notifyPreviewRefresh();
		}
	}, [actionData?.success, notifyPreviewRefresh]);

	useEffect(() => {
		for (const fetcher of fetchers) {
			if (fetcher.state !== "idle") {
				continue;
			}
			const data = fetcher.data as ActionData | undefined;
			if (!data?.success) {
				continue;
			}
			const key = fetcher.key;
			const lastPayload = lastPreviewSignalRef.current.get(key);
			if (lastPayload === data) {
				continue;
			}
			lastPreviewSignalRef.current.set(key, data);
			notifyPreviewRefresh();
		}
	}, [fetchers, notifyPreviewRefresh]);

	const expandableItems: ExpandableCardItem<ProfileItem>[] = profileItems.map((item) => ({
		id: item.id,
		type: item.type,
		data: item,
	}));

	return (
		<section className="flex min-h-0 grow flex-col gap-6 p-2 px-6 pb-6">
			<article className="grid min-h-0 min-w-0 grow grid-cols-1 gap-5 pt-20 pb-8 xl:grid-cols-12">
				{/* Left Column - Profile & Links */}
				<div className="flex min-h-0 min-w-0 flex-col gap-4 xl:col-span-7">
					<div className="overflow-hidden">
						<div className="flex items-center gap-2 pb-4">
							{/* Profile Image */}
							<ProfileImageUploader pageId={pageId} userId={owner_id} imageUrl={image_url} alt={title ?? handle ?? "Profile image"} />

							{/* Profile Details */}
							<div className="min-w-0 flex-1">
								<PageDetailsEditor pageId={pageId} title={title} description={description} />
							</div>
						</div>

						<Separator />
					</div>

					<div className="relative flex min-h-0 flex-1 flex-col">
						{/* Section Header */}
						<div className="mb-3 flex items-center justify-between px-1">
							<Text.H4>My Links</Text.H4>

							<aside className="hidden md:block">
								<AddItemDrawer pageId={pageId} />
							</aside>
						</div>

						{/* Links List */}
						<div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-5 overflow-y-scroll md:pb-16">
							{profileItems.length === 0 ? (
								<Empty>
									<EmptyHeader className="gap-1">
										<EmptyMedia variant="icon" className="size-5 bg-transparent">
											<UnlinkIcon className="size-full" />
										</EmptyMedia>
										<EmptyTitle className="text-base">No Links</EmptyTitle>
										<EmptyDescription className="text-xs/relaxed">There's no link yet. Add yours!</EmptyDescription>
									</EmptyHeader>
									<EmptyContent className="w-fit">
										<AddItemDrawer pageId={pageId} />
									</EmptyContent>
								</Empty>
							) : (
								<div className="space-y-1">
									{expandableItems.map((item) => (
										<div key={item.id} className="fade-in slide-in-from-bottom-1 animate-in">
											<ExpandableCard item={item} renderers={profileItemCardRenderers} fallbackRenderer={profileItemCardFallbackRenderer} />
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Right Column - Preview */}
				<aside className="offset-border hidden h-full min-w-0 flex-col rounded-2xl border-2 border-border/40 bg-surface/60 p-6 shadow-float xl:col-span-5 xl:flex">
					<h2 className="mb-4 font-semibold text-xl">Preview</h2>
					<div className="min-h-0 flex-1 overflow-hidden rounded-2xl">
						<ProfilePreviewFrame ref={previewFrameRef} handle={handle} lang={lang} className="h-full w-full" />
					</div>
				</aside>
			</article>

			<div className="fixed inset-x-0 bottom-0 z-30 bg-background md:hidden">
				<div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-linear-to-t from-background/90 to-transparent" />
				<div className="pointer-events-auto relative mx-auto flex w-full items-center gap-3 px-4 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom))]">
					<div className="relative flex-1 basis-0">
						<GlowEffect colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]} mode="colorShift" blur="soft" duration={3} scale={0.9} />
						<Button type="button" variant={"default"} size={"lg"} className="relative w-full dark:bg-foreground">
							Preview
						</Button>
					</div>
					<aside className="flex-1 basis-0">
						<AddItemDrawer pageId={pageId} />
					</aside>
				</div>
			</div>
		</section>
	);
}

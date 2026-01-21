import { SquareArrowOutUpRightIcon, UnlinkIcon } from "lucide-react";
import { type RefObject, useRef } from "react";
import { useActionData, useOutletContext, useParams } from "react-router";
import type { StudioOutletContext } from "types/studio.types";
import { Text } from "@/components/common/typhography";
import Iphone from "@/components/effects/iphone";
import { LocalizedLink } from "@/components/i18n/localized-link";
import AddItemDrawer from "@/components/studio/add-item-drawer";
import MobileProfilePreviewButton from "@/components/studio/mobile-profile-preview-button";
import PageDetailsEditor from "@/components/studio/page-details-editor";
import ProfileImageUploader from "@/components/studio/profile-image-uploader";
import { profileItemCardFallbackRenderer, profileItemCardRenderers } from "@/components/studio/profile-item-expandable-renderers";
import ProfilePreviewFrame from "@/components/studio/profile-preview-frame";
import SortableProfileItemList from "@/components/studio/sortable-profile-item-list";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { metadataConfig } from "@/config/metadata";
import { useIframePreview } from "@/hooks/use-iframe-preview";
import { getSupabaseServerClient } from "@/lib/supabase";
import {
	handleItemsReorder,
	handleLinkRemove,
	handleLinkSave,
	handleLinkToggle,
	handleLinkUpdate,
	handleMapSave,
	handleMapUpdate,
	handleMediaSave,
	handleMediaUpdate,
	handlePageDetails,
	handlePageVisibility,
	handleRemoveImage,
	handleSectionSave,
	handleSectionUpdate,
	handleTextSave,
	handleTextUpdate,
	handleUpdateImage,
	type PageProfileActionData,
} from "@/service/pages/page-profile.action";
import type { Route } from "./+types/($lang).studio.$handle.links";

export type ActionData = PageProfileActionData;

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
		"map-save",
		"map-update",
		"text-save",
		"text-update",
		"section-save",
		"section-update",
		"media-save",
		"media-update",
		"items-reorder",
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
		case "map-save":
			return handleMapSave({ formData, supabase });
		case "map-update":
			return handleMapUpdate({ formData, supabase });
		case "text-save":
			return handleTextSave({ formData, supabase });
		case "text-update":
			return handleTextUpdate({ formData, supabase });
		case "section-save":
			return handleSectionSave({ formData, supabase });
		case "section-update":
			return handleSectionUpdate({ formData, supabase });
		case "media-save":
			return handleMediaSave({ formData, supabase });
		case "media-update":
			return handleMediaUpdate({ formData, supabase });
		case "items-reorder":
			return handleItemsReorder({ formData, supabase });
		default:
			// 타입 시스템에서 도달 불가능한 코드
			return {
				formError: "Unhandled action intent",
				success: false,
			} satisfies ActionData;
	}
}

export default function StudioLinksRoute(_props: Route.ComponentProps) {
	const {
		page: { id: pageId, owner_id, title, description, image_url },
		handle,
		profileItems,
	} = useOutletContext<StudioOutletContext>();
	const { lang } = useParams();
	const actionData = useActionData<ActionData>();
	const previewFrameRef = useRef<HTMLIFrameElement>(null);

	const { handleIframeLoad } = useIframePreview({
		iframeRef: previewFrameRef,
		actionData,
	});

	return (
		<section className="flex min-h-0 min-w-0 grow flex-col gap-6">
			<article className="flex min-h-0 min-w-0 grow flex-col gap-5 xl:flex-row xl:justify-between">
				{/* Left Column - Profile & Links */}
				<div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 px-4 pt-14 pb-8 md:container md:mx-auto md:max-w-6xl md:px-4">
					<div className="overflow-hidden">
						<div className="flex items-center gap-2">
							{/* Profile Image */}
							<ProfileImageUploader pageId={pageId} userId={owner_id} imageUrl={image_url} alt={title ?? handle ?? "Profile image"} />

							{/* Profile Details */}
							<div className="min-w-0 flex-1">
								<PageDetailsEditor pageId={pageId} title={title} description={description} />
							</div>
						</div>
					</div>

					<div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
						{/* Section Header */}
						<div className="mb-3 flex items-center justify-between px-3">
							<Text.H4>My Links</Text.H4>

							<aside className="hidden md:block">
								<AddItemDrawer pageId={pageId} userId={owner_id} />
							</aside>
						</div>

						{/* Links List */}
						<div className="scrollbar-hide flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-scroll px-2 md:pb-16">
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
										<AddItemDrawer pageId={pageId} userId={owner_id} />
									</EmptyContent>
								</Empty>
							) : (
								<SortableProfileItemList
									items={profileItems}
									pageId={pageId}
									renderers={profileItemCardRenderers}
									fallbackRenderer={profileItemCardFallbackRenderer}
								/>
							)}
						</div>
					</div>
				</div>

				{/* Right Column - Preview */}
				<aside className="hidden h-full min-w-0 shrink-0 flex-col items-center gap-8 border-l p-6 pt-20 pb-8 xl:flex xl:w-[520px]">
					<div className="flex w-[360px] items-center justify-center gap-4 rounded-full border bg-muted/50 p-1.5 px-5">
						<p className="min-w-0 truncate text-sm">
							{metadataConfig.url}/{handle}
						</p>
						<Button
							size={"icon-sm"}
							variant={"ghost"}
							className={"rounded-md px-2 text-xs"}
							render={
								<LocalizedLink to={`/${handle}`}>
									<SquareArrowOutUpRightIcon />
								</LocalizedLink>
							}
						></Button>
					</div>
					<Iphone className="z-999">
						<ProfilePreviewFrame
							ref={previewFrameRef as RefObject<HTMLIFrameElement>}
							handle={handle}
							lang={lang}
							className="h-full w-full"
							onLoad={handleIframeLoad}
						/>
					</Iphone>
				</aside>
			</article>

			<div className="fixed inset-x-0 bottom-0 z-30 bg-background md:hidden">
				<div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-linear-to-t from-background/90 to-transparent" />
				<div className="pointer-events-auto relative mx-auto flex w-full items-center gap-3 px-4 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom))]">
					<MobileProfilePreviewButton handle={handle} lang={lang} />
					<aside className="flex-1 basis-0">
						<AddItemDrawer pageId={pageId} userId={owner_id} />
					</aside>
				</div>
			</div>
		</section>
	);
}

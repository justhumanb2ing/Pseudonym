import { useState } from "react";
import { useOutletContext } from "react-router";
import type { StudioOutletContext } from "types/studio.types";
import AddItemPopover from "@/components/page/add-item-popover";
import LinkSaveForm from "@/components/page/link-save-form";
import PageDetailsEditor from "@/components/page/page-details-editor";
import ProfileImageUploader from "@/components/page/profile-image-uploader";
import ProfileItemCollapsible from "@/components/page/profile-item-collapsible";
import type { ItemTypeId } from "@/constants/add-item-flow.data";
import { getSupabaseServerClient } from "@/lib/supabase";
import {
	handleLinkSave,
	handlePageDetails,
	handleRemoveImage,
	handleUpdateImage,
	type PageProfileActionData,
} from "@/service/pages/page-profile.action";
import type { Route } from "./+types/($lang).studio.$handle.links";

export type ActionData = PageProfileActionData;

export async function action(args: Route.ActionArgs) {
	const formData = await args.request.formData();
	const intent = formData.get("intent")?.toString();
	const supabase = await getSupabaseServerClient(args);
	// Intent 타입 검증
	const validIntents = ["page-details", "update-image", "remove-image", "link-save"] as const;

	if (!intent || typeof intent !== "string") {
		return {
			formError: "Action intent is required",
			success: false,
		} satisfies ActionData;
	}

	if (!validIntents.includes(intent as any)) {
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
		case "link-save":
			return handleLinkSave({ formData, supabase });
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
export default function StudioLinksRoute() {
	const {
		page: { id, owner_id, title, description, image_url },
		handle,
		profileItems,
	} = useOutletContext<StudioOutletContext>();

	const [selectedItemType, setSelectedItemType] = useState<ItemTypeId | null>(null);

	const handleSelectItem = (itemId: ItemTypeId) => {
		setSelectedItemType(itemId);
	};

	const handleLinkSaveSuccess = () => {
		setSelectedItemType(null);
	};

	const handleCancel = () => {
		setSelectedItemType(null);
	};

	return (
		<section className="flex grow flex-col gap-6 p-2 px-4 pb-6">
			<header className="flex items-center py-4 font-extrabold text-3xl md:text-5xl">
				<h1>Link</h1>
			</header>
			<article className="flex min-w-0 grow flex-row gap-6">
				<div className="flex min-w-0 basis-full flex-col gap-4 xl:basis-3/5">
					<aside className="flex h-fit items-center rounded-2xl bg-surface p-5 shadow-float">
						<div className="flex items-center gap-2">
							<ProfileImageUploader pageId={id} userId={owner_id} imageUrl={image_url} alt={title ?? handle ?? "Profile image"} />
							<PageDetailsEditor pageId={id} title={title} description={description} />
						</div>
					</aside>
					<main className="relative min-w-0 basis-full rounded-2xl bg-surface p-6 shadow-float">
						<h2 className="mb-4 font-semibold text-xl">My Links</h2>
						<div className="flex flex-col gap-3">
							{profileItems.map((item) => (
								<ProfileItemCollapsible key={item.id} item={item} />
							))}
						</div>

						{selectedItemType === "link" && (
							<div className="mt-4 rounded-2xl border border-border bg-background p-4">
								<LinkSaveForm pageId={id} onSuccess={handleLinkSaveSuccess} onCancel={handleCancel} />
							</div>
						)}

						<div className="absolute right-5 bottom-5">
							<AddItemPopover onSelectItem={handleSelectItem} />
						</div>
					</main>
				</div>
				<aside className="hidden h-full min-w-0 basis-2/5 rounded-2xl bg-surface p-6 shadow-float xl:block">
					<h2 className="mb-4 font-semibold text-xl">Preview</h2>
				</aside>
			</article>
		</section>
	);
}

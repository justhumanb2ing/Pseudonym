import { useState } from "react";
import { useFetcher } from "react-router";
import type { ProfileItemLayout, StudioOutletContext } from "types/studio.types";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ItemLayoutSelector from "@/components/studio/item-layout-selector";
import type { PageProfileActionData } from "@/service/pages/page-profile.action";

type ProfileItem = StudioOutletContext["profileItems"][number];

export function MediaItemExpandedContent({ item }: { item: ProfileItem }) {
	const updateFetcher = useFetcher<PageProfileActionData>();
	const deleteFetcher = useFetcher<PageProfileActionData>();
	const [open, setOpen] = useState(false);
	const isDeleting = deleteFetcher.state !== "idle";
	const isSaving = updateFetcher.state !== "idle";
	const formId = `media-item-edit-${item.id}`;
	const configData = item.config?.data;
	const defaultCaption = configData?.caption ?? "";
	const defaultUrl = configData?.url ?? "";
	const mediaUrl = configData?.media_url ?? "";
	const mediaType = configData?.media_type ?? "image";
	const [layout, setLayout] = useState<ProfileItemLayout>(item.config?.style?.layout ?? "compact");
	const updateError =
		updateFetcher.data?.intent === "media-update" && !updateFetcher.data?.success ? updateFetcher.data.formError : undefined;

	const handleConfirmDelete = () => {
		setOpen(false);
		deleteFetcher.submit(
			{ intent: "link-remove", itemId: item.id },
			{
				method: "post",
			},
		);
	};

	return (
		<div className="flex h-full w-full flex-col justify-between gap-5">
			<updateFetcher.Form id={formId} method="post" className="flex flex-col gap-4">
				<input type="hidden" name="intent" value="media-update" />
				<input type="hidden" name="itemId" value={item.id} />
				<input type="hidden" name="layout" value={layout} />
				{mediaUrl ? (
					<div
						className={
							mediaType === "video"
								? "relative aspect-video w-full overflow-hidden rounded-2xl bg-muted/60"
								: "relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/60"
						}
					>
						{mediaType === "video" ? (
							<video src={mediaUrl} className="h-full w-full object-cover" preload="metadata" playsInline muted loop autoPlay>
								<track kind="captions" />
							</video>
						) : (
							<img src={mediaUrl} alt={defaultCaption || "Media"} className="h-full w-full object-cover" />
						)}
					</div>
				) : null}
				<Field>
					<FieldContent>
						<div className="relative">
							<FieldLabel
								htmlFor={`media-item-caption-${item.id}`}
								className="pointer-events-none absolute top-0 left-0 z-10 w-full rounded-lg bg-muted pt-2 pl-3 text-muted-foreground text-sm"
							>
								Caption
							</FieldLabel>
							<Textarea
								id={`media-item-caption-${item.id}`}
								name="caption"
								defaultValue={defaultCaption}
								autoComplete="off"
								placeholder="Add a caption..."
								className="max-h-32 overflow-y-auto rounded-lg border-0 px-3 pt-8"
							/>
						</div>
					</FieldContent>
				</Field>
				<Field>
					<FieldContent>
						<div className="relative">
							<FieldLabel
								htmlFor={`media-item-url-${item.id}`}
								className="pointer-events-none absolute top-2 left-3 text-muted-foreground text-sm"
							>
								URL
							</FieldLabel>
							<Input
								id={`media-item-url-${item.id}`}
								name="url"
								defaultValue={defaultUrl}
								autoComplete="off"
								placeholder="https://"
								className="h-16 rounded-lg border-0 px-3 pt-8"
							/>
						</div>
					</FieldContent>
				</Field>
				{updateError ? <p className="text-destructive text-sm">{updateError}</p> : null}
				<ItemLayoutSelector value={layout} onChange={setLayout} disabled={isSaving} />
			</updateFetcher.Form>
			<footer className="flex items-center gap-3">
				<AlertDialog open={open} onOpenChange={setOpen}>
					<AlertDialogTrigger
						render={
							<Button variant={"destructive"} size={"lg"} className="flex-1 basis-0" disabled={isDeleting}>
								{isDeleting ? "Deleting..." : "Delete"}
							</Button>
						}
					/>
					<AlertDialogContent
						className={"p-5"}
						onMouseDown={(event) => event.stopPropagation()}
						onTouchStart={(event) => event.stopPropagation()}
					>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete media?</AlertDialogTitle>
							<AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel variant={"secondary"} disabled={isDeleting} className={"flex-1 basis-0"}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								variant="destructive"
								onClick={handleConfirmDelete}
								disabled={isDeleting}
								aria-busy={isDeleting}
								className={"flex-1 basis-0"}
							>
								{isDeleting ? "Deleting..." : "Delete"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
				<Button variant={"brand"} size={"lg"} className="flex-1 basis-0" type="submit" form={formId} disabled={isSaving}>
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</footer>
		</div>
	);
}

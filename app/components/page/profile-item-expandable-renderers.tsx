import { useState } from "react";
import { useFetcher } from "react-router";
import type { StudioOutletContext } from "types/studio.types";
import type { ExpandableCardRenderer } from "@/components/effects/expandable-card";
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
import { Switch } from "@/components/ui/switch";
import type { PageProfileActionData } from "@/service/pages/page-profile.action";

type ProfileItem = StudioOutletContext["profileItems"][number];

export const profileItemCardRenderers: Record<string, ExpandableCardRenderer<ProfileItem>> = {
	link: {
		summary: (item) => {
			const imageUrl = item.data.config?.icon_url ?? item.data.config?.image_url ?? undefined;
			const descriptionText = item.data.config?.site_name ?? undefined;
			const isActive = Boolean(item.data.is_active);
			return {
				title: item.data.title ?? item.data.type ?? "Untitled",
				description: descriptionText,
				imageUrl,
				ctaContent: <Switch defaultChecked={isActive} />,
			};
		},
		expanded: (item) => {
			const imageUrl = item.data.config?.icon_url ?? item.data.config?.image_url ?? undefined;
			const descriptionText = item.data.config?.site_name ?? undefined;
			const isActive = Boolean(item.data.is_active);
			return {
				title: item.data.title ?? item.data.type ?? "Untitled",
				description: descriptionText,
				imageUrl,
				ctaContent: <Switch defaultChecked={isActive} />,
				content: <ProfileItemExpandedContent item={item.data} />,
			};
		},
	},
};

export const profileItemCardFallbackRenderer: ExpandableCardRenderer<ProfileItem> = {
	summary: (item) => ({
		title: item.data.type ?? "Item",
	}),
	expanded: () => ({
		content: <div className="px-4 py-6 text-center text-neutral-500 text-sm">No content yet.</div>,
	}),
};

export function ProfileItemExpandedContent({ item }: { item: ProfileItem }) {
	const fetcher = useFetcher<PageProfileActionData>();
	const [open, setOpen] = useState(false);
	const isDeleting = fetcher.state !== "idle";

	const handleConfirmDelete = () => {
		setOpen(false);
		fetcher.submit(
			{ intent: "link-remove", itemId: item.id },
			{
				method: "post",
			},
		);
	};

	return (
		<div className="flex h-full w-full flex-col justify-between gap-5">
			<div className="flex flex-col gap-4">
				<Field>
					<FieldContent>
						<div className="relative">
							<FieldLabel
								htmlFor={`profile-item-title-${item.id}`}
								className="pointer-events-none absolute top-2 left-3 text-muted-foreground text-sm"
							>
								Title
							</FieldLabel>
							<Input
								id={`profile-item-title-${item.id}`}
								defaultValue={item.title ?? ""}
								autoComplete="off"
								readOnly
								placeholder="Title"
								className="h-16 rounded-lg border-0 px-3 pt-8"
							/>
						</div>
					</FieldContent>
				</Field>
				<Field>
					<FieldContent>
						<div className="relative">
							<FieldLabel
								htmlFor={`profile-item-url-${item.id}`}
								className="pointer-events-none absolute top-2 left-3 text-muted-foreground text-sm"
							>
								URL
							</FieldLabel>
							<Input
								id={`profile-item-url-${item.id}`}
								defaultValue={item.url ?? ""}
								autoComplete="off"
								readOnly
								placeholder="example.com"
								className="h-16 rounded-lg border-0 px-3 pt-8"
							/>
						</div>
					</FieldContent>
				</Field>
			</div>
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
							<AlertDialogTitle>Delete link?</AlertDialogTitle>
							<AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel variant={'secondary'} disabled={isDeleting} className={"flex-1 basis-0"}>
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
				<Button variant={"brand"} size={"lg"} className="flex-1 basis-0">
					Save
				</Button>
			</footer>
		</div>
	);
}

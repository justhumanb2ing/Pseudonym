import { useState } from "react";
import { useFetcher } from "react-router";
import type { StudioOutletContext } from "types/studio.types";
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
import type { PageProfileActionData } from "@/service/pages/page-profile.action";

type ProfileItem = StudioOutletContext["profileItems"][number];

export function ProfileItemExpandedContent({ item }: { item: ProfileItem }) {
	const updateFetcher = useFetcher<PageProfileActionData>();
	const deleteFetcher = useFetcher<PageProfileActionData>();
	const [open, setOpen] = useState(false);
	const isDeleting = deleteFetcher.state !== "idle";
	const isSaving = updateFetcher.state !== "idle";
	const formId = `profile-item-edit-${item.id}`;
	const configData = item.config?.data;
	const defaultTitle = configData?.title ?? "";
	const defaultUrl = configData?.url ?? "";
	const updateError =
		updateFetcher.data?.intent === "link-update" && !updateFetcher.data?.success ? updateFetcher.data.formError : undefined;

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
				<input type="hidden" name="intent" value="link-update" />
				<input type="hidden" name="itemId" value={item.id} />
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
								name="title"
								defaultValue={defaultTitle}
								autoComplete="off"
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
								name="url"
								defaultValue={defaultUrl}
								autoComplete="off"
								required
								placeholder="example.com"
								className="h-16 rounded-lg border-0 px-3 pt-8"
							/>
						</div>
					</FieldContent>
				</Field>
				{updateError ? <p className="text-destructive text-sm">{updateError}</p> : null}
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
							<AlertDialogTitle>Delete link?</AlertDialogTitle>
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

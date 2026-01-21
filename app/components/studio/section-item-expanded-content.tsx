import { type ChangeEvent, useState } from "react";
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

const MAX_HEADLINE_LENGTH = 50;

type ProfileItem = StudioOutletContext["profileItems"][number];

export function SectionItemExpandedContent({ item }: { item: ProfileItem }) {
	const updateFetcher = useFetcher<PageProfileActionData>();
	const deleteFetcher = useFetcher<PageProfileActionData>();
	const [open, setOpen] = useState(false);
	const isDeleting = deleteFetcher.state !== "idle";
	const isSaving = updateFetcher.state !== "idle";
	const formId = `section-item-edit-${item.id}`;
	const configData = item.config?.data;
	const defaultHeadline = configData?.headline ?? "";
	const [headlineValue, setHeadlineValue] = useState(defaultHeadline);
	const headlineLength = headlineValue.length;
	const isHeadlineMissing = headlineValue.trim().length === 0;
	const isHeadlineTooLong = headlineLength > MAX_HEADLINE_LENGTH;
	const updateError =
		updateFetcher.data?.intent === "section-update" && !updateFetcher.data?.success ? updateFetcher.data.formError : undefined;

	const handleConfirmDelete = () => {
		setOpen(false);
		deleteFetcher.submit(
			{ intent: "link-remove", itemId: item.id },
			{
				method: "post",
			},
		);
	};

	const handleHeadlineChange = (event: ChangeEvent<HTMLInputElement>) => {
		const nextValue = event.target.value.slice(0, MAX_HEADLINE_LENGTH);
		setHeadlineValue(nextValue);
	};

	return (
		<div className="flex h-full w-full flex-col justify-between gap-5">
			<updateFetcher.Form id={formId} method="post" className="flex flex-col gap-4">
				<input type="hidden" name="intent" value="section-update" />
				<input type="hidden" name="itemId" value={item.id} />
				<Field>
					<FieldContent>
						<div className="relative">
							
							<Input
								id={`section-item-headline-${item.id}`}
								name="headline"
								value={headlineValue}
								onChange={handleHeadlineChange}
								autoComplete="off"
								required
								maxLength={MAX_HEADLINE_LENGTH}
								placeholder="Enter headline..."
								className="h-12 rounded-lg border-0 px-3"
								aria-invalid={isHeadlineMissing || isHeadlineTooLong}
							/>
						</div>
						<p className="mt-1 text-right text-muted-foreground text-xs">
							{headlineLength}/{MAX_HEADLINE_LENGTH}
						</p>
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
							<AlertDialogTitle>Delete section?</AlertDialogTitle>
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
				<Button
					variant={"brand"}
					size={"lg"}
					className="flex-1 basis-0"
					type="submit"
					form={formId}
					disabled={isSaving || isHeadlineMissing || isHeadlineTooLong}
				>
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</footer>
		</div>
	);
}

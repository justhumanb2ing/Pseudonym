import { ALargeSmallIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type ProfileItem = StudioOutletContext["profileItems"][number];

type ProfileItemCollapsibleProps = {
	item: ProfileItem;
	isDeleteDisabled?: boolean;
	onDelete?: (item: ProfileItem) => void;
};

export default function ProfileItemCollapsible({ item, isDeleteDisabled = false, onDelete }: ProfileItemCollapsibleProps) {
	const { id, title, url, is_active, config } = item;
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const handleConfirmDelete = () => {
		setIsDeleteOpen(false);
		onDelete?.(item);
	};

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className="group/collapsible"
			render={
				<div className="group flex flex-col gap-2 rounded-2xl border border-border/60 bg-surface/60 p-2 transition-colors">
					<div>
						<div className="flex items-center justify-between p-3">
							<div className="flex min-w-0 basis-2/3 items-center gap-3">
								<aside className="size-8 shrink-0 overflow-hidden rounded-sm">
									<img src={config?.icon_url ?? undefined} alt={title} className="h-full w-full object-cover" />
								</aside>
								<div className="min-w-0">
									<p className="line-clamp-1 w-full truncate text-sm">{title}</p>
									<p className="line-clamp-1 truncate text-muted-foreground text-xs/relaxed">{config?.site_name}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Switch defaultChecked={is_active} />
								<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
									<AlertDialogTrigger
										render={
											<Button
												type="button"
												variant={"ghost"}
												size={"icon-sm"}
												aria-label="Delete link"
												disabled={isDeleteDisabled}
												className="text-destructive hover:text-destructive"
											>
												<Trash2Icon strokeWidth={1.5} />
											</Button>
										}
									/>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Delete link?</AlertDialogTitle>
											<AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel disabled={isDeleteDisabled}>Cancel</AlertDialogCancel>
											<AlertDialogAction
												type="button"
												variant="destructive"
												onClick={handleConfirmDelete}
												disabled={isDeleteDisabled}
												aria-busy={isDeleteDisabled}
											>
												Delete
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>
					</div>
					<div className="ml-2">
						<CollapsibleTrigger
							render={
								<Button variant={"ghost"} size={"icon-sm"} className={"rounded-md"}>
									<ALargeSmallIcon strokeWidth={1.5} />
								</Button>
							}
						></CollapsibleTrigger>
					</div>

					<CollapsibleContent className="flex w-full flex-col gap-3 py-4">
						<div className="flex flex-col gap-4 px-3 pb-3">
							<Field>
								<FieldContent>
									<div className="relative">
										<FieldLabel
											htmlFor={`profile-item-title-${id}`}
											className="pointer-events-none absolute top-2 left-3 text-muted-foreground text-sm"
										>
											Title
										</FieldLabel>
										<Input
											id={`profile-item-title-${id}`}
											name="title"
											defaultValue={title ?? ""}
											autoFocus
											autoComplete="off"
											placeholder="Title"
											className="h-16 rounded-lg px-3 pt-8"
										/>
									</div>
								</FieldContent>
							</Field>
							<Field>
								<FieldContent>
									<div className="relative">
										<FieldLabel
											htmlFor={`profile-item-url-${id}`}
											className="pointer-events-none absolute top-2 left-3 text-muted-foreground text-sm"
										>
											URL
										</FieldLabel>
										<Input
											id={`profile-item-url-${id}`}
											name="url"
											defaultValue={url ?? ""}
											autoComplete="off"
											placeholder="example.com"
											className="h-16 rounded-lg px-3 pt-8"
										/>
									</div>
								</FieldContent>
							</Field>
						</div>
						<footer className="flex items-center gap-3 px-3 pb-3">
							<Button variant={"ghost"} className="grow" onClick={() => setIsOpen(false)}>
								Cancel
							</Button>
							<Button variant={"brand"} className="grow">
								Save
							</Button>
						</footer>
					</CollapsibleContent>
				</div>
			}
		></Collapsible>
	);
}

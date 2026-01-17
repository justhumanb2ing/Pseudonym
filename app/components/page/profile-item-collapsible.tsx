import { ALargeSmallIcon } from "lucide-react";
import { useState } from "react";
import type { StudioOutletContext } from "types/studio.types";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type ProfileItem = StudioOutletContext["profileItems"][number];

type ProfileItemCollapsibleProps = {
	item: ProfileItem;
};

export default function ProfileItemCollapsible({ item }: ProfileItemCollapsibleProps) {
	const { id, title, url, is_active, config } = item;
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className="group/collapsible"
			render={
				<div className="group offset-border flex flex-col gap-2 rounded-2xl border bg-surface p-2 transition-colors">
					<div>
						<div className="flex items-center justify-between p-3">
							<div className="flex min-w-0 basis-2/3 items-center gap-3">
								<aside className="size-8 overflow-hidden rounded-sm">
									<img src={config?.icon_url ?? undefined} alt={title} className="h-full w-full object-cover" />
								</aside>
								<div className="min-w-0">
									<p className="line-clamp-1 w-full truncate text-sm">{title}</p>
									<p className="line-clamp-1 truncate text-muted-foreground text-xs/relaxed">{url}</p>
								</div>
							</div>
							<div>
								<Switch defaultChecked={is_active} />
							</div>
						</div>
					</div>
					<div className="ml-2">
						<CollapsibleTrigger
							render={
								<Button variant={"ghost"} size={"icon-sm"} className={"rounded-md"}>
									<ALargeSmallIcon strokeWidth={1.5}/>
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

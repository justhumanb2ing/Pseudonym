import type { StudioOutletContext } from "types/studio.types";
import { Item, ItemContent, ItemFooter, ItemMedia, ItemTitle } from "@/components/ui/item";

type ProfileItem = StudioOutletContext["profileItems"][number];

interface LinkItemProps {
	item: ProfileItem;
}

export default function LinkItem({ item }: LinkItemProps) {
	const config = item.config;
	const linkData = config?.data;
	const linkTitle = linkData?.title ?? "Untitled";
	const linkUrl = linkData?.url ?? "";
	const iconUrl = linkData?.icon_url;

	return (
		<Item
			variant={"muted"}
			className="p-3"
			render={
				<a href={linkUrl} target="_blank" rel="noreferrer" className="min-w-0">
					<ItemMedia variant={"image"} className="size-9 overflow-hidden md:size-10">
						{iconUrl ? (
							<img src={iconUrl} alt={linkTitle} className="size-full object-cover" />
						) : (
							<img src={"/no-favicon.png"} alt="" className="size-full object-cover" />
						)}
					</ItemMedia>
					<ItemContent className="min-w-0 flex-1">
						<ItemTitle className="block min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-base">
							{linkTitle}
						</ItemTitle>
						{/* {description ? <ItemDescription>{description}</ItemDescription> : null} */}
					</ItemContent>
					{config?.style?.layout === "full" && (
						<ItemFooter className="mt-4 flex-col items-end gap-1">
							<div className="mr-1 text-muted-foreground text-xs/relaxed">{config.data?.site_name}</div>
							<div className="h-40 w-full overflow-hidden rounded-lg">
								{config.data?.image_url ? (
									<img src={config.data?.image_url} alt={linkTitle} className="h-full w-full object-cover" />
								) : (
									<img src={"/cat-blunge.png"} alt="meow" className="h-full w-full object-contain" />
								)}
							</div>
						</ItemFooter>
					)}
				</a>
			}
		></Item>
	);
}

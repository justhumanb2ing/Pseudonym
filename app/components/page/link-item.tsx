import type { StudioOutletContext } from "types/studio.types";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";

type ProfileItem = StudioOutletContext["profileItems"][number];

interface LinkItemProps {
	item: ProfileItem;
}

export default function LinkItem({ item }: LinkItemProps) {
	const _description = item.config?.description ?? item.url;
	const mediaUrl = item.config?.image_url ?? item.config?.icon_url;

	return (
		<Item
			variant={"muted"}
			className="p-3"
			render={
				<a href={item.url} target="_blank" rel="noreferrer" className="min-w-0">
					{mediaUrl ? (
						<ItemMedia variant={"image"} className="size-9 overflow-hidden md:size-10">
							<img src={item.config?.icon_url ?? ""} alt={item.title} className="size-full object-cover" />
						</ItemMedia>
					) : null}
					<ItemContent className="min-w-0 flex-1">
						<ItemTitle className="block min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-base">
							{item.title}
						</ItemTitle>
						{/* {description ? <ItemDescription>{description}</ItemDescription> : null} */}
					</ItemContent>
					{/* <ItemActions>
						<div className="size-6 rounded-full border bg-white">
							<ArrowCircleUpRightIcon weight="fill" className="size-full text-black" />
						</div>
					</ItemActions> */}
				</a>
			}
		></Item>
	);
}

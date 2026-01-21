import type { StudioOutletContext } from "types/studio.types";
import { Item, ItemContent } from "@/components/ui/item";

type ProfileItem = StudioOutletContext["profileItems"][number];

interface TextItemProps {
	item: ProfileItem;
}

export default function TextItem({ item }: TextItemProps) {
	const textData = item.config?.data;
	const textTitle = textData?.title ?? "";

	return (
		<Item variant={"muted"} className="p-4">
			<ItemContent className="min-w-0 flex-1">
				<p className="whitespace-pre-wrap break-words text-base">{textTitle}</p>
			</ItemContent>
		</Item>
	);
}

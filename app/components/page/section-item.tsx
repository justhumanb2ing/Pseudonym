import type { StudioOutletContext } from "types/studio.types";
import { Item, ItemContent } from "@/components/ui/item";

type ProfileItem = StudioOutletContext["profileItems"][number];

interface SectionItemProps {
	item: ProfileItem;
}

export default function SectionItem({ item }: SectionItemProps) {
	const sectionData = item.config?.data;
	const headline = sectionData?.headline ?? "";

	return (
		<Item variant={"default"} className="mt-6 p-2">
			<ItemContent className="min-w-0 flex-1">
				<p className="wrap-break-word whitespace-pre-wrap font-bold text-xl">{headline}</p>
			</ItemContent>
		</Item>
	);
}

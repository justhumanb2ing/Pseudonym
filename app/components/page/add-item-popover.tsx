import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { ITEM_TYPES, type ItemTypeId } from "@/constants/add-item-flow.data";
import { useMediaQuery } from "@/hooks/use-media-query";

type AddItemPopoverProps = {
	onSelectItem: (itemId: ItemTypeId) => void;
};

export default function AddItemPopover({ onSelectItem }: AddItemPopoverProps) {
	const [open, setOpen] = useState(false);
	const isMobile = useMediaQuery("(max-width: 767px)");

	if (isMobile) {
		return null;
	}

	const handleItemClick = (itemId: ItemTypeId) => {
		if (itemId === "link") {
			onSelectItem(itemId);
			setOpen(false);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button variant="brand" className={"rounded-xl px-6 text-base text-white"}>
						Add
					</Button>
				}
			></PopoverTrigger>

			<PopoverContent className="w-40 p-2 ring-0" align="end" sideOffset={8}>
				<PopoverHeader hidden>
					<PopoverTitle>Add Item</PopoverTitle>
					<PopoverDescription>Choose an item type to add</PopoverDescription>
				</PopoverHeader>

				<div className="flex flex-col gap-1">
					{ITEM_TYPES.map((item) => (
						<Button
							key={item.id}
							variant="ghost"
							size="default"
							disabled={item.id !== "link"}
							onClick={() => handleItemClick(item.id)}
							className="justify-start rounded-lg py-5 font-normal text-base"
						>
							{item.title}
						</Button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}

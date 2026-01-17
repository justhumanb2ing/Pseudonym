import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { ITEM_TYPES, type ItemTypeId } from "@/constants/add-item-flow.data";

type AddItemPopoverProps = {
	onSelectItem: (itemId: ItemTypeId) => void;
};

export default function AddItemPopover({ onSelectItem }: AddItemPopoverProps) {
	const [open, setOpen] = useState(false);

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
					<Button variant="brand" size="icon-lg">
						<IconPlus className="size-6" strokeWidth={2.5} />
						{/* Add */}
					</Button>
				}
			></PopoverTrigger>

			<PopoverContent className="w-56" align='end' sideOffset={8}>
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
							className="justify-start rounded-lg py-5 font-normal text-lg"
						>
							{item.title}
						</Button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}

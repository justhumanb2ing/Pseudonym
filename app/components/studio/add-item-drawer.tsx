import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Activity } from "@/components/common/activity";
import LinkSaveForm from "@/components/studio/link-save-form";
import TextSaveForm from "@/components/studio/text-save-form";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ITEM_TYPES, type ItemTypeId } from "@/constants/add-item-flow.data";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type AddItemDrawerProps = {
	pageId: string;
};

const DEFAULT_DIRECTION = 1;

export default function AddItemDrawer({ pageId }: AddItemDrawerProps) {
	const [open, setOpen] = useState(false);
	const [selectedItemType, setSelectedItemType] = useState<ItemTypeId | null>(null);
	const [direction, setDirection] = useState<1 | -1>(DEFAULT_DIRECTION);
	const isDesktop = useMediaQuery("(min-width: 1280px)");

	const isDetailView = selectedItemType !== null;
	const selectedItem = ITEM_TYPES.find((item) => item.id === selectedItemType);
	const detailTitle = selectedItem?.title ?? "Item";

	const resetSelection = () => {
		setSelectedItemType(null);
		setDirection(DEFAULT_DIRECTION);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) {
			resetSelection();
		}
	};

	const handleSelectItem = (itemId: ItemTypeId) => {
		setDirection(1);
		setSelectedItemType(itemId);
	};

	const handleBack = () => {
		setDirection(-1);
		setSelectedItemType(null);
	};

	const handleSuccess = () => {
		setOpen(false);
		setSelectedItemType(null);
	};

	return (
		<Drawer open={open} onOpenChange={handleOpenChange}>
			<DrawerTrigger asChild>
				<Button
					variant={"brand"}
					size={isDesktop ? "default" : "lg"}
					className={cn("w-full rounded-xl px-6 text-base text-white")}
				>
					Add
				</Button>
			</DrawerTrigger>
			<DrawerContent className="max-h-[560px] overflow-hidden">
				<motion.div
					layout="size"
					className="flex min-h-0 flex-col overflow-hidden"
					transition={{ type: "spring", stiffness: 500, damping: 45 }}
				>
					<DrawerHeader className="h-14 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left">
						{isDetailView ? (
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									onClick={handleBack}
									className={"rounded-md"}
									aria-label="Back to item type selection"
								>
									<ChevronLeft className="size-6" />
								</Button>
								<DrawerTitle className="font-semibold text-base md:text-xl">{detailTitle}</DrawerTitle>
							</div>
						) : (
							<DrawerTitle className="font-semibold text-base md:text-xl">Select type</DrawerTitle>
						)}
					</DrawerHeader>
					<section className="min-h-0 flex-1 overflow-hidden p-2">
						<AnimatePresence mode="wait" initial={false}>
							<motion.div
								key={isDetailView ? `detail-${selectedItemType ?? "unknown"}` : "item-select"}
								layout
								className="h-full"
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								transition={{ duration: 0.18 }}
							>
								<Activity
									activeKey={isDetailView ? (selectedItemType ?? "detail") : "item-select"}
									direction={direction}
									className="h-full"
									contentClassName="h-full"
								>
									{isDetailView ? (
										<div className="flex h-full flex-col gap-4">
											{selectedItemType === "link" ? (
												<LinkSaveForm pageId={pageId} onSuccess={handleSuccess} onCancel={handleBack} />
											) : selectedItemType === "text" ? (
												<TextSaveForm pageId={pageId} onSuccess={handleSuccess} onCancel={handleBack} />
											) : (
												<ItemTypePlaceholder title={detailTitle} description={selectedItem?.description} />
											)}
										</div>
									) : (
										<ul className="scrollbar-hide flex max-h-full flex-col gap-1 overflow-y-auto">
											{ITEM_TYPES.map((item) => (
												<li key={item.id}>
													<Button variant="ghost" size="lg" onClick={() => handleSelectItem(item.id)} className="w-full justify-start">
														{item.title}
													</Button>
												</li>
											))}
										</ul>
									)}
								</Activity>
							</motion.div>
						</AnimatePresence>
					</section>
					{!isDetailView && (
						<DrawerFooter className="flex-row">
							<DrawerClose asChild>
								<Button variant="secondary" size={"lg"} className={"flex-1 basis-0"}>
									Cancel
								</Button>
							</DrawerClose>
						</DrawerFooter>
					)}
				</motion.div>
			</DrawerContent>
		</Drawer>
	);
}

type ItemTypePlaceholderProps = {
	title: string;
	description?: string;
};

function ItemTypePlaceholder({ title, description }: ItemTypePlaceholderProps) {
	return (
		<div className="rounded-xl border border-border/70 border-dashed bg-muted/30 p-4">
			<p className="font-medium text-sm">{title} is coming soon.</p>
			<p className="text-muted-foreground text-xs/relaxed">{description ?? "This item type is not available yet."}</p>
		</div>
	);
}

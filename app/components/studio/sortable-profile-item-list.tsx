/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: <explanation> */
import {
	closestCenter,
	DndContext,
	type DragCancelEvent,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	type UniqueIdentifier,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { StudioOutletContext } from "types/studio.types";
import type { ExpandableCardItem, ExpandableCardRenderer } from "@/components/effects/expandable-card";
import { ExpandableCard } from "@/components/effects/expandable-card";
import { cn } from "@/lib/utils";
import type { PageProfileActionData } from "@/service/pages/page-profile.action";

type ProfileItem = StudioOutletContext["profileItems"][number];

type SortableProfileItemListProps = {
	items: ProfileItem[];
	pageId: string;
	renderers: Record<string, ExpandableCardRenderer<ProfileItem>>;
	fallbackRenderer?: ExpandableCardRenderer<ProfileItem>;
};

const dragHandleLabel = "Reorder item";

function toExpandableItems(items: ProfileItem[]): ExpandableCardItem<ProfileItem>[] {
	return items.map((item) => ({
		id: item.id,
		type: item.type,
		data: item,
	}));
}

function sortItemsByIds(items: ProfileItem[], orderedIds: string[]) {
	const itemMap = new Map(items.map((item) => [item.id, item]));
	const sorted: ProfileItem[] = [];

	orderedIds.forEach((id) => {
		const item = itemMap.get(id);
		if (item) {
			sorted.push(item);
			itemMap.delete(id);
		}
	});

	itemMap.forEach((item) => sorted.push(item));
	return sorted;
}

function DragHandle({
	listeners,
	attributes,
	setActivatorNodeRef,
}: {
	listeners: ReturnType<typeof useSortable>["listeners"];
	attributes: ReturnType<typeof useSortable>["attributes"];
	setActivatorNodeRef: ReturnType<typeof useSortable>["setActivatorNodeRef"];
}) {
	return (
		<button
			ref={setActivatorNodeRef}
			type="button"
			className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/80 hover:text-foreground active:cursor-grabbing"
			aria-label={dragHandleLabel}
			onClick={(event) => event.stopPropagation()}
			onPointerDown={(event) => event.stopPropagation()}
			{...attributes}
			{...listeners}
		>
			<GripVerticalIcon className="h-4 w-4" />
		</button>
	);
}

function SortableProfileItem({
	item,
	renderers,
	fallbackRenderer,
}: {
	item: ExpandableCardItem<ProfileItem>;
	renderers: Record<string, ExpandableCardRenderer<ProfileItem>>;
	fallbackRenderer?: ExpandableCardRenderer<ProfileItem>;
}) {
	const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style} className={cn("relative", isDragging && "opacity-60")}>
			<ExpandableCard
				item={item}
				renderers={renderers}
				fallbackRenderer={fallbackRenderer}
				summaryClassName=""
				summaryTrailing={<DragHandle attributes={attributes} listeners={listeners} setActivatorNodeRef={setActivatorNodeRef} />}
			/>
		</div>
	);
}

function DragOverlayCard({
	item,
	renderers,
	fallbackRenderer,
}: {
	item: ExpandableCardItem<ProfileItem> | null;
	renderers: Record<string, ExpandableCardRenderer<ProfileItem>>;
	fallbackRenderer?: ExpandableCardRenderer<ProfileItem>;
}) {
	if (!item) {
		return null;
	}

	return (
		<div className="pointer-events-none">
			<ExpandableCard
				item={item}
				renderers={renderers}
				fallbackRenderer={fallbackRenderer}
				enableExpand={false}
				summaryClassName="border-[0.5px] shadow-float"
			/>
		</div>
	);
}

export default function SortableProfileItemList({ items, pageId, renderers, fallbackRenderer }: SortableProfileItemListProps) {
	const fetcher = useFetcher<PageProfileActionData>();
	const [orderedItems, setOrderedItems] = useState(items);
	const [activeId, setActiveId] = useState<string | null>(null);
	const stableOrderRef = useRef(items.map((item) => item.id));
	const pendingOrderRef = useRef<string[] | null>(null);

	useEffect(() => {
		setOrderedItems(items);
		stableOrderRef.current = items.map((item) => item.id);
	}, [items]);

	useEffect(() => {
		if (!fetcher.data || fetcher.data.intent !== "items-reorder") {
			return;
		}

		if (fetcher.data.success) {
			if (pendingOrderRef.current) {
				stableOrderRef.current = pendingOrderRef.current;
			}
			pendingOrderRef.current = null;
			return;
		}

		if (fetcher.data.success === false) {
			setOrderedItems((current) => sortItemsByIds(current, stableOrderRef.current));
			pendingOrderRef.current = null;
		}
	}, [fetcher.data]);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const accessibility = useMemo(() => {
		const getPosition = (id: UniqueIdentifier) => orderedItems.findIndex((item) => String(item.id) === String(id)) + 1;
		const itemCount = orderedItems.length;

		return {
			announcements: {
				onDragStart({ active }: DragStartEvent) {
					const position = getPosition(active.id);
					return `Picked up item ${active.id}. Position ${position} of ${itemCount}.`;
				},
				onDragOver({ active, over }: DragOverEvent) {
					if (!over) {
						return;
					}
					const position = getPosition(over.id);
					return `Item ${active.id} moved to position ${position} of ${itemCount}.`;
				},
				onDragEnd({ active, over }: DragEndEvent) {
					if (!over) {
						return;
					}
					const position = getPosition(over.id);
					return `Item ${active.id} dropped at position ${position} of ${itemCount}.`;
				},
				onDragCancel({ active }: DragCancelEvent) {
					return `Dragging cancelled. Item ${active.id} returned.`;
				},
			},
		};
	}, [orderedItems]);

	const expandableItems = useMemo(() => toExpandableItems(orderedItems), [orderedItems]);
	const activeItem = useMemo(
		() => (activeId ? (expandableItems.find((item) => item.id === activeId) ?? null) : null),
		[activeId, expandableItems],
	);

	const handleSubmitOrder = (orderedIds: string[]) => {
		const formData = new FormData();
		formData.set("intent", "items-reorder");
		formData.set("pageId", pageId);
		orderedIds.forEach((id) => formData.append("orderedIds", id));
		fetcher.submit(formData, { method: "post" });
	};

	const handleDragStart = (event: { active: { id: string | number } }) => {
		setActiveId(String(event.active.id));
	};

	const handleDragCancel = () => {
		setActiveId(null);
	};

	const handleDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
		setActiveId(null);

		if (!event.over || event.active.id === event.over.id) {
			return;
		}

		setOrderedItems((current) => {
			const oldIndex = current.findIndex((item) => item.id === event.active.id);
			const newIndex = current.findIndex((item) => item.id === event.over?.id);
			if (oldIndex < 0 || newIndex < 0) {
				return current;
			}

			const next = arrayMove(current, oldIndex, newIndex);
			pendingOrderRef.current = next.map((item) => item.id);
			handleSubmitOrder(pendingOrderRef.current);
			return next;
		});
	};

	if (items.length === 0) {
		return null;
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			accessibility={accessibility}
			onDragStart={handleDragStart}
			onDragCancel={handleDragCancel}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={expandableItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
				<div className="min-w-0 space-y-1">
					{expandableItems.map((item) => (
						<div key={item.id} className="fade-in slide-in-from-bottom-1 min-w-0 animate-in">
							<SortableProfileItem item={item} renderers={renderers} fallbackRenderer={fallbackRenderer} />
						</div>
					))}
				</div>
			</SortableContext>
			<DragOverlay>
				<DragOverlayCard item={activeItem} renderers={renderers} fallbackRenderer={fallbackRenderer} />
			</DragOverlay>
		</DndContext>
	);
}

export type { SortableProfileItemListProps };
export { dragHandleLabel };

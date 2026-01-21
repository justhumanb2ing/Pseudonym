import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import SortableProfileItemList, { dragHandleLabel } from "@/components/studio/sortable-profile-item-list";
import type { StudioOutletContext } from "types/studio.types";

vi.mock("react-router", async () => {
	const actual = await vi.importActual<typeof import("react-router")>("react-router");
	return {
		...actual,
		useFetcher: () => ({
			submit: vi.fn(),
			data: undefined,
			state: "idle",
		}),
	};
});

vi.mock("@dnd-kit/core", () => ({
	DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	PointerSensor: function PointerSensor() {},
	KeyboardSensor: function KeyboardSensor() {},
	useSensor: () => ({}),
	useSensors: () => ([]),
	closestCenter: () => ({}),
}));

vi.mock("@dnd-kit/sortable", () => ({
	SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	verticalListSortingStrategy: {},
	sortableKeyboardCoordinates: () => ({}),
	arrayMove: (items: unknown[]) => items,
	useSortable: () => ({
		attributes: {},
		listeners: {},
		setNodeRef: () => {},
		setActivatorNodeRef: () => {},
		transform: null,
		transition: undefined,
		isDragging: false,
	}),
}));

vi.mock("@dnd-kit/utilities", () => ({
	CSS: {
		Transform: {
			toString: () => "",
		},
	},
}));

type ProfileItem = StudioOutletContext["profileItems"][number];

const renderers = {
	link: {
		summary: (item: { data: ProfileItem }) => ({
			title: item.data.config?.data?.title ?? "Untitled",
		}),
		expanded: (item: { data: ProfileItem }) => ({
			title: item.data.config?.data?.title ?? "Untitled",
			content: "Expanded",
		}),
	},
};

function makeItem(id: string, title: string, sortKey: number): ProfileItem {
	return {
		id,
		type: "link",
		page_id: "page-1",
		sort_key: sortKey,
		is_active: true,
		created_at: "2024-01-01T00:00:00Z",
		updated_at: "2024-01-01T00:00:00Z",
		config: {
			data: {
				title,
			},
		},
	};
}

describe("SortableProfileItemList", () => {
	it("renders drag handles for each item", () => {
		render(
			<SortableProfileItemList
				items={[makeItem("item-1", "First", 1), makeItem("item-2", "Second", 2)]}
				pageId="page-1"
				renderers={renderers}
			/>,
		);

		expect(screen.getAllByLabelText(dragHandleLabel)).toHaveLength(2);
		expect(screen.getByText("First")).toBeInTheDocument();
		expect(screen.getByText("Second")).toBeInTheDocument();
	});
});

export type ItemTypeId = "link" | "image/video" | "map" | "playlist" | "text" | "section";

export type ItemType = {
	id: ItemTypeId;
	title: string;
	description: string;
};

export const ITEM_TYPES: ItemType[] = [
	{
		id: "link",
		title: "Link",
		description: "Add a website or resource.",
	},
	{
		id: "text",
		title: "Note",
		description: "Add a simple text note.",
	},
	{
		id: "section",
		title: "Section",
		description: "Add a section headline.",
	},
	{
		id: "image/video",
		title: "Image & Video",
		description: "Upload a visual highlight.",
	},
	{
		id: "map",
		title: "Map",
		description: "Pin a location.",
	},
	{
		id: "playlist",
		title: "Playlist",
		description: "Share a collection.",
	},
];

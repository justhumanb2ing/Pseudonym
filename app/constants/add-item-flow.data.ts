export type ItemTypeId = "link" | "image" | "map" | "video" | "playlist";

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
		id: "image",
		title: "Image",
		description: "Upload a visual highlight.",
	},
	{
		id: "map",
		title: "Map",
		description: "Pin a location.",
	},
	{
		id: "video",
		title: "Video",
		description: "Embed a video.",
	},
	{
		id: "playlist",
		title: "Playlist",
		description: "Share a collection.",
	},
];

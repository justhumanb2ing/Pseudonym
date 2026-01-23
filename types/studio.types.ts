import type { Json, Tables } from "./database.types";

export type ProfileItemLayout = "compact" | "full";

type ProfileItemStyle = {
	layout?: ProfileItemLayout;
} | null;

type ProfileItemConfig = {
	style?: ProfileItemStyle;
	data?: {
		url?: string | null;
		title?: string | null;
		headline?: string | null;
		description?: string | null;
		site_name?: string | null;
		icon_url?: string | null;
		image_url?: string | null;
		media_type?: "image" | "video";
		media_url?: string | null;
		caption?: string | null;
		lat?: number;
		lng?: number;
		zoom?: number;
	} | null;
	[key: string]: Json | undefined;
};

type StudioProfileItem = Omit<Tables<"profile_items">, "config"> & {
	config?: ProfileItemConfig | null;
};

export interface StudioOutletContext {
	page: Omit<Tables<"pages">, "created_at" | "updated_at">;
	handle: string;
	profileItems: Array<StudioProfileItem>;
}

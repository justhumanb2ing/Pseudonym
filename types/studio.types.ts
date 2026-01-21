import type { Json, Tables } from "./database.types";

type ProfileItemConfig = {
	data?: {
		url?: string | null;
		title?: string | null;
		headline?: string | null;
		description?: string | null;
		site_name?: string | null;
		icon_url?: string | null;
		image_url?: string | null;
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

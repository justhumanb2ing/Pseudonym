import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { buildGoogleMapsHref } from "@/lib/map";
import { normalizeLinkUrl } from "@/service/links/link-crawl";
import { createLinkSaver } from "@/service/links/save-link";
import { createMapSaver } from "@/service/maps/save-map";
import { createMediaSaver } from "@/service/media/save-media";
import { normalizePageDetails, pageDetailsSchema } from "@/service/pages/page-details";
import { pageImageRemoveSchema, pageImageUpdateSchema } from "@/service/pages/page-image";
import { normalizeOptionalText, pageMediaSaveSchema, pageMediaUpdateSchema } from "@/service/pages/page-media";
import { createSectionSaver } from "@/service/sections/save-section";
import { createTextSaver } from "@/service/texts/save-text";
import type { StudioOutletContext } from "types/studio.types";
import type { Database, Json } from "../../../types/database.types";

export type ActionIntent =
	| "page-details"
	| "page-visibility"
	| "update-image"
	| "remove-image"
	| "link-save"
	| "link-remove"
	| "link-update"
	| "link-toggle"
	| "map-save"
	| "map-update"
	| "text-save"
	| "text-update"
	| "section-save"
	| "section-update"
	| "media-save"
	| "media-update"
	| "items-reorder";

export type PageProfileActionData = {
	formError?: string;
	fieldErrors?: {
		title?: string;
		headline?: string;
		description?: string;
		url?: string;
		itemId?: string;
		isActive?: string;
	};
	success?: boolean;
	intent?: ActionIntent;
	itemId?: string;
	item?: StudioOutletContext["profileItems"][number];
	orderedIds?: string[];
};

const layoutSchema = z.preprocess((value) => {
	if (typeof value !== "string" || value.trim().length === 0) {
		return undefined;
	}
	return value;
}, z.enum(["compact", "full"]).optional());

const layoutWithDefaultSchema = z.preprocess(
	(value) => {
		if (typeof value !== "string" || value.trim().length === 0) {
			return "compact";
		}
		return value;
	},
	z.enum(["compact", "full"]),
);

const linkSaveSchema = z.object({
	pageId: z.string().min(1, "Page id is required."),
	url: z.string().trim().min(1, "URL is required."),
	layout: layoutWithDefaultSchema,
});

const mapSaveSchema = z.object({
	pageId: z.string().min(1, "Page id is required."),
	lat: z.coerce.number().min(-90).max(90),
	lng: z.coerce.number().min(-180).max(180),
	zoom: z.coerce.number().min(0).max(22),
	caption: z.string().trim().optional().nullable(),
	layout: layoutWithDefaultSchema,
});

const mapUpdateSchema = z.object({
	itemId: z.string().min(1, "Item id is required."),
	lat: z.coerce.number().min(-90).max(90),
	lng: z.coerce.number().min(-180).max(180),
	zoom: z.coerce.number().min(0).max(22),
	caption: z.string().trim().optional().nullable(),
	layout: layoutSchema,
});

const textSaveSchema = z.object({
	pageId: z.string().min(1, "Page id is required."),
	title: z.string().trim().min(1, "Text is required."),
});

const sectionSaveSchema = z.object({
	pageId: z.string().min(1, "Page id is required."),
	headline: z.string().trim().min(1, "Headline is required.").max(50, "Headline must be 50 characters or less."),
});

const textUpdateSchema = z.object({
	itemId: z.string().min(1, "Item id is required."),
	title: z.string().trim().min(1, "Text is required."),
});

const sectionUpdateSchema = z.object({
	itemId: z.string().min(1, "Item id is required."),
	headline: z.string().trim().min(1, "Headline is required.").max(50, "Headline must be 50 characters or less."),
});

const linkRemoveSchema = z.object({
	itemId: z.string().min(1, "Item id is required."),
});

const linkUpdateSchema = z.object({
	itemId: z.string().min(1, "Item id is required."),
	title: z.string().trim().optional(),
	url: z.string().trim().min(1, "URL is required."),
	layout: layoutSchema,
});

const linkToggleSchema = z.object({
	itemId: z.string().min(1, "Item id is required."),
	isActive: z
		.string()
		.min(1, "Active value is required.")
		.refine((value) => value === "true" || value === "false", {
			message: "Invalid active value.",
		}),
});

const pageVisibilitySchema = z.object({
	pageId: z.string().min(1, "Page id is required."),
	isPublic: z
		.string()
		.min(1, "Visibility value is required.")
		.refine((value) => value === "true" || value === "false", {
			message: "Invalid visibility value.",
		}),
});

const itemsReorderSchema = z.object({
	pageId: z.string().min(1, "Page id is required."),
	orderedIds: z.array(z.string().min(1, "Item id is required.")).min(1, "At least one item is required."),
});

export type PageProfileActionContext = {
	formData: FormData;
	supabase: SupabaseClient<Database>;
};

async function fetchProfileItem(supabase: SupabaseClient<Database>, itemId: string) {
	const { data, error } = await supabase
		.from("profile_items")
		.select("id, type, is_active, config, sort_key, page_id")
		.eq("id", itemId)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	if (!data) {
		throw new Error("Item not found.");
	}

	return data as StudioOutletContext["profileItems"][number];
}

/**
 * Updates the page image url when requested from the profile page.
 */
export async function handleUpdateImage({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = pageImageUpdateSchema.safeParse({
		pageId: formData.get("pageId"),
		imageUrl: formData.get("imageUrl"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			formError: tree.properties?.imageUrl?.errors[0] ?? tree.properties?.pageId?.errors[0],
			intent: "update-image",
		};
	}

	const { error: updateError } = await supabase.from("pages").update({ image_url: parsed.data.imageUrl }).eq("id", parsed.data.pageId);

	if (updateError) {
		return { formError: updateError.message, intent: "update-image" };
	}

	return { success: true, intent: "update-image" };
}

/**
 * Removes the page image url when requested from the profile page.
 */
export async function handleRemoveImage({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = pageImageRemoveSchema.safeParse({
		pageId: formData.get("pageId"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			formError: tree.properties?.pageId?.errors[0],
			intent: "remove-image",
		};
	}

	const { error: updateError } = await supabase.from("pages").update({ image_url: null }).eq("id", parsed.data.pageId);

	if (updateError) {
		return { formError: updateError.message, intent: "remove-image" };
	}

	return { success: true, intent: "remove-image" };
}

/**
 * Persists page title/description updates from the profile page.
 */
export async function handlePageDetails({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = pageDetailsSchema.safeParse({
		pageId: formData.get("pageId"),
		title: formData.get("title"),
		description: formData.get("description"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			fieldErrors: {
				title: tree.properties?.title?.errors[0],
				description: tree.properties?.description?.errors[0],
			},
			formError: tree.properties?.pageId?.errors[0],
			intent: "page-details",
		};
	}

	const { pageId } = parsed.data;
	const normalized = normalizePageDetails(parsed.data);
	const { error: updateError } = await supabase
		.from("pages")
		.update({
			title: normalized.title,
			description: normalized.description,
		})
		.eq("id", pageId);

	if (updateError) {
		return { formError: updateError.message, intent: "page-details" };
	}

	return { success: true, intent: "page-details" };
}

/**
 * Toggles page visibility from the profile page.
 */
export async function handlePageVisibility({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = pageVisibilitySchema.safeParse({
		pageId: formData.get("pageId"),
		isPublic: formData.get("isPublic"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			formError: tree.properties?.pageId?.errors[0] ?? tree.properties?.isPublic?.errors[0],
			intent: "page-visibility",
		};
	}

	const nextIsPublic = parsed.data.isPublic !== "true";
	const { error: updateError } = await supabase.from("pages").update({ is_public: nextIsPublic }).eq("id", parsed.data.pageId);

	if (updateError) {
		return { formError: updateError.message, intent: "page-visibility" };
	}

	return { success: true, intent: "page-visibility" };
}

/**
 * Persists profile item order updates from the profile page.
 */
export async function handleItemsReorder({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const orderedIds = formData
		.getAll("orderedIds")
		.map((value) => value.toString().trim())
		.filter((value) => value.length > 0);

	const pageIdValue = formData.get("pageId");
	const parsed = itemsReorderSchema.safeParse({
		pageId: typeof pageIdValue === "string" ? pageIdValue : "",
		orderedIds,
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			formError: tree.properties?.pageId?.errors[0] ?? tree.properties?.orderedIds?.errors[0],
			intent: "items-reorder",
		};
	}

	const { error } = await supabase.rpc("reorder_page_items", {
		p_page_id: parsed.data.pageId,
		p_ordered_ids: parsed.data.orderedIds,
	});

	if (error) {
		return { formError: error.message, intent: "items-reorder" };
	}

	return { success: true, intent: "items-reorder", orderedIds: parsed.data.orderedIds };
}

/**
 * Crawls and saves a link item from the profile page.
 */
export async function handleLinkSave({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = linkSaveSchema.safeParse({
		pageId: formData.get("pageId"),
		url: formData.get("url"),
		layout: formData.get("layout"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			fieldErrors: {
				url: tree.properties?.url?.errors[0],
			},
			formError: tree.properties?.pageId?.errors[0],
			intent: "link-save",
		};
	}

	const saveLink = createLinkSaver(Promise.resolve(supabase));

	try {
		const item = await saveLink({
			pageId: parsed.data.pageId,
			url: parsed.data.url,
			layout: parsed.data.layout,
		});
		return { success: true, intent: "link-save", item };
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Crawl failed. Please try again.",
			intent: "link-save",
		};
	}
}

/**
 * Deletes a link item from the profile page.
 */
export async function handleLinkRemove({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = linkRemoveSchema.safeParse({
		itemId: formData.get("itemId"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			fieldErrors: {
				itemId: tree.properties?.itemId?.errors[0],
			},
			formError: tree.properties?.itemId?.errors[0],
			intent: "link-remove",
		};
	}

	const { error: deleteError } = await supabase.from("profile_items").delete().eq("id", parsed.data.itemId);

	if (deleteError) {
		return { formError: deleteError.message, intent: "link-remove", itemId: parsed.data.itemId };
	}

	return { success: true, intent: "link-remove", itemId: parsed.data.itemId };
}

/**
 * Updates a link item title/url from the profile page.
 */
export async function handleLinkUpdate({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = linkUpdateSchema.safeParse({
		itemId: formData.get("itemId"),
		title: formData.get("title"),
		url: formData.get("url"),
		layout: formData.get("layout"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			fieldErrors: {
				itemId: tree.properties?.itemId?.errors[0],
				title: tree.properties?.title?.errors[0],
				url: tree.properties?.url?.errors[0],
			},
			formError: tree.properties?.itemId?.errors[0] ?? tree.properties?.url?.errors[0],
			intent: "link-update",
		};
	}

	const normalizedTitle = parsed.data.title?.trim() || null;
	const normalizedUrl = normalizeLinkUrl(parsed.data.url);
	const nextLayout = parsed.data.layout;

	const { error: rpcError } = await supabase.rpc("update_page_item_config", {
		p_item_id: parsed.data.itemId,
		p_data: { title: normalizedTitle, url: normalizedUrl } as unknown as Json,
		p_style: nextLayout ? ({ layout: nextLayout } as unknown as Json) : undefined,
	});

	if (rpcError) {
		return { formError: rpcError.message, intent: "link-update", itemId: parsed.data.itemId };
	}

	try {
		const item = await fetchProfileItem(supabase, parsed.data.itemId);
		return { success: true, intent: "link-update", itemId: parsed.data.itemId, item };
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Failed to load updated item.",
			intent: "link-update",
			itemId: parsed.data.itemId,
		};
	}
}

/**
 * Toggles a link item active state from the profile page.
 */
export async function handleLinkToggle({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = linkToggleSchema.safeParse({
		itemId: formData.get("itemId"),
		isActive: formData.get("isActive"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			fieldErrors: {
				itemId: tree.properties?.itemId?.errors[0],
				isActive: tree.properties?.isActive?.errors[0],
			},
			formError: tree.properties?.itemId?.errors[0] ?? tree.properties?.isActive?.errors[0],
			intent: "link-toggle",
		};
	}

	const nextIsActive = parsed.data.isActive === "true";
	const { error: updateError } = await supabase.from("profile_items").update({ is_active: nextIsActive }).eq("id", parsed.data.itemId);

	if (updateError) {
		return { formError: updateError.message, intent: "link-toggle", itemId: parsed.data.itemId };
	}

	try {
		const item = await fetchProfileItem(supabase, parsed.data.itemId);
		return { success: true, intent: "link-toggle", itemId: parsed.data.itemId, item };
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Failed to load updated item.",
			intent: "link-toggle",
			itemId: parsed.data.itemId,
		};
	}
}

/**
 * Saves a text item from the profile page.
 */
export async function handleTextSave({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = textSaveSchema.safeParse({
		pageId: formData.get("pageId"),
		title: formData.get("title"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			fieldErrors: {
				title: tree.properties?.title?.errors[0],
			},
			formError: tree.properties?.pageId?.errors[0],
			intent: "text-save",
		};
	}

	const saveText = createTextSaver(Promise.resolve(supabase));

	try {
		const item = await saveText({
			pageId: parsed.data.pageId,
			title: parsed.data.title,
		});
		return { success: true, intent: "text-save", item };
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Failed to save text.",
			intent: "text-save",
		};
	}
}

/**
 * Saves a section item from the profile page.
 */
export async function handleSectionSave({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = sectionSaveSchema.safeParse({
		pageId: formData.get("pageId"),
		headline: formData.get("headline"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			fieldErrors: {
				headline: tree.properties?.headline?.errors[0],
			},
			formError: tree.properties?.pageId?.errors[0],
			intent: "section-save",
		};
	}

	const saveSection = createSectionSaver(Promise.resolve(supabase));

	try {
		const item = await saveSection({
			pageId: parsed.data.pageId,
			headline: parsed.data.headline,
		});
		return { success: true, intent: "section-save", item };
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Failed to save section.",
			intent: "section-save",
		};
	}
}

/**
 * Saves an image/video item from the profile page.
 */
export async function handleMediaSave({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = pageMediaSaveSchema.extend({ layout: layoutWithDefaultSchema }).safeParse({
		pageId: formData.get("pageId"),
		mediaUrl: formData.get("mediaUrl"),
		mediaType: formData.get("mediaType"),
		caption: formData.get("caption"),
		url: formData.get("url"),
		layout: formData.get("layout"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			formError: tree.properties?.pageId?.errors[0] ?? tree.properties?.mediaUrl?.errors[0] ?? tree.properties?.mediaType?.errors[0],
			intent: "media-save",
		};
	}

	const saveMedia = createMediaSaver(Promise.resolve(supabase));

	try {
		const item = await saveMedia({
			pageId: parsed.data.pageId,
			mediaUrl: parsed.data.mediaUrl,
			mediaType: parsed.data.mediaType,
			caption: normalizeOptionalText(formData.get("caption")),
			url: normalizeOptionalText(formData.get("url")),
			layout: parsed.data.layout,
		});
		return { success: true, intent: "media-save", item };
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Failed to save media.",
			intent: "media-save",
		};
	}
}

/**
 * Saves a map item from the profile page.
 */
export async function handleMapSave({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = mapSaveSchema.safeParse({
		pageId: formData.get("pageId"),
		lat: formData.get("lat"),
		lng: formData.get("lng"),
		zoom: formData.get("zoom"),
		caption: formData.get("caption"),
		layout: formData.get("layout"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			formError:
				tree.properties?.pageId?.errors[0] ??
				tree.properties?.lat?.errors[0] ??
				tree.properties?.lng?.errors[0] ??
				tree.properties?.zoom?.errors[0],
			intent: "map-save",
		};
	}

	const saveMap = createMapSaver(Promise.resolve(supabase));

	try {
		const item = await saveMap({
			pageId: parsed.data.pageId,
			center: [parsed.data.lng, parsed.data.lat],
			zoom: parsed.data.zoom,
			caption: normalizeOptionalText(parsed.data.caption ?? null),
			layout: parsed.data.layout,
		});
		return { success: true, intent: "map-save", item };
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Failed to save map.",
			intent: "map-save",
		};
	}
}

/**
 * Updates a map item from the profile page.
 */
export async function handleMapUpdate({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = mapUpdateSchema.safeParse({
		itemId: formData.get("itemId"),
		lat: formData.get("lat"),
		lng: formData.get("lng"),
		zoom: formData.get("zoom"),
		caption: formData.get("caption"),
		layout: formData.get("layout"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			formError:
				tree.properties?.itemId?.errors[0] ??
				tree.properties?.lat?.errors[0] ??
				tree.properties?.lng?.errors[0] ??
				tree.properties?.zoom?.errors[0],
			intent: "map-update",
		};
	}

	const nextCenter: [number, number] = [parsed.data.lng, parsed.data.lat];
	const nextLayout = parsed.data.layout;

	const { error: rpcError } = await supabase.rpc("update_page_item_config", {
		p_item_id: parsed.data.itemId,
		p_data: {
			url: buildGoogleMapsHref(nextCenter, parsed.data.zoom),
			caption: normalizeOptionalText(parsed.data.caption ?? null),
			lat: parsed.data.lat,
			lng: parsed.data.lng,
			zoom: parsed.data.zoom,
		} as unknown as Json,
		p_style: nextLayout ? ({ layout: nextLayout } as unknown as Json) : undefined,
	});

	if (rpcError) {
		return { formError: rpcError.message, intent: "map-update", itemId: parsed.data.itemId };
	}

	try {
		const item = await fetchProfileItem(supabase, parsed.data.itemId);
		return { success: true, intent: "map-update", itemId: parsed.data.itemId, item };
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Failed to load updated item.",
			intent: "map-update",
			itemId: parsed.data.itemId,
		};
	}
}

/**
 * Updates a text item title from the profile page.
 */
export async function handleTextUpdate({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = textUpdateSchema.safeParse({
		itemId: formData.get("itemId"),
		title: formData.get("title"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			fieldErrors: {
				itemId: tree.properties?.itemId?.errors[0],
				title: tree.properties?.title?.errors[0],
			},
			formError: tree.properties?.itemId?.errors[0] ?? tree.properties?.title?.errors[0],
			intent: "text-update",
		};
	}

	const { error: rpcError } = await supabase.rpc("update_page_item_config", {
		p_item_id: parsed.data.itemId,
		p_data: { title: parsed.data.title } as unknown as Json,
	});

	if (rpcError) {
		return { formError: rpcError.message, intent: "text-update", itemId: parsed.data.itemId };
	}

	try {
		const item = await fetchProfileItem(supabase, parsed.data.itemId);
		return { success: true, intent: "text-update", itemId: parsed.data.itemId, item };
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Failed to load updated item.",
			intent: "text-update",
			itemId: parsed.data.itemId,
		};
	}
}

/**
 * Updates a media item caption/url from the profile page.
 */
export async function handleMediaUpdate({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = pageMediaUpdateSchema.extend({ layout: layoutSchema }).safeParse({
		itemId: formData.get("itemId"),
		caption: formData.get("caption"),
		url: formData.get("url"),
		layout: formData.get("layout"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			formError: tree.properties?.itemId?.errors[0],
			intent: "media-update",
		};
	}

	const nextLayout = parsed.data.layout;

	const { error: rpcError } = await supabase.rpc("update_page_item_config", {
		p_item_id: parsed.data.itemId,
		p_data: {
			caption: normalizeOptionalText(formData.get("caption")),
			url: normalizeOptionalText(formData.get("url")),
		} as unknown as Json,
		p_style: nextLayout ? ({ layout: nextLayout } as unknown as Json) : undefined,
	});

	if (rpcError) {
		return { formError: rpcError.message, intent: "media-update", itemId: parsed.data.itemId };
	}

	try {
		const item = await fetchProfileItem(supabase, parsed.data.itemId);
		return { success: true, intent: "media-update", itemId: parsed.data.itemId, item };
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Failed to load updated item.",
			intent: "media-update",
			itemId: parsed.data.itemId,
		};
	}
}

/**
 * Updates a section item headline from the profile page.
 */
export async function handleSectionUpdate({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = sectionUpdateSchema.safeParse({
		itemId: formData.get("itemId"),
		headline: formData.get("headline"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			fieldErrors: {
				itemId: tree.properties?.itemId?.errors[0],
				headline: tree.properties?.headline?.errors[0],
			},
			formError: tree.properties?.itemId?.errors[0] ?? tree.properties?.headline?.errors[0],
			intent: "section-update",
		};
	}

	const { error: rpcError } = await supabase.rpc("update_page_item_config", {
		p_item_id: parsed.data.itemId,
		p_data: { headline: parsed.data.headline } as unknown as Json,
	});

	if (rpcError) {
		return { formError: rpcError.message, intent: "section-update", itemId: parsed.data.itemId };
	}

	try {
		const item = await fetchProfileItem(supabase, parsed.data.itemId);
		return { success: true, intent: "section-update", itemId: parsed.data.itemId, item };
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Failed to load updated item.",
			intent: "section-update",
			itemId: parsed.data.itemId,
		};
	}
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { normalizeLinkUrl } from "@/service/links/link-crawl";
import { createLinkSaver } from "@/service/links/save-link";
import { createMediaSaver } from "@/service/media/save-media";
import { createSectionSaver } from "@/service/sections/save-section";
import { createTextSaver } from "@/service/texts/save-text";
import { normalizePageDetails, pageDetailsSchema } from "@/service/pages/page-details";
import { pageImageRemoveSchema, pageImageUpdateSchema } from "@/service/pages/page-image";
import { normalizeOptionalText, pageMediaSaveSchema, pageMediaUpdateSchema } from "@/service/pages/page-media";
import type { Database } from "../../../types/database.types";

export type ActionIntent =
	| "page-details"
	| "page-visibility"
	| "update-image"
	| "remove-image"
	| "link-save"
	| "link-remove"
	| "link-update"
	| "link-toggle"
	| "text-save"
	| "text-update"
	| "section-save"
	| "section-update"
	| "media-save"
	| "media-update";

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
};

const linkSaveSchema = z.object({
	pageId: z.string().min(1, "Page id is required."),
	url: z.string().trim().min(1, "URL is required."),
});

const textSaveSchema = z.object({
	pageId: z.string().min(1, "Page id is required."),
	title: z.string().trim().min(1, "Text is required."),
});

const sectionSaveSchema = z.object({
	pageId: z.string().min(1, "Page id is required."),
	headline: z
		.string()
		.trim()
		.min(1, "Headline is required.")
		.max(50, "Headline must be 50 characters or less."),
});

const textUpdateSchema = z.object({
	itemId: z.string().min(1, "Item id is required."),
	title: z.string().trim().min(1, "Text is required."),
});

const sectionUpdateSchema = z.object({
	itemId: z.string().min(1, "Item id is required."),
	headline: z
		.string()
		.trim()
		.min(1, "Headline is required.")
		.max(50, "Headline must be 50 characters or less."),
});

const linkRemoveSchema = z.object({
	itemId: z.string().min(1, "Item id is required."),
});

const linkUpdateSchema = z.object({
	itemId: z.string().min(1, "Item id is required."),
	title: z.string().trim().optional(),
	url: z.string().trim().min(1, "URL is required."),
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

export type PageProfileActionContext = {
	formData: FormData;
	supabase: SupabaseClient<Database>;
};

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
 * Crawls and saves a link item from the profile page.
 */
export async function handleLinkSave({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = linkSaveSchema.safeParse({
		pageId: formData.get("pageId"),
		url: formData.get("url"),
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
		await saveLink({
			pageId: parsed.data.pageId,
			url: parsed.data.url,
		});
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Crawl failed. Please try again.",
			intent: "link-save",
		};
	}

	return { success: true, intent: "link-save" };
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

	const { data: profileItem, error: itemError } = await supabase
		.from("profile_items")
		.select("config")
		.eq("id", parsed.data.itemId)
		.maybeSingle();

	if (itemError) {
		return { formError: itemError.message, intent: "link-update", itemId: parsed.data.itemId };
	}

	const rawConfig = profileItem?.config;
	const configObject =
		rawConfig && typeof rawConfig === "object" && !Array.isArray(rawConfig) ? (rawConfig as Record<string, unknown>) : {};
	const rawConfigData = configObject.data;
	const configData =
		rawConfigData && typeof rawConfigData === "object" && !Array.isArray(rawConfigData)
			? (rawConfigData as Record<string, unknown>)
			: {};

	const { error: updateError } = await supabase
		.from("profile_items")
		.update({
			config: {
				...configObject,
				data: {
					...configData,
					title: normalizedTitle,
					url: normalizedUrl,
				},
			},
		})
		.eq("id", parsed.data.itemId);

	if (updateError) {
		return { formError: updateError.message, intent: "link-update", itemId: parsed.data.itemId };
	}

	return { success: true, intent: "link-update", itemId: parsed.data.itemId };
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
	const { error: updateError } = await supabase
		.from("profile_items")
		.update({ is_active: nextIsActive })
		.eq("id", parsed.data.itemId);

	if (updateError) {
		return { formError: updateError.message, intent: "link-toggle", itemId: parsed.data.itemId };
	}

	return { success: true, intent: "link-toggle", itemId: parsed.data.itemId };
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
		await saveText({
			pageId: parsed.data.pageId,
			title: parsed.data.title,
		});
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Failed to save text.",
			intent: "text-save",
		};
	}

	return { success: true, intent: "text-save" };
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
		await saveSection({
			pageId: parsed.data.pageId,
			headline: parsed.data.headline,
		});
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Failed to save section.",
			intent: "section-save",
		};
	}

	return { success: true, intent: "section-save" };
}

/**
 * Saves an image/video item from the profile page.
 */
export async function handleMediaSave({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = pageMediaSaveSchema.safeParse({
		pageId: formData.get("pageId"),
		mediaUrl: formData.get("mediaUrl"),
		mediaType: formData.get("mediaType"),
		caption: formData.get("caption"),
		url: formData.get("url"),
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
		await saveMedia({
			pageId: parsed.data.pageId,
			mediaUrl: parsed.data.mediaUrl,
			mediaType: parsed.data.mediaType,
			caption: normalizeOptionalText(formData.get("caption")),
			url: normalizeOptionalText(formData.get("url")),
		});
	} catch (error) {
		return {
			formError: error instanceof Error ? error.message : "Failed to save media.",
			intent: "media-save",
		};
	}

	return { success: true, intent: "media-save" };
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

	const { data: profileItem, error: itemError } = await supabase
		.from("profile_items")
		.select("config")
		.eq("id", parsed.data.itemId)
		.maybeSingle();

	if (itemError) {
		return { formError: itemError.message, intent: "text-update", itemId: parsed.data.itemId };
	}

	const rawConfig = profileItem?.config;
	const configObject =
		rawConfig && typeof rawConfig === "object" && !Array.isArray(rawConfig) ? (rawConfig as Record<string, unknown>) : {};
	const rawConfigData = configObject.data;
	const configData =
		rawConfigData && typeof rawConfigData === "object" && !Array.isArray(rawConfigData)
			? (rawConfigData as Record<string, unknown>)
			: {};

	const { error: updateError } = await supabase
		.from("profile_items")
		.update({
			config: {
				...configObject,
				data: {
					...configData,
					title: parsed.data.title,
				},
			},
		})
		.eq("id", parsed.data.itemId);

	if (updateError) {
		return { formError: updateError.message, intent: "text-update", itemId: parsed.data.itemId };
	}

	return { success: true, intent: "text-update", itemId: parsed.data.itemId };
}

/**
 * Updates a media item caption/url from the profile page.
 */
export async function handleMediaUpdate({ formData, supabase }: PageProfileActionContext): Promise<PageProfileActionData> {
	const parsed = pageMediaUpdateSchema.safeParse({
		itemId: formData.get("itemId"),
		caption: formData.get("caption"),
		url: formData.get("url"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			formError: tree.properties?.itemId?.errors[0],
			intent: "media-update",
		};
	}

	const { data: profileItem, error: itemError } = await supabase
		.from("profile_items")
		.select("config")
		.eq("id", parsed.data.itemId)
		.maybeSingle();

	if (itemError) {
		return { formError: itemError.message, intent: "media-update", itemId: parsed.data.itemId };
	}

	const rawConfig = profileItem?.config;
	const configObject =
		rawConfig && typeof rawConfig === "object" && !Array.isArray(rawConfig) ? (rawConfig as Record<string, unknown>) : {};
	const rawConfigData = configObject.data;
	const configData =
		rawConfigData && typeof rawConfigData === "object" && !Array.isArray(rawConfigData)
			? (rawConfigData as Record<string, unknown>)
			: {};

	const { error: updateError } = await supabase
		.from("profile_items")
		.update({
			config: {
				...configObject,
				data: {
					...configData,
					caption: normalizeOptionalText(formData.get("caption")),
					url: normalizeOptionalText(formData.get("url")),
				},
			},
		})
		.eq("id", parsed.data.itemId);

	if (updateError) {
		return { formError: updateError.message, intent: "media-update", itemId: parsed.data.itemId };
	}

	return { success: true, intent: "media-update", itemId: parsed.data.itemId };
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

	const { data: profileItem, error: itemError } = await supabase
		.from("profile_items")
		.select("config")
		.eq("id", parsed.data.itemId)
		.maybeSingle();

	if (itemError) {
		return { formError: itemError.message, intent: "section-update", itemId: parsed.data.itemId };
	}

	const rawConfig = profileItem?.config;
	const configObject =
		rawConfig && typeof rawConfig === "object" && !Array.isArray(rawConfig) ? (rawConfig as Record<string, unknown>) : {};
	const rawConfigData = configObject.data;
	const configData =
		rawConfigData && typeof rawConfigData === "object" && !Array.isArray(rawConfigData)
			? (rawConfigData as Record<string, unknown>)
			: {};

	const { error: updateError } = await supabase
		.from("profile_items")
		.update({
			config: {
				...configObject,
				data: {
					...configData,
					headline: parsed.data.headline,
				},
			},
		})
		.eq("id", parsed.data.itemId);

	if (updateError) {
		return { formError: updateError.message, intent: "section-update", itemId: parsed.data.itemId };
	}

	return { success: true, intent: "section-update", itemId: parsed.data.itemId };
}

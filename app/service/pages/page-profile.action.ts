import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createLinkSaver } from "@/service/links/save-link";
import { normalizePageDetails, pageDetailsSchema } from "@/service/pages/page-details";
import { pageImageRemoveSchema, pageImageUpdateSchema } from "@/service/pages/page-image";
import type { Database } from "../../../types/database.types";

export type ActionIntent = "page-details" | "update-image" | "remove-image" | "link-save";

export type PageProfileActionData = {
	formError?: string;
	fieldErrors?: {
		title?: string;
		description?: string;
		url?: string;
	};
	success?: boolean;
	intent?: ActionIntent;
};

const linkSaveSchema = z.object({
	pageId: z.string().min(1, "Page id is required."),
	url: z.string().trim().min(1, "URL is required."),
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

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "types/database.types";
import { sanitizeFileName } from "@/utils/file-name-utils";
import { resolvePageMediaKind } from "@/service/pages/page-media";

const PAGE_MEDIA_BUCKET = "untitled-bucket";

export type PageMediaUploadPayload = {
	pageId: string;
	userId: string;
	file: File;
	signal?: AbortSignal;
};

export type PageMediaUploadResult = {
	publicUrl: string;
	path: string;
};

/**
 * Creates an uploader that stores a page media item in Supabase Storage.
 */
export function createPageMediaUploader(supabasePromise: Promise<SupabaseClient<Database>>) {
	return async function uploadPageMedia({ pageId, userId, file, signal }: PageMediaUploadPayload): Promise<PageMediaUploadResult> {
		const supabase = await supabasePromise;
		const path = resolvePageMediaPath(userId, pageId, file);

		const { error } = await supabase.storage.from(PAGE_MEDIA_BUCKET).upload(path, file, {
			upsert: true,
			contentType: file.type || "application/octet-stream",
			cacheControl: "3600",
			...(signal ? { signal } : {}),
		});

		if (error) {
			throw new Error(error.message);
		}

		const { data } = supabase.storage.from(PAGE_MEDIA_BUCKET).getPublicUrl(path);

		if (!data.publicUrl) {
			throw new Error("Failed to resolve media URL.");
		}

		return {
			publicUrl: appendCacheKey(data.publicUrl, buildCacheKey(file)),
			path,
		};
	};
}

/**
 * Resolves a stable storage path so identical filenames overwrite the same object.
 */
function resolvePageMediaPath(userId: string, pageId: string, file: File) {
	const extension = resolveMediaExtension(file);
	const baseName = resolveMediaBaseName(file.name);
	const sanitizedBaseName = sanitizeFileName(baseName, "media");

	return `pages/${userId}/${pageId}/${sanitizedBaseName}.${extension}`;
}

function resolveMediaBaseName(fileName: string) {
	const cleanedName = fileName.trim().replace(/[\\/]/g, "-").replace(/\s+/g, "-");
	if (!cleanedName) {
		return "";
	}

	const lastDotIndex = cleanedName.lastIndexOf(".");
	if (lastDotIndex > 0) {
		return cleanedName.slice(0, lastDotIndex);
	}

	return cleanedName;
}

function buildCacheKey(file: File) {
	return `${file.size}-${file.lastModified}`;
}

function appendCacheKey(publicUrl: string, cacheKey: string) {
	const separator = publicUrl.includes("?") ? "&" : "?";
	return `${publicUrl}${separator}v=${encodeURIComponent(cacheKey)}`;
}

function resolveMediaExtension(file: File) {
	const nameExtension = file.name.split(".").pop()?.toLowerCase();
	if (nameExtension) {
		return nameExtension;
	}

	const mediaKind = resolvePageMediaKind(file);
	if (mediaKind === "video") {
		switch (file.type) {
			case "video/mp4":
				return "mp4";
			case "video/webm":
				return "webm";
			default:
				return "bin";
		}
	}

	switch (file.type) {
		case "image/jpeg":
		case "image/jpg":
			return "jpg";
		case "image/png":
			return "png";
		case "image/gif":
			return "gif";
		case "image/webp":
			return "webp";
		default:
			return "bin";
	}
}

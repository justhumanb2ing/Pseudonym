import { z } from "zod";

export const PAGE_MEDIA_MAX_BYTES = 3 * 1024 * 1024;

export type PageMediaKind = "image" | "video";

const MEDIA_TYPE_LOOKUP: Record<string, PageMediaKind> = {
	"image/jpeg": "image",
	"image/jpg": "image",
	"image/png": "image",
	"image/webp": "image",
	"image/gif": "image",
	"video/mp4": "video",
	"video/webm": "video",
};

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm"]);

export const pageMediaSaveSchema = z.object({
	pageId: z.string().min(1, "Page id is required."),
	mediaUrl: z.string().url("Media url is required."),
	mediaType: z.enum(["image", "video"]),
	caption: z.string().optional().nullable(),
	url: z.string().optional().nullable(),
});

export const pageMediaUpdateSchema = z.object({
	itemId: z.string().min(1, "Item id is required."),
	caption: z.string().optional().nullable(),
	url: z.string().optional().nullable(),
});

export function normalizeOptionalText(value: FormDataEntryValue | null): string | null {
	const text = typeof value === "string" ? value.trim() : "";
	return text.length > 0 ? text : null;
}

export function resolvePageMediaKind(file: File): PageMediaKind | null {
	const mediaKind = MEDIA_TYPE_LOOKUP[file.type.toLowerCase()];
	if (mediaKind) {
		return mediaKind;
	}

	const extension = file.name.split(".").pop()?.toLowerCase();
	if (!extension) {
		return null;
	}

	if (IMAGE_EXTENSIONS.has(extension)) {
		return "image";
	}

	if (VIDEO_EXTENSIONS.has(extension)) {
		return "video";
	}

	return null;
}

export function getPageMediaValidationError(file: File): string | null {
	if (file.size > PAGE_MEDIA_MAX_BYTES) {
		return "File size must be 3MB or less.";
	}

	const mediaKind = resolvePageMediaKind(file);
	if (!mediaKind) {
		return "Unsupported file type. Use JPG, PNG, WEBP, GIF, MP4, or WEBM.";
	}

	return null;
}

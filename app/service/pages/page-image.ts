import { z } from "zod";

export const PAGE_IMAGE_MAX_BYTES = 3 * 1024 * 1024;

export const pageImageUpdateSchema = z.object({
  pageId: z.string().min(1, "Page id is required."),
  imageUrl: z.string().url("Image url is required."),
});

export const pageImageRemoveSchema = z.object({
  pageId: z.string().min(1, "Page id is required."),
});

export function getPageImageValidationError(file: File): string | null {
  if (file.size > PAGE_IMAGE_MAX_BYTES) {
    return "File size must be 3MB or less.";
  }

  return null;
}

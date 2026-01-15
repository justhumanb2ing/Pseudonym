import { sanitizeFileName } from "@/utils/file-name-utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "types/database.types";


const PAGE_IMAGE_BUCKET = "untitled-bucket";

export type PageImageUploadPayload = {
  pageId: string;
  userId: string;
  file: File;
};

export type PageImageUploadResult = {
  publicUrl: string;
  path: string;
};

/**
 * Creates an uploader that stores a page image in Supabase Storage.
 */
export function createPageImageUploader(
  supabasePromise: Promise<SupabaseClient<Database>>
) {
  return async function uploadPageImage({
    pageId,
    userId,
    file,
  }: PageImageUploadPayload): Promise<PageImageUploadResult> {
    const supabase = await supabasePromise;
    const path = resolvePageImagePath(userId, pageId, file);

    const { error } = await supabase.storage
      .from(PAGE_IMAGE_BUCKET)
      .upload(path, file, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from(PAGE_IMAGE_BUCKET)
      .getPublicUrl(path);

    if (!data.publicUrl) {
      throw new Error("Failed to resolve image URL.");
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
function resolvePageImagePath(userId: string, pageId: string, file: File) {
  const extension = resolveImageExtension(file);
  const baseName = resolveImageBaseName(file.name);
  const sanitizedBaseName = sanitizeFileName(baseName, "profile");

  return `pages/${userId}/${pageId}/profile/${sanitizedBaseName}.${extension}`;
}

function resolveImageBaseName(fileName: string) {
  const cleanedName = fileName
    .trim()
    .replace(/[\\/]/g, "-")
    .replace(/\s+/g, "-");
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

function resolveImageExtension(file: File) {
  const nameExtension = file.name.split(".").pop()?.toLowerCase();
  if (nameExtension) {
    return nameExtension;
  }

  switch (file.type) {
    case "image/jpeg":
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

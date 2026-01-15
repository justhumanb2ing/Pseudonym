import { createPageImageUploader } from "@/service/pages/upload-page-image";
import { describe, expect, it } from "vitest";


type SupabaseError = { message: string };

function createSupabaseStorageStub({
  uploadError = null,
  publicUrl = "https://cdn.example.com/assets/image.png",
}: {
  uploadError?: SupabaseError | null;
  publicUrl?: string | null;
}) {
  const calls = {
    bucket: "",
    upload: {
      path: "",
      file: null as File | null,
      options: null as Record<string, unknown> | null,
    },
    publicUrlPath: "",
  };

  const supabase = {
    storage: {
      from: (bucket: string) => {
        calls.bucket = bucket;
        return {
          upload: (path: string, file: File, options: Record<string, unknown>) => {
            calls.upload = { path, file, options };
            return { error: uploadError };
          },
          getPublicUrl: (path: string) => {
            calls.publicUrlPath = path;
            return { data: { publicUrl } };
          },
        };
      },
    },
  };

  return { supabase, calls };
}

describe("createPageImageUploader", () => {
  it("uploads to a stable path and appends a cache key", async () => {
    const { supabase, calls } = createSupabaseStorageStub({});
    const uploadPageImage = createPageImageUploader(
      Promise.resolve(supabase as never)
    );
    const file = new File([new Uint8Array([1, 2, 3])], "My photo.png", {
      type: "image/png",
      lastModified: 123,
    });

    const result = await uploadPageImage({
      pageId: "page-1",
      userId: "user-1",
      file,
    });

    expect(calls.bucket).toBe("untitled-bucket");
    expect(calls.upload.path).toBe("pages/user-1/page-1/profile/My-photo.png");
    expect(calls.upload.file).toBe(file);
    expect(calls.upload.options).toEqual({
      upsert: true,
      contentType: "image/png",
      cacheControl: "3600",
    });
    expect(calls.publicUrlPath).toBe("pages/user-1/page-1/profile/My-photo.png");
    expect(result).toEqual({
      path: "pages/user-1/page-1/profile/My-photo.png",
      publicUrl: "https://cdn.example.com/assets/image.png?v=3-123",
    });
  });

  it("throws when upload fails", async () => {
    const { supabase } = createSupabaseStorageStub({
      uploadError: { message: "upload failed" },
    });
    const uploadPageImage = createPageImageUploader(
      Promise.resolve(supabase as never)
    );
    const file = new File(["content"], "avatar.png", {
      type: "image/png",
      lastModified: 10,
    });

    await expect(
      uploadPageImage({ pageId: "page-1", userId: "user-1", file })
    ).rejects.toThrow("upload failed");
  });

  it("throws when the public url is missing", async () => {
    const { supabase } = createSupabaseStorageStub({ publicUrl: null });
    const uploadPageImage = createPageImageUploader(
      Promise.resolve(supabase as never)
    );
    const file = new File(["content"], "avatar.png", {
      type: "image/png",
      lastModified: 10,
    });

    await expect(
      uploadPageImage({ pageId: "page-1", userId: "user-1", file })
    ).rejects.toThrow("Failed to resolve image URL.");
  });

  it("passes an abort signal when provided", async () => {
    const { supabase, calls } = createSupabaseStorageStub({});
    const uploadPageImage = createPageImageUploader(
      Promise.resolve(supabase as never)
    );
    const file = new File([new Uint8Array([1])], "avatar.png", {
      type: "image/png",
    });
    const controller = new AbortController();

    await uploadPageImage({
      pageId: "page-1",
      userId: "user-1",
      file,
      signal: controller.signal,
    });

    expect(calls.upload.options?.signal).toBe(controller.signal);
  });
});

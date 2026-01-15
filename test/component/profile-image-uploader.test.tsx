import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ProfileImageUploader from "@/components/page/profile-image-uploader";
import { toastManager } from "@/components/ui/toast";
import { PAGE_IMAGE_MAX_BYTES } from "@/service/pages/page-image";

const submitSpy = vi.fn();
const uploadMock = vi.fn();

vi.mock("react-router", () => ({
  useFetcher: () => ({
    submit: submitSpy,
    state: "idle",
    data: undefined,
  }),
}));

vi.mock("@/hooks/use-page-image-uploader", () => ({
  usePageImageUploader: () => uploadMock,
}));

vi.mock("@/components/ui/toast", () => ({
  toastManager: {
    add: vi.fn(),
  },
}));

vi.mock("@/components/ui/cropper", () => ({
  Cropper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="cropper">{children}</div>
  ),
  CropperDescription: () => <div />,
  CropperImage: () => <div />,
  CropperCropArea: () => <div />,
}));

describe("ProfileImageUploader", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    submitSpy.mockClear();
    uploadMock.mockReset();
    vi.mocked(toastManager.add).mockClear();
    if (!URL.createObjectURL) {
      URL.createObjectURL = vi.fn(() => "blob:preview");
    } else {
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
    }
    if (!URL.revokeObjectURL) {
      URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    }

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
      (callback: BlobCallback) => {
        callback(new Blob([new Uint8Array([1])], { type: "image/png" }));
      }
    );

    const MockImage = class {
      onload: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      naturalWidth = 100;
      naturalHeight = 100;

      set src(_value: string) {
        if (this.onload) {
          this.onload(new Event("load"));
        }
      }
    };

    vi.stubGlobal("Image", MockImage);
  });

  it("shows a toast when the file exceeds 3MB", async () => {
    const user = userEvent.setup();
    render(
      <ProfileImageUploader
        pageId="page-1"
        userId="user-1"
        imageUrl={null}
        defaultImageUrl="https://example.com/default.png"
        isOwner={true}
        alt="Profile image"
      />
    );

    const input = screen.getByLabelText("Profile image upload");
    const file = new File(
      [new Uint8Array(PAGE_IMAGE_MAX_BYTES + 1)],
      "big.png",
      { type: "image/png" }
    );

    await user.upload(input, file);

    expect(toastManager.add).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        title: "Upload blocked",
        description: "File size must be 3MB or less.",
      })
    );
  });

  it("shows the upload button after selecting a valid file", async () => {
    const user = userEvent.setup();
    render(
      <ProfileImageUploader
        pageId="page-1"
        userId="user-1"
        imageUrl={null}
        defaultImageUrl="https://example.com/default.png"
        isOwner={true}
        alt="Profile image"
      />
    );

    const input = screen.getByLabelText("Profile image upload");
    const file = new File([new Uint8Array(1024)], "small.png", {
      type: "image/png",
    });

    await user.upload(input, file);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument()
    );
  });

  it("does not show a cancel toast if upload is not in progress", async () => {
    const user = userEvent.setup();
    render(
      <ProfileImageUploader
        pageId="page-1"
        userId="user-1"
        imageUrl={null}
        defaultImageUrl="https://example.com/default.png"
        isOwner={true}
        alt="Profile image"
      />
    );

    const input = screen.getByLabelText("Profile image upload");
    const file = new File([new Uint8Array(1024)], "small.png", {
      type: "image/png",
    });

    await user.upload(input, file);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(toastManager.add).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: "Upload canceled" })
    );
  });

  it("shows a cancel toast when upload is in progress", async () => {
    const user = userEvent.setup();
    let resolveUpload: ((value: { publicUrl: string }) => void) | null = null;
    uploadMock.mockImplementation(
      () =>
        new Promise<{ publicUrl: string }>((resolve) => {
          resolveUpload = resolve;
        })
    );

    render(
      <ProfileImageUploader
        pageId="page-1"
        userId="user-1"
        imageUrl={null}
        defaultImageUrl="https://example.com/default.png"
        isOwner={true}
        alt="Profile image"
      />
    );

    const input = screen.getByLabelText("Profile image upload");
    const file = new File([new Uint8Array(1024)], "small.png", {
      type: "image/png",
    });

    await user.upload(input, file);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument()
    );

    await user.click(screen.getByRole("button", { name: "Upload" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(toastManager.add).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Upload canceled" })
    );

    resolveUpload?.({ publicUrl: "https://cdn.example.com/avatar.png" });
  });
});

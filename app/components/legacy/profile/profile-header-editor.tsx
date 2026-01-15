import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
} from "react";
import { DotsThreeIcon, ImageSquareIcon, XIcon } from "@phosphor-icons/react";
import { type FetcherWithComponents, useFetcher } from "react-router";

import { cn } from "@/lib/utils";
import { Popover, PopoverPanel, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "../../ui/button";
import EditableParagraph from "./editable-paragraph";
import { usePageAutoSaveActions } from "@/hooks/page/use-page-auto-save-controller";
import { usePageImageUploader } from "@/hooks/use-page-image-uploader";
import VisibilityToggle from "./visibility-toggle";
import { toastManager } from "@/components/ui/toast";
import { Separator } from "../../ui/separator";
import {
  createUmamiAttemptId,
  trackUmamiEvent,
} from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";
import ProfileImageOptionDrawer from "./profile-image-option-drawer";

interface ProfileHeaderEditorProps {
  pageId: string;
  userId: string;
  imageUrl: string | null;
  title: string | null;
  description: string | null;
  handle: string;
  isOwner: boolean;
  isMobilePreview: boolean;
  isPublic: boolean;
}

interface ProfileHeaderFormProps {
  fetcher: FetcherWithComponents<unknown>;
  pageId: string;
  isPublic: boolean;
  isReadOnly: boolean;
  isMobilePreview: boolean;
  handle: string;
  title: string | null;
  titleValue: string;
  descriptionValue: string;
  titleError: string | null;
  resolvedImageUrl: string;
  hasImage: boolean;
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  imageInputRef: RefObject<HTMLInputElement | null>;
  handleRemoveImage: () => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onTitleChange: (value: string) => void;
  onTitleBlur: () => void;
  onDescriptionChange: (value: string) => void;
  onDescriptionBlur: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function ProfileHeaderEditor({
  pageId,
  userId,
  imageUrl,
  title,
  description,
  handle,
  isOwner,
  isMobilePreview,
  isPublic,
}: ProfileHeaderEditorProps) {
  const updateDraft = usePageAutoSaveActions((actions) => actions.updateDraft);
  const markDirty = usePageAutoSaveActions((actions) => actions.markDirty);
  const markError = usePageAutoSaveActions((actions) => actions.markError);
  const uploadPageImage = usePageImageUploader();
  const fetcher = useFetcher();

  const [imageValue, setImageValue] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageCleared, setIsImageCleared] = useState(false);
  const [titleValue, setTitleValue] = useState(title ?? "");
  const [descriptionValue, setDescriptionValue] = useState(description ?? "");
  const [titleError, setTitleError] = useState<string | null>(null);
  const existingImageUrl = imageUrl?.trim() ?? "";
  const resolvedImageUrl = isImageCleared
    ? ""
    : (previewUrl ?? existingImageUrl);
  const hasImage = resolvedImageUrl.length > 0;
  const isReadOnly = !isOwner;
  const titlePlaceholder = isReadOnly ? "" : "Add a title";
  const descriptionPlaceholder = isReadOnly ? "" : "Add a bio";
  const imageInputRef = useRef<HTMLInputElement>(null);
  const uploadRequestIdRef = useRef(0);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleProfileImageInputChange(event, setImageValue);
  };

  const getTitleError = (value: string) =>
    value.trim().length === 0 ? "Title is required." : null;

  const handleTitleChange = (value: string) => {
    setTitleValue(value);
    if (!isReadOnly) {
      setTitleError(getTitleError(value));
    }
  };

  const handleTitleBlur = () => {
    if (!isReadOnly) {
      setTitleError(getTitleError(titleValue));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescriptionValue(value);
  };

  const handleRemoveImage = () => {
    if (isReadOnly) {
      return;
    }

    uploadRequestIdRef.current += 1;
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setIsImageCleared(true);
    setImageValue(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    markDirty();
    updateDraft({ image_url: null });
  };

  useEffect(() => {
    if (existingImageUrl.length > 0) {
      setIsImageCleared(false);
    }
  }, [existingImageUrl]);

  useEffect(() => {
    if (!(imageValue instanceof File)) {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      return;
    }

    if (isReadOnly) {
      return;
    }

    const validationError = getProfileImageValidationError(imageValue);
    if (validationError) {
      toastManager.add({
        type: "error",
        title: "Upload blocked",
        description: validationError,
      });
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      setImageValue(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;
    let attemptId: string | null = null;
    const requestId = (uploadRequestIdRef.current += 1);

    const runUpload = async () => {
      if (cancelled || requestId !== uploadRequestIdRef.current) {
        return;
      }

      attemptId = createUmamiAttemptId("profile-image");
      trackUmamiEvent(
        UMAMI_EVENTS.feature.profileImage.upload,
        {
          [UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
          [UMAMI_PROP_KEYS.ctx.pageId]: pageId,
          [UMAMI_PROP_KEYS.ctx.action]: "start",
        },
        {
          dedupeKey: `profile-image-upload:${attemptId}`,
          once: true,
        }
      );

      objectUrl = URL.createObjectURL(imageValue);
      setPreviewUrl(objectUrl);
      setIsImageCleared(false);
      markDirty();

      try {
        const { publicUrl } = await uploadPageImage({
          pageId,
          userId,
          file: imageValue,
        });

        if (cancelled || requestId !== uploadRequestIdRef.current) {
          return;
        }

        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }

        setPreviewUrl(publicUrl);
        updateDraft({ image_url: publicUrl });
        if (attemptId) {
          trackUmamiEvent(
            UMAMI_EVENTS.feature.profileImage.success,
            {
              [UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
              [UMAMI_PROP_KEYS.ctx.pageId]: pageId,
            },
            {
              dedupeKey: `profile-image-success:${attemptId}`,
              once: true,
            }
          );
        }
      } catch (error) {
        if (!cancelled && requestId === uploadRequestIdRef.current) {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
          }
          setPreviewUrl(null);
          markError();
          if (attemptId) {
            trackUmamiEvent(
              UMAMI_EVENTS.feature.profileImage.error,
              {
                [UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
                [UMAMI_PROP_KEYS.ctx.pageId]: pageId,
                [UMAMI_PROP_KEYS.ctx.errorCode]: "upload_failed",
              },
              {
                dedupeKey: `profile-image-error:${attemptId}`,
                once: true,
              }
            );
          }
        }
      }
    };

    void runUpload();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [
    imageValue,
    isReadOnly,
    pageId,
    updateDraft,
    markDirty,
    markError,
    uploadPageImage,
  ]);

  useEffect(() => {
    if (isReadOnly) {
      return;
    }

    updateDraft({
      title: titleValue,
      description: descriptionValue,
    });
  }, [titleValue, descriptionValue, isReadOnly, updateDraft]);

  useEffect(() => {
    if (isReadOnly) {
      setTitleError(null);
    }
  }, [isReadOnly]);

  return (
    <>
      {/* <LegacyProfileHeaderForm
        fetcher={fetcher}
        pageId={pageId}
        isPublic={isPublic}
        isReadOnly={isReadOnly}
        isMobilePreview={isMobilePreview}
        handle={handle}
        title={title}
        titleValue={titleValue}
        descriptionValue={descriptionValue}
        titleError={titleError}
        resolvedImageUrl={resolvedImageUrl}
        hasImage={hasImage}
        titlePlaceholder={titlePlaceholder}
        descriptionPlaceholder={descriptionPlaceholder}
        imageInputRef={imageInputRef}
        handleRemoveImage={handleRemoveImage}
        onImageChange={handleImageChange}
        onTitleChange={handleTitleChange}
        onTitleBlur={handleTitleBlur}
        onDescriptionChange={handleDescriptionChange}
        onDescriptionBlur={() => undefined}
        onSubmit={handleSubmit}
      /> */}
      <ProfileHeaderCardForm
        fetcher={fetcher}
        pageId={pageId}
        isPublic={isPublic}
        isReadOnly={isReadOnly}
        isMobilePreview={isMobilePreview}
        handle={handle}
        title={title}
        titleValue={titleValue}
        descriptionValue={descriptionValue}
        titleError={titleError}
        resolvedImageUrl={resolvedImageUrl}
        hasImage={hasImage}
        titlePlaceholder={titlePlaceholder}
        descriptionPlaceholder={descriptionPlaceholder}
        imageInputRef={imageInputRef}
        handleRemoveImage={handleRemoveImage}
        onImageChange={handleImageChange}
        onTitleChange={handleTitleChange}
        onTitleBlur={handleTitleBlur}
        onDescriptionChange={handleDescriptionChange}
        onDescriptionBlur={() => undefined}
        onSubmit={handleSubmit}
      />
    </>
  );
}

function LegacyProfileHeaderForm({
  fetcher,
  isReadOnly,
  isMobilePreview,
  handle,
  title,
  titleValue,
  descriptionValue,
  titleError,
  resolvedImageUrl,
  hasImage,
  titlePlaceholder,
  descriptionPlaceholder,
  imageInputRef,
  handleRemoveImage,
  onImageChange,
  onTitleChange,
  onTitleBlur,
  onDescriptionChange,
  onDescriptionBlur,
  onSubmit,
}: ProfileHeaderFormProps) {
  const handleSelectImage = () => imageInputRef.current?.click();
  const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false);
  const handleUploadClick = () => {
    setIsImagePopoverOpen(false);
    handleSelectImage();
  };
  const handleRemoveClick = () => {
    setIsImagePopoverOpen(false);
    handleRemoveImage();
  };

  return (
    <fetcher.Form
      className="flex w-full flex-col justify-center gap-2 px-4 xl:gap-4"
      onSubmit={onSubmit}
      noValidate
    >
      <div className="gap-2 mb-4">
        <div className="relative inline-flex group w-fit">
          <Button
            type="button"
            variant={"secondary"}
            className={cn(
              "relative aspect-square size-30 overflow-hidden rounded-full p-0 disabled:opacity-100",
              isMobilePreview ? "size-30" : "xl:size-46"
            )}
            disabled={isReadOnly}
          >
            {hasImage && (
              <img
                src={resolvedImageUrl}
                alt={""}
                className="absolute inset-0 h-full w-full object-cover transition-all hover:grayscale-25"
              />
            )}
            <span className={cn("sr-only")}>{handle}</span>
          </Button>
          {!isReadOnly && (
            <Popover
              open={isImagePopoverOpen}
              onOpenChange={setIsImagePopoverOpen}
            >
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-lg"
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full shadow-md hover:bg-input"
                    aria-label="Profile image actions"
                  >
                    <DotsThreeIcon className="size-5" weight="bold" />
                  </Button>
                }
              />
              <PopoverPanel
                side="bottom"
                align="center"
                sideOffset={12}
                className="w-52 p-2"
              >
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={handleUploadClick}
                  >
                    <ImageSquareIcon className="size-4" />
                    Upload image
                  </Button>
                  {hasImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                      onClick={handleRemoveClick}
                    >
                      <XIcon className="size-4" weight="bold" />
                      Remove image
                    </Button>
                  )}
                </div>
              </PopoverPanel>
            </Popover>
          )}
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          name="image_url"
          className="sr-only"
          onChange={onImageChange}
          disabled={isReadOnly}
          aria-disabled={isReadOnly}
        />
      </div>

      <div className="w-full max-w-xl xl:mb-2">
        <EditableParagraph
          value={titleValue}
          onValueChange={onTitleChange}
          onValueBlur={onTitleBlur}
          readOnly={isReadOnly}
          placeholder={titlePlaceholder}
          ariaLabel="Profile title"
          aria-invalid={!!titleError}
          className={cn(
            "text-3xl font-bold tracking-tight py-1",
            isMobilePreview ? "text-3xl" : "xl:text-4xl",
            isReadOnly && "truncate"
          )}
        />
        {titleError ? (
          <p className="text-destructive text-sm">{titleError}</p>
        ) : null}
      </div>

      <div className="w-full max-w-2xl">
        <EditableParagraph
          value={descriptionValue}
          onValueChange={onDescriptionChange}
          onValueBlur={onDescriptionBlur}
          readOnly={isReadOnly}
          placeholder={descriptionPlaceholder}
          ariaLabel="Profile description"
          multiline
          className={cn(
            "text-base leading-relaxed font-light text-primary tracking-widest",
            isMobilePreview ? "text-base" : "xl:text-lg",
            isReadOnly && "truncate"
          )}
        />
      </div>
    </fetcher.Form>
  );
}

function ProfileHeaderCardForm({
  fetcher,
  pageId,
  isPublic,
  isReadOnly,
  isMobilePreview,
  handle,
  title,
  titleValue,
  descriptionValue,
  titleError,
  resolvedImageUrl,
  hasImage,
  titlePlaceholder,
  descriptionPlaceholder,
  imageInputRef,
  handleRemoveImage,
  onImageChange,
  onTitleChange,
  onTitleBlur,
  onDescriptionChange,
  onDescriptionBlur,
  onSubmit,
}: ProfileHeaderFormProps) {
  return (
    <fetcher.Form
      className={cn(
        "w-full items-center gap-6 h-full max-h-full relative",
        !isMobilePreview && "xl:items-start xl:gap-8 xl:h-full"
      )}
      onSubmit={onSubmit}
      noValidate
    >
      {/* Image */}
      <div
        className={cn(
          "w-full h-full max-h-full",
          !isMobilePreview && "xl:h-full xl:max-h-full"
        )}
      >
        <div className={cn("relative overflow-hidden bg-neutral-900/10 h-full")}>
          {hasImage ? (
            <img
              src={resolvedImageUrl}
              alt={title ?? handle ?? "Profile image"}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-neutral-900 via-neutral-700/70 to-neutral-950" />
          )}

          {/* Multi-layer gradient overlay - refined for mobile app feel */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0",
              "bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.4)_40%,rgba(0,0,0,0.1)_70%,transparent_100%)]"
            )}
          />

          <div className="pointer-events-none absolute right-0 inset-y-0 bottom-0 h-full w-1/7 dark:bg-linear-to-l dark:from-background dark:via-70% dark:to-transparent" />

          {!isReadOnly && (
            <div className="absolute right-4 top-4">
              <ProfileImageOptionDrawer
                imageRef={imageInputRef}
                pageId={pageId}
                isVisible={isPublic}
                hasImage={hasImage}
                onRemoveImage={handleRemoveImage}
              />
            </div>
          )}
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          name="image_url"
          className="sr-only hidden"
          onChange={onImageChange}
          disabled={isReadOnly}
          aria-disabled={isReadOnly}
        />
      </div>
      {/* Text container - bold typography like reference image */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col gap-1 px-5 pb-6",
          !isMobilePreview && "xl:px-6 xl:pb-8"
        )}
      >
        <div className="relative z-10 w-full flex flex-col gap-1.5">
          <div className="w-full text-left">
            <EditableParagraph
              value={titleValue}
              onValueChange={onTitleChange}
              onValueBlur={onTitleBlur}
              readOnly={isReadOnly}
              placeholder={titlePlaceholder}
              ariaLabel="Profile title"
              aria-invalid={!!titleError}
              className={cn(
                "font-semibold tracking-[-0.02em] leading-[1.1] text-white",
                "drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]",
                "data-[empty=true]:before:text-white/40",
                "text-3xl",
                !isMobilePreview && "xl:text-4xl",
                isReadOnly && "truncate"
              )}
            />
            {titleError ? (
              <p className="text-destructive text-sm">{titleError}</p>
            ) : null}
          </div>
          <div className="w-full text-left">
            <EditableParagraph
              value={descriptionValue}
              onValueChange={onDescriptionChange}
              onValueBlur={onDescriptionBlur}
              readOnly={isReadOnly}
              placeholder={descriptionPlaceholder}
              ariaLabel="Profile description"
              multiline
              className={cn(
                "font-light tracking-wide leading-relaxed text-white/85 line-clamp-2",
                "data-[empty=true]:before:text-white/40",
                "text-sm",
                !isMobilePreview && "xl:text-base",
                isReadOnly && "truncate"
              )}
            />
          </div>
        </div>
      </div>
    </fetcher.Form>
  );
}

function handleProfileImageInputChange(
  event: ChangeEvent<HTMLInputElement>,
  onChange: (value: File | null) => void
) {
  const file = event.currentTarget.files?.[0] ?? null;

  if (file) {
    const validationError = getProfileImageValidationError(file);
    if (validationError) {
      toastManager.add({
        type: "error",
        title: "Upload blocked",
        description: validationError,
      });
      event.currentTarget.value = "";
      return;
    }
  }

  onChange(file);
}

const PROFILE_IMAGE_MAX_BYTES = 2_000_000;
const PROFILE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

function getProfileImageValidationError(file: File): string | null {
  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    return "File size must be 2MB or less.";
  }

  if (!PROFILE_IMAGE_TYPES.has(file.type)) {
    return "Only image files are supported.";
  }

  return null;
}

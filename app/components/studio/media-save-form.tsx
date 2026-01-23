import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";
import ItemLayoutSelector from "@/components/studio/item-layout-selector";
import { usePageMediaUploader } from "@/hooks/use-page-media-uploader";
import { cn } from "@/lib/utils";
import { getPageMediaValidationError, normalizeOptionalText, type PageMediaKind, resolvePageMediaKind } from "@/service/pages/page-media";
import type { PageProfileActionData } from "@/service/pages/page-profile.action";
import type { ProfileItemLayout } from "types/studio.types";

type MediaSaveFormProps = {
	pageId: string;
	userId: string;
	onSuccess?: () => void;
	onCancel?: () => void;
};
export default function MediaSaveForm({ pageId, userId, onSuccess, onCancel }: MediaSaveFormProps) {
	const uploadPageMedia = usePageMediaUploader();
	const fetcher = useFetcher<PageProfileActionData>();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const uploadRequestIdRef = useRef(0);
	const uploadAbortRef = useRef<AbortController | null>(null);
	const [captionValue, setCaptionValue] = useState("");
	const [urlValue, setUrlValue] = useState("");
	const [mediaUrl, setMediaUrl] = useState<string | null>(null);
	const [mediaType, setMediaType] = useState<PageMediaKind | null>(null);
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [isDragOver, setIsDragOver] = useState(false);
	const [layout, setLayout] = useState<ProfileItemLayout>("compact");

	const isSaving = fetcher.state !== "idle";
	const formError = fetcher.data?.intent === "media-save" && !fetcher.data?.success ? fetcher.data.formError : undefined;
	const canSave = Boolean(mediaUrl && mediaType) && !isUploading && !isSaving;

	useEffect(() => {
		if (fetcher.data?.success && fetcher.data.intent === "media-save") {
			setMediaUrl(null);
			setMediaType(null);
			setPendingFile(null);
			setCaptionValue("");
			setUrlValue("");
			setUploadError(null);
			setLayout("compact");
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			onSuccess?.();
		}
	}, [fetcher.data, onSuccess]);

	const handleSelectFile = () => {
		fileInputRef.current?.click();
	};

	const handleUploadError = (message: string) => {
		setUploadError(message);
		toastManager.add({
			type: "error",
			title: "Upload failed",
			description: message,
		});
	};

	const uploadMediaFile = async (file: File, kind: PageMediaKind) => {
		const requestId = (uploadRequestIdRef.current += 1);
		if (uploadAbortRef.current) {
			uploadAbortRef.current.abort();
		}
		const abortController = new AbortController();
		uploadAbortRef.current = abortController;
		setIsUploading(true);
		setUploadError(null);
		setPendingFile(file);
		setMediaType(kind);

		try {
			const uploadFile = file;
			if (requestId !== uploadRequestIdRef.current) {
				return;
			}

			const { publicUrl } = await uploadPageMedia({
				pageId,
				userId,
				file: uploadFile,
				signal: abortController.signal,
			});

			if (requestId !== uploadRequestIdRef.current) {
				return;
			}

			setMediaUrl(publicUrl);
			setPendingFile(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} catch (error) {
			if ((error instanceof DOMException && error.name === "AbortError") || (error instanceof Error && error.name === "AbortError")) {
				return;
			}

			handleUploadError(error instanceof Error ? error.message : "Upload failed.");
		} finally {
			if (requestId === uploadRequestIdRef.current) {
				setIsUploading(false);
			}
			if (uploadAbortRef.current === abortController) {
				uploadAbortRef.current = null;
			}
		}
	};

	const handleFile = (file: File) => {
		const validationError = getPageMediaValidationError(file);
		if (validationError) {
			toastManager.add({
				type: "error",
				title: "Upload blocked",
				description: validationError,
			});
			return;
		}

		const kind = resolvePageMediaKind(file);
		if (!kind) {
			toastManager.add({
				type: "error",
				title: "Upload blocked",
				description: "Unsupported file type.",
			});
			return;
		}

		setUploadError(null);
		setPendingFile(null);
		void uploadMediaFile(file, kind);
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0];
		if (!file) {
			return;
		}

		handleFile(file);
	};

	const handleRetryUpload = () => {
		if (!pendingFile || !mediaType) {
			return;
		}

		void uploadMediaFile(pendingFile, mediaType);
	};

	const handleSave = () => {
		if (!mediaUrl || !mediaType) {
			return;
		}

		const formData = new FormData();
		formData.set("intent", "media-save");
		formData.set("pageId", pageId);
		formData.set("mediaUrl", mediaUrl);
		formData.set("mediaType", mediaType);
		formData.set("layout", layout);
		const normalizedCaption = normalizeOptionalText(captionValue);
		const normalizedUrl = normalizeOptionalText(urlValue);
		if (normalizedCaption !== null) {
			formData.set("caption", normalizedCaption);
		} else {
			formData.set("caption", "");
		}
		if (normalizedUrl !== null) {
			formData.set("url", normalizedUrl);
		} else {
			formData.set("url", "");
		}

		fetcher.submit(formData, { method: "post" });
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragOver(false);

		const file = event.dataTransfer.files?.[0];
		if (!file) {
			return;
		}

		handleFile(file);
	};

	return (
		<div className="flex h-full flex-col gap-4 p-2">
			{mediaUrl ? (
				<div className="relative">
					<div
						className={
							mediaType === "video"
								? "relative aspect-video w-full overflow-hidden rounded-2xl bg-muted/60"
								: "relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/60"
						}
					>
						{mediaType === "video" ? (
							<video src={mediaUrl} className="h-full w-full object-cover" preload="metadata" playsInline muted loop autoPlay>
								<track kind="captions" />
							</video>
						) : (
							<img src={mediaUrl} alt={captionValue || "Media"} className="h-full w-full object-cover" />
						)}
						{isUploading ? (
							<div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white">Uploading...</div>
						) : null}
					</div>
					<div className="absolute right-2 bottom-2 flex items-center justify-between gap-2">
						<Button type="button" variant="default" size="sm" onClick={handleSelectFile} disabled={isUploading} className={"rounded-md"}>
							Change
						</Button>
					</div>
				</div>
			) : (
				<section
					aria-label="File upload area"
					className={cn(
						"flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/20 px-4 py-8 text-center",
						isDragOver ? "border-brand bg-brand/5" : "border-border/70",
					)}
					onDragOver={(event) => {
						event.preventDefault();
						setIsDragOver(true);
					}}
					onDragLeave={() => setIsDragOver(false)}
					onDrop={handleDrop}
				>
					<p className="font-medium text-sm">Drag and drop or select a file</p>
					<p className="text-muted-foreground text-xs">Image or video files only</p>
					<p className="text-muted-foreground text-xs">Max 3MB</p>
					<Button type="button" variant="secondary" size="sm" onClick={handleSelectFile}>
						Select file
					</Button>
					{uploadError && pendingFile ? (
						<Button type="button" variant="brand" size="sm" onClick={handleRetryUpload} disabled={isUploading}>
							Retry
						</Button>
					) : null}
				</section>
			)}

			{mediaUrl ? (
				<div className="flex flex-col gap-3">
					<Field>
						<FieldContent>
							<div className="relative">
								<FieldLabel
									htmlFor="media-caption"
									className="pointer-events-none absolute top-0 left-0 z-10 w-full rounded-lg bg-muted pt-2 pl-3 text-muted-foreground text-sm"
								>
									Caption
								</FieldLabel>
								<Textarea
									id="media-caption"
									value={captionValue}
									autoComplete="off"
									placeholder="Add a caption..."
									className="max-h-32 overflow-y-auto rounded-lg border-0 px-3 pt-8"
									onChange={(event) => setCaptionValue(event.target.value)}
									disabled={isSaving}
								/>
							</div>
						</FieldContent>
					</Field>
					<Field>
						<FieldContent>
							<div className="relative">
								<FieldLabel htmlFor="media-url" className="pointer-events-none absolute top-2 left-3 text-muted-foreground text-sm">
									URL
								</FieldLabel>
								<Input
									id="media-url"
									value={urlValue}
									autoComplete="off"
									placeholder="https://"
									className="h-16 rounded-lg border-0 px-3 pt-8"
									onChange={(event) => setUrlValue(event.target.value)}
									disabled={isSaving}
								/>
							</div>
						</FieldContent>
					</Field>
					{uploadError ? (
						<div className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-xs">
							<span>{uploadError}</span>
							<Button type="button" variant="ghost" size="sm" onClick={handleRetryUpload} disabled={isUploading}>
								Retry
							</Button>
						</div>
					) : null}
				</div>
			) : null}

			{formError ? <p className="text-destructive text-xs">{formError}</p> : null}
			<ItemLayoutSelector value={layout} onChange={setLayout} disabled={isSaving || isUploading} />

			<div className="flex gap-2 pt-2">
				{onCancel && (
					<Button
						type="button"
						size={"lg"}
						variant="secondary"
						onClick={onCancel}
						disabled={isSaving || isUploading}
						className="flex-1 rounded-2xl"
					>
						Cancel
					</Button>
				)}
				<Button
					type="button"
					size={"lg"}
					variant={"brand"}
					disabled={!canSave}
					aria-busy={isSaving}
					onClick={handleSave}
					className="flex-1 rounded-2xl"
				>
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpg,image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
				className="sr-only"
				onChange={handleFileChange}
				aria-label="Media upload"
			/>
		</div>
	);
}

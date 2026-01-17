import { XIcon } from "@phosphor-icons/react";
import { IconX } from "@tabler/icons-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "@/components/ui/button";
import { Cropper, CropperCropArea, CropperDescription, CropperImage } from "@/components/ui/cropper";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toastManager } from "@/components/ui/toast";
import { usePageImageUploader } from "@/hooks/use-page-image-uploader";
import { cn } from "@/lib/utils";
import { getPageImageValidationError } from "@/service/pages/page-image";

type CropArea = { x: number; y: number; width: number; height: number };

type ProfileImageUploaderActionData = {
	formError?: string;
	success?: boolean;
	intent?: "update-image" | "remove-image";
};

type ProfileImageUploaderProps = {
	pageId: string;
	userId: string;
	imageUrl: string | null;
	alt: string;
};

type CropInput = {
	previewUrl: string;
	cropArea: CropArea | null;
	file: File;
};

function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error("Failed to load image."));
		image.src = url;
	});
}

async function cropImageToFile({ previewUrl, cropArea, file }: CropInput): Promise<File> {
	const image = await loadImage(previewUrl);
	const crop = cropArea ?? {
		x: 0,
		y: 0,
		width: image.naturalWidth,
		height: image.naturalHeight,
	};

	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.round(crop.width));
	canvas.height = Math.max(1, Math.round(crop.height));

	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Failed to prepare crop canvas.");
	}

	context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);

	const blob = await new Promise<Blob | null>((resolve) => {
		canvas.toBlob(resolve, file.type || "image/png");
	});

	if (!blob) {
		throw new Error("Failed to generate cropped image.");
	}

	return new File([blob], file.name, {
		type: file.type || "image/png",
		lastModified: Date.now(),
	});
}

export default function ProfileImageUploader({ pageId, userId, imageUrl, alt }: ProfileImageUploaderProps) {
	const uploadPageImage = usePageImageUploader();
	const fetcher = useFetcher();
	const actionData = fetcher.data as ProfileImageUploaderActionData | undefined;
	const fileInputRef = useRef<HTMLInputElement>(null);
	const previousImageUrlRef = useRef(imageUrl ?? "");
	const uploadRequestIdRef = useRef(0);
	const uploadAbortRef = useRef<AbortController | null>(null);
	const isPendingRef = useRef(false);
	const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl ?? "");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [cropArea, setCropArea] = useState<CropArea | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	useEffect(() => {
		if (isPendingRef.current) {
			return;
		}

		setCurrentImageUrl(imageUrl ?? "");
	}, [imageUrl]);

	useEffect(() => {
		if (!selectedFile) {
			setPreviewUrl(null);
			setCropArea(null);
			return;
		}

		const objectUrl = URL.createObjectURL(selectedFile);
		setPreviewUrl(objectUrl);
		setCropArea(null);

		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [selectedFile]);

	useEffect(() => {
		if (!actionData) {
			return;
		}

		if (!actionData.formError) {
			isPendingRef.current = false;
			return;
		}

		if (isPendingRef.current) {
			setCurrentImageUrl(previousImageUrlRef.current);
		}

		isPendingRef.current = false;
		toastManager.add({
			type: "error",
			title: "Update failed",
			description: actionData.formError,
		});
	}, [actionData]);

	const hasImage = currentImageUrl.length > 0;
	const isCropperOpen = Boolean(previewUrl);

	const handleSelectFile = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0] ?? null;
		if (!file) {
			return;
		}

		const validationError = getPageImageValidationError(file);
		if (validationError) {
			toastManager.add({
				type: "error",
				title: "Upload blocked",
				description: validationError,
			});
			event.currentTarget.value = "";
			return;
		}

		setSelectedFile(file);
	};

	const submitImageUpdate = (nextImageUrl: string | null) => {
		const formData = new FormData();
		formData.set("pageId", pageId);

		if (nextImageUrl) {
			formData.set("intent", "update-image");
			formData.set("imageUrl", nextImageUrl);
		} else {
			formData.set("intent", "remove-image");
		}

		fetcher.submit(formData, { method: "post" });
	};

	const handleRemoveImage = () => {
		uploadRequestIdRef.current += 1;
		if (uploadAbortRef.current) {
			uploadAbortRef.current.abort();
			uploadAbortRef.current = null;
		}
		previousImageUrlRef.current = currentImageUrl;
		isPendingRef.current = true;
		setCurrentImageUrl("");
		setSelectedFile(null);
		submitImageUpdate(null);
	};

	const handleUpload = async () => {
		if (!selectedFile || !previewUrl) {
			return;
		}

		setIsUploading(true);
		const requestId = (uploadRequestIdRef.current += 1);
		const abortController = new AbortController();
		uploadAbortRef.current = abortController;

		try {
			const croppedFile = await cropImageToFile({
				previewUrl,
				cropArea,
				file: selectedFile,
			});
			if (requestId !== uploadRequestIdRef.current) {
				return;
			}

			const { publicUrl } = await uploadPageImage({
				pageId,
				userId,
				file: croppedFile,
				signal: abortController.signal,
			});

			if (requestId !== uploadRequestIdRef.current) {
				return;
			}

			previousImageUrlRef.current = currentImageUrl;
			isPendingRef.current = true;
			setCurrentImageUrl(publicUrl);
			setSelectedFile(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}

			submitImageUpdate(publicUrl);
		} catch (error) {
			if ((error instanceof DOMException && error.name === "AbortError") || (error instanceof Error && error.name === "AbortError")) {
				return;
			}

			toastManager.add({
				type: "error",
				title: "Upload failed",
				description: error instanceof Error ? error.message : "Upload failed.",
			});
		} finally {
			if (requestId === uploadRequestIdRef.current) {
				setIsUploading(false);
			}
			if (uploadAbortRef.current === abortController) {
				uploadAbortRef.current = null;
			}
		}
	};

	const handleCancelCrop = () => {
		const wasUploading = isUploading;
		uploadRequestIdRef.current += 1;
		if (uploadAbortRef.current) {
			uploadAbortRef.current.abort();
			uploadAbortRef.current = null;
		}
		setIsUploading(false);
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		if (wasUploading) {
			toastManager.add({
				type: "info",
				title: "Upload canceled",
			});
		}
	};

	return (
		<div className="">
			<div className="group relative">
				<button
					type="button"
					onClick={handleSelectFile}
					aria-label="Change profile image"
					className={cn(
						"relative size-18 overflow-hidden rounded-full border border-foreground bg-muted transition",
						"hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					)}
				>
					{currentImageUrl ? (
						<img src={currentImageUrl} alt={alt} className="h-full w-full object-cover" />
					) : (
						<div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs"></div>
					)}
				</button>
				{hasImage ? (
					<button
						type="button"
						onClick={(event) => {
							event.stopPropagation();
							handleRemoveImage();
						}}
						aria-label="Remove profile image"
						className={cn(
							"absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background p-2 shadow-sm transition",
							"opacity-0 focus-visible:opacity-100 group-hover:opacity-100",
						)}
					>
						<XIcon className="size-4" weight="bold" />
					</button>
				) : null}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					className="sr-only"
					onChange={handleFileChange}
					aria-label="Profile image upload"
				/>
			</div>

			{previewUrl ? (
				<Dialog
					open={isCropperOpen}
					onOpenChange={(open) => {
						if (open) {
							return;
						}

						handleCancelCrop();
					}}
				>
					<DialogContent className="max-w-lg" showCloseButton={false}>
						<DialogHeader>
							<DialogTitle hidden>Crop profile image</DialogTitle>
							<DialogDescription hidden>Drag to reposition, then upload.</DialogDescription>
						</DialogHeader>
						<DialogClose
							render={
								<Button variant={"ghost"} size={"icon-lg"} className={"absolute top-3 right-3 rounded-full"} disabled={isUploading}>
									<IconX className="size-5" />
								</Button>
							}
						/>
						<div className="flex w-full flex-col gap-3 pt-3">
							<Cropper
								className="h-72 rounded-xl border-2 border-black bg-transparent"
								image={previewUrl}
								aspectRatio={1}
								zoom={1}
								onCropChange={setCropArea}
							>
								<CropperDescription />
								<CropperImage />
								<CropperCropArea className="rounded-full border-black" />
							</Cropper>
							<DialogFooter className="sm:justify-center">
								<Button type="button" variant="outline" className={"grow"} onClick={handleCancelCrop}>
									Cancel
								</Button>
								<Button type="button" className={"grow"} onClick={handleUpload} disabled={isUploading}>
									{isUploading ? "Uploading..." : "Upload"}
								</Button>
							</DialogFooter>
						</div>
					</DialogContent>
				</Dialog>
			) : null}
		</div>
	);
}

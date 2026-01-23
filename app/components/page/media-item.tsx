import { ArrowCircleUpRightIcon } from "@phosphor-icons/react";
import type { StudioOutletContext } from "types/studio.types";
import { Item, ItemContent } from "@/components/ui/item";

type ProfileItem = StudioOutletContext["profileItems"][number];

interface MediaItemProps {
	item: ProfileItem;
}

export default function MediaItem({ item }: MediaItemProps) {
	const config = item.config;
	const mediaData = config?.data;
	const mediaUrl = mediaData?.media_url ?? "";
	const mediaType = mediaData?.media_type ?? "image";
	const caption = mediaData?.caption ?? "";
	const linkUrl = mediaData?.url ?? "";

	if (!mediaUrl) {
		return null;
	}

	const content = (
		<div className="relative flex w-full flex-col gap-3">
			<div
				className={
					mediaType === "video"
						? "relative aspect-video w-full overflow-hidden rounded-xl bg-muted/60 outline outline-border"
						: "relative aspect-square w-full overflow-hidden rounded-xl bg-muted/60 outline outline-border"
				}
			>
				{mediaType === "video" ? (
					<video src={mediaUrl} className="h-full w-full object-cover" preload="metadata" playsInline muted loop autoPlay>
						<track kind="captions" />
					</video>
				) : (
					<img src={mediaUrl} alt={caption || "Media"} className="h-full w-full object-cover" />
				)}
			</div>
			{caption && (
				<p className="absolute bottom-2 left-2 line-clamp-2 w-fit max-w-[calc(100%-1rem)] break-all rounded-lg border bg-background px-2 py-1 text-left text-sm leading-5">
					{caption}
				</p>
			)}
			{linkUrl && (
				<div className="absolute top-2 right-2">
					<div className="size-6 rounded-full border bg-white">
						<a href={linkUrl} target="_blank" rel="noreferrer" className="block">
							<ArrowCircleUpRightIcon weight="fill" className="size-full text-black" />
						</a>
					</div>
				</div>
			)}
		</div>
	);

	return (
		<Item variant={"default"} className="p-0">
			<ItemContent className="min-w-0 flex-1">{content}</ItemContent>
		</Item>
	);
}

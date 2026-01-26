import { useState } from "react";
import { buildPreviewPath } from "@/lib/preview";
import { cn } from "@/lib/utils";
import { getLocalizedPath } from "@/utils/localized-path";
import { Spinner } from "../ui/spinner";

type ProfilePreviewFrameProps = {
	handle: string;
	lang?: string;
	className?: string;
	onLoad?: () => void;
	iframeRef?: React.RefObject<HTMLIFrameElement | null>;
};

export default function ProfilePreviewFrame({ handle, lang, className, onLoad, iframeRef }: ProfilePreviewFrameProps) {
	const localizedPath = getLocalizedPath(lang, `/${handle}`);
	const src = buildPreviewPath(localizedPath);
	const [isLoading, setIsLoading] = useState(true);

	return (
		<div className={cn("relative size-full")}>
			{isLoading && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/10">
					<Spinner className="size-8 text-muted-foreground/50" />
				</div>
			)}

			<iframe
				ref={iframeRef}
				src={src}
				title="Profile preview"
				className={cn("scrollbar-hide", className)}
				onLoad={() => {
					setIsLoading(false);
					onLoad?.();
				}}
				style={{ overflow: "hidden" }}
			/>
		</div>
	);
}

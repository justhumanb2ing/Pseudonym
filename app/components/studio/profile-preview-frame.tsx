import { forwardRef } from "react";
import { buildPreviewPath } from "@/lib/preview";
import { cn } from "@/lib/utils";
import { getLocalizedPath } from "@/utils/localized-path";

type ProfilePreviewFrameProps = {
	handle: string;
	lang?: string;
	className?: string;
	onLoad?: () => void;
};

const ProfilePreviewFrame = forwardRef<HTMLIFrameElement, ProfilePreviewFrameProps>(function ProfilePreviewFrame(
	{ handle, lang, className, onLoad },
	ref,
) {
	const localizedPath = getLocalizedPath(lang, `/${handle}`);
	const src = buildPreviewPath(localizedPath);

	return (
		<iframe
			ref={ref}
			src={src}
			title="Profile preview"
			className={cn("scrollbar-hide", className)}
			onLoad={onLoad}
			style={{ overflow: "hidden" }}
		/>
	);
});

export default ProfilePreviewFrame;

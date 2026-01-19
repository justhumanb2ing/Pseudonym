import { forwardRef } from "react";
import { buildPreviewPath } from "@/lib/preview";
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

	return <iframe ref={ref} src={src} title="Profile preview" className={className} onLoad={onLoad} />;
});

export default ProfilePreviewFrame;

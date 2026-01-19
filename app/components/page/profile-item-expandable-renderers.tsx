import type { StudioOutletContext } from "types/studio.types";
import type { ExpandableCardRenderer } from "@/components/effects/expandable-card";
import ProfileItemActiveSwitch from "@/components/page/profile-item-active-switch";
import { ProfileItemExpandedContent } from "@/components/page/profile-item-expanded-content";

type ProfileItem = StudioOutletContext["profileItems"][number];

export const profileItemCardRenderers: Record<string, ExpandableCardRenderer<ProfileItem>> = {
	link: {
		summary: (item) => {
			const imageUrl = item.data.config?.icon_url ?? item.data.config?.image_url ?? undefined;
			const descriptionText = item.data.config?.site_name ?? undefined;
			return {
				title: item.data.title ?? item.data.type ?? "Untitled",
				description: descriptionText,
				imageUrl,
				ctaContent: <ProfileItemActiveSwitch item={item.data} />,
			};
		},
		expanded: (item) => {
			const imageUrl = item.data.config?.icon_url ?? item.data.config?.image_url ?? undefined;
			const descriptionText = item.data.config?.site_name ?? undefined;
			return {
				title: item.data.title ?? item.data.type ?? "Untitled",
				description: descriptionText,
				imageUrl,
				ctaContent: <ProfileItemActiveSwitch item={item.data} />,
				content: <ProfileItemExpandedContent item={item.data} />,
			};
		},
	},
};

export const profileItemCardFallbackRenderer: ExpandableCardRenderer<ProfileItem> = {
	summary: (item) => ({
		title: item.data.type ?? "Item",
	}),
	expanded: () => ({
		content: <div className="px-4 py-6 text-center text-neutral-500 text-sm">No content yet.</div>,
	}),
};

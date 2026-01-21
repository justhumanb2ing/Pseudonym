import type { StudioOutletContext } from "types/studio.types";
import type { ExpandableCardRenderer } from "@/components/effects/expandable-card";
import ProfileItemActiveSwitch from "@/components/studio/profile-item-active-switch";
import { ProfileItemExpandedContent } from "@/components/studio/profile-item-expanded-content";
import { SectionItemExpandedContent } from "@/components/studio/section-item-expanded-content";
import { TextItemExpandedContent } from "@/components/studio/text-item-expanded-content";

type ProfileItem = StudioOutletContext["profileItems"][number];

export const profileItemCardRenderers: Record<string, ExpandableCardRenderer<ProfileItem>> = {
	link: {
		summary: (item) => {
			const configData = item.data.config?.data;
			const imageUrl = configData?.icon_url ?? configData?.image_url ?? undefined;
			const descriptionText = configData?.site_name ?? undefined;
			const title = configData?.title ?? item.data.type ?? "Untitled";
			return {
				title,
				description: descriptionText,
				imageUrl,
				ctaContent: <ProfileItemActiveSwitch item={item.data} />,
			};
		},
		expanded: (item) => {
			const configData = item.data.config?.data;
			const imageUrl = configData?.icon_url ?? configData?.image_url ?? undefined;
			const descriptionText = configData?.site_name ?? undefined;
			const title = configData?.title ?? item.data.type ?? "Untitled";
			return {
				title,
				description: descriptionText,
				imageUrl,
				ctaContent: <ProfileItemActiveSwitch item={item.data} />,
				content: <ProfileItemExpandedContent item={item.data} />,
			};
		},
	},
	text: {
		summary: (item) => {
			const configData = item.data.config?.data;
			const title = configData?.title ?? "Untitled";
			return {
				title,
				titleClassName: "line-clamp-5",
				ctaContent: <ProfileItemActiveSwitch item={item.data} />,
				ctaClassName: "self-start",
			};
		},
		expanded: (item) => {
			const configData = item.data.config?.data;
			const title = configData?.title ?? "Untitled";
			return {
				title,
				ctaContent: <ProfileItemActiveSwitch item={item.data} />,
				content: <TextItemExpandedContent item={item.data} />,
			};
		},
	},
	section: {
		summary: (item) => {
			const configData = item.data.config?.data;
			const title = configData?.headline ?? "Untitled";
			return {
				title,
				titleClassName: "truncate font-bold",
				ctaContent: <ProfileItemActiveSwitch item={item.data} />,
				ctaClassName: "self-start",
			};
		},
		expanded: (item) => {
			const configData = item.data.config?.data;
			const title = configData?.headline ?? "Untitled";
			return {
				title,
				expandedTitleClassName: "font-bold",
				ctaContent: <ProfileItemActiveSwitch item={item.data} />,
				content: <SectionItemExpandedContent item={item.data} />,
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

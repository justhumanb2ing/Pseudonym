import { useEffect, useMemo } from "react";
import { useIntlayer } from "react-intlayer";
import { useFetcher } from "react-router";
import type { StudioOutletContext } from "types/studio.types";
import { Switch } from "@/components/ui/switch";
import { toastManager } from "@/components/ui/toast";
import { PROFILE_LINK_TOAST_KEYS } from "@/constants/toast-messages";
import type { PageProfileActionData } from "@/service/pages/page-profile.action";

type ProfileItem = StudioOutletContext["profileItems"][number];

type ProfileItemActiveSwitchProps = {
	item: ProfileItem;
	size?: "sm" | "default";
};

const lastToastByItem = new Map<string, string>();

export default function ProfileItemActiveSwitch({ item, size = "default" }: ProfileItemActiveSwitchProps) {
	const { linkToggle } = useIntlayer("toast");
	const fetcher = useFetcher<PageProfileActionData>({
		key: `profile-item-active-${item.id}`,
	});
	const baseIsActive = Boolean(item.is_active);
	const optimisticIsActive = useMemo(() => {
		const nextValue = fetcher.formData?.get("isActive");
		if (typeof nextValue === "string") {
			return nextValue === "true";
		}
		return baseIsActive;
	}, [baseIsActive, fetcher.formData]);

	useEffect(() => {
		const data = fetcher.data;
		if (!data || data.intent !== "link-toggle" || data.itemId !== item.id) {
			return;
		}
		if (data.success) {
			lastToastByItem.delete(item.id);
			return;
		}

		const message = data.formError ?? "Unable to update link visibility.";
		const lastMessage = lastToastByItem.get(item.id);
		if (lastMessage === message) {
			return;
		}

		lastToastByItem.set(item.id, message);
		toastManager.add({
			type: PROFILE_LINK_TOAST_KEYS.toggle.error.type,
			title: linkToggle.errorTitle.value,
			description: message ?? linkToggle.errorDescription.value,
		});
	}, [fetcher.data, item.id, linkToggle.errorDescription.value, linkToggle.errorTitle.value]);

	const handleCheckedChange = (checked: boolean) => {
		lastToastByItem.delete(item.id);
		fetcher.submit(
			{
				intent: "link-toggle",
				itemId: item.id,
				isActive: String(checked),
			},
			{ method: "post" },
		);
	};

	return (
		<Switch
			size={size}
			checked={optimisticIsActive}
			disabled={fetcher.state !== "idle"}
			onCheckedChange={handleCheckedChange}
			aria-label="Toggle link visibility"
		/>
	);
}

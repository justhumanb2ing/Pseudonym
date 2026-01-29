import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { StudioOutletContext } from "types/studio.types";
import { Switch } from "@/components/ui/switch";
import { toastManager } from "@/components/ui/toast";
import type { PageProfileActionData } from "@/service/pages/page-profile.action";

type ProfileItem = StudioOutletContext["profileItems"][number];

type ProfileItemActiveSwitchProps = {
	item: ProfileItem;
	size?: "sm" | "default";
};

const lastToastByItem = new Map<string, string>();
const LINK_TOGGLE_MESSAGES = {
	errorTitle: "Update failed",
	errorDescription: "Unable to update link visibility. Please try again.",
};

export default function ProfileItemActiveSwitch({ item, size = "default" }: ProfileItemActiveSwitchProps) {
	const fetcher = useFetcher<PageProfileActionData>({
		key: `profile-item-active-${item.id}`,
	});
	const baseIsActive = Boolean(item.is_active);
	const [confirmedIsActive, setConfirmedIsActive] = useState(baseIsActive);
	const pendingIsActiveRef = useRef<boolean | null>(null);

	useEffect(() => {
		setConfirmedIsActive(baseIsActive);
	}, [baseIsActive]);

	useEffect(() => {
		const data = fetcher.data;
		if (!data || data.intent !== "link-toggle" || data.itemId !== item.id) {
			return;
		}
		if (data.success) {
			lastToastByItem.delete(item.id);
			if (typeof pendingIsActiveRef.current === "boolean") {
				setConfirmedIsActive(pendingIsActiveRef.current);
			}
			return;
		}

		const message = data.formError ?? "Unable to update link visibility.";
		const lastMessage = lastToastByItem.get(item.id);
		if (lastMessage === message) {
			return;
		}

		lastToastByItem.set(item.id, message);
		toastManager.add({
			type: "error",
			title: LINK_TOGGLE_MESSAGES.errorTitle,
			description: message ?? LINK_TOGGLE_MESSAGES.errorDescription,
		});
	}, [fetcher.data, item.id]);

	const handleCheckedChange = (checked: boolean) => {
		lastToastByItem.delete(item.id);
		pendingIsActiveRef.current = checked;
		fetcher.submit(
			{
				intent: "link-toggle",
				itemId: item.id,
				isActive: String(checked),
			},
			{ method: "post" },
		);
	};

	const displayIsActive =
		fetcher.state !== "idle" && typeof pendingIsActiveRef.current === "boolean" ? pendingIsActiveRef.current : confirmedIsActive;

	return (
		<Switch
			size={size}
			checked={displayIsActive}
			disabled={fetcher.state !== "idle"}
			onCheckedChange={handleCheckedChange}
			aria-label="Toggle link visibility"
		/>
	);
}

export type ToastType = "error" | "info" | "loading" | "success" | "warning";

export type ToastMessageKeySet = {
	type: ToastType;
	titleKey: string;
	descriptionKey?: string;
};

export const PROFILE_LINK_TOAST_KEYS = {
	toggle: {
		loading: {
			type: "loading",
			titleKey: "linkToggle.loadingTitle",
			descriptionKey: "linkToggle.loadingDescription",
		},
		success: {
			type: "success",
			titleKey: "linkToggle.successTitle",
			descriptionKey: "linkToggle.successDescription",
		},
		error: {
			type: "error",
			titleKey: "linkToggle.errorTitle",
			descriptionKey: "linkToggle.errorDescription",
		},
	},
} as const;

import { type Dictionary, t } from "intlayer";

const toastContent = {
	key: "toast",
	content: {
		linkToggle: {
			loadingTitle: t({
				en: "Updating link",
				ko: "링크 업데이트 중",
			}),
			loadingDescription: t({
				en: "Saving link visibility.",
				ko: "링크 표시 상태를 저장 중입니다.",
			}),
			successTitle: t({
				en: "Link updated",
				ko: "링크가 업데이트되었습니다",
			}),
			successDescription: t({
				en: "Link visibility has been updated.",
				ko: "링크 표시 상태가 업데이트되었습니다.",
			}),
			errorTitle: t({
				en: "Update failed",
				ko: "업데이트 실패",
			}),
			errorDescription: t({
				en: "Unable to update link visibility. Please try again.",
				ko: "링크 표시 상태를 업데이트하지 못했습니다. 다시 시도해주세요.",
			}),
		},
	},
} satisfies Dictionary;

export default toastContent;

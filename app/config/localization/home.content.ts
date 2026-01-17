import { type Dictionary, t } from "intlayer";

const homeContent = {
	key: "home",
	content: {
		startForFree: t({
			en: "Start for free",
			ko: "무료로 시작하기",
		}),
	},
} satisfies Dictionary;

export default homeContent;

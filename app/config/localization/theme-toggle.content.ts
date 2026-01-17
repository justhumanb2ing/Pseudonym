import { type Dictionary, t } from "intlayer";

const themeToggleContent = {
	key: "themeToggle",
	content: {
		themeTooltip: t({
			en: "Theme",
			ko: "테마",
		}),
	},
} satisfies Dictionary;

export default themeToggleContent;

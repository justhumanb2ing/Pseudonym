import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
	ssr: true,
	future: {
		v8_middleware: true,
	},
	presets: [vercelPreset()],
	prerender: [
		// 홈페이지
		"/",
		"/en",
		"/ko",
		// Changelog
		"/changelog",
		"/en/changelog",
		"/ko/changelog",
		// Feedback
		"/feedback",
		"/en/feedback",
		"/ko/feedback",
	],
} satisfies Config;

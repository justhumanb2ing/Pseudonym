import type { Config } from "@react-router/dev/config";

export default {
	ssr: true,
	future: {
		v8_middleware: true,
		v8_viteEnvironmentApi: true,
	},
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

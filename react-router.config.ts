import type { Config } from "@react-router/dev/config";

export default {
	ssr: true,
	future: {
		v8_middleware: true,
		v8_viteEnvironmentApi: true,
	},
	// NOTE: prerender는 Cloudflare Vite 플러그인 + viteEnvironmentApi와 호환 문제가 있어 비활성화
	// Cloudflare Workers에서 동적 SSR로 처리됨
	// prerender: [
	// 	"/",
	// 	"/en",
	// 	"/ko",
	// 	"/changelog",
	// 	"/en/changelog",
	// 	"/ko/changelog",
	// 	"/feedback",
	// 	"/en/feedback",
	// 	"/ko/feedback",
	// ],
} satisfies Config;

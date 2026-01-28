import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig((config) => {
	const enableCloudflareInDev = /^(1|true|yes)$/i.test(process.env.DEV_CLOUDFLARE ?? "");
	const useCloudflarePlugin =
		config.command === "build" || (config.command === "serve" && enableCloudflareInDev);
	return {
		// define: {
		// 	__APP_ENV__: JSON.stringify(env.APP_ENV),
		// },
		build: {
			sourcemap: config.mode === "production",
			rollupOptions: {
				onwarn(warning, warn) {
					// base-ui / node_modules sourcemap 경고 제거
					if (warning.code === "SOURCEMAP_ERROR" && warning.message?.includes("node_modules")) {
						return;
					}

					warn(warning);
				},
			},
		},
		define: {
			"globalThis.Cloudflare.compatibilityFlags": {
				enable_nodejs_process_v2: true,
			},
		},
		plugins: [
			...(useCloudflarePlugin ? [cloudflare({ viteEnvironment: { name: "ssr" } })] : []),
			tailwindcss(),
			reactRouter(),
			tsconfigPaths(),
		],
	};
});

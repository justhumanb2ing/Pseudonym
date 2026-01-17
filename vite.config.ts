import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { intlayer, intlayerProxy } from "vite-intlayer";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig((config) => {
	const env = loadEnv(config.mode, process.cwd());

	return {
		define: {
			__APP_ENV__: JSON.stringify(env.APP_ENV),
		},
		build: {
			sourcemap: config.mode === "production",
			rollupOptions: {
				...(config.isSsrBuild ? { input: "./server/app.ts" } : {}),

				onwarn(warning, warn) {
					// base-ui / node_modules sourcemap 경고 제거
					if (warning.code === "SOURCEMAP_ERROR" && warning.message?.includes("node_modules")) {
						return;
					}

					warn(warning);
				},
			},
		},
		plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), intlayer(), intlayerProxy()],
	};
});

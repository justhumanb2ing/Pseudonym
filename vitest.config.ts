import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	plugins: [tsconfigPaths({ projects: ["./tsconfig.cloudflare.json"] })],
	resolve: {
		alias: {
			"@": resolve(rootDir, "app"),
		},
	},
	test: {
		environment: "happy-dom",
		setupFiles: ["./test/setup.ts"],
		pool: "forks",
		globals: true,
	},
});

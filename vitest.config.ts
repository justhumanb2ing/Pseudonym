import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		environment: "happy-dom",
		setupFiles: ["./test/setup.ts"],
		pool: "forks",
		globals: true,
	},
});

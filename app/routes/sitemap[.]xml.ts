import { generateRemixSitemap } from "@forge42/seo-tools/remix/sitemap";
import type { Route } from "./+types/sitemap[.]xml";

// TODO: 일부 경로 제외하기
export async function loader({ request }: Route.LoaderArgs) {
	const { routes } = await import("virtual:react-router/server-build");
	const { origin } = new URL(request.url);

	const sitemap = await generateRemixSitemap({
		domain: origin,
		routes,
		ignore: [
			// auth / onboarding
			"/onboarding",
			"/sign-in",
			"/sign-in/create/sso-callback",

			// dynamic routes
			"/:handle",
			"/studio/:handle",

			// api
			"/api/delete-account",
			"/api/auth",
			"/api/auth/*",
		],
	});

	const allowedPaths = new Set<string>(["/", "/changelog", "/feedback", "/sign-in"]);

	const normalizePath = (path: string) => {
		if (path === "/") {
			return path;
		}

		return path.replace(/\/+$/, "");
	};

	const seenLocs = new Set<string>();
	const filteredSitemap = sitemap.replace(/<url>[\s\S]*?<\/url>/g, (entry) => {
		const locMatch = entry.match(/<loc>(.*?)<\/loc>/);
		if (!locMatch) {
			return "";
		}

		try {
			const pathname = normalizePath(new URL(locMatch[1]).pathname);
			if (!allowedPaths.has(pathname) || seenLocs.has(pathname)) {
				return "";
			}

			seenLocs.add(pathname);
			return entry;
		} catch {
			return "";
		}
	});

	return new Response(filteredSitemap, {
		headers: {
			"Content-Type": "application/xml",
		},
	});
}

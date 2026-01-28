import { generateRobotsTxt } from "@forge42/seo-tools/robots";
import type { Route } from "./+types/robots[.]txt";

export async function loader({ request }: Route.LoaderArgs) {
	const isProductionDeployment = process.env.VERCEL_ENV === "production";
	const domain = new URL(request.url).origin;

	const robotsTxt = generateRobotsTxt([
		{
			userAgent: "*",
			[isProductionDeployment ? "allow" : "disallow"]: ["/"],
			...(isProductionDeployment
				? {
						disallow: ["/api/"],
					}
				: {}),
			sitemap: [`${domain}/sitemap.xml`],
		},
	]);

	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain",
		},
	});
}

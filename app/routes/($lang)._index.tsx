import { generateMeta } from "@forge42/seo-tools/remix/metadata";
import { breadcrumbs } from "@forge42/seo-tools/structured-data/breadcrumb";
import { organization } from "@forge42/seo-tools/structured-data/organization";
import type { MetaFunction } from "react-router";
import { metadataConfig } from "@/config/metadata";
import { useUmamiPageView } from "@/hooks/use-umami-page-view";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";
import { getLocalizedPath } from "@/utils/localized-path";
import HomeFooter from "./home/_home-footer";
import HomeHero from "./home/_home-hero";

const buildUrl = (lang: string | undefined, pathname: string) => new URL(getLocalizedPath(lang, pathname), metadataConfig.url).toString();

const defaultImageUrl = new URL(metadataConfig.defaultImage, metadataConfig.url).toString();

export const meta: MetaFunction = ({ params }) => {
	const url = buildUrl(params.lang, "/");

	return generateMeta(
		{
			title: metadataConfig.title,
			description: metadataConfig.description,
			url,
			image: defaultImageUrl,
			siteName: metadataConfig.title,
			twitterCard: metadataConfig.twitterCard,
		},
		[
			{
				"script:ld+json": breadcrumbs(url, ["Home"]),
			},
			{
				"script:ld+json": organization({
					"@type": "Organization",
					name: metadataConfig.title,
					url,
					logo: defaultImageUrl,
				}),
			},
		],
	);
};

export default function Home() {
	useUmamiPageView({
		eventName: UMAMI_EVENTS.page.homeView,
		props: {
			[UMAMI_PROP_KEYS.ctx.pageKind]: "home",
		},
	});

	return (
		<main className="min-h-screen">
			{/* Landing Page Main Section */}
			<HomeHero />

			{/* Footer */}
			<HomeFooter />
		</main>
	);
}

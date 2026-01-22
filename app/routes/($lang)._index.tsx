import { generateMeta } from "@forge42/seo-tools/remix/metadata";
import { breadcrumbs } from "@forge42/seo-tools/structured-data/breadcrumb";
import { organization } from "@forge42/seo-tools/structured-data/organization";
import type { MetaFunction } from "react-router";
import { metadataConfig } from "@/config/metadata";
import { useUmamiPageView } from "@/hooks/use-umami-page-view";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";
import { getLocalizedPath } from "@/utils/localized-path";
import HomeFooter from "./home/home-footer";
import HomeHero from "./home/home-hero";
import HomeFeature from "./home/home-feature";

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
		<main className="h-screen snap-y snap-proximity overflow-y-auto scroll-smooth">
			{/* Landing Page Main Section */}
			<section className="snap-start">
				<HomeHero />
			</section>

			{/* Feature Section */}
			<section className="snap-start">
				<HomeFeature />
			</section>

			{/* Footer */}
			<section className="snap-start">
				<HomeFooter />
			</section>
		</main>
	);
}

import { getAuth } from "@clerk/react-router/server";
import { generateMeta } from "@forge42/seo-tools/remix/metadata";
import { breadcrumbs } from "@forge42/seo-tools/structured-data/breadcrumb";
import { organization } from "@forge42/seo-tools/structured-data/organization";
import { useIntlayer } from "react-intlayer";
import type { MetaFunction } from "react-router";
import { metadataConfig } from "@/config/metadata";
import { useUmamiPageView } from "@/hooks/use-umami-page-view";
import { getSupabaseServerClient } from "@/lib/supabase";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";
import { getLocalizedPath } from "@/utils/localized-path";
import type { Route } from "./+types/($lang)._index";
import HomeFooter from "./home/_home-footer";
import HomeHeader from "./home/_home-header";
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

export async function loader(args: Route.LoaderArgs) {
	const { userId } = await getAuth(args);

	if (!userId) return { primaryHandle: null };

	const supabase = await getSupabaseServerClient(args);

	const { data, error } = await supabase.from("pages").select("handle").eq("owner_id", userId!).eq("is_primary", true).maybeSingle();

	if (error || !data?.handle) {
		return { primaryHandle: null };
	}

	return { primaryHandle: data.handle };
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { primaryHandle } = loaderData;
	const { startForFree } = useIntlayer("home");

	useUmamiPageView({
		eventName: UMAMI_EVENTS.page.homeView,
		props: {
			[UMAMI_PROP_KEYS.ctx.pageKind]: "home",
		},
	});

	return (
		<main>
			{/* Header */}
			<HomeHeader primaryHandle={primaryHandle} startForFreeLabel={startForFree.value} />

			{/* Landing Page Main Section */}
			<HomeHero />

			{/* Footer */}
			<HomeFooter />
		</main>
	);
}

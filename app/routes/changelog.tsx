import { generateMeta } from "@forge42/seo-tools/remix/metadata";
import { breadcrumbs } from "@forge42/seo-tools/structured-data/breadcrumb";
import { Link, type MetaFunction } from "react-router";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { metadataConfig } from "@/config/metadata";

const buildUrl = (pathname: string) => new URL(pathname, metadataConfig.url).toString();

const defaultImageUrl = new URL(metadataConfig.defaultImage, metadataConfig.url).toString();

export const meta: MetaFunction = () => {
	const changelogUrl = buildUrl("/changelog");

	return generateMeta(
		{
			title: "Changelog",
			description: "Product updates and release notes.",
			url: changelogUrl,
			image: defaultImageUrl,
			siteName: metadataConfig.title,
			twitterCard: metadataConfig.twitterCard,
		},
		[
			{
				"script:ld+json": breadcrumbs(changelogUrl, ["Home", "Changelog"]),
			},
		],
	);
};

export default function ChangeLogRoute() {
	return (
		<main className="container mx-auto flex h-full max-w-2xl flex-col gap-6 p-4">
			<section className="grow rounded-lg">
				<Empty className="h-full">
					<EmptyHeader>
						<EmptyTitle>Nothing has changed</EmptyTitle>
						<EmptyDescription>Everything remains the same for the time being.</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button variant={"brand"} className="px-6" render={<Link to="/">Go Home</Link>}></Button>
					</EmptyContent>
				</Empty>
			</section>
		</main>
	);
}

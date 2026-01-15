import Logo from "@/components/legacy/layout/logo";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { generateMeta } from "@forge42/seo-tools/remix/metadata";
import { breadcrumbs } from "@forge42/seo-tools/structured-data/breadcrumb";
import type { MetaFunction } from "react-router";
import { metadataConfig } from "@/config/metadata";
import { getLocalizedPath } from "@/utils/localized-path";

const buildUrl = (lang: string | undefined, pathname: string) =>
  new URL(getLocalizedPath(lang, pathname), metadataConfig.url).toString();

const defaultImageUrl = new URL(
  metadataConfig.defaultImage,
  metadataConfig.url
).toString();

export const meta: MetaFunction = ({ params }) => {
  const homeUrl = buildUrl(params.lang, "/");
  const changelogUrl = buildUrl(params.lang, "/changelog");

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
    ]
  );
};

export default function ChangeLogRoute() {
  return (
    <main className="h-full max-w-2xl container mx-auto flex flex-col gap-6 p-8">
      <header>
        <Logo />
      </header>
      <section className="grow rounded-lg">
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyTitle>Changelog</EmptyTitle>
            <EmptyDescription>
              Everything remains the same for the time being.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </section>
    </main>
  );
}

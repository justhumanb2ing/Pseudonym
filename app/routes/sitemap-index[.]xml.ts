import { generateSitemapIndex } from "@forge42/seo-tools/sitemap";
import type { Route } from "./+types/sitemap-index[.]xml";

export async function loader({ request }: Route.LoaderArgs) {
  const domain = new URL(request.url).origin;
  const sitemaps = generateSitemapIndex([
    {
      url: `${domain}/sitemap/en.xml`,
      lastmod: "2026-01-13",
    },
    {
      url: `${domain}/sitemap/ko.xml`,
      lastmod: "2026-01-13",
    },
  ]);

  return new Response(sitemaps, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

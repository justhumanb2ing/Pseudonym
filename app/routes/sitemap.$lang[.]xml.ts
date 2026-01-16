import type { Route } from "./+types/sitemap.$lang[.]xml";
import { generateRemixSitemap } from "@forge42/seo-tools/remix/sitemap";

// TODO: 일부 경로 제외하기
export async function loader({ request, params }: Route.LoaderArgs) {
  const { routes } = await import("virtual:react-router/server-build");
  const { origin } = new URL(request.url);
  const { lang } = params;
  
  const sitemap = await generateRemixSitemap({
    domain: origin,
    routes,
    ignore: [
      // root without concrete content
      "/:lang?",

      // auth / onboarding
      "/:lang?/onboarding",
      "/:lang?/sign-in",
      "/:lang?/sign-in/create/sso-callback",

      // dynamic routes
      "/:lang?/:handle",
      "/:lang?/studio/:handle",

      // api
      "/api/delete-account",
    ],
    urlTransformer: (url) => {
      const normalizedLang = lang ? `/${lang}` : "";
      return url.replace("/:lang?", normalizedLang);
    },
    sitemapData: {
      lang,
    },
  });

  const allowedPaths = new Set<string>();
  if (lang) {
    allowedPaths.add(`/${lang}/changelog`);
    allowedPaths.add(`/${lang}/feedback`);
    allowedPaths.add(`/${lang}/sign-in`);

    allowedPaths.add(`/${lang}`);
  }

  const normalizePath = (path: string) => {
    if (path === "/") {
      return path;
    }

    return path.replace(/\/+$/, "");
  };

  const seenLocs = new Set<string>();
  const filteredSitemap = sitemap.replace(
    /<url>[\s\S]*?<\/url>/g,
    (entry) => {
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
    }
  );

  return new Response(filteredSitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

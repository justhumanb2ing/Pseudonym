import { getLocalizedPath } from "@/utils/localized-path";

export const buildUrl = (
  lang: string | undefined,
  pathname: string,
  url: string
) => new URL(getLocalizedPath(lang, pathname), url).toString();

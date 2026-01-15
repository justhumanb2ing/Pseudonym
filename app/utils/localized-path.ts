export const getLocalizedPath = (
  lang: string | undefined,
  pathname: string
) => {
  if (!pathname.startsWith("/")) {
    throw new Error("pathname must start with '/'");
  }
  return lang ? `/${lang}${pathname}` : pathname;
};

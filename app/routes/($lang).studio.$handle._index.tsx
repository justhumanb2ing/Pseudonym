import type { Route } from "./+types/($lang).studio.$handle._index";
import { redirect } from "react-router";
import { getLocalizedPath } from "@/utils/localized-path";

export function loader(args: Route.LoaderArgs) {
  const { lang, handle } = args.params;
  throw redirect(getLocalizedPath(lang, `/studio/${handle}/links`));
}

export default function StudioHandleIndexRoute() {
  return null;
}

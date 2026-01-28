import { redirect } from "react-router";
import type { Route } from "./+types/studio.$handle._index";

export function loader(args: Route.LoaderArgs) {
	const { handle } = args.params;
	if (!handle) {
		throw new Response("Not Found", { status: 404 });
	}
	throw redirect(`/studio/${handle}/links`);
}

export default function StudioHandleIndexRoute() {
	return null;
}

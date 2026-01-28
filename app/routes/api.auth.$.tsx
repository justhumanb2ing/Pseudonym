import { auth } from "@/lib/auth.server";
import type { Route } from "./+types/api.auth.$";

export async function loader(args: Route.LoaderArgs) {
	return auth.handler(args.request);
}

export async function action(args: Route.ActionArgs) {
	return auth.handler(args.request);
}

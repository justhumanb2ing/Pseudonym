import { auth } from "@/lib/auth.server";
import type { Route } from "./+types/api.auth.$";

async function handleAuthRequest(request: Request) {
	try {
		return await auth.handler(request);
	} catch (error) {
		console.error("[auth] Handler error:", error);
		console.error("[auth] Request URL:", request.url);
		console.error("[auth] Request method:", request.method);
		throw error;
	}
}

export async function loader(args: Route.LoaderArgs) {
	return handleAuthRequest(args.request);
}

export async function action(args: Route.ActionArgs) {
	return handleAuthRequest(args.request);
}

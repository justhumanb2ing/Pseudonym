import { getAuth } from "@clerk/react-router/server";
import { type LoaderFunctionArgs, redirect } from "react-router";
import { getSupabaseServerClient } from "@/lib/supabase";
import { resolveOnboardingRedirect } from "@/service/auth/onboarding-guard";
import { getLocalizedPath } from "@/utils/localized-path";

type RequireStudioPageOptions = {
	select: string;
	order?: {
		column: string;
		ascending?: boolean;
		foreignTable?: string;
	};
};

export async function requireStudioPage<TPage extends { owner_id: string }>(args: LoaderFunctionArgs, options: RequireStudioPageOptions) {
	const auth = await getAuth(args);
	const requestWithAuth = Object.assign(args.request, { auth });

	if (!auth.userId) {
		throw redirect(getLocalizedPath(args.params.lang, "/sign-in"));
	}

	const pathname = new URL(args.request.url).pathname;
	const redirectResponse = await resolveOnboardingRedirect({
		...args,
		request: requestWithAuth,
		pathname,
	});
	if (redirectResponse) {
		throw redirectResponse;
	}

	const { handle } = args.params;
	if (!handle) {
		throw new Response("Not Found", { status: 404 });
	}

	const supabase = await getSupabaseServerClient(args);
	const pageQuery = supabase.from("pages").select(options.select).eq("handle", handle);
	if (options.order) {
		pageQuery.order(options.order.column, {
			ascending: options.order.ascending,
			foreignTable: options.order.foreignTable,
		});
	}

	const { data, error } = await pageQuery.maybeSingle();
	const page = data as TPage | null;

	if (error) {
		throw new Response(error.message, { status: 500 });
	}

	if (!page) {
		throw new Response("Not Found", { status: 404 });
	}

	if (page.owner_id !== auth.userId) {
		throw new Response("Forbidden", { status: 403 });
	}

	return { page, handle };
}

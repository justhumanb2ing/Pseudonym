import { getAuth } from "@clerk/react-router/server";
import { Outlet, redirect } from "react-router";
import { isPublicAuthPath } from "@/service/auth/onboarding-guard";
import { getLocalizedPath } from "@/utils/localized-path";
import type { Route } from "./+types/($lang)._auth";

export async function loader(args: Route.LoaderArgs) {
	const { pathname } = new URL(args.request.url);
	const auth = await getAuth(args);

	if (isPublicAuthPath(pathname)) {
		return null;
	}

	// auth 섹션은 로그인 필요 (전역 정책은 root loader에서 처리)
	if (!auth.userId) {
		throw redirect(getLocalizedPath(args.params.lang, "/sign-in"));
	}

	return null;
}

export default function ProtectedLayout() {
	return (
		<main className="flex h-full items-center justify-center">
			<Outlet />
		</main>
	);
}

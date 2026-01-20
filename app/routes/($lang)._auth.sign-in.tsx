import { getAuth } from "@clerk/react-router/server";
import { SignIn } from "@clerk/react-router";
import { generateMeta } from "@forge42/seo-tools/remix/metadata";
import { breadcrumbs } from "@forge42/seo-tools/structured-data/breadcrumb";
import { XIcon } from "@phosphor-icons/react";
import type { MetaFunction } from "react-router";
import { redirect, useParams } from "react-router";
import { LocalizedLink } from "@/components/i18n/localized-link";
import { Button } from "@/components/ui/button";
import { metadataConfig } from "@/config/metadata";
import { useUmamiPageView } from "@/hooks/use-umami-page-view";
import { getSupabaseServerClient } from "@/lib/supabase";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";
import { getLocalizedPath } from "@/utils/localized-path";
import type { Route } from "./+types/($lang)._auth.sign-in";

const buildUrl = (lang: string | undefined, pathname: string) => new URL(getLocalizedPath(lang, pathname), metadataConfig.url).toString();

const defaultImageUrl = new URL(metadataConfig.defaultImage, metadataConfig.url).toString();

export async function loader(args: Route.LoaderArgs) {
	const { userId } = await getAuth(args);

	// 비로그인 사용자는 로그인 폼 표시
	if (!userId) {
		return null;
	}

	// 로그인 사용자: handle 조회 후 studio로 리다이렉트
	const supabase = await getSupabaseServerClient(args);
	const { data } = await supabase.from("pages").select("handle").eq("owner_id", userId).eq("is_primary", true).maybeSingle();

	if (data?.handle) {
		throw redirect(getLocalizedPath(args.params.lang, `/studio/${data.handle}`));
	}

	// handle이 없으면 (온보딩 미완료) onboarding-guard에서 처리
	return null;
}

export const meta: MetaFunction = ({ params }) => {
	const signInUrl = buildUrl(params.lang, "/sign-in");

	return generateMeta(
		{
			title: "Sign In",
			description: "Sign in to beyondthewave.",
			url: signInUrl,
			image: defaultImageUrl,
			siteName: metadataConfig.title,
			twitterCard: metadataConfig.twitterCard,
		},
		[
			{
				"script:ld+json": breadcrumbs(signInUrl, ["Home", "Sign In"]),
			},
		],
	);
};

export default function SignInRoute() {
	const { lang } = useParams();
	const signInPath = lang ? `/${lang}/sign-in` : "/sign-in";
	const signUpUrl = lang ? `/${lang}/sign-up` : "/sign-up";

	useUmamiPageView({
		eventName: UMAMI_EVENTS.page.signInView,
		props: {
			[UMAMI_PROP_KEYS.ctx.pageKind]: "sign_in",
		},
	});

	return (
		<main className="relative flex h-full grow flex-col justify-center">
			<header className="fixed top-5 left-5">
				<Button
					variant={"ghost"}
					size={"icon-lg"}
					className={"rounded-full p-6"}
					render={
						<LocalizedLink to={"/"}>
							<XIcon className="size-6" weight="bold" />
						</LocalizedLink>
					}
				></Button>
			</header>
			<section className="flex h-full w-full items-center justify-center">
				<div className="flex justify-center lg:flex-5">
					<SignIn path={signInPath} signUpUrl={signUpUrl} withSignUp />
				</div>

				<aside className="hidden h-full flex-5 lg:block">
					<div className="relative h-full">
						<img
							src="https://images.unsplash.com/photo-1766963031469-0f52e1ab417a?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
							alt="sign-in-page"
							className="max-h-screen min-h-full w-full object-cover"
						/>
					</div>
				</aside>
			</section>
		</main>
	);
}

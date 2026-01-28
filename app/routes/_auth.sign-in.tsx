import { generateMeta } from "@forge42/seo-tools/remix/metadata";
import { breadcrumbs } from "@forge42/seo-tools/structured-data/breadcrumb";
import { XIcon } from "@phosphor-icons/react";
import { IconBrandGoogle } from "@tabler/icons-react";
import { useState } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { metadataConfig } from "@/config/metadata";
import { useUmamiPageView } from "@/hooks/use-umami-page-view";
import { authClient } from "@/lib/auth-client";
import { getUmamiEventAttributes } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";

const buildAbsoluteUrl = (pathname: string) => new URL(pathname, metadataConfig.url).toString();

const defaultImageUrl = new URL(metadataConfig.defaultImage, metadataConfig.url).toString();

export const buildSignInUrl = () => buildAbsoluteUrl("/sign-in");

export const getSignInCallbackPath = () => "/sign-in";

export const meta: MetaFunction = () => {
	const signInUrl = buildSignInUrl();

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
	const [isSigningIn, setIsSigningIn] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const signUpUrl = "/sign-up";

	useUmamiPageView({
		eventName: UMAMI_EVENTS.page.signInView,
		props: {
			[UMAMI_PROP_KEYS.ctx.pageKind]: "sign_in",
		},
	});

	const handleSignIn = async () => {
		setIsSigningIn(true);
		setErrorMessage(null);

		try {
			await authClient.signIn.social(
				{
					provider: "google",
					// callbackURL,
					newUserCallbackURL: "/onboarding",
				},
				{
					onRequest: () => {},
					onError: (ctx) => {
						console.log(ctx);
					},
				},
			);
		} catch (error) {
			console.error(error);
			setErrorMessage("Could not start Google sign-in. Please try again.");
		} finally {
			setIsSigningIn(false);
		}
	};
	return (
		<main className="relative flex h-full grow flex-col justify-center">
			<header className="fixed top-5 left-5">
				<Button
					variant={"ghost"}
					size={"icon-lg"}
					className={"rounded-full p-6"}
					nativeButton={false}
					render={
						<Link to="/">
							<XIcon className="size-6" weight="bold" />
						</Link>
					}
				></Button>
			</header>
			<section className="flex h-full w-full items-center justify-center">
				<div className="flex justify-center lg:flex-5">
					<div className="flex w-full max-w-sm flex-col gap-6 px-6">
						<div className="space-y-2 text-center">
							<h1 className="font-semibold text-3xl">Sign in</h1>
							<p className="text-muted-foreground text-sm">Start creating your page in minutes.</p>
						</div>
						<Button
							type="button"
							variant="outline"
							size="lg"
							onClick={handleSignIn}
							data-icon="inline-start"
							className="w-full"
							disabled={isSigningIn}
							aria-busy={isSigningIn}
							{...getUmamiEventAttributes(UMAMI_EVENTS.auth.signIn.start, {
								[UMAMI_PROP_KEYS.ctx.source]: "sign_in_page",
								[UMAMI_PROP_KEYS.ctx.action]: "google",
							})}
						>
							<IconBrandGoogle className="size-4" />
							{isSigningIn ? "Connecting..." : "Continue with Google"}
						</Button>
						{errorMessage ? (
							<p className="text-destructive text-sm" aria-live="polite">
								{errorMessage}
							</p>
						) : null}
						<p className="text-muted-foreground text-xs">
							Don't have an account?{" "}
							<Link to={signUpUrl} className="text-foreground underline">
								Sign up
							</Link>
						</p>
					</div>
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

import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation, useNavigation } from "react-router";
import type { ShouldRevalidateFunctionArgs } from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { ClerkProvider } from "@clerk/react-router";
import { clerkMiddleware, rootAuthLoader } from "@clerk/react-router/server";
import { shadcn } from "@clerk/themes";
import { isOnboardingPath, resolveOnboardingRedirect } from "@/service/auth/onboarding-guard";
import NotFound from "./components/error/not-found";
import { Spinner } from "./components/ui/spinner";
import Providers from "./providers";

const clerkLocalization = {
	signIn: {
		start: {
			title: "Welcome back",
			titleCombined: "Welcome back",
			subtitle: "Log in to your {{applicationName}}",
			subtitleCombined: "Log in to your {{applicationName}}",
		},
	},
};

const AUTH_UI_ROUTE_PATTERN = /(^|\/)(sign-in|sign-up|onboarding)(\/|$)/;
const PRETENDARD_STYLESHEET =
	"https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

const isAuthUiRoute = (pathname: string) => AUTH_UI_ROUTE_PATTERN.test(pathname);

export const links: Route.LinksFunction = () => [
	{
		rel: "preload",
		as: "style",
		href: PRETENDARD_STYLESHEET,
	},
	{
		rel: "stylesheet",
		href: PRETENDARD_STYLESHEET,
	},
];

export const middleware: Route.MiddlewareFunction[] = [clerkMiddleware()];

export const loader = (args: Route.LoaderArgs) =>
	rootAuthLoader(args, async (loaderArgs) => {
		const { pathname } = new URL(loaderArgs.request.url);
		const redirectResponse = await resolveOnboardingRedirect({
			...loaderArgs,
			pathname,
		});

		if (redirectResponse) {
			throw redirectResponse;
		}

		return null;
	});

export function shouldRevalidate({ actionResult, currentUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
	if (!isOnboardingPath(currentUrl.pathname)) {
		return defaultShouldRevalidate;
	}

	if (actionResult && typeof actionResult === "object" && "success" in actionResult) {
		return actionResult.success !== true;
	}

	return defaultShouldRevalidate;
}

export function Layout({ children }: { children: React.ReactNode }) {
	const navigation = useNavigation();
	const isNavigating = Boolean(navigation.location);
	const umamiWebsiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
	const umamiScriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL ?? "https://cloud.umami.is/script.js";

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{umamiWebsiteId ? <script defer src={umamiScriptUrl} data-website-id={umamiWebsiteId} data-auto-track="false" /> : null}
				<Meta />
				<Links />
			</head>
			<body className="relative">
				{isNavigating && <Spinner className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2" />}
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App({ loaderData }: Route.ComponentProps) {
	const location = useLocation();
	const useClerkUi = isAuthUiRoute(location.pathname);

	return (
		<ClerkProvider
			loaderData={loaderData}
			clerkJSVariant={useClerkUi ? "" : "headless"}
			localization={clerkLocalization}
			appearance={{
				theme: shadcn,
				variables: {
					colorBackground: "#ffffff",
					colorForeground: "#111827",
					colorMutedForeground: "#6b7280",
					colorPrimary: "#7b8bff",
					colorPrimaryForeground: "#ffffff",
					colorInputBackground: "#f5f5f5",
					colorInputForeground: "#111827",
					colorNeutral: "#d6d7dc",
				},
				elements: {
					rootBox: "w-full min-w-sm max-w-md",
					cardBox: "w-full px-6 !bg-transparent !shadow-none !border-0",
					card: "!bg-transparent !shadow-none !border-0 p-0 gap-6",
					headerTitle: "text-3xl font-bold text-foreground tracking-tight mb-2",
					headerSubtitle: "text-base text-primary mb-6",
					form: "gap-8",
					formFieldRow: "gap-2",
					formFieldLabel: "sr-only",
					formFieldInput:
						"py-6 !h-12 !rounded-xl !bg-muted px-5 text-base text-neutral-700 placeholder:text-neutral-500 focus:border-brand focus:ring-2 focus:ring-brand/40",
					formButtonPrimary:
						"font-semibold !h-12 !rounded-xl !bg-brand !shadow-none text-white text-base font-medium transition-colors hover:!bg-brand focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
					formButtonReset: "!shadow-none",
					buttonArrowIcon: "hidden",
					dividerRow: "gap-4",
					dividerLine: "hidden",
					dividerText: "text-base tracking-wide text-primary font-medium uppercase text-neutral-500",
					socialButtonsRoot: "gap-4",
					socialButtons: "gap-4",
					socialButtonsBlockButton:
						"!h-12 !rounded-xl !bg-background hover:!bg-muted/50 !border !border-input !shadow-none text-primary transition-colors dark:!bg-muted dark:hover:!bg-muted/50 dark:!border-muted",
					socialButtonsBlockButtonText: "text-base font-medium",
					socialButtonsIconButton: "!shadow-none",
					socialButtonsProviderIcon: "size-5",
					alternativeMethodsBlockButton: "!shadow-none",
					footer: "flex flex-col items-center gap-3 !bg-transparent !shadow-none mt-4",
					footerPages: "order-2 flex items-center gap-4 !bg-transparent !shadow-none",
					footerPagesLink: "text-primary",
					footerAction: "order-1 justify-center !bg-transparent !shadow-none",
					footerActionText: "text-sm",
					footerActionLink: "text-sm font-medium underline-offset-4 hover:underline",
				},
				layout: {
					privacyPageUrl: "https://clerk.com/privacy",
					termsPageUrl: "https://clerk.com/legal/privacy",
					unsafe_disableDevelopmentModeWarnings: true,
					socialButtonsPlacement: "bottom",
					socialButtonsVariant: "blockButton",
				},
			}}
		>
			<main className="h-dvh">
				<Providers>
					<main className="h-full">
						<Outlet />
					</main>
				</Providers>
			</main>
		</ClerkProvider>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;
	let is404: boolean | undefined;

	if (isRouteErrorResponse(error)) {
		is404 = error.status === 404;
		message = error.status === 404 ? "404" : "Error";
		details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="container mx-auto h-dvh p-4 pt-16">
			{is404 ? (
				<NotFound />
			) : (
				<>
					<h1>{message}</h1>
					<p>{details}</p>
					{stack && (
						<pre className="w-full overflow-x-auto p-4">
							<code>{stack}</code>
						</pre>
					)}
				</>
			)}
		</main>
	);
}

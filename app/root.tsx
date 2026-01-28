import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigation } from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import NotFound from "./components/error/not-found";
import { Spinner } from "./components/ui/spinner";
import Providers from "./providers";
import { resolveOnboardingRedirect } from "./service/auth/onboarding-guard.server";

const PRETENDARD_STYLESHEET =
	"https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

export async function loader({ context, request }: Route.LoaderArgs) {
	const pathname = new URL(request.url).pathname;

	const redirectResponse = await resolveOnboardingRedirect({
		context,
		request,
		pathname,
	});

	if (redirectResponse) {
		throw redirectResponse;
	}

	return null;
}

export const links = () => [
	// CDN preconnect로 연결 시간 단축 (TTFB 개선)
	{
		rel: "preconnect",
		href: "https://cdn.jsdelivr.net",
		crossOrigin: "anonymous",
	},
	{
		rel: "preconnect",
		href: "https://supabase.co",
		crossOrigin: "anonymous",
	},
	// Pretendard 폰트 CSS
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

export default function App() {
	return (
		<main className="h-dvh">
			<Providers>
				<main className="h-full">
					<Outlet />
				</main>
			</Providers>
		</main>
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

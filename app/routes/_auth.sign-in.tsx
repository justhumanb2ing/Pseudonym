import { generateMeta } from "@forge42/seo-tools/remix/metadata";
import { breadcrumbs } from "@forge42/seo-tools/structured-data/breadcrumb";
import { XIcon } from "@phosphor-icons/react";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import type { ChangeEvent, FormEvent } from "react";
import { useRef, useState } from "react";
import type { MetaFunction } from "react-router";
import { Link, useFetcher, useNavigate } from "react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { metadataConfig } from "@/config/metadata";
import { useUmamiPageView } from "@/hooks/use-umami-page-view";
import { authClient } from "@/lib/auth.client";
import { getUmamiEventAttributes } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS, type UmamiEventName } from "@/lib/umami-events";

const buildAbsoluteUrl = (pathname: string) => new URL(pathname, metadataConfig.url).toString();

const defaultImageUrl = new URL(metadataConfig.defaultImage, metadataConfig.url).toString();

export const buildSignInUrl = () => buildAbsoluteUrl("/sign-in");

export const getSignInCallbackPath = () => "/sign-in";

type AuthMode = "sign-in" | "sign-up";

type SignUpValues = {
	name: string;
	email: string;
	password: string;
};

type SignUpFieldErrors = Partial<Record<keyof SignUpValues, string>>;

const passwordSchema = z
	.string()
	.min(8, "Password must be 8-13 characters and contain only letters and numbers.")
	.max(13, "Password must be 8-13 characters and contain only letters and numbers.")
	.regex(/^[A-Za-z0-9]+$/, "Password must be 8-13 characters and contain only letters and numbers.");

const signUpSchema = z.object({
	name: z.string().trim().min(1, "Please enter your name."),
	email: z.email("Please enter a valid email."),
	password: passwordSchema,
});

const toErrorItems = (message: string | undefined) => message;

const resolveAuthErrorMessage = (error: unknown, fallback: string) => {
	if (error && typeof error === "object") {
		if ("message" in error && typeof error.message === "string") {
			return error.message;
		}
		if ("error" in error) {
			const nestedError = error.error;
			if (nestedError && typeof nestedError === "object" && "message" in nestedError && typeof nestedError.message === "string") {
				return nestedError.message;
			}
		}
	}
	return fallback;
};

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
	const [mode, setMode] = useState<AuthMode>("sign-in");
	const isSignUpMode = mode === "sign-up";

	useUmamiPageView({
		eventName: UMAMI_EVENTS.page.signInView,
		props: {
			[UMAMI_PROP_KEYS.ctx.pageKind]: "sign_in",
		},
	});

	return (
		<main className="relative flex h-full grow flex-col justify-center">
			<header className="fixed top-3 left-3">
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
				<div className="flex w-full justify-center lg:flex-5">
					<div className="flex w-full max-w-sm flex-col gap-6 px-6">
						<div className="space-y-2 text-center">
							<h1 className="font-semibold text-3xl">{isSignUpMode ? "Create your account" : "Sign in to Venus"}</h1>
							<p className="text-muted-foreground text-sm">{isSignUpMode ? "Start creating your page in minutes." : ""}</p>
						</div>
						{isSignUpMode ? (
							<SignUpForm onSwitchToSignIn={() => setMode("sign-in")} />
						) : (
							<SignInForm onSwitchToSignUp={() => setMode("sign-up")} />
						)}
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

type SignInFormProps = {
	onSwitchToSignUp: () => void;
};

function SignInForm({ onSwitchToSignUp }: SignInFormProps) {
	const navigate = useNavigate();
	const fetcher = useFetcher();
	const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
	const [isEmailSigningIn, setIsEmailSigningIn] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
	const emailRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const isSubmitting = isGoogleSigningIn || isEmailSigningIn;

	const handleEmailSignIn = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isSubmitting) return;
		setSubmitError(null);

		const email = emailRef.current?.value?.trim() ?? "";
		const password = passwordRef.current?.value ?? "";

		if (!email || !password) {
			setSubmitError("Please enter your email and password.");
			return;
		}

		await authClient.signIn.email(
			{ email, password },
			{
				onRequest: () => {
					setIsEmailSigningIn(true);
					setSubmitError(null);
				},
				onSuccess: () => {
					setIsEmailSigningIn(false);
					navigate("/", { replace: true });
				},
				onError: (ctx) => {
					setIsEmailSigningIn(false);
					setSubmitError(resolveAuthErrorMessage(ctx.error, "Could not sign in with email. Please check your credentials and try again."));
				},
			},
		);
	};

	const handleGoogleSignIn = async () => {
		await authClient.signIn.social(
			{
				provider: "google",
				// callbackURL,
				newUserCallbackURL: "/onboarding",
			},
			{
				onRequest: () => {
					setIsGoogleSigningIn(true);
					setSubmitError(null);
				},
				onSuccess: () => {
					setIsGoogleSigningIn(false);
				},
				onError: (ctx) => {
					setIsGoogleSigningIn(false);
					setSubmitError(resolveAuthErrorMessage(ctx.error, "Could not start Google sign-in. Please try again."));
				},
			},
		);
	};

	const handleClearSubmitError = () => {
		setSubmitError(null);
	};

	return (
		<>
			<fetcher.Form className="flex flex-col gap-6" onSubmit={handleEmailSignIn} noValidate>
				<FieldGroup>
					<FieldSet className="gap-4">
						<Field>
							<FieldLabel htmlFor="email" className="sr-only">
								Email
							</FieldLabel>
							<FieldContent>
								<Input
									id="email"
									name="email"
									type="email"
									autoComplete="off"
									ref={emailRef}
									onChange={handleClearSubmitError}
									placeholder="Email"
									disabled={isSubmitting}
									className="rounded-lg border-none py-6 focus-visible:ring-0"
								/>
							</FieldContent>
						</Field>
						<Field>
							<FieldLabel htmlFor="password" className="sr-only">
								Password
							</FieldLabel>
							<FieldContent>
								<div className="relative">
									<Input
										id="password"
										name="password"
										type={isPasswordVisible ? "text" : "password"}
										autoComplete="off"
										ref={passwordRef}
										onChange={handleClearSubmitError}
										placeholder="Password"
										disabled={isSubmitting}
										className="rounded-lg border-none py-6 pe-9 focus-visible:ring-0"
									/>
									<Button
										size={"sm"}
										variant={"outline"}
										aria-controls="password"
										aria-label={isPasswordVisible ? "Hide password" : "Show password"}
										aria-pressed={isPasswordVisible}
										className="absolute end-3 top-1/2 flex h-fit -translate-y-1/2 items-center justify-center rounded-sm border-none bg-white px-3 py-1 font-bold hover:bg-white focus:z-10 focus-visible:ring-0"
										onClick={() => setIsPasswordVisible((prev) => !prev)}
										type="button"
									>
										{isPasswordVisible ? <span>Hide</span> : <span>Show</span>}
									</Button>
								</div>
							</FieldContent>
						</Field>
					</FieldSet>
				</FieldGroup>
				{submitError ? <FieldError className="text-left" errors={[{ message: submitError }]} /> : null}
				<div className="flex flex-col gap-2 pt-1">
					<Button
						type="submit"
						variant="brand"
						size="lg"
						className="w-full"
						disabled={isSubmitting}
						aria-busy={isEmailSigningIn}
						{...getUmamiEventAttributes(UMAMI_EVENTS.auth.signIn.start, {
							[UMAMI_PROP_KEYS.ctx.source]: "sign_in_page",
							[UMAMI_PROP_KEYS.ctx.action]: "email",
						})}
					>
						{isEmailSigningIn ? "Signing in..." : "Sign in with email"}
					</Button>
				</div>
			</fetcher.Form>
			<div className="text-center text-sm">
				<span className="text-muted-foreground">Don't have account? </span>
				<Button type="button" variant="link" className="h-auto p-0 text-sm" onClick={onSwitchToSignUp}>
					Sign Up
				</Button>
			</div>
			<div className="relative flex items-center gap-3">
				<Separator className="flex-1" />
				<span className="text-muted-foreground text-xs uppercase tracking-wide">or</span>
				<Separator className="flex-1" />
			</div>
			<GoogleSignInButton
				onClick={handleGoogleSignIn}
				isLoading={isGoogleSigningIn}
				disabled={isSubmitting}
				eventName={UMAMI_EVENTS.auth.signIn.start}
			/>
		</>
	);
}

type SignUpFormProps = {
	onSwitchToSignIn: () => void;
};

function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
	const navigate = useNavigate();
	const fetcher = useFetcher();
	const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
	const [isEmailSigningUp, setIsEmailSigningUp] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
	const [values, setValues] = useState<SignUpValues>({
		name: "",
		email: "",
		password: "",
	});
	const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
	const isSubmitting = isGoogleSigningIn || isEmailSigningUp;

	const resetFieldError = (field: keyof SignUpFieldErrors) => {
		setFieldErrors((prev) => (prev[field]?.length ? { ...prev, [field]: undefined } : prev));
	};

	const handleSignUpChange = (field: keyof SignUpValues) => (event: ChangeEvent<HTMLInputElement>) => {
		setValues((prev) => ({
			...prev,
			[field]: event.target.value,
		}));
		resetFieldError(field);
		setSubmitError(null);
	};

	const handleEmailSignUp = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isSubmitting) return;
		setSubmitError(null);

		const result = signUpSchema.safeParse(values);

		if (!result.success) {
			const tree = z.treeifyError(result.error);
			setFieldErrors({
				name: tree.properties?.name?.errors[0] ?? undefined,
				email: tree.properties?.email?.errors[0] ?? undefined,
				password: tree.properties?.password?.errors[0] ?? undefined,
			});
			return;
		}

		setFieldErrors({});

		await authClient.signUp.email(result.data, {
			onRequest: () => {
				setIsEmailSigningUp(true);
				setSubmitError(null);
			},
			onSuccess: () => {
				setIsEmailSigningUp(false);
				navigate("/onboarding", { replace: true });
			},
			onError: (ctx) => {
				setIsEmailSigningUp(false);
				setSubmitError(resolveAuthErrorMessage(ctx.error, "Could not create your account. Please try again."));
			},
		});
	};

	const handleGoogleSignIn = async () => {
		await authClient.signIn.social(
			{
				provider: "google",
				// callbackURL,
				newUserCallbackURL: "/onboarding",
			},
			{
				onRequest: () => {
					setIsGoogleSigningIn(true);
					setSubmitError(null);
				},
				onSuccess: () => {
					setIsGoogleSigningIn(false);
				},
				onError: (ctx) => {
					setIsGoogleSigningIn(false);
					setSubmitError(resolveAuthErrorMessage(ctx.error, "Could not start Google sign-in. Please try again."));
				},
			},
		);
	};

	return (
		<>
			<fetcher.Form className="flex flex-col gap-6" onSubmit={handleEmailSignUp} noValidate>
				<FieldGroup>
					<FieldSet className="gap-4">
						<Field>
							<FieldLabel htmlFor="name" className="sr-only">
								Name
							</FieldLabel>
							<FieldContent>
								<Input
									id="name"
									name="name"
									type="text"
									autoComplete="off"
									value={values.name}
									onChange={handleSignUpChange("name")}
									placeholder="Name"
									disabled={isSubmitting}
									aria-invalid={!!fieldErrors.name?.length}
									aria-describedby={fieldErrors.name?.length ? "name-error" : undefined}
									className="rounded-lg border-none py-6 focus-visible:ring-0"
								/>
								<FieldError id="name-error">{toErrorItems(fieldErrors.name)}</FieldError>
							</FieldContent>
						</Field>
						<Field>
							<FieldLabel htmlFor="email" className="sr-only">
								Email
							</FieldLabel>
							<FieldContent>
								<Input
									id="email"
									name="email"
									type="email"
									autoComplete="off"
									value={values.email}
									onChange={handleSignUpChange("email")}
									placeholder="Email"
									disabled={isSubmitting}
									aria-invalid={!!fieldErrors.email?.length}
									aria-describedby={fieldErrors.email?.length ? "email-error" : undefined}
									className="rounded-lg border-none py-6 focus-visible:ring-0"
								/>
								<FieldError id="email-error">{toErrorItems(fieldErrors.email)}</FieldError>
							</FieldContent>
						</Field>
						<Field>
							<FieldLabel htmlFor="password" className="sr-only">
								Password
							</FieldLabel>
							<FieldContent>
								<div className="relative">
									<Input
										id="password"
										name="password"
										type={isPasswordVisible ? "text" : "password"}
										autoComplete="off"
										value={values.password}
										onChange={handleSignUpChange("password")}
										placeholder="Password"
										disabled={isSubmitting}
										aria-invalid={!!fieldErrors.password?.length}
										aria-describedby={fieldErrors.password?.length ? "password-error" : undefined}
										className="rounded-lg border-none py-6 pe-9 focus-visible:ring-0"
									/>
									<Button
										size={"sm"}
										variant={"outline"}
										aria-controls="password"
										aria-label={isPasswordVisible ? "Hide password" : "Show password"}
										aria-pressed={isPasswordVisible}
										className="absolute end-3 top-1/2 flex h-fit -translate-y-1/2 items-center justify-center rounded-sm border-none bg-white px-3 py-1 font-bold hover:bg-white focus:z-10 focus-visible:ring-0"
										onClick={() => setIsPasswordVisible((prev) => !prev)}
										type="button"
									>
										{isPasswordVisible ? <span>Hide</span> : <span>Show</span>}
									</Button>
								</div>
								<FieldError id="password-error">{toErrorItems(fieldErrors.password)}</FieldError>
							</FieldContent>
						</Field>
					</FieldSet>
				</FieldGroup>
				{submitError ? <FieldError className="text-left" errors={[{ message: submitError }]} /> : null}
				<div className="flex flex-col gap-2 pt-1">
					<Button
						type="submit"
						variant="brand"
						size="lg"
						className="w-full"
						disabled={isSubmitting}
						aria-busy={isEmailSigningUp}
						{...getUmamiEventAttributes(UMAMI_EVENTS.auth.signup.start, {
							[UMAMI_PROP_KEYS.ctx.source]: "sign_in_page",
							[UMAMI_PROP_KEYS.ctx.action]: "email",
						})}
					>
						{isEmailSigningUp ? "Creating account..." : "Create account"}
					</Button>
				</div>
			</fetcher.Form>
			<div className="text-center text-sm">
				<span className="text-muted-foreground">Already have account? </span>
				<Button type="button" variant="link" className="h-auto p-0 text-sm" onClick={onSwitchToSignIn}>
					Sign In
				</Button>
			</div>
			<div className="relative flex items-center gap-3">
				<Separator className="flex-1" />
				<span className="text-muted-foreground text-xs uppercase tracking-wide">or</span>
				<Separator className="flex-1" />
			</div>
			<GoogleSignInButton
				onClick={handleGoogleSignIn}
				isLoading={isGoogleSigningIn}
				disabled={isSubmitting}
				eventName={UMAMI_EVENTS.auth.signIn.start}
			/>
		</>
	);
}

type GoogleSignInButtonProps = {
	onClick: () => void;
	isLoading: boolean;
	disabled: boolean;
	eventName: string;
};

function GoogleSignInButton({ onClick, isLoading, disabled, eventName }: GoogleSignInButtonProps) {
	return (
		<Button
			type="button"
			variant="default"
			size="lg"
			onClick={onClick}
			data-icon="inline-start"
			className="flex w-full items-center gap-1 bg-blue-500 hover:bg-blue-600"
			disabled={disabled}
			aria-busy={isLoading}
			{...getUmamiEventAttributes(eventName as UmamiEventName, {
				[UMAMI_PROP_KEYS.ctx.source]: "sign_in_page",
				[UMAMI_PROP_KEYS.ctx.action]: "google",
			})}
		>
			<IconBrandGoogleFilled className="size-5" />
			<span>{isLoading ? "Connecting..." : "Continue with Google"}</span>
		</Button>
	);
}

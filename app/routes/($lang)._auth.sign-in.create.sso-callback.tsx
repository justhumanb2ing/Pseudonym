import { AuthenticateWithRedirectCallback } from "@clerk/react-router";
import { useParams } from "react-router";

export default function SignInSsoCallbackRoute() {
	const { lang } = useParams();
	const signInUrl = lang ? `/${lang}/sign-in` : "/sign-in";
	const signUpUrl = lang ? `/${lang}/sign-up` : "/sign-up";

	return <AuthenticateWithRedirectCallback signInUrl={signInUrl} signUpUrl={signUpUrl} continueSignUpUrl={signUpUrl} transferable />;
}

import { type Dictionary, t } from "intlayer";

const userAuthButtonContent = {
	key: "userAuthButton",
	content: {
		signInLabel: t({
			en: "Sign in",
			ko: "로그인",
		}),
		signOutLabel: t({
			en: "Sign out",
			ko: "로그아웃",
		}),
	},
} satisfies Dictionary;

export default userAuthButtonContent;

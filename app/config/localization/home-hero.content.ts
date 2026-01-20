import { type Dictionary, t } from "intlayer";

const homeHeroContent = {
	key: "home-hero",
	content: {
		brandName: t({
			en: "beyondthewave",
			ko: "beyondthewave",
		}),
		headline1: t({
			en: "A Link in Bio.",
			ko: "하나의 링크,",
		}),
		headline2: t({
			en: "But Rich and Beautiful.",
			ko: "무한한 가능성.",
		}),
		description: t({
			en: "A personal page shaped by what you choose to share.",
			ko: "당신의 모든 것을 보여주는 개인 페이지. 링크, 콘텐츠, 소셜 프로필을 하나의 아름다운 공간에서 관리하세요.",
		}),
		ctaPrimary: t({
			en: "Start for free",
			ko: "시작하기",
		}),
		ctaSecondary: t({
			en: "Log in",
			ko: "로그인",
		}),
		demoName: t({
			en: "John Doe",
			ko: "홍길동",
		}),
		demoRole: t({
			en: "Creator • Designer • Developer",
			ko: "크리에이터 • 디자이너 • 개발자",
		}),
	},
} satisfies Dictionary;

export default homeHeroContent;

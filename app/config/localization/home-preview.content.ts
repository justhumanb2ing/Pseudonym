import { type Dictionary, t } from "intlayer";

const homePreviewContent = {
	key: "home-preview",
	content: {
		gradientText1: t({
			en: "Your Videos.",
			ko: "영상.",
		}),
		gradientText2: t({
			en: "Podcasts.",
			ko: "팟캐스트.",
		}),
		gradientText3: t({
			en: "Newsletters.",
			ko: "뉴스레터.",
		}),
		gradientText4: t({
			en: "Photos.",
			ko: "사진.",
		}),
		gradientText5: t({
			en: "Paid Products. Streams. Calendars.",
			ko: "유료 콘텐츠. 스트리밍. 캘린더.",
		}),
		previewDescription: t({
			en: "All your content integrated into your personal page. No more hiding your content behind links.",
			ko: "모든 콘텐츠를 개인 페이지에 통합하세요. 더 이상 링크 뒤에 콘텐츠를 숨기지 마세요.",
		}),
		exploreLink: t({
			en: "Explore the most creative pages",
			ko: "가장 창의적인 페이지 둘러보기",
		}),
		integrationsLabel: t({
			en: "And many more integrations",
			ko: "더 많은 연동 지원",
		}),
	},
} satisfies Dictionary;

export default homePreviewContent;

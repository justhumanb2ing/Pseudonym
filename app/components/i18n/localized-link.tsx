import { getLocalizedUrl, type LocalesValues } from "intlayer";
import type { FC } from "react";
import { useLocale } from "react-intlayer";
import { Link, type LinkProps, type To } from "react-router";

const isExternalLink = (to: string) => /^(https?:)?\/\//.test(to);

// 외부 링크인지 확인하는 함수
export const locacalizeTo = (to: To, locale: LocalesValues): To => {
	if (typeof to === "string") {
		if (isExternalLink(to)) {
			return to; // 외부 링크면 그대로 반환
		}

		return getLocalizedUrl(to, locale); // 내부 링크면 로케일에 맞게 변환
	}

	if (isExternalLink(to.pathname ?? "")) {
		return to; // 외부 링크면 그대로 반환
	}

	return {
		...to,
		pathname: getLocalizedUrl(to.pathname ?? "", locale), // 내부 경로를 로케일에 맞게 변환
	};
};

export const LocalizedLink: FC<LinkProps> = (props) => {
	const { locale } = useLocale();

	return <Link {...props} to={locacalizeTo(props.to, locale)} />;
};

import { getHTMLTextDir } from "intlayer";
import { useEffect } from "react";
import { useLocale } from "react-intlayer";

export const useI18nHTMLAttributes = () => {
	const { locale } = useLocale();

	useEffect(() => {
		document.documentElement.lang = locale;
		document.documentElement.dir = getHTMLTextDir(locale);
	}, [locale]);
};

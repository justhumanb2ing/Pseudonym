import { t, type Dictionary } from "intlayer";

const localeContent = {
  key: "locale",
  content: {
    localeLabel: t({
      en: "Language",
      ko: "언어",
    }),
  },
} satisfies Dictionary;

export default localeContent;

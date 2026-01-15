import { t, type Dictionary } from "intlayer";

const bottomActionBarContent = {
  key: "bottomActionBar",
  content: {
    analyticsComingSoon: t({
      en: "Analytics (Comming Soon!)",
      ko: "분석(준비 중!)",
    }),
    settingsLabel: t({
      en: "Setting",
      ko: "설정",
    }),
  },
} satisfies Dictionary;

export default bottomActionBarContent;

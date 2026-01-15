import { t, type Dictionary } from "intlayer";

const layoutToggleContent = {
  key: "layoutToggle",
  content: {
    desktopTooltip: t({
      en: "Desktop layout",
      ko: "데스크톱 레이아웃",
    }),
    mobileTooltip: t({
      en: "Mobile layout",
      ko: "모바일 레이아웃",
    }),
  },
} satisfies Dictionary;

export default layoutToggleContent;

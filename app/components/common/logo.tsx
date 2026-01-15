import { LocalizedLink } from "../i18n/localized-link";

export default function Logo() {
  return (
    <div>
      <LocalizedLink
        to={"/"}
        className="font-medium tracking-tighter text-xl sm:text-3xl"
      >
        beyondthewave
      </LocalizedLink>
    </div>
  );
}

import { LocalizedLink } from "../i18n/localized-link";

export default function Logo() {
  return (
    <div className="size-14">
      <LocalizedLink
        to={"/"}
        className="font-medium tracking-tighter text-xl sm:text-3xl"
      >
        <img
          src="/logo.png"
          alt="logo"
          className="w-full h-full object-cover"
        />
      </LocalizedLink>
    </div>
  );
}

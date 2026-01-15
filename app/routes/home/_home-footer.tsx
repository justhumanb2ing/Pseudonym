import { LocalizedLink } from "@/components/legacy/i18n/localized-link";

export default function HomeFooter() {
  return (
    <footer className="h-[400px] my-20 pb-32 text-muted-foreground flex flex-col justify-center items-center gap-20">
      <div className="space-y-4">
        <div className="flex justify-center font-medium text-3xl tracking-tighter">
          beyondthewave
        </div>
        <div className="text-sm text-center">Designed by Justhumanbeing</div>
      </div>
      <div>
        <ul className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <li className="hover:underline underline-offset-2">
            <LocalizedLink to={"/sign-in"}>Sign In</LocalizedLink>
          </li>
          <li className="hover:underline underline-offset-2">
            <LocalizedLink to={"/changelog"}>Changelog</LocalizedLink>
          </li>
          <li className="hover:underline underline-offset-2">
            <LocalizedLink to={"/feedback"}>Feedback</LocalizedLink>
          </li>
        </ul>
      </div>
      <div>
        <a
          href="https://www.buymeacoffee.com/justhumanb2ing"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=justhumanb2ing&button_colour=FFDD00&font_colour=000000&font_family=Comic&outline_colour=000000&coffee_colour=ffffff" />
        </a>
      </div>
    </footer>
  );
}

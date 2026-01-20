import { useOutletContext, useParams } from "react-router";
import type { StudioOutletContext } from "types/studio.types";
import ProfilePreviewFrame from "@/components/studio/profile-preview-frame";

export default function StudioDesignRoute() {
	const { handle } = useOutletContext<StudioOutletContext>();
	const { lang } = useParams();

	return (
		<section className="flex grow flex-col gap-6 p-2 px-4 pb-6">
			<header className="flex items-center py-4 font-extrabold text-3xl md:text-5xl">
				<h1>Design</h1>
			</header>
			<article className="flex grow flex-row gap-6">
				<div className="flex basis-full flex-col gap-4 xl:basis-3/5">
					<aside className="flex h-fit items-center rounded-2xl p-5 shadow-float">Profile?</aside>
					<main className="basis-7/8 rounded-2xl p-3 shadow-float">Editor</main>
				</div>
				<aside className="hidden h-full basis-2/5 rounded-2xl p-3 shadow-float xl:flex xl:flex-col">
					<h2 className="mb-4 font-semibold text-xl">Preview</h2>
					<div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/40 bg-background">
						<ProfilePreviewFrame handle={handle} lang={lang} className="h-full w-full" />
					</div>
				</aside>
			</article>
		</section>
	);
}

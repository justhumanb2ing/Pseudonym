export default function StudioDesignRoute() {
	return (
		<section className="flex grow flex-col gap-6 p-2 px-4 pb-6">
			<header className="flex items-center py-4 font-extrabold text-3xl md:text-5xl">
				<h1>Design</h1>
			</header>
			<article className="flex grow flex-row gap-6">
				<div className="flex basis-full flex-col gap-4 xl:basis-3/5">
					<aside className="flex h-fit items-center rounded-2xl bg-surface p-5 shadow-float">Profile?</aside>
					<main className="basis-7/8 rounded-2xl bg-surface p-3 shadow-float">Editor</main>
				</div>
				<aside className="hidden h-full basis-2/5 rounded-2xl bg-surface p-3 shadow-float xl:block">Preview</aside>
			</article>
		</section>
	);
}

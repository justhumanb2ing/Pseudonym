export default function StudioDesignRoute() {
  return (
    <section className="flex flex-col gap-6 p-2 grow pb-6 px-4">
      <header className="font-extrabold text-3xl md:text-5xl py-4 flex items-center">
        <h1>Design</h1>
      </header>
      <article className="flex flex-row gap-6 grow">
        <div className="basis-full flex flex-col gap-4 xl:basis-3/5">
          <aside className="bg-surface rounded-2xl p-5 h-fit flex items-center shadow-float">
            Profile?
          </aside>
          <main className="bg-surface rounded-2xl p-3 basis-7/8 shadow-float">
            Editor
          </main>
        </div>
        <aside className="hidden xl:block basis-2/5 bg-surface rounded-2xl p-3 h-full shadow-float">
          Preview
        </aside>
      </article>
    </section>
  );
}

export default function StudioLinksRoute() {
  return (
    <section className="flex flex-row gap-6 p-2 grow pb-6 px-4">
      <main className="basis-full bg-surface rounded-2xl p-3 h-full xl:basis-3/5">
        Links Editor
      </main>
      <aside className="hidden xl:block basis-2/5 bg-surface rounded-2xl p-3 h-full">
        Preview
      </aside>
    </section>
  );
}

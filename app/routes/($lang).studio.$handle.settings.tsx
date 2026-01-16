export default function StudioSettingsRoute() {
  return (
    <section className="flex flex-col gap-6 p-2 grow pb-6 px-4">
      <header className="font-extrabold text-3xl md:text-5xl py-4 flex items-center">
        <h1>Settings</h1>
      </header>
      <main className="bg-surface rounded-2xl p-6 h-full">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p>Settings and preferences will be displayed here.</p>
      </main>
    </section>
  );
}

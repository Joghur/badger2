import AppMenu from "@/components/AppMenu";

const Page = () => (
  <>
    <AppMenu />
    <main className="mx-auto mt-6 max-w-5xl px-4">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold">Velkommen</h1>
        <p className="text-sm text-muted-foreground">
          Brug menuerne eller genveje: ⌘/Ctrl+N, ⌘/Ctrl+O, ⌘/Ctrl+S, ⌘/Ctrl+Q,
          F1.
        </p>
      </section>
    </main>
  </>
);

export default Page;

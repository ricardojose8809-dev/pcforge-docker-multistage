export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="h-10 w-72 rounded bg-slate-800" />
        <div className="mt-4 h-5 w-96 max-w-full rounded bg-slate-800" />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-72 rounded-xl bg-slate-800"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
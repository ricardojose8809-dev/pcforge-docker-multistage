export default function ProductDetailLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-slate-950 px-6 py-12">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
        <div className="aspect-square rounded-2xl bg-slate-800" />

        <div className="space-y-6">
          <div className="h-8 w-24 rounded bg-slate-800" />
          <div className="h-12 w-3/4 rounded bg-slate-800" />
          <div className="h-24 rounded bg-slate-800" />
          <div className="h-12 w-48 rounded bg-slate-800" />
        </div>
      </div>
    </main>
  );
}
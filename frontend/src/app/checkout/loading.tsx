export default function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-10 w-64 rounded bg-slate-800" />

        <div className="mt-4 h-5 w-96 max-w-full rounded bg-slate-800" />

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="h-40 rounded-2xl bg-slate-900" />
            <div className="h-40 rounded-2xl bg-slate-900" />
          </div>

          <div className="h-80 rounded-2xl bg-slate-900" />
        </div>
      </div>
    </main>
  );
}
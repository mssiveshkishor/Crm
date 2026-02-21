"use client";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">404</p>
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="max-w-md text-center text-sm text-slate-400">
        We couldn’t locate that page. Try returning home and opening another section of the CRM.
      </p>
    </main>
  );
}

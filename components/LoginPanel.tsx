"use client";

import { FormEvent, useState } from "react";

export type LoginPanelProps = {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error?: string | null;
};

export function LoginPanel({ onSubmit, loading, error }: LoginPanelProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(email.trim(), password);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-slate-900/50">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Yadhurtech CRM</p>
        <h1 className="mt-3 text-3xl font-semibold">Welcome back</h1>
        <p className="text-sm text-slate-400">Sign in with your super admin credentials to continue.</p>
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            className="rounded-2xl border border-white/20 bg-slate-900/40 px-4 py-3 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="rounded-2xl border border-white/20 bg-slate-900/40 px-4 py-3 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            type="submit"
            className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {error && <p className="mt-4 text-xs text-rose-400">{error}</p>}
        <p className="mt-6 text-[13px] text-slate-500">
          Use the credentials you shared with me for the superadmin account. Need help? Ping me the email/password pair.
        </p>
      </div>
    </main>
  );
}

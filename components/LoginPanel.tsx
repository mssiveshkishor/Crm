"use client";

import { FormEvent, useState } from "react";
import { Lock, Mail, ChevronRight, ShieldCheck } from "lucide-react";
import clsx from "clsx";

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
    <main className="relative flex min-h-screen items-center justify-center p-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-[480px] animate-in">
        <div className="glass-panel relative overflow-hidden rounded-[40px] p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] border-white/5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-50"></div>

          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative mb-6">
              <div className="absolute -inset-1 rounded-[24px] bg-gradient-to-tr from-primary to-secondary opacity-30 blur-sm"></div>
              <img
                src="/logo.jpeg"
                alt="Yadhurtech logo"
                className="relative h-20 w-20 rounded-[24px] object-cover border border-white/10"
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.6em] text-primary font-black mb-2">Secure Gateway</p>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
              Yadhurtech <span className="text-gradient">CRM</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium max-w-[280px]">
              Authenticate to access the high-performance command center.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={18} />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-primary/50 focus:bg-white/10 focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                  placeholder="System Identification (Email)"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={18} />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-primary/50 focus:bg-white/10 focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                  placeholder="Access Protocol (Password)"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-tr from-primary to-secondary px-6 py-4 text-sm font-black text-white shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              disabled={loading}
            >
              <div className="relative flex items-center justify-center gap-2 z-10">
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Initialize Session</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 animate-in">
              <div className="shrink-0 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"></div>
              <p className="text-[12px] font-bold text-rose-400 leading-tight">{error}</p>
            </div>
          )}

          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
              <ShieldCheck size={14} className="text-accent" />
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Tier 3 Security Active</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center animate-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-[11px] text-slate-500 font-medium">
            Forgotten credentials? Contact the <span className="text-accent font-bold">Network Administrator</span>
          </p>
        </div>
      </div>
    </main>
  );
}

"use client";

import { Session } from "@supabase/supabase-js";
import clsx from "clsx";

type SidebarProps = {
  activeView: "dashboard" | "settings";
  onChangeView: (view: "dashboard" | "settings") => void;
  session: Session;
  onSignOut: () => void;
};

export function Sidebar({ activeView, onChangeView, session, onSignOut }: SidebarProps) {
  const nav = [
    { id: "dashboard", label: "Dashboard" },
    { id: "settings", label: "Settings" },
  ] as const;

  return (
    <aside className="hidden w-56 flex-col gap-6 border-r border-white/5 bg-slate-950 p-6 text-sm text-slate-300 lg:flex">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Yadhurtech CRM</p>
        <p className="text-lg font-semibold text-white">{session.user.email}</p>
        <p className="text-[13px] text-slate-500">Superadmin</p>
      </div>
      <nav className="flex flex-col gap-2">
        {nav.map((item) => (
          <button
            key={item.id}
            className={clsx(
              "w-full rounded-2xl px-4 py-3 text-left font-semibold transition",
              activeView === item.id
                ? "bg-cyan-500/20 text-white"
                : "hover:bg-white/5 text-slate-300"
            )}
            onClick={() => onChangeView(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Quick actions</p>
        <button
          className="w-full rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-100"
          onClick={onSignOut}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

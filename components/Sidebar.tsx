"use client";

import { Session } from "@supabase/supabase-js";
import { LayoutDashboard, Settings, LogOut, Archive } from "lucide-react";
import clsx from "clsx";

type SidebarProps = {
  activeView: "dashboard" | "settings" | "archive";
  onChangeView: (view: "dashboard" | "settings" | "archive") => void;
  session: Session;
  onSignOut: () => void;
  canViewSettings: boolean;
};

export function Sidebar({ activeView, onChangeView, session, onSignOut, canViewSettings }: SidebarProps) {
  const nav: { id: "dashboard" | "settings" | "archive"; label: string; icon: any }[] = canViewSettings
    ? [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "archive", label: "Archive", icon: Archive },
      { id: "settings", label: "Settings", icon: Settings },
    ]
    : [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "archive", label: "Archive", icon: Archive },
    ];

  return (
    <aside className="hidden w-64 flex-col gap-8 border-r border-white/5 bg-slate-950/50 p-6 text-sm text-slate-400 lg:flex backdrop-blur-xl">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary to-secondary opacity-30 blur-sm"></div>
            <img
              src="/logo.jpeg"
              alt="Yadhurtech logo"
              className="relative h-12 w-12 rounded-2xl object-cover border border-white/10"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">Yadhurtech</p>
            <p className="truncate text-sm font-semibold text-white">{session.user.email?.split('@')[0]}</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <p className="mb-2 px-4 text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">Menu</p>
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={clsx(
                "group flex items-center gap-3 w-full rounded-2xl px-4 py-3 text-left font-medium transition-all duration-300",
                activeView === item.id
                  ? "bg-white/5 text-white shadow-sm ring-1 ring-white/10"
                  : "hover:bg-white/5 text-slate-400 hover:text-white"
              )}
              onClick={() => onChangeView(item.id)}
            >
              <Icon size={18} className={clsx("transition-transform duration-300 group-hover:scale-110", activeView === item.id ? "text-accent" : "text-slate-500 group-hover:text-accent")} />
              <span>{item.label}</span>
              {activeView === item.id && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <div className="glass-card rounded-3xl p-4">
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold mb-3">System</p>
          <button
            className="group flex items-center gap-3 w-full rounded-xl px-2 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
            onClick={onSignOut}
          >
            <LogOut size={16} className="text-slate-500 group-hover:text-red-400" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

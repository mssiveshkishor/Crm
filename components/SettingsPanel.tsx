"use client";

import { SystemUser } from "@/lib/data/users";
import { LeadStage } from "@/lib/data/leads";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type SettingsPanelProps = {
  stageLabels: Record<string, string>;
  onStageLabelChange: (stage: string, label: string) => void;
  onAddStage: (stage: string) => void;
  onDeleteStage: (stage: string) => void;
  users: SystemUser[];
  onInviteUser: (payload: { email: string; password: string; role: SystemUser["role"]; team: string }) => Promise<void>;
};

export function SettingsPanel({
  stageLabels,
  onStageLabelChange,
  onAddStage,
  onDeleteStage,
  users,
  onInviteUser
}: SettingsPanelProps) {
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "sales", team: "" });
  const [newStage, setNewStage] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Local state for editing labels to avoid lag during mutations
  const [localLabels, setLocalLabels] = useState<Record<string, string>>({});

  const handleAddStage = () => {
    if (!newStage.trim()) return;
    onAddStage(newStage.trim());
    setNewStage("");
  };

  const getLabel = (stage: string) => {
    return localLabels[stage] !== undefined ? localLabels[stage] : (stageLabels[stage] || "");
  };

  return (
    <div className="space-y-8">
      {/* Pipeline Stages Section */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-400 font-bold">Pipeline stages</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(stageLabels).map(([stage, label]) => (
            <div key={stage} className="group relative flex flex-col gap-2 rounded-2xl border border-white/5 bg-slate-900/40 p-3 transition-all hover:border-white/20 hover:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-medium">{stage}</span>
                <button
                  onClick={() => onDeleteStage(stage)}
                  className="rounded-lg p-1 text-slate-500 opacity-0 transition-opacity hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
                  title="Delete stage"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                value={getLabel(stage)}
                onChange={(event) => {
                  const val = event.target.value;
                  setLocalLabels(prev => ({ ...prev, [stage]: val }));
                }}
                onBlur={() => {
                  const val = localLabels[stage];
                  if (val !== undefined && val !== stageLabels[stage]) {
                    onStageLabelChange(stage, val);
                  }
                  // Clear local override after blur so we pick up props again (which should be updated by now)
                  setLocalLabels(prev => {
                    const next = { ...prev };
                    delete next[stage];
                    return next;
                  });
                }}
              />
            </div>
          ))}

          {/* Add New Stage Card */}
          <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-white/10 bg-transparent p-3 transition-all hover:border-white/20">
            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-medium">New Stage</span>
            <div className="flex gap-2">
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="Stage name..."
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
              />
              <button
                onClick={handleAddStage}
                disabled={!newStage.trim()}
                className="flex items-center justify-center rounded-xl bg-cyan-500/10 p-2 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-30"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Team Management Section */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="mb-6 text-xs uppercase tracking-[0.4em] text-cyan-400 font-bold">Team management</p>

        <div className="grid gap-6">
          <div className="grid gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 mb-2">Invite new member</p>
            <div className="grid gap-3 md:grid-cols-4">
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder="Email"
                value={newUser.email}
                onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder="Password"
                type="password"
                value={newUser.password}
                onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
              />
              <select
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                value={newUser.role}
                onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value as SystemUser["role"] }))}
              >
                <option value="sales">Sales</option>
                <option value="manager">Manager</option>
                <option value="superadmin">Superadmin</option>
              </select>
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder="Team/Dept"
                value={newUser.team}
                onChange={(event) => setNewUser((prev) => ({ ...prev, team: event.target.value }))}
              />
            </div>
            <button
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-2.5 text-sm font-bold text-slate-950 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={async () => {
                if (!newUser.email || !newUser.password) return;
                setInviting(true);
                setInviteError(null);
                try {
                  await onInviteUser(newUser as any);
                  setNewUser({ email: "", password: "", role: "sales", team: "" });
                } catch (err) {
                  setInviteError((err as Error)?.message ?? "Failed to invite user");
                } finally {
                  setInviting(false);
                }
              }}
            >
              {inviting ? "Inviting…" : "Invite User"}
            </button>
            {inviteError && <p className="mt-2 text-center text-xs text-rose-400">{inviteError}</p>}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {users.map((user) => (
              <div key={user.id} className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-950/30 p-4 transition-all hover:bg-slate-950/50">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: `${user.id === '1' ? '#14b8a6' : '#3b82f6'}20`, color: user.id === '1' ? '#14b8a6' : '#3b82f6' }}
                >
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="truncate font-semibold text-white">{user.name}</p>
                    <span className="text-[9px] uppercase tracking-widest text-slate-500">{user.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{user.team}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span>{user.lastActive}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { SystemUser } from "@/lib/data/users";
import { LeadStage } from "@/lib/data/leads";
import { useState } from "react";

type SettingsPanelProps = {
  stageLabels: Record<LeadStage, string>;
  onStageLabelChange: (stage: LeadStage, label: string) => void;
  users: SystemUser[];
  onInviteUser: (payload: { email: string; password: string; role: SystemUser["role"]; team: string }) => Promise<void>;
};

export function SettingsPanel({ stageLabels, onStageLabelChange, users, onInviteUser }: SettingsPanelProps) {
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "sales", team: "" });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Pipeline stages</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {Object.entries(stageLabels).map(([stage, label]) => (
            <label key={stage} className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-[0.4em] text-slate-400">{stage}</span>
              <input
                className="rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white"
                value={label}
                onChange={(event) => onStageLabelChange(stage as LeadStage, event.target.value)}
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Team members</p>
        <div className="mt-3 grid gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <div className="grid gap-2 md:grid-cols-3">
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              placeholder="Email"
              value={newUser.email}
              onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
            />
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              placeholder="Password"
              type="password"
              value={newUser.password}
              onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
            />
            <select
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={newUser.role}
              onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value }))}
            >
              <option value="sales">Sales</option>
              <option value="manager">Manager</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <input
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="Team"
            value={newUser.team}
            onChange={(event) => setNewUser((prev) => ({ ...prev, team: event.target.value }))}
          />
          <button
            className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
            onClick={async () => {
              if (!newUser.email || !newUser.password) return;
              setInviting(true);
              setInviteError(null);
              try {
                await onInviteUser({
                  email: newUser.email,
                  password: newUser.password,
                  role: newUser.role as SystemUser["role"],
                  team: newUser.team || "Growth",
                });
                setNewUser({ email: "", password: "", role: "sales", team: "" });
              } catch (err) {
                setInviteError((err as Error)?.message ?? "Failed to invite user");
              } finally {
                setInviting(false);
              }
            }}
          >
            {inviting ? "Inviting…" : "Invite user"}
          </button>
          {inviteError && <p className="text-xs text-rose-400">{inviteError}</p>}
        </div>
        <div className="mt-4 space-y-2 text-sm">
          {users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{user.name}</p>
                <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{user.role}</span>
              </div>
              <p className="text-xs text-slate-400">{user.team}</p>
              <p className="text-[11px] text-slate-500">Last active: {user.lastActive}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

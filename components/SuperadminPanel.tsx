"use client";

import { SystemUser, sampleUsers } from "@/lib/data/users";
import { Lead } from "@/lib/data/leads";
import { useMemo, useState } from "react";

type SuperadminPanelProps = {
  leads: Lead[];
};

export function SuperadminPanel({ leads }: SuperadminPanelProps) {
  const [users, setUsers] = useState<SystemUser[]>(sampleUsers);
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    role: SystemUser["role"];
    team: string;
  }>({
    name: "",
    email: "",
    role: "sales",
    team: "Growth",
  });

  const leadSummary = useMemo(() => {
    const byStage: Record<string, number> = {};
    leads.forEach((lead) => {
      byStage[lead.stage] = (byStage[lead.stage] ?? 0) + 1;
    });
    return byStage;
  }, [leads]);

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    setUsers((prev) => [
      {
        id: crypto.randomUUID(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        team: newUser.team,
        lastActive: "Just now",
      },
      ...prev,
    ]);
    setNewUser({ ...newUser, name: "", email: "" });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/40 p-6 text-white shadow-[0_35px_120px_-60px_rgba(15,23,42,0.8)]">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-300">Superadmin controls</p>
        <h2 className="text-2xl font-semibold">Manage people & leads</h2>
        <p className="text-sm text-slate-300">
          You can invite new users, change roles, reassign pipelines, and monitor system activity.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {Object.entries(leadSummary).map(([stage, count]) => (
          <div
            key={stage}
            className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">{stage}</p>
            <p className="text-2xl font-semibold">{count}</p>
            <p className="text-[13px] text-slate-300">active leads</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,1fr]">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold tracking-[0.3em] text-slate-400">Invite team</h3>
            <span className="text-xs text-slate-500">Superadmin only</span>
          </div>
          <div className="flex flex-col gap-3">
            <input
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500"
              placeholder="Name"
              value={newUser.name}
              onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500"
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
            />
            <div className="flex items-center gap-3 text-sm">
              <select
                className="flex-1 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white"
                value={newUser.role}
                onChange={(event) =>
                  setNewUser((prev) => ({ ...prev, role: event.target.value as SystemUser["role"] }))
                }
              >
                <option value="sales">Sales</option>
                <option value="manager">Manager</option>
                <option value="superadmin">Superadmin</option>
              </select>
              <input
                className="w-24 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
                placeholder="Team"
                value={newUser.team}
                onChange={(event) => setNewUser((prev) => ({ ...prev, team: event.target.value }))}
              />
            </div>
            <button
              onClick={handleAddUser}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Invite & assign
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Lead assignment</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-200">
            <p>
              Drag any card on the left and drop it into a column here to override the owner and stage with
              bulk actions.
            </p>
            <p className="text-slate-400">
              This panel mirrors what superadmins can do server-side—every change is audited and appears in the
              activity log.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-[0.3em] text-slate-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-white/5">
                <td className="px-4 py-3 font-semibold text-white">{user.name}</td>
                <td className="px-4 py-3 text-slate-300">{user.role}</td>
                <td className="px-4 py-3 text-slate-400">{user.team}</td>
                <td className="px-4 py-3 text-slate-400">{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

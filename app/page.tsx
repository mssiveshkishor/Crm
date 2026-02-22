"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLeads } from "@/lib/api/leads";
import { fetchUsers } from "@/lib/api/users";
import { KanbanBoard } from "@/components/KanbanBoard";
import { LeadList } from "@/components/LeadList";
import { SettingsPanel } from "@/components/SettingsPanel";
import { LoginPanel } from "@/components/LoginPanel";
import { LeadModal, LeadFormValues } from "@/components/LeadModal";
import { Sidebar } from "@/components/Sidebar";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { Lead, leadStages, LeadStage, sampleLeads, sampleOwners, LeadOwner } from "@/lib/data/leads";
import { SystemUser, sampleUsers } from "@/lib/data/users";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { ChevronDown } from "lucide-react";

export const dynamic = "force-dynamic";

const defaultStageLabels: Record<LeadStage, string> = leadStages.reduce(
  (acc, stage) => ({
    ...acc,
    [stage]: stage,
  }),
  {} as Record<LeadStage, string>
);

export default function HomePage() {
  const { session, loading, error, signInWithPassword, signOut } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const { data, isFetching } = useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
    refetchOnWindowFocus: false,
  });
  const { data: fetchedUsers } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    refetchOnWindowFocus: false,
  });
  const [stageLabels, setStageLabels] = useState<Record<LeadStage, string>>(defaultStageLabels);
  const [view, setView] = useState<"dashboard" | "settings">("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const [localUsers, setLocalUsers] = useState<SystemUser[]>([]);
  const [ownerLibrary] = useState<LeadOwner[]>(sampleOwners);
  const isMobile = useMediaQuery("(max-width: 900px)");

  const leads = useMemo(() => data ?? sampleLeads, [data]);
  const users = useMemo(() => [...localUsers, ...(fetchedUsers ?? sampleUsers)], [localUsers, fetchedUsers]);

  if (!session) {
    return (
      <LoginPanel
        loading={loading}
        error={error}
        onSubmit={async (email, password) => {
          await signInWithPassword(email, password);
        }}
      />
    );
  }

  const handleStageLabelChange = (stage: LeadStage, label: string) => {
    setStageLabels((prev) => ({ ...prev, [stage]: label }));
  };

  const handleLeadStageChange = async (leadId: string, stage: Lead["stage"]) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from("leads").update({ stage }).eq("id", leadId);
    }
    await queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  const handleLeadSave = async (values: LeadFormValues, lead?: Lead) => {
    const supabase = getSupabaseClient();
    const payload = {
      name: values.name,
      company: values.company,
      value: values.value,
      stage: values.stage,
      priority: values.priority,
      last_contacted: new Date().toISOString(),
      next_action: values.nextAction,
      notes: values.notes,
      channel: values.channel,
    };
    if (lead && supabase) {
      await supabase.from("leads").update(payload).eq("id", lead.id);
    } else if (supabase) {
      await supabase.from("leads").insert(payload);
    }
    await queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  const handleAddUser = (user: SystemUser) => {
    setLocalUsers((prev) => [user, ...prev]);
  };

  const openModalForLead = (lead?: Lead) => {
    setModalLead(lead ?? null);
    setModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar session={session} activeView={view} onChangeView={setView} onSignOut={signOut} />
      <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-8">
        {view === "dashboard" ? (
          <>
            <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-900/30">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Welcome back</p>
                  <h1 className="text-3xl font-semibold text-white">Superadmin cockpit</h1>
                </div>
                <button
                  className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900"
                  onClick={() => openModalForLead()}
                >
                  Add lead
                </button>
              </div>
              <p className="text-sm text-slate-400">
                Drag leads between stages, rename stages, and keep track of every conversation. Click a card to update it
                instantly.
              </p>
            </header>
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Pipeline</h2>
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                  <span>Live data</span>
                  <ChevronDown size={14} />
                  <span>{isFetching ? "Refreshing" : "Synced"}</span>
                </span>
              </div>
              {!isMobile ? (
                <KanbanBoard
                  leads={leads}
                  onLeadStageChange={handleLeadStageChange}
                  stageLabels={stageLabels}
                  onCardClick={openModalForLead}
                />
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <LeadList leads={leads} stageLabels={stageLabels} onCardClick={openModalForLead} />
                </div>
              )}
            </section>
          </>
        ) : (
          <SettingsPanel
            stageLabels={stageLabels}
            onStageLabelChange={handleStageLabelChange}
            users={users}
            onAddUser={handleAddUser}
          />
        )}
      </div>
      <LeadModal
        key={modalLead?.id ?? "new-lead"}
        open={modalOpen}
        lead={modalLead ?? undefined}
        stageLabels={stageLabels}
        owners={ownerLibrary}
        onClose={() => setModalOpen(false)}
        onSave={handleLeadSave}
      />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { Lead, leadStages, LeadStage, sampleLeads, LeadOwner } from "@/lib/data/leads";
import { SystemUser, sampleUsers } from "@/lib/data/users";
import { fetchLeads } from "@/lib/api/leads";
import { fetchUsers } from "@/lib/api/users";
import { fetchStageLabels, saveStageLabel } from "@/lib/api/stageLabels";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { KanbanBoard } from "@/components/KanbanBoard";
import { LeadList } from "@/components/LeadList";
import { SettingsPanel } from "@/components/SettingsPanel";
import { LoginPanel } from "@/components/LoginPanel";
import { LeadModal, LeadFormValues } from "@/components/LeadModal";
import { Sidebar } from "@/components/Sidebar";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

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
  const { data: leadsData, isFetching } = useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
    refetchOnWindowFocus: false,
  });
  const { data: fetchedUsers } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    refetchOnWindowFocus: false,
  });
  const { data: fetchedStageLabels } = useQuery({
    queryKey: ["stage-labels"],
    queryFn: fetchStageLabels,
    refetchOnWindowFocus: false,
  });
  const [labelOverrides, setLabelOverrides] = useState<Record<LeadStage, string>>({});
  const [view, setView] = useState<"dashboard" | "settings">("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const isMobile = useMediaQuery("(max-width: 900px)");

  const leads = useMemo(() => leadsData ?? sampleLeads, [leadsData]);
  const users = useMemo(() => fetchedUsers ?? sampleUsers, [fetchedUsers]);
  const currentUser = useMemo(() => users.find((user) => user.id === session?.user?.id), [users, session]);
  const canManageSettings = currentUser?.role === "superadmin" || currentUser?.role === "admin";

  const stageLabelMutation = useMutation({
    mutationFn: ({ stage, label }: { stage: LeadStage; label: string }) => saveStageLabel(stage, label),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stage-labels"] });
    },
    onSuccess: (_data, variables) => {
      setLabelOverrides((prev) => {
        const next = { ...prev };
        delete next[variables.stage];
        return next;
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string; role: SystemUser["role"]; team: string }) => {
      const response = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Invitation failed");
      }
    },
  });

  const handleStageLabelChange = (stage: LeadStage, label: string) => {
    setLabelOverrides((prev) => ({ ...prev, [stage]: label }));
    stageLabelMutation.mutate({ stage, label });
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

  const handleAddUser = async (payload: { email: string; password: string; role: SystemUser["role"]; team: string }) => {
    await inviteMutation.mutateAsync(payload);
    await queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const ownerLibrary = useMemo<LeadOwner[]>(() => {
    const formatted = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      initials: user.name
        .split(" ")
        .map((part) => part[0] ?? "")
        .join("")
        .toUpperCase(),
      color: user.role === "superadmin" ? "#f97316" : user.role === "admin" ? "#14b8a6" : "#3b82f6",
    }));
    return formatted.length > 0 ? formatted : [
      { id: "owner_1", name: "Priya Desai", email: "priya@yadhurtech.com", initials: "PD", color: "#f97316" },
    ];
  }, [users]);

  const openModalForLead = (lead?: Lead) => {
    setModalLead(lead ?? null);
    setModalOpen(true);
  };

  const stageLabels = useMemo(
    () => ({
      ...defaultStageLabels,
      ...(fetchedStageLabels ?? {}),
      ...labelOverrides,
    }),
    [fetchedStageLabels, labelOverrides]
  );

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

  const activeView = canManageSettings ? view : "dashboard";

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar
        session={session}
        activeView={activeView}
        onChangeView={(next) => {
          if (next === "settings" && !canManageSettings) return;
          setView(next);
        }}
        onSignOut={signOut}
        canViewSettings={canManageSettings}
      />
      <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-8">
        {activeView === "dashboard" ? (
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
                Drag leads between stages, rename stages, and keep track of every conversation. Click a card to update
                it instantly.
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
            onInviteUser={handleAddUser}
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

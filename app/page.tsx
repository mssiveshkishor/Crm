"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { Lead, leadStages, LeadStage, sampleLeads, LeadOwner } from "@/lib/data/leads";
import { SystemUser, sampleUsers } from "@/lib/data/users";
import { fetchLeads } from "@/lib/api/leads";
import { fetchUsers } from "@/lib/api/users";
import { fetchStageLabels, saveStageLabel, deleteStageLabel } from "@/lib/api/stageLabels";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { KanbanBoard } from "@/components/KanbanBoard";
import { LeadList } from "@/components/LeadList";
import { SettingsPanel } from "@/components/SettingsPanel";
import { LoginPanel } from "@/components/LoginPanel";
import { LeadModal, LeadFormValues } from "@/components/LeadModal";
import { Sidebar } from "@/components/Sidebar";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { getSupabaseClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const defaultStageLabels: Record<LeadStage, string> = leadStages.reduce(
  (acc, stage) => ({
    ...acc,
    [stage]: stage,
  }),
  {} as Record<LeadStage, string>
);

const roleColorMap: Record<SystemUser["role"], string> = {
  superadmin: "#f97316",
  admin: "#14b8a6",
  manager: "#22d3ee",
  sales: "#3b82f6",
};

const getRoleColor = (role?: SystemUser["role"]) => {
  if (role && roleColorMap[role]) {
    return roleColorMap[role];
  }
  return "#9ca3af";
};

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
  const [labelOverrides, setLabelOverrides] = useState<Record<LeadStage, string>>(() => ({} as Record<LeadStage, string>));
  const [view, setView] = useState<"dashboard" | "settings" | "archive">("dashboard");
  const [filterStage, setFilterStage] = useState<string>("All Stages");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const isMobile = useMediaQuery("(max-width: 900px)");

  const leads = useMemo(() => {
    let all = leadsData ?? sampleLeads;
    if (view === "archive") {
      all = all.filter(l => l.is_archived);
    } else {
      all = all.filter(l => !l.is_archived);
    }

    if (filterStage !== "All Stages") {
      all = all.filter(l => l.stage === filterStage);
    }
    return all;
  }, [leadsData, view, filterStage]);
  const users = useMemo(() => fetchedUsers ?? sampleUsers, [fetchedUsers]);
  const currentUser = useMemo(() => users.find((user) => user.id === session?.user?.id), [users, session]);
  const canManageSettings = currentUser?.role === "superadmin" || currentUser?.role === "admin";

  const stageLabelMutation = useMutation({
    mutationFn: ({ stage, label }: { stage: string; label: string }) => saveStageLabel(stage, label),
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

  const deleteStageMutation = useMutation({
    mutationFn: (stage: string) => deleteStageLabel(stage),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stage-labels"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
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

  const handleLeadStageChange = async (leadId: string, stage: string) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from("leads").update({ stage }).eq("id", leadId);
    }
    await queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  const handleLeadArchiveToggle = async (leadId: string, isArchived: boolean) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from("leads").update({ is_archived: isArchived }).eq("id", leadId);
    }
    await queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  const handleLeadSave = async (values: LeadFormValues, lead?: Lead) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const payload = {
      name: values.name,
      company: values.company,
      value: values.value,
      stage: values.stage,
      owner_id: values.ownerId,
      priority: values.priority,
      last_contacted: new Date().toISOString(),
      next_action: values.nextAction,
      notes: values.notes,
      channel: values.channel,
      phone: values.phone,
    };

    let leadId = lead?.id;
    if (leadId) {
      await supabase.from("leads").update(payload).eq("id", leadId);
    } else {
      const { data } = await supabase.from("leads").insert(payload).select("id").single();
      leadId = data?.id;
    }

    if (values.quote && leadId) {
      const formData = new FormData();
      formData.append("leadId", leadId);
      formData.append("file", values.quote);

      const uploadResponse = await fetch("/api/quotations/upload", {
        method: "POST",
        body: formData,
      });

      const uploadBody = await uploadResponse.json().catch(() => ({}));
      if (!uploadResponse.ok) {
        console.error("Quotation upload failed", uploadBody);
        throw new Error(uploadBody.error ?? "Quotation upload failed");
      }

      const quoteUrl = uploadBody.quoteUrl as string | undefined;
      if (quoteUrl) {
        await supabase.from("leads").update({ quote_url: quoteUrl }).eq("id", leadId);
      }
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
      color: getRoleColor(user.role),
      role: user.role,
      team: user.team,
    }));
    return formatted.length > 0
      ? formatted
      : [
        {
          id: "owner_1",
          name: "Priya Desai",
          email: "priya@yadhurtech.com",
          initials: "PD",
          color: "#f97316",
          role: "superadmin",
          team: "Leadership",
        },
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
    <div className="flex min-h-screen bg-transparent text-slate-100 selection:bg-primary/30">
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
      <div className="flex flex-1 flex-col gap-8 px-6 py-8 lg:px-12 max-w-7xl mx-auto w-full animate-in">
        {/* Mobile Header */}
        <div className="space-y-4 lg:hidden">
          <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md px-5 py-4 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary to-secondary opacity-20 blur-sm"></div>
                <img src="/logo.jpeg" alt="Yadhurtech logo" className="relative h-10 w-10 rounded-2xl object-cover border border-white/10" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Yadhurtech</p>
                <p className="text-sm font-semibold text-white">Dashboard</p>
              </div>
            </div>
            <button
              className="rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
              onClick={() => openModalForLead()}
            >
              Add lead
            </button>
          </div>
          <div className="flex p-1 gap-1 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5">
            <button
              className={clsx(
                "flex-1 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-300",
                activeView === "dashboard"
                  ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                  : "text-slate-400 hover:text-white"
              )}
              onClick={() => setView("dashboard")}
            >
              Dashboard
            </button>
            {canManageSettings && (
              <button
                className={clsx(
                  "flex-1 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-300",
                  activeView === "settings"
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                    : "text-slate-400 hover:text-white"
                )}
                onClick={() => setView("settings")}
              >
                Settings
              </button>
            )}
          </div>
        </div>

        {activeView === "dashboard" || activeView === "archive" ? (
          <>
            <header className="relative group">
              <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
              <div className="relative flex flex-col gap-6 rounded-[32px] border border-white/10 bg-slate-900/40 backdrop-blur-md p-8 shadow-2xl transition-all duration-500 hover:border-white/20">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.5em] text-primary font-black mb-1">
                      {activeView === "archive" ? "Cold Storage" : "Welcome back"}
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                      {activeView === "archive" ? (
                        <>Archived <span className="text-gradient">Vault</span></>
                      ) : (
                        <>Command <span className="text-gradient">Center</span></>
                      )}
                    </h1>
                  </div>
                  {activeView === "dashboard" && (
                    <button
                      className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] transition-all active:scale-[0.98]"
                      onClick={() => openModalForLead()}
                    >
                      <span>+</span>
                      <span>New Lead</span>
                    </button>
                  )}
                </div>
                <p className="text-base text-slate-400 leading-relaxed max-w-2xl">
                  {activeView === "archive"
                    ? "Manage your archived intelligence assets. Review past opportunities or restore them to the active pipeline."
                    : "Streamline your workflow. Manage your pipeline with precision using our intuitive Kanban interface."}
                </p>
              </div>
            </header>

            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "h-2 w-2 rounded-full animate-pulse shadow-[0_0_8px]",
                    activeView === "archive" ? "bg-slate-500 shadow-slate-500/80" : "bg-accent shadow-cyan-500/80"
                  )}></div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {activeView === "archive" ? "Archived Leads" : "Active Pipeline"}
                  </h2>
                </div>
                <div className="flex items-center gap-2 group/select">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white/5 border border-white/10 rounded-full px-5 py-2 text-[11px] font-bold text-slate-300 uppercase tracking-widest outline-none hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer pr-10"
                      value={filterStage}
                      onChange={(e) => setFilterStage(e.target.value)}
                    >
                      <option value="All Stages">All Stages</option>
                      {leadStages.map((stage) => (
                        <option key={stage} value={stage}>
                          {stageLabels[stage] || stage}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover/select:text-accent transition-colors" />
                  </div>
                </div>
              </div>

              <div className="relative">
                {!isMobile ? (
                  <KanbanBoard
                    leads={leads}
                    onLeadStageChange={handleLeadStageChange}
                    stageLabels={stageLabels}
                    onCardClick={openModalForLead}
                  />
                ) : (
                  <div className="rounded-[32px] border border-white/10 bg-slate-900/40 backdrop-blur-md p-6 shadow-xl">
                    <LeadList leads={leads} stageLabels={stageLabels} onCardClick={openModalForLead} />
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <div className="animate-in">
            <SettingsPanel
              stageLabels={stageLabels}
              onStageLabelChange={handleStageLabelChange}
              onAddStage={(stage) => stageLabelMutation.mutate({ stage, label: stage })}
              onDeleteStage={(stage) => deleteStageMutation.mutate(stage)}
              users={users}
              onInviteUser={inviteMutation.mutateAsync}
            />
          </div>
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
        onArchiveToggle={handleLeadArchiveToggle}
      />
    </div>
  );
}

"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { KanbanBoard } from "@/components/KanbanBoard";
import { LeadList } from "@/components/LeadList";
import { SuperadminPanel } from "@/components/SuperadminPanel";
import { fetchLeads } from "@/lib/api/leads";
import { Lead, sampleLeads } from "@/lib/data/leads";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { ChevronDown } from "lucide-react";

export default function HomePage() {
  const [stageOverrides, setStageOverrides] = useState<Record<string, Lead["stage"]>>({});
  const { data, isFetching } = useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
    refetchOnWindowFocus: false,
  });

  const baseLeads = data ?? sampleLeads;
  const leads = useMemo(
    () =>
      baseLeads.map((lead) => {
        const override = stageOverrides[lead.id];
        if (override && override !== lead.stage) {
          return { ...lead, stage: override };
        }
        return lead;
      }),
    [baseLeads, stageOverrides]
  );

  const isMobile = useMediaQuery("(max-width: 900px)");

  const handleStageChange = (leadId: string, stage: Lead["stage"]) => {
    setStageOverrides((prev) => {
      const baseLead = baseLeads.find((lead) => lead.id === leadId);
      if (baseLead && baseLead.stage === stage) {
        const next = { ...prev };
        delete next[leadId];
        return next;
      }
      return { ...prev, [leadId]: stage };
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 lg:px-6">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Yadhurtech CRM</p>
              <h1 className="text-3xl font-semibold text-white md:text-4xl">
                Modern CRM for bold teams
              </h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                Superadmin preview
              </span>
              <span className="flex items-center gap-1">
                Live data • {isFetching ? "Refreshing" : "Synced"}
                <ChevronDown size={14} />
              </span>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            Desktop workflows get an immersive kanban board with quick actions, while mobile users enjoy a condensed
            list view. Superadmins remain in control with user management, assignment rules, and visibility into every lead.
          </p>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Pipeline kanban</h2>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">drag & drop</p>
          </div>
          {!isMobile ? (
            <KanbanBoard leads={leads} onLeadStageChange={handleStageChange} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <LeadList leads={leads} />
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Superadmin cockpit</h2>
            <p className="text-sm text-slate-400">Assign leads, add users, audit changes</p>
          </div>
          <SuperadminPanel leads={leads} />
        </section>
      </div>
    </main>
  );
}

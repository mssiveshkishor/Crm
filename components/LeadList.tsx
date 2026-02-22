"use client";

import { Lead } from "@/lib/data/leads";
import { MoreHorizontal, ArrowRight } from "lucide-react";

type LeadListProps = {
  leads: Lead[];
  stageLabels: Record<Lead["stage"], string>;
  onCardClick: (lead: Lead) => void;
};

export function LeadList({ leads, stageLabels, onCardClick }: LeadListProps) {
  return (
    <div className="flex flex-col gap-3">
      {leads.map((lead) => (
        <button
          key={lead.id}
          type="button"
          onClick={() => onCardClick(lead)}
          className="text-left"
        >
          <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/70 p-4 shadow-lg shadow-slate-900/5 dark:border-white/5 dark:bg-black/40">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{lead.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{lead.company}</p>
              <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-1">{lead.nextAction}</p>
              <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <span>{stageLabels[lead.stage]}</span>
                <span className="h-1 w-1 rounded-full bg-slate-400" />
                <span>{lead.channel}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                ${lead.value.toLocaleString()}
              </span>
              <div className="flex items-center gap-3 text-slate-500">
                <ArrowRight size={16} />
                <MoreHorizontal size={16} />
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

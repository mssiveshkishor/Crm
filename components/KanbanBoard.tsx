"use client";

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Lead, leadStages } from "@/lib/data/leads";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { FileText, Coins, CalendarDays, ExternalLink, Phone, MessageCircle } from "lucide-react";
import clsx from "clsx";
import { formatINR } from "@/lib/utils/formatCurrency";

type KanbanBoardProps = {
  leads: Lead[];
  onLeadStageChange: (leadId: string, stage: Lead["stage"]) => void;
  stageLabels: Record<Lead["stage"], string>;
  onCardClick: (lead: Lead) => void;
};

const LeadCard = ({ lead }: { lead: Lead }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: {
      leadStage: lead.stage,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
      className={clsx(
        "glass-card p-4 rounded-2xl group",
        isDragging && "opacity-50 scale-95 rotate-1"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-bold text-sm text-white group-hover:text-accent transition-colors truncate">
          {lead.name}
        </h3>
        <div className="flex flex-col items-end gap-2">
          <div
            className={clsx(
              "shrink-0 h-2 w-2 rounded-full shadow-[0_0_8px]",
              lead.priority === "High"
                ? "bg-rose-500 shadow-rose-500/50"
                : lead.priority === "Medium"
                  ? "bg-amber-500 shadow-amber-500/50"
                  : "bg-emerald-500 shadow-emerald-500/50"
            )}
          />
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {lead.phone && (
              <>
                <a
                  href={`tel:${lead.phone}`}
                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                  title="Call lead"
                >
                  <Phone size={12} />
                </a>
                <a
                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                  title="WhatsApp lead"
                >
                  <MessageCircle size={12} />
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <FileText size={12} className="text-slate-600" />
          <span className="truncate">{lead.company}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-accent">
            <Coins size={12} />
            <span className="font-bold text-[12px]">{formatINR(lead.value)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <CalendarDays size={12} />
            <span className="text-[10px] font-medium">Next: {lead.nextAction?.split(' ')[0]}</span>
          </div>
        </div>

        {lead.quoteUrl && (
          <div className="pt-2">
            <a
              href={lead.quoteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-wider bg-primary/5 px-2 py-1 rounded-lg border border-primary/10"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={10} />
              Quotation
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const ColumnHeader = ({ label, count }: { label: string; count: number }) => (
  <div className="flex items-center justify-between mb-6 px-1">
    <div className="flex items-center gap-2.5">
      <div className="h-5 w-1 rounded-full bg-primary/40 shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</span>
    </div>
    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-500">
      {count}
    </span>
  </div>
);

const Column = ({
  stage,
  leads,
  onCardClick,
  label,
}: {
  stage: Lead["stage"];
  leads: Lead[];
  label: string;
  onCardClick: (lead: Lead) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${stage}`,
    data: { stage },
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex-1 min-w-[280px] max-w-[320px] transition-all duration-300",
        isOver && "scale-[1.02]"
      )}
    >
      <div className={clsx(
        "h-full rounded-[32px] border border-white/10 p-5 bg-slate-900/40 backdrop-blur-md transition-colors",
        isOver && "border-primary/40 bg-primary/5"
      )}>
        <ColumnHeader label={label} count={leads.length} />
        <div className="flex flex-col gap-4">
          {leads.map((lead) => (
            <button key={lead.id} type="button" onClick={() => onCardClick(lead)} className="text-left w-full">
              <LeadCard lead={lead} />
            </button>
          ))}
          {leads.length === 0 && (
            <div className="h-32 rounded-2xl border border-dashed border-white/5 flex items-center justify-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">No Leads</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function KanbanBoard({ leads, onLeadStageChange, stageLabels, onCardClick }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over?.id && typeof over.id === "string" && active.id !== over.id) {
      const targetStage = (over.id as string).replace("column-", "") as Lead["stage"];
      onLeadStageChange(active.id as string, targetStage);
    }
  };

  const stages = Object.keys(stageLabels);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
        {stages.map((stage) => (
          <Column
            key={stage}
            stage={stage}
            label={stageLabels[stage]}
            leads={leads.filter((lead) => lead.stage === stage)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  );
}

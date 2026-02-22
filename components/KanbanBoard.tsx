"use client";

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Lead, leadStages } from "@/lib/data/leads";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

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
        "bg-white/90 dark:bg-[#111827] rounded-2xl border border-white/20 dark:border-white/5 p-4 shadow-lg shadow-slate-900/10",
        "ring-1 ring-slate-900/5 dark:ring-0",
        isDragging && "opacity-70"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-sm text-slate-900 dark:text-white">{lead.name}</p>
        <span
          className={clsx(
            "px-2 py-0.5 text-[11px] font-semibold rounded-full",
            lead.priority === "High"
              ? "bg-rose-100 text-rose-600"
              : lead.priority === "Medium"
              ? "bg-amber-100 text-amber-600"
              : "bg-emerald-100 text-emerald-600"
          )}
        >
          {lead.priority}
        </span>
      </div>
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-2">{lead.company}</p>
      <p className="text-sm text-slate-600 dark:text-slate-200 mt-2">{lead.notes}</p>
      <div className="mt-3 flex items-center justify-between text-[13px] text-slate-500 dark:text-slate-400">
        <span>{lead.nextAction}</span>
        <span className="font-semibold text-slate-900 dark:text-white">${lead.value.toLocaleString()}</span>
      </div>
    </div>
  );
};

const ColumnHeader = ({ label }: { label: string }) => (
  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
    <span>{label}</span>
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
        "flex-1 min-w-[230px] max-w-[260px] bg-white/30 dark:bg-white/5 rounded-3xl p-5 border border-white/50 dark:border-white/10",
        "backdrop-blur",
        isOver && "ring-2 ring-cyan-400/40"
      )}
    >
      <ColumnHeader label={label} />
      <div className="mt-4 flex flex-col gap-4">
        {leads.map((lead) => (
          <button key={lead.id} type="button" onClick={() => onCardClick(lead)} className="text-left">
            <LeadCard lead={lead} />
          </button>
        ))}
      </div>
    </div>
  );
};

export function KanbanBoard({ leads, onLeadStageChange }: KanbanBoardProps) {
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

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {leadStages.map((stage) => (
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

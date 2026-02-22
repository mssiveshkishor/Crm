"use client";

import { Lead, sampleOwners, LeadStage } from "@/lib/data/leads";
import { useId, useState } from "react";

export type LeadFormValues = {
  name: string;
  company: string;
  value: number;
  stage: Lead["stage"];
  priority: Lead["priority"];
  ownerId: string;
  nextAction: string;
  notes: string;
  channel: string;
  quote?: File | null;
};

type LeadModalProps = {
  open: boolean;
  lead?: Lead;
  stageLabels: Record<LeadStage, string>;
  owners?: typeof sampleOwners;
  onClose: () => void;
  onSave: (values: LeadFormValues, existing?: Lead) => Promise<void>;
};

const priorities: Lead["priority"][] = ["High", "Medium", "Low"];

export function LeadModal({ open, lead, stageLabels, owners = sampleOwners, onClose, onSave }: LeadModalProps) {
  const id = useId();
  const initialForm = lead
    ? {
        name: lead.name,
        company: lead.company,
        value: lead.value,
        stage: lead.stage,
        priority: lead.priority,
        ownerId: lead.owner.id,
        nextAction: lead.nextAction,
        notes: lead.notes,
        channel: lead.channel,
        quote: null,
      }
    : {
        name: "",
        company: "",
        value: 0,
        stage: "New" as Lead["stage"],
        priority: "Medium" as Lead["priority"],
        ownerId: owners[0]?.id ?? "owner_fallback",
        nextAction: "",
        notes: "",
        channel: "",
        quote: null,
      };
  const [form, setForm] = useState<LeadFormValues>(() => initialForm);
  const [saving, setSaving] = useState(false);
  const [quoteFile, setQuoteFile] = useState<File | null>(null);

  const handleChange = (field: keyof LeadFormValues, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    await onSave({ ...form, quote: quoteFile }, lead);
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-white">{lead ? "Update lead" : "Add lead"}</h3>
          <button
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            id={`${id}-name`}
            className="rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white"
            placeholder="Lead name"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
          />
          <input
            className="rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white"
            placeholder="Company"
            value={form.company}
            onChange={(event) => handleChange("company", event.target.value)}
          />
          <input
            className="rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white"
            placeholder="Value"
            type="number"
            value={form.value}
            onChange={(event) => handleChange("value", Number(event.target.value))}
          />
          <select
            className="rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white"
            value={form.priority}
            onChange={(event) => handleChange("priority", event.target.value as Lead["priority"])}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white"
            value={form.stage}
            onChange={(event) => handleChange("stage", event.target.value as Lead["stage"])}
          >
            {Object.entries(stageLabels).map(([stageKey, label]) => (
              <option key={stageKey} value={stageKey}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white"
            value={form.ownerId}
            onChange={(event) => handleChange("ownerId", event.target.value)}
          >
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
          <input
            className="col-span-2 rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white"
            placeholder="Next action"
            value={form.nextAction}
            onChange={(event) => handleChange("nextAction", event.target.value)}
          />
          <input
            className="col-span-2 rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white"
            placeholder="Channel (Email, Call...)"
            value={form.channel}
            onChange={(event) => handleChange("channel", event.target.value)}
          />
          <textarea
            className="col-span-2 rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white"
            placeholder="Notes"
            value={form.notes}
            onChange={(event) => handleChange("notes", event.target.value)}
          />
          <label className="col-span-2 text-sm text-slate-400">
            <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Quotation (PDF)</span>
            <input
              type="file"
              accept="application/pdf"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white"
              onChange={(event) => setQuoteFile(event.target.files?.[0] ?? null)}
            />
          </label>
          {lead?.quoteUrl && (
            <div className="col-span-2 space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Stored quotation</p>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/60">
                <object
                  data={lead.quoteUrl}
                  type="application/pdf"
                  width="100%"
                  height="220"
                  className="h-56 w-full"
                >
                  <p className="p-3 text-xs text-slate-400">
                    This browser cannot display PDFs.{" "}
                    <a href={lead.quoteUrl} target="_blank" rel="noreferrer" className="text-cyan-400 underline">
                      Open in a new tab.
                    </a>
                  </p>
                </object>
              </div>
            </div>
          )}
        </div>
        <div className="mt-5 flex items-center justify-end gap-3 text-sm">
          <button
            className="rounded-2xl bg-white px-4 py-2 font-semibold text-slate-900"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving…" : lead ? "Update lead" : "Create lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

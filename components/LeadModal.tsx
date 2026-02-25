"use client";

import { Lead, sampleOwners, LeadStage } from "@/lib/data/leads";
import { useId, useState } from "react";
import { X, Save, FileUp, Info, Archive, ArchiveRestore } from "lucide-react";
import clsx from "clsx";

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
  phone: string;
  quote?: File | null;
};

type LeadModalProps = {
  open: boolean;
  lead?: Lead;
  stageLabels: Record<LeadStage, string>;
  owners?: typeof sampleOwners;
  onClose: () => void;
  onSave: (values: LeadFormValues, existing?: Lead) => Promise<void>;
  onArchiveToggle?: (leadId: string, isArchived: boolean) => Promise<void>;
};

const priorities: Lead["priority"][] = ["High", "Medium", "Low"];

export function LeadModal({ open, lead, stageLabels, owners = sampleOwners, onClose, onSave, onArchiveToggle }: LeadModalProps) {
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
      phone: lead.phone ?? "",
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
      phone: "",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] animate-in">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-50"></div>

        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/2">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
              <Info className="text-accent" size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold mb-0.5">Lead Management</p>
              <h3 className="text-2xl font-bold text-white">{lead ? "Modify Intelligence" : "Harvest New Lead"}</h3>
            </div>
          </div>
          <button
            className="group rounded-2xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            onClick={onClose}
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-8 scrollbar-hide">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Entity Name</label>
              <input
                id={`${id}-name`}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                placeholder="Enter lead name..."
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Company</label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                placeholder="Enter company name..."
                value={form.company}
                onChange={(event) => handleChange("company", event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Estimated Value</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">₹</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-8 pr-4 py-3 text-sm font-bold text-accent placeholder:text-slate-600 focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                  placeholder="0.00"
                  type="number"
                  value={form.value}
                  onChange={(event) => handleChange("value", Number(event.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Strategic Priority</label>
              <select
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-primary/50 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
                value={form.priority}
                onChange={(event) => handleChange("priority", event.target.value as Lead["priority"])}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority} className="bg-slate-900">
                    {priority} Priority
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Phone Number</label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                placeholder="+91 00000 00000"
                value={form.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Lifecycle Stage</label>
              <select
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-primary/50 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
                value={form.stage}
                onChange={(event) => handleChange("stage", event.target.value as Lead["stage"])}
              >
                {Object.entries(stageLabels).map(([stageKey, label]) => (
                  <option key={stageKey} value={stageKey} className="bg-slate-900">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Opportunity Owner</label>
              <select
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-primary/50 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
                value={form.ownerId}
                onChange={(event) => handleChange("ownerId", event.target.value)}
              >
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id} className="bg-slate-900">
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Imminent Objective</label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                placeholder="What is the next step?"
                value={form.nextAction}
                onChange={(event) => handleChange("nextAction", event.target.value)}
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Operational Notes</label>
              <textarea
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-primary/50 focus:bg-white/10 outline-none transition-all resize-none"
                placeholder="Context, details, or specific requirements..."
                value={form.notes}
                onChange={(event) => handleChange("notes", event.target.value)}
              />
            </div>

            <div className="col-span-2 space-y-3">
              <label className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-500 ml-1">Intelligence Asset</label>
              <div className="group relative flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/2 p-8 transition-all hover:bg-white/5 hover:border-primary/30">
                <FileUp className="mb-2 text-slate-500 group-hover:text-primary group-hover:scale-110 transition-all" />
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  {quoteFile ? quoteFile.name : "Upload Proposal / Quotation (PDF)"}
                </p>
                <input
                  type="file"
                  accept="application/pdf"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(event) => setQuoteFile(event.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            {lead?.quoteUrl && (
              <div className="col-span-2 space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500">Preview Asset</p>
                </div>
                <div className="overflow-hidden rounded-[24px] border border-white/10 shadow-2xl">
                  <object
                    data={lead.quoteUrl}
                    type="application/pdf"
                    width="100%"
                    height="300"
                    className="h-72 w-full"
                  >
                    <div className="flex flex-col items-center justify-center h-full bg-slate-950 p-6 text-center">
                      <p className="text-xs text-slate-500 mb-4">Embedded preview not supported by engine.</p>
                      <a
                        href={lead.quoteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/5 px-4 py-2 rounded-xl border border-accent/10"
                      >
                        External View
                      </a>
                    </div>
                  </object>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 border-t border-white/5 bg-white/2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-slate-500 font-medium italic">Encrypted Connection Active</p>
            {lead && onArchiveToggle && (
              <button
                onClick={async () => {
                  setSaving(true);
                  await onArchiveToggle(lead.id, !lead.is_archived);
                  setSaving(false);
                  onClose();
                }}
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
              >
                {lead.is_archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                <span>{lead.is_archived ? "Restore Lead" : "Archive Lead"}</span>
              </button>
            )}
          </div>
          <button
            className="group flex items-center gap-3 rounded-2xl bg-gradient-to-tr from-primary to-secondary px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
            onClick={handleSubmit}
            disabled={saving}
          >
            <Save size={18} className={clsx(saving && "animate-spin")} />
            <span>{saving ? "Processing..." : lead ? "Update Intel" : "Deploy Lead"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import { getSupabaseClient } from "../supabaseClient";
import { Lead, sampleLeads } from "../data/leads";

export async function fetchLeads(): Promise<Lead[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return sampleLeads;
  }

  const { data, error } = await supabase
    .from("leads")
    .select(`
      id,
      name,
      company,
      value,
      stage,
      priority,
      last_contacted,
      next_action,
      notes,
      channel,
      owner:profiles(id, full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch leads failed", error);
    return sampleLeads;
  }

  return (
    data?.map((row) => ({
      id: row.id,
      name: row.name ?? row.company,
      company: row.company ?? "Unknown",
      value: Number(row.value ?? 0),
      stage: (row.stage ?? "New") as Lead["stage"],
      priority: (row.priority ?? "Medium") as Lead["priority"],
      lastContacted: row.last_contacted ?? "Not yet",
      nextAction: row.next_action ?? "Follow up",
      notes: row.notes ?? "",
      channel: row.channel ?? "Email",
      owner: {
        id: row.owner?.id ?? "owner_fallback",
        name: row.owner?.full_name ?? "Unassigned",
        email: row.owner?.email ?? "",
        initials: row.owner?.full_name
          ? row.owner.full_name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .toUpperCase()
          : "UA",
        color: "#9ca3af",
      },
    })) ?? sampleLeads
  );
}

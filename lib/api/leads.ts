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
    data?.map((row) => {
      const ownerRow = Array.isArray(row.owner) ? row.owner[0] : row.owner;

      return {
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
          id: ownerRow?.id ?? "owner_fallback",
          name: ownerRow?.full_name ?? "Unassigned",
          email: ownerRow?.email ?? "",
          initials: ownerRow?.full_name
            ? ownerRow.full_name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .toUpperCase()
            : "UA",
          color: "#9ca3af",
        },
      };
    }) ?? sampleLeads
  );
}

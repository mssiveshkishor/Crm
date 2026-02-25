import { getSupabaseClient } from "../supabaseClient";
import { Lead, sampleLeads } from "../data/leads";
import type { SystemUser } from "../data/users";

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
      quote_url,
      is_archived,
      phone,
      owner:profiles(id, full_name, email, role, team)
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
        quoteUrl: row.quote_url ?? undefined,
        is_archived: row.is_archived ?? false,
        phone: row.phone ?? "",
        owner: {
          id: ownerRow?.id ?? "owner_fallback",
          name: ownerRow?.full_name ?? "Unassigned",
          email: ownerRow?.email ?? "",
          initials: ownerRow?.full_name
            ? ownerRow.full_name
              .split(" ")
              .map((part: string) => part[0])
              .join("")
              .toUpperCase()
            : "UA",
          color: getRoleColor(ownerRow?.role as SystemUser["role"] | undefined),
          role: ownerRow?.role,
          team: ownerRow?.team,
        },
      };
    }) ?? sampleLeads
  );
}

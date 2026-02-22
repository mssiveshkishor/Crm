import { getSupabaseClient } from "../supabaseClient";
import { SystemUser, sampleUsers } from "../data/users";

export async function fetchUsers(): Promise<SystemUser[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return sampleUsers;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, team, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase fetch users failed", error);
    return sampleUsers;
  }

  return (
    data?.map((row) => ({
      id: row.id,
      name: row.full_name ?? row.email,
      email: row.email,
      role: row.role as SystemUser["role"],
      team: row.team ?? "Unassigned",
      lastActive: row.created_at ? new Date(row.created_at).toLocaleString() : "now",
    })) ?? sampleUsers
  );
}

import { LeadStage, leadStages } from "../data/leads";
import { getSupabaseClient } from "../supabaseClient";

type StageLabelRow = {
  stage: string;
  label: string;
};

export async function fetchStageLabels(): Promise<Record<LeadStage, string>> {
  const supabase = getSupabaseClient();
  const fallback = leadStages.reduce(
    (acc, stage) => ({ ...acc, [stage]: stage }),
    {} as Record<LeadStage, string>
  );

  if (!supabase) {
    return fallback;
  }

  const { data, error } = await supabase
    .from("stage_labels")
    .select("stage, label")
    .order("sort_order", { ascending: true });

  if (error) {
    if (error.code === "PGRST205") {
      console.warn("Table 'stage_labels' not found. Falling back to default labels.");
    } else {
      console.error("fetchStageLabels error:", error.message || error);
    }
    return fallback;
  }

  if (!data || data.length === 0) {
    return fallback;
  }

  return (data as StageLabelRow[]).reduce((acc, row) => {
    acc[row.stage] = row.label;
    return acc;
  }, {} as Record<string, string>);
}

export async function saveStageLabel(stage: string, label: string, sortOrder: number = 0): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  await supabase
    .from("stage_labels")
    .upsert(
      { stage, label, sort_order: sortOrder, updated_at: new Date().toISOString() },
      { onConflict: "stage" }
    );
}

export async function deleteStageLabel(stage: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  await supabase.from("stage_labels").delete().eq("stage", stage);
}

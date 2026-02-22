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

  const { data, error } = await supabase.from("stage_labels").select<StageLabelRow>("stage, label");
  if (error) {
    console.error("fetchStageLabels", error);
    return fallback;
  }

  return data?.reduce((acc, row) => {
    if (leadStages.includes(row.stage as LeadStage)) {
      acc[row.stage as LeadStage] = row.label;
    }
    return acc;
  }, fallback);
}

export async function saveStageLabel(stage: LeadStage, label: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  await supabase
    .from("stage_labels")
    .upsert(
      { stage, label, updated_at: new Date().toISOString() },
      { onConflict: "stage" }
    );
}

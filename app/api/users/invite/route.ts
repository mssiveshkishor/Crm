import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceUrl || !serviceKey) {
  console.warn("Supabase service role key or url missing");
}

const supabaseAdmin = serviceUrl && serviceKey ? createClient(serviceUrl, serviceKey) : null;

type InvitePayload = {
  email: string;
  password: string;
  role: "superadmin" | "admin" | "sales";
  team: string;
};

export async function POST(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const body = (await req.json()) as InvitePayload;
  if (!body.email || !body.password || !body.role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: { role: body.role, team: body.team },
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Failed to create user" }, { status: 400 });
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: data.user.id,
    email: body.email,
    full_name: body.email.split("@")[0],
    role: body.role,
    team: body.team,
  });

  if (profileError) {
    console.error("invite user profile upsert", profileError);
  }

  return NextResponse.json({ user: data.user });
}

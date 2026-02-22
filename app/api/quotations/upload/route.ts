import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = serviceUrl && serviceKey ? createClient(serviceUrl, serviceKey) : null;

export async function POST(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase service client unavailable" }, { status: 503 });
  }

  const formData = await req.formData();
  const leadId = formData.get("leadId");
  const file = formData.get("file");

  if (!leadId || typeof leadId !== "string" || !file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing lead id or file" }, { status: 400 });
  }

  const filePath = `quotations/quote-${leadId}.pdf`;
  const fileData = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage.from("quotations").upload(filePath, fileData, {
    upsert: true,
    contentType: file.type || "application/pdf",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage.from("quotations").getPublicUrl(filePath);

  if (!urlData?.publicUrl) {
    return NextResponse.json({ error: "Unable to resolve quotation url" }, { status: 500 });
  }

  return NextResponse.json({ quoteUrl: urlData.publicUrl });
}

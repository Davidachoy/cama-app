import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { GmailPaymentCandidate } from "@/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const payments: GmailPaymentCandidate[] = body.payments ?? [];

  if (payments.length === 0) {
    return NextResponse.json({ error: "No payments provided" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const rows = payments.map((p) => ({
    amount_colones: p.amount_colones,
    paid_at: p.date,
    method: p.method,
    source: "gmail_parsed",
    raw_email_id: p.email_id,
    notes: p.subject,
  }));

  // Use upsert with conflict on raw_email_id to prevent duplicates
  const { data, error } = await supabase
    .from("payments")
    .upsert(rows, { onConflict: "raw_email_id", ignoreDuplicates: true })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ imported: data?.length ?? 0 }, { status: 201 });
}

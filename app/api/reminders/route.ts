import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createReminderEvent } from "@/lib/google-calendar";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .order("remind_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, remind_at, add_to_calendar } = body;

  if (!title || !remind_at) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  let google_event_id: string | null = null;

  if (add_to_calendar && session.accessToken && session.refreshToken) {
    try {
      google_event_id = await createReminderEvent(
        session.accessToken,
        session.refreshToken,
        { title, description, remindAt: remind_at }
      ) ?? null;
    } catch {
      // Non-fatal
    }
  }

  const { data, error } = await supabase
    .from("reminders")
    .insert({ title, description, remind_at, google_event_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { deleteCalendarEvent } from "@/lib/google-calendar";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, googleEventId, notes } = body;

  const supabase = getSupabaseAdmin();
  const update: Record<string, unknown> = {};
  if (status) update.status = status;
  if (notes !== undefined) update.notes = notes;

  const { data, error } = await supabase
    .from("bookings")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If cancelling, remove from Google Calendar
  if (status === "cancelled" && googleEventId) {
    try {
      await deleteCalendarEvent(session.accessToken, session.refreshToken, googleEventId);
    } catch {
      // Non-fatal
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { googleEventId } = body;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (googleEventId) {
    try {
      await deleteCalendarEvent(session.accessToken, session.refreshToken, googleEventId);
    } catch {
      // Non-fatal
    }
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";
import { createCalendarEvent } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, service:services(*)")
    .order("starts_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { client_name, client_phone, client_email, service_id, starts_at, ends_at, notes } = body;

  if (!client_name || !starts_at || !ends_at) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Check for conflicting bookings
  const { data: conflicts } = await supabase
    .from("bookings")
    .select("id")
    .not("status", "eq", "cancelled")
    .or(`starts_at.lt.${ends_at},ends_at.gt.${starts_at}`)
    .limit(1);

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: "Ese horario ya está ocupado" }, { status: 409 });
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({ client_name, client_phone, client_email, service_id, starts_at, ends_at, notes, status: "confirmed" })
    .select("*, service:services(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Try to add to Google Calendar (best-effort, don't fail the request if it fails)
  try {
    const session = await auth();
    if (session?.accessToken && session?.refreshToken) {
      const serviceName = (booking.service as { name?: string })?.name ?? "Servicio";
      const eventId = await createCalendarEvent(session.accessToken, session.refreshToken, {
        summary: `✂️ ${serviceName} — ${client_name}`,
        description: `Cliente: ${client_name}\n${client_phone ? `Tel: ${client_phone}` : ""}${notes ? `\nNotas: ${notes}` : ""}`,
        startTime: starts_at,
        endTime: ends_at,
        reminderMinutes: [30, 10],
      });

      await supabase.from("bookings").update({ google_event_id: eventId }).eq("id", booking.id);
      booking.google_event_id = eventId;
    }
  } catch {
    // Non-fatal
  }

  return NextResponse.json(booking, { status: 201 });
}

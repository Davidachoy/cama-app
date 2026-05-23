import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  // Vercel Cron passes Authorization header with CRON_SECRET
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
  const in1 = new Date(now.getTime() + 1 * 60 * 1000).toISOString();

  // Find upcoming bookings in next 30 minutes
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, service:services(name), client_name")
    .eq("status", "confirmed")
    .gte("starts_at", in1)
    .lte("starts_at", in30);

  // Find overdue reminders
  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("is_completed", false)
    .lte("remind_at", now.toISOString())
    .gte("remind_at", new Date(now.getTime() - 15 * 60 * 1000).toISOString());

  // Get push subscriptions
  const { data: subs } = await supabase.from("push_subscriptions").select("*");

  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const webpush = await import("web-push");
  webpush.default.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  let sent = 0;

  for (const sub of subs) {
    const pushSub = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };

    for (const booking of bookings ?? []) {
      try {
        await webpush.default.sendNotification(
          pushSub,
          JSON.stringify({
            title: "Cita próxima",
            body: `${booking.client_name} — ${(booking.service as { name?: string })?.name ?? "Servicio"} en 30 min`,
          })
        );
        sent++;
      } catch {
        // Expired subscription — remove it
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }

    for (const reminder of reminders ?? []) {
      try {
        await webpush.default.sendNotification(
          pushSub,
          JSON.stringify({ title: "Recordatorio", body: reminder.title })
        );
        sent++;
      } catch {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }
  }

  return NextResponse.json({ sent });
}

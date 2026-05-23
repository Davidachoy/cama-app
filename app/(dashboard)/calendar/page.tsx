import { getSupabaseAdmin } from "@/lib/supabase";
import type { BookingRecord } from "@/types";
import { WeekCalendar } from "./week-calendar";

export default async function CalendarPage() {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();

  const { data } = await supabase
    .from("bookings")
    .select("*, service:services(*)")
    .gte("starts_at", startOfMonth)
    .lte("starts_at", endOfMonth)
    .not("status", "eq", "cancelled")
    .order("starts_at");

  const bookings = (data ?? []) as BookingRecord[];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Calendario</h1>
      <WeekCalendar bookings={bookings} />
    </div>
  );
}

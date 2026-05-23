import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { formatCRC, formatTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scissors, CreditCard, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import type { BookingRecord, PaymentRecord } from "@/types";
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No asistió",
};
const STATUS_VARIANTS: Record<string, "default" | "success" | "destructive" | "warning"> = {
  confirmed: "default",
  completed: "success",
  cancelled: "destructive",
  no_show: "warning",
};

export default async function DashboardPage() {
  const session = await auth();
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();

  const [bookingsRes, todayPaymentsRes, weekPaymentsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, service:services(*)")
      .gte("starts_at", todayStart)
      .lte("starts_at", todayEnd)
      .not("status", "eq", "cancelled")
      .order("starts_at"),
    supabase
      .from("payments")
      .select("amount_colones")
      .gte("paid_at", todayStart)
      .lte("paid_at", todayEnd),
    supabase
      .from("payments")
      .select("amount_colones")
      .gte("paid_at", weekStart)
      .lte("paid_at", weekEnd),
  ]);

  const todayBookings = (bookingsRes.data ?? []) as BookingRecord[];
  const todayIncome = ((todayPaymentsRes.data ?? []) as PaymentRecord[]).reduce(
    (sum, p) => sum + p.amount_colones,
    0
  );
  const weekIncome = ((weekPaymentsRes.data ?? []) as PaymentRecord[]).reduce(
    (sum, p) => sum + p.amount_colones,
    0
  );

  const nextBooking = todayBookings.find(
    (b) => new Date(b.starts_at) > now && b.status === "confirmed"
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Buenos días 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Intl.DateTimeFormat("es-CR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }).format(now)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Scissors className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Citas hoy</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{todayBookings.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground font-medium">Ingresos hoy</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCRC(todayIncome)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground font-medium">Esta semana</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCRC(weekIncome)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground font-medium">Próxima cita</span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {nextBooking ? formatTime(nextBooking.starts_at) : "Libre"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Agenda de hoy</CardTitle>
            <Link href="/bookings" className="text-sm text-primary font-medium hover:underline">
              Ver todas
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {todayBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Scissors className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay citas programadas para hoy</p>
              <Link href="/" className="text-primary text-sm font-medium mt-2 inline-block hover:underline">
                Agendar cita
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBookings.map((booking) => (
                <Link key={booking.id} href={`/bookings/${booking.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div className="text-center min-w-[48px]">
                      <p className="text-sm font-bold text-primary">{formatTime(booking.starts_at)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{booking.client_name}</p>
                      <p className="text-xs text-muted-foreground">{booking.service?.name}</p>
                    </div>
                    <Badge variant={STATUS_VARIANTS[booking.status] ?? "secondary"}>
                      {STATUS_LABELS[booking.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { getSupabaseAdmin } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scissors, Phone } from "lucide-react";
import Link from "next/link";
import type { BookingRecord } from "@/types";

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

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("bookings")
    .select("*, service:services(*)")
    .order("starts_at", { ascending: false })
    .limit(100);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data } = await query;
  const bookings = (data ?? []) as BookingRecord[];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Citas</h1>
        <Link
          href="/"
          className="text-sm bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          + Nueva cita
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        {[
          { value: "all", label: "Todas" },
          { value: "confirmed", label: "Confirmadas" },
          { value: "completed", label: "Completadas" },
          { value: "cancelled", label: "Canceladas" },
          { value: "no_show", label: "No asistió" },
        ].map(({ value, label }) => (
          <Link
            key={value}
            href={value === "all" ? "/bookings" : `/bookings?status=${value}`}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              (status ?? "all") === value
                ? "bg-primary text-white"
                : "bg-white border border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              <Scissors className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No hay citas con ese filtro</p>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Link key={booking.id} href={`/bookings/${booking.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{booking.client_name}</p>
                        <Badge variant={STATUS_VARIANTS[booking.status] ?? "secondary"}>
                          {STATUS_LABELS[booking.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {booking.service?.name ?? "Sin servicio"} · {formatDateTime(booking.starts_at)}
                      </p>
                      {booking.client_phone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{booking.client_phone}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-foreground">
                        {booking.service?.price_colones
                          ? new Intl.NumberFormat("es-CR", {
                              style: "currency",
                              currency: "CRC",
                              minimumFractionDigits: 0,
                            }).format(booking.service.price_colones)
                          : ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {booking.service?.duration_min}min
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

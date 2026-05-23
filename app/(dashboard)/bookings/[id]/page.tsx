import { getSupabaseAdmin } from "@/lib/supabase";
import { formatDateTime, formatCRC } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import type { BookingRecord } from "@/types";
import { BookingActions } from "./booking-actions";
import { Phone, Mail, Clock, Calendar, FileText, Scissors } from "lucide-react";

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

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("bookings")
    .select("*, service:services(*)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const booking = data as BookingRecord;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Scissors className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{booking.client_name}</h1>
          <Badge variant={STATUS_VARIANTS[booking.status] ?? "secondary"}>
            {STATUS_LABELS[booking.status]}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la cita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{formatDateTime(booking.starts_at)}</p>
                <p className="text-xs text-muted-foreground">Inicio</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {booking.service?.duration_min ?? "?"} minutos
                </p>
                <p className="text-xs text-muted-foreground">Duración</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Scissors className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {booking.service?.name ?? "Sin especificar"}
                </p>
                {booking.service?.price_colones && (
                  <p className="text-xs text-muted-foreground">
                    {formatCRC(booking.service.price_colones)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {booking.client_phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`tel:${booking.client_phone}`} className="text-sm text-primary hover:underline">
                  {booking.client_phone}
                </a>
              </div>
            )}
            {booking.client_email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`mailto:${booking.client_email}`} className="text-sm text-primary hover:underline">
                  {booking.client_email}
                </a>
              </div>
            )}
            {!booking.client_phone && !booking.client_email && (
              <p className="text-sm text-muted-foreground">Sin información de contacto</p>
            )}
          </CardContent>
        </Card>

        {booking.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{booking.notes}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <BookingActions bookingId={booking.id} currentStatus={booking.status} googleEventId={booking.google_event_id} />
      </div>
    </div>
  );
}

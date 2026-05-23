import { getSupabaseAdmin } from "@/lib/supabase";
import type { ServiceRecord } from "@/types";
import { BookingForm } from "./booking-form";
import { Scissors } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicBookingPage() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("name");

  const services = (data ?? []) as ServiceRecord[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Scissors className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-foreground">Camarón Barber</p>
            <p className="text-xs text-muted-foreground">Reserva tu cita</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Agenda tu cita</h1>
          <p className="text-muted-foreground">
            Selecciona el servicio, elige tu horario y listo. Te confirmamos por WhatsApp.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-white rounded-xl border border-border">
            <Scissors className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No hay servicios disponibles</p>
            <p className="text-sm mt-1">Vuelve pronto</p>
          </div>
        ) : (
          <BookingForm services={services} />
        )}
      </main>
    </div>
  );
}

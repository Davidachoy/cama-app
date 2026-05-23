import { getSupabaseAdmin } from "@/lib/supabase";
import { formatCRC } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Clock } from "lucide-react";
import type { ServiceRecord } from "@/types";
import { ServiceForm } from "./service-form";
import { ServiceActions } from "./service-actions";

export default async function ServicesPage() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("services").select("*").order("name");
  const services = (data ?? []) as ServiceRecord[];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Servicios</h1>
        <ServiceForm />
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Wrench className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tienes servicios configurados</p>
            <p className="text-xs mt-1">Agrega los servicios que ofreces para que los clientes puedan reservar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {services.map((service) => (
            <Card key={service.id} className={!service.is_active ? "opacity-50" : ""}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{service.name}</p>
                    {!service.is_active && (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm font-medium text-success">{formatCRC(service.price_colones)}</p>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <p className="text-sm">{service.duration_min} min</p>
                    </div>
                  </div>
                </div>
                <ServiceActions service={service} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

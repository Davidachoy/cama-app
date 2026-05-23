"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { ServiceForm } from "./service-form";
import type { ServiceRecord } from "@/types";
import { Trash2 } from "lucide-react";

export function ServiceActions({ service }: { service: ServiceRecord }) {
  const router = useRouter();
  const { addToast } = useToast();

  async function deleteService() {
    if (!confirm(`¿Eliminar el servicio "${service.name}"?`)) return;
    try {
      const res = await fetch(`/api/services/${service.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      addToast("Servicio eliminado", "success");
      router.refresh();
    } catch {
      addToast("Error al eliminar el servicio", "error");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <ServiceForm service={service} />
      <button
        onClick={deleteService}
        className="text-muted-foreground hover:text-destructive transition-colors p-1"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

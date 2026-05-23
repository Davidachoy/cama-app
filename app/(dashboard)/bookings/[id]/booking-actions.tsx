"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CheckCircle, XCircle, AlertCircle, Trash2 } from "lucide-react";
import type { BookingStatus } from "@/types";

export function BookingActions({
  bookingId,
  currentStatus,
  googleEventId,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
  googleEventId: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  async function updateStatus(status: BookingStatus) {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, googleEventId }),
      });
      if (!res.ok) throw new Error();
      addToast("Estado actualizado", "success");
      router.refresh();
    } catch {
      addToast("Error al actualizar la cita", "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteBooking() {
    if (!confirm("¿Eliminar esta cita permanentemente?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleEventId }),
      });
      if (!res.ok) throw new Error();
      addToast("Cita eliminada", "success");
      router.push("/bookings");
    } catch {
      addToast("Error al eliminar la cita", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {currentStatus === "confirmed" && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="success"
            onClick={() => updateStatus("completed")}
            disabled={loading}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Completar
          </Button>
          <Button
            variant="outline"
            onClick={() => updateStatus("no_show")}
            disabled={loading}
            className="gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            No asistió
          </Button>
        </div>
      )}

      {currentStatus === "confirmed" && (
        <Button
          variant="destructive"
          onClick={() => updateStatus("cancelled")}
          disabled={loading}
          className="w-full gap-2"
        >
          <XCircle className="h-4 w-4" />
          Cancelar cita
        </Button>
      )}

      <Button
        variant="ghost"
        onClick={deleteBooking}
        disabled={loading}
        className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
        Eliminar permanentemente
      </Button>
    </div>
  );
}

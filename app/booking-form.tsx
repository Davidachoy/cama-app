"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { formatCRC } from "@/lib/utils";
import type { ServiceRecord } from "@/types";
import { CheckCircle, Clock, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "service" | "datetime" | "info" | "success";

const SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00",
];

export function BookingForm({ services }: { services: ServiceRecord[] }) {
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");

  function getMinDate() {
    const d = new Date();
    d.setDate(d.getDate() + 0);
    return d.toISOString().split("T")[0];
  }

  async function handleSubmit() {
    if (!service || !date || !slot || !name) return;
    setLoading(true);
    try {
      const startsAt = new Date(`${date}T${slot}:00`);
      const endsAt = new Date(startsAt.getTime() + service.duration_min * 60000);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: name,
          client_phone: phone || null,
          client_email: email || null,
          service_id: service.id,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          notes: notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookingId(data.id);
      setStep("success");
    } catch (e) {
      alert("Error al reservar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">¡Cita confirmada!</h2>
          <p className="text-muted-foreground mb-4">
            Tu cita para <strong>{service?.name}</strong> el <strong>{date}</strong> a las{" "}
            <strong>{slot}</strong> ha sido reservada.
          </p>
          <p className="text-sm text-muted-foreground">
            Pronto te contactamos para confirmar. Si necesitas cancelar, escríbenos.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              setStep("service");
              setService(null);
              setDate("");
              setSlot("");
              setName("");
              setPhone("");
              setEmail("");
              setNotes("");
            }}
          >
            Hacer otra reserva
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {(["service", "datetime", "info"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                step === s || (step === "info" && i < 2) || (step === "datetime" && i < 1)
                  ? "bg-primary text-white"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {i + 1}
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">
              {s === "service" ? "Servicio" : s === "datetime" ? "Horario" : "Tus datos"}
            </span>
            {i < 2 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Service */}
      {step === "service" && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">¿Qué servicio necesitas?</h2>
          <div className="grid gap-3">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setService(s);
                  setStep("datetime");
                }}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-primary hover:shadow-sm transition-all text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Scissors className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-sm text-success font-medium">{formatCRC(s.price_colones)}</p>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <p className="text-sm">{s.duration_min} min</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === "datetime" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setStep("service")} className="text-sm text-primary hover:underline">
              ← Cambiar servicio
            </button>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-sm text-muted-foreground">{service?.name}</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Elige fecha y hora</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Fecha</Label>
              <Input
                type="date"
                min={getMinDate()}
                value={date}
                onChange={(e) => { setDate(e.target.value); setSlot(""); }}
                className="bg-white"
              />
            </div>
            {date && (
              <div className="space-y-2">
                <Label>Horario disponible</Label>
                <div className="grid grid-cols-3 gap-2">
                  {SLOTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSlot(s)}
                      className={cn(
                        "py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors",
                        slot === s
                          ? "bg-primary text-white border-primary"
                          : "bg-white border-border hover:border-primary hover:bg-primary/5"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {slot && (
              <Button onClick={() => setStep("info")} className="w-full">
                Continuar →
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Client info */}
      {step === "info" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setStep("datetime")} className="text-sm text-primary hover:underline">
              ← Cambiar horario
            </button>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-sm text-muted-foreground">
              {date} a las {slot}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Tus datos</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono / WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="8888-8888"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Algo que el barbero deba saber..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-white"
                rows={2}
              />
            </div>

            <Card className="bg-secondary border-none">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-foreground mb-2">Resumen de tu cita</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Servicio: <span className="text-foreground font-medium">{service?.name}</span></p>
                  <p>Fecha: <span className="text-foreground font-medium">{date}</span></p>
                  <p>Hora: <span className="text-foreground font-medium">{slot}</span></p>
                  <p>Precio: <span className="text-success font-medium">{formatCRC(service?.price_colones ?? 0)}</span></p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSubmit}
              disabled={!name || loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Reservando..." : "Confirmar reserva"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

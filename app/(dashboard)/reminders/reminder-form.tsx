"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Plus, Calendar } from "lucide-react";

export function ReminderForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [addToCalendar, setAddToCalendar] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !remindAt) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, remind_at: new Date(remindAt).toISOString(), add_to_calendar: addToCalendar }),
      });
      if (!res.ok) throw new Error();
      addToast("Recordatorio creado", "success");
      setOpen(false);
      setTitle("");
      setDescription("");
      setRemindAt("");
      router.refresh();
    } catch {
      addToast("Error al crear el recordatorio", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nuevo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo recordatorio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ej: Comprar shampoo..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalles..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="remindAt">Fecha y hora</Label>
            <Input
              id="remindAt"
              type="datetime-local"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="addToCalendar"
              checked={addToCalendar}
              onCheckedChange={setAddToCalendar}
            />
            <Label htmlFor="addToCalendar" className="flex items-center gap-1.5 cursor-pointer">
              <Calendar className="h-4 w-4 text-primary" />
              Agregar a Google Calendar
            </Label>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Guardando..." : "Crear recordatorio"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

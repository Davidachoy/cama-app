"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";
import { Bell, Calendar, CheckCircle, Trash2 } from "lucide-react";
import type { ReminderRecord } from "@/types";
import { cn } from "@/lib/utils";

export function ReminderItem({ reminder }: { reminder: ReminderRecord }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const isOverdue = !reminder.is_completed && new Date(reminder.remind_at) < new Date();

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reminders/${reminder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !reminder.is_completed }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      addToast("Error al actualizar el recordatorio", "error");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm("¿Eliminar este recordatorio?")) return;
    setLoading(true);
    try {
      await fetch(`/api/reminders/${reminder.id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      addToast("Error al eliminar", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={cn(isOverdue && !reminder.is_completed && "border-destructive/50")}>
      <CardContent className="p-4 flex items-start gap-3">
        <button
          onClick={toggle}
          disabled={loading}
          className={cn(
            "mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
            reminder.is_completed
              ? "border-success bg-success text-white"
              : "border-border hover:border-primary"
          )}
        >
          {reminder.is_completed && <CheckCircle className="h-4 w-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-foreground text-sm", reminder.is_completed && "line-through text-muted-foreground")}>
            {reminder.title}
          </p>
          {reminder.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{reminder.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Bell className={cn("h-3 w-3", isOverdue ? "text-destructive" : "text-muted-foreground")} />
              <p className={cn("text-xs", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                {formatDateTime(reminder.remind_at)}
              </p>
            </div>
            {reminder.google_event_id && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-primary" />
                <p className="text-xs text-primary">En Calendar</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={remove}
          disabled={loading}
          className="text-muted-foreground hover:text-destructive transition-colors p-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
}

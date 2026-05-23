import { getSupabaseAdmin } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CheckCircle } from "lucide-react";
import type { ReminderRecord } from "@/types";
import { ReminderForm } from "./reminder-form";
import { ReminderItem } from "./reminder-item";

export default async function RemindersPage() {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("reminders")
    .select("*")
    .order("remind_at");

  const reminders = (data ?? []) as ReminderRecord[];
  const pending = reminders.filter((r) => !r.is_completed);
  const completed = reminders.filter((r) => r.is_completed);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Recordatorios</h1>
        <ReminderForm />
      </div>

      {pending.length === 0 && completed.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tienes recordatorios pendientes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Pendientes ({pending.length})
              </h2>
              <div className="space-y-2">
                {pending.map((r) => (
                  <ReminderItem key={r.id} reminder={r} />
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Completados
              </h2>
              <div className="space-y-2 opacity-60">
                {completed.map((r) => (
                  <ReminderItem key={r.id} reminder={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

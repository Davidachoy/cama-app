import { getSupabaseAdmin } from "@/lib/supabase";
import { formatCRC, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Banknote, ArrowRightLeft, Mail } from "lucide-react";
import Link from "next/link";
import type { PaymentRecord } from "@/types";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { AddPaymentButton } from "./add-payment-button";

const METHOD_LABELS: Record<string, string> = {
  sinpe: "SINPE Móvil",
  cash: "Efectivo",
  transfer: "Transferencia",
};
const METHOD_ICONS: Record<string, typeof Smartphone> = {
  sinpe: Smartphone,
  cash: Banknote,
  transfer: ArrowRightLeft,
};
const METHOD_VARIANTS: Record<string, "default" | "success" | "warning"> = {
  sinpe: "default",
  cash: "success",
  transfer: "warning",
};

export default async function PaymentsPage() {
  const supabase = getSupabaseAdmin();
  const now = new Date();

  const [paymentsRes, todayRes, weekRes, monthRes] = await Promise.all([
    supabase
      .from("payments")
      .select("*, booking:bookings(client_name, service:services(name))")
      .order("paid_at", { ascending: false })
      .limit(100),
    supabase
      .from("payments")
      .select("amount_colones")
      .gte("paid_at", startOfDay(now).toISOString())
      .lte("paid_at", endOfDay(now).toISOString()),
    supabase
      .from("payments")
      .select("amount_colones")
      .gte("paid_at", startOfWeek(now, { weekStartsOn: 1 }).toISOString())
      .lte("paid_at", endOfWeek(now, { weekStartsOn: 1 }).toISOString()),
    supabase
      .from("payments")
      .select("amount_colones")
      .gte("paid_at", startOfMonth(now).toISOString())
      .lte("paid_at", endOfMonth(now).toISOString()),
  ]);

  const payments = (paymentsRes.data ?? []) as PaymentRecord[];
  const sum = (arr: { amount_colones: number }[]) =>
    arr.reduce((s, p) => s + p.amount_colones, 0);

  const todayIncome = sum(todayRes.data ?? []);
  const weekIncome = sum(weekRes.data ?? []);
  const monthIncome = sum(monthRes.data ?? []);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pagos</h1>
        <div className="flex gap-2">
          <Link
            href="/payments/import"
            className="flex items-center gap-1.5 text-sm border border-border px-3 py-2 rounded-lg bg-white hover:bg-secondary font-medium transition-colors"
          >
            <Mail className="h-4 w-4" />
            Importar SINPE
          </Link>
          <AddPaymentButton />
        </div>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Hoy", amount: todayIncome },
          { label: "Esta semana", amount: weekIncome },
          { label: "Este mes", amount: monthIncome },
        ].map(({ label, amount }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCRC(amount)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment list */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay pagos registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {payments.map((payment) => {
                const Icon = METHOD_ICONS[payment.method] ?? CreditCard;
                return (
                  <div key={payment.id} className="flex items-center gap-3 py-3">
                    <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {(payment.booking as { client_name?: string })?.client_name ??
                          payment.notes ??
                          "Pago manual"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(payment.paid_at)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">{formatCRC(payment.amount_colones)}</p>
                      <div className="flex justify-end mt-0.5">
                        <Badge variant={METHOD_VARIANTS[payment.method] ?? "secondary"}>
                          {METHOD_LABELS[payment.method]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

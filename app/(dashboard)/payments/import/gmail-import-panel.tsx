"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { formatCRC } from "@/lib/utils";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import type { GmailPaymentCandidate } from "@/types";

const METHOD_LABELS: Record<string, string> = {
  sinpe: "SINPE Móvil",
  cash: "Efectivo",
  transfer: "Transferencia",
};

export function GmailImportPanel({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) {
  const [candidates, setCandidates] = useState<GmailPaymentCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  async function scan() {
    setScanning(true);
    setCandidates([]);
    setSelected(new Set());
    try {
      const res = await fetch("/api/gmail/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCandidates(data.candidates ?? []);
      if (data.candidates?.length === 0) {
        addToast("No se encontraron nuevos pagos en el correo", "info");
      }
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Error al escanear el correo", "error");
    } finally {
      setScanning(false);
    }
  }

  function toggleSelect(emailId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(emailId) ? next.delete(emailId) : next.add(emailId);
      return next;
    });
  }

  async function importSelected() {
    const toImport = candidates.filter((c) => selected.has(c.email_id));
    if (toImport.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/payments/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payments: toImport }),
      });
      if (!res.ok) throw new Error();
      addToast(`${toImport.length} pagos importados`, "success");
      router.push("/payments");
    } catch {
      addToast("Error al importar los pagos", "error");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button onClick={scan} disabled={scanning} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Escaneando..." : "Escanear Gmail"}
        </Button>
        {candidates.length > 0 && (
          <Button
            variant="success"
            onClick={importSelected}
            disabled={importing || selected.size === 0}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Importar ({selected.size})
          </Button>
        )}
      </div>

      {candidates.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">
            {candidates.length} pago(s) encontrado(s) — selecciona los que quieres importar:
          </p>
          {candidates.map((c) => (
            <Card
              key={c.email_id}
              className={`cursor-pointer transition-colors ${
                selected.has(c.email_id) ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => toggleSelect(c.email_id)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div
                  className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected.has(c.email_id)
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                >
                  {selected.has(c.email_id) && (
                    <CheckCircle className="h-3 w-3 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{formatCRC(c.amount_colones)}</p>
                    <Badge variant="default">{METHOD_LABELS[c.method]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.subject}</p>
                  <p className="text-xs text-muted-foreground">{c.from}</p>
                  <p className="text-xs text-muted-foreground">{new Date(c.date).toLocaleString("es-CR")}</p>
                  <p className="text-xs text-muted-foreground mt-1 italic truncate">{c.raw_snippet}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!scanning && candidates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Presiona &quot;Escanear Gmail&quot; para buscar pagos</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { auth } from "@/auth";
import { GmailImportPanel } from "./gmail-import-panel";

export default async function PaymentsImportPage() {
  const session = await auth();

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-2">Importar pagos de Gmail</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Detectamos automáticamente los correos de SINPE Móvil y transferencias en tu Gmail. Revisa y confirma los que quieres agregar.
      </p>
      <GmailImportPanel accessToken={session!.accessToken} refreshToken={session!.refreshToken} />
    </div>
  );
}

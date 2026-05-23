import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, User } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  const hasCalendarAccess = !!session?.accessToken;
  const hasGmailAccess = !!session?.accessToken;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Ajustes</h1>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <Badge variant="success">Activo</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Google Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Sincronización de citas</p>
                <p className="text-xs text-muted-foreground">
                  Las citas se agregan automáticamente a tu Google Calendar
                </p>
              </div>
              <Badge variant={hasCalendarAccess ? "success" : "destructive"}>
                {hasCalendarAccess ? "Conectado" : "Sin acceso"}
              </Badge>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Sincronización con iPhone:</strong> En tu iPhone, ve a{" "}
                <em>Configuración → Correo → Cuentas → Agregar cuenta → Google</em> y activa el
                Calendario. Todas las citas aparecerán automáticamente.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-accent" />
              Gmail — Importación de SINPE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Lectura de correos de pago</p>
                <p className="text-xs text-muted-foreground">
                  Detecta automáticamente notificaciones de SINPE Móvil y transferencias
                </p>
              </div>
              <Badge variant={hasGmailAccess ? "success" : "destructive"}>
                {hasGmailAccess ? "Conectado" : "Sin acceso"}
              </Badge>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">
                💡 El acceso a Gmail es de <strong>solo lectura</strong>. Solo se leen los correos
                de notificaciones de pago, nunca se modifica ni elimina nada de tu cuenta.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instalar como app en iPhone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-secondary p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Pasos para instalar:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-4">
                <li>Abre esta página en Safari en tu iPhone</li>
                <li>Toca el botón de compartir (cuadrado con flecha ↑)</li>
                <li>Selecciona &quot;Añadir a pantalla de inicio&quot;</li>
                <li>Toca &quot;Añadir&quot;</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                La app aparecerá en tu pantalla de inicio y se abrirá en pantalla completa.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

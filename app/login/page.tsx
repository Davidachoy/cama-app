import { Scissors } from "lucide-react";
import { SignInButton } from "./sign-in-button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-border shadow-xl p-8 text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
            <Scissors className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">Camarón Barber</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Ingresa con tu cuenta de Google para acceder al panel
          </p>

          <SignInButton />

          <p className="text-xs text-muted-foreground mt-6">
            Solo el barbero tiene acceso a este panel
          </p>
        </div>
      </div>
    </div>
  );
}

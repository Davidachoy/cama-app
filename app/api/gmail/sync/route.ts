import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchPaymentEmails } from "@/lib/gmail";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!session.accessToken || !session.refreshToken) {
    return NextResponse.json({ error: "Gmail no está conectado" }, { status: 400 });
  }

  try {
    const { candidates, historyId } = await fetchPaymentEmails(
      session.accessToken,
      session.refreshToken
    );
    return NextResponse.json({ candidates, historyId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al acceder a Gmail";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

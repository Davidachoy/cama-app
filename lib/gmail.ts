import { google } from "googleapis";
import type { GmailPaymentCandidate, PaymentMethod } from "@/types";

export function getGmailClient(accessToken: string, refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

const SINPE_PATTERNS = [
  /recib(?:ió|iste)\s*₡\s*([\d,.]+)/i,
  /SINPE[^₡]*₡\s*([\d,.]+)/i,
  /transferencia[^₡]*₡\s*([\d,.]+)/i,
  /monto[^₡]*₡\s*([\d,.]+)/i,
  /₡\s*([\d,.]+)/,
];

function parseAmount(text: string): number | null {
  for (const pattern of SINPE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const raw = match[1].replace(/\./g, "").replace(/,/g, "");
      const amount = parseInt(raw, 10);
      if (!isNaN(amount) && amount > 0) return amount;
    }
  }
  return null;
}

function detectMethod(subject: string, from: string): PaymentMethod {
  const text = `${subject} ${from}`.toLowerCase();
  if (text.includes("sinpe") || text.includes("transferencia")) return "sinpe";
  return "transfer";
}

function decodeBase64(encoded: string): string {
  return Buffer.from(encoded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

export async function fetchPaymentEmails(
  accessToken: string,
  refreshToken: string,
  startHistoryId?: string
): Promise<{ candidates: GmailPaymentCandidate[]; historyId: string }> {
  const gmail = getGmailClient(accessToken, refreshToken);

  const query = 'subject:"SINPE Móvil" OR subject:"transferencia" OR subject:"pago recibido" in:inbox';
  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 50,
  });

  const messages = listRes.data.messages ?? [];
  const candidates: GmailPaymentCandidate[] = [];

  for (const msg of messages) {
    if (!msg.id) continue;

    const fullMsg = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "full",
    });

    const headers = fullMsg.data.payload?.headers ?? [];
    const subject = headers.find((h) => h.name === "Subject")?.value ?? "";
    const from = headers.find((h) => h.name === "From")?.value ?? "";
    const dateHeader = headers.find((h) => h.name === "Date")?.value ?? "";

    let bodyText = fullMsg.data.snippet ?? "";
    const parts = fullMsg.data.payload?.parts ?? [];
    for (const part of parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        bodyText = decodeBase64(part.body.data);
        break;
      }
    }

    const amount = parseAmount(`${subject} ${bodyText}`);
    if (!amount) continue;

    candidates.push({
      email_id: msg.id,
      subject,
      from,
      date: new Date(dateHeader).toISOString(),
      amount_colones: amount,
      method: detectMethod(subject, from),
      raw_snippet: fullMsg.data.snippet ?? "",
    });
  }

  const historyRes = await gmail.users.getProfile({ userId: "me" });
  const historyId = historyRes.data.historyId ?? "0";

  return { candidates, historyId };
}

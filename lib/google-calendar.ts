import { google } from "googleapis";

export function getCalendarClient(accessToken: string, refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function createCalendarEvent(
  accessToken: string,
  refreshToken: string,
  event: {
    summary: string;
    description?: string;
    startTime: string;
    endTime: string;
    reminderMinutes?: number[];
  }
) {
  const calendar = getCalendarClient(accessToken, refreshToken);

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startTime, timeZone: "America/Costa_Rica" },
      end: { dateTime: event.endTime, timeZone: "America/Costa_Rica" },
      reminders: {
        useDefault: false,
        overrides: (event.reminderMinutes ?? [30, 10]).map((minutes) => ({
          method: "popup",
          minutes,
        })),
      },
    },
  });

  return response.data.id;
}

export async function deleteCalendarEvent(
  accessToken: string,
  refreshToken: string,
  eventId: string
) {
  const calendar = getCalendarClient(accessToken, refreshToken);
  await calendar.events.delete({ calendarId: "primary", eventId });
}

export async function createReminderEvent(
  accessToken: string,
  refreshToken: string,
  reminder: { title: string; description?: string; remindAt: string }
) {
  const calendar = getCalendarClient(accessToken, refreshToken);
  const dt = new Date(reminder.remindAt);
  const end = new Date(dt.getTime() + 30 * 60 * 1000);

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: `⏰ ${reminder.title}`,
      description: reminder.description,
      start: { dateTime: dt.toISOString(), timeZone: "America/Costa_Rica" },
      end: { dateTime: end.toISOString(), timeZone: "America/Costa_Rica" },
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 0 }],
      },
    },
  });

  return response.data.id;
}

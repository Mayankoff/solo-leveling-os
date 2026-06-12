"use server";

import { google } from "googleapis";
import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/google/callback`
);

export async function getGoogleAuthUrl() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly"
    ],
    state: clerkUser.id, // Pass user ID through state to map it back in callback
    prompt: "consent", // Force to get refresh token
  });
  
  return url;
}

export async function checkGoogleConnection() {
  const clerkUser = await currentUser();
  if (!clerkUser) return false;

  const integration = await db.googleIntegration.findUnique({
    where: { userId: clerkUser.id }
  });

  return !!integration;
}

export async function disconnectGoogleCalendar() {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  await db.googleIntegration.delete({
    where: { userId: clerkUser.id }
  });
}

// Internal helper to get authorized calendar client
async function getCalendarClient(userId: string) {
  const integration = await db.googleIntegration.findUnique({
    where: { userId }
  });

  if (!integration) throw new Error("Google Calendar not connected");

  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
    expiry_date: Number(integration.expiryDate),
  });

  // Check if token is expired (minus 5 mins buffer)
  if (Date.now() > Number(integration.expiryDate) - 300000) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await db.googleIntegration.update({
      where: { userId },
      data: {
        accessToken: credentials.access_token!,
        expiryDate: credentials.expiry_date!,
      }
    });
    oauth2Client.setCredentials(credentials);
  }

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function createGoogleEvent(userId: string, event: {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  timeZone: string;
  recurrence?: string[];
}) {
  try {
    const calendar = await getCalendarClient(userId);
    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start.toISOString(), timeZone: event.timeZone },
        end: { dateTime: event.end.toISOString(), timeZone: event.timeZone },
        recurrence: event.recurrence,
      }
    });
    return res.data.id; // googleEventId
  } catch (error) {
    console.error("Failed to create Google Event:", error);
    return null;
  }
}

export async function updateGoogleEvent(userId: string, googleEventId: string, event: {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  timeZone: string;
  recurrence?: string[];
}) {
  try {
    const calendar = await getCalendarClient(userId);
    await calendar.events.update({
      calendarId: "primary",
      eventId: googleEventId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start.toISOString(), timeZone: event.timeZone },
        end: { dateTime: event.end.toISOString(), timeZone: event.timeZone },
        recurrence: event.recurrence,
      }
    });
    return true;
  } catch (error) {
    console.error("Failed to update Google Event:", error);
    return false;
  }
}

export async function deleteGoogleEvent(userId: string, googleEventId: string) {
  try {
    const calendar = await getCalendarClient(userId);
    await calendar.events.delete({
      calendarId: "primary",
      eventId: googleEventId,
    });
    return true;
  } catch (error) {
    console.error("Failed to delete Google Event:", error);
    return false;
  }
}

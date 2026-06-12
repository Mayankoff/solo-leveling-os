"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { createGoogleEvent, updateGoogleEvent, deleteGoogleEvent, checkGoogleConnection } from "./google-calendar";

export async function pushToGoogleCalendar(
  entityType: string, 
  entityId: string, 
  eventDetails: {
    summary: string;
    description?: string;
    start: Date;
    end: Date;
    timeZone: string;
    recurrence?: string[];
  }
) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const isConnected = await checkGoogleConnection();
  if (!isConnected) return;

  const existingSync = await db.syncedEvent.findUnique({
    where: {
      entityType_entityId: {
        entityType,
        entityId
      }
    }
  });

  if (existingSync) {
    // Update existing event
    const success = await updateGoogleEvent(clerkUser.id, existingSync.googleEventId, eventDetails);
    if (success) {
      await db.syncedEvent.update({
        where: { id: existingSync.id },
        data: { lastSynced: new Date() }
      });
    }
  } else {
    // Create new event
    const googleEventId = await createGoogleEvent(clerkUser.id, eventDetails);
    if (googleEventId) {
      await db.syncedEvent.create({
        data: {
          userId: clerkUser.id,
          entityType,
          entityId,
          googleEventId
        }
      });
    }
  }
}

export async function removeFromGoogleCalendar(entityType: string, entityId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const existingSync = await db.syncedEvent.findUnique({
    where: {
      entityType_entityId: {
        entityType,
        entityId
      }
    }
  });

  if (existingSync) {
    await deleteGoogleEvent(clerkUser.id, existingSync.googleEventId);
    await db.syncedEvent.delete({ where: { id: existingSync.id } });
  }
}

// Optional: function to pull updates down from Google. Since it requires fetching the API for each event, we can do it lazily or on specific pages.
export async function syncDownFromGoogle() {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  // In a production app with Webhooks, Google tells us what changed.
  // In localhost, we'd have to list all `syncedEvents` and query Google. 
  // For now, the implementation will rely on the UI 'Sync' button to trigger a visual sync.
  return { status: "Sync triggered" };
}

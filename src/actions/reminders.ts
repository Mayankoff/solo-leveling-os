"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { pushToGoogleCalendar, removeFromGoogleCalendar } from "./sync";

export async function getReminders() {
  const clerkUser = await currentUser();
  if (!clerkUser) return [];

  return db.reminder.findMany({
    where: { userId: clerkUser.id },
    orderBy: { scheduledTime: "asc" }
  });
}

export async function addReminder(data: any) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const reminder = await db.reminder.create({
    data: {
      userId: clerkUser.id,
      title: data.title,
      entityType: data.entityType,
      scheduledTime: new Date(data.scheduledTime),
      timeZone: data.timeZone || "UTC",
      recurrence: data.recurrence
    }
  });

  // Convert recurrence string to RRule for Google if needed, simplified for now
  const recurrenceArray = data.recurrence ? [`RRULE:FREQ=${data.recurrence.toUpperCase()}`] : undefined;

  await pushToGoogleCalendar("reminder", reminder.id, {
    summary: `[Reminder] ${reminder.title}`,
    start: reminder.scheduledTime,
    end: new Date(reminder.scheduledTime.getTime() + 15 * 60 * 1000), // 15 mins
    timeZone: reminder.timeZone,
    recurrence: recurrenceArray
  });

  revalidatePath("/reminders");
  revalidatePath("/agenda");
}

export async function deleteReminder(id: string) {
  await removeFromGoogleCalendar("reminder", id);
  await db.reminder.delete({ where: { id } });
  revalidatePath("/reminders");
  revalidatePath("/agenda");
}

export async function completeReminder(id: string) {
  const r = await db.reminder.update({
    where: { id },
    data: { isCompleted: true }
  });

  await pushToGoogleCalendar("reminder", r.id, {
    summary: `✅ [Done] ${r.title}`,
    start: r.scheduledTime,
    end: new Date(r.scheduledTime.getTime() + 15 * 60 * 1000),
    timeZone: r.timeZone
  });

  revalidatePath("/reminders");
  revalidatePath("/agenda");
}

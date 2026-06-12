"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { awardXP } from "./gamification";
import { revalidatePath } from "next/cache";
import { getUserTimezone } from "./settings";
import { getLocalMidnightDate } from "@/lib/date-utils";
import { pushToGoogleCalendar } from "./sync";

export async function getSkincareData() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);

  const [steps, morningLog, eveningLog, conditions] = await Promise.all([
    db.skinCareRoutineStep.findMany({
      where: { userId: clerkUser.id },
      orderBy: { order: "asc" }
    }),
    db.skinCareLog.findUnique({
      where: { userId_date_routineType: { userId: clerkUser.id, date, routineType: "morning" } }
    }),
    db.skinCareLog.findUnique({
      where: { userId_date_routineType: { userId: clerkUser.id, date, routineType: "evening" } }
    }),
    db.skinConditionLog.findMany({
      where: { userId: clerkUser.id },
      orderBy: { date: "desc" },
      take: 10
    })
  ]);

  return { steps, morningLog, eveningLog, conditions };
}

export async function addRoutineStep(routineType: string, name: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  await db.skinCareRoutineStep.create({
    data: {
      userId: clerkUser.id,
      routineType,
      name,
      order: 0
    }
  });
  revalidatePath("/skincare");
}

export async function removeRoutineStep(id: string) {
  await db.skinCareRoutineStep.delete({ where: { id } });
  revalidatePath("/skincare");
}

export async function toggleStep(routineType: string, stepId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);

  let log = await db.skinCareLog.findUnique({
    where: { userId_date_routineType: { userId: clerkUser.id, date, routineType } }
  });

  if (!log) {
    log = await db.skinCareLog.create({
      data: {
        userId: clerkUser.id,
        date,
        timeZone,
        routineType,
        status: "partial",
        completedSteps: JSON.stringify([stepId]),
        xpEarned: 5
      }
    });
    await awardXP(5, "skincare_step", "Completed a skincare step");
  } else {
    let completedSteps = JSON.parse(log.completedSteps || "[]");
    
    if (completedSteps.includes(stepId)) {
      completedSteps = completedSteps.filter((id: string) => id !== stepId);
      // Optional: deduct XP if we want strictness, but we usually just track earned
    } else {
      completedSteps.push(stepId);
      const updatedLog = await db.skinCareLog.update({
        where: { id: log.id },
        data: { 
          completedSteps: JSON.stringify(completedSteps),
          xpEarned: { increment: 5 }
        }
      });
      await awardXP(5, "skincare_step", "Completed a skincare step");
      
      // Check if this completes the whole routine
      const allSteps = await db.skinCareRoutineStep.findMany({ where: { userId: clerkUser.id, routineType } });
      if (completedSteps.length === allSteps.length && updatedLog.status !== "completed") {
        await completeRoutine(routineType);
      }
      return; // return early so we don't double update
    }

    await db.skinCareLog.update({
      where: { id: log.id },
      data: { completedSteps: JSON.stringify(completedSteps) }
    });
  }

  revalidatePath("/skincare");
}

export async function completeRoutine(routineType: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);
  const completionTime = new Date();

  const log = await db.skinCareLog.findUnique({
    where: { userId_date_routineType: { userId: clerkUser.id, date, routineType } }
  });

  if (log && log.status !== "completed") {
    const updatedLog = await db.skinCareLog.update({
      where: { id: log.id },
      data: { 
        status: "completed",
        completionTime,
        xpEarned: { increment: 25 }
      }
    });
    await awardXP(25, "skincare_routine", `Completed ${routineType} skincare routine!`);

    // Sync to Google Calendar so user sees it in their agenda
    const start = new Date(completionTime.getTime() - 15 * 60 * 1000); // Assume it took 15 mins
    await pushToGoogleCalendar("skincare", updatedLog.id, {
      summary: `✨ [Completed] ${routineType === "morning" ? "Morning" : "Night"} Skincare`,
      description: "Routine logged via SoloLevelingOS.",
      start,
      end: completionTime,
      timeZone
    });
  }
  revalidatePath("/skincare");
}

export async function addConditionLog(notes: string, photoUrl?: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);

  let condition = await db.skinConditionLog.findUnique({
    where: { userId_date: { userId: clerkUser.id, date } }
  });

  if (condition) {
    await db.skinConditionLog.update({
      where: { id: condition.id },
      data: { notes, photoUrl: photoUrl || condition.photoUrl }
    });
  } else {
    await db.skinConditionLog.create({
      data: {
        userId: clerkUser.id,
        date,
        timeZone,
        notes,
        photoUrl
      }
    });
  }

  await awardXP(10, "skincare_log", "Logged skin condition");
  revalidatePath("/skincare");
}

export async function getSkincareHistory() {
  const clerkUser = await currentUser();
  if (!clerkUser) return { logs: [], conditions: [] };

  const [logs, conditions] = await Promise.all([
    db.skinCareLog.findMany({
      where: { userId: clerkUser.id },
      orderBy: { date: "desc" }
    }),
    db.skinConditionLog.findMany({
      where: { userId: clerkUser.id },
      orderBy: { date: "desc" }
    })
  ]);

  return { logs, conditions };
}

export async function manualSyncSkincare(logId: string) {
  const log = await db.skinCareLog.findUnique({ where: { id: logId } });
  if (log) {
    const now = new Date();
    await pushToGoogleCalendar("skincare", log.id, {
      summary: `✨ [Manual] ${log.routineType.charAt(0).toUpperCase() + log.routineType.slice(1)} Skincare`,
      start: new Date(now.getTime() - 10 * 60 * 1000),
      end: now,
      timeZone: log.timeZone || "UTC"
    });
  }
}

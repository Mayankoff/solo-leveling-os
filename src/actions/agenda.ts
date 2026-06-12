"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { getUserTimezone } from "./settings";
import { getLocalMidnightDate } from "@/lib/date-utils";
import { checkGoogleConnection, getGoogleAuthUrl, disconnectGoogleCalendar } from "./google-calendar";

export async function getAgendaData() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);

  const [
    workouts,
    dietLog,
    supplements,
    studyTasks,
    studySessions,
    skincareMorning,
    skincareEvening,
    reminders,
    isGoogleConnected
  ] = await Promise.all([
    // Workouts
    db.workoutLog.findMany({ where: { userId: clerkUser.id, date }, include: { exercises: true } }),
    // Diet
    db.dietLog.findUnique({ where: { userId_date: { userId: clerkUser.id, date } }, include: { meals: true } }),
    // Supplements
    db.supplementIntake.findMany({ where: { userId: clerkUser.id, date } }),
    // Study
    db.studyTask.findMany({ 
      where: { 
        userId: clerkUser.id, 
        OR: [
          { deadline: { gte: date, lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) } },
          { completionTime: { gte: date, lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) } }
        ]
      } 
    }),
    db.studySession.findMany({ where: { userId: clerkUser.id, date } }),
    // Skincare
    db.skinCareLog.findUnique({ where: { userId_date_routineType: { userId: clerkUser.id, date, routineType: "morning" } } }),
    db.skinCareLog.findUnique({ where: { userId_date_routineType: { userId: clerkUser.id, date, routineType: "evening" } } }),
    // Reminders
    db.reminder.findMany({ 
      where: { 
        userId: clerkUser.id, 
        scheduledTime: { gte: date, lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) } 
      } 
    }),
    checkGoogleConnection()
  ]);

  let authUrl = null;
  if (!isGoogleConnected) {
    authUrl = await getGoogleAuthUrl();
  }

  return {
    workouts,
    dietLog,
    supplements,
    studyTasks,
    studySessions,
    skincareMorning,
    skincareEvening,
    reminders,
    isGoogleConnected,
    authUrl,
    timeZone,
    dateStr: date.toISOString().split('T')[0]
  };
}

export async function disconnectGoogle() {
  await disconnectGoogleCalendar();
}

"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { awardXP } from "./gamification";
import { revalidatePath } from "next/cache";
import { getUserTimezone } from "./settings";
import { getLocalMidnightDate } from "@/lib/date-utils";
import { pushToGoogleCalendar, removeFromGoogleCalendar } from "./sync";

export async function getDietData() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);

  const [settings, log, supplementTemplates, supplementIntakes] = await Promise.all([
    db.settings.findUnique({ where: { userId: clerkUser.id } }),
    db.dietLog.findUnique({
      where: { userId_date: { userId: clerkUser.id, date } },
      include: { meals: { orderBy: { time: "desc" } } }
    }),
    db.supplementTemplate.findMany({ where: { userId: clerkUser.id } }),
    db.supplementIntake.findMany({ where: { userId: clerkUser.id, date } })
  ]);

  if (!settings) return null;

  let currentLog = log;
  if (!currentLog) {
    currentLog = await db.dietLog.create({
      data: {
        userId: clerkUser.id,
        date,
        timeZone,
        targetCalories: settings.targetCalories || 2000,
        targetWater: settings.targetWater || 3000,
        waterIntake: 0
      },
      include: { meals: true }
    });
  }

  return { settings, log: currentLog, supplementTemplates, supplementIntakes };
}

export async function updateMacroSettings(data: any) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  await db.settings.upsert({
    where: { userId: clerkUser.id },
    create: {
      userId: clerkUser.id,
      targetCalories: data.calories,
      targetProtein: data.protein,
      targetCarbs: data.carbs,
      targetFat: data.fat
    },
    update: {
      targetCalories: data.calories,
      targetProtein: data.protein,
      targetCarbs: data.carbs,
      targetFat: data.fat
    }
  });
  revalidatePath("/diet");
}

export async function addMeal(data: any) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);

  let log = await db.dietLog.findUnique({
    where: { userId_date: { userId: clerkUser.id, date } }
  });

  const settings = await db.settings.findUnique({ where: { userId: clerkUser.id } });

  if (!log) {
    log = await db.dietLog.create({
      data: {
        userId: clerkUser.id,
        date,
        timeZone,
        targetCalories: settings?.targetCalories || 2000,
        targetWater: settings?.targetWater || 3000,
        consumedCalories: data.calories,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0
      }
    });
  } else {
    log = await db.dietLog.update({
      where: { id: log.id },
      data: {
        consumedCalories: { increment: data.calories },
        protein: { increment: data.protein || 0 },
        carbs: { increment: data.carbs || 0 },
        fat: { increment: data.fat || 0 }
      }
    });
  }

  const meal = await db.meal.create({
    data: {
      dietLogId: log.id,
      type: data.type,
      name: data.name,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat
    }
  });

  const now = new Date();
  await pushToGoogleCalendar("meal", meal.id, {
    summary: `🍽️ [${data.type}] ${data.name} (${data.calories} kcal)`,
    start: now,
    end: new Date(now.getTime() + 30 * 60 * 1000), // 30 min meal
    timeZone: timeZone || "UTC"
  });

  revalidatePath("/diet");
}

export async function removeMeal(mealId: string, logId: string) {
  const meal = await db.meal.findUnique({ where: { id: mealId } });
  if (!meal) return;

  await db.meal.delete({ where: { id: mealId } });
  await removeFromGoogleCalendar("meal", mealId);

  await db.dietLog.update({
    where: { id: logId },
    data: {
      consumedCalories: { decrement: meal.calories },
      protein: { decrement: meal.protein || 0 },
      carbs: { decrement: meal.carbs || 0 },
      fat: { decrement: meal.fat || 0 }
    }
  });

  revalidatePath("/diet");
}

export async function addWater(amountMl: number) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);

  let log = await db.dietLog.findUnique({
    where: { userId_date: { userId: clerkUser.id, date } }
  });

  if (!log) {
    const settings = await db.settings.findUnique({ where: { userId: clerkUser.id } });
    log = await db.dietLog.create({
      data: {
        userId: clerkUser.id,
        date,
        timeZone,
        targetCalories: settings?.targetCalories || 2000,
        targetWater: settings?.targetWater || 3000,
        waterIntake: amountMl
      }
    });
  } else {
    log = await db.dietLog.update({
      where: { id: log.id },
      data: { waterIntake: { increment: amountMl } }
    });
  }
  
  if (log.waterIntake >= log.targetWater && log.waterIntake - amountMl < log.targetWater) {
    await awardXP(5, "diet_water_goal", "Completed daily hydration goal!");
    
    const now = new Date();
    await pushToGoogleCalendar("water_goal", log.id, {
      summary: `💧 Hydration Goal Reached! (${log.targetWater / 1000}L)`,
      start: now,
      end: new Date(now.getTime() + 5 * 60 * 1000), // 5 min event
      timeZone: timeZone || "UTC"
    });
  }

  revalidatePath("/diet");
}

export async function updateWaterGoal(amountMl: number) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  await db.settings.update({
    where: { userId: clerkUser.id },
    data: { targetWater: amountMl }
  });

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);

  const log = await db.dietLog.findUnique({
    where: { userId_date: { userId: clerkUser.id, date } }
  });

  if (log) {
    await db.dietLog.update({
      where: { id: log.id },
      data: { targetWater: amountMl }
    });
  }
  
  revalidatePath("/diet");
}

export async function completeDietDay() {
  await awardXP(15, "diet_completion", "Completed a full day of food logging!");
  
  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);
  const clerkUser = await currentUser();
  if (clerkUser) {
    const log = await db.dietLog.findUnique({
      where: { userId_date: { userId: clerkUser.id, date } }
    });
    if (log) {
      const now = new Date();
      await pushToGoogleCalendar("diet_log", log.id, {
        summary: `🥗 Diet Log Completed (${log.consumedCalories} / ${log.targetCalories} kcal)`,
        start: new Date(now.getTime() - 15 * 60 * 1000),
        end: now,
        timeZone: timeZone || "UTC"
      });
    }
  }

  revalidatePath("/diet");
}

export async function getDietHistory() {
  const clerkUser = await currentUser();
  if (!clerkUser) return [];

  const logs = await db.dietLog.findMany({
    where: { userId: clerkUser.id },
    orderBy: { date: "desc" },
    include: { meals: true }
  });

  return logs;
}

export async function manualSyncDiet(logId: string) {
  const log = await db.dietLog.findUnique({ where: { id: logId } });
  if (log) {
    const now = new Date();
    await pushToGoogleCalendar("diet_log", log.id, {
      summary: `🥗 [Manual] Diet Log (${log.consumedCalories} / ${log.targetCalories} kcal)`,
      start: new Date(now.getTime() - 15 * 60 * 1000),
      end: now,
      timeZone: log.timeZone || "UTC"
    });
  }
}

"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { awardXP } from "./gamification";
import { revalidatePath } from "next/cache";
import { getUserTimezone } from "./settings";
import { getLocalMidnightDate } from "@/lib/date-utils";

export async function addSupplementTemplate(data: any) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  await db.supplementTemplate.create({
    data: {
      userId: clerkUser.id,
      name: data.name,
      category: data.category,
      dosage: data.dosage,
      unit: data.unit,
      frequency: data.frequency || "Daily",
      preferredTime: data.preferredTime || null,
      notes: data.notes || null,
    }
  });

  revalidatePath("/diet");
}

export async function deleteSupplementTemplate(id: string) {
  await db.supplementTemplate.delete({ where: { id } });
  revalidatePath("/diet");
}

export async function logSupplementIntake(templateId: string, status: string = "completed") {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);

  const template = await db.supplementTemplate.findUnique({ where: { id: templateId } });
  if (!template) return;

  // Check if already taken today
  const existing = await db.supplementIntake.findFirst({
    where: { userId: clerkUser.id, supplementId: templateId, date }
  });

  if (existing) {
    if (existing.status !== status) {
      await db.supplementIntake.update({
        where: { id: existing.id },
        data: { status }
      });
    }
  } else {
    await db.supplementIntake.create({
      data: {
        userId: clerkUser.id,
        supplementId: template.id,
        name: template.name,
        category: template.category,
        dosage: template.dosage,
        unit: template.unit,
        date,
        timeZone,
        status
      }
    });
  }

  // Check if all daily supplements are completed
  const [allTemplates, todayIntakes] = await Promise.all([
    db.supplementTemplate.findMany({ where: { userId: clerkUser.id, frequency: "Daily" } }),
    db.supplementIntake.findMany({ where: { userId: clerkUser.id, date, status: "completed" } })
  ]);

  if (allTemplates.length > 0) {
    const completedIds = new Set(todayIntakes.map(i => i.supplementId));
    const allCompleted = allTemplates.every(t => completedIds.has(t.id));

    if (allCompleted) {
      // Award XP for taking all supplements
      await awardXP(10, "diet_supplements", "Took all daily supplements!");
    }
  }

  revalidatePath("/diet");
}

export async function removeSupplementIntake(intakeId: string) {
  await db.supplementIntake.delete({ where: { id: intakeId } });
  revalidatePath("/diet");
}

export async function getSupplementHistory() {
  const clerkUser = await currentUser();
  if (!clerkUser) return [];

  return db.supplementIntake.findMany({
    where: { userId: clerkUser.id },
    orderBy: [{ date: "desc" }, { time: "desc" }]
  });
}

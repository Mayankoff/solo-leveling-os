"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { awardXP } from "./gamification";
import { revalidatePath } from "next/cache";
import { pushToGoogleCalendar, removeFromGoogleCalendar } from "./sync";
import { getUserTimezone } from "./settings";
import { getLocalMidnightDate } from "@/lib/date-utils";

export async function getStudyData() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const [tasks, sessions] = await Promise.all([
    db.studyTask.findMany({
      where: { userId: clerkUser.id, status: "pending" },
      orderBy: { deadline: "asc" }
    }),
    db.studySession.findMany({
      where: { userId: clerkUser.id },
      orderBy: { startTime: "desc" },
      take: 10
    })
  ]);

  return { tasks, sessions };
}

export async function addStudyTask(data: any) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const timeZone = await getUserTimezone();

  const task = await db.studyTask.create({
    data: {
      userId: clerkUser.id,
      subject: data.subject,
      title: data.title,
      description: data.description,
      priority: data.priority,
      deadline: data.deadline ? new Date(data.deadline) : null,
      status: "pending",
      timeZone
    }
  });

  if (task.deadline) {
    const end = new Date(task.deadline.getTime() + 60 * 60 * 1000); // 1 hour duration block
    await pushToGoogleCalendar("study_task", task.id, {
      summary: `[Task] ${task.title} - ${task.subject}`,
      description: task.description || "",
      start: task.deadline,
      end,
      timeZone
    });
  }

  revalidatePath("/study");
}

export async function updateStudyTask(id: string, data: any) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const task = await db.studyTask.update({
    where: { id },
    data: {
      subject: data.subject,
      title: data.title,
      description: data.description,
      priority: data.priority,
      deadline: data.deadline ? new Date(data.deadline) : null,
    }
  });

  if (task.deadline && task.status === "pending") {
    const end = new Date(task.deadline.getTime() + 60 * 60 * 1000);
    await pushToGoogleCalendar("study_task", task.id, {
      summary: `[Task] ${task.title} - ${task.subject}`,
      description: task.description || "",
      start: task.deadline,
      end,
      timeZone: task.timeZone
    });
  } else if (!task.deadline) {
    await removeFromGoogleCalendar("study_task", task.id);
  }

  revalidatePath("/study");
}

export async function completeStudyTask(id: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const timeZone = await getUserTimezone();
  const completionTime = new Date();

  const task = await db.studyTask.update({
    where: { id },
    data: { 
      status: "completed",
      completionTime,
      timeZone
    }
  });

  let xpEarned = 15;
  if (task.deadline && completionTime < task.deadline) {
    xpEarned = 30;
    await awardXP(xpEarned, "study_task_early", "Completed task before deadline!");
  } else {
    await awardXP(xpEarned, "study_task", "Completed a study task");
  }

  // Save xp earned in task record
  await db.studyTask.update({
    where: { id },
    data: { xpEarned }
  });

  // Update calendar to show it's completed
  if (task.deadline) {
    const end = new Date(task.deadline.getTime() + 60 * 60 * 1000);
    await pushToGoogleCalendar("study_task", task.id, {
      summary: `✅ [Completed] ${task.title} - ${task.subject}`,
      description: task.description || "",
      start: task.deadline,
      end,
      timeZone: task.timeZone
    });
  }

  revalidatePath("/study");
}

export async function deleteStudyTask(id: string) {
  await removeFromGoogleCalendar("study_task", id);
  await db.studyTask.delete({ where: { id } });
  revalidatePath("/study");
}

export async function logStudySession(data: { subject: string; topic: string; duration: number; notes?: string }) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);
  
  // Realistically, the user tracked it in the UI and just hit "Finish"
  // Start time is now - duration
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - data.duration * 60 * 1000);

  const xpEarned = Math.floor(data.duration / 2); // 1 XP per 2 minutes

  const session = await db.studySession.create({
    data: {
      userId: clerkUser.id,
      date,
      subject: data.subject,
      topic: data.topic,
      startTime,
      endTime,
      duration: data.duration,
      notes: data.notes,
      timeZone,
      xpEarned
    }
  });

  await pushToGoogleCalendar("study_session", session.id, {
    summary: `[Study] ${data.subject}: ${data.topic}`,
    description: data.notes || "",
    start: startTime,
    end: endTime,
    timeZone
  });

  await awardXP(xpEarned, "study_session", `Completed a ${data.duration} min study session`);
  revalidatePath("/study");
}

export async function getStudyHistory() {
  const clerkUser = await currentUser();
  if (!clerkUser) return { tasks: [], sessions: [] };

  const [tasks, sessions] = await Promise.all([
    db.studyTask.findMany({
      where: { userId: clerkUser.id, status: "completed" },
      orderBy: { completionTime: "desc" }
    }),
    db.studySession.findMany({
      where: { userId: clerkUser.id },
      orderBy: { startTime: "desc" }
    })
  ]);

  return { tasks, sessions };
}

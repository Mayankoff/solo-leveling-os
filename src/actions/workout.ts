"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { awardXP } from "./gamification";
import { revalidatePath } from "next/cache";
import { getUserTimezone } from "./settings";
import { getLocalMidnightDate, getLocalDayOfWeek } from "@/lib/date-utils";
import { pushToGoogleCalendar } from "./sync";

export async function getWorkoutData() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);
  const dayOfWeek = getLocalDayOfWeek(timeZone);

  const user = await db.user.findUnique({
    where: { id: clerkUser.id },
    include: {
      workoutPlans: {
        include: { exercises: { orderBy: { order: "asc" } } }
      },
      workouts: {
        where: { date },
        include: { exercises: { orderBy: { order: "asc" } } }
      }
    }
  });
  
  if (!user) return null;

  let todayLog = user.workouts[0] || null;

  // Auto-generate today's session from the template if it doesn't exist
  if (!todayLog) {
    const todayPlan = user.workoutPlans.find(p => p.dayOfWeek === dayOfWeek);
    if (todayPlan) {
      // Create it
      todayLog = await db.workoutLog.create({
        data: {
          userId: clerkUser.id,
          date,
          timeZone,
          type: todayPlan.name || "Workout",
          status: "Not Started",
          exercises: {
            create: todayPlan.exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              restTime: ex.restTime,
              order: ex.order,
              completed: false
            }))
          }
        },
        include: { exercises: { orderBy: { order: "asc" } } }
      });
    }
  }

  return {
    plans: user.workoutPlans,
    todayLog,
  };
}

export async function updateWorkoutPlan(dayOfWeek: number, name: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  let plan = await db.workoutPlan.findUnique({
    where: { userId_dayOfWeek: { userId: clerkUser.id, dayOfWeek } }
  });

  if (plan) {
    plan = await db.workoutPlan.update({
      where: { id: plan.id },
      data: { name }
    });
  } else {
    plan = await db.workoutPlan.create({
      data: { userId: clerkUser.id, dayOfWeek, name }
    });
  }
  revalidatePath("/workout");
  return plan;
}

export async function addExerciseToPlan(planId: string, data: any) {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const ex = await db.workoutPlanExercise.create({
    data: {
      workoutPlanId: planId,
      name: data.name,
      sets: data.sets,
      reps: data.reps,
      weight: data.weight || null,
      restTime: data.restTime || 90,
      notes: data.notes || null,
      order: data.order || 0
    },
    include: { workoutPlan: true }
  });

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);
  const dayOfWeek = getLocalDayOfWeek(timeZone);

  // If the user is editing today's plan, sync the new exercise to today's active session
  if (ex.workoutPlan.dayOfWeek === dayOfWeek) {
    const todayLog = await db.workoutLog.findFirst({
      where: { userId: clerkUser.id, date }
    });

    if (todayLog) {
      await db.exercise.create({
        data: {
          workoutId: todayLog.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restTime: ex.restTime,
          order: ex.order,
          completed: false
        }
      });
    }
  }

  revalidatePath("/workout");
  return ex;
}

export async function removeExerciseFromPlan(exerciseId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const ex = await db.workoutPlanExercise.findUnique({
    where: { id: exerciseId },
    include: { workoutPlan: true }
  });

  if (!ex) return;

  await db.workoutPlanExercise.delete({ where: { id: exerciseId } });

  const timeZone = await getUserTimezone();
  const date = getLocalMidnightDate(timeZone);
  const dayOfWeek = getLocalDayOfWeek(timeZone);

  // If the user is editing today's plan, try to remove the exercise from today's active session
  if (ex.workoutPlan.dayOfWeek === dayOfWeek) {
    const todayLog = await db.workoutLog.findFirst({
      where: { userId: clerkUser.id, date }
    });

    if (todayLog) {
      // Find the exercise with the exact same name in today's log and delete it
      const activeEx = await db.exercise.findFirst({
        where: { workoutId: todayLog.id, name: ex.name, completed: false }
      });
      if (activeEx) {
        await db.exercise.delete({ where: { id: activeEx.id } });
      }
    }
  }

  revalidatePath("/workout");
}

export async function toggleExerciseCompletion(exerciseId: string, completed: boolean) {
  const ex = await db.exercise.update({
    where: { id: exerciseId },
    data: { completed }
  });
  
  // Award XP only on completion
  if (completed) {
    await awardXP(10, "workout_exercise", "Completed an exercise");
  }

  // Auto-update session status based on all exercises
  const log = await db.workoutLog.findUnique({
    where: { id: ex.workoutId },
    include: { exercises: true }
  });

  if (log) {
    const total = log.exercises.length;
    const completedCount = log.exercises.filter(e => e.completed).length;
    
    let newStatus = "Not Started";
    if (completedCount === total && total > 0) newStatus = "Completed";
    else if (completedCount > 0) newStatus = "In Progress";

    if (log.status !== newStatus) {
      await db.workoutLog.update({
        where: { id: log.id },
        data: { status: newStatus }
      });
      if (newStatus === "Completed") {
         await awardXP(50, "workout_session", "Completed a daily workout session");
         
         const endTime = new Date();
         const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // assume 1 hour duration for a workout
         await pushToGoogleCalendar("workout", log.id, {
           summary: `💪 [Completed] ${log.type} Workout`,
           start: startTime,
           end: endTime,
           timeZone: log.timeZone || "UTC"
         });
      }
    }
  }

  revalidatePath("/workout");
}

export async function skipSession(logId: string) {
  await db.workoutLog.update({
    where: { id: logId },
    data: { status: "Skipped" }
  });
  revalidatePath("/workout");
}

export async function getWorkoutHistory() {
  const clerkUser = await currentUser();
  if (!clerkUser) return [];

  const logs = await db.workoutLog.findMany({
    where: { userId: clerkUser.id },
    orderBy: { date: "desc" },
    include: { exercises: true }
  });

  return logs;
}

export async function manualSyncWorkout(logId: string) {
  const log = await db.workoutLog.findUnique({ where: { id: logId } });
  if (log) {
     const endTime = new Date();
     const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // 1 hr block
     await pushToGoogleCalendar("workout", log.id, {
       summary: `💪 [Manual] ${log.type} Workout`,
       start: startTime,
       end: endTime,
       timeZone: log.timeZone || "UTC"
     });
  }
}

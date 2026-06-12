"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Calculates the required XP for a given level.
 * Simple scaling: level * 500
 */
function getRequiredXP(level: number) {
  return level * 500;
}

export async function awardXP(amount: number, source: string, description?: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await db.user.findUnique({ where: { id: clerkUser.id } });
  if (!user) return null;

  // Record the XP gain log
  await db.xPLog.create({
    data: {
      userId: user.id,
      amount,
      source,
      description
    }
  });

  // Calculate new XP and Level
  let newXp = user.xp + amount;
  let newLevel = user.level;

  let requiredXp = getRequiredXP(newLevel);

  // Level up logic
  let leveledUp = false;
  let statPointsGained = 0;
  while (newXp >= requiredXp) {
    newXp -= requiredXp;
    newLevel += 1;
    requiredXp = getRequiredXP(newLevel);
    leveledUp = true;
    statPointsGained += 3; // +3 points per level
  }

  // Update the user
  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: {
      xp: newXp,
      level: newLevel,
      ...(statPointsGained > 0 && { statPoints: { increment: statPointsGained } })
    }
  });

  // Check achievements (simple example: log-based achievements)
  await checkGlobalAchievements(user.id);

  // Revalidate the dashboard and all routes so XP bar updates immediately
  revalidatePath("/", "layout");

  return { updatedUser, leveledUp, previousLevel: user.level };
}

/**
 * Validates unlock conditions for global achievements
 */
async function checkGlobalAchievements(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      achievements: true,
      workouts: true,
      studyTasks: true,
    }
  });
  if (!user) return;

  const unlockedIds = new Set(user.achievements.map((a: any) => a.achievementId));
  const allAchievements = await db.achievement.findMany();

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue; // Already unlocked

    let shouldUnlock = false;

    // Hardcoded logic per achievement condition string
    switch (achievement.condition) {
      case "FIRST_WORKOUT":
        shouldUnlock = user.workouts.length > 0;
        break;
      case "WORKOUT_WARRIOR":
        shouldUnlock = user.workouts.length >= 10;
        break;
      case "STUDY_MONSTER":
        const completedStudy = user.studyTasks.filter((t: any) => t.status === "completed");
        shouldUnlock = completedStudy.length >= 10;
        break;
      case "LEVEL_10":
        shouldUnlock = user.level >= 10;
        break;
      // More conditions can be added here
    }

    if (shouldUnlock) {
      await db.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id
        }
      });
      // Optionally grant bonus XP for the achievement itself
      if (achievement.xpReward > 0) {
        // Recursive call without checking achievements again to avoid loops
        let newXp = user.xp + achievement.xpReward;
        let newLevel = user.level;
        let reqXp = getRequiredXP(newLevel);
        let statPointsGained = 0;
        while (newXp >= reqXp) {
          newXp -= reqXp;
          newLevel += 1;
          reqXp = getRequiredXP(newLevel);
          statPointsGained += 3;
        }
        await db.user.update({
          where: { id: userId },
          data: { 
            xp: newXp, 
            level: newLevel,
            ...(statPointsGained > 0 && { statPoints: { increment: statPointsGained } })
          }
        });
        
        await db.xPLog.create({
          data: {
            userId,
            amount: achievement.xpReward,
            source: "achievement",
            description: `Unlocked: ${achievement.name}`
          }
        });
      }
    }
  }
}

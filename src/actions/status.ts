"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getUserStatus() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await db.user.findUnique({
    where: { id: clerkUser.id },
    select: {
      id: true,
      level: true,
      xp: true,
      statPoints: true,
      str: true,
      int: true,
      vit: true,
      cha: true,
      agi: true,
    }
  });

  return user;
}

export async function allocateStatPoints(allocations: { str: number, int: number, vit: number, cha: number, agi: number }) {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await db.user.findUnique({ where: { id: clerkUser.id } });
  if (!user) return null;

  const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);
  
  if (totalAllocated <= 0) return { success: false, error: "No points allocated." };
  if (totalAllocated > user.statPoints) return { success: false, error: "Not enough stat points." };

  await db.user.update({
    where: { id: user.id },
    data: {
      str: { increment: allocations.str },
      int: { increment: allocations.int },
      vit: { increment: allocations.vit },
      cha: { increment: allocations.cha },
      agi: { increment: allocations.agi },
      statPoints: { decrement: totalAllocated }
    }
  });

  revalidatePath("/status");
  return { success: true };
}

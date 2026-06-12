"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import db from "@/lib/db";

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const dbUser = await db.user.findUnique({
    where: { id: userId }
  });

  if (!dbUser) {
    const email = user.emailAddresses[0]?.emailAddress ?? "no-email@example.com";
    const username = user.username ?? user.firstName ?? "Player";
    
    const newUser = await db.user.create({
      data: {
        id: userId,
        email,
        username,
        xp: 0,
        level: 1,
        lifeScore: 0,
      }
    });
    return newUser;
  }

  return dbUser;
}

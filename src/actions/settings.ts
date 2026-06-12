"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export async function syncTimezone(timeZone: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  // Save to DB
  let settings = await db.settings.findUnique({
    where: { userId: clerkUser.id }
  });

  if (!settings) {
    settings = await db.settings.create({
      data: { userId: clerkUser.id, timeZone }
    });
  } else if (settings.timeZone !== timeZone) {
    settings = await db.settings.update({
      where: { id: settings.id },
      data: { timeZone }
    });
  }

  // Also set a cookie so Server Components have immediate access without DB queries
  const cookieStore = await cookies();
  cookieStore.set("user-timezone", timeZone, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
}

export async function getUserTimezone(): Promise<string> {
  const cookieStore = await cookies();
  const tzCookie = cookieStore.get("user-timezone");
  if (tzCookie?.value) return tzCookie.value;

  const clerkUser = await currentUser();
  if (clerkUser) {
    const settings = await db.settings.findUnique({ where: { userId: clerkUser.id } });
    if (settings?.timeZone) return settings.timeZone;
  }

  return "UTC";
}

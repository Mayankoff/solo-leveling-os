"use client";

import { useEffect, useRef } from "react";
import { syncTimezone } from "@/actions/settings";
import { useRouter } from "next/navigation";

export default function TimezoneSync({ serverTimezone }: { serverTimezone: string }) {
  const router = useRouter();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (hasSynced.current) return;
    
    try {
      const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (localTz && localTz !== serverTimezone) {
        hasSynced.current = true;
        syncTimezone(localTz).then(() => {
          // Refresh the router so Server Components reload with the new timezone cookie
          router.refresh();
        });
      }
    } catch (e) {
      console.error("Failed to detect timezone:", e);
    }
  }, [serverTimezone, router]);

  return null;
}

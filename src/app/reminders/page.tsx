import { getReminders } from "@/actions/reminders";
import RemindersClient from "./RemindersClient";
import { getUserTimezone } from "@/actions/settings";

export default async function RemindersPage() {
  const reminders = await getReminders();
  const timeZone = await getUserTimezone();
  
  return <RemindersClient initialReminders={reminders} timeZone={timeZone} />;
}

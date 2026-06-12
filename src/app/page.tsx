import { syncUser } from "@/actions/user";
import DashboardClient from "./DashboardClient";

export default async function HomePage() {
  const user = await syncUser();

  return <DashboardClient user={user} />;
}

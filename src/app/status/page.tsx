import StatusClient from "./StatusClient";
import { getUserStatus } from "@/actions/status";
import { redirect } from "next/navigation";

export default async function StatusPage() {
  const status = await getUserStatus();

  if (!status) {
    redirect("/");
  }

  return <StatusClient initialStatus={status} />;
}

import { getAgendaData } from "@/actions/agenda";
import AgendaClient from "./AgendaClient";

export default async function AgendaPage() {
  const data = await getAgendaData();
  
  if (!data) return <div>Loading...</div>;

  return <AgendaClient initialData={data} />;
}

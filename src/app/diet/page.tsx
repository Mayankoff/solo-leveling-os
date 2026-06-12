import { getDietData } from "@/actions/diet";
import DietClient from "./DietClient";

export default async function DietPage() {
  const data = await getDietData();
  
  if (!data) return <div>Loading...</div>;

  return <DietClient initialData={data} />;
}

import { getSkincareData } from "@/actions/skincare";
import SkincareClient from "./SkincareClient";

export default async function SkincarePage() {
  const data = await getSkincareData();
  
  if (!data) return <div>Loading...</div>;

  return <SkincareClient initialData={data} />;
}

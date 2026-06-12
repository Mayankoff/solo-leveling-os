import { getDietHistory } from "@/actions/diet";
import { getSupplementHistory } from "@/actions/supplements";
import NutritionHistoryClient from "./NutritionHistoryClient";

export default async function NutritionHistoryPage() {
  const [dietLogs, suppLogs] = await Promise.all([
    getDietHistory(),
    getSupplementHistory()
  ]);

  return <NutritionHistoryClient dietLogs={dietLogs} suppLogs={suppLogs} />;
}

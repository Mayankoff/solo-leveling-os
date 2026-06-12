import { getSkincareHistory } from "@/actions/skincare";
import SkincareHistoryClient from "./SkincareHistoryClient";

export default async function SkincareHistoryPage() {
  const history = await getSkincareHistory();
  return <SkincareHistoryClient history={history} />;
}

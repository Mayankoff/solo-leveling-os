import { getWorkoutHistory } from "@/actions/workout";
import WorkoutHistoryClient from "./WorkoutHistoryClient";

export default async function WorkoutHistoryPage() {
  const history = await getWorkoutHistory();
  return <WorkoutHistoryClient history={history} />;
}

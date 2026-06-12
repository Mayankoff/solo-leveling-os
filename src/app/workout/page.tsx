import { getWorkoutData } from "@/actions/workout";
import WorkoutClient from "./WorkoutClient";

export default async function WorkoutPage() {
  const data = await getWorkoutData();
  
  if (!data) return <div>Loading...</div>;

  return <WorkoutClient initialData={data} />;
}

import { getStudyData } from "@/actions/study";
import StudyClient from "./StudyClient";

export default async function StudyPage() {
  const data = await getStudyData();
  
  if (!data) return <div>Loading...</div>;

  return <StudyClient initialData={data} />;
}

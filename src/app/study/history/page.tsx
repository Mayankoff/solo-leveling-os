import { getStudyHistory } from "@/actions/study";
import StudyHistoryClient from "./StudyHistoryClient";

export default async function StudyHistoryPage() {
  const history = await getStudyHistory();
  return <StudyHistoryClient history={history} />;
}

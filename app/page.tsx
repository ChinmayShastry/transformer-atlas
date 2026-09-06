import { getSteps } from "@/lib/content";
import CourseApp from "@/components/CourseApp";

export default function Home() {
  const steps = getSteps();
  return <CourseApp steps={steps} />;
}

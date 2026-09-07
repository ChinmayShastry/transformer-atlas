import type { Metadata } from "next";
import { getSteps } from "@/lib/content";
import CourseApp from "@/components/CourseApp";

export const metadata: Metadata = {
  title: "Transformer Atlas — Step View",
  description:
    "The same eleven ideas as a stepped course, with the tokenizer playground and the API deep dive.",
};

export default function StepsPage() {
  const steps = getSteps();
  return <CourseApp steps={steps} />;
}

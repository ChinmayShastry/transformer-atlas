import type { Metadata } from "next";
import { getSteps } from "@/lib/content";
import StoryMode from "@/components/story/StoryMode";

export const metadata: Metadata = {
  title: "Transformer Atlas — The Story",
  description:
    "Forty years of language models, told in order: scroll forward in time while the mechanism stays on screen beside you.",
};

export default function StoryPage() {
  const steps = getSteps();
  return <StoryMode steps={steps} />;
}

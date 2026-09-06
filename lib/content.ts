import fs from "node:fs";
import path from "node:path";
import type { Step, VisualKey } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

const FILES = [
  "01-before-transformers.txt",
  "02-transformer-architecture.txt",
  "03-bert-gpt-and-scaling.txt",
];

function parseBlock(block: string, source: string): Step {
  const lines = block.trim().split("\n");
  const meta: Record<string, string> = {};
  let bodyStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "---") {
      bodyStart = i + 1;
      break;
    }
    const match = line.match(/^(\w+):\s?(.*)$/);
    if (match) {
      meta[match[1]] = match[2].replace(/^"(.*)"$/, "$1");
    }
  }

  const body =
    bodyStart >= 0 ? lines.slice(bodyStart).join("\n").trim() : "";

  return {
    id: meta.id ?? "unknown",
    title: meta.title ?? "Untitled",
    oneliner: meta.oneliner ?? "",
    visual: (meta.visual ?? "timeline") as VisualKey,
    body,
    source,
  };
}

export function getSteps(): Step[] {
  const steps: Step[] = [];
  for (const file of FILES) {
    const full = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const blocks = full.split(/\n%%%\n/);
    for (const block of blocks) {
      if (block.trim().length === 0) continue;
      steps.push(parseBlock(block, file));
    }
  }
  return steps;
}

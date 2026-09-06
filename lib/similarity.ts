// Heuristic word-relatedness scoring used to drive attention-style visuals on
// whatever sentence the user types in. This is a hand-built lexical heuristic
// (distance decay + shared-stem bonus) — not a trained model's real attention.

export function tokenizeSentence(sentence: string, max = 14): string[] {
  const words = sentence.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, max);
}

function stem(word: string): string {
  return word.toLowerCase().replace(/[^a-z]/g, "").slice(0, 4);
}

export function relatednessScores(tokens: string[], queryIndex: number): number[] {
  const queryStem = stem(tokens[queryIndex] ?? "");
  return tokens.map((tok, i) => {
    let s = 3 / (1 + Math.abs(queryIndex - i));
    if (i === queryIndex) s += 1.5;
    const tokStem = stem(tok);
    if (i !== queryIndex && tokStem.length >= 3 && tokStem === queryStem) {
      s += 2.5;
    }
    return s;
  });
}

// A small, self-contained heuristic subword splitter for the playground.
// It mimics the *shape* of real subword tokenizers (WordPiece/BPE style
// "##" continuation pieces) so you can build intuition for how tokenization
// works, without shipping a real vocab file. It is not the actual GPT tokenizer.

const KNOWN_SUFFIXES = [
  "ization",
  "ational",
  "tion",
  "sion",
  "ment",
  "ness",
  "able",
  "ible",
  "ing",
  "ers",
  "est",
  "ed",
  "er",
  "ly",
  "s",
];

function splitWord(word: string, threshold: number): string[] {
  const lower = word.toLowerCase();
  if (lower.length <= threshold) return [word];

  for (const suffix of KNOWN_SUFFIXES) {
    if (lower.endsWith(suffix) && lower.length - suffix.length >= 3) {
      const stem = word.slice(0, word.length - suffix.length);
      return [stem, "##" + word.slice(word.length - suffix.length)];
    }
  }

  if (lower.length > threshold + 4) {
    const mid = Math.ceil(word.length / 2);
    return [word.slice(0, mid), "##" + word.slice(mid)];
  }

  return [word];
}

export interface TokenPiece {
  text: string;
  isContinuation: boolean;
}

export function tokenize(input: string, threshold = 4): TokenPiece[] {
  if (!input.trim()) return [];
  const words = input.match(/[A-Za-z]+|[0-9]+|[^\sA-Za-z0-9]/g) ?? [];
  const pieces: TokenPiece[] = [];

  for (const word of words) {
    if (/^[A-Za-z]+$/.test(word) && word.length > threshold) {
      const parts = splitWord(word, threshold);
      parts.forEach((p, i) =>
        pieces.push({ text: p, isContinuation: i > 0 })
      );
    } else {
      pieces.push({ text: word, isContinuation: false });
    }
  }

  return pieces;
}

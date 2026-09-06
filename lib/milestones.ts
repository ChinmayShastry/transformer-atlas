export interface Milestone {
  year: string;
  label: string;
  detail: string;
}

export const MILESTONES: Milestone[] = [
  {
    year: "1986",
    label: "Recurrent Networks",
    detail:
      "Early RNNs learn to process sequences step by step, carrying a hidden state forward.",
  },
  {
    year: "1997",
    label: "LSTM",
    detail:
      "Hochreiter & Schmidhuber add gated memory cells to fight the vanishing gradient problem.",
  },
  {
    year: "2014",
    label: "Seq2Seq",
    detail:
      "Encoder-decoder RNNs (Sutskever et al.) enable end-to-end machine translation.",
  },
  {
    year: "2015",
    label: "Attention",
    detail:
      "Bahdanau et al. let a decoder look back at every encoder state instead of one bottleneck vector.",
  },
  {
    year: "2017",
    label: "The Transformer",
    detail:
      '"Attention Is All You Need" removes recurrence entirely — self-attention only.',
  },
  {
    year: "2018",
    label: "BERT & GPT-1",
    detail:
      "The field splits: bidirectional encoders (BERT) vs. autoregressive decoders (GPT).",
  },
  {
    year: "2019",
    label: "GPT-2",
    detail: "1.5B parameters produce startlingly coherent generated text.",
  },
  {
    year: "2020",
    label: "GPT-3",
    detail:
      "175B parameters — few-shot learning and reasoning emerge without explicit training.",
  },
  {
    year: "2021",
    label: "RoPE",
    detail:
      "Rotary position embeddings encode relative distance by rotation — now the default in most open models.",
  },
  {
    year: "2022",
    label: "RLHF / ChatGPT",
    detail:
      "Human feedback fine-tuning turns raw predictors into helpful, instructable assistants.",
  },
  {
    year: "2023+",
    label: "Modern LLMs",
    detail:
      "Multimodal, faster, cheaper models like gpt-4o-mini — same 2017 architecture, scaled and aligned.",
  },
];

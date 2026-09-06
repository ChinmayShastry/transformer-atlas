"use client";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  valueLabel?: string;
  hint?: string;
}

export default function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  valueLabel,
  hint,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
        <span className="text-sm font-mono text-accent tabular-nums">
          {valueLabel ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${pct}%` } as React.CSSProperties}
      />
      {hint && <p className="text-xs text-muted mt-2">{hint}</p>}
    </div>
  );
}

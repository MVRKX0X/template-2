"use client";

import { useEffect, useState } from "react";

type MetricBarProps = {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color: string;
};

export function MetricBar({ label, value, max, unit, color }: MetricBarProps) {
  const [width, setWidth] = useState(0);
  const safeMax = max <= 0 ? 1 : max;
  const ratio = Math.max(0, Math.min(value / safeMax, 1));

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setWidth(ratio * 100);
    });
    return () => cancelAnimationFrame(id);
  }, [ratio]);

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-text-muted)]">
        <span>{label}</span>
        <span
          className="font-medium normal-case"
          style={{
            fontFamily:
              '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          {value}
          {unit}
        </span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-[color:var(--color-border-subtle)]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            backgroundColor: color,
            transition: "width 0.6s ease-out",
          }}
        />
      </div>
    </div>
  );
}


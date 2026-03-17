"use client";

type ScoreRingProps = {
  score: number;
  color: string;
  size?: number;
};

export function ScoreRing({ score, color, size = 56 }: ScoreRingProps) {
  const radius = (size / 2) - 6;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(score, 100));
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#1a1a2e"
        strokeWidth="4"
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
      />
      <text
        x="50%"
        y="50%"
        dy="0.1em"
        textAnchor="middle"
        className="text-xs font-medium"
        style={{
          fill: "var(--color-text-primary)",
          fontFamily: '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        {clampedScore}
      </text>
    </svg>
  );
}


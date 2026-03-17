type BadgePillProps = {
  badge: string;
};

export function BadgePill({ badge }: BadgePillProps) {
  const mapping: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    Elite: {
      bg: "#00E5A015",
      text: "#00E5A0",
      border: "#00E5A040",
    },
    Pro: {
      bg: "#7C3AED15",
      text: "#a78bfa",
      border: "#7C3AED40",
    },
    Rising: {
      bg: "#F59E0B15",
      text: "#fbbf24",
      border: "#F59E0B40",
    },
    Featured: {
      bg: "#00E5A015",
      text: "#00E5A0",
      border: "#00E5A040",
    },
    "Top Rated": {
      bg: "#FF6B3515",
      text: "#ff8c5a",
      border: "#FF6B3540",
    },
    Unverified: {
      bg: "#ef444415",
      text: "#f87171",
      border: "#ef444430",
    },
  };

  const style = mapping[badge] ?? {
    bg: "#0d0f22",
    text: "#e5e7eb",
    border: "#1e2035",
  };

  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
        borderWidth: 1,
      }}
    >
      {badge}
    </span>
  );
}


import { cn } from "@/lib/utils";

interface LogoProps {
  /**
   * "dark"  → the wordmark is rendered in ink (use over light surfaces).
   * "light" → the wordmark is rendered in ivory (use over dark surfaces).
   * The eye/lens mark stays in the brand blue (`olive` token) regardless.
   */
  variant?: "dark" | "light";
  /**
   * Hide the "INVEST" sub-wordmark — useful when the lockup is shown very
   * small (favicon-style) and only the "BIEL" mark needs to be legible.
   */
  compact?: boolean;
  className?: string;
}

const ACCENT = "#1F8FC7";

export function Logo({
  variant = "dark",
  compact = false,
  className,
}: LogoProps) {
  const wordColor = variant === "light" ? "#FAF7F2" : "#1C1C1C";
  const subColor = variant === "light" ? "rgba(250,247,242,0.72)" : "#6B6762";

  return (
    <svg
      viewBox={compact ? "200 130 400 140" : "0 0 800 800"}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="BIEL Invest"
      className={cn("block h-full w-full select-none", className)}
    >
      <title>BIEL Invest</title>

      {/* Mark — two overlapping lens shapes, always brand blue */}
      <g
        fill="none"
        stroke={ACCENT}
        strokeWidth={22}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M250 200 C 300 150, 400 150, 450 200 C 400 250, 300 250, 250 200 Z" />
        <path d="M350 200 C 400 150, 500 150, 550 200 C 500 250, 400 250, 350 200 Z" />
      </g>

      {compact ? null : (
        <>
          <text
            x="400"
            y="450"
            textAnchor="middle"
            fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
            fontWeight={600}
            fontSize={160}
            letterSpacing={8}
            fill={wordColor}
          >
            BIEL
          </text>
          <text
            x="400"
            y="555"
            textAnchor="middle"
            fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
            fontWeight={400}
            fontSize={64}
            letterSpacing={22}
            fill={subColor}
          >
            INVEST
          </text>
        </>
      )}
    </svg>
  );
}

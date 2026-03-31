import { getTierColor } from "../data/dummyData";
import type { Tier } from "../data/dummyData";

interface TierBadgeProps {
  tier: Tier;
  size?: "sm" | "md" | "lg";
}

export default function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const colors = getTierColor(tier);
  const padding =
    size === "sm" ? "2px 8px" : size === "lg" ? "6px 16px" : "3px 12px";
  const fontSize = size === "sm" ? "10px" : size === "lg" ? "14px" : "11px";
  const fontWeight = 700;

  return (
    <span
      style={{
        display: "inline-block",
        padding,
        borderRadius: "999px",
        fontSize,
        fontWeight,
        letterSpacing: "0.1em",
        color: colors.text,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.text}55`,
        boxShadow: `0 0 10px ${colors.glow}40`,
        fontFamily: "BricolageGrotesque",
      }}
    >
      {tier}
    </span>
  );
}

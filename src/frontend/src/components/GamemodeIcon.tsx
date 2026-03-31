import type { GamemodeId } from "../data/dummyData";

interface GamemodeIconProps {
  id: GamemodeId;
  size?: number;
}

type IconRects = Array<{
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}>;

const ICON_RECTS: Record<GamemodeId, IconRects> = {
  "axe-pvp": [
    // Brown handle
    { x: 9, y: 9, w: 2, h: 2, fill: "#7C4A1E" },
    { x: 10, y: 11, w: 2, h: 2, fill: "#7C4A1E" },
    { x: 11, y: 13, w: 2, h: 2, fill: "#7C4A1E" },
    // Gray blade
    { x: 2, y: 2, w: 2, h: 2, fill: "#AAAAAA" },
    { x: 4, y: 2, w: 2, h: 2, fill: "#CCCCCC" },
    { x: 6, y: 2, w: 2, h: 2, fill: "#AAAAAA" },
    { x: 2, y: 4, w: 2, h: 2, fill: "#CCCCCC" },
    { x: 4, y: 4, w: 2, h: 2, fill: "#FFFFFF" },
    { x: 6, y: 4, w: 2, h: 2, fill: "#CCCCCC" },
    { x: 8, y: 4, w: 2, h: 2, fill: "#888888" },
    { x: 2, y: 6, w: 2, h: 2, fill: "#AAAAAA" },
    { x: 4, y: 6, w: 2, h: 2, fill: "#CCCCCC" },
    { x: 6, y: 6, w: 2, h: 2, fill: "#AAAAAA" },
    { x: 8, y: 6, w: 2, h: 2, fill: "#888888" },
    { x: 8, y: 8, w: 2, h: 2, fill: "#7C4A1E" },
  ],
  "sword-pvp": [
    // Blade
    { x: 2, y: 2, w: 2, h: 2, fill: "#CCCCCC" },
    { x: 4, y: 4, w: 2, h: 2, fill: "#DDDDDD" },
    { x: 6, y: 6, w: 2, h: 2, fill: "#CCCCCC" },
    { x: 8, y: 8, w: 2, h: 2, fill: "#AAAAAA" },
    // Guard
    { x: 6, y: 8, w: 2, h: 2, fill: "#7C4A1E" },
    { x: 10, y: 8, w: 2, h: 2, fill: "#7C4A1E" },
    // Handle
    { x: 8, y: 10, w: 2, h: 2, fill: "#7C4A1E" },
    { x: 10, y: 10, w: 2, h: 2, fill: "#9B6432" },
    { x: 10, y: 12, w: 2, h: 2, fill: "#7C4A1E" },
    { x: 12, y: 12, w: 2, h: 2, fill: "#9B6432" },
    // Shine
    { x: 3, y: 3, w: 1, h: 1, fill: "#FFFFFF" },
  ],
  "crystal-pvp": [
    { x: 6, y: 2, w: 4, h: 2, fill: "#5EEEFF" },
    { x: 4, y: 4, w: 2, h: 2, fill: "#5EEEFF" },
    { x: 6, y: 4, w: 4, h: 2, fill: "#AAFFFF" },
    { x: 10, y: 4, w: 2, h: 2, fill: "#5EEEFF" },
    { x: 2, y: 6, w: 2, h: 2, fill: "#5EEEFF" },
    { x: 4, y: 6, w: 2, h: 2, fill: "#AAFFFF" },
    { x: 6, y: 6, w: 4, h: 2, fill: "#FFFFFF" },
    { x: 10, y: 6, w: 2, h: 2, fill: "#5EEEFF" },
    { x: 12, y: 6, w: 2, h: 2, fill: "#5EEEFF" },
    { x: 2, y: 8, w: 2, h: 2, fill: "#3BBFCF" },
    { x: 4, y: 8, w: 4, h: 2, fill: "#5EEEFF" },
    { x: 8, y: 8, w: 4, h: 2, fill: "#3BBFCF" },
    { x: 12, y: 8, w: 2, h: 2, fill: "#3BBFCF" },
    { x: 4, y: 10, w: 2, h: 2, fill: "#3BBFCF" },
    { x: 6, y: 10, w: 4, h: 2, fill: "#2899A8" },
    { x: 10, y: 10, w: 2, h: 2, fill: "#3BBFCF" },
    { x: 6, y: 12, w: 4, h: 2, fill: "#2899A8" },
  ],
  uhc: [
    // Leaf
    { x: 6, y: 1, w: 2, h: 2, fill: "#22C55E" },
    { x: 8, y: 1, w: 2, h: 2, fill: "#16A34A" },
    { x: 5, y: 2, w: 2, h: 2, fill: "#16A34A" },
    { x: 9, y: 2, w: 2, h: 2, fill: "#22C55E" },
    // Gold body
    { x: 4, y: 4, w: 8, h: 2, fill: "#FBBF24" },
    { x: 3, y: 6, w: 10, h: 2, fill: "#F59E0B" },
    { x: 3, y: 8, w: 10, h: 2, fill: "#F59E0B" },
    { x: 3, y: 10, w: 10, h: 2, fill: "#FBBF24" },
    { x: 4, y: 12, w: 8, h: 2, fill: "#F59E0B" },
    // Shine
    { x: 5, y: 5, w: 2, h: 2, fill: "#FDE68A" },
    { x: 4, y: 7, w: 2, h: 1, fill: "#FDE68A" },
  ],
  nethpot: [
    // Bottle neck
    { x: 6, y: 1, w: 4, h: 2, fill: "#4A4A4A" },
    { x: 5, y: 3, w: 6, h: 2, fill: "#333333" },
    // Bottle body
    { x: 4, y: 5, w: 8, h: 2, fill: "#1A0A1A" },
    { x: 3, y: 7, w: 10, h: 2, fill: "#1A0A1A" },
    { x: 3, y: 9, w: 10, h: 2, fill: "#1A0A1A" },
    { x: 4, y: 11, w: 8, h: 2, fill: "#1A0A1A" },
    { x: 5, y: 13, w: 6, h: 2, fill: "#1A0A1A" },
    // Potion liquid
    { x: 5, y: 7, w: 2, h: 2, fill: "#E040FB" },
    { x: 7, y: 7, w: 2, h: 2, fill: "#FF5599" },
    { x: 5, y: 9, w: 4, h: 2, fill: "#E040FB" },
    { x: 5, y: 11, w: 4, h: 2, fill: "#CC2266" },
    { x: 6, y: 13, w: 4, h: 2, fill: "#CC2266" },
    // Shine
    { x: 5, y: 6, w: 1, h: 2, fill: "#555555" },
  ],
  "smp-pvp": [
    // Bow
    { x: 2, y: 4, w: 2, h: 2, fill: "#9B6432" },
    { x: 2, y: 6, w: 2, h: 2, fill: "#7C4A1E" },
    { x: 2, y: 8, w: 2, h: 2, fill: "#7C4A1E" },
    { x: 2, y: 10, w: 2, h: 2, fill: "#9B6432" },
    { x: 4, y: 2, w: 2, h: 2, fill: "#9B6432" },
    { x: 4, y: 12, w: 2, h: 2, fill: "#9B6432" },
    { x: 6, y: 2, w: 2, h: 2, fill: "#7C4A1E" },
    { x: 6, y: 14, w: 2, h: 2, fill: "#7C4A1E" },
    // Bowstring
    { x: 8, y: 3, w: 1, h: 2, fill: "#DDDDBB" },
    { x: 9, y: 5, w: 1, h: 2, fill: "#DDDDBB" },
    { x: 10, y: 7, w: 1, h: 2, fill: "#DDDDBB" },
    { x: 9, y: 9, w: 1, h: 2, fill: "#DDDDBB" },
    { x: 8, y: 11, w: 1, h: 2, fill: "#DDDDBB" },
    // Arrow
    { x: 6, y: 7, w: 6, h: 2, fill: "#BBBBBB" },
    { x: 12, y: 6, w: 2, h: 4, fill: "#CCCCCC" },
    { x: 14, y: 7, w: 2, h: 2, fill: "#AAAAAA" },
  ],
  "mace-pvp": [
    // Head
    { x: 2, y: 2, w: 10, h: 2, fill: "#444444" },
    { x: 2, y: 4, w: 10, h: 2, fill: "#555555" },
    { x: 2, y: 6, w: 10, h: 2, fill: "#444444" },
    { x: 2, y: 8, w: 10, h: 2, fill: "#333333" },
    // Spikes
    { x: 1, y: 3, w: 2, h: 2, fill: "#666666" },
    { x: 11, y: 3, w: 2, h: 2, fill: "#666666" },
    { x: 1, y: 7, w: 2, h: 2, fill: "#555555" },
    { x: 11, y: 7, w: 2, h: 2, fill: "#555555" },
    // Handle
    { x: 6, y: 10, w: 4, h: 2, fill: "#7C4A1E" },
    { x: 6, y: 12, w: 4, h: 2, fill: "#9B6432" },
    { x: 6, y: 14, w: 4, h: 2, fill: "#7C4A1E" },
    // Shine
    { x: 3, y: 3, w: 2, h: 1, fill: "#888888" },
  ],
  "cart-pvp": [
    // Cart body
    { x: 2, y: 4, w: 12, h: 2, fill: "#888888" },
    { x: 1, y: 6, w: 14, h: 2, fill: "#999999" },
    { x: 1, y: 8, w: 14, h: 2, fill: "#888888" },
    { x: 2, y: 10, w: 12, h: 2, fill: "#777777" },
    // Side walls
    { x: 1, y: 4, w: 2, h: 8, fill: "#777777" },
    { x: 13, y: 4, w: 2, h: 8, fill: "#777777" },
    // Wheels
    { x: 2, y: 12, w: 4, h: 2, fill: "#555555" },
    { x: 10, y: 12, w: 4, h: 2, fill: "#555555" },
    { x: 3, y: 14, w: 2, h: 2, fill: "#444444" },
    { x: 11, y: 14, w: 2, h: 2, fill: "#444444" },
    // Interior
    { x: 3, y: 7, w: 10, h: 2, fill: "#333333" },
    // Rail connector
    { x: 6, y: 13, w: 4, h: 2, fill: "#666666" },
  ],
};

const ICON_LABELS: Record<GamemodeId, string> = {
  "axe-pvp": "Axe PvP",
  "sword-pvp": "Sword PvP",
  "crystal-pvp": "Crystal PvP",
  uhc: "UHC",
  nethpot: "Nethpot",
  "smp-pvp": "SMP PvP",
  "mace-pvp": "Mace PvP",
  "cart-pvp": "Cart PvP",
};

export default function GamemodeIcon({ id, size = 16 }: GamemodeIconProps) {
  const rects = ICON_RECTS[id];
  const label = ICON_LABELS[id];
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      role="img"
      aria-label={label}
      style={{
        imageRendering: "pixelated",
        display: "inline-block",
        flexShrink: 0,
      }}
    >
      <title>{label}</title>
      {rects?.map((r, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static pixel art
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} />
      ))}
    </svg>
  );
}

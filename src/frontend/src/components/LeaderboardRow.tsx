import { Link } from "@tanstack/react-router";
import { PlayerTag } from "../backend.d";
import {
  GAMEMODES,
  type GamemodeId,
  type Player,
  type Tier,
  getTierColor,
} from "../data/dummyData";
import GamemodeIcon from "./GamemodeIcon";

interface LeaderboardRowProps {
  rank?: number;
  player: Player;
  ranks: Partial<Record<GamemodeId, Tier>>;
  modeId?: GamemodeId;
  modeName?: string;
  index: number;
  tags?: PlayerTag[];
}

function getAvatarColors(username: string) {
  const colors: Array<[string, string]> = [
    ["#23D7FF", "#A855F7"],
    ["#A855F7", "#23D7FF"],
    ["#22D3EE", "#7C3AED"],
    ["#06B6D4", "#9333EA"],
    ["#38BDF8", "#C084FC"],
  ];
  return colors[username.charCodeAt(0) % colors.length];
}

const TAG_CONFIG: Record<
  PlayerTag,
  { label: string; color: string; bg: string }
> = {
  [PlayerTag.player]: {
    label: "PLAYER",
    color: "#23D7FF",
    bg: "rgba(35,215,255,0.12)",
  },
  [PlayerTag.tierTester]: {
    label: "TIER TESTER",
    color: "#A855F7",
    bg: "rgba(168,85,247,0.12)",
  },
  [PlayerTag.experienced]: {
    label: "EXPERIENCED",
    color: "#FFD700",
    bg: "rgba(255,215,0,0.12)",
  },
  [PlayerTag.new_]: {
    label: "NEW",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.12)",
  },
};

export function TagBadge({ tag }: { tag: PlayerTag }) {
  const cfg = TAG_CONFIG[tag];
  if (!cfg) return null;
  return (
    <span
      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
      style={{
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.color}44`,
        letterSpacing: "0.05em",
        fontSize: "9px",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

export default function LeaderboardRow({
  rank,
  player,
  ranks,
  modeName,
  index,
  tags = [],
}: LeaderboardRowProps) {
  const [c1, c2] = getAvatarColors(player.username);
  const isTop3 = rank !== undefined && rank <= 3;
  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const visibleTags = tags.slice(0, 2);

  // Build ordered list of gamemodes this player has ranks in
  const rankedModes = GAMEMODES.filter((gm) => ranks[gm.id]);
  // On mobile, show max 3 chips to prevent overflow; show all on larger screens
  const MAX_CHIPS_MOBILE = 3;

  return (
    <Link
      to="/players/$username"
      params={{ username: player.username }}
      data-ocid={`leaderboard.item.${index}`}
      className="flex items-center gap-4 rounded-xl px-5 py-3.5 group"
      style={{
        background: "#141821",
        backgroundClip: "padding-box",
        border: "1px solid transparent",
        backgroundImage:
          "linear-gradient(#141821, #141821), linear-gradient(135deg, rgba(35,215,255,0.25), rgba(168,85,247,0.15))",
        backgroundOrigin: "padding-box, border-box",
        textDecoration: "none",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "scale(1.01)";
        el.style.boxShadow =
          "0 0 24px rgba(35,215,255,0.18), 0 0 8px rgba(168,85,247,0.12)";
        el.style.backgroundImage =
          "linear-gradient(#141821, #141821), linear-gradient(135deg, rgba(35,215,255,0.5), rgba(168,85,247,0.35))";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "scale(1)";
        el.style.boxShadow = "none";
        el.style.backgroundImage =
          "linear-gradient(#141821, #141821), linear-gradient(135deg, rgba(35,215,255,0.25), rgba(168,85,247,0.15))";
      }}
    >
      {/* Rank number */}
      <div
        className="w-9 text-center font-bold flex-shrink-0"
        style={{
          fontFamily: "BricolageGrotesque",
          fontSize: "15px",
          color:
            isTop3 && rank !== undefined
              ? rankColors[rank - 1]
              : rank !== undefined
                ? "#9AA3B2"
                : "#555",
          textShadow:
            isTop3 && rank !== undefined
              ? `0 0 12px ${rankColors[rank - 1]}90`
              : "none",
        }}
      >
        {rank !== undefined ? `#${rank}` : "–"}
      </div>

      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          color: "#fff",
          boxShadow: `0 0 12px ${c1}60`,
        }}
      >
        {player.username.charAt(0).toUpperCase()}
      </div>

      {/* Username + tags */}
      <div className="flex-1 min-w-0">
        <span
          className="font-bold text-sm truncate block"
          style={{ color: "#F2F5FF", fontFamily: "BricolageGrotesque" }}
        >
          {player.username}
        </span>
        <div className="flex items-center gap-1 flex-wrap mt-0.5">
          {player.testerVerified && (
            <span className="text-xs" style={{ color: "#23D7FF" }}>
              ✓ Verified Tester
            </span>
          )}
          {visibleTags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      </div>

      {/* Gamemode tier chips */}
      {rankedModes.length > 0 ? (
        <div
          className="flex items-center gap-1 flex-shrink-0 overflow-hidden sm:overflow-x-auto"
          style={{
            maxWidth: "min(45%, 280px)",
            scrollbarWidth: "none",
          }}
        >
          {rankedModes.slice(0, MAX_CHIPS_MOBILE).map((gm) => {
            const tier = ranks[gm.id]!;
            const { text: tierColor } = getTierColor(tier);
            return (
              <div
                key={gm.id}
                className="flex flex-col items-center gap-0.5 flex-shrink-0 sm:flex"
                title={`${gm.name}: ${tier}`}
                style={{
                  width: "40px",
                  padding: "3px 2px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <GamemodeIcon id={gm.id} size={13} />
                <span
                  style={{
                    fontSize: "7px",
                    fontWeight: 700,
                    color: tierColor,
                    lineHeight: 1.2,
                    textAlign: "center",
                    letterSpacing: "0.01em",
                    wordBreak: "break-all",
                  }}
                >
                  {tier}
                </span>
              </div>
            );
          })}
          {rankedModes.length > MAX_CHIPS_MOBILE && (
            <span
              className="flex-shrink-0 sm:hidden"
              style={{
                fontSize: "9px",
                color: "#9AA3B2",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              +{rankedModes.length - MAX_CHIPS_MOBILE}
            </span>
          )}
          {rankedModes.slice(MAX_CHIPS_MOBILE).map((gm) => {
            const tier = ranks[gm.id]!;
            const { text: tierColor } = getTierColor(tier);
            return (
              <div
                key={gm.id}
                className="hidden sm:flex flex-col items-center gap-0.5 flex-shrink-0"
                title={`${gm.name}: ${tier}`}
                style={{
                  width: "40px",
                  padding: "3px 2px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <GamemodeIcon id={gm.id} size={13} />
                <span
                  style={{
                    fontSize: "7px",
                    fontWeight: 700,
                    color: tierColor,
                    lineHeight: 1.2,
                    textAlign: "center",
                    letterSpacing: "0.01em",
                    wordBreak: "break-all",
                  }}
                >
                  {tier}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <span
          className="text-xs flex-shrink-0"
          style={{ color: "#555", fontStyle: "italic" }}
        >
          Unranked
        </span>
      )}

      {modeName && rankedModes.length > 0 && (
        <span
          className="hidden sm:block text-xs flex-shrink-0"
          style={{ color: "#9AA3B2" }}
        >
          {modeName}
        </span>
      )}
    </Link>
  );
}

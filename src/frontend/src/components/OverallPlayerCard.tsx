import { Link } from "@tanstack/react-router";
import type { PlayerTag } from "../backend.d";
import { GAMEMODES, getTierColor } from "../data/dummyData";
import type { Player, Tier } from "../data/dummyData";
import GamemodeIcon from "./GamemodeIcon";
import { TagBadge } from "./LeaderboardRow";

interface OverallPlayerCardProps {
  rank: number;
  player: Player;
  bestTier: Tier;
  index: number;
  tags?: PlayerTag[];
}

function getAvatarColors(username: string): [string, string] {
  const colors: Array<[string, string]> = [
    ["#23D7FF", "#A855F7"],
    ["#A855F7", "#23D7FF"],
    ["#22D3EE", "#7C3AED"],
    ["#06B6D4", "#9333EA"],
    ["#38BDF8", "#C084FC"],
  ];
  return colors[username.charCodeAt(0) % colors.length];
}

export default function OverallPlayerCard({
  rank,
  player,
  bestTier,
  index,
  tags = [],
}: OverallPlayerCardProps) {
  const [c1, c2] = getAvatarColors(player.username);
  const isTop3 = rank <= 3;
  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const rankedModes = GAMEMODES.filter((gm) => player.ranks[gm.id]);
  const visibleTags = tags.slice(0, 2);

  return (
    <Link
      to="/players/$username"
      params={{ username: player.username }}
      data-ocid={`leaderboard.item.${index}`}
      className="flex items-center gap-2 rounded-lg group"
      style={{
        background: "#141821",
        backgroundImage:
          "linear-gradient(#141821, #141821), linear-gradient(135deg, rgba(35,215,255,0.2), rgba(168,85,247,0.12))",
        backgroundOrigin: "padding-box, border-box",
        backgroundClip: "padding-box, border-box",
        border: "1px solid transparent",
        textDecoration: "none",
        transition: "all 0.15s ease",
        padding: "6px 10px",
        minHeight: "44px",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "translateX(2px)";
        el.style.boxShadow = "0 0 16px rgba(35,215,255,0.18)";
        el.style.backgroundImage =
          "linear-gradient(#141821, #141821), linear-gradient(135deg, rgba(35,215,255,0.45), rgba(168,85,247,0.3))";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "translateX(0)";
        el.style.boxShadow = "none";
        el.style.backgroundImage =
          "linear-gradient(#141821, #141821), linear-gradient(135deg, rgba(35,215,255,0.2), rgba(168,85,247,0.12))";
      }}
    >
      {/* Rank */}
      <div
        style={{
          width: "28px",
          textAlign: "center",
          fontFamily: "BricolageGrotesque",
          fontSize: "13px",
          fontWeight: 700,
          color: isTop3 ? rankColors[rank - 1] : "#5A6478",
          textShadow: isTop3 ? `0 0 10px ${rankColors[rank - 1]}80` : "none",
          flexShrink: 0,
        }}
      >
        #{rank}
      </div>

      {/* MC-style head avatar */}
      <div
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "4px",
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
          imageRendering: "pixelated",
          boxShadow: `0 0 8px ${c1}50`,
        }}
      >
        {player.username.charAt(0).toUpperCase()}
      </div>

      {/* Username + tags */}
      <div style={{ flexShrink: 0, width: "110px" }}>
        <span
          style={{
            fontFamily: "BricolageGrotesque",
            fontSize: "13px",
            fontWeight: 700,
            color: "#F2F5FF",
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {player.username}
        </span>
        {visibleTags.length > 0 && (
          <div className="flex items-center gap-0.5 flex-wrap mt-0.5">
            {visibleTags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
        {player.testerVerified && visibleTags.length === 0 && (
          <span style={{ fontSize: "9px", color: "#23D7FF", lineHeight: 1 }}>
            ✓ Verified
          </span>
        )}
      </div>

      {/* Best tier badge */}
      <div style={{ flexShrink: 0 }}>
        {(() => {
          const colors = getTierColor(bestTier);
          return (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: colors.text,
                backgroundColor: colors.bg,
                border: `1px solid ${colors.text}44`,
                borderRadius: "3px",
                padding: "1px 5px",
                boxShadow: `0 0 6px ${colors.glow}40`,
                fontFamily: "monospace",
                letterSpacing: "0.05em",
              }}
            >
              {bestTier}
            </span>
          );
        })()}
      </div>

      {/* Divider */}
      <div
        style={{
          width: "1px",
          height: "24px",
          backgroundColor: "rgba(255,255,255,0.07)",
          flexShrink: 0,
          marginLeft: "2px",
          marginRight: "2px",
        }}
      />

      {/* Gamemode tier row — scrollable */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto"
        style={{
          flex: 1,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {rankedModes.map((gm) => {
          const tierVal = player.ranks[gm.id]!;
          const colors = getTierColor(tierVal);
          return (
            <div
              key={gm.id}
              className="flex items-center gap-0.5"
              style={{ flexShrink: 0 }}
            >
              <GamemodeIcon id={gm.id} size={13} />
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: colors.text,
                  backgroundColor: colors.bg,
                  borderRadius: "2px",
                  padding: "0px 3px",
                  fontFamily: "monospace",
                  letterSpacing: "0.03em",
                  lineHeight: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                {tierVal}
              </span>
            </div>
          );
        })}
      </div>
    </Link>
  );
}

import { Link, useParams } from "@tanstack/react-router";
import GamemodeIcon from "../components/GamemodeIcon";
import TierBadge from "../components/TierBadge";
import {
  GAMEMODES,
  PLAYERS,
  TIER_ORDER,
  getTierCategory,
  getTierColor,
} from "../data/dummyData";
import type { GamemodeId, Tier } from "../data/dummyData";

const TIER_GROUPS: Array<{
  label: string;
  prefix: "HT" | "MT" | "LT";
  desc: string;
}> = [
  {
    label: "HIGH TIER",
    prefix: "HT",
    desc: "Elite players — top of the rankings",
  },
  {
    label: "MID TIER",
    prefix: "MT",
    desc: "Skilled players — competitive level",
  },
  {
    label: "LOW TIER",
    prefix: "LT",
    desc: "Developing players — learning the meta",
  },
];

export default function GamemodePage() {
  const { id } = useParams({ from: "/gamemodes/$id" });
  const gamemode = GAMEMODES.find((g) => g.id === id);

  if (!gamemode) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0B0D10" }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "#F2F5FF", fontFamily: "BricolageGrotesque" }}
          >
            Gamemode Not Found
          </h2>
          <Link to="/gamemodes" style={{ color: "#23D7FF" }}>
            ← Back to Gamemodes
          </Link>
        </div>
      </div>
    );
  }

  const rankedPlayers = PLAYERS.filter((p) => p.ranks[id as GamemodeId])
    .map((p) => ({ player: p, tier: p.ranks[id as GamemodeId]! }))
    .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));

  return (
    <div
      className="py-16 px-4"
      style={{ backgroundColor: "#0B0D10", minHeight: "80vh" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <Link
            to="/gamemodes"
            className="text-sm mb-6 inline-block"
            style={{ color: "#9AA3B2" }}
          >
            ← Back to Gamemodes
          </Link>
          <div className="flex items-center gap-5">
            <div
              className="flex items-center justify-center w-20 h-20 rounded-2xl flex-shrink-0"
              style={{
                background: "rgba(35,215,255,0.1)",
                border: "1px solid rgba(35,215,255,0.3)",
                imageRendering: "pixelated",
              }}
            >
              <GamemodeIcon id={gamemode.id} size={44} />
            </div>
            <div>
              <h1
                className="text-3xl md:text-4xl font-extrabold uppercase tracking-widest"
                style={{
                  fontFamily: "BricolageGrotesque",
                  color: "#F2F5FF",
                  letterSpacing: "0.1em",
                }}
              >
                {gamemode.name}
              </h1>
              <p style={{ color: "#9AA3B2" }}>{gamemode.description}</p>
              <p className="text-sm mt-1" style={{ color: "#9AA3B2" }}>
                {rankedPlayers.length} players ranked
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-10" data-ocid="gamemode.list">
          {TIER_GROUPS.map(({ label, prefix, desc }) => {
            const groupPlayers = rankedPlayers.filter(
              ({ tier }) => getTierCategory(tier) === prefix,
            );
            const colors = getTierColor(`${prefix}1` as Tier);
            if (groupPlayers.length === 0) return null;
            return (
              <div key={prefix}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.text}44`,
                      boxShadow: `0 0 15px ${colors.glow}30`,
                      fontFamily: "BricolageGrotesque",
                      letterSpacing: "0.15em",
                    }}
                  >
                    {label}
                  </span>
                  <span className="text-xs" style={{ color: "#9AA3B2" }}>
                    {desc}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupPlayers.map(({ player, tier }, i) => (
                    <Link
                      key={player.username}
                      to="/players/$username"
                      params={{ username: player.username }}
                      data-ocid={`gamemode.item.${i + 1}`}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
                      style={{
                        backgroundColor: "#141821",
                        border: `1px solid ${colors.text}20`,
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLAnchorElement
                        ).style.borderColor = `${colors.text}50`;
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                          `0 0 15px ${colors.glow}20`;
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLAnchorElement
                        ).style.borderColor = `${colors.text}20`;
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                          "none";
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${colors.text}60, ${colors.text}30)`,
                          color: "#fff",
                        }}
                      >
                        {player.username.charAt(0)}
                      </div>
                      <span
                        className="flex-1 font-semibold text-sm"
                        style={{
                          color: "#F2F5FF",
                          fontFamily: "BricolageGrotesque",
                        }}
                      >
                        {player.username}
                      </span>
                      <TierBadge tier={tier} size="sm" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {rankedPlayers.length === 0 && (
          <div className="text-center py-20" data-ocid="gamemode.empty_state">
            <div className="text-5xl mb-4">📋</div>
            <p style={{ color: "#9AA3B2" }}>
              No players ranked in this gamemode yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

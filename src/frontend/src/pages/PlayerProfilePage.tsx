import { Link, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import GamemodeIcon from "../components/GamemodeIcon";
import { TagBadge } from "../components/LeaderboardRow";
import TierBadge from "../components/TierBadge";
import { GAMEMODES } from "../data/dummyData";
import type { GamemodeId } from "../data/dummyData";
import { useAllProfiles, usePlayerByUsername } from "../hooks/useQueries";

function getAvatarColors(username: string): [string, string] {
  const palettes: Array<[string, string]> = [
    ["#23D7FF", "#A855F7"],
    ["#A855F7", "#7C3AED"],
    ["#22D3EE", "#9333EA"],
    ["#06B6D4", "#C084FC"],
    ["#38BDF8", "#A855F7"],
  ];
  return palettes[username.charCodeAt(0) % palettes.length];
}

export default function PlayerProfilePage() {
  const { username } = useParams({ from: "/players/$username" });
  const { data: player, isLoading } = usePlayerByUsername(username);
  const { data: profiles = [] } = useAllProfiles();

  const tags = useMemo(() => {
    const entry = profiles.find((p) => p.name === username);
    return entry?.tags ?? [];
  }, [profiles, username]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0B0D10" }}
      >
        <div
          className="flex flex-col items-center gap-4"
          data-ocid="profile.loading_state"
        >
          <div
            className="w-16 h-16 rounded-full animate-pulse"
            style={{ backgroundColor: "#141821" }}
          />
          <div
            className="h-4 w-32 rounded animate-pulse"
            style={{ backgroundColor: "#141821" }}
          />
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0B0D10" }}
      >
        <div className="text-center" data-ocid="profile.error_state">
          <div className="text-6xl mb-4">👤</div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "#F2F5FF", fontFamily: "BricolageGrotesque" }}
          >
            Player Not Found
          </h2>
          <Link to="/leaderboard" style={{ color: "#23D7FF" }}>
            ← Back to Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  const [c1, c2] = getAvatarColors(player.username);
  const rankedModes = GAMEMODES.filter(
    (gm) => player.ranks[gm.id as GamemodeId],
  );

  return (
    <div
      className="py-16 px-4"
      style={{ backgroundColor: "#0B0D10", minHeight: "80vh" }}
    >
      <div className="max-w-3xl mx-auto">
        <Link
          to="/leaderboard"
          className="text-sm mb-8 inline-block"
          style={{ color: "#9AA3B2" }}
        >
          ← Back to Leaderboard
        </Link>

        <div
          className="rounded-2xl p-8 mb-8"
          style={{
            backgroundColor: "#141821",
            border: "1px solid rgba(35,215,255,0.2)",
            boxShadow: "0 0 40px rgba(35,215,255,0.08)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${c1}, ${c2})`,
                boxShadow: `0 0 30px ${c1}60`,
                color: "#fff",
                fontFamily: "BricolageGrotesque",
              }}
            >
              {player.username.charAt(0).toUpperCase()}
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
                <h1
                  className="text-3xl font-extrabold"
                  style={{ fontFamily: "BricolageGrotesque", color: "#F2F5FF" }}
                >
                  {player.username}
                </h1>
              </div>
              {tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-2 justify-center sm:justify-start">
                  {tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              )}
              {player.discord && (
                <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                  <span className="text-sm" style={{ color: "#9AA3B2" }}>
                    💬
                  </span>
                  <span className="text-sm" style={{ color: "#9AA3B2" }}>
                    {player.discord}
                  </span>
                </div>
              )}
              <div className="mt-3">
                <span className="text-sm" style={{ color: "#9AA3B2" }}>
                  {rankedModes.length} gamemodes ranked
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2
            className="text-lg font-bold uppercase tracking-widest mb-5"
            style={{
              fontFamily: "BricolageGrotesque",
              color: "#F2F5FF",
              letterSpacing: "0.12em",
            }}
          >
            Gamemode Rankings
          </h2>
          {rankedModes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rankedModes.map((gm, i) => {
                const tier = player.ranks[gm.id as GamemodeId]!;
                return (
                  <Link
                    key={gm.id}
                    to="/gamemodes/$id"
                    params={{ id: gm.id }}
                    data-ocid={`profile.item.${i + 1}`}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
                    style={{
                      backgroundColor: "#141821",
                      border: "1px solid rgba(35,215,255,0.1)",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor =
                        "rgba(35,215,255,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor =
                        "rgba(35,215,255,0.1)";
                    }}
                  >
                    <GamemodeIcon id={gm.id} size={24} />
                    <span
                      className="flex-1 font-semibold text-sm"
                      style={{
                        color: "#F2F5FF",
                        fontFamily: "BricolageGrotesque",
                      }}
                    >
                      {gm.name}
                    </span>
                    <TierBadge tier={tier} size="md" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8" data-ocid="profile.empty_state">
              <p style={{ color: "#9AA3B2" }}>No gamemodes ranked yet.</p>
            </div>
          )}
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "#141821",
            border: "1px solid rgba(168,85,247,0.2)",
          }}
        >
          <h2
            className="text-lg font-bold uppercase tracking-widest mb-4"
            style={{
              fontFamily: "BricolageGrotesque",
              color: "#F2F5FF",
              letterSpacing: "0.12em",
            }}
          >
            🎛️ Proof / Evidence
          </h2>
          <p className="text-xs mt-3" style={{ color: "#9AA3B2" }}>
            All rankings are proof-based and verified by certified tier testers.
          </p>
        </div>
      </div>
    </div>
  );
}

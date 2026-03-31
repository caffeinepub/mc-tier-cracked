import { Link } from "@tanstack/react-router";
import GamemodeCard from "../components/GamemodeCard";
import HeroSection from "../components/HeroSection";
import LeaderboardRow from "../components/LeaderboardRow";
import SectionHeader from "../components/SectionHeader";
import { GAMEMODES, TIER_ORDER } from "../data/dummyData";
import { useApprovedPlayers } from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

export default function HomePage() {
  const { data: players = [], isLoading } = useApprovedPlayers();

  const topPlayers = players
    .map((p) => {
      const tierIndices = Object.values(p.ranks).map((t) =>
        TIER_ORDER.indexOf(t),
      );
      const bestTierIdx = Math.min(...tierIndices);
      const bestTier = TIER_ORDER[bestTierIdx];
      return { player: p, tier: bestTier };
    })
    .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))
    .slice(0, 6);

  const gamemodePlayerCounts = GAMEMODES.map((gm) => ({
    gm,
    count: players.filter((p) => p.ranks[gm.id]).length,
  }));

  return (
    <div>
      <HeroSection />

      <section className="py-20 px-4" style={{ backgroundColor: "#0B0D10" }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Featured Game Modes"
            subtitle="Choose a gamemode to explore rankings and tier lists"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {gamemodePlayerCounts.map(({ gm, count }) => (
              <GamemodeCard key={gm.id} gamemode={gm} playerCount={count} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/gamemodes"
              data-ocid="home.secondary_button"
              className="inline-block px-8 py-3 rounded-full text-sm font-bold tracking-widest"
              style={{
                border: "1px solid rgba(35,215,255,0.4)",
                color: "#23D7FF",
                letterSpacing: "0.12em",
                backgroundColor: "rgba(35,215,255,0.06)",
                transition: "all 0.2s",
              }}
            >
              VIEW ALL GAMEMODES
            </Link>
          </div>
        </div>
      </section>

      <section
        className="py-20 px-4"
        style={{
          backgroundColor: "#0F1216",
          borderTop: "1px solid rgba(35,215,255,0.08)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            title="Top Players Leaderboard"
            subtitle="Best ranked players across all gamemodes"
          />
          {isLoading ? (
            <div
              className="flex flex-col gap-2"
              data-ocid="leaderboard.loading_state"
            >
              {SKELETON_KEYS.map((k) => (
                <div
                  key={k}
                  className="h-14 rounded-xl animate-pulse"
                  style={{ backgroundColor: "#141821" }}
                />
              ))}
            </div>
          ) : topPlayers.length > 0 ? (
            <div className="flex flex-col gap-2" data-ocid="leaderboard.list">
              {topPlayers.map(({ player, tier }, i) => (
                <LeaderboardRow
                  key={player.username}
                  rank={i + 1}
                  player={player}
                  tier={tier}
                  index={i + 1}
                />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-12"
              data-ocid="leaderboard.empty_state"
            >
              <p style={{ color: "#9AA3B2" }}>
                No approved players yet. Check back soon!
              </p>
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              to="/leaderboard"
              data-ocid="home.primary_button"
              className="cta-gradient inline-block px-8 py-3 rounded-full text-sm font-bold tracking-widest text-white"
              style={{ letterSpacing: "0.12em" }}
            >
              FULL LEADERBOARD
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

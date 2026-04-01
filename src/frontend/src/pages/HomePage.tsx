import { useMemo } from "react";
import type { PlayerTag } from "../backend.d";
import HeroSection from "../components/HeroSection";
import LeaderboardRow from "../components/LeaderboardRow";
import SectionHeader from "../components/SectionHeader";
import { TIER_ORDER } from "../data/dummyData";
import type { Tier } from "../data/dummyData";
import { useAllProfiles, useApprovedPlayers } from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

export default function HomePage() {
  const { data: players = [], isLoading } = useApprovedPlayers();
  const { data: profiles = [] } = useAllProfiles();

  const tagsByUsername = useMemo(() => {
    const map: Record<string, PlayerTag[]> = {};
    for (const p of profiles) {
      map[p.name] = p.tags;
    }
    return map;
  }, [profiles]);

  // Each player ranked by their best tier across all gamemodes
  const rankedPlayers = useMemo(() => {
    return players
      .map((p) => {
        const tiers = Object.values(p.ranks).filter(Boolean) as Tier[];
        const bestTier = tiers.sort(
          (a, b) => TIER_ORDER.indexOf(a) - TIER_ORDER.indexOf(b),
        )[0];
        return bestTier ? { player: p, tier: bestTier } : null;
      })
      .filter(
        (x): x is { player: (typeof players)[0]; tier: Tier } => x !== null,
      )
      .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
  }, [players]);

  return (
    <div>
      <HeroSection />

      {/* Player Rankings */}
      <section
        className="py-20 px-4"
        style={{
          backgroundColor: "#0F1216",
          borderTop: "1px solid rgba(35,215,255,0.08)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Player Rankings"
            subtitle="Top ranked players — sorted by tier"
          />

          {isLoading ? (
            <div
              className="flex flex-col gap-1.5"
              data-ocid="leaderboard.loading_state"
            >
              {SKELETON_KEYS.map((k) => (
                <div
                  key={k}
                  className="h-16 rounded-xl animate-pulse"
                  style={{ backgroundColor: "#141821" }}
                />
              ))}
            </div>
          ) : rankedPlayers.length > 0 ? (
            <div className="flex flex-col gap-1.5" data-ocid="leaderboard.list">
              {rankedPlayers.map(({ player, tier }, i) => (
                <LeaderboardRow
                  key={player.username}
                  rank={i + 1}
                  player={player}
                  tier={tier}
                  index={i + 1}
                  tags={tagsByUsername[player.username] ?? []}
                />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-20"
              data-ocid="leaderboard.empty_state"
            >
              <div className="text-5xl mb-4">📋</div>
              <p style={{ color: "#9AA3B2" }}>No players ranked yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

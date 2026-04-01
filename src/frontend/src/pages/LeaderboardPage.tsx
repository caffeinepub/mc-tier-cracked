import { useMemo, useState } from "react";
import type { PlayerTag } from "../backend.d";
import GamemodeIcon from "../components/GamemodeIcon";
import LeaderboardRow from "../components/LeaderboardRow";
import SectionHeader from "../components/SectionHeader";
import { GAMEMODES, TIER_ORDER } from "../data/dummyData";
import type { GamemodeId, Tier } from "../data/dummyData";
import { useAllProfiles, useApprovedPlayers } from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

export default function LeaderboardPage() {
  const [selectedMode, setSelectedMode] = useState<GamemodeId>(GAMEMODES[0].id);
  const { data: players = [], isLoading } = useApprovedPlayers();
  const { data: profiles = [] } = useAllProfiles();

  const tagsByUsername = useMemo(() => {
    const map: Record<string, PlayerTag[]> = {};
    for (const p of profiles) {
      map[p.name] = p.tags;
    }
    return map;
  }, [profiles]);

  const rankedPlayers = players
    .filter((p) => p.ranks[selectedMode])
    .map((p) => ({ player: p, tier: p.ranks[selectedMode]! as Tier }))
    .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));

  const selectedGamemode = GAMEMODES.find((g) => g.id === selectedMode);

  return (
    <div
      className="py-16 px-4"
      style={{ backgroundColor: "#0B0D10", minHeight: "80vh" }}
    >
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title="Leaderboard"
          subtitle="Top ranked players — sorted by tier"
        />

        <div
          className="flex flex-wrap gap-2 justify-center mb-12"
          data-ocid="leaderboard.tab"
        >
          {GAMEMODES.map((gm) => (
            <button
              type="button"
              key={gm.id}
              onClick={() => setSelectedMode(gm.id)}
              data-ocid="leaderboard.tab"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-widest transition-all duration-200"
              style={{
                backgroundColor:
                  selectedMode === gm.id
                    ? "rgba(35,215,255,0.15)"
                    : "rgba(255,255,255,0.04)",
                color: selectedMode === gm.id ? "#23D7FF" : "#9AA3B2",
                border:
                  selectedMode === gm.id
                    ? "1px solid rgba(35,215,255,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  selectedMode === gm.id
                    ? "0 0 14px rgba(35,215,255,0.25)"
                    : "none",
                letterSpacing: "0.1em",
              }}
            >
              <GamemodeIcon id={gm.id} size={14} />
              <span>{gm.name.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {selectedGamemode && (
          <div
            className="flex items-center gap-3 mb-6 px-5 py-3.5 rounded-xl"
            style={{
              backgroundColor: "#141821",
              border: "1px solid rgba(35,215,255,0.15)",
            }}
          >
            <GamemodeIcon id={selectedGamemode.id} size={24} />
            <div>
              <h3
                className="font-bold"
                style={{ color: "#F2F5FF", fontFamily: "BricolageGrotesque" }}
              >
                {selectedGamemode.name}
              </h3>
              <p className="text-xs" style={{ color: "#9AA3B2" }}>
                {selectedGamemode.description}
              </p>
            </div>
            <span
              className="ml-auto text-sm font-bold"
              style={{ color: "#23D7FF" }}
            >
              {rankedPlayers.length} players
            </span>
          </div>
        )}

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
            {rankedPlayers.map(({ player }, i) => (
              <LeaderboardRow
                key={player.username}
                rank={i + 1}
                player={player}
                ranks={player.ranks}
                modeId={selectedMode}
                modeName={selectedGamemode?.name}
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
            <p style={{ color: "#9AA3B2" }}>No approved players yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

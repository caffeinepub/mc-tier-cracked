import GamemodeCard from "../components/GamemodeCard";
import SectionHeader from "../components/SectionHeader";
import { GAMEMODES, getPlayersForMode } from "../data/dummyData";

export default function GamemodesPage() {
  return (
    <div
      className="py-16 px-4"
      style={{ backgroundColor: "#0B0D10", minHeight: "80vh" }}
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="All Gamemodes"
          subtitle="Select a gamemode to view its complete tier list and rankings"
        />
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          data-ocid="gamemodes.list"
        >
          {GAMEMODES.map((gm, i) => (
            <div key={gm.id} data-ocid={`gamemodes.item.${i + 1}`}>
              <GamemodeCard
                gamemode={gm}
                playerCount={getPlayersForMode(gm.id).length}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

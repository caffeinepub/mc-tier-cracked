import { useNavigate } from "@tanstack/react-router";
import type { Gamemode } from "../data/dummyData";
import GamemodeIcon from "./GamemodeIcon";

interface GamemodeCardProps {
  gamemode: Gamemode;
}

export default function GamemodeCard({ gamemode }: GamemodeCardProps) {
  const navigate = useNavigate();
  const isCyan = gamemode.color === "cyan";
  const borderColor = isCyan
    ? "rgba(35,215,255,0.25)"
    : gamemode.color === "purple"
      ? "rgba(168,85,247,0.25)"
      : "rgba(100,150,255,0.25)";
  const glowColor = isCyan
    ? "rgba(35,215,255,0.2)"
    : gamemode.color === "purple"
      ? "rgba(168,85,247,0.2)"
      : "rgba(100,150,255,0.2)";
  const accentColor = isCyan
    ? "#23D7FF"
    : gamemode.color === "purple"
      ? "#A855F7"
      : "#7A9CF7";

  return (
    <button
      type="button"
      data-ocid="gamemode.card"
      onClick={() =>
        navigate({ to: "/gamemodes/$id", params: { id: gamemode.id } })
      }
      className="card-hover text-left w-full rounded-2xl p-6 flex flex-col items-center gap-4 cursor-pointer"
      style={{
        backgroundColor: "#141821",
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 20px ${glowColor}`,
      }}
    >
      <div
        className="flex items-center justify-center w-20 h-20 rounded-2xl"
        style={{
          background: `radial-gradient(circle, ${accentColor}20 0%, ${accentColor}05 70%)`,
          border: `1px solid ${accentColor}30`,
          imageRendering: "pixelated",
        }}
      >
        <GamemodeIcon id={gamemode.id} size={40} />
      </div>
      <div className="text-center">
        <h3
          className="font-bold text-base uppercase tracking-widest mb-1"
          style={{
            fontFamily: "BricolageGrotesque",
            color: "#F2F5FF",
            letterSpacing: "0.1em",
          }}
        >
          {gamemode.name}
        </h3>
        <p className="text-xs mb-3" style={{ color: "#9AA3B2" }}>
          {gamemode.description}
        </p>
      </div>
      <div
        className="mt-auto px-5 py-2 rounded-full text-xs font-bold tracking-widest w-full text-center"
        style={{
          border: `1px solid ${accentColor}50`,
          color: accentColor,
          backgroundColor: `${accentColor}10`,
          letterSpacing: "0.12em",
          transition: "all 0.2s",
        }}
      >
        VIEW TIER
      </div>
    </button>
  );
}

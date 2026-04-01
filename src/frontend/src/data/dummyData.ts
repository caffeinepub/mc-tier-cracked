export type Tier = "HT Peak" | "HT" | "HT Low" | "LT Peak" | "LT" | "LT Low";

export type GamemodeId =
  | "axe-pvp"
  | "sword-pvp"
  | "crystal-pvp"
  | "uhc"
  | "nethpot"
  | "smp-pvp"
  | "mace-pvp"
  | "cart-pvp";

export interface Gamemode {
  id: GamemodeId;
  name: string;
  description: string;
  color: "cyan" | "purple" | "mixed";
}

export interface Player {
  username: string;
  discord: string;
  avatar: string;
  ranks: Partial<Record<GamemodeId, Tier>>;
  proof: string;
  testerVerified?: boolean;
}

export const GAMEMODES: Gamemode[] = [
  {
    id: "axe-pvp",
    name: "Axe PvP",
    description: "Mastery of axe combat mechanics",
    color: "cyan",
  },
  {
    id: "sword-pvp",
    name: "Sword PvP",
    description: "Classic sword fighting skill",
    color: "purple",
  },
  {
    id: "crystal-pvp",
    name: "Crystal PvP",
    description: "End crystal explosive combat",
    color: "cyan",
  },
  {
    id: "uhc",
    name: "UHC",
    description: "Ultra Hardcore survival combat",
    color: "purple",
  },
  {
    id: "nethpot",
    name: "Nethpot",
    description: "Nether potion PvP strategy",
    color: "cyan",
  },
  {
    id: "smp-pvp",
    name: "SMP PvP",
    description: "Survival multiplayer PvP combat",
    color: "purple",
  },
  {
    id: "mace-pvp",
    name: "Mace PvP",
    description: "Heavy mace combat",
    color: "cyan",
  },
  {
    id: "cart-pvp",
    name: "Cart PvP",
    description: "Minecart arena battles",
    color: "purple",
  },
];

export const TIER_ORDER: Tier[] = [
  "HT Peak",
  "HT",
  "HT Low",
  "LT Peak",
  "LT",
  "LT Low",
];

export const PLAYERS: Player[] = [
  {
    username: "VoidSlayer",
    discord: "VoidSlayer#0001",
    avatar: "",
    ranks: {
      "axe-pvp": "HT Peak",
      "sword-pvp": "HT",
      "crystal-pvp": "HT Peak",
      "mace-pvp": "HT",
      "cart-pvp": "LT Peak",
    },
    proof: "https://youtube.com/watch?v=example1",
    testerVerified: true,
  },
  {
    username: "NightBlade",
    discord: "NightBlade#4532",
    avatar: "",
    ranks: {
      "sword-pvp": "HT Peak",
      "axe-pvp": "HT Low",
      nethpot: "HT",
      uhc: "LT Peak",
      "mace-pvp": "LT Peak",
    },
    proof: "https://youtube.com/watch?v=example2",
  },
  {
    username: "CrystalKing",
    discord: "CrystalKing#7777",
    avatar: "",
    ranks: {
      "crystal-pvp": "HT",
      "axe-pvp": "LT Peak",
      "sword-pvp": "LT Peak",
      "smp-pvp": "HT Peak",
      "cart-pvp": "HT Low",
    },
    proof: "https://youtube.com/watch?v=example3",
    testerVerified: true,
  },
  {
    username: "UHCLegend",
    discord: "UHCLegend#1234",
    avatar: "",
    ranks: {
      uhc: "HT Peak",
      "sword-pvp": "HT Low",
      "axe-pvp": "HT Low",
      "mace-pvp": "HT Peak",
      "cart-pvp": "LT Low",
    },
    proof: "https://youtube.com/watch?v=example4",
  },
  {
    username: "PotionMaster",
    discord: "PotionMaster#9900",
    avatar: "",
    ranks: {
      nethpot: "HT Peak",
      "crystal-pvp": "LT Peak",
      "axe-pvp": "LT Peak",
      "smp-pvp": "LT Peak",
      "cart-pvp": "LT Peak",
    },
    proof: "https://youtube.com/watch?v=example6",
  },
  {
    username: "SMPWarrior",
    discord: "SMPWarrior#3321",
    avatar: "",
    ranks: {
      "smp-pvp": "HT",
      "axe-pvp": "HT Low",
      "sword-pvp": "LT",
      "mace-pvp": "LT Peak",
      "cart-pvp": "HT",
    },
    proof: "https://youtube.com/watch?v=example7",
    testerVerified: true,
  },
  {
    username: "ShadowAxe",
    discord: "ShadowAxe#1111",
    avatar: "",
    ranks: {
      "axe-pvp": "HT",
      "crystal-pvp": "HT Low",
      nethpot: "LT Peak",
      uhc: "LT Low",
      "mace-pvp": "LT",
    },
    proof: "https://youtube.com/watch?v=example8",
  },
  {
    username: "QuantumBlade",
    discord: "QuantumBlade#4400",
    avatar: "",
    ranks: {
      "sword-pvp": "HT Low",
      "axe-pvp": "LT Peak",
      "smp-pvp": "LT Peak",
      "cart-pvp": "LT Peak",
    },
    proof: "https://youtube.com/watch?v=example9",
  },
  {
    username: "IcePhantom",
    discord: "IcePhantom#6600",
    avatar: "",
    ranks: {
      "crystal-pvp": "HT Low",
      nethpot: "LT Peak",
      uhc: "HT",
      "axe-pvp": "LT",
      "mace-pvp": "HT Low",
    },
    proof: "https://youtube.com/watch?v=example10",
  },
  {
    username: "FireStrike",
    discord: "FireStrike#7890",
    avatar: "",
    ranks: {
      "axe-pvp": "LT",
      "sword-pvp": "LT",
      nethpot: "LT Low",
      "cart-pvp": "LT",
    },
    proof: "https://youtube.com/watch?v=example11",
  },
  {
    username: "NeonKnight",
    discord: "NeonKnight#0099",
    avatar: "",
    ranks: {
      "smp-pvp": "LT",
      uhc: "LT",
      "crystal-pvp": "LT",
      "axe-pvp": "LT Low",
      "mace-pvp": "LT",
    },
    proof: "https://youtube.com/watch?v=example12",
  },
  {
    username: "GhostRaider",
    discord: "GhostRaider#2233",
    avatar: "",
    ranks: {
      "sword-pvp": "LT Low",
      nethpot: "LT",
      "smp-pvp": "LT Low",
      "cart-pvp": "HT Low",
    },
    proof: "https://youtube.com/watch?v=example13",
  },
  {
    username: "StarCrusher",
    discord: "StarCrusher#5544",
    avatar: "",
    ranks: {
      uhc: "HT Low",
      "crystal-pvp": "LT Peak",
      "axe-pvp": "HT Low",
      "sword-pvp": "HT Low",
      "mace-pvp": "HT Low",
      "cart-pvp": "LT",
    },
    proof: "https://youtube.com/watch?v=example14",
  },
  {
    username: "DarkNova",
    discord: "DarkNova#8833",
    avatar: "",
    ranks: {
      nethpot: "HT Low",
      "smp-pvp": "HT Low",
      "crystal-pvp": "LT",
      "mace-pvp": "LT Peak",
      "cart-pvp": "HT Peak",
    },
    proof: "https://youtube.com/watch?v=example15",
  },
];

export function getTopRankForMode(
  player: Player,
  modeId: GamemodeId,
): Tier | null {
  return player.ranks[modeId] ?? null;
}

export function getTierCategory(tier: Tier | undefined | null): "HT" | "LT" {
  if (!tier) return "LT";
  if (tier.startsWith("HT")) return "HT";
  return "LT";
}

export function getPlayersForMode(
  modeId: GamemodeId,
): Array<{ player: Player; tier: Tier }> {
  return PLAYERS.filter((p) => p.ranks[modeId])
    .map((p) => ({ player: p, tier: p.ranks[modeId]! }))
    .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
}

export function getTierColor(tier: Tier): {
  bg: string;
  text: string;
  glow: string;
} {
  const cat = getTierCategory(tier);
  if (cat === "HT")
    return {
      bg: "rgba(35,215,255,0.15)",
      text: "#23D7FF",
      glow: "rgba(35,215,255,0.5)",
    };
  return {
    bg: "rgba(100,120,160,0.15)",
    text: "#7A9CC4",
    glow: "rgba(100,120,160,0.4)",
  };
}

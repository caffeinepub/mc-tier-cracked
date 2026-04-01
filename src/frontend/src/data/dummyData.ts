export type Tier =
  | "HT1"
  | "HT2"
  | "HT3"
  | "HT4"
  | "HT5"
  | "MT1"
  | "MT2"
  | "MT3"
  | "MT4"
  | "MT5"
  | "LT1"
  | "LT2"
  | "LT3"
  | "LT4"
  | "LT5";

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
  "HT1",
  "HT2",
  "HT3",
  "HT4",
  "HT5",
  "MT1",
  "MT2",
  "MT3",
  "MT4",
  "MT5",
  "LT1",
  "LT2",
  "LT3",
  "LT4",
  "LT5",
];

export const PLAYERS: Player[] = [
  {
    username: "VoidSlayer",
    discord: "VoidSlayer#0001",
    avatar: "",
    ranks: {
      "axe-pvp": "HT1",
      "sword-pvp": "HT2",
      "crystal-pvp": "HT1",
      "mace-pvp": "HT2",
      "cart-pvp": "MT1",
    },
    proof: "https://youtube.com/watch?v=example1",
    testerVerified: true,
  },
  {
    username: "NightBlade",
    discord: "NightBlade#4532",
    avatar: "",
    ranks: {
      "sword-pvp": "HT1",
      "axe-pvp": "HT3",
      nethpot: "HT2",
      uhc: "MT2",
      "mace-pvp": "MT3",
    },
    proof: "https://youtube.com/watch?v=example2",
  },
  {
    username: "CrystalKing",
    discord: "CrystalKing#7777",
    avatar: "",
    ranks: {
      "crystal-pvp": "HT2",
      "axe-pvp": "MT1",
      "sword-pvp": "MT3",
      "smp-pvp": "HT1",
      "cart-pvp": "HT3",
    },
    proof: "https://youtube.com/watch?v=example3",
    testerVerified: true,
  },
  {
    username: "UHCLegend",
    discord: "UHCLegend#1234",
    avatar: "",
    ranks: {
      uhc: "HT1",
      "sword-pvp": "HT3",
      "axe-pvp": "HT4",
      "mace-pvp": "HT1",
      "cart-pvp": "LT1",
    },
    proof: "https://youtube.com/watch?v=example4",
  },
  {
    username: "PotionMaster",
    discord: "PotionMaster#9900",
    avatar: "",
    ranks: {
      nethpot: "HT1",
      "crystal-pvp": "MT2",
      "axe-pvp": "MT2",
      "smp-pvp": "MT2",
      "cart-pvp": "MT2",
    },
    proof: "https://youtube.com/watch?v=example6",
  },
  {
    username: "SMPWarrior",
    discord: "SMPWarrior#3321",
    avatar: "",
    ranks: {
      "smp-pvp": "HT2",
      "axe-pvp": "HT5",
      "sword-pvp": "MT4",
      "mace-pvp": "MT1",
      "cart-pvp": "HT2",
    },
    proof: "https://youtube.com/watch?v=example7",
    testerVerified: true,
  },
  {
    username: "ShadowAxe",
    discord: "ShadowAxe#1111",
    avatar: "",
    ranks: {
      "axe-pvp": "HT2",
      "crystal-pvp": "HT3",
      nethpot: "MT1",
      uhc: "LT1",
      "mace-pvp": "LT2",
    },
    proof: "https://youtube.com/watch?v=example8",
  },
  {
    username: "QuantumBlade",
    discord: "QuantumBlade#4400",
    avatar: "",
    ranks: {
      "sword-pvp": "HT4",
      "axe-pvp": "MT3",
      "smp-pvp": "MT3",
      "cart-pvp": "MT3",
    },
    proof: "https://youtube.com/watch?v=example9",
  },
  {
    username: "IcePhantom",
    discord: "IcePhantom#6600",
    avatar: "",
    ranks: {
      "crystal-pvp": "HT4",
      nethpot: "MT2",
      uhc: "HT2",
      "axe-pvp": "MT4",
      "mace-pvp": "HT3",
    },
    proof: "https://youtube.com/watch?v=example10",
  },
  {
    username: "FireStrike",
    discord: "FireStrike#7890",
    avatar: "",
    ranks: {
      "axe-pvp": "MT5",
      "sword-pvp": "MT5",
      nethpot: "LT1",
      "cart-pvp": "LT2",
    },
    proof: "https://youtube.com/watch?v=example11",
  },
  {
    username: "NeonKnight",
    discord: "NeonKnight#0099",
    avatar: "",
    ranks: {
      "smp-pvp": "MT4",
      uhc: "MT4",
      "crystal-pvp": "MT5",
      "axe-pvp": "LT1",
      "mace-pvp": "MT4",
    },
    proof: "https://youtube.com/watch?v=example12",
  },
  {
    username: "GhostRaider",
    discord: "GhostRaider#2233",
    avatar: "",
    ranks: {
      "sword-pvp": "LT1",
      nethpot: "LT2",
      "smp-pvp": "LT1",
      "cart-pvp": "HT4",
    },
    proof: "https://youtube.com/watch?v=example13",
  },
  {
    username: "StarCrusher",
    discord: "StarCrusher#5544",
    avatar: "",
    ranks: {
      uhc: "HT3",
      "crystal-pvp": "MT3",
      "axe-pvp": "HT3",
      "sword-pvp": "HT5",
      "mace-pvp": "HT4",
      "cart-pvp": "MT4",
    },
    proof: "https://youtube.com/watch?v=example14",
  },
  {
    username: "DarkNova",
    discord: "DarkNova#8833",
    avatar: "",
    ranks: {
      nethpot: "HT3",
      "smp-pvp": "HT3",
      "crystal-pvp": "LT2",
      "mace-pvp": "MT2",
      "cart-pvp": "HT1",
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

export function getTierCategory(
  tier: Tier | undefined | null,
): "HT" | "MT" | "LT" {
  if (!tier) return "LT";
  if (tier.startsWith("HT")) return "HT";
  if (tier.startsWith("MT")) return "MT";
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
  if (cat === "MT")
    return {
      bg: "rgba(168,85,247,0.15)",
      text: "#A855F7",
      glow: "rgba(168,85,247,0.5)",
    };
  return {
    bg: "rgba(100,120,160,0.15)",
    text: "#7A9CC4",
    glow: "rgba(100,120,160,0.4)",
  };
}

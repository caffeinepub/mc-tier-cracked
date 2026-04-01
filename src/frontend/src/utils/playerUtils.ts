import type { Tier as BackendTier } from "../backend.d";
import type { Player as BackendPlayer } from "../backend.d";
import type {
  GamemodeId,
  Player as LocalPlayer,
  Tier as LocalTier,
} from "../data/dummyData";
import { TIER_ORDER } from "../data/dummyData";

// ht1-ht5 = HT1 Peak through HT5 Peak (best of each HT tier)
// mt1-mt5 = HT1 Low through HT5 Low (lowest of each HT tier)
// lt1-lt5 = LT1 Peak through LT5 Peak
const BACKEND_TO_LOCAL: Record<string, LocalTier> = {
  ht1: "HT1 Peak",
  ht2: "HT2 Peak",
  ht3: "HT3 Peak",
  ht4: "HT4 Peak",
  ht5: "HT5 Peak",
  mt1: "HT1 Low",
  mt2: "HT2 Low",
  mt3: "HT3 Low",
  mt4: "HT4 Low",
  mt5: "HT5 Low",
  lt1: "LT1 Peak",
  lt2: "LT2 Peak",
  lt3: "LT3 Peak",
  lt4: "LT4 Peak",
  lt5: "LT5 Peak",
};

const LOCAL_TO_BACKEND: Record<string, string> = {
  "HT1 Peak": "ht1",
  "HT2 Peak": "ht2",
  "HT3 Peak": "ht3",
  "HT4 Peak": "ht4",
  "HT5 Peak": "ht5",
  "HT1 Low": "mt1",
  "HT2 Low": "mt2",
  "HT3 Low": "mt3",
  "HT4 Low": "mt4",
  "HT5 Low": "mt5",
  "LT1 Peak": "lt1",
  "LT2 Peak": "lt2",
  "LT3 Peak": "lt3",
  "LT4 Peak": "lt4",
  "LT5 Peak": "lt5",
  none: "none",
};

export function backendTierToLocal(tier: BackendTier): LocalTier | null {
  return BACKEND_TO_LOCAL[tier as string] ?? null;
}

export function localTierToBackend(tier: string): BackendTier {
  return (LOCAL_TO_BACKEND[tier] ?? "none") as BackendTier;
}

export function backendPlayerToLocal(player: BackendPlayer): LocalPlayer {
  const ranks: Partial<Record<GamemodeId, LocalTier>> = {};

  const axe = backendTierToLocal(player.axePvpTier);
  const sword = backendTierToLocal(player.swordPvpTier);
  const crystal = backendTierToLocal(player.crystalPvpTier);
  const uhc = backendTierToLocal(player.uhcTier);
  const nethpot = backendTierToLocal(player.nethpotTier);
  const smp = backendTierToLocal(player.smpPvpTier);
  const mace = backendTierToLocal(player.macePvpTier);
  const cart = backendTierToLocal(player.cartPvpTier);

  if (axe) ranks["axe-pvp"] = axe;
  if (sword) ranks["sword-pvp"] = sword;
  if (crystal) ranks["crystal-pvp"] = crystal;
  if (uhc) ranks.uhc = uhc;
  if (nethpot) ranks.nethpot = nethpot;
  if (smp) ranks["smp-pvp"] = smp;
  if (mace) ranks["mace-pvp"] = mace;
  if (cart) ranks["cart-pvp"] = cart;

  return {
    username: player.username,
    discord: player.discord ?? "",
    avatar: "",
    ranks,
    proof: "",
    testerVerified: false,
  };
}

export function getBestTier(player: LocalPlayer): LocalTier | null {
  const tiers = Object.values(player.ranks);
  if (!tiers.length) return null;
  const best = tiers.reduce((a, b) =>
    TIER_ORDER.indexOf(a) <= TIER_ORDER.indexOf(b) ? a : b,
  );
  return best;
}

export const ALL_TIER_OPTIONS: Array<LocalTier | "none"> = [
  "HT1 Peak",
  "HT1 Low",
  "HT2 Peak",
  "HT2 Low",
  "HT3 Peak",
  "HT3 Low",
  "HT4 Peak",
  "HT4 Low",
  "HT5 Peak",
  "HT5 Low",
  "LT1 Peak",
  "LT2 Peak",
  "LT3 Peak",
  "LT4 Peak",
  "LT5 Peak",
  "none",
];

export const BACKEND_TIER_LABELS: Record<string, string> = {
  ht1: "HT1 Peak",
  ht2: "HT2 Peak",
  ht3: "HT3 Peak",
  ht4: "HT4 Peak",
  ht5: "HT5 Peak",
  mt1: "HT1 Low",
  mt2: "HT2 Low",
  mt3: "HT3 Low",
  mt4: "HT4 Low",
  mt5: "HT5 Low",
  lt1: "LT1 Peak",
  lt2: "LT2 Peak",
  lt3: "LT3 Peak",
  lt4: "LT4 Peak",
  lt5: "LT5 Peak",
  none: "None",
};

import type { Tier as BackendTier } from "../backend.d";
import type { Player as BackendPlayer } from "../backend.d";
import type {
  GamemodeId,
  Player as LocalPlayer,
  Tier as LocalTier,
} from "../data/dummyData";
import { TIER_ORDER } from "../data/dummyData";

// ht1-ht5 = HT1-5 Peak
// ht1low-ht5low = HT1-5 Low
// lt1-lt5 = LT1-5 Peak
// mt1-mt5 = LT1-5 Low
const BACKEND_TO_LOCAL: Record<string, LocalTier> = {
  ht1: "HT1 Peak",
  ht1low: "HT1 Low",
  lt1: "LT1 Peak",
  mt1: "LT1 Low",
  ht2: "HT2 Peak",
  ht2low: "HT2 Low",
  lt2: "LT2 Peak",
  mt2: "LT2 Low",
  ht3: "HT3 Peak",
  ht3low: "HT3 Low",
  lt3: "LT3 Peak",
  mt3: "LT3 Low",
  ht4: "HT4 Peak",
  ht4low: "HT4 Low",
  lt4: "LT4 Peak",
  mt4: "LT4 Low",
  ht5: "HT5 Peak",
  ht5low: "HT5 Low",
  lt5: "LT5 Peak",
  mt5: "LT5 Low",
};

const LOCAL_TO_BACKEND: Record<string, string> = {
  "HT1 Peak": "ht1",
  "HT1 Low": "ht1low",
  "LT1 Peak": "lt1",
  "LT1 Low": "mt1",
  "HT2 Peak": "ht2",
  "HT2 Low": "ht2low",
  "LT2 Peak": "lt2",
  "LT2 Low": "mt2",
  "HT3 Peak": "ht3",
  "HT3 Low": "ht3low",
  "LT3 Peak": "lt3",
  "LT3 Low": "mt3",
  "HT4 Peak": "ht4",
  "HT4 Low": "ht4low",
  "LT4 Peak": "lt4",
  "LT4 Low": "mt4",
  "HT5 Peak": "ht5",
  "HT5 Low": "ht5low",
  "LT5 Peak": "lt5",
  "LT5 Low": "mt5",
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
  "LT1 Peak",
  "LT1 Low",
  "HT2 Peak",
  "HT2 Low",
  "LT2 Peak",
  "LT2 Low",
  "HT3 Peak",
  "HT3 Low",
  "LT3 Peak",
  "LT3 Low",
  "HT4 Peak",
  "HT4 Low",
  "LT4 Peak",
  "LT4 Low",
  "HT5 Peak",
  "HT5 Low",
  "LT5 Peak",
  "LT5 Low",
  "none",
];

export const BACKEND_TIER_LABELS: Record<string, string> = {
  ht1: "HT1 Peak",
  ht1low: "HT1 Low",
  lt1: "LT1 Peak",
  mt1: "LT1 Low",
  ht2: "HT2 Peak",
  ht2low: "HT2 Low",
  lt2: "LT2 Peak",
  mt2: "LT2 Low",
  ht3: "HT3 Peak",
  ht3low: "HT3 Low",
  lt3: "LT3 Peak",
  mt3: "LT3 Low",
  ht4: "HT4 Peak",
  ht4low: "HT4 Low",
  lt4: "LT4 Peak",
  mt4: "LT4 Low",
  ht5: "HT5 Peak",
  ht5low: "HT5 Low",
  lt5: "LT5 Peak",
  mt5: "LT5 Low",
  none: "None",
};

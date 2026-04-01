import type { Tier as BackendTier } from "../backend.d";
import type { Player as BackendPlayer } from "../backend.d";
import type {
  GamemodeId,
  Player as LocalPlayer,
  Tier as LocalTier,
} from "../data/dummyData";
import { TIER_ORDER } from "../data/dummyData";

// New 3-level tier system per category (no MT)
// ht1 = HT Peak, ht2 = HT, ht3 = HT Low
// lt1 = LT Peak, lt2 = LT, lt3 = LT Low
const BACKEND_TO_LOCAL: Record<string, LocalTier> = {
  ht1: "HT Peak",
  ht2: "HT",
  ht3: "HT Low",
  ht4: "HT Low",
  ht5: "HT Low",
  lt1: "LT Peak",
  lt2: "LT",
  lt3: "LT Low",
  lt4: "LT Low",
  lt5: "LT Low",
  // MT tiers are no longer used; treat as LT Peak
  mt1: "LT Peak",
  mt2: "LT Peak",
  mt3: "LT",
  mt4: "LT",
  mt5: "LT Low",
};

const LOCAL_TO_BACKEND: Record<string, BackendTier> = {
  "HT Peak": "ht1" as BackendTier,
  HT: "ht2" as BackendTier,
  "HT Low": "ht3" as BackendTier,
  "LT Peak": "lt1" as BackendTier,
  LT: "lt2" as BackendTier,
  "LT Low": "lt3" as BackendTier,
  none: "none" as BackendTier,
};

export function backendTierToLocal(tier: BackendTier): LocalTier | null {
  return BACKEND_TO_LOCAL[tier as string] ?? null;
}

export function localTierToBackend(tier: string): BackendTier {
  return LOCAL_TO_BACKEND[tier] ?? ("none" as BackendTier);
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
  "HT Peak",
  "HT",
  "HT Low",
  "LT Peak",
  "LT",
  "LT Low",
  "none",
];

// Label mapping for backend tier enum values used in dropdowns
export const BACKEND_TIER_LABELS: Record<string, string> = {
  ht1: "HT Peak",
  ht2: "HT",
  ht3: "HT Low",
  ht4: "HT Low",
  ht5: "HT Low",
  lt1: "LT Peak",
  lt2: "LT",
  lt3: "LT Low",
  lt4: "LT Low",
  lt5: "LT Low",
  none: "None",
};

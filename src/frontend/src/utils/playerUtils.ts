import type { Tier as BackendTier } from "../backend.d";
import type { Player as BackendPlayer } from "../backend.d";
import type {
  GamemodeId,
  Player as LocalPlayer,
  Tier as LocalTier,
} from "../data/dummyData";
import { TIER_ORDER } from "../data/dummyData";

const BACKEND_TO_LOCAL: Record<string, LocalTier> = {
  ht1: "HT1",
  ht2: "HT2",
  ht3: "HT3",
  ht4: "HT4",
  ht5: "HT5",
  mt1: "MT1",
  mt2: "MT2",
  mt3: "MT3",
  mt4: "MT4",
  mt5: "MT5",
  lt1: "LT1",
  lt2: "LT2",
  lt3: "LT3",
  lt4: "LT4",
  lt5: "LT5",
};

const LOCAL_TO_BACKEND: Record<string, BackendTier> = {
  HT1: "ht1" as BackendTier,
  HT2: "ht2" as BackendTier,
  HT3: "ht3" as BackendTier,
  HT4: "ht4" as BackendTier,
  HT5: "ht5" as BackendTier,
  MT1: "mt1" as BackendTier,
  MT2: "mt2" as BackendTier,
  MT3: "mt3" as BackendTier,
  MT4: "mt4" as BackendTier,
  MT5: "mt5" as BackendTier,
  LT1: "lt1" as BackendTier,
  LT2: "lt2" as BackendTier,
  LT3: "lt3" as BackendTier,
  LT4: "lt4" as BackendTier,
  LT5: "lt5" as BackendTier,
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
  // biome: use dot notation for simple keys
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
  "none",
];

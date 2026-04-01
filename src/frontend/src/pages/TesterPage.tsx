import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  Clock,
  Loader2,
  Star,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ApplicationStatus, Player as BackendPlayer } from "../backend.d";
import { Tier } from "../backend.d";
import GamemodeIcon from "../components/GamemodeIcon";
import SectionHeader from "../components/SectionHeader";
import TierBadge from "../components/TierBadge";
import { GAMEMODES } from "../data/dummyData";
import type { GamemodeId } from "../data/dummyData";
import { useAuth } from "../hooks/useAuth";
import {
  useAllApplicationsWithPrincipals,
  useAllProfiles,
  useCallerProfileEntry,
  useOwnedApplications,
  useTesterSubmitForOtherPlayer,
} from "../hooks/useQueries";
import { backendTierToLocal } from "../utils/playerUtils";

const GAMEMODE_FIELDS: Array<{
  id: GamemodeId;
  backendKey: string;
  playerKey: keyof BackendPlayer;
  label: string;
}> = [
  {
    id: "axe-pvp",
    backendKey: "axePvp",
    playerKey: "axePvpTier",
    label: "Axe PvP",
  },
  {
    id: "sword-pvp",
    backendKey: "swordPvp",
    playerKey: "swordPvpTier",
    label: "Sword PvP",
  },
  {
    id: "crystal-pvp",
    backendKey: "crystalPvp",
    playerKey: "crystalPvpTier",
    label: "Crystal PvP",
  },
  { id: "uhc", backendKey: "uhc", playerKey: "uhcTier", label: "UHC" },
  {
    id: "nethpot",
    backendKey: "nethpot",
    playerKey: "nethpotTier",
    label: "Nethpot",
  },
  {
    id: "smp-pvp",
    backendKey: "smpPvp",
    playerKey: "smpPvpTier",
    label: "SMP PvP",
  },
  {
    id: "mace-pvp",
    backendKey: "macePvp",
    playerKey: "macePvpTier",
    label: "Mace PvP",
  },
  {
    id: "cart-pvp",
    backendKey: "cartPvp",
    playerKey: "cartPvpTier",
    label: "Cart PvP",
  },
];

const TIER_OPTIONS: Array<{ value: Tier; label: string }> = [
  { value: Tier.ht1, label: "HT1 Peak" },
  { value: Tier.ht1low, label: "HT1 Low" },
  { value: Tier.lt1, label: "LT1 Peak" },
  { value: Tier.mt1, label: "LT1 Low" },
  { value: Tier.ht2, label: "HT2 Peak" },
  { value: Tier.ht2low, label: "HT2 Low" },
  { value: Tier.lt2, label: "LT2 Peak" },
  { value: Tier.mt2, label: "LT2 Low" },
  { value: Tier.ht3, label: "HT3 Peak" },
  { value: Tier.ht3low, label: "HT3 Low" },
  { value: Tier.lt3, label: "LT3 Peak" },
  { value: Tier.mt3, label: "LT3 Low" },
  { value: Tier.ht4, label: "HT4 Peak" },
  { value: Tier.ht4low, label: "HT4 Low" },
  { value: Tier.lt4, label: "LT4 Peak" },
  { value: Tier.mt4, label: "LT4 Low" },
  { value: Tier.ht5, label: "HT5 Peak" },
  { value: Tier.ht5low, label: "HT5 Low" },
  { value: Tier.lt5, label: "LT5 Peak" },
  { value: Tier.mt5, label: "LT5 Low" },
  { value: Tier.none, label: "None" },
];

function StatusBadge({ status }: { status: ApplicationStatus | string }) {
  const s = typeof status === "string" ? status : Object.keys(status)[0];
  if (s === "pending") {
    return (
      <span
        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
        style={{
          color: "#FFD700",
          backgroundColor: "rgba(255,215,0,0.1)",
          border: "1px solid rgba(255,215,0,0.3)",
        }}
      >
        <Clock size={10} />
        PENDING
      </span>
    );
  }
  if (s === "approved") {
    return (
      <span
        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
        style={{
          color: "#23D7FF",
          backgroundColor: "rgba(35,215,255,0.1)",
          border: "1px solid rgba(35,215,255,0.3)",
        }}
      >
        <CheckCircle size={10} />
        APPROVED
      </span>
    );
  }
  return (
    <span
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
      style={{
        color: "#EF4444",
        backgroundColor: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.3)",
      }}
    >
      <XCircle size={10} />
      REJECTED
    </span>
  );
}

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3"];

// ── Tier Tester Panel ────────────────────────────────────────────────────────

function TierTesterPanel() {
  const { data: profiles = [], isLoading: profilesLoading } = useAllProfiles();
  const { data: appsWithPrincipals = [] } = useAllApplicationsWithPrincipals();
  const submitForOtherMutation = useTesterSubmitForOtherPlayer();

  const [selectedPrincipal, setSelectedPrincipal] = useState("");
  const [ranks, setRanks] = useState<Record<string, string>>(
    Object.fromEntries(
      GAMEMODE_FIELDS.map((f) => [f.playerKey as string, "none"]),
    ),
  );

  // Build set of already-approved principals
  const approvedPrincipals = new Set<string>(
    appsWithPrincipals
      .filter((entry: any) => {
        const status = entry.application?.status;
        return (
          status === "approved" ||
          (typeof status === "object" &&
            status !== null &&
            "approved" in status)
        );
      })
      .map((entry: any) => {
        const p = entry.principal;
        return typeof p === "string" ? p : (p?.toText?.() ?? String(p));
      }),
  );

  const filteredProfiles = profiles.filter((p: any) => {
    const pStr =
      typeof p.principal === "string"
        ? p.principal
        : (p.principal?.toText?.() ?? String(p.principal));
    return !approvedPrincipals.has(pStr);
  });

  const selectedProfile = filteredProfiles.find((p: any) => {
    const pStr =
      typeof p.principal === "string"
        ? p.principal
        : (p.principal?.toText?.() ?? String(p.principal));
    return pStr === selectedPrincipal;
  });

  function updateRank(key: string, val: string) {
    setRanks((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmitForApproval() {
    if (!selectedPrincipal || !selectedProfile) {
      toast.error("Select a player first");
      return;
    }
    const nonNone = GAMEMODE_FIELDS.filter(
      (f) => ranks[f.playerKey as string] !== "none",
    );
    if (nonNone.length === 0) {
      toast.error("Assign at least one rank");
      return;
    }
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      const target = Principal.fromText(selectedPrincipal);
      const playerData: any = {
        username: selectedProfile.name ?? "",
        discord: null,
        axePvpTier: (ranks.axePvpTier as Tier) ?? Tier.none,
        swordPvpTier: (ranks.swordPvpTier as Tier) ?? Tier.none,
        crystalPvpTier: (ranks.crystalPvpTier as Tier) ?? Tier.none,
        uhcTier: (ranks.uhcTier as Tier) ?? Tier.none,
        nethpotTier: (ranks.nethpotTier as Tier) ?? Tier.none,
        smpPvpTier: (ranks.smpPvpTier as Tier) ?? Tier.none,
        macePvpTier: (ranks.macePvpTier as Tier) ?? Tier.none,
        cartPvpTier: (ranks.cartPvpTier as Tier) ?? Tier.none,
        overallTier: Tier.none,
        tags: [],
      };
      await submitForOtherMutation.mutateAsync({ target, playerData });
      toast.success("Player submitted for admin approval!");
      setSelectedPrincipal("");
      setRanks(
        Object.fromEntries(
          GAMEMODE_FIELDS.map((f) => [f.playerKey as string, "none"]),
        ),
      );
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to submit. Please try again.");
    }
  }

  const inputStyle = {
    backgroundColor: "#0B0D10",
    border: "1px solid rgba(168,85,247,0.3)",
    color: "#F2F5FF",
  };

  return (
    <div
      className="rounded-2xl p-6 mb-6"
      style={{
        backgroundColor: "#141821",
        border: "1px solid rgba(168,85,247,0.35)",
        boxShadow: "0 0 30px rgba(168,85,247,0.08)",
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Star size={18} style={{ color: "#A855F7" }} />
        <h2
          className="text-lg font-bold tracking-widest"
          style={{
            color: "#F2F5FF",
            fontFamily: "BricolageGrotesque",
            letterSpacing: "0.1em",
          }}
        >
          TIER TESTER — ADD PLAYER
        </h2>
        <span
          className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            color: "#A855F7",
            backgroundColor: "rgba(168,85,247,0.1)",
            border: "1px solid rgba(168,85,247,0.3)",
          }}
        >
          TIER TESTER
        </span>
      </div>

      <p className="text-xs mb-5" style={{ color: "#9AA3B2" }}>
        Select a registered player, assign their gamemode ranks, then submit for
        admin approval.
      </p>

      {/* Player selector */}
      <div className="flex flex-col gap-1.5 mb-5">
        <label
          htmlFor="tier-tester-player-select"
          className="text-xs font-bold tracking-widest"
          style={{ color: "#9AA3B2", letterSpacing: "0.1em" }}
        >
          SELECT PLAYER
        </label>
        {profilesLoading ? (
          <div
            className="h-10 rounded-lg animate-pulse"
            style={{ backgroundColor: "#0B0D10" }}
            data-ocid="tiertester.loading_state"
          />
        ) : (
          <select
            id="tier-tester-player-select"
            value={selectedPrincipal}
            onChange={(e) => setSelectedPrincipal(e.target.value)}
            data-ocid="tiertester.select"
            className="px-3 py-2.5 rounded-lg text-sm font-medium outline-none transition-all duration-200"
            style={inputStyle}
          >
            <option value="">— choose a player —</option>
            {filteredProfiles.map((p: any) => {
              const pStr =
                typeof p.principal === "string"
                  ? p.principal
                  : (p.principal?.toText?.() ?? String(p.principal));
              return (
                <option
                  key={pStr}
                  value={pStr}
                  style={{ backgroundColor: "#141821" }}
                >
                  {p.name ?? pStr.slice(0, 12)}
                </option>
              );
            })}
          </select>
        )}
      </div>

      {/* Rank selectors */}
      <div className="mb-5">
        <p
          className="text-xs font-bold tracking-widest mb-3"
          style={{ color: "#9AA3B2", letterSpacing: "0.1em" }}
        >
          ASSIGN RANKS
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {GAMEMODE_FIELDS.map((field) => {
            const gm = GAMEMODES.find((g) => g.id === field.id);
            return (
              <div key={field.backendKey} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <GamemodeIcon id={field.id} size={14} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#9AA3B2" }}
                  >
                    {gm?.name ?? field.label}
                  </span>
                </div>
                <select
                  value={ranks[field.playerKey as string]}
                  onChange={(e) =>
                    updateRank(field.playerKey as string, e.target.value)
                  }
                  className="px-3 py-2 rounded-lg text-xs font-bold outline-none transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: "#0B0D10",
                    border: "1px solid rgba(168,85,247,0.25)",
                    color:
                      ranks[field.playerKey as string] === "none"
                        ? "#9AA3B2"
                        : "#A855F7",
                    fontFamily: "Satoshi",
                  }}
                >
                  {TIER_OPTIONS.map((t) => (
                    <option
                      key={t.value}
                      value={t.value}
                      style={{ backgroundColor: "#141821" }}
                    >
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmitForApproval}
        disabled={submitForOtherMutation.isPending || !selectedPrincipal}
        data-ocid="tiertester.submit_button"
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-widest transition-all duration-300 w-full"
        style={{
          background:
            submitForOtherMutation.isPending || !selectedPrincipal
              ? "rgba(168,85,247,0.15)"
              : "linear-gradient(135deg, #A855F7, #7C3AED)",
          color: "#fff",
          letterSpacing: "0.1em",
          boxShadow:
            submitForOtherMutation.isPending || !selectedPrincipal
              ? "none"
              : "0 0 20px rgba(168,85,247,0.3)",
          cursor:
            submitForOtherMutation.isPending || !selectedPrincipal
              ? "not-allowed"
              : "pointer",
        }}
      >
        {submitForOtherMutation.isPending ? (
          <>
            <Loader2 size={14} className="animate-spin" /> SUBMITTING...
          </>
        ) : (
          <>
            <UserPlus size={14} /> SUBMIT FOR APPROVAL
          </>
        )}
      </button>
    </div>
  );
}

// ── Main TesterPage ──────────────────────────────────────────────────────────

export default function TesterPage() {
  const navigate = useNavigate();
  const { role, isLoggedIn, isLoading } = useAuth();
  const { data: ownedApps = [], isLoading: appsLoading } =
    useOwnedApplications();
  const { data: callerEntry } = useCallerProfileEntry();

  const hasTierTesterTag =
    callerEntry?.tags?.some(
      (t: any) =>
        t === "tierTester" ||
        (typeof t === "object" && t !== null && "tierTester" in t),
    ) ?? false;

  useEffect(() => {
    if (
      !isLoading &&
      (!isLoggedIn || (role !== "tester" && role !== "admin"))
    ) {
      navigate({ to: "/" });
    }
  }, [isLoading, isLoggedIn, role, navigate]);

  if (isLoading || !role) return null;
  if (role !== "tester" && role !== "admin") return null;

  return (
    <div
      className="py-16 px-4"
      style={{ backgroundColor: "#0B0D10", minHeight: "80vh" }}
    >
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          title="Tester Panel"
          subtitle="Submit player applications for admin review"
        />

        {/* Tier Tester Panel — only visible when user has tierTester tag */}
        {hasTierTesterTag && <TierTesterPanel />}

        {/* My Submissions */}
        <div>
          <h2
            className="text-lg font-bold uppercase tracking-widest mb-5"
            style={{
              fontFamily: "BricolageGrotesque",
              color: "#F2F5FF",
              letterSpacing: "0.12em",
            }}
          >
            My Submissions
          </h2>
          {appsLoading ? (
            <div
              className="flex flex-col gap-2"
              data-ocid="tester.loading_state"
            >
              {SKELETON_KEYS.map((k) => (
                <div
                  key={k}
                  className="h-16 rounded-xl animate-pulse"
                  style={{ backgroundColor: "#141821" }}
                />
              ))}
            </div>
          ) : ownedApps.length === 0 ? (
            <div
              className="text-center py-12"
              data-ocid="tester.empty_state"
              style={{
                backgroundColor: "#141821",
                borderRadius: "1rem",
                border: "1px solid rgba(35,215,255,0.1)",
              }}
            >
              <div className="text-4xl mb-3">📋</div>
              <p style={{ color: "#9AA3B2" }}>No submissions yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ownedApps.map((app, i) => {
                const statusKey =
                  typeof app.status === "string"
                    ? app.status
                    : Object.keys(app.status)[0];
                return (
                  <div
                    key={app.player.username}
                    data-ocid={`tester.item.${i + 1}`}
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: "#141821",
                      border: "1px solid rgba(35,215,255,0.1)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="font-bold"
                        style={{
                          color: "#F2F5FF",
                          fontFamily: "BricolageGrotesque",
                        }}
                      >
                        {app.player.username}
                      </span>
                      <StatusBadge status={statusKey} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {GAMEMODE_FIELDS.map((field) => {
                        const tierVal = app.player[field.playerKey] as string;
                        const localTier = backendTierToLocal(tierVal as any);
                        if (!localTier) return null;
                        return (
                          <div
                            key={field.id}
                            className="flex items-center gap-1"
                          >
                            <GamemodeIcon id={field.id} size={12} />
                            <TierBadge tier={localTier} size="sm" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  Clock,
  FlaskConical,
  Loader2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ApplicationStatus, Player as BackendPlayer } from "../backend.d";
import GamemodeIcon from "../components/GamemodeIcon";
import SectionHeader from "../components/SectionHeader";
import TierBadge from "../components/TierBadge";
import { GAMEMODES, TIER_ORDER } from "../data/dummyData";
import type { GamemodeId, Tier as LocalTier } from "../data/dummyData";
import { useAuth } from "../hooks/useAuth";
import {
  useOwnedApplications,
  useSubmitApplication,
} from "../hooks/useQueries";
import {
  ALL_TIER_OPTIONS,
  backendTierToLocal,
  localTierToBackend,
} from "../utils/playerUtils";

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

export default function TesterPage() {
  const navigate = useNavigate();
  const { role, isLoggedIn, isLoading } = useAuth();
  const { data: ownedApps = [], isLoading: appsLoading } =
    useOwnedApplications();
  const submitMutation = useSubmitApplication();

  const [username, setUsername] = useState("");
  const [discord, setDiscord] = useState("");
  const [tiers, setTiers] = useState<Record<string, string>>(
    Object.fromEntries(GAMEMODE_FIELDS.map((f) => [f.backendKey, "none"])),
  );

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    const selected = GAMEMODE_FIELDS.map((f) => tiers[f.backendKey] || "none");
    const nonNone = selected.filter((t) => t !== "none");
    if (nonNone.length === 0) {
      toast.error("Select at least one gamemode rank");
      return;
    }
    const localTiersList = nonNone as LocalTier[];
    const overallLocal = localTiersList.reduce((a, b) =>
      TIER_ORDER.indexOf(a) <= TIER_ORDER.indexOf(b) ? a : b,
    );

    try {
      await submitMutation.mutateAsync([
        username.trim(),
        discord.trim() || null,
        localTierToBackend(tiers.axePvp),
        localTierToBackend(tiers.swordPvp),
        localTierToBackend(tiers.crystalPvp),
        localTierToBackend(tiers.uhc),
        localTierToBackend(tiers.nethpot),
        localTierToBackend(tiers.smpPvp),
        localTierToBackend(tiers.macePvp),
        localTierToBackend(tiers.cartPvp),
        localTierToBackend(overallLocal),
      ]);
      toast.success("Application submitted! Awaiting admin approval.");
      setUsername("");
      setDiscord("");
      setTiers(
        Object.fromEntries(GAMEMODE_FIELDS.map((f) => [f.backendKey, "none"])),
      );
    } catch {
      toast.error("Failed to submit application. Please try again.");
    }
  }

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

        {/* Submit Form */}
        <div
          className="rounded-2xl p-6 mb-10"
          style={{
            backgroundColor: "#141821",
            border: "1px solid rgba(35,215,255,0.2)",
            boxShadow: "0 0 30px rgba(35,215,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <FlaskConical size={18} style={{ color: "#23D7FF" }} />
            <h2
              className="text-lg font-bold tracking-widest"
              style={{
                color: "#F2F5FF",
                fontFamily: "BricolageGrotesque",
                letterSpacing: "0.1em",
              }}
            >
              NEW APPLICATION
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            data-ocid="tester.panel"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="app-username"
                  className="text-xs font-bold tracking-widest"
                  style={{ color: "#9AA3B2", letterSpacing: "0.1em" }}
                >
                  USERNAME *
                </label>
                <input
                  id="app-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="PlayerName"
                  required
                  data-ocid="tester.input"
                  className="px-4 py-2.5 rounded-lg text-sm font-medium outline-none transition-all duration-200"
                  style={{
                    backgroundColor: "#0B0D10",
                    border: "1px solid rgba(35,215,255,0.2)",
                    color: "#F2F5FF",
                    fontFamily: "Satoshi",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(35,215,255,0.5)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(35,215,255,0.2)";
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="app-discord"
                  className="text-xs font-bold tracking-widest"
                  style={{ color: "#9AA3B2", letterSpacing: "0.1em" }}
                >
                  DISCORD (optional)
                </label>
                <input
                  id="app-discord"
                  type="text"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  placeholder="username#0000"
                  data-ocid="tester.input"
                  className="px-4 py-2.5 rounded-lg text-sm font-medium outline-none transition-all duration-200"
                  style={{
                    backgroundColor: "#0B0D10",
                    border: "1px solid rgba(35,215,255,0.2)",
                    color: "#F2F5FF",
                    fontFamily: "Satoshi",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(35,215,255,0.5)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(35,215,255,0.2)";
                  }}
                />
              </div>
            </div>

            <div>
              <p
                className="text-xs font-bold tracking-widest mb-3"
                style={{ color: "#9AA3B2", letterSpacing: "0.1em" }}
              >
                GAMEMODE RANKS
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GAMEMODE_FIELDS.map((field) => {
                  const gm = GAMEMODES.find((g) => g.id === field.id);
                  const selectId = `tier-${field.backendKey}`;
                  return (
                    <div
                      key={field.backendKey}
                      className="flex flex-col gap-1.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <GamemodeIcon id={field.id} size={14} />
                        <label
                          htmlFor={selectId}
                          className="text-xs font-semibold"
                          style={{ color: "#9AA3B2" }}
                        >
                          {gm?.name ?? field.label}
                        </label>
                      </div>
                      <select
                        id={selectId}
                        value={tiers[field.backendKey]}
                        onChange={(e) =>
                          setTiers((prev) => ({
                            ...prev,
                            [field.backendKey]: e.target.value,
                          }))
                        }
                        data-ocid="tester.select"
                        className="px-3 py-2 rounded-lg text-xs font-bold outline-none transition-all duration-200 cursor-pointer"
                        style={{
                          backgroundColor: "#0B0D10",
                          border: "1px solid rgba(35,215,255,0.2)",
                          color:
                            tiers[field.backendKey] === "none"
                              ? "#9AA3B2"
                              : "#23D7FF",
                          fontFamily: "Satoshi",
                        }}
                      >
                        {ALL_TIER_OPTIONS.map((t) => (
                          <option
                            key={t}
                            value={t}
                            style={{ backgroundColor: "#141821" }}
                          >
                            {t === "none" ? "None" : t}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              data-ocid="tester.submit_button"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-widest transition-all duration-300"
              style={{
                background: submitMutation.isPending
                  ? "rgba(35,215,255,0.15)"
                  : "linear-gradient(135deg, #22D3EE, #A855F7)",
                color: "#fff",
                letterSpacing: "0.1em",
                boxShadow: submitMutation.isPending
                  ? "none"
                  : "0 0 20px rgba(35,215,255,0.3)",
                cursor: submitMutation.isPending ? "not-allowed" : "pointer",
              }}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> SUBMITTING...
                </>
              ) : (
                "SUBMIT APPLICATION"
              )}
            </button>
          </form>
        </div>

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
              <p style={{ color: "#9AA3B2" }}>
                No submissions yet. Submit your first application above.
              </p>
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

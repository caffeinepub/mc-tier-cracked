import { Principal } from "@icp-sdk/core/principal";
import {
  AlertTriangle,
  Ban,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Player as BackendPlayer } from "../backend.d";
import { PlayerTag, Tier } from "../backend.d";
import GamemodeIcon from "../components/GamemodeIcon";
import SectionHeader from "../components/SectionHeader";
import type { GamemodeId } from "../data/dummyData";
import { useActor } from "../hooks/useActor";
import { useAuth } from "../hooks/useAuth";
import {
  useAdminCreatePendingApplication,
  useAdminUpdatePendingRanks,
  useAllApplicationsWithPrincipals,
  useAllProfiles,
  useAssignPlayerTags,
  useAssignTester,
  useBanUser,
  useDeletePlayer,
  useEditPlayer,
  useReviewApplication,
  useRevokeTester,
} from "../hooks/useQueries";

const ADMIN_GATE_KEY = "admin_gate_ok";
const ADMIN_USERNAME = "zodiac";
const ADMIN_PASSWORD = "mctier@admin2024";

const GAMEMODE_FIELDS: Array<{
  id: GamemodeId;
  backendKey: keyof BackendPlayer;
  fieldKey: string;
  label: string;
}> = [
  {
    id: "axe-pvp",
    backendKey: "axePvpTier",
    fieldKey: "axePvpTier",
    label: "AXE",
  },
  {
    id: "sword-pvp",
    backendKey: "swordPvpTier",
    fieldKey: "swordPvpTier",
    label: "SWORD",
  },
  {
    id: "crystal-pvp",
    backendKey: "crystalPvpTier",
    fieldKey: "crystalPvpTier",
    label: "CRYSTAL",
  },
  { id: "uhc", backendKey: "uhcTier", fieldKey: "uhcTier", label: "UHC" },
  {
    id: "nethpot",
    backendKey: "nethpotTier",
    fieldKey: "nethpotTier",
    label: "NETHPOT",
  },
  {
    id: "smp-pvp",
    backendKey: "smpPvpTier",
    fieldKey: "smpPvpTier",
    label: "SMP",
  },
  {
    id: "mace-pvp",
    backendKey: "macePvpTier",
    fieldKey: "macePvpTier",
    label: "MACE",
  },
  {
    id: "cart-pvp",
    backendKey: "cartPvpTier",
    fieldKey: "cartPvpTier",
    label: "CART",
  },
];

const TIER_OPTIONS: Tier[] = [
  Tier.ht1,
  Tier.ht2,
  Tier.ht3,
  Tier.ht4,
  Tier.ht5,
  Tier.mt1,
  Tier.mt2,
  Tier.mt3,
  Tier.mt4,
  Tier.mt5,
  Tier.lt1,
  Tier.lt2,
  Tier.lt3,
  Tier.lt4,
  Tier.lt5,
  Tier.none,
];

const TAG_OPTIONS: Array<{
  tag: PlayerTag;
  label: string;
  color: string;
  activeBg: string;
}> = [
  {
    tag: PlayerTag.player,
    label: "PLAYER",
    color: "#23D7FF",
    activeBg: "rgba(35,215,255,0.2)",
  },
  {
    tag: PlayerTag.tierTester,
    label: "TIER TESTER",
    color: "#A855F7",
    activeBg: "rgba(168,85,247,0.2)",
  },
  {
    tag: PlayerTag.experienced,
    label: "EXPERIENCED",
    color: "#FFD700",
    activeBg: "rgba(255,215,0,0.2)",
  },
  {
    tag: PlayerTag.new_,
    label: "NEW",
    color: "#22C55E",
    activeBg: "rgba(34,197,94,0.2)",
  },
];

function shortenPrincipal(p: any): string {
  const str = typeof p === "string" ? p : (p?.toText?.() ?? String(p));
  if (str.length <= 16) return str;
  return `${str.slice(0, 8)}...${str.slice(-6)}`;
}

// ── Admin Gate ───────────────────────────────────────────────────────────────

function AdminGate({ onSuccess }: { onSuccess: () => void }) {
  const { isLoggedIn, isLoading: authLoading, login } = useAuth();
  const { actor } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setClaiming(true);
      try {
        if (actor) {
          await (actor as any).claimAdminRoleWithPassword(password);
        }
      } catch {
        // ignore - may already be admin
      } finally {
        setClaiming(false);
      }
      sessionStorage.setItem(ADMIN_GATE_KEY, "1");
      onSuccess();
    } else {
      setError("Invalid credentials");
    }
  }

  const cardStyle = {
    backgroundColor: "#0f1118",
    border: "1px solid rgba(35,215,255,0.25)",
    boxShadow: "0 0 40px rgba(35,215,255,0.08), 0 0 80px rgba(168,85,247,0.05)",
  };
  const inputStyle = {
    backgroundColor: "#0B0D10",
    border: "1px solid rgba(35,215,255,0.2)",
    color: "#F2F5FF",
  };

  if (!isLoggedIn) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: "#0B0D10" }}
      >
        <div className="w-full max-w-sm mx-4 p-8 rounded-2xl" style={cardStyle}>
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck size={22} style={{ color: "#FFD700" }} />
            <div>
              <h2
                className="font-black tracking-widest text-sm"
                style={{
                  color: "#F2F5FF",
                  fontFamily: "BricolageGrotesque",
                  letterSpacing: "0.15em",
                }}
              >
                ADMIN ACCESS
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#9AA3B2" }}>
                Step 1 of 2 — Authenticate identity
              </p>
            </div>
          </div>
          <p className="text-xs mb-6" style={{ color: "#9AA3B2" }}>
            Log in with Internet Identity first so admin actions work on the
            backend.
          </p>
          <button
            type="button"
            onClick={login}
            disabled={authLoading}
            data-ocid="admin.primary_button"
            className="w-full py-3 rounded-xl text-xs font-black tracking-widest flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              backgroundColor: "rgba(35,215,255,0.12)",
              color: "#23D7FF",
              border: "1px solid rgba(35,215,255,0.35)",
              letterSpacing: "0.15em",
            }}
          >
            {authLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ShieldCheck size={14} />
            )}
            LOGIN WITH INTERNET IDENTITY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "#0B0D10" }}
    >
      <div className="w-full max-w-sm mx-4 p-8 rounded-2xl" style={cardStyle}>
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck size={22} style={{ color: "#23D7FF" }} />
          <div>
            <h2
              className="font-black tracking-widest text-sm"
              style={{
                color: "#F2F5FF",
                fontFamily: "BricolageGrotesque",
                letterSpacing: "0.15em",
              }}
            >
              ADMIN PANEL
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#9AA3B2" }}>
              Step 2 of 2 — Enter credentials
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="gate-username"
              className="text-xs font-bold tracking-widest"
              style={{ color: "#9AA3B2" }}
            >
              USERNAME
            </label>
            <input
              id="gate-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Enter username"
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="gate-password"
              className="text-xs font-bold tracking-widest"
              style={{ color: "#9AA3B2" }}
            >
              PASSWORD
            </label>
            <input
              id="gate-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter password"
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
          </div>
          {error && (
            <p
              className="text-xs font-bold text-center py-2 rounded-lg"
              style={{
                color: "#EF4444",
                backgroundColor: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            data-ocid="admin.primary_button"
            disabled={claiming}
            className="w-full py-3 rounded-xl text-xs font-black tracking-widest transition-all duration-200 disabled:opacity-60"
            style={{
              backgroundColor: "rgba(35,215,255,0.12)",
              color: "#23D7FF",
              border: "1px solid rgba(35,215,255,0.35)",
              letterSpacing: "0.15em",
            }}
          >
            {claiming ? "AUTHENTICATING..." : "ENTER ADMIN PANEL"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Player Management Panel ──────────────────────────────────────────────────

type RanksState = Record<string, Tier>;

function defaultRanks(player?: Partial<BackendPlayer>): RanksState {
  const init: RanksState = { overallTier: Tier.none };
  for (const f of GAMEMODE_FIELDS) {
    init[f.fieldKey] = (player?.[f.backendKey] as Tier) ?? Tier.none;
  }
  return init;
}

function buildPlayerData(
  name: string,
  discord: string | undefined | null,
  ranks: RanksState,
): BackendPlayer {
  return {
    username: name,
    discord: discord ?? undefined,
    axePvpTier: (ranks.axePvpTier as Tier) ?? Tier.none,
    swordPvpTier: (ranks.swordPvpTier as Tier) ?? Tier.none,
    crystalPvpTier: (ranks.crystalPvpTier as Tier) ?? Tier.none,
    uhcTier: (ranks.uhcTier as Tier) ?? Tier.none,
    nethpotTier: (ranks.nethpotTier as Tier) ?? Tier.none,
    smpPvpTier: (ranks.smpPvpTier as Tier) ?? Tier.none,
    macePvpTier: (ranks.macePvpTier as Tier) ?? Tier.none,
    cartPvpTier: (ranks.cartPvpTier as Tier) ?? Tier.none,
    overallTier: (ranks.overallTier as Tier) ?? Tier.none,
  };
}
function RankSelects({
  ranks,
  onChange,
}: { ranks: RanksState; onChange: (k: string, v: Tier) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-3">
      {GAMEMODE_FIELDS.map((f) => (
        <div key={f.id}>
          <div className="flex items-center gap-1 mb-1">
            <GamemodeIcon id={f.id} size={10} />
            <span className="text-xs" style={{ color: "#9AA3B2" }}>
              {f.label}
            </span>
          </div>
          <select
            value={ranks[f.fieldKey] ?? Tier.none}
            onChange={(e) => onChange(f.fieldKey, e.target.value as Tier)}
            className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{
              backgroundColor: "#0B0D10",
              border: "1px solid rgba(35,215,255,0.2)",
              color: "#F2F5FF",
            }}
          >
            {TIER_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      ))}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs" style={{ color: "#9AA3B2" }}>
            OVERALL
          </span>
        </div>
        <select
          value={ranks.overallTier ?? Tier.none}
          onChange={(e) => onChange("overallTier", e.target.value as Tier)}
          className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
          style={{
            backgroundColor: "#0B0D10",
            border: "1px solid rgba(35,215,255,0.2)",
            color: "#F2F5FF",
          }}
        >
          {TIER_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function PlayerCard({ profile, appEntry }: { profile: any; appEntry: any }) {
  const [expanded, setExpanded] = useState(false);
  const [ranks, setRanks] = useState<RanksState>(() =>
    defaultRanks(appEntry?.application?.player),
  );
  const [selectedTags, setSelectedTags] = useState<PlayerTag[]>(
    () => profile.tags ?? [],
  );
  const [isTester, setIsTester] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmBan, setConfirmBan] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const createPendingMutation = useAdminCreatePendingApplication();
  const updateRanksMutation = useAdminUpdatePendingRanks();
  const reviewMutation = useReviewApplication();
  const editMutation = useEditPlayer();
  const tagsMutation = useAssignPlayerTags();
  const banMutation = useBanUser();
  const deleteMutation = useDeletePlayer();
  const assignTesterMutation = useAssignTester();
  const revokeTesterMutation = useRevokeTester();

  const appStatus = appEntry
    ? appEntry.application?.status === "approved" ||
      appEntry.application?.status?.approved !== undefined
      ? "approved"
      : appEntry.application?.status === "pending" ||
          appEntry.application?.status?.pending !== undefined
        ? "pending"
        : "rejected"
    : "none";

  const isApproved = appStatus === "approved";

  function updateRank(k: string, v: Tier) {
    setRanks((prev) => ({ ...prev, [k]: v }));
  }

  function toggleTag(tag: PlayerTag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function handleApprove() {
    setLoading("approve");
    try {
      const existingPlayer = appEntry?.application?.player;
      const playerData = buildPlayerData(
        existingPlayer?.username ?? profile.name ?? "",
        existingPlayer?.discord,
        ranks,
      );

      if (appStatus === "none") {
        // Create pending application first
        await createPendingMutation.mutateAsync(profile.principal);
      }
      // Update ranks
      await updateRanksMutation.mutateAsync({
        principal: profile.principal,
        playerData,
      });
      // Assign tags
      await tagsMutation.mutateAsync({
        principal: profile.principal,
        tags: selectedTags,
      });
      // Approve
      await reviewMutation.mutateAsync({
        principal: profile.principal,
        approve: true,
      });
      // Assign tester role if toggled
      if (isTester) {
        await assignTesterMutation.mutateAsync(profile.principal);
      }
      toast.success(`${profile.name} approved and added to leaderboard!`);
      setExpanded(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Approve failed.");
    } finally {
      setLoading(null);
    }
  }

  async function handleUpdateApproved() {
    setLoading("update");
    try {
      const existingPlayer = appEntry?.application?.player;
      const playerData = buildPlayerData(
        existingPlayer?.username ?? profile.name ?? "",
        existingPlayer?.discord,
        ranks,
      );
      await editMutation.mutateAsync({
        principal: profile.principal,
        playerData,
      });
      await tagsMutation.mutateAsync({
        principal: profile.principal,
        tags: selectedTags,
      });
      if (isTester) {
        await assignTesterMutation.mutateAsync(profile.principal);
      } else {
        await revokeTesterMutation.mutateAsync(profile.principal);
      }
      toast.success("Player updated!");
      setExpanded(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Update failed.");
    } finally {
      setLoading(null);
    }
  }

  async function handleBan() {
    if (!confirmBan) {
      setConfirmBan(true);
      return;
    }
    setLoading("ban");
    try {
      await banMutation.mutateAsync(profile.principal);
      toast.success("User banned.");
      setConfirmBan(false);
    } catch {
      toast.error("Ban failed.");
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading("delete");
    try {
      await deleteMutation.mutateAsync(profile.principal);
      toast.success("Player deleted.");
      setConfirmDelete(false);
    } catch {
      toast.error("Delete failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: "#141821",
        border: isApproved
          ? "1px solid rgba(35,215,255,0.15)"
          : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header row */}
      <button
        type="button"
        className="flex items-center justify-between gap-3 p-4 cursor-pointer w-full text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
            style={{
              backgroundColor: "rgba(35,215,255,0.1)",
              color: "#23D7FF",
              border: "1px solid rgba(35,215,255,0.2)",
            }}
          >
            {(profile.name ?? "?")[0].toUpperCase()}
          </div>
          <div>
            <div
              className="font-bold text-sm"
              style={{ color: "#F2F5FF", fontFamily: "BricolageGrotesque" }}
            >
              {profile.name || (
                <span style={{ color: "#9AA3B2" }}>Unnamed</span>
              )}
            </div>
            <div
              className="text-xs font-mono mt-0.5"
              style={{ color: "#9AA3B2" }}
            >
              {shortenPrincipal(profile.principal)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isApproved && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{
                color: "#22C55E",
                backgroundColor: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
              }}
            >
              APPROVED
            </span>
          )}
          {appStatus === "pending" && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{
                color: "#FFD700",
                backgroundColor: "rgba(255,215,0,0.1)",
                border: "1px solid rgba(255,215,0,0.3)",
              }}
            >
              PENDING
            </span>
          )}
          {appStatus === "rejected" && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{
                color: "#EF4444",
                backgroundColor: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              REJECTED
            </span>
          )}
          <div style={{ color: "#9AA3B2" }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div
          className="px-4 pb-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="pt-4">
            {/* Ranks */}
            <p
              className="text-xs font-bold tracking-widest mb-2"
              style={{ color: "#9AA3B2" }}
            >
              ASSIGN RANKS
            </p>
            <RankSelects ranks={ranks} onChange={updateRank} />

            {/* Tags */}
            <p
              className="text-xs font-bold tracking-widest mb-2"
              style={{ color: "#9AA3B2" }}
            >
              ASSIGN TAGS
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {TAG_OPTIONS.map((opt) => {
                const active = selectedTags.includes(opt.tag);
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => toggleTag(opt.tag)}
                    className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                    style={{
                      color: opt.color,
                      backgroundColor: active
                        ? opt.activeBg
                        : "rgba(255,255,255,0.04)",
                      border: `1px solid ${active ? `${opt.color}55` : "rgba(255,255,255,0.1)"}`,
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Tier Tester Role */}
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => setIsTester((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  color: isTester ? "#A855F7" : "#9AA3B2",
                  backgroundColor: isTester
                    ? "rgba(168,85,247,0.15)"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isTester ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                {isTester ? "✓ " : ""}TIER TESTER ROLE
              </button>
              <span className="text-xs" style={{ color: "#9AA3B2" }}>
                Toggle to assign/revoke tester role
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              {!isApproved ? (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={!!loading}
                  data-ocid="admin.confirm_button"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all"
                  style={{
                    backgroundColor: "rgba(35,215,255,0.12)",
                    color: "#23D7FF",
                    border: "1px solid rgba(35,215,255,0.35)",
                  }}
                >
                  {loading === "approve" ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : null}
                  APPROVE &amp; ADD TO LEADERBOARD
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleUpdateApproved}
                  disabled={!!loading}
                  data-ocid="admin.save_button"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all"
                  style={{
                    backgroundColor: "rgba(35,215,255,0.12)",
                    color: "#23D7FF",
                    border: "1px solid rgba(35,215,255,0.35)",
                  }}
                >
                  {loading === "update" ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : null}
                  SAVE CHANGES
                </button>
              )}
              <button
                type="button"
                onClick={handleBan}
                disabled={!!loading}
                data-ocid="admin.delete_button"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all"
                style={{
                  backgroundColor: confirmBan
                    ? "rgba(251,146,60,0.2)"
                    : "rgba(251,146,60,0.08)",
                  color: "#FB923C",
                  border: "1px solid rgba(251,146,60,0.3)",
                }}
              >
                {loading === "ban" ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Ban size={12} />
                )}
                {confirmBan ? "CONFIRM BAN" : "BAN"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!!loading}
                data-ocid="admin.delete_button"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all"
                style={{
                  backgroundColor: confirmDelete
                    ? "rgba(239,68,68,0.2)"
                    : "rgba(239,68,68,0.08)",
                  color: "#EF4444",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                {loading === "delete" ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
                {confirmDelete ? "CONFIRM DELETE" : "DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Players Section ──────────────────────────────────────────────────────────

// ── Pending Approvals Section ─────────────────────────────────────────────

function PendingApprovalsSection() {
  const { data: allEntries = [], isLoading } =
    useAllApplicationsWithPrincipals();
  const { data: profiles = [] } = useAllProfiles();
  const updateRanksMutation = useAdminUpdatePendingRanks();
  const reviewMutation = useReviewApplication();
  const tagsMutation = useAssignPlayerTags();

  const pendingEntries = (allEntries as any[]).filter((entry: any) => {
    const status = entry.application?.status;
    return (
      status === "pending" ||
      (typeof status === "object" && status !== null && "pending" in status)
    );
  });

  if (!isLoading && pendingEntries.length === 0) return null;

  const profileByPrincipal = new Map<string, any>();
  for (const p of profiles as any[]) {
    const key = p.principal?.toString() ?? "";
    if (key) profileByPrincipal.set(key, p);
  }

  async function handleQuickApprove(entry: any) {
    try {
      const principalKey = entry.principal?.toString() ?? "";
      const profile = profileByPrincipal.get(principalKey);
      const existingPlayer = entry.application?.player;
      const playerData: BackendPlayer = {
        username: existingPlayer?.username ?? profile?.name ?? "",
        discord: existingPlayer?.discord ?? undefined,
        axePvpTier: existingPlayer?.axePvpTier ?? Tier.none,
        swordPvpTier: existingPlayer?.swordPvpTier ?? Tier.none,
        crystalPvpTier: existingPlayer?.crystalPvpTier ?? Tier.none,
        uhcTier: existingPlayer?.uhcTier ?? Tier.none,
        nethpotTier: existingPlayer?.nethpotTier ?? Tier.none,
        smpPvpTier: existingPlayer?.smpPvpTier ?? Tier.none,
        macePvpTier: existingPlayer?.macePvpTier ?? Tier.none,
        cartPvpTier: existingPlayer?.cartPvpTier ?? Tier.none,
        overallTier: existingPlayer?.overallTier ?? Tier.none,
      };
      await updateRanksMutation.mutateAsync({
        principal: entry.principal,
        playerData,
      });
      await tagsMutation.mutateAsync({
        principal: entry.principal,
        tags: existingPlayer?.tags ?? [],
      });
      await reviewMutation.mutateAsync({
        principal: entry.principal,
        approve: true,
      });
      toast.success(
        `${playerData.username} approved and added to leaderboard!`,
      );
    } catch (err: any) {
      toast.error(err?.message ?? "Approve failed.");
    }
  }

  async function handleQuickReject(entry: any) {
    try {
      await reviewMutation.mutateAsync({
        principal: entry.principal,
        approve: false,
      });
      toast.success("Application rejected.");
    } catch (err: any) {
      toast.error(err?.message ?? "Reject failed.");
    }
  }

  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{
        backgroundColor: "#141821",
        border: "1px solid rgba(255,215,0,0.35)",
        boxShadow: "0 0 24px rgba(255,215,0,0.06)",
      }}
      data-ocid="admin.panel"
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} style={{ color: "#FFD700" }} />
        <h3
          className="font-bold tracking-widest text-sm"
          style={{
            color: "#F2F5FF",
            fontFamily: "BricolageGrotesque",
            letterSpacing: "0.12em",
          }}
        >
          PENDING APPROVALS
        </h3>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-bold ml-1"
          style={{
            color: "#FFD700",
            backgroundColor: "rgba(255,215,0,0.12)",
            border: "1px solid rgba(255,215,0,0.3)",
          }}
        >
          {isLoading ? "..." : pendingEntries.length} PENDING
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2" data-ocid="admin.loading_state">
          {["sk1", "sk2"].map((k) => (
            <div
              key={k}
              className="h-12 rounded-lg animate-pulse"
              style={{ backgroundColor: "#0B0D10" }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pendingEntries.map((entry: any, i: number) => {
            const principalKey = entry.principal?.toString() ?? "";
            const profile = profileByPrincipal.get(principalKey);
            const playerName =
              entry.application?.player?.username ??
              profile?.name ??
              shortenPrincipal(entry.principal);
            const isApproving =
              updateRanksMutation.isPending || reviewMutation.isPending;
            return (
              <div
                key={principalKey || i}
                data-ocid={`admin.item.${i + 1}`}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: "#0B0D10",
                  border: "1px solid rgba(255,215,0,0.12)",
                }}
              >
                <div className="flex flex-col min-w-0">
                  <span
                    className="font-bold text-sm truncate"
                    style={{
                      color: "#F2F5FF",
                      fontFamily: "BricolageGrotesque",
                    }}
                  >
                    {playerName}
                  </span>
                  <span className="text-xs" style={{ color: "#9AA3B2" }}>
                    {shortenPrincipal(entry.principal)}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleQuickApprove(entry)}
                    disabled={isApproving}
                    data-ocid={`admin.confirm_button.${i + 1}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 disabled:opacity-50"
                    style={{
                      backgroundColor: "rgba(35,215,255,0.12)",
                      color: "#23D7FF",
                      border: "1px solid rgba(35,215,255,0.3)",
                    }}
                  >
                    {isApproving ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      "APPROVE"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickReject(entry)}
                    disabled={reviewMutation.isPending}
                    data-ocid={`admin.delete_button.${i + 1}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 disabled:opacity-50"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.1)",
                      color: "#EF4444",
                      border: "1px solid rgba(239,68,68,0.25)",
                    }}
                  >
                    REJECT
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlayersSection() {
  const { data: profiles = [], isLoading: profilesLoading } = useAllProfiles();
  const { data: allEntries = [], isLoading: entriesLoading } =
    useAllApplicationsWithPrincipals();
  const isLoading = profilesLoading || entriesLoading;

  const entryByPrincipal = new Map<string, any>();
  for (const e of allEntries as any[]) {
    const key = e.principal?.toString() ?? "";
    if (key) entryByPrincipal.set(key, e);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {["sk1", "sk2", "sk3"].map((k) => (
          <div
            key={k}
            className="h-16 rounded-xl animate-pulse"
            style={{ backgroundColor: "#141821" }}
          />
        ))}
      </div>
    );
  }

  if ((profiles as any[]).length === 0) {
    return (
      <div
        className="text-center py-16 rounded-xl"
        style={{
          backgroundColor: "#141821",
          border: "1px solid rgba(35,215,255,0.1)",
        }}
      >
        <Users size={36} style={{ color: "#9AA3B2", margin: "0 auto 12px" }} />
        <p style={{ color: "#9AA3B2" }}>No registered players yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 mb-1">
        <h3
          className="font-bold tracking-widest text-sm"
          style={{
            color: "#F2F5FF",
            fontFamily: "BricolageGrotesque",
            letterSpacing: "0.1em",
          }}
        >
          ALL PLAYERS
        </h3>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-bold"
          style={{
            color: "#23D7FF",
            backgroundColor: "rgba(35,215,255,0.12)",
            border: "1px solid rgba(35,215,255,0.3)",
          }}
        >
          {(profiles as any[]).length}
        </span>
      </div>
      {(profiles as any[]).map((profile: any, i: number) => {
        const principalKey = profile.principal?.toString() ?? "";
        const appEntry = entryByPrincipal.get(principalKey) ?? null;
        return (
          <PlayerCard
            key={principalKey || i}
            profile={profile}
            appEntry={appEntry}
          />
        );
      })}
    </div>
  );
}

// ── Main AdminPage ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [gateOpen, setGateOpen] = useState(
    () => sessionStorage.getItem(ADMIN_GATE_KEY) === "1",
  );

  if (!gateOpen) {
    return <AdminGate onSuccess={() => setGateOpen(true)} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0B0D10" }}>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck size={22} style={{ color: "#23D7FF" }} />
          <SectionHeader
            title="ADMIN PANEL"
            subtitle="Manage players, ranks, tags and roles"
          />
        </div>
        <PendingApprovalsSection />
        <PlayersSection />
      </div>
    </div>
  );
}

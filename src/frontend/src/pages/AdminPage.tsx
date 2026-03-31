import { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import {
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  ShieldCheck,
  Tag,
  Trash2,
  UserMinus,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Application, Player as BackendPlayer } from "../backend.d";
import { PlayerTag, Tier } from "../backend.d";
import GamemodeIcon from "../components/GamemodeIcon";
import SectionHeader from "../components/SectionHeader";
import TierBadge from "../components/TierBadge";
import type { GamemodeId } from "../data/dummyData";
import { useAuth } from "../hooks/useAuth";
import {
  useAllApplicationsWithPrincipals,
  useAllProfiles,
  useApprovedPlayers,
  useAssignPlayerTags,
  useAssignTester,
  useBanUser,
  useBannedUsers,
  useDeletePlayer,
  useEditPlayer,
  useReviewApplication,
  useRevokeTester,
  useUnbanUser,
} from "../hooks/useQueries";
import { backendTierToLocal } from "../utils/playerUtils";

const ADMIN_GATE_KEY = "admin_gate_ok";
const ADMIN_USERNAME = "zodiac";
const ADMIN_PASSWORD = "mctier@admin2024";

const GAMEMODE_FIELDS: Array<{
  id: GamemodeId;
  backendKey: keyof BackendPlayer;
  fieldKey: string;
}> = [
  { id: "axe-pvp", backendKey: "axePvpTier", fieldKey: "axePvpTier" },
  { id: "sword-pvp", backendKey: "swordPvpTier", fieldKey: "swordPvpTier" },
  {
    id: "crystal-pvp",
    backendKey: "crystalPvpTier",
    fieldKey: "crystalPvpTier",
  },
  { id: "uhc", backendKey: "uhcTier", fieldKey: "uhcTier" },
  { id: "nethpot", backendKey: "nethpotTier", fieldKey: "nethpotTier" },
  { id: "smp-pvp", backendKey: "smpPvpTier", fieldKey: "smpPvpTier" },
  { id: "mace-pvp", backendKey: "macePvpTier", fieldKey: "macePvpTier" },
  { id: "cart-pvp", backendKey: "cartPvpTier", fieldKey: "cartPvpTier" },
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

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3"];

const TAG_OPTIONS: Array<{
  tag: PlayerTag;
  label: string;
  color: string;
  bg: string;
  activeBg: string;
}> = [
  {
    tag: PlayerTag.player,
    label: "PLAYER",
    color: "#23D7FF",
    bg: "rgba(35,215,255,0.06)",
    activeBg: "rgba(35,215,255,0.2)",
  },
  {
    tag: PlayerTag.tierTester,
    label: "TIER TESTER",
    color: "#A855F7",
    bg: "rgba(168,85,247,0.06)",
    activeBg: "rgba(168,85,247,0.2)",
  },
  {
    tag: PlayerTag.experienced,
    label: "EXPERIENCED",
    color: "#FFD700",
    bg: "rgba(255,215,0,0.06)",
    activeBg: "rgba(255,215,0,0.2)",
  },
  {
    tag: PlayerTag.new_,
    label: "NEW",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.06)",
    activeBg: "rgba(34,197,94,0.2)",
  },
];

function shortenPrincipal(p: any): string {
  const str = typeof p === "string" ? p : (p?.toText?.() ?? String(p));
  if (str.length <= 16) return str;
  return `${str.slice(0, 8)}...${str.slice(-6)}`;
}

function PlayerRanksDisplay({ player }: { player: Application["player"] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {GAMEMODE_FIELDS.map((f) => {
        const tierVal = player[f.backendKey] as string;
        const local = backendTierToLocal(tierVal as any);
        if (!local) return null;
        return (
          <div key={f.id} className="flex items-center gap-1">
            <GamemodeIcon id={f.id} size={12} />
            <TierBadge tier={local} size="sm" />
          </div>
        );
      })}
    </div>
  );
}

function PrincipalInput({
  placeholder,
  value,
  onChange,
  ocid,
  id,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  ocid?: string;
  id?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-ocid={ocid}
      className="px-3 py-2 rounded-lg text-xs font-mono outline-none flex-1 min-w-0"
      style={{
        backgroundColor: "#0B0D10",
        border: "1px solid rgba(35,215,255,0.2)",
        color: "#9AA3B2",
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "rgba(35,215,255,0.5)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "rgba(35,215,255,0.2)";
      }}
    />
  );
}

function parsePrincipal(str: string) {
  try {
    return Principal.fromText(str.trim());
  } catch {
    return null;
  }
}

function SubmitterTagBadges({ tags }: { tags: PlayerTag[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tags.map((tag) => {
        const opt = TAG_OPTIONS.find((o) => o.tag === tag);
        if (!opt) return null;
        return (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{
              color: opt.color,
              backgroundColor: opt.activeBg,
              border: `1px solid ${opt.color}55`,
              letterSpacing: "0.06em",
            }}
          >
            {opt.label}
          </span>
        );
      })}
    </div>
  );
}

// ── Password Gate ────────────────────────────────────────────────────────────

function AdminGate({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_GATE_KEY, "1");
      onSuccess();
    } else {
      setError("Invalid credentials");
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "#0B0D10" }}
    >
      <div
        className="w-full max-w-sm mx-4 p-8 rounded-2xl"
        style={{
          backgroundColor: "#0f1118",
          border: "1px solid rgba(35,215,255,0.25)",
          boxShadow:
            "0 0 40px rgba(35,215,255,0.08), 0 0 80px rgba(168,85,247,0.05)",
        }}
      >
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
              MC Tier (Cracked)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="gate-username"
              className="block text-xs font-bold mb-1.5 tracking-widest"
              style={{ color: "#9AA3B2", letterSpacing: "0.1em" }}
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
              data-ocid="admin.input"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: "#0B0D10",
                border: "1px solid rgba(35,215,255,0.2)",
                color: "#F2F5FF",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(35,215,255,0.5)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(35,215,255,0.2)";
              }}
            />
          </div>
          <div>
            <label
              htmlFor="gate-password"
              className="block text-xs font-bold mb-1.5 tracking-widest"
              style={{ color: "#9AA3B2", letterSpacing: "0.1em" }}
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
              style={{
                backgroundColor: "#0B0D10",
                border: "1px solid rgba(35,215,255,0.2)",
                color: "#F2F5FF",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(35,215,255,0.5)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(35,215,255,0.2)";
              }}
            />
          </div>

          {error && (
            <p
              className="text-xs font-bold text-center py-2 rounded-lg"
              data-ocid="admin.error_state"
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
            className="w-full py-3 rounded-xl text-xs font-black tracking-widest mt-1 transition-all duration-200"
            style={{
              backgroundColor: "rgba(35,215,255,0.12)",
              color: "#23D7FF",
              border: "1px solid rgba(35,215,255,0.35)",
              boxShadow: "0 0 20px rgba(35,215,255,0.1)",
              letterSpacing: "0.15em",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor =
                "rgba(35,215,255,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor =
                "rgba(35,215,255,0.12)";
            }}
          >
            ENTER ADMIN PANEL
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Pending Section ──────────────────────────────────────────────────────────

function PendingSection() {
  const { data: entries = [], isLoading } = useAllApplicationsWithPrincipals();
  const reviewMutation = useReviewApplication();

  const pending = entries.filter(
    (e: any) =>
      e.application?.status === "pending" ||
      e.application?.status?.pending !== undefined,
  );

  async function handleReview(entry: any, approve: boolean) {
    try {
      await reviewMutation.mutateAsync({ principal: entry.principal, approve });
      toast.success(
        approve ? "Application approved!" : "Application rejected.",
      );
    } catch {
      toast.error("Action failed. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" data-ocid="admin.loading_state">
        {SKELETON_KEYS.map((k) => (
          <div
            key={k}
            className="h-24 rounded-xl animate-pulse"
            style={{ backgroundColor: "#141821" }}
          />
        ))}
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-xl"
        data-ocid="admin.empty_state"
        style={{
          backgroundColor: "#141821",
          border: "1px solid rgba(35,215,255,0.1)",
        }}
      >
        <CheckCircle
          size={32}
          style={{ color: "#23D7FF", margin: "0 auto 12px" }}
        />
        <p style={{ color: "#9AA3B2" }}>No pending applications.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {pending.map((entry: any, i: number) => {
        const app: Application = entry.application;
        const player = app.player;
        const tags: PlayerTag[] = entry.submitterTags ?? [];
        return (
          <div
            key={`${player.username}-${i}`}
            data-ocid={`admin.item.${i + 1}`}
            className="rounded-xl p-5"
            style={{
              backgroundColor: "#141821",
              border: "1px solid rgba(255,215,0,0.15)",
            }}
          >
            <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
              <div>
                <span
                  className="font-bold text-base"
                  style={{ color: "#F2F5FF", fontFamily: "BricolageGrotesque" }}
                >
                  {player.username}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className="text-xs font-mono"
                    style={{ color: "#9AA3B2" }}
                  >
                    {shortenPrincipal(entry.principal)}
                  </span>
                </div>
                <SubmitterTagBadges tags={tags} />
              </div>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  color: "#FFD700",
                  backgroundColor: "rgba(255,215,0,0.1)",
                  border: "1px solid rgba(255,215,0,0.3)",
                }}
              >
                <Clock size={10} /> PENDING
              </span>
            </div>
            <PlayerRanksDisplay player={player} />
            <div className="mt-4 flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleReview(entry, true)}
                disabled={reviewMutation.isPending}
                data-ocid="admin.confirm_button"
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200"
                style={{
                  backgroundColor: "rgba(35,215,255,0.12)",
                  color: "#23D7FF",
                  border: "1px solid rgba(35,215,255,0.3)",
                }}
              >
                {reviewMutation.isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <CheckCircle size={12} />
                )}
                APPROVE
              </button>
              <button
                type="button"
                onClick={() => handleReview(entry, false)}
                disabled={reviewMutation.isPending}
                data-ocid="admin.cancel_button"
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200"
                style={{
                  backgroundColor: "rgba(239,68,68,0.1)",
                  color: "#EF4444",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <XCircle size={12} /> REJECT
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Approved Section ─────────────────────────────────────────────────────────

function EditRanksForm({
  entry,
  onClose,
}: { entry: any; onClose: () => void }) {
  const editMutation = useEditPlayer();
  const player: BackendPlayer = entry.application.player;
  const [ranks, setRanks] = useState<Record<string, Tier>>(() => {
    const init: Record<string, Tier> = {
      overallTier: player.overallTier ?? Tier.none,
    };
    for (const f of GAMEMODE_FIELDS) {
      init[f.fieldKey] = (player[f.backendKey] as Tier) ?? Tier.none;
    }
    return init;
  });

  async function handleSave() {
    try {
      await editMutation.mutateAsync({
        principal: entry.principal,
        playerData: {
          ...player,
          ...ranks,
        },
      });
      toast.success("Ranks updated!");
      onClose();
    } catch {
      toast.error("Failed to update ranks.");
    }
  }

  return (
    <div
      className="mt-4 p-4 rounded-xl"
      style={{
        backgroundColor: "#0B0D10",
        border: "1px solid rgba(35,215,255,0.15)",
      }}
    >
      <div className="grid grid-cols-2 gap-3 mb-4">
        {GAMEMODE_FIELDS.map((f) => (
          <div key={f.id}>
            <div className="flex items-center gap-1 mb-1">
              <GamemodeIcon id={f.id} size={11} />
              <span className="text-xs" style={{ color: "#9AA3B2" }}>
                {f.id.toUpperCase()}
              </span>
            </div>
            <select
              value={ranks[f.fieldKey] ?? Tier.none}
              onChange={(e) =>
                setRanks((prev) => ({
                  ...prev,
                  [f.fieldKey]: e.target.value as Tier,
                }))
              }
              className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
              style={{
                backgroundColor: "#141821",
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
            onChange={(e) =>
              setRanks((prev) => ({
                ...prev,
                overallTier: e.target.value as Tier,
              }))
            }
            className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{
              backgroundColor: "#141821",
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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={editMutation.isPending}
          data-ocid="admin.save_button"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200"
          style={{
            backgroundColor: "rgba(35,215,255,0.12)",
            color: "#23D7FF",
            border: "1px solid rgba(35,215,255,0.3)",
          }}
        >
          {editMutation.isPending ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <CheckCircle size={11} />
          )}
          SAVE RANKS
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-xs font-bold tracking-widest"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            color: "#9AA3B2",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}

function ApprovedSection() {
  const { data: entries = [], isLoading } = useAllApplicationsWithPrincipals();
  const deleteMutation = useDeletePlayer();
  const banMutation = useBanUser();
  const [expandedEdit, setExpandedEdit] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmBan, setConfirmBan] = useState<number | null>(null);

  const approved = entries.filter(
    (e: any) =>
      e.application?.status === "approved" ||
      e.application?.status?.approved !== undefined,
  );

  async function handleDelete(idx: number, principal: any) {
    if (confirmDelete !== idx) {
      setConfirmDelete(idx);
      return;
    }
    try {
      await deleteMutation.mutateAsync(principal);
      toast.success("Player deleted.");
      setConfirmDelete(null);
    } catch {
      toast.error("Delete failed.");
    }
  }

  async function handleBan(idx: number, principal: any) {
    if (confirmBan !== idx) {
      setConfirmBan(idx);
      return;
    }
    try {
      await banMutation.mutateAsync(principal);
      toast.success("User banned.");
      setConfirmBan(null);
    } catch {
      toast.error("Ban failed.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" data-ocid="admin.loading_state">
        {SKELETON_KEYS.map((k) => (
          <div
            key={k}
            className="h-20 rounded-xl animate-pulse"
            style={{ backgroundColor: "#141821" }}
          />
        ))}
      </div>
    );
  }

  if (approved.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-xl"
        data-ocid="admin.empty_state"
        style={{
          backgroundColor: "#141821",
          border: "1px solid rgba(35,215,255,0.1)",
        }}
      >
        <p style={{ color: "#9AA3B2" }}>No approved players yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {approved.map((entry: any, i: number) => {
        const player: BackendPlayer = entry.application.player;
        return (
          <div
            key={`${player.username}-${i}`}
            data-ocid={`admin.item.${i + 1}`}
            className="rounded-xl p-4"
            style={{
              backgroundColor: "#141821",
              border: "1px solid rgba(35,215,255,0.1)",
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div>
                <span
                  className="font-bold"
                  style={{ color: "#F2F5FF", fontFamily: "BricolageGrotesque" }}
                >
                  {player.username}
                </span>
                <div
                  className="text-xs font-mono mt-0.5"
                  style={{ color: "#9AA3B2" }}
                >
                  {shortenPrincipal(entry.principal)}
                </div>
              </div>
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
            </div>

            <PlayerRanksDisplay player={player} />

            <div className="flex gap-2 flex-wrap mt-3">
              <button
                type="button"
                onClick={() => setExpandedEdit(expandedEdit === i ? null : i)}
                data-ocid={`admin.edit_button.${i + 1}`}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200"
                style={{
                  backgroundColor: "rgba(168,85,247,0.1)",
                  color: "#A855F7",
                  border: "1px solid rgba(168,85,247,0.3)",
                }}
              >
                {expandedEdit === i ? (
                  <ChevronUp size={11} />
                ) : (
                  <ChevronDown size={11} />
                )}
                EDIT RANKS
              </button>
              <button
                type="button"
                onClick={() => handleBan(i, entry.principal)}
                disabled={banMutation.isPending}
                data-ocid={`admin.delete_button.${i + 1}`}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200"
                style={{
                  backgroundColor:
                    confirmBan === i
                      ? "rgba(251,146,60,0.25)"
                      : "rgba(251,146,60,0.1)",
                  color: "#FB923C",
                  border: "1px solid rgba(251,146,60,0.3)",
                }}
              >
                <Ban size={11} />
                {confirmBan === i ? "CONFIRM BAN" : "BAN"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(i, entry.principal)}
                disabled={deleteMutation.isPending}
                data-ocid={`admin.delete_button.${i + 1}`}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200"
                style={{
                  backgroundColor:
                    confirmDelete === i
                      ? "rgba(239,68,68,0.25)"
                      : "rgba(239,68,68,0.1)",
                  color: "#EF4444",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <Trash2 size={11} />
                {confirmDelete === i ? "CONFIRM DELETE" : "DELETE"}
              </button>
            </div>

            {expandedEdit === i && (
              <EditRanksForm
                entry={entry}
                onClose={() => setExpandedEdit(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Users Section ────────────────────────────────────────────────────────────

function UserManagementSection() {
  const assignMutation = useAssignTester();
  const revokeMutation = useRevokeTester();
  const [assignPrincipal, setAssignPrincipal] = useState("");
  const [revokePrincipal, setRevokePrincipal] = useState("");

  async function handleAssign() {
    const p = parsePrincipal(assignPrincipal);
    if (!p) {
      toast.error("Invalid principal");
      return;
    }
    try {
      await assignMutation.mutateAsync(p);
      toast.success("Tester role assigned!");
      setAssignPrincipal("");
    } catch {
      toast.error("Failed to assign role.");
    }
  }

  async function handleRevoke() {
    const p = parsePrincipal(revokePrincipal);
    if (!p) {
      toast.error("Invalid principal");
      return;
    }
    try {
      await revokeMutation.mutateAsync(p);
      toast.success("Tester role revoked.");
      setRevokePrincipal("");
    } catch {
      toast.error("Failed to revoke role.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: "#141821",
          border: "1px solid rgba(35,215,255,0.15)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={16} style={{ color: "#23D7FF" }} />
          <h3
            className="font-bold tracking-widest text-sm"
            style={{
              color: "#F2F5FF",
              fontFamily: "BricolageGrotesque",
              letterSpacing: "0.1em",
            }}
          >
            ASSIGN TESTER
          </h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          <PrincipalInput
            id="assign-principal"
            placeholder="Enter principal ID"
            value={assignPrincipal}
            onChange={setAssignPrincipal}
            ocid="admin.input"
          />
          <button
            type="button"
            onClick={handleAssign}
            disabled={assignMutation.isPending}
            data-ocid="admin.confirm_button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200"
            style={{
              backgroundColor: "rgba(35,215,255,0.12)",
              color: "#23D7FF",
              border: "1px solid rgba(35,215,255,0.3)",
            }}
          >
            {assignMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <UserPlus size={12} />
            )}
            ASSIGN
          </button>
        </div>
      </div>

      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: "#141821",
          border: "1px solid rgba(168,85,247,0.15)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <UserMinus size={16} style={{ color: "#A855F7" }} />
          <h3
            className="font-bold tracking-widest text-sm"
            style={{
              color: "#F2F5FF",
              fontFamily: "BricolageGrotesque",
              letterSpacing: "0.1em",
            }}
          >
            REVOKE TESTER
          </h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          <PrincipalInput
            id="revoke-principal"
            placeholder="Enter principal ID"
            value={revokePrincipal}
            onChange={setRevokePrincipal}
            ocid="admin.input"
          />
          <button
            type="button"
            onClick={handleRevoke}
            disabled={revokeMutation.isPending}
            data-ocid="admin.cancel_button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200"
            style={{
              backgroundColor: "rgba(168,85,247,0.1)",
              color: "#A855F7",
              border: "1px solid rgba(168,85,247,0.3)",
            }}
          >
            {revokeMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <UserMinus size={12} />
            )}
            REVOKE
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tags Section ─────────────────────────────────────────────────────────────

function TagsSection() {
  const [principal, setPrincipal] = useState("");
  const [selectedTags, setSelectedTags] = useState<PlayerTag[]>([]);
  const { data: profiles = [] } = useAllProfiles();
  const assignTagsMutation = useAssignPlayerTags();

  function handlePrincipalChange(val: string) {
    setPrincipal(val);
    const p = parsePrincipal(val);
    if (p) {
      const pStr = p.toText();
      const found = profiles.find((pr) => pr.principal.toString() === pStr);
      if (found) setSelectedTags(found.tags);
      else setSelectedTags([]);
    }
  }

  function toggleTag(tag: PlayerTag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function handleSave() {
    const p = parsePrincipal(principal);
    if (!p) {
      toast.error("Enter a valid principal ID");
      return;
    }
    try {
      await assignTagsMutation.mutateAsync({
        principal: p,
        tags: selectedTags,
      });
      toast.success("Tags assigned!");
    } catch {
      toast.error("Failed to assign tags.");
    }
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: "#141821",
        border: "1px solid rgba(168,85,247,0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Tag size={16} style={{ color: "#A855F7" }} />
        <h3
          className="font-bold tracking-widest text-sm"
          style={{
            color: "#F2F5FF",
            fontFamily: "BricolageGrotesque",
            letterSpacing: "0.1em",
          }}
        >
          ASSIGN PLAYER TAGS
        </h3>
      </div>
      <p className="text-xs mb-4" style={{ color: "#9AA3B2" }}>
        Enter a player's principal ID, select their tags, and save.
      </p>
      <div className="flex gap-2 flex-wrap mb-5">
        <PrincipalInput
          placeholder="Player's principal ID"
          value={principal}
          onChange={handlePrincipalChange}
          ocid="admin.input"
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {TAG_OPTIONS.map((opt) => {
          const active = selectedTags.includes(opt.tag);
          return (
            <button
              key={opt.tag}
              type="button"
              onClick={() => toggleTag(opt.tag)}
              data-ocid="admin.toggle"
              className="px-4 py-2 rounded-full text-xs font-bold tracking-widest transition-all duration-200"
              style={{
                color: opt.color,
                backgroundColor: active ? opt.activeBg : opt.bg,
                border: `1px solid ${opt.color}${active ? "99" : "33"}`,
                boxShadow: active ? `0 0 12px ${opt.color}30` : "none",
                letterSpacing: "0.08em",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={assignTagsMutation.isPending}
        data-ocid="admin.save_button"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest transition-all duration-200"
        style={{
          backgroundColor: assignTagsMutation.isPending
            ? "rgba(168,85,247,0.08)"
            : "rgba(168,85,247,0.15)",
          color: "#A855F7",
          border: "1px solid rgba(168,85,247,0.4)",
          boxShadow: assignTagsMutation.isPending
            ? "none"
            : "0 0 16px rgba(168,85,247,0.2)",
        }}
      >
        {assignTagsMutation.isPending ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Tag size={12} />
        )}
        {assignTagsMutation.isPending ? "SAVING..." : "SAVE TAGS"}
      </button>
    </div>
  );
}

// ── Banned Section ───────────────────────────────────────────────────────────

function BannedSection() {
  const { data: bannedUsers = [], isLoading } = useBannedUsers();
  const unbanMutation = useUnbanUser();

  async function handleUnban(principal: any) {
    try {
      await unbanMutation.mutateAsync(principal);
      toast.success("User unbanned.");
    } catch {
      toast.error("Unban failed.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" data-ocid="admin.loading_state">
        {SKELETON_KEYS.map((k) => (
          <div
            key={k}
            className="h-16 rounded-xl animate-pulse"
            style={{ backgroundColor: "#141821" }}
          />
        ))}
      </div>
    );
  }

  if (bannedUsers.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-xl"
        data-ocid="admin.empty_state"
        style={{
          backgroundColor: "#141821",
          border: "1px solid rgba(35,215,255,0.1)",
        }}
      >
        <Ban size={32} style={{ color: "#9AA3B2", margin: "0 auto 12px" }} />
        <p style={{ color: "#9AA3B2" }}>No banned users.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bannedUsers.map((principal: any, i: number) => (
        <div
          key={shortenPrincipal(principal)}
          data-ocid={`admin.item.${i + 1}`}
          className="rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap"
          style={{
            backgroundColor: "#141821",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <div className="flex items-center gap-2">
            <Ban size={14} style={{ color: "#EF4444" }} />
            <span className="text-xs font-mono" style={{ color: "#9AA3B2" }}>
              {shortenPrincipal(principal)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleUnban(principal)}
            disabled={unbanMutation.isPending}
            data-ocid="admin.confirm_button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200"
            style={{
              backgroundColor: "rgba(34,197,94,0.1)",
              color: "#22C55E",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            {unbanMutation.isPending ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <CheckCircle size={11} />
            )}
            UNBAN
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Main AdminPage ───────────────────────────────────────────────────────────

type AdminTab = "pending" | "approved" | "users" | "tags" | "banned";

export default function AdminPage() {
  const navigate = useNavigate();
  const { role, isLoggedIn, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("pending");
  const [gateOpen, setGateOpen] = useState(
    () => sessionStorage.getItem(ADMIN_GATE_KEY) !== "1",
  );

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || role !== "admin")) {
      navigate({ to: "/" });
    }
  }, [isLoading, isLoggedIn, role, navigate]);

  if (isLoading || !role) return null;
  if (role !== "admin") return null;

  if (gateOpen) {
    return <AdminGate onSuccess={() => setGateOpen(false)} />;
  }

  const tabs: Array<{ key: AdminTab; label: string }> = [
    { key: "pending", label: "PENDING" },
    { key: "approved", label: "APPROVED" },
    { key: "users", label: "USERS" },
    { key: "tags", label: "TAGS" },
    { key: "banned", label: "BANNED" },
  ];

  return (
    <div
      className="py-16 px-4"
      style={{ backgroundColor: "#0B0D10", minHeight: "80vh" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck size={24} style={{ color: "#FFD700" }} />
          <SectionHeader
            title="Admin Panel"
            subtitle="Manage submissions, players, and roles"
          />
        </div>

        <div className="flex gap-2 mb-8 flex-wrap" data-ocid="admin.tab">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              data-ocid="admin.tab"
              className="px-5 py-2 rounded-full text-xs font-bold tracking-widest transition-all duration-200"
              style={{
                backgroundColor:
                  activeTab === tab.key
                    ? "rgba(255,215,0,0.12)"
                    : "rgba(255,255,255,0.04)",
                color: activeTab === tab.key ? "#FFD700" : "#9AA3B2",
                border:
                  activeTab === tab.key
                    ? "1px solid rgba(255,215,0,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                letterSpacing: "0.1em",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "pending" && <PendingSection />}
        {activeTab === "approved" && <ApprovedSection />}
        {activeTab === "users" && <UserManagementSection />}
        {activeTab === "tags" && <TagsSection />}
        {activeTab === "banned" && <BannedSection />}
      </div>
    </div>
  );
}

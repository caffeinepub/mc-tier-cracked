import { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  Clock,
  Loader2,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Application, Player as BackendPlayer } from "../backend.d";
import GamemodeIcon from "../components/GamemodeIcon";
import SectionHeader from "../components/SectionHeader";
import TierBadge from "../components/TierBadge";
import type { GamemodeId } from "../data/dummyData";
import { useAuth } from "../hooks/useAuth";
import {
  useApprovedPlayers,
  useAssignTester,
  useDeletePlayer,
  usePendingApplications,
  useReviewApplication,
  useRevokeTester,
} from "../hooks/useQueries";
import { backendTierToLocal } from "../utils/playerUtils";

const GAMEMODE_FIELDS: Array<{
  id: GamemodeId;
  backendKey: keyof BackendPlayer;
}> = [
  { id: "axe-pvp", backendKey: "axePvpTier" },
  { id: "sword-pvp", backendKey: "swordPvpTier" },
  { id: "crystal-pvp", backendKey: "crystalPvpTier" },
  { id: "uhc", backendKey: "uhcTier" },
  { id: "nethpot", backendKey: "nethpotTier" },
  { id: "smp-pvp", backendKey: "smpPvpTier" },
  { id: "mace-pvp", backendKey: "macePvpTier" },
  { id: "cart-pvp", backendKey: "cartPvpTier" },
];

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3"];

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

function PendingSection() {
  const { data: apps = [], isLoading } = usePendingApplications();
  const reviewMutation = useReviewApplication();
  const [principals, setPrincipals] = useState<Record<number, string>>({});

  async function handleReview(idx: number, approve: boolean) {
    const p = parsePrincipal(principals[idx] ?? "");
    if (!p) {
      toast.error("Enter a valid submitter principal");
      return;
    }
    try {
      await reviewMutation.mutateAsync({ principal: p, approve });
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

  if (apps.length === 0) {
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
      {apps.map((app, i) => (
        <div
          key={app.player.username}
          data-ocid={`admin.item.${i + 1}`}
          className="rounded-xl p-5"
          style={{
            backgroundColor: "#141821",
            border: "1px solid rgba(255,215,0,0.15)",
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <span
              className="font-bold text-base"
              style={{ color: "#F2F5FF", fontFamily: "BricolageGrotesque" }}
            >
              {app.player.username}
            </span>
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
          <PlayerRanksDisplay player={app.player} />
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-xs" style={{ color: "#9AA3B2" }}>
              Enter submitter’s principal to approve/reject:
            </p>
            <div className="flex gap-2 flex-wrap">
              <PrincipalInput
                placeholder="aaaaa-bbbbb-ccccc..."
                value={principals[i] ?? ""}
                onChange={(v) => setPrincipals((prev) => ({ ...prev, [i]: v }))}
                ocid="admin.input"
              />
              <button
                type="button"
                onClick={() => handleReview(i, true)}
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
                onClick={() => handleReview(i, false)}
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
        </div>
      ))}
    </div>
  );
}

function ApprovedSection() {
  const { data: players = [], isLoading } = useApprovedPlayers();
  const deleteMutation = useDeletePlayer();
  const [deletePrincipals, setDeletePrincipals] = useState<
    Record<number, string>
  >({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  async function handleDelete(idx: number) {
    const p = parsePrincipal(deletePrincipals[idx] ?? "");
    if (!p) {
      toast.error("Enter a valid principal");
      return;
    }
    if (confirmDelete !== idx) {
      setConfirmDelete(idx);
      return;
    }
    try {
      await deleteMutation.mutateAsync(p);
      toast.success("Player deleted.");
      setConfirmDelete(null);
    } catch {
      toast.error("Delete failed.");
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

  if (players.length === 0) {
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
      {players.map((player, i) => (
        <div
          key={player.username}
          data-ocid={`admin.item.${i + 1}`}
          className="rounded-xl p-4"
          style={{
            backgroundColor: "#141821",
            border: "1px solid rgba(35,215,255,0.1)",
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span
              className="font-bold"
              style={{ color: "#F2F5FF", fontFamily: "BricolageGrotesque" }}
            >
              {player.username}
            </span>
            {player.discord && (
              <span className="text-xs" style={{ color: "#9AA3B2" }}>
                💬 {player.discord}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.entries(player.ranks).map(([modeId, tier]) => (
              <div key={modeId} className="flex items-center gap-1">
                <GamemodeIcon id={modeId as GamemodeId} size={12} />
                <TierBadge tier={tier} size="sm" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <PrincipalInput
              placeholder="Player’s principal to delete"
              value={deletePrincipals[i] ?? ""}
              onChange={(v) =>
                setDeletePrincipals((prev) => ({ ...prev, [i]: v }))
              }
              ocid="admin.input"
            />
            <button
              type="button"
              onClick={() => handleDelete(i)}
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
              <Trash2 size={12} />
              {confirmDelete === i ? "CONFIRM DELETE" : "DELETE"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

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

export default function AdminPage() {
  const navigate = useNavigate();
  const { role, isLoggedIn, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "users">(
    "pending",
  );

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || role !== "admin")) {
      navigate({ to: "/" });
    }
  }, [isLoading, isLoggedIn, role, navigate]);

  if (isLoading || !role) return null;
  if (role !== "admin") return null;

  const tabs: Array<{ key: "pending" | "approved" | "users"; label: string }> =
    [
      { key: "pending", label: "PENDING" },
      { key: "approved", label: "APPROVED" },
      { key: "users", label: "USERS" },
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

        {/* Tab nav */}
        <div className="flex gap-2 mb-8" data-ocid="admin.tab">
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
      </div>
    </div>
  );
}

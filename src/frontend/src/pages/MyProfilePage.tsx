import { Link } from "@tanstack/react-router";
import { Check, Copy, Edit2, User, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import GamemodeIcon from "../components/GamemodeIcon";
import { TagBadge } from "../components/LeaderboardRow";
import TierBadge from "../components/TierBadge";
import { GAMEMODES } from "../data/dummyData";
import type { GamemodeId } from "../data/dummyData";
import { useAuth } from "../hooks/useAuth";
import {
  useAllProfiles,
  useCallerProfile,
  usePlayerByUsername,
  useSaveUserProfile,
} from "../hooks/useQueries";

const ROLE_BADGE: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  admin: {
    label: "ADMIN",
    color: "#FFD700",
    bg: "rgba(255,215,0,0.12)",
    border: "rgba(255,215,0,0.4)",
  },
  tester: {
    label: "TESTER",
    color: "#23D7FF",
    bg: "rgba(35,215,255,0.12)",
    border: "rgba(35,215,255,0.4)",
  },
  user: {
    label: "USER",
    color: "#A855F7",
    bg: "rgba(168,85,247,0.12)",
    border: "rgba(168,85,247,0.4)",
  },
};

function getAvatarColors(username: string): [string, string] {
  const palettes: Array<[string, string]> = [
    ["#23D7FF", "#A855F7"],
    ["#A855F7", "#7C3AED"],
    ["#22D3EE", "#9333EA"],
    ["#06B6D4", "#C084FC"],
    ["#38BDF8", "#A855F7"],
  ];
  return palettes[username.charCodeAt(0) % palettes.length];
}

export default function MyProfilePage() {
  const { isLoggedIn, principal, role } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const username = profile?.name ?? "";
  const { data: player, isLoading: playerLoading } =
    usePlayerByUsername(username);
  const { data: profiles = [] } = useAllProfiles();
  const saveProfile = useSaveUserProfile();

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const [copied, setCopied] = useState(false);

  const tags = useMemo(() => {
    const entry = profiles.find((p) => p.name === username);
    return entry?.tags ?? [];
  }, [profiles, username]);

  const badge = role ? ROLE_BADGE[role] : null;
  const [c1, c2] = username
    ? getAvatarColors(username)
    : ["#23D7FF", "#A855F7"];

  const rankedModes = player
    ? GAMEMODES.filter((gm) => player.ranks[gm.id as GamemodeId])
    : [];

  function handleCopy() {
    if (!principal) return;
    navigator.clipboard.writeText(principal).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Principal ID copied!");
    });
  }

  function startEdit() {
    setNewName(username);
    setNameError("");
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setNameError("");
  }

  async function saveName() {
    const trimmed = newName.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
      setNameError(
        "Username must be 3-20 chars: letters, numbers, underscores only.",
      );
      return;
    }
    if (!profile) return;
    try {
      await saveProfile.mutateAsync({ name: trimmed, role: profile.role });
      setEditing(false);
      setNameError("");
      toast.success("Username updated!");
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (
        msg.toLowerCase().includes("taken") ||
        msg.toLowerCase().includes("already")
      ) {
        setNameError("That username is already taken.");
      } else {
        setNameError("Failed to save. Try again.");
      }
    }
  }

  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0B0D10" }}
      >
        <div className="text-center" data-ocid="profile.error_state">
          <div className="text-5xl mb-4">🔒</div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "#F2F5FF", fontFamily: "BricolageGrotesque" }}
          >
            Access Restricted
          </h2>
          <p className="mb-6" style={{ color: "#9AA3B2" }}>
            Please log in to view your profile.
          </p>
          <Link
            to="/"
            className="px-6 py-2 rounded-full text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #22D3EE, #A855F7)",
              color: "#fff",
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0B0D10" }}
      >
        <div
          className="flex flex-col items-center gap-4"
          data-ocid="myprofile.loading_state"
        >
          <div
            className="w-20 h-20 rounded-full animate-pulse"
            style={{ backgroundColor: "#141821" }}
          />
          <div
            className="h-4 w-40 rounded animate-pulse"
            style={{ backgroundColor: "#141821" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="py-12 px-4"
      style={{ backgroundColor: "#0B0D10", minHeight: "80vh" }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1
            className="text-3xl font-extrabold tracking-wide"
            style={{
              fontFamily: "BricolageGrotesque",
              color: "#F2F5FF",
              letterSpacing: "0.06em",
            }}
          >
            MY PROFILE
          </h1>
          <p className="text-sm mt-1" style={{ color: "#9AA3B2" }}>
            Your personal stats and identity.
          </p>
        </div>

        {/* Identity Card */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: "#141821",
            border: "1px solid rgba(35,215,255,0.2)",
            boxShadow: "0 0 40px rgba(35,215,255,0.06)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${c1}, ${c2})`,
                boxShadow: `0 0 30px ${c1}50`,
                color: "#fff",
                fontFamily: "BricolageGrotesque",
              }}
            >
              {username ? username.charAt(0).toUpperCase() : <User size={28} />}
            </div>

            <div className="flex-1 w-full">
              {/* Username row */}
              <div className="flex items-center gap-3 flex-wrap mb-3">
                {!editing ? (
                  <>
                    <span
                      className="text-2xl font-extrabold"
                      style={{
                        fontFamily: "BricolageGrotesque",
                        color: "#F2F5FF",
                      }}
                    >
                      {username || "(no username set)"}
                    </span>
                    <button
                      type="button"
                      data-ocid="myprofile.edit_button"
                      onClick={startEdit}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200"
                      style={{
                        color: "#23D7FF",
                        background: "rgba(35,215,255,0.1)",
                        border: "1px solid rgba(35,215,255,0.3)",
                      }}
                    >
                      <Edit2 size={11} /> EDIT
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        data-ocid="myprofile.input"
                        value={newName}
                        onChange={(e) => {
                          setNewName(e.target.value);
                          setNameError("");
                        }}
                        maxLength={20}
                        className="rounded-lg px-3 py-2 text-sm font-bold flex-1"
                        style={{
                          backgroundColor: "#0B0D10",
                          border: nameError
                            ? "1px solid #EF4444"
                            : "1px solid rgba(35,215,255,0.4)",
                          color: "#F2F5FF",
                          outline: "none",
                          fontFamily: "BricolageGrotesque",
                        }}
                        placeholder="New username"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveName();
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <button
                        type="button"
                        data-ocid="myprofile.save_button"
                        onClick={saveName}
                        disabled={saveProfile.isPending}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: "rgba(35,215,255,0.15)",
                          color: "#23D7FF",
                          border: "1px solid rgba(35,215,255,0.4)",
                          opacity: saveProfile.isPending ? 0.6 : 1,
                        }}
                      >
                        <Check size={13} /> SAVE
                      </button>
                      <button
                        type="button"
                        data-ocid="myprofile.cancel_button"
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          color: "#EF4444",
                          border: "1px solid rgba(239,68,68,0.3)",
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                    {nameError && (
                      <p
                        className="text-xs"
                        data-ocid="myprofile.error_state"
                        style={{ color: "#EF4444" }}
                      >
                        {nameError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Role badge */}
              {badge && (
                <div className="mb-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold tracking-widest"
                    style={{
                      color: badge.color,
                      backgroundColor: badge.bg,
                      border: `1px solid ${badge.border}`,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Principal ID */}
          <div
            className="mt-5 pt-5"
            style={{ borderTop: "1px solid rgba(35,215,255,0.1)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#9AA3B2", letterSpacing: "0.1em" }}
              >
                Principal ID
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  color: "#23D7FF",
                  background: "rgba(35,215,255,0.08)",
                  border: "1px solid rgba(35,215,255,0.2)",
                }}
              >
                YOUR FULL ID
              </span>
            </div>
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                backgroundColor: "#0B0D10",
                border: "1px solid rgba(35,215,255,0.15)",
              }}
            >
              <span
                className="flex-1 text-sm break-all select-all"
                data-ocid="myprofile.panel"
                style={{
                  color: "#23D7FF",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  lineHeight: 1.7,
                }}
              >
                {principal ?? "—"}
              </span>
              <button
                type="button"
                data-ocid="myprofile.button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-all"
                style={{
                  color: copied ? "#22C55E" : "#23D7FF",
                  background: copied
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(35,215,255,0.1)",
                  border: copied
                    ? "1px solid rgba(34,197,94,0.3)"
                    : "1px solid rgba(35,215,255,0.3)",
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
          </div>
        </div>

        {/* Gamemode Rankings */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "#141821",
            border: "1px solid rgba(168,85,247,0.2)",
            boxShadow: "0 0 30px rgba(168,85,247,0.05)",
          }}
        >
          <h2
            className="text-base font-bold uppercase tracking-widest mb-5"
            style={{
              fontFamily: "BricolageGrotesque",
              color: "#F2F5FF",
              letterSpacing: "0.12em",
            }}
          >
            Gamemode Rankings
          </h2>

          {playerLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl animate-pulse"
                  style={{ backgroundColor: "#0B0D10" }}
                />
              ))}
            </div>
          ) : !player ? (
            <div className="text-center py-8" data-ocid="myprofile.empty_state">
              <div className="text-4xl mb-3">🎮</div>
              <p className="font-semibold" style={{ color: "#9AA3B2" }}>
                You are not on the leaderboard yet.
              </p>
              <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                Submit an application through a Tester to appear here.
              </p>
            </div>
          ) : rankedModes.length === 0 ? (
            <div className="text-center py-8" data-ocid="myprofile.empty_state">
              <p style={{ color: "#9AA3B2" }}>No gamemodes ranked yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rankedModes.map((gm, i) => {
                const tier = player.ranks[gm.id as GamemodeId]!;
                return (
                  <Link
                    key={gm.id}
                    to="/gamemodes/$id"
                    params={{ id: gm.id }}
                    data-ocid={`myprofile.item.${i + 1}`}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
                    style={{
                      backgroundColor: "#0B0D10",
                      border: "1px solid rgba(168,85,247,0.15)",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor =
                        "rgba(168,85,247,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor =
                        "rgba(168,85,247,0.15)";
                    }}
                  >
                    <GamemodeIcon id={gm.id} size={24} />
                    <span
                      className="flex-1 font-semibold text-sm"
                      style={{
                        color: "#F2F5FF",
                        fontFamily: "BricolageGrotesque",
                      }}
                    >
                      {gm.name}
                    </span>
                    <TierBadge tier={tier} size="md" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

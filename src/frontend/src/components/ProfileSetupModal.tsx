import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useAuth } from "../hooks/useAuth";
import { useCallerProfile, useSaveUserProfile } from "../hooks/useQueries";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function getLocalProfile(
  principal: string | null,
): { name: string; role: string } | null {
  if (!principal) return null;
  try {
    const cached = localStorage.getItem(`mc_tier_profile_${principal}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.name && USERNAME_RE.test(parsed.name)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export default function ProfileSetupModal() {
  const { isLoggedIn, principal } = useAuth();
  const { actor, isFetching: actorFetching } = useActor();
  const {
    data: profile,
    isLoading: profileLoading,
    isFetching: profileFetching,
  } = useCallerProfile();
  const saveMutation = useSaveUserProfile();

  // Read localStorage directly — this is synchronous and always up-to-date
  const localProfile = useMemo(() => getLocalProfile(principal), [principal]);

  function getInitialUsername() {
    return localProfile?.name ?? profile?.name ?? "";
  }

  const [username, setUsername] = useState(getInitialUsername);
  const [error, setError] = useState("");

  const actorReady = !!actor && !actorFetching;

  // Don't show if:
  // 1. Not logged in
  // 2. Actor not ready
  // 3. Profile still loading / fetching from backend
  // 4. localStorage already has a valid username (they've set one before)
  // 5. Backend profile has a valid username
  const hasValidUsername =
    (profile?.name && USERNAME_RE.test(profile.name)) ||
    (localProfile?.name && USERNAME_RE.test(localProfile.name));

  const shouldShow =
    isLoggedIn &&
    actorReady &&
    !profileLoading &&
    !profileFetching &&
    !hasValidUsername;

  if (!shouldShow) return null;

  const isValid = USERNAME_RE.test(username);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actorReady) {
      setError("Still connecting, please wait a moment and try again.");
      return;
    }
    if (!isValid) {
      setError(
        "Username must be 3-20 characters (letters, numbers, underscore only)",
      );
      return;
    }
    setError("");
    try {
      await saveMutation.mutateAsync({ name: username, role: "User" });
      toast.success("Profile created! Welcome to MC Tier.");
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (
        msg.toLowerCase().includes("taken") ||
        msg.toLowerCase().includes("unique") ||
        msg.toLowerCase().includes("exists")
      ) {
        setError("That username is already taken. Choose another.");
      } else if (msg.toLowerCase().includes("not connected")) {
        setError(
          "Still connecting to the network. Please wait a moment and try again.",
        );
      } else {
        setError("Failed to save profile. Please try again.");
      }
    }
  }

  const isDisabled = saveMutation.isPending || !username || !actorReady;

  return (
    <>
      <style>{`
        @keyframes modalOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalCardIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-overlay-animate {
          animation: modalOverlayIn 200ms ease forwards;
        }
        .modal-card-animate {
          animation: modalCardIn 200ms ease forwards;
        }
      `}</style>
      <div
        className="modal-overlay-animate fixed inset-0 z-50 flex items-center justify-center"
        style={{
          backgroundColor: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
        }}
        data-ocid="profile.modal"
      >
        <div
          className="modal-card-animate w-full max-w-md mx-4 rounded-2xl p-8"
          style={{
            backgroundColor: "#141821",
            border: "1px solid rgba(35,215,255,0.25)",
            boxShadow: "0 0 60px rgba(35,215,255,0.15)",
          }}
        >
          <div className="mb-6 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
              style={{
                background: "linear-gradient(135deg, #23D7FF, #A855F7)",
                boxShadow: "0 0 30px rgba(35,215,255,0.4)",
              }}
            >
              🎮
            </div>
            <h2
              className="text-2xl font-extrabold mb-1"
              style={{ color: "#F2F5FF", fontFamily: "BricolageGrotesque" }}
            >
              Set Your Username
            </h2>
            <p className="text-sm" style={{ color: "#9AA3B2" }}>
              Choose a unique name. It will appear on the leaderboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="Enter username..."
                maxLength={20}
                data-ocid="profile.input"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  backgroundColor: "#0B0D10",
                  border: error
                    ? "1px solid rgba(239,68,68,0.6)"
                    : "1px solid rgba(35,215,255,0.25)",
                  color: "#F2F5FF",
                  fontFamily: "BricolageGrotesque",
                }}
                onFocus={(e) => {
                  if (!error)
                    e.target.style.borderColor = "rgba(35,215,255,0.6)";
                }}
                onBlur={(e) => {
                  if (!error)
                    e.target.style.borderColor = "rgba(35,215,255,0.25)";
                }}
              />
              {error && (
                <p
                  className="text-xs mt-1.5"
                  data-ocid="profile.error_state"
                  style={{ color: "#EF4444" }}
                >
                  {error}
                </p>
              )}
              <p className="text-xs mt-1.5" style={{ color: "#5A6478" }}>
                3–20 characters. Letters, numbers, and underscores only.
              </p>
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              data-ocid="profile.submit_button"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold tracking-widest text-sm transition-all duration-200"
              style={{
                backgroundColor: "rgba(35,215,255,0.15)",
                color: "#23D7FF",
                border: "1px solid rgba(35,215,255,0.4)",
                boxShadow: isDisabled
                  ? "none"
                  : "0 0 20px rgba(35,215,255,0.2)",
                opacity: isDisabled ? 0.6 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              {saveMutation.isPending || actorFetching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              {saveMutation.isPending
                ? "SAVING..."
                : actorFetching
                  ? "CONNECTING..."
                  : "CONFIRM USERNAME"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

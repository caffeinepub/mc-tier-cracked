import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useCallerProfile, useSaveUserProfile } from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const { isLoggedIn } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const saveMutation = useSaveUserProfile();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const shouldShow = isLoggedIn && !profileLoading && !profile;
  if (!shouldShow) return null;

  const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      } else {
        setError("Failed to save profile. Please try again.");
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
      }}
      data-ocid="profile.modal"
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl p-8"
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
                if (!error) e.target.style.borderColor = "rgba(35,215,255,0.6)";
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
            disabled={saveMutation.isPending || !username}
            data-ocid="profile.submit_button"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold tracking-widest text-sm transition-all duration-200"
            style={{
              backgroundColor: "rgba(35,215,255,0.15)",
              color: "#23D7FF",
              border: "1px solid rgba(35,215,255,0.4)",
              boxShadow: saveMutation.isPending
                ? "none"
                : "0 0 20px rgba(35,215,255,0.2)",
              opacity: saveMutation.isPending || !username ? 0.6 : 1,
              cursor:
                saveMutation.isPending || !username ? "not-allowed" : "pointer",
            }}
          >
            {saveMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : null}
            {saveMutation.isPending ? "SAVING..." : "CONFIRM USERNAME"}
          </button>
        </form>
      </div>
    </div>
  );
}

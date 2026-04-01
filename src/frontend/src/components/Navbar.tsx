import { Link, useRouterState } from "@tanstack/react-router";
import { FlaskConical, LogOut, Menu, UserCircle, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCallerProfile } from "../hooks/useQueries";

const NAV_LINKS = [
  { label: "HOME", href: "/" as const },
  { label: "GAMEMODES", href: "/gamemodes" as const },
  { label: "LEADERBOARD", href: "/leaderboard" as const },
];

const ROLE_BADGE: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
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

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { isLoggedIn, role, login, logout, principal, isLoading } = useAuth();
  const { data: callerProfile } = useCallerProfile();

  const localUsername = useMemo(() => {
    if (!principal) return "";
    try {
      const cached = localStorage.getItem(`mc_tier_profile_${principal}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed?.name || "";
      }
    } catch {
      /* ignore */
    }
    return "";
  }, [principal]);

  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : "";
  const displayName = callerProfile?.name || localUsername || shortPrincipal;
  const badge = role && role !== "admin" ? ROLE_BADGE[role] : null;

  const extraLinks = [
    ...(isLoggedIn ? [{ label: "MY PROFILE", href: "/profile" as const }] : []),
    ...(role === "tester" || role === "admin"
      ? [{ label: "TESTER", href: "/tester" as const }]
      : []),
  ];

  const allLinks = [...NAV_LINKS, ...extraLinks];

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: "rgba(15,18,22,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(35,215,255,0.12)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-1 flex-shrink-0"
            data-ocid="nav.link"
          >
            <span
              className="text-xl font-bold tracking-wider"
              style={{
                fontFamily: "BricolageGrotesque",
                color: "#F2F5FF",
                letterSpacing: "0.08em",
              }}
            >
              MC TIER
            </span>
            <span
              className="text-xl font-bold tracking-wider"
              style={{
                fontFamily: "BricolageGrotesque",
                color: "#A855F7",
                letterSpacing: "0.06em",
              }}
            >
              (CRACKED)
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-ocid="nav.link"
                className="text-sm font-semibold tracking-widest transition-all duration-200"
                style={{
                  color: pathname === link.href ? "#23D7FF" : "#9AA3B2",
                  textShadow:
                    pathname === link.href
                      ? "0 0 15px rgba(35,215,255,0.6)"
                      : "none",
                  letterSpacing: "0.12em",
                }}
              >
                {link.label === "TESTER" ? (
                  <span className="flex items-center gap-1">
                    <FlaskConical size={12} />
                    {link.label}
                  </span>
                ) : link.label === "MY PROFILE" ? (
                  <span className="flex items-center gap-1">
                    <UserCircle size={12} />
                    {link.label}
                  </span>
                ) : (
                  link.label
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/profile"
                  data-ocid="nav.link"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200"
                  style={{ textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(35,215,255,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "transparent";
                  }}
                >
                  {badge && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold tracking-widest"
                      style={{
                        color: badge.color,
                        backgroundColor: badge.bg,
                        border: `1px solid ${badge.border}`,
                        letterSpacing: "0.1em",
                      }}
                    >
                      {badge.label}
                    </span>
                  )}
                  <div className="flex flex-col items-end">
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: "#F2F5FF",
                        fontFamily: "BricolageGrotesque",
                      }}
                    >
                      {displayName}
                    </span>
                    {(callerProfile?.name || localUsername) && (
                      <span
                        className="text-xs"
                        style={{
                          color: "#5A6478",
                          fontFamily: "monospace",
                          fontSize: "10px",
                        }}
                      >
                        {shortPrincipal}
                      </span>
                    )}
                  </div>
                </Link>
                <button
                  type="button"
                  data-ocid="nav.button"
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold tracking-widest transition-all duration-300"
                  style={{
                    background: "rgba(168,85,247,0.1)",
                    color: "#A855F7",
                    border: "1px solid rgba(168,85,247,0.3)",
                    letterSpacing: "0.1em",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(168,85,247,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(168,85,247,0.1)";
                  }}
                >
                  <LogOut size={14} />
                  LOGOUT
                </button>
              </div>
            ) : (
              <button
                type="button"
                data-ocid="nav.button"
                onClick={login}
                disabled={isLoading}
                className="hidden md:flex items-center px-5 py-2 rounded-full text-sm font-bold tracking-widest transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #22D3EE, #A855F7)",
                  color: "#fff",
                  letterSpacing: "0.1em",
                  boxShadow: "0 0 20px rgba(35,215,255,0.3)",
                  opacity: isLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 30px rgba(35,215,255,0.6), 0 0 50px rgba(168,85,247,0.3)";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 20px rgba(35,215,255,0.3)";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(0)";
                }}
              >
                LOGIN
              </button>
            )}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg"
              style={{ color: "#9AA3B2" }}
              onClick={() => setMobileOpen(!mobileOpen)}
              data-ocid="nav.toggle"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-3"
          style={{ borderTop: "1px solid rgba(35,215,255,0.1)" }}
        >
          {allLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              data-ocid="nav.link"
              className="text-sm font-semibold tracking-widest py-2"
              style={{
                color: pathname === link.href ? "#23D7FF" : "#9AA3B2",
                letterSpacing: "0.12em",
              }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <div className="flex flex-col gap-2 mt-2">
              {badge && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold w-fit"
                  style={{
                    color: badge.color,
                    backgroundColor: badge.bg,
                    border: `1px solid ${badge.border}`,
                  }}
                >
                  {badge.label}
                </span>
              )}
              <Link
                to="/profile"
                data-ocid="nav.link"
                className="flex flex-col"
                onClick={() => setMobileOpen(false)}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#F2F5FF", fontFamily: "BricolageGrotesque" }}
                >
                  {displayName}
                </span>
                {(callerProfile?.name || localUsername) && (
                  <span
                    className="text-xs"
                    style={{ color: "#5A6478", fontFamily: "monospace" }}
                  >
                    {shortPrincipal}
                  </span>
                )}
              </Link>
              <button
                type="button"
                data-ocid="nav.button"
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold tracking-widest w-full justify-center"
                style={{
                  background: "rgba(168,85,247,0.1)",
                  color: "#A855F7",
                  border: "1px solid rgba(168,85,247,0.3)",
                }}
              >
                <LogOut size={14} />
                LOGOUT
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-ocid="nav.button"
              onClick={login}
              className="mt-2 px-5 py-2 rounded-full text-sm font-bold tracking-widest w-full"
              style={{
                background: "linear-gradient(135deg, #22D3EE, #A855F7)",
                color: "#fff",
                letterSpacing: "0.1em",
              }}
            >
              LOGIN
            </button>
          )}
        </div>
      )}
    </header>
  );
}

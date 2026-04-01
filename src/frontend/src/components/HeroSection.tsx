import { Link } from "@tanstack/react-router";
import { useApprovedPlayers } from "../hooks/useQueries";

export default function HeroSection() {
  const { data: players = [] } = useApprovedPlayers();
  const playerCount = players.length;

  return (
    <section
      className="relative overflow-hidden flex items-center justify-center"
      style={{ minHeight: "70vh", backgroundColor: "#0B0D10" }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(35,215,255,0.06) 0%, rgba(168,85,247,0.04) 50%, transparent 70%)",
        }}
      />

      {/* Animated orbs */}
      <div
        className="absolute"
        style={{
          width: 500,
          height: 500,
          left: "-10%",
          top: "-20%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(35,215,255,0.12) 0%, transparent 70%)",
          animation: "float-orb 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        className="absolute"
        style={{
          width: 600,
          height: 600,
          right: "-15%",
          bottom: "-10%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
          animation: "float-orb-2 10s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        className="absolute"
        style={{
          width: 300,
          height: 300,
          right: "20%",
          top: "10%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(35,215,255,0.08) 0%, transparent 70%)",
          animation: "float-orb 12s ease-in-out infinite reverse",
          pointerEvents: "none",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(35,215,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(35,215,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-3">
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
            style={{
              background: "rgba(35,215,255,0.1)",
              border: "1px solid rgba(35,215,255,0.3)",
              color: "#23D7FF",
              letterSpacing: "0.2em",
            }}
          >
            FAIR RANKING PLATFORM
          </span>
        </div>

        <h1
          className="glow-text-cyan font-display font-extrabold uppercase mb-6"
          style={{
            fontFamily: "BricolageGrotesque",
            fontSize: "clamp(2.8rem, 8vw, 6rem)",
            letterSpacing: "0.04em",
            lineHeight: 1.0,
            color: "#F2F5FF",
          }}
        >
          <span style={{ color: "#F2F5FF" }}>MC TIER</span>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #23D7FF, #A855F7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            (CRACKED)
          </span>
        </h1>

        <p
          className="text-lg md:text-xl mb-10 max-w-xl mx-auto"
          style={{ color: "#9AA3B2", letterSpacing: "0.04em", lineHeight: 1.6 }}
        >
          Fair Tier Ranking for Cracked Players
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/leaderboard"
            data-ocid="hero.primary_button"
            className="cta-gradient px-8 py-3.5 rounded-full font-bold text-sm tracking-widest text-white inline-block"
            style={{ letterSpacing: "0.12em" }}
          >
            VIEW TIER LISTS
          </Link>
          <Link
            to="/gamemodes"
            data-ocid="hero.secondary_button"
            className="px-8 py-3.5 rounded-full font-bold text-sm tracking-widest inline-block transition-all duration-300"
            style={{
              border: "1px solid rgba(168,85,247,0.5)",
              color: "#A855F7",
              letterSpacing: "0.12em",
              backgroundColor: "rgba(168,85,247,0.06)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 25px rgba(168,85,247,0.4)";
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                "rgba(168,85,247,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                "rgba(168,85,247,0.06)";
            }}
          >
            EXPLORE MODES
          </Link>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-12">
          {[
            { value: String(playerCount), label: "Ranked Players" },
            { value: "8", label: "Gamemodes" },
            { value: "20", label: "Tier Levels" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-3xl font-extrabold"
                style={{
                  fontFamily: "BricolageGrotesque",
                  background: "linear-gradient(135deg, #23D7FF, #A855F7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs tracking-widest mt-1"
                style={{ color: "#9AA3B2", letterSpacing: "0.15em" }}
              >
                {stat.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

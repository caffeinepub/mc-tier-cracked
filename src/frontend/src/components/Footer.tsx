export default function Footer() {
  const year = new Date().getFullYear();
  const utm = encodeURIComponent(window.location.hostname);

  return (
    <footer
      className="mt-20 py-8 text-center"
      style={{
        borderTop: "1px solid rgba(35,215,255,0.1)",
        backgroundColor: "#0F1216",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div style={{ color: "#9AA3B2", fontSize: "13px" }}>
          <span
            style={{
              fontFamily: "BricolageGrotesque",
              fontWeight: 700,
              background: "linear-gradient(135deg, #23D7FF, #A855F7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            MC TIER (CRACKED)
          </span>
          <span style={{ marginLeft: 8 }}>
            — Fair Tier Ranking for Cracked Players
          </span>
        </div>
        <div style={{ color: "#9AA3B2", fontSize: "12px" }}>
          © {year}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${utm}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#23D7FF" }}
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}

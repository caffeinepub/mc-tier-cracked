export default function Footer() {
  return (
    <footer
      className="mt-20 py-10 text-center"
      style={{
        borderTop: "1px solid rgba(35,215,255,0.1)",
        backgroundColor: "#0F1216",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-4">
        <div
          style={{
            color: "#9AA3B2",
            fontSize: "12px",
            lineHeight: "1.8",
            textAlign: "center",
          }}
        >
          <p style={{ marginBottom: 4 }}>
            <span style={{ color: "#c0c8d4" }}>
              © 2026 MC TIER (CRACKED). All rights reserved.
            </span>
          </p>
          <p style={{ marginBottom: 4 }}>
            MC TIER (CRACKED) is not affiliated with, endorsed by, or sponsored
            by Mojang Studios or Microsoft.
          </p>
          <p style={{ marginBottom: 4 }}>
            Minecraft is a trademark of Mojang Studios. All related assets,
            names, and game content belong to Mojang Studios and Microsoft.
          </p>
          <p style={{ marginBottom: 4 }}>
            All server listings, logos, and content are submitted by their
            respective owners. We do not claim ownership of any third-party
            content displayed on this website.
          </p>
          <p style={{ marginBottom: 4 }}>
            If you are a copyright owner and believe your content has been used
            improperly, please contact us for immediate removal.
          </p>
          <p>
            By using this website, you agree to our{" "}
            <span style={{ color: "#23D7FF", cursor: "pointer" }}>
              Terms of Service
            </span>{" "}
            and{" "}
            <span style={{ color: "#23D7FF", cursor: "pointer" }}>
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-4 mb-4">
        <div
          className="flex-1 max-w-24 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(35,215,255,0.5))",
          }}
        />
        <h2
          className="text-2xl md:text-3xl font-extrabold uppercase tracking-widest"
          style={{
            fontFamily: "BricolageGrotesque",
            color: "#F2F5FF",
            letterSpacing: "0.14em",
          }}
        >
          {title}
        </h2>
        <div
          className="flex-1 max-w-24 h-px"
          style={{
            background:
              "linear-gradient(90deg, rgba(35,215,255,0.5), transparent)",
          }}
        />
      </div>
      {subtitle && (
        <p className="text-sm" style={{ color: "#9AA3B2" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

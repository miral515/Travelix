type LogoProps = {
  /** "mark" = icon only · "compact" = icon + TRAVELIX · "full" = icon + TRAVELIX + tagline */
  variant?: "mark" | "compact" | "full";
  className?: string;
};

export default function Logo({ variant = "compact", className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[color:var(--tvx-navy)]">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16283A"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[color:var(--tvx-orange)]" />
      </span>

      {variant !== "mark" && (
        <div>
          <p className="tvx-mono text-[11px] text-[color:var(--tvx-navy)]">TRAVELIX</p>
          {variant === "full" && (
            <p className="tvx-mono text-[9px] text-[color:var(--tvx-muted)]">AI ITINERARY CO.</p>
          )}
        </div>
      )}
    </div>
  );
}
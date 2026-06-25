import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** The EM monogram — silver E + gold M, inspired by the brand mark. */
export function Monogram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-10 w-10", className)}
      role="img"
      aria-label="Elite Market"
    >
      <defs>
        <linearGradient id="em-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6e7a8" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#a9842b" />
        </linearGradient>
        <linearGradient id="em-silver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#c8cfd8" />
          <stop offset="100%" stopColor="#8b94a3" />
        </linearGradient>
      </defs>
      <rect
        x="1.2"
        y="1.2"
        width="45.6"
        height="45.6"
        rx="12"
        fill="#0b0b0f"
        stroke="url(#em-gold)"
        strokeWidth="1.3"
      />
      <text
        x="24"
        y="33"
        textAnchor="middle"
        fontFamily="var(--font-inter), system-ui, sans-serif"
        fontSize="23"
        fontWeight="800"
        letterSpacing="-1"
      >
        <tspan fill="url(#em-silver)">E</tspan>
        <tspan fill="url(#em-gold)">M</tspan>
      </text>
    </svg>
  );
}

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Elite Market — home"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <Monogram className="h-10 w-10 transition-transform duration-500 ease-luxe group-hover:scale-105" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.05rem] font-semibold tracking-[0.18em]">
            <span className="text-chrome-gradient">ELITE</span>{" "}
            <span className="text-gold-gradient">MARKET</span>
          </span>
          <span className="mt-1.5 text-[0.5rem] font-medium uppercase tracking-[0.34em] text-ash">
            Discover · Shop Smarter
          </span>
        </span>
      )}
    </Link>
  );
}

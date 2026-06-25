import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
}) {
  return (
    <Reveal
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl font-semibold text-chrome sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 leading-relaxed text-ash">{subtitle}</p>
      )}
      <div
        className={cn(
          "gold-rule mt-7 h-px w-24",
          align === "center" && "mx-auto",
        )}
      />
    </Reveal>
  );
}

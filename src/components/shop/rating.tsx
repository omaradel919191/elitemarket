import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  className,
  showValue = true,
}: {
  value: number;
  className?: string;
  showValue?: boolean;
}) {
  const rounded = Math.round(value);
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < rounded ? "fill-gold text-gold" : "text-line",
            )}
            strokeWidth={1.5}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-medium text-ash">{value.toFixed(1)}</span>
      )}
    </div>
  );
}

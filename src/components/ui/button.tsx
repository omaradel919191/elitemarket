import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "gold" | "outline" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 ease-luxe focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";

const variants: Record<Variant, string> = {
  gold: "bg-gradient-to-b from-gold-soft to-gold-deep text-ink hover:from-gold hover:to-gold-deep shadow-[0_12px_34px_-12px_rgba(212,175,55,0.65)] hover:shadow-[0_16px_44px_-12px_rgba(212,175,55,0.85)] hover:-translate-y-0.5",
  outline:
    "border border-gold/35 text-chrome hover:border-gold hover:bg-gold/[0.06] hover:-translate-y-0.5",
  ghost: "text-ash hover:text-chrome",
  dark: "bg-surface text-chrome border border-line hover:border-gold/40 hover:-translate-y-0.5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8rem]",
  md: "h-11 px-6 text-sm",
  lg: "h-[3.25rem] px-8 text-[0.95rem]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type AsLink = CommonProps & {
  href: string;
  external?: boolean;
};

type AsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export function Button(props: AsLink | AsButton) {
  const { variant = "gold", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={classes}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as AsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

import type { ReactNode } from "react";
import { Container } from "./container";
import { Reveal } from "./reveal";

/**
 * Top section for inner pages. Includes top padding to clear the fixed site
 * header and a soft gold spotlight, matching the homepage section language.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden pt-32 pb-10 sm:pt-40 sm:pb-14">
      <div className="spotlight pointer-events-none absolute inset-0" />
      <Container className="relative">
        <Reveal className="max-w-3xl">
          {eyebrow && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl font-semibold text-chrome sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ash">
              {subtitle}
            </p>
          )}
          {children}
        </Reveal>
      </Container>
    </header>
  );
}

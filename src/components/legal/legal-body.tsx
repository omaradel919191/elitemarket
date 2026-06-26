import { Container } from "@/components/ui/container";

/** Shared intro + sections renderer for legal pages (privacy, terms). */
export function LegalBody({
  updated,
  intro,
  sections,
}: {
  updated: string;
  intro: string;
  sections: { h: string; b: string }[];
}) {
  return (
    <section className="pb-28">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-ash-dim">
            {updated}
          </p>
          <p className="mt-6 text-base leading-relaxed text-ash">{intro}</p>
          <div className="mt-10 space-y-9">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="font-display text-xl font-semibold text-chrome">
                  {s.h}
                </h2>
                <p className="mt-2.5 text-base leading-relaxed text-ash">
                  {s.b}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

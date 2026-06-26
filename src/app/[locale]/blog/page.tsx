import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { getPublishedPosts, localizedPost } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const posts = getPublishedPosts();

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <section className="pb-28">
        <Container>
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-line/70 bg-surface/30 px-6 py-20 text-center">
              <p className="text-ash">{t("empty")}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => {
                const l = localizedPost(p, locale);
                return (
                  <Reveal key={p.slug} delay={(i % 3) * 0.05}>
                    <Link
                      href={`/blog/${p.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/70 bg-surface/40 transition-all duration-500 ease-luxe hover:-translate-y-1 hover:border-gold/30"
                    >
                      {p.cover && (
                        <div className="relative aspect-[16/10] overflow-hidden bg-black">
                          <Image
                            src={p.cover}
                            alt={l.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 33vw"
                            className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-6">
                        <h2 className="font-display text-xl font-semibold text-chrome transition-colors group-hover:text-gold">
                          {l.title}
                        </h2>
                        <p className="mt-2 line-clamp-3 text-sm text-ash">{l.excerpt}</p>
                        <span className="mt-auto pt-4 text-xs text-ash-dim">
                          {p.createdAt.slice(0, 10)}
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

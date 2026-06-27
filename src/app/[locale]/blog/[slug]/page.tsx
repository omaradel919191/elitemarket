import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PostBody } from "@/components/blog/post-body";
import { ShareButtons } from "@/components/shop/share-buttons";
import { JsonLd } from "@/components/seo/json-ld";
import { getPost, localizedPost } from "@/lib/blog";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post || !post.published) return {};
  const l = localizedPost(post, locale);
  return {
    title: l.title,
    description: l.excerpt,
    openGraph: {
      type: "article",
      title: l.title,
      description: l.excerpt,
      images: post.cover ? [post.cover] : undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post || !post.published) notFound();
  setRequestLocale(locale);

  const tn = await getTranslations("nav");
  const l = localizedPost(post, locale);
  const dir = locale === "ar" ? "rtl" : "ltr";

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: l.title,
    description: l.excerpt,
    datePublished: post.createdAt,
    ...(post.cover && { image: `${SITE.url}${post.cover.startsWith("/") ? post.cover : ""}` }),
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
  };

  return (
    <article className="pt-28 pb-28 sm:pt-32">
      <JsonLd data={articleLd} />
      <Container className="max-w-3xl">
        <nav className="flex items-center gap-1.5 text-xs text-ash-dim">
          <Link href="/blog" className="transition-colors hover:text-gold">
            {tn("blog")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
          <span className="text-ash">{l.title}</span>
        </nav>

        <h1 className="mt-6 font-display text-3xl font-semibold text-chrome sm:text-4xl">
          {l.title}
        </h1>
        <p className="mt-3 text-xs text-ash-dim">{post.createdAt.slice(0, 10)}</p>

        {post.cover && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-line/70 bg-black">
            <Image
              src={post.cover}
              alt={l.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-8">
          <PostBody body={l.body} dir={dir} />
        </div>

        <div className="mt-12 border-t border-line/60 pt-6">
          <ShareButtons
            url={`${SITE.url}/${locale}/blog/${post.slug}`}
            title={l.title}
            label={tn("share")}
          />
        </div>
      </Container>
    </article>
  );
}

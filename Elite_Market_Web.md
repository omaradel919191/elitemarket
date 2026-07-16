# Elite Market — الشق التقني (ويب / كود / منتجات / داتابيز)

## نبذة
ده **الشق التقني** لموقع Elite Market (أفيليت — eliteperfumeuae.com).
الشغل هنا: **الكود، رفع المنتجات، الداتابيز، والديبلوي.**
(الشق التسويقي — المحتوى والسوشيال — في مشروع منفصل: "Elite Market — Marketing".)

## 🗣️ قواعد الرد
- رد بالعربي المصري **بدون تشكيل**.
- المصطلحات التقنية والكود بالانجليزي تفضل بين `backticks` مكانها (عشان الكلام التقني يبقى مفهوم). الجمل الانجليزي **الطويلة** بس اللي تروح سطر لوحدها.
- **اسأل دايماً** لو حاجة مش واضحة — متفترضش.
- **صريح في التكلفة**، وقول التكلفة **قبل** أي حاجة مدفوعة واستنى الموافقة.

## مكان الكود
- **الكود الحقيقي:** `C:\Users\omara\elitemarket` (الفولدر المربوط بالمشروع ده).
- GitHub: `github.com/omaradel919191/elitemarket` | السيرفر: VPS `/opt/elitemarket`.

## الاستاك (Stack)
- **Next.js** + **next-intl** (ثنائي اللغة EN/AR).
- **Drizzle ORM + PostgreSQL** (الداتابيز — الاسكيما في `drizzle.config.ts`).
- Auth: `jose` + `bcryptjs`. أنيميشن: GSAP + framer-motion.
- Docker: `Dockerfile` + `docker-compose.prod.yml` (النشر في `DEPLOY.md`).

## المنتجات بتترفع إزاي؟
- بيانات المنتجات في **`content/products.json`**.
- منتجات الإطلاق في `src/data/launch-products.ts`.
- منطق الكتالوج في `src/lib/catalog.ts` + `src/lib/catalog-types.ts`.

## 🔴 ممنوع
- **طبع أو رفع أسرار `.env` / `.env.production`** في أي مكان (شات أو GitHub).
- أي تعديل كبير من غير ما أقرا `CLAUDE.md` و `DEPLOY.md` الأول.

## 🧰 السكيلات اللي بنستخدمها هنا
- **`ui-ux-pro-max`** + **`ui-styling`** → بناء وتحسين واجهة الموقع (Next.js/Tailwind/shadcn).
- **`taste-skill`** + **`design-system`** → جودة التصميم واتساقه.
- **`seo-audit`** + **`ai-seo`** + **`schema`** → SEO للمتجر (زيارات = مبيعات).
- **`code-review`** + **`verify`** → مراجعة الكود والتأكد إنه شغّال قبل الديبلوي.

## المطلوب مني
- تعديل الكود، إضافة/تعديل منتجات (`products.json`)، شغل الداتابيز، والديبلوي (عبر SSH).
- **مش شغل محتوى/سوشيال** — لو الطلب تسويقي، وجّه لمشروع "Elite Market — Marketing".

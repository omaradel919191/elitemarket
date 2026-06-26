import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  uuid,
  index,
} from "drizzle-orm/pg-core";

/**
 * Database schema for Elite Market (affiliate storefront — NO orders/payments).
 * Mirrors src/lib/catalog.ts so the runtime accessors can switch from the seed
 * to real DB rows with no shape change. Migrations are generated with
 * drizzle-kit once DATABASE_URL is provisioned (see drizzle.config.ts).
 */

export const categories = pgTable("categories", {
  slug: text("slug").primaryKey(),
  accent: text("accent").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    category: text("category")
      .notNull()
      .references(() => categories.slug),
    brand: text("brand").notNull(),
    name: text("name").notNull(),
    nameAr: text("name_ar").notNull(),
    blurb: text("blurb").notNull(),
    blurbAr: text("blurb_ar").notNull(),
    image: text("image").notNull(),
    rating: real("rating"),
    priceAed: integer("price_aed"),
    deal: boolean("deal").notNull().default(false),
    wasAed: integer("was_aed"),
    bestFor: text("best_for"),
    bestForAr: text("best_for_ar"),
    pros: jsonb("pros").$type<string[]>(),
    prosAr: jsonb("pros_ar").$type<string[]>(),
    cons: jsonb("cons").$type<string[]>(),
    consAr: jsonb("cons_ar").$type<string[]>(),
    features: jsonb("features").$type<string[]>(),
    featuresAr: jsonb("features_ar").$type<string[]>(),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("products_category_idx").on(t.category),
    index("products_deal_idx").on(t.deal),
  ],
);

export const productLinks = pgTable(
  "product_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    retailer: text("retailer").notNull(), // 'amazon' | 'noon'
    url: text("url").notNull(),
    priceAed: integer("price_aed"),
  },
  (t) => [index("product_links_product_idx").on(t.productId)],
);

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  excerpt: text("excerpt"),
  excerptAr: text("excerpt_ar"),
  body: text("body"),
  bodyAr: text("body_ar"),
  cover: text("cover"),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  locale: text("locale").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRow = typeof products.$inferSelect;
export type ProductLinkRow = typeof productLinks.$inferSelect;
export type PostRow = typeof posts.$inferSelect;

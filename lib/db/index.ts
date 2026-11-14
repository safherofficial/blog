import { neon } from '@neondatabase/serverless'

type NeonQueryResult<Row> = {
  rows: Row[]
  rowCount: number | null
  command: string
  fields: unknown[]
  rowAsArray: boolean
}

type SqlTag = <Row = Record<string, any>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<NeonQueryResult<Row>>

let neonClient: ReturnType<typeof neon> | null = null
let activeConnectionString: string | null = null

/**
 * Prefer the connection string already used by existing Vercel deployments.
 * DATABASE_URL is the fallback used by newer Neon Marketplace integrations.
 *
 * The client is initialized lazily so builds can run without database secrets.
 * fullResults preserves the { rows, rowCount, ... } contract used throughout
 * the application with @vercel/postgres.
 */
function getNeonClient(): ReturnType<typeof neon> {
  const connectionString =
    process.env.POSTGRES_URL?.trim() ||
    process.env.DATABASE_URL?.trim()

  if (!connectionString) {
    throw new Error('Database non configurato: imposta POSTGRES_URL o DATABASE_URL.')
  }

  if (!neonClient || activeConnectionString !== connectionString) {
    neonClient = neon(connectionString, { fullResults: true })
    activeConnectionString = connectionString
  }

  return neonClient
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL?.trim() || process.env.DATABASE_URL?.trim())
}

/** Tagged SQL wrapper: keeps the existing call sites and result shape unchanged. */
export const sql: SqlTag = <Row = Record<string, any>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => getNeonClient()(strings, ...values) as unknown as Promise<NeonQueryResult<Row>>

export type CoverImage = {
  url: string
  alt?: string | null
}

export type PortableTextBlock = {
  _key: string
  _type: 'block' | 'image'
  style?: 'normal' | 'h2' | 'blockquote'
  children?: Array<{ _key: string; _type: 'span'; text: string; marks?: string[] }>
  markDefs?: unknown[]
  url?: string
  alt?: string | null
}

export type PostSummary = {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage: CoverImage | null
  publishedAt: string
  updatedAt?: string
  category: { title: string; slug: string } | null
}

export type PostFull = PostSummary & {
  body: PortableTextBlock[]
  seoTitle?: string | null
  seoDescription?: string | null
}

export type SiteSettings = {
  siteTitle: string
  tagline?: string | null
  authorName?: string | null
  authorBio?: PortableTextBlock[] | null
  authorPhoto?: CoverImage | null
  instagramUrl?: string | null
  signatureQuote?: string | null
}

export type CategoryInfo = {
  _id: string
  title: string
  slug: string
}

export async function getAllPosts(): Promise<PostSummary[]> {
  const { rows } = await sql<PostSummary>`
    SELECT p.id AS "_id", p.title, p.slug, p.excerpt,
           CASE WHEN p.cover_image_url IS NULL THEN NULL
                ELSE json_build_object('url', p.cover_image_url, 'alt', p.cover_image_alt) END AS "coverImage",
           p.published_at AS "publishedAt", p.updated_at AS "updatedAt",
           CASE WHEN c.id IS NULL THEN NULL
                ELSE json_build_object('title', c.title, 'slug', c.slug) END AS category
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.slug IS NOT NULL AND p.published = TRUE AND p.published_at <= NOW()
    ORDER BY p.published_at DESC
  `
  return rows
}

export async function getLatestPosts(limit = 3): Promise<PostSummary[]> {
  const { rows } = await sql<PostSummary>`
    SELECT p.id AS "_id", p.title, p.slug, p.excerpt,
           CASE WHEN p.cover_image_url IS NULL THEN NULL
                ELSE json_build_object('url', p.cover_image_url, 'alt', p.cover_image_alt) END AS "coverImage",
           p.published_at AS "publishedAt", p.updated_at AS "updatedAt",
           CASE WHEN c.id IS NULL THEN NULL
                ELSE json_build_object('title', c.title, 'slug', c.slug) END AS category
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.slug IS NOT NULL AND p.published = TRUE AND p.published_at <= NOW()
    ORDER BY p.published_at DESC
    LIMIT ${Math.max(1, Math.min(limit, 50))}
  `
  return rows
}

export async function getPostBySlug(slug: string): Promise<PostFull | null> {
  const { rows } = await sql<PostFull>`
    SELECT p.id AS "_id", p.title, p.slug, p.excerpt,
           CASE WHEN p.cover_image_url IS NULL THEN NULL
                ELSE json_build_object('url', p.cover_image_url, 'alt', p.cover_image_alt) END AS "coverImage",
           p.published_at AS "publishedAt", p.updated_at AS "updatedAt",
           CASE WHEN c.id IS NULL THEN NULL
                ELSE json_build_object('title', c.title, 'slug', c.slug) END AS category,
           p.body, p.seo_title AS "seoTitle", p.seo_description AS "seoDescription"
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ${slug} AND p.published = TRUE AND p.published_at <= NOW()
    LIMIT 1
  `
  return rows[0] || null
}

export async function getAllPostSlugs(): Promise<string[]> {
  const { rows } = await sql<{ slug: string }>`
    SELECT slug FROM posts
    WHERE slug IS NOT NULL AND published = TRUE AND published_at <= NOW()
    ORDER BY published_at DESC
  `
  return rows.map((row) => row.slug)
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { rows } = await sql<SiteSettings>`
    SELECT site_title AS "siteTitle", tagline, author_name AS "authorName",
           author_bio AS "authorBio",
           CASE WHEN author_photo_url IS NULL THEN NULL
                ELSE json_build_object('url', author_photo_url, 'alt', author_photo_alt) END AS "authorPhoto",
           instagram_url AS "instagramUrl", signature_quote AS "signatureQuote"
    FROM site_settings WHERE id = 1 LIMIT 1
  `
  return rows[0] || null
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const { rows } = await sql<{ slug: string }>`SELECT slug FROM categories ORDER BY title`
  return rows.map((row) => row.slug)
}

export async function getCategoryBySlug(slug: string): Promise<CategoryInfo | null> {
  const { rows } = await sql<CategoryInfo>`
    SELECT id AS "_id", title, slug FROM categories WHERE slug = ${slug} LIMIT 1
  `
  return rows[0] || null
}

export async function getPostsByCategory(slug: string): Promise<PostSummary[]> {
  const { rows } = await sql<PostSummary>`
    SELECT p.id AS "_id", p.title, p.slug, p.excerpt,
           CASE WHEN p.cover_image_url IS NULL THEN NULL
                ELSE json_build_object('url', p.cover_image_url, 'alt', p.cover_image_alt) END AS "coverImage",
           p.published_at AS "publishedAt", p.updated_at AS "updatedAt",
           json_build_object('title', c.title, 'slug', c.slug) AS category
    FROM posts p
    INNER JOIN categories c ON c.id = p.category_id
    WHERE c.slug = ${slug} AND p.published = TRUE AND p.published_at <= NOW()
    ORDER BY p.published_at DESC
  `
  return rows
}

export async function getRelatedPosts(currentId: string, categorySlug?: string | null, limit = 3): Promise<PostSummary[]> {
  const safeLimit = Math.max(1, Math.min(limit, 20))
  if (categorySlug) {
    const { rows: sameCategory } = await sql<PostSummary>`
      SELECT p.id AS "_id", p.title, p.slug, p.excerpt,
             CASE WHEN p.cover_image_url IS NULL THEN NULL
                  ELSE json_build_object('url', p.cover_image_url, 'alt', p.cover_image_alt) END AS "coverImage",
             p.published_at AS "publishedAt", p.updated_at AS "updatedAt",
             json_build_object('title', c.title, 'slug', c.slug) AS category
      FROM posts p
      INNER JOIN categories c ON c.id = p.category_id
      WHERE p.id <> ${currentId} AND p.published = TRUE AND p.published_at <= NOW() AND c.slug = ${categorySlug}
      ORDER BY p.published_at DESC LIMIT ${safeLimit}
    `
    if (sameCategory.length >= safeLimit) return sameCategory

    const excludeIds = [currentId, ...sameCategory.map((p) => p._id)]
    const excludeIdsLiteral = `{${excludeIds.join(',')}}`
    const { rows: fillers } = await sql<PostSummary>`
      SELECT p.id AS "_id", p.title, p.slug, p.excerpt,
             CASE WHEN p.cover_image_url IS NULL THEN NULL
                  ELSE json_build_object('url', p.cover_image_url, 'alt', p.cover_image_alt) END AS "coverImage",
             p.published_at AS "publishedAt", p.updated_at AS "updatedAt",
             CASE WHEN c.id IS NULL THEN NULL
                  ELSE json_build_object('title', c.title, 'slug', c.slug) END AS category
      FROM posts p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.published = TRUE AND p.published_at <= NOW() AND NOT (p.id = ANY(${excludeIdsLiteral}::uuid[]))
      ORDER BY p.published_at DESC LIMIT ${safeLimit - sameCategory.length}
    `
    return [...sameCategory, ...fillers]
  }

  const { rows } = await sql<PostSummary>`
    SELECT p.id AS "_id", p.title, p.slug, p.excerpt,
           CASE WHEN p.cover_image_url IS NULL THEN NULL
                ELSE json_build_object('url', p.cover_image_url, 'alt', p.cover_image_alt) END AS "coverImage",
           p.published_at AS "publishedAt", p.updated_at AS "updatedAt",
           CASE WHEN c.id IS NULL THEN NULL
                ELSE json_build_object('title', c.title, 'slug', c.slug) END AS category
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id <> ${currentId} AND p.published = TRUE AND p.published_at <= NOW()
    ORDER BY p.published_at DESC LIMIT ${safeLimit}
  `
  return rows
}

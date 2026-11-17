import { neon } from '@neondatabase/serverless'
import { getRelatedCategorySlugs } from '@/lib/seo/categories'

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

// Schema guard for deployments whose existing site_settings table predates
// author_photo_alt. Cache it per configured database connection, not globally.
let siteSettingsSchemaConnection: string | null = null
let siteSettingsSchemaPromise: Promise<void> | null = null

export async function ensureSiteSettingsSchema(): Promise<void> {
  const connectionString = process.env.POSTGRES_URL?.trim() || process.env.DATABASE_URL?.trim()
  if (!connectionString) {
    throw new Error('Database non configurato: imposta POSTGRES_URL o DATABASE_URL.')
  }

  if (siteSettingsSchemaConnection !== connectionString) {
    siteSettingsSchemaConnection = connectionString
    siteSettingsSchemaPromise = null
  }

  if (!siteSettingsSchemaPromise) {
    siteSettingsSchemaPromise = sql`
      ALTER TABLE site_settings
      ADD COLUMN IF NOT EXISTS author_photo_alt TEXT
    `
      .then(() => undefined)
      .catch((error) => {
        siteSettingsSchemaConnection = null
        siteSettingsSchemaPromise = null
        throw error
      })
  }

  await siteSettingsSchemaPromise
}

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

export async function getPublishedCategories(): Promise<Array<{ title: string; slug: string; count: number }>> {
  const { rows } = await sql<{ title: string; slug: string; count: number }>`
    SELECT c.title, c.slug, COUNT(p.id)::int AS count
    FROM categories c
    INNER JOIN posts p ON p.category_id = c.id
    WHERE p.slug IS NOT NULL AND p.published = TRUE AND p.published_at <= NOW()
    GROUP BY c.id, c.title, c.slug
    ORDER BY c.title ASC
  `
  return rows
}

export type CategoryReadingPath = {
  title: string
  slug: string
  count: number
  archivePost: PostSummary
}

/**
 * Returns one real, published entry point for every category.
 * The archive article is the oldest published post in that category, so
 * older work remains discoverable without editorially ranking its quality.
 */
export async function getCategoryReadingPaths(): Promise<CategoryReadingPath[]> {
  const { rows } = await sql<CategoryReadingPath>`
    SELECT
      c.title,
      c.slug,
      (
        SELECT COUNT(*)::int
        FROM posts p
        WHERE p.category_id = c.id
          AND p.slug IS NOT NULL
          AND p.published = TRUE
          AND p.published_at <= NOW()
      ) AS count,
      archive.post AS "archivePost"
    FROM categories c
    INNER JOIN LATERAL (
      SELECT json_build_object(
        '_id', item.id::text,
        'title', item.title,
        'slug', item.slug,
        'excerpt', item.excerpt,
        'coverImage', CASE
          WHEN item.cover_image_url IS NULL THEN NULL
          ELSE json_build_object('url', item.cover_image_url, 'alt', item.cover_image_alt)
        END,
        'publishedAt', item.published_at,
        'updatedAt', item.updated_at,
        'category', json_build_object('title', c.title, 'slug', c.slug)
      ) AS post
      FROM posts item
      WHERE item.category_id = c.id
        AND item.slug IS NOT NULL
        AND item.published = TRUE
        AND item.published_at <= NOW()
      ORDER BY item.published_at ASC, item.id ASC
      LIMIT 1
    ) archive ON TRUE
    ORDER BY c.title ASC
  `
  return rows
}

export type ArchiveSort = 'newest' | 'oldest'

export type ArchivePostsResult = {
  posts: PostSummary[]
  total: number
}

export async function getArchivePosts(input: {
  query?: string
  categorySlug?: string | null
  sort?: ArchiveSort
  page?: number
  pageSize?: number
}): Promise<ArchivePostsResult> {
  const query = input.query?.trim().slice(0, 100) || ''
  const searchPattern = query ? `%${query}%` : null
  const categorySlug = input.categorySlug?.trim().slice(0, 120) || null
  const sort: ArchiveSort = input.sort === 'oldest' ? 'oldest' : 'newest'
  const pageSize = Math.max(1, Math.min(Math.trunc(input.pageSize || 12), 36))
  const page = Math.max(1, Math.min(Math.trunc(input.page || 1), 1000))
  const offset = (page - 1) * pageSize

  const [postsResult, countResult] = await Promise.all([
    sql<PostSummary>`
      SELECT p.id AS "_id", p.title, p.slug, p.excerpt,
             CASE WHEN p.cover_image_url IS NULL THEN NULL
                  ELSE json_build_object('url', p.cover_image_url, 'alt', p.cover_image_alt) END AS "coverImage",
             p.published_at AS "publishedAt", p.updated_at AS "updatedAt",
             CASE WHEN c.id IS NULL THEN NULL
                  ELSE json_build_object('title', c.title, 'slug', c.slug) END AS category
      FROM posts p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.slug IS NOT NULL AND p.published = TRUE AND p.published_at <= NOW()
        AND (${searchPattern}::text IS NULL
          OR p.title ILIKE ${searchPattern}
          OR p.excerpt ILIKE ${searchPattern}
          OR p.body::text ILIKE ${searchPattern})
        AND (${categorySlug}::text IS NULL OR c.slug = ${categorySlug})
      ORDER BY
        CASE WHEN ${sort} = 'oldest' THEN p.published_at END ASC,
        CASE WHEN ${sort} = 'newest' THEN p.published_at END DESC,
        p.id ASC
      LIMIT ${pageSize} OFFSET ${offset}
    `,
    sql<{ total: number }>`
      SELECT COUNT(*)::int AS total
      FROM posts p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.slug IS NOT NULL AND p.published = TRUE AND p.published_at <= NOW()
        AND (${searchPattern}::text IS NULL
          OR p.title ILIKE ${searchPattern}
          OR p.excerpt ILIKE ${searchPattern}
          OR p.body::text ILIKE ${searchPattern})
        AND (${categorySlug}::text IS NULL OR c.slug = ${categorySlug})
    `,
  ])

  return {
    posts: postsResult.rows,
    total: countResult.rows[0]?.total || 0,
  }
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
  await ensureSiteSettingsSchema()
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
  const relatedSlugs = categorySlug ? getRelatedCategorySlugs(categorySlug) : []
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
    ORDER BY
      CASE
        WHEN c.slug = ${categorySlug} THEN 0
        WHEN c.slug = ${relatedSlugs[0] || null}
          OR c.slug = ${relatedSlugs[1] || null}
          OR c.slug = ${relatedSlugs[2] || null} THEN 1
        ELSE 2
      END ASC,
      p.published_at DESC,
      p.id ASC
    LIMIT ${safeLimit}
  `
  return rows
}

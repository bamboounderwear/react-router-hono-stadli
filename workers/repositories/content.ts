import type { StadliDb } from "../db/client";

export type NewsEntry = {
        id: number;
        slug: string;
        title: string;
        excerpt: string | null;
        content: string | null;
        publishedAt: number | null;
        createdAt: number;
        updatedAt: number;
};

export type EditorialEntry = {
        id: string;
        title: string;
        summary: string;
        status: "Draft" | "Scheduled" | "Published";
        owner: string;
        updatedAt: string;
        audience: string;
};

export type PublicNewsArticle = {
        id: number;
        slug: string;
        title: string;
        summary: string;
        content: string;
        category: string;
        publishedAt: number;
        imageUrl: string;
        author: string;
};

const NEWS_IMAGES = [
        "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1530543787849-128d94430c6b?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&w=1400&q=80",
];

const NEWS_CATEGORIES = ["Matchday", "Club", "Community", "Academy", "Analysis"];
const NEWS_AUTHORS = ["Stadli Communications", "Lina Schneider", "Ava Hart", "Suri Das", "Jules Meyer"];

function mapToPublicArticle(entry: NewsEntry): PublicNewsArticle {
        const index = Math.abs(entry.id) % NEWS_IMAGES.length;
        const category = NEWS_CATEGORIES[Math.abs(entry.id) % NEWS_CATEGORIES.length];
        const author = NEWS_AUTHORS[Math.abs(entry.id) % NEWS_AUTHORS.length];
        const publishedAt = entry.publishedAt ?? entry.updatedAt ?? entry.createdAt;
        const summary = entry.excerpt?.trim() ?? "Club insiders provide fresh perspective ahead of kickoff.";
        const content = entry.content?.trim() ?? `${summary}\n\nThe Stadli Storm continue to push the tempo across the club. Expect further updates as the week progresses.`;

        return {
                id: entry.id,
                slug: entry.slug,
                title: entry.title,
                summary,
                content,
                category,
                publishedAt,
                imageUrl: NEWS_IMAGES[index],
                author,
        };
}

const OWNER_ROTATION = ["Lina Schneider", "Ava Hart", "Zuri Adebayo", "Ivy Watts"];
const AUDIENCE_ROTATION = ["Global", "Ticket holders", "Media list", "Subscribers"];

function inferStatus(entry: NewsEntry): EditorialEntry["status"] {
        if (!entry.publishedAt) {
                return "Draft";
        }
        if (entry.publishedAt > Date.now()) {
                return "Scheduled";
        }
        return "Published";
}

function mapToEditorial(entry: NewsEntry): EditorialEntry {
        const owner = OWNER_ROTATION[entry.id % OWNER_ROTATION.length];
        const audience = AUDIENCE_ROTATION[entry.id % AUDIENCE_ROTATION.length];

        return {
                id: entry.slug,
                title: entry.title,
                summary: entry.excerpt ?? "",
                status: inferStatus(entry),
                owner,
                updatedAt: new Date(entry.updatedAt).toISOString(),
                audience,
        };
}

export async function listNewsEntries(db: StadliDb) {
        const rows = await db.all<NewsEntry>(
                "SELECT id, slug, title, excerpt, content, published_at as publishedAt, created_at as createdAt, updated_at as updatedAt FROM news_posts ORDER BY updated_at DESC",
        );

        return rows.map((row) => mapToEditorial(row));
}

export async function getNewsEntryBySlug(db: StadliDb, slug: string) {
        const row = await db.get<NewsEntry>(
                "SELECT id, slug, title, excerpt, content, published_at as publishedAt, created_at as createdAt, updated_at as updatedAt FROM news_posts WHERE slug = ?",
                [slug],
        );

        if (!row) {
                return null;
        }

        return mapToEditorial(row);
}

export async function listPublicNewsArticles(db: StadliDb) {
        const rows = await db.all<NewsEntry>(
                "SELECT id, slug, title, excerpt, content, published_at as publishedAt, created_at as createdAt, updated_at as updatedAt FROM news_posts ORDER BY COALESCE(published_at, updated_at) DESC",
        );

        return rows.map((row) => mapToPublicArticle(row));
}

export async function updateNewsEntry(db: StadliDb, slug: string, updates: Partial<{ title: string; summary: string; status: EditorialEntry["status"] }>) {
        const existing = await db.get<NewsEntry>(
                "SELECT id, slug, title, excerpt, content, published_at as publishedAt, created_at as createdAt, updated_at as updatedAt FROM news_posts WHERE slug = ?",
                [slug],
        );

        if (!existing) {
                return null;
        }

        let nextTitle = existing.title;
        let nextExcerpt = existing.excerpt;
        let nextPublishedAt = existing.publishedAt;

        if (typeof updates.title === "string" && updates.title.length > 0) {
                nextTitle = updates.title;
        }

        if (typeof updates.summary === "string") {
                nextExcerpt = updates.summary;
        }

        if (updates.status) {
                if (updates.status === "Draft") {
                        nextPublishedAt = null;
                } else if (updates.status === "Published") {
                        nextPublishedAt = nextPublishedAt && nextPublishedAt <= Date.now() ? nextPublishedAt : Date.now();
                } else if (updates.status === "Scheduled") {
                        const existingFuture = nextPublishedAt && nextPublishedAt > Date.now() ? nextPublishedAt : null;
                        nextPublishedAt = existingFuture ?? Date.now() + 1000 * 60 * 60 * 6;
                }
        }

        await db.run(
                "UPDATE news_posts SET title = ?, excerpt = ?, published_at = ?, updated_at = ? WHERE slug = ?",
                [nextTitle, nextExcerpt, nextPublishedAt, Date.now(), slug],
        );

        return getNewsEntryBySlug(db, slug);
}

export async function getPublicNewsArticle(db: StadliDb, slug: string) {
        const row = await db.get<NewsEntry>(
                "SELECT id, slug, title, excerpt, content, published_at as publishedAt, created_at as createdAt, updated_at as updatedAt FROM news_posts WHERE slug = ?",
                [slug],
        );

        if (!row) {
                return null;
        }

        return mapToPublicArticle(row);
}

export async function createNewsEntry(db: StadliDb, entry: { title: string; slug: string; summary?: string | null; content?: string | null; publishedAt?: number | null }) {
        await db.run(
                "INSERT INTO news_posts (title, slug, excerpt, content, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                        entry.title,
                        entry.slug,
                        entry.summary ?? null,
                        entry.content ?? null,
                        entry.publishedAt ?? null,
                        Date.now(),
                        Date.now(),
                ],
        );

        return getNewsEntryBySlug(db, entry.slug);
}

export async function deleteNewsEntry(db: StadliDb, slug: string) {
        await db.run("DELETE FROM news_posts WHERE slug = ?", [slug]);
}

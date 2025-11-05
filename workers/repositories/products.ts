import type { StadliDb } from "../db/client";

export type Product = {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        priceCents: number;
        inventoryCount: number;
        imageUrl: string | null;
        createdAt: number;
        updatedAt: number;
};

function mapProduct(row: Product) {
        return {
                id: row.id,
                name: row.name,
                slug: row.slug,
                description: row.description,
                priceCents: row.priceCents,
                inventoryCount: row.inventoryCount,
                imageUrl: row.imageUrl,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
        };
}

export async function listProducts(db: StadliDb) {
        const rows = await db.all<Product>(
                "SELECT id, name, slug, description, price_cents as priceCents, inventory_count as inventoryCount, image_url as imageUrl, created_at as createdAt, updated_at as updatedAt FROM products ORDER BY updated_at DESC",
        );

        return rows.map((row) => mapProduct(row));
}

export async function getProductBySlug(db: StadliDb, slug: string) {
        const row = await db.get<Product>(
                "SELECT id, name, slug, description, price_cents as priceCents, inventory_count as inventoryCount, image_url as imageUrl, created_at as createdAt, updated_at as updatedAt FROM products WHERE slug = ?",
                [slug],
        );

        return row ? mapProduct(row) : null;
}

export async function createProduct(db: StadliDb, payload: { name: string; slug: string; description?: string | null; priceCents: number; inventoryCount?: number; imageUrl?: string | null }) {
        await db.run(
                "INSERT INTO products (name, slug, description, price_cents, inventory_count, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [
                        payload.name,
                        payload.slug,
                        payload.description ?? null,
                        payload.priceCents,
                        payload.inventoryCount ?? 0,
                        payload.imageUrl ?? null,
                        Date.now(),
                        Date.now(),
                ],
        );

        return getProductBySlug(db, payload.slug);
}

export async function updateProduct(db: StadliDb, slug: string, updates: Partial<{ name: string; description: string | null; priceCents: number; inventoryCount: number; imageUrl: string | null }>) {
        const existing = await getProductBySlug(db, slug);

        if (!existing) {
                return null;
        }

        const next = {
                name: updates.name ?? existing.name,
                description: updates.description ?? existing.description,
                priceCents: updates.priceCents ?? existing.priceCents,
                inventoryCount: updates.inventoryCount ?? existing.inventoryCount,
                imageUrl: updates.imageUrl ?? existing.imageUrl,
        };

        await db.run(
                "UPDATE products SET name = ?, description = ?, price_cents = ?, inventory_count = ?, image_url = ?, updated_at = ? WHERE slug = ?",
                [next.name, next.description, next.priceCents, next.inventoryCount, next.imageUrl, Date.now(), slug],
        );

        return getProductBySlug(db, slug);
}

export async function deleteProduct(db: StadliDb, slug: string) {
        await db.run("DELETE FROM products WHERE slug = ?", [slug]);
}

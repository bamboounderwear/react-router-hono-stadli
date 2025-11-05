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

export type PublicProduct = {
        id: string;
        slug: string;
        name: string;
        description: string;
        priceCents: number;
        inventoryCount: number;
        imageUrl: string;
        colors: string[];
        sizes: string[];
        details: string[];
        badge?: string;
};

const PRODUCT_COLOR_PRESETS = [
        ["Storm Navy", "Glacier White"],
        ["Aurora Teal", "Night Sky"],
        ["Summit Silver", "Tempest Black"],
        ["Lightning Yellow", "Midnight Blue"],
];

const PRODUCT_SIZE_PRESETS = [
        ["XS", "S", "M", "L", "XL"],
        ["S", "M", "L", "XL"],
        ["One Size"],
];

const PRODUCT_DETAIL_PRESETS = [
        [
                "Engineered for alpine matchdays with moisture-wicking microfibre.",
                "Laser-cut ventilation panels mapped to heat zones.",
                "Stadli crest finished with iridescent frost-foil treatment.",
        ],
        [
                "Weather-guard shell rated for snow and sleet.",
                "Interior media pocket with storm-sealed zipper.",
                "Elasticated cuffs retain warmth without bulk.",
        ],
        [
                "Premium knit constructed from recycled glacier plastics.",
                "Double-layer brim maintains structure in high winds.",
                "Woven Tempest mantra on interior seam.",
        ],
        [
                "Supporter edition with tonal badge embroidery.",
                "Anti-pill finish keeps the look sharp all season.",
                "Packable into travel pouch for away days.",
        ],
];

const PRODUCT_IMAGE_FALLBACKS = [
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80",
];

function mapToPublicProduct(row: Product): PublicProduct {
        const index = Math.abs(row.id) % PRODUCT_COLOR_PRESETS.length;
        const colorPreset = PRODUCT_COLOR_PRESETS[index];
        const sizePreset = PRODUCT_SIZE_PRESETS[Math.abs(row.id) % PRODUCT_SIZE_PRESETS.length];
        const detailPreset = PRODUCT_DETAIL_PRESETS[Math.abs(row.id) % PRODUCT_DETAIL_PRESETS.length];
        const image = row.imageUrl ?? PRODUCT_IMAGE_FALLBACKS[index % PRODUCT_IMAGE_FALLBACKS.length];
        let badge: string | undefined;

        if (row.inventoryCount <= 5) {
                badge = "Low stock";
        } else if (row.inventoryCount >= 50) {
                badge = "New arrival";
        }

        return {
                id: row.slug,
                slug: row.slug,
                name: row.name,
                description: row.description ?? "Stadli-crafted merchandise built for alpine supporters.",
                priceCents: row.priceCents,
                inventoryCount: row.inventoryCount,
                imageUrl: image,
                colors: colorPreset,
                sizes: sizePreset,
                details: detailPreset,
                badge,
        };
}

export async function listProducts(db: StadliDb) {
        const rows = await db.all<Product>(
                "SELECT id, name, slug, description, price_cents as priceCents, inventory_count as inventoryCount, image_url as imageUrl, created_at as createdAt, updated_at as updatedAt FROM products ORDER BY updated_at DESC",
        );

        return rows.map((row) => mapProduct(row));
}

export async function listPublicProducts(db: StadliDb) {
        const products = await listProducts(db);

        return products.map((product) => mapToPublicProduct(product));
}

export async function getProductBySlug(db: StadliDb, slug: string) {
        const row = await db.get<Product>(
                "SELECT id, name, slug, description, price_cents as priceCents, inventory_count as inventoryCount, image_url as imageUrl, created_at as createdAt, updated_at as updatedAt FROM products WHERE slug = ?",
                [slug],
        );

        return row ? mapProduct(row) : null;
}

export async function getPublicProductBySlug(db: StadliDb, slug: string) {
        const product = await getProductBySlug(db, slug);

        return product ? mapToPublicProduct(product) : null;
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

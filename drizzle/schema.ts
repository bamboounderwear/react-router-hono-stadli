import { relations, sql } from "drizzle-orm";
import {
        integer,
        sqliteTable,
        text,
        uniqueIndex
} from "drizzle-orm/sqlite-core";

const defaultTimestamp = (columnName: string) =>
        integer(columnName, { mode: "timestamp_ms" })
                .notNull()
                .default(sql`(strftime('%s','now') * 1000)`);

export const venues = sqliteTable(
        "venues",
        {
                id: integer("id").primaryKey({ autoIncrement: true }),
                name: text("name").notNull(),
                slug: text("slug").notNull(),
                location: text("location"),
                capacity: integer("capacity"),
                description: text("description"),
                createdAt: defaultTimestamp("created_at"),
                updatedAt: defaultTimestamp("updated_at")
        },
        (table) => ({
                slugUnique: uniqueIndex("venues_slug_unique").on(table.slug)
        })
);

export const seats = sqliteTable(
        "seats",
        {
                id: integer("id").primaryKey({ autoIncrement: true }),
                venueId: integer("venue_id")
                        .notNull()
                        .references(() => venues.id, { onDelete: "cascade" }),
                section: text("section"),
                row: text("row"),
                number: integer("number"),
                seatType: text("seat_type"),
                createdAt: defaultTimestamp("created_at"),
                updatedAt: defaultTimestamp("updated_at")
        },
        (table) => ({
                uniqueSeatPosition: uniqueIndex("seats_position_unique").on(
                        table.venueId,
                        table.section,
                        table.row,
                        table.number
                )
        })
);

export const games = sqliteTable(
        "games",
        {
                id: integer("id").primaryKey({ autoIncrement: true }),
                venueId: integer("venue_id")
                        .notNull()
                        .references(() => venues.id, { onDelete: "restrict" }),
                opponent: text("opponent").notNull(),
                startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
                status: text("status").notNull().default("scheduled"),
                description: text("description"),
                createdAt: defaultTimestamp("created_at"),
                updatedAt: defaultTimestamp("updated_at")
        }
);

export const customers = sqliteTable(
        "customers",
        {
                id: integer("id").primaryKey({ autoIncrement: true }),
                firstName: text("first_name"),
                lastName: text("last_name"),
                email: text("email").notNull(),
                phone: text("phone"),
                createdAt: defaultTimestamp("created_at"),
                updatedAt: defaultTimestamp("updated_at")
        },
        (table) => ({
                emailUnique: uniqueIndex("customers_email_unique").on(table.email)
        })
);

export const tickets = sqliteTable(
        "tickets",
        {
                id: integer("id").primaryKey({ autoIncrement: true }),
                gameId: integer("game_id")
                        .notNull()
                        .references(() => games.id, { onDelete: "cascade" }),
                seatId: integer("seat_id")
                        .notNull()
                        .references(() => seats.id, { onDelete: "restrict" }),
                customerId: integer("customer_id")
                        .references(() => customers.id, { onDelete: "set null" }),
                priceCents: integer("price_cents").notNull(),
                status: text("status").notNull().default("available"),
                purchasedAt: integer("purchased_at", { mode: "timestamp_ms" }),
                createdAt: defaultTimestamp("created_at"),
                updatedAt: defaultTimestamp("updated_at")
        },
        (table) => ({
                seatPerGameUnique: uniqueIndex("tickets_game_seat_unique").on(
                        table.gameId,
                        table.seatId
                )
        })
);

export const newsPosts = sqliteTable(
        "news_posts",
        {
                id: integer("id").primaryKey({ autoIncrement: true }),
                title: text("title").notNull(),
                slug: text("slug").notNull(),
                excerpt: text("excerpt"),
                content: text("content"),
                publishedAt: integer("published_at", { mode: "timestamp_ms" }),
                createdAt: defaultTimestamp("created_at"),
                updatedAt: defaultTimestamp("updated_at")
        },
        (table) => ({
                slugUnique: uniqueIndex("news_posts_slug_unique").on(table.slug)
        })
);

export const products = sqliteTable(
        "products",
        {
                id: integer("id").primaryKey({ autoIncrement: true }),
                name: text("name").notNull(),
                slug: text("slug").notNull(),
                description: text("description"),
                priceCents: integer("price_cents").notNull(),
                inventoryCount: integer("inventory_count").notNull().default(0),
                imageUrl: text("image_url"),
                createdAt: defaultTimestamp("created_at"),
                updatedAt: defaultTimestamp("updated_at")
        },
        (table) => ({
                slugUnique: uniqueIndex("products_slug_unique").on(table.slug)
        })
);

export const venuesRelations = relations(venues, ({ many }) => ({
        seats: many(seats),
        games: many(games)
}));

export const seatsRelations = relations(seats, ({ one, many }) => ({
        venue: one(venues, {
                fields: [seats.venueId],
                references: [venues.id]
        }),
        tickets: many(tickets)
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
        venue: one(venues, {
                fields: [games.venueId],
                references: [venues.id]
        }),
        tickets: many(tickets)
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
        game: one(games, {
                fields: [tickets.gameId],
                references: [games.id]
        }),
        seat: one(seats, {
                fields: [tickets.seatId],
                references: [seats.id]
        }),
        customer: one(customers, {
                fields: [tickets.customerId],
                references: [customers.id]
        })
}));

export const customersRelations = relations(customers, ({ many }) => ({
        tickets: many(tickets)
}));

export const newsPostsRelations = relations(newsPosts, () => ({}));

export const productsRelations = relations(products, () => ({}));

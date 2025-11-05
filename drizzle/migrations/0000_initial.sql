CREATE TABLE IF NOT EXISTS "venues" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" text NOT NULL,
        "slug" text NOT NULL,
        "location" text,
        "capacity" integer,
        "description" text,
        "created_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
        "updated_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "venues_slug_unique" ON "venues" ("slug");

CREATE TABLE IF NOT EXISTS "seats" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "venue_id" integer NOT NULL,
        "section" text,
        "row" text,
        "number" integer,
        "seat_type" text,
        "created_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
        "updated_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
        CONSTRAINT "seats_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "venues" ("id") ON DELETE cascade ON UPDATE no action
);
CREATE UNIQUE INDEX IF NOT EXISTS "seats_position_unique" ON "seats" ("venue_id", "section", "row", "number");

CREATE TABLE IF NOT EXISTS "games" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "venue_id" integer NOT NULL,
        "opponent" text NOT NULL,
        "starts_at" integer NOT NULL,
        "status" text DEFAULT 'scheduled' NOT NULL,
        "description" text,
        "created_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
        "updated_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
        CONSTRAINT "games_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "venues" ("id") ON DELETE restrict ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "customers" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "first_name" text,
        "last_name" text,
        "email" text NOT NULL,
        "phone" text,
        "created_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
        "updated_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "customers_email_unique" ON "customers" ("email");

CREATE TABLE IF NOT EXISTS "tickets" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "game_id" integer NOT NULL,
        "seat_id" integer NOT NULL,
        "customer_id" integer,
        "price_cents" integer NOT NULL,
        "status" text DEFAULT 'available' NOT NULL,
        "purchased_at" integer,
        "created_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
        "updated_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
        CONSTRAINT "tickets_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "games" ("id") ON DELETE cascade ON UPDATE no action,
        CONSTRAINT "tickets_seat_id_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "seats" ("id") ON DELETE restrict ON UPDATE no action,
        CONSTRAINT "tickets_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE set null ON UPDATE no action
);
CREATE UNIQUE INDEX IF NOT EXISTS "tickets_game_seat_unique" ON "tickets" ("game_id", "seat_id");

CREATE TABLE IF NOT EXISTS "news_posts" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "title" text NOT NULL,
        "slug" text NOT NULL,
        "excerpt" text,
        "content" text,
        "published_at" integer,
        "created_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
        "updated_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "news_posts_slug_unique" ON "news_posts" ("slug");

CREATE TABLE IF NOT EXISTS "products" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" text NOT NULL,
        "slug" text NOT NULL,
        "description" text,
        "price_cents" integer NOT NULL,
        "inventory_count" integer DEFAULT 0 NOT NULL,
        "image_url" text,
        "created_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
        "updated_at" integer DEFAULT (strftime('%s','now') * 1000) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_unique" ON "products" ("slug");

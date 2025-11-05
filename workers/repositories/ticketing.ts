import type { StadliDb } from "../db/client";

export type Venue = {
        id: number;
        name: string;
        slug: string;
        location: string | null;
        capacity: number | null;
        description: string | null;
        createdAt: number;
        updatedAt: number;
};

export type Seat = {
        id: number;
        venueId: number;
        section: string | null;
        row: string | null;
        number: number | null;
        seatType: string | null;
        createdAt: number;
        updatedAt: number;
};

export type Game = {
        id: number;
        venueId: number;
        opponent: string;
        startsAt: number;
        status: string;
        description: string | null;
        createdAt: number;
        updatedAt: number;
        venueName?: string;
        venueSlug?: string;
        venueLocation?: string | null;
};

export type Ticket = {
        id: number;
        gameId: number;
        seatId: number;
        customerId: number | null;
        priceCents: number;
        status: string;
        purchasedAt: number | null;
        createdAt: number;
        updatedAt: number;
        section?: string | null;
        row?: string | null;
        number?: number | null;
        seatType?: string | null;
        customerName?: string | null;
};

export type SectionAvailability = {
        section: string;
        totalSeats: number;
        availableSeats: number;
        reservedSeats: number;
        soldSeats: number;
};

export type TicketSalesOverview = {
        totalTickets: number;
        soldTickets: number;
        reservedTickets: number;
        availableTickets: number;
        revenueCents: number;
};

export type GameSeatSummary = {
        totalSeats: number;
        availableSeats: number;
        reservedSeats: number;
        soldSeats: number;
};

export type PublicGame = {
        id: number;
        opponent: string;
        venue: string;
        date: string;
        status: "upcoming" | "final";
        description: string | null;
        heroImage: string;
        highlights: string[];
        recap?: string;
        score?: string;
        isHome: boolean;
        seatSummary?: GameSeatSummary;
};

type HighlightBuilder = (game: Game) => string[];

const GAME_HERO_IMAGES = [
        "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1400&q=80",
];

const UPCOMING_HIGHLIGHTS: HighlightBuilder[] = [
        (game) => [
                `Pressing choreography sharpened to disrupt ${game.opponent}'s build-up.`,
                "Set-piece unit drilling near-post overloads with precision reps.",
                "Supporter tifo reveal finalised for opening whistle energy.",
        ],
        (game) => [
                `Tempo emphasis on quick switches to stretch ${game.opponent}'s back line.`,
                "Goalkeeping crew rehearsing distribution under pressure drills.",
                "Matchday operations expanding safe-standing capacity.\u2009",
        ],
        (game) => [
                `Midfield rotations refined to counter ${game.opponent}'s press traps.`,
                "Analytics flagged transition triggers for wingback overloads.",
                "Fan services adding alpine cocoa bars throughout concourses.",
        ],
        (game) => [
                `Academy duo elevated to senior bench against ${game.opponent}.`,
                "Wellness staff scheduling light recovery under altitude lamps.",
                "Club shop launching limited Tempest scarf on matchday.",
        ],
];

const FINAL_RECAP_TEMPLATES = [
        (game: Game) =>
                `Storm handled ${game.opponent} with composure, capitalising on the second-half press to seize control down the stretch.`,
        (game: Game) =>
                `A roaring Aurora Field witnessed the Storm outwork ${game.opponent}, with the back line absorbing late pressure to close it out.`,
        (game: Game) =>
                `Clinical finishing and relentless width saw Stadli overwhelm ${game.opponent} as the supporters carried the momentum home.`,
        (game: Game) =>
                `Storm answered every push from ${game.opponent}, leaning on squad depth to ice the result in stoppage time.`,
];

const UPCOMING_DESCRIPTION_TEMPLATES = [
        (game: Game) =>
                `Intensity ramps up for a high-tempo clash with ${game.opponent}. Expect aggressive pressing windows and bold wingback overlaps.`,
        (game: Game) =>
                `The Storm eye another statement at Aurora Field with training blocks centred on controlled build-up and rapid counters against ${game.opponent}.`,
        (game: Game) =>
                `Focus shifts to game management as the staff emphasise rest defence and creative set pieces to unlock ${game.opponent}.`,
        (game: Game) =>
                `Supporters can anticipate a charged atmosphere as the Storm rotate fresh legs and hunt early goals versus ${game.opponent}.`,
];

const HOME_VENUE_SLUGS = new Set(["aurora-field", "stadli-arena"]);

function normaliseStatus(game: Game): "upcoming" | "final" {
        if (["final", "completed", "finished"].includes(game.status)) {
                return "final";
        }

        if (game.startsAt < Date.now() - 1000 * 60 * 60 * 2) {
                return "final";
        }

        return "upcoming";
}

function formatVenue(game: Game) {
        const name = game.venueName ?? "Aurora Field";
        const location = game.venueLocation ? ` (${game.venueLocation})` : "";

        return `${name}${location}`;
}

function selectHeroImage(game: Game) {
        return GAME_HERO_IMAGES[Math.abs(game.id) % GAME_HERO_IMAGES.length];
}

function buildHighlights(game: Game) {
        return UPCOMING_HIGHLIGHTS[Math.abs(game.id) % UPCOMING_HIGHLIGHTS.length](game);
}

function buildRecap(game: Game) {
        return FINAL_RECAP_TEMPLATES[Math.abs(game.id) % FINAL_RECAP_TEMPLATES.length](game);
}

function buildUpcomingDescription(game: Game) {
        return UPCOMING_DESCRIPTION_TEMPLATES[Math.abs(game.id) % UPCOMING_DESCRIPTION_TEMPLATES.length](game);
}

function inferScoreline(game: Game) {
        const stormGoals = 2 + (Math.abs(game.id) % 3);
        const opponentGoals = Math.max(0, (Math.abs(game.id + 1) % 2));

        return `Storm ${stormGoals} - ${opponentGoals} ${game.opponent}`;
}

function isHomeFixture(game: Game) {
        if (game.venueSlug && HOME_VENUE_SLUGS.has(game.venueSlug)) {
                return true;
        }

        return (game.venueName ?? "").toLowerCase().includes("aurora");
}

function mapGameToPublic(game: Game): PublicGame {
        const status = normaliseStatus(game);
        const heroImage = selectHeroImage(game);
        const highlights = buildHighlights(game);
        const baseDescription = game.description?.trim() ?? null;
        const description = baseDescription ?? (status === "final" ? buildRecap(game) : buildUpcomingDescription(game));
        const recap = status === "final" ? buildRecap(game) : undefined;
        const score = status === "final" ? inferScoreline(game) : undefined;

        return {
                id: game.id,
                opponent: game.opponent,
                venue: formatVenue(game),
                date: new Date(game.startsAt).toISOString(),
                status,
                description,
                heroImage,
                highlights,
                recap,
                score,
                isHome: isHomeFixture(game),
        };
}

function mapVenue(row: Venue) {
        return {
                id: row.id,
                name: row.name,
                slug: row.slug,
                location: row.location,
                capacity: row.capacity,
                description: row.description,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
        };
}

export async function listVenues(db: StadliDb) {
        const rows = await db.all<Venue>(
                "SELECT id, name, slug, location, capacity, description, created_at as createdAt, updated_at as updatedAt FROM venues ORDER BY name",
        );

        return rows.map((row) => mapVenue(row));
}

export async function getVenueById(db: StadliDb, id: number) {
        const row = await db.get<Venue>(
                "SELECT id, name, slug, location, capacity, description, created_at as createdAt, updated_at as updatedAt FROM venues WHERE id = ?",
                [id],
        );

        return row ? mapVenue(row) : null;
}

export async function createVenue(db: StadliDb, payload: { name: string; slug: string; location?: string | null; capacity?: number | null; description?: string | null }) {
        await db.run(
                "INSERT INTO venues (name, slug, location, capacity, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                        payload.name,
                        payload.slug,
                        payload.location ?? null,
                        payload.capacity ?? null,
                        payload.description ?? null,
                        Date.now(),
                        Date.now(),
                ],
        );

        return getVenueById(db, (await db.get<{ id: number }>("SELECT last_insert_rowid() as id"))!.id);
}

export async function updateVenue(db: StadliDb, id: number, updates: Partial<{ name: string; slug: string; location: string | null; capacity: number | null; description: string | null }>) {
        const existing = await getVenueById(db, id);

        if (!existing) {
                return null;
        }

        const next = {
                name: updates.name ?? existing.name,
                slug: updates.slug ?? existing.slug,
                location: updates.location ?? existing.location,
                capacity: updates.capacity ?? existing.capacity,
                description: updates.description ?? existing.description,
        };

        await db.run(
                "UPDATE venues SET name = ?, slug = ?, location = ?, capacity = ?, description = ?, updated_at = ? WHERE id = ?",
                [next.name, next.slug, next.location, next.capacity, next.description, Date.now(), id],
        );

        return getVenueById(db, id);
}

export async function deleteVenue(db: StadliDb, id: number) {
        await db.run("DELETE FROM venues WHERE id = ?", [id]);
}

function mapGame(row: Game) {
        return {
                id: row.id,
                venueId: row.venueId,
                opponent: row.opponent,
                startsAt: row.startsAt,
                status: row.status,
                description: row.description,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                venueName: row.venueName,
                venueSlug: row.venueSlug,
                venueLocation: row.venueLocation,
        };
}

export async function listGames(db: StadliDb) {
        const rows = await db.all<Game>(
                `SELECT
                        g.id,
                        g.venue_id as venueId,
                        g.opponent,
                        g.starts_at as startsAt,
                        g.status,
                        g.description,
                        g.created_at as createdAt,
                        g.updated_at as updatedAt,
                        v.name as venueName,
                        v.slug as venueSlug,
                        v.location as venueLocation
                FROM games g
                JOIN venues v ON v.id = g.venue_id
                ORDER BY g.starts_at ASC`,
        );

        return rows.map((row) => mapGame(row));
}

export async function listPublicGames(db: StadliDb) {
        const games = await listGames(db);

        return games.map((game) => mapGameToPublic(game));
}

export async function getGameById(db: StadliDb, id: number) {
        const row = await db.get<Game>(
                `SELECT
                        g.id,
                        g.venue_id as venueId,
                        g.opponent,
                        g.starts_at as startsAt,
                        g.status,
                        g.description,
                        g.created_at as createdAt,
                        g.updated_at as updatedAt,
                        v.name as venueName,
                        v.slug as venueSlug,
                        v.location as venueLocation
                FROM games g
                JOIN venues v ON v.id = g.venue_id
                WHERE g.id = ?`,
                [id],
        );

        return row ? mapGame(row) : null;
}

export async function getPublicGame(db: StadliDb, id: number) {
        const game = await getGameById(db, id);

        return game ? mapGameToPublic(game) : null;
}

export async function listSeatsByVenue(db: StadliDb, venueId: number) {
        return db.all<Seat>(
                "SELECT id, venue_id as venueId, section, row, number, seat_type as seatType, created_at as createdAt, updated_at as updatedAt FROM seats WHERE venue_id = ? ORDER BY section, row, number",
                [venueId],
        );
}

export async function getSectionAvailabilityForGame(db: StadliDb, gameId: number) {
        const rows = await db.all<SectionAvailability>(
                `SELECT
                        COALESCE(s.section, 'General Admission') as section,
                        COUNT(DISTINCT s.id) as totalSeats,
                        SUM(CASE WHEN COALESCE(t.status, 'available') = 'available' THEN 1 ELSE 0 END) as availableSeats,
                        SUM(CASE WHEN COALESCE(t.status, 'available') = 'reserved' THEN 1 ELSE 0 END) as reservedSeats,
                        SUM(CASE WHEN COALESCE(t.status, 'available') = 'sold' THEN 1 ELSE 0 END) as soldSeats
                FROM seats s
                JOIN games g ON g.venue_id = s.venue_id
                LEFT JOIN tickets t ON t.seat_id = s.id AND t.game_id = ?
                WHERE g.id = ?
                GROUP BY section
                ORDER BY section`,
                [gameId, gameId],
        );

        return rows.map((row) => ({
                section: row.section,
                totalSeats: Number(row.totalSeats ?? 0),
                availableSeats: Number(row.availableSeats ?? 0),
                reservedSeats: Number(row.reservedSeats ?? 0),
                soldSeats: Number(row.soldSeats ?? 0),
        }));
}

export function summariseAvailability(sections: SectionAvailability[]): GameSeatSummary {
        return sections.reduce<GameSeatSummary>(
                (acc, section) => ({
                        totalSeats: acc.totalSeats + section.totalSeats,
                        availableSeats: acc.availableSeats + section.availableSeats,
                        reservedSeats: acc.reservedSeats + section.reservedSeats,
                        soldSeats: acc.soldSeats + section.soldSeats,
                }),
                { totalSeats: 0, availableSeats: 0, reservedSeats: 0, soldSeats: 0 },
        );
}

export async function listTicketsForGame(db: StadliDb, gameId: number) {
        const rows = await db.all<Ticket>(
                `SELECT
                        t.id,
                        t.game_id as gameId,
                        t.seat_id as seatId,
                        t.customer_id as customerId,
                        t.price_cents as priceCents,
                        t.status,
                        t.purchased_at as purchasedAt,
                        t.created_at as createdAt,
                        t.updated_at as updatedAt,
                        s.section,
                        s.row,
                        s.number,
                        s.seat_type as seatType,
                        c.first_name || ' ' || c.last_name as customerName
                FROM tickets t
                JOIN seats s ON s.id = t.seat_id
                LEFT JOIN customers c ON c.id = t.customer_id
                WHERE t.game_id = ?
                ORDER BY s.section, s.row, s.number`,
                [gameId],
        );

        return rows.map((row) => ({
                ...row,
                customerName: row.customerName?.trim() || null,
        }));
}

export async function updateTicketStatus(db: StadliDb, ticketId: number, status: string, purchasedAt?: number | null) {
        await db.run(
                "UPDATE tickets SET status = ?, purchased_at = ?, updated_at = ? WHERE id = ?",
                [status, purchasedAt ?? null, Date.now(), ticketId],
        );
}

export async function assignTicketCustomer(db: StadliDb, ticketId: number, customerId: number | null) {
        await db.run(
                "UPDATE tickets SET customer_id = ?, updated_at = ? WHERE id = ?",
                [customerId, Date.now(), ticketId],
        );
}

export async function reserveTicketsForGame(db: StadliDb, gameId: number, customerId: number, quantity: number) {
        const requested = Math.max(1, quantity);
        const tickets = await db.all<{ id: number }>(
                "SELECT id FROM tickets WHERE game_id = ? AND status = 'available' ORDER BY id LIMIT ?",
                [gameId, requested],
        );

        for (const ticket of tickets) {
                await assignTicketCustomer(db, ticket.id, customerId);
                await updateTicketStatus(db, ticket.id, "reserved", null);
        }

        return { reserved: tickets.length, requested };
}

export async function createTicket(db: StadliDb, payload: { gameId: number; seatId: number; priceCents: number; status?: string; customerId?: number | null }) {
        await db.run(
                "INSERT INTO tickets (game_id, seat_id, customer_id, price_cents, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                        payload.gameId,
                        payload.seatId,
                        payload.customerId ?? null,
                        payload.priceCents,
                        payload.status ?? "available",
                        Date.now(),
                        Date.now(),
                ],
        );
}

export async function deleteTicket(db: StadliDb, ticketId: number) {
        await db.run("DELETE FROM tickets WHERE id = ?", [ticketId]);
}

export async function getTicketSalesOverview(db: StadliDb) {
        const row = await db.get<TicketSalesOverview>(
                `SELECT
                        COUNT(*) as totalTickets,
                        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as soldTickets,
                        SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reservedTickets,
                        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as availableTickets,
                        SUM(CASE WHEN status = 'sold' THEN price_cents ELSE 0 END) as revenueCents
                FROM tickets`,
        );

        return {
                totalTickets: Number(row?.totalTickets ?? 0),
                soldTickets: Number(row?.soldTickets ?? 0),
                reservedTickets: Number(row?.reservedTickets ?? 0),
                availableTickets: Number(row?.availableTickets ?? 0),
                revenueCents: Number(row?.revenueCents ?? 0),
        };
}

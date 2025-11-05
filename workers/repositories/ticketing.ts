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
                        v.slug as venueSlug
                FROM games g
                JOIN venues v ON v.id = g.venue_id
                ORDER BY g.starts_at ASC`,
        );

        return rows.map((row) => mapGame(row));
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
                        v.slug as venueSlug
                FROM games g
                JOIN venues v ON v.id = g.venue_id
                WHERE g.id = ?`,
                [id],
        );

        return row ? mapGame(row) : null;
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

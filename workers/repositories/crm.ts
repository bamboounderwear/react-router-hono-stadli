import type { StadliDb } from "../db/client";

export type ContactRecord = {
        id: number;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
        createdAt: number;
        updatedAt: number;
        latestStatus: string | null;
        lastTicketUpdate: number | null;
        lastSection: string | null;
        pipelineValueCents: number | null;
};

export type CrmContact = {
        id: string;
        name: string;
        company: string;
        email: string;
        stage: string;
        lastActivityAt: string;
        owner: string;
        value: number;
};

export type PipelineStage = {
        stage: string;
        count: number;
        value: number;
        delta: number;
};

export type Customer = {
        id: number;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
};

const STAGE_BY_STATUS: Record<string, string> = {
        available: "Qualification",
        reserved: "Negotiation",
        sold: "Closed won",
};

const ACCOUNT_OWNERS = ["Felix Maurer", "Suri Das", "Ellie Marks", "Jules Meyer"];

function resolveStage(status: string | null | undefined) {
        if (!status) {
                return "Qualification";
        }
        return STAGE_BY_STATUS[status] ?? "Qualification";
}

function inferCompany(email: string, section: string | null) {
        if (section) {
                        return `${section} Section`; // section-level grouping
        }
        const [, domain] = email.split("@");

        if (domain) {
                return domain.replace(/\..*/, "").replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
        }

        return "Supporter";
}

function pickOwner(customerId: number) {
        return ACCOUNT_OWNERS[customerId % ACCOUNT_OWNERS.length];
}

function centsToValue(cents: number | null | undefined) {
        return Math.round((cents ?? 0) / 100);
}

function normaliseEmail(email: string) {
        return email.trim().toLowerCase();
}

export async function findCustomerByEmail(db: StadliDb, email: string) {
        const row = await db.get<Customer>(
                "SELECT id, first_name as firstName, last_name as lastName, email, phone FROM customers WHERE lower(email) = ?",
                [normaliseEmail(email)],
        );

        return row ?? null;
}

export async function upsertCustomer(
        db: StadliDb,
        payload: { firstName?: string | null; lastName?: string | null; email: string; phone?: string | null },
) {
        const email = normaliseEmail(payload.email);

        if (!email) {
                throw new Error("Customer email is required");
        }

        const existing = await findCustomerByEmail(db, email);

        if (existing) {
                const nextFirst = payload.firstName ?? existing.firstName;
                const nextLast = payload.lastName ?? existing.lastName;
                const nextPhone = payload.phone ?? existing.phone;

                if (nextFirst !== existing.firstName || nextLast !== existing.lastName || nextPhone !== existing.phone) {
                        await db.run(
                                "UPDATE customers SET first_name = ?, last_name = ?, phone = ?, updated_at = ? WHERE id = ?",
                                [nextFirst, nextLast, nextPhone, Date.now(), existing.id],
                        );

                        return { ...existing, firstName: nextFirst, lastName: nextLast, phone: nextPhone } satisfies Customer;
                }

                return existing;
        }

        await db.run(
                "INSERT INTO customers (first_name, last_name, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                [payload.firstName ?? null, payload.lastName ?? null, email, payload.phone ?? null, Date.now(), Date.now()],
        );

        const created = await findCustomerByEmail(db, email);

        if (!created) {
                throw new Error("Failed to create customer");
        }

        return created;
}

function mapContact(row: ContactRecord): CrmContact {
        const stage = resolveStage(row.latestStatus);
        const name = [row.firstName, row.lastName].filter(Boolean).join(" ") || row.email;
        const lastActivity = row.lastTicketUpdate ?? row.updatedAt ?? row.createdAt;

        return {
                id: String(row.id),
                name,
                company: inferCompany(row.email, row.lastSection),
                email: row.email,
                stage,
                lastActivityAt: new Date(lastActivity).toISOString(),
                owner: pickOwner(row.id),
                value: centsToValue(row.pipelineValueCents),
        };
}

export async function listContacts(db: StadliDb) {
        const rows = await db.all<ContactRecord>(
                `SELECT
                        c.id,
                        c.first_name as firstName,
                        c.last_name as lastName,
                        c.email,
                        c.phone,
                        c.created_at as createdAt,
                        c.updated_at as updatedAt,
                        (
                                SELECT tt.status FROM tickets tt
                                WHERE tt.customer_id = c.id
                                ORDER BY tt.updated_at DESC
                                LIMIT 1
                        ) as latestStatus,
                        (
                                SELECT tt.updated_at FROM tickets tt
                                WHERE tt.customer_id = c.id
                                ORDER BY tt.updated_at DESC
                                LIMIT 1
                        ) as lastTicketUpdate,
                        (
                                SELECT s.section FROM tickets tt
                                JOIN seats s ON s.id = tt.seat_id
                                WHERE tt.customer_id = c.id
                                ORDER BY tt.updated_at DESC
                                LIMIT 1
                        ) as lastSection,
                        (
                                SELECT COALESCE(SUM(tt.price_cents), 0) FROM tickets tt
                                WHERE tt.customer_id = c.id AND tt.status IN ('reserved', 'sold')
                        ) as pipelineValueCents
                FROM customers c
                ORDER BY COALESCE(lastTicketUpdate, updatedAt) DESC
                `,
        );

        return rows.map((row) => mapContact(row));
}

export async function getPipelineSummary(db: StadliDb) {
        const contacts = await listContacts(db);
        const buckets = new Map<string, { count: number; value: number }>();

        for (const contact of contacts) {
                const current = buckets.get(contact.stage) ?? { count: 0, value: 0 };
                current.count += 1;
                current.value += contact.value;
                buckets.set(contact.stage, current);
        }

        const deltas: Record<string, number> = {
                Qualification: -2,
                Negotiation: 3,
                "Closed won": 6,
        };

        return Array.from(buckets.entries()).map<PipelineStage>(([stage, { count, value }]) => ({
                stage,
                count,
                value,
                delta: deltas[stage] ?? 0,
        }));
}

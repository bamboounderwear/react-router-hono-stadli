import type { D1Database } from "@cloudflare/workers-types";
import { Hono } from "hono";
import type { Context, MiddlewareHandler } from "hono";
import { createRequestHandler } from "react-router";

import { getDb } from "./db/client";
import { getNewsEntryBySlug, listNewsEntries, updateNewsEntry } from "./repositories/content";
import { getPipelineSummary, listContacts } from "./repositories/crm";
import { assignTicketCustomer, getSectionAvailabilityForGame, listGames, listTicketsForGame, updateTicketStatus } from "./repositories/ticketing";
import { buildAnalyticsOverview, buildAnalyticsSummary } from "./services/analytics";

type Bindings = {
        ADMIN_USERNAME?: string;
        ADMIN_PASSWORD?: string;
        SESSION_SECRET?: string;
        stadlidb: D1Database;
};

type Variables = {
        session?: Session;
};

type Session = {
        username: string;
        name: string;
        role: string;
};

type AppContext = {
        Bindings: Bindings;
        Variables: Variables;
};

const DEFAULT_ADMIN: Session & { password: string } = {
        username: "admin@stadlistorm.ch",
        password: "stadli-rules",
        name: "Ava Hart",
        role: "Director of Digital",
};

const SESSION_COOKIE_NAME = "stadli_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours
const DEFAULT_SESSION_SECRET = "stadli-admin-secret";

const app = new Hono<AppContext>();
const authApp = new Hono<AppContext>();
const analyticsApp = new Hono<AppContext>();
const crmApp = new Hono<AppContext>();
const contentApp = new Hono<AppContext>();
const ticketingApp = new Hono<AppContext>();

authApp.post("/login", async (c) => {
        const credentials = await c.req.json().catch(() => ({})) as { username?: string; password?: string };
        const configuredUsername = c.env.ADMIN_USERNAME ?? DEFAULT_ADMIN.username;
        const configuredPassword = c.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN.password;

        if (credentials.username !== configuredUsername || credentials.password !== configuredPassword) {
                c.header("Set-Cookie", destroySessionCookie());
                return c.json({ error: "Invalid credentials" }, 401);
        }

        const secret = c.env.SESSION_SECRET ?? DEFAULT_SESSION_SECRET;
        const user: Session = {
                username: configuredUsername,
                name: DEFAULT_ADMIN.name,
                role: DEFAULT_ADMIN.role,
        };
        const token = await createSessionToken(user, secret);

        c.header("Set-Cookie", createSessionCookie(token));

        return c.json({ success: true, user });
});

authApp.post("/logout", (c) => {
        c.header("Set-Cookie", destroySessionCookie());
        return c.json({ success: true });
});

authApp.get("/me", async (c) => {
        const session = await getSession(c);

        if (!session) {
                c.header("Set-Cookie", destroySessionCookie());
                return c.json({ error: "Unauthorized" }, 401);
        }

        return c.json({ user: session });
});

const requireAuth: MiddlewareHandler<AppContext> = async (c, next) => {
        const session = await getSession(c);

        if (!session) {
                c.header("Set-Cookie", destroySessionCookie());
                return c.json({ error: "Unauthorized" }, 401);
        }

        c.set("session", session);
        await next();
};

analyticsApp.use("*", requireAuth);
contentApp.use("*", requireAuth);
crmApp.use("*", requireAuth);
ticketingApp.use("*", requireAuth);

analyticsApp.get("/summary", async (c) => {
        const db = getDb(c.env.stadlidb);
        const summary = await buildAnalyticsSummary(db);

        return c.json(summary);
});

analyticsApp.get("/overview", async (c) => {
        const db = getDb(c.env.stadlidb);
        const overview = await buildAnalyticsOverview(db);

        return c.json(overview);
});

analyticsApp.post("/ingest", async (c) => {
        await c.req.json().catch(() => null);
        c.executionCtx.waitUntil(Promise.resolve());

        return c.json({ success: true });
});

contentApp.get("/entries", async (c) => {
        const db = getDb(c.env.stadlidb);
        const entries = await listNewsEntries(db);

        return c.json({ entries });
});

contentApp.get("/entries/:id", async (c) => {
        const db = getDb(c.env.stadlidb);
        const entry = await getNewsEntryBySlug(db, c.req.param("id"));

        if (!entry) {
                return c.json({ error: "Entry not found" }, 404);
        }

        return c.json({ entry });
});

contentApp.post("/entries/:id", async (c) => {
        const slug = c.req.param("id");
        const db = getDb(c.env.stadlidb);
        const updates = await c.req.json().catch(() => ({}));
        const entry = await updateNewsEntry(db, slug, updates);

        if (!entry) {
                return c.json({ error: "Entry not found" }, 404);
        }

        return c.json({ success: true, entry });
});

crmApp.get("/contacts", async (c) => {
        const db = getDb(c.env.stadlidb);
        const contacts = await listContacts(db);

        return c.json({ contacts });
});

crmApp.get("/pipeline", async (c) => {
        const db = getDb(c.env.stadlidb);
        const pipeline = await getPipelineSummary(db);

        return c.json({ pipeline });
});

ticketingApp.get("/games", async (c) => {
        const db = getDb(c.env.stadlidb);
        const games = await listGames(db);
        const gamesWithAvailability = await Promise.all(
                games.map(async (game) => ({
                        ...game,
                        sections: await getSectionAvailabilityForGame(db, game.id),
                })),
        );

        return c.json({ games: gamesWithAvailability });
});

ticketingApp.get("/games/:id/availability", async (c) => {
        const gameId = Number.parseInt(c.req.param("id"), 10);

        if (Number.isNaN(gameId)) {
                return c.json({ error: "Invalid game id" }, 400);
        }

        const db = getDb(c.env.stadlidb);
        const sections = await getSectionAvailabilityForGame(db, gameId);

        return c.json({ sections });
});

ticketingApp.get("/games/:id/tickets", async (c) => {
        const gameId = Number.parseInt(c.req.param("id"), 10);

        if (Number.isNaN(gameId)) {
                return c.json({ error: "Invalid game id" }, 400);
        }

        const db = getDb(c.env.stadlidb);
        const tickets = await listTicketsForGame(db, gameId);

        return c.json({ tickets });
});

ticketingApp.post("/games/:id/tickets/:ticketId/status", async (c) => {
        const ticketId = Number.parseInt(c.req.param("ticketId"), 10);

        if (Number.isNaN(ticketId)) {
                return c.json({ error: "Invalid ticket id" }, 400);
        }

        const payload = await c.req.json().catch(() => ({}));
        const status = typeof payload.status === "string" ? payload.status : null;
        const purchasedAt = typeof payload.purchasedAt === "number" ? payload.purchasedAt : null;

        if (!status) {
                return c.json({ error: "Ticket status is required" }, 400);
        }

        const db = getDb(c.env.stadlidb);
        await updateTicketStatus(db, ticketId, status, purchasedAt);

        return c.json({ success: true });
});

ticketingApp.post("/games/:id/tickets/:ticketId/assign", async (c) => {
        const ticketId = Number.parseInt(c.req.param("ticketId"), 10);

        if (Number.isNaN(ticketId)) {
                return c.json({ error: "Invalid ticket id" }, 400);
        }

        const payload = await c.req.json().catch(() => ({}));
        const customerId = typeof payload.customerId === "number" ? payload.customerId : null;

        const db = getDb(c.env.stadlidb);
        await assignTicketCustomer(db, ticketId, customerId);

        return c.json({ success: true });
});

app.route("/api/auth", authApp);
app.route("/api/analytics", analyticsApp);
app.route("/api/content", contentApp);
app.route("/api/crm", crmApp);
app.route("/api/ticketing", ticketingApp);

app.get("*", (c) => {
        const requestHandler = createRequestHandler(
                () => import("virtual:react-router/server-build"),
                import.meta.env.MODE,
        );

        return requestHandler(c.req.raw, {
                cloudflare: { env: c.env, ctx: c.executionCtx },
        });
});

export default app;

async function getSession(c: Context<AppContext>): Promise<Session | null> {
        const cookieHeader = c.req.header("Cookie") ?? c.req.header("cookie") ?? null;
        const secret = c.env.SESSION_SECRET ?? DEFAULT_SESSION_SECRET;
        const token = parseCookies(cookieHeader)[SESSION_COOKIE_NAME];

        if (!token) {
                return null;
        }

        return verifySessionToken(token, secret);
}

async function createSessionToken(user: Session, secret: string) {
        const payload = {
                ...user,
                exp: Date.now() + SESSION_MAX_AGE * 1000,
        };
        const encoded = btoa(JSON.stringify(payload));
        const signature = await signValue(secret, encoded);

        return `${encoded}.${signature}`;
}

async function verifySessionToken(token: string, secret: string): Promise<Session | null> {
        const [encoded, signature] = token.split(".");

        if (!encoded || !signature) {
                return null;
        }

        const expected = await signValue(secret, encoded);

        if (!timingSafeEqual(signature, expected)) {
                return null;
        }

        try {
                const payload = JSON.parse(atob(encoded)) as Session & { exp: number };

                if (typeof payload.exp !== "number" || payload.exp < Date.now()) {
                        return null;
                }

                return {
                        username: payload.username,
                        name: payload.name,
                        role: payload.role,
                };
        } catch {
                return null;
        }
}

function createSessionCookie(token: string) {
        return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax`;
}

function destroySessionCookie() {
        return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}

function parseCookies(header: string | null) {
        const cookies: Record<string, string> = {};

        if (!header) {
                return cookies;
        }

        header.split(";").forEach((part) => {
                const [name, ...value] = part.trim().split("=");

                if (!name) {
                        return;
                }

                cookies[name] = value.join("=");
        });

        return cookies;
}

async function signValue(secret: string, value: string) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
                "raw",
                encoder.encode(secret),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"],
        );
        const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

        return bufferToBase64(signature);
}

function bufferToBase64(buffer: ArrayBuffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);

        for (const byte of bytes) {
                binary += String.fromCharCode(byte);
        }

        return btoa(binary);
}

function timingSafeEqual(a: string, b: string) {
        if (a.length !== b.length) {
                return false;
        }

        let result = 0;

        for (let i = 0; i < a.length; i += 1) {
                result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }

        return result === 0;
}

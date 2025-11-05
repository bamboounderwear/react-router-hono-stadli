import { Hono } from "hono";
import type { Context, MiddlewareHandler } from "hono";
import { createRequestHandler } from "react-router";

type Bindings = {
        ADMIN_USERNAME?: string;
        ADMIN_PASSWORD?: string;
        SESSION_SECRET?: string;
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

const analyticsSummary = {
        totals: [
                { id: "visitors", label: "Active visitors", value: 1842, delta: 12 },
                { id: "conversions", label: "Goal completions", value: 342, delta: 5 },
                { id: "revenue", label: "Digital revenue", value: 12840, delta: 8, format: "currency" as const },
                { id: "retention", label: "Retention", value: 78, delta: -3, format: "percentage" as const },
        ],
        trend: [
                { period: "Mon", visitors: 312, conversions: 21 },
                { period: "Tue", visitors: 356, conversions: 26 },
                { period: "Wed", visitors: 401, conversions: 33 },
                { period: "Thu", visitors: 388, conversions: 29 },
                { period: "Fri", visitors: 420, conversions: 34 },
                { period: "Sat", visitors: 512, conversions: 41 },
                { period: "Sun", visitors: 468, conversions: 39 },
        ],
        topContent: [
                { id: "matchday-hype", title: "Matchday hype reel", views: 12540, status: "Published" },
                { id: "academy-deep-dive", title: "Academy pipeline deep dive", views: 9872, status: "Scheduled" },
                { id: "legends-night", title: "Legends night announcement", views: 8455, status: "Draft" },
        ],
        alerts: [
                "Bounce rate spiked on the tickets page after 20:00 CET.",
                "Merchandise conversions dipped 6% following pricing update.",
        ],
};

const analyticsOverview = {
        totals: analyticsSummary.totals,
        timeSeries: [
                { period: "Mon", visitors: 312, conversions: 21, revenue: 1480 },
                { period: "Tue", visitors: 356, conversions: 26, revenue: 1620 },
                { period: "Wed", visitors: 401, conversions: 33, revenue: 1820 },
                { period: "Thu", visitors: 388, conversions: 29, revenue: 1755 },
                { period: "Fri", visitors: 420, conversions: 34, revenue: 1910 },
                { period: "Sat", visitors: 512, conversions: 41, revenue: 2150 },
                { period: "Sun", visitors: 468, conversions: 39, revenue: 2075 },
        ],
        channels: [
                { channel: "Organic", share: 34, delta: 4 },
                { channel: "Paid", share: 22, delta: -3 },
                { channel: "Social", share: 18, delta: 6 },
                { channel: "Email", share: 12, delta: 2 },
                { channel: "Referral", share: 8, delta: 1 },
        ],
        funnels: [
                { stage: "Discovery", completion: 82, delta: 5 },
                { stage: "Engagement", completion: 64, delta: 3 },
                { stage: "Ticket intent", completion: 43, delta: -2 },
                { stage: "Checkout", completion: 31, delta: 4 },
        ],
        segments: [
                { segment: "Season ticket members", share: 38, change: 6 },
                { segment: "International fans", share: 24, change: 3 },
                { segment: "Local families", share: 18, change: -2 },
                { segment: "Corporate partners", share: 12, change: 4 },
        ],
};

const contentEntries = [
        {
                id: "homepage-hero",
                title: "Homepage hero spotlight",
                summary: "Update hero module with Noa Fernandez hat-trick recap and new CTA for membership upsell.",
                status: "Published",
                owner: "Lina Schneider",
                updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                audience: "Global",
        },
        {
                id: "press-release",
                title: "Press release – New midfield signing",
                summary: "Finalize copy for Mina Cho transfer signing ahead of embargo lift at 10:00 CET.",
                status: "Scheduled",
                owner: "Ava Hart",
                updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
                audience: "Media list",
        },
        {
                id: "newsletter",
                title: "Supporter newsletter",
                summary: "Personalised content blocks for away supporters and push mid-season survey participation.",
                status: "Draft",
                owner: "Zuri Adebayo",
                updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
                audience: "Subscribers",
        },
        {
                id: "matchday-guide",
                title: "Matchday guide",
                summary: "Refresh stadium amenities map and integrate weather contingency messaging.",
                status: "Published",
                owner: "Ivy Watts",
                updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                audience: "Ticket holders",
        },
];

const crmContacts = [
        {
                id: "clara-thompson",
                name: "Clara Thompson",
                company: "Aurora Analytics",
                email: "clara@auroraanalytics.io",
                stage: "Negotiation",
                lastActivityAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                owner: "Felix Maurer",
                value: 24000,
        },
        {
                id: "marco-ruiz",
                name: "Marco Ruiz",
                company: "Nordic Bank",
                email: "marco.ruiz@nordicbank.ch",
                stage: "Proposal",
                lastActivityAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
                owner: "Suri Das",
                value: 18000,
        },
        {
                id: "isabella-cho",
                name: "Isabella Cho",
                company: "SkyLine Media",
                email: "isabella@skylinemedia.co",
                stage: "Qualification",
                lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                owner: "Ellie Marks",
                value: 9000,
        },
        {
                id: "hans-meyer",
                name: "Hans Meyer",
                company: "Alpine Logistics",
                email: "hmeyer@alpinelogistics.ch",
                stage: "Renewal",
                lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                owner: "Jules Meyer",
                value: 42000,
        },
        {
                id: "sophie-grant",
                name: "Sophie Grant",
                company: "Grant Ventures",
                email: "sophie@grantventures.vc",
                stage: "Negotiation",
                lastActivityAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
                owner: "Felix Maurer",
                value: 32000,
        },
        {
                id: "amir-hassan",
                name: "Amir Hassan",
                company: "Horizon Mobility",
                email: "amir@horizonmobility.com",
                stage: "Qualification",
                lastActivityAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
                owner: "Suri Das",
                value: 15000,
        },
];

const crmPipeline = [
        { stage: "Qualification", count: 18, value: 54000, delta: 3 },
        { stage: "Proposal", count: 11, value: 68000, delta: 5 },
        { stage: "Negotiation", count: 7, value: 86000, delta: 2 },
        { stage: "Closed won", count: 5, value: 124000, delta: 6 },
];

const app = new Hono<AppContext>();
const authApp = new Hono<AppContext>();
const analyticsApp = new Hono<AppContext>();
const crmApp = new Hono<AppContext>();
const contentApp = new Hono<AppContext>();

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

analyticsApp.get("/summary", (c) => c.json(analyticsSummary));
analyticsApp.get("/overview", (c) => c.json(analyticsOverview));
analyticsApp.post("/ingest", async (c) => {
        const metric = await c.req.json().catch(() => null);

        if (metric) {
                c.executionCtx.waitUntil(Promise.resolve());
        }

        return c.json({ success: true });
});

contentApp.get("/entries", (c) => c.json({ entries: contentEntries }));
contentApp.get("/entries/:id", (c) => {
        const entry = contentEntries.find((item) => item.id === c.req.param("id"));

        if (!entry) {
                return c.json({ error: "Entry not found" }, 404);
        }

        return c.json({ entry });
});
contentApp.post("/entries/:id", async (c) => {
        const id = c.req.param("id");
        const updates = await c.req.json().catch(() => ({}));
        const entry = contentEntries.find((item) => item.id === id);

        if (!entry) {
                return c.json({ error: "Entry not found" }, 404);
        }

        if (typeof updates.title === "string") {
                entry.title = updates.title;
        }
        if (typeof updates.summary === "string") {
                entry.summary = updates.summary;
        }
        if (typeof updates.status === "string") {
                entry.status = updates.status;
        }

        entry.updatedAt = new Date().toISOString();

        return c.json({ success: true, entry });
});

crmApp.get("/contacts", (c) => c.json({ contacts: crmContacts }));
crmApp.get("/pipeline", (c) => c.json({ pipeline: crmPipeline }));

app.route("/api/auth", authApp);
app.route("/api/analytics", analyticsApp);
app.route("/api/content", contentApp);
app.route("/api/crm", crmApp);

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

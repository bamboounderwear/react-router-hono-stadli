import type { StadliDb } from "../db/client";
import { listContacts } from "../repositories/crm";
import { listNewsEntries } from "../repositories/content";
import { getTicketSalesOverview, getSectionAvailabilityForGame, listGames } from "../repositories/ticketing";

export type AnalyticsSummary = {
        totals: Array<{ id: string; label: string; value: number; delta: number; format?: "percentage" | "currency" }>;
        trend: Array<{ period: string; visitors: number; conversions: number }>;
        topContent: Array<{ id: string; title: string; views: number; status: string }>;
        alerts: string[];
};

export type AnalyticsOverview = {
        totals: AnalyticsSummary["totals"];
        timeSeries: Array<{ period: string; visitors: number; conversions: number; revenue: number }>;
        channels: Array<{ channel: string; share: number; delta: number }>;
        funnels: Array<{ stage: string; completion: number; delta: number }>;
        segments: Array<{ segment: string; share: number; change: number }>;
};

function toWeekdayLabel(timestamp: number) {
        return new Date(timestamp).toLocaleDateString(undefined, { weekday: "short" });
}

function percentage(part: number, whole: number) {
        if (whole <= 0) {
                return 0;
        }
        return Math.round((part / whole) * 100);
}

export async function buildAnalyticsSummary(db: StadliDb): Promise<AnalyticsSummary> {
        const [sales, games, contacts, news] = await Promise.all([
                getTicketSalesOverview(db),
                listGames(db),
                listContacts(db),
                listNewsEntries(db),
        ]);

        const availability = await Promise.all(
                games.slice(0, 7).map(async (game) => ({
                        game,
                        sections: await getSectionAvailabilityForGame(db, game.id),
                })),
        );

        const trend = availability.map(({ game, sections }) => {
                const totalSeats = sections.reduce((sum, section) => sum + section.totalSeats, 0);
                const soldSeats = sections.reduce((sum, section) => sum + section.soldSeats, 0);
                const activeVisitors = totalSeats - sections.reduce((sum, section) => sum + section.availableSeats, 0);

                return {
                        period: toWeekdayLabel(game.startsAt),
                        visitors: activeVisitors,
                        conversions: soldSeats,
                };
        });

        const totals = [
                {
                        id: "visitors",
                        label: "Active visitors",
                        value: trend.reduce((sum, point) => sum + point.visitors, 0),
                        delta: contacts.length > 0 ? Math.min(contacts.length * 2, 15) : 0,
                },
                {
                        id: "conversions",
                        label: "Goal completions",
                        value: sales.soldTickets + sales.reservedTickets,
                        delta: Math.max(1, Math.min(sales.soldTickets, 12)),
                },
                {
                        id: "revenue",
                        label: "Digital revenue",
                        value: Math.round(sales.revenueCents / 100),
                        delta: contacts.length > 0 ? Math.min(contacts.length, 10) : 2,
                        format: "currency" as const,
                },
                {
                        id: "retention",
                        label: "Retention",
                        value: percentage(sales.soldTickets, contacts.length || 1),
                        delta: sales.soldTickets > 0 ? 4 : -3,
                        format: "percentage" as const,
                },
        ];

        const topContent = news.slice(0, 3).map((entry) => ({
                id: entry.id,
                title: entry.title,
                views: Math.max(1800, entry.summary.length * 18 + trend.length * 250),
                status: entry.status,
        }));

        const alerts: string[] = [];
        const soldRatio = percentage(sales.soldTickets, sales.totalTickets || 1);
        const reservedRatio = percentage(sales.reservedTickets, sales.totalTickets || 1);

        if (soldRatio > 60) {
                alerts.push(`High demand: ${soldRatio}% of available seats are already sold.`);
        }
        if (reservedRatio > 20) {
                alerts.push(`Monitor holds: ${reservedRatio}% of inventory is held in reservations.`);
        }
        if (alerts.length === 0) {
                alerts.push("Traffic steady across ticket funnels. No anomalies detected.");
        }

        return {
                totals,
                trend,
                topContent,
                alerts,
        };
}

export async function buildAnalyticsOverview(db: StadliDb): Promise<AnalyticsOverview> {
        const summary = await buildAnalyticsSummary(db);
        const sales = await getTicketSalesOverview(db);
        const totalConversions = summary.totals[1]?.value || 1;

        const timeSeries = summary.trend.map((point) => ({
                period: point.period,
                visitors: point.visitors,
                conversions: point.conversions,
                revenue: point.conversions > 0
                        ? Math.round((sales.revenueCents / 100) * (point.conversions / Math.max(totalConversions, 1)))
                        : 0,
        }));

        const channels = [
                { channel: "Organic", share: 34, delta: 4 },
                { channel: "Paid", share: 22, delta: -2 },
                { channel: "Social", share: 18, delta: 5 },
                { channel: "Email", share: 14, delta: 2 },
                { channel: "Referral", share: 12, delta: 1 },
        ];

        const completionBase = percentage(sales.soldTickets + sales.reservedTickets, sales.totalTickets || 1);
        const funnels = [
                { stage: "Discovery", completion: Math.min(95, Math.max(60, completionBase + 40)), delta: 5 },
                { stage: "Engagement", completion: Math.min(80, Math.max(50, completionBase + 20)), delta: 3 },
                { stage: "Ticket intent", completion: Math.min(60, Math.max(30, completionBase + 5)), delta: -2 },
                { stage: "Checkout", completion: Math.min(45, Math.max(20, completionBase)), delta: 4 },
        ];

        const engagedTickets = Math.max(sales.soldTickets + sales.reservedTickets, 1);
        const seasonShare = Math.min(55, Math.max(20, percentage(sales.soldTickets, engagedTickets)));
        const reservedShare = Math.min(35, Math.max(12, percentage(sales.reservedTickets, engagedTickets)));
        const remainingShare = Math.max(10, 100 - seasonShare - reservedShare);
        const localShare = Math.min(30, Math.max(10, Math.round(remainingShare * 0.6)));
        const corporateShare = Math.max(8, Math.min(25, remainingShare - localShare));

        const segments = [
                { segment: "Season ticket members", share: seasonShare, change: 6 },
                { segment: "International fans", share: reservedShare, change: 3 },
                { segment: "Local families", share: localShare, change: -2 },
                { segment: "Corporate partners", share: corporateShare, change: 4 },
        ];

        return {
                totals: summary.totals,
                timeSeries,
                channels,
                funnels,
                segments,
        };
}

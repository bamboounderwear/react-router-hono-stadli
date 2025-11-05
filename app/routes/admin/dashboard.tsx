import { useOutletContext } from "react-router";

import type { Route } from "./+types/dashboard";
import type { AdminOutletContext } from "./_layout";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { callApi } from "../../utils/api.server";

type AnalyticsSummary = {
        totals: Array<{ id: string; label: string; value: number; delta: number; format?: "percentage" | "currency" }>;
        trend: Array<{ period: string; visitors: number; conversions: number }>;
        topContent: Array<{ id: string; title: string; views: number; status: string }>;
        alerts: string[];
};

type ContentEntry = {
        id: string;
        title: string;
        status: string;
        updatedAt: string;
        owner: string;
};

type ContactPreview = {
        id: string;
        name: string;
        company: string;
        email: string;
        stage: string;
        lastActivityAt: string;
};

type LoaderData = {
        analytics: AnalyticsSummary;
        highlightedContent: ContentEntry[];
        topContacts: ContactPreview[];
};

export async function loader({ request }: Route.LoaderArgs) {
        const [analyticsRes, contentRes, contactsRes] = await Promise.all([
                callApi(request, "/api/analytics/summary"),
                callApi(request, "/api/content/entries"),
                callApi(request, "/api/crm/contacts"),
        ]);

        if (!analyticsRes.ok) {
                throw new Response("Failed to load analytics summary", { status: analyticsRes.status });
        }
        if (!contentRes.ok) {
                throw new Response("Failed to load content entries", { status: contentRes.status });
        }
        if (!contactsRes.ok) {
                throw new Response("Failed to load CRM contacts", { status: contactsRes.status });
        }

        const analytics = (await analyticsRes.json()) as AnalyticsSummary;
        const content = (await contentRes.json()) as { entries: ContentEntry[] };
        const crm = (await contactsRes.json()) as { contacts: ContactPreview[] };

        const data: LoaderData = {
                analytics,
                highlightedContent: content.entries.slice(0, 3),
                topContacts: crm.contacts.slice(0, 4),
        };

        return data;
}

function formatMetric(value: number, format?: "percentage" | "currency") {
        if (format === "currency") {
                return new Intl.NumberFormat(undefined, { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(
                        value,
                );
        }
        if (format === "percentage") {
                return `${value.toFixed(1)}%`;
        }
        return new Intl.NumberFormat().format(value);
}

function formatDelta(delta: number) {
        const prefix = delta >= 0 ? "+" : "";
        return `${prefix}${delta}%`;
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
        const { user } = useOutletContext<AdminOutletContext>();
        const { analytics, highlightedContent, topContacts } = loaderData as LoaderData;

        return (
                <div className="space-y-10">
                        <section>
                                <div className="mb-6 flex flex-col gap-2">
                                        <h2 className="text-2xl font-semibold text-white">Welcome back, {user.name.split(" ")[0]}.</h2>
                                        <p className="text-sm text-slate-300">
                                                Here's what's happening across digital channels today. All data is refreshed every five minutes from live
                                                telemetry.
                                        </p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        {analytics.totals.map((metric) => (
                                                <Card key={metric.id} className="border-blue-900/40 bg-slate-900/80">
                                                        <CardHeader>
                                                                <CardDescription>{metric.label}</CardDescription>
                                                                <CardTitle className="text-2xl font-semibold">
                                                                        {formatMetric(metric.value, metric.format)}
                                                                </CardTitle>
                                                                <p
                                                                        className={
                                                                                metric.delta >= 0
                                                                                        ? "text-xs font-medium text-emerald-300"
                                                                                        : "text-xs font-medium text-rose-300"
                                                                        }
                                                                >
                                                                        {formatDelta(metric.delta)} vs. last week
                                                                </p>
                                                        </CardHeader>
                                                </Card>
                                        ))}
                                </div>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                                <Card>
                                        <CardHeader>
                                                <CardTitle>Traffic Momentum</CardTitle>
                                                <CardDescription>Visitors and goal completions over the last 7 days</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                                <div className="grid grid-cols-7 gap-3 text-sm text-slate-200">
                                                        {analytics.trend.map((point) => (
                                                                <div
                                                                        key={point.period}
                                                                        className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"
                                                                >
                                                                        <p className="text-xs uppercase tracking-wide text-slate-400">{point.period}</p>
                                                                        <p className="mt-2 text-lg font-semibold text-white">
                                                                                {new Intl.NumberFormat().format(point.visitors)}
                                                                        </p>
                                                                        <p className="text-xs text-slate-400">
                                                                                {point.conversions} conversions
                                                                        </p>
                                                                </div>
                                                        ))}
                                                </div>
                                                <Button className="mt-6" variant="outline" size="sm">
                                                        View real-time stream
                                                </Button>
                                        </CardContent>
                                </Card>
                                <div className="space-y-6">
                                        <Card>
                                                <CardHeader>
                                                        <CardTitle>Alerts</CardTitle>
                                                        <CardDescription>Automated insights that need your attention</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                        {analytics.alerts.map((alert, index) => (
                                                                <div
                                                                        key={alert}
                                                                        className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
                                                                >
                                                                        <p className="font-medium">{alert}</p>
                                                                        <p className="text-xs text-amber-200">Detected {index === 0 ? "5 minutes" : "12 minutes"} ago</p>
                                                                </div>
                                                        ))}
                                                </CardContent>
                                        </Card>
                                        <Card>
                                                <CardHeader>
                                                        <CardTitle>Top Performing Content</CardTitle>
                                                        <CardDescription>Audience engagement over the last 24 hours</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                        {analytics.topContent.map((item) => (
                                                                <div key={item.id} className="flex items-center justify-between">
                                                                        <div>
                                                                                <p className="font-medium text-white">{item.title}</p>
                                                                                <p className="text-xs text-slate-400">{new Intl.NumberFormat().format(item.views)} views</p>
                                                                        </div>
                                                                        <Badge variant={item.status === "Published" ? "success" : "warning"}>{item.status}</Badge>
                                                                </div>
                                                        ))}
                                                </CardContent>
                                        </Card>
                                </div>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                                <Card>
                                        <CardHeader>
                                                <CardTitle>Editorial queue</CardTitle>
                                                <CardDescription>Upcoming pieces and their current status</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                                <Table>
                                                        <TableHeader>
                                                                <TableRow>
                                                                        <TableHead>Title</TableHead>
                                                                        <TableHead>Status</TableHead>
                                                                        <TableHead>Owner</TableHead>
                                                                        <TableHead>Updated</TableHead>
                                                                </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                                {highlightedContent.map((entry) => (
                                                                        <TableRow key={entry.id}>
                                                                                <TableCell className="font-medium text-white">{entry.title}</TableCell>
                                                                                <TableCell>
                                                                                        <Badge variant={entry.status === "Published" ? "success" : "outline"}>
                                                                                                {entry.status}
                                                                                        </Badge>
                                                                                </TableCell>
                                                                                <TableCell>{entry.owner}</TableCell>
                                                                                <TableCell>
                                                                                        {new Date(entry.updatedAt).toLocaleString(undefined, {
                                                                                                hour: "2-digit",
                                                                                                minute: "2-digit",
                                                                                                month: "short",
                                                                                                day: "numeric",
                                                                                        })}
                                                                                </TableCell>
                                                                        </TableRow>
                                                                ))}
                                                        </TableBody>
                                                </Table>
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardHeader>
                                                <CardTitle>Active conversations</CardTitle>
                                                <CardDescription>High-value supporters requiring follow-up</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                                <Table>
                                                        <TableHeader>
                                                                <TableRow>
                                                                        <TableHead>Contact</TableHead>
                                                                        <TableHead>Stage</TableHead>
                                                                        <TableHead>Last touch</TableHead>
                                                                </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                                {topContacts.map((contact) => (
                                                                        <TableRow key={contact.id}>
                                                                                <TableCell className="font-medium text-white">{contact.name}</TableCell>
                                                                                <TableCell>
                                                                                        <Badge variant="outline">{contact.stage}</Badge>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                        {new Date(contact.lastActivityAt).toLocaleDateString(undefined, {
                                                                                                month: "short",
                                                                                                day: "numeric",
                                                                                        })}
                                                                                </TableCell>
                                                                        </TableRow>
                                                                ))}
                                                        </TableBody>
                                                </Table>
                                        </CardContent>
                                </Card>
                        </section>
                </div>
        );
}

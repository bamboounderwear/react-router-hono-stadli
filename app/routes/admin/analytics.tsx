import type { Route } from "./+types/analytics";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { callApi } from "../../utils/api.server";

type AnalyticsOverview = {
        totals: Array<{ id: string; label: string; value: number; delta: number }>;
        timeSeries: Array<{ period: string; visitors: number; conversions: number; revenue: number }>;
        channels: Array<{ channel: string; share: number; delta: number }>;
        funnels: Array<{ stage: string; completion: number; delta: number }>;
        segments: Array<{ segment: string; share: number; change: number }>;
};

type LoaderData = {
        overview: AnalyticsOverview;
};

export async function loader({ request }: Route.LoaderArgs) {
        const response = await callApi(request, "/api/analytics/overview");

        if (!response.ok) {
                throw new Response("Failed to load analytics overview", { status: response.status });
        }

        const overview = (await response.json()) as AnalyticsOverview;

        const data: LoaderData = { overview };

        return data;
}

export default function AdminAnalytics({ loaderData }: Route.ComponentProps) {
        const { overview } = loaderData as LoaderData;

        return (
                <div className="space-y-10">
                        <header className="space-y-2">
                                <h2 className="text-2xl font-semibold text-white">Analytics Intelligence</h2>
                                <p className="text-sm text-slate-300">
                                        Unified telemetry spanning web, matchday app, and loyalty systems. Stitch together trends without leaving the
                                        admin.
                                </p>
                        </header>

                        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {overview.totals.map((metric) => (
                                        <Card key={metric.id} className="bg-slate-900/80">
                                                <CardHeader>
                                                        <CardDescription>{metric.label}</CardDescription>
                                                        <CardTitle className="text-2xl font-semibold text-white">
                                                                {new Intl.NumberFormat().format(metric.value)}
                                                        </CardTitle>
                                                        <p
                                                                className={
                                                                        metric.delta >= 0
                                                                                ? "text-xs font-medium text-emerald-300"
                                                                                : "text-xs font-medium text-rose-300"
                                                                }
                                                        >
                                                                {metric.delta >= 0 ? "+" : ""}
                                                                {metric.delta}% week over week
                                                        </p>
                                                </CardHeader>
                                        </Card>
                                ))}
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                                <Card>
                                        <CardHeader>
                                                <CardTitle>Engagement timeline</CardTitle>
                                                <CardDescription>Cross-channel interactions and monetisation</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                                <div className="grid grid-cols-7 gap-3 text-sm text-slate-200">
                                                        {overview.timeSeries.map((point) => (
                                                                <div key={point.period} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                                                                        <p className="text-xs uppercase tracking-wide text-slate-400">{point.period}</p>
                                                                        <p className="mt-2 text-lg font-semibold text-white">
                                                                                {new Intl.NumberFormat().format(point.visitors)}
                                                                        </p>
                                                                        <p className="text-xs text-slate-400">
                                                                                {point.conversions} conversions • CHF {new Intl.NumberFormat().format(point.revenue)}
                                                                        </p>
                                                                </div>
                                                        ))}
                                                </div>
                                                <Button className="mt-6" variant="outline" size="sm">
                                                        Export CSV
                                                </Button>
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardHeader>
                                                <CardTitle>Acquisition mix</CardTitle>
                                                <CardDescription>Share of sessions by primary touchpoint</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                                <Table>
                                                        <TableHeader>
                                                                <TableRow>
                                                                        <TableHead>Channel</TableHead>
                                                                        <TableHead>Share</TableHead>
                                                                        <TableHead>Δ 7d</TableHead>
                                                                </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                                {overview.channels.map((channel) => (
                                                                        <TableRow key={channel.channel}>
                                                                                <TableCell className="font-medium text-white">{channel.channel}</TableCell>
                                                                                <TableCell>{channel.share}%</TableCell>
                                                                                <TableCell>
                                                                                        <Badge variant={channel.delta >= 0 ? "success" : "warning"}>
                                                                                                {channel.delta >= 0 ? "+" : ""}
                                                                                                {channel.delta}%
                                                                                        </Badge>
                                                                                </TableCell>
                                                                        </TableRow>
                                                                ))}
                                                        </TableBody>
                                                </Table>
                                        </CardContent>
                                </Card>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                                <Card>
                                        <CardHeader>
                                                <CardTitle>Conversion funnel</CardTitle>
                                                <CardDescription>Tracking the supporter journey across personalised touchpoints</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                                {overview.funnels.map((stage) => (
                                                        <div key={stage.stage} className="space-y-2">
                                                                <div className="flex items-center justify-between text-sm text-white">
                                                                        <span>{stage.stage}</span>
                                                                        <Badge variant={stage.delta >= 0 ? "success" : "warning"}>
                                                                                {stage.delta >= 0 ? "+" : ""}
                                                                                {stage.delta}%
                                                                        </Badge>
                                                                </div>
                                                                <div className="h-2 rounded-full bg-slate-800">
                                                                        <div
                                                                                className="h-full rounded-full bg-blue-500"
                                                                                style={{ width: `${stage.completion}%` }}
                                                                        />
                                                                </div>
                                                                <p className="text-xs text-slate-400">{stage.completion}% completion this week</p>
                                                        </div>
                                                ))}
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardHeader>
                                                <CardTitle>Audience segments</CardTitle>
                                                <CardDescription>Where matchday conversion is accelerating</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                                <Table>
                                                        <TableHeader>
                                                                <TableRow>
                                                                        <TableHead>Segment</TableHead>
                                                                        <TableHead>Share</TableHead>
                                                                        <TableHead>Δ 7d</TableHead>
                                                                </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                                {overview.segments.map((segment) => (
                                                                        <TableRow key={segment.segment}>
                                                                                <TableCell className="font-medium text-white">{segment.segment}</TableCell>
                                                                                <TableCell>{segment.share}%</TableCell>
                                                                                <TableCell>
                                                                                        <Badge variant={segment.change >= 0 ? "success" : "warning"}>
                                                                                                {segment.change >= 0 ? "+" : ""}
                                                                                                {segment.change}%
                                                                                        </Badge>
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

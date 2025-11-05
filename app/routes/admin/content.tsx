import { Form, useActionData, useNavigation } from "react-router";

import type { Route } from "./+types/content";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { callApi } from "../../utils/api.server";

type ContentEntry = {
        id: string;
        title: string;
        status: string;
        summary: string;
        owner: string;
        updatedAt: string;
        audience: string;
};

type ActionData =
        | { success: true; entry: ContentEntry }
        | { error: string };

export async function loader({ request }: Route.LoaderArgs) {
        const response = await callApi(request, "/api/content/entries");

        if (!response.ok) {
                throw new Response("Failed to load content entries", { status: response.status });
        }

        const { entries } = (await response.json()) as { entries: ContentEntry[] };

        const data: { entries: ContentEntry[] } = { entries };

        return data;
}

export async function action({ request }: Route.ActionArgs) {
        const formData = await request.formData();
        const id = formData.get("id");

        if (typeof id !== "string" || !id) {
                return { error: "Missing entry identifier" } as ActionData;
        }

        const payload = {
                title: formData.get("title") as string,
                summary: formData.get("summary") as string,
                status: formData.get("status") as string,
        };

        const apiResponse = await callApi(request, `/api/content/entries/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
        });

        if (!apiResponse.ok) {
                const errorPayload = await apiResponse.json().catch(() => ({ error: "Unable to update entry" }));
                const message = typeof (errorPayload as { error?: unknown }).error === "string"
                        ? (errorPayload as { error: string }).error
                        : "Unable to update entry";
                return { error: message } as ActionData;
        }

        const result = (await apiResponse.json()) as { entry: ContentEntry };

        return { success: true, entry: result.entry } as ActionData;
}

export default function AdminContent({ loaderData }: Route.ComponentProps) {
        const { entries } = loaderData as { entries: ContentEntry[] };
        const actionData = useActionData<ActionData>();
        const navigation = useNavigation();
        const isSubmitting = navigation.state === "submitting";

        const showSuccess = Boolean(actionData && "success" in actionData);
        const errorMessage = actionData && "error" in actionData ? actionData.error : undefined;

        return (
                <div className="space-y-8">
                        <header className="space-y-2">
                                <h2 className="text-2xl font-semibold text-white">Content Studio</h2>
                                <p className="text-sm text-slate-300">
                                        Manage editorial assets, adjust publishing states, and ensure the matchday experience stays fresh.
                                </p>
                        </header>

                        {showSuccess && (
                                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                                        Entry updated successfully and queued for deploy.
                                </div>
                        )}
                        {errorMessage && (
                                <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                                        {errorMessage}
                                </div>
                        )}

                        <div className="space-y-6">
                                {entries.map((entry) => (
                                        <Card key={entry.id}>
                                                <CardHeader>
                                                        <CardTitle className="flex items-center justify-between text-white">
                                                                <span>{entry.title}</span>
                                                                <Badge variant={entry.status === "Published" ? "success" : "warning"}>{entry.status}</Badge>
                                                        </CardTitle>
                                                        <CardDescription>
                                                                Owned by {entry.owner} • Last updated {new Date(entry.updatedAt).toLocaleString()} • Targeting {entry.audience}
                                                        </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                        <Form method="post" className="space-y-4">
                                                                <input type="hidden" name="id" value={entry.id} />
                                                                <div className="grid gap-2">
                                                                        <Label htmlFor={`title-${entry.id}`}>Headline</Label>
                                                                        <Input id={`title-${entry.id}`} name="title" defaultValue={entry.title} required />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                        <Label htmlFor={`summary-${entry.id}`}>Summary</Label>
                                                                        <Textarea
                                                                                id={`summary-${entry.id}`}
                                                                                name="summary"
                                                                                defaultValue={entry.summary}
                                                                                required
                                                                        />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                        <Label htmlFor={`status-${entry.id}`}>Status</Label>
                                                                        <select
                                                                                id={`status-${entry.id}`}
                                                                                name="status"
                                                                                defaultValue={entry.status}
                                                                                className="h-10 rounded-md border border-slate-700 bg-slate-900/60 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                                                                        >
                                                                                <option value="Published">Published</option>
                                                                                <option value="Scheduled">Scheduled</option>
                                                                                <option value="Draft">Draft</option>
                                                                        </select>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                        <p className="text-xs text-slate-400">
                                                                                Publishing changes propagate to edge caches within 90 seconds.
                                                                        </p>
                                                                        <Button type="submit" disabled={isSubmitting}>
                                                                                {isSubmitting ? "Saving..." : "Save changes"}
                                                                        </Button>
                                                                </div>
                                                        </Form>
                                                </CardContent>
                                        </Card>
                                ))}
                        </div>
                </div>
        );
}

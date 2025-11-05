import type { Route } from "./+types/crm";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { callApi } from "../../utils/api.server";

type Contact = {
        id: string;
        name: string;
        company: string;
        email: string;
        stage: string;
        lastActivityAt: string;
        owner: string;
        value: number;
};

type PipelineStage = { stage: string; count: number; value: number; delta: number };

export async function loader({ request }: Route.LoaderArgs) {
        const [contactsResponse, pipelineResponse] = await Promise.all([
                callApi(request, "/api/crm/contacts"),
                callApi(request, "/api/crm/pipeline"),
        ]);

        if (!contactsResponse.ok) {
                throw new Response("Failed to load CRM contacts", { status: contactsResponse.status });
        }
        if (!pipelineResponse.ok) {
                throw new Response("Failed to load CRM pipeline", { status: pipelineResponse.status });
        }

        const contacts = (await contactsResponse.json()) as { contacts: Contact[] };
        const pipeline = (await pipelineResponse.json()) as { pipeline: PipelineStage[] };

        const data: { contacts: Contact[]; pipeline: PipelineStage[] } = {
                contacts: contacts.contacts,
                pipeline: pipeline.pipeline,
        };

        return data;
}

export default function AdminCrm({ loaderData }: Route.ComponentProps) {
        const { contacts, pipeline } = loaderData as { contacts: Contact[]; pipeline: PipelineStage[] };

        return (
                <div className="space-y-10">
                        <header className="space-y-2">
                                <h2 className="text-2xl font-semibold text-white">Supporter CRM</h2>
                                <p className="text-sm text-slate-300">
                                        Keep commercial outreach organised. Review priority conversations, conversion velocity, and projected revenue.
                                </p>
                        </header>

                        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {pipeline.map((stage) => (
                                        <Card key={stage.stage} className="bg-slate-900/80">
                                                <CardHeader>
                                                        <CardDescription>{stage.stage}</CardDescription>
                                                        <CardTitle className="text-2xl font-semibold text-white">
                                                                {stage.count} deals
                                                        </CardTitle>
                                                        <p className="text-sm text-slate-300">CHF {new Intl.NumberFormat().format(stage.value)}</p>
                                                        <p className={stage.delta >= 0 ? "text-xs text-emerald-300" : "text-xs text-rose-300"}>
                                                                {stage.delta >= 0 ? "+" : ""}
                                                                {stage.delta}% velocity
                                                        </p>
                                                </CardHeader>
                                        </Card>
                                ))}
                        </section>

                        <Card>
                                <CardHeader>
                                        <CardTitle>Relationship board</CardTitle>
                                        <CardDescription>Flagged contacts requiring personalised follow-up</CardDescription>
                                </CardHeader>
                                <CardContent>
                                        <Table>
                                                <TableHeader>
                                                        <TableRow>
                                                                <TableHead>Contact</TableHead>
                                                                <TableHead>Company</TableHead>
                                                                <TableHead>Owner</TableHead>
                                                                <TableHead>Stage</TableHead>
                                                                <TableHead>Last activity</TableHead>
                                                                <TableHead className="text-right">Value</TableHead>
                                                        </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                        {contacts.map((contact) => (
                                                                <TableRow key={contact.id}>
                                                                        <TableCell className="font-medium text-white">
                                                                                <div className="flex flex-col">
                                                                                        <span>{contact.name}</span>
                                                                                        <span className="text-xs text-slate-400">{contact.email}</span>
                                                                                </div>
                                                                        </TableCell>
                                                                        <TableCell>{contact.company}</TableCell>
                                                                        <TableCell>{contact.owner}</TableCell>
                                                                        <TableCell>
                                                                                <Badge variant="outline">{contact.stage}</Badge>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                                {new Date(contact.lastActivityAt).toLocaleDateString(undefined, {
                                                                                        month: "short",
                                                                                        day: "numeric",
                                                                                })}
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                                CHF {new Intl.NumberFormat().format(contact.value)}
                                                                        </TableCell>
                                                                </TableRow>
                                                        ))}
                                                </TableBody>
                                        </Table>
                                        <Button className="mt-6" variant="outline" size="sm">
                                                Sync with CRM export
                                        </Button>
                                </CardContent>
                        </Card>
                </div>
        );
}
